import fetch from 'node-fetch';
import yts from 'yt-search';

let handler = async (m, { conn: star, args, usedPrefix, command }) => {
  if (!args || !args[0]) {
    return star.reply(
      m.chat,
      `✦ *¡Ingresa el texto o enlace del vídeo de YouTube!*\n\n» *Ejemplo:*\n> *${usedPrefix + command}* Canción de ejemplo`,
      m
    );
  }

  await m.react('🕓');

  try {
    let query = args.join(' ');
    let isUrl = query.match(/youtu/gi);

    let video;
    if (isUrl) {
      let ytres = await yts({ videoId: query.split('v=')[1] });
      video = ytres.videos[0];
    } else {
      let ytres = await yts(query);
      video = ytres.videos[0];
      if (!video) {
        return star.reply(m.chat, '✦ *Video no encontrado.*', m).then(() => m.react('✖️'));
      }
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = video;

    let api = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`);
    let json = await api.json();
    let { data } = json;

    if (!data || !data.dl) {
      return star.reply(m.chat, '✦ *Error al obtener el enlace de descarga desde la API.*', m).then(() => m.react('✖️'));
    }

    let { dl: downloadUrl, size: sizeHumanReadable } = data;

    let txt = `➪ Descargando › *${title}*\n\n`;
    txt += `> ✩ Canal › *${author.name}*\n`;
    txt += `> ⴵ Duración › *${timestamp}*\n`;
    txt += `> ☄︎ Vistas › *${views}*\n`;
    txt += `> ☁︎ Publicado › *${ago}*\n`;
    txt += `> ❑ Enlace › *${url}*\n`;

    await star.sendFile(m.chat, thumbnail, 'thumbnail.jpg', txt, m);

    // Convertimos duración a minutos
    let durationMinutes = 0;
    if (timestamp.includes(':')) {
      let parts = timestamp.split(':').map(Number).reverse();
      durationMinutes = parts[0] / 60 + (parts[1] || 0) + (parts[2] || 0) * 60;
    }

    // Lógica para tipo de mensaje
    let isShort = durationMinutes <= 11;
    let type = isShort ? 'video' : 'document';

    await star.sendMessage(
      m.chat,
      {
        [type]: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      },
      { quoted: m }
    );

    await m.react('📄');
  } catch (error) {
    console.error(error);
    await m.react('✖️');
    star.reply(m.chat, '✦ *Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.*', m);
  }
};

handler.command = ['play11', 'play2'];
export default handler;
