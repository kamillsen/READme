# 🧩 OOP – Inheritance (Kalıtım) – Özet Not (C#)

## 1️⃣ Inheritance (Kalıtım) Nedir?

> Bir sınıfın (türeyen / child), başka bir sınıfın (base / parent)

> **özelliklerini ve davranışlarını devralmasına** kalıtım denir.

C#'ta sözdizimi:

```csharp
public class Animal { }

public class Dog : Animal
{
    // Dog, Animal'dan miras alıyor
}
```

* `Animal` → base (ebeveyn) sınıf
* `Dog` → `Animal`'dan türeyen sınıf

---

## 2️⃣ Neden Var? Olmasa Ne Olur?

**Neden var?**

* Ortak kodu tek yerde toplamak (DRY – Don't Repeat Yourself)
* Gerçek dünyayı modellemek (`Person → Employee → Manager`)
* Türeyen sınıflarda sadece **farklı olanı** yazmak
* Polymorphism için zemin hazırlamak (virtual/override tarafı)

**Olmasa ne olur?**

* Her sınıf `Name`, `Age`, `Eat()`, `Sleep()` gibi ortak şeyleri tekrar tekrar yazar.
* Bir kuralı değiştirmek için aynı kodu 5–10 yerde güncellemen gerekir.
* Hata yapma ve bir yeri unutma ihtimalin artar.

---

## 3️⃣ Basit Örnek: Animal → Dog

```csharp
public class Animal
{
    public string Name { get; set; }

    public Animal(string name)
    {
        Name = name;
    }

    public void Eat()
    {
        Console.WriteLine($"{Name} yemek yiyor.");
    }

    public void Sleep()
    {
        Console.WriteLine($"{Name} uyuyor.");
    }
}

public class Dog : Animal   // kalıtım
{
    public Dog(string name) : base(name)   // base = Animal sınıfı
    {
    }

    public void Bark()
    {
        Console.WriteLine($"{Name} havlıyor.");
    }
}
```

Kullanım:

```csharp
var dog = new Dog("Karabaş");
dog.Eat();    // Animal'dan miras
dog.Sleep();  // Animal'dan miras
dog.Bark();   // Dog'un kendi metodu
```

---

## 4️⃣ `base` Anahtar Kelimesi

```csharp
public Dog(string name) : base(name)
{
}
```

* `base` → bu sınıfın base class'ı (burada `Animal`)
* `base(name)` → `Animal(string name)` constructor'ını çağırır.
* Akış: `new Dog("Karabaş")` → önce `Animal("Karabaş")`, sonra `Dog` gövdesi.

> Constructor'lar **miras alınmaz**, ama `base(...)` ile çağrılır.

---

## 5️⃣ Mirasda Neler Alınır?

Base sınıftaki:

* field'lar → `public string name;`
* property'ler → `public int Age { get; set; }`
* metotlar → `public void Eat() { }`

→ Hepsi nesnenin parçası olur, türeyen sınıf bunları kullanabilir (erişim seviyesine bağlı).

Örnek:

```csharp
public class Animal
{
    public int Age;
    public void Eat() { }
}

public class Dog : Animal
{
    public void Test()
    {
        Age = 5;  // ✅ miras alınan field
        Eat();    // ✅ miras alınan method
    }
}
```

---

## 6️⃣ Erişim Belirleyicileri ve Miras

### 🔹 `public`

* Miras alınır ✅
* Her yerden erişilebilir (sınıfı görebiliyorsan):

```csharp
public class Animal
{
    public int Age;
}

public class Dog : Animal
{
    public void Test()
    {
        Age = 5; // ✅ erişilebilir
    }
}
```

---

### 🔹 `protected`

* Miras alınır ✅
* Sadece **base sınıf** ve **türeyen sınıflar** içinden erişilir.
* Dışarıdan **görünmez**.

```csharp
public class Animal
{
    protected int Health;
}

public class Dog : Animal
{
    public void Test()
    {
        Health = 80; // ✅ Dog içinden erişilebilir
    }
}

public class Program
{
    static void Main()
    {
        var dog = new Dog();
        // dog.Health = 50; // ❌ dışarıdan erişilemez
    }
}
```

---

### 🔹 `private`

* Nesnenin içinde **var**, miras alınıyor (state olarak),
* Ama **sadece tanımlandığı sınıfın içinden erişilir**.
* Türeyen sınıftan **hiçbir şekilde erişilemez** (ne doğrudan ne de metot içinde).

```csharp
public class Animal
{
    private int _secret = 42;

    public void ShowSecret()
    {
        Console.WriteLine(_secret); // ✅ erişebilir (Animal sınıfı içinde)
    }
}

public class Dog : Animal
{
    public void Test()
    {
        // _secret = 10;        // ❌ erişemez (private - doğrudan erişim)
        // Console.WriteLine(_secret); // ❌ erişemez (private - metot içinde de erişilemez)
        
        ShowSecret(); // ✅ erişebilir (public metot üzerinden)
    }
}
```

> Özet: `private` → "miras **var** ama erişim **yok**". Türeyen sınıftan ne doğrudan ne de metot içinde erişilebilir. Sadece base sınıfın public/protected metotları üzerinden erişilebilir.

---

## 7️⃣ Static Üyeler (Kısaca)

* `static` üyeler **türetilmiş sınıflarca da görülebilir**, ama:

  * Nesneye değil, **tipin kendisine** aittir.

  * Polymorphism'le ilgili değildir (override edilemez).

```csharp
public class Animal
{
    public static int Count;
}

public class Dog : Animal
{
}

Animal.Count = 5;
Dog.Count = 10;
Console.WriteLine(Animal.Count); // 10 (aynı değer)
```

---

## 🎯 Kısacık Özet (Akılda Kalsın)

* `class Dog : Animal` → Dog, Animal'dan her şeyi devralır (erişilebildiği kadar).

* `base(...)` → base class constructor'ını çağırır.

* `public` → herkes görür.

* `protected` → base + child görür.

* `private` → sadece tanımlandığı sınıf görür (ama nesnede durur).

* Constructor miras alınmaz, `base(...)` ile kullanılır.

---

## 8️⃣ Upcasting / Downcasting (`is` / `as`)

### 🔼 Upcasting (Child → Base)

> Dog nesnesine **Animal gözlüğüyle bakmak**.

Ön şart:

```csharp
public class Animal { }

public class Dog : Animal { }  // miras ILK burada tanimlanir
```

Kullanım:

```csharp
Animal animal = new Dog(); // upcasting
```

* Nesnenin gerçek tipi: `Dog`
* Değişkenin tipi: `Animal`
* `animal` sadece **Animal'da tanımlı** üyelere erişebilir:

```csharp
animal.Eat();   // Animal'da varsa calisir
// animal.Bark(); // ❌ Derleme hatasi, Animal Bark bilmiyor
```

Upcasting:

* Otomatik (implicit), güvenli
* Sadece var olan **miras iliskisini kullanir**, mirasi o anda vermez

---

### 🔽 Downcasting (Base → Child)

> Animal referansina tutturulmus Dog nesnesini, tekrar **Dog olarak** kullanmak.

```csharp
Animal animal = new Dog();   // upcasting
Dog dog = (Dog)animal;       // downcasting
dog.Bark();  // Artik Dog gibi kullanabilirsin
```

Ama nesne gerçekte Dog değilse patlar:

```csharp
Animal animal2 = new Animal();
Dog dog2 = (Dog)animal2; // 💥 InvalidCastException (runtime)
```

---

### 🔍 `is` operatoru (type checking)

> "Bu değişkenin içindeki gerçek nesne belirtilen tipe uyuyor mu?" → `true` / `false`.

```csharp
Animal a1 = new Dog();

bool r1 = a1 is Animal; // true  (Dog zaten Animal)
bool r2 = a1 is Dog;    // true  (icerde Dog var)
bool r3 = a1 is Cat;    // false (Dog, Cat degil)
```

* `r1` → `true`
* `r2` → `true`
* `r3` → `false`

Pattern matching ile:

```csharp
if (a1 is Dog d)
{
    d.Bark(); // burada d Dog tipinde
}
```

* `a1 is Dog d` → `true`
* If bloguna girer, `d.Bark()` calisir.

`is` sadece **kontrol eder**, tip değiştirmez.

---

### 🧷 `as` operatoru (safe casting)

> "Cast etmeyi dene; olmazsa exception atma, **null dön**."

```csharp
Animal a1 = new Dog();
Dog d = a1 as Dog; // donusebiliyorsa Dog, yoksa null

if (d != null)
{
    d.Bark();
}
```

Burada:

* `a1` gerçekte `new Dog()` olduğu için:
  * `a1 as Dog` → **Dog referansi** döner, `d` **null olmaz**.
  * `if (d != null)` → `true`
  * If blogu calisir, `d.Bark()` cagrilir.

---

```csharp
Animal a2 = new Animal();
Dog d2 = a2 as Dog; // d2 = null (hata yok)

if (d2 != null)
{
    d2.Bark();
}
```

Burada:

* `a2` gerçekte `new Animal()` olduğu için:
  * `a2 as Dog` → **donusturulemez**, `d2` **null** olur.
  * `if (d2 != null)` → `false`
  * If bloguna **girilmeyecek**, `Bark()` cagrilmayacak, **hic hata olmayacak**.

**Kısaca:**

* `is` → "Bu tip mi?" (sadece sorar, `true/false`)
* `(Dog)x` → "Bu Dog, değilse patlarım." (yanlışsa exception)
* `x as Dog` → "Deneyeyim, değilse null dönerim." (yanlışsa null, exception yok)

---

### 🛠 Nerede kullanilir? (Pratik)

```csharp
List<Animal> animals = new List<Animal>
{
    new Dog(),
    new Cat(),
    new Dog()
};

foreach (var a in animals)
{
    a.Eat(); // hepsine ortak

    if (a is Dog d)
    {
        d.Bark(); // sadece Dog'lara ozel
    }
}
```

Bu foreach'te:

1. İlk eleman `new Dog()`
   * `a.Eat()` → Dog (ama Animal'dan gelen Eat) calisir
   * `a is Dog d` → `true`, if'e girer, `d.Bark()` calisir

2. İkinci eleman `new Cat()`
   * `a.Eat()` → Cat icin Eat calisir
   * `a is Dog d` → `false`, if blogu atlanir, `Bark()` cagrilmaz

3. Üçüncü eleman yine `new Dog()`
   * `a.Eat()` → Dog icin Eat calisir
   * `a is Dog d` → `true`, if'e girer, `d.Bark()` calisir

**Polymorphism + upcasting + gerektiğinde `is`/`as` ile downcasting** → en yaygın senaryo.

---

## 9️⃣ Method Hiding (`new`) ve `override` Farki

### 🧩 Method hiding (new)

> Türeyen sınıfta, base sınıftakiyle **aynı isimde** bir metot yazıp, base versiyonu **gölgeleme**.

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
    public new void Speak()
    {
        Console.WriteLine("Dog bark");
    }
}
```

Kullanım:

```csharp
Animal a2 = new Dog();
Dog d = new Dog();

a2.Speak(); // "Animal speak"  (referans tipi Animal)
d.Speak();  // "Dog bark"      (referans tipi Dog)
```

* `a2` → tipi `Animal`, o yüzden `Animal.Speak()` calisir.
* `new` → hangi metodun çalışacağını **referans tipi** belirler
* Polymorphism yok

---

### 🧩 `virtual` / `override` (Polymorphism icin)

> Base metodu **geçmek** ve çağrıyı **nesnenin gerçek tipine** göre çalıştırmak.

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
```

Kullanım:

```csharp
Animal a2 = new Dog();
Dog d = new Dog();

a2.Speak(); // "Dog bark"  (gercek nesne Dog)
d.Speak();  // "Dog bark"
```

Buradaki kritik kural:

```csharp
public class Animal
{
    public void Run() { }           // ❌ override edilemez
    public virtual void Walk() { }  // ✅ override edilebilir
}

public class Dog : Animal
{
    // public override void Run() { }  // ❌ derleme hatasi, virtual degil
    public override void Walk() { }   // ✅ dogru kullanim
}
```

**Özet:**

* `new` → base metodu **gizler**, referans tipine göre çalışır, polymorphism yok
* `virtual` + `override` → base metodu **geçer**, gerçek nesne tipine göre çalışır, polymorphism var
* `virtual` olmayan bir metot **override edilemez**

---

## 🔟 Object class'indan miras

### 🧩 Her class aslinda Object'ten gelir

C#'ta yazdığın her class şuna denktir:

```csharp
class Dog : object
{
}
```

Yani:

* Tüm sınıflar **dolaylı ya da doğrudan** `object`'ten miras alır.
* Bu yüzden her nesnede şunlar vardır:
  * `ToString()`
  * `Equals(object obj)`
  * `GetHashCode()`
  * `GetType()`

---

### 🧪 ToString ornegi

Varsayılan:

```csharp
class Dog
{
    public string Name { get; set; }
}

var dog = new Dog { Name = "Karabas" };
Console.WriteLine(dog.ToString());
// Ornek: "MyNamespace.Dog"
```

Override ederek daha anlamli hale getirebilirsin:

```csharp
class Dog
{
    public string Name { get; set; }

    public override string ToString()
    {
        return $"Dog: {Name}";
    }
}

var dog = new Dog { Name = "Karabas" };
Console.WriteLine(dog.ToString()); // "Dog: Karabas"
```

> Kısaca: Her class `object`'ten geldiği için, `ToString`, `Equals`, `GetHashCode` gibi ortak metotlar her yerde var. İhtiyaç olursa override edip kendi tipine uygun davranışı yazarsın.

---

## 🎯 Kısacık Özet (Akılda Kalsın)

* `class Dog : Animal` → Dog, Animal'dan her şeyi devralır (erişilebildiği kadar).

* `base(...)` → base class constructor'ını çağırır.

* `public` → herkes görür.

* `protected` → base + child görür.

* `private` → sadece tanımlandığı sınıf görür (ama nesnede durur).

* Constructor miras alınmaz, `base(...)` ile kullanılır.

* `Dog : Animal` yazmazsan `Animal a = new Dog();` **yapamazsın** (miras ilişkisi şart).

* `Animal a = new Dog();` → `a` sadece **Animal'daki** üyeleri görür; Dog'a özel olanlara (`Bark`) erişemez.

* Downcast yapacaksan:
  * Güvensiz: `Dog d = (Dog)a;` (tip yanlışsa exception)
  * Güvenli: `if (a is Dog d) { ... }` veya `var d = a as Dog; if (d != null) { ... }`

* `virtual` yoksa `override` YOK; ancak `new` ile gizleyebilirsin.

* `override` → gerçek nesne tipine göre, `new` → referans tipine göre çalıştırır.

* Her class `object`'ten miras alır; bu yüzden her nesnede `ToString()` vb. metotlar hazır gelir.

---

> **Not:** Interface konusu için ayrı bir dosya oluşturuldu: `Interface.md`