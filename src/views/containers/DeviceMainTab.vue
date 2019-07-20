<template lang="html">
  <b-row v-if="tabsIndex === 0" class="about-header">
    <b-col v-if="device" sm="8">
      <device-card v-if="device" :device="device" ref="deviceCard" />
      <device-editor ref="deviceEditor" :is-viewer="false" :edit-mode="true" />
      <br />
    </b-col>
    <b-col sm="4">
      <devices-list v-if="devices" :token="token" :user-id="userId" :devices="devices" />
    </b-col>

    <b-row v-if="!viewer && editorMode" align-h="center">
      <b-col sm="8">
        <b-alert
          v-if="error"
          :show="dismissCountDown && errorMessageExists"
          dismissible
          variant="warning"
          @dismissed="dismissCountDown = 0"
          @dismiss-count-down="countDownChanged"
        >
          {{ error.message }}
        </b-alert>
        <b-alert v-if="success" :show="successMessageExists" dismissible variant="success">
          {{ success.message }}
        </b-alert>
      </b-col>
    </b-row>
  </b-row>
</template>

<script type="text/javascript">
import { BAlert } from 'bootstrap-vue';
import has from 'lodash.has';

export default {
  name: 'DeviceMainTab',

  components: {
    'b-alert': BAlert,
    'device-card': () => import('@/components/Device/DeviceCard.vue'),
    'device-editor': () => import('@/components/Device/DeviceEditor.vue'),
    'devices-list': () => import('@/components/Device/DevicesList.vue'),
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
      confirm: {
        message: `Are you sure you want to delete this sensor ?`,
      },
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
    devices: {
      get() {
        return this.$store.state.device.collection;
      },
      set(value) {
        this.$store.commit('device/setStateKV', {
          key: 'collection',
          value,
        });
      },
    },
    device: {
      get() {
        // if (this.$props.deviceId)
        if (this.$store.state.device.instance.sensors) {
          const device = this.$store.state.device.instance;
          delete device.sensors;
          return device;
        }
        return this.$store.state.device.instance;
      },
      set(value) {
        this.$store.commit('device/setModel', value);
      },
    },
    dismissCountDown: {
      get() {
        return this.$store.state.device.dismissCountDown;
      },
      set(value) {
        this.$store.commit('device/setStateKV', {
          key: 'dismissCountDown',
          value,
        });
      },
    },
    errorMessageExists() {
      return has(this.error, 'message');
      //  return _.;
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
