<template lang="html">
  <div class="devices-list-view">
    <div
      v-if="filteredDevices"
      class="devices-list"
      v-observer:[optionsObserver]="itemId"
      @intersected="onIntersected"
    >
      <b-form-select v-model="devicesFilter" class="mb-3">
        <option :value="null">Select a filter</option>
        <optgroup label="Type">
          <option
            v-for="(elem, index) in deviceTypes"
            :key="index"
            :value="{ key: 'type', value: elem.value }"
          >
            {{ elem.text }}
          </option>
        </optgroup>
        <optgroup label="Transport">
          <option
            v-for="(elem, index) in transportProtocolNames"
            :key="index"
            :value="{ key: 'transportProtocol', value: elem.value }"
          >
            {{ elem.text }}
          </option>
        </optgroup>
      </b-form-select>
      <device-inline
        v-for="(device, index) in filteredDevices"
        :key="device.id"
        :id="`device-inline-${index}`"
        :ref="`deviceInline-${device.id}`"
        :account="$store.state.auth.account"
        :token="token"
        :device="device"
      />
    </div>
    <b-button class="add-device" @click="newDevice">
      <fa-icon icon="plus" size="lg" />
    </b-button>
  </div>
</template>

<script type="text/javascript">
import { BButton, BFormSelect } from 'bootstrap-vue';
import logger from '@/services/logger';
import Collection from '@/views/mixins/collection';
import Observer from '@/directives/observer';

export default {
  name: 'DevicesList',

  components: {
    'b-button': BButton,
    'b-form-select': BFormSelect,
    'device-inline': () => import('@/components/Device/DeviceInline.vue'),
  },

  mixins: [Collection],

  directives: { Observer },

  props: {
    token: {
      type: String,
      required: true,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      required: true,
      default: null,
    },
  },

  data() {
    return {
      devicesFilter: null,
      filteredDevices: null,
      elementsMounted: false,
      devicesListLimit: 12,
      devicesListCounter: 0,
      deviceList: null,
      page: 0,
      optionsObserver: {
        margin: 20,
      },
    };
  },

  computed: {
    devices: {
      get() {
        return this.$store.state.device.collection;
      },
      set(value) {
        this.$store.commit('device/setStateKV', { key: 'collection', value });
      },
    },
    devicesCount() {
      return this.$store.state.device.collectionCount;
    },
    sensors: {
      get() {
        return this.$store.state.sensor.collection;
      },
      set(value) {
        this.$store.commit('sensor/setStateKV', { key: 'collection', value });
      },
    },
    deviceTypes() {
      return this.$store.state.deviceTypes.slice(1, this.$store.state.deviceTypes.length);
    },
    transportProtocolNames() {
      return this.$store.state.transportProtocolNames.slice(
        1,
        this.$store.state.transportProtocolNames.length,
      );
    },
    itemId() {
      if (this.filteredDevices && this.filteredDevices.length > 0) {
        return `device-inline-${this.filteredDevices.length - 1}`;
      }
      return `device-inline-0`;
    },
  },

  watch: {
    devicesFilter: {
      handler(value) {
        this.updateFilteredDevices(value);
      },
      immediate: true,
    },
    devices: {
      handler() {
        this.updateFilteredDevices();
      },
      immediate: true,
    },
  },

  async mounted() {
    await this.updateDevicesList();
    await this.countDevices();
  },

  methods: {
    extractSensors(devices) {
      let sensors = [];
      devices.forEach(device => {
        if (device.sensors) {
          sensors = [...sensors, ...device.sensors];
          delete device.sensors;
        }
      });
      return sensors;
    },

    async loadDevices(filter) {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        this.loading = true;
        const devices = await this.$store.cache.dispatch('device/findByAccount', {
          ownerId: this.$store.state.auth.account.id,
          filter,
        });

        if (!devices) {
          const error = new Error('error while looking for devices');
          throw error;
        } else if (devices.length < 1) {
          const error = new Error('you have no device registered');
          throw error;
        }
        this.loading = false;
        logger.publish(4, 'device', 'loadDevices:res', devices.length);
        this.success = { message: 'found devices' };
        return devices;
      } catch (error) {
        this.loading = false;
        this.error = error;
        throw error;
      }
    },

    async countDevices() {
      await this.$store.cache.dispatch('device/countByAccount', {
        ownerId: this.$store.state.auth.account.id,
      });
    },

    newDevice(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.$store.commit('device/cleanModel');
    },

    async updateDevicesList(counter) {
      return this.loadDevices({
        skip: counter,
        limit: this.devicesListLimit,
        include: ['sensors'],
      })
        .then(devices => {
          const sensors = this.extractSensors(devices);
          this.devices = this.batchCollection('devices', this.devices, 'create', devices);
          this.sensors = this.batchCollection('sensors', this.sensors, 'create', sensors);
          this.updateFilteredDevices(this.devicesFilter);
          return devices;
        })
        .catch(e => e);
    },

    updateFilteredDevices(filter) {
      if (filter && filter.key && filter.value) {
        this.filteredDevices = this.devices.filter(
          dev => dev[filter.key].toLowerCase() === filter.value,
        );
      } else {
        this.filteredDevices = this.devices;
      }
      return this.filteredDevices;
    },

    async onIntersected(evt) {
      const obs = evt.detail.obs || {};
      if (!obs || !obs.isIntersecting || obs.intersectionRatio !== 1) return;
      // console.log('onIntersected', obs);
      if (this.page + 1 > this.devicesCount / (this.devicesListLimit * this.page)) return;
      this.page += 1;
      let counter = 0;
      if (this.devicesFilter) counter = this.filteredDevices.length - this.devicesListLimit || 0;
      else counter = this.devicesCount - this.devicesListLimit || 0;
      if (counter < 0) counter = 0;
      if (counter !== this.devicesListCounter) {
        this.devicesListCounter = counter;
        // this.$emit('scroll-bottom', counter, this.page);
        return this.updateDevicesList(counter);
      }
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/devices-list.scss';
</style>
