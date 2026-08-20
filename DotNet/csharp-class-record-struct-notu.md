# C#’ta `class`, `record`, `struct` ve `record struct`

> Amaç: Bu not, yapıların yalnızca nasıl yazıldığını değil, **neden var olduklarını**, hangi problemi çözdüklerini ve gerçek projelerde nasıl seçilmeleri gerektiğini öğretir.

---

## 1. Önce büyük resim

C# ile bir sistem geliştirirken farklı türde kavramları kodla temsil ederiz:

- Bir **müşteri**
- Bir **sipariş**
- Bir **koordinat**
- Bir **para miktarı**
- API’ye gönderilen bir **istek**
- Sistemde gerçekleşmiş bir **olay**

Bunların hepsi veri taşır; fakat aynı şekilde davranmaz.

Örneğin bir müşteri, e-posta adresi değişse bile aynı müşteridir. Çünkü müşterinin bir **kimliği** ve zaman içinde devam eden bir **yaşam döngüsü** vardır.

Bir koordinatta ise genellikle ayrı bir kimlik aranmaz. `(10, 20)` değerine sahip iki koordinat, aynı noktayı anlatır.

API’den gelen bir istek modelinde de çoğu zaman nesnenin kimliği değil, içindeki veriler önemlidir.

C# mühendisleri bu farklı anlamları tek bir yapı ile ifade etmek yerine farklı tür seçenekleri sunmuştur:

| Yapı | Temel anlamı |
|---|---|
| `class` | Kimliği ve yaşam döngüsü olan referans nesnesi |
| `struct` | Küçük ve bağımsız bir değer |
| `record class` | Referans türü olarak saklanan, içeriğine göre karşılaştırılan veri modeli |
| `record struct` | Değer türü olarak saklanan, içeriğine göre karşılaştırılan küçük veri modeli |

Buradaki en önemli bilgi şudur:

> `record`, `class` ve `struct` ile aynı seviyede üçüncü bir bellek türü değildir.

`record`, bir `class` veya `struct` üzerine veri odaklı davranışlar ekler.

```csharp
public record UserDto(int Id, string Name);
```

Bu tanım aslında bir `record class` tanımıdır ve **reference type** oluşturur.

```csharp
public record struct Coordinate(int X, int Y);
```

Bu ise **value type** oluşturur.

---

## 2. Bu yapılar neden ortaya çıktı?

### Problem 1: Her nesne aynı şekilde kopyalanmamalı

Bir müşteri nesnesini başka bir değişkene atadığımızda, çoğu zaman aynı müşteri üzerinde çalışmak isteriz.

```csharp
var customer1 = new Customer { Name = "Ayşe" };
var customer2 = customer1;

customer2.Name = "Zeynep";

Console.WriteLine(customer1.Name); // Zeynep
```

`customer1` ve `customer2`, iki ayrı müşteri değildir. İkisi de aynı nesneye ulaşır.

Buna **reference semantics**, yani referans davranışı denir.

Bir koordinatı başka bir değişkene atadığımızda ise bağımsız bir kopya bekleyebiliriz:

```csharp
var point1 = new Point { X = 10, Y = 20 };
var point2 = point1;

point2.X = 50;

Console.WriteLine(point1.X); // 10
Console.WriteLine(point2.X); // 50
```

Buna **value semantics**, yani değer davranışı denir.

C# bu iki farklı ihtiyacı `class` ve `struct` ile ayırır.

---

### Problem 2: Her eşitlik aynı anlama gelmez

İki müşteri nesnesinin adları aynı olabilir; fakat bunlar farklı müşteriler olabilir.

```csharp
var first = new Customer { Id = 1, Name = "Ali" };
var second = new Customer { Id = 1, Name = "Ali" };

Console.WriteLine(first == second); // false
```

Normal bir `class`, varsayılan olarak “Aynı nesne mi?” sorusuna cevap verir.

Fakat iki API modelinin bütün alanları aynıysa, bunları veri açısından eşit saymak isteyebiliriz:

```csharp
var first = new UserDto(1, "Ali");
var second = new UserDto(1, "Ali");

Console.WriteLine(first == second); // true
```

`record`, bu ihtiyacı karşılamak için değer tabanlı eşitlik üretir.

---

### Problem 3: Veri modellerinde çok fazla tekrar eden kod vardı

Bir veri tipinin içeriğine göre eşitliğini normal bir `class` ile doğru biçimde kurmak için genellikle şunları yazmak gerekir:

