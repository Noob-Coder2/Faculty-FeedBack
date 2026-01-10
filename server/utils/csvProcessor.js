// server/utils/csvProcessor.js
const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Parses a CSV buffer into an array of objects.
 * @param {Buffer} buffer - The CSV file buffer.
 * @returns {Promise<Array>} - A promise that resolves to an array of row objects.
 */
const parseCsv = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from(buffer);

        stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

module.exports = {
    parseCsv
};
