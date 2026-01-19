# 🧩 Abstract Class (Soyut Sınıf) – Özet Not (C#)

## 1️⃣ Abstraction fikri – Temel mantık

**Tek cümlelik tanım:**

> **Abstraction = Gereksiz detayı sakla, dışarıya sadece gerekli yüzü (sözleşmeyi) göster.**

> Yani: **"Ne yapıyor?" önemli, "Nasıl yapıyor?" detay.**

---

### 🔍 Gerçek Hayattan Örnek: Araba

Araba kullanırken:

* **Senin gördüğün ve kullandığın:**
  * Gaz pedalı → hızlanmak için
  * Fren pedalı → yavaşlamak için
  * Direksiyon → yön vermek için

* **Görmediğin (saklanmış detaylar):**
  * Motorun içindeki pistonlar
  * Yakıt enjeksiyon sistemi
  * Fren balatalarının mekanizması

**Sen ne düşünürsün?**
> "Gaza basıyorum → hızlanıyorum"

**Sen ne düşünmezsin?**
> "Motor içinde piston hareket ediyor, yakıt yanıyor, güç üretiliyor..." → Bunları bilmene gerek yok!

**İşte bu abstraction'dır:** Karmaşık detayları saklayıp, sadece kullanman gereken arayüzü göstermek.

---

### 💻 Yazılımda Abstraction: Kod Örneği

#### ❌ Abstraction YOK (Kötü Örnek)

```csharp
// Her şeyi detayıyla bilmek zorundasın
public class UserService
{
    public void SaveUser(string name)
    {
        // Detaylar açıkta - her şeyi görüyorsun
        var connection = new SqlConnection("connection string...");
        connection.Open();
        var command = new SqlCommand("INSERT INTO Users...", connection);
        command.ExecuteNonQuery();
        connection.Close();
    }
}
```

**Problem:** 
* `UserService` SQL detaylarını biliyor
* Veritabanı değişirse kod patlar
* Test etmek zor (gerçek DB gerekir)

---

#### ✅ Abstraction VAR (İyi Örnek - Abstract Class ile)

```csharp
// Abstract Class = Hem ortak kod/state hem soyut sözleşme
public abstract class Animal
{
    // ✅ Ortak state (property) - Tüm hayvanlarda var
    public string Name { get; set; }
    public int Age { get; set; }
    
    // ✅ Ortak kod (somut metot) - Tüm hayvanlar aynı şekilde yemek yer
    public void Eat()
    {
        Console.WriteLine($"{Name} yemek yiyor.");
    }
    
    // ✅ Ortak kod (somut metot) - Tüm hayvanlar aynı şekilde uyur
    public void Sleep()
    {
        Console.WriteLine($"{Name} uyuyor.");
    }
    
    // ❌ Soyut metot - Her hayvan farklı konuşur, bu yüzden abstract
    // Her türeyen sınıf BUNU YAZMAK ZORUNDA
    public abstract void Speak();
}

// Köpek (Abstract Class'tan türüyor)
public class Dog : Animal
{
    // Sadece farklı olan kısmı yazıyoruz (Speak)
    public override void Speak()
    {
        Console.WriteLine($"{Name} havladı: Hav Hav!");
    }
    
    // Name, Age, Eat(), Sleep() → Hepsi Animal'dan geliyor, tekrar yazmıyoruz!
}

// Kedi (Abstract Class'tan türüyor)
public class Cat : Animal
{
    // Sadece farklı olan kısmı yazıyoruz (Speak)
    public override void Speak()
    {
        Console.WriteLine($"{Name} miyavladı: Miyav!");
    }
    
    // Name, Age, Eat(), Sleep() → Hepsi Animal'dan geliyor, tekrar yazmıyoruz!
}

// Kullanan kod
public class AnimalTrainer
{
    public void Train(Animal animal)  // Abstract class'a bağlı
    {
        // ✅ Ortak metotları kullanabilir (Animal'dan gelen)
        animal.Eat();
        animal.Sleep();
        
        // ✅ Her hayvan kendi Speak() metodunu çalıştırır (polymorphism)
        animal.Speak();
    }
}
```

**Kullanım:**

**Manuel olarak:**

