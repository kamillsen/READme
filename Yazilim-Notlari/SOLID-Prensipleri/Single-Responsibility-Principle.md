# 📌 SRP – Single Responsibility Principle (Tek Sorumluluk Prensibi)

> **Bir sınıfın sadece *tek bir sorumluluğu* olmalı.**

> Yani *tek bir sebeple değişmeli.*

---

## 1️⃣ SRP ne işe yarar?

Bir sınıfın yaptığı işi netleştirir.

Hem okunabilirliği hem test edilebilirliği artırır.

Kodun "spagettiye" dönmesini engeller.

---

## 2️⃣ Mantığı (kafada canlanacak şekilde)

Bir sınıfı bir **çalışan** olarak düşün.

* Aynı kişi **validasyon yapıyor**
* Aynı kişi **veritabanına kaydediyor**
* Aynı kişi **mail gönderiyor**

Bu insanda bir değişiklik yaptığında işlerin hepsi etkilenir → **kaos**.

Bu yüzden işleri **rol rol** ayırırız:

* "Validasyon çalışanı"
* "Veri kaydetme çalışanı"
* "Mail çalışanı"

Kodda da durum **aynı**.

---

## 3️⃣ SRP olmazsa ne olur?

❌ Kod karmaşıklaşır

❌ Bir değişiklik başka yerleri bozar

❌ Test yazmak çok zorlaşır

❌ Sınıfın sorumluluğu büyüdükçe hata oranı artar

SRP ile:

✔ Her sınıf küçük, net ve güvenilir olur

✔ Tek iş yapar → Tek sebeple değişir

---

## 4️⃣ Kritik not: "Her işlem ayrı sınıf" değildir

SRP, işlemleri değil **sorumlulukları ayırır**.

Örneğin ürün yönetimi:

* Getir
* Kaydet
* Güncelle
* Sil

Bunların hepsi **veri işlemi**dir → **Tek sorumluluk** → **Tek sınıf (ProductRepository)**

Ayrılacak olanlar:

* Validasyon → başka sınıf
* Fiyat hesaplama → başka sınıf
* Mail gönderme → başka sınıf
* Loglama → başka sınıf

---

## 5️⃣ Temel kurallar (kafaya yaz)

* **Bir sınıfın tek bir sorumluluğu olmalı.**

* **Tek sebep → tek değişiklik.**

* "Veri işlemleri" tek sorumluluktur.

* "Validasyon" ayrı bir sorumluluktur.

* Az iş yapan çok sınıf, çok iş yapan az sınıftan daha iyidir.

---

## 6️⃣ Minimal C# örneği

### ❌ Yanlış (bir sınıf çok iş yapıyor)

```csharp
public class UserService
{
    public void CreateUser(User user)
    {
        // Validasyon
        if (string.IsNullOrEmpty(user.Name))
            throw new Exception("Name required");

        // Veritabanı
        Console.WriteLine("Saved");

        // Mail
        Console.WriteLine("Mail sent");
    }
}
```

### ✔ Doğru (sorumluluklar ayrıldı)

```csharp
public class UserValidator
{
    public void Validate(User user)
    {
        if (string.IsNullOrEmpty(user.Name))
            throw new Exception("Name required");
    }
}

public class UserRepository
{
    public void Save(User user)
    {
        Console.WriteLine("Saved");
    }
}

public class EmailService
{
    public void SendWelcomeMail(User user)
    {
        Console.WriteLine("Mail sent");
    }
}

public class UserService
{
    private readonly UserValidator _validator = new();
    private readonly UserRepository _repo = new();
    private readonly EmailService _email = new();

    public void CreateUser(User user)
    {
        _validator.Validate(user);
        _repo.Save(user);
        _email.SendWelcomeMail(user);
    }
}
```

---

## 7️⃣ Tek cümlelik özet

> **SRP = Sınıf tek iş yapsın, sadece o iş değiştiğinde değişsin.**

---

Hazırsan **Open/Closed Principle** için de aynı formatta not hazırlayabilirim.


