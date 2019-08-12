<template lang="html">
  <div class="device-sensors-view">
    <div class="sensors-list">
      <transition name="fade">
        <b-row v-if="webComponentsLoaded && sensors" class="sensor-snaps-container">
          <b-col
            v-for="sensor in sensors"
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
              :width="180"
              :height="200"
              @update-sensor="onUpdateSensor"
              @update-setting="onUpdateSetting"
              @delete-sensor="onDeleteSensor"
            />
          </b-col>
        </b-row>
      </transition>
    </div>
    <b-modal ref="confirmPopup" hide-backdrop size="sm" @ok="onYes" @cancel="onNo">
      {{ confirm.message }}
    </b-modal>
  </div>
</template>

<script>
import { updateAloesSensors } from 'aloes-handlers';
//  import { BCard } from 'bootstrap-vue';
import { BModal } from 'bootstrap-vue';
import logger from '@/services/logger';

export default {
  name: 'SensorsList',

  components: {
    //  'b-card': BCard,
    'b-modal': BModal,
    'sensor-snap': () => import('sensor-snap'),
  },

  props: {
    'user-id': {
      type: [String, Number],
      required: true,
    },
    'device-id': {
      type: String,
      required: true,
      default: '',
    },
    sensors: {
      type: Array,
      required: false,
      default: null,
    },
  },

  data() {
    return {
      updatedSensors: [],
      webComponentsLoaded: false,
      CustomElement: null,
      updatedDeviceId: null,
      confirm: {
        message: `Are you sure you want to delete this sensor ?`,
      },
    };
  },

  computed: {
    sensorsCacheExists() {
      return this.$store.cache.has('sensor/findByDevice', this.updatedDeviceId);
    },
  },

  watch: {
    className: {
      handler(name) {
        this.updatedClassName = name;
      },
      immediate: true,
    },
    deviceId: {
      handler(id) {
        if (id && id !== null) {
          this.updatedDeviceId = id;
          this.loadSensors(id);
        }
      },
      immediate: true,
    },
    // sensors: {
    //   handler(value) {
    //     if (value && value !== null) {

    //     }
    //   },
    //   immediate: true,
    // },
  },

  created() {},

  async mounted() {
    //  if (!this.sensors || this.sensors === null) {
    //  await this.loadSensors(this.$props.deviceId);
    //  }
    this.webComponentsLoaded = true;
  },

  beforeDestroy() {},

  methods: {
    async loadSensors(deviceId) {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        //  logger.publish(4, 'device', 'loadSensors:req', this.sensorsCacheExists);
        const sensors = await this.$store.dispatch('sensor/findByDevice', deviceId);
        //  logger.publish(4, 'device', 'loadSensors:res', sensors);
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
      sensor.resources[args[1].toString()] = args[2];
      sensor.resource = args[1];
      sensor.value = args[2];
      sensor.lastSignal = new Date();
      //  console.log('onUpdateSetting', sensor);
      //  const updatedSensor = await this.$store.dispatch('sensor/updateInstance', { sensor });
      await this.$store.dispatch('sensor/publish', {
        sensor,
        userId: this.$props.userId,
      });
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
  },
};
</script>

<style lang="scss">
@import '../../style/device-sensors.scss';
</style>
