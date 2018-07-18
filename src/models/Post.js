const mongoose = require('../lib/mongoose')

const schema = mongoose.Schema({
    link: {
        type: String,
        unique: true,
        required: true
    },
    text: String,
    type: String,
    username: String
});

schema.statics.add = async (link, text, type, username) => {
    const post = new Post({
        link: link,
        text: text,
        type: type,
        username: username
    })

    return new Promise((resolve, reject) => {
        post.save((err, post) => {
            if(err) reject(err)

            resolve(post)
        })
    })
}

schema.statics.search = async (type, regexp) => {
    return new Promise((resolve, reject) => {

        Post.find({
            "type" : type,
            "text" : { $regex: new RegExp(regexp), $options: 'i' }
        }, (err, posts) => {
            if(err) reject(err)

            resolve(posts)
        })

    })
}

schema.statics.getUsernames = async () => {
    return new Promise((resolve, reject) => {

        Post.distinct('username', (err, usernames) => {
            if(err) reject(err)

            resolve(usernames)
        })

    })
};

schema.statics.deleteChannelPosts = async (username) => {
    return new Promise((resolve, reject) => {

        Post.remove({username}, (err, row) => {
            if(err) reject(err)

            resolve(row)
        })

    })
}

var Post = mongoose.model('Post', schema)

module.exports = Post