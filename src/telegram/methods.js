const {telegram} = require('./node-storage')
const piracyRegexp = require('../lib/piracyRegexp')([])
const Post = require('../models/Post')
const config = require('../../config')

//todo: realise 2 searching ways: 1 - in db, 2 - requests
//if 1 way will give nothing - use second method
const search = async (regexp, author, inputType) => {
    const links = []

    let type = defineInputType()

    try {

        await searchByType(type)

        if(links.length === 0) await searchByType('other')

    }catch (e) { return [] }

    async function searchByType(type) {
        const posts = await searchInDB(type, regexp)

        for(let post of posts) {
            if(author && post.text.search(new RegExp(author.replace(' ', '.*'), 'i')) === -1) continue

            links.push(post.link)
        }
    }

    function defineInputType() {
        const typeKeys = config.get('typeKeys')

        for(let key in typeKeys) {
            if(inputType.search(new RegExp(key, 'i')) > -1) {
                return key
            }
        }

        if(inputType.search(new RegExp('Serial|Movie', 'i')) > -1) {
            return 'film'
        }


        return 'other'
    }


    return links
}

const searchInDB = async (type, regexp) => {
    return await Post.search(type, regexp)
}

const addToDB = async ({link, text, type}) => {
    try {
        await Post.add(link, text, type)
    } catch (e) {}

}

const getSubscibedChannels = async () => {
    let dialogs
    try{
        dialogs = await telegram('messages.getDialogs')
    } catch (e) { return []}

    const channels = []

    for(let dialog of dialogs.dialogs) {
        const peer = dialog.peer

        if(peer._ !== 'peerChannel') continue

        const {access_hash, id, username} = dialogs.chats.find((dialog) => {
            return dialog.id === peer.channel_id
        })

        dialog.access_hash = access_hash
        dialog.id = id
        dialog.username = username

        channels.push(dialog)
    }

    return channels
}

const getUnreadChannels = async () => {
    const channels = await getSubscibedChannels()

    const unreadChannels = channels.filter( (channel) => {
        return channel.unread_count > 0
    })

    return unreadChannels
}


const getUnreadPosts = async () => {
    const channels = await getUnreadChannels()

    const posts = []

    for(let channel of channels) {
        await timeout(5)

        const messages = await getMessages(channel, channel.unread_count)

        await timeout(3)

        await readHistory(channel)

        posts.push(...messages)
    }

    return [...new Set(posts)]
}

const readHistory = async (channel) => {

    await telegram('channels.readHistory', {
        channel: {
            _          : 'inputPeerChannel',
            channel_id : channel.id,
            access_hash: channel.access_hash
        },
        max: channel.top_message
    })

}

const getAllMessages = async (channel) => {
    let max = -1
    let offsetId = 0
    let full = [],
        messages = []

    do {
        await timeout(60)

        const history = await getMessages(channel, 100, offsetId, true)

        messages = getHistoryMessages(history, channel)

        full.push(...messages)

        const piracyPosts = []
        for(let msg of messages) {
            const piracy = await isPiracy(msg)

            if(piracy) {
                piracyPosts.push(msg)
                await addToDB(piracy)
            }
            // if(piracy) await addToDB(piracy)
        }

        if(max < 0) {
            max  = history.count
            /*test*/
            console.log(`max: ${max}`)
        }

        if(piracyPosts.length < messages.length / 10) return false

        messages.length > 0 && (offsetId = messages[messages.length - 1].id)

        /*test*/
        console.log(`length: ${messages.length} | ${offsetId}`)

    } while (messages.length === 100 && full.length < max)

    return full
}

const getMessages = async (channel, limit, offset_id=0, onlyHistory) => {

    try{
        const history = await telegram('messages.getHistory', {
            peer: {
                _          : 'inputPeerChannel',
                channel_id : channel.id,
                access_hash: channel.access_hash
            },
            offset_id,
            limit
        })

        if(onlyHistory) return history

        const messages = history.messages.map((msg) => {
            msg.link = `https://t.me/${channel.username}/${msg.id}`
            msg.username = channel.username
            return msg
        })

        return messages
    } catch (e) { return [] }

}

