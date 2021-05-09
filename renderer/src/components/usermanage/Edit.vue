<template>
  <v-container class="pa-0 mt-0">
    <v-row>
      <v-col>
        <h3>Select a database and a user</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center"
        ><v-select
          v-model="selectedDatabase"
          :items="
            databases.map((d) => ({
              text: d.substr(0, d.lastIndexOf('.')),
              value: d,
            }))
          "
          label="Database"
          @input="databaseChanged"
          clearable
          outlined
        ></v-select>
      </v-col>
      <v-col align="center"
        ><v-select
          v-model="selectedUser"
          :items="
            users &&
            users.map((u) => ({
              text: u.first_name + ' ' + u.last_name,
              value: u,
            }))
          "
          label="Users"
          @input="userChanged"
          clearable
          outlined
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Edit a user</h3>
        <hr class="hr" />
        <div class="mt-3">
          <v-alert outlined type="success" text v-if="userEditAlert">
            Successfully updated a user.
          </v-alert>
        </div>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-text-field
          v-model="firstName"
          label="First Name"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field v-model="lastName" label="Last Name" outlined clearable />
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-text-field
          v-model="year"
          type="number"
          label="Year of Birth"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          v-model="height"
          type="number"
          label="Height (cm)"
          outlined
          clearable
        />
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-text-field
          v-model="legLength"
          type="number"
          label="Leg Length (cm)"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-select
          v-model="sex"
          :items="sexOptions"
          label="Sex"
          outlined
          clearable
        ></v-select>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-menu
          ref="injuryDate"
          v-model="injuryDateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="injuryDate"
              label="Injury Date"
              outlined
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            ref="injuryDatePicker"
            v-model="injuryDate"
            light
            :max="new Date().toISOString().substr(0, 10)"
            min="1950-01-01"
            @change="saveInjuryDate"
          ></v-date-picker> </v-menu
      ></v-col>
      <v-col align="center">
        <v-menu
          ref="surgeryDate"
          v-model="surgeryDateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="surgeryDate"
              label="Surgery Date"
              outlined
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            ref="surgeryDatePicker"
            v-model="surgeryDate"
            light
            :max="new Date().toISOString().substr(0, 10)"
            min="1950-01-01"
            @change="saveSurgeryDate"
          ></v-date-picker>
        </v-menu>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center" cols="4">
        <v-text-field
          v-model="weight"
          type="number"
          label="Weight (N)"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center" cols="2">
        <v-btn @click="getWeight()" class="getWeightButton">+ </v-btn>
      </v-col>
      <v-col align="center">
        <v-combobox
          v-model="selectedTags"
          :items="tags.map((t) => t.name)"
          label="Combobox"
          multiple
          outlined
          chips
        ></v-combobox>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-textarea
          v-model="otherInfo"
          label="Other Info"
          outlined
          clearable
          no-resize
          rows="4"
        ></v-textarea>
      </v-col>
    </v-row>
    <div class="updateButtonDiv">
      <v-btn
        @click="updateUser()"
        class="updateUserButton"
        :disabled="
          selectedDatabase === '' ||
          !selectedDatabase ||
          selectedUser === '' ||
          !selectedUser ||
          firstName === '' ||
          !firstName ||
          year === '' ||
          !year ||
          height === '' ||
          !height ||
          legLength === '' ||
          !legLength ||
          sex === '' ||
          !sex ||
          injuryDate === '' ||
          !injuryDate ||
          surgeryDate === '' ||
          !surgeryDate ||
          weight === '' ||
          !weight
        "
      >
        Update
      </v-btn>
    </div>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import rowsNames from "../../../../assets/store/rowsNames.json";
import moment from "moment";
const { SESSION_OPTIONS } = require("../../../../main/util/types");

