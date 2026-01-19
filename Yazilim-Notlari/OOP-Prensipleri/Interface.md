# 🔌 Interface (Arayüz) – Mantık, Felsefe ve Projelerdeki Kullanım (C#)

## Interface Nedir? – En Sade Tanım

**Interface = "Bu işi yapabilen bir şeyin uyması gereken kurallar"**

* *Nasıl yapılacağını söylemez*
* *Hangi metotların olacağını söyler*

> "Beni kullanan kod, bunun nasıl çalıştığını bilmek zorunda değil."

---

## 🎯 Interface Neden Ortaya Çıktı? Felsefesi Ne?

Interface'in çıkış motivasyonu şu basit probleme dayanır: **Kodun "ne yaptığı" ile "nasıl yaptığı"nı ayırmak.**

Yani "şu işi yapabilen bir şey istiyorum" dersin (kontrat), ama onun sınıfı A mı B mi, veritabanı mı dosya mı, gerçek servis mi mock mu, bilmene gerek kalmaz.

### Felsefi Temel

Bunu sağlayan felsefe:

* **Sözleşme (contract) fikri:** "Bu tip şu metotları kesin sunar."
* **Bağımlılıkları soyutlama:** Sınıflar birbirinin *somut* haline değil, *soyut* tanımına bağlanır.
* **Değişime dayanıklılık:** Implementasyon değişir, ama interface aynı kaldıkça kullanan kod kırılmaz.
* **Yerine geçebilirlik:** Aynı interface'i uygulayan farklı sınıfları birbirinin yerine takabilirsin.

### Gerçek Hayattan Benzetme

**Restoran Menüsü Örneği:**

* **Menü (Interface):** "Bu restoranda şu yemekler var" → `IOrderable`
* **Mutfak (Implementasyon):** Yemeği nasıl yaptığını bilmene gerek yok
* **Garson (Kullanan kod):** Sadece menüye bakar, "ne var?" bilir, "nasıl yapılıyor?" bilmez

**Elektrik Priz Örneği:**

* **Priz (Interface):** "220V, 3 pin" → `IPowerSource`
* **Elektrik santrali (Implementasyon):** Nasıl üretildiğini bilmene gerek yok
* **Cihaz (Kullanan kod):** Sadece prizin standardına uygun, nasıl üretildiği önemli değil

---

## Interface Bize Ne Sağlar?

### 1) Gevşek Bağlılık (Loose Coupling)

Bir sınıf, "SQLRepository"ye değil "IRepository"ye bağımlı olur. Böylece veri kaynağı değişince her yer patlamaz.

### 2) Test Edilebilirlik

Gerçek ödeme servisi yerine testte "FakePaymentService" takarsın.
Unit test "dış dünya"ya (DB, HTTP, dosya) bağlanmadan çalışır.

### 3) Değiştirilebilirlik / Genişletilebilirlik

