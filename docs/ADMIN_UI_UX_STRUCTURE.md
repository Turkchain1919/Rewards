# v0.5.1 — Admin UI/UX yapısı

Tarih:4Kasım2026. Sunucu **138.226.246.138**. TEST kökü `/var/www/rewards.turkscan.com/REWARDSTEST`; production kökü `/var/www/rewards.turkscan.com/rewards`. Geliştirme dalı `feature/admin-ui-ux-v051`; taban canlı commit `dc2e8ad61dbc51c457c7208febd9896b3b562266` (v0.5.0). Kesin yeni SHA `.runtime/validated.json` ve production `.runtime/deployment.json` üzerinden okunur.

## Kapsam ve korunan davranış

Bu sürüm yalnız frontend yerleşimi, navigasyon, form sunumu, hata metinleri ve release metadata değiştirir. API kaynakları, endpointler, Prisma şeması/15 migration, OAuth/OIDC, Telegram/BotAPI, reward engine/ledger, contractlar, RBAC/MFA ve ENV template aynıdır. Yeni bağımlılık yoktur. Backend request alanları ve methodları korunur. Root package sürümü0.5.1; workspace sürümleri aynı kalır.

Production'a yeni görev/kampanya/test verisi/ödül yazılmaz. Claims pause korunur; gerçek transfer açılmaz. Canlı veriler eski ilerleme kaydından varsayılmaz, yayın öncesi yedek/snapshot ile tekrar sayılır.3Kasım OWNER silme işlemlerinin tarihsel durumu CODEX_CONTEXT içindedir.

## Önceki ve yeni organizasyon

Önceki görünüm16yataydüğme/ayar sekmesi, her listeyle birlikte oluşturma formları, ayrı sosyal+klasik görev formları, bütün sayfalarda parola/oturum bölümleri içeriyordu.

Yeni görünüm dört menü grubudur: GENEL, OPERASYONLAR, ENTEGRASYONLAR, SİSTEM YÖNETİMİ. Sol menü→odaklanmış içerik ekranı, üst bar→breadcrumb/yenile/dil/tema/OWNER/MFA/profil/çıkış. Yeni görev tek girişten açılır; klasik seçenek aynı ekranın gelişmiş modudur. Parola, oturum ve MFA artık kendi Güvenlik ekranlarındadır.

Yetkiye göre menüler filtrelenir. OWNER güvenli ayar ve hesap yönetimini görür; ADMIN mevcut operasyonları; REVIEWER doğrulamalar ve kendi güvenlik ekranlarını görür. Navigasyon yetki vermez: mevcut sunucu RBAC/MFA kontrolü otoritedir.

## Gerçek sayfa yolları

Next route `/tr/admin` ve `/en/admin` olarak korunur. Alt ekranlar aşağıdaki URL fragmentleriyle (`#`) açılır. Yeni server route/API eklenmemiştir. Sayfa yenileme ve geri/ileri seçimi korur. Admin dil değişimi de fragmenti korur. Kullanıcı panelinin dil davranışı değişmez.

