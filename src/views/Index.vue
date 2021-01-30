<template>
  <v-container>
    <h1 class="pa-2">Dashboard - Overview</h1>
    <hr class="hr">
    <SaveFile/>
    <OptionsMenu/>
    <Messages/>
  </v-container>
</template>

<script>
import SaveFile from '../components/index/SaveFile.vue'
import Messages from '../components/index/Messages.vue'
import OptionsMenu from '../components/index/OptionsMenu.vue'

export default {
  components:{
    SaveFile,
    Messages,
    OptionsMenu
  }
}
</script>