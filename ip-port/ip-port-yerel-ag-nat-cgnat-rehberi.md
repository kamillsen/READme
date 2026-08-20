# IP, Port, Yerel Ağ, Router, NAT ve CGNAT

Bu dokümanın amacı, bilgisayarların ve uygulamaların ağ üzerinden nasıl iletişim kurduğunu günlük hayattan örneklerle açıklamaktır.

Konunun temel cümlesi şudur:

> **IP adresi hangi cihaza, port ise o cihazdaki hangi uygulamaya gidileceğini belirtir.**

---

# 1. Büyük resim

Bir bilgisayarda aynı anda birçok uygulama çalışabilir:

- Tarayıcı
- Frontend projesi
- Backend projesi
- PostgreSQL
- Redis
- Discord
- Spotify

Bu uygulamaların birbirleriyle veya başka bilgisayarlarla iletişim kurabilmesi gerekir.

Burada iki temel soru ortaya çıkar:

1. Mesaj hangi bilgisayara gidecek?
2. O bilgisayarda hangi uygulamaya teslim edilecek?

Bu soruların cevapları:

```text
IP adresi → Hangi bilgisayar?
Port      → O bilgisayardaki hangi uygulama?
```

---

# 2. Günlük hayat benzetmesi

Bir bilgisayarı apartman olarak düşünelim.

```text
Bilgisayar = Apartman
IP adresi  = Apartmanın açık adresi
Port       = Apartmandaki daire numarası
Uygulama   = Dairede yaşayan kişi
```

Örneğin:

```text
192.168.1.20:8080
```

şu anlama gelir:

```text
Apartman adresi: 192.168.1.20
Daire numarası:  8080
```

Bir mesaj gönderildiğinde aslında şöyle denir:

> “Mesajı `192.168.1.20` adresindeki bilgisayara götür ve `8080` numaralı uygulamaya teslim et.”

Sadece IP adresi olsaydı mesaj doğru bilgisayara giderdi, fakat hangi uygulamaya teslim edileceği bilinmezdi.

Sadece port olsaydı hangi bilgisayardaki porta gidileceği bilinmezdi.

Bu nedenle genellikle ikisi birlikte kullanılır:

```text
IP + Port
```

---

# 3. Port neden gereklidir?

Bir bilgisayarda farklı servisler farklı portlarda çalışabilir:

```text
Frontend        localhost:5173
Backend API     localhost:8080
PostgreSQL      localhost:5432
Redis           localhost:6379
```

Hepsi aynı bilgisayardadır. Onları birbirinden ayıran şey port numaralarıdır.

Apartman benzetmesiyle:

```text
5173 numaralı daire → Frontend
8080 numaralı daire → Backend
5432 numaralı daire → PostgreSQL
6379 numaralı daire → Redis
```

Portlar fiziksel girişler değildir. İşletim sisteminin ağ trafiğini doğru uygulamaya yönlendirmek için kullandığı sayısal kimliklerdir.

---

# 4. Aynı bilgisayardaki projeler nasıl konuşur?

Şu geliştirme ortamını düşünelim:

```text
Frontend → localhost:5173
Backend  → localhost:8080
Database → localhost:5432
```

Frontend şu isteği gönderiyor:

```javascript
fetch("http://localhost:8080/users");
```

Bu kodun anlamı şudur:

> “Bu bilgisayarın içindeki 8080 portunda çalışan uygulamaya git ve `/users` bilgisini iste.”

Akış kabaca şöyledir:

```text
Frontend
   ↓
İşletim sistemi
   ↓
8080 portunu dinleyen backend
   ↓
İşletim sistemi
   ↓
Frontend
```

Burada frontend doğrudan backend'in metodunu çağırmaz.

Şöyle değildir:

```javascript
backend.getUsers();
```

Bunun yerine ağ üzerinden bir HTTP isteği gönderir:

```javascript
fetch("http://localhost:8080/users");
```

