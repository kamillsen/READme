# REST API Tasarımı

REST API'yi şöyle düşün:

Ön tarafta (web, mobil, başka servisler) **"bir şeyler isteyen" müşteriler** var, arkada da **"veri ve iş mantığı tutan" bir mutfak** (server).

REST, bu ikisinin **aynı dili konuşmasını sağlayan kurallar seti**.

---

## 1. REST API nedir, neden var?

**Açılımı:** REpresentational State Transfer

Ama ezberlemene gerek yok, mantık önemli.

**Temel fikir:**

* İstemci (client) → HTTP isteği gönderir (GET, POST, PUT, DELETE…)
* Sunucu (server) → Cevap döner (JSON, XML vs. genelde JSON)
* Bu iletişim için belli **kurallar** var:

  * URL yapısı belli
  * HTTP method'ları belli
  * HTTP status code'ları belli
  * Sunucu *stateless* (her istek kendi içinde anlamlı)

✨ **Neyi çözüyor?**

Farklı uygulamaların (web, mobil, 3. parti servisler) **standart bir şekilde konuşmasını** sağlıyor.

```text
[ Web Uygulaması ]      [ Mobil Uygulama ]      [ Diğer Servis ]

          \                    |                    /

           \                   |                   /

                   ->  [ REST API ]  ->

                         (C# .NET)

                             |

                             v

                       [ Veritabanı ]
```

---

## 2. Resource (Kaynak) kavramı

REST dünyasında her şey **"resource"** olarak düşünülür:

* Kullanıcılar → `/api/users`
* Ürünler → `/api/products`
* Siparişler → `/api/orders`

**Resource = sistemdeki "şeyler"**

Bu şeylerin her birinin **ID'si** olur:

* Tüm ürünler: `GET /api/products`
* Tek ürün: `GET /api/products/5`

Buradaki `/api/products` bir **resource koleksiyonu**, `/api/products/5` ise bir **tekil resource**.

---

## 3. Endpoint tasarımı (URL + HTTP Method)

Endpoint = **URL + HTTP method** birleşimi.

Örnek resource: `Product` (Ürün)

RESTful mantıkla tipik endpoint'ler:

| İşlem                | HTTP Method | URL                | Açıklama      |
| -------------------- | ----------- | ------------------ | ------------- |
| Tüm ürünleri listele | GET         | `/api/products`    | Read (List)   |
| Tek ürün getir       | GET         | `/api/products/10` | Read (Detail) |
| Yeni ürün ekle       | POST        | `/api/products`    | Create        |
| Ürün güncelle        | PUT         | `/api/products/10` | Full update   |
| Ürün sil             | DELETE      | `/api/products/10` | Delete        |

Dikkat et:

* URL'lerde **fiil yok**: `/api/products/deleteProduct` ❌

  `/api/products/10` + `DELETE` ✅

* Çoğul isim kullan: `/api/product` yerine `/api/products` ✅

Filtreleme de genelde query string ile:

* `GET /api/products?category=phone&minPrice=1000`

---

## 4. HTTP Status Code mantığı

HTTP status code = "Sunucunun cevabının durumu"

3 ana grup bizim için önemli:

* **2xx → Başarılı**

  * `200 OK` → İstek başarılı, veri döndüm
  * `201 Created` → Yeni bir kayıt oluşturdum
  * `204 No Content` → Başarılı ama gövde yok (genelde update/delete)

* **4xx → İstemci hatası (sen yanlış yaptın)**

  * `400 Bad Request` → Gönderdiğin veri hatalı / eksik
  * `401 Unauthorized` → Giriş yapmamışsın
  * `403 Forbidden` → Giriş var ama yetkin yok
  * `404 Not Found` → Aradığın resource yok

* **5xx → Sunucu hatası (ben patladım)**

  * `500 Internal Server Error` → Beklenmeyen hata

REST'in güzelliği: **status code'lara bakarak ne olduğunu anlarsın.**

---

## 5. C# .NET ile basit REST API örneği

### 5.1. Basit Product modeli

```csharp
public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public decimal Price { get; set; }
}
```

### 5.2. Controller örneği (ASP.NET Core)

