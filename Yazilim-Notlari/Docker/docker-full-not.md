# Docker – Felsefe, Kavramlar ve Örneklerle Tam Not

## 0. Docker'ın Temel Fikri

> **Docker**, uygulamaları ve tüm bağımlılıklarını **container** denilen hafif, izole paketler içinde çalıştıran bir platformdur. Bu container'lar, host işletim sisteminin **kernel**'ini paylaşan izole **user space** süreçlerdir.

* Uygulama + runtime + kütüphane + config → **image**

* Image'in çalışan kopyası → **container**

* Bu sayede: "bende çalışıyor / sende çalışmıyor" problemi büyük ölçüde çözülüyor.

---

## 1. User Space vs Kernel Space (ve Docker'la Bağı)

İşletim sistemini kabaca iki katman gibi düşün:

```txt

+---------------------------+

|  Kernel space             |  (çekirdek)

|  - OS çekirdeği           |

|  - sürücüler              |

|  - bellek / CPU yönetimi  |

+---------------------------+

|  User space               |  (kullanıcı alanı)

|  - Uygulamalar            |

|  - Servisler              |

|  - CLI araçları           |

+---------------------------+

```

* **Kernel space**

  * OS çekirdeği burada çalışır.

  * Donanım, bellek, süreç planlama gibi kritik işleri yönetir.

* **User space**

  * Bizim yazdığımız tüm uygulamalar burada koşar (`dotnet`, `node`, `nginx`, `postgres`…).

  * Kernel'e sistem çağrıları (syscall) ile ulaşırlar; donanıma doğrudan dokunamazlar.

**Container açısından:**

* Container = host OS üzerinde çalışan **user space process**.

* Container'lar "sanki kendi OS'leri varmış" gibi izole edilir ama altta **aynı kernel** paylaşılır.

---

## 2. Container vs Virtual Machine

```txt

==== Sanal Makine (VM) ====

+---------------------------+

| Uygulamalar               |

+---------------------------+

| Guest OS (Linux/Win)      |

+---------------------------+

| Hypervisor                |

+---------------------------+

| Host OS                   |

+---------------------------+

| Donanım                   |

+---------------------------+

==== Docker Container =====

+---------------------------+

| Uygulamalar (Container)   |

+---------------------------+

| Kütüphaneler / Runtime    |

+---------------------------+

| Container Runtime         |

+---------------------------+

| Host OS Kernel            |

+---------------------------+

| Donanım                   |

+---------------------------+

```

* **VM**: Tüm makineyi sanallaştırır, her VM kendi OS kernel'iyle gelir → daha ağır.

* **Container**: Yalnızca OS üstündeki yazılım katmanlarını sanallaştırır; host kernel'i paylaşılır → daha hafif, daha hızlı.

> "VM, tam bir makineyi sanallaştırır; container ise host'un kernel'ini paylaşan izole user space process'lerdir."

---

## 3. Docker'ın Mimari Parçaları

```txt

+------------------------+

|     Docker Client      |  (docker CLI)

+-----------+------------+

            |

            |  REST API çağrıları

            v

+------------------------+

|    Docker Daemon       |  (dockerd - Engine)

|  - Image yönetimi      |

|  - Container yönetimi  |

|  - Network             |

|  - Volumes             |

+-----------+------------+

            |

   +--------+---------------------------+

   |                                    |

   v                                    v

+------------------+         +-----------------------+

|   Local Images   |         |    Docker Registry    |

| (Image Cache)    |         |  Örn: Docker Hub      |

+------------------+         +-----------------------+

```

* **Docker Client (CLI)**

  → Senin `docker build`, `docker run`, `docker push` yazdığın kısım.

* **Docker Daemon (`dockerd`)**

  → Arka planda çalışan servis; image, container, network ve volume'leri yönetir.

* **Docker Registry**

  → Image'leri saklayan ve dağıtan servis (Docker Hub, GitHub Container Registry, AWS ECR vs).

* **Docker Hub**

  → Docker'ın resmi cloud registry'si; public/private repo'lar ile image push/pull yaparsın.

---

## 4. Image ve Container İlişkisi

```txt

        Dockerfile

            |

            |  docker build -t myapi:1.0.0 .

            v

+-----------------------+

|        IMAGE          |  (read-only şablon)

|   myapi:1.0.0         |

+-----------+-----------+

            |

            |  docker run myapi:1.0.0

            v

+-----------------------+

|      CONTAINER        |  (çalışan instance)

|   myapi-container     |

+-----------------------+

```

