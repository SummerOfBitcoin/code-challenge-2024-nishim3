const transaction= require('./transaction.js')
const hashUtils = require('./hashUtils.js')
const fs = require('fs');
const path = require('path')
const blockHeader = require('./blockHeader.js')
const coinBase= require('./coinBase')
const block = require('./block.js')
const validatetx = require('./validate-tx.js')
const fees = require('./fees.js')
function readJSONFile(filePath) {
  try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
  } catch (error) {
      console.error("Error reading JSON file:", error);
      return null;
  }
}

function getTransactionType(file){
    const txData= readJSONFile(file)
    let txtype = 0
      let flag = true;
      for(let i=0;i<txData.vin.length;i++) 
          if(txData.vin[i].prevout.scriptpubkey_type != "v0_p2wpkh") {
            flag = false;
            break;
          }
      if(flag) return 1
       flag = true;
      for(let i=0;i<txData.vin.length;i++) 
          if(txData.vin[i].prevout.scriptpubkey_type != "p2pkh") {
            flag = false;
            break;
          }
      if(flag) return 2
      return 0
}

async function run(){
    await fees.sortTransactionsbyFee('mempool')
    let txids=['31e9370f45eb48f6f52ef683b0737332f09f1cead75608021185450422ec1a71']
    let wtxids=['0']
    const data = fs.readFileSync('sorted_transactions.txt', 'utf8').trim().split('\n').reverse()
    let weight = 0 
    for(let i=0;i<data.length;i++){
      //if(weight > 4000000) break;
      const file = data[i]
      const txData = readJSONFile(file);
      let txtype = getTransactionType(file)
      if(weight + transaction.calculate_weight(file) > 3999500){
        continue
      }
      if(txtype==1){
        if(!validatetx.validateWitness(file)) continue;
      }
      else if(txtype==2){
        if(!validatetx.validateLegacy(file)) continue;
      }
      else if(txtype==0){
        continue
      }
      const txid = hashUtils.getTxid(transaction.getTxHash(file));
          if('mempool/'+hashUtils.getFilename(transaction.getTxHash(file))+'.json'!==file) continue;
          const wtxid = hashUtils.getTxid(transaction.getwtxHash(file));
        weight = weight + transaction.calculate_weight(file)
          txids.push(txid)
          wtxids.push(wtxid)
    }
    block.createBlock(txids,wtxids)
    console.log(weight)
}

run()