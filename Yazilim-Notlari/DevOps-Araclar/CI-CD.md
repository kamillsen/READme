# CI/CD Notu (Junior .NET Developer Gözüyle)

## 1. CI/CD Nedir?

**CI/CD** kabaca şunu yapar:

> "Kodu yazarsın, git'e push edersin; gerisini **otomatik** bir pipeline (iş hattı) halleder."

* **CI (Continuous Integration) – Sürekli Entegrasyon**

  * Geliştiriciler kodlarını sık sık (günde defalarca) ortak repoya (GitHub, GitLab vb.) push eder.

  * Her push'ta:

    * Otomatik **build** alınır,

    * Otomatik **testler** çalışır.

  * Amaç: "Kodlar birleştirildiğinde patlasın mı, hemen görelim."

  * Kod birleşmeden önce sorunları erkenden yakalamayı sağlar.

* **CD (Continuous Delivery / Continuous Deployment) – Sürekli Teslim / Sürekli Yayın**

  * CI aşamasından **başarıyla** çıkan (build + test geçmiş) uygulamanın:

    * **Deploy'e hazır hale kadar otomatik ilerlemesi** → *Continuous Delivery*

    * Hatta **direkt prod'a otomatik deploy olması** → *Continuous Deployment*

  * Aradaki fark:

    * Delivery: "Prod'a göndermeden önce son onay insanda."

    * Deployment: "Testler yeşilse direkt prod'a gönder, insana sorma."

**Genel tanım:**

> CI/CD, yazılımın **build, test ve deploy** süreçlerini otomatikleştiren bir pratiktir; ekiplerin daha hızlı, daha sık ve daha az hatayla release yapmasını sağlar.

---

## 2. Neden İş İlanlarında Sürekli CI/CD Yazıyor?

Çünkü modern ekipler **DevOps kültürü** ile çalışıyor ve CI/CD bu kültürün merkezinde:

* **Hız:**

  * Kod push edilir edilmez pipeline çalışır, kısa sürede "geçti / patladı" feedback'i gelir.

* **Kalite:**

  * Otomatik testler her seferinde çalıştığı için bug'lar daha erken yakalanır.

* **Güvenilirlik:**

  * Deploy, "her seferinde farklı şekilde elle yapılan bir iş" olmaktan çıkar; **standart bir süreç** olur.

* **Tekrarlanabilirlik:**

  * "Geçen release'i nasıl deploy etmiştik ya?" sorusu biter. Aynı script, aynı pipeline.

* **Ekip Çalışması:**

  * Herkes aynı pipeline'dan geçtiği için "bende çalışıyor, sende niye çalışmıyor" kaosu azalır.

Bu yüzden ilanlarda şu tip cümleler görürsün:

> "CI/CD süreçlerine hakim, GitHub Actions / GitLab CI / Jenkins / Azure DevOps gibi araçlardan en az biriyle çalışmış olmak."

---

## 3. CI – CD – Continuous Deployment Farkı

Kafada net kalsın diye:

### Continuous Integration (CI)

* Odağı: **Kodun entegre edilmesi + build + test**

* Soru: "Her commit'te kodumuzu derleyip test ediyor muyuz?"

* Amaç:

  * Entegre etmediğin kod *birikir*, sonra hepsini birleştirince büyük patlama yaşarsın.

  * CI ile sık sık merge + test yaparak bu riski azaltırsın.

### Continuous Delivery (CD)

* Odağı: "**Her an deploy edilebilir**, prod'a hazır bir paketimiz olsun."

* Pipeline sonunda:

  * Artifact (örneğin Docker image / publish output) hazırdır.

  * Genelde bir **manuel onay** ile staging/prod'a gönderilir:

    * Örn: "Approve" butonuna basınca deploy olsun.

### Continuous Deployment (CD)

* Odağı: "Testleri geçen kodu **hiç insana sormadan** prod'a kadar götür."

* Akış:

  * Commit → CI (build + test) → CD (otomatik prod deploy)

* Yani: Delivery + insan onayı yok = Deployment.

Kısa özet:

* **CI:** Entegrasyon + build + test

* **Continuous Delivery:** Deploy'e kadar otomatik, deploy öncesi genelde insana sorar

* **Continuous Deployment:** Deploy dahil her şey otomatik

---

## 4. Basit Bir CI/CD Pipeline Akışı

Senin yazdığın gibi düşünelim:

> **Test → Build → Docker Image → Deploy**

Bunu genel akış olarak şöyle düşünebilirsin:

```
Geliştirici (Sen)

    |

    |  git push

    v

-------------   CI   -------------
|  TEST        |  -> Unit / integration test
|  BUILD       |  -> dotnet build / publish
|  DOCKER IMG  |  -> docker build & push
-------------        (artifact hazır)

        |

        v

-------------   CD   -------------
|  DEPLOY      |  -> Staging / Prod'a otomatik veya onayla deploy
-------------
```

Tipik adımlar:

1. **Source (Kaynak Kod)**

   * Kod GitHub / GitLab / Azure Repos üzerinde.

2. **Build**

   * .NET için: `dotnet build` komutu çalışır.

   * Bağımlılıklar indirilir, projeler derlenir.

3. **Test**

   * `dotnet test` ile unit ve varsa integration testleri çalışır.

   * Testler fail olursa pipeline burada durur (deploy olmaz).

