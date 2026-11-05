# Kullanıcı sosyal ödül merkezi — v0.5.5

5 Kasım 2026. Taban: v0.5.4 `b3f49f017d271a7e1bf80f086688ab7c2cfdd884`. İstekteki v0.5.3 başlığına rağmen daha yeni mevcut sürüm korunmuştur. Dal: `feature/user-dashboard-hub`.

## Kapsam ve dosyalar

Kaynak TEST: `/var/www/rewards.turkscan.com/REWARDSTEST`; canlı kaynak: `/var/www/rewards.turkscan.com/rewards`. Aşağıdaki yollar bu köklere göredir:

| Dosya | İşlev |
|---|---|
| `apps/web/app/dashboard/page.tsx` | Ortak TR/EN dashboard girişinden UserHub açar. |
| `apps/web/app/dashboard/hub.tsx` | Oturum, sekmeler, platform seçimi, görev kartları/sihirbazı, geçmiş, ledger ve hesap kaldırma onayı. |
| `apps/web/app/dashboard/hub-model.ts` | Bağlantı durumu, allowlist navigasyon ve BigInt ödül özeti. |
| `apps/web/app/dashboard/hub.css` | Yalnız kullanıcı merkezi için responsive ve erişilebilir görünüm. |
| `apps/web/app/wallet.tsx` | Auth olayında profil yenileme ve yeniden monte edilmiş bileşende runtime provider üzerinden güvenli çıkış; SIWE yöntemleri değişmez. |
| `apps/web/app/dashboard/earning-guide.tsx` | İsteğe bağlı açılan rehber; giriş yapmış kullanıcı için ilk cüzdan adımı gizlenir. |
| `apps/web/app/dashboard/telegram-target.tsx` | Grup açma: uygulama protokolü, Telegram Web, doğrudan HTTPS ve kopyalama. Başarısız olabilecek uygulama geçişinde alternatif açıklaması. |
| `apps/web/app/translations.json` | Yeni TR/EN arayüz metinleri. |
| `apps/api/src/management.ts` | Var olan `GET /api/me/history` task projection'ına yalnız `platform` ekler. |
| `tests/user-hub.test.ts` | Hassas muhasebe özeti, bağlantı durumu ve navigasyon allowlist testleri. |
| `tests/browser-user-hub.e2e.mts` | Kontrollü API fixture'larıyla sekmeler, bağlantı kaldırma, doğrulama hatası/başarısı, responsive ve geçmiş. |

Mevcut wallet, SIWE, WalletConnect, Claims, BotTask ve sunucu doğrulama servisleri kullanılır. Şema, migration, güvenlik yetkileri, görev/ödül kuralları ve kontratlar değiştirilmez. Eski `board.tsx`, `social.tsx`, `official.tsx` arşivlenmiş kaynak olarak kalır; yeni ortak sayfa bunları monte etmez. Aynı işlemler hub içinden mevcut API'lere bağlanır.

## Navigasyon

`/tr/dashboard` ve `/en/dashboard`. Fragment örnekleri:

- `#view=tasks&platform=TELEGRAM`
- `#view=tasks&platform=TELEGRAM&task=<id>&step=2`
- `#view=history&platform=TELEGRAM`
- `#view=ledger&platform=TELEGRAM`
- `#view=account&platform=TELEGRAM`

Bunlar yeni backend rotaları değildir. Browser history geri/ileri desteklenir. Platform, bölüm, görev ID ve adım aynı sekmede kullanıcı ID'siyle adlandırılmış sessionStorage alanında tutulur; OAuth dönüşünde geri yüklenir. Token, imza, proof, credential ve OAuth state bu alana yazılmaz. Çıkışta özel veriler temizlenir. Görev kanıtı yalnız React belleğindedir; sayfa yenilenince silinir.

## Görünüm

Giriş öncesi MetaMask/WalletConnect seçenekleri mevcut Wallet bileşenindedir. SIWE başarılı olduğunda görev paneli açılır. Üst bölüm profil, kısaltılmış adres, seçili ağ/chain ve site oturumu durumunu gösterir. Bu durum fiziksel cüzdanın canlı bağlantısını iddia etmez. Profil düzenleme, çıkış ve yeniden bağlama Hesap ayarları sekmesindedir. Wallet bileşeni tek instance olarak monte edilir; diğer sekmelerde HTML hidden ile gizlenir. Böylece sağlayıcı referansı gezinmede kaybolmaz. Runtime provider çıkışta yedek referanstır. Auth olayında kullanıcı verisi yeniden alınır, eski özel panel verileri temizlenir. İlk giriş yönlendirmesi profil kesinleştiğinde yapılır; geç dönen görev verisi seçili sekmeyi geri çeviremez.

