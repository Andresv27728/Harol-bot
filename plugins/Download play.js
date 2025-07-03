import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `❀ Por favor, ingresa el nombre o link del video.`, m);
    }

    let videoIdToFind = text.match(youtubeRegexID) || null;
    let ytplay2 = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : text);

    let video = ytplay2.all?.[0] || ytplay2.videos?.[0];
    if (!video) {
      return m.reply('✧ No se encontraron resultados para tu búsqueda.');
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = video;
    const vistas = formatViews(views);
    const canal = author?.name || 'Desconocido';

    const infoMessage = `\`\`\`◜ YouTube - Descarga ◞\`\`\`\n
≡ *🌴 Título:* ${title}
≡ *🍓 Canal:* ${canal}
≡ *🍬 Vistas:* ${vistas}
≡ *🍨 Duración:* ${timestamp}
≡ *🥯 Publicado:* ${ago}
≡ *🪸 Link:* ${url}`;

    const thumb = (await conn.getFile(thumbnail))?.data;
    const JT = {
      contextInfo: {
        externalAdReply: {
          title: 'Comando de prueba xd',
          body: 'Usando la API de SoyMaycol (NightAPI)',
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    };

    await conn.reply(m.chat, infoMessage, m, JT);

    if (['play', 'ytmp3', 'playaudio'].includes(command)) {
      try {
        const api = await (await fetch(`https://nightapi.is-a.dev/api/ytaudio?url=${encodeURIComponent(url)}&format=mp3`)).text();
        await conn.sendMessage(m.chat, { audio: { url: api }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
      } catch (e) {
        return conn.reply(m.chat, '⚠︎ No se pudo enviar el audio. Puede ser por el peso o un error en la API.', m);
      }
    }

    if (['play2', 'ytmp4', 'mp4'].includes(command)) {
      try {
        const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=480p&apikey=GataDios`);
        const json = await res.json();
        if (!json?.data?.url) throw 'Enlace de video no generado';
        await conn.sendFile(m.chat, json.data.url, `${title}.mp4`, title, m);
      } catch (e) {
        return conn.reply(m.chat, '⚠︎ No se pudo enviar el video. Puede ser por el peso o un error en la API.', m);
      }
    }

  } catch (err) {
    console.error(err);
    return m.reply(`⚠︎ Ocurrió un error inesperado: ${err}`);
  }
};

handler.command = ['play', 'ytmp3', 'play2', 'ytmp4', 'playaudio', 'mp4'];
handler.tags = ['descargas'];
handler.help = ['play', 'ytmp3', 'play2', 'ytmp4', 'playaudio', 'mp4'];

export default handler;

function formatViews(views) {
  if (!views) return "No disponible";
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`;
  return views.toString();
}
