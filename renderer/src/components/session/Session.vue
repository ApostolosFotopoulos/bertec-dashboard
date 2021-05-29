<template>
  <v-container>
    <v-row class="mt-4 mb-3" align="center">
      <v-col cols="1">
        <v-btn class="backButton" @click="backToDatabase()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h1>Dashboard - Overview</h1>
      </v-col>
      <v-col align="right" v-if="Object.keys($store.state.options.user).length != 0">
        <span class="mr-3"> {{ $store.state.options.user.first_name + " "+ $store.state.options.user.last_name }} </span>
        <v-avatar color="#f4a261">
          <span class="white--text headline">
            {{
              $store.state.options.user.first_name[0] +
              $store.state.options.user.last_name[0]
            }}
          </span>
        </v-avatar>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col>
        <h3>Session</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <SessionRunning />
    <v-row class="mt-0">
      <v-col>
        <h3>Status - Weight</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <Status />
    <PersonalInfo />
    <v-row class="mt-0">
      <v-col>
        <h3>Graphics</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <WindowsMenu />
  </v-container>
</template>

<script>
import SessionRunning from "../index/SessionRunning.vue";
import PersonalInfo from "../index/PersonalInfo.vue";
import Settings from "../index/Settings.vue";
import WindowsMenu from "../index/WindowsMenu.vue";
import Status from "../index/Status.vue";

export default {
  props:{
    backToDatabase: Function
  },
  components: {
    SessionRunning,
    PersonalInfo,
    Settings,
    WindowsMenu,
    Status,
  },
}
</script>

<style scoped>
.backButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #f4a261 !important;
}
</style>