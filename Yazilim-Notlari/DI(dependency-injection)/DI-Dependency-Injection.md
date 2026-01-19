# 🔌 Dependency Injection (DI) – Kapsamlı Rehber (C# / .NET)

## Dependency Injection Nedir? – En Sade Tanım

**Dependency Injection (DI) = Bağımlılıkları dışarıdan verme**

> Bir sınıfın ihtiyaç duyduğu başka sınıfları, kendi içinde oluşturmak yerine, **dışarıdan alması**dır.

**Basit örnek:**

```csharp
// ❌ DI YOK (Kötü)
public class UserService
{
    private SqlUserRepository _repo = new SqlUserRepository();  // Kendi içinde oluşturuyor
    
    public void SaveUser(string name)
    {
        _repo.Save(name);
    }
}

// ✅ DI VAR (İyi)
public class UserService
{
    private readonly IUserRepository _repo;
    
    public UserService(IUserRepository repo)  // Dışarıdan alıyor
    {
        _repo = repo;
    }
    
    public void SaveUser(string name)
    {
        _repo.Save(name);
    }
}
```

---

## 🎯 DI Neden Ortaya Çıktı? Felsefesi Ne?

### Problem: Sıkı Bağlılık (Tight Coupling)

**Eski yaklaşım:**

```csharp
public class OrderService
{
    private SmtpEmailSender _emailSender = new SmtpEmailSender();
    private SqlOrderRepository _repository = new SqlOrderRepository();
    
    public void PlaceOrder(Order order)
    {
        _repository.Save(order);
        _emailSender.Send(order.CustomerEmail);
    }
}
```

**Sorunlar:**

1. **Test edilemez:** Gerçek SMTP ve SQL gerekir
2. **Değiştirilemez:** SQL yerine MongoDB'ye geçmek zor
3. **Esnek değil:** Farklı implementasyonlar kullanamazsın
4. **Bağımlılık yönetimi zor:** Her sınıf kendi bağımlılıklarını oluşturuyor

### Çözüm: Dependency Injection

**Yeni yaklaşım:**

```csharp
public class OrderService
{
    private readonly IEmailSender _emailSender;
    private readonly IOrderRepository _repository;
    
    // Bağımlılıkları dışarıdan alıyor
    public OrderService(IEmailSender emailSender, IOrderRepository repository)
    {
        _emailSender = emailSender;
        _repository = repository;
    }
    
    public void PlaceOrder(Order order)
    {
        _repository.Save(order);
        _emailSender.Send(order.CustomerEmail);
    }
}
```

**Faydalar:**

1. **Test edilebilir:** Fake implementasyonlar kullanabilirsin
2. **Değiştirilebilir:** Implementasyonu kolayca değiştirebilirsin
3. **Esnek:** Farklı implementasyonlar kullanabilirsin
4. **Merkezi yönetim:** Bağımlılıklar tek yerde (DI Container) yönetilir

### Felsefi Temel

**Inversion of Control (IoC) Prensibi:**

> "Kontrolü tersine çevir: Sınıf kendi bağımlılıklarını oluşturmasın, dışarıdan alsın."

**Dependency Inversion Principle (DIP):**

> "Üst seviye modüller, alt seviye modüllere değil, soyutlamalara (interface/abstract class) bağlı olmalı."

---

## 🔧 DI Nasıl Çalışır? (Çalışma Prensibi)

### 1. Manuel DI (DI Container Olmadan)

```csharp
// Interface
public interface IUserRepository
{
    void Save(string name);
}

// Implementasyon
public class SqlUserRepository : IUserRepository
{
    public void Save(string name) { }
}

// Servis
public class UserService
{
    private readonly IUserRepository _repo;
    
    public UserService(IUserRepository repo)
    {
        _repo = repo;
    }
}

// Kullanım (Manuel)
var repo = new SqlUserRepository();
var service = new UserService(repo);  // Manuel olarak veriyoruz
```

