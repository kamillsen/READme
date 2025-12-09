# Kubernetes Temel Kavramlar

---

## 1. Kubernetes'e gelmeden önce: Container ne demek?

Önce şunu hayal et:

* Sen bir **ASP.NET Core API** yazdın: `OrderApi` diyelim.
* Normalde bunu bir **sunucuya** (Windows/Linux makine) deploy ediyorsun.
* O sunucuda:

  * .NET runtime yüklü
  * Bağımlılıklar vs var

**Container** (mesela Docker container):

* Uygulaman + gerekli her şey (runtime, bağımlılıklar) **tek bir paket** halinde.
* Bu pakete "image" deniyor; çalıştırdığında "container" oluyor.
* Avantaj: "Bende çalıştı, onda çalışmadı" derdi azalıyor. Her yerde aynı çalışıyor.

---

## 2. "Cluster" ve "Node" ne demek? (mahalle – bina benzetmesi)

Şimdi Kubernetes tarafına geçelim.

### Node nedir?

**Node = İçinde container'ların koştuğu makine**.

* Bu makine:

  * Fiziksel olabilir (gerçek server)
  * Sanal olabilir (VM)
* Node'un içinde:

  * Container'ları çalıştıran yazılım (Docker vs),
  * Kubernetes agent'ları (bunları detay bilmene gerek yok).

### Cluster nedir?

**Cluster = Bir sürü node'un (makinenin) bir araya gelip tek bir büyük sistem gibi çalışması.**

Bunu şöyle düşün:

* Tek bir bilgisayarın var → bu **tek node**.
* 10 tane bilgisayarı birbirine bağladın, üzerine Kubernetes kurdun → bu **Kubernetes cluster**.

👉 Kubernetes, bu cluster içindeki **tüm makineleri tek bir "büyük bilgisayar" gibi** sana gösteriyor.

---

## 3. Pod nedir? (Container için "kılıf" gibi düşün)

Kubernetes dokümanına göre:
**Pod = Kubernetes'te çalıştırılabilen en küçük birim.** İçinde 1 veya daha fazla container olabilir.

Senin için sade hali:

* Pod = "Uygulamanın çalışan bir instance'ı"
* Genelde **1 pod = 1 container = 1 instance** gibi düşünebilirsin (basit senaryoda).

Örnek:

* `OrderApi` için 1 pod oluşturursan → `OrderApi`'nin tek bir çalışan kopyası olur.
* 3 pod oluşturursan → `OrderApi` aynı anda 3 kopya olarak çalışır.

---

## 4. Mikroservis & Replicas & Scale – Hepsini tek seferde kafaya oturtalım

### Mikroservis (kısaca)

* Büyük sistemi küçük parçalara bölüyorsun:

  * `OrderService` → sipariş
  * `BasketService` → sepet
  * `PaymentService` → ödeme
* Her biri **ayrı deploy edilen küçük uygulamalar**.

Bunların her biri Kubernetes'te **ayrı pod'lar** halinde koşuyor.

---

### "Replica" ne demek?

**Replica = Aynı uygulamanın birebir kopyası, ekstra çalışan instance'ı.**

Örnek:

* `OrderApi` için 1 pod çalıştırırsan → 1 replica.
* 5 pod çalıştırırsan → 5 replica (yani 5 kopya).

Gerçek hayattan benzetme:

* Bir hamburgerci düşün:

  * Tek şube varsa → tek replica gibi.
  * Aynı markanın 5 şubesi varsa → 5 replica.
* Hepsi **aynı menü, aynı logo** ama farklı yerlerde hizmet veriyor.

Uygulama tarafında da:

* Her replica aynı kodu çalıştırıyor,
* Farklı kullanıcı isteklerine aynı anda cevap veriyor.

---

### "Scale / Scaling" ne demek?

Dokümanda "scaling" şudur diyor:
**Çalışan replica sayısını artırıp azaltmak.**

Yani:

* **Scale up / scale out** = replica sayısını artırmak

  * Örn: 3 pod → 10 pod
* **Scale down** = replica sayısını azaltmak

  * Örn: 10 pod → 2 pod

Kubernetes'te bu iş:

* Bir Deployment'ta `replicas` alanını değiştirerek,
* Veya `kubectl scale` komutuyla yapılır.

---

### Peki **neden** her mikroservis için 3–5 replica açıyoruz?

"Her mikroservisin 3–5 kopyası neden var?" sorusu çok kritik.
Genelde 3 sebep:

#### 1. Çok kullanıcı aynı anda girerse sistem patlamasın diye (yük paylaşımı)

* Diyelim ki `OrderApi` tek pod (tek kopya).
* Aynı anda 1000 kişi sipariş verince:

  * CPU %100'e vurur,
  * Bellek dolar,
  * API yavaşlar, hatta çöker.

Eğer 4–5 kopyan varsa:

* Gelen istekler bu kopyalara dağılır (load balancing),
* İş yükünü paylaşırlar,
* Her bir pod daha az yorulur.

#### 2. Bir kopya çökerse sistem tamamen çökmesin diye (dayanıklılık)

* 1 pod'un var ve o pod bir hata yüzünden çöktü:

  * API'n tamamen gidiyor.
* 5 pod'un varsa ve 1 tanesi hata verdi:

  * Diğer 4 tanesi çalışmaya devam ediyor,
  * Kullanıcılar çoğu zaman hata bile fark etmiyor.

Kubernetes dokümanlarında ReplicaSet'in olayı da tam olarak bu:

> "Her zaman belirli sayıda pod kopyasının çalıştığından emin olmak."

#### 3. Zero-downtime deploy (sıfır kesintiyle yeni versiyon yayınlamak)