```csharp
var dog = new Dog { Name = "Karabaş", Age = 3 };
var cat = new Cat { Name = "Mırmır", Age = 2 };

var trainer = new AnimalTrainer();
trainer.Train(dog);  // Karabaş yemek yiyor. → Karabaş uyuyor. → Karabaş havladı: Hav Hav!
trainer.Train(cat);  // Mırmır yemek yiyor. → Mırmır uyuyor. → Mırmır miyavladı: Miyav!
```

**Dependency Injection Container ile (ASP.NET Core):**

**Senaryo 1: Tek bir implementasyon kullanacaksan (En yaygın)**

```csharp
// Program.cs veya Startup.cs'de kayıt
// Sadece kullanacağın implementasyonu kaydet
services.AddScoped<Animal, Dog>();  // Animal isteyenlere Dog ver

// Controller'da
public class AnimalController : ControllerBase
{
    private readonly Animal _animal;  // DI Container Dog'u enjekte eder

    public AnimalController(Animal animal)
    {
        _animal = animal;  // Her zaman Dog gelir
    }
}
```

**Senaryo 2: Runtime'da hangisini kullanacağını bilmiyorsan (Factory Pattern)**

```csharp
// Program.cs - Her implementasyonu ayrı kaydet
services.AddScoped<Dog>();
services.AddScoped<Cat>();
services.AddScoped<Bird>();

// Factory interface
public interface IAnimalFactory
{
    Animal CreateAnimal(string animalType);
}

// Factory implementasyonu
public class AnimalFactory : IAnimalFactory
{
    private readonly IServiceProvider _serviceProvider;

    public AnimalFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public Animal CreateAnimal(string animalType)
    {
        return animalType switch
        {
            "dog" => _serviceProvider.GetRequiredService<Dog>(),
            "cat" => _serviceProvider.GetRequiredService<Cat>(),
            "bird" => _serviceProvider.GetRequiredService<Bird>(),
            _ => throw new ArgumentException("Geçersiz hayvan tipi")
        };
    }
}

// Factory'yi kaydet
services.AddScoped<IAnimalFactory, AnimalFactory>();

// Controller'da
public class AnimalController : ControllerBase
{
    private readonly IAnimalFactory _factory;

    public AnimalController(IAnimalFactory factory)
    {
        _factory = factory;
    }

    public IActionResult Train(string animalType)
    {
        var animal = _factory.CreateAnimal(animalType);  // Runtime'da belirlenir
        // animal kullan...
        return Ok();
    }
}
```

**Önemli Notlar:**

1. **Hepsini kaydetmek zorunda değilsin:** Sadece kullanacağın implementasyonu kaydedersin.
2. **Aynı abstract class için birden fazla kayıt:** Eğer aynı abstract class için birden fazla concrete class kaydedersen, son kayıt geçerli olur (override eder).
3. **Runtime seçimi:** Eğer runtime'da hangisini kullanacağını bilmiyorsan, Factory Pattern kullanırsın (yukarıdaki Senaryo 2).

**❓ Factory Pattern'i Ben Mi Yazmalıyım?**

**Cevap: Evet, sen yazmalısın.** DI Container otomatik yapmaz.

**Ama dikkat:** "Kedi verince miyav, köpek verince hav" zaten **polymorphism ile otomatik çalışıyor**! Factory Pattern'e gerek yok.

**Örnek (Factory Pattern olmadan):**

```csharp
// Program.cs - Sadece tek bir implementasyon kaydet
services.AddScoped<Animal, Dog>();  // veya Cat

// Controller'da
public class AnimalController : ControllerBase
{
    private readonly Animal _animal;

    public AnimalController(Animal animal)
    {
        _animal = animal;  // Dog veya Cat gelir
    }

    public IActionResult MakeSpeak()
    {
        _animal.Speak();  // ✅ Otomatik: Dog ise "Hav", Cat ise "Miyav"
        return Ok();
    }
}
```

**Polymorphism zaten çalışıyor:**
- `Dog` nesnesi → `Speak()` → "Hav Hav!"
- `Cat` nesnesi → `Speak()` → "Miyav!"

**Factory Pattern ne zaman gerekli?**