Aynı bilgisayarda olmalarına rağmen frontend ve backend farklı process, yani farklı çalışan programlardır. İşletim sistemi mesajı doğru uygulamaya teslim eder.

---

# 5. Localhost nedir?

`localhost` şu anlama gelir:

> **Şu anda kodun çalıştığı cihazın kendisi.**

Çoğu durumda şu IP adresine karşılık gelir:

```text
127.0.0.1
```

Bu iki adres çoğunlukla aynı yeri gösterir:

```text
http://localhost:8080
http://127.0.0.1:8080
```

Apartman benzetmesiyle localhost:

> Apartmanın dışına çıkmadan aynı apartmandaki başka bir daireye gitmektir.

Mesaj modeme veya internete çıkmadan bilgisayarın kendi içinde dolaşır.

Önemli nokta:

```text
Tarayıcıdaki localhost  → Tarayıcının çalıştığı bilgisayar
Docker'daki localhost   → O Docker container'ı
Sunucudaki localhost    → O sunucu
Telefondaki localhost   → O telefon
```

`localhost`, her zaman “benim backend’im” anlamına gelmez. Kodun çalıştığı ortamı gösterir.

---

# 6. IP adresi nedir?

IP adresi, ağ üzerindeki bir cihazı veya ağ arayüzünü bulmak için kullanılan adrestir.

Örnek:

```text
192.168.1.20
```

Bir bilgisayarın birden fazla IP adresi olabilir:

```text
127.0.0.1       → Bilgisayarın kendisi
192.168.1.20    → Ev Wi-Fi ağındaki adresi
10.10.0.5       → VPN adresi
172.17.0.1      → Docker ağı
```

Bu nedenle “her bilgisayarın yalnızca bir IP adresi vardır” düşüncesi doğru değildir.

---

# 7. Yerel ağ nedir?

Yerel ağ, birbirine yakın veya aynı özel ağ içinde bulunan cihazların oluşturduğu ağdır.

Evindeki cihazları düşün:

```text
Ev modemi / router
├── Bilgisayar
├── Telefon
├── Televizyon
└── Yazıcı
```

Bu cihazlar aynı modem veya router'a bağlıysa günlük kullanımda aynı yerel ağdadır.

Örneğin router cihazlara şu IP adreslerini vermiş olabilir:

```text
Router:      192.168.1.1
Bilgisayar:  192.168.1.20
Telefon:     192.168.1.21
Televizyon:  192.168.1.22
```

## Site benzetmesi

Yerel ağı bir site gibi düşün:

```text
Yerel ağ = Site
Router    = Sitenin ana giriş kapısı
Cihazlar  = Sitedeki evler
Yerel IP  = Site içindeki ev numarası
```

Örneğin:

```text
192.168.1.20
```

“Bu site içindeki 20 numaralı ev” gibi düşünülebilir.

Aynı yerel ağdaki telefon, bilgisayardaki backend'e erişebilir:

```text
Bilgisayar IP'si: 192.168.1.20
Backend portu:    8080
```

Telefon tarayıcısından:

```text
http://192.168.1.20:8080
```

adresine gidilebilir.

Bunun çalışması için:

- Backend dış bağlantıları kabul etmelidir.
- Bilgisayarın firewall'u izin vermelidir.
- Telefon ve bilgisayar aynı yerel ağda olmalıdır.

---

# 8. Her cihazın IP adresi farklı mıdır?

## Aynı yerel ağ içinde

Genellikle evet.

```text
Bilgisayar: 192.168.1.20
Telefon:    192.168.1.21
Tablet:     192.168.1.22
```

Aynı yerel ağdaki iki cihaz aynı IP adresini kullanırsa IP çakışması oluşabilir.

Router, gelen paketin hangi cihaza ait olduğunu ayırt etmekte zorlanır.

## Farklı yerel ağlarda

Aynı özel IP adresi tekrar kullanılabilir.

