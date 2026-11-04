export function telegramError(message:string){const messages:Record<string,string>={
'Link your Telegram account in the user dashboard before verification':'Telegram hesabınızı yeniden bağlayın, ardından üyeliğinizi doğrulayın.',
'Telegram could not verify membership right now; retry later':'Telegram şu anda üyeliği doğrulayamıyor. Biraz sonra yeniden deneyin.',
'Join the Telegram group or channel, then try again':'Önce Telegram grubuna veya kanalına katılın, sonra yeniden doğrulayın.',
'Telegram membership task is not available':'Bu Telegram görevi şu anda kullanılamıyor.',
'Social provider not configured':'Telegram bağlantısı şu anda yapılandırılmamış.',
};return messages[message]||message;}
