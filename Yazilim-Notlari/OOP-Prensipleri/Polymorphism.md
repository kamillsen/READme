# 🧩 OOP – Polymorphism (Çok Biçimlilik) – Özet Not (C#)

## 1️⃣ Polymorphism nedir? (Kısacık tanım)

**Polymorphism = Aynı referans tipiyle (değişken tipiyle) konuşuyorsun, ama gerçek nesnenin tipine göre farklı davranış sergileniyor.**

**Daha açık:**
* **Aynı referans:** Değişkenin tipi aynı (örneğin `Animal`)
* **Gerçek nesne:** Bellekteki gerçek nesne farklı olabilir (`Dog`, `Cat`, `Bird`)
* **Farklı davranış:** Her gerçek nesne kendi versiyonunu çalıştırır

**Örnek:**

```csharp
Animal a1 = new Dog();  // Değişken: Animal, Gerçek nesne: Dog
Animal a2 = new Cat();  // Değişken: Animal, Gerçek nesne: Cat

a1.Speak(); // Dog'un versiyonu çalışır (gerçek nesne Dog olduğu için)
a2.Speak(); // Cat'in versiyonu çalışır (gerçek nesne Cat olduğu için)
```

**Açıklama:**
* `a1` ve `a2` → İkisi de `Animal` tipinde değişken (aynı referans tipi)
* Ama gerçek nesneler farklı: `a1` içinde `Dog`, `a2` içinde `Cat`
* `Speak()` çağrıldığında → Her biri kendi gerçek tipine göre davranır
* **Bu polymorphism!** ✅

---

## 2️⃣ Bu işin altyapısı: Inheritance + Upcasting

Şu üç şeye zaten OK olmamız lazım:

```csharp
public class Animal
{
    public void Eat() { }
}

public class Dog : Animal
{
    public void Bark() { }
}
```

