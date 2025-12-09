# Class vs Struct

## 1. Kısa Tanım + Ne İşe Yarar?

* **Class**: Reference type bir veri yapısıdır. Karmaşık nesneler, büyük veri yapıları ve kalıtım gerektiren durumlar için kullanılır.

* **Struct**: Value type bir veri yapısıdır. Küçük, basit veri grupları ve performans kritik senaryolar için kullanılır.

**Nerede işimize yarar?**

→ Küçük, basit veri grupları için struct kullanarak bellek ve performans kazancı sağlayabiliriz. Karmaşık nesneler ve kalıtım gerektiren durumlarda class kullanırız. Bu seçim, bellek yönetimi ve uygulama performansı açısından kritiktir.

---

## 2. Mantığını Açalım (Kafada Canlandırma)

### Class = Büyük Kutu, Heap'te, Referansla Erişim

* Class bir **reference type**'dır.

* `Person p1 = new Person();` dediğinde:

  * Bellekte **heap**'te bir `Person` nesnesi oluşturulur.

  * `p1` değişkeni **stack**'te tutulur ve heap'teki nesneye **referans** tutar.

* `Person p2 = p1;` dersen:

  * `p2` de aynı nesneye referans tutar.

  * İkisi de aynı heap nesnesini işaret eder.

### Struct = Küçük Kutu, Stack'te, Değerle Taşınır

* Struct bir **value type**'dır.

* `Point p1 = new Point(10, 20);` dediğinde:

  * `p1` değişkeni **stack**'te tutulur ve değerler **direkt** içinde saklanır.

  * Heap'e gitmez (genelde).

* `Point p2 = p1;` dersen:

  * `p2` için **yeni bir kopya** oluşturulur.

  * İkisi de bağımsız değerlere sahiptir.

**Özet:**

> Class → **heap'te**, **referans** ile erişilir, **paylaşılır**.

> Struct → **stack'te** (genelde), **değer** olarak kopyalanır, **bağımsızdır**.

---

## 3. Neden Var, Olmasa Ne Olurdu?

### Neden Struct Var?

* Küçük veri grupları (`Point`, `Color`, `DateTime`) için:

  * Heap allocation maliyeti gereksizdir.

  * Stack'te direkt tutmak daha hızlı ve verimlidir.

  * Kopyalama maliyeti düşüktür (küçük olduğu için).

* Performans kritik senaryolarda:

  * Çok sayıda küçük nesne oluşturulacaksa, struct kullanmak garbage collection baskısını azaltır.

### Neden Class Var?

* Karmaşık nesneler (`Person`, `Order`, `Product`) için:

  * Büyük veri yapıları her kopyalamada maliyetlidir.

  * Kalıtım, polimorfizm gibi OOP özellikleri gereklidir.

  * Nesneyi paylaşmak ve referansla erişmek mantıklıdır.

### Eğer Tek Tip Olsaydı

**Her şey class olsaydı:**

* Küçük veriler için bile heap allocation olurdu, performans düşerdi.

* Garbage collection sık çalışır, uygulama yavaşlardı.

**Her şey struct olsaydı:**

* Büyük nesneler her kopyalamada tamamen kopyalanırdı, çok maliyetli olurdu.

* Kalıtım, polimorfizm gibi OOP özellikleri kullanılamazdı.

---

## 4. Temel Kurallar / Kafaya Yazılacak Noktalar

### Class Özellikleri

* **Reference type** → heap'te saklanır.

* **Null** olabilir.

