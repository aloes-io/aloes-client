<template lang="html">
  <div class="devices-list-view">
    <div class="devices-list">
      <b-form-select v-model="devicesFilter" class="mb-3" @input="updateDevicesFilter">
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
        v-for="device in filteredDevices"
        :key="device.id"
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
import { BButton } from 'bootstrap-vue';
import { BFormSelect } from 'bootstrap-vue';

export default {
  name: 'DevicesList',

  components: {
    'b-button': BButton,
    'b-form-select': BFormSelect,
    'device-inline': () => import('@/components/Device/DeviceInline.vue'),
  },

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
    devices: {
      type: Array,
      required: true,
      default: null,
    },
  },

  data() {
    return {
      devicesFilter: null,
      filteredDevices: null,
      devicesListLimit: 10,
      updatedSearchResults: null,
    };
  },

  computed: {
    devicesCollection() {
      return this.$store.state.device.collection;
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
  },

  watch: {
    devicesCollection: {
      handler(newVal) {
        if (newVal && newVal !== null) {
          if (this.devicesFilter && this.devicesFilter !== null) {
            this.filteredDevices = newVal.filter(
              dev => dev[this.devicesFilter.key].toLowerCase() === this.devicesFilter.value,
            );
          } else {
            this.filteredDevices = newVal;
          }
        }
      },
      immediate: true,
    },
  },

  mounted() {
    this.filteredDevices = this.$props.devices;
  },

  methods: {
    newDevice(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.$store.commit('device/cleanModel');
    },

    updateDevicesFilter(filter) {
      this.devicesFilter = filter;
      //  console.log('updateDevicesFilter', this.devicesFilter);
      if (filter && filter !== null) {
        this.filteredDevices = this.devicesCollection.filter(
          dev => dev[filter.key].toLowerCase() === filter.value,
        );
      } else {
        this.filteredDevices = this.$props.devices;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/devices-list.scss';
</style>
