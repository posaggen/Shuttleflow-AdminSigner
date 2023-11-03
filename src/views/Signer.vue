<template>
  <div>
    <div>Shuttleflow Admin Signer</div>
    <el-collapse v-model="activeNames">
      <el-collapse-item title="账号配置" name="account">
        <el-form label-width="180px">
          <el-form-item label="">
            <template slot="label">Admin助记词</template>
            <el-input v-model="mnemonic" @change="loadFromMnemonic" placeholder="老板填，修改后自动导入" class="w600"></el-input>
            <span class="ml6">{{accountMessage}}</span>
          </el-form-item>
          <el-form-item label="Admin Conflux地址">
            <el-input v-model="accountCfxAddress" readonly placeholder="点我自动显示" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="Admin Ethereum地址">
            <el-input v-model="accountEthAddress" readonly placeholder="点我自动显示" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="Admin Bitcoin地址">
            <el-input v-model="accountBitAddress" readonly placeholder="点我自动显示" class="w600"></el-input>
          </el-form-item>
        </el-form>
      </el-collapse-item>

      <el-collapse-item title="cETH提现" name="withdraw">
        <el-form label-width="180px">
      <el-form-item label="提现金额(cETH)">
        <el-input type="number" v-model="withdrawAmount" aria-placeholder="老板填" class="w600"></el-input>
      </el-form-item>
      <el-form-item label="提现地址(ETH地址)">
        <el-input v-model="withdrawToAddress" aria-placeholder="老板填" class="w600"></el-input>
      </el-form-item>
      <el-form-item label="Admin Nonce">
        <el-input  type="number"  v-model="adminNonce" aria-placeholder="老板填" class="w600"></el-input>
      </el-form-item>
      <el-form-item label="Epoch高度">
        <el-input  type="number"  v-model="epochNumber" aria-placeholder="老板填" class="w600"></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="buildWithdraw">生成RawTransaction</el-button>
        <span class="ml6">{{withdrawMessage}}</span>
        <el-button type="primary" @click="saveWithdraw" class="ml6">保存到txt</el-button>
      </el-form-item>
      <el-form-item label="">
        <el-input type="textarea" :rows="5" v-model="rawWithdrawTx"></el-input>
      </el-form-item>
    </el-form>
      </el-collapse-item>

      <el-collapse-item title="Conflux消息签名" name="cfxSign">
        <el-form label-width="180px">
          <el-form-item label="待签名消息">
            <el-input v-model="hashToSign" aria-placeholder="老板填" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" @click="getHashUpgradeImpl">生成Conflux签名</el-button>
            <span class="ml6">{{contractSignMessage}}</span>
            <el-button type="primary" @click="saveContractSign" class="ml6">保存到txt</el-button>
          </el-form-item>
          <el-form-item label="签名结果">
            <el-input type="text" :rows="5" v-model="contractSign" class="w600"></el-input>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      
      <el-collapse-item title="Ethereum消息签名" name="ethSign">
        <el-form label-width="180px">
          <el-form-item label="待签名消息">
            <el-input v-model="hashToSignEth" aria-placeholder="老板填" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" @click="getHashUpgradeEthImpl">生成Ethereum签名</el-button>
            <span class="ml6">{{ethSignMessage}}</span>
            <el-button type="primary" @click="saveEthSign" class="ml6">保存到txt</el-button>
          </el-form-item>
          <el-form-item label="签名结果">
            <el-input type="text" :rows="5" v-model="ethSign" class="w600"></el-input>
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import {keysFromMnemonic,getEthWithdrawRawTransaction,getHashUpgradeImpl,signMessageCfx,signMessageEth} from '@/adminSigner'
import fileDownload from 'js-file-download'
export default {
  name: "Signer",
  methods: {
    saveContractSign() {
      const data = {
        hashToSign: this.hashToSign,
        signBy: this.accountCfxAddress,
        confluxSign: this.contractSign,
        time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
      }
      const dataStr = JSON.stringify(data, null, 4)
      const from = this.hashToSign.substr(2, 6)
      let filename = `${new Date().Format("yyyy-MM-dd_hh-mm-ss")}_Conflux_${from}.txt`;
      fileDownload(dataStr, filename);
    },
    saveEthSign() {
      const data = {
        ethHashToSign: this.hashToSignEth,
        signBy: this.accountEthAddress,
        ethSign: this.ethSign,
        time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
      }
      const dataStr = JSON.stringify(data, null, 4)
      const from = this.hashToSignEth.substr(2, 6)
      let filename = `${new Date().Format("yyyy-MM-dd_hh-mm-ss")}_Eth_${from}.txt`;
      fileDownload(dataStr, filename);
    },
    getHashUpgradeEthImpl() {
      try {
        this.ethSign = signMessageEth(this.hashToSignEth, this.account.ethereum.privateKey)
        this.ethSignMessage = 'Ethereum签名成功'
      } catch (e) {
        this.ethSignMessage = `Ethereum签名出错：${e}`
      }
    },
    getHashUpgradeImpl() {
      try {
        this.contractSign = signMessageCfx(this.hashToSign, this.account.conflux.privateKey)
        this.contractSignMessage = 'Conflux签名成功'
      } catch (e) {
        this.contractSignMessage = `Conflux签名出错：${e}`
      }
    },
    saveWithdraw() {
      const data = {
        rawWithdrawTx: this.rawWithdrawTx,
        fromAddress: this.accountAddress,
        withdrawAmount: this.withdrawAmount,
        withdrawToAddress: this.withdrawToAddress,
        nonce: this.adminNonce,
        epochNumber: this.epochNumber,
        token: "ETH",
        time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
      }
      const dataStr = JSON.stringify(data, null, 4)
      const from = this.accountAddress.substr(2, 6)
      const to = this.withdrawToAddress.substr(2, 6)
      let filename = `${new Date().Format("yyyy-MM-dd_hh-mm-ss")}_${this.withdrawAmount}ETH_FROM_${from}_TO_${to}.txt`;
      fileDownload(dataStr, filename);
    },
    buildWithdraw() {
      try {
        if (this.accountAddress === '') throw new Error('请先设置账号')
        if (this.withdrawAmount === '') throw new Error('请输入提现金额')
        if (this.withdrawToAddress === '') throw new Error('请输入提现地址')
        if (this.adminNonce === '') throw new Error('请输入AdminNonce')
        if (this.epochNumber === '') throw new Error('请输入Epoch高度')
        this.rawWithdrawTx = '';
        this.rawWithdrawTx = getEthWithdrawRawTransaction(this.withdrawAmount, this.withdrawToAddress, this.adminNonce, this.epochNumber, this.privateKey)
        this.withdrawMessage = '生成交易数据成功'
      } catch (e) {
        this.withdrawMessage = `${e}`
      }
    },
    loadFromMnemonic(){
      try {
        this.account = keysFromMnemonic(this.mnemonic)
        this.accountCfxAddress = this.account.conflux.address
        this.accountEthAddress = this.account.ethereum.address
        this.accountBitAddress = this.account.bitcoin.address
        this.accountMessage = '助记词导入成功'
      } catch (e) {
        this.accountMessage = `导入出错：${e}`
      }
    },
  },
  data() {
    return {
      activeNames: ['account'],
      //
      account: {},// multiple account
      mnemonic: '',
      accountCfxAddress: '',
      accountEthAddress: '',
      accountBitAddress: '',
      accountMessage: '',
      //
      rawWithdrawTx: '',
      withdrawAmount: '',
      withdrawToAddress: '',
      adminNonce: '',
      epochNumber: '',
      withdrawMessage: '',
      // conflux
      hashToSign: '',
      contractNonce: '',
      contractSignMessage: '',
      contractSign: '', // conflux
      // eth
      hashToSignEth: '',
      ethSignMessage: '',
      ethSign: '',
    }
  }
}
</script>

<style scoped>
 .w600{
   width: 600px;
 }
 .ml6{
   margin-left: 6px;
 }
</style>