Örneğin:

```text
Senin evindeki bilgisayar:     192.168.1.20
Başka şehirdeki bilgisayar:    192.168.1.20
```

Bu bir problem oluşturmaz çünkü cihazlar farklı yerel ağlardadır.

Bunu iki farklı site gibi düşün:

```text
İstanbul'daki site, 20 numaralı ev
Ankara'daki site,   20 numaralı ev
```

Ev numaraları aynıdır ama siteler farklıdır.

---

# 9. Yerel IP ve public IP farkı

Evdeki bilgisayarın genellikle bir yerel IP adresi vardır:

```text
192.168.1.20
```

Router'ın internet tarafında ise public IP adresi bulunabilir:

```text
85.100.50.10
```

Evdeki bütün cihazlar internete çoğunlukla router'ın public IP adresi üzerinden çıkar:

```text
Bilgisayar 192.168.1.20 ─┐
Telefon    192.168.1.21 ─┼→ Router 85.100.50.10 → İnternet
Televizyon 192.168.1.22 ─┘
```

## Benzetme

```text
Yerel IP  = Şirket çalışanının dahili numarası
Public IP = Şirketin dışarıdan aranan ana telefonu
Port      = Aramanın bağlanacağı departman veya dahili numara
```

Dışarıdaki biri doğrudan senin `192.168.1.20` adresine bağlanamaz.

Çünkü bu adres yalnızca ev ağında anlamlıdır.

Dışarıdaki kişinin ulaşması gereken adres router'ın public IP adresidir:

```text
85.100.50.10
```

---

# 10. Router ne yapar?

Router'ın temel görevi paketlerin hangi yöne gönderileceğine karar vermektir.

Router'ı yol kavşağındaki dağıtım merkezi gibi düşün.

Bir paket geldiğinde hedef IP adresine bakar:

```text
Hedef IP: 192.168.1.20
```

Hedef yerel ağdaysa paketi evdeki ilgili cihaza gönderir.

Hedef internetteyse paketi internet servis sağlayıcısına yollar.

```text
Yerel hedef:

Bilgisayar
    ↓
Aynı yerel ağdaki cihaz
```

```text
Uzak hedef:

Bilgisayar
    ↓
Router
    ↓
İnternet
    ↓
Uzak sunucu
```

---

# 11. Backend bir portu dinliyor ne demek?

Backend şu şekilde çalıştırılmış olabilir:

```javascript
server.listen(8080);
```

Bu işlemin anlamı kabaca şudur:

> “İşletim sistemi, 8080 portuna gelen mesajları bu uygulamaya teslim et.”

Restoran benzetmesi:

```text
Restoranın adresi = IP
Sipariş masası    = Port
Restoran çalışanı = Backend
```

Backend 8080 portunda çalışmıyorsa oraya gelen bağlantıyı alacak uygulama yoktur.

Bu durumda şu hata görülebilir:

```text
Connection refused
```

Günlük hayattaki anlamı:

> Adrese ulaştın, fakat o dairede kimse yok veya kapı açılmıyor.

---

# 12. 127.0.0.1 ve 0.0.0.0 farkı

## 127.0.0.1

Backend şu adreste dinliyorsa:

```text
127.0.0.1:8080
```

yalnızca aynı bilgisayardaki uygulamalar erişebilir.

Başka bir bilgisayar erişemez.

Anlamı:

> “Yalnızca bu bilgisayarın içinden gelen bağlantıları kabul et.”

## 0.0.0.0

Backend şu adreste dinliyorsa:

```text
0.0.0.0:8080
```

bilgisayarın uygun ağ arayüzlerinden gelen bağlantıları kabul eder.

Anlamı:

> “Bu bilgisayarın ağ bağlantılarından 8080 portuna gelen istekleri kabul et.”

Başka bir cihaz bağlanırken `0.0.0.0` adresini kullanmaz.

