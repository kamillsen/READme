# .NET Policy / Handler Notları

> Konu: ASP.NET Core Authorization Policy / Requirement / Handler  
> Seviye: Junior–Mid  
> Amaç: Sadece “nasıl kullanılır?” değil; sistemde neden var, nasıl çalışır, request akışında ne olur ve gerçek projede nasıl düşünülür?

---

## 1. Büyük Resim

ASP.NET Core'da **Policy / Handler** yapısı, authorization yani **yetkilendirme** problemini merkezi ve kontrollü çözmek için kullanılır.

Authentication ve authorization farkı:

```text
Authentication = Sen kimsin?
Authorization  = Bu işlemi yapmaya yetkin var mı?
```

Örneğin:

```csharp
[Authorize]
```

şunu söyler:

```text
Bu endpoint korumalıdır. Kullanıcı login olmadan giremez.
```

Ama gerçek projelerde çoğu zaman bu yetmez.

Mesela:

```text
Bu kullanıcı ürün silebilir mi?
Bu kullanıcı siparişi onaylayabilir mi?
Bu kullanıcı sadece kendi tenant'ındaki datayı mı görebilir?
Bu kullanıcı Finance departmanında mı?
Bu kullanıcıda Product.Delete permission'ı var mı?
```

Bu durumda `Policy / Requirement / Handler` yapısı devreye girer.

---

## 2. Bu Kavramlar Ne İşe Yarar?

Kısa tablo:

| Kavram | Görevi |
|---|---|
| `[Authorize]` | Endpoint'e “bu işlem korumalı” bilgisini verir. |
| `Policy` | Hangi yetki kuralının gerekli olduğunu tanımlar. |
| `Requirement` | Policy içindeki kontrol edilmesi gereken şarttır. |
| `Handler` | Requirement'ın geçilip geçilmediğini kontrol eden koddur. |
| `AuthorizationHandlerContext` | Handler'a kullanıcıyı, requirement'ları ve varsa resource bilgisini taşır. |
| `DI Container` | Handler'ları sisteme tanıtır. |

En kısa zincir:

```text
Endpoint -> Policy adı -> Requirement -> Handler -> context.Succeed(requirement)
```

---

## 3. Mental Model

Bunu bir kapı güvenliği gibi düşün.

```text
Endpoint = Kapı
[Authorize] = Kapıda güvenlik var
Policy = Kapıdan geçmek için gereken kural
Requirement = Kontrol edilecek şart
Handler = Kontrolü yapan güvenlik görevlisi
AuthorizationHandlerContext = Görevlinin elindeki dosya
DI Container = Görevli listesi
```

Örnek:

```csharp
[Authorize(Policy = "CanDeleteProduct")]
```

Bu şunu söyler:

```text
Bu endpoint'e girmek için CanDeleteProduct policy'si geçilmeli.
```

Endpoint şunu bilmez:

```text
Hangi handler çalışacak?
Nasıl kontrol edecek?
Database'e mi bakacak?
Claim'e mi bakacak?
Role'e mi bakacak?
```

Endpoint sadece policy adını söyler. Gerisini authorization sistemi çözer.

---

## 4. Basit Proje Yapısı

Kafanda şöyle bir klasör yapısı canlandır:

```text
/Controllers
  ProductsController.cs

/Auth
  PermissionRequirement.cs
  PermissionHandler.cs

/Services
  PermissionService.cs

Program.cs
```

Senaryo:

```text
/products/{id} DELETE endpoint'i sadece Product.Delete izni olan kullanıcıya açık olsun.
```

---

## 5. Endpoint: Policy Adını Söyler

```csharp
[ApiController]
[Route("products")]
public class ProductsController : ControllerBase
{
    [HttpDelete("{id}")]
    [Authorize(Policy = "CanDeleteProduct")]
    public IActionResult DeleteProduct(int id)
    {
        return Ok("Ürün silindi");
    }
}
```

Burada endpoint şunu der:

```text
Ben çalışmadan önce CanDeleteProduct policy'si kontrol edilsin.
```

Endpoint handler'ı bilmez. Sadece policy adını bilir.

---

## 6. Policy: Hangi Requirement Lazım?