**Sorun:** Her yerde manuel olarak oluşturman gerekir, karmaşık bağımlılıklar zorlaşır.

### 2. DI Container ile (Otomatik)

```csharp
// Program.cs
services.AddScoped<IUserRepository, SqlUserRepository>();

// Controller
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    
    public UserController(UserService userService)  // DI Container otomatik enjekte eder
    {
        _userService = userService;
    }
}
```

**DI Container ne yapar?**

1. **Kayıt:** `AddScoped<IUserRepository, SqlUserRepository>()` → "IUserRepository isteyenlere SqlUserRepository ver"
2. **Çözümleme:** `UserService` constructor'ında `IUserRepository` görünce, kayıtlı `SqlUserRepository`'yi oluşturur
3. **Enjeksiyon:** Oluşturulan nesneyi `UserService`'e verir

---

## 📦 DI Container Nedir?

**DI Container = Bağımlılıkları yöneten ve otomatik enjekte eden araç**

### .NET'te DI Container

ASP.NET Core'da built-in DI Container var:

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Servisleri kaydet
builder.Services.AddScoped<IUserRepository, SqlUserRepository>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<UserService>();

var app = builder.Build();
```

### DI Container'ın Görevleri

1. **Kayıt (Registration):** Hangi interface'e hangi implementasyon verileceğini kaydet
2. **Çözümleme (Resolution):** İstenen tip için doğru implementasyonu bul
3. **Yaşam Döngüsü Yönetimi (Lifetime):** Nesnelerin ne kadar süre yaşayacağını yönet
4. **Otomatik Enjeksiyon:** Constructor'lara otomatik olarak bağımlılıkları ver

---

## 🎯 DI Türleri (Enjeksiyon Yöntemleri)

### 1. Constructor Injection (En Yaygın)

```csharp
public class UserService
{
    private readonly IUserRepository _repo;
    
    public UserService(IUserRepository repo)  // Constructor'dan alıyor
    {
        _repo = repo;
    }
}
```

**Avantajlar:**
- ✅ Zorunlu bağımlılıklar (null olamaz)
- ✅ Test edilebilir
- ✅ En yaygın yöntem

### 2. Property Injection

```csharp
public class UserService
{
    public IUserRepository Repository { get; set; }  // Property'den alıyor
}
```

**Kullanım:**
```csharp
var service = new UserService();
service.Repository = new SqlUserRepository();
```

**Avantajlar:**
- ✅ Opsiyonel bağımlılıklar için
- ❌ Null olabilir (risk)

### 3. Method Injection

```csharp
public class UserService
{
    public void SaveUser(string name, IUserRepository repo)  // Metot parametresinden
    {
        repo.Save(name);
    }
}
```

**Kullanım:**
```csharp
var service = new UserService();
service.SaveUser("Ahmet", new SqlUserRepository());
```

**Avantajlar:**
- ✅ Geçici bağımlılıklar için
- ❌ Her çağrıda vermen gerekir

**Öneri:** Constructor Injection kullan, en güvenli ve yaygın yöntem.

---

## ⏱️ Lifetime (Yaşam Döngüsü) Türleri

### 1. AddTransient (Her Seferinde Yeni)

```csharp
services.AddTransient<IUserRepository, SqlUserRepository>();
```

**Ne zaman kullanılır:**
- Her istekte yeni instance gerekirse
- Stateless servisler
- Hafif, hızlı oluşturulan nesneler

**Örnek:**
```csharp
// Her çağrıda yeni instance
var repo1 = serviceProvider.GetService<IUserRepository>();  // Yeni
var repo2 = serviceProvider.GetService<IUserRepository>();  // Yeni (farklı)
```

### 2. AddScoped (Request Başına Bir)

```csharp
services.AddScoped<IUserRepository, SqlUserRepository>();
```

**Ne zaman kullanılır:**
- Aynı HTTP request içinde aynı instance
- Entity Framework DbContext
- Request-specific state tutan servisler

**Örnek:**
```csharp
// Aynı request içinde aynı instance
// Request 1: repo1 ve repo2 aynı
// Request 2: repo3 ve repo4 aynı (ama repo1'den farklı)
```

### 3. AddSingleton (Uygulama Boyunca Tek)

```csharp
services.AddSingleton<IConfiguration, Configuration>();
```

**Ne zaman kullanılır:**
- Uygulama boyunca tek instance
- Configuration, Logger
- Cache, Service Locator

**Örnek:**
```csharp
// Tüm uygulama boyunca aynı instance
var config1 = serviceProvider.GetService<IConfiguration>();  // Instance 1
var config2 = serviceProvider.GetService<IConfiguration>();  // Aynı instance
```

### Lifetime Karşılaştırması

| Lifetime | Instance Sayısı | Ne Zaman Kullanılır |
|----------|----------------|---------------------|
| **Transient** | Her seferinde yeni | Stateless, hafif servisler |
| **Scoped** | Request başına bir | DbContext, request-specific state |
| **Singleton** | Uygulama boyunca tek | Configuration, Logger, Cache |

---

## 💻 Interface ile DI Kullanımı

### Örnek: Repository Pattern

```csharp
// 1. Interface
public interface IUserRepository
{
    User GetById(int id);
    void Save(User user);
}

