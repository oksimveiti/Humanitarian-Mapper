# Humanitarian Mapper — Tasarım Dökümanı (3W/4W Koordinasyon Aracı)

**Tarih:** 2026-06-20
**Durum:** Onaylandı (brainstorming aşaması)

## 1. Amaç

İnsani yardım kuruluşlarının "kim, nerede, ne yapıyor" (Who does What Where) bilgisini
ortak bir haritada paylaştığı, açık kaynaklı ve self-host edilebilen bir koordinasyon aracı.

Sahadan doğmuş gerçek bir ihtiyaç: büyük bir kriz (örn. deprem) sonrası onlarca kuruluş
aynı bölgede çalışır; küçük/yerel kuruluşların pahalı haritalama sistemlerine bütçesi ya da
teknik ekibi olmaz. Bu araç, kuruluşların birbirini görmesini ve "burada zaten kim var?",
"burada boşluk var mı?" sorularını yanıtlamasını sağlar.

Bu araç insani yardımın yerleşik **3W / 4W / 5W** standardını uygular:
- **3W** = Who / What / Where (kim / ne / nerede)
- **4W** = + When (ne zaman)
- **5W** = + for Whom (hedeflenen kişi sayısı)

**Veri ilkesi:** Kişisel/faydalanıcı verisi tutulmaz. Sadece kuruluş faaliyetleri görünür.
(OCHA Veri Sorumluluğu Kuralları 2025 ile uyumlu.)

## 2. Roller

- **Koordinatör (admin):** Kurulumu yönetir; kuruluşları onaylar/davet eder; sektör listesini
  ve form alanlarını (özel alanlar dâhil) yapılandırır; salt-okunur paylaşım linkini açar.
  Gerçek dünyadaki ülke/kriz koordinasyon gruplarına (cluster system) karşılık gelir.
- **Kuruluş (üye):** Onaylandıktan sonra kendi faaliyet alanlarını işaretler ve günceller.
- **Ziyaretçi (salt-okunur):** Koordinatör paylaşım linkini açtıysa, giriş yapmadan haritayı görür.

## 3. Dağıtım modeli

- **Sadece self-host.** Merkezi platform işletilmez. Her koordinasyon grubu kendi sunucusuna kurar.
- **Bir kurulum = bir ortak harita.** Workspace ayrımı yok; kuruluşlar coğrafi olarak nereyi
  işaretlerse orada görünür (Türkiye, Suriye, Irak hepsi aynı haritada olabilir).
- Demo, canlı site yerine **video ve ekran görüntüleri** ile dökümantasyonda sunulur.

## 4. Çekirdek akış

1. Koordinatör kurar → sektör listesini (11 global cluster önceden dolu) ve form alanlarını
   (zorunlu/opsiyonel/özel) yapılandırır.
2. Kuruluş kayıt olur → koordinatör onaylar.
3. Kuruluş haritada alan işaretler:
   - (a) Standart **idari bölge** seçer (P-code/COD desteği), veya
   - (b) Haritaya **poligon/nokta** çizer.
4. Faaliyet bilgisini girer: sektör(ler) + durum + tarihler + koordinatörün tanımladığı alanlar.
5. Herkes haritaya bakar, sektöre/duruma/tarihe göre filtreler → **boşlukları** görür.

## 5. Veri modeli (PostgreSQL + PostGIS)

- **organization** — ad, durum (beklemede/onaylı), kurumsal iletişim e-postası
- **user** — e-posta, şifre (hash), rol, bağlı kuruluş
- **activity**
  - kuruluş (FK), sektör(ler), geometri (PostGIS `geometry`: poligon veya nokta)
  - idari bölge referansı (opsiyonel, P-code)
  - **durum:** Planlama / Uygulama / Tamamlandı
  - **başlangıç tarihi**, **bitiş tarihi**
  - hedef kişi sayısı, açıklama, kurumsal iletişim
  - özel alan değerleri (JSONB)
  - **son güncelleme tarihi** (veri tazeliği için)