Sekiz kart: X, YouTube, Instagram, Telegram, Facebook, TikTok, Kick, Twitch. Geniş masaüstü 8, tablet 4, mobil 2 sütundur. Diğer eski eğitim/manual görevleri ayrı Diğer görevler seçimiyle erişilebilir. Yalnız seçili platformun görevleri ve resmî hesapları gösterilir. Resmî hesaplar daraltılmış ayrıntıda kalır; sihirbaz açıldığında hedef bağlantısı yalnız sihirbazda görünür.

Bağlantı durumları CONNECTED / CONNECTION_AVAILABLE / NOT_CONFIGURED / CONNECTION_EXPIRED / ERROR. Kullanıcı oturumu yoksa yapılandırma uydurulmaz. Telegram'da kısa ömürlü OAuth tokenının bitmesi kalıcı, doğrulanmış Bot API kimliğini geçersiz saymaz; `reconnectRequired` hâlâ zorunlu yeniden bağlantıdır. API eksik platform otomatik bağlı veya doğrulanabilir gösterilmez.

## Üç adım

1. Hesap bağlantısı: mevcut görevin doğrulama türü gerektiriyorsa sosyal bağlantı aranır. Manual görevlerin mevcut sunucu kuralları değiştirilmez.
2. Görevi tamamla: gerçek `localizedContent`, `verification.instructions`, URL ve koşullar gösterilir. Uydurma görev veya ödül miktarı eklenmez. Uygulama/grup açma hesap OAuth bağlantısından ayrıdır.
3. Doğrula: Telegram üyeliği `/api/tasks/:id/verify-telegram`, bot görevi mevcut challenge/verify, manual görev `/submit` üzerinden işler. Manual başvuru ödül değildir. Başarı yalnız yeniden alınan sunucu geçmişindeki onaylı ödülle gösterilir; HTTP 200 veya kullanıcı beyanı tek başına kazanım kanıtı değildir.

Görev tarih/bütçe/kontenjan durumları mevcut backend yanıtlarından alınır. Asıl atomik sınırlar ve tek ödül koruması sunucuda kalır. UI ek ödül yaratmaz.

## Bakiye anlamları

`PENDING`, `AVAILABLE`, `RESERVED`, `CLAIMED` korunur. İncelenen `claims.ts` mevcut ledger satırını AVAILABLE → RESERVED → CLAIMED olarak taşır; bu durumlar birbirini dışlar. Toplam kazanılan = AVAILABLE + RESERVED + CLAIMED; PENDING dahil değildir. Hesap `BigInt` ile wei cinsinden yapılır; gösterim `formatUnits` kullanır. Ledger ve claim ayrıntıları ayrı sekmede; claim butonunun mevcut pause koşulu korunur. Gerçek transfer etkinleştirilmez.

## Telegram masaüstü incelemesi ve sınırlar

Kullanıcı Chrome + Telegram Desktop yüklü ortam bildirdi. Kaynakta hesap bağlama `window.location.assign` ile aynı sekmede standart OIDC yönlendirmesidir; Rewards Telegram widget popup veya `postMessage` kullanmaz. Canlı sayfada COOP/CSP başlıkları bulunmadı; bu kurallar kanıt olmadan değiştirilmedi. PKCE, state, binder cookie, nonce ve JWT doğrulaması korunur.

