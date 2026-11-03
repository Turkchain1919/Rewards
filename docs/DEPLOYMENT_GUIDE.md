# TEST ve PRODUCTION deployment / operasyon rehberi

## v0.5.0 güncel kapsam — 3 Kasım 2026

Kaynak dalı `feature/multi-social-rewards-engine`; önceki canlı sürüm `3c85ac1a29b51d86d74d1fe7cc847ee391f7a4c0` (v0.4.5). Aşağıdaki eski envanterler tarihsel kanıttır; güncel modüller ve sınırlar bu bölüm ile sosyal dokümanlarda açıklanır. Çalışan tam SHA, `.runtime/deployment.json` ve `.runtime/validated.json` üzerinden doğrulanır; bu dosyanın bulunduğu commit kendi hashini içermez. Yayın sonucu [PRODUCTION_RELEASE_REPORT.md](PRODUCTION_RELEASE_REPORT.md).

8 platform ve 65 görev tanımı vardır. Katalogda bulunması gerçek API bağlantısı veya ödüllü yayın izni değildir. X/YouTube teşvikli etkileşimleri politika nedeniyle kapalı; Meta/TikTok normal ticari API yetenekleri sınırlı; Kick/Twitch ödüllü etkileşimleri izin incelemesi olmadan kapalıdır. Sadece mevcut Telegram üyelik doğrulaması ve açıkça yapılandırılacak özel bot kanıtları uygulanmıştır. Hiçbir yeni canlı görev/kampanya otomatik oluşturulmaz. Tekrarlanabilir görevler reddedilir. Claim ve gerçek transferler kapalıdır.

Mevcut Telegram görevi kullanıcı başına **1 TURK**, **25 kullanıcı**, ortak kampanya **25 TURK** bütçesidir; 10 TURK eski taslaktır. Üç kampanya/dört görev korunur. `REWARD_CLAIMS_PAUSED=true`; master ödeme yetkisi tanımsızken etkin değer false olur. Telegram GROUP `-1003676977941` string olarak korunur. Gizli değerler dokümantasyona yazılmaz.

Güncel yayın için kullanıcı TEST→kontrollü production altyapı dağıtımını onaylamıştır; aşağıdaki tarihsel “ayrıca onay” cümleleri önceki çalışma kapsamıdır. Yeni production görevi/ödülü/transferi bu onaya dahil değildir.

1. Ortak `/root/frontend/.codex/session.lock` flock, temiz feature commit ve güncel handoff doğrulanır.
2. `bash infrastructure/scripts/validate-release.sh`: build/typecheck/lint/API+DB+browser+Foundry/audit/migrationdiff/secret gate; başarılı SHA `.runtime/validated.json`.
3. `REWARDS_TARGET=/var/www/rewards.turkscan.com/rewards bash infrastructure/scripts/backup-database.sh` gerçek mevcut komut; custom dump/SHA saklanır, geçici DB'ye restore ve15. migration prova edilir. Kaynak script isimleri `infrastructure/scripts` altında kontrol edilir; sırları shell çıktısına basmayın.
4. `bash infrastructure/scripts/deploy-production.sh` doğrulanmış TESTcommitinden immutable artifact, eklemeli migrate, current symlink/servis/health; önceki artifact korunur.
5. `bash infrastructure/scripts/check-health.sh` varsayılanTEST; production için REWARDS_TARGET=/var/www/rewards.turkscan.com/rewards doğru common.sh hedefiyle çalıştırılır. PublicHTTPS+Redis+PG+worker ve eski sütun hashleri ayrıca kontrol edilir.
6. `bash infrastructure/scripts/sync-github.sh`: sağlıklı deploymentmanifesti doğrulanır, main/tag gönderilir. Rapor runtimekanıtlarından tamamlanır.

Rollback: önce yeni SOCIAL_API/katalog/bağımsızbütçeli görevlerin eski engine altında ödül vermesini engelleyin; sonra önceki immutable artifacte dönüp servisleri restart/health kontrol edin. Eklemeli migration geri alınmaz, ledger silinmez, eski DBdump çalışan DB üzerine körlemesine restore edilmez. Yeni task türlerini eski engine tanımaz. Bu yayında otomatik yeni production görev oluşturulmadığından eski Telegram görevi aynen korunur. Production `.env` gerçek içerikleri rapora eklenmez.

