const config = require('../../config')


const piracyRegexp = (keys) => {

    // let keywords = [...(config.get('keywords:piracy')), ...keys]
    let keywords

    if(keys.length > 0) {
        keywords = keys
    } else {
        keywords = config.get('keywords:piracy')
    }

    keywords = [...new Set(keywords)]

    keywords = keywords.map(getAllCombs)

    keywords = [...new Set(...keywords)]

    const regexp = `(${keywords.join('|')})`

    return regexp
}

const getAllCombs = (s) => {
    const splitted = s.split(' ')

    return getCombs(splitted)

}

const getCombs = (arr) => {

    function make(arr, el) {
        var i, i_m, item;
        var len = arr.length;
        var res = [];

        for(i = len; i >= 0; i--) {
            res.push(
                ([]).concat(
                    arr.slice(0, i),
                    [el],
                    arr.slice(i, i_m)
                )
            );
        }

        return res;
    }

    function combinations(arr) {
        var prev, curr, el, i;
        var len = arr.length;

        curr = [[arr[0]]];

        for(i = 1; i < len; i++) {
            el = arr[i];
            prev = curr;
            curr = [];

            prev.forEach(function(item) {
                curr = curr.concat(
                    make(item, el)
                );
            });
        }

        curr = curr.map(elem => {
            return elem.join('.*')
        })

        return curr;
    }

    return combinations(arr)

}

module.exports = piracyRegexp