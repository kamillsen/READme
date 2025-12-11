# Normalizasyon & Denormalizasyon

Tek, çok basit bir senaryo seçeceğiz → onu adım adım:

**bozuk tablo → 1NF → 2NF → 3NF → denormalizasyon**

diye dönüştüreceğiz. Hepsini ASCII tablolarıyla göstereceğim.

---

## Senaryo

Öğrenciler ders seçiyor.

Her öğrencinin bir bölümü var, her dersi de bir öğretmen veriyor.

---

## 0. BOZUK TABLO (her şey tek yerde)

**Tablo: OgrenciDers_Bozuk**

```
+---------+-------------+----------+----------------------+-----------+------------------+
| OgrId   | OgrAd       | Bolum    | Dersler              | Ogretmen  | OgretmenMail     |
+---------+-------------+----------+----------------------+-----------+------------------+
| 1       | Ali Yılmaz  | Bilgisayar | Mat, Fizik         | Ahmet Hoca| ahmet@uni.edu    |
| 2       | Ayşe Demir  | Elektrik   | Fizik              | Ahmet Hoca| ahmet@uni.edu    |
+---------+-------------+----------+----------------------+-----------+------------------+
```

### Problemler:

* **Dersler kolonu**: liste tutuyor → "Mat, Fizik" (atomik değil).
* **Aynı öğretmen bilgileri** tekrar tekrar yazılıyor.
* **Öğrenci bir ders daha alınca ne olacak?** → string büyüyor, sorgulamak zorlaşıyor.

### Güncelleme sıkıntıları:

* Öğretmenin maili değişirse → bütün satırları tek tek güncellemelisin.

### Normalizasyon'un felsefesi:

> "Veriyi, mantıksal parçalara ayır, her bilgi parçasını tek yerde sakla ki güncellemek ve korumak kolay olsun."

---

## 1. 1NF – Her hücre tek değer olsun

### Kural (basit):

* Her kolon bölünemez tek bir değer tutmalı.
* Tek satırda tekrar eden grup (liste, virgüllü değer) olmamalı.

Bozuk tablodaki asıl dert: **Dersler kolonu**.

### 1NF'e geçiş:

Her derse ayrı satır açıyoruz.

**Tablo: OgrenciDers_1NF**

```
+---------+-------------+----------+----------+-----------+------------------+
| OgrId   | OgrAd       | Bolum    | Ders     | Ogretmen  | OgretmenMail     |
+---------+-------------+----------+----------+-----------+------------------+
| 1       | Ali Yılmaz  | Bilgisayar | Mat    | Ahmet Hoca| ahmet@uni.edu    |
| 1       | Ali Yılmaz  | Bilgisayar | Fizik  | Ahmet Hoca| ahmet@uni.edu    |
| 2       | Ayşe Demir  | Elektrik   | Fizik  | Ahmet Hoca| ahmet@uni.edu    |
+---------+-------------+----------+----------+-----------+------------------+
```

### Artık:

* Ders kolonu tek bir ders tutuyor (Mat / Fizik).
* Liste yok, virgülle ayrılmış değer yok → **1NF OK**.

### Ama hâlâ:

* OgrAd, Bolum her satırda tekrar ediyor.
* Ogretmen, OgretmenMail her satırda tekrar ediyor.

---

## 2. 2NF – Bileşik anahtara tam bağımlılık

### 2NF nedir? (düz Türkçe versiyon)

Resmî tanım şunu der:

> Bir tablo 1NF'te olacak
>
> **+**
>
> İçindeki her "anahtar olmayan" kolon, **anahtarın tamamına** bağlı olacak; anahtarın sadece bir parçasına değil.

Günlük dilde çevirirsek:

> Satırın kimliğini belirleyen anahtar **iki sütundan oluşuyorsa** (mesela `OgrId + DersId`),
>
> o satırdaki diğer sütunlar
>
> **"hem öğrenciye hem derse" aynı anda ait bilgi olmalı.**
>
> Sadece öğrenciye aitse ya da sadece derse aitse bu tabloda durmamalı.

Yani:

**"Satırın yarısına değil, tamamına bağlı bilgi kalsın."**

---

### Ne örnekle anlatıyorduk?

Şu tabloyu düşün (1 öğrenci birçok derse kayıtlı):

**Tablo: OgrenciDers (1NF, ama 2NF DEĞİL)**

