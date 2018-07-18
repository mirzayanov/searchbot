

async function f() {

    await require('./node-storage').login()

    const m = require('./methods')

    const myChannels = await m.getSubscibedChannels();

    console.log(myChannels);

}

f()