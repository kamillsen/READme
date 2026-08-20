# C#’ta Normal Metotlar, Delegate, Action, Func ve Lambda Mantığı

Bu notun amacı, C#’ta normal metotların nasıl çalıştığını, bir metodun başka bir metoda nasıl parametre olarak verildiğini, `Action`, `Func` ve lambda ifadelerinin mantığını temelden anlatmaktır.

Son bölümde şu kullanımın neden böyle yazıldığını anlayacağız:

```csharp
builder.Services
    .AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
    });
```

---

## 1. Normal metot nedir?

Normal metot, bir adı olan ve gerektiğinde çağırdığımız kod bloğudur.

```csharp
int Topla(int a, int b)
{
    return a + b;
}
```

Bu metodu çalıştırmak için adından sonra parantez kullanırız:

```csharp
int sonuc = Topla(3, 5);

Console.WriteLine(sonuc); // 8
```

Burada:

- `Topla` metodun adıdır.
- `a` ve `b` parametrelerdir.
- `int`, metodun döndürdüğü değerin türüdür.
- `Topla(3, 5)`, metodu hemen çalıştırır.

---

## 2. Metodun kendisi ile metodu çalıştırmak farklıdır

Aşağıdaki metodumuz olsun:

```csharp
int KareAl(int sayi)
{
    return sayi * sayi;
}
```

Şu ifade metodun kendisini temsil eder:

```csharp
KareAl
```

Şu ifade ise metodu çalıştırır:

```csharp
KareAl(5)
```

Aradaki fark çok önemlidir:

```csharp
KareAl
```

> Bu işi yapan metodu temsil eder.

```csharp
KareAl(5)
```

> Metodu şimdi çalıştır ve sonucunu üret.

Bu ayrım, bir metodu başka bir metoda parametre olarak gönderirken karşımıza çıkar.

---

## 3. Bir metodu değişkende tutmak

C#’ta bir metodu değişkende tutabiliriz. Bunun için `delegate` türleri kullanılır.

Delegate, belirli bir parametre ve dönüş yapısına sahip metotları temsil eden türdür.

Örneğin:

```csharp
Func<int, int> islem = KareAl;
```

Burada `KareAl` çalıştırılmadı. Metodun kendisi `islem` değişkenine verildi.

Daha sonra çalıştırabiliriz:

```csharp
int sonuc = islem(5);

Console.WriteLine(sonuc); // 25
```

Şunu yazmak yanlış olur:

```csharp
Func<int, int> islem = KareAl(5);
```

Çünkü `KareAl(5)` bir metot değildir. Metodun çalışması sonucunda oluşan `25` değeridir.

---

## 4. Action nedir?

`Action`, geriye değer döndürmeyen metotları temsil eder.

Örneğin:

```csharp
void Yazdir(string mesaj)
{
    Console.WriteLine(mesaj);
}
```

Bu metot bir `string` alır fakat değer döndürmez. Bu nedenle `Action<string>` ile tutulabilir:

```csharp
Action<string> islem = Yazdir;

islem("Merhaba");
```

`Action<string>` şu anlama gelir:

> Bir tane `string` parametre alan ve geriye değer döndürmeyen bir fonksiyon.

Başka bir örnek:

```csharp
Action<int> sayiyiYazdir = sayi =>
{
    Console.WriteLine(sayi);
};
```

Burada lambda kullanılmıştır. Lambda konusuna birazdan geleceğiz.

---

## 5. Func nedir?

`Func`, geriye değer döndüren metotları temsil eder.

Örneğin:

```csharp
int KareAl(int sayi)
{
    return sayi * sayi;
}
```

Bu metot bir `int` alır ve bir `int` döndürür:

```csharp
Func<int, int> islem = KareAl;
```

Kullanımı:

```csharp
int sonuc = islem(5);

Console.WriteLine(sonuc); // 25
```

`Func<int, int>` içinde:

- İlk `int`, parametre türüdür.
- Son `int`, dönüş türüdür.

İki parametreli örnek:

```csharp
Func<int, int, int> topla = (a, b) =>
{
    return a + b;
};
```

Burada:

- İlk `int`: Birinci parametre
- İkinci `int`: İkinci parametre
- Son `int`: Dönüş tipi

`Func` içinde son tür her zaman dönüş türüdür.

---

## 6. Lambda nedir?

Lambda, adı olmayan kısa bir fonksiyon yazma biçimidir.

```csharp
sayi => sayi * sayi
```

Bu lambda:

- Bir parametre alır.
- Parametrenin karesini döndürür.

