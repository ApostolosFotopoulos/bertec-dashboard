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

export default{
  components:{
    SaveFile,
    SessionRunning,
    PersonalInfo,
    Settings,
    WindowsMenu
  },
  mounted(){
    setInterval(()=>{ ipcRenderer.send('WINDOWS_STATUS') },10)
  }
}
</script>
