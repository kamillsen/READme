# ADO.NET — Kısa ve Kapsamlı Notlar

## ADO.NET nedir?
**ADO.NET**, .NET (C#, VB.NET vb.) uygulamalarının **veri kaynaklarına** (özellikle veritabanlarına) bağlanıp **veri okuma/yazma** yapmasını sağlayan Microsoft’un **çekirdek veri erişim teknolojisidir**. SQL Server için genelde **Microsoft.Data.SqlClient**, diğer veritabanları için ilgili sağlayıcılar (provider) kullanılır.

---

## Ne işe yarar?
- Veritabanına **bağlanma** (Connection)
- **Sorgu/komut çalıştırma** (Command: SELECT/INSERT/UPDATE/DELETE, stored procedure)
- Sonuçları **okuma** (DataReader ile satır satır hızlı okuma)
- Veriyi uygulama içinde **tablo gibi tutma** (DataTable / DataSet gibi “bellekte veri” yapıları)
- **Transaction** (işlem) yönetimi
- Parametreli sorgularla **SQL injection riskini azaltma**

---

## Temel kavramlar (en çok kullanılanlar)
- **Provider (Sağlayıcı)**: Veritabanına özel sürücü/kütüphane.  
  - SQL Server: `Microsoft.Data.SqlClient` (önerilen)  
  - Diğerleri: PostgreSQL (`Npgsql`), MySQL (`MySqlConnector`), SQLite (`Microsoft.Data.Sqlite`) vb.
- **Connection**: Bağlantıyı açar/kapatır.
- **Command**: SQL komutunu çalıştırır; parametre alabilir.
- **DataReader**: Sonuçları **ileri yönlü ve akış (stream) gibi** okur; büyük veride hafıza dostudur.
- **DataSet / DataTable**: **Bağlantısız (disconnected)** senaryolarda “bellekte veri cache’i” gibi çalışır; tablolar/ilişkiler tutabilir.

> Pratik kural:  
> - **Hız + düşük bellek** → DataReader  
> - **Bağlantısız çalışma / UI’ye veri taşıma** → DataSet/DataTable

---

## Ne zaman kullanılır?
ADO.NET’i tercih edebileceğin tipik durumlar:
- **Yüksek performans** gereken, sorgu üzerinde tam kontrol istediğin yerler
- SQL’in **çok özel** olduğu durumlar (karmaşık join/CTE, özel ipuçları, vendor özellikleri)
- **Stored procedure** ağırlıklı sistemler
- **Basit servis/iş**: “1–2 sorgu çalıştır, sonucu dön” gibi net işler
- ORM kullanmak istemediğin veya ORM’nin ürettiği SQL’i kontrol etmek istediğin senaryolar
- Kurumsal projelerde “veri erişimi” katmanında **daha az sihir, daha çok kontrol** istenmesi

---

## Hâlâ kullanılıyor mu?
Evet. ADO.NET **hala yaygın** ve “alt katman” olarak çok canlı:
- .NET ile SQL Server’a bağlanmanın güncel/tercih edilen yolu olarak **Microsoft.Data.SqlClient** sürücüsü aktif şekilde geliştiriliyor.
- Entity Framework gibi ORM’ler de pratikte altta **ADO.NET sağlayıcıları** üzerinden veritabanıyla konuşur.

---

## Avantajlar
- ✅ **Performans ve kontrol**: SQL’i sen yazarsın, sürpriz az olur.
- ✅ **Az bağımlılık**: ORM katmanı olmadan çalışır.
- ✅ **Esneklik**: İstediğin SQL’i, istediğin şekilde çalıştırırsın.
- ✅ **Veri erişimi temelini öğrenmek** için çok iyi.

---

## Dezavantajlar
- ❌ **Daha fazla “boilerplate” kod**: Connection/Command/Reader yönetimi.
- ❌ **Manuel mapping**: Satırları sınıflara dönüştürmek senin işin.
- ❌ **Bakımı zorlaşabilir**: Çok sayıda query string’i dağınıklaşabilir.
- ❌ Parametre kullanmazsan **SQL injection** riski artar.
- ❌ Büyük projelerde “mini ORM yazma” tuzağına düşülebilir.

---

## Mini örnek (SQL Server + DataReader)
> Amaç: Aktif kullanıcıları listelemek

```csharp
using Microsoft.Data.SqlClient;

var cs = "Server=.;Database=DemoDb;Trusted_Connection=True;TrustServerCertificate=True;";
using var con = new SqlConnection(cs);
await con.OpenAsync();

using var cmd = new SqlCommand(
    "SELECT Id, Name FROM Users WHERE IsActive = @isActive", con);
cmd.Parameters.AddWithValue("@isActive", true);

using var reader = await cmd.ExecuteReaderAsync();
while (await reader.ReadAsync())
{
    Console.WriteLine($"{reader.GetInt32(0)} - {reader.GetString(1)}");
}
```

---

## ADO.NET mi, EF Core mu?
- **EF Core**: Hızlı geliştirme, az kod, model odaklı çalışma (çoğu projede “default” tercih).
- **ADO.NET**: Performans/kontrol/özel SQL gerektiğinde veya küçük net işlerde çok uygun.

> Pratik yaklaşım:  
> - Çoğu iş için **EF Core**,  
> - kritik yerlerde veya özel sorgularda **ADO.NET (veya Dapper gibi micro-ORM)**.

---

## Kaynaklar (resmî dökümantasyon)
- Microsoft Learn — *ADO.NET Provider for SQL Server*  
- Microsoft Learn — *ADO.NET Architecture*  
- Microsoft Learn — *DataReader ile veri çekme*  
- Microsoft Learn — *ADO.NET DataSets (disconnected senaryolar)*  
- Microsoft Learn — *Microsoft.Data.SqlClient (tercih edilen sürücü)*

