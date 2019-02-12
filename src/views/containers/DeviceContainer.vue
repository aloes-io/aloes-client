<template lang="html">
  <b-container fluid class="device-container">
    <b-row class="about-header">
      <b-col v-if="device" sm="8">
        <device-card v-if="device" :device="device" ref="deviceCard" />
        <device-editor
          ref="deviceEditor"
          :is-viewer="false"
          :edit-mode="true"
        />
        <br />
        <device-sensors
          v-if="sensors"
          v-show="sensors.length > 0"
          :user-id="userId"
          :sensors="sensors"
          :device-type="device.type"
          :device-id="device.id"
        />
        <!--  <device-tree
          v-if="device && device.sensors"
          :device="JSON.stringify(device)"
          :client-url="$store.state.clientUrl"
          :height="300"
          :width="450"
          @node-selected="onNodeSelected"
          @node-deselected="onNodeDeselected"
          @node-clicked="onNodeClicked"
        /> -->
      </b-col>
      <b-col sm="4">
        <devices-list
          v-if="devices"
          :token="token"
          :user-id="userId"
          :devices="devices"
        />
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
        <b-alert
          v-if="success"
          :show="successMessageExists"
          dismissible
          variant="success"
        >
          {{ success.message }}
        </b-alert>
      </b-col>
    </b-row>
  </b-container>
</template>

<script type="text/javascript">
import has from "lodash.has";
import bAlert from "bootstrap-vue/es/components/alert/alert";
import DeviceSensors from "@/components/Device/DeviceSensors.vue";
import { EventBus } from "@/services/PubSub";
import logger from "@/services/logger";

export default {
  name: "DeviceContainer",

  components: {
    "b-alert": bAlert,
    "device-card": () => import("@/components/Device/DeviceCard.vue"),
    "device-editor": () => import("@/components/Device/DeviceEditor.vue"),
    "devices-list": () => import("@/components/Device/DevicesList.vue"),
    //  "device-tree": () => import("@/components/Device/DeviceTree.vue"),
    "device-sensors": DeviceSensors
  },

  props: {
    token: {
      type: String,
      default: ""
    },
    "user-id": {
      type: [String, Number],
      required: true
    },
    "is-viewer": {
      type: Boolean,
      required: false
    },
    "edit-mode": {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      deviceTreeLoaded: true,
      viewer: false,
      editorMode: true,
      loading: false
    };
  },

  computed: {
    success: {
      get() {
        return this.$store.state.device.success;
      },
      set(value) {
        this.$store.commit("device/setStateKV", {
          key: "success",
          value
        });
      }
    },
    error: {
      get() {
        return this.$store.state.device.error;
      },
      set(value) {
        this.$store.commit("device/setStateKV", {
          key: "error",
          value
        });
      }
    },
    dismissCountDown: {
      get() {
        return this.$store.state.device.dismissCountDown;
      },
      set(value) {
        this.$store.commit("device/setStateKV", {
          key: "dismissCountDown",
          value
        });
      }
    },
    devices: {
      get() {
        return this.$store.state.device.collection;
      },
      set(value) {
        this.$store.commit("device/setCollection", value);
      }
    },
    device: {
      get() {
        return this.$store.state.device.instance;
      },
      set(value) {
        this.$store.commit("device/setModel", value);
      }
    },
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
    devicesCacheExists() {
      return this.$store.cache.has(
        "device/findDevicesByAccount",
        this.$store.state.auth.account.id
      );
    },
    errorMessageExists() {
      return has(this.error, "message");
      //  return _.;
    },

    successMessageExists() {
      return has(this.sucess, "message");
    }
  },

  watch: {
    isViewer: {
      handler(state) {
        this.viewer = state;
      },
      immediate: true
    },
    editorMode: {
      handler(state) {
        this.editMode = state;
      },
      immediate: true
    }
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
        logger.publish(4, "device", "onNodeSelected:req", node.data.id);
      }
    },

    onNodeDeselected(node) {
      if (node && node.id) {
        logger.publish(4, "device", "onNodeDeselected:req", node.data.id);
      }
    },

    onNodeClicked(node) {
      logger.publish(4, "device", "onNodeClicked:req", node.data);
      // if (node.data && node.data.resources) {
      // } else if (node.data && node.data.qrCode) {
      // }
    },

    async loadDevices() {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        this.loading = true;
        logger.publish(4, "device", "loadDevices:req", this.devicesCacheExists);
        const devices = await this.$store.cache.dispatch(
          "device/findDevicesByAccount",
          this.$store.state.auth.account.id
        );
        if (!devices) {
          this.loading = false;
          this.error = { message: "error while looking for devices" };
          return this.error;
        } else if (devices.length < 1) {
          this.loading = false;
          this.error = { message: "you have no device registered" };
          return this.error;
        }
        logger.publish(4, "device", "loadDevices:res", this.devicesCacheExists);
        this.loading = false;
        this.success = { message: "found devices" };
        return devices;
      } catch (error) {
        this.loading = false;
        return error;
      }
    },

    setListeners() {
      EventBus.$on("onDeviceDeleted", device => {
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

      EventBus.$on("onDeviceCreated", device => {
        if (device && !this.loading) {
          return setTimeout(this.loadDevices, 200);
        }
        // this.device = JSON.parse(device);
        // const updatedDevices = JSON.parse(JSON.stringify(this.devices));
        // updatedDevices.push(JSON.parse(device));
        // this.devices = updatedDevices;
      });

      EventBus.$on("onDeviceUpdated", device => {
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
      EventBus.$off("onDeviceCreated");
      EventBus.$off("onDeviceDeleted");
      EventBus.$off("onDeviceUpdated");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/device-container.scss";
</style>
