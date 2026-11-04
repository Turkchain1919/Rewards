# v0.5.2 — Mobil cüzdan, dil ve GIF düzeltmesi

Production sunucusu: 138.226.246.138. TEST: /var/www/rewards.turkscan.com/REWARDSTEST; production: /var/www/rewards.turkscan.com/rewards.

## Doğrulanan nedenler ve değişiklikler

Harici mobil tarayıcıda yüklü MetaMask, window.ethereum sağlamaz. Mobil bağlantı düğmesi, sağlayıcı yoksa resmî https://link.metamask.io/dapp/ bağlantısıyla aynı sitenin yerelleştirilmiş dashboard sayfasını MetaMask tarayıcısında açar. Mevcut EIP-1193/SIWE giriş isteği korunur. Bağlantı hazırlığı, kullanıcı reddi ve iptal durumları görünürdür. WalletConnect yapılandırması değiştirilmez. Yönlendirmeye mevcut sorgu/hash veya kimlik doğrulama verileri eklenmez.

Next.js kalıcı kök layout içinde dil bağlamı eski sunucu prop değerinde kalıyordu. Bağlam artık pathname ve kullanıcının anlık seçimini izler; header bağlantıları, metinler ve html lang yenilenmeden güncellenir. Geri/ileri navigasyonu korunur.

Production GIF dosyası yükleniyordu; reduced-motion CSS kuralı resmi gizliyordu. Hareketi azalt ayarında artık GIF'in canvas üzerinde sabit karesi görünür; kullanıcı isterse oynatabilir. Orijinal dosya değiştirilmez. Odak/sekme görünürlüğü ve yönetici güncellemesi sonrası metadata yenilenir; kaldırılmış GIF temizlenir. Sekmeler arası değişiklik bildirimi localStorage üzerinden yalnızca zaman damgası taşır.

## Dosyalar

apps/web/app/{wallet.tsx,wallet-connection.ts,i18n.tsx,site-header.tsx,layout.tsx,hero.tsx,style.css,translations.json}; apps/web/app/admin/hero-visual.tsx; tests/{mobile-wallet.test.ts,browser-mobile-locale-hero.e2e.mts}; infrastructure/scripts/test-all.sh; package.json; package-lock.json ve ilgili dokümantasyon. Tam yollar yukarıdaki TEST/production köklerine göre çözülür.

## Testler ve sınırlar

3 saf yardımcı testi; 14 tarayıcı senaryosu: TR/EN anlık dil ve geçmiş, Android/iOS harici tarayıcı bağlantısı, masaüstü/mobil simüle EIP-1193 sağlayıcısıyla gerçek TEST SIWE, reddetme/iptal ve GIF normal/reduced-motion gösterimi. Mock sağlayıcı, gerçek fiziksel MetaMask uygulaması testi değildir. Native uygulamanın açılması Android/iOS cihaz üzerinde son kullanıcı kontrolü gerektirir. Production üzerinde kullanıcı oluşturulmaz veya ödül verilmez.

## Güvenlik ve yayın

API, Prisma, kontratlar, dependency sürümleri ve OAuth/SIWE protokolü korunur. Migration yoktur. Claims paused ve gerçek transferlerin kapalı olması yayın öncesi/sonrası denetlenir. Production yedeği ayrı veritabanında restore edilip tüm tablo hashleri karşılaştırılır. Önceki immutable release ve özel env yedeğiyle rollback hazırlanır. Kesin gate/yayın sonuçları runtime mobile-locale-v052 kanıtlarında ve son raporda tutulur; tamamlanmamış işlemler başarılı sayılmaz.

## Resmî kaynaklar

- https://support.metamask.io/configure/wallet/how-to-use-the-metamask-mobile-browser/
- https://github.com/MetaMask/metamask-docs/blob/main/metamask-connect/evm/guides/metamask-exclusive/use-deeplinks.md
