# 🐳 Docker ve Docker Compose: Kapsamlı ve Mantıklı Rehber

## 📌 **TEMEL KAVRAMLAR**

### 1. **Docker Image (İmaj)**
- **Ne?**: Hazır kurulmuş yazılım paketi
- **Benzetme**: ISO dosyası veya sistem yedeği
- **Örnek**: `mysql:8.0`, `nginx:latest`, `node:18-alpine`

### 2. **Docker Container (Konteyner)**
- **Ne?**: Çalışan imaj örneği
- **Benzetme**: Sanal makine (ama daha hafif)
- **Örnek**: MySQL çalıştıran bir process

### 3. **Dockerfile**
- **Ne?**: Kendi imajını oluşturma talimatı
- **Benzetme**: Yemek tarifi veya IKEA montaj kılavuzu
- **Kullanım**: Özel uygulamalar için

### 4. **Docker Compose**
- **Ne?**: Birden fazla konteyneri yönetme aracı
- **Benzetme**: Orkestra şefi
- **Kullanım**: Tüm uygulama stack'ini yönetmek için

---

## 🎯 **MANTIK ZİNCİRİ: En Temelden Başlayalım**

### **ADIM 1: İhtiyacımız Ne?**
> "Bir veritabanı (MySQL) ve bir web uygulaması (Node.js) çalıştırmak istiyorum."

### **ADIM 2: Basit Çözüm - Manuel**
```bash
# 1. MySQL'i kur
sudo apt install mysql-server
sudo systemctl start mysql

# 2. Node.js kur
sudo apt install nodejs npm

# 3. Uygulamayı kopyala
git clone myapp.git
cd myapp
npm install
npm start

# PROBLEM: Her sunucuda tekrar tekrar kurulum!
```

### **ADIM 3: Docker Çözümü**
```bash
# 1. MySQL için hazır paket
docker run mysql:8.0

# 2. Kendi uygulamam için Dockerfile yaz
# 3. Docker Compose ile ikisini birlikte çalıştır
```

---

## 🏗️ **DETAYLI MANTIK AKIŞI**

### **BÖLÜM 1: Dockerfile - "KENDİ İMAJINI YAP"**
**Neden?**: Çünkü Docker Hub'da senin özel uygulaman yok!

```
Düşünce Zinciri:
1. Uygulamam Node.js'de yazıldı → Temelde Node.js olmalı
2. `package.json` var → Bağımlılıklar yüklenmeli
3. `app.js` dosyam var → Kopyalanmalı
4. 3000 portunda çalışır → Port açılmalı
5. `npm start` ile başlar → Komut belirtilmeli
```

**Gerçek Dockerfile**:
```dockerfile
# 1. TEMEL: Node.js kurulu bir Linux al
FROM node:18-alpine

# 2. ÇALIŞMA ALANI: /app klasörüne gir
WORKDIR /app

# 3. BAĞIMLILIKLAR: package.json'ı kopyala
COPY package*.json ./

# 4. KURULUM: Gerekli paketleri yükle
RUN npm install

# 5. KOD: Tüm uygulama dosyalarını kopyala
COPY . .

# 6. PORT: 3000 portunu dinle
EXPOSE 3000

# 7. BAŞLAT: Uygulamayı çalıştır
CMD ["npm", "start"]
```

**Bu Dockerfile'ın Yaptığı İşlemler**:
```
FROM node:18-alpine        → Docker Hub'dan hazır Node imajı indir
WORKDIR /app               → /app klasörü oluştur ve içine gir
COPY package*.json ./      → package.json dosyanı kopyala
RUN npm install            → package.json'daki paketleri kur
COPY . .                   → Tüm kodunu kopyala
EXPOSE 3000                → 3000 portunu kullanacağını bildir
CMD ["npm", "start"]       → "npm start" komutuyla başlat
```

---

### **BÖLÜM 2: Docker Compose - "HEPSİNİ BİRLİKTE YÖNET"**

**Neden?**: Çünkü tek komutla tüm sistemi ayağa kaldırmak istiyoruz!

```
Düşünce Zinciri:
1. MySQL konteynerine ihtiyacım var
2. Kendi uygulama konteynerime ihtiyacım var  
3. İkisi birbiriyle konuşabilmeli
4. Veriler kaybolmamalı (volume)
5. Portlar dışarı açılmalı
```

