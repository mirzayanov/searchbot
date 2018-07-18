const schedule = require('node-schedule')

const Post = require('../models/Post');
const { findChannels, timeout} = require('./methods')

module.exports = async () => {

    schedule.scheduleJob('* */10 * * *', async () => {
        const usernames = await Post.getUsernames();

        if(usernames.length === 0) return;

        console.log(`trash-cleaner: got ${usernames.length} usernames`)

        for(let username of usernames) {
            timeout(10);
            const channels = await findChannels(username);
            if(!channels || channels.length === 0) continue;

            for(let channel of channels) {
                if(channel.username === username) continue;
            }

            await Post.deleteChannelPosts(username);
            console.log(`trash-cleaner: deleted ${username} channel posts`)
        }

        console.log('trash-cleaner: finished work');

    })

}