Worker aynı systemd unitinde iki BullMQ queue kullanır: maintenance15s, social-credentials5min; Twitch credential başına55min RedisTTL, geçici providerhatasında5min retry. Auth heartbeat ayrı worker olduğundan token kontrolü canlılık sinyalini bloke etmez. Twitch401 gerçek kimlikle eşleşen credential versionını yeniden kontrol ederek reauth ve görevpasifleştirme yapar.

---

## Önceki sürüm envanteri (tarihsel)


> **2026-11-03 güncel çalışma:** Önceki 10 TURK taslağı yerine kullanıcı 1 TURK × ilk25 kullanıcı / toplam25TURK ve TEST sonrası productionyayınını onayladı. Güncel plan ve doğrulama koşulları [REWARD25_RELEASE_READINESS](REWARD25_RELEASE_READINESS.md), tam payload [TELEGRAM_REWARD25_TASK.json](TELEGRAM_REWARD25_TASK.json), Instagram açıklaması [INSTAGRAM_READINESS](INSTAGRAM_READINESS.md). Aşağıdaki bilgiler önceki snapshot olabilir; çalışanSHA ve gerçekyayınsonucu dış PROJECT_HANDOFF.md/deploymentmanifest esas alınarak doğrulanır.

Doğrulama anı: 2026-11-02T22:34:00.042Z. Production sürümü: **0.4.5 / `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`**. Bu doküman TEST dalında hazırlanmıştır; bu çalışmada production kodu/verisi/configuration değiştirilmez. Yollar sunucu `138.226.246.138` üzerindedir. Gerçek ENV/credential değerleri açıklanmaz.

## Doğrulanan ortam ayrımı

| Özellik | TEST | PRODUCTION |
|---|---|---|
| Kaynak | /var/www/rewards.turkscan.com/REWARDSTEST | /var/www/rewards.turkscan.com/rewards |
| Çalışan kod | /var/www/rewards.turkscan.com/REWARDSTEST | /var/www/rewards.turkscan.com/rewards/current → .releases/cc61b966bf684ad2f602b36100c3bf1de7f4d0a7 |
| APP_ENV | test | production |
| Web | 127.0.0.1:18190 | 127.0.0.1:18191 |
| API | 127.0.0.1:18290 | 127.0.0.1:18291 |
| Nginx giriş | http://127.0.0.1:18480 (SSH tunnel) | https://rewards.turkscan.com:443; HTTP80→HTTPS |
| Database | rewards_test / PostgreSQL14 127.0.0.1:5432 | rewards_production / aynı PostgreSQL14 ayrı DB/rol |
| Redis | 127.0.0.1:18390 DB0, /var/lib/rewards-test | 127.0.0.1:18391 DB0, /var/lib/rewards-prod |
| OS user/group | rewards-test | rewards-prod |
| ENV | /var/www/rewards.turkscan.com/REWARDSTEST/.env | /var/www/rewards.turkscan.com/rewards/.env |
| Unit prefix | rewards-test-{api,web,worker,redis} | rewards-prod-{api,web,worker,redis} |
| Claims | paused; master false | paused; master false |
| Proxy config | /etc/nginx/sites-available/rewards-test-loopback.conf | /etc/nginx/sites-available/rewards.turkscan.com |
| SSL | Loopback HTTP; ayrı TEST domain/sertifika yok | /etc/letsencrypt/live/rewards.turkscan.com/fullchain.pem ve privkey.pem; key içeriği okunmaz |
| Log kökü | /var/www/rewards.turkscan.com/REWARDSTEST/logs | /var/www/rewards.turkscan.com/rewards/logs |

Bu işte değişiklikler yalnız TEST kaynaklarına yapılır. Production DB, konfigürasyon, servis ve migration değişikliği ayrıca onay gerektirir. TEST'ten production DB/Redis URL kullanmayın; APP_ENV tek başına bağlantı izolasyonu sağlamaz. common.sh APP_ENV/REWARDS_TARGET ve claims pause eşleşmesini denetler.

TEST tarayıcı origin'i tam `http://127.0.0.1:18480` olmalıdır; strict Origin kontrolü nedeniyle `http://localhost:18480` aynı kabul edilmez. Yetkili SSH aracıyla yerel18480→sunucu127.0.0.1:18480 tüneli açın. Public domain TEST değildir.

## Gerçek servisler / process manager

Rewards için systemd kullanılır; PM2 yoktur. Sunucuda Docker kuruludur fakat Rewards isimli çalışan container veya proje Docker Compose dosyası bulunmadı. Başka projelerin Docker containerlarına dokunmayın.

