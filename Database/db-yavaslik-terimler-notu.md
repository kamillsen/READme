# DB yavaşsa sık duyacağın terimler (kısa not)

Bu not, **veritabanı (DB) yavaşladığında** ekiplerin sıkça bahsettiği bazı kavramları “ne işe yarar / ne zaman iyi gelir / ne götürür?” şeklinde, kısa ve anlaşılır biçimde özetler.

---

## 1) Indexing (İndeksleme)

**Ne?**  
Tabloda belirli sütun(lar) için “**hızlı bulma kısayolu**” oluşturan veri yapısı.

**Neyi hızlandırır?**  
- Özellikle `WHERE`, `JOIN`, `ORDER BY` ile filtreleme/sıralama yapılan sorgularda **tam tablo taramasını** azaltır.

**Bedeli / yan etkisi**  
- Yazma işlemleri (`INSERT/UPDATE/DELETE`) indeksleri de güncellediği için **yazma maliyeti artar**.  
- İndeksler **disk/ram** tüketir.

**Hızlı ipucu**  
- “Her şeye indeks” yerine: en çok kullanılan filtre/join sütunlarını hedefle.  
- Sorgunun gerçekten indeksi kullanıp kullanmadığını **execution plan** ile kontrol et.

---

## 2) Demoralization (aslında çoğu yerde *Denormalization* kastedilir)

> Not: “**Demoralization**” kelimesi teknik dokümanlarda bazen yanlış/karışık kullanılır; DB bağlamında çoğu zaman **Denormalization (denormalizasyon)** anlamında görülür.

**Ne?**  
Normalizasyondaki “tabloları parçalama ve tekrarları azaltma” yaklaşımının tersine, **okuma performansı için bazı verileri bilinçli olarak tekrar etmek / tabloları birleştirmek**.

**Neyi hızlandırır?**  
- Çok `JOIN` yapan, okuma ağırlıklı (read-heavy) senaryolarda sorguları basitleştirip **okumayı hızlandırabilir**.

**Bedeli / yan etkisi**  
- Veri tekrarı → güncelleme sırasında **tutarlılık riski** (aynı bilginin birden çok yerde güncellenmesi gerekir).  
- Yazmalar ve veri modeli karmaşıklığı artabilir.

**Basit örnek**  
- Sipariş listesini her seferinde `Orders + Customers` join’lemek yerine, `Orders` içinde `customer_name` gibi bir alanı kopyalamak (dikkat: güncelleme senaryoları).

---

## 3) Caching (Önbellekleme)

**Ne?**  
Sık erişilen veriyi/sonucu daha hızlı bir katmanda (RAM, Redis vb.) tutup, aynı istek geldiğinde **DB’ye gitmeden** dönmek.

**Neyi hızlandırır?**  
- “Aynı şey tekrar tekrar okunuyor” problemi varsa gecikmeyi düşürür, DB yükünü azaltır.  
- Özellikle **read-heavy** iş yüklerinde etkili.

**Bedeli / yan etkisi**  
- **Cache invalidation** (önbelleği doğru zamanda temizlemek) zor olabilir.  
- Tutarlılık: cache’deki veri bir süre “eski” kalabilir (stratejiye bağlı).

**Hızlı ipucu**  
- En çok tekrar eden ve değişimi daha az olan verilerle başla (örn. ürün kataloğu, konfigürasyon).  
- “TTL (zaman aşımı)” veya “write-through / write-back” gibi stratejiler seçilir.

---

## 4) Replication (Replikasyon)

**Ne?**  
Verinin **kopyalarını** başka sunucu(lar)a/örnek(ler)e çoğaltma. En yaygın kullanım: **read replica** (okuma replikası).

**Neyi hızlandırır / neye yarar?**  
- Okumaları birden çok kopyaya dağıtarak **read throughput** artırır.  
- Yüksek erişilebilirlik ve felaket senaryolarına yardımcı olur.

**Bedeli / yan etkisi**  
- Çoğu mimaride replikalar **asenkron** güncellenir → kısa süreli **eventual consistency** (anlık tutarsızlık) görülebilir.  
- Operasyonel karmaşıklık artar (failover, gecikme takibi vb.).

---

## 5) Sharing (genelde iki farklı anlamda duyulur)

### 5a) “Shared locks / data sharing” (Paylaşımlı okuma kilidi)
**Ne?**  
Aynı veriyi birden çok işlem **okuyabilir** (shared lock), ama bir işlem yazmak isterse beklemek zorunda kalabilir.

**DB yavaşlığıyla ilişkisi**  
- Yoğun yazma/okuma çakışmalarında **lock contention** (kilit bekleme) oluşur → sorgular sıraya girer.

**Hızlı ipucu**  
- Uzun süren transaction’ları kısaltmak, doğru izolasyon seviyesi, doğru indeks, daha küçük güncellemeler kilit baskısını azaltır.

### 5b) “Sharding” ile karışabilir
Ekipler bazen “sharing” derken **sharding** (parçalara bölüp dağıtma) kasteder. Aşağıda ayrı başlıkta var.

---

## 6) Sharding (Parçalama / Dağıtım)

**Ne?**  
Veriyi “parçalara” (shard) bölüp **birden çok sunucuya dağıtmak**. Bu bir “scale-out” yöntemidir.

**Neyi hızlandırır / neye yarar?**  
- Tek bir DB’nin kapasitesi yetmediğinde yükü dağıtarak **ölçeklenebilirlik** sağlar.  
- Doğru shard anahtarıyla bazı sorgular daha az veri tarar.

**Bedeli / yan etkisi**  
- Uygulama ve operasyon karmaşıklığı artar (shard seçimi, yeniden dengeleme, cross-shard join zorluğu).  
- Bazı sorgular (tüm shard’ları tarayan) zorlaşır.

---

## 7) Vertical scaling (Dikey ölçekleme / Scale-up)

**Ne?**  
Yeni makine eklemek yerine **aynı makineyi büyütmek**: daha fazla CPU, RAM, daha hızlı disk, daha iyi network.

**Neyi hızlandırır?**  
- Çoğu DB için “en hızlı ilk çözüm” olabilir: daha çok RAM → daha fazla veri bellekte; daha hızlı disk → I/O bekleme azalır.

**Bedeli / sınırı**  
- Donanımın bir üst sınırı var (en büyük makineye kadar).  
- “Tek kutu” bağımlılığı devam eder (tek noktadan arıza riski, maliyet artışı).

---

# DB yavaşsa hangisini düşünmeliyim? (mini kontrol listesi)

- **Sorgular yavaş mı?** → önce **indexing** ve sorgu planı  
- **Aynı veriler tekrar tekrar mı okunuyor?** → **caching**  
- **Okuma çok, yazma az; tek DB yetmiyor mu?** → **replication (read replicas)**  
- **Join’ler çok pahalı mı; raporlama/okuma ağırlıklı mı?** → dikkatli **denormalization**  
- **Tek makinenin limiti mi doldu?** → **vertical scaling** veya daha köklü olarak **sharding**  
- **İşlemler kilitte mi bekliyor?** → “sharing/shared locks” ve **lock contention** analizi

---

## Kaynak notları (okuma için)
- İndeksleme ve neden hızlandırdığı (genel açıklamalar)
- Denormalizasyonun performans/tutarlılık takası
- Önbelleklemenin DB yükünü azaltma mantığı
- Read replica / replikasyonun okuma ölçekleme yaklaşımı
- Sharding vs partitioning farkı
- Vertical scaling (scale-up) tanımı
