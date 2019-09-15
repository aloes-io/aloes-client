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
          :full-devices="fullDevices"
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
import { BTab } from 'bootstrap-vue';
import { BTabs } from 'bootstrap-vue';
import has from 'lodash.has';
import { EventBus } from '@/services/PubSub';
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
      fullDevices: null,
      deviceTreeLoaded: true,
      viewer: false,
      editorMode: true,
      loading: false,
      tabsIndex: 0,
      sensor: null,
      zoomSlider: 0,
      nodesRadius: 20,
      linksLength: 1.7,
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
    deviceTree() {
      if (this.$refs.deviceTreeTab && this.$refs.deviceTreeTab.deviceTree !== null) {
        return this.$refs.deviceTreeTab.deviceTree;
      }
      return null;
    },
    devicesCacheExists() {
      return this.$store.cache.has('device/findByAccount', this.$store.state.auth.account.id);
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
    await this.loadDevices();
    await this.setListeners();
  },

  updated() {
    this.removeListeners();
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

    deviceSensors(deviceId) {
      return this.sensors.filter(sensor => {
        if (deviceId && sensor.deviceId.toString() === deviceId) {
          return true;
        }
        return false;
      });
    },

    async loadDevices() {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        this.loading = true;
        logger.publish(4, 'device', 'loadDevices:req', this.devicesCacheExists);
        const devices = await this.$store.cache.dispatch(
          'device/findByAccount',
          this.$store.state.auth.account.id,
        );
        if (!devices) {
          this.loading = false;
          this.error = { message: 'error while looking for devices' };
          return this.error;
        } else if (devices.length < 1) {
          this.loading = false;
          this.error = { message: 'you have no device registered' };
          return this.error;
        }

        let sensors = [];
        devices.forEach(device => {
          if (device.sensors && device.sensors.length > 0) {
            device.sensors.forEach(sensor => {
              sensors.push(sensor);
              return;
            });
          }
          return;
        });
        this.sensors = sensors;
        // device + sensors
        this.fullDevices = devices;
        logger.publish(4, 'device', 'loadDevices:res', this.devicesCacheExists);
        this.loading = false;
        this.success = { message: 'found devices' };
        return devices;
      } catch (error) {
        // this.error = error;
        this.loading = false;
        return error;
      }
    },

    async loadSensorsByDevice(deviceId) {
      try {
        this.error = null;
        this.success = null;
        this.loading = true;
        this.dismissCountDown = this.dismissSecs;
        if (!deviceId || deviceId === null) {
          this.loading = false;
          return null;
        }
        //  logger.publish(4, 'device', 'loadSensorsByDevice:req', this.sensorsCacheExists);
        const sensors = await this.$store.dispatch('sensor/findByDevice', deviceId);
        //  logger.publish(4, 'device', 'loadSensorsByDevice:res', sensors);
        if (!sensors || sensors === null) {
          this.loading = false;
          return null;
        }
        this.loading = false;
        return sensors;
      } catch (error) {
        // this.error = error;
        this.loading = false;
        return error;
      }
    },

    updateCollection(collection, operation, instance) {
      logger.publish(4, 'device', 'updateCollection:req', { collection, operation });
      const compareIds = source => {
        if (source && source.id) {
          return source.id.toString() === instance.id.toString();
        }
        return false;
      };

      if (collection === 'devices' || collection === 'sensors') {
        let updatedCollection;
        let index;
        switch (operation) {
          case 'create':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            index = updatedCollection.findIndex(compareIds);
            if (index === -1) {
              updatedCollection.push(instance);
              this[collection] = updatedCollection;
            }
            break;
          case 'update':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            index = updatedCollection.findIndex(compareIds);
            logger.publish(4, 'device', `${collection}Updated`, index);
            if (index > -1) {
              updatedCollection[index] = instance;
              this[collection] = updatedCollection;
            }
            break;
          case 'delete':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            index = updatedCollection.findIndex(compareIds);
            logger.publish(4, 'device', `${collection}Deleted`, index);
            if (index > -1) {
              updatedCollection.splice(index, 1);
              this[collection] = updatedCollection;
            }
            break;
          default:
            throw new Error('Wrong operation');
        }
      }
    },

    deleteDevice(device) {
      try {
        if (device && device.id) {
          this.updateCollection('devices', 'delete', device);
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
        return error;
      }
    },

    createDevice(device) {
      try {
        if (device && device.id) {
          this.updateCollection('devices', 'create', device);
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeCreated(device);
          }
          //  this.device = device;
          return device;
        }
        throw new Error('No device Id');
      } catch (error) {
        return error;
      }
    },

    updateDevice(device) {
      try {
        if (device && device.id) {
          this.updateCollection('devices', 'update', device);
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeUpdated(device);
          }
        }
        throw new Error('No device Id');
      } catch (error) {
        return error;
      }
    },

    deleteSensor(sensor) {
      try {
        if (sensor && sensor.id) {
          if (
            this.device &&
            this.device.id &&
            sensor.deviceId.toString() === this.device.id.toString()
          ) {
            this.updateCollection('sensors', 'delete', sensor);
          }
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeDeleted(sensor);
          }
          // if (sensor.id.toString() === this.sensor.id.toString()) {
          //   this.$store.commit('sensor/cleanModel');
          // }
        }
        throw new Error('No sensor Id');
      } catch (error) {
        return error;
      }
    },

    createSensor(sensor) {
      try {
        if (sensor && sensor.id) {
          if (sensor.isNewInstance) {
            this.updateCollection('sensors', 'create', sensor);
          } else {
            this.updateCollection('sensors', 'update', sensor);
          }
          if (this.deviceTree && this.deviceTree !== null) {
            if (sensor.isNewInstance) {
              this.deviceTree.onNodeCreated(sensor);
            } else {
              this.deviceTree.onNodeUpdated(sensor);
            }
          }
        }
        throw new Error('No sensor Id');
      } catch (error) {
        return error;
      }
    },

    updateSensor(sensor) {
      try {
        if (sensor && sensor.id) {
          this.updateCollection('sensors', 'update', sensor);
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeUpdated(sensor);
          }
        }
        throw new Error('No sensor Id');
      } catch (error) {
        return error;
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
      //  this.$store.dispatch("device/unsubscribeFromDevicesUpdate", {userId: this.$props.userId});
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
