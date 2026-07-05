# DESİL Web Sitesi Yeniden Tasarımı (desil-view)

## Proje Kimliği

- **Ne:** desil.org'un (DESİL — Dijital Sürdürülebilir Liderlik Derneği) sıfırdan yeniden tasarımı. **Unique tasarım — hiçbir kaynağın birebir kopyası değil.**
- **İçerik + kurumsal dil kaynağı:** www.desil.org + brief klasörü `/Users/gaviaworks/Desktop/Desil Sources` (`desil_frontend_tasarim_briefi.docx`). Metin uydurulmaz; bu iki kaynaktan sapan içerik yazılmaz.
- **Renk paleti + tipografi kaynağı:** DESİL kimliği. **Beyar kararı (2026-07-04): "logo neyse renk o" — kurumsal ana renk logonun gerçek rengi `#10367D` (canlı lacivert); brief'in yeşil paleti esas DEĞİL.** Palet ailesi: primary `#10367D`, koyu derinlik (footer/koyu blok) ondan türetilmiş koyu lacivert, AI Cyan `#2AD4FF` (sınırlı mikro vurgu), açık zeminler buz mavisi/lacivert tınılı açık tonlar. Kanonik değerler Wave 1 sonrası `assets/css/tokens.css`'te. Font önerisi: Inter / Manrope / Plus Jakarta Sans. Brief'in orijinal (yeşil) palet kaydı: `tasks/research.md` §2.
- **Kompozisyon/UX kalite referansı:** gaviaworks.com — SADECE bölüm kompozisyonu, spacing ritmi, hiyerarşi, etkileşim kalitesi. **Gaviaworks'ten renk veya font ALINMAZ.** Ölçüt: `tasks/research.md` §4'teki 8 maddelik modernlik rubriği.
- **Teknoloji:** Statik vanilla HTML/CSS/JS. Build pipeline YOK. GitHub Pages'te yayın (public repo: By4r/desil-view).
- **Konsept:** Klasik dernek vitrini değil; dijital sürdürülebilirlik + etik teknoloji + toplumsal fayda odaklı "etki platformu". Açık zemin, yumuşak yeşil-mavi geçişler, veri noktası/ağ dokusu ile abartısız AI hissi. Gerçek AI motoru iddiası (otomatik analiz, gerçek zamanlı skor) ASLA kullanılmaz.

## Köşe (Radius) Dili — Beyar direktifi, kalıcı

Pill/aşırı yuvarlak YASAK. Tüm köşeler şu skaladan: chip/tag/badge/sosyal ikon kutusu **4px** · buton/input **6px** · kart **10px** · medya konteyneri/büyük blok **12px**. `border-radius: 50%` yalnızca gerçekten daire olan dekoratif öğede (dot, ikon dairesi). Sayfadaki HER öğe (footer sosyal ikonları dahil) aynı köşe dilinde olmalı.

## Kanonik Shell — index.html R2 (commit `3ac122c`) — Beyar + Yasin Bey onaylı, KİLİTLİ

Pilot onaylandı (2026-07-04). index.html'in R2 sonrası hali **kanonik referanstır**; tüm iç sayfalar bu shell'i birebir KLONLAR (topbar/header/footer hardcoded — her sayfaya kopyalanır, sapma yok). index.html'e dokunmak YASAK (nav href düzeltmesi gerekiyorsa yalnız Lead, tek hedefli edit).