// 2. SQL Implementasyonu
public class SqlUserRepository : IUserRepository
{
    public User GetById(int id)
    {
        // SQL kodları
        return new User();
    }
    
    public void Save(User user)
    {
        // SQL kodları
    }
}

// 3. MongoDB Implementasyonu
public class MongoUserRepository : IUserRepository
{
    public User GetById(int id)
    {
        // MongoDB kodları
        return new User();
    }
    
    public void Save(User user)
    {
        // MongoDB kodları
    }
}

// 4. Servis (DI kullanıyor)
public class UserService
{
    private readonly IUserRepository _repository;
    
    public UserService(IUserRepository repository)  // Interface'ten alıyor
    {
        _repository = repository;
    }
    
    public User GetUser(int id)
    {
        return _repository.GetById(id);
    }
}

// 5. Program.cs - Kayıt
builder.Services.AddScoped<IUserRepository, SqlUserRepository>();
// veya
builder.Services.AddScoped<IUserRepository, MongoUserRepository>();

builder.Services.AddScoped<UserService>();

// 6. Controller
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    
    public UserController(UserService userService)  // DI Container otomatik enjekte eder
    {
        _userService = userService;
    }
    
    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        var user = _userService.GetUser(id);
        return Ok(user);
    }
}
```

**Nasıl çalışıyor?**

1. `UserController` oluşturulurken `UserService` istenir
2. DI Container `UserService`'i oluşturmak için `IUserRepository`'ye ihtiyaç duyar
3. Kayıtlı `SqlUserRepository`'yi oluşturur
4. `UserService`'e enjekte eder
5. `UserController`'a `UserService`'i verir

---

## 🧩 Abstract Class ile DI Kullanımı

### Örnek: Animal Hierarchy

```csharp
// 1. Abstract Class
public abstract class Animal
{
    public string Name { get; set; }
    public int Age { get; set; }
    
    public void Eat()
    {
        Console.WriteLine($"{Name} yemek yiyor.");
    }
    
    public abstract void Speak();
}

// 2. Concrete Implementations
public class Dog : Animal
{
    public override void Speak()
    {
        Console.WriteLine($"{Name} havladı: Hav Hav!");
    }
}

public class Cat : Animal
{
    public override void Speak()
    {
        Console.WriteLine($"{Name} miyavladı: Miyav!");
    }
}

// 3. Servis (Abstract Class kullanıyor)
public class AnimalTrainer
{
    private readonly Animal _animal;
    
    public AnimalTrainer(Animal animal)  // Abstract class'tan alıyor
    {
        _animal = animal;
    }
    
