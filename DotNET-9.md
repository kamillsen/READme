# .NET 9 Web API Kurulum ve Kullanım Rehberi

## 📋 İçindekiler
- [.NET 9 Kurulumu](#net-9-kurulumu)
- [Web API Projesi Oluşturma](#web-api-projesi-oluşturma)
- [.NET 9 ile Gelen Değişiklikler](#net-9-ile-gelen-değişiklikler)
- [Swagger/OpenAPI Yapılandırması](#swaggeropenapi-yapılandırması)
- [Proje Yapısı](#proje-yapısı)
- [VS Code Kurulumu](#vs-code-kurulumu)

## 🚀 .NET 9 Kurulumu

### Fedora 42'ye .NET 9 SDK Kurulumu
```bash
# Microsoft paket deposunu ekle
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo wget -O /etc/yum.repos.d/microsoft-prod.repo https://packages.microsoft.com/config/fedora/39/prod.repo

# .NET 9 SDK'sını yükle
sudo dnf install dotnet-sdk-9.0

# Kurulumu doğrula
dotnet --version
```

### .NET 9 Paket Farkları
- **dotnet-sdk-9.0**: Geliştirme için gerekli tüm araçları içerir (önerilen)
- **aspnetcore-runtime-9.0**: Sadece web uygulamalarını çalıştırmak için
- **dotnet-runtime-9.0**: Sadece console/desktop uygulamaları için

**Geliştirici için sadece SDK yeterlidir.**

## 🌐 Web API Projesi Oluşturma

### Minimal API (Varsayılan)
```bash
# Proje oluştur
dotnet new webapi -n MyWebApi
cd MyWebApi

# Projeyi çalıştır
dotnet run

# VS Code'da aç
code .
```

### Controller-based API
```bash
# Controller'lı proje oluştur
dotnet new webapi -n MyControllerApi --use-controllers
cd MyControllerApi
dotnet run
```

## 📋 .NET 9 ile Gelen Değişiklikler

### 🚀 Performans İyileştirmeleri
- **Loop optimizasyonları**: Döngüler için daha verimli kod üretimi
- **Garbage Collection**: Büyük nesneler için daha iyi bellek yönetimi
- **Arm64 vectorization**: ARM tabanlı donanımlarda önemli performans artışı

### 💻 C# 13 Yenilikleri
- **ref struct generic desteği**: ref struct'lar artık generic parametrelerde kullanılabilir
- **Partial properties**: Partial sınıflarda property desteği
- **Overload resolution priority**: Daha iyi metod seçimi

### 🔧 Geliştirici Araçları
- **BuildCheck**: Build sırasında hata kontrolü (`dotnet build /check`)
- **dotnet workload history**: Workload değişiklik takibi
- **Visual Studio**: Multi-project launch profiles

### 🌐 Platform Desteği
- **.NET MAUI**: Performans ve güvenilirlik iyileştirmeleri
- **WPF**: Windows Fluent theme, dark/light mode
- **WinForms**: Experimental dark mode desteği

### 📦 Güvenlik ve NuGet
- **Hardware-accelerated cryptography**: Donanım destekli şifreleme
- **Gelişmiş güvenlik auditleri**: Dependency taramaları
- **JWT token desteği**: İyileştirilmiş authentication

### ⏰ Destek Süresi
**.NET 9 Standard Term Support (STS)**: 18 ay destek (Mayıs 2026'ya kadar)

## 📄 Swagger/OpenAPI Yapılandırması

### 🔍 .NET 9'da OpenAPI Durumu
- **Varsayılan olarak aktif**: Development ortamında otomatik çalışır
- **Minimal API desteği**: Controller olmadan da çalışır
- **Otomatik dokümantasyon**: API endpoint'leri otomatik olarak dokümante edilir

### 📝 Program.cs Yapılandırması

#### Minimal API için:
```csharp
var builder = WebApplication.CreateBuilder(args);

// OpenAPI servisleri ekle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger middleware (Development ortamında aktif)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// API endpoint'leri
app.MapGet("/", () => "Hello World!");
app.MapGet("/weatherforecast", () => 
{
    var forecasts = new[]
    {
        new { Date = DateTime.Now, Temperature = 25, Summary = "Sunny" }
    };
    return forecasts;
});

app.Run();
```

#### Controller-based API için:
```csharp
var builder = WebApplication.CreateBuilder(args);

// Controller servisleri
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 🌐 OpenAPI URL'leri
Proje çalıştığında aşağıdaki endpoint'ler kullanılabilir:
- **Swagger UI**: `/swagger` veya `/swagger/index.html`
- **OpenAPI JSON**: `/swagger/v1/swagger.json`
- **Raw OpenAPI**: `/openapi/v1.json`

### ⚙️ Her Ortamda Swagger Aktif Etme
```csharp
// Development kontrolü kaldır
app.UseSwagger();
app.UseSwaggerUI();
```

## 📁 Proje Yapısı

### Minimal API Yapısı
```
MyWebApi/
├── Program.cs                    # Ana uygulama dosyası
├── MyWebApi.csproj              # Proje dosyası
├── MyWebApi.http                # HTTP test dosyası
├── appsettings.json             # Genel ayarlar
├── appsettings.Development.json # Development ayarları
├── Properties/
│   └── launchSettings.json      # Launch yapılandırması
└── obj/                         # Build dosyaları
```

### Controller-based API Yapısı
```
MyControllerApi/
├── Controllers/
│   └── WeatherForecastController.cs
├── Models/
│   └── WeatherForecast.cs
├── Program.cs
├── MyControllerApi.csproj
└── [diğer dosyalar...]
```

## 🛠️ VS Code Kurulumu

### Gerekli Uzantılar
1. **C# Dev Kit** (Microsoft - önerilen)
2. **C#** (OmniSharp tabanlı)
3. **.NET Install Tool** (SDK yönetimi)

### İlk Çalıştırma
1. VS Code projeyi açtığında "Required assets..." mesajı → **Yes**
2. OmniSharp başlatılmasını bekle
3. **F5** ile debug mode veya **Ctrl+F5** ile normal çalıştırma

## 🔍 Sorun Giderme

### Swagger Görünmüyorsa
1. Development ortamında çalıştığından emin ol
2. `Program.cs`'de OpenAPI servislerinin eklendiğini kontrol et
3. Browser'da doğru port numarasını kullan
4. Console'da hata mesajları kontrol et

### Yaygın Sorunlar
- **Port conflicts**: Farklı port kullan
- **HTTPS redirection**: HTTP kullanarak test et
- **Missing services**: `AddEndpointsApiExplorer()` eklemeyi unutma

## 📚 Yararlı Komutlar

```bash
# Mevcut şablonları listele
dotnet new list

# Proje oluştur ve çalıştır
dotnet new webapi -n ProjectName
dotnet run

# Development ortamında çalıştır
dotnet run --environment Development

# Build kontrolü
dotnet build /check

# Workload geçmişi
dotnet workload history
```

## 🎯 Sonuç

.NET 9 ile Web API geliştirme daha performanslı ve kolay hale geldi. Minimal API yaklaşımı basit projeler için ideal, Controller-based yaklaşım ise büyük ve organize projeler için tercih edilebilir. OpenAPI/Swagger desteği varsayılan olarak geldiği için API dokümantasyonu artık otomatik.
