# OOP (Nesne Yönelimli Programlama) - C#

## Ne Demek?

OOP, gerçek dünyadaki şeyleri **nesneler** olarak modelleme yaklaşımıdır. Her nesnenin **özellikleri** (property) ve **davranışları** (method) vardır.

## 4 Temel İlke

---

## 1. Encapsulation (Kapsülleme)

Veriyi dışarıdan doğrudan erişime kapatıp, **kontrollü erişim** sağlamak.

```csharp
// ❌ Kapsülleme yok — herkes istediği gibi değiştirir
public class BankaHesabi
{
    public decimal Bakiye;
}

var hesap = new BankaHesabi();
hesap.Bakiye = -5000; // Saçmalık ama engelleyemiyorsun
```

```csharp
// ✅ Kapsülleme var — kontrol sende
public class BankaHesabi
{
    private decimal _bakiye;

    public decimal Bakiye => _bakiye; // Sadece okuma

    public void ParaYatir(decimal miktar)
    {
        if (miktar <= 0)
            throw new ArgumentException("Miktar pozitif olmalı");

        _bakiye += miktar;
    }

    public void ParaCek(decimal miktar)
    {
        if (miktar > _bakiye)
            throw new InvalidOperationException("Yetersiz bakiye");

        _bakiye -= miktar;
    }
}
```

**Mantık:** `_bakiye`'ye kimse dışarıdan `-5000` yazamaz. Para yatırma/çekme kurallarını **sen** belirliyorsun.

---

## 2. Inheritance (Kalıtım)

Ortak özellikleri bir **üst sınıfta** topla, alt sınıflar bunları **miras alsın**.

```csharp
// Üst sınıf (Base class)
public class Calisan
{
    public string Ad { get; set; }
    public string Soyad { get; set; }
    public decimal Maas { get; set; }

    public string TamAd() => $"{Ad} {Soyad}";
}

// Alt sınıf — Calisan'dan miras alıyor
public class Yazilimci : Calisan
{
    public string ProgramlamaDili { get; set; }

    public void KodYaz()
    {
        Console.WriteLine($"{TamAd()} {ProgramlamaDili} ile kod yazıyor.");
    }
}

// Alt sınıf
public class Muhasebeci : Calisan
{
    public string MuhasebeYazilimi { get; set; }

    public void BilancoHazirla()
    {
        Console.WriteLine($"{TamAd()} bilanço hazırlıyor.");
    }
}
```

```csharp
var dev = new Yazilimci
{
    Ad = "Kamil",
    Soyad = "Şen",
    Maas = 45000,
    ProgramlamaDili = "C#"
};

dev.KodYaz();      // "Kamil Şen C# ile kod yazıyor."
dev.TamAd();       // "Kamil Şen"  → üst sınıftan geldi
```

**Mantık:** `Ad`, `Soyad`, `Maas`, `TamAd()` hepsinde ortak. Her sınıfa tekrar yazmak yerine bir kere yaz, miras al.

---

## 3. Polymorphism (Çok Biçimlilik)

Aynı metot adı, **farklı davranış**. Üst sınıftaki metodu alt sınıf **kendi ihtiyacına göre değiştirir**.

```csharp
public class Calisan
{
    public string Ad { get; set; }
    public decimal Maas { get; set; }

    // virtual = alt sınıflar bunu değiştirebilir
    public virtual decimal MaasiHesapla()
    {
        return Maas;
    }
}

public class Yazilimci : Calisan
{
    public int TamamlananProje { get; set; }

    // override = üst sınıfın metodunu eziyorum
    public override decimal MaasiHesapla()
    {
        return Maas + (TamamlananProje * 500); // Proje başına bonus
    }
}

public class Muhasebeci : Calisan
{
    public bool SertifikaVar { get; set; }

    public override decimal MaasiHesapla()
    {
        return SertifikaVar ? Maas * 1.15m : Maas; // Sertifika varsa %15 zam
    }
}
```

