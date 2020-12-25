const https = require('https')

const getPdf = (url, callback) => {
    https.get(url, res => {
        // Initialise an array
        const bufs = [];

        // Add the data to the buffer collection
        res.on('data', function (chunk) {
            bufs.push(chunk)
        });

        // This signifies the end of a request
        res.on('end', function () {
            // We can join all of the 'chunks' of the image together
            const data = Buffer.concat(bufs);

            // Then we can call our callback.
            callback(null, data);
        });
    })
    // Inform the callback of the error.
    .on('error', callback);
}

module.exports = {getPdf}