<template>
  <div>
    <div>Shuttleflow Admin Signer</div>
    <el-collapse v-model="activeNames">
      <el-collapse-item title="账号配置" name="account">
        <el-form label-width="180px">
          <el-form-item label="Admin私钥">
            <el-input v-model="privateKey" @change="loadPrivateKey" placeholder="老板填，修改后自动导入" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="">
            <template slot="label"><span style="color: orange">或</span>Admin助记词</template>
            <el-input v-model="mnemonic" @change="loadFromMnemonic" placeholder="老板填，修改后自动导入" class="w600"></el-input>
          </el-form-item>
          <el-form-item label="Admin地址">
            <el-input v-model="accountAddress" readonly placeholder="点我自动显示" class="w600"></el-input>
            <span class="ml6">{{accountMessage}}</span>
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
      <el-collapse-item title="合约升级" name="contract">
        <el-form label-width="180px">
      <el-form-item label="新合约地址">
        <el-input v-model="newContractAddress" aria-placeholder="老板填" class="w600"></el-input>
      </el-form-item>
      <el-form-item label="合约nonce">
        <el-input type="number" v-model="contractNonce" aria-placeholder="老板填" class="w600"></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="getHashUpgradeImpl">生成签名</el-button>
        <span class="ml6">{{contractSignMessage}}</span>
        <el-button type="primary" @click="saveContractSign" class="ml6">保存到txt</el-button>
      </el-form-item>
      <el-form-item label="">
        <el-input type="text" :rows="5" v-model="contractSign" class="w600"></el-input>
      </el-form-item>
    </el-form>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import {keysFromPrivateKey,keysFromMnemonic,getEthWithdrawRawTransaction,getHashUpgradeImpl,signMessageCfx} from '@/adminSigner'
import fileDownload from 'js-file-download'
export default {
  name: "Signer",
  methods: {
    saveContractSign() {
      const data = {
        newContractAddress: this.newContractAddress,
        contractNonce: this.contractNonce,
        contractSign: this.contractSign,
        time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
      }
      const dataStr = JSON.stringify(data, null, 4)
      const from = this.newContractAddress.substr(2, 6)
      const to = this.contractNonce
      let filename = `${new Date().Format("yyyy-MM-dd_hh-mm-ss")}_Contract_${from}_Nonce_${to}.txt`;
      fileDownload(dataStr, filename);
    },
    getHashUpgradeImpl() {
      try {
        this.contractSign = signMessageCfx(getHashUpgradeImpl(this.newContractAddress, this.contractNonce), this.privateKey)
        this.contractSignMessage = '签名成功'
      } catch (e) {
        this.contractSignMessage = `${e}`
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
        const account = keysFromMnemonic(this.mnemonic)
        this.accountAddress = account.address
        this.privateKey = account.privateKey
        this.accountMessage = '助记词导入成功'
      } catch (e) {
        this.accountMessage = `${e}`
      }
    },
    loadPrivateKey(){
      try {
        const account = keysFromPrivateKey(this.privateKey)
        this.accountAddress = account.address
        this.accountMessage = '私钥导入成功'
      } catch (e) {
        this.accountMessage = `${e}`
      }
    }
  },
  data() {
    return {
      activeNames: ['account'],
      //
      privateKey: '',
      mnemonic: '',
      accountAddress: '',
      accountMessage: '',
      //
      rawWithdrawTx: '',
      withdrawAmount: '',
      withdrawToAddress: '',
      adminNonce: '',
      epochNumber: '',
      withdrawMessage: '',
      //
      newContractAddress: '',
      contractNonce: '',
      contractSignMessage: '',
      contractSign: '',
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