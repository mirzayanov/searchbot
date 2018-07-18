const schedule = require('node-schedule')

const { getUnreadPosts, isPiracy, addToDB} = require('./methods')

module.exports = async () => {

    schedule.scheduleJob('* */10 * * *', async () => {
        const posts = await getUnreadPosts()

        console.log(`updates-spy: got ${posts.length} new messages`)

        for(let post of posts) {
            const piracy = await isPiracy(post)
            if(piracy) await addToDB(piracy)
        }
    })

}