- `Equals`
- `GetHashCode`
- `==`
- `!=`
- Anlaşılır bir `ToString`
- Kopyalama mantığı

Bu kodlar tekrar eder ve yanlış uygulanabilir.

`record`, veri taşımaya odaklanan tiplerde bu davranışların önemli bölümünü compiler’a ürettirir.

```csharp
public record ProductDto(int Id, string Name, decimal Price);
```

Tek satırlık bu tanım:

- Constructor
- Property’ler
- Değer eşitliği
- `GetHashCode`
- Okunabilir `ToString`
- Deconstruction
- `with` ile kopyalama desteği

gibi davranışlar kazandırır.

---

## 3. Mental model

### `class`: Seri numarası olan bir nesne

Bir telefonu düşün.

Aynı model ve aynı renkte iki telefon bulunabilir; fakat fiziksel olarak iki ayrı telefondur. Her birinin ayrı seri numarası ve yaşam döngüsü vardır.

`class` için de önemli olan çoğu zaman nesnenin **kimliğidir**.

```text
customer1 ───┐
             ├──> Aynı Customer nesnesi
customer2 ───┘
```

İki değişken aynı nesneyi gösterebilir. Bir yerden yapılan değişiklik diğer yerden de görülür.

---

### `struct`: Bir kâğıda yazılmış değer

Bir kâğıda `(10, 20)` koordinatını yazdığını düşün. Kâğıdın fotokopisini çekersen iki bağımsız kopya oluşur.

```text
point1 = { X: 10, Y: 20 }
point2 = { X: 10, Y: 20 }
```

`point2` değiştiğinde `point1` değişmez.

---

### `record`: İçeriği önemli olan form

İki başvuru formunun bütün alanları aynıysa veri bakımından aynı sonucu temsil ettiğini düşünebilirsin.

`record`, “Bu nesne hangi fiziksel örnek?” sorusundan çok “Bu nesnenin içeriği nedir?” sorusuna odaklanır.

Ancak `record class` hâlâ bir referans türüdür. `record`, bellekte tutulma biçimini tek başına belirlemez; eşitlik ve veri modelleme davranışlarını ekler.

---

## 4. Arka planda nasıl çalışırlar?

## `class` çalışma akışı

```csharp
public class Customer
{
    public string Name { get; set; } = "";
}

var a = new Customer { Name = "Ayşe" };
var b = a;
```

Kabaca olay akışı:

1. `new Customer(...)` ile bir nesne oluşturulur.
2. `a`, bu nesneye erişen bir referans tutar.
3. `b = a` çalıştığında nesnenin tamamı kopyalanmaz.
4. Referansın değeri kopyalanır.
5. Artık `a` ve `b` aynı nesneye ulaşır.
6. `b.Name` üzerinden yapılan değişiklik aynı nesne üzerinde gerçekleşir.
7. Bu nedenle değişiklik `a.Name` üzerinden de görülür.

Bu davranış, aynı domain nesnesinin uygulamanın farklı katmanlarında takip edilmesini kolaylaştırır.

---

## `struct` çalışma akışı

```csharp
public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
}

var a = new Point { X = 10, Y = 20 };
var b = a;
```

Kabaca olay akışı:

1. `a`, `Point` değerini taşır.
2. `b = a` çalıştığında değer kopyalanır.
3. `a` ve `b` bağımsız hâle gelir.
4. `b.X` değiştirilirse yalnızca `b` etkilenir.

Bu davranış sayılar, tarihler, koordinatlar ve para miktarları gibi küçük değerler için doğaldır.

---

## Stack ve heap hakkında önemli düzeltme

Sık kullanılan açıklama şudur:

> “Class heap’te, struct stack’te tutulur.”

Bu açıklama eksiktir ve tasarım kararı vermek için güvenilir değildir.

Daha doğru yaklaşım:

- `class` bir **reference type**tır.
- `struct` bir **value type**tır.
- Gerçek bellek yerleşimi kullanım biçimine bağlıdır.

Bir `struct`, bir `class` nesnesinin alanıysa o nesnenin bellekteki düzeninin içinde bulunabilir. Bir `struct`, `object` türüne çevrilirse **boxing** sonucunda managed heap üzerinde bir nesne içine alınabilir.

Bu nedenle seçim yaparken önce “stack mi heap mi?” değil, şu soru sorulmalıdır:

