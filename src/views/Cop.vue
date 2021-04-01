<template>
  <v-container>
    <CopChart/>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import CopChart from '../components/cop/CopChart.vue'
export default {
  mounted(){
    setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_COP') },1)
  },
  components:{
    CopChart
  }
}
</script>

<style scoped>
.resetButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
</style>