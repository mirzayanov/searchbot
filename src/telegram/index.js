const { search } = require('./methods')
const {add} = require('./channels-searcher')

const bot = async ({author=null, title, translated=null, type, keywords=[], channels_keywords = []}) => {

    let regexp = (translated ? `(${title}|${translated})` : title).replace(' ', '.*')

    regexp = `[^a-zA-Zа-яА-ЯёЁ]${regexp}[^a-zA-Zа-яА-ЯёЁ]`

    add([...keywords, ...channels_keywords])

    const links = await search(regexp, author, type)

    return links
}

module.exports = bot