```
+---------+----------+-------------+-----------+
| OgrId   | DersId   | OgrAd       | DersAd    |
+---------+----------+-------------+-----------+
| 1       | 10       | Ali Yılmaz  | Matematik |
| 1       | 11       | Ali Yılmaz  | Fizik     |
| 2       | 11       | Ayşe Demir  | Fizik     |
+---------+----------+-------------+-----------+
```

* **Bileşik anahtar**: `(OgrId, DersId)`
* Non-key kolonlar: `OgrAd`, `DersAd`

Şimdi soralım:

* `OgrAd` → sadece **OgrId**'ye bağlı (derse göre değişmiyor)
* `DersAd` → sadece **DersId**'ye bağlı (öğrenciye göre değişmiyor)

Yani bu iki kolon, anahtarın **yarısına** bağlı → **partial dependency (kısmi bağımlılık)** denilen durum bu.

---

### 2NF ile **NEYİ ENGELLİYORUZ?**

Bu kısmi bağımlılık neye sebep olur?

1. **Veri tekrarı (redundancy)**

   * `Ali Yılmaz` ismi, aldığı her derste tekrar ediyor.
   * `Matematik` adı, bu derse kayıtlı her öğrenci için tekrar ediyor.

2. **Güncelleme hataları (update anomaly)**

   * Ali soyadını "Yılmaz" → "Yıldız" yaptı.
   * Tabloda Ali'nin 20 tane satırı varsa, 20 satırı güncellemezsen:

     * Bazı satırlarında "Yılmaz", bazılarında "Yıldız" kalabilir.
   * Aynı sorun `DersAd` için de geçerli.

3. **Silme problemi (delete anomaly)**

   * Bir dersi Alan **son öğrenciyi** kayıttan silersen:

     * O derse ait `DersAd` bilgisi de kaybolabilir (eğer başka yerde yoksa).

2NF'in amacı tam olarak bu **kısmi bağımlılıkların yarattığı tekrar ve anomalileri yok etmek**.

---

### 2NF ile **NEYİ SAĞLAMAYA ÇALIŞIYORUZ?**

2NF'in hedefi:

1. **Her tablo tek "tür" bilgi tutsun**

   * `Ogrenciler` tablosu → sadece öğrenciye ait bilgiler
   * `Dersler` tablosu → sadece derse ait bilgiler
   * `OgrenciDers` tablosu → sadece "şu öğrenci şu derse kayıtlı" ilişkisi

2. **Her bilgi tek bir yerde olsun**

   * Bir öğrencinin adı **tek satırda** dursun (`Ogrenciler` tablosunda).
   * Bir dersin adı **tek satırda** dursun (`Dersler` tablosunda).
   * Böylece:

     * Güncelleme kolay,
     * Tutarsızlık ihtimali düşük.

3. **Her kolon satırın TAM kimliğiyle ilgili olsun**

   * `OgrenciDers` tablosunda kolonlar:

     * ya `Ogrenci + Ders` ikilisine birden bağlı olsun (ör: `Not`, `Devamsizlik`)
     * ya hiç olmasın (yanlış tablodadır).

Bu yüzden literatürde 2NF şöyle özetlenir:

> "Non-key attribute'ler, **primary key'in tamamına** tam bağımlı olmalı; sadece bir kısmına değil."

---

### 2NF'i **NASIL** uyguluyoruz? (Adım adım reçete)

Yine `OgrenciDers` örneği üzerinden gidelim.

#### Adım 1 – Tablon 1NF mi?

* Hücrelerde liste yok mu?
* Her satır benzersiz mi?

Bizim tablo zaten 1NF (her satır tek öğrenci-tek ders).

#### Adım 2 – Anahtar bileşik mi?

* Evet → `(OgrId, DersId)`.

> Not: Eğer **tek kolonluk** bir primary key'in varsa ve 1NF'teysen, otomatikman 2NF'tesin; çünkü "anahtarın yarısı" diye bir kavram yok.

#### Adım 3 – Her non-key kolona şunu sor:

> "Bu kolon hem **OgrId** hem **DersId** olmadan anlamlı mı?"

* `OgrAd` → Sadece `OgrId` ile anlamlı, derse gerek yok ⇒ kısmi bağımlılık
* `DersAd` → Sadece `DersId` ile anlamlı ⇒ kısmi bağımlılık
* (Varsayalım `Not` diye bir kolon olsaydı:)

  * `Not` → hem öğrenciye hem derse ihtiyaç var ("Ali'nin Matematik notu")
  * Bu **tam bağımlı** → 2NF açısından OK.

