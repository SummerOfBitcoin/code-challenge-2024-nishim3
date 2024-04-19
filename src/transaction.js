const fs = require('fs'); 
const hashUtils = require('./hashUtils.js')
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return null;
    }
}

function getTxHash(jsonFilePath){
const txData = readJSONFile(jsonFilePath);

if (txData) {
    let tx='';
    const leVersion = Buffer.allocUnsafe(4);
    leVersion.writeUInt32LE(txData.version, 0);

    tx=tx+leVersion.toString('hex');
    

    const _vinCount = txData.vin.length
    let vinCount=_vinCount.toString(16);
    if(_vinCount<16){tx = tx + '0';}
    if(_vinCount >256){
         tx= tx+'fd'
         vinCount=hashUtils.reverseHex(vinCount.padStart(4,'0'))        
    }
    tx=tx+vinCount
    

    for(let i=0;i<_vinCount;i++)
    {
        const txid = hashUtils.reverseHex(txData.vin[i].txid)
        tx= tx+txid;
        const vout= hashUtils.reverseHex(txData.vin[i].vout.toString(16).padStart(8,'0'));
        tx= tx+vout;
        
        const scriptsigsize = ((txData.vin[i].scriptsig.length)/2).toString(16).padStart(2,'0')
        tx = tx+scriptsigsize

        tx = tx+ txData.vin[i].scriptsig;
        const sequence = hashUtils.reverseHex(txData.vin[i].sequence.toString(16).padStart(8,'0'))
        tx=tx+sequence
    }

    const _voutCount = txData.vout.length
    let voutCount=_voutCount.toString(16);
    if(_voutCount<16){tx = tx + '0';}
    if(_voutCount >256){
         tx= tx+'fd'
         voutCount=hashUtils.reverseHex(voutCount.padStart(4,'0'))        
    }
    tx=tx+voutCount

    for(let i=0;i<_voutCount;i++)
    {
        const amount = hashUtils.reverseHex(txData.vout[i].value.toString(16).padStart(16,'0'));
        tx = tx+amount

        const scriptpubkeysize = ((txData.vout[i].scriptpubkey.length)/2).toString(16).padStart(2,'0')
        tx = tx+scriptpubkeysize

        tx = tx+ txData.vout[i].scriptpubkey
    }

    const locktime = hashUtils.reverseHex(txData.locktime.toString(16).padStart(8,'0'));
    tx = tx+locktime
    
   return tx;

} else {
    console.log("Failed to read JSON file or file is empty.");
}
}


function getwtxHash(jsonFilePath){
    const txData = readJSONFile(jsonFilePath);

    if (txData) {
        const _vinCount = txData.vin.length

        let segwit = false

        for(let i=0; i< _vinCount;i++)
        {
            if('witness' in txData.vin[i])
            segwit = true
        }

        if(!segwit) return getTxHash(jsonFilePath)
        let wtx='';
        const leVersion = Buffer.allocUnsafe(4);
        leVersion.writeUInt32LE(txData.version, 0);

        wtx=wtx+leVersion.toString('hex');

        wtx=wtx+'0001'

        
    let vinCount=_vinCount.toString(16);
    if(_vinCount<16){wtx = wtx + '0';}
    if(_vinCount >256){
         wtx= wtx+'fd'
         vinCount=hashUtils.reverseHex(vinCount.padStart(4,'0'))        
    }
    wtx=wtx+vinCount


for(let i=0;i<_vinCount;i++)
    {
        const txid = hashUtils.reverseHex(txData.vin[i].txid)
        wtx= wtx+txid;
        const vout= hashUtils.reverseHex(txData.vin[i].vout.toString(16).padStart(8,'0'));
        wtx= wtx+vout;
        
        const scriptsigsize = ((txData.vin[i].scriptsig.length)/2).toString(16).padStart(2,'0')
        wtx = wtx+scriptsigsize

        wtx = wtx+ txData.vin[i].scriptsig;
        const sequence = hashUtils.reverseHex(txData.vin[i].sequence.toString(16).padStart(8,'0'))
        wtx=wtx+sequence
    }

    const _voutCount = txData.vout.length
    let voutCount=_voutCount.toString(16);
    if(_voutCount<16){wtx = wtx + '0';}
    if(_voutCount >256){
         wtx= wtx+'fd'
         voutCount=hashUtils.reverseHex(voutCount.padStart(4,'0'))        
    }
    wtx=wtx+voutCount

    for(let i=0;i<_voutCount;i++)
    {
        const amount = hashUtils.reverseHex(txData.vout[i].value.toString(16).padStart(16,'0'));
        wtx = wtx+amount

        const scriptpubkeysize = ((txData.vout[i].scriptpubkey.length)/2).toString(16).padStart(2,'0')
        wtx = wtx+scriptpubkeysize

        wtx = wtx+ txData.vout[i].scriptpubkey
    }

    for(let i=0;i<txData.vin.length;i++)
    {
        if(!txData.vin[i].witness) 
        {
            wtx=wtx + '00'
            continue
        }
        const witness= txData.vin[i].witness
        wtx= wtx+ witness.length.toString(16).padStart(2,'0')

        for(let j=0;j<witness.length;j++)
        {
            const stackitem=witness[j]
            const _size = stackitem.length/2
            let size=_size.toString(16);
            if(_size<16){wtx = wtx + '0';}
            if(_size >256){
                 wtx= wtx+'fd'
                 size=hashUtils.reverseHex(size.padStart(4,'0'))        
            }
            wtx=wtx+size
            wtx=wtx+stackitem
        }
    }
    const locktime = hashUtils.reverseHex(txData.locktime.toString(16).padStart(8,'0'));
    wtx = wtx+locktime
    
   return wtx;
    }
    else{
        console.log("Failed to read JSON file or file is empty.");
    }
}