| Unit | Çalışma dizini / komut | Durum |
|---|---|---|
| rewards-test-api.service | /var/www/rewards.turkscan.com/REWARDSTEST; node apps/api/dist/main.js | active (envanter anı) |
| rewards-test-web.service | /var/www/rewards.turkscan.com/REWARDSTEST; node node_modules/next/dist/bin/next start apps/web -H 127.0.0.1 | active (envanter anı) |
| rewards-test-worker.service | /var/www/rewards.turkscan.com/REWARDSTEST; node apps/api/dist/worker.js | active (envanter anı) |
| rewards-test-redis.service | Redis config: /etc/rewards-test-redis.conf | active (envanter anı) |
| rewards-prod-api.service | /var/www/rewards.turkscan.com/rewards/current; node apps/api/dist/main.js | active (envanter anı) |
| rewards-prod-web.service | /var/www/rewards.turkscan.com/rewards/current; node node_modules/next/dist/bin/next start apps/web -H 127.0.0.1 | active (envanter anı) |
| rewards-prod-worker.service | /var/www/rewards.turkscan.com/rewards/current; node apps/api/dist/worker.js | active (envanter anı) |
| rewards-prod-redis.service | Redis config: /etc/rewards-prod-redis.conf | active (envanter anı) |

Unitler `/etc/systemd/system/` altında; kaynak üretici `infrastructure/scripts/install-services.py`. EnvironmentFile ortam kökündeki .env; `ProtectSystem=strict`, `ProtectHome=true`, `NoNewPrivileges=true`, private tmp ve sınırlı runtime/log yazma yolları uygulanır. Redis unitleri ayrı config/AOF dizini kullanır. PostgreSQL14 `postgresql@14-main.service` ve meta `postgresql.service` aktiftir; 16-main/5433 da sunucuda mevcut fakat Rewards onun üzerinde değildir. Nginx tek ortak servistir; plansız restart başka projeleri etkileyebilir.

## Salt okunur kontroller

```bash
systemctl is-active rewards-test-api rewards-test-web rewards-test-worker rewards-test-redis
systemctl is-active rewards-prod-api rewards-prod-web rewards-prod-worker rewards-prod-redis
systemctl status rewards-prod-api --no-pager
pg_lsclusters
/usr/lib/postgresql/14/bin/pg_isready -h 127.0.0.1 -p 5432
curl --fail --silent https://rewards.turkscan.com/api/health
curl --fail --silent http://127.0.0.1:18480/api/health
```

Health DataService; DB Campaign/Ledger query, Redis PING, worker:heartbeat yaş<45sn denetler. Sistem health yanıtı claimsPaused=true sabit de döndürür; tek başına env/runtime/network ödeme kilitlerinin tümünün kanıtı saymayın. Ayrı etkin config ve env flags okunmalıdır.

## TEST geliştirme ve doğrulama

Aşağıdaki komutlar TEST hedefindedir; production tokenlarını yüklemeyin. Ortak kaynak mutasyon kilidi `/root/frontend/.codex/session.lock`, `flock -n`; kaynak değişiminden önce Git/AGENTS/bağlamı okuyun.

```bash
cd /var/www/rewards.turkscan.com/REWARDSTEST
source infrastructure/scripts/common.sh
load_env
npm ci
npx prisma generate
npm run typecheck
npm run lint
npm run build
systemctl restart rewards-test-api rewards-test-web rewards-test-worker
RUN_INTEGRATION=true npm test
PLAYWRIGHT_BROWSERS_PATH="$PWD/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-telegram-validation.e2e.mts
```

`test-all.sh`: TypeScript/lint, PostgreSQL/Redis/HTTP testleri, hero/lifecycle/earning-guide/yeni Telegram validation browsers, Foundry, npm audit ve migrate status. Browser tools `.runtime/browser-tools/node_modules/playwright`, Chromium `.runtime/browsers` altında önceden kuruludur; package.json Playwright devDependency içermez. Foundry PATH'i common.sh ayarlar.

`validate-release.sh` temiz Git ağacı ister; prisma generate + optimize build/runtime metadata guard + TEST restart/full suite + TEST migrate deploy/diff + secret scan yapar ve `.runtime/validated.json` SHA marker üretir. Bu komut **TEST DB'sine migration uygulayabilir**. Mevcut validation işinde schema değişmediği için yeni migration gerekmez; production migrate yapılmaz.