> Bu kavram kimliği olan bir nesne mi, yoksa bağımsız bir değer mi?

---

## 5. `class`: Kimliği ve yaşam döngüsü olan model

Gerçek bir sipariş düşünelim.

```csharp
public class Order
{
    private readonly List<OrderItem> _items = [];

    public Guid Id { get; }
    public OrderStatus Status { get; private set; }

    public IReadOnlyCollection<OrderItem> Items => _items;

    public Order(Guid id)
    {
        Id = id;
        Status = OrderStatus.Draft;
    }

    public void AddItem(Guid productId, int quantity)
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException(
                "Tamamlanmış sipariş değiştirilemez.");

        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity));

        _items.Add(new OrderItem(productId, quantity));
    }

    public void Complete()
    {
        if (_items.Count == 0)
            throw new InvalidOperationException(
                "Boş sipariş tamamlanamaz.");

        Status = OrderStatus.Completed;
    }
}
```

### Burada aslında olan şey şu

`Order` yalnızca veri taşımıyor.

- Bir `Id` ile kimlik taşıyor.
- `Draft` durumundan `Completed` durumuna geçiyor.
- Zaman içinde değişen bir yaşam döngüsü var.
- Geçersiz işlemleri engelliyor.
- İş kurallarını kendi içinde koruyor.

Bu nedenle `Order` için `class` doğal bir seçimdir.

### Gerçek projedeki karşılığı

`class` genellikle şu alanlarda kullanılır:

- Domain entity’leri: `Order`, `Customer`, `Invoice`
- Servisler: `PaymentService`, `EmailSender`
- Veritabanı context’leri
- Dosya ve network kaynakları
- Dependency injection ile yönetilen nesneler
- Uzun süre yaşayan ve durumu değişen modeller

---

## 6. `record class`: Veri taşıyan referans modeli

Bir API isteği düşünelim:

```csharp
public record CreateOrderRequest(
    Guid CustomerId,
    IReadOnlyList<CreateOrderItemRequest> Items);

public record CreateOrderItemRequest(
    Guid ProductId,
    int Quantity);
```

Bu modellerin temel görevi:

- HTTP isteğinden gelen veriyi karşılamak,
- Uygulama katmanına taşımak,
- Kolay doğrulanmak,
- Testlerde karşılaştırılmak.

Bunların bağımsız bir yaşam döngüsü yoktur. Genellikle “Bu aynı request nesnesi mi?” sorusu önemli değildir. İçerik önemlidir.

### Değer eşitliği

```csharp
var first = new CreateOrderItemRequest(
    ProductId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
    Quantity: 2);

var second = new CreateOrderItemRequest(
    ProductId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
    Quantity: 2);

Console.WriteLine(first == second); // true
```

Normal bir `class` olsaydı iki farklı nesne referansı nedeniyle sonuç varsayılan olarak `false` olurdu.

### `with` ifadesi

Record’lar, var olan bir değerden değiştirilmiş yeni bir kopya oluşturmayı kolaylaştırır:

```csharp
public record UserDto(int Id, string Name, string Email);

var original = new UserDto(
    1,
    "Ayşe",
    "ayse@example.com");

var updated = original with
{
    Email = "ayse.yeni@example.com"
};
```

Olay akışı:

1. `original` temel alınır.
2. Yeni bir record nesnesi oluşturulur.
3. Belirtilen property yeni nesnede değiştirilir.
4. `original` aynı kalır.
5. Sonuç `updated` değişkenine atanır.

Bu davranışa **nondestructive mutation** denir: Eski veriyi bozmadan değiştirilmiş yeni veri üretmek.

### Önemli uyarı: `with` derin kopya değildir

```csharp
public record Basket(List<string> Products);

var original = new Basket(["Mouse"]);
var copy = original with { };

copy.Products.Add("Keyboard");

Console.WriteLine(original.Products.Count); // 2
```

Record nesnesi kopyalanmıştır; fakat içindeki `List<string>` referansı iki nesnede de aynıdır.

```text
original.Products ───┐
                     ├──> Aynı List nesnesi
copy.Products ───────┘
```

Bu nedenle record kullanmak bütün nesne grafiğini otomatik olarak immutable yapmaz.

### Gerçek projedeki karşılığı

`record class` şu modeller için sık kullanılır:

- API request ve response modelleri
- DTO’lar
- Command ve query mesajları
- Domain event’leri
- Entegrasyon mesajları
- Configuration snapshot’ları
- İçeriğine göre eşit kabul edilen value object’ler

