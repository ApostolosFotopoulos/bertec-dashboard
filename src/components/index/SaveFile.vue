<template>
  <v-row>
    <v-col cols="10">
      <v-text-field
        :value="this.$store.state.options.filePath"
        label="Where to save the data"
        type="text"
        solo
        disabled
      />
    </v-col>
    <v-col cols="2">
      <v-btn class="saveButton v-input__control" @click="saveFile" :disabled="buttonDisabled">Save</v-btn>
    </v-col>
  </v-row>
</template>

<script>
const { ipcRenderer } = window.require('electron')
export default {
  data(){
    return{
      buttonDisabled:false,
    }
  },
  mounted(){
    ipcRenderer.on('FILE_SAVE_RESPONSE',(_,responseData)=>{
      const { filePath } = responseData
      this.$store.commit('setFilePath',filePath)
      this.buttonDisabled = !this.buttonDisabled
    });
  }, 
  methods:{
    saveFile(){
      ipcRenderer.send("FILE_SAVE");
      this.buttonDisabled = !this.buttonDisable
    }
  }
}
</script>

<style scoped>
.saveButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #1c4e80 !important;
}
</style>