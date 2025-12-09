# C# Class Türleri

Ele alınan türler:

* `sealed class`
* `static class`
* `partial class`
* `nested class`
* `record class` (C# 9+)

Hepsi normal `class` kavramının özel varyasyonlarıdır.

---

## 1. Sealed Class

### Kısa Tanım + Ne İşe Yarar?

* `sealed class`: Bu sınıftan **miras alınamaz**.

* Kullanım amacı: "Bu sınıfın davranışı sabit kalsın, kimse bunun üzerine yeni bir sınıf inşa etmesin."

### Mantığını Açıklayalım

Bir kapı düşün:

* Normal class → Üzerine yeni kilitler (miras alan sınıflar) ekleyebilirsin.

* `sealed class` → Üzerine mühür vurulmuş kapı; başka kilit takamazsın.

`Dog` sınıfını düşün:

* `Animal`'dan miras almış bir `Dog` var.

* Sen diyorsun ki: "`Dog` artık son nokta, kimse `SuperDog : Dog` gibi şeyler yazamasın."

* Bunun için `sealed` kullanırsın.

### Neden Var, Olmasa Ne Olurdu?

* API yazarken bazı sınıfların **genişletilmesini istemezsin**:

  * Güvenlik,
  * Performans (bazı optimizasyonlar),
  * Tasarımın bozulmaması (override ile saçma davranışlar eklenmesin).

* Eğer herkes miras alıp override ederse:

  * Beklenmedik bug'lar,
  * Test etmediğin durumlar,
  * Debug kabusu.

### Temel Kurallar

* `public sealed class Dog { }` → `class SuperDog : Dog` **derleme hatası**.

* Sealed class, yine de başka bir sınıftan miras **alabilir**, ama **kendisi** base olamaz.

* Genelde sealed: son seviye, uç sınıflarda kullanılır.

### C# Örneği

```csharp
public class Animal
{
    public virtual void Speak()
    {
        Console.WriteLine("Animal sound");
    }
}

// Dog artık sealed, kimse Dog'dan miras alamaz
public sealed class Dog : Animal
{
    public override void Speak()
    {
        Console.WriteLine("Hav hav");
    }
}

// HATA: Dog sealed oldugu icin miras alinamaz
// public class SuperDog : Dog { }
```

### Mini Özet

* `sealed class` → "Buradan daha ileri miras yok."

* Tasarımı ve davranışı sabitlemek, override edilmesini engellemek için kullan.

---

## 2. Static Class

### Kısa Tanım + Ne İşe Yarar?

* `static class`, **örneği (instance'ı) oluşturulamayan** sınıftır.

* İçinde sadece **static üyeler** olur: static metotlar, static property'ler.

* Genelde yardımcı/araç (`helper`, `utility`) sınıfları için kullanılır. Örn: `Math`.

### Mantığını Açıklayalım

Elektrik faturası hesaplama formülü hayal et:

* Bu formül için `var hesaplayici = new ElectricityCalculator();` demek anlamsız.

* Doğrudan `ElectricityCalculator.Calculate(amount)` demek istersin.

* Yani "nesne" fikrine ihtiyaç yok, sadece **fonksiyon** fikrine ihtiyaç var.

`static class` bunu netleştirir:

> "Bu sınıfın **instance**'ı yok, sadece ortak fonksiyonları var."

### Neden Var, Olmasa Ne Olurdu?

* Statik metotları normal sınıfa yazıp üstüne bir de `new`'lemek gereksiz:

  * Hem semantik kirli,
  * Hem de "bunu niye instance yaptık?" sorusunu getirir.

* `static class` ile:

  * Hem derleyici nesne oluşturmanı engeller,
  * Hem de kod okuyana net mesaj verir: "Bu bir helper, new'leme."

### Temel Kurallar

* `static class`:

  * `new` ile nesne oluşturulamaz.

  * İçinde **yalnızca static** üyeler olabilir.

  * Miras alamaz, miras veremez.

* Tipik isimler: `MathHelper`, `StringHelper`, `DateTimeExtensions` vs.

### C# Örneği

```csharp
public static class MathHelper
{
    public static int Sum(int a, int b)
    {
        return a + b;
    }
}

public class Program
{
    public static void Main()
    {
        // new MathHelper(); // HATA: static class'tan instance olusturulamaz

        int result = MathHelper.Sum(3, 5);
        Console.WriteLine(result); // 8
    }
}
```

### Mini Özet

* `static class` → "Nesnesi olmayan, sadece ortak fonksiyonları olan sınıf".

* Yardımcı fonksiyon/utility işlerinde ideal.

---

## 3. Partial Class

### Kısa Tanım + Ne İşe Yarar?

* `partial class`, **tek bir sınıfın kodunu birden fazla dosyaya bölmene** izin verir.

* Özellikle:

  * Bir kısmı **otomatik üretilen**,
  * Bir kısmı **senin yazdığın** kodlardan oluşan sınıflar için çok kullanılır.

### Mantığını Açıklayalım

Kocaman bir defter düşün:

* Tüm dersleri tek sayfaya yazarsan karmakarışık olur.

* Aynı defterin "Matematik" kısmı bir sayfada, "Fizik" kısmı başka sayfada dursun istersin;
  ama sonuçta hepsi **aynı deftere** ait.

`partial class` işte bu:

> Aynı sınıf → Birden fazla dosya → Derleyici hepsini birleştirip tek sınıf gibi görür.

### Neden Var, Olmasa Ne Olurdu?

* Büyük sınıflar tek dosyada:

  * Okuması zor,
  * Auto-generated kod ile kendi kodun birbirine girer,
  * Merge, refactor daha zor.

* Özellikle WinForms, WPF, EF gibi ortamlar:

  * Designer / generated kodu bir dosyada,
  * Senin yazdığın mantık başka dosyada:

    * Kod temiz,
    * Designer dosyasına dokunmak zorunda kalmazsın.

### Temel Kurallar

* Aynı namespace + aynı class adı + `partial` keyword → Derleyici bunları tek sınıf sayar.

* Erişim belirleyicisi (public, internal) uyumlu olmalı.

* Aynı metodu iki dosyada tanımlarsan → derleme hatası.

### C# Örneği

```csharp
// File: Person.Part1.cs
public partial class Person
{
    public string Name { get; set; }
}

// File: Person.Part2.cs
public partial class Person
{
    public void Speak()
    {
        Console.WriteLine($"Hello, I am {Name}");
    }
}

// Kullanım
public class Program
{
    public static void Main()
    {
        Person p = new Person { Name = "Ali" };
        p.Speak();
    }
}
```

Derleyici bu iki dosyayı tek bir `Person` sınıfı gibi görür.

### Mini Özet

* `partial class` → "Tek sınıfı mantıksal olarak parçalara böl, derleyici birleştirsin".

* Özellikle auto-generated + kendi kodun olduğu yerlerde kurtarıcı.

---

## 4. Nested Class (İç İçe Sınıf)

### Kısa Tanım + Ne İşe Yarar?

* Bir sınıfın **içinde tanımlanan** sınıftır.

* Genelde sadece dış sınıfla ilgili, dışarı açmak istemediğin yardımcı tipleri saklamak için kullanılır.

```csharp
public class Outer
{
    public class Inner
    {
    }
}
```

### Mantığını Açıklayalım

Bir şirket düşün:

* `Company` ana sınıf.

* İçinde sadece bu şirkete özel `Department`, `EmployeeIterator` gibi tipler var.

* Bu tipler tek başına dış dünyaya çok anlamlı değil;
  ama `Company` ile birlikte anlam kazanıyor.

İşte bu tipleri `Company` içinde tanımlıyorsun → **nested class**.

> İlgili tipleri bir arada tut, gerekirse dışarıdan gizle.

### Neden Var, Olmasa Ne Olurdu?

* Yardımcı sınıflar her yere dağılır:

  * Namespace kalabalık olur,
  * Dışarıya gereksiz API açılır.

* Nested class ile:

  * Daha iyi **kapsülleme**,
  * "Bu class sadece şu sınıfın iç işleri" mesajı net.
  * İlgili tipler mantıksal olarak gruplanmış olur.

### Temel Kurallar

* Tanım: `class Outer { class Inner { } }`

* Dışarıdan erişim:

  * `Outer.Inner` şeklinde.

* `Inner`'ın erişim belirleyicisi önemli:

  * `private class Inner` → Sadece `Outer` içinde kullanılabilir.

  * `public class Inner` → Dışarıdan `Outer.Inner` olarak görülebilir.

### C# Örnekleri

#### a) Sadece Dış Sınıf İçinde Kullanılan Private Nested Class

```csharp
public class AnimalTrainer
{
    private readonly TrainingLog _log = new TrainingLog();

    public void Train()
    {
        _log.Log("Training started");
        Console.WriteLine("Training animal...");
        _log.Log("Training finished");
    }

    // Nested class sadece ic isler icin
    private class TrainingLog
    {
        public void Log(string message)
        {
            Console.WriteLine($"[LOG] {message}");
        }
    }
}

public class Program
{
    public static void Main()
    {
        var trainer = new AnimalTrainer();
        trainer.Train();

        // AnimalTrainer.TrainingLog burada görünmez, private çünkü.
    }
}
```

Burada:

* `TrainingLog` sadece `AnimalTrainer` içinde görülür.

* Dış dünya `TrainingLog` tipini hiç bilmez, sadece `AnimalTrainer` ile konuşur.

#### b) Dışarıdan Erişilebilir Public Nested Class

```csharp
public class AnimalTrainer
{
    public void Train()
    {
        Console.WriteLine("Training animal...");
    }

    // Disari acilmis nested class
    public class TrainingLog
    {
        public void Log(string message)
        {
            Console.WriteLine($"[TRAINER LOG] {message}");
        }
    }
}

public class Program
{
    public static void Main()
    {
        // Dışarıdan nested class kullanımı:
        var log = new AnimalTrainer.TrainingLog();
        log.Log("Program started");

        var trainer = new AnimalTrainer();
        trainer.Train();

        log.Log("Program finished");
    }
}
```

Dikkat:

* Dışarıdan tipi `AnimalTrainer.TrainingLog` olarak kullanıyorsun.

* Yani `TrainingLog`, mantıksal olarak `AnimalTrainer`'ın altına bağlı.

#### c) Nested Class'ın Outer'ın Private Üyelerine Erişmesi

```csharp
public class AnimalTrainer
{
    private string _trainerName = "Default Trainer";

    public AnimalTrainer(string name)
    {
        _trainerName = name;
    }

    public void PrintInfo()
    {
        InfoPrinter printer = new InfoPrinter();
        printer.Print(this); // this = bu AnimalTrainer instance'i
    }

    public class InfoPrinter
    {
        public void Print(AnimalTrainer trainer)
        {
            // Nested class, outer class'in private alanina erisebilir
            Console.WriteLine($"Trainer name: {trainer._trainerName}");
        }
    }
}

public class Program
{
    public static void Main()
    {
        var trainer = new AnimalTrainer("Ali");
        trainer.PrintInfo();

        var printer = new AnimalTrainer.InfoPrinter();
        printer.Print(trainer);
    }
}
```

Kafaya yaz:

* Nested class, outer class'ın **private** üyelerine erişebilir ama bir instance üzerinden (`trainer._trainerName`) çalışır.

* Sihir yok: Yine de hangi `AnimalTrainer` için çalışacağını sen veriyorsun.

### Mini Özet

* Nested class = Sınıf içinde sınıf.

* İçerden → direkt `Inner`.

* Dışardan → `Outer.Inner`.

* `private nested class` → tamamen iç iş, dışarı görünmez.

* İlgili tipleri bir arada tutmak ve kapsüllemeyi artırmak için kullanılır.

---

## 5. Record Class (C# 9+)

### Kısa Tanım + Ne İşe Yarar?

* `record` (default olarak record class), **veri taşıyan tipler** için tasarlanmış özel bir sınıf türüdür.

* Amaç:

  * Eşitliği **değer** bazlı yapmak,
  * Immutability'yi kolaylaştırmak,
  * `Equals`, `GetHashCode`, `ToString` gibi şeyleri otomatik üretmek.

### Mantığını Açıklayalım

Normal class:

```csharp
var p1 = new Person { Name = "Ali", Age = 30 };
var p2 = new Person { Name = "Ali", Age = 30 };

Console.WriteLine(p1 == p2); // false (referans farkli)
```

Record:

* İki form düşün, üstündeki bilgiler aynıysa "bu ikisi aynı kişi" dersin.

* Yani eşitlik "adres aynı mı" değil, "içerik aynı mı" diye bakar.

### Neden Var, Olmasa Ne Olurdu?

Veri odaklı tipler için sürekli:

* `Equals` override,
* `GetHashCode` override,
* `ToString` override,
* Immutability için constructor, private set, readonly alanlar…

Yazıp durman gerekir.

`record` bunları senin için üretir.

### Temel Kurallar

* Kısa tanım:

  ```csharp
  public record Person(string Name, int Age);
  ```

* Eşitlik:

  * `new Person("Ali", 30)` ve `new Person("Ali", 30)` → **eşit**.

* `with` ile kopya alıp tek özelliği değiştirebilirsin:

  ```csharp
  var p2 = p1 with { Age = 31 };
  ```

* Default olarak **reference type**'tır (record class).

* İstersen `record struct` da var (value type record), ama o ayrı bir detay.

### C# Örneği

```csharp
public record Person(string Name, int Age);

public class Program
{
    public static void Main()
    {
        var p1 = new Person("Ali", 30);
        var p2 = new Person("Ali", 30);

        Console.WriteLine(p1 == p2); // True, deger bazli esitlik

        var p3 = p1 with { Age = 31 }; // p1 bozulmaz, yeni bir kopya

        Console.WriteLine(p1); // Person { Name = Ali, Age = 30 }
        Console.WriteLine(p3); // Person { Name = Ali, Age = 31 }
    }
}
```

### Mini Özet

* `record` → "Veri taşıyan tiplerde eşitlik, içindeki değerlere göre olsun".

* Immutability, kopyalama (`with`) ve güzel `ToString` için süper pratik.

---

## Genel Özet

* **sealed class** → Miras **vermez**.

  "Bu sınıf son durak, kimse bunu extend etmesin."

* **static class** → Instance yok, sadece **static üyeler**.

  Helper/utility fonksiyonlar için ideal.

* **partial class** → Aynı sınıf birden çok dosyada, derleyici hepsini **tek sınıf** sayar.

  Özellikle auto-generated + senin kodun ayrımı için.

* **nested class** → Sınıf içinde sınıf.

  İlgili tipleri gruplar, gerekirse `private` ile tamamen gizler.

  Dışarıdan `Outer.Inner` diye kullanılır.

* **record class** → Veri odaklı tipler.

  Eşitlik içerik bazlı, `with` ile kopyalama, kolay immutability.



