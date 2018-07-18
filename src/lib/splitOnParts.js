
const splitOnParts = (array, length) => {
    const results = []

    let part = []
    for(let i=0; i < array.length; i++) {
        if((i + 1) % (length) == 0) {
            results.push(part)
            part = []
        } else if(i == array.length - 1) {
            part.push(array[i])
            results.push(part)
            break
        }
        part.push(array[i])
    }

    return results
}

module.exports = splitOnParts