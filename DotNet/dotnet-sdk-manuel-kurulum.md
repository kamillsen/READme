# .NET SDK Manuel Kurulum Rehberi (Linux)

Bu rehber, .NET SDK'n?n manuel olarak Linux sistemine nas?l kurulaca??n? aç?klar.

## Mevcut SDK'lar? Kontrol Etme

```bash
dotnet --list-sdks
dotnet --list-runtimes
```

## 1. SDK ?ndirme

Microsoft'un resmi sitesinden istedi?iniz sürümü indirin:

- **?ndirme sayfas?:** https://dotnet.microsoft.com/download/dotnet

Örnek dosya ad? format?:
```
dotnet-sdk-{SÜRÜM}-linux-x64.tar.gz
```

Örnekler:
- `dotnet-sdk-6.0.100-linux-x64.tar.gz`
- `dotnet-sdk-7.0.400-linux-x64.tar.gz`
- `dotnet-sdk-8.0.300-linux-x64.tar.gz`

## 2. Ar?ivi Ç?karma (Extract)

```bash
# ?ndirilen dosyan?n bulundu?u klasöre gidin
cd ~/Downloads

# Ar?ivi ç?kar?n
tar -xzf dotnet-sdk-{SÜRÜM}-linux-x64.tar.gz -C dotnet-sdk-{SÜRÜM}-linux-x64
```

Veya önce klasör olu?turup içine ç?kar?n:
```bash
mkdir dotnet-sdk-6.0.100-linux-x64
tar -xzf dotnet-sdk-6.0.100-linux-x64.tar.gz -C dotnet-sdk-6.0.100-linux-x64
```

## 3. Klasör Yap?s?n? Anlama

Ç?kar?lan SDK klasörü ?u yap?ya sahiptir:

```
dotnet-sdk-{SÜRÜM}-linux-x64/
??? dotnet              # Ana executable (kopyalamaya GEREK YOK)
??? host/               # Host kütüphanesi (kopyalamaya GEREK YOK)
??? packs/              # Targeting packs (KOPYALA)
??? sdk/                # SDK dosyalar? (KOPYALA)
?   ??? {SÜRÜM}/
??? sdk-manifests/      # Workload tan?mlar? (OPS?YONEL)
??? shared/             # Runtime kütüphaneleri (KOPYALA)
??? templates/          # Proje ?ablonlar? (KOPYALA)
```

## 4. Dosyalar? Sistem Konumuna Kopyalama

Fedora/RHEL sistemlerinde .NET konumu: `/usr/lib64/dotnet/`
Debian/Ubuntu sistemlerinde: `/usr/share/dotnet/`

### 4.1 SDK Klasörünü Kopyala

```bash
sudo cp -r ~/Downloads/dotnet-sdk-{SÜRÜM}-linux-x64/sdk/{SÜRÜM} /usr/lib64/dotnet/sdk/
```

**Örnek (6.0.100 için):**
```bash
sudo cp -r ~/Downloads/dotnet-sdk-6.0.100-linux-x64/sdk/6.0.100 /usr/lib64/dotnet/sdk/
```

### 4.2 Shared Runtime'lar? Kopyala

```bash
sudo cp -r ~/Downloads/dotnet-sdk-{SÜRÜM}-linux-x64/shared/* /usr/lib64/dotnet/shared/
```

**Örnek:**
```bash
sudo cp -r ~/Downloads/dotnet-sdk-6.0.100-linux-x64/shared/* /usr/lib64/dotnet/shared/
```

### 4.3 Packs Klasörünü Kopyala

```bash
sudo cp -r ~/Downloads/dotnet-sdk-{SÜRÜM}-linux-x64/packs/* /usr/lib64/dotnet/packs/
```

**Örnek:**
```bash
sudo cp -r ~/Downloads/dotnet-sdk-6.0.100-linux-x64/packs/* /usr/lib64/dotnet/packs/
```

### 4.4 Templates Klasörünü Kopyala

```bash
sudo cp -r ~/Downloads/dotnet-sdk-{SÜRÜM}-linux-x64/templates/* /usr/lib64/dotnet/templates/
```

**Örnek:**
```bash
sudo cp -r ~/Downloads/dotnet-sdk-6.0.100-linux-x64/templates/* /usr/lib64/dotnet/templates/
```

## 5. (Opsiyonel) SDK Manifests Kopyalama

E?er MAUI, Android, iOS gibi mobil workload'lar kullanacaksan?z:

```bash
sudo cp -r ~/Downloads/dotnet-sdk-{SÜRÜM}-linux-x64/sdk-manifests/* /usr/lib64/dotnet/sdk-manifests/
```

## 6. Kurulumu Do?rulama

```bash
# SDK listesini kontrol et
dotnet --list-sdks

# Runtime listesini kontrol et
dotnet --list-runtimes
```

Beklenen ç?kt? örne?i:
```
6.0.100 [/usr/lib64/dotnet/sdk]
8.0.122 [/usr/lib64/dotnet/sdk]
9.0.112 [/usr/lib64/dotnet/sdk]
```

## 7. Temizlik

Kurulum ba?ar?l?ysa indirilen dosyalar? silebilirsiniz:

```bash
# Ç?kar?lm?? klasörü sil
rm -rf ~/Downloads/dotnet-sdk-{SÜRÜM}-linux-x64

# Ar?iv dosyas?n? sil (opsiyonel, yedek olarak tutabilirsiniz)
rm ~/Downloads/dotnet-sdk-{SÜRÜM}-linux-x64.tar.gz
```

## 8. Projede Belirli SDK Sürümünü Kullanma

Proje klasöründe `global.json` dosyas? olu?turun:

```json
{
  "sdk": {
    "version": "6.0.100"
  }
}
```

Bu dosya, o klasördeki projelerin hangi SDK sürümünü kullanaca??n? belirler.

---

## H?zl? Referans (Tek Seferde Tüm Komutlar)

```bash
# De?i?kenler (kendi sürümünüze göre de?i?tirin)
SDK_VERSION="6.0.100"
SDK_FOLDER="dotnet-sdk-${SDK_VERSION}-linux-x64"
DOTNET_ROOT="/usr/lib64/dotnet"

# Kopyalama i?lemleri
sudo cp -r ~/Downloads/${SDK_FOLDER}/sdk/${SDK_VERSION} ${DOTNET_ROOT}/sdk/
sudo cp -r ~/Downloads/${SDK_FOLDER}/shared/* ${DOTNET_ROOT}/shared/
sudo cp -r ~/Downloads/${SDK_FOLDER}/packs/* ${DOTNET_ROOT}/packs/
sudo cp -r ~/Downloads/${SDK_FOLDER}/templates/* ${DOTNET_ROOT}/templates/

# Do?rulama
dotnet --list-sdks
```

---

## Kopyalanmayan Dosyalar ve Nedenleri

| Dosya/Klasör | Aç?klama | Neden Kopyalanmad? |
|--------------|----------|-------------------|
| `dotnet` | Ana executable | Sistemde zaten mevcut |
| `host/` | libhostfxr.so | Mevcut host tüm SDK'lar? yönetir |
| `sdk-manifests/` | Workload tan?mlar? | Sadece mobil geli?tirme için gerekli |

---

**Not:** Bu rehber Fedora/RHEL tabanl? sistemler için yaz?lm??t?r. Ubuntu/Debian için `/usr/lib64/dotnet/` yerine `/usr/share/dotnet/` kullan?n.
