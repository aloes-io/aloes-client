<template lang="html">
  <div class="search-result-view">
    <div v-if="searchSuccess">
      <b-alert :show="searchSuccess" variant="success">
        Your search contains {{ searchSuccess }} results
      </b-alert>
      <!-- -->
      <div v-if="searchResults && searchResults.type === 'device'" class="search-result">
        <device-inline
          v-for="device in searchResults.content"
          :key="device.id"
          :account="$store.state.auth.account"
          :token="token"
          :device="device"
        />
      </div>
      <b-row v-if="searchResults && searchResults.type === 'sensor'" class="search-result">
        <b-col
          v-for="sensor in searchResults.content"
          :key="sensor.id"
          cols="12"
          sm="6"
          md="6"
          lg="4"
          xl="3"
          class="sensor-snap-container"
        >
          <sensor-snap
            :ref="`sensorSnap${sensor.id}`"
            :id="sensor.id.toString()"
            :owner-id="sensor.ownerId.toString()"
            :device-id="sensor.deviceId.toString()"
            :dev-eui="sensor.devEui"
            :name="sensor.name"
            :type="sensor.type"
            :value="JSON.stringify(sensor.value)"
            :frame-counter="sensor.frameCounter"
            :resources="JSON.stringify(sensor.resources)"
            :resource="sensor.resource"
            :icons="sensor.icons.toString()"
            :colors="JSON.stringify(sensor.colors)"
            :transport-protocol="sensor.transportProtocol"
            :transport-protocol-version="sensor.transportProtocolVersion"
            :message-protocol="sensor.messageProtocol"
            :message-protocol-version="sensor.messageProtocolVersion"
            :input-path="sensor.inputPath || null"
            :output-path="sensor.outputPath || null"
            :in-prefix="sensor.inPrefix"
            :out-prefix="sensor.outPrefix"
            :native-type="sensor.nativeType"
            :native-resource="sensor.nativeResource"
            :native-sensor-id="sensor.nativeSensorId"
            :native-node-id="sensor.nativeNodeId || null"
            :width="180"
            :height="200"
            @update-sensor="handler"
            @update-setting="handler"
            @delete-sensor="handler"
          />
        </b-col>
      </b-row>
    </div>
    <b-alert v-else-if="searchError" :show="searchError !== null" variant="danger">
      {{ searchError.message }}
    </b-alert>
  </div>
</template>

<script type="text/javascript">
import { BAlert } from 'bootstrap-vue';

export default {
  name: 'SearchResult',

  components: {
    'b-alert': BAlert,
    'device-inline': () => import('@/components/Device/DeviceInline.vue'),
    'sensor-snap': () => import('sensor-snap'),
  },

  props: {
    token: {
      type: String,
      required: true,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      required: true,
      default: null,
    },
  },

  data() {
    return {
      updatedSearchResults: null,
    };
  },

  computed: {
    searchResults: {
      get() {
        return this.$store.state.search.model.results;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'results', value });
      },
    },
    searchType: {
      get() {
        return this.$store.state.search.model.type;
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

  methods: {
    handler() {
      return;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/search-result.scss';
</style>