Bir `Func` değişkenine atanabilir:

```csharp
Func<int, int> kareAl = sayi => sayi * sayi;
```

Kullanımı:

```csharp
int sonuc = kareAl(5);

Console.WriteLine(sonuc); // 25
```

Lambda’nın kendi adı yoktur. Buradaki `kareAl`, lambdayı tutan değişkenin adıdır.

---

## 7. Lambda parametresinin türü nereden gelir?

Şu kodu inceleyelim:

```csharp
Func<int, int> kareAl = sayi => sayi * sayi;
```

Buradaki `sayi` parametresinin türünü açıkça yazmadık.

C# türü şuradan anlar:

```csharp
Func<int, int>
```

İlk `int`, lambda parametresinin türüdür. Bu nedenle kod aslında şuna denktir:

```csharp
Func<int, int> kareAl = (int sayi) => sayi * sayi;
```

Yani tür önemlidir, ancak C# çoğu zaman türü bağlamdan çıkardığı için tekrar yazmamıza gerek kalmaz.

---

## 8. Lambda parametresi verileni temsil eder

Şu lambda tek başına bir nesne oluşturmaz:

```csharp
kullanici =>
{
    kullanici.Ad = "Ahmet";
}
```

Buradaki `kullanici`, lambda çalıştırıldığında dışarıdan gönderilecek parametreyi temsil eder.

Normal bir metotta da aynı mantık vardır:

```csharp
void KullaniciAyarla(Kullanici gelenKullanici)
{
    gelenKullanici.Ad = "Ahmet";
}
```

Bu metodu şöyle çağırdığımızda:

```csharp
var kullanici = new Kullanici();

KullaniciAyarla(kullanici);
```

Dışarıdaki `kullanici` nesnesi, metodun içindeki `gelenKullanici` parametresine aktarılır.

Lambda’da da aynı parametre aktarımı gerçekleşir.

---

## 9. Bir metoda başka bir fonksiyon gönderme

Şimdi başka bir fonksiyonu parametre olarak alan bir metot yazalım:

```csharp
int Hesapla(int a, int b, Func<int, int, int> islem)
{
    return islem(a, b);
}
```

Bu metot:

1. İki sayı alır.
2. Bu sayılara uygulanacak bir fonksiyon alır.
3. Gelen fonksiyonu çalıştırır.
4. Sonucu döndürür.

İsimli bir metotla kullanalım:

```csharp
int Topla(int a, int b)
{
    return a + b;
}

int sonuc = Hesapla(4, 6, Topla);
```

Burada `Topla` hemen çalıştırılmadı. `Hesapla` metoduna verildi.

`Hesapla` içinde şu satır çalışır:

```csharp
islem(a, b);
```

`islem` değişkeni `Topla` metodunu tuttuğu için bu satır mantıksal olarak şuna dönüşür:

```csharp
Topla(a, b);
```

---

## 10. Aynı kullanımın lambda hâli

Ayrı bir `Topla` metodu yazmadan lambda verebiliriz:

```csharp
int sonuc = Hesapla(4, 6, (a, b) =>
{
    return a + b;
});
```

Daha kısa yazımı:

```csharp
int sonuc = Hesapla(4, 6, (a, b) => a + b);
```

Bu kod şunu söyler:

> `4` ve `6` sayılarını al. Bunlara uygulanacak işlem olarak toplama işlemini kullan.

Aynı metoda farklı davranışlar gönderebiliriz:

```csharp
int toplam = Hesapla(10, 5, (a, b) => a + b);
int fark = Hesapla(10, 5, (a, b) => a - b);
int carpim = Hesapla(10, 5, (a, b) => a * b);
```

Burada `Hesapla` değişmedi. Yalnızca dışarıdan verilen davranış değişti.

---

## 11. Action alan bir metot örneği

Şimdi geriye değer döndürmeyen bir fonksiyonu parametre olarak alan metot yazalım:

```csharp
void MesajOlustur(Action<string> islem)
{
    string mesaj = "Merhaba dünya";

    islem(mesaj);
}
```

Bu metot bir `Action<string>` bekler.

Yani:

> Bir `string` alan ve değer döndürmeyen bir fonksiyon ver.

İsimli metotla kullanım:

```csharp
void EkranaYaz(string metin)
{
    Console.WriteLine(metin);
}

MesajOlustur(EkranaYaz);
```

`MesajOlustur` içinde şu çağrı yapılır:

```csharp
islem(mesaj);
```

Bu da gerçekte şuna denk gelir:

```csharp
EkranaYaz(mesaj);
```

