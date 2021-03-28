<template>
  <v-container>
    <v-row class="mt-4 mb-3">
      <v-col>
        <h1>Dashboard - Overview</h1>
        <hr class="hr">
      </v-col>
    </v-row>
    <SaveFile/>
    <SessionRunning/>
    <PersonalInfo/>
    <Settings/>
    <v-row>
      <v-col>
        <h3>Status</h3>
        <hr class="hr">
      </v-col>
    </v-row>
    <Status/>
    <v-row>
      <v-col>
        <h3>Options</h3>
        <hr class="hr">
      </v-col>
    </v-row>
    <WindowsMenu/>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import SaveFile from '../components/index/SaveFile.vue'
import SessionRunning from '../components/index/SessionRunning.vue'
import PersonalInfo from '../components/index/PersonalInfo.vue'
import Settings from '../components/index/Settings.vue'
import WindowsMenu from '../components/index/WindowsMenu.vue'
import Status from '../components/index/Status.vue'

export default{
  components:{
    SaveFile,
    SessionRunning,
    PersonalInfo,
    Settings,
    WindowsMenu,
    Status
  },
  mounted(){
    setInterval(()=>{ ipcRenderer.send('WINDOWS_STATUS') },10)
  }
}
</script>
