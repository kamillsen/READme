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

---

## 9. Docker Image + Container + Kubernetes Üçlüsü

Şimdi **Docker image + container + Kubernetes** üçlüsünü tek hikâye gibi anlatacağım ve araya bol bol ASCII diagram koyacağım.
Her terimi cümlenin içinde açıklayacağım, "biliniyor" varsaymayacağım.

---

### 9.1 En baştan: Uygulama → Image → Container

Sen bir **ASP.NET Core Web API** yazdın diyelim: `OrderApi`.

#### Docker image nedir?

**Docker image**, uygulamanın "donmuş fotoğrafı / kalıbı" gibi düşün:

* İçinde:

  * Senin kodun,
  * Gerekli .NET runtime ve kütüphaneler,
  * OS seviyesinde gereken dosyalar var.
* **Değişmez (immutable)**: image'in içi çalışırken değiştirilmez.
* Bir image'den istemediğin kadar **container** üretebilirsin.

Docker dokümanı bunu şöyle özetliyor:
"Image, container'ı çalıştırmak için gereken tüm dosya ve ayarları içeren standart bir paket."

#### Docker container nedir?

**Container**, image'in **çalışan hali**:

* Image = blueprint / kalıp
* Container = o kalıptan üretilmiş, çalışan "proses (process)"
* Yani container, image'in "run etmiş" hali.

Basit diagram:

```text
Senin yazdığın kod
        |
        v
  [ Docker Image ]
  (uygulama + runtime + bağımlılıklar)

        |  "çalıştır"
        v
  [ Docker Container ]
  (image'in çalışan hali)
```

Bir image'den birden çok container açabilirsin:

```text
             [ OrderApi Image ]
                 /    |    \
                /     |     \
               v      v      v
        [Container1][Container2][Container3]
```

---

### 9.2 Tek makine → Bir sürü makine: Node ve Cluster

#### Node nedir?

**Node = İçinde container'ların çalıştığı tek bir makine** (fiziksel veya sanal):

* Üzerinde:

  * Docker / container runtime,
  * Kubernetes'in küçük ajanları (kubelet, kube-proxy) var.

```text
[ Node ]
  - İşletim sistemi (Linux/Windows)
  - Container runtime (Docker vs)
  - Kubernetes agent'ları
  - İçinde çalışan container'lar
```

#### Cluster nedir?

**Cluster = Birden fazla node'un birleşip tek bir "dev sistem" gibi davranması.**

Resmî tanımlarda şöyle deniyor:
"Kubernetes cluster, container'lı uygulamaları çalıştırmak için bir araya getirilmiş node'lardan oluşan bir kümedir."

```text
          Kubernetes CLUSTER
   +--------------------------------+
   |   [ Node 1 ]  [ Node 2 ]       |
   |   [ Node 3 ]  [ Node 4 ]  ...  |
   +--------------------------------+
```

Sen, tek tek makine ile uğraşmak yerine:

> "Kubernetes, şuradaki image'den 5 tane çalıştır" diyorsun,
> O hangi node'da kaç tane açacağına kendi karar veriyor.

---

### 9.3 Kubernetes tam olarak ne yapıyor?

Kubernetes dokümanına göre:
"Kubernetes, container'lı uygulamaları deploy etmek, scale etmek ve yönetmek için açık kaynak bir orkestrasyon platformudur."

Türkçesi:

> "Ben Docker image'lerimi veriyorum,
> sen bunları bir sürü makineye dağıt, çalıştır, çoğalt, uçarsa yeniden başlat,
> dışarıya IP/port işleriyle uğraştırma."

Yani Kubernetes:

* Container'ları **hangi node'a koyacağını** planlıyor,
* Pod çökerse **yeniden ayağa kaldırıyor**,
* İstediğin sayıda kopyayı (replica) **sabit tutuyor**,
* Trafiği kopyalara **paylaştırıyor**,
* **Scale** (çoğalt/azalt) ve **rolling update / rollback** yapıyor.

Ve tekrar vurgulayayım:

> Kubernetes **bir kütüphane değil**,
> kendisi başlı başına bir "altyapı sistemi / platform".

---

### 9.4 Kubernetes içindeki temel kavramlar

(hepsini Docker image/container ile bağlayarak)

