const transaction= require('./transaction.js')
const hashUtils = require('./hashUtils.js')
const fs = require('fs');
const path = require('path')
const blockHeader = require('./blockHeader.js')
const coinBase= require('./coinBase')


function createBlock(txids, wtxids){
    const header = blockHeader.createHeader(txids);
    const coinbaseTx= coinBase.getCoinbase(wtxids);
    const data = `${header}\n${coinbaseTx}\n${txids.join('\n')}`;
    fs.writeFileSync('output.txt', data);
    console.log("Block data written to output.txt");
}

module.exports={
    createBlock
}





