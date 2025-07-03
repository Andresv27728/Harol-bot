
import fetch from 'node-fetch';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import { ogmp3 } from '../lib/youtubedl.js';
import { savetube } from '../lib/yt-savetube.js';
import { yta, ytv } from '../lib/y2mate.js';

const supportedPlatforms = {
  youtube: {
    regex: /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|v\/|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/,
    name: "YouTube"
  },
  tiktok: {
    regex: /^(?:https?:\/\/)?(?:www\.|vm\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
    name: "TikTok"
  },
  facebook: {
    regex: /^(?:https?:\/\/)?(?:www\.|m\.|web\.|facebook\.)?(?:facebook|fb)\.(?:com|watch)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-.]*\/)*([\w\-.]*)/,
    name: "Facebook"
  }
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`✧ Uso correcto: ${usedPrefix + command} <url>\n\n📌 Ejemplo: ${usedPrefix + command} https://youtube.com/watch?v=123456`);
  }

  const url = args[0];
  let platform = null;

  // Detect platform
  for (const [key, value] of Object.entries(supportedPlatforms)) {
    if (value.regex.test(url)) {
      platform = key;
      break;
    }
  }

  if (!platform) {
    return m.reply('❌ URL no soportada. Las plataformas soportadas son: YouTube, TikTok y Facebook');
  }

  await m.reply(`🔍 Detectando: ${supportedPlatforms[platform].name}\n⌛ Procesando solicitud...`);

  try {
    let result = null;
    const startTime = Date.now();

    switch (platform) {
      case 'youtube':
        const apis = [
          {
            name: 'SaveTube',
            fn: async () => {
              const data = await savetube.download(url, '720');
              return data.result;
            }
          },
          {
            name: 'Y2Mate',
            fn: async () => {
              const data = await ytv(url);
              return data;
            }
          },
          {
            name: 'OGMp3',
            fn: async () => {
              const data = await ogmp3.download(url, '720', 'video');
              return data.result;
            }
          }
        ];

        for (const api of apis) {
          try {
            result = await api.fn();
            if (result) {
              await m.reply(`✅ Descargando usando API: ${api.name}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        break;

      case 'tiktok':
        // Implement TikTok download APIs here
        break;

      case 'facebook':
        // Implement Facebook download APIs here
        break;
    }

    if (!result) {
      throw new Error('No se pudo procesar con ninguna API disponible');
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const estimatedSize = result.size || 'Desconocido';
    
    const infoMsg = `
🎥 *Título:* ${result.title || 'No disponible'}
⏱️ *Tiempo de proceso:* ${processingTime}s
📦 *Tamaño estimado:* ${estimatedSize}
🌐 *Plataforma:* ${supportedPlatforms[platform].name}
    `.trim();

    await m.reply(infoMsg);

    // Send the video
    await conn.sendFile(
      m.chat,
      result.download || result.url || result.link,
      `video.mp4`,
      `🎥 *${result.title || 'Video'}*\n🌟 *Calidad:* ${result.quality || '720p'}`,
      m
    );

  } catch (error) {
    console.error(error);
    m.reply(`❌ Error: ${error.message || 'Ocurrió un error desconocido'}`);
  }
};

handler.help = ['play5 <url>'];
handler.tags = ['downloader'];
handler.command = ['play5'];
handler.diamond = true;

export default handler;
