<template>
  <v-container>
    <LineChart/>
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