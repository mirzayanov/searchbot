const { MTProto } = require('telegram-mtproto')
const { Storage } = require('mtproto-storage-fs')
const readline = require('readline')

const config = {
    "phone_number": require('../../config').get('telegram:phone'),
    "api_id": 56652,
    "api_hash": "d80370280b1ba0c0b7ae0a7863ff7a7c"
}

const app = {
    storage: new Storage('./storage.json')
}

const phone = {
    num: config.phone_number
}

const api = {
    layer         : 57,
    initConnection: 0x69796de9,
    api_id        : config.api_id
}

const server = {
    dev: false,
    webogram: true
}

const client  = MTProto({ server, api, app })

const askForCode = () => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input : process.stdin,
            output: process.stdout
        })

        rl.question('Please enter passcode for ' + phone.num + ':\n', (num) => {
            rl.close()
            resolve(num)
        })
    })
}

const login = async (client, phone) => {
    const { phone_code_hash } = await client('auth.sendCode', {
        phone_number  : phone.num,
        current_number: false,
        api_id        : config.api_id,
        api_hash      : config.api_hash
    })

    const phone_code = await askForCode()
    console.log(`Your code: ${phone_code}`)

    const { user } = await client('auth.signIn', {
        phone_number   : phone.num,
        phone_code_hash: phone_code_hash,
        phone_code     : phone_code
    })

    console.log('signed as ', user)
}

exports.login = async function() {
    if (!(await app.storage.get('signedin'))) {
        console.log('not signed in')

        await login(client, phone).catch(console.error)

        console.log('signed in successfully')
        app.storage.set('signedin', true)
    } else {
        console.log('already signed in')
    }
}

exports.telegram = client