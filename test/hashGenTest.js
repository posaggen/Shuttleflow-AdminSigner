const { expect } = require("chai");
const { getHashColdEth, getHashUpgradeImpl, contracts } = require('../src/hashGen');
const  Web3  = require('web3');
var BN = new Web3().utils.BN;

/**
    测试用例：
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
**/


describe("test hash_gen", async function () {
    const zeroAddr = "0x0000000000000000000000000000000000000000"
    const ethInWei = new BN("1000000000000000000")
    const btcInWei = new BN("100000000")

    it("test transfer cfx_chain_cfx_token of bsc-cfx pair from cold wallet", async function () {
        const amount = (new BN("40000000")).mul(ethInWei)
        const h = getHashColdEth("ColdToHot", contracts.bsc.cfx_to_eth_custodian_proxy_addr, zeroAddr, amount, 5)
        expect(h).equals("0x23019a05338eb4f591d8dfccdef7f4af2e05eb33226c61c4baa0f9cd8d63ae03")
    })

    it("test transfer eth_chain_eth_token of eth-cfx pair to cold wallet", async function () {
        const amount = (new BN("400")).mul(ethInWei)
        const h = getHashColdEth("ColdToHot", contracts.eth.eth_factory_proxy_addr, zeroAddr, amount, 31)
        expect(h).equals("0x2c0a8241e6528006bd2894d0574c625049ee82bec0af5fb6baaa2b059087d668")
    })

    it("test eth_chain_wbtc_token to cold wallet", async function () {
        const amount = (new BN("10")).mul(btcInWei)
        const wbtcAddr = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
        const h = getHashColdEth("ColdToHot", contracts.eth.eth_factory_proxy_addr, wbtcAddr, amount, 31)
        expect(h).equals("0xc519216351e53404cbb690bff6ab850eff9ba3e052aed1104638f276caf16339")
    })

    it("test cfx chain upgrade contract", async function () {
        const factory="cfx:aceu6t9m2wvpgtnzww8f13vstf2s8zeb6a4eja1756"
        const new_impl="cfx:acakseutvbdphfwxr4fp48y0epeyx4g2mevman5ygb"
        const h = getHashUpgradeImpl(factory,new_impl,4)
        expect(h).equals("0x62ff559379debb92ab0de778eeef4b27170316ee7def50ae9bba3146af062f63")
    })
});