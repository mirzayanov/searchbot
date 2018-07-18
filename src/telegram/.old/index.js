const { searchChannels, searchPosts } = require('./methods')

const bot = async ({author=null, title, translated=null, type, keywords=[]}) => {

    const config = require('../../config')

    const botKeywords = config.get(`keywords:${type}`) || []
    const commonKeywords = config.get('keywords:common')

    const keys = [...new Set([
        author ? author : title,
        title,
        translated ? translated: title,
        type,
        ...botKeywords,
        ...commonKeywords,
        ...(keywords)])
    ]

    const channels = await searchChannels(keys)

    const posts = await searchPosts({author, title, translated, type, keywords}, channels)

    delete require.cache[require.resolve('../../config')]
    return posts
}

module.exports = bot