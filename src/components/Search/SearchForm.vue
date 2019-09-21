<template lang="html">
  <b-form class="search-form" @submit="search">
    <b-row align-h="center">
      <b-col cols="12" sm="5" md="5" lg="5" xl="5">
        <b-form-input
          id="search-place"
          v-model="searchKeys"
          :required="!nameSearch"
          placeholder="Keywords"
          type="text"
          size="sm"
          autocomplete="search"
        />
        <b-form-select
          id="search-type"
          ref="searchType"
          v-model="searchType"
          :select-size="1"
          :options="searchTypes"
          placeholder="Collection"
          size="sm"
          required
        />
      </b-col>
      <!-- TODO : add a reset parameter button  -->
      <b-col cols="4" sm="2" lg="2" xl="2">
        <b-button id="search-custom" type="submit">
          <fa-icon icon="search" size="lg" />
        </b-button>
        <b-button id="search-geolocation" @click="locationSearch">
          <fa-icon icon="map-marker" size="lg" />
        </b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script type="text/javascript">
import { BButton, BForm, BFormInput, BFormSelect } from 'bootstrap-vue';
import logger from '@/services/logger';

export default {
  name: 'SearchForm',

  components: {
    'b-button': BButton,
    'b-form': BForm,
    'b-form-input': BFormInput,
    'b-form-select': BFormSelect,
  },

  props: {
    token: {
      type: String,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      default: null,
    },
  },

  data() {
    return {
      nameSearch: null,
      searchKeys: null,
      dateSearch: null,
      searchFields: null,
      searchTypes: [
        { text: 'type', value: null, disabled: true },
        { text: 'Device', value: 'device' },
        { text: 'Sensor', value: 'sensor' },
      ],
    };
  },

  computed: {
    statusFilter: {
      get() {
        return this.$store.state.search.model.statusFilter;
      },
    },
    searchLocation: {
      get() {
        return this.$store.state.search.model.location;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'location', value });
      },
    },
    searchType: {
      get() {
        return this.$store.state.search.model.type;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'type', value });
      },
    },
    searchResults: {
      get() {
        return this.$store.state.search.model.results;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'results', value });
      },
    },
    searchError: {
      get() {
        return this.$store.state.search.model.error;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'error', value });
      },
    },
    searchSuccess: {
      get() {
        return this.$store.state.search.model.success;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'success', value });
      },
    },
  },

  // mounted() {
  //   this.$store.commit('search/cleanSearch');
  // },

  beforeDestroy() {
    this.$store.commit('search/cleanSearch');
  },

  methods: {
    async search(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.searchError = null;
      this.searchSuccess = null;
      this.dateSearch = null;
      if (!this.searchKeys) {
        this.searchError = new Error('Please fill search field');
        return null;
      }
      const filter = {
        text: this.searchKeys,
      };
      logger.publish(4, 'search', 'composeFilter:req', filter);
      return this.$store
        .dispatch(`search/search`, filter)
        .then(res => res)
        .catch(err => err);
    },

    async getDevicesByGeolocation(position) {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.searchLocation = location;
      const filter = {
        location,
        maxDistance: 300,
        unit: 'kilometers',
      };
      logger.publish(4, 'search', 'getDevicesByGeolocation:req', filter);
      return this.$store
        .dispatch('search/getDevicesByGeolocation', filter)
        .then(res => res)
        .catch(err => err);
    },

    showLocationError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          logger.publish(
            4,
            'search',
            'showLocationError:err',
            'User denied the request for Geolocation.',
          );
          this.searchError = {
            message: 'User denied the request for Geolocation.',
          };
          break;
        case error.POSITION_UNAVAILABLE:
          logger.publish(
            4,
            'search',
            'showLocationError:err',
            'Location information is unavailable.',
          );
          this.searchError = {
            message: `Location information is unavailable.`,
          };
          break;
        case error.TIMEOUT:
          logger.publish(
            4,
            'search',
            'showLocationError:err',
            'The request to get user location timed out.',
          );
          this.searchError = {
            message: 'The request to get user location timed out.',
          };
          break;
        case error.UNKNOWN_ERROR:
          logger.publish(4, 'search', 'showLocationError:err', 'An unknown error occurred.');
          this.searchError = {
            message: `An unknown error occurred.`,
          };
          break;
        default:
          logger.publish(4, 'search', 'showLocationError:err', 'An unknown error occurred.');
          this.searchError = {
            message: `An unknown error occurred.`,
          };
      }
    },

    async locationSearch(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.searchSuccess = false;
      this.searchError = null;
      const userCoordinates = this.$store.state.address.profileAddress.coordinates;
      if (userCoordinates && userCoordinates.lat && userCoordinates.lng) {
        const position = {
          coords: {
            latitude: userCoordinates.lat,
            longitude: userCoordinates.lng,
          },
        };
        logger.publish(4, 'search', 'locationSearch:req', position);
        await this.getDevicesByGeolocation(position);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          this.getDevicesByGeolocation,
          this.showLocationError,
        );
      } else {
        this.searchError = new Error(
          `Geolocation not supported by your browser, fill the address field in your settings.`,
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/search-form.scss';
</style>
