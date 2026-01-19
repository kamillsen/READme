# ✅ **5) Dependency Inversion Principle (DIP)**

---

# 1️⃣ Kısa tanım + Ne işe yarar?

**Üst seviye sınıflar (iş yapan sınıflar), alt seviye sınıflara (detaylara) bağımlı olmamalıdır.**

**Ne diyor:** "Üst seviye kod, alt seviye detaya değil, interface'e bağımlı olmalı"

Her iki taraf da **soyutlamalara** (interface'lere) bağımlı olmalıdır.

Kısacası:

> **Detaylar soyutlamalara bağlanır, üst seviye kod detaya bağımlı olmaz.**

**Kısa örnek:**
```csharp
// ❌ DIP ihlali
public class OrderService
{
    private readonly FileLogger _logger;  // Detaya bağımlı
}

// ✅ DIP uygulaması
public class OrderService
{
    private readonly ILogger _logger;  // Interface'e bağımlı
}
```

---

# 2️⃣ Mantığını açıkla (gerçek hayat benzetmesi)

Bir **çamaşır makinesi** düşün.

Makine deterjan markasına bağımlı değildir.

"A101 deterjanı, ABC deterjanı…" ne koyarsan koy **makine aynı şekilde çalışır**.

Makinenin bağımlılığı:

> "Deterjan kullanabilen bir şey" (soyutlama).

Kodda da aynı şeyi isteriz:

❌ Üst seviye bir sınıf (Service) doğrudan FileLogger veya DatabaseLogger kullanmasın.

✔ Onun yerine ILogger gibi bir **soyutlama** kullansın.

Böylece:

* Logger tipini değiştirmek çok kolay olur

* Üst seviye kod kırılmaz

* Yeni logger eklemek için Service sınıfını değiştirmezsin

---

# 3️⃣ Neden var, olmasa ne olur?

DIP ihlali varsa:

❌ Üst seviye kod, alt seviye detaya sıkı sıkıya bağlı olur

❌ Yeni bir log sınıfı ekleyince Service'i düzenlemek zorunda kalırsın

❌ Kod kırılgan ve genişletilemez olur

❌ Test yazmak çok zorlaşır

DIP ile:

✔ Üst seviye sınıflar sadece interface bilir

✔ Detayları (FileLogger, DatabaseLogger) istendiğinde kolayca değiştirirsin

✔ **OCP** (Open/Closed Principle - Açık genişlemeye, kapalı değişikliğe) ve **LSP** (Liskov Substitution Principle - Türeyen sınıflar, base sınıfın yerine kullanılabilmeli) ile birlikte esnek bir mimari oluşur

---

# 4️⃣ Kafaya Yazılacak Kurallar

* ❗ "Üst seviye sınıflar SOYUTLAMALARA bağımlı olmalı."

* ❗ "Detaylar (FileLogger) soyutlamalara bağlanır (ILogger)."

* ❗ Constructor'da interface dependency almak DIP'in en yaygın halidir.

* ❗ DIP = bağımlılıkları tersine çevirmek → detay değil sözleşme önemli olur.

---

# 5️⃣ C# Örneği

## ❌ DIP ihlali (üst seviye sınıf, alt sınıfa bağımlı)

```csharp
public class ReportService
{
    private readonly FileLogger _logger = new FileLogger();

    public void CreateReport()
    {
        _logger.Log("Report created");
    }
}
```

Bu ne demek?

* Sadece **FileLogger** ile çalışır

* Yarın EmailLogger veya DatabaseLogger eklemek istiyorsan **bu sınıfı değiştirmek zorundasın**

* Üst seviye sınıf → alt seviye detaya bağımlı (YANLIŞ)

---

## ✔ DIP uygulaması (üst seviye sınıf interface'e bağlı)

### 1) Soyutlama (ILogger)

```csharp
public interface ILogger
{
    void Log(string message);
}
```

### 2) Detay sınıflar

```csharp
public class FileLogger : ILogger
{
    public void Log(string message)
    {
        Console.WriteLine("File log: " + message);
    }
}

public class ConsoleLogger : ILogger
{
    public void Log(string message)
    {
        Console.WriteLine("Console log: " + message);
    }
}
```

### 3) Üst seviye sınıf — interface kullanır (detaydan özgür!)

```csharp
public class ReportService
{
    private readonly ILogger _logger;

    public ReportService(ILogger logger)
    {
        _logger = logger;
    }

    public void CreateReport()
    {
        _logger.Log("Report created");
    }
}
```

### 4) Kullanım

```csharp
var service1 = new ReportService(new FileLogger());
service1.CreateReport();

var service2 = new ReportService(new ConsoleLogger());
service2.CreateReport();
```

Artık:

* ReportService **detaya bağlı değil**

* Yeni logger eklemek için ReportService'e dokunmuyorsun

* DIP ✔, OCP ✔

---

# 6️⃣ Kısacık Özet

> **DIP: Üst seviye kod detaya değil, interface'e bağımlı olsun.

> Detay (FileLogger) interface'i uygulasın.

> Böylece esnek, test edilebilir, değişime dayanıklı bir yapı elde edilir.**

---








