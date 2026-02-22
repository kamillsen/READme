# Pipeline ve Middleware Arasındaki İlişki

Yazılım geliştirme dünyasında **Pipeline** ve **Middleware** kavramları, özellikle web çatıları (framework) ve veri işleme sistemlerinde birlikte çalışır.

---

## Pipeline (İşlem Hattı) Nedir?

Pipeline, bir **yol haritasıdır.** İsteğin veya verinin hangi aşamalardan geçerek işleneceğini belirler.

- Sunucuya gelen istek, cevaba dönüşene kadar belirli bir hattan geçer.
- İşte bu hat **pipeline**'dır.

## Middleware (Ara Yazılım) Nedir?

Middleware, bu yol haritasındaki **duraklardır.** İsteğin veya verinin, pipeline içinde sırayla geçtiği her bir işlem birimidir.

Pipeline üzerinde sıralanmış olan aşağıdaki gibi işlemleri yapan her bir yazılım parçası bir **middleware**'dir:

- Kimlik doğrulama (Authentication)
- Loglama (Logging)
- Sıkıştırma (Compression)
- Yönlendirme (Routing)

---

## İlişkileri Nasıl Özetlenir?

| Kavram | Rolü |
|---|---|
| **Pipeline** | Middleware'lerin sıralı bir şekilde çalıştırıldığı yapının ta kendisi |
| **Middleware** | Pipeline içindeki her bir işlem birimi (durak) |

> **Kısacası:** Middleware'ler olmadan bir pipeline sadece boş bir konsepttir; pipeline olmadan ise middleware'lerin bir düzen içinde çalışacağı bir yapı olmaz.

---

## Görsel Akış

```
[İstek] → [Middleware 1: Loglama] → [Middleware 2: Kimlik Doğrulama] → [Middleware 3: Yetkilendirme] → [İşlem] → [Cevap]
           └──────────────────────── Pipeline ────────────────────────────────────┘
```

---

## Not

"Pioline" diye bir kavram yazılım dünyasında bulunmamaktadır. Doğru terim **Pipeline** (İşlem Hattı) olarak geçer.
