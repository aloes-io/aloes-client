<template lang="html">
  <b-container fluid class="device-container">
    <b-tabs content-class="mt-3" justified @input="checkTabs">
      <b-tab title="Devices" active>
        <b-row v-if="devices && tabsIndex === 0" class="devices-map">
          <!-- switch between map and device tree views -->
          <b-col sm="12">
            <search-map :token="token" :user-id="userId" :devices="devices" />
          </b-col>
        </b-row>
        <b-row v-if="tabsIndex === 0" class="about-header">
          <b-col v-if="device" sm="8">
            <device-card v-if="device" :device="device" ref="deviceCard" />
            <device-editor ref="deviceEditor" :is-viewer="false" :edit-mode="true" />
            <br />
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
      <b-tab title="Sensors">
        <b-row v-if="tabsIndex === 1" class="about-header">
          <b-col v-if="device" sm="8">
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
      </b-tab>
      <b-tab title="Tree">
        <b-row
          v-if="fullDevices && tabsIndex === 2"
          v-show="fullDevices !== null"
          align-v="center"
          align-h="center"
        >
          <b-col cols="12" sm="12" md="6" lg="7" xl="8" order-md="12" order-lg="12" order-xl="12">
            <device-tree
              ref="deviceTree"
              :client-url="$store.state.clientUrl"
              :height="500"
              :width="600"
              :devices="fullDevices"
              :nodes-radius="nodesRadius"
              :links-length="linksLength"
              @node-selected="onNodeSelected"
              @node-deselected="onNodeDeselected"
              @node-clicked="onNodeClicked"
            />
          </b-col>
          <b-col cols="12" sm="12" md="6" lg="5" xl="4" order-md="1" order-lg="1" order-xl="1">
            <b-form-group
              id="nodes-radius-group"
              label-cols="4"
              label="Nodes radius :"
              label-for="nodes-radius"
              label-size="sm"
              breakpoint="sm"
            >
              <b-form-input
                id="nodes-radius"
                type="range"
                min="6"
                max="20"
                v-model.number="nodesRadius"
              />
            </b-form-group>
            <b-form-group
              id="links-length-group"
              label-cols="4"
              label="Links length :"
              label-for="links-length"
              label-size="sm"
              breakpoint="sm"
            >
              <b-form-input
                id="links-length"
                class="form-control"
                type="range"
                min="0.2"
                max="1.5"
                step="0.1"
                v-model.number="linksLength"
              />
            </b-form-group>
            <b-row>
              <b-col cols="5" sm="5" lg="4" xl="3">
                Sensors
              </b-col>
              <b-col cols="3" sm="3" lg="3" xl="2">
                <b-button class="show-sensors" @click.prevent.stop="toggleSensors(!showSensors)">
                  <fa-icon v-if="showSensors" icon="toggle-on" size="lg" />
                  <fa-icon v-else icon="toggle-off" size="lg" />
                </b-button>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="5" sm="5" lg="4" xl="3">
                Descriptions
              </b-col>
              <b-col cols="3" sm="3" lg="3" xl="2">
                <b-button
                  class="show-sensors"
                  @click.prevent.stop="toggleDescriptions(!showDescriptions)"
                >
                  <fa-icon v-if="showDescriptions" icon="toggle-on" size="lg" />
                  <fa-icon v-else icon="toggle-off" size="lg" />
                </b-button>
              </b-col>
            </b-row>
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
    <b-modal ref="confirmPopup" size="sm" @ok="onYes" @cancel="onNo">
      {{ confirm.message }}
    </b-modal>
  </b-container>
</template>

