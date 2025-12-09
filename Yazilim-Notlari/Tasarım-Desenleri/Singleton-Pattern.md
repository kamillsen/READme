# 🧩 **SINGLETON PATTERN**

## 1️⃣ Kısa Tanım – Ne İşe Yarar?

Singleton, bir sınıfın uygulama boyunca **yalnızca 1 tane** örneğinin (instance) oluşturulmasını garanti eden tasarım desenidir.

Kullanım amacı:

> "Bu nesneden sadece bir tane olsun ve herkes onu kullansın."

---

## 2️⃣ Mantığı – Basit gerçek hayat benzetmesi

Bir evde **tek bir elektrik sayacı** vardır.

* Evin tüm odaları aynı sayacı kullanır.

* İkinci bir sayaç oluşturamazsın.

* Sayaç merkezi bir noktada durur.

Singleton tam olarak bunu yapar:

> "Bu sınıfın sadece TEK örneği olabilir."

---

## 3️⃣ Neden Var? Olmasa Ne Olur?

Singleton'ın olmadığı bir projede:

❌ Logger gibi sınıfların yüzlerce kopyası oluşur → bellek israfı

❌ Config yöneticisi her çağrıda yeniden oluşturulur → gereksiz maliyet

❌ Cache yöneticisi çoğaltılır → karmaşa çıkar

❌ Merkezi kontrol isteyen yapılar dağılır

Singleton ile:

✔ Tüm uygulama tek örneği paylaşır

✔ Global davranış kontrol edilir

✔ Nesne yaşam döngüsü yönetilir

✔ Gereksiz new işlemleri engellenir

---

## 4️⃣ Kafaya Yazılacak Kurallar

* Constructor **private** olmalı (dışarıdan new'lenmesin diye).

* Sınıf içinde **statik bir instance** tutulur.

* Instance'a erişim **statik bir property** üzerinden yapılır.

* Tüm uygulama tek örneği kullanır.

* Multithread senaryoları için thread-safe versiyon gerekebilir.

---

## 5️⃣ Kod – En Net ve Basit Singleton Örneği

Kodun içindeki yorumlar mantığı çok net açıklıyor.

```csharp
// ------------------------------------------------------------
// Singleton Logger
// Her yerden erişilebilen tek bir logger örneği oluşturuyoruz.
// ------------------------------------------------------------
public class Logger
{
    // 🔥 1) Sınıfın tek örneği burada saklanır.
    private static readonly Logger _instance = new Logger();

    // 🔥 2) Constructor private → dışarıdan new yapılamaz.
    private Logger()
    {
        // Normalde log dosyası açma, config yükleme gibi işlemler yapılabilir.
        // Ama bu ctor'a kimse erişemez.
    }

    // 🔥 3) Tek örneğe erişim noktası → herkes buradan alır.
    public static Logger Instance => _instance;

    public void Log(string message)
    {
        Console.WriteLine($"[LOG] {message}");
    }
}

// ------------------------------------------------------------
// Kullanım
// Asla: var logger = new Logger(); YAPAMAZSIN!
// Çünkü ctor private.
// ------------------------------------------------------------
public class Program
{
    public static void Main()
    {
        // Singleton örneğine erişim:
        var logger = Logger.Instance;

        logger.Log("Program started.");
        logger.Log("Something happened...");

        // Ne kadar çağırırsan çağır → hep aynı instance kullanılır.
        var logger2 = Logger.Instance;

        Console.WriteLine(logger == logger2);  // True → aynı nesne!
    }
}
```

---

## 6️⃣ Mini Özet – 3 Satır

* **Singleton = tek bir instance + herkes onu kullanır.**

* **Constructor private → new yapılamaz.**

* **Instance → static property üzerinden erişilir.**

---






