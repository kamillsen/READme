# 🧩 OOP – Polymorphism (Çok Biçimlilik) – Özet Not (C#)

## 1️⃣ Polymorphism nedir? (Kısacık tanım)

Aynı referans üzerinden, nesnenin gerçek tipine göre farklı davranış sergileme olayıdır.

Yani:

```csharp
Animal a1 = new Dog();
Animal a2 = new Cat();

a1.Speak(); // Dog'un versiyonu
a2.Speak(); // Cat'in versiyonu
```

Aynı Animal tipiyle konuşuyorsun (a1, a2),
ama arka tarafta farklı sınıflar var → farklı sonuç.

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

**Neden?**

Çünkü `virtual`/`override` yok.

C# diyor ki:

> "Metodu seçerken değişkenin tipine bakarım (Animal mı, Dog mu?)"

* `a` → tipi `Animal` → `Animal.Speak()` çalışır.
* `d` → tipi `Dog` → `Dog.Speak()` çalışır.

Burada polymorphism yok, sadece method hiding / gölgeleme var.

---

## 4️⃣ Polymorphism için gereken sihir: virtual + override

Şimdi aynı örneği doğru şekilde yazalım:

```csharp
class Animal
{
    public virtual void Speak()
    {
        Console.WriteLine("Animal speak");
    }
}

class Dog : Animal
{
    public override void Speak()
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

a1.Speak(); // "Dog bark"
a2.Speak(); // "Cat meow"
d.Speak();  // "Dog bark"
```

Buradaki fark ne?

* `virtual` → "Bu metodun gerçek versiyonunu, nesnenin tipine göre seç."
* `override` → "Bu metodun Dog/Cat versiyonu budur."

✅ **Kritik kural:**

> `virtual` OLMAZSA `override` EDEMEZSIN.
> `virtual` olmayan metot polymorphism'in parçası olamaz.

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

