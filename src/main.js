const transaction= require('./transaction.js')
const hashUtils = require('./hashUtils.js')
const fs = require('fs');
const path = require('path')
const blockHeader = require('./blockHeader.js')
const coinBase= require('./coinBase')
const block = require('./block.js')

const folderPath ='mempool'
function run(){
    let txids=['31e9370f45eb48f6f52ef683b0737332f09f1cead75608021185450422ec1a71']
    let wtxids=['0']
    fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error('Error reading folder:', err);
          return;
        }

        files.sort()
      
        // Take only the first 10 files
        const selectedFiles = files.slice(0, 2000);
      
        // Loop through each file in the folder
        selectedFiles.forEach(file => {
          // Construct the full path to the file
          const filePath = path.join(folderPath, file);
      
          // Read the contents of the file
          const txid = hashUtils.getTxid(transaction.getTxHash(filePath));
          if(hashUtils.getFilename(transaction.getTxHash(filePath))+'.json'!==file) return;
          const wtxid = hashUtils.getTxid(transaction.getwtxHash(filePath));

          txids.push(txid)
          wtxids.push(wtxid)
          });

          block.createBlock(txids,wtxids)
        });
}

run()