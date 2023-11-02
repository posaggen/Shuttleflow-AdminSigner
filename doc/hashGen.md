# 合约地址
这是每个跨链对的bridge合约的地址（比如eth就是eth和conflux之间的跨链）。
每个跨链对包含两个bridge合约，其中eth_factory_proxy_addr部署在evm链上。cfx_to_eth_custodian_proxy_addr部署在Conflux core space。
```
 {
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
```
​
# 冷钱包提现至热钱包
有两种Case，一种是EVM上的资产（例如ETH、USDT），需要与EVM链的合约（eth_factory_proxy）交互。另一种是Core space的资产（例如CFX），需要与Conflux的合约（cfx_to_eth_custodian_proxy）交互。

而只有规定的某些token会做冷热钱包的区分，其他的token不论金额都存在热钱包里：
- ETH：ETH、USDT、WBTC、USDC
- Conflux：CFX

## 1. EVM
EVM链上冷钱包转热钱包需要签的hash可以如下生成：
```js
const { format } = require('js-conflux-sdk');
const Web3 = require('web3');
const w3 = new Web3();

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
```

其中：
- type=”ColdToHot”
- factory=eth_factory_proxy_addr
- token=token地址，ETH则是零地址
- amount=需要提取的金额，decimals与token相同
- nonce=合约里的nonce，需要去合约查（方法见后面）或手动传

## 2. Conflux Core

Hash生成规则和EVM的完全相同，参数：
- type=”ColdToHot”
- factory=cfx_to_eth_custodian_proxy_addr
- token=token地址，CFX则是零地址
- amount=需要提取的金额，decimals与token相同
- nonce=合约里的nonce，需要去合约查（方法见后面）或手动传

## 3. 冷转热nonce获取
如果CLI参数不传nonce，可以上链获取。eth_factory和cfx_to_eth_custodian合约都有一个nonce mapping:
```js
mapping(address => uint256) public hot_to_cold_nonce;
```
​
# 合约升级
另一个需要用到签名的是合约升级的功能，hash生成方法：
```js
const { format } = require('js-conflux-sdk');
const Web3 = require('web3');
const w3 = new Web3();

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
```

其中：
- factory=要升级的合约地址，让用户直接传
- new_impl=升级后的implemenation合约地址，让用户直接传
- admin_nonce=升级操作的nonce

所有跨链合约都有一个nonce的state:

```js
uint256 public admin_nonce;
```
​
# 测试

几个case
```js
// bsc-cfx跨链对，cfx冷转热，数量40000000，nonce=5

0x23019a05338eb4f591d8dfccdef7f4af2e05eb33226c61c4baa0f9cd8d63ae03

// eth-cfx跨链对，eth冷转热，数量400，nonce=31

0x2c0a8241e6528006bd2894d0574c625049ee82bec0af5fb6baaa2b059087d668

// eth-cfx跨链对，wbtc冷转热，数量10，nonce=31

0xc519216351e53404cbb690bff6ab850eff9ba3e052aed1104638f276caf16339

// 合约升级
// factory = cfx:aceu6t9m2wvpgtnzww8f13vstf2s8zeb6a4eja1756
// new_impl = cfx:acakseutvbdphfwxr4fp48y0epeyx4g2mevman5ygb
// admin_nonce = 4

0x62ff559379debb92ab0de778eeef4b27170316ee7def50ae9bba3146af062f63
```