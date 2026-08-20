# C# `static`, `this` ve Extension Method Mantığı

Bu notta şu konuları tek bir akışta toparlıyoruz:

- Normal class ve normal metot
- `static` metot
- `static class`
- Normal kullanımda `this`
- Extension method içindeki `this`
- `IServiceCollection` üzerinden gerçek bir ASP.NET Core örneği

---

## 1. Normal Class ve Normal Metot

Normal bir sınıfta metotlar genellikle bir nesneye aittir.

```csharp
public class Araba
{
    public void Calistir()
    {
        Console.WriteLine("Araba çalıştı");
    }
}
```

Bu metodu çağırmak için önce nesne oluştururuz:

```csharp
Araba araba = new Araba();

araba.Calistir();
```

Mantık:

```text
Araba sınıfı
    ↓
new Araba()
    ↓
araba nesnesi
    ↓
araba.Calistir()
```

Yani normal bir metot genellikle şu şekilde çağrılır:

```csharp
nesne.Metot();
```

---

## 2. `static` Metot Nedir?

`static` bir metot bir nesneye değil, doğrudan sınıfa aittir.

```csharp
public class Matematik
{
    public static int Topla(int a, int b)
    {
        return a + b;
    }
}
```

Kullanımı:

```csharp
int sonuc = Matematik.Topla(5, 3);
```

Burada `new Matematik()` oluşturmaya gerek yoktur.

Kısaca:

```text
Normal metot:
nesne.Metot()

Static metot:
Sinif.Metot()
```

---

## 3. `static class` Nedir?

Bir sınıf tamamen yardımcı metotlardan oluşuyorsa sınıfın kendisi de `static` olabilir.

```csharp
public static class Hesaplama
{
    public static int Topla(int a, int b)
    {
        return a + b;
    }

    public static int Carp(int a, int b)
    {
        return a * b;
    }
}
```

Kullanımı:

```csharp
int x = Hesaplama.Topla(10, 20);
int y = Hesaplama.Carp(5, 4);
```

`static class` üzerinden nesne oluşturulamaz:

```csharp
Hesaplama h = new Hesaplama(); // HATA
```

Bunu bir araç kutusu gibi düşünebilirsin.

```text
Hesaplama
├── Topla()
├── Carp()
└── Bol()
```

---

# 4. Normal Kullanımda `this`

C#'ta `this` genel olarak o anda üzerinde çalışılan mevcut nesneyi ifade eder.

Örnek:

```csharp
public class Kisi
{
    private string isim;

    public void IsimAta(string isim)
    {
        this.isim = isim;
    }
}
```

Burada:

```csharp
this.isim
```

şu anki `Kisi` nesnesinin alanıdır.

Sağdaki:

```csharp
isim
```

ise metoda gelen parametredir.

Yani:

```csharp
this.isim = isim;
```

şu anlama gelir:

> Bu nesnenin `isim` alanına, metoda gelen `isim` değerini ata.

---

# 5. Extension Method Nedir?

Extension method, mevcut bir tipe o tipin kaynak kodunu değiştirmeden yeni bir metot ekliyormuş gibi kullanım sağlar.

Örneğin:

```csharp
public static class StringExtensions
{
    public static void Yazdir(this string metin)
    {
        Console.WriteLine(metin);
    }
}
```

Artık şöyle kullanabiliriz:

```csharp
string isim = "Ali";

isim.Yazdir();
```

Burada `Yazdir()` gerçekte `string` sınıfının içine eklenmiş değildir.

Metot hâlâ `StringExtensions` sınıfının içindedir.

---

## 6. Extension Method İçindeki `this`

Kritik bölüm:

```csharp
this string metin
```

Buradaki `this`, C# dilinin extension method sözdizimidir.

C#'a şunu söyler:

> Bu metot `string` tipindeki değerler üzerinden extension method olarak çağrılabilir.

Bu nedenle:

```csharp
isim.Yazdir();
```

şeklinde çağrı yapabiliriz.

Bu çağrının mantıksal karşılığı şudur:

```csharp
StringExtensions.Yazdir(isim);
```

Yani:

```csharp
isim.Yazdir();
```

yazdığımızda `isim`, metodun ilk parametresine gider:

```csharp
public static void Yazdir(this string metin)
```

Burada:

```text
isim = "Ali"

isim.Yazdir()
      ↓
StringExtensions.Yazdir(isim)
                         ↓
                       "Ali"
                         ↓
              this string metin
                         ↓
                   metin = "Ali"
```

---

# 7. Extension Method İçin Neden `static` Kullanılır?

Extension method tanımlarken hem sınıf hem de metot `static` olmalıdır.

```csharp
public static class StringExtensions
{
    public static void Yazdir(this string metin)
    {
        Console.WriteLine(metin);
    }
}
```

Çünkü extension method gerçekte bir nesne metodu değildir.

Temelde normal bir `static` metottur.

C# sadece bize şu okunabilir yazımı sağlar:

```csharp
isim.Yazdir();
```

Normal static çağrı karşılığı:

```csharp
StringExtensions.Yazdir(isim);
```

---

# 8. Gerçek ASP.NET Core Örneği

Infrastructure katmanında şöyle bir extension method düşünelim:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SystemSettingsDemo.Application.Abstractions;
using SystemSettingsDemo.Infrastructure.Persistence;
using SystemSettingsDemo.Infrastructure.Persistence.Repositories;

