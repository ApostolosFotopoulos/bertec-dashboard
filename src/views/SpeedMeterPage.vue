<template>
  <v-container>
    <v-row class="mt-2">
      <v-col>
        <SpeedMeterCharts/>
      </v-col>
    </v-row>
    <v-row  class="mt-5">
      <v-col cols="2" offset="10" align="right">
        <v-btn @click="$store.commit('resetState')" class="resetButton  v-input__control">Reset</v-btn>
      </v-col>
    </v-row>
    <v-row class="mt-2">
      <v-col>
        <MoreStatistics/>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
const { ipcRenderer } = window.require('electron')
import SpeedMeterCharts from '../components/speedmeter/SpeedMeterCharts.vue'
import Channels from '../components/speedmeter/Channels.vue'
import MoreStatistics from '../components/speedmeter/MoreStatistics.vue'

export default {
  components:{
    SpeedMeterCharts,
    Channels,
    MoreStatistics,
  },
  beforeMount(){
    setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_SPEEDMETER') },1)
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