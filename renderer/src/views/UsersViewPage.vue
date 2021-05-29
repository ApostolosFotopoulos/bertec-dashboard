<template>
  <div>
    <v-container>
      <v-row class="mt-0">
        <v-col>
          <h3>View all the customers</h3>
          <hr class="hr" />
        </v-col>
      </v-row>
      <v-row align="center">
        <v-col align="center">
          <v-select
            v-model="selectedDatabase"
            :items="
              databases.map((d) => ({
                text: d.substr(0, d.lastIndexOf('.')),
                value: d,
              }))
            "
            label="Database"
            @input="databaseChanged"
            outlined
            clearable
          ></v-select>
        </v-col>
        <v-col align="center">
          <v-text-field
            v-model="search.firstName"
            label="First Name"
            outlined
            clearable
          />
        </v-col>
        <v-col align="center">
          <v-text-field
            v-model="search.lastName"
            label="Last Name"
            outlined
            clearable
          />
        </v-col>
        <v-col align="center">
          <v-text-field
            v-model="search.hospitalID"
            label="Hospital ID"
            outlined
            clearable
          />
        </v-col>
        <v-col align="center">
          <v-select
            v-model="search.affectedSide"
            :items="affectedSideOptions"
            label="Affected Side"
            outlined
            clearable
          ></v-select>
        </v-col>
        <v-col align="center">
          <v-select
            v-model="search.sex"
            :items="sexOptions"
            label="Sex"
            outlined
            clearable
          ></v-select>
        </v-col>
      </v-row>
      <v-row align="center">
        <v-col align="center">
          <v-range-slider
            v-model="search.year"
            :max="new Date().getFullYear()"
            :min="1950"
            hide-details
            thumb-label
          />
          <div class="text-center">Year of Birth</div>
        </v-col>
        <v-col align="center">
          <v-range-slider
            v-model="search.height"
            :max="250"
            :min="100"
            hide-details
            thumb-label
          />
          <div class="text-center">Height (cm)</div>
        </v-col>
        <v-col align="center">
          <v-range-slider
            v-model="search.legLength"
            :max="200"
            :min="30"
            hide-details
            thumb-label
          />
          <div class="text-center">Leg Length (cm)</div>
        </v-col>
        <v-col align="center">
          <v-range-slider
            v-model="search.weight"
            :max="2000"
            :min="300"
            hide-details
            thumb-label
          />
          <div class="text-center">Weight (N)</div>
        </v-col>
      </v-row>
      <v-row align="center">
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
                v-model="surgeryRange"
                label="Surgery Date Range"
                outlined
                v-bind="attrs"
                v-on="on"
                readonly
              ></v-text-field>
            </template>
            <vc-date-picker
              v-model="search.surgeryRange"
              is-range
              @input="surgeryDateChanged"
            />
          </v-menu>
        </v-col>
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
                v-model="injuryRange"
                label="Injury Date Range"
                outlined
                v-bind="attrs"
                v-on="on"
                readonly
              ></v-text-field>
            </template>
            <vc-date-picker
              v-model="search.injuryRange"
              is-range
              @input="injuryDateChanged"
            />
          </v-menu>
        </v-col>
        <v-col align="center">
          <v-combobox
            v-model="search.selectedTags"
            :items="tags.map((t) => t.name)"
            label="Tags"
            multiple
            outlined
            chips
          ></v-combobox>
        </v-col>
        <v-col align="center">
          <v-btn
            @click="applyFilters()"
            class="applyButton"
            block
            :disabled="!selectedDatabase || selectedDatabase === ''"
          >
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-col>
        <v-col align="center">
          <v-btn
            @click="resetFilters()"
            class="resetButton"
            block
            :disabled="!selectedDatabase || selectedDatabase === ''"
          >
            <v-icon>mdi-restart</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="mt-0">
        <v-col>
          <h3>Users</h3>
          <hr class="hr" />
          <div class="mt-3">
            <v-alert
              outlined
              :type="deleteUserAlertError ? 'error' : 'success'"
              text
              v-if="deleteUserAlert"
            >
              {{ deleteUserAlertMessage }}
            </v-alert>
          </div>
        </v-col>
      </v-row>
      <v-dialog
        v-model="deleteDialog"
        transition="dialog-top-transition"
        max-width="600"
      >
        <v-card light class="pt-10 pa-3">
          <v-card-text>
            <div class="text-h6">Are you sure you want to delete the user?</div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text @click="deleteUser()">Yes</v-btn>
            <v-btn text @click="deleteDialog = false">No</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="userDetailsDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        scrollable
        class="p-3"
      >
        <v-card tile color="#25282f">
          <div class="text-right pt-4 pr-4">
            <v-btn icon dark @click="userDetailsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-container>
            <v-row class="mt-0">
              <v-col>
                <h3>See the details of the user</h3>
                <hr class="hr" />
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.hospital_id"
                  label="Hospital ID"
                  outlined
                  readonly
                />
              </v-col>
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.first_name"
                  label="First Name"
                  outlined
                  readonly
                />
              </v-col>
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.last_name"
                  label="Last Name"
                  outlined
                  readonly
                />
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.affected_side"
                  label="Affected Side"
                  outlined
                  readonly
                />
              </v-col>
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.year"
                  label="Year of Birth"
                  outlined
                  readonly
                />
              </v-col>
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.height"
                  label="Height (cm)"
                  outlined
                  readonly
                />
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.leg_length"
                  label="Leg Length (cm)"
                  outlined
                  readonly
                />
              </v-col>
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.sex"
                  label="Sex"
                  outlined
                  readonly
                />
              </v-col>
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.weight"
                  label="Weight (N)"
                  outlined
                  readonly
                />
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.surgery_date"
                  label="Surgery Date"
                  outlined
                  readonly
                />
              </v-col>
              <v-col align="center">
                <v-text-field
                  v-model="userDetails.injury_date"
                  label="Injury Date"
                  outlined
                  readonly
                />
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col align="center">
                <v-textarea
                  v-model="userDetails.other_info"
                  label="Other Info"
                  outlined
                  readonly
                  no-resize
                  rows="4"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-dialog>
    </v-container>
    <div class="pa-3">
      <v-data-table
        light
        :items-per-page="5"
        :headers="headers"
        :items="users"
        :expanded.sync="expanded"
        show-expand
        v-if="users"
        class="elevation-1"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon medium class="mr-2" @click="openDetailsDialog(item)"
            >mdi-magnify</v-icon
          >
          <v-icon medium @click="openDeleteDialog(item)"
            >mdi-delete-outline</v-icon
          >
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td class="pa-5" :colspan="headers.length">
            <v-data-table
              light
              :items-per-page="5"
              :headers="innerHeaders"
              :items="item.sessions"
              :expanded.sync="expandedInner"
              show-expand
              class="elevation-1"
            >
              <template v-slot:expanded-item="{ headers, item }">
                <td class="pa-5" :colspan="headers.length">
                  <v-data-table
                    light
                    :items-per-page="5"
                    :headers="innerInnerHeaders"
                    :items="item.trials"
                    class="elevation-1"
                  >
                  </v-data-table>
                </td>
              </template>
            </v-data-table>
          </td>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");

