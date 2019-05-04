<template lang="html">
  <b-container fluid class="device-container">
    <b-tabs content-class="mt-3" justified>
      <b-tab title="Config" active>
        <b-row class="devices-map" v-if="devices">
          <!-- switch between map and device tree views -->
          <b-col sm="12">
            <search-map :token="token" :user-id="userId" :devices="devices" />
          </b-col>
        </b-row>
        <b-row class="about-header">
          <b-col v-if="device" sm="8">
            <device-card v-if="device" :device="device" ref="deviceCard" />
            <device-editor ref="deviceEditor" :is-viewer="false" :edit-mode="true" />
            <br />
            <device-sensors
              v-if="sensors"
              v-show="sensors.length > 0"
              :user-id="userId"
              :sensors="sensors"
              :device-type="device.type"
              :device-id="device.id"
            />
          </b-col>
          <b-col sm="4">
            <devices-list v-if="devices" :token="token" :user-id="userId" :devices="devices" />
          </b-col>
        </b-row>
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
      </b-tab>
      <b-tab title="Tree">
        <b-row align-v="center" align-h="center">
          <b-col cols="12" sm="12" lg="8" xl="8" order-md="12" order-lg="12" order-xl="12">
            <device-tree
              :client-url="$store.state.clientUrl"
              :height="500"
              :width="600"
              :user-id="userId"
              @node-selected="onNodeSelected"
              @node-deselected="onNodeDeselected"
              @node-clicked="onNodeClicked"
            />
          </b-col>
          <b-col cols="12" sm="12" lg="4" xl="4" order-md="1" order-lg="1" order-xl="1">
            <sensor-snap
              v-if="sensor && sensor !== null"
              :ref="`sensorSnap-${sensor.id}`"
              :id="sensor.id.toString()"
              :device-id="sensor.deviceId"
              :dev-eui="sensor.devEui"
              :dev-addr="sensor.devAddr"
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
              :height="320"
              :width="300"
              key="sensor"
              @update-sensor="onUpdateSensor"
              @update-setting="onUpdateSetting"
              @delete-sensor="onDeleteSensor"
            />
            <device-card
              v-else-if="device && device !== null"
              :device="device"
              ref="deviceCard"
              key="device"
            />
          </b-col>
        </b-row>
        <!-- :device="JSON.stringify(device)" -->
      </b-tab>
      <b-tab title="Disabled" disabled><p>I'm a disabled tab!</p></b-tab>
    </b-tabs>
  </b-container>
</template>

