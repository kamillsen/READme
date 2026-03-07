# 📝 Prisma, Enum ve Veritabanı İlişkisi - Ders Notları

## 📋 İçindekiler
1. [Sorular ve Cevaplar](#sorular-ve-cevaplar)
2. [Kavram Haritası](#kavram-haritası)
3. [Detaylı Açıklamalar](#detaylı-açıklamalar)
4. [Schema Nedir?](#schema-nedir)
5. [Özet Tablo](#özet-tablo)
6. [Pratik Örnekler](#pratik-örnekler)

---

## Sorular ve Cevaplar

### Soru 1: "Prisma nedir? .NET'teki Entity Framework Core gibi bir ORM mi?"

**Evet, aynen öyle!** Prisma, Node.js/TypeScript ekosisteminde kullanılan bir **ORM (Object-Relational Mapping)** aracıdır. Tıpkı Entity Framework Core'un .NET dünyasında yaptığı gibi:

| Entity Framework Core | Prisma |
|----------------------|--------|
| .NET için ORM | Node.js/TypeScript için ORM |
| C# ile yazılır | TypeScript/JavaScript ile yazılır |
| `DbContext` kullanır | `PrismaClient` kullanır |
| LINQ sorguları | Prisma Client API |

**Ortak amaç:** Uygulama koduyla veritabanı arasında köprü kurmak, SQL yazmadan veritabanı işlemleri yapmak.

---

### Soru 2: "Bu enum Prisma'ya özel mi, yoksa PostgreSQL'de olduğu için mi Prisma'da var?"

**İkisinin birleşimi!** Şöyle düşünelim:

```
Veritabanı Seviyesi (Fiziksel)
    ↓
ORM Seviyesi (Prisma - Soyutlama)
    ↓
Senin Kodun (TypeScript)
```

**Enum'un Yolculuğu:**
1. **Veritabanı fikri:** Bazı veritabanları (PostgreSQL, MySQL) doğrudan `ENUM` tipini destekler. Bazıları (MSSQL) ise `CHECK constraint` ile aynı işlevi görür.
2. **Prisma'nın görevi:** Hangi veritabanını kullanırsan kullan, senin yazdığın `enum`'u o veritabanının anlayacağı şekle çevirir.
3. **Senin kodun:** Tip güvenli bir şekilde enum'ları kullanırsın.

**Özet:** Enum **kavramı** veritabanından gelir ama **Prisma'da enum yazabilmen**, onun bir ORM olarak sağladığı soyutlama sayesindedir.

---

## Kavram Haritası

```
┌─────────────────────────────────────────────────────────┐
│                    SENİN KODUN                          │
│  (TypeScript)                                           │
│  template.type = "DIAGNOSIS"   // Tip güvenli!         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                    PRISMA (ORM)                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  schema.prisma                                  │   │
│  │  enum ClinicalTemplateType {                     │   │
│  │    DIAGNOSIS                                      │   │
│  │    ASSESSMENT                                     │   │
│  │  }                                               │   │
│  └─────────────────────────────────────────────────┘   │
│         │                       │                       │
│         ▼                       ▼                       │
│  PostgreSQL için           MSSQL için                   │
│  "CREATE TYPE ..."         "CHECK constraint"           │
│  oluşturur                  oluşturur                   │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    ▼                           ▼
┌─────────────────┐     ┌─────────────────┐
│  PostgreSQL     │     │  MSSQL          │
│  ENUM tipi      │     │  CHECK ile      │
│  destekler      │     │  kısıtlama      │
└─────────────────┘     └─────────────────┘
```

---

## Detaylı Açıklamalar

### 🔷 Enum (Numaralandırma) Nedir?

**Basit tanım:** Bir değişkenin alabileceği sabit değerlerin listesi.

**Günlük hayattan örnek:** "Haftanın günleri"
- Pazartesi, Salı, Çarşamba... sadece bu 7 değer olabilir
- "Pazartesi" doğru, "Pazartesii" yanlış

**Yazılımdaki karşılığı:**
```typescript
// Enum ile
type HaftaninGunu = "Pazartesi" | "Salı" | "Çarşamba" | ...;

// Ayrı tablo ile
// Gunler tablosu oluştur, ID-Pazartesi, ID-Salı, vs...
```

### 🔄 Enum vs Ayrı Tablo Karşılaştırması

| Kriter | Enum | Ayrı Tablo |
|--------|------|------------|
| **Değişebilirlik** | Sabit, kod güncellemesi gerekir | Dinamik, yeni kayıt eklenebilir |
| **Performans** | Çok hızlı (JOIN yok) | JOIN gerektirir, daha yavaş |
| **Veri bütünlüğü** | DB seviyesinde garantili | Foreign key ile sağlanır |
| **Karmaşıklık** | Basit | Daha karmaşık |
| **Kullanım örneği** | Cinsiyet, medeni durum, sipariş durumu | Kategoriler, etiketler, şehirler |

### 🗄️ Veritabanlarına Göre Enum Karşılıkları

```sql
-- PostgreSQL (Doğrudan ENUM var)
CREATE TYPE clinical_template_type AS ENUM ('DIAGNOSIS', 'ASSESSMENT');
CREATE TABLE template (type clinical_template_type);

-- MySQL (ENUM tipi var)
CREATE TABLE template (
    type ENUM('DIAGNOSIS', 'ASSESSMENT')
);

-- MSSQL (ENUM yok, CHECK ile yapılır)
CREATE TABLE template (
    type VARCHAR(20) NOT NULL,
    CONSTRAINT CHK_type CHECK (type IN ('DIAGNOSIS', 'ASSESSMENT'))
);
```

### 🎯 Prisma'nın Rolü

Prisma, yukarıdaki tüm veritabanı farklılıklarını senin için yönetir:

```prisma
// Sen bunu yazarsın
enum ClinicalTemplateType {
  DIAGNOSIS
  ASSESSMENT
  PLAN
}

model ClinicalTemplate {
  id   Int                  @id
  type ClinicalTemplateType
}

// Prisma arka planda:
// - PostgreSQL'de: ENUM tipi oluşturur
// - MSSQL'de: CHECK constraint'li kolon oluşturur
// - MySQL'de: ENUM kolonu oluşturur
```

---

## Schema Nedir?

🎯 **Schema = Tablolar (Models) + Enum'lar + Kurallar (Constraints) + İlişkiler (Relationships)**

`schema.prisma` dosyası, veritabanının tüm yapısını tek bir yerde tanımladığın **ana blueprint** dosyasıdır. Bir kutu gibi düşün — içinde veritabanını oluşturan her şey var:

### 📦 Schema'nın İçindekiler

```prisma
// 📁 schema.prisma (BÜYÜK KUTU)
// İçinde ne var?

// 1️⃣ SABİT LİSTELER (ENUMS) - Katalog
enum AppointmentStatus {
  WAITING
  EXAM
  DONE
}

// 2️⃣ TABLOLAR (MODELS) - Her biri bir tablo
model User {
  id        Int    @id            // ⚠️ Kural: Bu benzersiz olmalı
  email     String @unique        // ⚠️ Kural: Bu da benzersiz
  name      String

  appointments Appointment[]      // 🔗 İlişki: Bunun randevuları var
}

model Appointment {
  id        Int               @id
  date      DateTime
  status    AppointmentStatus // 🔗 Enum'a bağlı

  userId    Int
  user      User @relation(fields: [userId], references: [id]) // 🔗 İlişki
}
```

### Schema'daki 4 Temel Yapı Taşı

| Yapı Taşı | Ne İş Yapar | Örnekte Nerede |
|-----------|-------------|----------------|
| **Models (Tablolar)** | Veritabanındaki tabloları tanımlar | `model User`, `model Appointment` |
| **Enums (Sabit Listeler)** | Bir alanın alabileceği sabit değerleri belirler | `enum AppointmentStatus` |
| **Constraints (Kurallar)** | Verilere kısıtlama koyar | `@id`, `@unique` |
| **Relations (İlişkiler)** | Tablolar arası bağlantıları tanımlar | `@relation(...)`, `Appointment[]` |

Bu yapı sayesinde Prisma, `schema.prisma` dosyasını okuyarak veritabanındaki tabloları, ilişkileri ve kısıtlamaları otomatik oluşturur (`prisma migrate` ile).

---

## Özet Tablo

| Kavram | Ne olduğu | Özet |
|--------|-----------|------|
| **Prisma** | ORM (Object-Relational Mapping) | Kodla veritabanı arasında köprü, EF Core'un Node.js versiyonu |
| **Enum** | Sabit değerler listesi | "Bu alan sadece şu 5 değeri alabilir" kısıtlaması |
| **Schema** | Veritabanı blueprint'i | Models + Enums + Constraints + Relations — tek dosyada tüm yapı |
| **ORM** | Soyutlama katmanı | Farklı veritabanlarına aynı arayüzle erişim |
| **Tip Güvenliği** | Hata yakalama | Yanlış değer girdiğinde çalışmadan hata almanı sağlar |

---

## Pratik Örnekler

### Prisma ile Enum Kullanımı

```prisma
// schema.prisma
enum AppointmentStatus {
  WAITING   // Beklemede
  EXAM      // Muayenede
  DONE      // Tamamlandı
}

model Appointment {
  id     Int              @id
  status AppointmentStatus
}
```

### Kullanımı (TypeScript)

```typescript
// ✅ Doğru kullanım
const appointment = await prisma.appointment.create({
  data: {
    status: "WAITING"  // Tip güvenli, otomatik tamamlama var
  }
});

// ❌ Yanlış kullanım - Derleme hatası alırsın!
const appointment = await prisma.appointment.create({
  data: {
    status: "BEKLIYOR"  // Hata! "WAITING" olmalıydı
  }
});

// Switch ile tip güvenli kontrol
switch(appointment.status) {
  case "WAITING":
    console.log("Randevu bekliyor");
    break;
  case "EXAM":
    console.log("Muayenede");
    break;
  // Tüm durumlar kontrol edilir, unuttuğunda hata alırsın!
}
```

---

## Sonuç

- **Prisma =** Node.js dünyasının Entity Framework Core'u
- **Enum =** Veritabanından gelen ama Prisma'nın soyutladığı bir kavram
- **Schema =** Tüm yapının (tablolar, enumlar, kurallar, ilişkiler) tanımlandığı tek dosya
- **ORM'nin gücü =** Farklı veritabanlarına aynı kodu yazarak çalışabilmek
- **Tip güvenliği =** Prisma'nın en büyük artısı, hataları çalışmadan yakalar
