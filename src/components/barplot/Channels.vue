<template>
  
    <v-row class="pa-5">
      <v-col cols="6">
        <h3>Left Force Plate</h3>
        <v-select
          class="mt-3"
          @change="(v)=>{$store.commit('resetState');$store.commit('setLeftForcePlateChannel',v)}"
          :value="this.$store.state.leftForcePlateChannel"
          :items="leftForcePlateChannels"
          label="Channels"
          solo
        ></v-select>
      </v-col>
      <v-col  cols="6">
        <h3>Right Force Plate</h3>
        <v-select
          class="mt-3"
          @change="(v)=>{$store.commit('resetState');$store.commit('setRightForcePlateChannel',v)}"
          :value="this.$store.state.rightForcePlateChannel"
          :items="rightForcePlateChannels"
          label="Channels"
          solo
        ></v-select>
      </v-col>
    </v-row>

</template>

<script>
export default {
  data(){
    return{
      leftForcePlateChannels: ["FX1","FY1","FZ1","MX1","MY1","MZ1","COPX1","COPY1","COPXY1"],
      rightForcePlateChannels: ["FX2","FY2","FZ2","MX2","MY2","MZ2","COPX2","COPY2","COPXY2"],
    }
  },
}
</script>

<style>
.v-menu__content.theme--dark::-webkit-scrollbar{
  background-color: transparent !important;
  width: 0px;
}
.v-menu__content.theme--dark.menuable__content__active::-webkit-scrollbar-track{
	background-color: transparent;
  width: 0px;
}
</style>