// node scripts/voice.mjs текст.txt VOICE_ID   -> media/voice.mp3 + media/words.json (время каждого слова)
// Ключ ElevenLabs берётся из файла .env: ELEVENLABS_API_KEY=...  (ключ никому не показывать)
import fs from 'fs';
const [file, voice] = process.argv.slice(2);
const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
const key = process.env.ELEVENLABS_API_KEY || (env.match(/ELEVENLABS_API_KEY=(.+)/) || [])[1]?.trim();
if (!key || !file || !voice) { console.error('Нужно: файл .env с ELEVENLABS_API_KEY, текст и voice_id'); process.exit(1); }
const text = fs.readFileSync(file, 'utf8').trim();
const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
  method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 } }),
});
if (!r.ok) { console.error('ElevenLabs ответил ошибкой:', r.status, await r.text()); process.exit(1); }
const j = await r.json();
fs.mkdirSync('media', { recursive: true });
fs.writeFileSync('media/voice.mp3', Buffer.from(j.audio_base64, 'base64'));
const { characters: ch, character_start_times_seconds: st } = j.alignment;
const words = []; let cur = null;
ch.forEach((c, i) => {
  if (/[\s]/.test(c)) { cur = null; return; }
  if (!cur) { cur = [c, +st[i].toFixed(2)]; words.push(cur); } else cur[0] += c;
});
fs.writeFileSync('media/words.json', JSON.stringify(words.map(([w, t]) => [w.toLowerCase().replace(/[.,!?;:«»"()…—–-]+$/g, ''), t]), null, 0).replace(/\],\[/g, '],\n['));
console.log(`Готово: media/voice.mp3, слов: ${words.length}`);