```csharp
List<Calisan> calisanlar = new()
{
    new Yazilimci { Ad = "Kamil", Maas = 40000, TamamlananProje = 3 },
    new Muhasebeci { Ad = "Ayşe", Maas = 35000, SertifikaVar = true }
};

foreach (var c in calisanlar)
{
    // Aynı metot çağrısı, farklı sonuç
    Console.WriteLine($"{c.Ad}: {c.MaasiHesapla()} TL");
}

// Kamil: 41500 TL   (40000 + 3*500)
// Ayşe: 40250 TL    (35000 * 1.15)
```

**Mantık:** `MaasiHesapla()` diyorsun ama her sınıf kendi kuralıyla hesaplıyor. Sen tipi bilmek zorunda değilsin, doğru metot otomatik çalışıyor.

---

## 4. Abstraction (Soyutlama)

**"Ne yapıyor"**u göster, **"nasıl yapıyor"**u gizle. Dışarıya sadece kullanması gereken şeyleri sun.

```csharp
// Abstract class — doğrudan new'lenemez
public abstract class Bildirim
{
    public string Alici { get; set; }
    public string Mesaj { get; set; }

    // Alt sınıf ZORUNLU olarak bunu yazacak
    public abstract Task GonderAsync();

    // Ortak davranış burada kalabilir
    public void LogYaz()
    {
        Console.WriteLine($"[{DateTime.Now}] {Alici} adresine bildirim gönderildi.");
    }
}

public class EmailBildirim : Bildirim
{
    public override async Task GonderAsync()
    {
        // SMTP ile email gönderme detayları
        await SmtpClient.SendAsync(Alici, Mesaj);
        LogYaz();
    }
}

public class SmsBildirim : Bildirim
{
    public override async Task GonderAsync()
    {
        // SMS API ile gönderme detayları
        await SmsApi.SendAsync(Alici, Mesaj);
        LogYaz();
    }
}
```

```csharp
// Kullanan taraf detayı bilmiyor, bilmek zorunda da değil
Bildirim bildirim = new EmailBildirim
{
    Alici = "kamil@email.com",
    Mesaj = "Hoş geldiniz!"
};

await bildirim.GonderAsync(); // Email mi SMS mi? Umurumda değil, gönder yeter.
```

**Mantık:** SMTP ayarları, API key'ler, retry mantığı... Kullanan bunları görmüyor. Sadece `GonderAsync()` diyor, gerisini sınıf hallediyor.

---

## Interface vs Abstract Class

```csharp
// Interface — sadece sözleşme, gövde yok
public interface IOdenebilir
{
    decimal OdemeTutari();
}

// Bir sınıf birden fazla interface alabilir
public class Fatura : IOdenebilir, IYazdirilabilir
{
    public decimal Tutar { get; set; }

    public decimal OdemeTutari() => Tutar * 1.20m; // KDV dahil
    public void Yazdir() => Console.WriteLine($"Fatura: {Tutar} TL");
}
```

| | Abstract Class | Interface |
|---|---|---|
| **Ortak kod** | İçinde metot gövdesi olabilir | Sadece tanım (C# 8+ ile default olabilir) |
| **Çoklu miras** | Sadece 1 tane alınır | Birden fazla alınır |
| **Ne zaman** | "X bir Y'dir" ilişkisi | "X şunu yapabilir" yeteneği |

---

## Özet Tablo

| İlke | Bir Cümle |
|---|---|
| **Encapsulation** | Veriyi gizle, kontrollü eriştir |
| **Inheritance** | Ortak kodu üstte topla, miras al |
| **Polymorphism** | Aynı çağrı, farklı davranış |
| **Abstraction** | Ne yaptığını göster, nasılını gizle |

**Kısaca:** OOP'nin 4 ilkesi birlikte çalışır — veriyi **kapsülle**, ortak olanı **miras al**, farklı davranışı **polimorfizmle** yönet, detayı **soyutla**. C#'ta `class`, `abstract`, `virtual`, `override`, `interface` anahtar kelimeleri bunların araçlarıdır.
