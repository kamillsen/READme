# ✅ Open/Closed Principle (OCP) – Açık/Kapalı Prensibi

## 1️⃣ Kısa tanım + Ne işe yarar?

**Sınıflar *genişletmeye açık*, *değiştirmeye kapalı* olmalıdır.**

Yani yeni özellik eklemek için mevcut kodu değiştirmene gerek kalmamalı.

---

## 2️⃣ Mantığını açıkla

Gerçek hayat örneği düşünelim:

Bir **priz** düşün.

Yeni bir cihaz (telefon şarjı, televizyon, kettle) aldığında **duvardaki prizi değiştirmezsin**.

Sadece **yeni bir fiş takarsın**.

> İşte OCP tam olarak bunu ister:
> Mevcut sistemi bozmadan yeni davranışlar eklemek.

Kodda karşılığı:

* Var olan sınıfa dokunmadan
* Yeni sınıflar yazarak
* Sistemin yeteneklerini genişletmek

Eğer her yeni log tipi, her yeni ödeme tipi, her yeni kampanya için eski kodu editlemen gerekiyorsa → **OCP ihlali**.

---

## 3️⃣ Neden var, olmasa ne olur?

OCP yoksa:

❌ Her yeni özellikte eski kodu açıp modifiye edersin

❌ Yanlışlıkla bir yerleri bozarsın

❌ Kod "kırılgan" hâle gelir

❌ Test maliyeti artar

OCP ile:

✔ Yeni davranış = Yeni sınıf ekle → Eski kod güvende

✔ Kapalı olan yer stabil kalır

✔ Hatalar azalır

✔ Mimari büyüdükçe yönetilebilir kalır

---

## 4️⃣ Kafaya Yazılacak Temel Kurallar

* ❗ "Eski kodu değiştirme, yeni kod ekle."

* ❗ İster strateji, ister interface, ister abstract class → Amaç: genişleme noktası yaratmak.

* ❗ Yeni ihtiyaçlar = Yeni sınıf → Eski kod dokunulmaz.

* ❗ OCP genelde **interface + polimorfizm** ile uygulanır.

---

## 5️⃣ C# Örneği

### ❌ OCP'ye aykırı (her log tipi için eski kodu değiştiriyoruz)

```csharp
public class Logger
{
    public void Log(string message, string type)
    {
        if (type == "console")
            Console.WriteLine(message);

        if (type == "file")
            File.WriteAllText("log.txt", message);

        // Yarın email log isterlerse?
        // Buraya yeni if ekleyeceksin → OCP ihlali
    }
}
```

Her yeni ihtiyaç → Bu sınıfı açıp düzenlemen gerekir.

---

### ✔ OCP uyumlu (genişletmeye açık, değiştirmeye kapalı)

```csharp
public interface ILogger
{
    void Log(string message);
}

public class ConsoleLogger : ILogger
{
    public void Log(string message)
    {
        Console.WriteLine(message);
    }
}

public class FileLogger : ILogger
{
    public void Log(string message)
    {
        File.WriteAllText("log.txt", message);
    }
}

public class LogService
{
    private readonly ILogger _logger;

    public LogService(ILogger logger)
    {
        _logger = logger;
    }

    public void Log(string message)
    {
        _logger.Log(message);
    }
}
```

### Yarın EmailLogger istersek?

Yeni bir sınıf ekleriz:

```csharp
public class EmailLogger : ILogger
{
    public void Log(string message)
    {
        Console.WriteLine("Email sent: " + message);
    }
}
```

**Hiçbir eski kodu değiştirmedik.**

Sadece yeni sınıf ekledik → **OCP zaferi 🎉**

---

## 6️⃣ Kısacık Özet

> **Mevcut kod değişmesin; yeni davranış yeni sınıflarla gelsin.**

> **Genişletmeye açık, değiştirmeye kapalı.**

---

İstersen şimdi **L — Liskov Substitution Principle**'a geçebiliriz.