| URL eki | Başlık | Kullanılan mevcut modül | Görünüm/filtre |
|---|---|---|---|
| `/tr/admin#overview` | Genel bakış | `summary` | Liste/ana görünüm |
| `/tr/admin#users` | Kullanıcı listesi | `users` | Liste/ana görünüm |
| `/tr/admin#users/details` | Kullanıcı detayları | `users` | details |
| `/tr/admin#campaigns` | Tüm kampanyalar | `campaigns` | Liste/ana görünüm |
| `/tr/admin#campaigns/new` | Yeni kampanya | `campaigns` | new |
| `/tr/admin#campaigns/drafts` | Taslaklar | `campaigns` | drafts |
| `/tr/admin#campaigns/archive` | Arşiv | `campaigns` | archive |
| `/tr/admin#tasks` | Tüm görevler | `tasks` | Liste/ana görünüm |
| `/tr/admin#tasks/new` | Yeni görev oluştur | `tasks` | new |
| `/tr/admin#tasks/batch` | Toplu görev oluştur | `tasks` | batch |
| `/tr/admin#tasks/catalog` | Görev kataloğu | `catalog` | Liste/ana görünüm |
| `/tr/admin#verifications/pending` | Bekleyenler | `submissions` | PENDING |
| `/tr/admin#verifications/approved` | Onaylananlar | `submissions` | APPROVED |
| `/tr/admin#verifications/rejected` | Reddedilenler | `submissions` | REJECTED |
| `/tr/admin#verifications/history` | Doğrulama geçmişi | `submissions` | Liste/ana görünüm |
| `/tr/admin#rewards/balances` | Ödül bakiyeleri | `ledger` | balances |
| `/tr/admin#rewards/history` | Ödül hareketleri | `ledger` | history |
| `/tr/admin#rewards/budgets` | Bütçe yönetimi | `campaigns` | budgets |
| `/tr/admin#claims/requests` | Claim talepleri | `claims` | Liste/ana görünüm |
| `/tr/admin#claims/history` | İşlem geçmişi | `claims` | history |
| `/tr/admin#claims/status` | Claim durumu | `claim-status` | Liste/ana görünüm |
| `/tr/admin#social/api` | API bağlantıları | `settings/social-api` | Liste/ana görünüm |
| `/tr/admin#social/accounts` | Resmî sosyal hesaplar | `settings/social` | Liste/ana görünüm |
| `/tr/admin#social/status` | Platform durumları | `settings/social` | platforms |
| `/tr/admin#social/webhooks` | Webhook durumları | `settings/social-api` | webhooks |
| `/tr/admin#blockchain/networks` | Ağlar | `settings/blockchains` | Liste/ana görünüm |
| `/tr/admin#blockchain/rpc` | RPC / WSS | `settings/blockchains` | RPC |
| `/tr/admin#blockchain/contracts` | Akıllı kontratlar | `settings/blockchains` | Rewards |
| `/tr/admin#blockchain/configuration` | Ağ yapılandırması | `settings/blockchains` | General |
| `/tr/admin#settings/general` | Genel yapılandırma | `settings/configuration` | Liste/ana görünüm |
| `/tr/admin#settings/branding` | Marka & SEO | `settings/branding` | Liste/ana görünüm |
| `/tr/admin#settings/credentials` | API Credentials | `settings/credentials` | Liste/ana görünüm |
| `/tr/admin#settings/system` | Sistem parametreleri | `system` | Liste/ana görünüm |
| `/tr/admin#security/admins` | Yönetici hesapları | `accounts` | Liste/ana görünüm |
| `/tr/admin#security/roles` | Roller ve yetkiler | `roles` | Liste/ana görünüm |
| `/tr/admin#security/sessions` | Oturum yönetimi | `security` | sessions |
| `/tr/admin#security/password` | Parola değiştir | `security` | password |
| `/tr/admin#security/mfa` | MFA durumu | `security` | mfa |
| `/tr/admin#security/audit` | Denetim kayıtları | `audit` | Liste/ana görünüm |

Kullanıcı detayları mevcut kullanıcı listesi alanlarını salt okunur gösterir; yeni user detail backend işlevi yoktur. Roller ekranı mevcut rol modelini açıklar, rol düzenlemesi mevcut yönetici hesabı PATCH akışındadır. Claim durumu mevcut runtime konfigürasyonunun salt okunur görünümüdür. Ödül bakiyesi ledger endpointinin mevcut toplu bakiyesidir; yeni kullanıcı bazlı muhasebe API'si oluşturulmadı.

## Bileşenler