Bilgisayarın gerçek yerel IP adresini kullanır:

```text
http://192.168.1.20:8080
```

Kısaca:

```text
127.0.0.1:8080 → Yalnızca kendi bilgisayarım
0.0.0.0:8080   → Uygun bütün ağ bağlantılarından istek kabul et
```

---

# 13. Firewall nedir?

Firewall'u apartman veya site güvenliği gibi düşün.

Bir bağlantı isteği geldiğinde şunları kontrol eder:

```text
Bu bağlantıya izin var mı?
Hangi porta gitmek istiyor?
Kaynak IP izin verilen listede mi?
```

Örneğin backend çalışıyor olabilir:

```text
0.0.0.0:8080
```

Ama firewall 8080 portunu engelliyorsa dışarıdaki cihaz bağlanamaz.

Bir servise ulaşmak için genellikle şunların tamamı gerekir:

```text
Uygulama çalışmalı
        +
Doğru IP üzerinde dinlemeli
        +
Doğru portta dinlemeli
        +
Firewall izin vermeli
        +
Ağ yolu bulunmalı
```

---

# 14. NAT nedir?

NAT, Network Address Translation ifadesinin kısaltmasıdır.

Türkçesi:

> Ağ adresi çevirisi

Evdeki cihazların yerel IP adresleri vardır:

```text
Bilgisayar: 192.168.1.20
Telefon:    192.168.1.21
```

Fakat internete router'ın public IP adresi üzerinden çıkarlar:

```text
85.100.50.10
```

Router içerideki ve dışarıdaki adresler arasında çeviri yapar.

Örnek:

```text
Bilgisayardan çıkan bağlantı:

192.168.1.20:53124
        ↓ NAT
85.100.50.10:62001
        ↓
İnternet
```

Router bir kayıt tutar:

```text
85.100.50.10:62001 ↔ 192.168.1.20:53124
```

Cevap geldiğinde hangi iç cihaza göndereceğini bu kayıttan anlar.

---

# 15. Başka şehirdeki biri backend'ime bağlanabilir mi?

Evet, teorik olarak bağlanabilir.

Ancak yalnızca senin IP adresini bilmesi yeterli değildir.

Örnek:

```text
Senin bilgisayarın:
Yerel IP: 192.168.1.20
Backend:  8080 portu

Senin router'ın:
Public IP: 85.100.50.10

Başka şehirdeki kişinin public IP'si:
95.50.40.30
```

Karşıdaki kişi şu adrese bağlanmalıdır:

```text
http://85.100.50.10:8080
```

Şuna değil:

```text
http://192.168.1.20:8080
```

Çünkü `192.168.1.20` yalnızca senin ev ağında anlamlıdır.

---

# 16. Dışarıdan bağlantı için gerekenler

Başka şehirdeki birinin senin bilgisayarındaki backend'e ulaşabilmesi için aşağıdaki şartlar gerekir.

## 1. Backend dış bağlantıları kabul etmeli

Backend yalnızca şurada çalışıyorsa:

```text
127.0.0.1:8080
```

dışarıdan erişilemez.

Genellikle şurada dinlemesi gerekir:

```text
0.0.0.0:8080
```

## 2. Bilgisayar firewall'u izin vermeli

Örneğin:

```text
8080 portuna izin ver
```

Daha güvenli bir kural:

```text
8080 portuna yalnızca 95.50.40.30 IP adresinden izin ver
```

## 3. Router'da port forwarding yapılmalı

Dışarıdan gelen istek önce router'a ulaşır:

```text
85.100.50.10:8080
```

Router bu isteği evdeki hangi cihaza göndereceğini bilmelidir.

Port forwarding kuralı:

```text
Public 85.100.50.10:8080
              ↓
Yerel 192.168.1.20:8080
```

Bu işlemin anlamı:

> “Router'ın 8080 portuna gelen istekleri, evdeki 192.168.1.20 bilgisayarının 8080 portuna gönder.”

