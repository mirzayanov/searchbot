
const {  httpSearch } = require('./methods')

const fb = async ({author=null, title, translated=null, type, keywords=[]}) => {

    try {
        // const results = await browserSearch(author, title, translated, type, keywords)
        const results = await httpSearch(author, title, translated, type, keywords)

        return results
    } catch (e) {
        console.error('fb: error' + e)
        return []
    }
}

module.exports = fb