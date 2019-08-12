<template lang="html">
  <div v-if="searchSuccess || devices" class="search-map">
    <l-map
      ref="map"
      :zoom="currentZoom"
      :center="currentCenter"
      :options="mapOptions"
      style="min-height: 60vh;"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <div v-for="device in devices" :key="device.id">
        <l-marker
          v-if="
            device.address &&
              device.address.coordinates &&
              device.address.coordinates.lat &&
              device.address.coordinates.lng
          "
          :lat-lng="[device.address.coordinates.lat, device.address.coordinates.lng]"
          @mouseover="highlightDevice(device, true)"
          @mouseleave="highlightDevice(device, false)"
        >
          <l-icon
            ref="mapIcon"
            :icon-size="dynamicSize"
            :icon-anchor="dynamicAnchor"
            :icon-url="$store.state.style.pictures.mapMarker"
          />
          <l-popup>
            <img :src="device.icons[0]" class="thumb-icon" />
            <div @click="goToDevice(device)">
              {{ device.name }}
              <p v-show="showParagraph">
                {{ device.description }}
              </p>
            </div>
          </l-popup>
        </l-marker>
      </div>
    </l-map>
    <!-- <b-button @click="showLongText">
      Show descriptions
    </b-button> -->
  </div>
</template>

<script type="text/javascript">
import 'leaflet/dist/leaflet.css';
//  import bButton from "bootstrap-vue/es/components/button/button";
import { LMap, LTileLayer, LIcon, LMarker, LPopup } from 'vue2-leaflet';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'SearchMap',

  components: {
    //  "b-button": bButton,
    'l-map': LMap,
    'l-icon': LIcon,
    'l-tile-layer': LTileLayer,
    'l-marker': LMarker,
    'l-popup': LPopup,
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
    devices: {
      type: Array,
      default: null,
    },
  },

  data() {
    return {
      url: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      currentZoom: 8,
      currentCenter: [48.86392, 2.323738],
      showParagraph: false,
      iconSize: 20,
      mapOptions: {
        zoomSnap: 1,
      },
    };
  },

  computed: {
    accountType: {
      get() {
        return this.$store.state.auth.account.type;
      },
    },
    searchResults: {
      get() {
        return this.$store.state.search.model.results;
      },
    },
    searchSuccess: {
      get() {
        return this.$store.state.search.model.success;
      },
    },
    searchLocation: {
      get() {
        return this.$store.state.search.model.location || { lat: 48.86392, lng: 2.323738 };
      },
    },
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.5];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
  },

  created() {},

  mounted() {
    this.$nextTick(() => {
      if (this.searchResults && this.searchSuccess) {
        this.map = this.$refs.map.mapObject;
        if (this.searchLocation !== null) {
          this.currentCenter = [this.searchLocation.lat, this.searchLocation.lng];
        }
      }
      //  this.map._onResize();
    });
    this.setListeners();
  },

  beforeDestroy() {
    EventBus.$off('deviceSelected');
  },

  methods: {
    setListeners() {
      EventBus.$on('deviceSelected', device => {
        if (device && device !== null) {
          const hasAddress = Object.getOwnPropertyNames(device).find(key => key === 'address');
          if (hasAddress && device.address.coordinates) {
            this.currentCenter = [device.address.coordinates.lat, device.address.coordinates.lng];
            return this.currentCenter;
          }
        }
        return null;
      });
    },

    getDeviceCoordinates(device) {
      if (device && device.address && device.address.coordinates) {
        return [device.address.coordinates.lat, device.address.coordinates.lng];
      }
      return null;
    },

    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },

    centerUpdate(center) {
      this.currentCenter = center;
    },

    showLongText() {
      this.showParagraph = !this.showParagraph;
    },

    onResize() {
      //  this.$refs.map.mapObject.invalidateSize();
    },

    highlightDevice(device, state) {
      if (!device || device === null) return null;
      if (state === true) {
        if (device.address && device.address.coordinates) {
          // this.currentCenter = L.latLng(
          //   device.deviceAddress.coordinates.lat,
          //   device.deviceAddress.coordinates.lng,
          // );
          this.currentCenter = [device.address.coordinates.lat, device.address.coordinates.lng];
        }

        EventBus.$emit(`deviceSelected-${device.id}`, device, state);
      } else if (state === false) {
        EventBus.$emit(`deviceSelected-${device.id}`, device, state);
      }
    },

    async goToDevice(device) {
      if (!this.$store.state.auth.account.subscribed.startsWith('paid')) {
        return null;
      }
      this.error = null;
      this.success = null;
      logger.publish(4, 'search', 'goToDevice:req', device.id);
      return this.$store.commit('device/setModel', device);
      // if (this.$route.name !== "device")
      // return this.$router.push({
      //   name: "device",
      //   query: {
      //     deviceId: device.id,
      //   },
      // });
    },
  },
};
</script>

<style lang="scss">
@import '../../style/search-map.scss';
</style>
