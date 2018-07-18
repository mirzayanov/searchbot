const schedule = require('node-schedule')

const {
    findChannels,
    joinChannel,
    getAllMessages,
    addToDB,
    isPiracy,
    timeout
} = require('./methods')

let keywords = []

const init =  async () => {

    while(true) {
        if(keywords.length > 0) {
            let keys = keywords
            keywords = []
            try {
                await searcher(keys)
            } catch(e) {}
        }
        else await timeout(10)

    }
}

const add = (keys) => {
    keywords.push(...keys)
}

const searcher = async (keys) => {
    // let keys = /*getKeysFromConfig()*/ []
    // keywords.push(...keys)
    keys = [...new Set(keys)]

    console.log(`channel-searcher: Got ${keys.length} keys`)

    for(let key of keys) {
        if(!key) continue

        await timeout(40)
        const channels = await findChannels(key)
        console.log(`channel-searcher: key ${key} found channels: ` + channels.length)

        for(let ch of channels) {

            await timeout(40)

            console.log('channel-searcher: Getting messages... | ' + ch.username)

            const res = await getAllMessages(ch)

            if(res && res.length > 100) {
                console.log('channel-searcher: channel joining')
                await timeout(60)
                await joinChannel(ch)
            }

            console.log('channel-searcher: Got messages...')

        }

    }

    console.log('channel-searcher: finished')

    return true
}

function getKeysFromConfig () {
    const keywords = require('../../config').get('keywords')

    const keys = []

    for(let key in keywords) {
        keys.push(...keywords[key])
    }

    return [...new Set(keys)]
}

module.exports = {
    init,
    add
}