#### Adım 4 – Kısmi bağımlı kolonları **ayrı tablolara taşı**

Eski tablo:

**Tablo: OgrenciDers (Kötü)**

```
+---------+----------+-------------+-----------+
| OgrId   | DersId   | OgrAd       | DersAd    |
+---------+----------+-------------+-----------+
```

Böl → 3 tablo:

**1️⃣ Ogrenciler**

```
+---------+-------------+
| OgrId   | OgrAd       |
+---------+-------------+
| 1       | Ali Yılmaz  |
| 2       | Ayşe Demir  |
+---------+-------------+
```

**2️⃣ Dersler**

```
+----------+-----------+
| DersId   | DersAd    |
+----------+-----------+
| 10       | Matematik |
| 11       | Fizik     |
+----------+-----------+
```

**3️⃣ OgrenciDers (artık tam 2NF)**

```
+---------+----------+
| OgrId   | DersId   |
+---------+----------+
| 1       | 10       |
| 1       | 11       |
| 2       | 11       |
+---------+----------+
```

ER diyagramını da gösterelim:

```
Ogrenciler            OgrenciDers             Dersler
-----------           -----------------       -----------
OgrId PK     1     n  OgrId FK      n    1    DersId PK
OgrAd       <--------> DersId FK   <------->  DersAd
```

Artık:

* `Ogrenciler` tablosundaki `OgrAd` sadece `OgrId`'ye bağlı.
* `Dersler` tablosundaki `DersAd` sadece `DersId`'ye bağlı.
* `OgrenciDers` tablosunda, eğer `Not` eklersek:

**Tablo: OgrenciDers (Not ile)**

```
+---------+----------+------+
| OgrId   | DersId   | Not  |
+---------+----------+------+
| 1       | 10       | 90   |
| 1       | 11       | 75   |
| 2       | 11       | 80   |
+---------+----------+------+
```

`Not` → tam olarak `(OgrId, DersId)` ikilisine bağlı → 2NF kuralı tam karşılanmış oluyor.

---

### Kısa Özet (tek paragrafta):

* 2NF, **bileşik anahtar** olan tablolarda devreye girer.
* "Anahtar olmayan kolon, anahtarın **tamamıyla** ilgili olsun; sadece yarısıyla ilgili olmasın" der.
* Böylece:

  * Aynı öğrencinin adı, her ders satırında tekrar etmez,
  * Aynı dersin adı, her öğrenci satırında tekrar etmez,
  * Güncelleme ve silme hataları azalır.
* Bunu yapmak için:

  * "Bu kolon sadece öğrenciyle mi ilgili?" → `Ogrenciler` tablosuna,
  * "Bu kolon sadece dersle mi ilgili?" → `Dersler` tablosuna,
  * "Hem öğrenci hem ders birlikte olmadan anlamlı değil mi?" → ilişki tablosunda (`OgrenciDers`) bırak.

---

## 3. 3NF – "Anahtar olmayan kolon, başka anahtar olmayan kolona bağlı olmasın"

Önce yine teorik cümleyi düz Türkçeye çevireyim.

### Resmî tanım (özet):

* Tablo **önce 2NF'te** olacak.
* Her **anahtar olmayan** kolon:

  * Yalnızca **primary key'e** bağlı olacak,
  * Başka bir **anahtar olmayan** kolona bağımlı olmayacak.

    (Buna "transitif bağımlılık" deniyor.)

### Günlük Türkçe çeviri:

> Tablo içindeki "ek bilgiler" (non-key kolonlar),
>
> "satırı benzersiz yapan şey"e (primary key) doğrudan bağlı olsun.
>
> Başka bir ek bilgiye bağlı olmasın.

Yani 3NF şunu der:

> "Non-key → non-key bağımlılık olmasın."

---

### 3.1. Aynı hikâyede 3NF problemi nasıl doğuyor?

Elimizde şunlar vardı:

**Tablo: Ogrenciler (2NF)**

```
+---------+-------------+-----------+
| OgrId   | OgrAd       | BolumKodu |
+---------+-------------+-----------+
| 1       | Ali Yılmaz  | CENG      |
| 2       | Ayşe Demir  | EE        |
+---------+-------------+-----------+
```

Şimdi diyelim ki tasarımcı şöyle bir şey yapmış:

