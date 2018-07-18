const puppeteer = require('puppeteer')

let commonBrowser

const launch = async (isLaunch) => {
    return new Promise(async resolve => {
        const browser = await puppeteer.launch({
            // headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        if(isLaunch) commonBrowser = browser

        resolve(browser)
    })
}

const getPage = async (browser = commonBrowser) => {
    return new Promise(async resolve => {

        const page = await browser.newPage()

        await page.setViewport({height: 500, width: 500})

        await page.setRequestInterception(true)
        page.on('request', request => {
            if (request.resourceType() === 'image')
                request.abort();
            else
                request.continue();
        })

        resolve(page)
    })
}

module.exports = {
    launch,
    getPage
}