---

## 7. `struct`: Küçük ve bağımsız değer

Bir koordinat modelleyelim:

```csharp
public readonly struct Coordinate
{
    public int X { get; }
    public int Y { get; }

    public Coordinate(int x, int y)
    {
        X = x;
        Y = y;
    }
}
```

Kullanımı:

```csharp
var first = new Coordinate(10, 20);
var second = first;
```

`second`, `first` değerinin bağımsız bir kopyasıdır.

### Neden `readonly`?

Mutable, yani sonradan değiştirilebilen struct’lar kafa karıştırıcı sonuçlar üretebilir.

```csharp
public struct Money
{
    public decimal Amount { get; set; }
}

public class Order
{
    public Money Total { get; set; }
}
```

```csharp
var order = new Order
{
    Total = new Money { Amount = 100 }
};

var totalCopy = order.Total;
totalCopy.Amount = 200;

Console.WriteLine(order.Total.Amount); // 100
```

`order.Total` okununca struct değeri kopyalanmıştır. Değiştirilen şey `Order` içindeki değer değil, yerel kopyadır.

Bu nedenle struct’lar çoğunlukla immutable tasarlanır:

```csharp
public readonly struct Money
{
    public decimal Amount { get; }

    public Money(decimal amount)
    {
        Amount = amount;
    }
}
```

### Gerçek projedeki karşılığı

`struct` için uygun adaylar:

- `Coordinate`
- `Money`
- `Temperature`
- `DateRange`
- `Color`
- `ProductId`
- Küçük matematiksel vektörler
- Sık kullanılan küçük ölçüm değerleri

.NET’in `int`, `bool`, `decimal`, `DateTime`, `Guid` ve `TimeSpan` gibi birçok yerleşik tipi de struct’tır.

---

## 8. `record struct`: Küçük değer + hazır değer eşitliği

Bir ürün kimliği oluşturalım:

```csharp
public readonly record struct ProductId(Guid Value);
```

Bu yapı bize şunları birlikte verir:

- Value type davranışı
- Bağımsız kopyalar
- Değer tabanlı eşitlik
- Hazır `GetHashCode`
- Okunabilir `ToString`
- `with` desteği
- Kısa tanım

```csharp
var idValue = Guid.Parse(
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

var first = new ProductId(idValue);
var second = new ProductId(idValue);

Console.WriteLine(first == second); // true
```

### Neden doğrudan `Guid` kullanmayalım?

Şu metodu düşün:

```csharp
void AddProduct(Guid orderId, Guid productId)
{
}
```

Parametreleri yanlış sırada vermek mümkündür:

```csharp
AddProduct(productId, orderId);
```

Compiler ikisinin de `Guid` olduğunu gördüğü için hata vermez.

Anlamlı tipler oluşturursak:

```csharp
public readonly record struct OrderId(Guid Value);
public readonly record struct ProductId(Guid Value);

void AddProduct(OrderId orderId, ProductId productId)
{
}
```

Şu çağrı artık derleme hatası üretir:

```csharp
// AddProduct(productId, orderId);
```

Bu yaklaşım **type safety**, yani tip güvenliği sağlar. Primitive obsession olarak bilinen, her iş kavramını `string`, `int` veya `Guid` ile temsil etme problemini azaltır.

---

## 9. Boxing neden önemlidir?

Bir value type, `object` veya uyguladığı bir interface üzerinden kullanılınca boxing oluşabilir.

```csharp
int number = 42;
object boxed = number;
```

Kabaca olay akışı:

1. `number` bir value type’tır.
2. `object`, reference type’tır.
3. Runtime değeri bir nesne içine yerleştirir.
4. Değer bu nesneye kopyalanır.
5. `boxed`, oluşturulan nesneye referans tutar.

Geri almak için unboxing yapılır:

```csharp
int unboxed = (int)boxed;
```

Boxing bazı durumlarda:

- Yeni nesne oluşturulmasına,
- Değerin kopyalanmasına,
- Garbage Collector yükünün artmasına

neden olabilir.

Fakat birkaç boxing işlemi gördüğünde bütün tasarımı değiştirmek doğru değildir. Performans problemi profiler veya benchmark ile ölçülmelidir.

---

## 10. Struct boyutu neden önemlidir?

Class atamasında genellikle referans kopyalanır. Struct atamasında ise değer kopyalanır.

