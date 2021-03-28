<template>
  <v-container>
    <LineChart/>
    <v-row class="mt-3">
      <v-col cols="2" offset="10" align="right">
        <v-btn @click="$store.commit('resetLineChartState')" class="resetButton  v-input__control">Reset</v-btn>
      </v-col>
    </v-row>
    <Channels/>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import LineChart from '../components/linechart/LineChart.vue'
import Channels from '../components/linechart/Channels.vue'
export default {
  components:{
    LineChart,
    Channels
  },
  mounted() {
    //setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_LINECHART') },1)
  },
}
</script>

<style scoped>
.resetButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
</style>