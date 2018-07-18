const Post = require('../models/Post');

async function f() {
    const s = 'Black panther';

    const found = await Post.search('film', s);

    console.log(found);
}

f()