`Program.cs`:

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanDeleteProduct", policy =>
    {
        policy.Requirements.Add(
            new PermissionRequirement("Product.Delete")
        );
    });
});
```

Bu kod framework'e kabaca şunu kaydeder:

```text
Policy adı: CanDeleteProduct
Requirement: PermissionRequirement
Parametre: Product.Delete
```

Yani:

```text
CanDeleteProduct policy'si geçilecekse,
Product.Delete permission'ı kontrol edilmeli.
```

---

## 7. Parametreli Requirement

```csharp
using Microsoft.AspNetCore.Authorization;

public class PermissionRequirement : IAuthorizationRequirement
{
    public string PermissionName { get; }

    public PermissionRequirement(string permissionName)
    {
        PermissionName = permissionName;
    }
}
```

Bu requirement şunu taşır:

```text
PermissionName = Product.Delete
```

Requirement burada kontrolü yapmaz. Sadece “hangi şart kontrol edilecek?” bilgisini taşır.

Bu yüzden requirement şöyle düşünülebilir:

```text
Kontrol fişi: Kullanıcıda Product.Delete izni var mı?
```

---

## 8. Handler: Requirement'ı Değerlendirir

```csharp
using Microsoft.AspNetCore.Authorization;

public class PermissionHandler
    : AuthorizationHandler<PermissionRequirement>
{
    private readonly PermissionService _permissionService;

    public PermissionHandler(PermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userId = context.User.FindFirst("UserId")?.Value;

        if (userId is null)
        {
            return;
        }

        var hasPermission = await _permissionService.HasPermissionAsync(
            userId,
            requirement.PermissionName
        );

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}
```

Bu handler'ın yaptığı şey:

```text
1. Kullanıcı id'sini context.User içinden alır.
2. Gerekli permission'ı requirement.PermissionName içinden alır.
3. PermissionService'e sorar:
   “Bu kullanıcıda bu permission var mı?”
4. Varsa context.Succeed(requirement) çağırır.
5. Yoksa hiçbir şey yapmaz.
```

Bu handler sana direkt `true` veya `false` dönmez.

Handler'ın görevi şudur:

```text
Authorization sonucunu context üzerine işlemek.
```

---

## 9. PermissionService Ne Yapar?

`PermissionService`, kullanıcının hangi izinlere sahip olduğunu bilen servistir.

Basit örnek:

```csharp
public class PermissionService
{
    public Task<bool> HasPermissionAsync(string userId, string permissionName)
    {
        var userPermissions = new Dictionary<string, List<string>>
        {
            ["42"] = new List<string>
            {
                "Product.View",
                "Product.Delete"
            },
            ["77"] = new List<string>
            {
                "Product.View"
            }
        };

        var hasPermission =
            userPermissions.ContainsKey(userId)
            && userPermissions[userId].Contains(permissionName);

        return Task.FromResult(hasPermission);
    }
}
```

Örnek:

```text
userId = 42
permissionName = Product.Delete
sonuç = true
```

Ama:

```text
userId = 77
permissionName = Product.Delete
sonuç = false
```

Gerçek projede `PermissionService` genelde şuralara bakar:

```text
Database
Redis cache
JWT claim'leri
Role-permission tabloları
External authorization service
Identity provider
```

---

## 10. DI Container: Handler ve Servisleri Sisteme Tanıtma

`Program.cs`:

```csharp
builder.Services.AddScoped<PermissionService>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionHandler>();
```

Burada iki şey yapıyoruz:

```text
PermissionService sisteme tanıtılıyor.
PermissionHandler authorization handler listesine ekleniyor.
```

Framework authorization sırasında DI container'dan şunu ister:

```csharp
IEnumerable<IAuthorizationHandler> handlers
```

Yani kabaca:

```text
Bana authorization handler'larını ver.
```

DI container da `PermissionHandler`'ı verir.

---

## 11. Handler Hangi Requirement İçin Çalışacağını Nereden Biliyor?

Şuradan:

```csharp
public class PermissionHandler
    : AuthorizationHandler<PermissionRequirement>
```

Bu satır şunu söyler:

```text
Ben PermissionRequirement tipindeki requirement'ları kontrol ederim.
```

Framework bağlantıyı isimle değil, tip üzerinden kurar.

Zincir şöyle:

```text
[Authorize(Policy = "CanDeleteProduct")]
        ↓
CanDeleteProduct policy'si bulunur
        ↓
Policy içinden PermissionRequirement çıkar
        ↓
DI container'dan handler'lar alınır
        ↓
AuthorizationHandler<PermissionRequirement> olan handler çalışır
```

Endpoint handler'ı bilmez.

Policy handler'ı bilmez.

Framework aradaki eşleştirmeyi requirement tipi üzerinden yapar.

---

## 12. Arka Plandaki Akışı Basit Kodla Düşün

Gerçek ASP.NET Core kodu daha karmaşıktır; ama mantığı şöyle düşünebilirsin:

```csharp
// 1. Endpoint'ten policy adı okunur
var policyName = "CanDeleteProduct";

// 2. Policy bulunur
var policy = policies[policyName];

// 3. Policy içindeki requirement'lar alınır
var requirements = policy.Requirements;

// 4. Request'i yapan kullanıcı alınır
var user = httpContext.User;

// 5. Context oluşturulur
var context = new AuthorizationHandlerContext(
    requirements,
    user,
    resource: httpContext
);

// 6. DI container'dan handler'lar alınır
var handlers = serviceProvider.GetServices<IAuthorizationHandler>();

// 7. Handler'lar çalıştırılır
foreach (var handler in handlers)
{
    await handler.HandleAsync(context);
}

// 8. Sonuç değerlendirilir
if (context.HasSucceeded)
{
    // Endpoint çalışabilir
}
else
{
    // 401 veya 403 döner
}
```

Önemli nokta:

```text
Handler endpoint'e response dönmez.
Handler sadece context durumunu değiştirir.
Final kararı framework verir.
```

---

## 13. AuthorizationHandlerContext İçinde Ne Var?

Handler metodunda şu parametre gelir:

```csharp
AuthorizationHandlerContext context
```

Bu context bir authorization çantası gibi düşünülebilir.

İçinde önemli olarak şunlar vardır:

```text
context.User
context.Requirements
context.Resource
context.PendingRequirements
context.HasSucceeded
```

### 13.1. context.User

Bu request'i yapan kullanıcıdır.

Basit örnek:

```csharp
var claims = new List<Claim>
{
    new Claim("UserId", "42"),
    new Claim("Department", "Finance"),
    new Claim(ClaimTypes.Role, "Manager")
};

var identity = new ClaimsIdentity(claims, "FakeAuth");
var user = new ClaimsPrincipal(identity);
```

Framework request sırasında bunu genelde şuraya koyar:

```csharp
httpContext.User = user;
```

Handler içinde şöyle okunur:

```csharp
var userId = context.User.FindFirst("UserId")?.Value;
var department = context.User.FindFirst("Department")?.Value;
var isManager = context.User.IsInRole("Manager");
```

### 13.2. context.Requirements

Policy içindeki tüm requirement'ların listesidir.

Örnek policy:

```csharp
options.AddPolicy("CanDeleteProduct", policy =>
{
    policy.Requirements.Add(new PermissionRequirement("Product.Delete"));
});
```

Context içinde kabaca şudur:

```text
context.Requirements:
- PermissionRequirement("Product.Delete")
```

Bir policy'de birden fazla requirement olabilir:

```csharp
options.AddPolicy("CanDeleteProduct", policy =>
{
    policy.Requirements.Add(new PermissionRequirement("Product.Delete"));
    policy.Requirements.Add(new DepartmentRequirement("Finance"));
});
```

Bu durumda:

```text
context.Requirements:
- PermissionRequirement("Product.Delete")
- DepartmentRequirement("Finance")
```

Policy'nin başarılı olması için varsayılan olarak hepsi geçmelidir.

### 13.3. Handler Metodundaki `requirement` Parametresi

Handler metodunda şu var:

```csharp
protected override async Task HandleRequirementAsync(
    AuthorizationHandlerContext context,
    PermissionRequirement requirement)
```

Buradaki `requirement`, `context.Requirements` içinden bu handler'a uygun olan requirement'ın seçilmiş halidir.

Yani:

```text
context.Requirements = bütün şartlar
requirement = bu handler'ın şu anda kontrol ettiği tek şart
```

Bu yüzden şunu yazmana gerek kalmaz:

```csharp
foreach (var req in context.Requirements)
{
    if (req is PermissionRequirement permissionRequirement)
    {
        // kontrol et
    }
}
```

Base class bunu senin yerine yapar.

### 13.4. context.Resource

`Resource`, kontrol edilen nesnedir.

Normal endpoint authorization'da bu çoğu zaman `HttpContext` olabilir.

```csharp
if (context.Resource is HttpContext httpContext)
{
    var path = httpContext.Request.Path;
}
```

Ama resource'u sen kendin de verebilirsin.

Örnek: Sipariş sahibi mi kontrolü.

```csharp
var order = await _orderRepository.GetByIdAsync(id);

var result = await _authorizationService.AuthorizeAsync(
    User,
    order,
    "CanViewOrder"
);
```

Burada `order`, handler'a resource olarak gider.

Handler:

```csharp
public class OrderOwnerHandler
    : AuthorizationHandler<OrderOwnerRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrderOwnerRequirement requirement)
    {
        var order = context.Resource as Order;
        var userId = context.User.FindFirst("UserId")?.Value;

        if (order != null && order.OwnerUserId == userId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
```

Burada:

```text
context.User = işlemi yapan kullanıcı
context.Resource = kontrol edilen sipariş
requirement = OrderOwnerRequirement
```

---

## 14. context.Succeed(requirement) Ne Yapar?

Bu satır:

```csharp
context.Succeed(requirement);
```

şunu demektir:

```text
Bu requirement başarıyla geçti.
Pending requirement listesinden çıkar.
```

Basitleştirilmiş iç mantık:

```csharp
public void Succeed(IAuthorizationRequirement requirement)
{
    _succeedCalled = true;
    _pendingRequirements.Remove(requirement);
}
```

Başlangıçta:

```text
PendingRequirements:
- PermissionRequirement("Product.Delete")
```

Handler içinde:

```csharp
context.Succeed(requirement);
```

Sonra:

```text
PendingRequirements:
boş
```

Eğer policy'de iki requirement varsa:

```text
PendingRequirements:
- PermissionRequirement("Product.Delete")
- DepartmentRequirement("Finance")
```

Permission handler başarılı olursa:

```text
PendingRequirements:
- DepartmentRequirement("Finance")
```

Yani policy hâlâ tamamen başarılı değildir. Diğer requirement da geçmelidir.

Final başarı mantığını şöyle düşünebilirsin:

```csharp
bool HasSucceeded =
    failCalled == false
    && succeedCalled == true
    && pendingRequirements.Any() == false;
```

Yani:

```text
Fail çağrılmamış olmalı.
En az bir requirement succeed olmalı.
Bekleyen requirement kalmamalı.
```

---

## 15. return Task.CompletedTask Ne Demek?

Handler metodu şudur:

```csharp
protected override Task HandleRequirementAsync(...)
```

Yani method `Task` dönmek zorunda.

Çünkü handler bazen async iş yapabilir:

```csharp
var hasPermission = await _permissionService.HasPermissionAsync(...);
```

Ama bazı handler'larda async iş yoktur:

```csharp
var department = context.User.FindFirst("Department")?.Value;

if (department == "Finance")
{
    context.Succeed(requirement);
}

return Task.CompletedTask;
```

`Task.CompletedTask` şu anlama gelir:

```text
Benim bekletecek async işim yok.
İşim bitti.
Framework bunu tamamlanmış Task olarak kabul edebilir.
```

Basit mental model:

```csharp
return Task.CompletedTask;
```

şudur:

```text
await edilecek bir şey yok, bitti.
```

---

## 16. Singleton mı Scoped mı?

Şu kayıt sık görülür:

```csharp
builder.Services.AddSingleton<IAuthorizationHandler, SomeHandler>();
```

Bu şu demektir:

```text
Uygulama boyunca bu handler'dan tek instance oluştur.
Her request'te yeniden oluşturma.
```

Bu ne zaman mantıklı?

Handler stateless ise.

Örnek:

```csharp
public class DepartmentHandler
    : AuthorizationHandler<DepartmentRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        DepartmentRequirement requirement)
    {
        var department = context.User.FindFirst("Department")?.Value;

        if (department == requirement.RequiredDepartment)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
```

Bu handler içinde request'e özel field yoktur.

Kötü örnek:

```csharp
private string _currentUserId;
```

Böyle state tutarsan singleton tehlikeli olur.

### DbContext Kullanıyorsan Singleton Yapma

Şöyle bir handler varsa:

```csharp
public class PermissionHandler
    : AuthorizationHandler<PermissionRequirement>
{
    private readonly AppDbContext _db;

    public PermissionHandler(AppDbContext db)
    {
        _db = db;
    }
}
```

Bunu singleton yapma.

Daha doğru:

```csharp
builder.Services.AddScoped<IAuthorizationHandler, PermissionHandler>();
```

Çünkü `DbContext` genelde scoped'tur. Scoped servis kullanan handler da scoped olmalıdır.

Pratik kural:

```text
Handler sadece claim/role okuyorsa: Singleton olabilir.
Handler DbContext veya request bazlı servis kullanıyorsa: Scoped kullan.
```

---

## 17. Neden Bu Yapıya İhtiyaç Var?

Policy/Handler yoksa controller içinde şöyle kodlar çoğalır:

```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteProduct(int id)
{
    var userId = User.FindFirst("UserId")?.Value;

    var hasPermission = await _permissionService.HasPermissionAsync(
        userId,
        "Product.Delete"
    );

    if (!hasPermission)
    {
        return Forbid();
    }

    return Ok("Ürün silindi");
}
```

Bu birkaç endpoint'te sorun olmaz.

Ama 20 endpoint olunca authorization logic controller'lara dağılır.

Daha iyi kullanım:

```csharp
[Authorize(Policy = "CanDeleteProduct")]
[HttpDelete("{id}")]
public IActionResult DeleteProduct(int id)
{
    return Ok("Ürün silindi");
}
```

Artık controller sadeleşir.

Authorization kuralı handler içinde merkezi hale gelir.

---

## 18. Mühendislik Açısından Değerlendirme

### Separation of Concerns

Controller'ın işi request almak ve response dönmektir. Yetki kontrolünün detayını handler'a taşımak sorumlulukları ayırır.

### Loose Coupling

Endpoint sadece policy adını bilir. Handler'ın nasıl kontrol yaptığını bilmez.

### High Cohesion

Yetki kontrolü tek yerde toplanır. Permission logic controller'lara dağılmaz.

### Testability

Handler tek başına test edilebilir:

```text
UserId 42 + Product.Delete -> geçmeli
UserId 77 + Product.Delete -> geçmemeli
```

### Maintainability

Permission kontrolü değişirse 20 controller gezmek yerine tek handler veya servis güncellenir.

### Consistency

Aynı policy farklı endpoint'lerde aynı şekilde çalışır.

### Observability

Merkezi handler içinde loglama/audit eklemek daha kolaydır.

---

## 19. Avantajları

```text
Authorization logic merkezi olur.
Controller sadeleşir.
Tekrarlanan if kontrolleri azalır.
Aynı handler birçok policy için kullanılabilir.
Test yazmak kolaylaşır.
Permission sistemi büyüyebilir hale gelir.
Resource bazlı kontroller yapılabilir.
DI ile servis, repository, cache kullanılabilir.
```

---

## 20. Dezavantajları / Maliyeti

```text
Başta soyut gelir.
Policy, requirement, handler üçlüsü öğrenme maliyeti yaratır.
Basit projede fazla sınıf gibi görünebilir.
Yanlış tasarlanırsa gereksiz karmaşıklık oluşur.
Handler içinde ağır database sorguları performans sorunu çıkarabilir.
Policy isimleri kötü seçilirse sistem okunmaz hale gelir.
```

---

## 21. Ne Zaman Kullanılmalı?

Kullan:

```text
Yetki kararı sadece login veya role kontrolü değilse.
Permission bazlı sistem varsa.
Tenant kontrolü varsa.
Resource owner kontrolü varsa.
Aynı yetki kuralı birçok endpoint'te kullanılacaksa.
Controller'larda authorization if'leri çoğalıyorsa.
Test edilebilir authorization istiyorsan.
```

Kullanmayabilirsin:

```text
Sadece login kontrolü gerekiyorsa: [Authorize]
Sadece Admin rolü gerekiyorsa: [Authorize(Roles = "Admin")]
Tek endpoint'lik küçük demo/prototip yazıyorsan.
Kural tekrar kullanılmayacak kadar basitse.
```

---

## 22. Küçük Proje vs Büyük Proje

### Küçük Proje

Başlangıçta yeterli olabilir:

```csharp
[Authorize]
```

veya:

```csharp
[Authorize(Roles = "Admin")]
```

Kural büyüyünce policy'ye geçersin.

### Büyük Proje

Policy isimleri iş niyetini anlatmalı:

```text
CanViewProduct
CanDeleteProduct
CanApproveOrder
CanExportInvoice
CanManageUsers
```

Kötü isimler:

```text
AdminPolicy
UserPolicy
Policy1
CheckRolePolicy
```

İyi policy adı şu soruya cevap verir:

```text
Kullanıcı hangi işi yapmaya çalışıyor?
```

---

## 23. Junior'ın Genelde Kaçırdığı Nokta

Junior genelde şunu düşünür:

```text
Bu endpoint'e kim girebilir?
```

Senior daha çok şunu düşünür:

```text
Bu kullanıcı, bu resource üzerinde, bu aksiyonu, bu bağlamda yapabilir mi?
```

Örnek:

```text
Kullanıcı Manager olabilir.
Ama kendi tenant'ındaki siparişi mi onaylıyor?
Sipariş zaten iptal edilmiş mi?
Kullanıcı bu departmana ait mi?
Bu işlem audit edilmeli mi?
```

Policy/Handler yapısı bu düşünceyi koda daha temiz yansıtır.

---

## 24. Yaygın Yanlış Anlaşılmalar

### Yanlış: Policy sadece role kontrolüdür.

Hayır. Role kontrolü en basit authorization türlerinden biridir. Policy claim, permission, tenant, resource ve business rule kontrol edebilir.

### Yanlış: Handler response döner.

Hayır. Handler endpoint çalışsın/çalışmasın diye context durumunu değiştirir.

### Yanlış: `context.Succeed(requirement)` request'i devam ettirir.

Hayır. Sadece o requirement'ı başarılı işaretler. Final kararı framework verir.

### Yanlış: Her şeye custom handler yazılmalı.

Hayır. Basit login kontrolü için `[Authorize]`, basit rol kontrolü için `[Authorize(Roles = "Admin")]` yeterlidir.

### Yanlış: Handler içinde her zaman database'e gidilir.

Hayır. Gereksiz database sorgusu performansı bozar. Basit claim/role kontrolü yeterliyse database'e gitme.

---

## 25. En Önemli Kod Zinciri

### Endpoint

```csharp
[Authorize(Policy = "CanDeleteProduct")]
```

```text
Bu endpoint için CanDeleteProduct policy'si gerekli.
```

### Policy

```csharp
options.AddPolicy("CanDeleteProduct", policy =>
{
    policy.Requirements.Add(new PermissionRequirement("Product.Delete"));
});
```

```text
CanDeleteProduct için Product.Delete permission'ı gerekli.
```

### Requirement

```csharp
public class PermissionRequirement : IAuthorizationRequirement
{
    public string PermissionName { get; }

    public PermissionRequirement(string permissionName)
    {
        PermissionName = permissionName;
    }
}
```

```text
Kontrol edilecek permission adını taşır.
```

### Handler

```csharp
public class PermissionHandler
    : AuthorizationHandler<PermissionRequirement>
{
    private readonly PermissionService _permissionService;

    public PermissionHandler(PermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userId = context.User.FindFirst("UserId")?.Value;

        if (userId is null)
        {
            return;
        }

        var hasPermission = await _permissionService.HasPermissionAsync(
            userId,
            requirement.PermissionName
        );

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}
```

```text
Kullanıcıda gerekli permission varsa requirement'ı succeed eder.
```

### DI

```csharp
builder.Services.AddScoped<PermissionService>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionHandler>();
```

```text
Handler ve servis authorization sistemi tarafından kullanılabilir hale gelir.
```

---

## 26. Tek Cümlelik Özet

```text
Policy, endpoint'in istediği yetki kuralıdır;
Requirement, bu kuralın kontrol edilecek şartıdır;
Handler, bu şartın kullanıcı/resource üzerinde sağlanıp sağlanmadığını kontrol eder;
context.Succeed(requirement), o şartı geçti olarak işaretler;
framework de tüm requirement'lar geçerse request'i endpoint'e bırakır.
```

---

## 27. Kaynaklar

- Microsoft Learn — Policy-based authorization in ASP.NET Core  
  https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies

- Microsoft Learn — Resource-based authorization in ASP.NET Core  
  https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based

- Microsoft Learn — Dependency injection in requirement handlers  
  https://learn.microsoft.com/en-us/aspnet/core/security/authorization/dependencyinjection

- Microsoft Learn — IAuthorizationService.AuthorizeAsync  
  https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authorization.iauthorizationservice.authorizeasync

- .NET API — Task.CompletedTask  
  https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.completedtask