**Gerçek docker-compose.yml**:
```yaml
version: '3.8'

services:
  # SERVİS 1: MySQL Veritabanı (HAZIR İMAJ)
  mysql-db:
    image: mysql:8.0                # Docker Hub'dan hazır
    container_name: my_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpass123
      MYSQL_DATABASE: myapp_db
      MYSQL_USER: app_user
      MYSQL_PASSWORD: userpass123
    ports:
      - "3306:3306"                 # Host'un 3306 → Konteyner'in 3306
    volumes:
      - mysql_data:/var/lib/mysql   # Veriler kalıcı olsun
    networks:
      - app-network                 # Aynı ağda olsunlar

  # SERVİS 2: Kendi Uygulamam (KENDİ İMAJ)
  web-app:
    build: ./app                    # Dockerfile'dan imaj oluştur
    container_name: my_app
    restart: unless-stopped
    ports:
      - "3000:3000"                 # Host'un 3000 → Konteyner'in 3000
    environment:
      DB_HOST: mysql-db             # MySQL'e bu isimle bağlan
      DB_PORT: 3306
      DB_USER: app_user
      DB_PASSWORD: userpass123
    volumes:
      - ./app:/app                  # Geliştirme: Kod değişikliği anında yansısın
      - /app/node_modules           # node_modules korunsun
    networks:
      - app-network
    depends_on:
      - mysql-db                    # Önce MySQL başlasın

  # SERVİS 3: phpMyAdmin (HAZIR + EKSTRA)
  phpmyadmin:
    image: phpmyadmin/phpmyadmin    # Docker Hub'dan hazır
    container_name: my_phpmyadmin
    restart: unless-stopped
    ports:
      - "8080:80"                   # Host 8080 → Konteyner 80
    environment:
      PMA_HOST: mysql-db            # MySQL'e bağlan
      PMA_PORT: 3306
    networks:
      - app-network
    depends_on:
      - mysql-db

# AĞ TANIMI (Servisler birbiriyle konuşabilsin)
networks:
  app-network:
    driver: bridge

# VOLUME TANIMI (Kalıcı veriler)
volumes:
  mysql_data:
    name: myapp_mysql_data
```

---

## 🔄 **TÜM SİSTEM NASIL ÇALIŞIYOR?**

### **Komut: `docker-compose up -d`**

```
1. Docker Compose docker-compose.yml'ı okur
   ↓
2. "mysql-db" servisini görür:
   a) image: mysql:8.0 → Docker Hub'dan indirir
   b) environment → Ortam değişkenlerini ayarlar  
   c) ports → Port yönlendirmesini yapar
   d) volumes → Volume'u bağlar
   ↓
3. "web-app" servisini görür:
   a) build: ./app → ./app/Dockerfile'a gider
   b) Dockerfile'ı çalıştırır:
      1) FROM node:18-alpine → Temel imajı indirir
      2) WORKDIR /app → Klasör oluşturur
      3) COPY package*.json ./ → Dosya kopyalar
      4) RUN npm install → Paketleri kurar
      5) COPY . . → Kodları kopyalar
      6) YENİ BİR İMAJ OLUŞUR
   c) Oluşan imajı konteyner olarak çalıştırır
   d) mysql-db'ye depends_on olduğu için MySQL hazır olana kadar bekler
   ↓
4. "phpmyadmin" servisini görür:
   a) image: phpmyadmin/phpmyadmin → Docker Hub'dan indirir
   b) mysql-db'ye bağlanacak şekilde ayarlar
   ↓
5. Tüm konteynerler APP-AĞI'nda başlatılır
   ↓
6. Sistem hazır!
```

---

## 🎮 **ANALOJİLERLE ANLAMA**

### **Analoji 1: Restoran**
- **Docker Hub** = Tedarikçi (hazır malzemeler)
- **Dockerfile** = Yemek tarifi (kendi spesiyaliten)
- **Image** = Hazır yemek (derlenmiş tarif)
- **Container** = Müşteriye servis edilen yemek
- **Docker Compose** = Menü + Garson + Mutfak organizasyonu