Küçük bir struct için bu doğal ve ucuz olabilir:

```csharp
public readonly record struct Point(int X, int Y);
```

Fakat çok büyük bir struct:

```csharp
public struct LargeMeasurement
{
    public decimal A;
    public decimal B;
    public decimal C;
    public decimal D;
    public decimal E;
    public decimal F;
}
```

sık sık metotlara gönderilir veya koleksiyonlarda taşınırsa kopyalama maliyeti oluşturabilir.

Microsoft’un Framework Design Guidelines belgesi, genel API tasarımı için struct’ların küçük, tek bir değeri temsil eden ve immutable türler olmasını önerir. Belgede yaklaşık 16 byte bir tasarım göstergesi olarak kullanılır; fakat bu mutlak bir runtime kuralı değildir.

Doğru yaklaşım:

1. Önce doğru semantiği seç.
2. Performans kritikse ölçüm yap.
3. Gerçek bir problem varsa `in`, `ref`, `readonly struct` gibi araçları değerlendir.

---

## 11. Default değer problemi

Her struct’ın bir `default` değeri vardır:

```csharp
ProductId id = default;
```

`ProductId` şu şekilde tanımlanmışsa:

```csharp
public readonly record struct ProductId(Guid Value);
```

default durumda `Value`, `Guid.Empty` olur.

Bu değerin domain açısından geçerli olup olmadığını düşünmek gerekir.

Daha riskli bir örnek:

```csharp
public readonly record struct EmailAddress(string Value);
```

```csharp
EmailAddress email = default;
```

Burada `Value`, `null` olabilir. Halbuki geçerli bir e-posta adresi beklenmektedir.

Bu nedenle şu soru önemlidir:

> Tipin bütün alanları default olduğunda ortaya çıkan değer geçerli mi?

Geçerli bir default değer yoksa `record class` daha güvenli olabilir veya struct içinde geçerlilik ayrıca yönetilmelidir.

---

## 12. Immutable olmak ne demektir?

Immutable bir nesne oluşturulduktan sonra iç durumu değişmez.

```csharp
public record UserDto(
    int Id,
    string Name);
```

Positional `record class`, burada `init` property’leri üretir:

```csharp
var user = new UserDto(1, "Ayşe");

// user.Name = "Zeynep"; // Derleme hatası
```

Ancak bütün record’lar otomatik olarak immutable değildir:

```csharp
public record UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}
```

Bu record değiştirilebilir:

```csharp
var user = new UserDto
{
    Id = 1,
    Name = "Ayşe"
};

user.Name = "Zeynep";
```

Aynı şekilde `record struct` da varsayılan olarak her zaman immutable değildir.

```csharp
public record struct Point(int X, int Y);

var point = new Point(10, 20);
point.X = 50;
```

Immutable bir değer tipi için:

```csharp
public readonly record struct Point(int X, int Y);
```

kullanılabilir.

---

## 13. Gerçek bir e-ticaret akışında birlikte kullanım

Şimdi dört yapıyı aynı sistem içinde kullanalım.

### Adım 1: API isteği gelir

```csharp
public record CreateOrderRequest(
    Guid CustomerId,
    IReadOnlyList<CreateOrderItemRequest> Items);

public record CreateOrderItemRequest(
    Guid ProductId,
    int Quantity);
```

Burada `record class` kullanılır çünkü request modellerinin görevi veri taşımaktır.

---

### Adım 2: Primitive değerler anlamlı tiplere çevrilir

```csharp
public readonly record struct CustomerId(Guid Value);
public readonly record struct ProductId(Guid Value);
public readonly record struct OrderId(Guid Value);
```

Bunlar küçük, immutable ve değer eşitliği gereken tiplerdir.

---

### Adım 3: Domain entity oluşturulur

```csharp
public class Order
{
    private readonly List<OrderItem> _items = [];

    public OrderId Id { get; }
    public CustomerId CustomerId { get; }
    public OrderStatus Status { get; private set; }

    public IReadOnlyCollection<OrderItem> Items => _items;

    public Order(OrderId id, CustomerId customerId)
    {
        Id = id;
        CustomerId = customerId;
        Status = OrderStatus.Draft;
    }

    public void AddItem(ProductId productId, int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity));

        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException(
                "Sipariş artık değiştirilemez.");

        _items.Add(new OrderItem(productId, quantity));
    }

    public void Complete()
    {
        if (_items.Count == 0)
            throw new InvalidOperationException(
                "Boş sipariş tamamlanamaz.");

        Status = OrderStatus.Completed;
    }
}
```