<script type="text/javascript">
import { updateAloesSensors } from 'aloes-handlers';
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bTabs from 'bootstrap-vue/es/components/tabs/tabs';
import bTab from 'bootstrap-vue/es/components/tabs/tab';
import has from 'lodash.has';
import SensorSnap from 'sensor-snap';
import DeviceSensors from '@/components/Device/DeviceSensors.vue';
//  import SearchMap from '@/components/Search/SearchMap.vue';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'DeviceContainer',

  components: {
    'b-alert': bAlert,
    'b-tabs': bTabs,
    'b-tab': bTab,
    'device-card': () => import('@/components/Device/DeviceCard.vue'),
    'device-editor': () => import('@/components/Device/DeviceEditor.vue'),
    'devices-list': () => import('@/components/Device/DevicesList.vue'),
    'device-tree': () => import('@/components/Device/DeviceTree.vue'),
    'device-sensors': DeviceSensors,
    'search-map': () => import('@/components/Search/SearchMap.vue'),
    //  'sensor-snap': () => import('sensor-snap'),
    'sensor-snap': SensorSnap,
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
      deviceTreeLoaded: true,
      viewer: false,
      editorMode: true,
      loading: false,
      sensor: null,
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
        this.$store.commit('device/setCollection', value);
      },
    },
    device: {
      get() {
        // if (this.$props.deviceId)
        return this.$store.state.device.instance;
      },
      set(value) {
        this.$store.commit('device/setModel', value);
      },
    },
    sensors: {
      get() {
        return this.$store.state.device.sensors;
      },
      set(value) {
        this.$store.commit('device/setStateKV', {
          key: 'sensors',
          value,
        });
      },
    },
    devicesCacheExists() {
      return this.$store.cache.has(
        'device/findDevicesByAccount',
        this.$store.state.auth.account.id,
      );
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
    await this.loadDevices();
    await this.setListeners();
  },

  beforeDestroy() {
    this.loading = false;
    this.removeListeners();
  },

  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },

    onNodeSelected(node) {
      if (node && node.id) {
        logger.publish(4, 'device', 'onNodeSelected:req', node.data.id);
      }
    },

    onNodeDeselected(node) {
      if (node && node.id) {
        logger.publish(4, 'device', 'onNodeDeselected:req', node.data.id);
      }
    },

    onNodeClicked(node) {
      logger.publish(4, 'device', 'onNodeClicked:req', node.data);
      if (node.data && node.data.group === 1) {
        const device = { ...node.data };
        if (device.children) {
          // device.children.forEach(sensor => {
          //   delete sensor.group;
          //   delete sensor.size;
          // });
          // this.$store.commit('device/setStateKV', { key: 'sensors', value: device.children });
          delete device.children;
        }
        delete device.group;
        delete device.size;
        this.device = device;
        this.sensor = null;
        //  this.$store.commit('device/setModel', device);
      } else if (node.data && node.data.group === 2) {
        const sensor = { ...node.data };
        //  delete sensor.group;
        //  delete sensor.size;
        this.sensor = sensor;
        this.$store.commit('device/cleanModel');
      }
    },

    async onUpdateSensor(...args) {
      logger.publish(4, 'device', 'onUpdateSensor:req', args);
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      sensor = await updateAloesSensors(sensor, args[1], args[2]);
      await this.$store.dispatch('device/publishToSensor', {
        sensor,
        userId: this.$props.userId,
      });
      return sensor;
    },

    async onUpdateSetting(...args) {
      logger.publish(4, 'device', 'onUpdateSetting:req', args);
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      sensor = await updateAloesSensors(sensor, args[1], args[2]);
      sensor = await this.$store.dispatch('device/updateSensor', { sensor });
      return sensor;
    },

    onDeleteSensor(sensor) {
      logger.publish(4, 'device', 'onDeleteSensor:req', sensor);
      //  this.$store.dispatch("device/delSensor", sensor.id)
    },

    async loadDevices() {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        this.loading = true;
        logger.publish(4, 'device', 'loadDevices:req', this.devicesCacheExists);
        const devices = await this.$store.cache.dispatch(
          'device/findDevicesByAccount',
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
        logger.publish(4, 'device', 'loadDevices:res', this.devicesCacheExists);
        this.loading = false;
        this.success = { message: 'found devices' };
        return devices;
      } catch (error) {
        this.loading = false;
        return error;
      }
    },

    setListeners() {
      EventBus.$on('onDeviceDeleted', device => {
        if (device && !this.loading) {
          return setTimeout(this.loadDevices, 200);
        }
        // const updatedDevices = JSON.parse(JSON.stringify(this.devices));
        // const deviceDeleted = updatedDevices.find((s) => s.id === JSON.parse(device).id);
        // const index = updatedDevices.indexOf(deviceDeleted);
        // console.log("onDeviceDeleted", index);
        // if (index !== -1) {
        //   updatedDevices.splice(index, 1);
        //   console.log("onDeviceDeleted", updatedDevices);
        //   this.devices = updatedDevices;
        // }
        // this.$store.commit("device/cleanModel");
      });

      EventBus.$on('onDeviceCreated', device => {
        if (device && !this.loading) {
          return setTimeout(this.loadDevices, 200);
        }
        // this.device = JSON.parse(device);
        // const updatedDevices = JSON.parse(JSON.stringify(this.devices));
        // updatedDevices.push(JSON.parse(device));
        // this.devices = updatedDevices;
      });

      EventBus.$on('onDeviceUpdated', device => {
        if (device && !this.loading) {
          return setTimeout(this.loadDevices, 200);
        }
        // const updatedDevices = JSON.parse(JSON.stringify(this.devices));
        // const updatedDevice = updatedDevices.find((s) => s.id === JSON.parse(device).id);
        // const index = updatedDevices.indexOf(updatedDevice);
        // if (index !== -1) {
        //   updatedDevices[index] = JSON.parse(device);
        //   this.devices = updatedDevices;
        // }
      });

      //  await this.$store.dispatch("device/subscribeToDevicesUpdate", {userId: this.$props.userId});
    },

    removeListeners() {
      //  this.$store.dispatch("device/unsubscribeFromDevicesUpdate", {userId: this.$props.userId});
      EventBus.$off('onDeviceCreated');
      EventBus.$off('onDeviceDeleted');
      EventBus.$off('onDeviceUpdated');
    },
  },
};
</script>

<style lang="scss">
@import '../../style/device-container.scss';
</style>