* **Image**

  * Uygulama + bağımlılıkların read-only şablonu.

  * Katmanlı bir dosya sistemi (layer'lar).

* **Container**

  * Image'in çalışır durumdaki kopyası.

  * Kendi dosya sistemi, process listesi, network'ü varmış gibi davranır; ama kernel paylaşımlı.

> "Image = şablon, Container = o şablondan çalışan kopya."

---

## 5. Dockerfile – Image'in Tarifi

Örnek (multi-stage .NET 8 Web API):

```dockerfile

# 1. Build aşaması

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY . .

RUN dotnet publish -c Release -o /app/publish

# 2. Runtime aşaması

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "MyApi.dll"]

```

* Multi-stage build: İlk aşamada SDK ile build/publish yap,

  ikinci aşamada sadece publish çıktısını hafif bir runtime imajına koy.

Önemli talimatlar:

* `FROM` → Base imaj seçimi (`sdk` + `aspnet`).

* `WORKDIR` → Çalışma klasörü.

* `COPY` → Dosya kopyalama.

* `RUN` → Build sırasında çalışan komut.

* `EXPOSE` → Container'ın dinlediği portu belgelemek.

* `ENTRYPOINT` → Container start olduğunda çalışacak komut.

---

## 6. Docker Host, Network, Volume, Bind Mount

### 6.1 Docker Host

> **Docker Host** = Docker Engine'in kurulu olduğu makine (senin laptop'un, bir VM, bir fiziksel sunucu olabilir).

Bind mount veya volume konuşurken "host path" dediğimizde, bu host makinenin normal dosya sistemi path'inden bahsediyoruz.

---

### 6.2 Docker Network

```txt

               +----------------------+

               |  Docker Network      |

               |   (örn: bridge)      |

               +----------+-----------+

                          |

             -------------+-------------

             |                         |

       +-----+------+           +------+-----+

       |   api      |           |   db      |

       | container  |           | container |

       +------------+           +-----------+

```

* Container'ların:

  * Birbiriyle,

  * Host ile,

  * Dış dünyayla (internet)

    konuşmasını sağlayan sanal ağ katmanı.

* Genelde `bridge` network kullanırsın:

  * Aynı network'teki container'lar **isimle** erişilir (`api` → `db:5432`).

---

### 6.3 Volume – Kalıcı Depolama

Container'ın dosya sistemi normalde geçici: container silinirse içi de gider.

```txt

+------------------------------+

|     db container             |

|  /var/lib/postgresql/data    |

+---------------+--------------+

                |

                v

         +-------------+

         |  VOLUME     |  (örn: pgdata)

         | (host'ta)   |

         +-------------+

```

* **Volume**:

  * Docker'ın yönettiği kalıcı depolama alanı.

  * Container ölse bile volume'daki data kalır.

  * Veritabanı dataları için klasik kullanım.

---

### 6.4 Bind Mount – Host Klasörünü Bağlamak

> **Bind mount**, host'taki belirli bir klasörü/dosyayı, bire bir container içindeki path'e bağlamaktır.

Örnek:

```bash

docker run -v /home/user/code:/app myimage

```

* Host path: `/home/user/code`

* Container path: `/app`

```txt

Host filesystem

   /home/user/code  <------------------------+

                                               \

                                                \

                                          +-----+------+

                                          | container  |

                                          |   /app     |

                                          +------------+

```

* Container içindeki `/app` klasöründe gördüğün her şey aslında host'taki `/home/user/code`.

* Her iki taraftaki değişiklik diğerinde de görünür.

---

### 6.5 Volume vs Bind Mount – Özet Tablo

| Özellik        | Volume                                                 | Bind Mount                                                    |

| -------------- | ------------------------------------------------------ | ------------------------------------------------------------- |

| Nerede?        | Docker'ın storage alanında (ör: `/var/lib/docker/...`) | Host'ta senin verdiğin path'te (`/home/user/code:/app`)       |

| Yönetim        | Docker CLI/API ile (`docker volume ...`)               | Normal OS klasörü gibi                                        |

| Kullanım       | Prod, DB data, kalıcı app data                         | Dev'de kod klasörünü container'a vermek, config/log paylaşmak |

| Taşınabilirlik | Daha taşınabilir, host path'e bağlı değil              | Host path yapısına bağımlı                                    |

Genel tavsiye:

* Prod: **volume**

* Dev (kod paylaşmak): **bind mount**

---

## 7. Docker Compose ile Full-Stack Senaryosu

```txt

               docker compose up

      +-----------------------------------+

      |           NETWORK                 |

      |      project_default              |

      +--------+----------------+---------+

               |                |

               |                |

        +------+-----+    +-----+------+

        |   api      |    |    db      |

        |  service   |    |  service   |

        +------------+    +------------+

        | IMAGE:     |    | IMAGE:     |

        | myapi:1.0  |    | postgres:16|

        +------------+    +------------+

        | CONTAINER  |    | CONTAINER  |

        | api_1      |    | db_1       |

        +------------+    +------------+

               |                |

               |                |

               |         +------+------------------+

               |         | VOLUME: pgdata         |

               |         | /var/lib/postgresql... |

               |         +------------------------+

               |

       Tarayıcı → http://localhost:8080

```

