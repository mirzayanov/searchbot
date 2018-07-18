const mongoose = require('../lib/mongoose')

const schema = mongoose.Schema({
    link: {
        type: String,
        unique: true,
        required: true
    },
    text: String,
    type: String
});

schema.statics.add = async (link, text, type) => {
    const post = new Post({
        link: link,
        text: text,
        type: type
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

var Post = mongoose.model('Post', schema)

module.exports = Post