## 4. Gerçek bir public IP bulunmalı

İnternet sağlayıcın CGNAT kullanıyorsa router'ın doğrudan erişilebilir public IPv4 adresi olmayabilir.

Bu durumda evindeki port forwarding kuralı tek başına yeterli olmaz.

---

# 17. Port forwarding günlük hayat benzetmesi

Bir şirket düşün:

```text
Şirketin ana telefonu = Public IP
Dahili numara         = Public port
Çalışanın telefonu    = Yerel IP + port
```

Dışarıdan biri şirketin ana telefonunu arar:

```text
85.100.50.10:8080
```

Santral şu kurala göre yönlendirir:

```text
8080'e gelen aramaları Ali'nin masasına bağla
```

Teknik karşılığı:

```text
85.100.50.10:8080 → 192.168.1.20:8080
```

Bu, port forwarding işlemidir.

---

# 18. IP izin listesi tek başına yeterli midir?

Hayır.

Sen bilgisayarının firewall'una şu kuralı yazabilirsin:

```text
Yalnızca 95.50.40.30 IP adresinden gelen 8080 bağlantılarına izin ver
```

Fakat paketin önce bilgisayarına kadar ulaşması gerekir.

Paket router'da veya internet sağlayıcının CGNAT sisteminde durdurulursa bilgisayarındaki firewall paketi hiç göremez.

Tam yol şöyledir:

```text
Başka şehirdeki bilgisayar
        ↓
İnternet
        ↓
Senin public IP adresin
        ↓
Router ve port forwarding
        ↓
Bilgisayar firewall'u
        ↓
Backend
```

Bütün katmanların izin vermesi gerekir.

---

# 19. CGNAT nedir?

CGNAT, Carrier-Grade NAT ifadesinin kısaltmasıdır.

Türkçesi kabaca:

> İnternet sağlayıcı seviyesinde yapılan ortak NAT işlemi

Normal durumda:

```text
Bilgisayar
    ↓
Ev router'ı
    ↓
İnternet
```

CGNAT olduğunda:

```text
Bilgisayar
    ↓
Ev router'ı
    ↓
İnternet sağlayıcının ortak NAT sistemi
    ↓
İnternet
```

Yani bir NAT işlemini evindeki router, ikinci NAT işlemini internet sağlayıcın yapar.

---

# 20. CGNAT neden kullanılır?

IPv4 adresleri sınırlıdır.

İnternet sağlayıcıları her müşteriye ayrı public IPv4 adresi vermek yerine birçok müşteriyi aynı public IP'nin arkasından internete çıkarabilir.

Örnek:

```text
Senin evin        ─┐
Komşunun evi      ─┼→ Ortak public IP → İnternet
Başka bir müşteri ─┘
```

Bu durumda birçok ev aynı public IP adresini paylaşır.

---

# 21. CGNAT günlük hayat benzetmesi

Şöyle düşün:

```text
Bilgisayarın          = Dairen
Ev router'ın          = Apartmanın ana kapısı
CGNAT sistemi         = Sitenin ana kapısı
İnternet              = Şehrin dışı
```

Normal NAT'ta yalnızca apartmanın kapısından geçersin.

CGNAT'ta iki kapı vardır:

```text
Daire
  ↓
Apartmanın kapısı
  ↓
Sitenin ana kapısı
  ↓
Dış dünya
```

Sen kendi apartmanının kapısını kontrol edebilirsin.

Fakat sitenin ana kapısını internet sağlayıcın kontrol eder.

---

# 22. CGNAT varken port forwarding neden çalışmayabilir?

Sen ev router'ında şu kuralı oluşturabilirsin:

```text
8080 → 192.168.1.20:8080
```

Fakat dışarıdan gelen paket önce internet sağlayıcının CGNAT sistemine gelir.

```text
Başka şehirdeki kişi
        ↓
İnternet sağlayıcının CGNAT sistemi
        ✕
Senin router'ın
        ↓
Backend
```

