
const run = async () => {
    await require('./telegram/node-storage').login()

    require('./telegram/updates-spy')();
    require('./telegram/channels-searcher').init()
    require('./telegram/trashCleaner')();

    await require('./browser').launch(true)
    require('./server')
}

run()

