# GPT Skill Notları

Kısa, net ve basit özet: `/generatehandwrittenimage`, `/visualizelearning` ve `EL10`.

> **Not:** Araştırmada bu üçünün hiçbiri OpenAI'nin **resmi slash komut listesinde** çıkmadı.
> Resmi liste `/plan`, `/review`, `/model`, `/compact`, `/goal`, `/init`, `/mcp`, `/status` gibi
> komutlardan oluşuyor. Aşağıdakiler ya **kullanıcı/topluluk tarafından yazılmış özel skill'ler**
> ya da ChatGPT'nin altında yatan **yerleşik yeteneklerin** takma adları.

---

## 1. `/generatehandwrittenimage`

**Ne yapar:** Yazdığın metni, el yazısıyla yazılmış gibi görünen bir **görsele** çevirir
(defter kağıdı, kareli kağıt, post-it, tahta vb. arka planla).

**Arkasında ne var:** ChatGPT'nin görsel üretme modeli (Images 2.0). Bu model artık
görsel içindeki metni çok yüksek doğrulukla yazabiliyor — bu yüzden el yazısı notlar
gerçekçi çıkıyor. Yani komut, "şu metni el yazısı stilinde bir görsel olarak üret"
promptunu paketleyen bir kısayol.

**Ne işe yarar:**
- Ders notu / özet çıkarıp el yazısı görüntüsünde kaydetmek
- Sunum, sosyal medya, poster için "kişisel" görünen görsel
- Alıntı, mektup, to-do listesi mockup'ı

**Sınırları:** Gerçek senin el yazın değil, taklit bir stil. Uzun metinlerde harf
bozulmaları olabilir; resmî/hukuki belge yerine geçmez.

---

## 2. `/visualizelearning`

**Ne yapar:** Bir konuyu düz metinle anlatmak yerine **görsel / etkileşimli bir
açıklamaya** dönüştürür — diyagram, şema, grafik veya oynanabilir simülasyon.

**Arkasında ne var:** ChatGPT'nin **Visualize / dynamic visual explanations**
özelliği. 70+ matematik ve fen konusunda değişkenleri kaydırıp sonucun anlık
değiştiğini görebiliyorsun (Pisagor teoremi, bileşik faiz, Hooke yasası,
üstel azalma, kinetik enerji vb.).

**Ne işe yarar:**
- Soyut formülü "elle oynanabilir" hale getirmek
- Süreç/akış şeması, zaman çizelgesi, karşılaştırma tablosu üretmek
- Görsel öğrenenler için ders anlatımı

**Sınırları:** Her konu için hazır görselleştirme yok; çok niş konularda
basit diyagrama düşer.

---

## 3. `EL10` (ELI10 — "Explain Like I'm 10")

**Ne yapar:** Slash komutu değil, bir **prompt tekniği**. Sorunun başına yazarsın,
ChatGPT konuyu 10 yaşındaki birine anlatır gibi sadeleştirir.

**Kullanım:**
```
ELI10: Blockchain nedir?
ELI10: Finansal modelleme nasıl çalışır?
```

**Ne işe yarar:**
- Jargonu temizler, günlük dile ve benzetmelere indirger
- Yeni bir konuya sıfırdan girerken hızlı temel kurar
- Karmaşık bir şeyi başkasına anlatmadan önce "çeviri" almak

**Varyantları:** `ELI5` (daha da basit, 5 yaş), `ELI15`, `ELI-expert`
(tersi: uzman seviyesi). Seviye seçerek detay derinliğini ayarlarsın.

---

## Hızlı Karşılaştırma

| | Ne üretir | En iyi kullanım |
|---|---|---|
| `/generatehandwrittenimage` | El yazısı görsel | Not, alıntı, kişisel görünümlü içerik |
| `/visualizelearning` | Diyagram / etkileşimli görsel | Formül, süreç, fen-matematik konusu |
| `EL10` | Sade metin açıklama | Yeni/karmaşık konuyu hızlı kavramak |

---

# Ek: Öğrenmeyi Kolaylaştıran Diğer Komutlar / Teknikler

Araştırma sonucu en çok işe yarayan, denenmiş olanlar. Çoğu slash komut değil —
**prompt kalıbı** ya da ChatGPT'nin bir modu.

## A. Study Mode (Çalışma Modu) — resmi özellik

**Ne:** ChatGPT'nin cevabı doğrudan vermek yerine seni **adım adım sorularla**
yönlendirdiği mod. Artık tüm planlarda ücretsiz.

**Nasıl:** Composer'daki araç menüsünden "Study and learn" / Study Mode seç.

**İşe yarar:** Ödev/konu çalışırken cevabı kopyalamak yerine gerçekten öğrenmek.
**Sınırı:** Neyi öğrendiğini takip etmez, gerçek spaced repetition yapmaz.

---

## B. Sokratik Tutor (Socratic mode)

> "Sokratik bir öğretmen gibi davran. [Konu] hakkında bana özet verme.
> Bunun yerine, ana sonuçları kendim keşfedeyim diye giderek zorlaşan 5 soru sor."

**İşe yarar:** Pasif okuma yerine düşünmeye zorlar; boşluklarını kendin fark edersin.

---

## C. Feynman Tekniği ("bana sen anlat")

