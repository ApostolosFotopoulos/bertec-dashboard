<template>
  <v-container>
    <v-row class="mt-4">
      <v-col>
        <h3>Select a database</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" offset="3">
        <v-select
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
    </v-row>
    <v-row>
      <v-col>
        <h3>Create a new Tag</h3>
        <hr class="hr" />
        <div class="mt-3 text-right">
          <v-text-field v-model="tagToCreate" label="Tag" outlined clearable />
          <v-alert
            outlined
            type="success"
            text
            class="text-left"
            v-if="visibleCreationAlert"
          >
            Successfully created a tag.
          </v-alert>
          <v-btn
            :disabled="
              tagToCreate === '' ||
              selectedDatabase === '' ||
              !selectedDatabase ||
              !tagToCreate
            "
            @click="createTag()"
            class="createTagButton"
          >
            Create
          </v-btn>
        </div>
      </v-col>
      <v-col>
        <h3>Delete a Tag</h3>
        <hr class="hr" />
        <div class="mt-3 text-right">
          <v-select
            v-model="tagToDelete"
            :items="
              tags.map((d) => ({
                text: d.name,
                value: d.id,
              }))
            "
            label="Tag"
            outlined
            clearable
          ></v-select>
          <v-alert
            outlined
            type="success"
            text
            class="text-left"
            v-if="visibleDeleteAlert"
          >
            Successfully deleted a tag.
          </v-alert>
          <v-btn
            :disabled="
              tagToDelete === '' ||
              selectedDatabase === '' ||
              !selectedDatabase ||
              !tagToDelete
            "
            @click="deleteTag()"
            class="deleteTagButton"
          >
            Delete
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row class="mt-4 mb-3">
      <v-col>
        <h3>View all the tags</h3>
        <hr class="hr" />
        <div class="mt-3">
          <v-data-table
            light
            :headers="headers"
            :items-per-page="5"
            :items="tags"
            class="elevation-1"
          ></v-data-table>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
export default {
  mounted() {
    setInterval(() => {
      ipcRenderer.send("FETCH_DATABASES_TO_TAG_MANAGEMENT");
    }, 100);
    setInterval(() => {
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send("FETCH_TAG_TO_TAG_MANAGEMENT", {
          database: this.selectedDatabase,
        });
      }
    }, 100);
    var _this = this;
    ipcRenderer.on(
      "FETCH_DATABASES_TO_TAG_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.databases = responseData.databases;
        console.log(_this.databases);
      }
    );
    ipcRenderer.on(
      "FETCH_TAG_TO_TAG_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.tags = responseData.tags;
      }
    );
  },
  data() {
    return {
      databases: [],
      selectedDatabase: "",
      tagToCreate: "",
      visibleCreationAlert: false,
      tags: [],
      tagToDelete: "",
      visibleDeleteAlert: false,
      headers: [
        {
          text: "ID",
          value: "id",
        },
        {
          text: "Name",
          value: "name",
        },
      ],
    };
  },
  methods: {
    createTag() {
      ipcRenderer.send("CREATE_TAG", {
        database: this.selectedDatabase,
        tag: this.tagToCreate,
      });
      this.tagToCreate = "";
      this.visibleCreationAlert = true;
      setTimeout(() => {
        this.visibleCreationAlert = false;
      }, 3000);
    },
    deleteTag() {
      ipcRenderer.send("DELETE_TAG", {
        database: this.selectedDatabase,
        tagId: this.tagToDelete,
      });
      this.tagToDelete = "";
      this.visibleDeleteAlert = true;
      setTimeout(() => {
        this.visibleDeleteAlert = false;
      }, 3000);
    },
    databaseChanged(d) {
      if (d) {
        this.tags = [];
        this.selectedDatabase = d;
      } else {
        this.tags = [];
        this.selectedDatabase = "";
      }
    },
  },
};
</script>

<style>
.v-text-field.v-text-field--enclosed .v-text-field__details {
  display: none;
}
.v-data-footer__select,
.v-data-footer__pagination {
  display: none !important;
}
.v-text-field__details {
  display: none !important;
}
</style>

<style scoped>
.createTagButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.deleteTagButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #d32d41 !important;
}
</style>