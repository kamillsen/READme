# Redis Temel Kavramlar

Kısa cevap:

**Redis bir kütüphane değil, RAM'de çalışan süper hızlı bir "uzak sözlük (key–value) veritabanı"dır.**

Uygulaman ASP.NET Core, DB'in SQL Server/PostgreSQL; Redis ise bunların yanında duran turbo hızlı bir yardımcı servis.

Aşağıda "hiç bilmiyorum" seviyesinden, .NET gözünle anlatıyorum 👇

---

## 1️⃣ Redis nedir? (.NET'çi için sade tanım)

Redis, **açık kaynak, in-memory (RAM'de çalışan), NoSQL key–value veri tabanıdır**. Verileri diskte değil öncelikli olarak RAM'de tuttuğu için **çok düşük gecikmeyle** çalışır. Ayrıca sadece düz string değil; **string, list, set, sorted set, hash, stream** gibi veri yapıları sunar.

Genelde şu işler için kullanılır:

* **Cache** → DB'den gelen sonuçları veya hesaplamaları saklamak
* **Session store** → kullanıcı oturumlarını merkezi bir yerde tutmak
* **Mesajlaşma** → pub/sub, queue benzeri senaryolar
* **Gerçek zamanlı sayaçlar, leaderboard, rate limit vs.**

Ve çok önemli:

> **Redis = ayrı çalışan bir server**

> **Senin .NET kodun = Redis'e bağlanan client**

Yani Redis **kütüphane değil**, tıpkı SQL Server gibi **dışarıdaki bir servis**. .NET tarafında onu kullanmak için **client kütüphanesi** ekliyorsun.

---

## 2️⃣ Felsefesi: "RAM'deki veri tabanım"

Kafanda şöyle canlandır:

* **Klasik DB (SQL Server, PostgreSQL):**
  * Veri **diskte** durur.
  * Okuma/yazma görece yavaştır ama **kalıcıdır**.

* **Redis:**
  * Veri **RAM'de** durur → **inanılmaz hızlıdır**.
  * İstenirse disk'e de persist edebilir ama ana olayı hız.

Redis'in **in-memory veri deposu** olarak tasarlandığı, RAM kullandığı için milllisaniye altı gecikme hedeflediği bilinir.

💡 Mantık:

"**En sık eriştiğim, çok hesapladığım, ama gerektiğinde tekrar üretebileceğim verileri** veritabanına her seferinde gitmeden, RAM'de tutayım."

Örneğin:

* Bir ürün detay sayfası:
  * İlk istek → DB'den oku → Redis'e koy
  * Sonraki istekler → Direkt Redis'ten oku (DB'ye yük binmez)

Böylece:

* Uygulaman **daha hızlı**,
* DB'in **daha az yorulmuş** oluyor,
* Sistem daha iyi **scale** oluyor.

---

## 3️⃣ Temel kavramlar: Key–Value + veri yapıları

### 3.1 Key–Value mantığı

Redis dünyasında ana model:

```
key -> value
```

* **Key**: benzersiz string (örn: `"user:123"`, `"product:42"`)
* **Value**: farklı tiplerde veri

Redis'i "distanced dictionary" (Remote Dictionary Server) gibi düşünmemiz önerilir: sanki uygulaman içindeki `Dictionary<string, object>` var ama bu sözlük ayrı bir server'da koşuyor.

### 3.2 Veri türleri (data types)

En temel veri tipleri:

* **String**
  * Basit "değer" → JSON, token, sayaç, text, binary…
  * Örn: `"user:1" -> "{ id: 1, name: 'Kamil' }"`

* **Hash**
  * Sözlük içinde sözlük gibi: field–value çifti
  * Örn: `"user:1" -> { name: "Kamil", age: "23" }`
  * Kullanıcı profili, ayarlar vb. için ideal.

* **List**
  * Sıralı liste (Linked list gibi düşünebilirsin).
  * Kuyruk, son mesajlar vs.

