<template lang="html">
  <div class="devices-list-view">
    <device-inline
      v-for="device in devices"
      :key="device.id"
      :account="$store.state.auth.account"
      :token="token"
      :device="device"
    />
    <b-button class="add-device" @click="newDevice">
      <i class="fa fa-plus" />
    </b-button>
  </div>
</template>

<script type="text/javascript">
import bButton from "bootstrap-vue/es/components/button/button";
import DeviceInline from "@/components/Device/DeviceInline.vue";

export default {
  name: "DevicesList",

  components: {
    "b-button": bButton,
    "device-inline": DeviceInline
  },

  props: {
    token: {
      type: String,
      required: true,
      default: ""
    },
    "user-id": {
      type: [String, Number],
      required: true,
      default: null
    },
    devices: {
      type: Array,
      required: true,
      default: null
    }
  },

  data() {
    return {
      updatedSearchResults: null
    };
  },

  computed: {
    // device: {
    //   get() {
    //     return this.$store.state.device.instance;
    //   },
    //   set(value) {
    //     this.$store.commit("device/setModel", value);
    //   },
    // },
  },

  mounted() {},

  methods: {
    newDevice(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.$store.commit("device/cleanModel");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/devices-list.scss";
</style>