Yeni bir implementasyon eklemek, çoğu zaman mevcut kodu değiştirmeden mümkün olur (Open/Closed Principle'a yaklaşır).

### 4) Takım Çalışması ve Sınırların Netleşmesi

Ekip "interface" üzerinde anlaşır: biri implementasyonu yazar, diğeri interface'e göre kullanan tarafı geliştirir.

---

## 1️⃣ Gevşek Bağlılık (Loose Coupling)

### ❌ Problem (interface yokken)

```csharp
public class UserService
{
    private SqlUserRepository _repo = new SqlUserRepository();

    public string GetUserName(int id)
    {
        return _repo.GetById(id).Name;
    }
}
```

### Neden kötü?

* `UserService` **SQL'e göbekten bağlı**
* Yarın "MongoDB'ye geçiyoruz" denirse:
  * Bu sınıf **değişmek zorunda**
* Değişim → risk → hata

---

### ✅ Çözüm (interface ile)

#### 1. Kuralı tanımla

```csharp
public interface IUserRepository
{
    User GetById(int id);
}
```

#### 2. SQL implementasyonu

```csharp
public class SqlUserRepository : IUserRepository
{
    public User GetById(int id)
        => new User(id, "Ahmet");
}
```

#### 3. Kullanıcı servisi

```csharp
public class UserService
{
    private readonly IUserRepository _repo;

    public UserService(IUserRepository repo)
    {
        _repo = repo;
    }

    public string GetUserName(int id)
        => _repo.GetById(id).Name;
}
```

#### 4. Kullanım (Hangi implementasyon çalışacak?)

**Manuel olarak (basit kullanım):**

```csharp
// SqlUserRepository'yi manuel olarak veriyoruz
var sqlRepo = new SqlUserRepository();
var userService = new UserService(sqlRepo);  // SqlUserRepository çalışır

// Veya MongoRepository'yi veriyoruz
var mongoRepo = new MongoUserRepository();
var userService2 = new UserService(mongoRepo);  // MongoUserRepository çalışır
```

**Dependency Injection Container ile (ASP.NET Core):**

```csharp
// Startup.cs veya Program.cs'de kayıt
services.AddScoped<IUserRepository, SqlUserRepository>();
// "IUserRepository isteyenlere SqlUserRepository ver" diyoruz

// Controller veya başka bir serviste
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    // DI Container otomatik olarak SqlUserRepository'yi enjekte eder
    public UserController(UserService userService)
    {
        _userService = userService;
    }
}
```

> **Özet:** `UserService` hangi implementasyonu kullanacağını **bilmez**. Ona **dışarıdan** (manuel veya DI Container ile) hangi implementasyonu kullanacağı **söylenir**. Bu sayede esnek ve test edilebilir kod yazmış oluruz.

### 🎯 Fayda

* `UserService` **SQL bilmiyor**
* Sadece "kullanıcı getirebilen bir şey" biliyor
* Veri kaynağı değişse bile bu sınıf **değişmeyebilir**

### 📐 Uygulanan Prensipler

* **Loose Coupling**
* **Dependency Inversion Principle (DIP)**
  > "Üst seviye modüller, alt seviye modüllere değil, soyutlamalara bağlı olmalı"

---

## 2️⃣ Test Edilebilirlik

### ❌ Problem (interface yokken test yapmak zor)

```csharp
public class OrderService
{
    private readonly SmtpEmailSender _emailSender = new();

    public void PlaceOrder()
    {
        _emailSender.Send("a@b.com");
    }
}
```

**Test yazmaya çalışırsan:**

```csharp
[Test]
public void PlaceOrder_ShouldSendEmail()
{
    var orderService = new OrderService();
    orderService.PlaceOrder();
    
    // ❌ Sorun: Gerçek mail gönderildi mi kontrol edemiyoruz
    // ❌ Sorun: Test için gerçek SMTP sunucusu gerekli
    // ❌ Sorun: Network bağlantısı olmalı
    // ❌ Sorun: Test çok yavaş (gerçek mail gönderimi)
}
```

**Neden kötü?**
* Testte **gerçek mail** gönderilir (istenmeyen mail spam)
* SMTP sunucusu çalışmalı
* Network bağlantısı olmalı
* Test **yavaş** (gerçek mail gönderimi zaman alır)
* Test **kırılgan** (SMTP sunucusu down olursa test başarısız)

---

### ✅ Çözüm (interface ile fake kullanmak)

**Fikir:** Testte gerçek mail göndermek yerine, "sahte" bir mail gönderici kullan.

#### 1. Interface tanımla

```csharp
public interface IEmailSender
{
    void Send(string to);
}
```

#### 2. Gerçek implementasyon (production'da kullanılacak)

```csharp
public class SmtpEmailSender : IEmailSender
{
    public void Send(string to)
    {
        // Gerçek SMTP ile mail gönderir
        // Network, sunucu, vs. gerekir
    }
}
```

#### 3. Fake implementasyon (test için)

```csharp
public class FakeEmailSender : IEmailSender
{
    public bool MailSent { get; private set; }  // Mail gönderildi mi?

    public void Send(string to)
    {
        MailSent = true;  // Sadece "gönderildi" işaretle, gerçek mail gönderme
    }
}
```

#### 4. Servis (interface kullanıyor)

```csharp
public class OrderService
{
    private readonly IEmailSender _emailSender;

    public OrderService(IEmailSender emailSender)
    {
        _emailSender = emailSender;  // Gerçek mi fake mi? Bilmiyor!
    }

    public void PlaceOrder()
    {
        _emailSender.Send("a@b.com");
    }
}
```

#### 5. Test (fake kullanıyor)

```csharp
[Test]
public void PlaceOrder_ShouldSendEmail()
{
    // Arrange: Fake mail gönderici oluştur
    var fakeEmailSender = new FakeEmailSender();
    var orderService = new OrderService(fakeEmailSender);  // Fake'i ver

    // Act: Sipariş ver
    orderService.PlaceOrder();

    // Assert: Mail gönderildi mi kontrol et
    Assert.IsTrue(fakeEmailSender.MailSent);  // ✅ Hızlı, güvenilir
}
```

**Nasıl çalışıyor?**

1. **Production'da:**
   ```csharp
   var realSender = new SmtpEmailSender();
   var orderService = new OrderService(realSender);  // Gerçek mail gönderir
   ```

2. **Test'te:**
   ```csharp
   var fakeSender = new FakeEmailSender();
   var orderService = new OrderService(fakeSender);  // Sadece işaretler, mail göndermez
   ```

3. **`OrderService` fark etmez:** İkisinde de `IEmailSender` kullanıyor, hangisinin gerçek hangisinin fake olduğunu bilmiyor.

### 🎯 Fayda

* ✅ Testte **gerçek mail gönderilmez** (spam yok)
* ✅ **Hızlı** (network, SMTP beklemez)
* ✅ **Güvenilir** (dış bağımlılık yok)
* ✅ Sadece **`OrderService`'in davranışını** test ediyorsun (mail gönderildi mi?)

### 📐 Uygulanan Prensipler

* **Dependency Injection**
* **Single Responsibility Principle**
* **Testability**

---

## 3️⃣ Değiştirilebilirlik / Genişletilebilirlik

### ❌ Problem

```csharp
public class PaymentService
{
    public void PayWithCreditCard(decimal amount)
    {
        // kredi kartı
    }
}
```

### Neden kötü?

* Yeni ödeme türü gelirse:
  * Bu sınıf **şişer**
  * Sürekli `if/else` eklenir

---

### ✅ Çözüm (interface)

#### 1. Interface

```csharp
public interface IPaymentMethod
{
    void Pay(decimal amount);
}
```

#### 2. Kredi kartı

```csharp
public class CreditCardPayment : IPaymentMethod
{
    public void Pay(decimal amount) { }
}
```

#### 3. Havale

```csharp
public class BankTransferPayment : IPaymentMethod
{
    public void Pay(decimal amount) { }
}
```

#### 4. Ödeme işlemi

```csharp
public class CheckoutService
{
    private readonly IPaymentMethod _payment;

    public CheckoutService(IPaymentMethod payment)
    {
        _payment = payment;
    }

    public void Checkout(decimal total)
    {
        _payment.Pay(total);
    }
}
```

#### 5. Kullanım (Hangi ödeme yöntemi çalışacak?)

**Manuel olarak (kullanıcı seçimi):**

```csharp
// Kullanıcı kredi kartı seçti
var creditCardPayment = new CreditCardPayment();
var checkoutService = new CheckoutService(creditCardPayment);
checkoutService.Checkout(100);  // Kredi kartı ile ödeme

// Kullanıcı havale seçti
var bankTransfer = new BankTransferPayment();
var checkoutService2 = new CheckoutService(bankTransfer);
checkoutService2.Checkout(100);  // Havale ile ödeme
```

**Dependency Injection Container ile (ASP.NET Core):**

```csharp
// Program.cs veya Startup.cs'de kayıt
// Kullanıcının seçimine göre dinamik olarak belirlenebilir
services.AddScoped<IPaymentMethod, CreditCardPayment>();
// veya
services.AddScoped<IPaymentMethod, BankTransferPayment>();

// Controller'da
public class CheckoutController : ControllerBase
{
    private readonly CheckoutService _checkoutService;

    // DI Container otomatik olarak kayıtlı ödeme yöntemini enjekte eder
    public CheckoutController(CheckoutService checkoutService)
    {
        _checkoutService = checkoutService;
    }
}
```

**Kullanıcı seçimine göre dinamik kullanım:**

```csharp
public class PaymentService
{
    public void ProcessPayment(string paymentType, decimal amount)
    {
        IPaymentMethod paymentMethod;

        // Kullanıcının seçimine göre hangi implementasyonu kullanacağını belirle
        if (paymentType == "creditcard")
        {
            paymentMethod = new CreditCardPayment();
        }
        else if (paymentType == "banktransfer")
        {
            paymentMethod = new BankTransferPayment();
        }
        else
        {
            throw new ArgumentException("Geçersiz ödeme yöntemi");
        }

        // CheckoutService'e hangi ödeme yöntemini kullanacağını söyle
        var checkoutService = new CheckoutService(paymentMethod);
        checkoutService.Checkout(amount);
    }
}
```

> **Özet:** `CheckoutService` hangi ödeme yöntemini kullanacağını **bilmez**. Ona **dışarıdan** (kullanıcı seçimi, manuel veya DI Container ile) hangi implementasyonu kullanacağı **söylenir**. Bu sayede yeni ödeme yöntemi eklemek kolay: sadece yeni bir class yazarsın, `CheckoutService`'e dokunmazsın.

### 🎯 Fayda

* Yeni ödeme türü eklemek = **yeni class**
* Eski kodu bozmazsın

### 📐 Uygulanan Prensipler

* **Open/Closed Principle**
* **Polymorphism**

---

## 4️⃣ Takım Çalışması ve Sınırların Netleşmesi

### Senaryo

* Kişi A: API yazıyor
* Kişi B: Kargo hesaplama yazıyor

### Ortak sözleşme

```csharp
public interface IShippingCalculator
{
    decimal Calculate(decimal weight);
}
```

### A kişi (beklemeden çalışır)

```csharp
public class FakeShippingCalculator : IShippingCalculator
{
    public decimal Calculate(decimal weight) => 100;
}
```

### B kişi (gerçek hesabı yazar)

```csharp
public class ShippingCalculator : IShippingCalculator
{
    public decimal Calculate(decimal weight)
        => 50 + weight * 10;
}
```

### 🎯 Fayda

* Paralel çalışma
* Net sınırlar
* Daha az çakışma

### 📐 Uygulanan Prensipler

* **Interface Segregation**
* **Separation of Concerns**

---

## 5️⃣ Interface Implementasyon Kuralları

### Klasik Kural (Gövdesiz Metotlar)

```csharp
public interface IAnimal
{
    void Speak();  // gövdesiz → zorunlu implement et
    void Eat();    // gövdesiz → zorunlu implement et
}
```

**Implement eden sınıf, TÜM metotları yazmak zorundadır:**

```csharp
public class Dog : IAnimal
{
    public void Speak()  // ✅ Zorunlu
    {
        Console.WriteLine("Hav!");
    }

    public void Eat()    // ✅ Zorunlu
    {
        Console.WriteLine("Mama yiyor.");
    }
}
```

> **Kural:** Interface'te gövdesiz olan her metot, implement eden sınıfta **mutlaka yazılmalı**.

---

### Modern C# 8+ (Default Implementation)

C# 8.0'dan itibaren interface içinde **gövdesi olan metot** da olabilir:

```csharp
public interface IAnimal
{
    void Speak();  // gövdesiz → zorunlu

    void Eat()     // gövdesi var → default implementation
    {
        Console.WriteLine("Default olarak yemek yiyor.");
    }
}
```

**Implement eden sınıf:**

```csharp
public class Dog : IAnimal
{
    public void Speak()  // ✅ Zorunlu
    {
        Console.WriteLine("Hav!");
    }

    // Eat'i yazmak zorunda değil.
    // Yazmazsa interface'in default Eat'i çalışır.
    // İstersen override edebilirsin:
    
    // public void Eat()
    // {
    //     Console.WriteLine("Köpek maması yiyor.");
    // }
}
```

**Özet:**
* Gövdesiz metot → **zorunlu** implement et
* Gövdesi olan metot → **opsiyonel** (istersen override et, istemezsen default kullan)

---

## 5.5️⃣ Interface Property Implementasyonu

Interface'te property tanımlanabilir (C# 8+). Implement eden sınıfta property'yi sağlaman gerekir.

### Interface'te Property Tanımlama

```csharp
public interface IAnimal
{
    // ✅ Property olabilir (sözleşme)
    string Name { get; set; }  // "Name property'si olmalı" diyor
    
    // ✅ Sadece get olabilir (read-only)
    int Age { get; }  // "Age property'si olmalı (read-only)" diyor
    
    // ❌ Field olamaz
    // int age;  // Derleme hatası!
}
```

### Implement Edilen Sınıfta Kullanım

#### Örnek 1: Auto-Implemented Property

```csharp
public class Dog : IAnimal
{
    // ✅ Auto-implemented property (C# otomatik field oluşturur)
    public string Name { get; set; }  // Interface'teki property'yi implement ediyor
    
    // ✅ Read-only property (sadece get)
    public int Age { get; }  // Interface'teki property'yi implement ediyor
    
    // Constructor'da Age set edilir
    public Dog(string name, int age)
    {
        Name = name;
        Age = age;  // Constructor'da set edilebilir
    }
    
    public void Speak()
    {
        Console.WriteLine($"{Name} havladı!");
    }
}

// Kullanım
var dog = new Dog("Karabaş", 3);
Console.WriteLine(dog.Name);  // "Karabaş" - get çalışır
dog.Name = "Yeni İsim";       // set çalışır
Console.WriteLine(dog.Age);   // 3 - get çalışır
// dog.Age = 5;  // ❌ Hata! Age read-only (set yok)
```

#### Örnek 2: Manuel Property (Field ile)

```csharp
public class Cat : IAnimal
{
    // Private field (arka planda)
    private string _name;
    private int _age;
    
    // ✅ Property implementasyonu (manuel)
    public string Name
    {
        get { return _name; }      // Field'dan değer al
        set { _name = value; }     // Field'a değer set et
    }
    
    // ✅ Read-only property implementasyonu
    public int Age
    {
        get { return _age; }        // Sadece get var
        // set yok - read-only
    }
    
    public Cat(string name, int age)
    {
        _name = name;  // Field'a direkt atama
        _age = age;    // Field'a direkt atama
    }
    
    public void Speak()
    {
        Console.WriteLine($"{Name} miyavladı!");
    }
}
```

#### Örnek 3: Property ile Validation

```csharp
public class Bird : IAnimal
{
    private string _name;
    private int _age;
    
    // ✅ Property ile validation
    public string Name
    {
        get { return _name; }
        set 
        { 
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("İsim boş olamaz");
            _name = value; 
        }
    }
    
    // ✅ Read-only property
    public int Age
    {
        get { return _age; }
    }
    
    public Bird(string name, int age)
    {
        Name = name;  // Property kullanıyoruz (validation çalışır)
        _age = age;   // Field'a direkt (constructor'da)
    }
}
```

### Field vs Property Farkı

| Özellik | Field | Property |
|---------|-------|----------|
| **Ne?** | Direkt değişken | Field'a erişim wrapper'ı |
| **Interface'te?** | ❌ Olamaz | ✅ Olabilir (C# 8+) |
| **Kullanım** | `int age;` | `int Age { get; set; }` |

**Özet:**
* **Field:** Direkt değişken, interface'te olamaz
* **Property:** Field'a erişim sağlar, interface'te olabilir (sözleşme olarak)
* Interface'teki property, implement eden sınıfta normal property gibi kullanılır

---

## 6️⃣ Çoklu Interface Implementasyonu

C#'ta bir sınıf **birden fazla interface** implement edebilir:

```csharp
public interface IFlyable
{
    void Fly();
}

public interface ISwimmable
{
    void Swim();
}

public class Duck : IFlyable, ISwimmable
{
    public void Fly()
    {
        Console.WriteLine("Ördek uçuyor.");
    }

    public void Swim()
    {
        Console.WriteLine("Ördek yüzüyor.");
    }
}
```

**Kullanım:**

```csharp
var duck = new Duck();

IFlyable flyable = duck;
flyable.Fly();

ISwimmable swimmable = duck;
swimmable.Swim();
```

**Fayda:**
* Bir sınıf birden fazla **rol** üstlenebilir
* Farklı hiyerarşilerden sınıflar ortak davranış paylaşabilir

---

## 6.5️⃣ Interface: "Can-do" İlişkisi (Yapabilirlik)

**Önemli Fark:** Interface implement eden sınıflar **akraba olmak zorunda değil**. Interface **"yapabilirlik" (Can-do)** ilişkisi kurar, **"tür" (Is-a)** ilişkisi değil.

### "Can-do" İlişkisi Ne Demek?

**Interface = "Bu işi yapabilir" demektir**

```csharp
public interface IFlyable
{
    void Fly();
}

// Farklı hiyerarşilerden sınıflar aynı interface'i implement edebilir
public class Bird : Animal, IFlyable  // Animal hiyerarşisinden
{
    public void Fly() { }
}

public class Airplane : Vehicle, IFlyable  // Vehicle hiyerarşisinden
{
    public void Fly() { }
}

// Bird ve Airplane akraba değil ama ikisi de IFlyable
```

**Ne demek?**
- `Bird : IFlyable` → "Bird uçabilir" (yapabilirlik)
- `Airplane : IFlyable` → "Airplane uçabilir" (yapabilirlik)
- İkisi de farklı hiyerarşilerden ama ikisi de uçabilir

### Tür İlişkisi Var mı?

**Evet, ama "yapabilirlik" türü:**

```csharp
public interface IAnimal
{
    void Speak();
}

public class Dog : IAnimal
{
    public void Speak() { }
}
```

**Tür ilişkisi:**
- `Dog : IAnimal` → Dog bir IAnimal'dır ✅
- `IAnimal animal = new Dog();` → Çalışır (upcasting) ✅
- `animal.Speak();` → Dog.Speak() çalışır (polymorphism) ✅

**Ama fark:**
- "Dog bir IAnimal'dır" = "Dog, IAnimal yapabilir" (yapabilirlik türü)
- "Dog bir Animal'dır" değil (gerçek tür değil)

### Pratik Örnek

```csharp
public interface ILogger
{
    void Log(string message);
}

// Farklı hiyerarşilerden sınıflar aynı interface'i implement edebilir
public class ConsoleLogger : ILogger  // Logger hiyerarşisinden
{
    public void Log(string message) { Console.WriteLine(message); }
}

public class DatabaseLogger : ILogger  // Logger hiyerarşisinden
{
    public void Log(string message) { /* DB'ye yaz */ }
}

// Hepsi ILogger olarak kullanılabilir
ILogger logger1 = new ConsoleLogger();    // ✅ Çalışır
ILogger logger2 = new DatabaseLogger();   // ✅ Çalışır

// Polymorphism çalışır
logger1.Log("Test");  // ConsoleLogger.Log() çalışır
logger2.Log("Test");  // DatabaseLogger.Log() çalışır
```

**Neden?**

* **Interface:** Sadece sözleşme/rol
* **State içermez**
* **Farklı hiyerarşilerden sınıflar aynı rolü üstlenebilir**
* **Birden fazla interface implement edilebilir**
* **"Can-do" ilişkisi:** "Bu işi yapabilir" demektir

**Özet:**

| Özellik | Interface |
|--------|-----------|
| **İlişki türü** | "Can-do" (yapabilirlik) |
| **Tür ilişkisi var mı?** | ✅ Evet (yapabilirlik türü) |
| **Gerçek tür ilişkisi var mı?** | ❌ Hayır |
| **Akraba olmak zorunda mı?** | ❌ Hayır |
| **Farklı hiyerarşilerden kullanım** | ✅ Var |
| **Örnek** | `Bird : Animal, IFlyable` (Bird uçabilir) |

> **Not:** Abstract Class'ta "Is-a" (gerçek tür) ilişkisi vardır. Detay için `Abstract-Class.md` dosyasına bakabilirsin.

---

## 7️⃣ .NET Ortamından Net Bir Örnek

Diyelim ki ödeme alıyorsun:

```csharp
public interface IPaymentGateway
{
    Task<bool> ChargeAsync(decimal amount, string currency);
}
```

Gerçekte Stripe kullanırsın:

```csharp
public class StripePaymentGateway : IPaymentGateway
{
    public async Task<bool> ChargeAsync(decimal amount, string currency)
    {
        // Stripe API çağrısı...
        return true;
    }
}
```

Testte sahte bir gateway:

```csharp
public class FakePaymentGateway : IPaymentGateway
{
    public Task<bool> ChargeAsync(decimal amount, string currency)
        => Task.FromResult(true);
}
```

Bu gateway'i kullanan servis:

```csharp
public class CheckoutService
{
    private readonly IPaymentGateway _paymentGateway;

    public CheckoutService(IPaymentGateway paymentGateway)
    {
        _paymentGateway = paymentGateway;
    }

    public Task<bool> CheckoutAsync(decimal total)
        => _paymentGateway.ChargeAsync(total, "TRY");
}
```

### Buradaki kazanç ne?

* `CheckoutService` **Stripe'a bağımlı değil** → sadece `IPaymentGateway` biliyor.
* Yarın Stripe yerine başka sağlayıcıya geçsen, `CheckoutService` değişmeyebilir.
* Unit testte `FakePaymentGateway` ile hızlı ve güvenilir test yazarsın.

### ASP.NET Core DI ile Kullanım

```csharp
// Startup.cs veya Program.cs
public void ConfigureServices(IServiceCollection services)
{
    // Production'da gerçek Stripe
    services.AddScoped<IPaymentGateway, StripePaymentGateway>();
    
    // Test'te fake
    // services.AddScoped<IPaymentGateway, FakePaymentGateway>();
}
```

Bu aynı zamanda .NET'in DI (Dependency Injection) yaklaşımıyla da çok iyi oturur.

---

## 8️⃣ Interface vs Abstract Class (Kısa Karşılaştırma)

| Özellik | Interface | Abstract Class |
|--------|-----------|----------------|
| **New'lenebilir mi?** | ❌ Hayır | ❌ Hayır |
| **Gövdesi olan metot** | ✅ Var (C# 8+, default) | ✅ Var (normal metot) |
| **Gövdesiz metot** | ✅ Var (klasik) | ✅ Var (`abstract` metot) |
| **Field/Property** | ❌ Yok (property olabilir ama field yok) | ✅ Var |
| **Constructor** | ❌ Yok | ✅ Var |
| **Çoklu miras** | ✅ Birden fazla interface | ❌ Tek base class |
| **Ortak kod/state** | ❌ Sadece sözleşme | ✅ Ortak kod ve state tutabilir |

**Ne zaman Interface?**
* Sadece davranış tanımlamak istiyorsan
* Birden fazla rol vermek istiyorsan
* Farklı hiyerarşilerden sınıflar ortak davranış paylaşacaksa

**Ne zaman Abstract Class?**
* Ortak kod ve state varsa
* Gerçek bir "üst tür" modellemek istiyorsan

> **Not:** Detaylı karşılaştırma için `Interface-vs-Abstract-Class.md` dosyasına bakabilirsin.

---

## 9️⃣ Interface Kullanım Senaryoları

### Senaryo 1: Repository Pattern

```csharp
public interface IRepository<T>
{
    T GetById(int id);
    void Save(T entity);
    void Delete(int id);
}

public class SqlRepository<T> : IRepository<T> { }
public class MongoRepository<T> : IRepository<T> { }
```

### Senaryo 2: Strategy Pattern

```csharp
public interface ISortStrategy
{
    void Sort(int[] array);
}

public class QuickSort : ISortStrategy { }
public class MergeSort : ISortStrategy { }
```

### Senaryo 3: Observer Pattern

```csharp
public interface IObserver
{
    void Update(string message);
}

public interface ISubject
{
    void Attach(IObserver observer);
    void Notify();
}
```

---

## 🔟 Interface İsimlendirme Kuralları

C#'ta interface'ler genellikle **"I" ile başlar**:

```csharp
public interface IUserRepository { }  // ✅ Doğru
public interface UserRepository { }   // ❌ Yanlış (class gibi görünür)
```

**Neden?**
* Kod okunabilirliği
* Interface ile class'ı ayırt etmek kolay
* .NET standartlarına uygun

---

## 🧠 Kafada Kalacak Özet

> **Interface = "Benimle çalışmak istiyorsan şu kurallara uyacaksın" demektir.**

Bize şunları sağlar:

* 🔹 Daha az bağımlılık
* 🔹 Daha kolay test
* 🔹 Daha güvenli değişiklik
* 🔹 Daha temiz mimari

**Bir cümlede öz:**

**Interface, "kullanım" tarafını "uygulama" detaylarından ayırıp, değişime dayanıklı, test edilebilir ve esnek bir mimari kurmayı sağlar.**

---

## 🎯 Kısacık Özet (Akılda Kalsın)

* Interface = Sözleşme (contract), "ne yapıyor?" tanımlar, "nasıl yapıyor?" tanımlamaz.

* Interface'te gövdesiz metot → implement eden sınıfta **zorunlu** yazılmalı.

* Interface'te gövdesi olan metot (C# 8+) → implement eden sınıfta **opsiyonel**.

* Bir sınıf **birden fazla interface** implement edebilir.

* Interface isimleri genellikle **"I" ile başlar** (`IUserRepository`).

* Interface, gevşek bağlılık, test edilebilirlik ve esneklik sağlar.

* Kodu **somut sınıflara** değil, **soyut sözleşmelere** bağlar.
