<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-container fluid class="device-container">
    <b-tabs content-class="mt-3" justified @input="checkTabs">
      <b-tab title="Devices" active>
        <b-row v-if="devices && tabsIndex === 0" class="devices-map">
          <b-col sm="12">
            <search-map :token="token" :user-id="userId" :devices="devices" />
          </b-col>
        </b-row>
        <device-main-tab
          :user-id="userId"
          :token="token"
          :tabs-index="tabsIndex"
          :edit-mode="editorMode"
          :is-viewer="isViewer"
        />
      </b-tab>
      <b-tab title="Sensors">
        <device-sensors-tab
          :user-id="userId"
          :token="token"
          :tabs-index="tabsIndex"
          :edit-mode="editorMode"
          :is-viewer="isViewer"
        />
      </b-tab>
      <b-tab title="Tree">
        <device-tree-tab
          :user-id="userId"
          :token="token"
          :tabs-index="tabsIndex"
          :edit-mode="editorMode"
          :is-viewer="isViewer"
          ref="deviceTreeTab"
        />
      </b-tab>
      <b-tab title="Files">
        <device-files-tab
          :user-id="userId"
          :token="token"
          :tabs-index="tabsIndex"
          :edit-mode="editorMode"
          :is-viewer="isViewer"
        />
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script type="text/javascript">
import { BTab, BTabs } from 'bootstrap-vue';
import { EventBus } from '@/services/PubSub';
import Collection from '@/mixins/collection';
import logger from '@/services/logger';

