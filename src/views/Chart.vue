<template>
  <v-container>
    <v-row class="mt-2">
      <v-col cols="8">
        <Chart/>
      </v-col>
      <v-col>
        <Channels/>
        <div class="mt-2">
          <ChartLine/>
        </div>
      </v-col>
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
import ChartLine from '../components/chart/ChartLine.vue'
import MoreStatistics from '../components/chart/MoreStatistics.vue'

export default {
  components:{
    Chart,
    Channels,
    ChartLine,
    MoreStatistics
  }
}
</script>