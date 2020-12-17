const {Conflux} = require('js-conflux-sdk');

const cfxUrl = "http://main.confluxrpc.org";

// sendRawTransaction
// returnValue: (String) transaction hash
async function sendRawTransaction(rawTransaction) {
  const cfx = new Conflux({url: cfxUrl});
  let hash = await cfx.sendRawTransaction(rawTransaction);
  return hash;
}

// get transaction information
// returnValue: (Object) hash, status, scanUrl
async function checkTransaction(hash) {
  const cfx = new Conflux({url: cfxUrl});
  let receipt = await cfx.getTransactionReceipt(hash);
  let status;
  if (receipt !== null) {
    if (receipt.outcomeStatus === 0) {
      status = "transaction succeed";
    } else {
      status = "transaction failed";
    }
  } else {
    status = "transaction confirming";
  }
  let res = {
    hash: hash,
    status: status,
    scanUrl: `https://www.confluxscan.io/transaction/${hash}`,
  };
}

module.exports = {
  checkTransaction: checkTransaction,
  sendRawTransaction: sendRawTransaction,
};
