Harika! İşte PostgreSQL'i yönetmek için ihtiyacın olan tüm komutlar 📋

## 🚦 PostgreSQL Yönetim Komutları (Kopyala-Yapıştır için)

### 🔵 **Başlatma Komutları**
```bash
# PostgreSQL'i arka planda başlat (otomatik başlasın)
brew services start postgresql@17

# Manuel başlat (ön planda, terminal kapanınca kapanır)
/opt/homebrew/opt/postgresql@17/bin/postgres -D /opt/homebrew/var/postgresql@17
```

### ⚫ **Durdurma Komutları**
```bash
# PostgreSQL'i durdur
brew services stop postgresql@17

# Acil durdurma (bazen gerekebilir)
pkill -f postgres
```

### 🔴 **Yeniden Başlatma**
```bash
# PostgreSQL'i yeniden başlat
brew services restart postgresql@17
```

### 🟢 **Durum Kontrolü**
```bash
# Çalışıyor mu kontrol et
brew services list

# Detaylı durum kontrolü
pg_isready

# Port dinleniyor mu kontrol et
lsof -i :5432
```

### 📂 **Veritabanı Bağlantı Komutları**
```bash
# PostgreSQL'e bağlan
psql postgres

# Belirli bir veritabanına bağlan
psql veritabani_adi

# Farklı kullanıcı ile bağlan
psql -U postgres -d veritabani_adi
```

### 🗄️ **Veritabanı Yönetimi**
```bash
# Yeni veritabanı oluştur
createdb yeni_veritabani

# Veritabanını sil
dropdb veritabani_adi

# Yedek al
pg_dump veritabani_adi > yedek.sql

# Yedeği geri yükle
psql veritabani_adi < yedek.sql
```

### 📝 **Hızlı Referans Kartı**

| İşlem | Komut |
|-------|-------|
| **BAŞLAT** | `brew services start postgresql@17` |
| **DURDUR** | `brew services stop postgresql@17` |
| **YENİDEN BAŞLAT** | `brew services restart postgresql@17` |
| **DURUM** | `brew services list` |
| **BAĞLAN** | `psql postgres` |
| **ÇIKIŞ** | `\q` (psql içinde) |

Bu komutları bir yere not et, ihtiyacın oldukça kullanırsın! Başka bir şey lazım mı? 😊
