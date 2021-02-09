<template>
  <v-container>
    <BarPlot/>
    <v-row class="mt-2">
      <Channels/>
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
import BarPlot from '../components/barplot/BarPlot.vue'
import Channels from '../components/barplot/Channels.vue'
import MoreStatistics from '../components/barplot/MoreStatistics.vue'

export default {
  components:{
    BarPlot,
    Channels,
    MoreStatistics
  },
  beforeMount(){
    setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_BARPLOT') },1)
  }
}
</script>