Lambda ile aynı kullanım:

```csharp
MesajOlustur(metin =>
{
    Console.WriteLine(metin);
});
```

Buradaki `metin`, içeride oluşturulan `"Merhaba dünya"` değerini temsil eder.

---

## 12. Nesne oluşturup lambda’ya verme

Bir `Kullanici` sınıfımız olsun:

```csharp
class Kullanici
{
    public string Ad { get; set; }
    public int Yas { get; set; }
}
```

Bir kullanıcı oluşturup dışarıdan verilen fonksiyonla ayarlayan metot:

```csharp
Kullanici KullaniciOlustur(Action<Kullanici> ayarla)
{
    var yeniKullanici = new Kullanici();

    ayarla(yeniKullanici);

    return yeniKullanici;
}
```

Burada:

```csharp
Action<Kullanici> ayarla
```

şu anlama gelir:

> Bir `Kullanici` nesnesi alan ve değer döndürmeyen bir fonksiyon bekliyorum.

Kullanımı:

```csharp
Kullanici kullanici = KullaniciOlustur(gelenKullanici =>
{
    gelenKullanici.Ad = "Ahmet";
    gelenKullanici.Yas = 25;
});
```

Buradaki `gelenKullanici`, yeni bir nesne oluşturmaz.

Gerçek nesne burada oluşturulur:

```csharp
var yeniKullanici = new Kullanici();
```

Ardından şu satır çalışır:

```csharp
ayarla(yeniKullanici);
```

Bu çağrı sırasında:

```text
yeniKullanici → gelenKullanici
```

eşleşmesi oluşur.

Yani lambda içindeki `gelenKullanici`, metodun içinde oluşturulan `yeniKullanici` nesnesini temsil eder.

---

## 13. Aynı örneğin isimli metotla yazılması

Önce ayarlama metodunu yazalım:

```csharp
void KullaniciAyarla(Kullanici gelenKullanici)
{
    gelenKullanici.Ad = "Ahmet";
    gelenKullanici.Yas = 25;
}
```

Sonra metodun kendisini `KullaniciOlustur` metoduna gönderelim:

```csharp
Kullanici kullanici = KullaniciOlustur(KullaniciAyarla);
```

İçerideki şu satır:

```csharp
ayarla(yeniKullanici);
```

mantıksal olarak şuna dönüşür:

```csharp
KullaniciAyarla(yeniKullanici);
```

Lambda kullanımı ise aynı işlemin kısa yazımıdır:

```csharp
Kullanici kullanici = KullaniciOlustur(gelenKullanici =>
{
    gelenKullanici.Ad = "Ahmet";
    gelenKullanici.Yas = 25;
});
```

---

## 14. Neden `KullaniciAyarla(options)` şeklinde göndermiyoruz?

Şu ikisi farklıdır:

```csharp
KullaniciOlustur(KullaniciAyarla);
```

```csharp
KullaniciOlustur(KullaniciAyarla(kullanici));
```

İlk kullanımda metodun kendisini göndeririz:

```csharp
KullaniciAyarla
```

İkinci kullanımda metodu hemen çalıştırmaya çalışırız:

```csharp
KullaniciAyarla(kullanici)
```

Ancak `KullaniciAyarla` metodu `void` döndürüyorsa, çalıştıktan sonra `KullaniciOlustur` metoduna gönderilecek bir değer kalmaz.

Doğru mantık şudur:

```csharp
KullaniciOlustur(KullaniciAyarla);
```

Nesneyi `KullaniciOlustur` oluşturur ve daha sonra kendisi şu çağrıyı yapar:

```csharp
KullaniciAyarla(yeniKullanici);
```

---

## 15. Listelerde lambda kullanımı

Lambda ifadeleri LINQ metotlarında çok sık kullanılır.

### Filtreleme

```csharp
var sayilar = new List<int> { 1, 2, 3, 4, 5, 6 };

var ciftSayilar = sayilar.Where(sayi => sayi % 2 == 0);
```

Buradaki lambda:

```csharp
sayi => sayi % 2 == 0
```

bir `int` alır ve `bool` döndürür.

Türü mantıksal olarak şöyledir:

```csharp
Func<int, bool>
```

İsimli metotla aynı kullanım:

```csharp
bool CiftMi(int sayi)
{
    return sayi % 2 == 0;
}

var ciftSayilar = sayilar.Where(CiftMi);
```

---

### Dönüştürme

```csharp
var kareler = sayilar.Select(sayi => sayi * sayi);
```

