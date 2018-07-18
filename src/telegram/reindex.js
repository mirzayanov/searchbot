
const Post = require('../models/Post');

const f = async () => {
    console.log('начали индексирование');

    Post.find({}, async (err, posts) => {
        if(err) return console.error(err);

        console.log('получили ссылки:', posts.length);

        const splitted = require('../lib/splitOnParts')(posts, 10000);
        console.log('разбили по 10к:', splitted.length);

        const queue = require('../lib/queue');

        for(let part of splitted) {
            await queue(post => {
                return new Promise(resolve => {
                    const username = post.link.split('/')[3];

                    if(post.username) resolve([])

                    post.username = username;
                    post.markModified('username');

                    post.save(() => {
                        resolve([]);
                    });
                })
            }, part)

            console.log('закончили часть:');
        }

        console.log('закончили индексирование');
    })
}

f();