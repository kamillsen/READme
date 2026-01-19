# 🧩 Interface vs Abstract Class – Karşılaştırma ve Kullanım Rehberi (C#)

## 1️⃣ Interface Nedir?

**Interface** = Sadece sözleşme (contract) tanımlar, gövdesi olmayan method imzaları içerir.

```csharp
public interface IAnimal
{
    void Speak();
    void Eat();
}
```

**Kurallar:**

* Interface'te **gövdesiz** method → implement eden sınıf **YAZMAK ZORUNDA** ✅
* Interface'te **gövdesi olan** method (C# 8+) → implement eden sınıf **yazmak zorunda DEĞİL** (opsiyonel)
* **Instance field içermez** (C# 8+ ile property içerebilir, C# 11+ ile static field içerebilir)

**Property Örneği:**

```csharp
public interface IAnimal
{
    // ✅ Property olabilir (C# 8+)
    string Name { get; set; }  // "Name property'si olmalı" sözleşmesi
    
    // ✅ Read-only property
    int Age { get; }  // "Age property'si olmalı (read-only)" sözleşmesi
    
    // ❌ Instance field olamaz
    // int age;  // Derleme hatası!
    
    void Speak();
}

// Implement eden sınıf
public class Dog : IAnimal
{
    // ✅ Auto-implemented property
    public string Name { get; set; }
    
    // ✅ Read-only property
    public int Age { get; }
    
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
```

**Örnek:**

```csharp
public class Dog : IAnimal
{
    public void Speak()
    {
        Console.WriteLine("Hav!");
    }

    public void Eat()
    {
        Console.WriteLine("Mama yiyor.");
    }
}
```

---

## 2️⃣ Abstract Class Nedir?

**Abstract class** = Hem somut (concrete) hem soyut (abstract) üyeler içerebilen sınıf.

```csharp
public abstract class Animal
{
    public string Name { get; set; }  // somut üye

    public void Eat()                  // somut method
    {
        Console.WriteLine($"{Name} is eating.");
    }

    public abstract void Speak();      // soyut method
}
```

**Kurallar:**

* Abstract class **new'lenemez**, sadece miras alınır.
* `abstract` methodlar türeyen sınıflarda **override zorunlu**.

---

## 3️⃣ Interface ile Abstraction – IAnimal örneği

### 3.1. Interface = Sözleşme

```csharp
public interface IAnimal
{
    void Speak();
}
```

Bunu implement eden sınıflar:

```csharp
public class Dog : IAnimal
{
    public void Speak()
    {
        Console.WriteLine("Hav!");
    }
}

public class Cat : IAnimal
{
    public void Speak()
    {
        Console.WriteLine("Miyav!");
    }
}
```

> Teknik olarak: **Dog, IAnimal'i implement eder.**
> Tip sistemi açısından: **Dog is an IAnimal** (Dog bir IAnimal'dir).

Bu yüzden şu tamamen doğru:

```csharp
IAnimal a1 = new Dog();
IAnimal a2 = new Cat();

a1.Speak(); // "Hav!"
a2.Speak(); // "Miyav!"
```

---

### 3.2. IAnimal kullanan AnimalTrainer (neden interface aldığımızı gösteriyor)

```csharp
public class AnimalTrainer
{
    private readonly IAnimal _animal;

    public AnimalTrainer(IAnimal animal)
    {
        _animal = animal;
    }

    public void MakeAnimalSpeak()
    {
        _animal.Speak();
    }
}
```

**Kullanım:**

```csharp
var dogTrainer = new AnimalTrainer(new Dog());
dogTrainer.MakeAnimalSpeak(); // Hav!

var catTrainer = new AnimalTrainer(new Cat());
catTrainer.MakeAnimalSpeak(); // Miyav!
```

Burada:

* `AnimalTrainer`, **Dog'u da Cat'i de BİLMEZ**.
* Sadece şunu bilir:
  > "Elimde bir `IAnimal` var, `Speak()` yapabiliyor, bu bana yeter."

Bu, logger örneğine birebir denk:

* `IAnimal` ↔ `ILogger`
* `Dog/Cat` ↔ `ConsoleLogger/FileLogger`
* `AnimalTrainer` ↔ `OrderService`

**Neden böyle yapmak daha iyi?**

* Trainer, tek bir somut tipe (Dog) **betonla yapışmıyor**.
* Yarın `Bird : IAnimal` yazarsın,
  `new AnimalTrainer(new Bird())` dersen, Trainer koduna **hiç dokunmadan** yeni hayvan çalışır.

Bu da abstraction'ın tam amacı:

> Kodu **somut sınıfa** değil, **soyut sözleşmeye** bağla.

---

## 4️⃣ Interface Implementasyon Kuralları

### 4.1. Klasik kural (junior için yeterli zihinsel model)

Çok yaygın (ve hala en çok kullanılan) kullanım:

```csharp
public interface IAnimal
{
    void Speak();
    void Eat();
}
```

Bu interface'i implement eden sınıf, **tüm methodları yazmak zorundadır**:

```csharp
public class Dog : IAnimal
{
    public void Speak()
    {
        Console.WriteLine("Hav!");
    }

    public void Eat()
    {
        Console.WriteLine("Mama yiyor.");
    }
}
```

Bunu aklında şöyle tutabilirsin:

> "Interface bir **sözleşme**.
> Ben `IAnimal`'i implement ediyorsam,
> bu sözleşmedeki **tüm imzaları** doldurmak zorundayım."

---

### 4.2. Modern C#: Interface içinde gövdesi olan method (default implementation)

Yeni C# sürümlerinde (C# 8+), interface içinde **gövdesi olan method** da olabilir:

```csharp
public interface IAnimal
{
    void Speak(); // gövdesiz → zorunlu

    void Eat()    // gövdesi var → default implementation
    {
        Console.WriteLine("Default olarak yemek yiyor.");
    }
}
```

Dog bunu implement ederse:

```csharp
public class Dog : IAnimal
{
    public void Speak()
    {
        Console.WriteLine("Hav!");
    }

    // Eat'i yazmak zorunda değil.
    // Yazmazsa interface'in default Eat'i çalışır.
}
```

Buradaki kural:

* Interface'te **gövdesiz** method → implement eden sınıf **YAZMAK ZORUNDA** ✅
* Interface'te **gövdesi olan** method → implement eden sınıf **yazmak zorunda DEĞİL**
  (isterse override gibi kendi versiyonunu yazar, istemezse interface'in default'unu kullanır)

**Kısaca:**

* Interface'te **gövdesiz olanlar** → sınıf için **zorunlu**
* Interface'te **gövdesi olanlar** → sınıf için **opsiyonel**

Junior seviye düşüncesi için şöyle diyebilirsin:

> "Interface implement ediyorsam, içindeki **abstract gibi gövdesiz her şeyi** yazmak zorundayım.
> Gövdesi olan varsa bonus; ister kullanırım, ister kendim yazarım."

---

## 5️⃣ Abstract Class vs Interface – Karşılaştırma Tablosu

| Özellik | Abstract Class | Interface |
|--------|----------------|-----------|
| **New'lenebilir mi?** | ❌ Hayır | ❌ Hayır |
| **Gövdesi olan method** | ✅ Var (normal method) | ✅ Var (C# 8+, default implementation) |
| **Gövdesiz method** | ✅ Var (`abstract` method) | ✅ Var (klasik interface) |
| **Field/Property** | ✅ Var | ❌ Yok (C# 8+ property olabilir ama field yok) |
| **Constructor** | ✅ Var | ❌ Yok |
| **Çoklu miras** | ❌ Tek base class | ✅ Birden fazla interface implement edilebilir |
| **Access modifier** | ✅ `public`, `protected`, `private` | ❌ Sadece `public` (implicit) |
| **Ortak kod** | ✅ Ortak kod ve state tutabilir | ❌ Sadece sözleşme (C# 8+ default implementation hariç) |

---

## 6️⃣ Ne Zaman Hangisini Kullanmalı?

### 🔹 Abstract Class (Animal) kullan:

**Kullanım senaryoları:**

* Ortak durum (state) ve ortak kod varsa:
  * `Name`, `Age`, `Eat()` gibi hem alan hem gövdesi olan method.
* Gerçek bir "üst tür" modellemek istiyorsan:
  * Her `Dog` ve `Cat` gerçekten birer `Animal`.
* Türeyen sınıfların ortak bir base'e ihtiyacı varsa.

**Örnek:**

```csharp
public abstract class Animal
{
    public string Name { get; set; }  // ortak state
    public int Age { get; set; }

    public void Eat()                  // ortak davranış
    {
        Console.WriteLine($"{Name} is eating.");
    }

    public abstract void Speak();      // herkes kendine göre
}
```

---

### 🔹 Interface (IAnimal, ILogger) kullan:

**Kullanım senaryoları:**

* Sadece "şu davranış var" demek istiyorsan:
  * `void Speak()`, `void Log(string message)`, `void Save()`.
* Bir sınıfın birden fazla rolü olsun istiyorsan:

```csharp
class Dog : Animal, IGuard, IPet, IRunner
{
    // Dog hem Animal'dan miras alır
    // hem de IGuard, IPet, IRunner rollerini üstlenir
}
```

* Farklı hiyerarşilerden sınıfların ortak davranışı varsa:
  * `Bird : Animal, IFlyable`
  * `Airplane : Vehicle, IFlyable`
  * İkisi de `IFlyable` ama farklı base class'lardan geliyor.

**Örnek:**

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
        File.AppendAllText("log.txt", message);
    }
}
```

---

## 7️⃣ Akraba Olmak Zorunda mı? (İlişki Türü)

### Interface: Akraba Olmak Zorunda Değil

**Interface implement eden sınıflar akraba olmak zorunda değil.** Farklı hiyerarşilerden sınıflar aynı interface'i implement edebilir.

**Örnek:**

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

**Neden?**
* **Interface:** Sadece sözleşme/rol
* **State içermez**
* **Farklı hiyerarşilerden sınıflar aynı rolü üstlenebilir**
* **Birden fazla interface implement edilebilir**

### Abstract Class: Akraba Olmak Zorunda

**Abstract class'tan miras alan sınıflar akraba olmak zorunda.** Sadece gerçekten o türden olan sınıflar miras alabilir.

**Örnek:**

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

**Neden?**
* **Abstract Class:** Gerçek bir "üst tür" modeli
* **Ortak state ve kod içerir**
* **Sadece gerçekten o türden olanlar miras almalı**
* **C# çoklu miras desteklemez** (sadece bir abstract class'tan türeyebilir)

### "Is-a" vs "Can-do" İlişkisi Detayı

**Abstract Class: "Is-a" İlişkisi (Gerçek Tür)**

```csharp
public abstract class Animal
{
    public string Name { get; set; }
    public abstract void Speak();
}

public class Dog : Animal  // ✅ Dog gerçekten bir Animal
{
    public override void Speak() { }
}
```

**Ne demek?**
- `Dog : Animal` → "Dog bir Animal'dır" (gerçek tür)
- Dog gerçekten bir Animal'dır, sadece yapabilirlik değil
- Sadece gerçekten Animal olan sınıflar miras alabilir
- **Tür ilişkisi:** `Animal animal = new Dog();` → Çalışır ✅
- **Polymorphism:** `animal.Speak();` → Dog.Speak() çalışır ✅

**Interface: "Can-do" İlişkisi (Yapabilirlik)**

```csharp
public interface IFlyable
{
    void Fly();
}

public class Bird : Animal, IFlyable  // Bird uçabilir
{
    public void Fly() { }
}

public class Airplane : Vehicle, IFlyable  // Airplane uçabilir
{
    public void Fly() { }
}
```

**Ne demek?**
- `Bird : IFlyable` → "Bird uçabilir" (yapabilirlik)
- Bird gerçekten bir IFlyable değil, sadece uçabilir
- Farklı hiyerarşilerden sınıflar aynı interface'i implement edebilir
- **Tür ilişkisi:** `IFlyable flyable = new Bird();` → Çalışır ✅
- **Polymorphism:** `flyable.Fly();` → Bird.Fly() çalışır ✅

### Karşılaştırma Tablosu

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

**Her ikisinde de tür ilişkisi var ama:**
- **Abstract Class:** Gerçek tür ilişkisi ("Dog bir Animal'dır")
- **Interface:** Yapabilirlik türü ilişkisi ("Dog bir IAnimal'dır" = "Dog, IAnimal yapabilir")

---

## 8️⃣ Özet: Abstract Class vs Interface

**Abstract class → "ortak taban + sözleşme"**

* Ortak kod ve state tutar
* Gerçek bir üst tür modeli
* Tek base class (C# çoklu miras desteklemez)
* **Akraba olmak zorunda** ("Is-a" ilişkisi)

**Interface → "sadece sözleşme / rol"**

* Sadece davranış tanımlar
* Çoklu interface implement edilebilir
* Farklı hiyerarşilerden sınıflar ortak davranış paylaşabilir
* **Akraba olmak zorunda değil** ("Can-do" ilişkisi)

---

## 🎯 Kısacık Özet (Akılda Kalsın)

* **Abstract class** → Ortak kod ve state varsa, gerçek bir üst tür modellemek için.

* **Interface** → Sadece davranış tanımlamak, çoklu rol vermek için.

* **Interface implement ederken:**
  * Gövdesiz olanlar → **zorunlu** yazılmalı
  * Gövdesi olanlar (default) → **opsiyonel**

* **Abstract class'tan türerken:**
  * `abstract` methodlar → **zorunlu** override
  * `virtual` methodlar → **opsiyonel** override

* **Her ikisi de abstraction sağlar:**
  * Kodu somut sınıflara değil, soyut sözleşmelere bağlar.

