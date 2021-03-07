<template>
  <v-container>
    <LineChart/>
    <v-row  class="mt-5">
      <v-col cols="2" offset="10" align="right">
        <v-btn @click="$store.commit('resetState')" class="resetButton  v-input__control">Reset</v-btn>
      </v-col>
    </v-row>
    <v-row class="mt-2">
      <Channels/>
    </v-row>

  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import LineChart from '../components/linechart/LineChart.vue'
import Channels from '../components/barplot/Channels.vue'

export default {
  components:{
    LineChart,
    Channels
  },
  beforeMount(){
    setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_LINECHART') },1)
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