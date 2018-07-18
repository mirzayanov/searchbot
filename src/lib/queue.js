
const queue = async (func, args) => {

    const promises = []
    for(let arg of args) {

        promises.push(new Promise(async resolve => {
            const results = await func(arg)
            resolve(results)
        }))

    }

    const results = await Promise.all(promises).then(results => {
        const links = []

        for(let set of results) {
            if(!set) continue
            links.push(...set)
        }

        return [...new Set(links)]
    })

    return results

}

module.exports = queue