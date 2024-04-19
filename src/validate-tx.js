var EC = require('elliptic').ec;
let transaction = require('./transaction')
let hashUtils= require('./hashUtils')
const fs = require('fs');

function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return null;
    }
  }
  
// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

// Generate keys
// Sign the message's hash (input must be an array, or a hex-string)
//const path='mempool/0117e65a381acc3a3472e37f370d8f44dfab56422110ec78a774c59ccbd44a4d.json'

function validateLegacy(path){
const txData=readJSONFile(path)
let msg= transaction.getMessageLegacy(path)
for(let i=0;i<txData.vin.length;i++)
{
 var msgHash = hashUtils.doubleSHA256(msg[i]);
const scriptsig = txData.vin[i].scriptsig_asm.split(' ')

var pub = scriptsig[3]
var key = ec.keyFromPublic(pub, 'hex');

var signature = scriptsig[1].slice(0,-2)
// Verify signature
if(!key.verify(msgHash, signature)) return false
}
return true
}

function validateWitness(path){
    const txData=readJSONFile(path)
    let msg= transaction.getMessageWitness(path)
    //console.log(msg)
    for(let i= 0; i<txData.vin.length;i++)
    {
        var msgHash = hashUtils.doubleSHA256(msg[i]);
        const signature= txData.vin[i].witness[0].slice(0,-2)
        //console.log(signature)
        var pub = txData.vin[i].witness[1]
        var key = ec.keyFromPublic(pub, 'hex');
        if(!key.verify(msgHash, signature)) return false
    }
    return true
}
module.exports={
    validateLegacy,
    validateWitness
}