> "Sana [Konu]'yu öğreteceğim. Kafası karışmış bir öğrenci gibi davran.
> Her açıklamamdan sonra beni daha derine inmeye zorlayan bir soru sor.
> Sonunda açıklamamı sadelik ve netlik açısından 1–10 arası puanla."

**İşe yarar:** Bir şeyi anlatamıyorsan anlamamışsındır — bu kalıp tam olarak
o boşlukları yüzeye çıkarır. `EL10`'un tersi: orada GPT sadeleştirir, burada sen.

---

## D. 80/20 (Pareto) filtresi

> "[Konu]'da sonucun %80'ini getiren %20'lik çekirdek kavramları listele.
> Her biri için 1 cümle tanım + neden kritik olduğu."

**İşe yarar:** Yeni bir alana girerken nereden başlayacağını bulmak, zaman kaybını kesmek.

---

## E. Sınav simülasyonu / Aktif hatırlama

> "[Konu] üzerinden bana 10 soruluk bir sınav yap: 5 çoktan seçmeli, 3 kısa cevap,
> 2 uygulama sorusu. Hepsini bitirmeden cevapları verme, sonra tek tek puanla
> ve yanlışlarımın kök nedenini açıkla."

**İşe yarar:** Okumak ≠ bilmek. Test etmek öğrenmenin en güçlü pekiştiricisi.

---

## F. Flashcard üretimi (Anki / Quizlet'e aktarım)

> "[Konu]'dan 30 flashcard üret. CSV formatında, iki sütun: Soru;Cevap.
> Cevaplar tek cümle olsun."

**İşe yarar:** ChatGPT kartı üretir, gerçek tekrar takibini Anki yapar.
En verimli kombinasyon bu ikisidir.

---

## G. Tekrar planı (spaced repetition takvimi)

> "[Konu] için 1., 3., 7., 16. ve 35. günlere yayılmış bir tekrar planı çıkar.
> Her gün için hangi alt başlıkları ve kaç soruyu tekrar edeceğimi yaz."

**İşe yarar:** Unutma eğrisine göre çalışma takvimi. **Sınırı:** ChatGPT sana
hatırlatma göndermez; planı takvimine kendin taşımalısın.

---

## H. Seviye merdiveni

> "[Konu]'yu 4 kez anlat: önce ELI5, sonra lise seviyesi, sonra üniversite,
> sonra uzman seviyesi. Her seviyede bir öncekine ne eklendiğini işaretle."

**İşe yarar:** Basitten derine tek geçişte gitmek; hangi seviyede takıldığını görmek.

---

## I. Analoji + karşı örnek

> "[Kavram]'ı günlük hayattan bir benzetmeyle anlat. Sonra bu benzetmenin
> NEREDE bozulduğunu söyle."

**İşe yarar:** Analoji kavratır ama yanlış öğretebilir; ikinci kısım o riski kapatır.

---

## J. Yanlış anlama avcısı

> "[Konu] hakkında yeni başlayanların en sık yaptığı 7 hatayı listele.
> Her biri için: yanlış inanç → doğrusu → neden karıştırılıyor."

**İşe yarar:** Hataları yapmadan önce öğrenmek, sonradan düzeltmekten çok daha ucuz.

---

## Önerilen Akış

```
80/20 (E: neyi öğreneceğim)
   ↓
EL10 / Seviye merdiveni (kavrama)
   ↓
/visualizelearning (görselleştir)
   ↓
Feynman "bana sen anlat" (boşlukları bul)
   ↓
Sınav simülasyonu (test et)
   ↓
Flashcard + tekrar planı (kalıcı hale getir)
```

---

## Kaynaklar

- [Slash commands | ChatGPT Learn](https://learn.chatgpt.com/docs/reference/slash-commands)
- [Visualizations | ChatGPT Learn](https://learn.chatgpt.com/docs/visualizations)
- [Skills & Plugins | ChatGPT Learn](https://learn.chatgpt.com/docs/skills-and-plugins)
- [Skills in ChatGPT | OpenAI Help Center](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)
- [Using skills | OpenAI Academy](https://openai.com/academy/skills/)
- [ChatGPT can now create interactive visuals | TechCrunch](https://techcrunch.com/2026/03/10/chatgpt-can-now-create-interactive-visuals-to-help-you-understand-math-and-science-concepts/)
- [ChatGPT's new image model turned my article into handwriting | PCWorld](https://www.pcworld.com/article/3120607/chatgpts-new-image-model-turned-my-article-into-handwriting.html)
- [OpenAI are quietly adopting skills | Simon Willison](https://simonwillison.net/2025/Dec/12/openai-skills/)
- [ChatGPT Study Mode: deep learning & spaced repetition | DataStudios](https://www.datastudios.org/post/how-to-use-chatgpt-s-study-mode-for-deep-learning-spaced-repetition-and-exam-preparation)
- [ChatGPT'nin en iyi 13 hızlı öğrenme promptu | Plain English](https://plainenglish.io/blog/chatgpt-s-top-13-prompts-to-learn-anything-faster-study-smarter-not-harder)
- [Feynman Technique AI Tutor prompt | DocsBot](https://docsbot.ai/prompts/education/feynman-technique-ai-tutor)
- [10 ChatGPT prompts to learn anything faster (2026)](https://promptailearning.com/blogs/chatgpt-prompts-learn-anything-faster)
- [ChatGPT ile çalışma: promptlar, flashcard, plan | okti](https://okti.app/en/blog/how-to-use-chatgpt-for-studying/)
