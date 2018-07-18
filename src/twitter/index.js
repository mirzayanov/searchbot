
const { browserSearch } = require('./methods')

const twitter = async ({author=null, title, translated=null, type, keywords=[]}) => {

    try {
        const results = await browserSearch(author, title, translated, type, keywords)

        return results
    } catch (e) {
        console.error('twitter: error' + e)
        return []
    }
}

module.exports = twitter