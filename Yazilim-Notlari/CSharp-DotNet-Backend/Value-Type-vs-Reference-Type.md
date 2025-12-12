# Value Type vs Reference Type

## 1. Kısa Tanım + Ne İşe Yarar?

* **Value type**: Değeri direkt tutan tiplerdir (`int`, `bool`, `double`, `struct` vs).

* **Reference type**: Değerin kendisini değil, onun adresini (referansını) tutan tiplerdir (`class`, `string`, `array`, `List<T>` vs).

**Nerede işimize yarar?**

→ Değişken kopyalanınca gerçekten veri mi kopyalanıyor, yoksa aynı nesne mi paylaşılacak, bunu anlamamızı sağlar. Bu da **bellek kullanımı** ve **davranış** açısından kritik.

---

## 2. Mantığını Açalım (Kafada Canlandırma)

### Value Type = Ayrı Kutu

* Her değişkenin kendi **küçük kutusu** var.

* `int a = 10; int b = a;` dersen:

  * `a` için bir kutu: içinde `10`

  * `b` için başka bir kutu: içinde de `10`

* Sonra `a = 20;` dersen:

  * `a` kutusunda artık `20`

  * `b` hala `10` (çünkü bambaşka bir kutu)

### Reference Type = Aynı Kutuya İşaret Eden Etiket

* Elinde büyük bir kutu (nesne) var, ona yapıştırdığın etiketler referans.

* `Person p1 = new Person();`

  → Bellekte bir `Person` kutusu açılır, `p1` o kutuya işaret eden bir etiket gibi.

* `Person p2 = p1;` dersen:

  * **Yeni kutu açılmaz**, `p2` de aynı kutuya yapıştırılan ikinci etiket olur.

* `p1.Name = "Ali";` dediğinde:

  * Kutunun içini değiştiriyorsun, hem `p1.Name` hem `p2.Name` `"Ali"` olur.

**Özet:**

> Value type → kopyalanınca **veri kopyalanır**.

> Reference type → kopyalanınca **adres kopyalanır**, nesne **ortak** kullanılır.

---

## 3. Neden Var, Olmasa Ne Olurdu?

### Neden Value Type Var?

* Küçük ve basit veriler (`int`, `double`, `bool`) için:

  * Bellekte hızlı, kompakt ve tahmin edilebilir olmak istiyoruz.

  * Metotlara parametre geçerken küçük değerleri kopyalamak hem mantıklı hem güvenli.

### Neden Reference Type Var?

* Karmaşık nesneler (`Person`, `Order`, `List<int>`) büyük olabilir.

  * Her seferinde **tamamını kopyalamak** çok maliyetli olurdu.

  * Nesneyi **paylaşmak** istiyoruz: bir yerde yapılan değişiklik diğer tarafta da görülsün.

### Eğer Tek Tip Olsaydı

**Her şey value olsaydı:**

* Her atamada/kopyalamada devasa nesneler kopyalanır, performans çöp olurdu.

**Her şey reference olsaydı:**

* Basit bir sayı kopyalarken bile "bu diğer tarafta da değişir mi?" diye düşünmek zorunda kalırdın.

* Yan etkiler (side effect) her yerde karşına çıkar, debug kabusa dönerdi.

---

## 4. Temel Kurallar / Kafaya Yazılacak Noktalar

* `int`, `double`, `bool`, `char`, `decimal`, `DateTime`, `struct` → **Value type**

* `class`, `string`, `array`, `List<T>`, `Dictionary<K,V>` → **Reference type**

* Value type değişkeni kopyaladığında → **yeni bağımsız bir kopya** oluşur.

* Reference type değişkeni kopyaladığında → **aynı nesnenin referansı** kopyalanır.

* Metoda value type parametre verirsen (by value) → metod içinde değişiklik, dışarıyı etkilemez.

* Metoda reference type parametre verirsen → nesnenin içini değiştirirsen, dışarıda da değişmiş olur.

* `null` **sadece reference type'lar** (veya nullable value types: `int?`) için anlamlıdır.

---

## 5. C# Örneği

```csharp
using System;

public class Program
{
    public static void Main()
    {
        // ---- Value type örneği ----
        int a = 10;
        int b = a;      // Değer kopyalanır
        a = 20;
        Console.WriteLine($"a = {a}"); // 20
        Console.WriteLine($"b = {b}"); // 10 (etkilenmez)

        // ---- Reference type örneği ----
        Person p1 = new Person();
        p1.Name = "Ali";
        Person p2 = p1; // Aynı nesneye referans
        p2.Name = "Veli";
        Console.WriteLine($"p1.Name = {p1.Name}"); // Veli
        Console.WriteLine($"p2.Name = {p2.Name}"); // Veli

        // ---- Metoda geçerken fark ----
        int x = 5;
        IncreaseValue(x);
        Console.WriteLine($"x (value type) = {x}"); // 5, çünkü kopyası değişti

        Person p3 = new Person { Name = "Ayse" };
        ChangePersonName(p3);
        Console.WriteLine($"p3.Name (reference type) = {p3.Name}"); // Zeynep
    }

    static void IncreaseValue(int number)
    {
        number += 10; // Sadece kopyayı değiştirir
    }

    static void ChangePersonName(Person person)
    {
        person.Name = "Zeynep"; // Aynı nesnenin içini değiştirir
    }
}

public class Person
{
    public string Name { get; set; }
}
```

---

## 6. Kısacık Özet

* Value type → **veri direkt kutuda**, kopyalanınca **ayrı kutu**.

* Reference type → **kutunun adresi**, kopyalanınca **aynı kutuya iki etiket**.

* Bu farkı anlamak: parametre geçerken ve nesne kopyalarken **"Neresi değişir?"** sorusunun cevabıdır.

