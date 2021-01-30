<template>
  <v-container>
    <v-row>
      <v-col cols="10">
        <v-text-field
          :value="this.$store.state.filePath"
          label="Path of the file that we save the data"
          type="text"
          solo
          disabled
        />
      </v-col>
      <v-col cols="2">
        <v-btn class="saveButton v-input__control" @click="saveFile" :disabled="saveButtonDisabled">Save</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron')
export default {
  data(){
    return{
      ipcRenderer: window.require('electron').ipcRenderer,
      saveButtonDisabled:false,
    }
  },
  beforeMount(){
    ipcRenderer.on('FILE_SAVE_RESPONSE',(_,responseData)=>{
      const { filePath } = responseData;
      this.$store.commit('setFilePath',filePath);
      this.saveButtonDisabled = !this.saveButtonDisabled;
    });
  }, 
  methods:{
    saveFile(){
      ipcRenderer.send("FILE_SAVE");
      this.saveButtonDisabled = !this.saveButtonDisabled;
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