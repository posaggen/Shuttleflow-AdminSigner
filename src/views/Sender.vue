<template>
  <div>
    <div>Raw Transaction Sender</div>
    <div>
    <el-form label-width="">
      <el-form-item label="Raw Transaction">
        <el-input type="textarea" :rows="5" placeholder="老板填" v-model="rawTx" clearable></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="sendTx" :disabled="rawTx === ''">发送</el-button>
        <span class="ml6">{{sendMessage}}</span>
      </el-form-item>
    </el-form>
    <el-row>
      <el-col :span="12">
        <el-form>
      <el-form-item label="交易状态">
        <el-button size="mini" @click="checkTx">刷新</el-button>
      </el-form-item>
      <el-form-item label="交易Hash">        {{retHash}}      </el-form-item>
      <el-form-item label="交易状态">        {{status}}      </el-form-item>
      <el-form-item label="Scan url">
        <a target="_blank" :href="scanLink">{{scanLink}}</a>
      </el-form-item>
      <el-form-item label="">        {{checkMessage}}      </el-form-item>
    </el-form>
      </el-col>
      <el-col :span="12">
        <div>发送历史：{{list.length}}</div>
        <div v-for="item in list" @click="useHistory(item)">{{item.hash}} @ {{item.time.toLocaleTimeString()}}</div>
      </el-col>
    </el-row>
  </div>
  </div>
</template>

<script>
import {sendRawTransaction,checkTransaction} from "@/rawTxSender";

export default {
  name: "Sender",
  methods:{
    useHistory(item){
      this.retHash = item.hash;
      this.checkTx()
    },
    checkTx() {
      try {
        this.checkMessage = '正在获取状态...'
        checkTransaction(this.retHash).then(ret=>{
          this.status = ret.status;
          this.scanLink = ret.scanUrl;
          this.checkMessage = `状态已更新 ${new Date().toLocaleTimeString()}`
        })
      } catch (e) {
        this.checkMessage = `${e}`
      }
    },
    sendTx() {
      try {
        this.sendMessage = '正在发送...'
        sendRawTransaction(this.rawTx).then(ret=>{
          //console.info(`send ret`, ret)
          this.retHash = ret
          this.sendMessage = '发送成功'
          this.list.push({hash: ret, rawTx: this.rawTx, time: new Date()})
          this.checkTx()
        }).catch(err=>{
          this.sendMessage = `${err}`
        })
        //     .send().then(ret=>{
        //   this.sendMessage = '发送成功'
        //   this.retHash = ret;
        // })
      } catch (e) {
        this.sendMessage = `${e}`
      }
    }
  },
  data() {
    return {
      rawTx: '',
      retHash: '',
      status: '',
      scanLink: '',
      sendMessage: '',
      checkMessage: '',
      //
      list: []
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