Şimdi en önemli kısım:
**Docker tarafı** ile **Kubernetes tarafını** birleştiren kavramlar:

* Pod
* Replica
* Scale
* Deployment
* Service

#### 9.4.1 Pod = "Docker container'ını taşıyan kutu"

Resmî tanım:
**Pod, Kubernetes'te yaratabildiğin en küçük birim, 1 veya daha fazla container barındırabilir.**

Basit düşün:

* Genelde **1 Pod = 1 container** (senin `OrderApi` container'ı)
* Bazen aynı Pod'un içinde yan yana iki container da olabilir (ör: app + log sidecar), ama şimdilik buna takılma.

```text
+--------------------+       +---------------------+
|       Pod          |       |        Pod         |
|  (OrderApi Pod #1) |       |  (OrderApi Pod #2) |
|   +-------------+  |       |  +-------------+   |
|   | Container   |  |       |  | Container   |   |
|   | (OrderApi)  |  |       |  | (OrderApi)  |   |
|   +-------------+  |       |  +-------------+   |
+--------------------+       +---------------------+
```

Pod'lar **node'ların üzerinde** çalışır:

```text
        [ Cluster ]
   +--------------------+
   |    [ Node 1 ]      |
   |   +------------+   |
   |   |  Pod A     |   |
   |   | (OrderApi) |   |
   |   +------------+   |
   |                    |
   |    [ Node 2 ]      |
   |   +------------+   |
   |   |  Pod B     |   |
   |   | (OrderApi) |   |
   |   +------------+   |
   +--------------------+
```

Burada **OrderApi** Docker image'in, farklı node'larda çalışan Pod'lar içinde container olarak koşuyor.

---

#### 9.4.2 Replica = Aynı Pod'dan birden çok kopya

**Replica = Aynı uygulamanın (aynı image'in) birden fazla çalışan kopyası.**

Neden?

1. **Çok kullanıcıya aynı anda cevap verebilmek için**

   * 1 tane OrderApi kopyası yerine 5 tane olursa,
   * Gelen HTTP istekleri bu 5 kopyaya dağıtılır,
   * Her biri daha az yorulur.

2. **Biri ölürse sistem komple çökmesin diye**

   * 1 tane pod'un varsa ve çökerse → servis gider.
   * 5 pod'dan 1'i çökerse → Kubernetes yenisini açar, diğer 4'ü zaten cevap veriyordur.

3. **Kesintisiz deployment için**

   * Eski image (v1) çalışırken yavaş yavaş yeni image (v2) pod'larını açar,
   * Eski pod'ları sırayla kapatır (rolling update),
   * Kullanıcı kesinti hissetmez.

Diagram:

```text
          OrderApi Image
                 |
                 v
      Kubernetes Deployment diyor ki:
      "Bu image'den 3 KOPYA (replica) çalışsın"

         +--------- Cluster ---------+
         |                           |
         |   [Node1]   [Node2]       |
         |    Pod#1     Pod#2        |
         |   (Order)   (Order)       |
         |             [Node3]       |
         |              Pod#3        |
         |             (Order)       |
         +---------------------------+
```

---

#### 9.4.3 Scale / Scaling = Kopya sayısını artırıp azaltma

**Scale etmek**, çalışan replica sayısını **artırmak veya azaltmaktır.**

* Scale up / scale out:

  * 3 pod → 10 pod yaparsın
* Scale down:

  * 10 pod → 2 pod yaparsın

Kubernetes dünyasında:

* Manual scale:

  * "replicas: 3" → "replicas: 6" yaparsın,
* Otomatik scale:

  * CPU %80 üstü olursa kopya sayısını artır gibi kurallar da yazabilirsin.

Diagram:

```text
Önce:
   replicas = 2

   [Pod1] [Pod2]

Scale up (çoğalt):
   replicas = 5

   [Pod1] [Pod2] [Pod3] [Pod4] [Pod5]
```

---

#### 9.4.4 Deployment = "Bu uygulamayı nasıl çalıştırmak istiyorsun?" kuralı

Resmî tanım:
**Deployment, Pod'ları ve ReplicaSet'leri yöneterek uygulamanın istenen sayıda kopyasının çalışmasını sağlar.**

Deployment'ta şunları söylersin:

* Hangi Docker image'i kullanayım?
* Kaç replica (kopya) çalışsın?
* Hangi portu dinlesin?
* Hangi label'ları kullansın?

Kubernetes:

* Bu "istenen durum"u (desired state) okur,
* Cluster'ın gerçek durumuyla karşılaştırır,
* Eksik pod varsa açar, fazla varsa siler.

Basit yaml fikir vermesi için (okuman yeter, ezberleme):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-api
spec:
  replicas: 3              # BURASI: scale = 3 kopya
  selector:
    matchLabels:
      app: order-api
  template:
    metadata:
      labels:
        app: order-api
    spec:
      containers:
        - name: order-api
          image: myregistry/order-api:1.0.0
          ports:
            - containerPort: 8080
```

Bu dosyayı Kubernetes'e verince (kubectl apply):

* `myregistry/order-api:1.0.0` image'inden
* 3 tane pod açar (3 replica),
* Pod çökerse yenisini açar,
* Sonra `replicas: 5` yaparsan 2 pod daha ekler → **scale up**.

---

#### 9.4.5 Service = Pod'lara erişmek için sabit isim/adres

Sorun: Pod'ların IP adresi **sabit değil**. Pod silinip yaratılınca IP değişebiliyor.

**Service**, bu sorunu çözen katman:

* Arkasında bir grup Pod var (mesela tüm OrderApi Pod'ları),
* Önünde sabit:

  * Bir DNS ismi (ör: `order-api`),
  * Bir sanal IP var.
* Gelen istekleri arkadaki Pod'lara **paylaştırır** (load balancing).

```text
Kullanıcı / Diğer Servisler
            |
            v
    +--------------------+
    |  Service           |
    |  name: order-api   |  --> SABİT ADRES
    +--------------------+
        |       |       |
        v       v       v
      [Pod1]  [Pod2]  [Pod3]
      (Order) (Order) (Order)
```

Sen kodda veya başka servislerde:

```text
http://order-api
```

diye çağırırsın, arkadaki Pod sayısı değişse bile (scale up/down) adres değişmez.

---

### 9.5 Tüm resmi birleştirelim: .NET → Docker → Kubernetes

Şimdi baştan sona tek flow çizelim.

#### 1. Sen kod yazarsın

```text
ASP.NET Core Web API
(OrderApi)
```

#### 2. Docker image oluşturursun

```text
[ OrderApi Image ]
  - Uygulama kodu
  - .NET runtime
  - Bağımlılıklar
```

#### 3. Kubernetes cluster'ında Deployment tanımlarsın

```text
Deployment (order-api)
  - image: orderapi:1.0.0
  - replicas: 3
```

#### 4. Kubernetes, cluster'da Pod'ları dağıtır

```text
               [ Kubernetes Cluster ]
+------------------------------------------------+
|   [ Node1 ]           [ Node2 ]                |
|   +--------+          +--------+              |
|   | Pod#1  |          | Pod#3  |              |
|   |Order   |          |Order   |              |
|   +--------+          +--------+              |
|               [ Node3 ]                       |
|               +--------+                      |
|               | Pod#2 |                       |
|               | Order |                       |
|               +--------+                      |
+------------------------------------------------+
```

Her Pod'un içinde **OrderApi container'ı** aynı Docker image'den çalışıyor.

#### 5. Service ile dışarıya veya diğer servislere açarsın

```text
Kullanıcı / Frontend / Diğer mikroservisler
                    |
                    v
           +--------------------+
           | Service            |
           | name: order-api    |
           +--------------------+
                |      |      |
                v      v      v
              Pod#1  Pod#2  Pod#3
```

Trafik dengelenir; Pod sayısını artırıp azaltman (scale) sadece Deployment'taki `replicas` sayısını değiştirmene bakar.

---

### 9.6 .NETçi biri olarak bunu nerede kullanıyorsun?

Microsoft'un resmi microservices rehberi ve eğitimleri özellikle şunu anlatıyor:

* Her .NET mikroservisini (Order, Basket, Payment…) **Docker image** yap,
* Hepsini Kubernetes'e **Deployment + Service** olarak koy,
* Redis, RabbitMQ gibi yan sistemleri de container olarak veya managed servis olarak kullan,
* Kubernetes:

  * scaling,
  * health check,
  * rolling update,
  * servis keşfi işlerini senin yerine halletsin.

