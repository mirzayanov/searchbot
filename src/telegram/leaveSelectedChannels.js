async function f() {

    const task = [
        "KnigaRu"
        ,"knigozhitel"
        ,"bukvoed"
        ,"booksmania"
        ,"books_ebooks"
        ,"Movies_bot"
        ,"ebooksencastellano"
    ]

    await require('./node-storage').login()

    const m = require('./methods')

    const myChannels = await m.getSubscibedChannels()

    for(let t of task) {
        const found = await m.findChannels(t, true)

        for(let ch of found) {
            await m.leaveChannel(ch)
            console.log('leave channel ' + ch.username)
        }
    }

    console.log('finished')

}

f()