| Kaynak (TEST köküne göre) | Görev |
|---|---|
| apps/web/app/admin/navigation.ts | Menü grupları, yollar, rol bazlı görünürlük ve modül/filtre eşleme |
| apps/web/app/admin/shell.tsx |264px/72px sidebar, bağımsız scroll, hash seçimi, drawer/focus/Escape, topbar ve yerel tema |
| apps/web/app/admin/ui.tsx | Arama/sıralama/10kayıt client pagination, statusbadge, üçnokta işlemler ve wizard presentation |
| apps/web/app/admin/timezone-picker.tsx | Aranabilir IANA listbox/combobox; popüler Istanbul/UTC ve klavye desteği |
| apps/web/app/admin/admin.css | Admin'e scope edilmiş dark/light SaaS tasarım sistemi; kullanıcı sayfası CSS'ini değiştirmez |
| apps/web/app/admin/page.tsx | Mevcut login/bootstrap/MFA korunur; doğrulanmış oturum shell ve ayrı güvenlik ekranlarına geçer |
| apps/web/app/admin/modules.tsx | Eski operasyon form/payloadları; yeni odaklanmış listeler ve route görünüm eşlemesi |
| apps/web/app/admin/social-task-builder.tsx | Mevcut sosyal formun dört adımlı sunumu; exact aynı batch/draft/edit/publish API davranışı |
| apps/web/app/admin/social-api.tsx |8platform kartı; tek platform/OAuth/credentials/webhook/hesap sekmeleri; secret alanları password |
| apps/web/app/admin/social-management.tsx | Hesap listesi ve ayrı platform görünümü; katlanabilir metadata formu; eski araçlar korunur |
| apps/web/app/admin/settings.tsx | Mevcut ağ/RPC/kontrat ve marka form alanları odaklı accordion gruplarında |
| apps/web/app/admin/lifecycle.tsx | Mevcut etki/onay/dialog davranışı; silme düğmesine görsel tehlike stili |
| apps/web/app/i18n.tsx | Admin için opt-in hash korumalı dil değişimi; diğer tüketicilerin varsayılanı aynı |
| apps/web/app/translations.json | Yeni menü, yardım, durum ve hata metinlerinin TR/EN karşılıkları |

## Responsive ve erişilebilirlik

- Masaüstü >1024px:264px sabit sidebar,72px daraltılmış görünüm; ikonlar/tooltip erişilebilir adlarla korunur. Sidebar ve içerik bağımsız kayar.
- Tablet≤1024px ve mobil: hamburger, modal drawer, backdrop, Escape, focus trap/geri dönüş; arka içerik inert. Drawer kapalıyken linkler klavye sırasına girmez.
-≤600px: tek sütun form/grid, kompakt profil, yatay kaydırılabilir tablolar. Veri hücreleri sayfanın tamamını taşırmaz.
- Dark/light yalnız admin CSS değişkenleriyle, yerel tercihler `rewards-admin-theme` ve `rewards-admin-collapsed` içinde saklanır. Kimlik bilgileri/localStorage'a yazılmaz.
- Skip link, aria-current, aria-expanded/controls, tab/tabpanel, sort durumları, görünür focus, native dialog ve required validation korunur. Hareket azaltma tercihi desteklenir.
- Yeni logo oluşturulmadı; mevcut DynamicBrand ve mevcut sosyal simgeler kullanılır.

## Görev oluşturma akışı

1. Kampanya/platform/bağlı hedef/görev türü. Seçilen türden satır eklenir; tek görevde İleri bunu otomatik yapabilir. Toplu mod aynı mevcut max20batch davranışıdır.
2. TR/EN içerik ve hedefURL; mevcut API sahiplik çözümlemesi. Klasik mod mevcut talimat/manuel doğrulama alanlarını kullanır.
3. Ödül/kontenjan/bağımsız bütçe/tarihler ve sosyal görev için IANA. Varsayılan Europe/Istanbul,UTC/popüler seçenekler başta; diğerleri aramayla erişilir. Eski klasik formun açık UTC alanları ve aynı readDates davranışı korunur.
4. Kullanıcı kartı/policy/API kanıtı önizlemesi; mevcut taslak save. Publish ayrı mevcut butondur, policy/permission/backend şartları aynıdır.

Sosyal alanlar controlled state, klasik alanlar aynı mounted DOM formunda tutulur; adımlar sadece görünürlüğü değiştirir. Gizli sekme/step inputları disable edilmez. Alanlar adımlar arasında kaybolmaz; form/credentials değişimi veya sayfa yenilemesi kalıcı autosave değildir. Yeni draft server'a açık kaydetmeyle gönderilir.

Bütçe şeridi kalan kampanya bütçesi ve seçilen görev toplamını exact integerwei ile gösterir. Backend “Batch task budgets exceed remaining campaign budget” mesajı kullanıcı dostu TR/EN metne çevrilir; backend guardı değiştirilmez. Tablo sıralamasında dahi parasal değerler BigInt ile karşılaştırılır.