- **sector** — koordinatörün düzenleyebildiği liste; 11 global cluster ile seed edilir
- **custom_field** — koordinatörün tanımladığı alanlar (tip: metin/sayı/tarih/tek seçim/çoklu seçim;
  zorunlu/opsiyonel bayrağı)
- **admin_boundary** — (opsiyonel) yüklenen COD/P-code idari sınırları

## 6. Mimari

```
[React + MapLibre GL]  ←REST→  [Spring Boot API]  ←→  [PostgreSQL + PostGIS]
        │
   [PMTiles basemap]  (statik dosya, limitsiz, offline çalışır)
```

- **Frontend:** React + MapLibre GL JS + çizim eklentisi; i18n (TR/EN/AR) + sağdan-sola (RTL) desteği
- **Backend:** Spring Boot REST API; JWT auth; rol bazlı yetkilendirme
- **Veritabanı:** PostgreSQL + PostGIS (geometri saklama + mekânsal sorgular)
- **Basemap:** PMTiles dosyası (API anahtarı yok, kullanım limiti yok, çevrimdışı çalışır)
- **Dağıtım:** Tümü `docker compose up` ile birlikte kalkar

## 7. v1 Özellikleri

- Standart cluster sektör listesi (önceden dolu, düzenlenebilir)
- İdari bölge seçimi **+** serbest poligon/nokta çizimi
- Proje durumu (Planlama/Uygulama/Tamamlandı) + başlangıç/bitiş tarihleri
- **Gap filtresi** — sektöre/duruma/tarihe göre filtrele; kuruluşsuz bölgeler boş görünür
  (zamansal boşluk analizi: örn. "6 aydan eski tamamlanmış projeler")
- **CSV/Excel dışa aktarma**
- **Çoklu dil + RTL**
- **Salt-okunur paylaşım linki**
- **Yapılandırılabilir form alanları + özel alan oluşturucu** (5 tip ile sınırlı)
- Veri tazeliği göstergesi (eski kayıtlar soluk/uyarılı)

## 8. Bilinçli olarak kapsam DIŞI (v2+)

Faydalanıcı/ihtiyaç sahibi takibi · dağıtım yönetimi · genel API · geçmiş zaman çizelgesi
(snapshot) · mobil offline saha uygulaması · mükerrerlik/örtüşme bildirimi · çoklu-workspace ·
şart koşullu/formüllü form alanları.

> **Odak ilkesi:** Aracın gücü "kim nerede çalışıyor"a odaklanmasıdır. Faydalanıcı verisine
> girmek hem kişisel veri riski açar hem de projeyi devasa, farklı bir şeye dönüştürür.

## 9. Hata yönetimi & test

- **Validation:** geçersiz geometri, eksik zorunlu alan (özel alanlar dâhil) → anlamlı hata mesajları
- **Güvenlik:** rol bazlı yetki — bir kuruluş başka kuruluşun kaydını değiştiremez; salt-okunur
  link gerçekten salt-okunur
- **Test:**
  - PostGIS mekânsal sorgular için entegrasyon testleri
  - API için unit + integration testleri
  - Kritik akış için uçtan uca test: kayıt → onay → işaretle → filtrele → export

## 10. Teknoloji özeti

> React + MapLibre GL · Spring Boot (Java) · PostgreSQL + PostGIS · PMTiles · Docker Compose

## Kaynaklar (araştırma)

- OCHA 3W Portal — https://3w.unocha.org/
- Who does What Where (3W), OCHA IM Toolbox —
  https://humanitarian.atlassian.net/wiki/spaces/imtoolbox/pages/214499412/Who+does+What+Where+3W
- Health Cluster 3W/4W Tool (WHO)
- OCHA Data Responsibility Guidelines 2025
- Humanitarian OpenStreetMap Team (HOT) — https://www.hotosm.org/en/
