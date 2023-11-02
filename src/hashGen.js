const { format } = require('js-conflux-sdk');
const  Web3  = require('web3');
const w3 = new Web3();

const contracts = {
    "eth": {
        "eth_factory_proxy_addr": "0xBbA3c74A006f199193645E35a936B75B605CB2BC",
        "cfx_to_eth_custodian_proxy_addr": "cfx:acfphjkmvy23zww7tpzrrxp3hrs6r70bbyke5zfb5z",
    },
    "bsc": {
        "eth_factory_proxy_addr": "0x32fE96fc98991f198F993C89286DCD6F03c5fC37",
        "cfx_to_eth_custodian_proxy_addr": "cfx:acfgmctw40vy2a608uey5g9t32b8m4kp1268zwhrh1",
    },
    "oec": {
        "eth_factory_proxy_addr": "0x60d911C0806f2A33E06Ad2d0553321220E997DBd",
        "cfx_to_eth_custodian_proxy_addr": "cfx:acf0xp9vrv55gkft3tjntkjagvwme19vcu2wsj39fz",
    },
    "heco": {
        "eth_factory_proxy_addr": "0x32fE96fc98991f198F993C89286DCD6F03c5fC37",
        "cfx_to_eth_custodian_proxy_addr": "cfx:acaw4z5bdgd0np0rukp7wjw7kwkan9xfdaxgms0mp6",
    }
}


// 冷钱包提现至热钱包
// type=”ColdToHot”
// factory=eth_factory_proxy_addr
// token=token地址，ETH则是零地址
// amount=需要提取的金额，decimals与token相同
// nonce=合约里的nonce，需要去合约查（方法见后面）或手动传
function getHashColdEth(type, factory, token, amount, nonce) {
    factory = format.hexAddress(factory);
    token = format.hexAddress(token);
    return w3.utils.soliditySha3(
        { t: 'string', v: type },
        { t: 'address', v: factory },
        { t: 'address', v: token },
        { t: 'uint256', v: amount },
        { t: 'uint256', v: nonce },
    );
}

// 合约升级
// factory=要升级的合约地址，让用户直接传
// new_impl=升级后的implemenation合约地址，让用户直接传
// admin_nonce=升级操作的nonce
function getHashUpgradeImpl(factory, new_impl, admin_nonce) {
    factory = format.hexAddress(factory);
    new_impl = format.hexAddress(new_impl);
    return w3.utils.soliditySha3(
        { t: 'string', v: 'upgrade' },
        { t: 'address', v: factory },
        { t: 'address', v: new_impl },
        { t: 'uint256', v: admin_nonce },
    );
}

module.exports = {
    getHashColdEth,
    getHashUpgradeImpl,
    contracts,
}