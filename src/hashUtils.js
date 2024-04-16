const crypto = require('crypto');
const { createHash } = require('crypto');

function reverseHex(hexString) {
    if (!/^[0-9A-Fa-f]+$/g.test(hexString)) {
        return "Invalid hexadecimal string";
    }

    const pairs = hexString.match(/.{1,2}/g);

    const reversedPairs = pairs.reverse();

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


function merkleRoot(txids){
    if (!txids.length) return null
    let current = txids.map((txid) =>reverseHex(txid))
    while (current.length > 1) {
      let next = []
      for (let i = 0; i < current.length; i += 2) {
        let twoHash
        if (i + 1 === current.length) twoHash = hash256(current[i] + current[i])
         else twoHash = hash256(current[i] + current[i + 1])
         next.push(twoHash)}
      current = next }
    return current[0]
}

module.exports = {
    reverseHex,
    doubleSHA256,
    getTxid,
    getFilename,
    SHA256,
    merkleRoot
};