Buradaki lambda bir `int` alır ve bir `int` döndürür:

```csharp
Func<int, int>
```

İsimli metot karşılığı:

```csharp
int KareAl(int sayi)
{
    return sayi * sayi;
}

var kareler = sayilar.Select(KareAl);
```

---

### Sıralama

```csharp
var siraliUrunler = urunler.OrderBy(urun => urun.Fiyat);
```

Buradaki lambda şunu söyler:

> Her ürün için sıralama değeri olarak `Fiyat` özelliğini kullan.

---

## 16. Parametresiz lambda

Lambda her zaman parametre almak zorunda değildir:

```csharp
Action selamVer = () =>
{
    Console.WriteLine("Merhaba");
};
```

Buradaki `()` işareti, lambdanın parametre almadığını gösterir.

Kullanımı:

```csharp
selamVer();
```

Normal metot karşılığı:

```csharp
void SelamVer()
{
    Console.WriteLine("Merhaba");
}
```

---

## 17. Tek ve çok parametreli lambda yazımı

Tek parametre varsa parantez zorunlu değildir:

```csharp
x => x * 2
```

İstersen yazabilirsin:

```csharp
(x) => x * 2
```

Birden fazla parametre varsa parantez gerekir:

```csharp
(a, b) => a + b
```

Türleri açıkça da yazabilirsin:

```csharp
(int a, int b) => a + b
```

Ancak C# çoğu zaman türleri bağlamdan çıkardığı için buna gerek kalmaz.

---

## 18. Expression-bodied metot ile lambda aynı şey değildir

Şu normal bir metottur:

```csharp
int KareAl(int sayi) => sayi * sayi;
```

Adı vardır: `KareAl`.

Şu ise lambda ifadesidir:

```csharp
Func<int, int> kareAl = sayi => sayi * sayi;
```

Buradaki lambda isimsizdir.

İkisinde de `=>` kullanılması, ikisinin aynı yapı olduğu anlamına gelmez.

---

## 19. Anonymous method

Lambda’dan önce C#’ta adı olmayan metotlar `delegate` sözcüğüyle yazılabiliyordu:

```csharp
Func<int, int> kareAl = delegate (int sayi)
{
    return sayi * sayi;
};
```

Lambda karşılığı:

```csharp
Func<int, int> kareAl = sayi => sayi * sayi;
```

Günümüzde lambda daha kısa ve okunabilir olduğu için daha sık tercih edilir.

---

## 20. Temel zihinsel model

Bir lambda gördüğünde şu üç soruyu sor:

### 1. Lambda hangi metoda veriliyor?

```csharp
KullaniciOlustur(kullanici => ...)
```

Lambda, `KullaniciOlustur` metoduna veriliyor.

### 2. Metot hangi delegate türünü bekliyor?

```csharp
Action<Kullanici>
```

Bu nedenle lambda:

- Bir `Kullanici` alır.
- Değer döndürmez.

### 3. Lambda parametresine gerçek değeri kim veriyor?

Metodun içindeki şu satır:

```csharp
ayarla(yeniKullanici);
```

Buradaki `yeniKullanici`, lambda parametresine aktarılır.

---

# ASP.NET Core’daki AddJwtBearer örneği

Şimdi öğrendiklerimizi gerçek koda uygulayalım:

```csharp
builder.Services
    .AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
    });
```

## 21. AddAuthentication ne yapar?

```csharp
builder.Services.AddAuthentication()
```

Uygulamaya kimlik doğrulama altyapısını ekler.

Kimlik doğrulama, gelen kullanıcının kim olduğunu belirleme işlemidir.

---

## 22. AddJwtBearer ne yapar?

```csharp
.AddJwtBearer(...)
```

Uygulamanın JWT Bearer token kullanarak kimlik doğrulaması yapacağını belirtir.

JWT, istemcinin isteklerle birlikte gönderdiği ve kullanıcının kimliğini doğrulamak için kullanılan token yapısıdır.

---

## 23. `options => { ... }` kısmı nedir?

```csharp
options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
}
```

Bu, `AddJwtBearer` metoduna verilen bir lambda fonksiyonudur.

`AddJwtBearer` basitleştirilmiş şekilde şöyle bir fonksiyon bekler:

```csharp
Action<JwtBearerOptions>
```

Yani:

> Bir `JwtBearerOptions` nesnesi alan ve geriye değer döndürmeyen bir fonksiyon ver.

Lambda’nın açık türle yazımı şöyledir:

```csharp
(JwtBearerOptions options) =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
}
```

