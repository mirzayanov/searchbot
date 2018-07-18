async function f() {

    await require('./node-storage').login()

    const m = require('./methods')

    await m.leaveAllChannels()
}

f()