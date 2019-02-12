<template lang="html">
  <b-card class="device-sensors-view">
    <transition name="fade">
      <b-row v-if="webComponentsLoaded && sensors">
        <b-col
          v-for="sensor in sensors"
          :key="sensor.id"
          cols="6"
          sm="6"
          md="4"
          lg="4"
          xl="4"
        >
          <sensor-snap
            :ref="`sensorSnap${sensor.id}`"
            :id="sensor.id.toString()"
            :device-id="sensor.deviceId.toString()"
            :dev-eui="sensor.devEui"
            :name="sensor.name"
            :type="sensor.type"
            :value="JSON.stringify(sensor.value)"
            :frame-counter="sensor.frameCounter"
            :resources="JSON.stringify(sensor.resources)"
            :resource="sensor.resource"
            :icons="sensor.icons.toString()"
            :colors="sensor.colors.toString()"
            :protocol-name="sensor.protocolName"
            :protocol-version="sensor.protocolVersion"
            :input-path="sensor.inputPath || null"
            :output-path="sensor.outputPath || null"
            :in-prefix="sensor.inPrefix"
            :out-prefix="sensor.outPrefix"
            :native-type="sensor.nativeType"
            :native-resource="sensor.nativeResource"
            :native-sensor-id="sensor.nativeSensorId"
            :native-node-id="sensor.nativeNodeId || null"
            :width="150"
            :height="160"
            class="sensor-snap"
            @update-sensor="onUpdateSensor"
            @delete-sensor="onDeleteSensor"
          />
        </b-col>
      </b-row>
    </transition>
    <b-modal ref="confirmPopup" size="sm" @ok="onYes" @cancel="onNo">
      {{ confirm.message }}
    </b-modal>
  </b-card>
</template>

<script>
import { updateAloesSensors } from "aloes-handlers";
import { SensorSnap } from "sensor-snap";
import bCard from "bootstrap-vue/es/components/card/card";
import bModal from "bootstrap-vue/es/components/modal/modal";
import { EventBus } from "@/services/PubSub";
import logger from "@/services/logger";

export default {
  name: "DeviceSensors",

  components: {
    "b-card": bCard,
    "b-modal": bModal,
    "sensor-snap": SensorSnap
  },

  props: {
    "user-id": {
      type: [String, Number],
      required: true
    },
    "device-id": {
      type: String,
      required: false,
      default: null
    }
  },

  data() {
    return {
      updatedSensors: [],
      webComponentsLoaded: false,
      CustomElement: null,
      updatedDeviceId: null,
      confirm: {
        message: `Are you sure you want to delete this sensor ?`
      }
    };
  },

  computed: {
    sensors: {
      get() {
        return this.$store.state.device.sensors;
      },
      set(value) {
        this.$store.commit("device/setStateKV", {
          key: "sensors",
          value
        });
      }
    },
    sensorsCacheExists() {
      return this.$store.cache.has(
        "device/findSensorsByDevice",
        this.updatedDeviceId
      );
    }
  },

  watch: {
    className: {
      handler(name) {
        this.updatedClassName = name;
      },
      immediate: true
    },
    deviceId: {
      handler(id) {
        if (id && id !== null) {
          this.updatedDeviceId = id;
          this.loadSensors(id);
        }
      },
      immediate: true
    }
  },

  created() {},

  async mounted() {
    if (!this.sensors || this.sensors === null) {
      await this.loadSensors(this.$props.deviceId);
    }
    await this.setListeners();
    this.webComponentsLoaded = true;
  },

  beforeDestroy() {
    this.removeListeners();
  },

  methods: {
    async loadSensors(deviceId) {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        logger.publish(4, "device", "loadSensors:req", this.sensorsCacheExists);
        const sensors = await this.$store.cache.dispatch(
          "device/findSensorsByDevice",
          deviceId,
          {
            timeout: 200
          }
        );
        logger.publish(4, "device", "loadSensors:res", this.sensorsCacheExists);
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

    setListeners() {
      EventBus.$on("onSensorDeleted", sensor => {
        if (sensor && !this.loading) {
          this.loadSensors(sensor.deviceId);
        }
      });

      EventBus.$on("onSensorCreated", async sensor => {
        if (sensor && !this.loading) {
          await this.$store.cache.delete(
            "device/findSensorsByDevice",
            sensor.deviceId
          );
          await this.loadSensors(sensor.deviceId);
        }
      });

      EventBus.$on("onSensorUpdated", async sensor => {
        if (sensor && !this.loading) {
          const cacheExists = await this.$store.cache.has(
            "device/findSensorsByDevice",
            sensor.deviceId
          );
          if (cacheExists) {
            await this.$store.cache.delete(
              "device/findSensorsByDevice",
              sensor.deviceId
            );
          }
          await this.loadSensors(sensor.deviceId);
        }
      });

      // await this.$store.dispatch("device/subscribeToSensorsUpdate", {
      //   userId: this.$props.userId,
      // });
    },

    removeListeners() {
      EventBus.$off("onSensorCreated");
      EventBus.$off("onSensorDeleted");
      EventBus.$off("onSensorUpdated");
      // if (this.sensors) {
      //   this.$store.dispatch("device/unsubscribeFromSensorsUpdate", {userId: this.$props.userId});
      // }
    },

    async onUpdateSensor(...args) {
      logger.publish(4, "device", "onUpdateSensor:req", args);
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      sensor = await updateAloesSensors(sensor, args[1], args[2]);
      await this.$store.dispatch("device/publishToSensor", {
        sensor,
        userId: this.$props.userId
      });
      return sensor;
    },

    onDeleteSensor(sensor) {
      logger.publish(4, "device", "onDeleteSensor:req", sensor);
      if (sensor && sensor.id) {
        this.sensor = sensor;
        this.$refs.confirmPopup.show();
      }
    },

    async onYes() {
      await this.$store.dispatch("device/delSensor", {
        deviceId: this.sensor.deviceId,
        sensor: this.sensor
      });
      return this.$refs.confirmPopup.hide();
    },

    onNo() {
      this.$refs.confirmPopup.hide();
    }
  }
};
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

aloes-sensor-snap > .loading {
  display: block;
  min-height: 50px;
}
</style>
