
const { createHash } = require('crypto');
const hashUtils = require('./hashUtils.js')
const difficulty = Buffer.from('0000ffff00000000000000000000000000000000000000000000000000000000', 'hex');


  

function createHeader(txids){
    let header='011000000000000000000000000000000000000000000000000000000000000000000000';//hash appended with version and prevblock
    header=header+(hashUtils.merkleRoot(txids));
    const _time = Math.floor(Date.now() / 1000); // Current time in UNIX timestamp format

// Convert time to little-endian byte order
const littleEndianTime = Buffer.allocUnsafe(4);
littleEndianTime.writeUInt32LE(_time, 0);

// Append little-endian time to the header
header += littleEndianTime.toString('hex');

    const bits = '0x1f00ffff';

    // Convert bits to little-endian byte order
    const littleEndianBits = Buffer.allocUnsafe(4);
    littleEndianBits.writeUint32LE(bits,0);
    
    // Append little-endian bits to the header
    header += littleEndianBits.toString('hex');
    let _header=header
    // Generate a random nonce between 0 and 2^32 - 1 (0xffffffff)
    while(true)
    {
      header=_header
      

    const nonce = Math.floor(Math.random() * 0x100000000);
    const littleEndianNonce = Buffer.allocUnsafe(4);
    littleEndianNonce.writeUInt32LE(nonce, 0);

  // Append little-endian nonce to the header
  header += littleEndianNonce.toString('hex');

  let hash = hashUtils.doubleSHA256(header)
  hash=Buffer.from(hashUtils.reverseHex(hash),'hex')
  if(difficulty.compare(hash) > 0)break
    }

    return header
}

module.exports = {
    createHeader
};