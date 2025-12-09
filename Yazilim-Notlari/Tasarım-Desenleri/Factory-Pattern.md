# 🎯 **FACTORY PATTERN**

## 1️⃣ Kısa Tanım – Ne İşe Yarar?

Factory Pattern, nesne oluşturma işlemini **tek bir merkeze toplayan** ve hangi nesnenin oluşturulacağına **runtime'da karar veren** tasarım desenidir.

Amaç:

> "Factory, hangi email servisinin oluşturulacağına karar versin. Kodun geri kalanı new GmailEmailService() veya new OutlookEmailService() görmesin."

---

## 2️⃣ Mantığı – Basit gerçek hayat benzetmesi

Bir **pizza siparişi** düşün:

* Sen diyorsun: "Margherita pizza istiyorum."

* Sen mutfağa girip pizza yapmıyorsun.

* **Pizzacı (Factory)** senin isteğine göre doğru pizzayı hazırlar.

Factory Pattern tam olarak bunu yapar:

> "Hangi nesnenin oluşturulacağına Factory karar verir, sen sadece istediğini söylersin."

---

## 3️⃣ Neden Var? Olmasa Ne Olur?

Factory kullanmazsan:

❌ Kod içinde her yerde `new GmailEmailService()` gibi sert bağımlılıklar olur

❌ Hangi servisin kullanılacağına karar vermek için if-else zincirleri oluşur

❌ Yeni bir provider eklemek için tüm kodları değiştirmen gerekir

❌ Test yazmak zorlaşır (mock edemezsin)

Factory ile:

✔ Nesne oluşturma tek merkezde toplanır

✔ Kod bağımlılıklardan kurtulur

✔ Yeni provider eklemek çok kolay (sadece factory'ye case eklenir)

✔ Test edilebilirlik artar

---

## 4️⃣ Kafaya Yazılacak Kurallar

* Factory, **nesne oluşturma işlemini tek merkezde toplar**.

* Hangi nesnenin oluşturulacağına **runtime'da karar verilir**.

* Kod `new` keyword'ünü görmez → bağımlılık azalır.

* Yeni bir tip eklemek için sadece factory'ye case eklenir.

* .NET'in DI sistemi zaten Factory Pattern'in modern versiyonu gibidir.

---

## 5️⃣ Kod – Email Gönderme Servisleri Örneği

Bu örnek **gerçek projelerde çok kullanılan** bir senaryodur.

### Senaryo:
Kullanıcı ayarlardan **hangi email provider'ını** kullanacağını seçebiliyor:
* Gmail
* Outlook
* SMTP (custom)

Hangi servisin kullanılacağı **runtime'da belli oluyor** → tam Factory'lik durum.

```csharp
// 🧩 1) Email Service interface
public interface IEmailService
{
    void SendEmail(string to, string subject, string body);
}

// 🧩 2) Gmail – Outlook – SMTP implementasyonları
public class GmailEmailService : IEmailService
{
    public void SendEmail(string to, string subject, string body)
    {
        Console.WriteLine($"Gmail ile gönderildi → {to}: {subject}");
    }
}

public class OutlookEmailService : IEmailService
{
    public void SendEmail(string to, string subject, string body)
    {
        Console.WriteLine($"Outlook ile gönderildi → {to}: {subject}");
    }
}

public class SmtpEmailService : IEmailService
{
    public void SendEmail(string to, string subject, string body)
    {
        Console.WriteLine($"SMTP ile gönderildi → {to}: {subject}");
    }
}

// 🧩 3) EmailFactory – Hangi servisi oluşturacağına runtime'da karar veren yapı
public class EmailFactory
{
    private readonly IServiceProvider _provider;

    public EmailFactory(IServiceProvider provider)
    {
        _provider = provider;
    }

    public IEmailService Create(string type)
    {
        return type.ToLower() switch
        {
            "gmail" => _provider.GetRequiredService<GmailEmailService>(),
            "outlook" => _provider.GetRequiredService<OutlookEmailService>(),
            "smtp" => _provider.GetRequiredService<SmtpEmailService>(),
            _ => throw new Exception("Desteklenmeyen email provider")
        };
    }
}

// 🟦 4) Program.cs içinde DI kaydı (çok basit)
// services.AddTransient<GmailEmailService>();
// services.AddTransient<OutlookEmailService>();
// services.AddTransient<SmtpEmailService>();
// services.AddSingleton<EmailFactory>();

// ✦ Bu kayıtlar sayesinde Factory, istediği email servisini DI container'dan alabiliyor.

// 🟦 5) Kullanım
// Kullanıcı ayarlara şunu yazmış olsun: EmailProvider = "gmail"
public class NotificationService
{
    private readonly EmailFactory _factory;

    public NotificationService(EmailFactory factory)
    {
        _factory = factory;
    }

    public void SendWelcomeEmail(string email)
    {
        // Kullanıcı ayarına göre email servisi seçiyoruz
        var emailService = _factory.Create("gmail");
        emailService.SendEmail(email, "Hoş geldin!", "Sisteme hoş geldin.");
    }
}
```

---

## 6️⃣ Factory Pattern'in Kattığı Faydalar

### ✔ 1. Kod "new GmailEmailService()" görmüyor → bağımlılık azalıyor

### ✔ 2. Hangi servis kullanılacak → runtime'da belirleniyor

### ✔ 3. Yeni bir provider eklemek çok kolay
Sadece yeni servis + factory case eklenir. Eski kodlar **asla değişmez**.

### ✔ 4. Testing inanılmaz kolay
FakeEmailService yazarsın → factory'den onu döndürürsün.

---

## 7️⃣ .NET'te Factory Pattern Kullanımı

.NET kendisi de her gün Factory Pattern kullanıyor:

* **IHttpClientFactory.CreateClient()** → farklı client'lar üretir

* **LoggerFactory.CreateLogger()** → isme göre logger üretir

* **DbProviderFactory** → SQL Server mı SQLite mı PostgreSQL mi karar verir

* **AuthenticationHandlerFactory** → JWT / Cookies / OAuth seçer

.NET iç mimarisi bile **Factory Pattern üzerine kurulu**.

---

## 8️⃣ Mini Özet – 4 Satır

* **Factory Pattern, nesne üretimini tek merkezde toplar.**

* **Kod new GmailEmailService() gibi sert bağımlılıklara bulaşmaz.**

* **Provider seçimi runtime'da yapılabiliyorsa → kesinlikle Factory uygundur.**

* **.NET'in DI sistemi zaten Factory Pattern'in modern versiyonu gibidir.**

---








