const superagent = require('superagent');
const {Conflux} = require('js-conflux-sdk');

const cfxUrl = "http://main.confluxrpc.org";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// sendRawTransaction
// returnValue: (String) transaction hash
async function sendRawTransaction(rawTransaction) {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: '1',
    method: "cfx_sendRawTransaction",
    params: [rawTransaction]
  });
  let finalResult, finalError;
  try {
    const {body: {result, error} = {}} = await superagent
      .post(cfxUrl)
      .send(data)
      .timeout(this.timeout);
    finalResult = result;
    finalError = error;
  } catch (e) {
    throw Error(e);
  }
  if (finalError) throw new Error(JSON.stringify(finalError));
  return finalResult;
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
