<template>
  <v-row>
    <v-col cols="5">
      <v-select
        @change="(v)=>$store.commit('setMode',v)"
        :value="$store.state.options.mode"
        :items="modes"
        label="Modes"
        :disabled="$store.state.options.isSessionRunning"
        solo
      ></v-select>
    </v-col>
    <v-col>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-bind="attrs"
          v-on="on"
          @change="(v)=>$store.commit('setTime',Number(v))"
          :value="$store.state.options.timeout"
          label="Time (in seconds)"
          solo
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
        </template>
        <span>Time (in seconds)</span>
      </v-tooltip>
    </v-col>
    <v-col>
      <v-btn 
        elevation="25"
        :class="$store.state.options.isSessionRunning?'stopButton v-input__control':'startButton v-input__control'" 
        @click="()=>startStopSession()"
        :disabled="$store.state.options.filePath ===''"
      >
        {{$store.state.options.isSessionRunning?'Stop':'Start'}}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
const { ipcRenderer } = window.require('electron')
export default {
  data(){
    return{
      modes:["Walking","Running","Jumping","Landing","Balance"],
      dataType:["Absolute","Normalized"],
    }
  },
  methods:{
    startStopSession(){
      if(this.$store.state.options.isSessionRunning){
        this.$store.commit('setSessionRunning',false)
        ipcRenderer.send('STOP_SESSION')
      } else {
        this.$store.commit('setSessionRunning',true)
        ipcRenderer.send('START_SESSION',{ 
          weight: this.$store.state.options.weight,
        })
      }
    },
  }
}
</script>

<style scoped>
.startButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187 !important;
}
.stopButton{
  height: 48px !important;
  min-height: 48px !important;
  background: #d32d41!important;
}
.getWeight{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187!important;
}
</style>