const transaction= require('./transaction.js')
const hashUtils = require('./hashUtils.js')
const fs = require('fs');
const path = require('path')
const blockHeader = require('./blockHeader.js')
const coinBase= require('./coinBase')
const block = require('./block.js')

const folderPath ='mempool'
function run(){
   
    fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error('Error reading folder:', err);
          return;
        }

        files.sort()
      
        // Take only the first 10 files
      
        // Loop through each file in the folder
        files.forEach(file => {
          // Construct the full path to the file
          const filePath = path.join(folderPath, file);
      
          // Read the contents of the file
          const txid = hashUtils.getTxid(transaction.getTxHash(filePath));
          if(hashUtils.getFilename(transaction.getTxHash(filePath))+'.json'!==file){ 
            console.log(filePath+' '+txid);
            return;
        }
          const wtxid = hashUtils.getTxid(transaction.getwtxHash(filePath));

          
          });

        });
}

run()