<template>
    <div>
        <div>Shuttleflow Hash 生成器</div>
        <el-collapse>

            <el-collapse-item title="EVM链冷钱包转热钱包" name="evmColdToHot">
                <el-form label-width="180px">
                    <el-form-item label="选择链">
                        <el-select v-model="evmCold.selectedChain" placeholder="请选择链" @change="setEvmFactoryAddress">
                            <el-option v-for="(option, index) in chains" :key="index" :label="option"
                                :value="option"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Factory合约地址">
                        <el-input type="string" v-model="evmCold.ethFactoryProxyAddr"
                            placeholder="EVX链->CFX链 跨链Factory地址，选择链后自动填入" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Token合约地址">
                        <el-input v-model="evmCold.tokenAddress" placeholder="从对应链scan上查询后填入，主链Coin填0地址"
                            class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="金额">
                        <el-input type="string" v-model="evmCold.amount" placeholder="单位为wei" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Nonce">
                        <el-input type="number" v-model="evmCold.coldNonce"
                            placeholder="从合约查 hot_to_cold_nonce(token_address)" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" @click="buildEvmColdHash">生成Hash</el-button>
                    </el-form-item>
                    <el-form-item label="Hash结果">
                        <el-input type="text" v-model="evmCold.buildHashMessage"></el-input>
                    </el-form-item>
                </el-form>
            </el-collapse-item>

            <el-collapse-item title="CFX Core冷钱包转热钱包" name="cfxColdToHot">
                <el-form label-width="180px">
                    <el-form-item label="选择对手链">
                        <el-select v-model="cfxCold.selectedChain" placeholder="请选择对手链" @change="setCfxFactoryAddress">
                            <el-option v-for="(option, index) in chains" :key="index" :label="option"
                                :value="option"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Factory合约地址">
                        <el-input type="string" v-model="cfxCold.cfxToEthCustodianProxyAddr"
                            placeholder="CFX链->EVM链 跨链Factory合约地址，选择链后自动填入" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="金额">
                        <el-input type="string" v-model="cfxCold.amount" placeholder="单位为wei" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Nonce">
                        <el-input type="number" v-model="cfxCold.coldNonce"
                            placeholder="从合约查 hot_to_cold_nonce(token_address)" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" @click="buildCfxColdHash">生成Hash</el-button>
                    </el-form-item>
                    <el-form-item label="Hash结果">
                        <el-input type="text" v-model="cfxCold.buildHashMessage"></el-input>
                    </el-form-item>
                </el-form>
            </el-collapse-item>

            <el-collapse-item title="EVM链升级合约" name="evmUpgradeFactory">
                <el-form label-width="180px">
                    <el-form-item label="选择链">
                        <el-select v-model="evmUpgradeFactory.selectedChain" placeholder="请选择链"
                            @change="setEvmFactoryAddressForUpgrade">
                            <el-option v-for="(option, index) in chains" :key="index" :label="option"
                                :value="option"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Factory合约地址">
                        <el-input type="string" v-model="evmUpgradeFactory.ethFactoryProxyAddr"
                            placeholder="跨链Factory合约地址，选择链后自动填入" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="实现合约地址">
                        <el-input type="string" v-model="evmUpgradeFactory.newImplimentAddr" placeholder="新的实现合约地址" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Nonce">
                        <el-input type="number" v-model="evmUpgradeFactory.nonce" placeholder="从合约查 admin_nonce"
                            class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" @click="buildEvmUpgradeHash">生成Hash</el-button>
                    </el-form-item>
                    <el-form-item label="Hash结果">
                        <el-input type="text" v-model="evmUpgradeFactory.buildHashMessage"></el-input>
                    </el-form-item>
                </el-form>
            </el-collapse-item>

            <el-collapse-item title="CFX Core链升级合约" name="cfxUpgradeFactory">
                <el-form label-width="180px">
                    <el-form-item label="选择对手链">
                        <el-select v-model="cfxUpgradeFactory.selectedChain" placeholder="请选择对手链"
                            @change="setCfxFactoryAddressForUpgrade">
                            <el-option v-for="(option, index) in chains" :key="index" :label="option"
                                :value="option"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Factory合约地址">
                        <el-input type="string" v-model="cfxUpgradeFactory.cfxToEthCustodianProxyAddr"
                            placeholder="跨链Factory合约地址，选择链后自动填入" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="实现合约地址">
                        <el-input type="string" v-model="cfxUpgradeFactory.newImplimentAddr" placeholder="新的实现合约地址" class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="Nonce">
                        <el-input type="number" v-model="cfxUpgradeFactory.nonce" placeholder="从合约查 admin_nonce"
                            class="w600"></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" @click="buildCfxUpgradeHash">生成Hash</el-button>
                    </el-form-item>
                    <el-form-item label="Hash结果">
                        <el-input type="text" v-model="cfxUpgradeFactory.buildHashMessage"></el-input>
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
                this.evmCold.buildHashMessage = `计算错误：${e}`
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
                this.cfxCold.buildHashMessage = `计算错误：${e}`
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
                this.evmUpgradeFactory.buildHashMessage = `计算错误：${e}`
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
                this.cfxUpgradeFactory.buildHashMessage = `计算错误：${e}`
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