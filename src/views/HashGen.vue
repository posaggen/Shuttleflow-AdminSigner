<template>
    <div>
        <div>Shuttleflow Hash Generator</div>
        <el-collapse>

            <el-collapse-item title="Transfer from EVM chain cold wallet to hot wallet" name="evmColdToHot">
                <el-form label-width="180px">
                    <el-form-item label="Select Chain">
                        <el-select v-model="evmCold.selectedChain" placeholder="Select Chain" @change="setEvmFactoryAddress">
                            <el-option v-for="(option, index) in chains" :key="index" :label="option"
                                :value="option"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Factory Contract Address">
                        <el-input type="string" v-model="evmCold.ethFactoryProxyAddr"
                            placeholder="EVM chain->CFX chain cross-chain factory address, auto filled on chain selected" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Token Contract Address">
                        <el-input v-model="evmCold.tokenAddress" placeholder="Querying on the chain's scan, such as etherscan, zero address means chain coin"
                            class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Amount">
                        <el-input type="string" v-model="evmCold.amount" placeholder="Uint in wei" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Nonce">
                        <el-input type="number" v-model="evmCold.coldNonce"
                            placeholder="Query on contract: hot_to_cold_nonce(token_address)" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" @click="buildEvmColdHash">Gen Hash</el-button>
                    </el-form-item>
                    <el-form-item label="Hash Result">
                        <el-input type="text" v-model="evmCold.buildHashMessage" class="w600"></el-input>
                    </el-form-item>
                </el-form>
            </el-collapse-item>

            <el-collapse-item title="Transfer from CFX chain core space cold wallet to hot wallet" name="cfxColdToHot">
                <el-form label-width="180px">
                    <el-form-item label="Select Pair Chain">
                        <el-select v-model="cfxCold.selectedChain" placeholder="Select the pair chain" @change="setCfxFactoryAddress">
                            <el-option v-for="(option, index) in chains" :key="index" :label="option"
                                :value="option"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Factory Contract Address">
                        <el-input type="string" v-model="cfxCold.cfxToEthCustodianProxyAddr"
                            placeholder="CFX chain->EVM chain cross-chain factory address, auto filled on chain selected" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Amount">
                        <el-input type="string" v-model="cfxCold.amount" placeholder="Unit in wei" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Nonce">
                        <el-input type="number" v-model="cfxCold.coldNonce"
                            placeholder="Query on contract: hot_to_cold_nonce(token_address)" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" @click="buildCfxColdHash">Gen Hash</el-button>
                    </el-form-item>
                    <el-form-item label="Hash Result">
                        <el-input type="text" v-model="cfxCold.buildHashMessage" class="w600"></el-input>
                    </el-form-item>
                </el-form>
            </el-collapse-item>

            <el-collapse-item title="EVM Chain Upgrade Factory Contract" name="evmUpgradeFactory">
                <el-form label-width="180px">
                    <el-form-item label="Select Chain">
                        <el-select v-model="evmUpgradeFactory.selectedChain" placeholder="Select Chain"
                            @change="setEvmFactoryAddressForUpgrade">
                            <el-option v-for="(option, index) in chains" :key="index" :label="option"
                                :value="option"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Factory Contract Address">
                        <el-input type="string" v-model="evmUpgradeFactory.ethFactoryProxyAddr"
                            placeholder="Cross-chain factory address, auto filled on chain selected" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="New Implement Contract">
                        <el-input type="string" v-model="evmUpgradeFactory.newImplimentAddr" placeholder="New Implement Address" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Nonce">
                        <el-input type="number" v-model="evmUpgradeFactory.nonce" placeholder="Query on contract: admin_nonce"
                            class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" @click="buildEvmUpgradeHash">Gen Hash</el-button>
                    </el-form-item>
                    <el-form-item label="Hash Result">
                        <el-input type="text" v-model="evmUpgradeFactory.buildHashMessage" class="w600"></el-input>
                    </el-form-item>
                </el-form>
            </el-collapse-item>

            <el-collapse-item title="CFX Core Upgrade Factory Contract" name="cfxUpgradeFactory">
                <el-form label-width="180px">
                    <el-form-item label="Select Pair Chain">
                        <el-select v-model="cfxUpgradeFactory.selectedChain" placeholder="Select Pair Chain"
                            @change="setCfxFactoryAddressForUpgrade">
                            <el-option v-for="(option, index) in chains" :key="index" :label="option"
                                :value="option"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Factory Contract Address">
                        <el-input type="string" v-model="cfxUpgradeFactory.cfxToEthCustodianProxyAddr"
                            placeholder="Cross-chain factory address, auto filled on chain selected" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="New Implement Contract">
                        <el-input type="string" v-model="cfxUpgradeFactory.newImplimentAddr" placeholder="New Implement Address" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Nonce">
                        <el-input type="number" v-model="cfxUpgradeFactory.nonce" placeholder="Query on contract: admin_nonce"
                            class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" @click="buildCfxUpgradeHash">Gen Hash</el-button>
                    </el-form-item>
                    <el-form-item label="Hash Result">
                        <el-input type="text" v-model="cfxUpgradeFactory.buildHashMessage" class="w600"></el-input>
                    </el-form-item>
                </el-form>
            </el-collapse-item>


        </el-collapse>
    </div>