**Tablo: Ogrenciler (3NF DEĞİL)**

```
+---------+-------------+-----------+--------------+-----------------+
| OgrId   | OgrAd       | BolumKodu | BolumAd      | Fakultesi       |
+---------+-------------+-----------+--------------+-----------------+
| 1       | Ali Yılmaz  | CENG      | Bilgisayar   | Mühendislik     |
| 2       | Ayşe Demir  | EE        | Elektrik     | Mühendislik     |
+---------+-------------+-----------+--------------+-----------------+
```

Burada:

* **Primary Key**: `OgrId`
* Non-key kolonlar: `OgrAd`, `BolumKodu`, `BolumAd`, `Fakultesi`

Şimdi tek tek bakalım:

* `OgrAd` → doğrudan `OgrId`'ye bağlı (OK)
* `BolumKodu` → doğrudan `OgrId`'ye bağlı (OK, "hangi bölümde okuyor" bilgisi)
* Ama:

  * `BolumAd` ve `Fakultesi` aslında **`BolumKodu`'ya bağlı**

Bunu ok gibi çizersek:

```
OgrId ---> BolumKodu ---> BolumAd, Fakultesi
```

Yani:

* `BolumAd` ve `Fakultesi` için:

  * "Bu bilgi, öğrencinin kendisine mi ait?"

    Aslında hayır: Bölüme ait.

  * "Bu bilgi, bölüm koduna bakarak çıkmıyor mu?"

    Evet: CENG → Bilgisayar, Fakülte: Mühendislik

İşte bu:

> Key (OgrId) → Non-key (BolumKodu) → Non-key (BolumAd, Fakultesi)

**transitif bağımlılık** örneği.

3NF bunu **istemiyor**.

---

### 3.2. 3NF ile neyi engelliyoruz?

Bu yapıda ne sıkıntı var, ona bakalım.

#### 1) Veri tekrarı

**Tablo: Ogrenciler**

```
+---------+-------------+-----------+--------------+-----------------+
| 1       | Ali Yılmaz  | CENG      | Bilgisayar   | Mühendislik     |
| 3       | Mehmet Can  | CENG      | Bilgisayar   | Mühendislik     |
| 4       | Zeynep Koç  | CENG      | Bilgisayar   | Mühendislik     |
+---------+-------------+-----------+--------------+-----------------+
```

* Aynı bölüm adı / fakülte adı, CENG bölümündeki **tüm öğrenciler** için tekrar tekrar yazılıyor.

#### 2) Güncelleme hataları

* Bir gün yönetim "Bilgisayar" bölüm adını "Bilgisayar Mühendisliği" yapmaya karar verdi diyelim.
* CENG bölümünde 500 öğrenci varsa:

  * 500 satırda `BolumAd` değiştirmen gerekir.
  * 1 tanesini bile unutursan:

    * Bazı satırlar "Bilgisayar", bazıları "Bilgisayar Mühendisliği" kalır → tutarsız veri.

#### 3) Silme problemi

* CENG kodlu bölümde **tek bir öğrenci** kaldı.
* O öğrenciyi tablodan sildiğinde:

  * CENG'e ait `BolumAd` ve `Fakultesi` bilgisi de kayboluyor (eğer başka yerde yoksa).

> 3NF, "bölüme ait veriyi, öğrencinin satırında taşıma" diyor.
>
> Her tür bilgi **kendi tablosuna** gitmeli.

---

### 3.3. 3NF ile neyi sağlamaya çalışıyoruz?

3NF'in hedefi:

1. **Her tablo tek bir "gerçek dünya varlığı" anlatsın.**

   * `Ogrenciler` → sadece öğrencilerle ilgili olsun.
   * `Bolumler` → sadece bölümlerle ilgili olsun.

2. **Her bilgi, anlam olarak "doğru yerde" dursun.**

   * Bölüm adı, fakülte adı → bölüm tablosunda.
   * Öğrencinin adı, hangi bölümde olduğu → öğrenci tablosunda.

3. **Güncellemeler tek yerden yapılsın.**

   * Bölüm adı değişirse:

     * Sadece `Bolumler` tablosunda 1 satır güncelle.
   * Bütün öğrencilerin satırlarını kurcalama.

4. **Non-key alanlar sadece key'e bağlı olsun.**

   * "Öğrencinin bölümü ne?" → `Ogrenciler` tablosunda.
   * "Bu bölümün adı ne, hangi fakültede?" → `Bolumler` tablosunda.