* `api` → `db` ile network üzerinden konuşur (`db:5432`).

* DB datası `pgdata` volume'unda kalıcıdır.

* Hepsini tek komutla ayağa kaldırırsın: `docker compose up`.

---

## 8. Docker'ın Felsefesini 3 Cümlede Özetlersek

1. **Immutable infrastructure**

   → Sunucuya girip elle paket kurmak yerine, ortamı Dockerfile/compose ile kodla tarif edersin; değişiklik için yeni image build edip container'ları yeniden başlatırsın.

2. **Her ortamda aynı çalışan paket**

   → Dev, test, prod hepsi aynı image'leri kullanır; sadece env/config farklıdır.

3. **Disposable container mantığı**

   → Container "otel odası" gibidir: geçici, silinebilir; asıl korunan şey image (kod), volume (data) ve config'tir.

---

## 9. Mülakat Ezber Cevapları

* **Docker nedir?**

  > Docker, uygulamaları ve bağımlılıklarını, host OS kernel'ini paylaşan hafif container'lar içinde çalıştırmamızı sağlayan bir container platformudur. Böylece aynı image farklı ortamlarda aynı şekilde çalışır.

* **Container ile VM farkı nedir?**

  > VM kendi işletim sistemi ve kernel'iyle gelir; daha ağırdır. Container'lar ise host OS kernel'ini paylaşan izole user space process'lerdir, bu yüzden çok daha hafif ve hızlıdır.

* **User space ne demek, Docker'la alakası ne?**

  > User space, normal uygulamaların çalıştığı alandır; kernel space ise OS çekirdeğinin çalıştığı alandır. Docker container içindeki process'ler user space'te koşar ve hepsi host'un kernel'ini paylaşır.

* **Volume nedir? Bind mount nedir? Host kim?**

  > Host, Docker Engine'in kurulu olduğu makinedir. Volume, Docker'ın yönettiği kalıcı depolama alanıdır; container silinse bile volume'daki data durur. Bind mount ise host'taki belirli bir path'i bire bir container içine bağlamaktır; dev ortamında kod klasörünü container'a vermek için sık kullanılır.

---

## 10. Örnek Uygulama: .NET 8 Web API + PostgreSQL

Şimdi bütün bu kavramları **somut bir örnekle** bağlayalım:

* Basit bir **.NET 8 Web API** (`MyApi`)

