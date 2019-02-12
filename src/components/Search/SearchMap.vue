<template lang="html">
  <div v-if="searchSuccess" class="search-map">
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
      <l-marker
        v-if="searchLocation"
        :lat-lng="[searchLocation.lat, searchLocation.lng]"
      >
        <l-icon
          :icon-size="dynamicSize"
          :icon-anchor="dynamicAnchor"
          :icon-url="$store.state.style.pictures.mapMarkerWhite"
        />
        <l-popup>
          <img :src="profile.avatarImgUrl" class="thumb-icon" />
          <div>
            {{ profile.firstName }} {{ profile.lastName }}
            <p v-show="showParagraph">
              {{ profile.description }}
            </p>
          </div>
        </l-popup>
      </l-marker>
      <div v-for="profile in searchResults" :key="profile.id">
        <l-marker
          v-if="profile.profileAddress && profile.profileAddress.coordinates"
          :lat-lng="[
            profile.profileAddress.coordinates.lat,
            profile.profileAddress.coordinates.lng
          ]"
          @mouseover="highlightProfile(profile)"
          @mouseleave="highlightProfile(null)"
        >
          <l-icon
            ref="mapIcon"
            :icon-size="dynamicSize"
            :icon-anchor="dynamicAnchor"
            :icon-url="$store.state.style.pictures.mapMarker"
          />
          <l-popup>
            <img :src="profile.avatarImgUrl" class="thumb-icon" />
            <div @click="goToProfile(profile)">
              {{ profile.firstName }} {{ profile.lastName }}
              <p v-show="showParagraph">
                {{ profile.description }}
              </p>
            </div>
          </l-popup>
        </l-marker>
      </div>
    </l-map>
    <!-- <b-button @click="showLongText">
      Afficher les descriptions
    </b-button> -->
  </div>
</template>

<script type="text/javascript">
import "leaflet/dist/leaflet.css";
//  import bButton from "bootstrap-vue/es/components/button/button";
import { L, LMap, LTileLayer, LIcon, LMarker, LPopup } from "vue2-leaflet";
import { EventBus } from "@/services/PubSub";
import logger from "@/services/logger";

export default {
  name: "SearchMap",

  components: {
    //  "b-button": bButton,
    "l-map": LMap,
    "l-icon": LIcon,
    "l-tile-layer": LTileLayer,
    "l-marker": LMarker,
    "l-popup": LPopup
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
      url: "https://{s}.tile.osm.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      currentZoom: 8,
      currentCenter: [48.86392, 2.323738],
      showParagraph: false,
      iconSize: 20,
      mapOptions: {
        zoomSnap: 1
      }
    };
  },

  computed: {
    accountType: {
      get() {
        return this.$store.state.auth.account.type;
      }
    },
    profile: {
      get() {
        return this.$store.state[`${this.accountType.toLowerCase()}`].model;
      }
    },
    searchProfileType: {
      get() {
        return this.$store.state.search.model.profileType;
      }
    },
    profileType: {
      get() {
        if (this.searchProfileType) {
          return this.searchProfileType;
        }
        return "Teacher";
      }
    },
    searchResults: {
      get() {
        return this.$store.state.search.model.results;
      }
    },
    searchSuccess: {
      get() {
        return this.$store.state.search.model.success;
      }
    },
    searchLocation: {
      get() {
        return this.$store.state.search.model.location;
      }
    },
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.5];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    }
  },

  created() {},

  mounted() {
    this.$nextTick(() => {
      if (this.searchResults && this.searchSuccess) {
        this.map = this.$refs.map.mapObject;
        if (this.searchLocation !== null) {
          this.currentCenter = [
            this.searchLocation.lat,
            this.searchLocation.lng
          ];
        }
      }
      //  this.map._onResize();
    });
  },

  beforeDestroy() {
    EventBus.$off("highlightProfile");
  },

  methods: {
    setListeners() {
      if (!EventBus._events) return null;
      if (
        !EventBus._events.highlightProfile ||
        EventBus._events.highlightProfile.length === 0
      ) {
        EventBus.$on("highlightProfile", profile => {
          if (profile && profile !== null) {
            const hasAddress = Object.getOwnPropertyNames(profile).find(
              key => key === "profileAddress"
            );
            if (hasAddress && profile.profileAddress.coordinates) {
              this.currentCenter = [
                profile.profileAddress.coordinates.lat,
                profile.profileAddress.coordinates.lng
              ];
              return this.currentCenter;
            }
          }
          return null;
        });
      } else if (EventBus._events.highlightProfile.length > 2) {
        EventBus._events.highlightProfile.splice(1);
      }
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

    highlightProfile(profile) {
      if (profile !== null) {
        this.currentCenter = L.latLng(
          profile.profileAddress.coordinates.lat,
          profile.profileAddress.coordinates.lng
        );
        EventBus.$emit("profileSelected", profile);
      } else {
        EventBus.$emit("profileSelected", profile);
      }
    },

    async goToProfile(profile) {
      if (!this.$store.state.auth.account.subscribed.startsWith("paid")) {
        return null;
      }
      this.error = null;
      this.success = null;
      logger.publish(4, "search", "goToProfile:req", profile.id);
      await this.$store.commit(`${this.profileType.toLowerCase()}/setModel`, {
        viewer: true,
        profile
      });
      return this.$router.push({
        name: "profile",
        query: {
          profileId: profile.id,
          profileType: this.profileType
        }
      });
    }
  }
};
</script>

<style lang="scss">
@import "../../style/search-map.scss";
</style>
