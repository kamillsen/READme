# Entity Framework Core Temel Kavramlar

Bu not *bir junior → mid developer için temel referans dokümanı seviyesindedir*.

---

## 1. LINQ Nedir? (En Temiz Tanım)

**LINQ (Language Integrated Query)** =

> C# içinde **SQL yazar gibi** veri sorgulamayı sağlayan bir sorgulama dilidir.

Ama farkı şu:

* SQL gibi string değildir
* C# dilinin bir parçasıdır
* EF Core bunu alıp **SQL'e çevirir**

### LINQ C#'a sorgu yeteneği kazandırır.

### LINQ, veritabanına direkt gitmez.

DbContext çevrimler yapar → SQL oluşturur → DB'ye gönderir.

---

## 2. LINQ → SQL Mantığı (En Basit Örnek)

### C# LINQ:

```csharp
var products = context.Products
    .Where(p => p.Price > 100)
    .ToList();
```

### EF Core'un çevirdiği SQL:

```sql
SELECT * 
FROM Products 
WHERE Price > 100;
```

### Önemli:

* **Where**, **OrderBy**, **Select**, **Include** gibi LINQ fonksiyonlarını EF Core tanır
* DbContext bu LINQ'u alır → SQL Server/PostgreSQL için SQL üretir
* Veritabanında çalıştırır
* Sonuçları **C# nesnelerine** dönüştürür

✔ Yani **LINQ = C# sorgusu**,
✔ **SQL = veritabanında çalışan sorgu**.

---

## 3. DbContext Nedir?

DbContext, EF Core'un **beyni**dir.

### DbContext'in Görevleri:

| Görev                      | Açıklama                              |
| -------------------------- | ------------------------------------- |
| **Veritabanına bağlanmak** | Connection string üzerinden           |
| **DbSet oluşturmak**       | Tabloları C# sınıflarıyla temsil eder |
| **LINQ → SQL üretmek**     | LINQ sorgusunu SQL'e çevirir          |
| **Tracking**               | Nesnelerdeki değişiklikleri izler     |
| **Migration yönetimi**     | Code First için                       |
| **Model kuralları**        | Fluent API ile PK, FK, tablo adı vb.  |

### Örnek DbContext

```csharp
public class AppDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=.;Database=ShopDb;Trusted_Connection=True;");
}
```

---

## 4. Code First – (Kod → Veritabanı)

### Mantık:

> Entity class'larını yaz → Migration → SQL veritabanı oluşur.

### 1) Entity sınıfı

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

### 2) DbContext

```csharp
public class AppDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }
}
```

### 3) Migration

```
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### EF Core'un yarattığı SQL:

```sql
CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(MAX),
    Price DECIMAL(18,2)
);
```

---

## 5. Database First – (Veritabanı → Kod)

### Mantık:

> Veritabanı hazırdır → EF Core kodu otomatik üretir.

### Scaffold komutu:

```
dotnet ef dbcontext scaffold 
"Server=.;Database=ShopDb;Trusted_Connection=True;" 
Microsoft.EntityFrameworkCore.SqlServer 
--output-dir Models
```

### EF Core'un ürettiği sınıf:

```csharp
public partial class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

### EF Core'un ürettiği context:

```csharp
public partial class ShopDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }
}
```

✔ Migration yok
✔ Kod veritabanını takip eder

---

## 6. Model First – (Tasarım → Kod + Veritabanı)

### Bu yöntem:

* EF Core'da yok
* Sadece EF6'da var (Entity Designer)

### Mantık:

> Diyagram ekranında tablo çiz → EF hem sınıfları hem SQL script'i oluşturur.

Örnek çizim:

* Product
* Category
* Order

EF çıktıları üretir:

✔ Product.cs
✔ Category.cs
✔ DbContext
✔ SQL scripts

---

## 7. LINQ → SQL Örnekleri

### 7.1 Filtreleme (Where)

#### LINQ:

```csharp
var expensive = context.Products
    .Where(p => p.Price > 1000)
    .ToList();
```

#### SQL:

```sql
SELECT * FROM Products WHERE Price > 1000;
```

---

### 7.2 Sıralama

#### LINQ:

```csharp
var sorted = context.Products
    .OrderBy(p => p.Name)
    .ToList();
```

#### SQL:

```sql
SELECT * FROM Products ORDER BY Name ASC;
```

---

### 7.3 Projection (Select)

#### LINQ:

```csharp
var names = context.Products
    .Select(p => p.Name)
    .ToList();
```

#### SQL:

```sql
SELECT Name FROM Products;
```

---

### 7.4 Join örneği

#### LINQ:

```csharp
var result =
    from p in context.Products
    join c in context.Categories on p.CategoryId equals c.Id
    select new { p.Name, c.Name };
```

#### SQL:

```sql
SELECT p.Name, c.Name
FROM Products p
JOIN Categories c ON p.CategoryId = c.Id;
```

---

## 8. Son Büyük Özet – Tek Tabloda

| Kavram             | Tanım                             | Özet                        |
| ------------------ | --------------------------------- | --------------------------- |
| **DbContext**      | Kodla veritabanı arasındaki köprü | DbSet, bağlantı, LINQ → SQL |
| **Code First**     | Kod → Veritabanı                  | Migration kullanır          |
| **Database First** | Veritabanı → Kod                  | Scaffold kullanır           |
| **Model First**    | Tasarım → Kod + DB                | Eski EF6'da var             |
| **LINQ**           | C# içinden sorgulama              | EF bunu SQL'e çevirir       |

---

## 9. Özet

Bu doküman tüm konuları *eksiksiz* olarak içeriyor:

✔ DbContext
✔ LINQ → SQL
✔ Code First
✔ Database First
✔ Model First

