<template>
  <div>
    <div>2023-11-03 Build 0.0.4</div>
    <el-tabs :active-name="activeName">
      <el-tab-pane name="Signer" label="Signer">
        <Signer></Signer>
      </el-tab-pane>
      <el-tab-pane name="Sender" label="Sender">
        <Sender></Sender>
      </el-tab-pane>
      <el-tab-pane name="HashGen" label="HashGen">
        <HashGen></HashGen>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Signer from "@/views/Signer";
import Sender from "@/views/Sender";
import HashGen from "@/views/HashGen";
export default {
  name: "App",
  components: { Sender, Signer, HashGen },
  data() {
    return {
      activeName: 'HashGen'
    }
  }
}
</script>

<style scoped></style>