4. **Package / Docker**

   * `dotnet publish` ile release output üretilir.

   * `docker build` ile Docker image oluşturulur.

   * İstenirse image, Docker Hub / Azure Container Registry gibi bir registry'e push edilir.

5. **Deploy**

   * Docker image, sunucuya / Kubernetes cluster'a / Azure App Service'e vs. deploy edilir.

   * Bu adım:

     * Continuous Delivery'de genelde bir onay sonrası,

     * Continuous Deployment'ta tamamen otomatik olur.

---

## 5. CI/CD ve Hata İhtimali (Önemli Mantık)

### "Testler geçtiyse artık hata yok mu?" → Hayır 🙂

Testler geçse bile şu sebeplerle **hata ihtimali devam eder**:

* Tüm olası senaryoları test etmek neredeyse imkânsız.

* Eksik veya yanlış yazılmış testler olabilir.

* Test ortamı ile prod ortamı farklı olabilir (config, data, entegrasyonlar vb.).

* Bazı hatalar sadece gerçek kullanımda ortaya çıkar.

**Yani:**

> "Testler geçti" = **Hata ihtimali azalmış** demektir,

> ama hiçbir zaman **%100 hatasız** anlamına gelmez.

Bu yüzden CI/CD yanında hâlâ şunlar da önemlidir:

* Temiz ve anlamlı **loglama**

* **Monitoring & alerting** (uygulamanın canlıda nasıl davrandığını izleme)

* **Code review** (başka gözün kodu okuması)

* İyi tasarlanmış **test stratejisi** (unit, integration, e2e, load test, vs.)

### "CI/CD aslında insanın yaptığı işi mi otomatikleştiriyor?"

Evet, **temelinde kesinlikle bu**. Eskiden:

1. Sen kodu yazardın.

2. Elle:

   * `dotnet build`

   * `dotnet test`

   * `dotnet publish`

3. Sunucuya:

   * FTP ile dosya at,

   * RDP ile bağlan,

   * Servisi durdur/aç,

   * Config kopyala vs.

Her deploy'da aynı sıkıcı ve hata açık iş tekrar ederdi.

**CI/CD'de bu işler:**

* YAML dosyalarına / pipeline tanımına yazılır.

* Git push ile pipeline otomatik tetiklenir.

* Her seferinde **aynı adımlar, aynı sırada**, otomatik ve kaydedilebilir olarak çalışır.

Bunu şöyle özetleyebilirsin:

> "CI/CD, geliştiricinin normalde manuel yaptığı build, test ve deploy adımlarını otomatikleştirir; ayrıca bu süreci standart, tekrar edilebilir ve izlenebilir hâle getirir. Böylece hem hızlanırız hem de manuel hataları azaltırız."

---

## 6. .NET İçin Basit Bir GitHub Actions Örneği (CI + CD Tabanı)

Bu örnek, `.NET` projesi için **build + test + docker build** yapan basit bir CI pipeline'ı gösterir. İleride buraya deploy adımı eklersen tam CI/CD olur.

```yaml
# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches: [ "main" ]

jobs:
  build-test:
    runs-on: ubuntu-latest

    steps:
      - name: Kodu çek
        uses: actions/checkout@v4

      - name: .NET SDK kur
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Build
        run: dotnet build --configuration Release

      - name: Test
        run: dotnet test --no-build --configuration Release

      - name: Docker image oluştur
        run: |
          docker build -t myapp:latest .
```

Bu pipeline şunu yapar:

1. `main` branch'e her push olduğunda tetiklenir.

2. Kodu repodan çeker.

3. .NET SDK'yı kurar.

4. Projeyi build eder.

5. Testleri çalıştırır.

6. Docker image oluşturur.

Sonrasına sen:

* `docker push`,

* Kubernetes deploy komutları,

* Azure / AWS / başka bir PaaS deploy adımı ekleyerek bunu **tam bir CI/CD pipeline** hâline getirebilirsin.

---

## 7. Mülakat İçin Özet Cümleler

Bu nottan çıkarabileceğin, mülakatta kullanabileceğin 2–3 tane "hazır cümle":

1. **Tanım:**

   > "CI/CD, kodu repoya push ettiğimiz anda otomatik olarak build, test ve gerekirse deploy süreçlerini çalıştıran bir pratiktir. CI kısmı kodun sürekli entegre edilip test edilmesini, CD kısmı ise uygulamanın deploy'e kadar veya deploy dahil otomatik teslimini sağlar."

2. **Pratik bakış:**

   > "Aslında geliştiricinin normalde elle yaptığı build, test ve deploy adımlarını pipeline hâline getirip otomatikleştiriyoruz. Böylece hız, standart ve daha az manuel hata kazanıyoruz."

3. **Hata konusu:**

   > "Testlerin geçmesi hatanın tamamen yok olduğu anlamına gelmez ama CI/CD ile her commit'te otomatik test çalıştırdığımız için hataları çok daha erken yakalama şansımız oluyor."

---

Bu notu kaydet; ileride istersen bunun yanına bir de **"örnek .NET projesi + CI/CD pipeline"** mini proje iskeleti çıkarabiliriz, CV'ne yazabileceğin gerçek bir örnek olur.