---

### 3.4. 3NF'e nasıl geçiriyoruz? (Adım adım)

Başlangıç:

**Tablo: Ogrenciler (3NF DEĞİL)**

```
+---------+-------------+-----------+--------------+-----------------+
| OgrId   | OgrAd       | BolumKodu | BolumAd      | Fakultesi       |
+---------+-------------+-----------+--------------+-----------------+
| 1       | Ali Yılmaz  | CENG      | Bilgisayar   | Mühendislik     |
| 2       | Ayşe Demir  | EE        | Elektrik     | Mühendislik     |
+---------+-------------+-----------+--------------+-----------------+
```

#### Adım 1 – "Kim kime bağlı?" diye bak

* Primary key: `OgrId`
* Non-key kolonlar:

  * `OgrAd` → OgrId'ye bağlı (doğrudan)
  * `BolumKodu` → OgrId'ye bağlı (doğrudan)
  * `BolumAd` → aslında `BolumKodu`'ya bağlı
  * `Fakultesi` → aslında `BolumKodu`'ya bağlı

Burada **non-key (BolumKodu) → non-key (BolumAd, Fakultesi)** var.

Yani 3NF ihlali.

#### Adım 2 – "Merkezi kolon"u ayır: Bölümler tablosu aç

Bölüm bilgilerini ayrı tabloya taşı:

**Tablo: Bolumler**

```
+-----------+--------------+-----------------+
| BolumKodu | BolumAd      | Fakultesi       |
+-----------+--------------+-----------------+
| CENG      | Bilgisayar   | Mühendislik     |
| EE        | Elektrik     | Mühendislik     |
+-----------+--------------+-----------------+
```

#### Adım 3 – Öğrenci tablosunu sadeleştir

**Tablo: Ogrenciler (3NF)**

```
+---------+-------------+-----------+
| OgrId   | OgrAd       | BolumKodu |
+---------+-------------+-----------+
| 1       | Ali Yılmaz  | CENG      |
| 2       | Ayşe Demir  | EE        |
+---------+-------------+-----------+
```

Şimdi duruma bakalım:

* `Ogrenciler` tablosunda:

  * Key: `OgrId`
  * Non-key'ler: `OgrAd`, `BolumKodu` → ikisi de doğrudan `OgrId`'ye bağlı.
  * Non-key → non-key bağımlılık yok.

* `Bolumler` tablosunda:

  * Key: `BolumKodu`
  * Non-key'ler: `BolumAd`, `Fakultesi` → ikisi de doğrudan `BolumKodu`'ya bağlı.

Her tablo kendi içinde "temiz".

#### ASCII mini diyagram

```
Bolumler                     Ogrenciler
-----------                  -----------
BolumKodu PK   1        n    OgrId PK
BolumAd      <----------->   OgrAd
Fakultesi                    BolumKodu FK
```

Şimdi:

* Bölüm adı değişirse → `Bolumler` tablosunda **1 satır** güncellersin.
* Yeni bir öğrenci eklerken:

  * `Ogrenciler`'e sadece `BolumKodu` yazarsın,
  * Ad/Fakülte bilgisi zaten `Bolumler` tablosunda var.

---

### 3.5. 2NF ile 3NF farkını netleştirelim

**2NF odak:**

* Bileşik key varsa (`(OgrId, DersId)` gibi),
* Non-key kolonlar, **key'in sadece bir parçasına** bağlı olmasın.
* Örnek:

  * `OgrAd` → sadece `OgrId`'ye bağlı → 2NF ihlali.

**3NF odak:**

* Non-key kolonlar, başka non-key kolonlara bağlı olmasın.
* Örnek:

  * `BolumAd` → `BolumKodu`'ya bağlı; `BolumKodu` da key'e (`OgrId`) bağlı.
  * Yani key → non-key → non-key zinciri var → 3NF ihlali.

Kısaca:

* 2NF: **"Key'in yarısına bağlı kolon istemiyorum."**
* 3NF: **"Key harici kolonlara bağlı kolon istemiyorum."**

---

### 3.6. "Gerçek hayatta" kuralı nasıl kullanıyoruz?

Pratikte şunu yapıyoruz:

1. Tabloya bak.
2. "Bu kolonu buradan silsem, onun için ayrı bir tablo açsam mantıklı olur mu?" diye sor.

   * `BolumAd`, `Fakultesi` → evet, çünkü bölüm diye ayrı bir kavram var.
   * `OgrAd` → hayır, çünkü o zaten öğrenciye ait temel bilgi.

