<template lang="html">
  <b-card
    v-show="updatedDevice"
    v-if="updatedDevice !== null"
    class="device-inline-view"
    @mouseover="highlightDevice(updatedDevice)"
    @mouseleave="highlightDevice(null)"
  >
    <b-row>
      <b-col cols="2" sm="4" md="4" lg="4" xl="3">
        <img :src="updatedDevice.icons[0]" class="device-inline-icon" @click="goToDevice" />
        <!--  <b-button
          class="device-inline-button"
          @click="goToDevice">
          Voir le device
        </b-button> -->
      </b-col>
      <b-col cols="10" sm="8" md="8" lg="8" xl="9">
        <b-row class="device-inline-row">
          <b-col class="device-props" sm="12">
            <h6 class="device-inline-name">{{ updatedDevice.name }} - {{ updatedDevice.type }}</h6>
            <p v-if="updatedDevice.fullAddress" class="device-inline-address">
              {{ updatedDevice.fullAddress }}
            </p>
            <p class="device-inline-description">
              {{ updatedDevice.description }}
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
import bCard from 'bootstrap-vue/es/components/card/card';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'DeviceInline',

  components: {
    'b-card': bCard,
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
        this.updatedDevice = device;
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
    EventBus.$on('deviceSelected', device => {
      if (device && device !== null && device.id.toString() === this.updatedDevice.id.toString()) {
        this.$el.style.background = this.$store.state.style.color.secondary;
      } else {
        this.$el.style.background = 'white';
      }
      return null;
    });
  },

  beforeDestroy() {
    EventBus.$off('deviceSelected');
  },

  methods: {
    highlightDevice(device) {
      EventBus.$emit('deviceSelected', device);
    },

    async loadSensors() {
      this.error = null;
      this.success = null;
      this.dismissCountDown = this.dismissSecs;
      return this.$store.cache.dispatch(
        //  return this.$store.dispatch(
        'device/findSensorsByDevice',
        this.updatedDevice.id,
      );
    },

    async goToDevice(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      logger.publish(4, 'device', 'goToDevice:req', this.updatedDevice.id);
      await this.$store.commit('device/setModel', this.updatedDevice);
      return this.loadSensors();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/device-inline.scss';
</style>
