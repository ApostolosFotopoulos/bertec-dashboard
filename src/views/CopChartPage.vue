<template>
  <v-container>
    <CopChart/>
    <v-row class="mt-3">
      <v-col cols="2" offset="10" align="right">
        <v-btn @click="$store.commit('resetCOPChartState')" class="resetButton  v-input__control">Reset</v-btn>
      </v-col>
    </v-row>
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