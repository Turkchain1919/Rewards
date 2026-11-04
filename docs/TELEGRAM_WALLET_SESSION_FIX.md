# v0.5.3 — Telegram kimliği, mobil cüzdan ve yönetici oturumu

Sunucu138.226.246.138. TEST /var/www/rewards.turkscan.com/REWARDSTEST; production /var/www/rewards.turkscan.com/rewards. Taban96455ac. Kesin yayın sonucu .runtime/telegram-flow-v053/ altındaki kanıtlarla doğrulanır.

## Gerçek teşhis
Production saltokuma BotAPI: getMe/getChat başarılı, resmî @Turkchain1919 supergroup ve bot administrator. Kullanıcının bağlı hesabının20haneli providerAccountId değeri BotAPI getChatMember'da400invaliduser_idspecified oluşturdu. Kod JWT sub değerini BotAPI user_id sanıyordu. Resmî OIDC tokenında sub farklı subject, profile scope id ise gerçek Telegram kullanıcı ID'sidir. İki doğrulama başlangıcı,0submission görüldü; bu tanı için reward endpointi çağrılmadı veya bakiye değiştirilmedi.

## Kimlik düzeltmesi
providers.ts yalnız JWT imza/iss/aud/exp/iat/nonce doğrulaması tamamlandıktan sonra profile.id kullanır. telegram-identity.ts pozitif52bit integer güvenli string üretir; missing/float/negatif/overflow reddedilir. Eski yanlış kimlik DB'de deployment tarafından değiştirilmez. SocialAccounts DTO reconnectRequired ve REAUTH_REQUIRED döndürür; kullanıcı aynı cüzdan oturumunda Telegram hesabını yeniden bağlayarak gerçek id'yi doğrulatır. Engine geçersiz eski kimliği BotAPI çağrısından önce reddeder. İmzalı legacy subject için geçmiş SocialRewardIdentity rezervasyonu bulunursa yeniden eşleme otomatik ödül imkânı yaratmaz: fail-closed manuel inceleme gerekir. Hiçbir ledger/rezervasyon silinmez. Mevcut canonical-ID ödülleri/idempotency/bütçe kilitleri aynı kalır.

## Telegram bağlantıları
telegram-target.tsx görev ve resmî hesapta doğrudan tg://resolve?domain=Turkchain1919, TelegramWeb alternatifi ve HTTPS grup URL kopyalama sunar. Uygulama protokolünün OS tarafından açılması web sitesi tarafından zorlanamaz. OAuth Telegram sayfasında uygulama açılmazsa QR/telefon seçeneği ve işlemi başlatan tarayıcıya dönüş anlatılır. Third-party Telegram consent ekranı değiştirilmez, OAuth state/PKCE/binder/nonce güvenliği gevşetilmez. Üyelik hataları anlaşılır TR/EN metinlere çevrilir; bağlantı ve üyelik iki ayrı adımdır.

## Mobil cüzdan
Önceki /dapp/ linki Rewards'ı MetaMask webview içine açıyordu; cookie ve oturum Chrome/Safari ile paylaşılmaz. Mevcut WalletConnect kapalıydı, public projectID ise32hex ve gerçek relayURI üretimi doğrulandı. Aynı tarayıcı akışı WalletConnect ile çalışır: site bulunduğu sekmede kalır; kullanıcı metamask://wc?uri=... ile uygulamada bağlantıyı ve ardından personal_sign isteğini onaylar, başladığı tarayıcıya döner. UniversalProvider namespaces+optionalNamespaces birleşimi personal_sign iznini kaybediyordu; tek namespace tanımı ve onaylanmış signing permission denetimi bunu düzeltir. eth_sendTransaction/typed-data izni istenmez. İmzalı gerçek SIWE server verification değişmez. Oturum farklı tarayıcıya kopyalanmaz; query/state/signature dapp linkine taşınmaz. Desktop injected/EIP6963 yolu korunur. Native fiziksel Android/iOS MetaMask açılışı otomatik test değildir; relay testinde gerçek relay ve simüle wallet kullanılır.

## Yönetici oturumu
auth.ts MFA tamamlanmış yeni yönetici oturumunu7gün DB expiry ve kalıcı HttpOnly cookie ile üretir. ÖnMFA oturumu1saat; kullanıcı cüzdan oturumu24saat değişmez. Süre MFA girişinden itibaren sabittir; her sayfada sonsuza uzamaz. Var olan kısa çerezleri geriye dönük değiştirmez; bir sonraki başarılı MFA girişinden sonra7gün geçerlidir. Logout/revoke/disabledadmin/DBexpiry/rol denetimleri korunur. Kritik işlemlerde5dakikalık OWNER step-up MFA aynı kalır. Cookie production Secure, SameSite Strict, Path / olarak kalır; token localStorage'a yazılmaz.

## Test ve yayın kuralları
Gerçek signedJWT sub!=id testleri; yanlış aud/iss/nonce/signature/missingID/52bitrange reddi; TEST API adminMFA604800sCookie/7günDBexpiry; eskiTelegramID için externalAPI çağrılmadan reconnect; canonicalBotID ile ledger teködül regression. Tarayıcı session storageState bellekte restore edilir, DBexpiry/logout/stepup denenir. WalletConnect realrelay/simulatedwallet/realTESTSIWE ile aynı sekme ve transaction izni olmaması test edilir. Telegram hedef native/Web/kopya ve TR/EN desktop/mobile doğrulanır.

Production öncesi restore provası ve tablohash snapshot alınır. Prisma/schema/dependency/kontrat korunur; migration yapılmaz. Gerekli WalletConnect flag değişikliği yalnız aktif BlockchainNetwork.config.walletConnectEnabled alanında, version artışı ve audit ile uygulanır; chain/RPC/claim/bütçe değişmez. Kullanıcı/kampanya/görev/ledger kayıtları deployment tarafından değiştirilmez. Claims paused ve gerçek transferler kapalı tutulur. Kesin sonuç raporu tamamlanmış test/yayın kanıtlarına dayanır.

## Kaynaklar
- https://core.telegram.org/bots/telegram-login (sub ve id token örneği, JWT doğrulaması)
- https://core.telegram.org/api/links#public-username-links
- https://github.com/MetaMask/metamask-mobile (wc deeplink işleyicisi)
- Kurulu @walletconnect/universal-provider setNamespaces uygulaması ve ConnectParams type tanımı incelendi; varsayılan isim alanlarının opsiyonellerle birleşmesi gerçek relay testinde sınandı.