C# `options` parametresinin türünü `AddJwtBearer` metodunun beklediği delegate türünden anlar.

---

## 24. Options nesnesini kim oluşturuyor?

Sen şu kodu yazmıyorsun:

```csharp
var options = new JwtBearerOptions();
```

Bu nesneyi .NET altyapısı oluşturur.

Basitleştirilmiş mantık şöyledir:

```csharp
void AddJwtBearer(Action<JwtBearerOptions> ayarla)
{
    var options = new JwtBearerOptions();

    ayarla(options);
}
```

Sen metodu şöyle çağırırsın:

```csharp
AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
});
```

Çalışma sırası:

1. `AddJwtBearer` çağrılır.
2. Lambda fonksiyonu metoda gönderilir.
3. İçeride `JwtBearerOptions` nesnesi oluşturulur.
4. `ayarla(options)` çağrılır.
5. İçeride oluşturulan nesne lambda parametresine aktarılır.
6. Lambda nesnenin özelliklerini değiştirir.

---

## 25. Aynı kodun isimli metotla yazılması

Önce isimli metodu tanımlarız:

```csharp
void JwtAyarlari(JwtBearerOptions options)
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
}
```

Sonra metodun kendisini `AddJwtBearer` metoduna veririz:

```csharp
builder.Services
    .AddAuthentication()
    .AddJwtBearer(JwtAyarlari);
```

Burada:

```csharp
JwtAyarlari
```

metodun kendisidir.

Şu kullanım değildir:

```csharp
.AddJwtBearer(JwtAyarlari(options))
```

Çünkü bu kullanım metodu hemen çalıştırmaya çalışır. Oysa `options` nesnesini oluşturup metoda verecek olan taraf `AddJwtBearer` metodudur.

---

## 26. Lambda ve isimli metot karşılaştırması

### İsimli metot

```csharp
void JwtAyarlari(JwtBearerOptions options)
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
}

builder.Services
    .AddAuthentication()
    .AddJwtBearer(JwtAyarlari);
```

### Lambda

```csharp
builder.Services
    .AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
    });
```

İki kod da aynı temel mantığı kullanır.

Lambda kullanımı, yalnızca bu noktada kullanılacak kısa bir ayarlama fonksiyonu için daha uygundur.

---

## 27. Ayarların anlamı

### SaveToken

```csharp
options.SaveToken = true;
```

Başarılı kimlik doğrulamasından sonra token bilgisinin kimlik doğrulama özellikleri içinde saklanmasını sağlar.

---

### RequireHttpsMetadata

```csharp
options.RequireHttpsMetadata = false;
```

Kimlik doğrulama metadata bilgilerinin yalnızca HTTPS üzerinden alınması zorunluluğunu kapatır.

Bu ayar geliştirme ortamında kullanılabilir. Üretim ortamında güvenlik nedeniyle HTTPS kullanılması ve bu ayarın genellikle `true` bırakılması daha uygundur.

---

## 28. Metot zinciri mantığı

Kod şu şekilde yazılmıştır:

```csharp
builder.Services
    .AddAuthentication()
    .AddJwtBearer(...);
```

Buna metot zinciri denir.

Basitleştirilmiş karşılığı şöyledir:

```csharp
var authenticationBuilder =
    builder.Services.AddAuthentication();

authenticationBuilder.AddJwtBearer(...);
```

Yani `AddAuthentication()` bir nesne döndürür. Ardından `AddJwtBearer()` bu nesne üzerinde çağrılır.

Noktaların lambda ile doğrudan ilgisi yoktur. Noktalar metotların zincir hâlinde çağrılmasını sağlar.

---

# Sonuç

Şu kod:

```csharp
builder.Services
    .AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
    });
```

şunu söyler:

> Uygulamaya kimlik doğrulamayı ekle. JWT Bearer yöntemini kullan. JWT ayar nesnesini oluşturduğunda bana ver; ben de bu nesnenin `SaveToken` ve `RequireHttpsMetadata` özelliklerini ayarlayayım.

En önemli noktalar:

- `options` nesnesini lambda oluşturmaz.
- Nesneyi `AddJwtBearer` altyapısı oluşturur.
- `options`, lambda’ya verilen nesneyi temsil eden parametredir.
- Parametrenin türünü C# metodun beklediği `Action<JwtBearerOptions>` türünden anlar.
- `options => { ... }`, isimli bir metot yazmadan ayarlama davranışını göndermenin kısa yoludur.
- `JwtAyarlari` metodun kendisini, `JwtAyarlari(options)` ise metodun çalıştırılmasını ifade eder.
