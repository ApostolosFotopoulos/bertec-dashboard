<template>
  <v-container>
    <LineChart />
    <Channels />
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import LineChart from "../components/linechart/LineChart.vue";
import Channels from "../components/linechart/Channels.vue";
export default {
  components: {
    LineChart,
    Channels,
  },
  mounted() {
    //setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_LINECHART') },1)
  },
};
</script>