export default {
  name: 'DeviceContainer',

  components: {
    'b-tab': BTab,
    'b-tabs': BTabs,
    'device-files-tab': () => import('@/views/containers/DeviceFilesTab.vue'),
    'device-main-tab': () => import('@/views/containers/DeviceMainTab.vue'),
    'device-tree-tab': () => import('@/views/containers/DeviceTreeTab.vue'),
    'device-sensors-tab': () => import('@/views/containers/DeviceSensorsTab.vue'),
    'search-map': () => import('@/components/Search/SearchMap.vue'),
  },

  mixins: [Collection],

  props: {
    token: {
      type: String,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      required: true,
    },
    'device-id': {
      type: [String, Number],
      required: false,
    },
    'is-viewer': {
      type: Boolean,
      required: false,
    },
    'edit-mode': {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      deviceTreeLoaded: true,
      viewer: false,
      editorMode: true,
      loading: false,
      tabsIndex: 0,
      zoomSlider: 0,
      nodesRadius: 20,
      linksLength: 1.7,
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
        return this.$store.state.device.instance;
      },
      set(value) {
        if (value.sensors) {
          delete value.sensors;
        }
        this.$store.commit('device/setStateKV', {
          key: 'instance',
          value,
        });
      },
    },
    sensors: {
      get() {
        return this.$store.state.sensor.collection;
      },
      set(value) {
        this.$store.commit('sensor/setStateKV', {
          key: 'collection',
          value,
        });
      },
    },
    sensor: {
      get() {
        return this.$store.state.sensor.instance;
      },
    },
    deviceTree() {
      if (this.$refs.deviceTreeTab && this.$refs.deviceTreeTab.deviceTree !== null) {
        return this.$refs.deviceTreeTab.deviceTree;
      }
      return null;
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

  mounted() {
    this.loading = false;
    this.setListeners();
  },

  beforeDestroy() {
    this.loading = false;
    this.removeListeners();
  },

  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },

    checkTabs(tabsIndex) {
      this.tabsIndex = tabsIndex;
    },

    async createDevice(device) {
      try {
        if (device && device.id) {
          if (device.isNewInstance) {
            this.devices = await this.updateDeviceCollection(this.devices, 'create', device, false);
          } else {
            this.devices = await this.updateDeviceCollection(this.devices, 'update', device, false);
          }
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeCreated(device);
          }
          if (this.device && this.device.id.toString() === device.id.toString()) {
            this.device = device;
          }
          return device;
        }
        throw new Error('No device Id');
      } catch (error) {
        logger.publish(2, 'device', 'createDevice:err', error);
        return null;
      }
    },

    async updateDevice(device) {
      try {
        if (device && device.id) {
          this.devices = await this.updateDeviceCollection(this.devices, 'update', device, false);
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeUpdated(device);
          }
          if (this.device && this.device.id.toString() === device.id.toString()) {
            this.device = device;
          }
          return device;
        }
        throw new Error('No device Id');
      } catch (error) {
        logger.publish(2, 'device', 'updateDevice:err', error);
        return null;
      }
    },

    async deleteDevice(device) {
      try {
        if (device && device.id) {
          this.devices = await this.updateDeviceCollection(this.devices, 'delete', device, false);
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeDeleted(device);
          }
          if (this.device && this.device.id && device.id.toString() === this.device.id.toString()) {
            this.$store.commit('device/cleanModel');
          }
          return device;
        }
        throw new Error('No device Id');
      } catch (error) {
        logger.publish(2, 'device', 'deleteDevice:err', error);
        return null;
      }
    },

    async createSensor(sensor) {
      try {
        if (sensor && sensor.id) {
          if (sensor.isNewInstance) {
            this.sensors = await this.updateSensorCollection(this.sensors, 'create', sensor, false);
          } else {
            this.sensors = await this.updateSensorCollection(this.sensors, 'update', sensor, false);
          }
          if (this.deviceTree && this.deviceTree !== null) {
            if (sensor.isNewInstance) {
              this.deviceTree.onNodeCreated(sensor);
            } else {
              this.deviceTree.onNodeUpdated(sensor);
            }
          }
          return sensor;
        }
        throw new Error('No sensor Id');
      } catch (error) {
        logger.publish(2, 'sensor', 'createSensor:err', error);
        return null;
      }
    },

    async updateSensor(sensor) {
      try {
        if (sensor && sensor.id) {
          this.sensors = await this.updateSensorCollection(this.sensors, 'update', sensor, true);
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeUpdated(sensor);
          }
          return sensor;
        }
        throw new Error('No sensor Id');
      } catch (error) {
        logger.publish(2, 'sensor', 'updateSensor:err', error);
        return null;
      }
    },

    async deleteSensor(sensor) {
      try {
        if (sensor && sensor.id) {
          this.sensors = await this.updateSensorCollection(this.sensors, 'delete', sensor, true);
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeDeleted(sensor);
          }
          if (this.sensor && sensor.id.toString() === this.sensor.id.toString()) {
            this.$store.commit('sensor/cleanModel');
          }
          return sensor;
        }
        throw new Error('No sensor Id');
      } catch (error) {
        logger.publish(2, 'sensor', 'deleteSensor:err', error);
        return null;
      }
    },

    setListeners() {
      EventBus.$on('onDeviceDeleted', this.deleteDevice);
      EventBus.$on('onDevicePresented', device => EventBus.$emit('onDeviceUpdated', device));
      EventBus.$on('onDeviceCreated', this.createDevice);
      EventBus.$on('onDeviceUpdated', this.updateDevice);
      EventBus.$on('onSensorDeleted', this.deleteSensor);
      EventBus.$on('onSensorPresented', sensor => EventBus.$emit('onSensorCreated', sensor));
      EventBus.$on('onSensorCreated', this.createSensor);
      EventBus.$on('onSensorUpdated', this.updateSensor);
    },

    removeListeners() {
      EventBus.$off('onDeviceCreated');
      EventBus.$off('onDeviceDeleted');
      EventBus.$off('onDeviceUpdated');
      EventBus.$off('onDevicePresented');
      EventBus.$off('onSensorCreated');
      EventBus.$off('onSensorDeleted');
      EventBus.$off('onSensorUpdated');
      EventBus.$off('onSensorPresented');
    },
  },
};
</script>

<style lang="scss">
@import '../../style/device-container.scss';
</style>
