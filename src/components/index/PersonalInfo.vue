<template>
  <v-row>
    <v-col>
      <v-select
        @change="(v)=>{
          $store.commit('setDataType',v)
        }"
        :disabled="$store.state.options.isSessionRunning"
        :value="$store.state.options.dataType"
        :items="dataType"
        label="Data Type"
        solo
      ></v-select>
    </v-col>
    <v-col>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
          v-bind="attrs"
          v-on="on"
          @change="(v)=>$store.commit('setWeight',Number(v))"
          :value="$store.state.options.weight"
          label="Weight (in N)"
          solo
          :disabled="$store.state.options.isSessionRunning"
        />
        </template>
        <span>Weight</span>
      </v-tooltip>
    </v-col>
    <v-col>
      <v-btn 
        class="getWeight v-input__control"
        @click="setWeight"
      >
        Get Weight
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>

import rowsNames from '../../../assets/store/rowsNames.json'
const { ipcRenderer } = window.require('electron')

export default {
  data(){
    return{
      dataType:["Absolute","Normalized"],
    }
  },
  methods:{
    setWeight(){
      console.log("WEIGHT: "+this.$store.state.options.leftPlateValue);
      this.$store.commit('setWeight',this.$store.state.options.leftPlateValue);
    }
  }
}
</script>


<style scoped>
.getWeight{
  height: 48px !important;
  min-height: 48px !important;
  background: #6ab187!important;
}
</style>