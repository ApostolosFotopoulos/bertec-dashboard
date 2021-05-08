<template>
  <v-container>
    <Timeline />
    <Channels />
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import Timeline from "../components/timeline/Timeline.vue";
import Channels from "../components/timeline/Channels.vue";
export default {
  components: {
    Timeline,
    Channels,
  },
  mounted() {
    //setInterval(()=>{ ipcRenderer.send('SESSION_RUNNING_TIMELINE') },1)
  },
};
</script>