    public void Train()
    {
        _animal.Eat();
        _animal.Speak();
    }
}

// 4. Program.cs - Kayıt
// Abstract class'ı direkt kaydedemezsin, concrete implementasyonu kaydet
builder.Services.AddScoped<Animal, Dog>();  // Animal isteyenlere Dog ver
// veya
builder.Services.AddScoped<Animal, Cat>();  // Animal isteyenlere Cat ver

builder.Services.AddScoped<AnimalTrainer>();

// 5. Controller
public class AnimalController : ControllerBase
{
    private readonly AnimalTrainer _trainer;
    
    public AnimalController(AnimalTrainer trainer)  // DI Container otomatik enjekte eder
    {
        _trainer = trainer;
    }
    
    [HttpPost("train")]
    public IActionResult Train()
    {
        _trainer.Train();
        return Ok();
    }
}
```

**Önemli Not:** Abstract class'ı direkt kaydedemezsin (`new Animal()` yapılamaz), concrete implementasyonunu kaydedersin.

---

## 🏭 Factory Pattern ile DI

### Runtime'da Seçim Yapma

```csharp
// 1. Interface
public interface IPaymentGateway
{
    Task<bool> ChargeAsync(decimal amount);
}

// 2. Implementations
public class StripeGateway : IPaymentGateway
{
    public Task<bool> ChargeAsync(decimal amount) { }
}

public class PayPalGateway : IPaymentGateway
{
    public Task<bool> ChargeAsync(decimal amount) { }
}

// 3. Factory Interface
public interface IPaymentGatewayFactory
{
    IPaymentGateway Create(string gatewayType);
}

// 4. Factory Implementation
public class PaymentGatewayFactory : IPaymentGatewayFactory
{
    private readonly IServiceProvider _serviceProvider;
    
    public PaymentGatewayFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
    
    public IPaymentGateway Create(string gatewayType)
    {
        return gatewayType switch
        {
            "stripe" => _serviceProvider.GetRequiredService<StripeGateway>(),
            "paypal" => _serviceProvider.GetRequiredService<PayPalGateway>(),
            _ => throw new ArgumentException("Geçersiz gateway tipi")
        };
    }
}

// 5. Program.cs
builder.Services.AddScoped<StripeGateway>();
builder.Services.AddScoped<PayPalGateway>();
builder.Services.AddScoped<IPaymentGatewayFactory, PaymentGatewayFactory>();

// 6. Controller
public class PaymentController : ControllerBase
{
    private readonly IPaymentGatewayFactory _factory;
    
    public PaymentController(IPaymentGatewayFactory factory)
    {
        _factory = factory;
    }
    
    [HttpPost("pay")]
    public async Task<IActionResult> Pay([FromBody] PaymentRequest request)
    {
        // Runtime'da hangi gateway'i kullanacağını belirle
        var gateway = _factory.Create(request.GatewayType);  // "stripe" veya "paypal"
        var result = await gateway.ChargeAsync(request.Amount);
        return Ok(result);
    }
}
```

---

## 🚀 Modern Projelerde DI Kullanımı (ASP.NET Core)

### Program.cs Yapısı

```csharp
var builder = WebApplication.CreateBuilder(args);

// Servisleri kaydet
builder.Services.AddControllers();
builder.Services.AddScoped<IUserRepository, SqlUserRepository>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<OrderService>();

// DbContext (Scoped)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// HttpClient (Transient veya Scoped)
builder.Services.AddHttpClient<ExternalApiService>();

// Configuration (Singleton)
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

var app = builder.Build();

// Middleware
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### Controller'da Kullanım

```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly ILogger<UsersController> _logger;
    
    // DI Container otomatik enjekte eder
    public UsersController(UserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }
    
    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        _logger.LogInformation("Getting user {UserId}", id);
        var user = _userService.GetUser(id);
        return Ok(user);
    }
}
```

### Servisler Arası DI