* Bir **PostgreSQL** veritabanı (`db` service'i)

* Kalıcı data için **volume**

* Her şeyi ayağa kaldıran **docker-compose.yml**

### 10.1 Projenin Mantığı

* API, `http://localhost:8080`'den istek alıyor.

* Connection string ile `db` isimli PostgreSQL container'ına bağlanıyor.

* PostgreSQL datası `pgdata` adında bir volume'da saklanıyor.

---

### 10.2 `Dockerfile` – API'nin Image'i

```dockerfile

# ---------- 1. AŞAMA: Build ----------

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Proje dosyalarını container'a kopyala

COPY . .

# Uygulamayı Release modda publish et

RUN dotnet publish -c Release -o /app/publish

# ---------- 2. AŞAMA: Runtime ----------

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Build aşamasındaki publish çıktısını al

COPY --from=build /app/publish .

# API'nin dinlediği portu belgeleyelim (ör: 8080)

EXPOSE 8080

# Container başladığında çalışacak komut

ENTRYPOINT ["dotnet", "MyApi.dll"]

```

#### Satır satır felsefesi

* `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build`

  → Build yapmak için **SDK içeren** bir base image kullanıyoruz. Build işleri için ağır imaj sorun değil; production'da bunu taşımayacağız. (multi-stage build mantığı)

* `WORKDIR /src`

  → "Bundan sonraki komutlar `/src` klasörü içinde çalışsın" diyoruz.

* `COPY . .`

  → Çalışma dizinindeki tüm proje dosyalarını container'daki `/src` dizinine kopyalıyoruz.

* `RUN dotnet publish -c Release -o /app/publish`

  → Build + publish yapıp sadece **çalıştırmaya hazır çıktıyı** `/app/publish` altına koyuyoruz.

* İkinci `FROM` satırı (`aspnet:8.0`)

  → Production için daha **hafif bir runtime imajı** kullanıyoruz; SDK yok, sadece çalıştırma için gerekli şeyler var. (multi-stage'in asıl kazancı)

* `WORKDIR /app`

  → Çalışma klasörümüz `/app`.

* `COPY --from=build /app/publish .`

  → İlk aşamadaki publish çıktısını bu runtime imajına taşıyoruz. Artık build aşamasındaki ağır layer'lar final image'in içinde yok.

* `EXPOSE 8080`

  → Container'ın içinde API'nin hangi portu dinlediğini belgeliyoruz (doküman niteliğinde, compose'ta port map'leyeceğiz).

* `ENTRYPOINT ["dotnet", "MyApi.dll"]`

  → Container başladığında çalışacak ana process'i tanımlıyoruz.

  → "Bu container'ın görevi: `MyApi.dll`'i çalıştırmak" demek.

---

### 10.3 `docker-compose.yml` – API + PostgreSQL

```yaml

version: "3.9"

services:

  api:

    build: .

    container_name: myapi

    ports:

      - "8080:8080"

    environment:

      - ASPNETCORE_URLS=http://0.0.0.0:8080

      - ConnectionStrings__Default=Host=db;Port=5432;Database=mydb;Username=myuser;Password=mypassword

    depends_on:

      - db

  db:

    image: postgres:16

    container_name: mydb

    environment:

      - POSTGRES_DB=mydb

      - POSTGRES_USER=myuser

      - POSTGRES_PASSWORD=mypassword

    ports:

      - "5432:5432"

    volumes:

      - pgdata:/var/lib/postgresql/data

volumes:

  pgdata:

```

Bu YAML, **multi-container app** pattern'ini özetliyor: API + DB + volume.

#### `api` servisi – satır satır felsefe

* `build: .`

  → Aynı klasördeki `Dockerfile`'ı kullanarak image'i burada build et.

  → Felsefe: "Kod repo'sundan direkt imaj üret."

* `container_name: myapi`

  → Container'a okunabilir bir isim veriyoruz (loglarda vs işine yarar).

* `ports: "8080:8080"`

  → `host:container` port map'i.

  → Host'ta `localhost:8080` → container içinde `8080`.

* `ASPNETCORE_URLS=http://0.0.0.0:8080`

  → API içeride tüm interface'leri (0.0.0.0) dinlesin ki dışarıdan port map ile erişilebilsin.

* `ConnectionStrings__Default=...`

  → .NET config binding ile `ConnectionStrings:Default`'a denk geliyor.

  → `Host=db` kısmı: Docker network'teki **db container'ına ismen** bağlan.

* `depends_on: - db`

  → "Önce `db` servisini başlat, sonra `api`yi çalıştır"

  → (DB hazır olma garantisi vermez ama start sırasını belirler).

#### `db` servisi – satır satır felsefe

* `image: postgres:16`

  → Docker Hub'daki official `postgres` imajının `16` tag'ini kullan.

* `environment: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD`

  → PostgreSQL'in başlangıç ayarları (hangi DB'yi, hangi kullanıcıyla, hangi şifreyle oluşturacağını) env ile veriyoruz.

* `ports: "5432:5432"`

  → Host'tan da doğrudan bağlanmak istersen (`psql`, GUI tool vs) 5432'yi map'liyoruz.

* `volumes: - pgdata:/var/lib/postgresql/data`

  → PostgreSQL'in data dizinini (`/var/lib/postgresql/data`) `pgdata` adlı volume'a bağlıyoruz.

  → Container silinse bile `pgdata` volume'u durduğu için data kaybolmuyor.

#### `volumes` bloğu

* `pgdata:`

  → Bu isimle bir **named volume** oluştur diyoruz.

  → Docker volume yaşam döngüsünü kendisi yönetiyor.

---

### 10.4 Bu Yapıyı Çalıştırma

Projeyi (API kodu + Dockerfile + docker-compose.yml) içeren klasörde:

```bash

docker compose up --build

```

* `--build` → API image'ini Dockerfile'dan build et.

* `db` service'i, volume'la birlikte kalkar.

* `api` service'i kalkar ve `db` ile network üzerinden konuşur.

* Tarayıcıdan `http://localhost:8080`'e gidebilirsin.

**Ve burada**:

* Dockerfile → image felsefesini,

* `services.api` → container felsefesini,

* `services.db` + `volumes.pgdata` → veri kalıcılığı (volume),

* compose network → container'ların isimle haberleşmesini,

* env → config yönetimini

  güzelce göstermiş oluyorsun.

---

Bu dosyayı böylece "Docker'ın felsefesi + kavramlar + somut .NET + PostgreSQL örneği" için tek referans not gibi kullanabilirsin.

İstersen sırada aynı yapının **Node.js API + PostgreSQL** versiyonunu da ekleyip iki ekosistemi karşılaştırmalı hale getirebiliriz.