</template>

<script>
// import {keysFromMnemonic,getEthWithdrawRawTransaction,getHashUpgradeImpl,signMessageCfx,signMessageEth} from '@/adminSigner
import { getHashColdEth, getHashUpgradeImpl, contracts } from '@/hashGen'
export default {
    name: "Signer",
    methods: {
        setEvmFactoryAddress() {
            this.evmCold.ethFactoryProxyAddr = contracts[this.evmCold.selectedChain.toLowerCase()].eth_factory_proxy_addr
        },
        buildEvmColdHash() {
            try {
                const { ethFactoryProxyAddr, tokenAddress, amount, coldNonce } = this.evmCold
                this.evmCold.buildHashMessage = getHashColdEth("ColdToHot", ethFactoryProxyAddr, tokenAddress, amount, coldNonce)
            } catch (e) {
                this.evmCold.buildHashMessage = `Calculate error: ${e}`
            }
        },


        setCfxFactoryAddress() {
            this.cfxCold.cfxToEthCustodianProxyAddr = contracts[this.cfxCold.selectedChain.toLowerCase()].cfx_to_eth_custodian_proxy_addr
        },
        buildCfxColdHash() {
            try {
                const { cfxToEthCustodianProxyAddr, tokenAddress, amount, coldNonce } = this.cfxCold
                this.cfxCold.buildHashMessage = getHashColdEth("ColdToHot", cfxToEthCustodianProxyAddr, tokenAddress, amount, coldNonce)
            } catch (e) {
                this.cfxCold.buildHashMessage = `Calculate error: ${e}`
            }
        },

        setEvmFactoryAddressForUpgrade() {
            this.evmUpgradeFactory.ethFactoryProxyAddr = contracts[this.evmUpgradeFactory.selectedChain.toLowerCase()].eth_factory_proxy_addr
        },
        buildEvmUpgradeHash() {
            try {
                const { ethFactoryProxyAddr, newImplimentAddr, nonce } = this.evmUpgradeFactory
                this.evmUpgradeFactory.buildHashMessage = getHashUpgradeImpl(ethFactoryProxyAddr, newImplimentAddr, nonce)
            } catch (e) {
                this.evmUpgradeFactory.buildHashMessage = `Calculate error: ${e}`
            }
        },

        setCfxFactoryAddressForUpgrade() {
            this.cfxUpgradeFactory.cfxToEthCustodianProxyAddr = contracts[this.cfxUpgradeFactory.selectedChain.toLowerCase()].cfx_to_eth_custodian_proxy_addr
        },
        buildCfxUpgradeHash() {
            try {
                const { cfxToEthCustodianProxyAddr, newImplimentAddr, nonce } = this.cfxUpgradeFactory
                this.cfxUpgradeFactory.buildHashMessage = getHashUpgradeImpl(cfxToEthCustodianProxyAddr, newImplimentAddr, nonce)
            } catch (e) {
                this.cfxUpgradeFactory.buildHashMessage = `Calculate error: ${e}`
            }
        },
    },
    data() {
        return {
            chains: ['ETH', 'BSC', 'OEC', 'HECO'],
            //   activeNames: ['account'],
            evmCold: {
                selectedChain: '',
                ethFactoryProxyAddr: '',
                tokenAddress: '',
                amount: '',
                coldNonce: 0,
                buildHashMessage: ''
            },
            cfxCold: {
                selectedChain: '',
                cfxToEthCustodianProxyAddr: '',
                tokenAddress: '0x0000000000000000000000000000000000000000',
                amount: '',
                coldNonce: 0,
                buildHashMessage: ''
            },
            evmUpgradeFactory: {
                selectedChain: '',
                ethFactoryProxyAddr: '',
                newImplimentAddr: '',
                nonce: 0,
                buildHashMessage: ''
            },
            cfxUpgradeFactory: {
                selectedChain: '',
                cfxToEthCustodianProxyAddr: '',
                newImplimentAddr: '',
                nonce: 0,
                buildHashMessage: ''
            },
        }
    }
}
</script>

<style scoped>
.w600 {
    width: 600px;
}

.ml6 {
    margin-left: 6px;
}
</style>