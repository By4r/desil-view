---
name: handoff
description: "Oturum kapanışı: seçici commit + push + handoff güncelle"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Oturum Kapanışı (handoff)

DESİL projesi (desil-view) oturum kapanış akışı: bu oturumda çalışılan dosyaları seçici olarak
commit'le, origin/main'e push'la, `tasks/handoff.md`'yi güncelle, kapanış raporu ver.

**Önemli ilke:** Beyar bu skill'i çağırdığında commit + push izni verilmiş sayılır; ayrıca izin
sorulmaz. (CLAUDE.md'deki "commit/push sadece açık izinle" kuralının açık izni budur.)

## ADIM 1 — DURUM DOĞRULAMA

1. `git status --short` ve `git diff --stat` çıkar.
2. Bu oturumda çalışılan dosyaları belirle; stage'e SADECE onları al. **ASLA `git add -A` veya
   `git add .` kullanma** — dosyaları tek tek adıyla ekle.
3. **Exclude listesi (bu projeye özgü; bu path'ler ASLA commit'e girmez):**
   - `tasks/` klasörünün tamamı — `handoff.md`, `lessons.md`, `plan.md`, `research.md`,
     `qa-report-index.md`, `assets-manifest.md` ve sonradan eklenen her tasks dosyası
     (gitignore kuralı: `tasks/`)
   - `docs/screenshots/` altındaki her şey — QA screenshot'ları (gitignore kuralı: `docs/screenshots/`)
   - `.DS_Store` (her dizinde)
   - `scratch/`, `scratchpad/` klasörleri ve `*.tmp` dosyaları
   - Bunlar gitignore'da; yine de stage sonrası listede görünürlerse stage'den çıkar ve nedenini
     raporla (gitignore bozulmuş demektir).
4. Oturumda DOKUNULMAYAN local değişiklikler unstaged bırakılır — başkasının/başka oturumun işi
   karışmaz. **İstisna:** önceki oturumdan stage'de bırakılmış ama commit'lenmemiş değişiklik
   (yarım kalmış handoff) bulursan bunu raporla ve bu akışta commit'leyerek kapat.
5. Farklı concern'lere ait değişiklikler AYRI commit'lere bölünür (gerekirse `git add -p` ile
   hunk ayır). Örnek: içerik düzeltmesi ile token/CSS değişikliği aynı commit'e girmez.

## ADIM 2 — COMMIT + PUSH

1. Push ÖNCESİ staged listeyi çıktıya yaz: `git diff --cached --stat`. Exclude listesinden dosya
   sızmadığını burada gözle doğrula.
2. Commit mesajı: İngilizce, açıklayıcı, kişisel isim yok. Ayrı concern ayrı commit.
3. `git push origin main`.
4. Push SONRASI doğrula: `git status --short --branch`. Çıktıda `[ahead N]` görünüyorsa push
   tamamlanmamıştır — tekrar dene. **"origin ile senkron" ifadesi ancak bu doğrulama temiz
   çıkınca yazılır.**
5. **BLOKE FALLBACK:** `git commit` veya `git push` izin sınıflandırıcısı tarafından bloke edilirse:
   - Stage'i BOZMADAN bırak (staged liste hazır kalsın — sonraki oturum ADIM 1.4 istisnasıyla kapatır)
   - Kapanış raporunda **"Commit: BLOKE"** başlığı altında Beyar'ın kendisinin çalıştıracağı
     komutları TAM ve kopyalanabilir halde ver (`git commit -m '...'` ve `git push origin main`)
   - Push doğrulama adımını "Beyar push sonrası `git status --short --branch` ile senkron kontrol
     etmeli" notuyla Beyar'a devret
   - `tasks/handoff.md`'ye bloke durumunu ve bekleyen komutları işle
   - Bloke, skill'in geri kalan adımlarını (ADIM 3 handoff güncelleme, ADIM 4 rapor) İPTAL ETMEZ —
     onlar normal devam eder

## ADIM 3 — HANDOFF GÜNCELLE

`tasks/handoff.md`'yi güncelle (tasks klasörü gitignore'lu; handoff COMMIT'LENMEZ — bu skill'de
sabit kural):

- **En üste** yeni giriş: tarih + oturum özeti (dosya bazında kısa) + bu oturumun commit hash'leri.
- Öğrenilen kritik teknik detay/tuzak varsa yaz; **kalıcı nitelikteyse `tasks/lessons.md`'ye de
  ekle** (her teammate üretim öncesi okur).
- Bekleyen işler + sıradaki adım.
- Local server / test / QA durumu (ör. localhost:8000 kapandı mı, hangi screenshot seti güncel).
- Güncel durum üste; tarihi geçmiş BİTEN maddeleri temizle, hâlâ geçerli kalıcı notları koru.

## ADIM 4 — KAPANIŞ RAPORU

Kısa rapor:

- Commit hash'leri + hangi dosyalar girdi
- Push durumu — senkron doğrulamalı (ADIM 2.4 çıktısına dayanarak)
- Handoff güncellendi onayı
- Bekleyen işler

Sonunda **"Artık clear atabilirsin."** de ve HİÇBİR yeni işe başlama.