CGNAT sistemi paketi hangi müşteriye göndermesi gerektiğini bilemeyebilir.

Sen internet sağlayıcının cihazında port forwarding kuralı oluşturamazsın.

Benzetme:

> Dairenin kapısını açık bıraktın, fakat sitenin ana kapısı kapalı. Ziyaretçi senin daire kapına kadar gelemez.

---

# 23. CGNAT olduğunu nasıl anlayabilirsin?

Modem veya router arayüzündeki WAN IP adresine bak.

Örneğin modem şunu gösteriyor:

```text
100.75.30.20
```

Fakat internette görünen IP adresin şudur:

```text
85.100.50.10
```

Bu durumda arada CGNAT bulunma ihtimali yüksektir.

CGNAT için sık kullanılan adres aralığı:

```text
100.64.0.0 – 100.127.255.255
```

En kesin yöntem internet sağlayıcına şu soruyu sormaktır:

> “CGNAT arkasında mıyım, bana gerçek public IPv4 veriliyor mu?”

---

# 24. CGNAT varsa çözüm seçenekleri

Başka şehirdeki birinin backend'ine erişmesi gerekiyorsa şu seçenekler kullanılabilir:

## Seçenek 1: Public veya statik IP almak

İnternet sağlayıcından gerçek public IPv4 veya statik IP hizmeti istenebilir.

Bu durumda port forwarding yapılabilir.

## Seçenek 2: VPN tabanlı özel ağ kullanmak

Örneğin:

- Tailscale
- ZeroTier
- WireGuard

Bu çözümler iki cihazı aynı özel ağdaymış gibi birbirine bağlayabilir.

## Seçenek 3: Tünel kullanmak

Örneğin:

- Cloudflare Tunnel
- ngrok benzeri geliştirme tünelleri

Backend dışarıya doğru bir bağlantı açar. Dışarıdaki kullanıcı bu tünel üzerinden backend'e ulaşır.

## Seçenek 4: Backend'i sunucuya deploy etmek

Backend bir VPS veya cloud sunucusunda çalıştırılabilir.

```text
Kullanıcı
   ↓
Public sunucu
   ↓
Backend
```

Gerçek projelerde en yaygın yaklaşım budur.

---

# 25. Socket nedir?

Socket, uygulamanın işletim sistemi üzerinden iletişim kurduğu bağlantı ucudur.

Telefon benzetmesi:

```text
IP + Port      = Telefon numarası
Socket         = Telefon cihazı
Bağlantı       = Telefon görüşmesi
Protokol       = Konuşulan dil
```

Backend bir socket oluşturur ve bekler:

```text
Ben 8080 portunda bağlantı bekliyorum.
```

Frontend bir socket üzerinden bağlanır:

```text
8080 portundaki backend ile konuşmak istiyorum.
```

Junior seviyede socket için şunu bilmek yeterlidir:

> Uygulamalar ağ kartına doğrudan veri yazmaz. İşletim sisteminin sunduğu socket mekanizmasını kullanır.

---

# 26. HTTP nedir?

IP ve port mesajı doğru uygulamaya ulaştırır.

HTTP ise gönderilen mesajın anlamını belirler.

Örneğin:

```http
GET /users
```

anlamı:

> Kullanıcıları getir.

```http
POST /users
```

anlamı:

> Yeni kullanıcı oluştur.

```http
DELETE /users/5
```

anlamı:

> 5 numaralı kullanıcıyı sil.

Apartman benzetmesi:

```text
IP       → Hangi apartman?
Port     → Hangi daire?
HTTP     → Dairedeki kişiden ne istiyorsun?
```

---

# 27. Backend ile veritabanı nasıl konuşur?

Backend PostgreSQL'e şu adresle bağlanabilir:

```text
localhost:5432
```

Anlamı:

