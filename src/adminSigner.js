const bitcoin = require('bitcoinjs-lib');
const {Conflux} = require('js-conflux-sdk');
const bip39 = require('bip39');
const bip32 = require('bip32');
const hdkey = require('ethereumjs-wallet/hdkey');
const cfx = new Conflux({});
const fs = require('fs');
const BigNumber = require('bignumber.js');
const Web3 = require('web3');
const w3 = new Web3();

const network = bitcoin.networks.bitcoin;

const tokenBase =  JSON.parse(
  fs.readFileSync(__dirname + '/../build/TokenBase.json'),
);

const tokenContract = cfx.Contract({
  abi: tokenBase.abi,
});

const cETH = "0x86d2fb177eff4be03a342951269096265b98ac46";
const proxy = "0x890e3feac4a2c33d7594bc5be62e7970ef5481e0";
const addr0 = "0x0000000000000000000000000000000000000000";

function getAddress(node) {
  return bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network,
  }).address;
}

// get conflux address from given private key
// returnValue: (Object) conflux address & privateKey
function keysFromPrivateKey(privateKey) {
  if (!(privateKey.startsWith('0x')))
    privateKey = `0x${privateKey}`;
  return {
    address: cfx.Account(privateKey).address,
    privateKey: privateKey,
  };
}

// get conflux address from given mnemonic
// returnValue: (Object) conflux address & privateKey
function keysFromMnemonic(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed, network);
  const child = root.derivePath("m/44'/0'/0'/0/0");
  const res = {};
  res.mnemonic = mnemonic;
  res.bitcoin = {
    address: getAddress(child, network),
    publicKey: child.publicKey.toString('hex'),
    privateKey: child.privateKey.toString('hex'),
    WIF: child.toWIF(),
  };
  const hdwallet = hdkey.fromMasterSeed(seed);
  const wallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
  res.ethereum = {
    address: `0x${wallet.getAddress().toString('hex')}`,
    privateKey: wallet.getPrivateKey().toString('hex'),
  };
  const cfx_wallet = hdwallet.derivePath(`m/44'/503'/0'/0/0`).getWallet();
  res.conflux = {
    address: `0x${'1' + cfx_wallet.getAddress().toString('hex').substring(1)}`,
    privateKey: `0x${cfx_wallet.getPrivateKey().toString('hex')}`,
  };
  return res.conflux;
}

// get eth withdraw raw transaction
// returnValue: (String) raw transaction in hex format
function getEthWithdrawRawTransaction(amount, toAddress, nonce, epochHeight, privateKey) {
  let keys = keysFromPrivateKey(privateKey);
  let owner = cfx.Account(keys.privateKey);
  let txParams = {
    from: owner.address,
    to: cETH,
    value: 0,
    gas: "1000000", // 100w gas
    gasPrice: "100000000000", // 100 Gdrip
    storageLimit: 1000,
    nonce: nonce,
    epochHeight: epochHeight,
    data: tokenContract.burn(
      owner.address, // user address
      (new BigNumber(amount)).multipliedBy(1e18).toString(10), // burn amount
      (new BigNumber(amount)).multipliedBy(1e18).toString(10), // max burn fee
      toAddress, // eth address
      addr0 // relayer address
    ).data,
  };
  return owner.signTransaction(txParams).serialize();
}

// get contract upgrade signature
// returnValue: (String) signature
function getHashUpgradeImpl(newImpl, adminNonce) {
  return w3.utils.soliditySha3(
    {t: 'string', v: 'upgrade'},
    {t: 'address', v: proxy},
    {t: 'address', v: newImpl},
    {t: 'uint256', v: adminNonce},
  );
}

module.exports = {
  keysFromMnemonic: keysFromMnemonic,
  keysFromPrivateKey: keysFromPrivateKey,
  getEthWithdrawRawTransaction: getEthWithdrawRawTransaction,
  getHashUpgradeImpl: getHashUpgradeImpl,
};