```csharp
public class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IEmailSender _emailSender;
    private readonly IPaymentGateway _paymentGateway;
    
    public OrderService(
        IOrderRepository orderRepository,
        IEmailSender emailSender,
        IPaymentGateway paymentGateway)
    {
        _orderRepository = orderRepository;
        _emailSender = emailSender;
        _paymentGateway = paymentGateway;
    }
    
    public async Task<Order> PlaceOrder(OrderRequest request)
    {
        var order = new Order { /* ... */ };
        await _orderRepository.Save(order);
        await _paymentGateway.ChargeAsync(order.Total);
        await _emailSender.Send(order.CustomerEmail);
        return order;
    }
}
```

---

## ✅ DI'nın Avantajları

### 1. Test Edilebilirlik

```csharp
// Production
services.AddScoped<IUserRepository, SqlUserRepository>();

// Test
services.AddScoped<IUserRepository, FakeUserRepository>();  // Fake implementasyon
```

### 2. Loose Coupling (Gevşek Bağlılık)

```csharp
// UserService SQL'e bağlı değil, sadece IUserRepository'ye bağlı
public class UserService
{
    private readonly IUserRepository _repo;  // Interface'e bağlı
}
```

### 3. Değiştirilebilirlik

```csharp
// SQL'den MongoDB'ye geçiş
// Sadece Program.cs'de değişiklik
services.AddScoped<IUserRepository, MongoUserRepository>();  // Sadece bu satır değişir
```

### 4. Merkezi Yönetim

```csharp
// Tüm bağımlılıklar tek yerde (Program.cs)
builder.Services.AddScoped<IUserRepository, SqlUserRepository>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IPaymentGateway, StripeGateway>();
```

### 5. SOLID Prensipleri

- **Single Responsibility:** Her sınıf tek sorumluluğa sahip
- **Open/Closed:** Yeni implementasyonlar eklemek kolay
- **Liskov Substitution:** Interface implementasyonları birbirinin yerine kullanılabilir
- **Interface Segregation:** Küçük, odaklanmış interface'ler
- **Dependency Inversion:** Soyutlamalara bağlılık

---

## 🎯 Best Practices (En İyi Uygulamalar)

### 1. Interface Kullan

```csharp
// ✅ İyi
public class UserService
{
    private readonly IUserRepository _repo;
    public UserService(IUserRepository repo) { }
}

// ❌ Kötü
public class UserService
{
    private readonly SqlUserRepository _repo;  // Concrete class'a bağlı
    public UserService(SqlUserRepository repo) { }
}
```

### 2. Constructor Injection Kullan

```csharp
// ✅ İyi
public class UserService
{
    private readonly IUserRepository _repo;
    public UserService(IUserRepository repo) { }
}

// ❌ Kötü
public class UserService
{
    public IUserRepository Repo { get; set; }  // Property injection (null olabilir)
}
```

### 3. readonly Kullan

```csharp
// ✅ İyi
private readonly IUserRepository _repo;

// ❌ Kötü
private IUserRepository _repo;  // Değiştirilebilir
```

### 4. Doğru Lifetime Seç

```csharp
// ✅ DbContext için Scoped
services.AddDbContext<ApplicationDbContext>();

// ✅ Configuration için Singleton
services.AddSingleton<IConfiguration>();

// ✅ Stateless servisler için Transient
services.AddTransient<IValidator, UserValidator>();
```

### 5. Service Locator Anti-Pattern'den Kaçın

```csharp
// ❌ Kötü (Service Locator)
public class UserService
{
    public void Save()
    {
        var repo = ServiceLocator.GetService<IUserRepository>();  // Kötü!
    }
}

// ✅ İyi (DI)
public class UserService
{
    private readonly IUserRepository _repo;
    public UserService(IUserRepository repo) { }
}
```

---

## 🔍 DI Container'ın Arka Planda Ne Yaptığı?