> “Bu bilgisayarın 5432 portunda çalışan PostgreSQL uygulamasına bağlan.”

Akış:

```text
Backend
   ↓
localhost:5432
   ↓
PostgreSQL
```

Backend SQL sorgusu gönderir:

```sql
SELECT * FROM users;
```

PostgreSQL sonucu geri döndürür.

Burada frontend-backend arasındaki gibi HTTP kullanılmaz. PostgreSQL'in kendi protokolü kullanılır.

Ortak mantık aynıdır:

```text
IP + Port + Protokol
```

---

# 28. Baştan sona bir e-ticaret örneği

Şu uygulamayı düşün:

```text
Frontend: localhost:5173
Backend:  localhost:8080
Database: localhost:5432
```

Kullanıcı “Ürünleri göster” butonuna basıyor.

## Adım 1: Frontend backend'e istek gönderir

```javascript
fetch("http://localhost:8080/products");
```

Anlamı:

> “Bu bilgisayarın 8080 portundaki uygulamadan ürünleri iste.”

## Adım 2: İşletim sistemi backend'i bulur

İşletim sistemi 8080 portunu hangi uygulamanın dinlediğine bakar.

Backend bu portu dinliyorsa isteği backend'e teslim eder.

## Adım 3: Backend veritabanına bağlanır

Backend:

```text
localhost:5432
```

adresindeki PostgreSQL'e bağlanır.

Şu sorguyu gönderir:

```sql
SELECT * FROM products;
```

## Adım 4: PostgreSQL sonucu döndürür

```json
[
  {
    "id": 1,
    "name": "Klavye"
  },
  {
    "id": 2,
    "name": "Monitör"
  }
]
```

## Adım 5: Backend frontend'e cevap verir

Frontend gelen JSON verisini ekranda gösterir.

Tam akış:

```text
Kullanıcı
   ↓
Frontend :5173
   ↓ HTTP
Backend :8080
   ↓ PostgreSQL protokolü
Database :5432
   ↓
Backend
   ↓ HTTP
Frontend
   ↓
Ekran
```

---

# 29. Aynı yerel ağdaki telefonla test örneği

Bilgisayarında backend çalışıyor:

```text
Bilgisayar IP'si: 192.168.1.20
Backend portu:    8080
```

Backend dış bağlantıları kabul ediyor:

```text
0.0.0.0:8080
```

Telefon ve bilgisayar aynı Wi-Fi ağına bağlı.

Telefonun tarayıcısından:

```text
http://192.168.1.20:8080
```

adresine gidersin.

Akış:

```text
Telefon
192.168.1.21
     ↓
Evdeki Wi-Fi / router
     ↓
Bilgisayar
192.168.1.20
     ↓
8080 portundaki backend
```

Bu trafik internet üzerindeki başka şehirlere gitmez. Evdeki yerel ağ içinde kalır.

---

# 30. Başka şehirden erişim örneği

Senin evin:

```text
Bilgisayar yerel IP: 192.168.1.20
Router public IP:    85.100.50.10
Backend:             0.0.0.0:8080
```

Router'daki port forwarding:

```text
85.100.50.10:8080 → 192.168.1.20:8080
```

Firewall kuralı:

```text
Yalnızca 95.50.40.30 IP adresine izin ver.
```

Başka şehirdeki kişinin public IP adresi:

```text
95.50.40.30
```

Karşıdaki kişi şu adrese istek gönderir:

```text
http://85.100.50.10:8080
```

Tam akış:

```text
Başka şehirdeki bilgisayar
Public IP: 95.50.40.30
        ↓
İnternet
        ↓
Senin router'ın
Public IP: 85.100.50.10
        ↓
Port forwarding
        ↓
192.168.1.20:8080
        ↓
Firewall kontrolü
        ↓
Backend
```

CGNAT yoksa ve bütün ayarlar doğruysa bu bağlantı çalışabilir.

---

# 31. Güvenlik uyarısı