```csharp
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

[ApiController]
[Route("api/[controller]")] // => api/products
public class ProductsController : ControllerBase
{
    // Demo amaçlı in-memory liste
    private static readonly List<ProductDto> _products = new()
    {
        new ProductDto { Id = 1, Name = "Telefon", Price = 15000 },
        new ProductDto { Id = 2, Name = "Laptop",  Price = 30000 }
    };

    // GET api/products
    [HttpGet]
    public ActionResult<List<ProductDto>> GetAll()
    {
        return Ok(_products); // 200 OK
    }

    // GET api/products/1
    [HttpGet("{id:int}")]
    public ActionResult<ProductDto> GetById(int id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product == null)
            return NotFound(); // 404
        return Ok(product); // 200
    }

    // POST api/products
    [HttpPost]
    public ActionResult<ProductDto> Create(ProductDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required"); // 400

        dto.Id = _products.Max(p => p.Id) + 1;
        _products.Add(dto);

        // 201 + Location header: /api/products/{id}
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    // PUT api/products/1
    [HttpPut("{id:int}")]
    public IActionResult Update(int id, ProductDto dto)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product == null)
            return NotFound(); // 404

        product.Name = dto.Name;
        product.Price = dto.Price;

        return NoContent(); // 204
    }

    // DELETE api/products/1
    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product == null)
            return NotFound(); // 404

        _products.Remove(product);

        return NoContent(); // 204
    }
}
```

Bu controller:

* **Resource:** `Product`
* **Endpoint'ler:**

  * `GET /api/products` → Liste
  * `GET /api/products/{id}` → Detay
  * `POST /api/products` → Ekle
  * `PUT /api/products/{id}` → Güncelle
  * `DELETE /api/products/{id}` → Sil

* **Status code'ları düzgün kullanıyor:**

  * `Ok(...)` → 200
  * `CreatedAtAction(...)` → 201
  * `BadRequest(...)` → 400
  * `NotFound()` → 404
  * `NoContent()` → 204

---

## 6. REST'in avantajları neler?

Özet:

1. **Basit ve anlaşılır**

   * HTTP zaten bildiğimiz bir protokol
   * URL'ler ve method'lar insan okuyabilir şekilde

2. **Dil bağımsız**

   * Sunucu C# .NET olabilir
   * İstemci React, Vue, Angular, Flutter, Android, iOS fark etmez
   * JSON konuşabildiği sürece herkes kullanır

3. **Stateless**

   * Her istek kendi içinde anlamlı
   * Sunucu, önceki isteğini hatırlamak zorunda değil
   * Scale etmek (yatay büyümek) kolay

4. **Cache'lenebilir**

   * GET istekleri cache'lenebilir
   * Performans artışı sağlar

5. **Standart**

   * HTTP method
   * Status code
   * Header yapısı
   * Loglama, monitoring, proxy vs. hepsi hazır dünyada

---

## 7. Alternatifler neler, neden yine de REST çok popüler?

Kısaca birkaç alternatif:

* **SOAP**

  * XML tabanlı, daha ağır, karmaşık
  * Eski kurumsal sistemlerde çok
  * Şu an yeni projelerde daha az tercih ediliyor

* **gRPC**

  * Binary format (Protobuf), çok hızlı
  * Mikroservisler arası iletişimde süper
  * Tarayıcı tarafında kullanmak daha zor (ek proxy vs. gerekiyor)

* **GraphQL**

  * Tek endpoint, client ne istiyorsa onu seçiyor
  * Esnek ama öğrenme eğrisi daha yüksek
  * API tasarım şekli farklı

**Neden hala REST en yaygını?**

* Öğrenmesi kolay
* HTTP'nin doğal kullanımına çok yakın
* Tool desteği çok fazla (Postman, Swagger, vs.)
* Web dünyasının ortak dili haline geldi

---

## 8. Özet – REST bize neyi kolay yapmamızı sağlıyor?

* Frontend (web, mobil) ve backend arasında **net bir sözleşme** tanımlıyoruz.
* URL + HTTP method + status code ile **davranışı standartlaştırıyoruz**.
* Farklı teknolojiler (C#, Java, Node, Python, Go…) **aynı protokolle konuşuyor**.
* Mikroservis mimarilerinde servislerin **birbirleriyle haberleşmesini** kolaylaştırıyor.