* `OrderApi v1` çalışıyor, 5 pod var diyelim.
* Yeni versiyon (`v2`) yayınlamak istiyorsun:

  * Kubernetes bir yandan yeni versiyondan pod açıyor,
  * Diğer yandan eskileri teker teker kapatıyor.
* Böylece sistem **hiç durmadan**, kullanıcı fark etmeden güncelleniyor.

Bu mekanizmayı da **Deployment + ReplicaSet** yönetiyor.

---

## 5. Şimdi: Kubernetes tam olarak nedir?

Resmî overview sayfasına göre:

> Kubernetes, container'lı uygulamaları yönetmek için açık kaynak bir platform; deploy, scale ve yönetim işlerini otomatikleştirir.

Senin diline çevirirsem:

> "Kubernetes = Docker container'larını, bir sürü makinenin üstünde, otomatik şekilde yöneten akıllı sistem."

Yaptığı işler:

* Hangi pod hangi node'da çalışsın, ona karar verir (scheduler).
* Pod çökerse otomatik yeniden başlatır (auto-healing).
* Replica sayısını korur (3 diyorsan 3'ü ayakta tutar).
* İstekleri pod'lara dağıtır (load balancing, Service).
* Scale up / scale down işlemlerini yönetir.
* Yeni versiyon deploy'u, rollback'i halleder.

Ve **çok önemli bir nokta**:

> Kubernetes **bir kütüphane değil**;
> Yani NuGet ile projene eklediğin bir şey değil.
> Kendisi ayrı bir "altyapı sistemi / platform".

Sen sadece:

* Uygulamanı container yaparsın,
* Kubernetes'e "şu image'den 3 kopya çalıştır, şu portu dinlesin" şeklinde YAML dosyalarıyla istek atarsın.

---

## 6. Kubernetes içindeki ana parçalar (terimleri cümlenin içinde açıklayarak)

### Pod (tekrar)

* En küçük çalışan birim.
* İçinde 1+ container var,
* Her pod'un kendi IP'si, portları var.

Sen "OrderApi" çalıştırmak istiyorsun → bunun için pod oluşturuyorsun.

---

### Deployment (pod'ları yöneten beyin)

**Deployment = "Bu uygulamadan şu kadar kopya çalışsın, şu image'i kullansın" diye yazdığın kural seti.**

* Sen YAML'da diyorsun ki:

  * "`order-api` isminde bir deployment olsun,
  * `myregistry/order-api:1.0` image'ini kullansın,
  * `replicas: 3` olsun."
* Kubernetes bu Deployment'a bakıp:

  * 3 pod oluşturuyor,
  * Pod düşerse yenisini açıyor,
  * `replicas` sayısını koruyor,
  * Yeni image tag versen rolling update yapıyor.

Yani Deployment =
**"OrderApi'yi nasıl çalıştırmak istiyorum?"un YAML'da yazılı hali.**

---

### Service (sabit adres + load balancer)

Pod'ların IP adresi **değişken** (pod silinip yeniden yaratılınca IP değişebilir).

**Service = Pod'lar için sabit bir isim/adres + trafik dağıtan bir katman.**

* `order-api-service` diye bir Service oluşturursun.
* Cluster içinden `http://order-api-service` dediğinde:

  * O anda yaşayan `OrderApi` pod'larından birine trafik gider.
* Böylece:

  * Pod sayısını artırıp azalttığında
  * IP'leri düşünmek zorunda kalmazsın.

---

### ConfigMap ve Secret (konfigürasyon ve gizli bilgiler)

* **ConfigMap**:

  * Connection string hariç ayarlar,
  * Basit config değerleri (APP_NAME, LOG_LEVEL vs).
* **Secret**:

  * Şifre, token, API key gibi hassas bilgiler (biraz daha güvenli tutuluyor).

Koduna sabitlemek yerine bu objelere koyup pod'lara enjekte ediyorsun.

---

## 7. .NET geliştiricisi olarak senin yolun nasıl?

Microsoft'un ve diğer kaynakların önerdiği tipik yol şu:

1. **ASP.NET Core mikroservisi yaz**

   * Örn: `OrderApi`, `BasketApi`, `PaymentApi`.

2. **Her servisi container (Docker) yap**

   * `Dockerfile` yaz,
   * Image build et.

3. **Image'i bir container registry'ye at**

   * Docker Hub, Azure Container Registry vs.

4. **Kubernetes'e YAML'larla tanıt**

   * Her servis için:

     * 1 Deployment (kaç replica, hangi image'ı kullanacak),
     * 1 Service (diğer servisler bu isimle erişecek).

5. İhtiyaç oldukça:

   * **Scale**:

     * Örn: `OrderApi` çok yük alıyorsa → `replicas: 3` → `5`.
   * Güncelle:

     * Yeni versiyon image'ını ver → Deployment rolling update yapsın.

---

## 8. Kısacık özet (bütün terimleri tek parçada)

* **Container**: Uygulamanın paketlenmiş hali (Docker).
* **Node**: Container'ların çalıştığı tek bir makine.
* **Cluster**: Bir sürü node'un birleşip tek sistem gibi çalışması.
* **Pod**: Kubernetes'te çalışan en küçük birim; içinde 1+ container var.
* **Replica**: Aynı pod'un/kodun ekstra kopyası (aynı uygulamadan 3–5 tane açmak).
* **Scale**: Çalışan replica sayısını artırıp azaltma işi.
* **Deployment**: "Bu uygulamadan şu kadar kopya çalışsın, şu image'i kullansın" diye yazdığın tanım; Kubernetes bu tanıma göre pod'ları yönetiyor.
* **Service**: Pod'lara erişmek için sabit isim/adres + yük dengeleme katmanı.