### **Analoji 2: Bilgisayar Mağazası**
- **Docker Hub** = Donanım distribütörü
- **Dockerfile** = "Şu parçaları birleştir" talimatı
- **Image** = Hazır sistem yedeği (ghost image)
- **Container** = Çalışan bilgisayar
- **Docker Compose** = Tüm ofis donanım kurulum planı

---

## 📊 **NE ZAMAN NE KULLANILIR? - KARAR MATRİSİ**

| Senaryo | Çözüm | Neden? |
|---------|--------|---------|
| **Sadece MySQL çalıştırmak** | `docker run mysql` veya `image:` | Hazır imaj, kurulum gerekmez |
| **Kendi Node.js uygulamam** | Dockerfile + `build:` | Özel bağımlılıklarım var |
| **MySQL + Uygulamam** | docker-compose.yml | İkisini birlikte yönetmek için |
| **Geliştirme ortamı** | docker-compose.yml + volumes | Kod değişikliği anında yansısın |
| **Production ortamı** | Dockerfile (optimize) | Performans ve güvenlik için |

---

## 🛠️ **PRATİK ÖRNEKLER KÜTÜPHANESİ**

### **ÖRNEK 1: Basit Python Uygulaması**
```dockerfile
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "5000:5000"
  redis:
    image: redis:alpine
```

### **ÖRNEK 2: Full Stack (React + Node.js + PostgreSQL)**
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password123
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### **ÖRNEK 3: Geliştirme Ortamı (Hot Reload)**
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app                 # Kod değişikliği anında yansır
      - /app/node_modules      # node_modules korunur
    command: npm run dev       # Geliştirme modu
```

---

## ✅ **ÖĞRENDİKLERİMİZİ ÖZETLEYELİM:**

### **LEVEL 1: Temel Docker**
```
1. Image = Hazır paket
2. Container = Çalışan paket
3. docker run = Paketi çalıştır
```

### **LEVEL 2: Dockerfile**
```
1. FROM = Hangi temel paketi kullanacağım?
2. COPY = Hangi dosyalarımı kopyalayacağım?
3. RUN = Hangi kurulumları yapacağım?
4. CMD = Nasıl başlatacağım?
```

### **LEVEL 3: Docker Compose**
```
1. services = Hangi paketler çalışacak?
2. image: = Hazır paket kullan
3. build: = Kendi paketini oluştur
4. networks = Paketler birbiriyle konuşabilsin
5. volumes = Veriler kaybolmasın
```

---

## 🚀 **BAŞLANGIÇ İÇİN ADIM ADIM KILAVUZ**

### **Adım 1: Tek Bir Servis (Basit)**
```bash
# 1. docker-compose.yml oluştur
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: pass123

# 2. Çalıştır
docker-compose up -d

# 3. Kontrol et
docker-compose ps
```

### **Adım 2: Kendi Uygulamanı Ekleyerek İlerle**
```bash
# 1. Proje klasörü oluştur
myapp/
├── app.py
├── requirements.txt
└── Dockerfile

# 2. Dockerfile yaz
FROM python:3.11-slim
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]

# 3. docker-compose.yml'e ekle
services:
  app:
    build: .
    ports:
      - "5000:5000"
  mysql:
    image: mysql:8.0
    environment: ...
```

---

## 💡 **ALTIN KURALLAR**

1. **Hazır yazılımlar** için → `image:`
2. **Kendi yazılımların** için → `build:` + Dockerfile
3. **Birden fazla servis** için → docker-compose.yml
4. **Veri kaybetmemek** için → `volumes:`
5. **Servisler konuşsun** için → `networks:`

---

## 🎓 **SON SÖZ**

**Dockerfile** = Kendi evini inşa etmek (temelden çatıya)
**Docker Compose** = Mahallenin altyapısını kurmak (yollar, elektrik, su)

İkisi farklı amaçlar için:
- **Kurulum yapmak** istiyorsan → Dockerfile
- **Yönetmek** istiyorsan → Docker Compose
- **Hem kurup hem yönetmek** istiyorsan → İkisi birlikte!

Bu yapıyı anladığında, her türlü uygulamayı containerize edebilir ve yönetebilirsin. 🚀
