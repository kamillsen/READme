# 🧩 **UNIT OF WORK PATTERN – KISA VE NET NOT**

## 1️⃣ Kısa Tanım – Bu nedir?

**Unit of Work**, birden fazla repository tarafından yapılan tüm veri işlemlerini
**tek bir transaction içinde** yöneten tasarım desenidir.

Amaç:

> "Dağınık SaveChanges çağrılarını tek bir merkezde toplamak."

---

## 2️⃣ Mantığı – Basit benzetmeyle

Market alışverişi yapıyorsun:

* Sepete 10 ürün attın → bunlar **Add işlemleri**
* Kasaya gidip tek seferde ödeme yaptın → bu **SaveChanges**

Unit of Work = kasadaki tek ödeme noktası.

Repository = sepete ürün atan kişi.

---

## 3️⃣ Neden Var? – Olmasa ne olur?

Unit of Work kullanmazsak:

❌ Her repository kendi SaveChanges'ini çalıştırır
→ dağınık transaction
→ tutarsız veri riski

❌ Kod içinde her yerde SaveChanges çağrısı olur
→ kontrol kaybolur

❌ İşlemleri test etmek zorlaşır
→ bağımlılık artar

Unit of Work ile:

✔ Tüm repository işlemleri tek SaveChanges ile kaydedilir
✔ Transaction yönetimi merkezileşir
✔ Kod daha temiz ve düzenli olur
✔ Test edilebilir hale gelir

---

## 4️⃣ Kafaya Yazılacak Kurallar

* Repository → **veriyi işler** (Add, Remove, Update)
* Unit of Work → **değişiklikleri kaydeder** (SaveChanges)
* Add → veritabanına **yazmaz**, sadece ChangeTracker'a not bırakır
* SaveChanges → tüm pending değişiklikleri **tek transaction** ile işler
* Unit of Work → repository'leri **tek elden yönetir**

---

## 5️⃣ Tam Kod ve Mantığın Yorumlarla Açıklanması

Aşağıdaki kod satır satır senin sorduğun iki kritik soruyu cevaplıyor:

* _uow.Animals.Add() nasıl çalışıyor?
* SaveChanges tüm Add işlemlerini tek seferde mi kaydediyor?

```csharp
public class Animal
{
    public int Id { get; set; }
    public string Name { get; set; }
}

// DbContext: EF Core'un ChangeTracker sistemi burada çalışır.
// Add → hemen veritabanına yazmaz, sadece "eklenecek" şeklinde not düşer.
public class AppDbContext : DbContext
{
    public DbSet<Animal> Animals { get; set; }
}

// Repository: Veritabanına hemen gitmez. Sadece ChangeTracker'a ekleme yapar.
public class AnimalRepository
{
    private readonly AppDbContext _context;

    public AnimalRepository(AppDbContext context)
    {
        _context = context;
    }

    public void Add(Animal animal)
    {
        // Bu satır SQL INSERT değil!
        // EF Core burada:
        //    "animal → Added" olarak ChangeTracker'a not bırakır.
        _context.Animals.Add(animal);
    }
}

// Unit of Work: Repository'leri tutar ve SaveChanges'i tek noktaya taşır.
public class UnitOfWork
{
    private readonly AppDbContext _context;

    // Burada Add yok ama Animals property'si AnimalRepository döner.
    // _uow.Animals.Add() buradan gelir.
    public AnimalRepository Animals { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;

        // İşte bu yüzden _uow.Animals.Add() çalışır:
        Animals = new AnimalRepository(context);
    }

    public void Save()
    {
        // SaveChanges → ChangeTracker'daki TÜM değişiklikleri
        // tek seferde veritabanına yazar.
        _context.SaveChanges();
    }
}

// Service katmanı: Kullanımın doğrudan örneği.
public class AnimalService
{
    private readonly UnitOfWork _uow;

    public AnimalService(UnitOfWork uow)
    {
        _uow = uow;
    }

    public void CreateAnimals()
    {
        // Bu Add'ler veritabanına gitmez. Sadece ChangeTracker'a not bırakılır.
        _uow.Animals.Add(new Animal { Name = "Dog" });
        _uow.Animals.Add(new Animal { Name = "Cat" });
        _uow.Animals.Add(new Animal { Name = "Bird" });

        // Save → tüm notları SQL'e dönüştürüp tek transaction ile kaydeder.
        _uow.Save();
    }
}

public class Program
{
    public static void Main()
    {
        var context = new AppDbContext();
        var uow = new UnitOfWork(context);
        var service = new AnimalService(uow);

        service.CreateAnimals();
    }
}
```

---

## 6️⃣ Mini Özet – 3 Satır

* **Add → sadece ChangeTracker'a not düşer (veritabanına yazmaz).**
* **Unit of Work → SaveChanges'i tek merkezden çalıştırır.**
* **SaveChanges → tüm Add işlemlerini tek transaction içinde kaydeder.**

---

