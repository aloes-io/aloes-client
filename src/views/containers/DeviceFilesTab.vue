<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-row v-if="tabsIndex === 3" class="about-header">
    <b-col v-if="device" sm="8">
      <h4>Handle files for {{ device.name || 'your device' }}</h4>
      <device-files
        :device="device"
        resource-type="Binaries"
        resource-role="Firmware"
        ref="deviceFiles"
        key="deviceFiles"
      />
      <br />
      <files-gallery
        v-if="device && device.id"
        :user-id="userId"
        :relation-id="device.id"
        user-type="Devices"
      />
    </b-col>
    <b-col sm="4">
      <devices-list :token="token" :user-id="userId" />
    </b-col>
  </b-row>
</template>

<script type="text/javascript">
import has from 'lodash.has';

export default {
  name: 'DeviceFilesTab',

  components: {
    'devices-list': () => import('@/components/Device/DevicesList.vue'),
    'device-files': () => import('@/components/Device/DeviceFiles.vue'),
    'files-gallery': () => import('@/components/Files/FilesGallery.vue'),
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