## Mevcut işlev eşlemesi

Eski summary→Genel bakış; users→Kullanıcı listesi/detay seçimi; campaigns→Tüm/Yeni/Taslak/Arşiv/Bütçe; tasks→Tüm/Yeni/Toplu/Katalog; submissions→4status görünümü; ledger→Bakiye/Hareket; claims→Talepler/İşlem; social-api→8kart+4sekme; officialaccounts→Hesaplar/Platformdurumu; blockchains→Ağ/RPC/Kontrat/Ayarlanmış grup; branding/configuration/credentials→Ayarlar; system→Servis+katlanabilirHero; audit/accounts→Güvenlik; password/sessions/MFA→kendi güvenlik sayfaları.

Eski ENVimport, tokenrefresh/disconnect/default/target seçimi, APItest, metadata registry, credentialrevocation, blockchainaktivasyon/test/config, HeroGIF yönetimi ve ledger event ayrıntısı erişilebilir kalır. Kullanılmayan backend özellikleri varmış gibi gösterilmez.

## Test sonuçları ve sınırlar

-53uygulama/API/TESTDB testi geçti; muhasebe/Telegram/ledger/limit regresyonları dahil.
- Mevcut8tarayıcı paketi yeni route/table/wizard seçicileriyle doğrulandı. Gerçek TESTDB lifecycle ve Hero testleri kapsamlı korunur; görev25/Instagram/credentials fixture testleri canlı provider kanıtı değildir.
- Yeni browser-admin-redesign:TR/EN×1440/834/390=6durum; bütün OWNER yolları masaüstünde, collapse/reload, drawer/Escape, arama/sıralama/pagination, sosyal+klasik exactpayload, state, IANA ve localizedbudgeterror. Admin mutasyonları intercept edilir.
- Desktop/tablet/mobile dark/light ekran görüntüleri `.runtime/admin-ui-v051/` altında; önceki canlı artefact aynı fixture veri biçimiyle salt okunur yakalandı. Görsellerdeki örnek sayılar production verisi değildir.
- İlk hızlı navigasyon testi, önceki modül verisinin yeni tabloda kısa süre kullanılmasını yakaladı; request sequencing/loaded module ile düzeltildi. İlk eski fixture seçicilerinin yeni required-step ve deep-link davranışına uyarlanması gerekti; başarısız ilk loglar saklandı. Bu hatalar production'a taşınmadı.
- Son temiz commit için build/typecheck/lint,9tarayıcı paketi,53uygulama ve10Foundry testi/audit/Prisma diff/secret gate tekrar çalıştırılır. Kesin sonuç `.runtime/validated.json` ve dış `ADMIN_UI_UX_RELEASE_REPORT.md`; yarım gate/deploy başarılı sayılmaz.

## Yayın ve rollback

Önce gerçek production backup+SHA ve ayrıDBrestore ile23tablo fingerprint eşleşmesi. UI deploy guardı apps/api/Prisma/contracts/ENVtemplate Git blobları ve compiledAPI dosyalarını birebir karşılaştırır; rootpackage dependency farkını reddeder. Production'da migration çalıştırılmaz, unit/Nginx config değiştirilmez. Aynı API/worker bytecode yalnız release metadata/artefact tutarlılığı için standart servis restartıyla korunur.

Current symlink yeni artefacta atomik geçer; publicAPI/frontend/PG/Redis/worker/claimpause/RBAC smoke ve23tablohash eşleşmesi gerekir. Kritik uygulama hatasında eski artefact+source/envReleaseSHA/manifest geri alınır, DBrestore/downgrade/ledgerdelete yapılmaz. GitHub main/tag sağlıklı manifestten sonra eşitlenir. Son SHA/backuphash ve deploy sonucu dış rapordadır.

## Değiştirilen dosyalar

Kesin tam liste `git diff --name-status dc2e8ad HEAD`. Başlıca dosyalar yukarıdaki bileşenler, ilgili9browser testleri, test-all.sh, rootpackage sürüm metadata ve bu doküman/context/changelog dosyalarıdır. Backend/schema/migration/contract dosyası değişikliği yoktur.
