# Initial administrator and MFA
Open https://rewards.turkscan.com/admin. The setup form is available only while no administrator exists. Retrieve the single-use bootstrap secret over the owner's existing trusted SSH session from /var/www/rewards.turkscan.com/rewards/.runtime/admin-bootstrap.txt (mode0600). Do not paste the secret into chat, URLs, Git or logs. Choose your email and a unique password of at least 14 characters. The first administrator receives OWNER; subsequent accounts may be ADMIN or REVIEWER.

Login with email/password, enroll a TOTP authenticator using the displayed setup secret/otpauth link, then submit the current six-digit code. Protected administration requires MFA. Codes are single-use per time step; sessions are hashed at rest, expire after one hour, are rotated after MFA, can be listed/revoked, and roles are checked against the live database on every request.

OWNER manages administrator accounts, ADMIN manages campaigns, REVIEWER reviews submissions. MFA secret and social credentials are encrypted using independent environment keys. Keep private environment backups; changing DATA_ENCRYPTION_KEY without migrating ciphertext makes stored secrets unreadable. Production has no default administrator or default password.

TEST has independent bootstrap/encryption values and database. Automated fixtures never create a production administrator.
