<template lang="html">
  <b-row v-if="tabsIndex === 1" class="about-header">
    <b-col v-if="device" sm="8">
      <!--       <sensors-list
        v-if="sensors"
        v-show="sensors.length > 0"
        :user-id="userId"
        :sensors="sensors"
        :device-type="device.type"
        :device-id="device.id"
      /> -->
      <sensors-list :user-id="userId" :device-type="device.type" :device-id="device.id" />
    </b-col>
    <b-col sm="4">
      <devices-list :token="token" :user-id="userId" />
    </b-col>
  </b-row>
</template>

<script type="text/javascript">
import has from 'lodash.has';

export default {
  name: 'DeviceSensorsTab',

  components: {
    'devices-list': () => import('@/components/Device/DevicesList.vue'),
    'sensors-list': () => import('@/components/Sensor/SensorsList.vue'),
  },

  props: {
    token: {
      type: String,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      required: true,
    },
    'is-viewer': {
      type: Boolean,
      required: false,
    },
    'edit-mode': {
      type: Boolean,
      required: true,
    },
    'tabs-index': {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      viewer: false,
      editorMode: true,
      loading: false,
    };
  },

  computed: {
    success: {
      get() {
        return this.$store.state.device.success;
      },
      set(value) {
        this.$store.commit('device/setStateKV', {
          key: 'success',
          value,
        });
      },
    },
    error: {
      get() {
        return this.$store.state.device.error;
      },
      set(value) {
        this.$store.commit('device/setStateKV', {
          key: 'error',
          value,
        });
      },
    },
    device: {
      get() {
        return this.$store.state.device.instance;
      },
    },
    errorMessageExists() {
      return has(this.error, 'message');
    },
    successMessageExists() {
      return has(this.sucess, 'message');
    },
  },

  watch: {
    isViewer: {
      handler(state) {
        this.viewer = state;
      },
      immediate: true,
    },
    editorMode: {
      handler(state) {
        this.editMode = state;
      },
      immediate: true,
    },
  },

  async mounted() {
    this.loading = false;
  },

  beforeDestroy() {
    this.loading = false;
  },

  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
  },
};
</script>

<style lang="scss">
@import '../../style/device-container.scss';
</style>