* `Dog : Animal` → "Dog bir Animal'dır" ilişkisi
* `Animal animal = new Dog();` → upcasting (Dog'a Animal gözlüğü takmak)
* `animal` üzerinden sadece Animal'da olan üyeler görülür:

```csharp
animal.Eat();   // ✅
animal.Bark(); // ❌ (derleme hatası)
```

Polymorphism devreye girdiğinde sadece şunu değiştiriyoruz:

> "Animal'da tanımlı bir metodu, Dog ve Cat kendine göre yeniden yazsın,
> ama ben hep Animal tipiyle konuşayım."

---

## 3️⃣ virtual / override olmadan Polymorphism YOK

Şimdi kritik kısım:

```csharp
class Animal
{
    public void Speak()
    {
        Console.WriteLine("Animal speak");
    }
}

class Dog : Animal
{
    public void Speak()
    {
        Console.WriteLine("Dog bark");
    }
}
```

Kullanım:

```csharp
Animal a = new Dog();
Dog d = new Dog();

a.Speak(); // ❗ "Animal speak"
d.Speak(); // "Dog bark"
```

---

### 🔍 Bu Örnek Üzerinden Detaylı Açıklama

#### 1️⃣ Ne Oluyor?

```csharp
Animal a = new Dog();
```

**Bellekte:**
```
STACK:
a → 0x00AF12  (Animal tipinde değişken)

HEAP:
0x00AF12 → Dog nesnesi  (gerçek nesne Dog!)
```

**Önemli:** 
* Değişkenin tipi: `Animal`
* Gerçek nesne: `Dog`

---

#### 2️⃣ `a.Speak()` Çağrıldığında Ne Oluyor?

```csharp
a.Speak(); // ❗ "Animal speak" yazdırır
```

**C#'ın Mantığı (virtual/override YOK):**

1. C# önce değişkenin tipine bakar: `a` → `Animal` tipinde
2. `Animal` sınıfında `Speak()` metodu var mı? → ✅ Var
3. `Animal.Speak()` çalıştırılır → "Animal speak" yazdırır

**C# diyor ki:**
> "Ben değişkenin tipine bakarım (Animal mı, Dog mu?), 
> gerçek nesnenin tipine değil!"

**Görsel:**
```
a (Animal tipinde) → Animal.Speak() çalışır
                     ↓
                 "Animal speak"
```

**Sonuç:** Gerçek nesne `Dog` olsa bile, `Animal.Speak()` çalışır.

---

#### 3️⃣ `d.Speak()` Çağrıldığında Ne Oluyor?

```csharp
Dog d = new Dog();
d.Speak(); // "Dog bark" yazdırır
```

**C#'ın Mantığı:**

1. C# önce değişkenin tipine bakar: `d` → `Dog` tipinde
2. `Dog` sınıfında `Speak()` metodu var mı? → ✅ Var
3. `Dog.Speak()` çalıştırılır → "Dog bark" yazdırır

**Görsel:**
```
d (Dog tipinde) → Dog.Speak() çalışır
                  ↓
              "Dog bark"
```

---

#### 4️⃣ Neden Polymorphism YOK?

**Polymorphism = Aynı referans, farklı davranış (gerçek nesneye göre)**

Bu örnekte:
```csharp
Animal a = new Dog();
a.Speak(); // "Animal speak" → Gerçek nesne Dog ama Animal.Speak() çalıştı!
```

**Problem:**
* Gerçek nesne: `Dog`
* Çalışan metot: `Animal.Speak()` ❌
* İstenen: `Dog.Speak()` ✅

**Polymorphism olsaydı:**
* Gerçek nesne: `Dog`
* Çalışan metot: `Dog.Speak()` ✅ (gerçek nesneye göre)

---

#### 5️⃣ Bu Durumda Ne Var?

**Method Hiding (Metot Gizleme):**

```csharp
class Dog : Animal
{
    public void Speak()  // Animal'daki Speak()'i gizliyor
    {
        Console.WriteLine("Dog bark");
    }
}
```

**Ne Oluyor:**
* `Dog` sınıfında `Speak()` yazınca, `Animal`'daki `Speak()` gizleniyor
* Ama hangi metot çalışır? → **Değişkenin tipine göre** (Animal mı, Dog mu?)

**Sonuç:**
* `Animal a = new Dog(); a.Speak();` → `Animal.Speak()` çalışır
* `Dog d = new Dog(); d.Speak();` → `Dog.Speak()` çalışır

**Polymorphism YOK çünkü:** Gerçek nesneye göre değil, değişken tipine göre çalışıyor.

---

### 📊 Karşılaştırma Tablosu

| Durum | Değişken Tipi | Gerçek Nesne | Çalışan Metot | Polymorphism? |
|-------|---------------|--------------|---------------|---------------|
| `Animal a = new Dog(); a.Speak();` | `Animal` | `Dog` | `Animal.Speak()` | ❌ YOK |
| `Dog d = new Dog(); d.Speak();` | `Dog` | `Dog` | `Dog.Speak()` | - |

**Özet:**
* `virtual`/`override` yok → Polymorphism yok
* Metot seçimi → Değişken tipine göre (gerçek nesneye göre değil)
* Bu durumda sadece **method hiding** var

---

## 4️⃣ Polymorphism için gereken sihir: virtual + override

Şimdi aynı örneği doğru şekilde yazalım:

```csharp
class Animal
{
    public virtual void Speak()  // ✅ virtual eklendi
    {
        Console.WriteLine("Animal speak");
    }
}

class Dog : Animal
{
    public override void Speak()  // ✅ override eklendi
    {
        Console.WriteLine("Dog bark");
    }
}

class Cat : Animal
{
    public override void Speak()
    {
        Console.WriteLine("Cat meow");
    }
}
```

Kullanım:

```csharp
Animal a1 = new Dog();
Animal a2 = new Cat();
Dog d = new Dog();

a1.Speak(); // "Dog bark"  ✅ Polymorphism çalışıyor!
a2.Speak(); // "Cat meow"  ✅ Polymorphism çalışıyor!
d.Speak();  // "Dog bark"
```

---

### 🔍 Aynı Örnek Üzerinden Polymorphism Nasıl Çalışıyor?

#### 1️⃣ `virtual` Ne Yapıyor?

```csharp
public virtual void Speak()
```

**`virtual` = "Bu metot override edilebilir, polymorphism'e dahil"**

C#'a diyor ki:
> "Bu metodu çağırırken, değişkenin tipine değil, 
> **gerçek nesnenin tipine** bak!"

---

#### 2️⃣ `a1.Speak()` Çağrıldığında Ne Oluyor? (Polymorphism ile)

```csharp
Animal a1 = new Dog();
a1.Speak(); // "Dog bark" ✅
```

**Bellekte:**
```
STACK:
a1 → 0x00AF12  (Animal tipinde değişken)

HEAP:
0x00AF12 → Dog nesnesi  (gerçek nesne Dog!)
```

**C#'ın Mantığı (virtual/override VAR):**

1. C# `a1.Speak()` çağrısını görür
2. `Animal` sınıfında `Speak()` var mı? → ✅ Var
3. `Speak()` `virtual` mı? → ✅ Evet!
4. **Polymorphism devreye girer:** Gerçek nesnenin tipine bak → `Dog`
5. `Dog` sınıfında `Speak()` override edilmiş mi? → ✅ Evet
6. `Dog.Speak()` çalıştırılır → "Dog bark" yazdırır ✅

**Görsel:**
```
a1 (Animal tipinde) 
    ↓
Gerçek nesne: Dog
    ↓
virtual Speak() → Gerçek nesneye bak → Dog
    ↓
Dog.Speak() çalışır
    ↓
"Dog bark"
```

**Sonuç:** Değişken `Animal` tipinde ama `Dog.Speak()` çalıştı! ✅ Polymorphism!

---

#### 3️⃣ Karşılaştırma: virtual YOK vs virtual VAR

**❌ virtual YOK (Önceki örnek):**
```csharp
class Animal { public void Speak() { } }
class Dog : Animal { public void Speak() { } }

Animal a = new Dog();
a.Speak(); // "Animal speak" ❌ (değişken tipine göre)
```

**✅ virtual VAR (Bu örnek):**
```csharp
class Animal { public virtual void Speak() { } }
class Dog : Animal { public override void Speak() { } }

Animal a = new Dog();
a.Speak(); // "Dog bark" ✅ (gerçek nesneye göre)
```

**Fark:**
| Durum | Metot Seçimi | Sonuç |
|-------|--------------|-------|
| `virtual` YOK | Değişken tipine göre | `Animal.Speak()` çalışır |
| `virtual` VAR | Gerçek nesneye göre | `Dog.Speak()` çalışır |

---

#### 4️⃣ `override` Ne Yapıyor?

```csharp
public override void Speak()
```

**`override` = "Bu metot, base sınıftaki virtual metodu geçersiz kılıyor"**

C#'a diyor ki:
> "Animal'daki virtual Speak() metodunu geçersiz kılıyorum,
> Dog için bu versiyon çalışsın!"

**Önemli:** `override` yazmadan `virtual` metodu geçersiz kılamazsın!

---

#### 5️⃣ Tam Örnek: Polymorphism Çalışıyor

```csharp
Animal a1 = new Dog();
Animal a2 = new Cat();
Animal a3 = new Animal();

a1.Speak(); // "Dog bark"   ✅ (gerçek nesne Dog)
a2.Speak(); // "Cat meow"   ✅ (gerçek nesne Cat)
a3.Speak(); // "Animal speak" ✅ (gerçek nesne Animal)
```

**Açıklama:**
* Hepsi `Animal` tipinde değişken
* Ama her biri kendi gerçek tipine göre davranıyor
* **Bu polymorphism!** ✅

---

### ✅ **Kritik Kural:**

> `virtual` OLMAZSA `override` EDEMEZSIN.
> `virtual` olmayan metot polymorphism'in parçası olamaz.

---

### 📊 Özet Karşılaştırma: Aynı Örnek Üzerinden

**❌ virtual/override YOK:**
```csharp
class Animal { public void Speak() { Console.WriteLine("Animal speak"); } }
class Dog : Animal { public void Speak() { Console.WriteLine("Dog bark"); } }

Animal a = new Dog();
a.Speak(); // "Animal speak" ❌
```

**✅ virtual/override VAR:**
```csharp
class Animal { public virtual void Speak() { Console.WriteLine("Animal speak"); } }
class Dog : Animal { public override void Speak() { Console.WriteLine("Dog bark"); } }

Animal a = new Dog();
a.Speak(); // "Dog bark" ✅
```

**Karşılaştırma:**

| Özellik | virtual YOK | virtual VAR |
|---------|-------------|-------------|
| **Metot seçimi** | Değişken tipine göre | Gerçek nesneye göre |
| **`Animal a = new Dog(); a.Speak();`** | `Animal.Speak()` çalışır | `Dog.Speak()` çalışır |
| **Polymorphism?** | ❌ YOK | ✅ VAR |
| **Ne var?** | Method hiding | Polymorphism |

**Sonuç:**
* `virtual`/`override` yok → Polymorphism yok, sadece method hiding
* `virtual`/`override` var → Polymorphism var, gerçek nesneye göre çalışır

---

Ek örnek:

```csharp
class Animal
{
    public void Run() { }           // ❌ override edilemez
    public virtual void Walk() { }  // ✅ override edilebilir
}

class Dog : Animal
{
    // public override void Run() { } // ❌ DERLEME HATASI
    public override void Walk() { }  // ✅ Dog'a gore davranis
}
```

---

## 5️⃣ Polymorphism olmadan kod nasıl olurdu?

Düşün ki bir sürü hayvan var:

```csharp
List<Animal> animals = new List<Animal>
{
    new Dog(),
    new Cat(),
    new Dog()
};
```

Polymorphism OLMASAYDI şöyle yazmaya zorlanırdın:

```csharp
foreach (var a in animals)
{
    if (a is Dog d)
        Console.WriteLine("Dog bark");
    else if (a is Cat c)
        Console.WriteLine("Cat meow");
    else
        Console.WriteLine("Unknown animal");
}
```

Yeni hayvan türü ekledikçe (Bird, Fish vs.)
→ if/else if zinciri uzar, her yere dokunman gerekir.

**Polymorphism ile:**

```csharp
foreach (var a in animals)
{
    a.Speak(); // hepsi kendi Speak'ini calistirir
}
```

Yeni Bird sınıfı eklemek için sadece:

```csharp
class Bird : Animal
{
    public override void Speak()
    {
        Console.WriteLine("Bird tweet");
    }
}
```

ve listeye eklemek yeterli:

```csharp
animals.Add(new Bird());
```

foreach koduna hiç dokunmazsın.

> Değişime açık (yeni tip), kullanıma kapalı (mevcut kod) ⇒ güzel tasarım.

---

## 6️⃣ Polymorphism + Upcasting ilişkisi

Polymorphism'in kalbi şu satırdır:

```csharp
Animal a = new Dog();
a.Speak();  // Dog'un Speak'i calisir (virtual/override sayesinde)
```

Burada arka planda olan cümle:

> "Ben a'ya Animal gözüyle bakıyorum ama
> Speak virtual olduğundan, nesnenin gerçek tipine (Dog) göre çalış."

Ama hala şunlar GEÇERLİ:

```csharp
a.Speak();  // ✅ (Animal'da tanimli ve override edilmis)
a.Eat();    // ✅ (Animal'da tanimli normal metod)
a.Bark();   // ❌ derleme hatasi, Animal Bark bilmiyor
```

Yani polymorphism:

* Method sayısını artırmaz → Animal'da ne varsa onları görebilirsin.
* Sadece o methodun hangi versiyonunun çalışacağını değiştirir.

---

## 🎯 Kısacık Özet (Akılda Kalsın)

* Polymorphism → Aynı referans, farklı davranış (nesnenin gerçek tipine göre).

* `virtual` + `override` olmadan polymorphism YOK.

* `virtual` olmayan metot `override` edilemez.

* Polymorphism sayesinde yeni tip eklemek kolay, mevcut kodu değiştirmene gerek yok.

* `Animal a = new Dog();` → `a` Animal tipinde ama `virtual` metodlar Dog versiyonunu çalıştırır.

* Polymorphism method sayısını artırmaz, sadece hangi versiyonun çalışacağını belirler.

---

## 🔥 Gerçek Proje Örneği: Email Service (E-ticaret Projelerinde Yaygın)

### Senaryo
E-ticaret projesinde sipariş alındığında müşteriye email göndermek istiyorsun. Ama email sağlayıcısı değişebilir (SMTP, SendGrid, Azure). Polymorphism sayesinde email servisini değiştirmek için sadece DI kaydını değiştirmen yeterli.

### Kod

```csharp
// Interface
public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

// Farklı implementasyonlar
public class SmtpEmailService : IEmailService
{
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // SMTP ile gerçek email gönder
        using var client = new SmtpClient("smtp.gmail.com", 587);
        // ... email gönder
    }
}

public class SendGridEmailService : IEmailService
{
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // SendGrid API ile email gönder
        var client = new SendGridClient(apiKey);
        // ... SendGrid ile gönder
    }
}

public class AzureEmailService : IEmailService
{
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // Azure Communication Services ile email gönder
        // ... Azure API çağrısı
    }
}

// Kullanım: OrderService (E-ticaret projelerinde çok yaygın)
public class OrderService
{
    private readonly IEmailService _emailService; // Polymorphism!
    
    public OrderService(IEmailService emailService)
    {
        _emailService = emailService;
    }
    
    public async Task PlaceOrderAsync(Order order)
    {
        // Sipariş kaydet
        await _orderRepository.AddAsync(order);
        
        // Müşteriye email gönder (hangi email servisi gelirse onu kullanır)
        await _emailService.SendEmailAsync(
            order.CustomerEmail,
            "Siparişiniz Alındı",
            $"Sipariş numaranız: {order.OrderNumber}"
        );
    }
}

// Program.cs (ASP.NET Core)
services.AddScoped<IEmailService, SmtpEmailService>(); 
// veya
services.AddScoped<IEmailService, SendGridEmailService>();
// veya
services.AddScoped<IEmailService, AzureEmailService>();
```

### Polymorphism Nasıl Çalışıyor?

1. **OrderService** → `IEmailService` interface'ini kullanıyor (polymorphism!)
2. **DI Container** → Hangi implementasyonu kaydettiysen onu inject ediyor
3. **Çalışma zamanında** → Gerçek nesne tipine göre (`SmtpEmailService`, `SendGridEmailService`, vb.) ilgili metot çalışıyor

### Avantajlar

* ✅ Email sağlayıcısı değiştiğinde sadece `Program.cs`'te DI kaydını değiştirirsin
* ✅ `OrderService` koduna hiç dokunmazsın
* ✅ Test için `FakeEmailService` yazıp kullanabilirsin
* ✅ Yeni email sağlayıcısı eklemek kolay (sadece yeni class yaz, DI'ye kaydet)
