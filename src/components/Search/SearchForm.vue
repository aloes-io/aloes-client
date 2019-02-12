<template lang="html">
  <b-form class="search-form" @submit="searchProfiles">
    <b-row align-h="center">
      <b-col cols="12" sm="5" md="5" lg="4" xl="4">
        <b-form-input
          id="search-name"
          v-model="nameSearch"
          :required="!placeSearch"
          :placeholder="profileNameInput"
          type="text"
          size="sm"
          autocomplete="search"
        />
      </b-col>
      <b-col cols="12" sm="5" md="5" lg="5" xl="5">
        <b-form-input
          id="search-place"
          v-model="placeSearch"
          :required="!nameSearch"
          placeholder="Where ?"
          type="text"
          size="sm"
          autocomplete="search"
        />
      </b-col>
      <!-- TODO : add a reset parameter button  -->
      <b-col cols="4" sm="2" lg="2" xl="2">
        <b-button id="search-custom" type="submit">
          <i :aria-hidden="true" class="fa fa-search" />
        </b-button>
        <b-button id="search-geolocation" @click="getUserLocation">
          <i :aria-hidden="true" class="fa fa-map-marker" />
        </b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script type="text/javascript">
import moment from "moment";
import bButton from "bootstrap-vue/es/components/button/button";
import bForm from "bootstrap-vue/es/components/form/form";
import bFormInput from "bootstrap-vue/es/components/form-input/form-input";
import logger from "@/services/logger";

export default {
  name: "SearchForm",

  components: {
    "b-button": bButton,
    "b-form": bForm,
    "b-form-input": bFormInput
  },

  props: {
    token: {
      type: String,
      default: ""
    },
    "user-id": {
      type: [String, Number],
      default: null
    }
  },

  data() {
    return {
      nameSearch: null,
      placeSearch: null,
      dateSearch: null,
      searchFields: null
    };
  },

  computed: {
    accountType: {
      get() {
        return this.$store.state.auth.account.type;
      }
    },
    profileNameInput: {
      get() {
        if (this.accountType === "Teacher") {
          return "Nom du studio";
        }
        return "Nom du professeur";
      }
    },
    profileType: {
      get() {
        return this.$store.state.search.model.profileType;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "profileType", value });
      }
    },
    yogaStyleFilter: {
      get() {
        return this.$store.state.search.model.yogaStyle;
      }
    },
    certifiedYA: {
      get() {
        return this.$store.state.search.model.certifiedYA;
      }
    },
    statusFilter: {
      get() {
        return this.$store.state.search.model.statusFilter;
      }
    },
    expressFilter: {
      get() {
        return this.$store.state.search.model.expressFilter;
      }
    },
    favoriteFilter: {
      get() {
        return this.$store.state.search.model.favoriteFilter;
      }
    },
    appointmentFields: {
      get() {
        return this.$store.state.search.model.appointment;
      }
    },
    searchLocation: {
      get() {
        return this.$store.state.search.model.location;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "location", value });
      }
    },
    searchResults: {
      get() {
        return this.$store.state.search.model.results;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "results", value });
      }
    },
    searchError: {
      get() {
        return this.$store.state.search.model.error;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "error", value });
      }
    },
    searchSuccess: {
      get() {
        return this.$store.state.search.model.success;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "success", value });
      }
    }
  },

  mounted() {
    this.$store.commit("search/cleanSearch");
  },

  beforeDestroy() {
    this.$store.commit("search/cleanSearch");
  },

  methods: {
    async searchProfiles(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.searchError = null;
      this.searchSuccess = null;
      this.dateSearch = null;
      let start, end;

      if (!this.nameSearch && !this.placeSearch) {
        this.searchError = new Error(
          "Veuillez remplir au moins un champ de recherche"
        );
        return this.searchError;
      }
      if (this.appointmentFields.recurStart && this.appointmentFields.start) {
        start = moment(
          `${this.appointmentFields.recurStart} ${
            this.appointmentFields.start
          }:00`,
          "YYYY-MM-DD hh:mm:ss"
        ).toDate();
        this.dateSearch = true;
      }
      if (this.appointmentFields.recurEnd && this.appointmentFields.end) {
        end = moment(
          `${this.appointmentFields.recurEnd} ${this.appointmentFields.end}:00`,
          "YYYY-MM-DD hh:mm:ss"
        ).toDate();
        this.dateSearch = true;
      }

      const filter = {
        name: this.nameSearch,
        place: this.placeSearch,
        status: this.statusFilter,
        expressYogi: this.expressFilter,
        yogaStyle: this.yogaStyleFilter,
        certifiedYA: this.certifiedYA,
        favorites: this.favoriteFilter,
        appointment: this.dateSearch ? { start, end } : null,
        accountType: this.accountType
      };
      logger.publish(4, "search", "composeFilter:req", filter);
      const profiles = await this.$store
        .dispatch(`search/searchProfiles`, filter)
        .then(res => res)
        .catch(err => err);
      //  this.$store.commit('search/cleanSearch');

      return profiles;
    },

    async getProfilesByGeolocation(position) {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.searchLocation = location;
      const filter = {
        accountType: this.accountType,
        location,
        maxDistance: 1000,
        unit: "kilometers"
      };
      logger.publish(4, "search", "getProfilesByGeolocation:req", filter);
      return this.$store
        .dispatch("search/getProfilesByGeolocation", filter)
        .then(res => res)
        .catch(err => err);
      //  return profiles;
    },

    showLocationError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          logger.publish(
            4,
            "search",
            "showLocationError:err",
            "User denied the request for Geolocation."
          );
          this.searchError = {
            message: "Vous avez refusé la géolocalisation"
          };
          break;
        case error.POSITION_UNAVAILABLE:
          logger.publish(
            4,
            "search",
            "showLocationError:err",
            "Location information is unavailable."
          );
          this.searchError = new Error(
            "Information de géolocalisation indisponible"
          );
          break;
        case error.TIMEOUT:
          logger.publish(
            4,
            "search",
            "showLocationError:err",
            "The request to get user location timed out."
          );
          this.searchError = {
            message: "Le durée limite de la requête a été dépassée"
          };
          break;
        case error.UNKNOWN_ERROR:
          logger.publish(
            4,
            "search",
            "showLocationError:err",
            "An unknown error occurred."
          );
          this.searchError = {
            message: `Une erreur inconnue s'est produite, veuillez réessayer`
          };
          break;
        default:
          logger.publish(
            4,
            "search",
            "showLocationError:err",
            "An unknown error occurred."
          );
          this.searchError = {
            message: `Une erreur inconnue s'est produite, veuillez réessayer`
          };
      }
    },

    getUserLocation(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.searchSuccess = false;
      this.searchError = null;
      const userCoordinates = this.$store.state[
        `${this.accountType.toLowerCase()}`
      ].profileAddress.coordinates;
      if (userCoordinates) {
        const position = {
          coords: {
            latitude: userCoordinates.lat,
            longitude: userCoordinates.lng
          }
        };
        logger.publish(4, "search", "getUserLocation:req", position);
        this.getProfilesByGeolocation(position);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          this.getProfilesByGeolocation,
          this.showLocationError
        );
      } else {
        this.searchError = new Error(
          `La géolocalisation n'est pas supportée par votre navigateur, veuillez entrer une addresse dans votre profil pour l'utiliser comme référence.`
        );
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/search-form.scss";
</style>
