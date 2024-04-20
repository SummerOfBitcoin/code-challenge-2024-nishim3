const fs = require('fs');
const path = require('path');
const transaction = require('./transaction.js');

async function sortTransactionsbyFee(folderPath) {
    const mapping = new Map();

    function readJSONFile(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error reading JSON file:", error);
            return null;
        }
    }

    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Error reading folder:', err);
                reject(err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(folderPath, file);
                const txData = readJSONFile(filePath);
                if (txData) {
                    mapping.set(filePath, transaction.calculate_fees(txData));
                }
            });

            const sortedTx = [...mapping.keys()].sort();
            const outputFilePath = 'sorted_transactions.txt';
            fs.writeFileSync(outputFilePath, sortedTx.join('\n'), 'utf8');
            console.log('Sorted transactions have been written to sorted_transactions.txt');
            resolve(); // Resolve the Promise after completing all operations
        });
    });
}

module.exports = {
    sortTransactionsbyFee
}
