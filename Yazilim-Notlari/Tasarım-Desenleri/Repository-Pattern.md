# 🗂️ **Repository Pattern**

## 1️⃣ Kısa Tanım — Ne İşe Yarar?

Repository Pattern, veri erişim işlemlerini (Add, Get, Delete…) **tek bir katmanda toplayarak** uygulamanın geri kalanından **soyutlayan** bir tasarım desenidir.

Amaç: *"Uygulama veritabanı detayını bilmesin; sadece repository ile konuşsun."*

---

## 2️⃣ Mantığını Açıklayalım (gerçek hayat benzetmesiyle)

Bir **kütüphaneci** düşün:

* Sen diyorsun ki: "Bana şu kitabı getir."

* Kütüphanedeki raf düzenini, kodlamayı, klasör yapısını **bilmek zorunda değilsin**.

Repository = kütüphaneci.

Sen sadece **işi söylersin**: "GetById, Add, Remove…"

Verinin nasıl bulunduğu (SQL mi, EF Core mu, Mongo mu?) seni ilgilendirmez.

Repository, veri erişimini **dış dünyadan gizleyen** bir "aracı".

---

## 3️⃣ Neden Var? Olmasa Ne Olur?

Repository kullanmazsan:

* Her sınıfın içinde **SQL / EF Core kodu olur** → dağınık bir mimari.

* Aynı sorguları **10 farklı yerde tekrar edersin**.

* Kodun veri kaynağına **sıkı sıkıya bağımlı** olur.

* Test yazmak zordur (mock edemezsin).

Repository bu problemleri çözer:

Kod **temiz**, **mock edilebilir**, **bağımsız** ve **düzenli** olur.

---

## 4️⃣ Kafaya Yazılacak Kurallar

* Repository **veri işlemlerini tek yerde toplar**.

* İş katmanı **veritabanını görmez**, repository ile konuşur.

* Testlerde repository kolayca **mock edilir** → bağımlılık azalır.

* Her entity için genelde bir repository olur (AnimalRepository, UserRepository).

* Repository'nin görevi: **"Veriyi getir, ekle, sil — gerisini karıştırma."**

---

## 5️⃣ Derlenebilir Kısa C# Örneği

```csharp
// 1) Domain

public class Animal
{
    public int Id { get; set; }
    public string Name { get; set; }
}

// 2) Repository Interface

public interface IAnimalRepository
{
    void Add(Animal animal);
    Animal GetById(int id);
}

// 3) Repository Implementation

public class AnimalRepository : IAnimalRepository
{
    private readonly DbContext _context;

    public AnimalRepository(DbContext context)
    {
        _context = context;
    }

    public void Add(Animal animal)
    {
        _context.Set<Animal>().Add(animal);
    }

    public Animal GetById(int id)
    {
        return _context.Set<Animal>().Find(id);
    }
}

// 4) Kullanım (Service içinde)

public class AnimalService
{
    private readonly IAnimalRepository _animals;

    public AnimalService(IAnimalRepository animals)
    {
        _animals = animals;
    }

    public void CreateAnimal(string name)
    {
        _animals.Add(new Animal { Name = name });
    }
}
```

---

## 6️⃣ Mini Özet — Kafaya Yaz

Repository = **Veriyle doğrudan konuşan kütüphaneci.**

Uygulama veritabanını görmez → **sadece repository ile konuşur**.

Temizlik, düzen, test edilebilirlik getirir.

---







