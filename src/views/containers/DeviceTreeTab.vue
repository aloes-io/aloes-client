<template lang="html">
  <b-row
    v-if="fullDevices && fullDevices !== null && tabsIndex === 2"
    v-show="fullDevices.length > 0"
    align-v="center"
    align-h="center"
  >
    <b-col cols="12" sm="12" md="6" lg="7" xl="8" order-md="12" order-lg="12" order-xl="12">
      <device-tree
        ref="deviceTree"
        :height="500"
        :width="600"
        :devices="fullDevices"
        :zoom-slider="zoomSlider"
        :nodes-radius="nodesRadius"
        :links-length="linksLength"
        @node-selected="onNodeSelected"
        @node-deselected="onNodeDeselected"
        @node-clicked="onNodeClicked"
      />
    </b-col>
    <b-col
      class="device-tree-panel"
      cols="12"
      sm="12"
      md="6"
      lg="5"
      xl="4"
      order-md="1"
      order-lg="1"
      order-xl="1"
    >
      <b-form-group
        id="zoom-group"
        label-cols="4"
        label="Zoom"
        label-for="zoom-slider"
        label-size="sm"
        breakpoint="sm"
      >
        <b-form-input
          id="zoom-slider"
          class="form-control"
          type="range"
          min="0.2"
          max="2.5"
          step="0.1"
          v-model.number="zoomSlider"
        />
      </b-form-group>
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
          :min="minNodesRadius"
          :max="maxNodesRadius"
          :step="nodesRadiusStep"
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
          :min="minLinksLength"
          :max="maxLinksLength"
          :step="linksLengthStep"
          v-model.number="linksLength"
        />
      </b-form-group>
      <b-row>
        <b-col cols="4" sm="4" lg="4" xl="4">
          Sensors :
        </b-col>
        <b-col cols="3" sm="3" lg="3" xl="2">
          <b-button class="show-sensors" @click.prevent.stop="toggleSensors(!showSensors)">
            <transition :duration="100" name="fade" mode="out-in">
              <fa-icon v-if="showSensors" key="showSensors" icon="toggle-on" size="lg" />
              <fa-icon v-else key="hideSensors" icon="toggle-off" size="lg" />
            </transition>
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="4" sm="4" lg="4" xl="4">
          Descriptions :
        </b-col>
        <b-col cols="3" sm="3" lg="3" xl="2">
          <b-button
            class="show-sensors"
            @click.prevent.stop="toggleDescriptions(!showDescriptions)"
          >
            <transition :duration="100" name="fade" mode="out-in">
              <fa-icon v-if="showDescriptions" key="showDescriptions" icon="toggle-on" size="lg" />
              <fa-icon v-else key="hideDescriptions" icon="toggle-off" size="lg" />
            </transition>
          </b-button>
        </b-col>
      </b-row>
      <br />
      <transition name="fade" mode="out-in">
        <sensor-snap
          v-if="sensor && sensor.id && showSensor"
          :ref="`sensorSnap-${sensor.id}`"
          :id="sensor.id.toString()"
          :device-id="sensor.deviceId.toString()"
          :owner-id="sensor.ownerId.toString()"
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
          key="sensorSnap"
          @update-sensor="onUpdateSensor"
          @update-setting="onUpdateSetting"
          @delete-sensor="onDeleteSensor"
        />
        <device-card
          v-else-if="device && device !== null && showDevice"
          :device="device"
          ref="deviceCard"
          key="deviceCard"
        />
      </transition>
    </b-col>

    <b-modal ref="confirmPopup" size="sm" @ok="onYes" @cancel="onNo">
      {{ confirm.message }}
    </b-modal>
  </b-row>
</template>

<script type="text/javascript">
import { updateAloesSensors } from 'aloes-handlers';
import { BButton } from 'bootstrap-vue';
import { BFormInput } from 'bootstrap-vue';
import { BFormGroup } from 'bootstrap-vue';
import { BModal } from 'bootstrap-vue';
import has from 'lodash.has';
import logger from '@/services/logger';