`Order`, kimliği ve yaşam döngüsü olduğu için `class`tır.

---

### Adım 4: Sipariş satırı değer olarak modellenir

```csharp
public record OrderItem(
    ProductId ProductId,
    int Quantity);
```

Sipariş satırı burada basit, içeriği önemli bir veri modelidir.

Gerçek sistemde fiyat, indirim ve davranışlar arttıkça bunun ayrı bir class olması da gerekebilir. Tip seçimi yalnızca isme göre değil, modelin davranışına göre yapılır.

---

### Adım 5: Domain olayı oluşturulur

```csharp
public record OrderCompleted(
    OrderId OrderId,
    DateTimeOffset CompletedAt);
```

Bu model, geçmişte gerçekleşen bir olayı temsil eder.

- Kimliği olan ve değişen bir entity değildir.
- Oluştuktan sonra değiştirilmemesi beklenir.
- İçindeki veriler önemlidir.
- Mesaj olarak taşınabilir.

Bu nedenle `record class` uygun bir seçimdir.

---

### Akışın tamamı

```text
HTTP Request
    |
    v
CreateOrderRequest             -> record class
    |
    v
CustomerId / ProductId         -> readonly record struct
    |
    v
Order oluşturulur              -> class
    |
    v
İş kuralları çalışır
    |
    v
OrderCompleted üretilir        -> record class
    |
    v
Mesaj kuyruğu / başka servis
```

Bu örnekte hiçbir yapı diğerinin yerine geçmez. Her biri farklı bir mühendislik ihtiyacını temsil eder.

---

## 14. Mühendislik prensipleriyle ilişkisi

### Domain modelleme

Doğru tip seçimi, sistemdeki kavramın anlamını kod üzerinde görünür kılar.

```csharp
class Order
```

“Bu nesnenin kimliği ve yaşam döngüsü var” mesajını verir.

```csharp
record OrderCompleted
```

“Bu, gerçekleşmiş bir olayın verisidir” mesajını verir.

```csharp
readonly record struct ProductId
```

“Bu küçük, immutable ve değer gibi davranan bir kimliktir” mesajını verir.

---

### Maintainability

Record, tekrar eden eşitlik ve yazdırma kodlarını azaltır. Daha az altyapı kodu, daha az hata ve daha kolay bakım sağlayabilir.

Ancak her şeyi record yapmak da iyi değildir. Entity ile veri mesajı arasındaki anlam farkı kaybolabilir.

---

### Consistency

Elle eşitlik uygularken `Equals` ve `GetHashCode` tutarsız yazılabilir. Bu hata özellikle `Dictionary` ve `HashSet` kullanırken sorun üretir.

Record, ilgili üyeleri birlikte üreterek tutarlılığı kolaylaştırır.

---

### Testability

Record modelleri testlerde kolay karşılaştırılır:

```csharp
var expected = new UserDto(1, "Ayşe");
var actual = service.GetUser();

Assert.Equal(expected, actual);
```

Normal class kullanıldığında property’leri tek tek karşılaştırmak veya özel eşitlik yazmak gerekebilir.

---

### Type safety

```csharp
public readonly record struct OrderId(Guid Value);
public readonly record struct ProductId(Guid Value);
```

gibi tipler, aynı primitive türün farklı anlamlarda yanlışlıkla kullanılmasını engeller.

Bu, compiler’ı iş kurallarının bir bölümünü koruyan yardımcıya dönüştürür.

---

## 15. Avantajlar ve maliyetler

## `class`

### Avantajları

- Kimlik ve yaşam döngüsü modellemeye uygundur.
- Kalıtım ve polymorphism destekler.
- Büyük nesnelerde tüm veri yerine referans kopyalanır.
- Servis ve domain entity’leri için doğaldır.
- Paylaşılan nesne durumunu takip etmeyi sağlar.

### Maliyetleri

- Çok sayıda küçük nesne allocation oluşturabilir.
- Mutable state yan etkilere yol açabilir.
- Değer eşitliği isteniyorsa ayrıca uygulanmalıdır.
- Aynı nesnenin birçok yerde değiştirilmesi sistemi takip etmeyi zorlaştırabilir.

---

## `record class`

### Avantajları