3. Cevap **evet** ise:

   * O kolonları al, yeni tablo aç.
   * Eski tabloda sadece **id / kod** (FK) kalsın.

Bu yaklaşım seni çoğu zaman otomatikman 3NF'e götürüyor.

---

## 4. Denormalizasyon – Bilerek kural bozmak

### 4.1. Kısa tanım (özet)

Kaynaklar denormalizasyonu şöyle tarif ediyor:

> Normalize (1NF–2NF–3NF) edilmiş bir veritabanına, **bilerek** biraz **veri tekrarı** ekleyerek
>
> sorguları hızlandırmak ve join sayısını azaltmak.

Yani:

* Normalizasyon → veriyi **parçala**, tekrarları yok et, **tutarlılık**.
* Denormalizasyon → bazı yerlerde veriyi **birleştir / kopyala**, tekrar oluştur, ama **okumayı hızlandır**.

> Bu bir **tasarım hilesi**: "Doğru" olan normalizasyonu yapıyoruz,
>
> sonra **performans için** bazı yerleri bilinçli "bozuyoruz".

---

### 4.2. Neyi çözmeye çalışıyoruz?

Normalleştirilmiş tasarımda:

* Tablo sayısı fazla,
* Bir ekran/sorgu için birçok **JOIN** yapmak gerekiyor.

Özellikle:

* Dashboardlar
* Rapor ekranları
* Çok okuma yapılan (read-heavy) sistemler
* Gerçek zamanlı (sub-second) cevap beklenen yerler

için büyük tabloları 4–5 tabloyla join'lemek ağır gelebiliyor. Denormalizasyon:

* JOIN sayısını azaltıp,
* SQL'i basitleştirip,
* **okuma performansını artırmaya** çalışır.

---

### 4.3. Neyi feda ediyoruz?

Bunun karşılığında şunu feda ediyoruz:

* **Veri tekrarı (redundancy)**: aynı bilgi birden fazla tabloya yazılıyor.
* **Güncelleme yükü**: bir bilgi değişince, onu tuttuğun **her yeri** güncellemen gerekiyor.
* Tutarsızlık riski: yerlerden biri güncellenmezse veri çelişkili olur.

Yani:

> Normalizasyon = "Veri bütünlüğü + az tekrar"
>
> Denormalizasyon = "Daha hızlı okuma + daha fazla tekrar + daha zor güncelleme"

---

### 4.4. Öğrenci örneği ile Denormalizasyon

