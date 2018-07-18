const { getPage } = require('../browser')
const generateQueries = require('../lib/generateQueries')


const browserSearch = async (author=null, title, translated, type, keywords=[]) => {

    const queries = generateQueries(author, title, translated, type, keywords)

    const regexp = translated ? `(${title}|${translated})` : title

    const piracyRegexp = require('../lib/piracyRegexp')(keywords)

    const makeQuery = async (query) => {
        const page = await getPage()

        let links

        try {
            await page.goto(`https://twitter.com/search?src=typd&q=${query}`)

            links = await page.evaluate(`(
                ${parseLinks}
            )('${author}', '${regexp}','${piracyRegexp}')`)
        } catch(e) {
            console.error('twitter: timeout errror' + e)
            page.close()
            return []
        }

        page.close()

        return links
    }

    const queryPromises = []
    for (let query of queries) {
        queryPromises.push(new Promise(async resolve => {
            try {
                const results = await makeQuery(query)
                resolve(results)
            } catch(e) {
                resolve([])
            }
        }))
    }

    const links = await Promise.all(queryPromises).then(results => {
        const links = []

        for(let set of results) {
            links.push(...set)
        }

        return [...new Set(links)]
    })


    return links

}

const parseLinks = `async (author=null, regexp, piracyRegexp) => {
    const listSelector = '#stream-items-id'
    const links = []

    const list = document.querySelector(listSelector)

    if(!list) return []

    let oldHeight = list.offsetHeight
    let newHeight = oldHeight
    
    window.scrollBy(0, newHeight)

        await (async () => {
            return new Promise(resolve => {
                setTimeout(() => resolve(), 500)
            })
        })()
    
    const tweets = Array.from(document.querySelectorAll('[data-permalink-path]'))

    for(let tweet of tweets) {

        if(tweet.textContent.search(new RegExp('http.*:\/\/', 'i')) === -1) continue

        if(!author && tweet.textContent.search(new RegExp(author, 'i')) === -1) continue

        if(tweet.textContent.search(new RegExp(regexp, 'i')) === -1) continue

        if(tweet.textContent.search(new RegExp(piracyRegexp, 'i')) === -1) continue
        
        const link = 'https://twitter.com' + tweet.getAttribute('data-permalink-path')
        
        links.push(link)
    }

    return links
}`


module.exports = {
    browserSearch
}