Sadece şu durumda: **Runtime'da kullanıcıdan veya başka bir kaynaktan gelen değere göre** hangi implementasyonu kullanacağını seçmen gerekiyorsa.

**Örnek:**
```csharp
// Kullanıcı "dog" veya "cat" yazıyor
public IActionResult Train(string animalType)  // animalType = "dog" veya "cat"
{
    // Burada Factory Pattern gerekli çünkü runtime'da seçim yapıyorsun
    var animal = _factory.CreateAnimal(animalType);
    animal.Speak();  // Polymorphism yine çalışıyor
    return Ok();
}
```

> **Özet:** 
> - **Polymorphism** (kedi miyav, köpek hav) → Otomatik çalışıyor, bir şey yapmana gerek yok ✅
> - **Factory Pattern** → Sadece runtime'da seçim yapman gerekiyorsa yazarsın (manuel) ⚙️
> - **DI Container** → Sadece kayıt yaparsın, Factory Pattern'i otomatik yapmaz ❌

**Abstract Class'ın Avantajı (Interface'ten Farkı):**

| Özellik | Abstract Class | Interface |
|--------|---------------|-----------|
| **Ortak state** | ✅ Var (`Name`, `Age`) | ❌ Yok |
| **Ortak kod** | ✅ Var (`Eat()`, `Sleep()`) | ❌ Yok (C# 8+ default implementation hariç) |
| **Soyut metot** | ✅ Var (`Speak()`) | ✅ Var |
| **Tekrar yazma** | ❌ Gerek yok (ortak kod base'de) | ✅ Her implementasyonda yazılmalı |

**Özet:**
* **Interface:** Sadece "ne yapıyor?" tanımlar, ortak kod yok → Her sınıf her şeyi yazmak zorunda
* **Abstract Class:** Hem "ne yapıyor?" tanımlar hem ortak kod/state var → Sadece farklı olanı yazarsın

---

## 1.5️⃣ Abstract Class: "Is-a" İlişkisi (Gerçek Tür)

**Önemli Kural:** Abstract class'tan miras alan sınıflar **akraba olmak zorunda**. Abstract Class **"gerçek tür" (Is-a)** ilişkisi kurar, **"yapabilirlik" (Can-do)** ilişkisi değil.

### "Is-a" İlişkisi Ne Demek?

**Abstract Class = "Bu gerçekten bir X'dir" demektir**

```csharp
public abstract class Animal
{
    public string Name { get; set; }
    public abstract void Speak();
}

// Sadece gerçekten Animal olan sınıflar miras alabilir
public class Dog : Animal  // ✅ Dog gerçekten bir Animal
{
    public override void Speak() { }
}

public class Cat : Animal  // ✅ Cat gerçekten bir Animal
{
    public override void Speak() { }
}

// ❌ Bu yapılamaz:
// public class Airplane : Animal  // Airplane bir Animal değil!
```

**Ne demek?**
- `Dog : Animal` → "Dog bir Animal'dır" (gerçek tür)
- `Cat : Animal` → "Cat bir Animal'dır" (gerçek tür)
- `Airplane : Animal` → Mantıksız! Airplane bir Animal değil ❌

### Tür İlişkisi Var mı?

**Evet, "gerçek tür" ilişkisi:**

```csharp
public abstract class Animal
{
    public abstract void Speak();
}

public class Dog : Animal
{
    public override void Speak() { }
}
```

**Tür ilişkisi:**
- `Dog : Animal` → Dog bir Animal'dır ✅
- `Animal animal = new Dog();` → Çalışır (upcasting) ✅
- `animal.Speak();` → Dog.Speak() çalışır (polymorphism) ✅

**Fark:**
- "Dog bir Animal'dır" = "Dog gerçekten bir Animal'dır" (gerçek tür)
- Sadece gerçekten Animal olan sınıflar miras alabilir

### Pratik Örnek

```csharp
public abstract class Shape
{
    public string Color { get; set; }
    public abstract double GetArea();
}

// Sadece gerçekten Shape olan sınıflar miras alabilir
public class Circle : Shape  // ✅ Circle gerçekten bir Shape
{
    public double Radius { get; set; }
    public override double GetArea() => Math.PI * Radius * Radius;
}

public class Rectangle : Shape  // ✅ Rectangle gerçekten bir Shape
{
    public double Width { get; set; }
    public double Height { get; set; }
    public override double GetArea() => Width * Height;
}

// Hepsi Shape olarak kullanılabilir
Shape shape1 = new Circle();      // ✅ Çalışır
Shape shape2 = new Rectangle();  // ✅ Çalışır

// Polymorphism çalışır
shape1.GetArea();  // Circle.GetArea() çalışır
shape2.GetArea();  // Rectangle.GetArea() çalışır
```

**Neden?**

* **Abstract Class:** Gerçek bir "üst tür" modeli
* **Ortak state ve kod içerir**
* **Sadece gerçekten o türden olanlar miras almalı**
* **C# çoklu miras desteklemez** (sadece bir abstract class'tan türeyebilir)
* **"Is-a" ilişkisi:** "Bu gerçekten bir X'dir" demektir

**Interface ile Karşılaştırma:**

| Özellik | Abstract Class | Interface |
|--------|---------------|-----------|
| **İlişki türü** | "Is-a" (gerçek tür) | "Can-do" (yapabilirlik) |
| **Tür ilişkisi var mı?** | ✅ Evet (gerçek tür) | ✅ Evet (yapabilirlik türü) |
| **Gerçek tür ilişkisi var mı?** | ✅ Evet | ❌ Hayır |
| **Akraba olmak zorunda mı?** | ✅ Evet | ❌ Hayır |
| **Farklı hiyerarşilerden kullanım** | ❌ Yok | ✅ Var |
| **Örnek** | `Dog : Animal` (Dog bir Animal) | `Bird : Animal, IFlyable` (Bird uçabilir) |

**Özet:**
* **Abstract Class:** "Is-a" ilişkisi → Gerçekten o türden olmalı (akraba olmalı)
* **Interface:** "Can-do" ilişkisi → Sadece yapabilirlik, akraba olmak zorunda değil

> **Not:** Interface'te "Can-do" (yapabilirlik) ilişkisi vardır. Detay için `Interface.md` dosyasına bakabilirsin.

---

### 🎯 Abstraction'ın Amacı

**Somut (Concrete) = Detayları belli olan, gerçek implementasyon**
* `Dog` → "Hav!" diye havlar
* `Cat` → "Miyav!" diye miyavlar
* `SqlUserRepository` → SQL ile kaydeder
* `ConsoleLogger` → Console'a yazar

**Soyut (Abstract) = Sadece "ne yapıyor" belli, "nasıl yapıyor" belli değil**
* `Animal` → "Konuşur" (ama nasıl? → bilinmiyor)
* `IUserRepository` → "Kullanıcı kaydeder" (ama nasıl? → bilinmiyor)
* `ILogger` → "Log yazar" (ama nereye? → bilinmiyor)

**Abstraction'ın amacı:**

> Kodu **somut sınıflara** (Dog, Cat, SqlUserRepository, ConsoleLogger) değil,
> **soyut sözleşmelere** (Animal, IUserRepository, ILogger) bağlamak.

**Neden?**
* Değişime dayanıklılık
* Test edilebilirlik
* Esneklik
* Temiz mimari

---

## 2️⃣ Abstract Class Nedir?

**Abstract class** = Hem somut (concrete) hem soyut (abstract) üyeler içerebilen sınıf.

* **Somut üyeler:** Normal field, property, method (gövdesi var)
* **Soyut üyeler:** `abstract` keyword'ü ile işaretlenmiş, gövdesi olmayan methodlar

**Kritik özellik:**

> Abstract class **new'lenemez**. Sadece miras alınır.

---

## 3️⃣ Abstract Class ile Abstraction (Animal örneği)

```csharp
public abstract class Animal
{
    public string Name { get; set; }

    // Ortak davranış: gövdesi olan method
    public void Eat()
    {
        Console.WriteLine($"{Name} is eating.");
    }

    // Soyut davranış: gövdesiz → herkes kendine göre yazmak zorunda
    public abstract void Speak();
}
```

**Kurallar:**

* `abstract class` **new'lenemez**:

```csharp
// var a = new Animal(); // ❌ derleme hatası
```

* `abstract` methodun gövdesi yok, sadece imzası var.
* Bu class'tan türeyen **her concrete sınıf**, `Speak`'i **override ETMEK ZORUNDA**.

---

## 4️⃣ Türeyen Sınıflar

```csharp
public class Dog : Animal
{
    public override void Speak()
    {
        Console.WriteLine($"{Name} says: Hav!");
    }
}

public class Cat : Animal
{
    public override void Speak()
    {
        Console.WriteLine($"{Name} says: Miyav!");
    }
}
```

**Kullanım:**

```csharp
var animals = new List<Animal>
{
    new Dog { Name = "Karabaş" },
    new Cat { Name = "Mırmır" }
};

foreach (var a in animals)
{
    a.Eat();   // Animal'dan gelir, herkes için aynı
    a.Speak(); // Dog havlar, Cat miyavlar (polymorphism)
}
```

Buradaki **abstraction**:

* Dışarıya diyorsun ki:
  > "Her Animal'ın **Name'i var**, **Eat** eder ve **Speak** eder."
* Ama `Speak`'in *nasıl* olduğunu (hav mı, miyav mı) alt sınıflara bırakıyorsun.
* Kullanan kod sadece `a.Speak()` yazıyor, detayı bilmek zorunda değil.

---

## 5️⃣ Abstract Method vs Virtual Method

> 💡 **Not:**

* `virtual` method = gövdesi var, override **opsiyonel**
* `abstract` method = gövdesi yok, override **zorunlu**
* `virtual` yoksa → **override edilemez**

**Örnek:**

```csharp
public abstract class Animal
{
    public virtual void Run()      // ✅ gövdesi var, override opsiyonel
    {
        Console.WriteLine("Running...");
    }

    public abstract void Speak();  // ✅ gövdesi yok, override zorunlu
}

public class Dog : Animal
{
    // Run() override etmek zorunda değiliz
    // Speak() override etmek ZORUNLU
    public override void Speak()
    {
        Console.WriteLine("Hav!");
    }
}
```

---

## 6️⃣ Abstract Class'ın Avantajları

1. **Ortak kod tekrarını önler:**
   * `Name`, `Age`, `Eat()` gibi ortak üyeler tek yerde.

2. **Ortak state (durum) tutabilir:**
   * Field ve property'ler tüm türeyen sınıflarda kullanılabilir.

3. **Zorunlu implementasyon sağlar:**
   * `abstract` methodlar türeyen sınıflarda mutlaka override edilmeli.

4. **Polymorphism için zemin hazırlar:**
   * `Animal a = new Dog();` şeklinde kullanılabilir.

---

## 7️⃣ Abstract Class Kullanım Senaryoları

**Ne zaman kullanılır?**

* Gerçek bir "üst tür" modellemek istiyorsan:
  * Her `Dog` ve `Cat` gerçekten birer `Animal`.
* Ortak durum (state) ve ortak kod varsa:
  * `Name`, `Age`, `Eat()` gibi hem alan hem gövdesi olan method.
* Türeyen sınıfların ortak bir base'e ihtiyacı varsa.

**Örnek senaryo:**

```csharp
public abstract class Shape
{
    public string Color { get; set; }  // ortak state

    public virtual void Draw()          // ortak davranış (override edilebilir)
    {
        Console.WriteLine($"Drawing {Color} shape");
    }

    public abstract double GetArea();   // herkes kendine göre yazmalı
}

public class Circle : Shape
{
    public double Radius { get; set; }

    public override double GetArea()
    {
        return Math.PI * Radius * Radius;
    }
}

public class Rectangle : Shape
{
    public double Width { get; set; }
    public double Height { get; set; }

    public override double GetArea()
    {
        return Width * Height;
    }
}
```

---

## 🎯 Kısacık Özet (Akılda Kalsın)

* Abstract class → hem somut hem soyut üyeler içerebilen, new'lenemeyen sınıf.

* `abstract` method → gövdesi yok, türeyen sınıflarda **override zorunlu**.

* `virtual` method → gövdesi var, override **opsiyonel**.

* Abstract class, ortak kod ve state'i tek yerde toplar.

* Polymorphism için kullanılır: `Animal a = new Dog();`

* Gerçek bir "üst tür" modellemek için idealdir.

