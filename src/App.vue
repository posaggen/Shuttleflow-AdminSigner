<template>
  <div>
    <el-tabs :active-name="activeName">
      <el-tab-pane name="Signer" label="Signer">
        <Signer></Signer>
      </el-tab-pane>
      <el-tab-pane name="Sender" label="Sender">
        <Sender></Sender>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Signer from "@/views/Signer";
import Sender from "@/views/Sender";
export default {
  name: "App",
  components: {Sender, Signer},
  data() {
    return {
      activeName: 'Signer'
    }
  }
}
</script>

<style scoped>

</style>