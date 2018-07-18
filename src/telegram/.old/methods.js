const { inputField } = require('./fixtures')

const {telegram} = require('./node-storage')
const queue = require('../lib/queue')
const getPiracyRegexp = require('../lib/piracyRegexp')
const splitOnParts = require('../lib/splitOnParts')

const searchChannels = async (keys) => {

    const channels = await queue(async (key) => {

        let foundContacts
        try {
            foundContacts = await telegram('contacts.search', {
                q    : key,
                limit: 100
            })
        } catch (e) {
            console.error(new Date() + '| telegram: parse channels error ' + e)
            return []
        }

        console.log(foundContacts)

        foundContacts = foundContacts.chats
            .filter(e => e['_'] === 'channel')

        return foundContacts
    }, keys)

    return channels
}

const searchPosts = async ({author, title, translated, type, keywords}, channels) => {

    const piracyRegexp = getPiracyRegexp([title, author, translated])

    const channelSearch = async (channel) => {
        const links = []

        const parsePosts = async (param) => {
            if(!param) return []

            let foundMessages
            try {

                foundMessages = await telegram('messages.search', {
                    peer: {
                        _          : 'inputPeerChannel',
                        channel_id : channel.id,
                        access_hash: channel.access_hash
                    },
                    q: param,
                    limit: 100
                })

            } catch (e) {
                console.error(new Date() + '| telegram: found messages error')
                return []
            }

            return foundMessages.messages
        }

        const foundMessages = await queue(parsePosts, [author, title, translated])

        for(let msg of foundMessages) {

            const regexp = translated ? `(${title}|${translated})` : title

            if(msg.media && msg.media.caption && msg.media.caption.search(new RegExp(regexp, 'i')) > -1){
                const link = `https://t.me/${channel.username}/${msg.id}`
                links.push(link)
            }

            if(author && msg.message.search(new RegExp(author, 'i')) === -1) continue

            if(msg.message.search(new RegExp(regexp, 'i')) > -1 && msg.post) {
                if(msg.message.search(new RegExp(piracyRegexp, 'i')) > -1) {
                    const link = `https://t.me/${channel.username}/${msg.id}`
                    links.push(link)
                }
            }
        }

        return [...new Set(links)]
    }

    // const channelsSeparated = splitOnParts(channels, 1)
    // let results = []
    // for(let channelsPart of channelsSeparated) {
    //     results.push(...(await queue( channelSearch, channelsPart )))
    // }

    const results = await queue(channelSearch, channels)

    return [...new Set(results)]
}


module.exports = {
    searchChannels,
    searchPosts
}