* **Set**
  * Benzersiz eleman kümesi (sıra önemli değil).
  * Örn: `"online-users" -> { "u1", "u2", "u3" }"`

* **Sorted Set (ZSet)**
  * Skor'a göre sıralı set (leaderboard, puan tablosu)
  * Örn: `"scores" -> { ("kamil", 100), ("ahmet", 80) }"`

* **Streams, HyperLogLog, Bitmaps…**
  * Daha ileri use caseler: event log, unique count vs.

Bu zengin veri yapıları sayesinde "sırf cache değil, küçük problemler için mini sistemler" de kurabiliyorsun (queue, leaderboard, rate limit vs).

---

## 4️⃣ Redis ne **değildir**?

* ❌ Bir **.NET kütüphanesi** değildir → ayrı çalışan bir **server**.
* ❌ SQL gibi relational değildir → **NoSQL key–value / data structure store**.
* ❌ EF Core alternatifi değildir → onun yanında, **tamamlayıcı** bir bileşen.

Doğru mental model:

> "Uygulamanın yanında duran, RAM'de çalışan, çok hızlı bir yardımcı veri katmanı."

---

## 5️⃣ .NET dünyasında Redis nereye oturuyor?

Tipik mimari:

```
[Client] -> [ASP.NET Core API] -> [Redis] -> [SQL Server/PostgreSQL]
```

* **API:**
  * Önce Redis'e bakar: "Bu verinin cache'i var mı?"
  * Yoksa DB'den alır, Redis'e yazar, sonra response döner.

* **Session:**
  * Kullanıcı login olunca session'ını Redis'te saklarsın.

* **Microservice:**
  * Servisler arası event, pub/sub, shared cache.

Azure tarafında da "Azure Cache for Redis" diye managed hizmet var; bu da bildiğin Redis'i sen yönetmeden Azure'un işletmesi gibi düşünebilirsin.

---

## 6️⃣ .NET'te nasıl kullanılır? (pratik gözle)

### 6.1 Taraflar

1. **Redis server**
   * Lokal'de Docker ile çalıştırabilirsin, ya da
   * Cloud'da (Azure Cache for Redis, Redis Cloud vs.) çalışır.

