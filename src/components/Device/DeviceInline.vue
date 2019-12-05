<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-card
    v-show="updatedDevice"
    v-if="updatedDevice !== null"
    class="device-inline-view"
    @mouseover="highlightDevice(updatedDevice, true)"
    @mouseleave="highlightDevice(updatedDevice, false)"
  >
    <b-row>
      <b-col cols="2" sm="4" md="4" lg="4" xl="3">
        <img :src="updatedDevice.icons[1]" class="device-inline-icon" @click="goToDevice" />
        <!--  <b-button
          class="device-inline-button"
          @click="goToDevice">
          Voir le device
        </b-button> -->
      </b-col>
      <b-col cols="10" sm="8" md="8" lg="8" xl="9">
        <b-row class="device-inline-row">
          <b-col class="device-props" sm="12">
            <h6 class="device-inline-name">{{ updatedDevice.name }}</h6>
            <p
              v-if="updatedDevice.fullAddress && updatedDevice.fullAddress !== null"
              class="device-inline-address"
            >
              {{ updatedDevice.fullAddress }}
            </p>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="device-inline-status" cols="12">
            <div v-if="!updatedDevice.status" class="device-inline-status-off">
              <img :src="$store.state.style.pictures.deviceOff" />
              <small>
                Disconnected
              </small>
            </div>
            <div v-else-if="updatedDevice.status" class="device-inline-status-on">
              <img :src="$store.state.style.pictures.deviceOn" />
              <small>
                Connected
              </small>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-card>
</template>

<script type="text/javascript">
import { BCard } from 'bootstrap-vue';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'DeviceInline',

  components: {
    'b-card': BCard,
  },

  props: {
    account: {
      type: Object,
      default: null,
    },
    token: {
      type: String,
      default: '',
    },
    device: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      error: null,
      success: null,
      isViewer: true,
      editMode: false,
      updatedAccount: null,
      updatedDevice: null,
      updatedClassName: null,
    };
  },

  computed: {},

  watch: {
    account: {
      handler(account) {
        this.updatedAccount = account;
      },
      immediate: true,
    },
    device: {
      handler(device) {
        if (device && device !== null) {
          this.updatedDevice = device;
          this.updateBackground(device);
        }
      },
      immediate: true,
    },
    className: {
      handler(name) {
        this.updatedClassName = name;
      },
      immediate: true,
    },
  },

  mounted() {
    this.updateBackground();
    EventBus.$on(`deviceSelected-${this.updatedDevice.id}`, (device, state) => {
      this.highlightBackground(device, state);
    });
  },

  beforeDestroy() {
    EventBus.$off(`deviceSelected-${this.updatedDevice.id}`);
  },

  methods: {
    updateBackground() {
      if (!this.$el) return null;
      if (this.updatedDevice.status) {
        this.$el.style.background = this.$store.state.style.palette.lightgreen;
      } else {
        this.$el.style.background = this.$store.state.style.palette.lightyellow;
      }
    },

    highlightBackground(device, state) {
      if (!this.$el) return null;
      if (device && device.id && device.id.toString() === this.updatedDevice.id.toString()) {
        if (state === true) {
          if (device.status) {
            this.$el.style.background = this.$store.state.style.palette.green;
          } else {
            this.$el.style.background = this.$store.state.style.palette.yellow;
          }
        } else if (state === false) {
          if (device.status) {
            this.$el.style.background = this.$store.state.style.palette.lightgreen;
          } else {
            this.$el.style.background = this.$store.state.style.palette.lightyellow;
          }
        }
      }
    },

    highlightDevice(device, state) {
      if (device && device.id) {
        EventBus.$emit(`deviceSelected-${device.id}`, device, state);
        EventBus.$emit('deviceSelected', device, state);
      }
    },

    goToDevice(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      logger.publish(4, 'device', 'goToDevice:req', this.updatedDevice.id);
      this.$store.commit('device/setModel', this.updatedDevice);
      // if (this.$route.name.toLowerCase() !== 'device') {
      //   this.$router.push({
      //     name: 'device',
      //     query: {
      //       'access-token': this.$props.token,
      //       'user-id': this.updatedAccount.id,
      //       deviceId: this.updatedDevice.id,
      //     },
      //   });
      // }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/device-inline.scss';
</style>