function calculate_fees(txData){
    const vinCount = txData.vin.length
    let input=0
    let output = 0
    for(let i=0;i<vinCount;i++)
    {
        input = input + txData.vin[i].prevout.value
    }

    const voutCount = txData.vout.length
    for(let i=0;i<voutCount;i++)
    {
        output=output+txData.vout[i].value
    }

    return (input-output)
}

function calculate_weight(filePath){
    const tx_raw = getTxHash(filePath).length
    const wtx_raw = getwtxHash(filePath).length

    return (tx_raw*4 + wtx_raw)/2
}
function getMessageLegacy(jsonFilePath){
    const txData = readJSONFile(jsonFilePath);

    if (txData) {
    let tx='';
    const leVersion = Buffer.allocUnsafe(4);
    leVersion.writeUInt32LE(txData.version, 0);

    tx=tx+leVersion.toString('hex');
    
    const _vinCount = txData.vin.length
    let vinCount=_vinCount.toString(16);
    if(_vinCount<16){tx = tx + '0';}
    if(_vinCount >256){
         tx= tx+'fd'
         vinCount=hashUtils.reverseHex(vinCount.padStart(4,'0'))        
    }
    tx=tx+vinCount
    const prev = tx;
    let msghash=[]
    for(let i=0;i<_vinCount;i++)
    {
        tx=''
        for(let j=0;j<_vinCount;j++)
        {
        const txid = hashUtils.reverseHex(txData.vin[j].txid)
        tx= tx+txid;
        const vout= hashUtils.reverseHex(txData.vin[j].vout.toString(16).padStart(8,'0'));
        tx= tx+vout;
        
        if(i == j){
        const scriptsigsize = ((txData.vin[j].prevout.scriptpubkey.length)/2).toString(16).padStart(2,'0')
        tx = tx+scriptsigsize

        tx = tx+ txData.vin[j].prevout.scriptpubkey;
        }
        else{
            tx=tx+'00'
        }
        const sequence = hashUtils.reverseHex(txData.vin[j].sequence.toString(16).padStart(8,'0'))
        tx=tx+sequence
        }
        msghash.push(prev+tx)
    }
    tx = ''
    const _voutCount = txData.vout.length
    let voutCount=_voutCount.toString(16);
    if(_voutCount<16){tx = tx + '0';}
    if(_voutCount >256){
         tx= tx+'fd'
         voutCount=hashUtils.reverseHex(voutCount.padStart(4,'0'))        
    }
    tx=tx+voutCount

    for(let i=0;i<_voutCount;i++)
    {
        const amount = hashUtils.reverseHex(txData.vout[i].value.toString(16).padStart(16,'0'));
        tx = tx+amount

        const scriptpubkeysize = ((txData.vout[i].scriptpubkey.length)/2).toString(16).padStart(2,'0')
        tx = tx+scriptpubkeysize

        tx = tx+ txData.vout[i].scriptpubkey
    }

    const locktime = hashUtils.reverseHex(txData.locktime.toString(16).padStart(8,'0'));
    tx = tx+locktime
    tx= tx+'01000000' //sigHash
    for(let i=0;i<_vinCount;i++)
    msghash[i]=msghash[i]+tx
   return msghash;

} else {
    console.log("Failed to read JSON file or file is empty.");
}
}

function getMessageWitness(jsonFilePath){
    const txData = readJSONFile(jsonFilePath);

    if (txData) {
    let tx='';
    const leVersion = Buffer.allocUnsafe(4);
    leVersion.writeUInt32LE(txData.version, 0);

    tx=tx+leVersion.toString('hex');
    
    let tx_vout=''
    for(let i = 0; i< txData.vin.length;i++)
    {
        tx_vout += hashUtils.reverseHex(txData.vin[i].txid)
        tx_vout += hashUtils.reverseHex(txData.vin[i].vout.toString(16).padStart(8,'0'))
    }
    tx_vout = hashUtils.doubleSHA256(tx_vout)
    tx=tx+tx_vout
    let sequence=''
    for(let i = 0; i< txData.vin.length;i++)
    {
        sequence+=hashUtils.reverseHex(txData.vin[i].sequence.toString(16).padStart(8,'0'))
    }
    tx=tx+hashUtils.doubleSHA256(sequence)
    let vout = ''
    for(let i=0;i<txData.vout.length;i++)
    {
        vout=vout+hashUtils.reverseHex(txData.vout[i].value.toString(16).padStart(16,'0'))+((txData.vout[i].scriptpubkey.length)/2).toString(16).padStart(2,'0')
             +txData.vout[i].scriptpubkey;
    }
    vout = hashUtils.doubleSHA256(vout)
    let msgHash=[]

    for(let i = 0; i< txData.vin.length;i++){
        msgHash.push(tx+(hashUtils.reverseHex(txData.vin[i].txid)+hashUtils.reverseHex(txData.vin[i].vout.toString(16).padStart(8,'0'))))
        msgHash[i] += '1976a914' + txData.vin[i].prevout.scriptpubkey_asm.split(' ')[2] + '88ac'
        msgHash[i]+=hashUtils.reverseHex(txData.vin[i].prevout.value.toString(16).padStart(16,'0'))
        msgHash[i]+=hashUtils.reverseHex(txData.vin[i].sequence.toString(16).padStart(8,'0'))
        msgHash[i]+=vout+hashUtils.reverseHex(txData.locktime.toString(16).padStart(8,'0'))+'01000000'
    }
    return msgHash
}else {
    console.log("Failed to read JSON file or file is empty.");
}
}

module.exports={
    getTxHash,
    getwtxHash,
    getMessageLegacy,
    getMessageWitness,
    calculate_fees,
    calculate_weight
}