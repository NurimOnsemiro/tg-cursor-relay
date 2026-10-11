const http = require('node:http');
const { TG_SECRET, TARGET_URL, CURSOR_AUTH, PORT = 10000 } = process.env;
const BOT = 'gshong33_bot';
http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') return res.end('ok');
  if (req.method !== 'POST' || req.url !== '/tg') { res.statusCode = 404; return res.end(); }
  if (!TG_SECRET || req.headers['x-telegram-bot-api-secret-token'] !== TG_SECRET) { res.statusCode = 401; return res.end(); }
  let body = '';
  req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
  req.on('end', () => {
    res.end('ok');
    let u; try { u = JSON.parse(body); } catch { return; }
    const m = u.message || u.edited_message;
    if (!m) return;
    const text = m.text || m.caption || '';
    const hit = text.toLowerCase().includes('@' + BOT) || m.reply_to_message?.from?.username === BOT;
    console.log('update', m.chat && m.chat.type, 'hit', hit, 'auth', !!CURSOR_AUTH);
    if (!hit || !TARGET_URL || !CURSOR_AUTH) return;
    fetch(TARGET_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: CURSOR_AUTH }, body })
      .then(r => console.log('forwarded', r.status)).catch(e => console.error('forward failed', e.message));
  });
}).listen(PORT, () => console.log('listening', PORT));
