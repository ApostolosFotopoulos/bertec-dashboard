<template>
  <div>
    <v-container v-if="!isDatabaseReady">
      <DatabaseSetup
        :skipDatabase="skipDatabase"
        :continueToMain="continueToMain"
      />
      <DatabaseActions />
    </v-container>
    <v-container v-else>
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
          <span class="mr-3"> {{ $store.state.options.user.firstName + " "+ $store.state.options.user.lastName }} </span>
          <v-avatar color="#d32d41">
            <span class="white--text headline">
              {{
                $store.state.options.user.firstName[0] +
                $store.state.options.user.lastName[0]
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
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import SessionRunning from "../components/index/SessionRunning.vue";
import PersonalInfo from "../components/index/PersonalInfo.vue";
import Settings from "../components/index/Settings.vue";
import WindowsMenu from "../components/index/WindowsMenu.vue";
import Status from "../components/index/Status.vue";
import DatabaseSetup from "../components/index/DatabaseSetup.vue";
import DatabaseActions from "../components/index/DatabaseActions.vue";
export default {
  components: {
    SessionRunning,
    PersonalInfo,
    Settings,
    WindowsMenu,
    Status,
    DatabaseSetup,
    DatabaseActions,
  },
  mounted() {
    setInterval(() => {
      ipcRenderer.send("WINDOWS_STATUS");
    }, 10);
  },
  data() {
    return {
      isDatabaseReady: false,
      newDatabaseName: "",
    };
  },
  methods: {
    skipDatabase() {
      this.isDatabaseReady = true;
    },
    continueToMain(d, u) {
      this.$store.commit("setDatabase", d);
      this.$store.commit("setUser", u);
      this.$store.commit("setWeight", u.weight);
      this.isDatabaseReady = true;
    },
    backToDatabase(){
      this.isDatabaseReady = false;
      this.$store.commit("setDatabase", "");
      this.$store.commit("setUser", "");
      this.$store.commit("setWeight", 700);
    }
  },
};
</script>

<style scoped>
.backButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #ffa505 !important;
}
</style>