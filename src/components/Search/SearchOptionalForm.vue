<template lang="html">
  <div class="search-optional-form">
    <b-row align-h="center">
      <b-col cols="6" sm="3" md="3" lg="2" xl="2" class="search-columns">
        <!--  <b-form-select
          id="search-yoga-style"
          v-model="yogaStyleFilter"
          :options="yogaStyles"
          plain
          size="sm"/> -->
      </b-col>
      <b-col cols="12" sm="3" md="3" lg="3" xl="2" class="search-columns">
        <b-button class="filter-buttons" @click="statusFilter = !statusFilter">
          <img
            v-if="statusFilter"
            :src="$store.state.style.pictures.statusOn"
          />
          <img
            v-else-if="!statusFilter"
            :src="$store.state.style.pictures.statusOff"
          />
        </b-button>
        <b-button
          class="filter-buttons"
          @click="favoriteFilter = !favoriteFilter"
        >
          <img
            v-if="favoriteFilter"
            :src="$store.state.style.pictures.favorites"
          />
          <img
            v-else-if="!favoriteFilter"
            :src="$store.state.style.pictures.favoritesOff"
          />
        </b-button>
      </b-col>
      <b-col sm="3" md="3" lg="4" xl="5" />
    </b-row>
    <b-row align-h="center" class="date-search">
      <b-col cols="6" sm="3" md="3" lg="2" xl="2" class="search-columns">
        <date-picker
          id="searchAppointmentRecurStart"
          ref="searchAppointmentRecurStart"
          v-model="appointmentRecurStart"
          :config="datePickerOptions"
          placeholder="Date de début"
          size="sm"
          required
          class="input-holder date-time-pickers"
          @dp-change="onAppointmentRecurStartChange"
        />
      </b-col>
      <b-col cols="6" sm="3" md="3" lg="2" xl="2" class="search-columns">
        <date-picker
          id="searchAppointmentStart"
          ref="searchAppointmentStart"
          v-model="appointmentStart"
          :config="timePickerOptions"
          placeholder="Heure de début"
          required
          size="sm"
          class="input-holder date-time-pickers"
          @dp-change="onAppointmentStartChange"
        />
      </b-col>
      <b-col cols="6" sm="3" md="3" lg="2" xl="2" class="search-columns">
        <date-picker
          id="searchAppointmentRecurEnd"
          ref="searchAppointmentRecurEnd"
          v-model="appointmentRecurEnd"
          :config="datePickerOptions"
          placeholder="Date de fin"
          required
          size="sm"
          class="input-holder date-time-pickers"
          @dp-change="onAppointmentRecurEndChange"
        />
      </b-col>
      <b-col cols="6" sm="3" md="3" lg="2" xl="2" class="search-columns">
        <date-picker
          id="searchAppointmentEnd"
          ref="searchAppointmentEnd"
          v-model="appointmentEnd"
          :config="timePickerOptions"
          placeholder="Heure de fin"
          required
          size="sm"
          class="input-holder date-time-pickers"
          @dp-change="onAppointmentEndChange"
        />
      </b-col>
      <b-col sm="0" md="0" lg="3" xl="3" />
    </b-row>
  </div>
</template>

<script type="text/javascript">
import $ from "jquery";
import "pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css";
import DatePicker from "vue-bootstrap-datetimepicker";
import bButton from "bootstrap-vue/es/components/button/button";

export default {
  name: "SearchOptionalForm",

  components: {
    "b-button": bButton,
    "date-picker": DatePicker
  },

  data() {
    return {
      selectedFilters: []
    };
  },

  computed: {
    searchProfileType: {
      get() {
        return this.$store.state.search.model.profileType;
      }
    },
    profileType: {
      get() {
        if (this.searchProfileType) {
          // return `${this.searchProfileType.slice(
          //   0,
          //   this.searchProfileType.lastIndexOf('s'),
          // )}`;
          return this.searchProfileType;
        }
        return "Teacher";
      }
    },
    // yogaStyles: {
    //   get() {
    //     return this.$store.state.yoga.styles;
    //   }
    // },
    yogaStyleFilter: {
      get() {
        return this.$store.state.search.model.yogaStyle;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "yogaStyle", value });
      }
    },
    certifiedYA: {
      get() {
        return this.$store.state.search.model.certifiedYA;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "certifiedYA", value });
      }
    },
    statusFilter: {
      get() {
        return this.$store.state.search.model.statusFilter;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "statusFilter", value });
      }
    },
    expressFilter: {
      get() {
        return this.$store.state.search.model.expressFilter;
      },
      set(value) {
        this.$store.commit("search/setModelKV", {
          key: "expressFilter",
          value
        });
      }
    },
    favoriteFilter: {
      get() {
        return this.$store.state.search.model.favoriteFilter;
      },
      set(value) {
        this.$store.commit("search/setModelKV", {
          key: "favoriteFilter",
          value
        });
      }
    },
    appointmentFields: {
      get() {
        return this.$store.state.search.model.appointment;
      },
      set(value) {
        this.$store.commit("search/setModelList", {
          cmd: "add",
          key: "appointment",
          value
        });
      }
    },
    appointmentRecurStart: {
      get() {
        return this.$store.state.search.model.appointment.recurStart;
      },
      set(value) {
        this.$store.commit("search/setAppointmentKV", {
          key: "recurStart",
          value
        });
      }
    },
    appointmentStart: {
      get() {
        return this.$store.state.search.model.appointment.start;
      },
      set(value) {
        this.$store.commit("search/setAppointmentKV", { key: "start", value });
      }
    },
    appointmentEnd: {
      get() {
        return this.$store.state.search.model.appointment.end;
      },
      set(value) {
        this.$store.commit("search/setAppointmentKV", { key: "end", value });
      }
    },
    appointmentRecurEnd: {
      get() {
        return this.$store.state.search.model.appointment.recurEnd;
      },
      set(value) {
        this.$store.commit("search/setAppointmentKV", {
          key: "recurEnd",
          value
        });
      }
    },
    timePickerOptions: {
      get() {
        return this.$store.state.time.timePickerOptions;
      }
    },
    datePickerOptions: {
      get() {
        return this.$store.state.time.datePickerOptions;
      }
    }
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    onAppointmentRecurStartChange(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      if (evt.date) {
        $("#searchAppointmentRecurEnd")
          .data("DateTimePicker")
          .minDate(evt.date);
      }
    },

    onAppointmentRecurEndChange(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      if (evt.date) {
        $("#searchAppointmentRecurStart")
          .data("DateTimePicker")
          .maxDate(evt.date);
      }
    },

    onAppointmentStartChange(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      if (evt.date) {
        $("#searchAppointmentEnd")
          .data("DateTimePicker")
          .minDate(evt.date);
      }
    },

    onAppointmentEndChange(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      if (evt.date) {
        $("#searchAppointmentStart")
          .data("DateTimePicker")
          .maxDate(evt.date);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/search-opt-form.scss";
</style>