Önce normal (3NF'e yakın) şemamızı hatırlayalım:

**Tablo: Bolumler**

```
+-----------+--------------+-----------------+
| BolumKodu | BolumAd      | Fakultesi       |
+-----------+--------------+-----------------+
| CENG      | Bilgisayar   | Mühendislik     |
| EE        | Elektrik     | Mühendislik     |
+-----------+--------------+-----------------+
```

**Tablo: Ogrenciler**

```
+---------+-------------+-----------+
| OgrId   | OgrAd       | BolumKodu |
+---------+-------------+-----------+
| 1       | Ali Yılmaz  | CENG      |
| 2       | Ayşe Demir  | EE        |
+---------+-------------+-----------+
```

**Tablo: Dersler**

```
+----------+-----------+
| DersId   | DersAd    |
+----------+-----------+
| 10       | Matematik |
| 11       | Fizik     |
+----------+-----------+
```

**Tablo: OgrenciDers**

```
+---------+----------+------+
| OgrId   | DersId   | Not  |
+---------+----------+------+
| 1       | 10       | 90   |
| 1       | 11       | 75   |
| 2       | 11       | 80   |
+---------+----------+------+
```

Bu tasarım **güzel normalize**:

* Bölüm bilgisi → `Bolumler`
* Öğrenci bilgisi → `Ogrenciler`
* Ders bilgisi → `Dersler`
* İlişki ve not → `OgrenciDers`

### Ama raporda ne istiyoruz?

Mesela bir dashboard düşün:

> "Her öğrenci için:
>
> Adı, Bölümü, Fakültesi, Aldığı ders sayısı"

Bu bilgiyi almak için SQL'de:

* `Ogrenciler`
* `Bolumler`
* `OgrenciDers`

tablosunu join'lemen gerekiyor (en az 3 tablo).

---

### 4.5. Denormalize Rapor Tablosu

Performans için şöyle bir **rapor tablosu** oluşturabiliriz:

**Tablo: OgrenciRapor (DENORMAL)**

```
+---------+-------------+--------------+-----------------+-------------------+
| OgrId   | OgrAd       | BolumAd      | Fakultesi       | AldigiDersSayisi |
+---------+-------------+--------------+-----------------+-------------------+
| 1       | Ali Yılmaz  | Bilgisayar   | Mühendislik     | 2                 |
| 2       | Ayşe Demir  | Elektrik     | Mühendislik     | 1                 |
+---------+-------------+--------------+-----------------+-------------------+
```

Burada şunu yaptık:

* `BolumAd` ve `Fakultesi` normalde **Bolumler** tablosunda,
* `AldigiDersSayisi` normalde **OgrenciDers** üzerinden `COUNT` ile hesaplanmalı,

ama biz:

* Bu bilgileri **hesaplayıp/kopyalayıp tek tabloya koyduk**.

### Sonuç ne oldu?

**Artı (kazanç):**

* Dashboard / rapor ekranı için:

```sql
SELECT * FROM OgrenciRapor;
```

* JOIN yok, `COUNT` yok → çok hızlı.
* Rapor sorguları sade.

**Eksi (bedel):**

* "Bilgisayar" bölümü adını "Bilgisayar Mühendisliği" yapınca:

  * Hem `Bolumler` tablosundaki satırı,
  * Hem de `OgrenciRapor` tablosundaki ilgili öğrenci satırlarını güncellemen gerekiyor.

* Eğer `OgrenciRapor`'daki satırları güncellemeyi unutursan:

  * Bir yerde "Bilgisayar", bir yerde "Bilgisayar Mühendisliği" yazabilir.

Yani **okuma hızlandı**, ama **yazma/güncelleme zorlaştı.**

---

### 4.6. Denormalizasyon pratikte nasıl kullanılır?

Gerçek dünyada genelde şu model tercih ediliyor:

1. **Önce normalizasyon**

   * Uygulamanın ana veritabanı (transactional / OLTP) → 3NF'e yakın, temiz, ilişkisel.
   * Burada insert/update/delete işlemleri doğru ve tutarlı.

2. **Sonra ihtiyaca göre denormalize "okuma modelleri"**

   * Raporlama veritabanı
   * Data warehouse (star schema, fact + dimension tablolar)
   * Cache (Redis vs.)
   * Arama / analytics index'i (Elasticsearch vb.)

Bu sistemlerde:

* Data **kaynaktan** (normalize DB) çekilir,
* **Denormalize edilerek** saklanır,
* Okuma istekleri bu denormalize yapılara gider (çok hızlı).

Birçok modern mimaride bu, CQRS / "read model" olarak geçiyor:

* **Write model** → Normalize / 3NF
* **Read model** → Denormalize / rapor için optimize

---

### 4.7. Ne zaman kullanmalı, ne zaman kaçınmalı?

**Denormalizasyon kullan:**

* Aynı rapor / dashboard sorgusu:

  * Çok sık çalışıyorsa,
  * 4–5 tablo join ediyorsa,
  * Performans sıkıntısı yaşatıyorsa.

* Sistem **okuma ağırlıklıysa** (read-heavy).
* Veriyi "gerçek zamanlı" sayılabilecek hızda göstermen gerekiyorsa.

**Denormalizasyon kullanma (veya çok dikkatli ol):**

* Sistem **yazma ağırlıklıysa** (çok insert/update).
* Veri bütünlüğü kritikse:

  * Finansal kayıtlar,
  * Sipariş / ödeme sistemlerinin asıl transactional tablosu.

* DB tasarımına yeni başlıyorsan:

  * ÖNCE normalizasyonu düzgün öğren,
    sonra denormalizasyonu **"advanced" optimizasyon** olarak düşün.

---

### 4.8. Kısa özet (tek nefeste):

* Normalizasyon = **kurallara göre parçalama**, tekrarları yok et, veri bütünlüğü yüksek olsun.
* Denormalizasyon = **bilerek biraz kural bozma**, bazı şeyleri kopyala / birleştir, okuma hızlansın.
* Hedef:

  * Normalizasyon → "Doğru & temiz model"
  * Denormalizasyon → "Hızlı okuma / basit sorgu" (özellikle raporlarda).
