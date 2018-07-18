const request = require('request-promise-native')
const cheerio = require('cheerio')
const qs = require('querystring')

const generateQueries = require('../lib/generateQueries')
const queue = require('../lib/queue')
const splitOnParts = require('../lib/splitOnParts')

// const piracyRegexp = require('../lib/piracyRegexp')()

const urls = [
    'https://www.facebook.com/search/str/query/keywords_search',
    // 'https://www.facebook.com/search/posts/?q=query'
    // 'https://www.facebook.com/search/str/query/stories-keyword/stories-public'
]


const httpSearch = async (author=null, title, translated=null, type, keywords=[]) => {

    const queries = generateQueries(author, title, translated, type, keywords)

    const regexp = translated ? `(${title}|${translated})` : title

    const piracyRegexp = require('../lib/piracyRegexp')(keywords)

    const makeQuery = async (query, url) => {
        query = qs.escape(query)
        url = url.replace('query', query)

        const options = {
            resolveWithFullResponse :true,
            url: url,

            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36 OPR/52.0.2871.99',
                "cookie": require('../../config').get('fb:cookie'),
                'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        }


        let res
        try{
            res = await request.get(options)
        } catch(e) {
            console.error(new Date() + '| fb: request error')
            throw 400;
        }

        if(res.statusCode !== 200) {
            console.error(new Date() + '| fb: statusCode error')
            throw 400;
        }

        const html = res.body

        const regexpContent = new RegExp('<div class="_1yt" data-testid="results">(.*)</div> --></code></div>', 'ig');

        var result = regexpContent.exec(html);
        if(!result) {
            return []
        }

        let parsed = '<div>'
        for (let i=1; i < result.length; i++) {
            parsed += (result[i])
        }
        parsed += '</div>'

        const $ = cheerio.load(parsed);

        const links = $('div[data-ft]').map(function () {

            const innerText = $(this).text()

            //filter 1 - внешние ссылки
            if(( $(this).html().search(new RegExp("https://l.facebook.com/", 'i'))
                || innerText.search(new RegExp("http.*:\/\/((?!www.facebook.com).)*", 'i')) )
                === -1) return

            //filter 2 - автор, если есть
            if(author && innerText.search(new RegExp(author, 'i')) === -1) return

            //filter 3 - title|translated
            if(innerText.search(new RegExp(regexp, 'i')) === -1) return

            //filter 4 - легальность контента
            if(innerText.search(new RegExp(piracyRegexp, 'i')) === -1) return

            let s = $(this).attr('data-ft')

            try {
                s = JSON.parse(s); //{"top_level_post_id":"217374638841962","fbfeed_location":20}

                if(s && s["top_level_post_id"]) {
                    return ('https://facebook.com/' + s["top_level_post_id"])
                }
            } catch (e) {
                return
            }

        }).get();

        return links
    }

    const queryPromises = []
    for(let url of urls) {
        for (let query of queries) {
            queryPromises.push(new Promise(async resolve => {
                try {
                    const results = await makeQuery(query, url)
                    resolve(results)
                } catch(e) {
                    console.error('err' +e)
                    resolve([])
                }
            }))
        }
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

module.exports = {
    httpSearch
}