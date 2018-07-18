const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({args: [
        '--no-sandbox', '--disable-setuid-sandbox'
    ]});

    const page = await browser.newPage();

    await page.setViewport({height: 500, width: 500});
    await page.goto('https://twitter.com/search?src=typd&q=%D0%BF%D0%B5%D1%82%D1%80%D0%B0%D1%80%D0%BA%D0%B0');

    const resultsSelector = '[data-permalink-path]';

    await page.waitForSelector(resultsSelector);

    const results = await page.evaluate(async resultsSelector => {
        const listSelector = '#stream-items-id'
        const links = []

        let oldHeight = document.querySelector(listSelector).offsetHeight
        let newHeight = oldHeight

        do {
            let oldHeight = newHeight

            window.scrollBy(0, newHeight)

            await (() => {
                return new Promise(resolve => {
                    setTimeout(() => resolve(), 2000)
                })
            })()

            newHeight = document.querySelector(listSelector).offsetHeight
        } while( newHeight < 20000 && oldHeight != newHeight)

        const anchors = Array.from(document.querySelectorAll(resultsSelector))

        for(let a of anchors) {
            links.push(a.getAttribute('data-permalink-path'))
        }

        return links
    }, resultsSelector);

    console.log(results)

    await browser.close();
})()