- Değer eşitliği hazır gelir.
- Kısa ve okunabilir tanım sunar.
- `with` desteği vardır.
- DTO, event ve mesaj modellerine uygundur.
- Immutable tasarımı kolaylaştırır.
- Testlerde rahat karşılaştırılır.

### Maliyetleri

- Hâlâ reference type’tır.
- Otomatik olarak tamamen immutable değildir.
- `with` sığ kopya oluşturur.
- İçindeki mutable koleksiyonlar paylaşılabilir.
- Entity’lerde değer eşitliği istenmeyen sonuçlar oluşturabilir.

---

## `struct`

### Avantajları

- Value semantics sağlar.
- Küçük değerlerde allocation azaltabilir.
- Kopyalar birbirinden bağımsızdır.
- Sayısal ve düşük seviyeli veri modellerinde uygundur.

### Maliyetleri

- Her atamada veya parametre geçişinde kopyalanabilir.
- Büyük struct’lar pahalı olabilir.
- Mutable struct’lar şaşırtıcıdır.
- Boxing oluşabilir.
- Kalıtım desteklemez.
- Her zaman bir default değeri vardır.

---

## `record struct`

### Avantajları

- Value type davranışı ile hazır değer eşitliğini birleştirir.
- Küçük value object’ler için kısa ve güçlüdür.
- `ToString`, `GetHashCode`, `==` ve `with` desteği sağlar.
- Strongly typed ID modellerinde kullanışlıdır.

### Maliyetleri

- Struct’ın kopyalama ve boxing risklerini taşır.
- Varsayılan olarak her zaman immutable değildir.
- Büyük veri modellerine uygun değildir.
- Geçersiz default değer üretilebilir.

---

## 16. Küçük ve büyük projelerde yaklaşım

### Küçük projede

Güvenli başlangıç yaklaşımı:

```text
Entity ve servis       -> class
DTO ve API modeli      -> record class
Küçük gerçek değer     -> readonly record struct
Emin değilsen          -> class veya record class
```

Performans için erken struct kullanımına gerek yoktur. Basit bir CRUD uygulamasındaki bütün DTO’ları struct yapmak genellikle gereksizdir.

---

### Büyük projede

Daha fazla konu değerlendirilir:

- Entity ile value object ayrımı
- Eşitlik semantiği
- Immutable veri akışı
- ORM ve serializer davranışı
- Mesaj sözleşmelerinin versioning’i
- Allocation ve Garbage Collector etkisi
- Struct boyutu
- Boxing
- Public API uyumluluğu

Senior yaklaşım “Hangisi daha hızlı?” diye başlamaz.

Önce şunu sorar:

> Modelin gerçek anlamını hangi tür daha doğru ifade ediyor?

Ardından performans gerçekten önemliyse ölçüm yapar.

---

## 17. Entity Framework için dikkat

Entity Framework Core ile takip edilen entity’ler genellikle `class` olarak modellenir.

Bunun nedenleri:

- Entity kimliği
- Change tracking
- Navigation property’ler
- Nesne yaşam döngüsü
- Bazı senaryolarda proxy mekanizmaları

```csharp
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}
```

Bir entity’yi record olarak tanımlamak teknik olarak bazı senaryolarda mümkün olabilir; fakat record’un değer eşitliği ile entity’nin kimliği aynı kavram değildir.

İki entity aynı property değerlerine sahip olsa bile ayrı veritabanı satırlarını temsil edebilir. Bu nedenle EF entity’lerinde normal `class` çoğunlukla daha güvenli ve daha anlaşılır varsayılandır.

---

## 18. Yaygın yanlış anlaşılmalar

### “Struct her zaman stack’tedir.”

Yanlış. Struct’ın gerçek bellek yerleşimi kullanım bağlamına bağlıdır. Temel fark value semantics olmasıdır.

### “Struct her zaman class’tan hızlıdır.”

Yanlış. Büyük kopyalar ve boxing struct’ı daha pahalı hâle getirebilir.

### “Record immutable class demektir.”

Eksik. Record mutable property’ler içerebilir.

### “Record bir value type’tır.”

Yanlış. Tek başına `record`, `record class` anlamına gelir ve reference type’tır.

### “Record içindeki liste de otomatik kopyalanır.”

Yanlış. `with` işlemi sığ kopya oluşturur.

### “Her value object struct olmalıdır.”

Yanlış. Boyut, null ihtiyacı, default değer, boxing ve kullanım biçimi değerlendirilmelidir.

### “DTO her zaman record olmalıdır.”

