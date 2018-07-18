
const Post = require('../models/Post');

const f = async () => {
    console.log('начали индексирование');

    Post.find({}, (err, posts) => {
        if(err) return console.error(err);

        console.log('получили ссылки:', posts.length);

        for(let post of posts) {
            const username = post.link.split('/')[3];

            if(!post.username) continue;

            post.username = username;

            post.save();
        }

        console.log('закончили индексирование');
    })
}

f();