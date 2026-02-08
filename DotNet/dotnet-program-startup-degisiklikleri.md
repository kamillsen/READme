# .NET Program.cs ve Startup.cs Yapısal Değişiklikleri

Bu belge, .NET 6 ve sonrasında gelen en büyük yapısal değişikliklerden birini açıklamaktadır.

---

## Eski Yapı (.NET 5 ve Öncesi, .NET Core 3.1 dahil)

**İki ana dosya vardı:**

### 1. Program.cs - Uygulamanın Giriş Noktası
`Main` metodu buradaydı. Host'u (konak) oluşturma ve konfigüre etme işi burada başlardı.

### 2. Startup.cs - Servis ve Pipeline Konfigürasyonu
Uygulamanın servislerini (DI) ve HTTP pipeline'ını (middleware) konfigüre ettiğimiz sınıf. İki ana metodu vardı:

| Metod | Açıklama |
|-------|----------|
| `ConfigureServices(IServiceCollection services)` | Dependency Injection (DI) konteynerine eklenecek servisleri tanımlar (DbContext, Controller, Authentication vs.) |
| `Configure(IApplicationBuilder app)` | HTTP request pipeline'ını, yani middleware'lerin sırasını belirler (Exception Handling, Static Files, Routing, Authentication, Authorization, Endpoints) |

### Örnek Eski Yapı

**Program.cs:**
```csharp
public class Program {
    public static void Main(string[] args) {
        CreateHostBuilder(args).Build().Run();
    }
    
    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder => {
                webBuilder.UseStartup<Startup>(); // Startup.cs'yi işaret ediyor
            });
}
```

**Startup.cs:**
```csharp
public class Startup {
    public void ConfigureServices(IServiceCollection services) {
        services.AddControllers();
        services.AddDbContext<MyDbContext>(...);
    }
    
    public void Configure(IApplicationBuilder app) {
        app.UseRouting();
        app.UseAuthorization();
        app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
    }
}
```

---

## Yeni Yapı (.NET 6 ve Sonrası, .NET 9 dahil)

**Tek bir dosya: `Program.cs` (Minimal API / Top-Level Statements ile)**

.NET 6'daki en büyük yenilik, C# 9'daki "top-level statements" özelliğini kullanarak tek bir `Program.cs` dosyasında her şeyi yazabilmemiz. Artık `Startup.cs` dosyası **zorunlu değil**. Tüm konfigürasyon, `Program.cs` içinde, sınıf ve metod tanımları olmadan, adeta bir "script" gibi yazılıyor.

### Örnek Yeni Yapı (.NET 9)

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// ══════════════════════════════════════════════════════════
// ESKİ Startup.ConfigureServices() BURASI
// Servisleri (DI) ekliyoruz
// ══════════════════════════════════════════════════════════
builder.Services.AddControllers();
builder.Services.AddDbContext<MyDbContext>(...);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ══════════════════════════════════════════════════════════
// ESKİ Startup.Configure() BURASI
// HTTP Pipeline (Middleware) sırasını belirliyoruz
// ══════════════════════════════════════════════════════════
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers(); // Controller'ları endpoint olarak ekler

app.Run();
```

---

## Ne Değişti? Avantajları Neler?

| # | Avantaj | Açıklama |
|---|---------|----------|
| 1 | **Basitlik ve Okunabilirlik** | Küçük ve orta ölçekli uygulamalar için kod çok daha basit ve okunaklı hale geldi. Her şey tek yerde. |
| 2 | **Daha Az Cereme** | `Program` sınıfı, `Main` metodu, `Startup` sınıfı gibi "boilerplate" (şablon) kodlar ortadan kalktı. |
| 3 | **Daha Açık Akış** | Servislerin eklendiği ve pipeline'ın oluşturulduğu sıra, kodun akışında doğrudan görülüyor. |
| 4 | **Esneklik** | `Startup.cs` dosyasını hala kullanabilirsiniz! Eski projeleri geçirirken veya çok büyük konfigürasyonları ayırmak isterseniz kullanılabilir. |

### Startup.cs'yi Hala Kullanmak İsterseniz

```csharp
// İsterseniz böyle de kullanabilirsiniz (ama çoğu zaman gerekmez)
var builder = WebApplication.CreateBuilder(args);
var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services); // Servis konfigürasyonunu dışarı aldık

var app = builder.Build();
startup.Configure(app); // Pipeline konfigürasyonunu dışarı aldık

app.Run();
```

---

## Özet Karşılaştırma Tablosu

| Özellik | Eski Yapı (<= .NET 5) | Yeni Yapı (>= .NET 6) |
|---------|----------------------|----------------------|
| **Ana Dosya** | `Program.cs` + `Startup.cs` | **Sadece `Program.cs`** |
| **Giriş Noktası** | `Program.Main()` | **Top-level statements** (örtük `Main`) |
| **Servis Konfig.** | `Startup.ConfigureServices()` | `builder.Services.{...}` |
| **Pipeline Konfig.** | `Startup.Configure()` | `app.{...}` (örn: `app.UseRouting()`) |
| **Kod Yapısı** | Sınıf/Metod tabanlı | **Script benzeri, düz** |
| **Zorunluluk** | `Startup.cs` zorunluydu | `Startup.cs` **isteğe bağlı** |

---

## Neden Bu Değişiklik Yapıldı?

Microsoft, .NET'i öğrenmesi ve kullanması daha kolay, daha modern bir platform haline getirmeyi hedefliyor. **Minimal API** konsepti ile (ki bu değişiklik onun bir parçası) hem basit microservis'ler hem de büyük API'lar aynı sade şablonla yazılabiliyor.

---

## Sonuç

> .NET 6+ sürümlerinde hala `Startup.cs` kullanabilirsiniz, ancak **resmi ve önerilen yol**, tüm konfigürasyonu tek bir `Program.cs` dosyasında yapmaktır. Bu, geliştirme hızını ve kodun anlaşılırlığını önemli ölçüde artırıyor.

### Hangi Durumda Ne Kullanmalı?

| Durum | Öneri |
|-------|-------|
| Yeni proje başlıyorsunuz | Tek `Program.cs` kullanın |
| Küçük/orta ölçekli API | Tek `Program.cs` kullanın |
| Çok büyük enterprise proje | Konfigürasyonu ayrı sınıflara bölmeyi düşünebilirsiniz |
| Eski projeyi .NET 6+'ya geçiriyorsunuz | İsterseniz `Startup.cs` yapısını koruyabilirsiniz |

---

*Son güncelleme: Ocak 2026*
