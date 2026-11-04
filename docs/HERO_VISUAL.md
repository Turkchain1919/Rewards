# v0.5.2 — Kullanıcı talebi: yalnız otomatik GIF

Duraklat/başlat kutusu ve yazısı ana sayfa/yönetici önizlemesinden kaldırıldı. HeroMedia yalnız doğrudan img gösterir; canvas veya uygulama düzeyinde hareket azaltma/duraklatma mekanizması yoktur. GIF her iki motion tercihinde kaynak döngüsüyle otomatik oynar. Önceki aşağıdaki pause/canvas açıklamaları tarihseldir. Yeni kanıtlar .runtime/hero-autoplay-v052/ altında tutulur. Backend/DB/claims değişmez.

# Hero GIF doğal oran ve responsive düzen — v0.5.2

## İncelenen durum
Production taban commit d7beec7; sunucu138.226.246.138, TEST /var/www/rewards.turkscan.com/REWARDSTEST; production /var/www/rewards.turkscan.com/rewards. Önceki sürümün hareket azaltma tercihi canvas üzerinde sabit kare gösteriyordu; GIF bozulmuş değildi. Normal koşullarda doğrudan img zaten animasyon taşıyordu. Dairesel orb, object-fit:cover, border-radius:50% ve dekoratif arka plan yüklenen dosyaya uygulanıyordu. Admin önizlemesi de kare/dairesel kırpma yapıyordu.

## Gerçek dosya analizi
Public image/gif response;1737151byte;440×440;48kare;yaklaşık2330ms;NETSCAPE2.0 loop0 (sonsuz). URL SHA256 içeriğe göre değişir, ETag aynı hash, Cache-Control public,max-age=60,must-revalidate. Next Image/optimizasyon/CDN dönüşümü kullanılmıyor; orijinal DB BYTEA sunuluyor. RGB parlaklık eşiği12 ile ilk kare görünür sınırı [43,24,398,377], tüm patchlerin birleşimi [41,23,398,378] (sağ/alt hariç). Siyah dosya içi boşluklar korunur; CSS ile kesilmez. Bu eşik ölçümü semantik nesne segmentasyonu değildir.

## Yeni gösterim
apps/web/app/hero-media.tsx ana sayfa ve yönetici önizlemesinde ortak bileşendir. img width100%,heightauto,object-fitcontain; maxwidth440px; sıfır radius/border/clip/effect. Masaüstünde dengeli iki sütun, tablette uyarlanmış iki sütun,700px altında tek sütun. Kaynak GIF'in döngüsü değiştirilmez. Normal tercihte otomatik oynar; başlat düğmesi yoktur. Erişilebilir 'Animasyonu duraklat / Pause animation' checkboxı sabit canvas karesine geçer. Reduced-motion başlangıçta bu seçeneği açık tutar, kullanıcı isterse kapatabilir. Dosya yokken özgün yıldız/TURK fallback korunur; yüklenmiş GIF orb içine alınmaz.

## Yönetim ve cache
Mevcut upload/değiştir/kaldır/enable/state/MFA ve5MiB/1200×1200/300frame/60Mpixel güvenlik limitleri aynı backend ile korunur. Yayındaki görsel admin ekranında da ortak bileşenle önizlenir. Değiştirme sonrası yeni hash URL kullanılır; aynı sayfa customevent, diğer sekmeler localStorage timestamp, odağa dönüş görünürlük olayı güncel metadata getirir. Metadata no-store; orijinal asset byte ve cache header değiştirilmez.

## Test kanıtı
browser-hero-responsive.e2e.mts gerçek48kareli dosyayla img screenshot hashlerinin zaman içinde değişmesini, duraklatılmış canvasın sabitliğini,440px üst sınırını, doğal oranı ve daire/overflow olmamasını TR/EN1440/820/390 üzerinde doğrular. Chromium/Firefox/WebKit sunucuda; gerçek Chrome/Edge Windows üzerinde SSH TEST tüneliyle çalıştırılır. WebKit testi gerçek iOS/Safari cihaz testi değildir. Ayrı admin browser testi TEST üzerinde yükleme/değiştirme/hashyenileme/sekme senkronu/kaldırma/özgün tasarıma dönüş/APIrestart sonrası byte korumasını doğrular; production üzerinde yazma yapılmaz. Kesin sonuçlar .runtime/hero-responsive-v052/ dosyalarındadır.

## Yayın sınırı
Yalnız apps/web, tests,docs,test-all.sh. API/Prisma/dependency/kontrat değişikliği veya migration yok. Production yedeği restore edilerek23tablo hashleriyle karşılaştırılır; yayın öncesi/sonrası tüm23tablo aynı kalmalıdır. Claims paused ve gerçek transferler kapalıdır. Önceki immutable release rollback için korunur. Yeni görev/kampanya/ödül oluşturulmaz.