2. **.NET client kütüphanesi**
   * Önerilen modern yaklaşım:
     * **StackExchange.Redis** (temel client)
     * Üzerinde **NRedisStack** (Redis'in tüm gelişmiş özelliklerini kapsayan genişletilmiş client)

Senin için anlamı:

> Projene **NuGet'ten bir client paketi yüklersin**, C# kodundan Redis'e bağlanırsın, string set/get, hash, list vs. işlemlerini bu client ile yaparsın.

### 6.2 Bağlantı mantığı (StackExchange.Redis örneği)

Bu kütüphanede merkezde **ConnectionMultiplexer** diye bir sınıf var ve bunu **uygulama boyunca tek instance** kullanman öneriliyor (her istek için yeniden yaratma).

Kafada şöyle tut:

```csharp
// 1) Uygulama açılırken bağlantıyı kur (singleton gibi)
var mux = await ConnectionMultiplexer.ConnectAsync("localhost:6379");

// 2) Bir DB nesnesi al
var db = mux.GetDatabase();

// 3) Veri yaz
await db.StringSetAsync("user:1:name", "Kamil");

// 4) Veri oku
var name = await db.StringGetAsync("user:1:name");
```

Mantık:

* `ConnectionMultiplexer` → fiziksel bağlantıyı yönetir (pooling vs.)
* `GetDatabase()` → Redis içindeki "default DB" için client nesnesi.
* `StringSetAsync / StringGetAsync` → Redis komutlarını C# methodları olarak kullanıyorsun.

Aynı mantık NRedisStack için de geçerli, sadece daha çok özellik (search, JSON, timeseries vs.) geliyor.

### 6.3 Basit bir cache örneği (senin dünyandan)

Senaryon: `GET /products/{id}` endpoint'in var.

Pseudo kod:

```csharp
public async Task<ProductDto> GetProduct(int id)
{
    var cacheKey = $"product:{id}";
    
    // 1) Önce Redis'ten dene
    var cachedJson = await _redis.StringGetAsync(cacheKey);
    if (!cachedJson.IsNullOrEmpty)
    {
        return JsonSerializer.Deserialize<ProductDto>(cachedJson!);
    }
    
    // 2) Yoksa DB'den al
    var product = await _dbContext.Products.FindAsync(id);
    if (product is null)
        return null;
    
    // 3) Redis'e yaz - örneğin 5 dk TTL ile
    var json = JsonSerializer.Serialize(product);
    await _redis.StringSetAsync(cacheKey, json, TimeSpan.FromMinutes(5));
    
    return product;
}
```

Burada Redis'i tamamen bir **cache katmanı** gibi kullanıyorsun.

---

## 7️⃣ Neden Redis'e ihtiyaç var, olmasa ne olur?

* **Yüksek trafik + yüksek concurrency** durumunda:
  * Her istekte DB'ye gitmek → CPU + IO'yu boğar.
  * Response süreleri artar, scaling pahalılaşır.

* Redis ile:
  * **Sıcak veriyi RAM'de** tutarsın → DB rahatlar.
  * Cevap süreleri düşer (ms → sub-ms).
  * Aynı donanımla daha fazla kullanıcıya hizmet.

Redis kullanmasan da sistem çalışır; ama growth geldiğinde:

* Yavaşlayan endpointler,
* CPU/disk tıkanmaları,
* QPS (request per second) limitlerine daha çabuk dayanma

gibi problemler yaşarsın.

---

## 8️⃣ Güvenlik ve production'da dikkat edilmesi gerekenler

* Redis'i **doğrudan internete açık** bırakma (sadece internal network'ten erişilsin).
* **Auth** ve mümkünse **TLS** kullan (özellikle cloud ortamında).
* Redis versiyonunu güncel tut (yakın zamanda kritik bir RCE açığı çıktı ve son sürümlerde kapatıldı).

Junior seviyede bile olsan, Redis kurarken en azından şu checklist'i bil:

* Default port (6379) dış dünyaya açık mı? (açık olmasın)
* Parola / ACL var mı?
* Prod'da TLS var mı?

---

## 9️⃣ Kafanda tutman gereken özet

Son kez kompakt yazıyorum:

* 🔹 **Redis nedir?**
  RAM'de çalışan, çok hızlı bir **key–value / data structure veritabanı**.

* 🔹 **Kütüphane mi?**
  Hayır, **ayrı bir server**. .NET'te **StackExchange.Redis / NRedisStack** gibi client kütüphanelerle bağlanıyorsun.

* 🔹 **Ne için kullanırım?**
  Cache, session, queue, pub/sub, sayaçlar, leaderboard, rate limit, mikroservisler arası hızlı veri paylaşımı.

* 🔹 **Neden var?**
  Klasik DB + disk IO, yüksek trafikte yavaş; Redis RAM'de olduğu için **çok hızlı**, DB yükünü hafifletip sistemi ölçeklenebilir yapıyor.

* 🔹 **.NET tarafında ne yapacağım?**
  * Redis server (Docker/Cloud) kur
  * Projeye StackExchange.Redis veya NRedisStack ekle
  * Uygulama başlarken bir `ConnectionMultiplexer` oluştur
  * `GetDatabase()` ile `StringSet`, `StringGet`, `HashSet` vs. kullan
  * Cache / session / vs. senaryoları implemente et

---

İstersen sıradaki adımda şunu yapabiliriz:

* Sana küçük bir **Docker + Redis** setup'ı (docker-compose) vereyim,
* Üstüne de **minimal bir ASP.NET Core API + Redis cache** örneğini baştan sona, satır satır "felsefesi ne, neden böyle yazıyoruz?" diye açıklayalım.

