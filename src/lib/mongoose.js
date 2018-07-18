const mongoose = require('mongoose');
const config = require('../../config');

mongoose.connect(config.get('mongoose:uri'),  {useNewUrlParser: true});

module.exports = mongoose;