export default {
  name: 'DeviceTreeTab',

  components: {
    'b-button': BButton,
    'b-form-input': BFormInput,
    'b-form-group': BFormGroup,
    'b-modal': BModal,
    'device-card': () => import('@/components/Device/DeviceCard.vue'),
    'device-tree': () => import('@/components/Device/DeviceTree.vue'),
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
    'full-devices': {
      type: Array,
      required: false,
      default: null,
    },
  },

  data() {
    return {
      viewer: false,
      editorMode: true,
      loading: false,
      deviceTreeLoaded: true,
      deviceTree: null,
      showSensor: false,
      showDevice: false,
      zoomSlider: 0,
      nodesRadius: 23,
      minNodesRadius: 15,
      maxNodesRadius: 35,
      nodesRadiusStep: 1,
      linksLength: 1.2,
      linksLengthStep: 0.1,
      minLinksLength: 0.1,
      maxLinksLength: 2.5,
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
        return this.$store.state.device.instance;
      },
      set(value) {
        if (value.sensors) {
          delete value.sensors;
        }
        this.$store.commit('device/setModel', value);
      },
    },
    sensor: {
      get() {
        return this.$store.state.sensor.instance;
      },
      set(value) {
        this.$store.commit('sensor/setModel', value);
      },
    },
    showSensors: {
      get() {
        if (this.deviceTree) {
          return this.deviceTree.showSensors;
        }
        return true;
      },
      set(value) {
        if (this.deviceTree) {
          this.deviceTree.showSensors = value;
        }
      },
    },
    showDescriptions: {
      get() {
        if (this.deviceTree) {
          return this.deviceTree.showDescriptions;
        }
        return true;
      },
      set(value) {
        if (this.deviceTree) {
          this.deviceTree.showDescriptions = value;
        }
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

  mounted() {
    this.loading = false;
    this.deviceTree = this.$refs.deviceTree;
  },

  updated() {
    this.deviceTree = this.$refs.deviceTree;
  },

  beforeDestroy() {
    this.loading = false;
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
      // logger.publish(5, 'device', 'onNodeClicked:req', node.data);
      if (node.data && node.data.group === 1) {
        const device = { ...node.data };
        if (!device.id) return null;
        if (
          this.device &&
          this.device.id &&
          device.id.toString() === this.device.id.toString() &&
          this.showDevice
        ) {
          this.showDevice = false;
        } else {
          this.showSensor = false;
          if (device.children) {
            delete device.children;
          }
          this.device = device;
          this.showDevice = true;
        }
        return device;
      } else if (node.data && node.data.group === 2) {
        const sensor = { ...node.data };
        if (!sensor.id) return null;
        if (
          this.sensor &&
          this.sensor.id &&
          sensor.id.toString() === this.sensor.id.toString() &&
          this.showSensor
        ) {
          this.showSensor = false;
        } else {
          this.showDevice = false;
          this.sensor = sensor;
          this.showSensor = true;
        }
        return sensor;
      }
    },

    async onUpdateSensor(...args) {
      logger.publish(4, 'device', 'onUpdateSensor:req', args);
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      sensor = await updateAloesSensors(sensor, args[1], args[2]);
      sensor.lastSignal = new Date();
      await this.$store.dispatch('sensor/publish', {
        sensor,
        userId: this.$props.userId,
      });

      return sensor;
    },

    async onUpdateSetting(...args) {
      logger.publish(4, 'device', 'onUpdateSetting:req', args);
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      sensor[args[1].toString()] = args[2];
      sensor.resource = args[1].toString();
      sensor.value = args[2];
      sensor.lastSignal = new Date();
      // if (this.deviceTree && this.deviceTree !== null) {
      //   this.deviceTree.onNodeUpdated(sensor);
      // }
      await this.$store.dispatch('sensor/publish', {
        sensor,
        userId: this.$props.userId,
      });
      //  sensor = await this.$store.dispatch('sensor/updateInstance', { sensor });
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
      await this.$store.dispatch('sensor/deleteInstance', {
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
        this.deviceTree.initDeviceTree();
        //  this.devices.forEach(device => this.deviceTree.toggleDeviceSensors(device, state));
      }
    },

    toggleDescriptions(state) {
      if (this.deviceTree && this.deviceTree !== null) {
        this.showDescriptions = state;
        //  this.deviceTree.showDescriptions = state;
        this.deviceTree.toggleDescriptions(state);
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../style/device-container.scss';
</style>