Kanonik öğeler:
1. **Topbar:** `--brand-deep` bilgi barı — tel + e-posta + 4 sosyal + TR|EN (EN pasif `aria-disabled` span). Mobilde sosyal gizli.
2. **Header (absolute→stuck):** `.site-header` — sayfa üstünde `top: var(--topbar-h)`, scrollY ≥ topbar yüksekliğinde JS `is-stuck` sınıfıyla `fixed top:0`. Sayfa üstünde AÇIK tema (beyaz logo/nav), `is-stuck`'ta açık zemin + lacivert logo (`logo-white`/`logo-dark` swap). **Sonuç: her sayfanın İLK bölümü KOYU olmalı** (iç sayfalarda `.page-hero`) — yoksa beyaz nav okunmaz.
3. **Footer:** ortalanmış kompozisyon (logo → slogan → yatay link satırı → yatay iletişim → alt bar) + `--grad-footer` gradient + cyan hale/hairline + **footer-reveal perdesi** (≥641px fixed bottom + `.page-main` z2 opak + JS margin-bottom senkronu; ≤640 statik). `.page-main` sarmalayıcısı ve `main.js` her sayfada zorunlu.
4. **Keskin bölüm geçişleri:** beyaz/mavi alternans (`.section--white` ↔ `.section--tint` `--surface-blue`), fade/gradient geçiş şeridi YOK; koyu bantlar `.section--dark`.
5. **Radius skalası:** 4/6/10/12px (yukarıdaki bölüm) — pill yok.
6. **Sağ-üst "Tümünü Gör" deseni:** `.section-head-row` — solda eyebrow+H2, sağda başlıkla hizalı `btn--ghost/--light btn--sm` CTA; lead satırı altta tam genişlik.
7. **Carousel:** `data-carousel` section + `.carousel-track` (scroll-snap, kütüphanesiz) + `.carousel-nav` okları `section-head-tools` içinde. Controller `main.js`'te, jenerik.

**Component rejimi (Wave 2+):** `tasks/components.md` = component sözlüğü, TEK kaynak. Aynı ihtiyaç = aynı component; sayfadan sayfaya varyasyon YASAK. Yeni component ihtiyacı → teammate KENDİSİ TASARLAMAZ, Lead'e bildirir; Lead components.md'ye tanım ekler, sonra üretilir. İç sayfa ortak component CSS'i `assets/css/components.css`'te (ilk sayfayla üretilir, sonrası hedefli edit rejimi); sayfa-özel CSS `assets/css/pages/<sayfa>.css`. tokens.css'e yeni token eklemek YASAK (ihtiyaç Lead üzerinden Beyar'a). Ortak dosyalara (tokens.css, main.css, main.js, components.css) full-file overwrite YASAK.

## Anahtar Dosyalar

- `tasks/research.md` — keşif raporu: görsel kimlik, desil.org içerik envanteri, gaviaworks rubriği, skill araştırması
- `tasks/components.md` — component sözlüğü (Wave 2+): iç sayfa component'lerinin TEK desen tanımı
- `tasks/plan.md` — sayfa bazlı üretim planı (wave yapısı)
- `tasks/handoff.md` — teammate'ler arası devir notları (kim neyi bitirdi, ne bekliyor)
- `tasks/lessons.md` — öğrenilen dersler; her teammate revize turunda buraya yazar, üretimden önce okur
- `docs/screenshots/` — QA screenshot'ları (gitignored, asla commit edilmez)

## Agent Team Tanımı (kalıcı — "team kur" dendiğinde bu yapı kurulur)