Yanlış. Record iyi bir varsayılan olabilir; fakat framework, serializer veya takım standartları nedeniyle class da kullanılabilir.

---

## 19. Junior geliştiricinin sık kaçırdığı noktalar

1. Seçimin yalnızca performans kararı olmadığını kaçırmak.
2. Entity kimliği ile değer eşitliğini karıştırmak.
3. Record’un derin immutable olduğunu sanmak.
4. Mutable struct kullanmanın kopya davranışını görmemek.
5. Büyük struct’ın sürekli kopyalanabileceğini düşünmemek.
6. Struct’ın default değerini hesaba katmamak.
7. Record içindeki `List<T>` eşitliğinin liste içeriğini otomatik karşılaştıracağını sanmak.
8. Hash tabanlı koleksiyonlarda eşitliğe katılan mutable alanları değiştirmek.

Örneğin:

```csharp
public record User
{
    public string Email { get; set; } = "";
}
```

Bu nesne `HashSet<User>` içine eklendikten sonra `Email` değiştirilirse hash değeri değişebilir. Koleksiyon nesneyi doğru yerde bulamayabilir.

Bu nedenle değer eşitliği kullanılan modellerin immutable olması çoğu zaman daha güvenlidir.

---

## 20. Karar ağacı

```text
Tipin benzersiz kimliği veya yaşam döngüsü var mı?
|
+-- Evet
|   |
|   +-- class
|
+-- Hayır
    |
    +-- İçeriğine göre eşitlik gerekiyor mu?
        |
        +-- Hayır
        |   |
        |   +-- Çoğunlukla class
        |
        +-- Evet
            |
            +-- Küçük, immutable ve doğal bir değer mi?
                |
                +-- Evet
                |   |
                |   +-- readonly record struct
                |
                +-- Hayır
                    |
                    +-- record class
```

Performans nedeniyle struct düşünüyorsan:

```text
Ölçüm var mı?
|
+-- Hayır -> class veya record class ile başla
|
+-- Evet  -> Kopyalama, boxing ve allocation sonuçlarını karşılaştır
```

---

## 21. Hızlı karşılaştırma

| Özellik | `class` | `record class` | `struct` | `record struct` |
|---|---|---|---|---|
| Tür kategorisi | Reference type | Reference type | Value type | Value type |
| Atamada | Referans kopyalanır | Referans kopyalanır | Değer kopyalanır | Değer kopyalanır |
| Varsayılan amaç | Kimlik ve davranış | Veri ve değer eşitliği | Küçük bağımsız değer | Küçük veri ve değer eşitliği |
| Değer eşitliği | Elle uygulanır | Compiler üretir | `Equals` vardır, `==` genellikle yoktur | Compiler üretir |
| `with` desteği | Normalde yok | Var | Normalde yok | Var |
| Kalıtım | Var | Record class’lar arasında var | Yok | Yok |
| `null` | Olabilir | Olabilir | `T?` ile | `T?` ile |
| Mutable olabilir | Evet | Evet | Evet | Evet |
| Önerilen immutable biçim | Tasarıma bağlı | `init` property | `readonly struct` | `readonly record struct` |
| Entity için | Çok uygun | Dikkatli kullanılmalı | Uygun değil | Uygun değil |
| DTO ve event için | Kullanılabilir | Çok uygun | Özel durum | Küçük modeller |
| Küçük value object için | Kullanılabilir | Uygun | Uygun | Çok uygun |

---

## 22. Ezberlenmesi gereken mental model

```text
class
“Bu nesne kim ve yaşam döngüsü nasıl?”

record class
“Bu veri paketinin içeriği nedir?”

struct
“Bu küçük değerin kendisi nedir?”

readonly record struct
“Bu küçük ve immutable değer nedir; içeriğine göre eşitlik gerekiyor mu?”
```

Günlük projelerde iyi bir başlangıç:

```text
Order, Customer, Service       -> class
Request, Response, Event, DTO  -> record class
Money, Coordinate, Typed ID    -> readonly record struct
```

Son karar her zaman modelin anlamına göre verilmelidir.

> Önce doğru semantiği kur. Performans optimizasyonunu ölçüm yaptıktan sonra düşün.

---

## Resmî kaynaklar

- [C# record types — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records)
- [C# structs — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs)
- [Reference types — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types)
- [Choosing Between Class and Struct — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct)
- [Struct Design Guidelines — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/struct)
- [Boxing and Unboxing — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing)
