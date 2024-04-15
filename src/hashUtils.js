const crypto = require('crypto');
const { createHash } = require('crypto');

function reverseHex(hexString) {
    // Check if the input is a valid hexadecimal string
    if (!/^[0-9A-Fa-f]+$/g.test(hexString)) {
        return "Invalid hexadecimal string";
    }

    // Split the hexadecimal string into pairs of characters
    const pairs = hexString.match(/.{1,2}/g);

    // Reverse the order of the pairs
    const reversedPairs = pairs.reverse();

    // Join the reversed pairs back together
    const reversedHexString = reversedPairs.join('');

    return reversedHexString;
}

function hash256(input){
    const h1 = createHash('sha256').update(Buffer.from(input, 'hex')).digest()
    return createHash('sha256').update(h1).digest('hex')
  }

function doubleSHA256(input) {
    const firstHash = crypto.createHash('sha256').update(Buffer.from(input, 'hex')).digest();
    const secondHash = crypto.createHash('sha256').update(firstHash).digest();
    return secondHash.toString('hex');
}

function getTxid(inputHex) {
    const firstHash = doubleSHA256(inputHex);
    return reverseHex(firstHash);
}

function getFilename(input) {
    return SHA256(getTxid(input));
}

function SHA256(input) {
    return crypto.createHash('sha256').update(Buffer.from(input, 'hex')).digest().toString('hex');
}


function getMerkleRoot(txids){
    if (!txids.length) return null

    let level = txids.map((txid) => Buffer.from(txid, 'hex').reverse().toString('hex'))
  
    while (level.length > 1) {
      const nextLevel = []
  
      for (let i = 0; i < level.length; i += 2) {
        let pairHash
        if (i + 1 === level.length) {
          pairHash = hash256(level[i] + level[i])
        } else {
          pairHash = hash256(level[i] + level[i + 1])
        }
        nextLevel.push(pairHash)
      }
  
      level = nextLevel
    }
  
    return level[0]
}


// Export the functions to make them accessible from other files
module.exports = {
    reverseHex,
    doubleSHA256,
    getTxid,
    getFilename,
    SHA256,
    getMerkleRoot
};