Geliştirme bilgisayarındaki backend'i doğrudan internete açmak risklidir.

Özellikle şu durumlarda açılmamalıdır:

- Authentication yoksa
- Debug modu açıksa
- Veritabanı doğrudan bağlıysa
- Gizli anahtarlar bilgisayardaysa
- HTTPS kullanılmıyorsa
- Uygulama henüz güvenlik testlerinden geçmediyse

Daha güvenli seçenekler:

```text
VPN
Tailscale
Cloudflare Tunnel
VPS veya cloud deployment
Reverse proxy
HTTPS
Authentication
Firewall kısıtlamaları
```

IP izin listesi faydalıdır fakat tek başına yeterli bir güvenlik yöntemi değildir.

---

# 32. En sık karıştırılan noktalar

## “IP adresimi biliyorsa bilgisayarıma erişebilir.”

Yanlış.

IP adresini bilmek yalnızca binanın adresini bilmek gibidir.

Ayrıca şunlar gerekir:

```text
Açık port
Port forwarding
Firewall izni
Doğru backend ayarı
Public IP
CGNAT engelinin olmaması
```

## “localhost her zaman benim backend'imdir.”

Yanlış.

`localhost`, kodun çalıştığı cihazın kendisidir.

## “Backend 8080 portunda çalışıyorsa herkes erişebilir.”

Yanlış.

Backend yalnızca `127.0.0.1` üzerinde dinliyor olabilir. Firewall veya router bağlantıyı engelliyor olabilir.

## “Yerel IP adresim internetteki adresimdir.”

Yanlış.

```text
192.168.x.x
10.x.x.x
172.16.x.x – 172.31.x.x
```

gibi adresler genellikle özel ağ adresleridir.

## “Port forwarding yaptıysam CGNAT olsa da çalışır.”

Genellikle yanlış.

CGNAT varsa paket ev router'ına ulaşmadan önce internet sağlayıcı seviyesinde durabilir.

---

# 33. Sorun giderme sırası

Bir backend'e bağlanamıyorsan şu sırayı takip edebilirsin.

## 1. Backend çalışıyor mu?

Kendi bilgisayarından test et:

```bash
curl http://localhost:8080
```

## 2. Hangi adreste dinliyor?

```text
127.0.0.1:8080
```

ise yalnızca kendi bilgisayarından erişilebilir.

```text
0.0.0.0:8080
```

ise uygun ağ arayüzlerinden gelen istekleri kabul edebilir.

## 3. Aynı yerel ağdan erişiliyor mu?

Telefon veya başka bilgisayardan:

```text
http://192.168.1.20:8080
```

adresini dene.

## 4. Firewall izin veriyor mu?

8080 portunun engellenmediğini kontrol et.

## 5. Dışarıdan erişilecekse port forwarding var mı?

```text
Public IP:8080 → Yerel IP:8080
```

kuralı bulunmalıdır.

## 6. CGNAT var mı?

Router WAN IP ile internette görünen public IP adresini karşılaştır.

---

# 34. Kalıcı mental model

Konuyu şu modelle aklında tutabilirsin:

```text
IP       → Hangi bilgisayar?
Port     → O bilgisayardaki hangi uygulama?
Protokol → Uygulamalar nasıl konuşacak?
Socket   → Konuşmayı sağlayan bağlantı ucu
Router   → Paket hangi yoldan gidecek?
Firewall → Paketin geçmesine izin var mı?
NAT      → Yerel ve public adresler arasında çeviri
CGNAT    → İnternet sağlayıcının birçok müşteriyi aynı public IP'de toplaması
```

Tek cümlelik özet:

> **IP apartmanın adresidir, port daire numarasıdır, router yol gösterir, firewall kapıdaki güvenliktir, NAT evdeki özel adresleri internette kullanılan public adrese çevirir, CGNAT ise birçok farklı evi internet sağlayıcının tek public IP adresinin arkasında toplar.**