- **Lead (bu oturum):** SADECE koordinasyon — kod yazmaz, dosya üretmez. Shared task list yönetir, wave sonunda Beyar onay kapısını işletir, handoff.md'yi günceller.
- **3 frontend teammate:** Dosya bazlı domain ayrımı — **bir dosyanın aynı anda tek sahibi var** (sayfa sahipliği plan.md'de). Ortak dosyalarda (token CSS, ortak JS) **full-file overwrite YASAK** — sadece hedefli edit (Edit tool, dar old_string).
- **1 QA teammate (Sonnet model):** Playwright ile **1440px + 390px** screenshot alır → `docs/screenshots/` altına kaydeder → rubriğe göre bağımsız değerlendirir → PASS/FAIL raporu verir. Minör sorunları (spacing, typo, kontrast) otonom düzeltebilir; yapısal sorunları sahibi teammate'e raporlar.
- **Wave 1 istisnası:** Pilot fazında tam team kurulMAZ — tek frontend teammate + QA teammate yeterli. Paralel yapı Wave 2'de başlar (bkz. plan.md).

## Skill Kuralları

- **frontend-design skill: her frontend teammate için ZORUNLU.** Her sayfa üretiminden ÖNCE skill okunur ve uygulanır. Hiçbir koşulda atlanmaz.
- **QA teammate ek skill'leri:** `uiux-review` (estetik critique) + `design-review` (ölçülebilir denetim tabloları + severity; `~/.claude/skills/design-review`). Bunlar frontend-design'ın YERİNE değil, YANINA — değerlendirme aşamasında kullanılır.

## Öz-Denetim Loop'u (her sayfa için)

1. Teammate sayfayı üretir (frontend-design skill ile).
2. Playwright screenshot: 1440px + 390px → `docs/screenshots/`.
3. Üç eksende öz-değerlendirme:
   - **(a) Modernlik** — gaviaworks rubriği (research.md §4): kompozisyon, ritim, etkileşim kalitesi
   - **(b) İçerik sadakati** — desil.org kurumsal dili + brief kuralları (metin uydurma yok, kapsam dışı modül yok)
   - **(c) Görsel kimlik sadakati** — renk paleti ve tipografi DESİL kimliğinden (brief §6) sapıyor mu
4. Feedback YAZILI kaydedilir (handoff.md veya QA raporu), revize yapılır, tekrar screenshot.
5. **Loop limiti: sayfa başına maksimum 2 revize turu.** 2 turda rubrik geçilmezse DURULUR, Beyar'a raporlanır.
6. Screenshot'lar CC'nin kendi değerlendirmesi içindir — Beyar'a gösterilmez; Beyar'a kısa YAZILI rapor verilir.

## Onay Kapıları

- Her wave sonunda DUR — Beyar localhost'ta gözle bakar, onay verir.
- Wave 1 (pilot index.html) onaylanmadan Wave 2 BAŞLAMAZ. Onay sonrası index'in token sistemi + shell'i kanonik referanstır (bkz. plan.md).
- **Commit/push SADECE Beyar'ın açık izniyle.** Onaysız repo oluşturma da yok.
- Commit mesajları İngilizce. Ayrı concern ayrı commit. Her commit öncesi staged dosyalar doğrulanır (`git status` + `git diff --staged`).

## Yasaklar

- Background polling loop YOK; GitHub Pages deploy polling YOK.
- Retina 2x çarpma YOK (screenshot ve asset boyutlarında).
- Kare görseller `<img>` ile DEĞİL — `div` + `background-image: cover; center` ile.
- gaviaworks.com'dan renk/font almak YASAK.
- Brief ve desil.org dışında içerik/metin uydurmak YASAK (tek istisna: aşağıdaki Demo İçerik Rejimi).
- Kapsam dışı modüller (üyelik, sertifika sorgulama, etkinlik başvurusu, üye paneli) YASAK.
- Etki sayaçlarında doğrulanmamış veri ("0+", uydurma rakam) YASAK — veri yoksa sayaç gizlenir.
- Ağır video, büyük arka plan animasyonu, performans düşüren efekt YASAK (sürdürülebilir web ilkesi).

## Demo İçerik Rejimi (R3+, Beyar direktifi 2026-07-05 — içerik uydurma yasağının TEK istisnası)

Eksik gerçek içerik DEMO ile tamamlanır — ileride admin panelden gerçekleriyle değiştirilecek. Kurallar:
- Demo metin kurumsal DESİL tonunda yazılır; lorem ipsum YASAK.
- İletişim bilgisi, gerçek kişi profili linki (sahte `linkedin.com/in/...` vb.), gerçek kurum adı/logosu ASLA uydurulmaz.
- Demo linkler işlevsizdir: `href="#"` + `aria-disabled="true"`; gerçek-görünümlü URL yazılmaz.
- desil.org'daki şablon placeholder'ları (ör. Danışma Kurulu'ndaki "Richards Mills") gerçek içerik DEĞİLDİR — asla taşınmaz.
- Kaynak içerik boşsa iki yol var: kurumsal tonlu demo içerik YA DA `empty-state` bloğu (components.md) — hangisinin kullanılacağı sayfa planında yazar (tasks/revize-plan-r3.md), teammate kendisi seçmez.
- Demo görsel alanları `media-ph` placeholder deseniyle kurulur (components.md) — gerçek görsel tek noktadan takılabilir olmalı.