### `services.AddScoped<IUserRepository, SqlUserRepository>()` Ne Yapar?

**1. Kayıt (Registration):**
```csharp
// DI Container'a şunu söylüyor:
// "IUserRepository isteyenlere SqlUserRepository ver"
Container.Register<IUserRepository, SqlUserRepository>(Lifetime.Scoped);
```

**2. Çözümleme (Resolution):**
```csharp
// Birisi IUserRepository istediğinde:
public UserService(IUserRepository repo)  // IUserRepository isteniyor
{
    // DI Container:
    // 1. Kayıtlara bakar: "IUserRepository → SqlUserRepository"
    // 2. SqlUserRepository'yi oluşturur: new SqlUserRepository()
    // 3. repo parametresine verir
}
```

**3. Yaşam Döngüsü Yönetimi:**
```csharp
// Scoped ise:
// - Aynı HTTP request içinde aynı instance
// - Request bittiğinde dispose edilir
```

### Örnek Akış

```csharp
// 1. Program.cs - Kayıt
services.AddScoped<IUserRepository, SqlUserRepository>();
services.AddScoped<UserService>();

// 2. Request geldi
GET /api/users/1

// 3. Controller oluşturulurken
public UsersController(UserService userService)  // UserService isteniyor

// 4. DI Container UserService'i oluşturmak için IUserRepository'ye ihtiyaç duyar
// 5. IUserRepository için SqlUserRepository'yi oluşturur
// 6. SqlUserRepository'yi UserService constructor'ına verir
// 7. UserService'i UsersController constructor'ına verir
// 8. Controller çalışır
```

---

## 🧪 Test'te DI Kullanımı

### Unit Test

```csharp
[Test]
public void GetUser_ShouldReturnUser()
{
    // Arrange
    var fakeRepo = new FakeUserRepository();  // Fake implementasyon
    var service = new UserService(fakeRepo);  // Manuel DI
    
    // Act
    var user = service.GetUser(1);
    
    // Assert
    Assert.IsNotNull(user);
}
```

### Integration Test

```csharp
[Test]
public void GetUser_IntegrationTest()
{
    // Arrange
    var services = new ServiceCollection();
    services.AddScoped<IUserRepository, SqlUserRepository>();  // Gerçek DB
    services.AddScoped<UserService>();
    var serviceProvider = services.BuildServiceProvider();
    
    var service = serviceProvider.GetRequiredService<UserService>();
    
    // Act
    var user = service.GetUser(1);
    
    // Assert
    Assert.IsNotNull(user);
}
```

---

## 🎯 Kısacık Özet (Akılda Kalsın)

* **DI = Bağımlılıkları dışarıdan verme**

* **Constructor Injection** → En yaygın ve güvenli yöntem

* **Lifetime:**
  - **Transient** → Her seferinde yeni
  - **Scoped** → Request başına bir
  - **Singleton** → Uygulama boyunca tek

* **Interface kullan** → Concrete class'a bağlanma

* **DI Container** → Bağımlılıkları otomatik yönetir ve enjekte eder

* **Program.cs** → Tüm servis kayıtları burada

* **Test edilebilirlik** → Fake implementasyonlar kullanabilirsin

* **Loose Coupling** → Sınıflar birbirine gevşek bağlı

* **SOLID Prensipleri** → Özellikle Dependency Inversion Principle

---

## 📚 İlgili Konular

* **Interface** → DI'da sık kullanılır
* **Abstract Class** → DI'da kullanılabilir ama daha az yaygın
* **SOLID Prensipleri** → Dependency Inversion Principle
* **Repository Pattern** → DI ile birlikte sık kullanılır
* **Factory Pattern** → Runtime seçim için DI ile birlikte kullanılır

---

**Sonuç:** DI, modern yazılım geliştirmede kritik bir tekniktir. Test edilebilirlik, esneklik ve bakım kolaylığı sağlar. ASP.NET Core'da built-in DI Container ile kolayca kullanılabilir.