export default {
  mounted() {
    this.fetchDatabasesInterval = setInterval(() => {
      ipcRenderer.send("FETCH_DATABASES_TO_USER_MANAGEMENT");
    }, 100);
    this.fetchTagsInterval = setInterval(() => {
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send("FETCH_TAGS_TO_USER_MANAGEMENT", {
          database: this.selectedDatabase,
        });
      }
    }, 100);
    this.fetchUsersInterval = setInterval(() => {
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send("FETCH_ALL_USERS_TO_EDIT", {
          database: this.selectedDatabase,
        });
      }
    }, 100);
    var _this = this;
    ipcRenderer.on(
      "FETCH_DATABASES_TO_USER_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.databases = responseData.databases;
      }
    );
    ipcRenderer.on(
      "FETCH_TAGS_TO_USER_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.tags = responseData.tags;
      }
    );
    ipcRenderer.on("FETCH_ALL_USERS_TO_EDIT_RESPONSE", (_, responseData) => {
      _this.users = responseData.users;
    });
    ipcRenderer.on(
      "FETCH_ALL_TAGS_FOR_USER_TO_USER_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        //_this.selectedTags = responseData.tags;
        this.selectedTags = responseData.tags.map((t) => t.name);
      }
    );
    ipcRenderer.on(SESSION_OPTIONS, (_, responseData) => {
      this.fz1 = Number(responseData.rows[rowsNames["FZ1"]]) || 0.0;
      this.fz2 = Number(responseData.rows[rowsNames["FZ2"]]) || 0.0;
    });
  },
  beforeDestroy() {
    clearInterval(this.fetchDatabasesInterval);
    clearInterval(this.fetchTagsInterval);
    clearInterval(this.fetchUsersInterval);
    ipcRenderer.removeListener(
      "FETCH_DATABASES_TO_USER_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.databases = responseData.databases;
      }
    );
    ipcRenderer.removeListener(
      "FETCH_TAGS_TO_USER_MANAGEMENT",
      (_, responseData) => {
        _this.tags = responseData.tags;
      }
    );
    ipcRenderer.removeListener(
      "FETCH_ALL_USERS_TO_EDIT_RESPONSE",
      (_, responseData) => {
        _this.users = responseData.users;
      }
    );
    ipcRenderer.removeListener(SESSION_OPTIONS, (_, responseData) => {
      this.fz1 = Number(responseData.rows[rowsNames["FZ1"]]) || 0.0;
      this.fz2 = Number(responseData.rows[rowsNames["FZ2"]]) || 0.0;
    });
  },
  data() {
    return {
      userEditAlert: false,
      databases: [],
      selectedDatabase: "",
      users: [],
      selectedUser: "",
      firstName: "",
      lastName: "",
      year: 1950,
      height: 120,
      legLength: 100,
      sex: "Male",
      sexOptions: ["Male", "Female"],
      injuryDateMenu: false,
      surgeryDateMenu: false,
      injuryDate: "",
      surgeryDate: "",
      fz1: 0,
      fz2: 0,
      weight: 0.0,
      otherInfo: "",
      tags: [],
      selectedTags: [],
      fetchDatabasesInterval: null,
      fetchTagsInterval: null,
      fetchUsersInterval: null,
    };
  },
  methods: {
    saveInjuryDate(date) {
      this.$refs.injuryDate.save(date);
    },
    saveSurgeryDate(date) {
      this.$refs.surgeryDate.save(date);
    },
    getWeight() {
      let w = this.fz1 + this.fz2;
      this.weight = w.toFixed(2);
    },
    databaseChanged(d) {
      if (d) {
        this.users = [];
        this.tags = [];
        this.selectedDatabase = d;
      } else {
        this.tags = [];
        this.users = [];
        this.selectedDatabase = "";
      }
    },
    userChanged(u) {
      if (u) {
        this.selectedUser = u;
        this.firstName = u.first_name;
        this.lastName = u.last_name;
        this.year = u.year;
        this.height = u.height;
        this.legLength = u.leg_length;
        this.sex = u.sex;
        this.injuryDate = moment(new Date(u.injury_date)).format("YYYY-MM-DD");
        this.surgeryDate = moment(new Date(u.surgery_date)).format(
          "YYYY-MM-DD"
        );
        this.weight = u.weight;
        this.otherInfo = u.other_info;
        ipcRenderer.send("FETCH_ALL_TAGS_FOR_USER_TO_USER_MANAGEMENT", {
          database: this.selectedDatabase,
          userId: this.selectedUser.id,
        });
      } else {
        this.selectedUser = "";
        this.firstName = "";
        this.lastName = "";
        this.year = 1950;
        this.height = 120;
        this.legLength = 100;
        this.sex = "Male";
        this.injuryDate = "";
        this.surgeryDate = "";
        this.weight = 0.0;
        this.otherInfo = "";
      }
    },
    updateUser() {
      ipcRenderer.send("UPDATE_USER", {
        id: this.selectedUser.id,
        database: this.selectedDatabase,
        firstName: this.firstName,
        lastName: this.lastName,
        year: Number(this.year) || 0,
        sex: this.sex,
        height: Number(this.height) || 0,
        legLength: Number(this.legLength) || 0,
        weight: Number(this.weight) || 0,
        otherInfo: this.otherInfo,
        surgeryDate: this.surgeryDate,
        injuryDate: this.injuryDate,
        tags: this.selectedTags,
      });

      this.selectedUser = "";
      this.firstName = "";
      this.lastName = "";
      this.year = 1950;
      this.height = 120;
      this.legLength = 100;
      this.sex = "Male";
      this.injuryDate = "";
      this.surgeryDate = "";
      this.weight = 0.0;
      this.otherInfo = "";
      this.selectedTags = [];
      this.userEditAlert = true;
      setTimeout(() => {
        this.userEditAlert = false;
      }, 3000);
    },
  },
};
</script>

<style>
.v-text-field__details {
  display: none !important;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

textarea::-webkit-scrollbar {
  background-color: transparent !important;
  width: 0px;
}
textarea::-webkit-scrollbar-track {
  background-color: transparent;
  width: 0px;
}
</style>

<style scoped>
.updateUserButton,
.getWeightButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.updateButtonDiv {
  text-align: right;
}
</style>