const bitcoin = require('bitcoinjs-lib');
const {Conflux} = require('js-conflux-sdk');
const bip39 = require('bip39');
const bip32 = require('bip32');
const hdkey = require('ethereumjs-wallet/hdkey');
const cfx = new Conflux({});
const BigNumber = require('bignumber.js');
const Web3 = require('web3');
const w3 = new Web3();
const {util} = require('js-conflux-sdk');

const network = bitcoin.networks.bitcoin;

const tokenBase =  require('./TokenBase.json')

const tokenContract = cfx.Contract({
  abi: tokenBase.abi,
});

const cETH = "0x86d2fb177eff4be03a342951269096265b98ac46";
const proxy = "0x890e3feac4a2c33d7594bc5be62e7970ef5481e0";
//const proxy = "0x89ee646e8ec9184fde03d4a6f73ba5b198d07974";
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
    chainId: 1029,
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

// get contract upgrade hash
// returnValue: (String) hash
function getHashUpgradeImpl(newImpl, adminNonce) {
  return w3.utils.soliditySha3(
    {t: 'string', v: 'upgrade'},
    {t: 'address', v: proxy},
    {t: 'address', v: newImpl},
    {t: 'uint256', v: adminNonce},
  );
}

// get upgrade signature
// returnValue: (String) signature
function signMessageCfx(hash, priv_key) {
  let hash_buf = Buffer.from(hash.substring(2), 'hex');
  let sig = util.sign.ecdsaSign(
    hash_buf,
    Buffer.from(priv_key.substring(2), 'hex'),
  );
  let hex_sig = `0x${sig.r.toString('hex')}${sig.s.toString(
    'hex',
  )}${Buffer.from([sig.v]).toString('hex')}`;
  return hex_sig;
}

function recoverCFXAddress(signature, hash) {
  let hash_buf = Buffer.from(hash.substring(2), 'hex');
  let signature_buf = Buffer.from(signature.substring(2), 'hex');
  let sig = {};
  sig.r = signature_buf.slice(0, 32);
  sig.s = signature_buf.slice(32, 64);
  sig.v = parseInt(signature_buf.slice(64, 65).toString('hex'), 16);
  let signer = `0x${util.sign
    .publicKeyToAddress(util.sign.ecdsaRecover(hash_buf, sig))
    .toString('hex')}`;
  return signer.toLowerCase();
}

module.exports = {
  keysFromMnemonic: keysFromMnemonic,
  keysFromPrivateKey: keysFromPrivateKey,
  getEthWithdrawRawTransaction: getEthWithdrawRawTransaction,
  getHashUpgradeImpl: getHashUpgradeImpl,
  signMessageCfx: signMessageCfx,
};

let hash = getHashUpgradeImpl("0x86ff0b16259a41da07054406049904a68839377f", 0);
console.log(hash);
let sig = "0xdf8bf4717e6be3697ade9fb99cdd3ad0993be7a7870cd3d93d54127485220c2821ed2f4f55a4d6b889c57ce7b2308d7df80f1f2e8927d13829039860e8b79ac200";
//let sig = "0x828f34d420148bb7c1e436005e64e30103132ad3e38934eb972d012ccd2ecff628b1f28dec0fe985046d0ef69a4487a0bd451abbd266c835bffbfe889c11d27e01";
//let sig = "0x49521bf79dea2d3e6ba3d7c34c2e20a78c449507aa7d5224c9460e44a994d2710cdb5565610e922e16cfa46dbc0a140456ea207b08af02e7141cc012eb4762c500";
console.log(recoverCFXAddress(sig, hash));
