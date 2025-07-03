
let handler = async (m, { conn, usedPrefix, command }) => {
    let commandsByCategory = {}

    // Get all plugins with help and tags
    let plugins = Object.values(global.plugins).filter(p => p.help && p.tags)

    // Group commands by category
    for (let plugin of plugins) {
        let help = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
        let tags = Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]

        for (let tag of tags) {
            if (!commandsByCategory[tag]) commandsByCategory[tag] = []
            commandsByCategory[tag].push(...help.map(h => usedPrefix + h))
        }
    }

    //Adding specific commands manually
    if (!commandsByCategory['Descargas']) commandsByCategory['Descargas'] = []
    commandsByCategory['Descargas'].push(usedPrefix + 'play5 <url/texto>')

    if (!commandsByCategory['Buscadores']) commandsByCategory['Buscadores'] = []
    commandsByCategory['Buscadores'].push(usedPrefix + 'videosearch <texto>')

    if (!commandsByCategory['Agenda']) commandsByCategory['Agenda'] = []
    commandsByCategory['Agenda'].push(usedPrefix + 'agendar <evento | fecha | hora | descripción>')
    commandsByCategory['Agenda'].push(usedPrefix + 'veragenda')

    // Create menu text
    let text = `
╔══════ ≪ °❈° ≫ ══════╗
║    🦈 TIBURÓN BOT 🦈
╚══════ ≪ °❈° ≫ ══════╝

⎔ Creator: Yo soy yo
⎔ Commands: ${plugins.length}
`

    // Add categories and their commands
    for (let category in commandsByCategory) {
        text += `
┌──⭓ *${category.toUpperCase()}*
${commandsByCategory[category].map(cmd => `│⭔ ${cmd}`).join('\n')}
└───────────⭓`
    }

    text += `\n\n✦ Use ${usedPrefix}help <command> for detailed info`

    // Send the menu
    conn.reply(m.chat, text.trim(), m)
}

handler.help = ['allmenu']
handler.tags = ['main']
handler.command = ['allmenu']
handler.register = true

export default handler