## Servis yönetimi — komutlar dokümantasyondur

TEST işlemi:

```bash
systemctl stop rewards-test-api rewards-test-web rewards-test-worker
systemctl start rewards-test-api rewards-test-web rewards-test-worker
systemctl restart rewards-test-api rewards-test-web rewards-test-worker
```

Production için yalnız ayrıca onaylı bakım penceresinde aynı komutların `rewards-prod-*` karşılıkları kullanılır. Redis'i durdurmak auth/OAuth/worker'ı bozar; PostgreSQL veya Nginx'i sıradan frontend güncellemesi için yeniden başlatmayın. Bu dokümanda production restart komutu gösterilmesi çalıştırma onayı değildir.

## Nginx ve SSL gerçek farkları

Production `/api/`→18291, `/`→18191; TLS1.2/1.3, client_max_body_size6m, safe log format `$uri` kullanır (OAuth code/state query loglanmaz). TEST18480→18290/18190 loopback. Repo `infrastructure/nginx/rewards-test.conf` client_max_body_size6m içerirken canlı TEST `rewards-test-loopback.conf` bu satırı içermiyor. Büyük GIF upload'larında TEST proxy default sınırı devreye girebilir; eşitliği varsaymayın. Bu işte proxy değiştirilmedi.

SSL yolları sertifika referanslarıdır, private key içeriği raporlanmaz. `check-ssl.sh` sertifika/TLS erişimini sınar. certbot.timer active/enabled ve sonraki planlı zaman Tue2026-11-03 06:48:06UTC olarak doğrulandı; public sertifika CN=rewards.turkscan.com, issuer Let’s Encrypt YE1, bitiş Jan29 2027 13:47:37GMT. Gerçek renewal zorlanmadı; gelecekte yenileneceği garanti edilmez.

## Yedekleme ve restore

Kaynak `backup-database.sh` hedef ENV'den parolayı bellekte alır, `umask077` ile backups/*.dump üretir, PostgreSQL14 pg_dump -Fc ve pg_restore --list doğrular. Gerçek restore kanıtı ayrıca ayrı boş DB'de yapılmalıdır; list kontrolü restore drill ile aynı şey değildir. Önceki v0.4.5 rollout'ta gerçek ayrı DB restore+migration drill kanıtı var; bu çalışmada production restore yapılmaz.

```bash
# TEST yedeği
cd /var/www/rewards.turkscan.com/REWARDSTEST
bash infrastructure/scripts/backup-database.sh
# Production yedeği: ayrıca onaylı operasyon, mevcut çalışmada çalıştırılmaz
REWARDS_TARGET=/var/www/rewards.turkscan.com/rewards bash infrastructure/scripts/backup-database.sh
```

`restore-database.sh` yalnız hedef backups altındaki dump'ı ve `REWARDS_RESTORE_CONFIRM=$APP_ENV` değerini kabul eder; boş dedicated DB bekler, API/worker durdurulmalıdır. Yanlışlıkla canlı DB üzerine restore yapmayın. Parola/DB URL'yi komut satırına veya loga yazmayın.

## Production promotion — bu çalışma için yasak, gelecekte ayrıca onay gerekir

`deploy-production.sh` shared flock alır ve `deploy-production.py` çağırır. Temiz/validated exact TEST SHA, en az2GiB boş alan, release henüz yok kontrolü; Git archive ile immutable release + doğrulanmış node_modules/API dist/Next .next kopyası, production DB yedeği, production source ff-only, additive migration, runtime RELEASE_SHA, systemd install, atomic current switch/restart, health+Nginx+publicTLS; önceki release previous symlink olarak saklanır. Manifest `.runtime/deployment.json`.

```bash
# Yalnız açık production deployment onayı sonrası:
bash infrastructure/scripts/validate-release.sh
bash infrastructure/scripts/deploy-production.sh
REWARDS_TARGET=/var/www/rewards.turkscan.com/rewards bash infrastructure/scripts/check-health.sh
bash infrastructure/scripts/check-ssl.sh
bash infrastructure/scripts/sync-github.sh
```

`sync-github.sh` healthy source/current/manifest eşleşmeden main/tag push etmez; fast-forward ancestry kontrol eder, force push yok. Tag formatı `v<version>-<sha8>`. Bu işte yeni branch GitHub main'e gönderilmez; yayın onayı beklenir.