Gerçek `oauth.telegram.org` ekranında uygulama devam seçeneği sonrası QR alternatifi açıldı ve sayfa açık kaldı. Bu inceleme gerçek sağlayıcı sayfasını kullanır, fakat test kullanıcısının rızası ve başarılı callback içermez. Sunucudan ilk `t.me` tarayıcı denemesi zaman aşımına uğradı. Gerçek Windows Chrome 156 testinde telefonla OIDC giriş formu, resmî grup sayfası ve Telegram Web giriş sayfası açıldı; gerçek hesap onayı yapılmadı. Aynı Chrome testinde uygulama devri/QR alternatifi tamamlanmadı (`tg:` isteği ERR_ABORTED); headless testin kullanıcıdaki fiziksel Desktop ortamıyla aynı olduğu varsayılmaz. İlk Chrome sağlayıcı selector denemesi Türkçe ekran/İngilizce selector farkıyla timeout verdi ve düzeltildi; gerçek Desktop protokolü/OS ilişkilendirmesi burada test edilemez. Dolayısıyla kullanıcının gördüğü kısa süreli pencerenin kesin kök nedeni **henüz kanıtlanmadı**. Uygulama kodunda popup kapanması bulunduğu veya fiziksel Desktop sorununun çözüldüğü iddia edilmez.

Uygulama açılmazsa sağlayıcının QR/telefon seçeneği, grup için Web ve doğrudan t.me alternatifleri açıkça gösterilir. Telegram Web girişten sonra hedef fragmentini kaybediyorsa Rewards'taki hedef bağlantısına tekrar basılması anlatılır. Sistem sağlayıcının sayfasına gizli/undocumented parametre eklemez ve güvenliği düşürmez.

Resmî kaynak: [Telegram Login / OIDC](https://core.telegram.org/bots/telegram-login). Sağlayıcı belgesi popup COOP uyarısını JS kütüphanesi için belirtir; mevcut uygulamanın full-page akışına otomatik kök neden olarak uygulanmaz.

## Test / yayın kanıtı

Çalışma kanıtları: TEST `.runtime/user-hub-v055/`. Mock doğrulama testleri gerçek Telegram onayı, native uygulama geçişi veya gerçek ödül dağıtımı gibi raporlanmaz. İlk browser başlatımı API restart sonrası erken çalışarak 502 aldı; readiness beklemesi eklendi. İlk yeni browser testi Next route announcer nedeniyle iki `alert` buldu; selector kullanıcı merkeziyle sınırlandı. Gözlenen başarısız denemeler `.runtime/user-hub-v055/failed-attempts.json` içinde özetlenir; önceki tam stdout loglarının üzerine sonraki çalıştırmalar yazılmıştır. Son çalıştırma logları ayrıca tutulur. Tam mobile/SIWE regresyonu ayrıca geç data yönlendirmesinin hesap sekmesini kapatmasını buldu; otomatik yönlendirme giriş kesinleşme anına taşındı ve test yeniden çalıştırıldı.

Production yayını ancak testler ve yedek/restore/parmak izi kontrolleri tamamlanınca yapılır. Son durum/commit deployment manifesti ve dış handoff ile doğrulanmalıdır. `REWARD_CLAIMS_PAUSED=true` kalır. Production'da test login, görev doğrulama veya ödül dağıtımı yapılmaz.

## Son tamamlanan TEST kontrolleri

- Tam test-all:63/63 uygulama testi, atlama yok;17 browser çalıştırması;10/10 Foundry kontrat testi.
- TypeScript, lint ve build başarılı; npm audit0;15 migration güncel.
- Gerçek Chrome156 ve Edge157:TR/EN,1440/820/390 boyutlarında yeni hub için altışar fixture senaryosu başarılı.
- Gerçek WalletConnect relay + simüle cüzdan + gerçek TEST SIWE geçti; native telefon uygulaması doğrulanmış sayılmaz.
- Gerçek Telegram kullanıcı onayı/callback ve fiziksel Desktop açılışı test edilmedi.
- Yeni hub Chromium, Firefox ve WebKit: her biri TR/EN ve1440/820/390 için6/6 senaryo başarılı. İlk Firefox denemesi testin401 tamamlanmasını beklememesi/geri gezinme zamanlaması nedeniyle başarısız oldu; gerçek401 ve URL geri dönüşü beklenerek tekrar geçti.
- Tam test-all sonrasında iki küçük UI koruması eklendi: kesirli adımın tam sayıya normalize edilmesi ve eski kazanımın task.history projectionından gösterilmesi. Ardından final kaynakla TypeScript/lint,63 uygulama testi, build ve üç engine panel testleri tekrar geçti. Değişmeyen API/kontrat/admin kaynakları için önceki tam paket kanıtı korunur.
