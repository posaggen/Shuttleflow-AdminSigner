<template>
  <div>
    <div>Shuttleflow Admin Signer</div>
    <el-collapse v-model="activeNames">
      <el-collapse-item title="Account" name="account">
        <el-form label-width="180px">
          <el-form-item label="">
            <template slot="label">Admin Mnemonic</template>
            <el-input v-model="mnemonic" @change="loadFromMnemonic" placeholder="Please fill out" class="w600"></el-input>
            <span class="ml6">{{accountMessage}}</span>
          </el-form-item>
          <el-form-item label="Admin Conflux Address">
            <el-input v-model="accountCfxAddress" readonly placeholder="Click to display" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="Admin Ethereum Address">
            <el-input v-model="accountEthAddress" readonly placeholder="Click to display" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="Admin Bitcoin Address">
            <el-input v-model="accountBitAddress" readonly placeholder="Click to display" class="w600"></el-input>
          </el-form-item>
        </el-form>
      </el-collapse-item>

    </el-form>
      </el-collapse-item>
      <el-collapse-item title="Conflux Message Sign" name="cfxSign">
        <el-form label-width="180px">
          <el-form-item label="Message">
            <el-input v-model="hashToSign" aria-placeholder="Please fill out" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" @click="getHashUpgradeImpl">Generate Conflux Signature</el-button>
            <span class="ml6">{{contractSignMessage}}</span>
            <el-button type="primary" @click="saveContractSign" class="ml6">save to txt</el-button>
          </el-form-item>
          <el-form-item label="Signature">
            <el-input type="text" :rows="5" v-model="contractSign" class="w600"></el-input>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <el-collapse-item title="Ethereum Message Sign" name="ethSign">
        <el-form label-width="180px">
          <el-form-item label="Message">
            <el-input v-model="hashToSignEth" aria-placeholder="Please fill out" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" @click="getHashUpgradeEthImpl">Generate Ethereum Signature</el-button>
            <span class="ml6">{{ethSignMessage}}</span>
            <el-button type="primary" @click="saveEthSign" class="ml6">save to txt</el-button>
          </el-form-item>
          <el-form-item label="Signature">
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
        this.ethSignMessage = 'Ethereum Sign Succeed.'
      } catch (e) {
        this.ethSignMessage = `Ethereum Sign Failed：${e}`
      }
    },
    getHashUpgradeImpl() {
      try {
        this.contractSign = signMessageCfx(this.hashToSign, this.account.conflux.privateKey)
        this.contractSignMessage = 'Conflux Sign Succeed.'
      } catch (e) {
        this.contractSignMessage = `Conflux Sign Failed：${e}`
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
        this.accountMessage = 'Mnemonic imported.'
      } catch (e) {
        this.accountMessage = `Mnemonic import error：${e}`
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