Rollback aracı `rollback-production.sh` previous artifact/current symlink değiştirip üç uygulama servisini restart eder ve health sınar; source HEAD/manifest/ENV ve DB migration uyumluluğunu otomatik tamamen geri almaz. Deploy Python try/rollback bloğu runtime switch sonrası hataları kapsar; backup/source merge/migrate gibi try öncesi hatalarda kısmi hazırlık kalabilir. Kritik hatada durun, gerçek current/Git/manifest/schema durumunu inceleyin; otomatik rollback'in her adımı tamamladığını varsaymayın. Additive v0.4.5 migration için önceki uygulama geriye uyumludur; ledger silen down migration kullanılmaz.

`prune-artifacts.py` yalnız healthy+GitHub-synced manifest halinde current/previous dışı generated release'leri kaldırır. Kullanıcı DB, yedek, aktif rollback veya secretları disk açmak için silmeyin. Kaynak scriptlerin kendileri gerçek dosyalardır; README'de geçen ama repo içinde olmayan komutları icat etmeyin.

## Script haritası

| Tam yol | İşlev |
|---|---|
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/backup-database.sh | Target DB pg_dump14 custom + pg_restore list. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/build-test.sh | Prisma generate, API/web optimize build; robots/sitemap runtime-origin guard. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/check-health.sh | API+public campaigns+web root/dashboard/admin loopback probes. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/check-services.sh | Servis kontrol aracı; prod/test hedefini source belirler. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/check-ssl.sh | Production TLS/SSL probe. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/common.sh | Hedef/env yükleme ve APP_ENV/claims guard; PATH Foundry. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/deploy-production.py | Immutable artifact/migration/atomic switch/health/manifest. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/deploy-production.sh | Shared flock + Python deployment entry. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/install-services.py | systemd api/web/worker units üretir/daemon-reload; production için onaylı işlem. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/progress.py | Operasyon notlarına replace ile ekleme; AGENTS fsync şartı için fsync yapan atomik writer kullanılmalı. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/promote-to-production.sh | deploy-production.sh alias. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/provision.py | Initial isolated users/directories/Redis/ENV provisioning; tekrar çalıştırmadan source ve mevcut sunucuyu karşılaştır. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/prune-artifacts.py | Current/previous dışı generated release temizleme. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/restore-database.sh | Explicit target confirmation + empty DB restore. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/rollback-production.sh | Previous app symlink restore + health; DB/source metadata manuel değerlendirilir. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/scan-secrets.py | Git index/tracked içerik secret/path regex taraması; untracked dosya taranmış sayılmaz. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/setup-production.sh | Production ilk kurulum wrapper; ayrı onay gerektirir. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/setup-server.sh | Root yetkisi ve gerekli araçların varlığını kontrol eder; kurulum yapmaz. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/setup-test.sh | TEST bootstrap. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/ssh-check.sh | SSH_CONNECTION dolu ve hostname bridge kontrolü; kendisi SSH bağlantısı açmaz. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/sync-github.sh | Healthy production main/tag fast-forward push ve manifest sync. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/test-all.sh | TEST full application/browser/contracts/audit/migration status. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/validate-release.sh | Clean exact SHA release gate ve validated marker. |

## Log ve kayıt yolları

`/var/www/rewards.turkscan.com/REWARDSTEST/logs/{api,web,worker}.log` ve `.error.log`; production karşılığı `/var/www/rewards.turkscan.com/rewards/logs/`. Nginx `/var/log/nginx/rewards.access.log`, `rewards.error.log`, `rewards-test.access.log`; PostgreSQL14 `/var/log/postgresql/postgresql-14-main.log`. Redis unitleri journal kullanır. Hassas log içeriğini rapora olduğu gibi kopyalamayın. İlerleme kaydı her önemli işlem sonrası ve en geç5dk atomik fsync+replace; shared session flock kuralına uyun.

## İlave ortam farkı: ağ kimliği

Her iki ortam chain1919/TURK18 mainnet kullanır; TEST bir testnet değildir. TEST public config networkKey=`turkchain`, production networkKey=`network-1919`. DB/Redis/user/session/credential alanları yine ayrıdır. Production campaign/network IDlerini TEST API body'sine kopyalayarak çalıştırmayın; CURRENT_STATUS taslağı production için review-only'dir. Gerçek wallet transaction'ı TEST UI üzerinden dahi ana zincire gidebilir; bu işte yapılmadı.
