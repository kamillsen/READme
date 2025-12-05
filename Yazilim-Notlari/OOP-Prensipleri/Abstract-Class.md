# 🧩 Abstract Class (Soyut Sınıf) – Özet Not (C#)

## 1️⃣ Abstraction fikri – Temel mantık

**Tek cümlelik tanım:**

> **Abstraction = Gereksiz detayı sakla, dışarıya sadece gerekli yüzü (sözleşmeyi) göster.**

> Yani: **"Ne yapıyor?" önemli, "Nasıl yapıyor?" detay.**

Gerçek hayattan:

* **Araba:**
  * Senin gördüğün: gaz, fren, direksiyon
  * Görmediğin: motorun iç mekanizması
* Sen "gaza basıyorum, hızlanıyor" diye düşünürsün, motor detayı umrunda değil.

Yazılımda da:

* Üst seviye kod:
  * `Log("mesaj")` var mı? `Speak()` var mı? → buna bakar.
* Alt seviye detay:
  * Console'a mı yazar, dosyaya mı yazar, Dog mu havlar, Cat mi miyavlar → **saklanmış**.

Abstraction'ın amacı:

> Kodu **somut sınıflara** (Dog, Cat, ConsoleLogger) değil,
> **soyut sözleşmelere** (Animal, IAnimal, ILogger) bağlamak.

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

