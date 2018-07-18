const config = require('../../config')

const qkeys = config.get('queryKeys')

module.exports = (author, title, translated, type, keywords=[]) => {
    const queries = []
    let keys = [...keywords]

    let gentype = getType(type)

    if(gentype !== 'other') {
        if(isRu(title) || (translated && isRu(translated)))
            keys.push(...config.get(`queryKeys:${gentype}:ru`))

        else keys.push(...config.get(`queryKeys:${gentype}:en`))

    } else {
        keys.push(...config.get(`queryKeys:other`))
    }


    keys = [...new Set(keys)]

    if(!author) {
        for(let key of keys) {
            queries.push(`${title} ${key}`)
            if(translated) queries.push(`${translated} ${key}`)
        }
    } else {
        for(let key of keys) {
            queries.push(`${author} ${title} ${key}`)
            if(translated) queries.push(`${author} ${translated} ${key}`)
        }
    }

    return queries
}

function getType(type) {

    for(let qk in qkeys) {
        if(type.search(new RegExp(qk,'i')) > -1) return qk
    }

    return 'other'
}

function isRu(word) {
    const abc = `абвгдеёжзийклмнопростфхцщчэюя`.split('')

    const regexp = `(${abc.join('|')})`

    if(word.toLowerCase().search(new RegExp(regexp, 'i')) > -1 ) return true
    return false
}