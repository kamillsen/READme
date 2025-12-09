# Fedora 42 Docker Kurulum Rehberi

Bu dokümantasyon, Fedora 42 üzerinde Docker Engine ve Docker Desktop kurulum sürecini detaylı olarak açıklamaktadır.

## 📋 İçindekiler

1. [Sistem Hazırlığı ve Eski Kurulumların Temizlenmesi](#adım-1-sistem-hazırlığı-ve-eski-kurulumların-temizlenmesi)
2. [Gerekli Paketlerin Kurulması ve Repository Ekleme](#adım-2-gerekli-paketlerin-kurulması-ve-repository-ekleme)
3. [Docker Engine Kurulumu](#adım-3-docker-engine-kurulumu)
4. [Docker Servisini Başlatma](#adım-4-docker-servisini-başlatma)
5. [Docker Desktop Kurulumu](#adım-5-docker-desktop-kurulumu)
6. [Kurulum Doğrulama](#kurulum-doğrulama)
7. [Kullanıcıyı Docker Grubuna Ekleme](#kullanıcıyı-docker-grubuna-ekleme)

---

## ADIM 1: Sistem Hazırlığı ve Eski Kurulumların Temizlenmesi

### Ne Yapıldı?
Sistemde varsa eski Docker kurulumları kaldırıldı. Bu işlem, çakışmaları önler ve temiz bir kurulum sağlar.

### Komut:
```bash
sudo dnf remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-selinux docker-engine-selinux docker-engine
```

### Ne İşe Yarar?
- ✅ Eski Docker paketlerini sistemden tamamen kaldırır
- ✅ Yeni kurulum ile çakışmaları önler
- ✅ Temiz bir kurulum için ortamı hazırlar
- ✅ Paket yönetim sistemini temizler

### Kaynak:
- [Docker Resmi Dokümantasyonu - Uninstall Old Versions](https://docs.docker.com/engine/install/fedora/#uninstall-old-versions)

---

## ADIM 2: Gerekli Paketlerin Kurulması ve Repository Ekleme

### Ne Yapıldı?
Docker kurulumu için gerekli paketler kuruldu ve Docker'ın resmi repository'si sisteme eklendi. Bu sayede Docker paketleri resmi kaynaktan kurulabilir hale geldi.

### Komutlar:

#### 1. DNF Plugins Core Kurulumu:
```bash
sudo dnf install -y dnf-plugins-core
```

**Ne İşe Yarar?**
- DNF repository yönetimi için gerekli eklentileri sağlar
- `dnf config-manager` komutunu kullanabilmemizi sağlar
- Repository ekleme, kaldırma ve yönetim işlemlerini kolaylaştırır

#### 2. Docker Repository Ekleme:
```bash
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
```

**Not:** Bazı durumlarda alternatif komut gerekebilir:
```bash
sudo dnf config-manager addrepo --from-repofile https://download.docker.com/linux/fedora/docker-ce.repo
```

**Ne İşe Yarar?**
- Docker'ın resmi Fedora repository'sini sisteme ekler
- Docker paketlerini resmi kaynaktan kurmamızı sağlar
- Güvenli ve güncel paket kaynağı sağlar
- Otomatik güncellemeler için gerekli yapılandırmayı yapar

### Kaynak:
- [Docker Resmi Dokümantasyonu - Install Using Repository](https://docs.docker.com/engine/install/fedora/#install-using-the-repository)
- [DNF Plugins Dokümantasyonu](https://dnf.readthedocs.io/en/latest/plugins.html)

---

## ADIM 3: Docker Engine Kurulumu

### Ne Yapıldı?
Docker Engine (Docker CE) ve gerekli tüm bileşenler kuruldu. Bu, Docker'ın ana bileşenidir ve container'ları çalıştırmak için gereklidir.

### Komut:
```bash
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Kurulan Paketler ve Görevleri:

| Paket | Açıklama |
|-------|----------|
| **docker-ce** | Docker Engine'in ana bileşeni. Container'ları çalıştırmak için gereklidir. |
| **docker-ce-cli** | Docker komut satırı arayüzü. Terminalden Docker komutlarını çalıştırmak için kullanılır. |
| **containerd.io** | Container runtime. Container'ların çalıştırılmasından sorumlu düşük seviye bileşendir. |
| **docker-buildx-plugin** | Gelişmiş build özellikleri. Multi-platform image build işlemleri için kullanılır. |
| **docker-compose-plugin** | Docker Compose eklentisi. Çoklu container yönetimi ve orkestrasyon için gereklidir. |

### Ne İşe Yarar?
- ✅ Container'ları çalıştırma yeteneği sağlar
- ✅ Docker image'larını build etme imkanı verir
- ✅ Docker Compose ile çoklu container yönetimi yapılabilir
- ✅ Komut satırından Docker yönetimi yapılabilir

### Kaynak:
- [Docker Resmi Dokümantasyonu - Install Docker Engine](https://docs.docker.com/engine/install/fedora/#install-docker-engine)
- [Docker Engine Açıklaması](https://docs.docker.com/engine/)

---

## ADIM 4: Docker Servisini Başlatma

### Ne Yapıldı?
Docker servisi başlatıldı ve sistem açılışında otomatik başlaması için yapılandırma yapıldı (opsiyonel).

### Komutlar:

#### 1. Docker Servisini Başlatma:
```bash
sudo systemctl start docker
```

**Ne İşe Yarar?**
- Docker servisini şu anda başlatır
- Docker daemon'un çalışmasını sağlar
- Container'ları çalıştırmak için gerekli servisi aktif eder

#### 2. Otomatik Başlatmayı Etkinleştirme (Opsiyonel):
```bash
sudo systemctl enable docker
```

**Ne İşe Yarar?**
- Sistem açılışında Docker'ın otomatik başlamasını sağlar
- Her açılışta Docker'ın hazır olmasını garanti eder
- Manuel başlatma ihtiyacını ortadan kaldırır

**Not:** Otomatik başlatma opsiyoneldir. Eğer Docker'ı nadiren kullanıyorsanız, bu komutu çalıştırmayabilirsiniz. İhtiyaç duyduğunuzda `sudo systemctl start docker` ile manuel başlatabilirsiniz.

**Kaynak Kullanımı:**
- RAM: Yaklaşık 50-100 MB
- CPU: Minimal (idle durumda)

### Kaynak:
- [Docker Resmi Dokümantasyonu - Start Docker](https://docs.docker.com/engine/install/fedora/#start-docker)
- [systemd Dokümantasyonu](https://www.freedesktop.org/software/systemd/man/systemctl.html)

---

## ADIM 5: Docker Desktop Kurulumu

### Ne Yapıldı?
Docker Desktop RPM paketi kuruldu. Docker Desktop, Docker Engine'e ek olarak GUI (Grafik Kullanıcı Arayüzü) sağlar.

### Komut:
```bash
sudo dnf install /home/kSEN/Downloads/docker-desktop-x86_64.rpm
```

Alternatif komut:
```bash
sudo rpm -i /home/kSEN/Downloads/docker-desktop-x86_64.rpm
```

**Not:** `dnf install` komutu önerilir çünkü bağımlılıkları otomatik olarak çözer.

### Docker Desktop vs Docker Engine:

| Özellik | Docker Engine | Docker Desktop |
|---------|---------------|----------------|
| **Arayüz** | Komut satırı (CLI) | Grafik kullanıcı arayüzü (GUI) |
| **Kullanım** | Terminal komutları | Görsel arayüz |
| **Kaynak** | Düşük | Orta (GUI nedeniyle) |
| **Özellikler** | Temel Docker özellikleri | Ek görselleştirme ve yönetim araçları |

**Not:** İkisi birlikte çalışabilir, ancak genellikle birini tercih edersiniz:
- **GUI istiyorsanız:** Docker Desktop
- **Komut satırı yeterliyse:** Docker Engine (zaten kurulu)

### Docker Desktop Kullanımı:
- Uygulamalar menüsünden "Docker Desktop"ı açabilirsiniz
- İlk açılışta kurulum tamamlanması biraz sürebilir
- Docker Hub'a giriş yapmak zorunlu değildir (Skip seçeneği ile geçebilirsiniz)

---

## Kurulum Doğrulama

### Docker Servisinin Durumunu Kontrol Etme:
```bash
sudo systemctl status docker
```

**Beklenen Çıktı:**
- `Active: active (running)` - Docker çalışıyor ✅
- `Loaded: loaded` - Servis yüklendi ✅

### Docker'ın Çalışıp Çalışmadığını Test Etme:
```bash
sudo docker run hello-world
```

**Beklenen Çıktı:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

### Docker Versiyonunu Kontrol Etme:
```bash
docker --version
```
veya
```bash
sudo docker --version
```

### Docker Bilgilerini Görüntüleme:
```bash
sudo docker info
```

---

## Kullanıcıyı Docker Grubuna Ekleme

### Ne İşe Yarar?
Kullanıcıyı `docker` grubuna eklemek, Docker komutlarını `sudo` olmadan çalıştırabilmenizi sağlar.

### Komut:
```bash
sudo usermod -aG docker $USER
```

### Önemli Notlar:
- ⚠️ Bu komuttan sonra **oturumu kapatıp yeniden açmanız** gerekir
- Alternatif olarak `newgrp docker` komutunu çalıştırabilirsiniz
- Değişikliğin etkili olması için yeni bir terminal oturumu açmanız gerekebilir

### Doğrulama:
Oturumu yeniden açtıktan sonra:
```bash
docker ps
```

Eğer `sudo` olmadan çalışıyorsa, kurulum başarılıdır! ✅

---

## Özet

### Yapılan İşlemler:
1. ✅ Eski Docker kurulumları temizlendi
2. ✅ DNF plugins core kuruldu
3. ✅ Docker resmi repository eklendi
4. ✅ Docker Engine ve tüm bileşenleri kuruldu
5. ✅ Docker servisi başlatıldı
6. ✅ Docker Desktop kuruldu
7. ✅ Kurulum doğrulandı (hello-world testi)

### Sonuç:
- Docker Engine çalışıyor ✅
- Docker Desktop kurulu ✅
- Container'lar çalıştırılabilir durumda ✅

### Sonraki Adımlar:
- Docker Desktop'ı uygulamalar menüsünden başlatabilirsiniz
- İsterseniz kullanıcıyı docker grubuna ekleyerek `sudo` olmadan kullanabilirsiniz
- Docker Compose ile çoklu container yönetimi yapabilirsiniz
- Docker Hub'dan image'lar çekebilir ve kendi image'larınızı oluşturabilirsiniz

---

## Kaynaklar

- [Docker Resmi Dokümantasyonu - Fedora](https://docs.docker.com/engine/install/fedora/)
- [Docker Desktop Dokümantasyonu](https://docs.docker.com/desktop/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose Dokümantasyonu](https://docs.docker.com/compose/)

---

**Tarih:** 6 Aralık 2025  
**Sistem:** Fedora 42  
**Docker Versiyonu:** 29.1.2