* **Kalıtım** destekler (başka bir class'tan türeyebilir).

* **Default constructor** tanımlanabilir ve override edilebilir.

* **Destructor** tanımlanabilir.

* **Abstract** veya **sealed** olabilir.

* **Interface** implement edebilir.

* **Büyük nesneler** için uygundur.

### Struct Özellikleri

* **Value type** → stack'te saklanır (genelde).

* **Null olamaz** (nullable değilse: `Point?` gibi).

* **Kalıtım desteklemez** (sadece `System.ValueType`'tan türer, bu da `object`'ten türer).

* **Parametresiz constructor** tanımlanamaz (C# 10+ hariç, ama hala önerilmez).

* **Destructor** tanımlanamaz.

* **Abstract, sealed, static** olamaz.

* **Interface** implement edebilir.

* **Küçük veri grupları** için uygundur (genelde 16 byte'dan küçük).

* **Tüm field'lar** constructor'da initialize edilmelidir.

### Ne Zaman Class, Ne Zaman Struct?

**Class kullan:**

* Karmaşık nesneler için.

* Kalıtım gerektiğinde.

* Büyük veri yapıları için.

* Null olabilmesi gerektiğinde.

* Nesneyi paylaşmak istediğinde.

**Struct kullan:**

* Küçük veri grupları için (genelde 16 byte'dan küçük).

* Performans kritik senaryolarda.

* Immutable (değişmez) veri yapıları için.

* Basit değer tutucular için (`Point`, `Color`, `DateTime` gibi).

---

## 5. C# Örneği

```csharp
using System;

public class Program
{
    public static void Main()
    {
        // ---- Class örneği (Reference Type) ----
        Person p1 = new Person { Name = "Ali", Age = 25 };
        Person p2 = p1; // Aynı nesneye referans
        p2.Name = "Veli";
        Console.WriteLine($"p1.Name = {p1.Name}"); // Veli (değişti)
        Console.WriteLine($"p2.Name = {p2.Name}"); // Veli

        // p1 null olabilir
        Person p3 = null;
        Console.WriteLine($"p3 is null: {p3 == null}"); // True

        // ---- Struct örneği (Value Type) ----
        Point point1 = new Point(10, 20);
        Point point2 = point1; // Yeni bir kopya
        point2.X = 100;
        Console.WriteLine($"point1.X = {point1.X}"); // 10 (değişmedi)
        Console.WriteLine($"point2.X = {point2.X}"); // 100

        // Struct null olamaz (nullable değilse)
        // Point point3 = null; // HATA!

        // Nullable struct
        Point? point4 = null;
        Console.WriteLine($"point4 is null: {point4 == null}"); // True

        // ---- Metoda geçerken fark ----
        Person person = new Person { Name = "Ayse" };
        ChangePersonName(person);
        Console.WriteLine($"person.Name = {person.Name}"); // Zeynep (değişti)

        Point point = new Point(5, 5);
        ChangePoint(point);
        Console.WriteLine($"point.X = {point.X}"); // 5 (değişmedi, çünkü kopya)
    }

    static void ChangePersonName(Person person)
    {
        person.Name = "Zeynep"; // Aynı nesnenin içini değiştirir
    }

    static void ChangePoint(Point point)
    {
        point.X = 999; // Sadece kopyayı değiştirir, orijinal etkilenmez
    }
}

// Class örneği
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    // Default constructor tanımlanabilir
    public Person()
    {
        Name = "Unknown";
    }
}

// Struct örneği
public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }

    // Parametreli constructor (zorunlu)
    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    // Parametresiz constructor C# 10+ ile tanımlanabilir ama önerilmez
    // public Point() { X = 0; Y = 0; } // C# 10+ çalışır ama önerilmez
}
```

### Interface Implementasyonu (Her İkisi de Yapabilir)

```csharp
public interface IDrawable
{
    void Draw();
}

// Class interface implement edebilir
public class Circle : IDrawable
{
    public void Draw() => Console.WriteLine("Drawing circle");
}

// Struct da interface implement edebilir
public struct Rectangle : IDrawable
{
    public void Draw() => Console.WriteLine("Drawing rectangle");
}
```

---

## 6. Kısacık Özet

* Class → **reference type**, **heap'te**, **referansla** erişilir, **paylaşılır**, **kalıtım** destekler.

* Struct → **value type**, **stack'te** (genelde), **değerle** kopyalanır, **bağımsızdır**, **kalıtım** desteklemez.

* Küçük, basit veri grupları → **struct**.

* Karmaşık nesneler, kalıtım gerektiren durumlar → **class**.

* Bu seçim, bellek yönetimi ve performans açısından kritiktir.