namespace SystemSettingsDemo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "DefaultConnection bulunamadı.");

        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });

        services.AddScoped<
            ISystemConfigurationRepository,
            SystemConfigurationRepository>();

        return services;
    }
}
```

Program.cs:

```csharp
using SystemSettingsDemo.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.Run();
```

---

# 9. `builder.Services.AddInfrastructure(...)` Nasıl Çalışıyor?

Önce şu bilgiyi bilmemiz gerekir:

```csharp
builder.Services
```

bir `IServiceCollection` nesnesidir.

Extension method şu şekilde tanımlandı:

```csharp
public static IServiceCollection AddInfrastructure(
    this IServiceCollection services,
    IConfiguration configuration)
```

İlk parametre:

```csharp
this IServiceCollection services
```

olduğu için `AddInfrastructure` metodu `IServiceCollection` üzerinden çağrılabilir.

Bu yüzden:

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

yazabiliyoruz.

---

## Extension Method Olmasaydı

Eğer metot şöyle olsaydı:

```csharp
public static IServiceCollection AddInfrastructure(
    IServiceCollection services,
    IConfiguration configuration)
```

yani `this` olmasaydı, çağrı şu şekilde yapılırdı:

```csharp
DependencyInjection.AddInfrastructure(
    builder.Services,
    builder.Configuration);
```

Extension method sayesinde aynı çağrıyı daha okunabilir şekilde yazıyoruz:

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

Kavramsal olarak şu ikisi aynı mantıktadır:

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

ve

```csharp
DependencyInjection.AddInfrastructure(
    builder.Services,
    builder.Configuration);
```

---

# 10. Parametreler Nasıl Eşleşiyor?

Şu çağrı:

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

şu metoda gider:

```csharp
public static IServiceCollection AddInfrastructure(
    this IServiceCollection services,
    IConfiguration configuration)
```

Eşleşme:

```text
builder.Services
      ↓
this IServiceCollection services


builder.Configuration
      ↓
IConfiguration configuration
```

Yani metodun içine girildiğinde:

```csharp
services
```

ile:

```csharp
builder.Services
```

aynı nesneyi ifade eder.

Aynı şekilde:

```csharp
configuration
```

ile:

```csharp
builder.Configuration
```

aynı nesneyi ifade eder.

---

# 11. Metodun İçinde Ne Yapılıyor?

## Connection String Alınıyor

```csharp
var connectionString =
    configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "DefaultConnection bulunamadı.");
```

Buradaki `configuration`, Program.cs'den gelen:

```csharp
builder.Configuration
```

nesnesidir.

Örneğin `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=..."
  }
}
```

---

## DbContext Kaydediliyor

```csharp
services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});
```

Buradaki:

```csharp
services
```

aslında:

```csharp
builder.Services
```

nesnesidir.

Yani bu kod Program.cs'de şunu yazmaya benzer:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});
```

---

## Repository Kaydediliyor

```csharp
services.AddScoped<
    ISystemConfigurationRepository,
    SystemConfigurationRepository>();
```

Bu kayıt DI container'a kabaca şunu söyler:

> Bir yerde `ISystemConfigurationRepository` istenirse `SystemConfigurationRepository` oluştur.

---

# 12. Neden `return services` Var?

Metodun dönüş tipi:

```csharp
IServiceCollection
```

olduğu için sonunda:

```csharp
return services;
```

yazıyoruz.

Böylece aynı `IServiceCollection` nesnesi geri döner.

Bunun önemli avantajlarından biri method chaining, yani zincirleme çağrıdır:

```csharp
builder.Services
    .AddInfrastructure(builder.Configuration)
    .AddControllers();
```

Akış:

```text
builder.Services
      ↓
AddInfrastructure(...)
      ↓
IServiceCollection geri döner
      ↓
AddControllers()
```

Eğer `AddInfrastructure` metodu `void` dönseydi bu zinciri devam ettiremezdik.

---

# 13. En Önemli Zihinsel Model

Şu satırı:

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

şöyle okuyabilirsin:

> `builder.Services` nesnesini `AddInfrastructure` metodunun ilk parametresi olarak gönder.  
> `builder.Configuration` nesnesini de ikinci parametre olarak gönder.

Çünkü:

```csharp
this IServiceCollection services
```

sayesinde noktanın solundaki nesne ilk parametre olur.

Yani:

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

kavramsal olarak:

```csharp
DependencyInjection.AddInfrastructure(
    builder.Services,
    builder.Configuration);
```

şeklindedir.

---

# Kısa Özet

Normal `this`:

```csharp
this.isim
```

mevcut nesneyi ifade eder.

Extension method içindeki:

```csharp
this IServiceCollection services
```

ise metodun `IServiceCollection` tipi üzerinden çağrılabilmesini sağlayan özel C# sözdizimidir.

Bu nedenle:

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

şeklinde doğal ve okunabilir bir kullanım elde ederiz.

Extension method'un arkasındaki temel fikir şudur:

```text
nesne.ExtensionMethod(parametre)
```

mantıksal olarak:

```text
StaticClass.ExtensionMethod(nesne, parametre)
```

şeklindeki bir static metot çağrısıdır.
