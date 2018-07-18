const {
    findChannels,
    joinChannel,
    getAllMessages,
    addToDB,
    isPiracy,
    timeout
} = require('./methods')

const init = async () => {

    await require('./node-storage').login()

    const keys = getKeysFromConfig()

    console.log(`Got ${keys.length} keys`)

    for(let key of keys) {
        await timeout(30)
        const channels = await findChannels(key)
        console.log('found channels: ' + channels.length)

        for(let ch of channels) {

            await timeout(20)
            const res = await joinChannel(ch)

            await timeout(60)
            if(!res) return

            console.log('Getting messages...')

            await getAllMessages(ch, async (msgs) => {
                for(let msg of msgs) {
                    const piracy = await isPiracy(msg)

                    if(piracy) await addToDB(piracy)
                }
            })

            console.log('Got messages...')

        }

    }
}

function getKeysFromConfig () {
    const keywords = require('../../config').get('keywords')

    const keys = []

    for(let key in keywords) {
        keys.push(...keywords[key])
    }

    return [...new Set(keys)]
}

init()