<script type="text/javascript">
import { updateAloesSensors } from 'aloes-handlers';
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bModal from 'bootstrap-vue/es/components/modal/modal';
import bTabs from 'bootstrap-vue/es/components/tabs/tabs';
import bTab from 'bootstrap-vue/es/components/tabs/tab';
import has from 'lodash.has';
import DeviceSensors from '@/components/Device/DeviceSensors.vue';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'DeviceContainer',

  components: {
    'b-alert': bAlert,
    'b-button': bButton,
    'b-form-input': bFormInput,
    'b-form-group': bFormGroup,
    'b-modal': bModal,
    'b-tabs': bTabs,
    'b-tab': bTab,
    'device-card': () => import('@/components/Device/DeviceCard.vue'),
    'device-editor': () => import('@/components/Device/DeviceEditor.vue'),
    'devices-list': () => import('@/components/Device/DevicesList.vue'),
    'device-tree': () => import('@/components/Device/DeviceTree.vue'),
    'device-sensors': DeviceSensors,
    'search-map': () => import('@/components/Search/SearchMap.vue'),
    'sensor-snap': () => import('sensor-snap'),
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
      deviceTree: null,
      viewer: false,
      editorMode: true,
      loading: false,
      tabsIndex: 0,
      sensor: null,
      nodesRadius: 17,
      linksLength: 1,
      showSensors: true,
      showDescriptions: false,
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
    this.deviceTree = this.$refs.deviceTree;
  },

  updated() {
    this.deviceTree = this.$refs.deviceTree;
  },

  beforeDestroy() {
    this.loading = false;
    this.removeListeners();
  },

  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
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
        this.fullDevices = devices;
        logger.publish(4, 'device', 'loadDevices:res', this.devicesCacheExists);
        this.loading = false;
        this.success = { message: 'found devices' };
        return devices;
      } catch (error) {
        this.loading = false;
        return error;
      }
    },

    async loadSensorsByDevice(deviceId) {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        //  logger.publish(4, 'device', 'loadSensorsByDevice:req', this.sensorsCacheExists);
        const sensors = await this.$store.dispatch('device/findSensorsByDevice', deviceId);
        //  logger.publish(4, 'device', 'loadSensorsByDevice:res', sensors);
        if (!sensors || sensors === null) {
          this.loading = false;
          return null;
        }
        this.loading = false;
        return sensors;
      } catch (error) {
        this.loading = false;
        return error;
      }
    },

    checkTabs(tabsIndex) {
      this.tabsIndex = tabsIndex;
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
      // logger.publish(5, 'device', 'onNodeClicked:req', node.data);
      if (node.data && node.data.group === 1) {
        const device = { ...node.data };
        let state = true;
        if (device.show) state = false;
        this.deviceTree.toggleDeviceSensors(node.data, state);

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
        delete device.show;
        this.device = device;
        this.sensor = null;
        //  this.$store.commit('device/setModel', device);
      } else if (node.data && node.data.group === 2) {
        const sensor = { ...node.data };
        delete sensor.group;
        delete sensor.size;
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
      // if (this.deviceTree && this.deviceTree !== null) {
      //   this.deviceTree.onNodeUpdated(sensor);
      // }
      sensor = await this.$store.dispatch('device/updateSensor', { sensor });
      return sensor;
    },

    onDeleteSensor(sensor) {
      logger.publish(4, 'device', 'onDeleteSensor:req', sensor);
      if (sensor && sensor.id) {
        this.sensor = sensor;
        this.$refs.confirmPopup.show();
      }
    },

    async onYes() {
      await this.$store.dispatch('device/delSensor', {
        deviceId: this.sensor.deviceId,
        sensor: this.sensor,
      });
      return this.$refs.confirmPopup.hide();
    },

    onNo() {
      this.$refs.confirmPopup.hide();
    },

    toggleSensors(state) {
      if (this.deviceTree && this.deviceTree !== null) {
        this.showSensors = state;
        this.devices.forEach(device => this.deviceTree.toggleDeviceSensors(device, state));
      }
    },

    toggleDescriptions(state) {
      if (this.deviceTree && this.deviceTree !== null) {
        this.showDescriptions = state;
        this.deviceTree.toggleDescriptions(state);
      }
    },

    updateCollection(collection, operation, instance) {
      logger.publish(4, 'device', 'updateCollection:req', { collection, operation });

      if (collection === 'devices' || collection === 'sensors') {
        let updatedCollection;
        let index;
        switch (operation) {
          case 'create':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            updatedCollection.push(instance);
            this[collection] = updatedCollection;
            break;
          case 'update':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            index = updatedCollection.findIndex(s => s.id === instance.id);
            logger.publish(4, 'device', `${collection}Updated`, index);
            if (index !== -1) {
              updatedCollection[index] = instance;
              this[collection] = updatedCollection;
            }
            break;
          case 'delete':
            updatedCollection = JSON.parse(JSON.stringify(this[collection]));
            index = updatedCollection.findIndex(s => s.id === instance.id);
            logger.publish(4, 'device', `${collection}Deleted`, index);
            if (index !== -1) {
              updatedCollection.splice(index, 1);
              this[collection] = updatedCollection;
            }
            break;
          default:
            throw new Error('Wrong operation');
        }
      }
    },

    setListeners() {
      EventBus.$on('onDeviceDeleted', device => {
        if (device && device.id) {
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeDeleted(device);
          }
          this.updateCollection('devices', 'delete', device);
          if (device.id === this.device.id) {
            this.$store.commit('device/cleanModel');
          }
          // if (!this.loading) {
          //   return setTimeout(this.loadDevices, 200);
          // }
        }
      });

      EventBus.$on('onDeviceCreated', device => {
        if (device && device.id) {
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeCreated(device);
          }
          this.updateCollection('devices', 'create', device);
        }
        this.device = device;
      });

      EventBus.$on('onDeviceUpdated', device => {
        if (device && device.id) {
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeUpdated(device);
          }
          this.updateCollection('devices', 'update', device);
        }
      });

      EventBus.$on('onSensorDeleted', sensor => {
        if (sensor && sensor.id) {
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeDeleted(sensor);
          }
          if (sensor.deviceId === this.device.id) {
            this.updateCollection('sensors', 'delete', sensor);
          }
        }
      });

      EventBus.$on('onSensorCreated', sensor => {
        if (sensor && sensor.id) {
          if (this.deviceTree && this.deviceTree !== null) {
            if (sensor.isNewInstance) {
              this.deviceTree.onNodeCreated(sensor);
            } else {
              this.deviceTree.onNodeUpdated(sensor);
            }
          }
          if (sensor.deviceId === this.device.id) {
            if (sensor.isNewInstance) {
              this.updateCollection('sensors', 'create', sensor);
            } else {
              this.updateCollection('sensors', 'update', sensor);
            }
          }
        }
      });

      EventBus.$on('onSensorUpdated', sensor => {
        if (sensor && sensor.id) {
          if (this.deviceTree && this.deviceTree !== null) {
            this.deviceTree.onNodeUpdated(sensor);
          }
          if (sensor.deviceId === this.device.id) {
            this.updateCollection('sensors', 'update', sensor);
          }
          // if (!this.loading) {
          //   const cacheExists = await this.$store.cache.has(
          //     'device/findSensorsByDevice',
          //     sensor.deviceId,
          //   );
          //   if (cacheExists) {
          //     await this.$store.cache.delete('device/findSensorsByDevice', sensor.deviceId);
          //   }
          //   // if (this.$props.deviceId === sensor.deviceId.toString()) {
          //   //   await this.loadSensorsByDevice(sensor.deviceId);
          //   // }
          // }
        }
      });
    },

    removeListeners() {
      //  this.$store.dispatch("device/unsubscribeFromDevicesUpdate", {userId: this.$props.userId});
      EventBus.$off('onDeviceCreated');
      EventBus.$off('onDeviceDeleted');
      EventBus.$off('onDeviceUpdated');
      EventBus.$off('onSensorCreated');
      EventBus.$off('onSensorDeleted');
      EventBus.$off('onSensorUpdated');
    },
  },
};
</script>

<style lang="scss">
@import '../../style/device-container.scss';
</style>
