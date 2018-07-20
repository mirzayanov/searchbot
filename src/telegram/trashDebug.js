
const Post = require('../models/Post');
const { findChannels, timeout} = require('./methods')

module.exports = async () => {
    const usernames = await Post.getUsernames();

    if(usernames.length === 0) return;

    console.log(`trash-cleaner: got ${usernames.length} usernames`)

    cycleUsernames: for(let username of usernames) {
        await timeout(10);
        const channels = await findChannels(username);
        if(!channels || channels.length === 0) continue;

        for(let channel of channels) {
            console.log(channel);
            if(channel.username === username) continue cycleUsernames;
        }

        await Post.deleteChannelPosts(username);
        console.log(`trash-cleaner: deleted ${username} channel posts`)
    }

    console.log('trash-cleaner: finished work');

}
