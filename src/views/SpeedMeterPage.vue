<template>
  <v-container>
    <SpeedMetersCharts/>
    <v-container>
    <v-row>
      <v-col cols="2" offset="10" align="right">
        <v-btn @click="$store.commit('resetSpeedmeterState')" class="resetButton  v-input__control">Reset</v-btn>
      </v-col>
    </v-row>
    </v-container>
    <Statistics/>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import SpeedMetersCharts from '../components/speedmeter/SpeedMetersCharts.vue'
import Statistics from '../components/speedmeter/Statistics.vue'

export default {
  components:{
    SpeedMetersCharts,
    Statistics
  },
  mounted(){
    //setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_SPEEDMETER') },1)
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