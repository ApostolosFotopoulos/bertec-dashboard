<template>
  <v-card color="#262D47" class="pa-4 history">
    <v-row class="text-center">
      <v-col>
        <h4>Left Foot Maximum: </h4>
        <div
          v-for="(item,index) in $store.state.speedmeter.maxHistoryLeftPlate.slice().reverse()"
          :key="index"
        >
          <h2 v-if="index == 0">{{item.toFixed(1)}}</h2>
          <span v-else>{{item.toFixed(1)}}</span>
        </div>
      </v-col>
      <v-col >
        <h4>Right Foot Maximum: </h4>
        <div
          v-for="(item,index) in $store.state.speedmeter.maxHistoryRightPlate.slice().reverse()"
          :key="index"
        >
          <h2 v-if="index == 0">{{item.toFixed(1)}}</h2>
          <span v-else>{{item.toFixed(1)}}</span>
        </div>
      </v-col>
    </v-row>
    <hr class="hr mt-3">
    <v-row class="text-center">
      <v-col>
        <h2 class="text-color">{{$store.state.speedmeter.maxHistoryLeftPlate.reduce(function(p,c,i,a){return p + (c/a.length)},0).toFixed(1)}}</h2>
      </v-col>
      <v-col >
        <h2 class="text-color">{{$store.state.speedmeter.maxHistoryRightPlate.reduce(function(p,c,i,a){return p + (c/a.length)},0).toFixed(1)}}</h2>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
.history{
  min-height: 350px;
  max-height: 350px;
  overflow-y: scroll;
}
.history::-webkit-scrollbar-track{
	background-color: 25282F !important;
}
.history::-webkit-scrollbar-track{
	background-color:#262D47 !important;
}
.history::-webkit-scrollbar{
	width: 8px;
	background-color:#262D47 !important;
  border-radius: 20px;
}
.history::-webkit-scrollbar-thumb{
	background-color: #eee9ee!important;
	border: 2px solid #eee9ee!important;
  border-radius: 20px;
}
.text-color{
  color: #6ab187;
}
</style>