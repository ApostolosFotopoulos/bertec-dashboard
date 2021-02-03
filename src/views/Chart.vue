<template>
  <v-container>
    <Chart/>
    <v-row class="mt-2">
      <Channels/>
    </v-row>
    <v-row class="mt-2">
      <v-col>
        <MoreStatistics/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Chart from '../components/chart/Chart.vue'
import Channels from '../components/chart/Channels.vue'
import MoreStatistics from '../components/chart/MoreStatistics.vue'

export default {
  components:{
    Chart,
    Channels,
    MoreStatistics
  }
}
</script>