const {
  FETCH_DATABASES_TO_VIEW_ALL,
  FETCH_DATABASES_TO_VIEW_ALL_RESPONSE,
  FETCH_TAGS_TO_VIEW_ALL,
  FETCH_TAGS_TO_VIEW_ALL_RESPONSE,
  FETCH_USERS_TO_VIEW_ALL,
  FETCH_USERS_TO_VIEW_ALL_RESPONSE,
  DELETE_USER,
  DELETE_USER_RESPONSE,
} = require("../../../main/util/types");
import moment from "moment";

export default {
  mounted() {
    setInterval(() => {
      ipcRenderer.send(FETCH_DATABASES_TO_VIEW_ALL);
    }, 10);

    setInterval(() => {
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send(FETCH_TAGS_TO_VIEW_ALL, {
          database: this.selectedDatabase,
        });
      }
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send(FETCH_USERS_TO_VIEW_ALL, {
          database: this.selectedDatabase,
          filters: this.filters,
        });
      }
    }, 100);
    var _this = this;
    ipcRenderer.on(FETCH_TAGS_TO_VIEW_ALL_RESPONSE, (_, responseData) => {
      _this.tags = responseData.tags;
    });
    ipcRenderer.on(FETCH_DATABASES_TO_VIEW_ALL_RESPONSE, (_, responseData) => {
      _this.databases = responseData.databases;
    });
    ipcRenderer.on(FETCH_USERS_TO_VIEW_ALL_RESPONSE, (_, responseData) => {
      _this.users = responseData.users;
      console.log(_this.users);
    });
    ipcRenderer.on(DELETE_USER_RESPONSE, (_, responseData) => {
      _this.deleteUserAlert = true;
      _this.deleteUserAlertError = responseData.error ? true : false;
      _this.deleteUserAlertMessage = responseData.error
        ? "An error occured while creating a user"
        : "Successfully deleted a user";
      setTimeout(() => {
        _this.deleteUserAlert = false;
      }, 3000);
    });
  },
  data() {
    return {
      expanded: [],
      userDetailsDialog: false,
      userDetails: {},
      deleteUserAlert: false,
      deleteUserAlertError: false,
      deleteUserAlertMessage: "",
      userToDelete: {},
      deleteDialog: false,
      selectedDatabase: "",
      databases: [],
      filters: {},
      affectedSideOptions: ["Left", "Right", "Left + Right", "Non Affected"],
      sexOptions: ["Male", "Female"],
      surgeryDateMenu: false,
      surgeryRange: "",
      injuryDateMenu: false,
      injuryRange: "",
      tags: [],
      users: [],
      search: {
        firstName: "",
        lastName: "",
        hospitalID: "",
        affectedSide: "",
        year: [1950, new Date().getFullYear()],
        height: [100, 250],
        legLength: [30, 200],
        weight: [300, 2000],
        sex: "",
        surgeryRange: {
          start: "",
          end: "",
        },
        injuryRange: {
          start: "",
          end: "",
        },
        selectedTags: [],
      },
      headers: [
        {
          text: "Hospital ID",
          sortable: false,
          value: "hospital_id",
        },
        {
          text: "Firstname",
          value: "first_name",
        },
        {
          text: "Lastname",
          value: "last_name",
        },
        {
          text: "Year of Birth",
          value: "year",
        },
        {
          text: "Sex",
          value: "sex",
        },
        {
          text: "Height (cm)",
          value: "height",
        },
        {
          text: "Weight (N)",
          value: "weight",
          sortable: false,
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
        },
        {
          text: "",
          value: "data-table-expand",
        },
      ],
      innerHeaders: [
        {
          text: "ID",
          value: "id",
        },
        {
          text: "Session",
          value: "name",
          sortable: false,
        },
        {
          text: "Number of Trials",
          value: "trial_count",
          sortable: false,
        },
        {
          text: "Created At",
          value: "created_at",
          sortable: false,
        },
        {
          text: "",
          value: "data-table-expand",
        },
      ],
      innerInnerHeaders: [
        {
          text: "ID",
          value: "id",
        },
        {
          text: "Trial",
          value: "name",
          sortable: false,
        },
        {
          text: "Created At",
          value: "created_at",
          sortable: false,
        },

      ],
    };
  },
  methods: {
    databaseChanged(d) {
      if (d) {
        this.selectedDatabase = d;
        this.users = [];
        this.tags = [];
        this.resetFilters();
      } else {
        this.selectedDatabase = "";
        this.users = [];
        this.tags = [];
        this.resetFilters();
      }
    },
    applyFilters() {
      let f = {};
      if (this.search.firstName && this.search.firstName != "") {
        f.firstName = this.search.firstName;
      }
      if (this.search.lastName && this.search.lastName != "") {
        f.lastName = this.search.lastName;
      }
      if (this.search.hospitalID && this.search.hospitalID != "") {
        f.hospitalID = this.search.hospitalID;
      }
      if (this.search.affectedSide && this.search.affectedSide != "") {
        f.affectedSide = this.search.affectedSide;
      }
      if (this.search.sex && this.search.sex != "") {
        f.sex = this.search.sex;
      }
      f.year = this.search.year;
      f.legLength = this.search.legLength;
      f.weight = this.search.weight;
      f.height = this.search.height;
      if (this.search.selectedTags && this.search.selectedTags.length > 0) {
        f.tags = this.search.selectedTags;
      }
      if (
        this.search.surgeryRange &&
        this.search.surgeryRange.start &&
        this.search.surgeryRange.start != "" &&
        this.search.surgeryRange.end &&
        this.search.surgeryRange.end != ""
      ) {
        f.surgeryRange = [
          moment(this.search.surgeryRange.start).format("MM-DD-YYYY"),
          moment(this.search.surgeryRange.end).format("MM-DD-YYYY"),
        ];
      }
      if (
        this.search.injuryRange &&
        this.search.injuryRange.start &&
        this.search.injuryRange.start != "" &&
        this.search.injuryRange.end &&
        this.search.injuryRange.end != ""
      ) {
        f.injuryRange = [
          moment(this.search.injuryRange.start).format("MM-DD-YYYY"),
          moment(this.search.injuryRange.end).format("MM-DD-YYYY"),
        ];
      }
      this.filters = f;
      console.log(f);
    },
    resetFilters() {
      this.search = {
        firstName: "",
        lastName: "",
        hospitalID: "",
        affectedSide: "",
        year: [1950, new Date().getFullYear()],
        height: [100, 250],
        legLength: [30, 200],
        weight: [300, 2000],
        sex: "",
        surgeryRange: {
          start: "",
          end: "",
        },
        injuryRange: {
          start: "",
          end: "",
        },
        selectedTags: [],
      };
      this.surgeryRange = "";
      this.injuryRange = "";
      this.applyFilters();
    },
    surgeryDateChanged(d) {
      if (d) {
        this.surgeryRange = `${moment(d.start).format("DD/MM/YYYY")} - ${moment(
          d.end
        ).format("DD/MM/YYYY")}`;
      } else {
        this.surgeryRange = "";
      }
    },
    injuryDateChanged(d) {
      if (d) {
        this.injuryRange = `${moment(d.start).format("DD/MM/YYYY")} - ${moment(
          d.end
        ).format("DD/MM/YYYY")}`;
      } else {
        this.injuryRange = "";
      }
    },
    deleteUser() {
      ipcRenderer.send(DELETE_USER, {
        database: this.selectedDatabase,
        userId: this.userToDelete.id,
      });
      this.deleteDialog = false;
    },
    openDeleteDialog(u) {
      this.userToDelete = u;
      this.deleteDialog = true;
    },
    openDetailsDialog(u) {
      this.userDetails = u;
      this.userDetailsDialog = true;
    },
  },
};
</script>

<style>
.v-data-footer__select,
.v-data-footer__pagination {
  display: none !important;
}
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
.applyButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.resetButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #f4a261 !important;
}
</style>