const getHistoryMessages = (history, channel) => {
    const messages = history.messages.map((msg) => {
        msg.link = `https://t.me/${channel.username}/${msg.id}`
        msg.username = channel.username
        return msg
    })

    return messages
}

const isPiracy = async (msg) => {

    if(!msg.post) return false

    let piracy = false

    let type = 'other'

    let text = msg.message || ''

    if(msg.reply_markup) {
        try{
            const replyMarkup = JSON.stringify(msg.reply_markup)
            text += ` ${replyMarkup}`
        } catch (e){}
    }

    if(msg.media && msg.media._) {

        if(msg.media._ === 'messageMediaWebPage') {
            const {title, description} = msg.media.webpage

            text += `${title} ${description}`
        }

        if(msg.media._ === 'messageMediaDocument') {
            text += ' ' + msg.media.caption

            const doc = msg.media.document

            if(doc.mime_type) {
                if(doc.mime_type.search(new RegExp('audio', 'i')) > -1) {
                    type = 'music'
                }

                if(doc.mime_type.search(new RegExp('video', 'i')) > -1) {
                    type = 'film'
                }

                if(doc.mime_type.search(new RegExp('application', 'i')) > -1) {
                    type = 'book'
                }
            }

            type !== 'other' && (piracy = true)

            for(let attr of doc.attributes) {
                text += ` ${attr.file_name}`
            }

        }

    }

    if(type !== 'other') {
        piracy = true
    } else {
        type = defineType(text)
    }

    if(!piracy && text.search(new RegExp(piracyRegexp, 'i')) > -1) {
        piracy = true
    }

    piracy && (piracy = {
        link: msg.link,
        text,
        type
    })

    return piracy

}


const defineType = (text) => {
    const keys = config.get('typeKeys')
    let type = 'other'

    for(let key in keys) {
        const regexp = generateRegexp(keys[key])

        if(text.search(new RegExp(regexp, 'i')) > -1) {
            type = key
        }

    }

    function generateRegexp(words) {
        const regexp = `(${words.join('|')})`
        return regexp
    }

    return type
}

const findChannels = async (username, onlyJoined) => {
    const res = await telegram('contacts.search', {
        q    : username
    })

    if(onlyJoined) {
        return res.chats.filter( chat => chat._ === 'channel' && !chat.left )
    }

    const channels = res.chats.filter( chat => chat._ === 'channel' && chat.left )

    return channels
}

const joinChannel = async (channel) => {
    const res = await telegram('channels.joinChannel', {
        channel: {
            _          : 'inputPeerChannel',
            channel_id : channel.id,
            access_hash: channel.access_hash
        }
    })

    return (res.chats && res.chats.length > 0)
}

const leaveChannel = async (channel) => {

    try{
        const res = await telegram('channels.leaveChannel', {
            channel: {
                _          : 'inputPeerChannel',
                channel_id : channel.id,
                access_hash: channel.access_hash
            }
        })

        return (res.chats && res.chats.length > 0)
    } catch(e) { return false }

}

const leaveAllChannels = async () => {
    const channels = await getSubscibedChannels()

    console.log(`leaveAllChannels: got ${channels.length} channels`)

    for(let ch of channels) {
        timeout(20)
        await leaveChannel(ch)
    }

    console.log(`leaveAllChannels: has finished`)

    return true
}

const timeout = async (t) => {
    return new Promise(resolve => {
        setTimeout(() => { resolve(true) }, t * 1000)
    })
}

module.exports = {
    joinChannel,
    getAllMessages,
    getUnreadPosts,
    findChannels,
    isPiracy,
    searchInDB,
    addToDB,
    timeout,
    search,
    leaveAllChannels,
    leaveChannel,
    getSubscibedChannels
}