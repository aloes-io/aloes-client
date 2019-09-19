<template lang="html">
  <b-card class="device-editor" no-body>
    <b-card-body>
      <b-row v-if="!viewer && editorMode" :class="{ complete }" align-h="center">
        <b-col cols="12" sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="device-name-group"
            label-cols="4"
            label="Device name :"
            label-for="device-name"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-input
              id="device-name"
              ref="deviceName"
              v-model="name"
              type="text"
              size="sm"
              class="device-name"
              autocomplete="username"
              placeholder="Use unique names inside your network"
              required
            />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="device-type-group"
            label-cols="4"
            label="Device type :"
            label-for="device-type"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-select
              id="device-type"
              ref="deviceType"
              v-model="type"
              :select-size="1"
              :options="deviceTypes"
              size="sm"
              required
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" sm="12" md="12" lg="12" xl="12">
          <b-form-group
            id="device-description-group"
            label-cols="2"
            label="Description :"
            label-for="device-description"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-input
              id="device-description"
              v-model="description"
              type="text"
              size="sm"
              placeholder="What's the purpose of  this device ?"
              class="device-description"
            />
          </b-form-group>
        </b-col>
        <b-col sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="device-transport-protocol-group"
            label-cols="4"
            label="Transport API :"
            label-for="device-transport-protocol"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-select
              id="device-transport-protocol"
              ref="deviceTransportProtocolName"
              v-model="transportProtocol"
              :options="transportProtocolNames"
              size="sm"
              required
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="device-protocol-version-group"
            label-cols="4"
            label="API version :"
            label-for="device-protocol-version"
            placeholder="Just add 1 if you don't know"
            breakpoint="sm"
            label-size="sm"
          >
            <b-form-input
              id="device-protocol-version"
              ref="deviceProtocolVersion"
              v-model="transportProtocolVersion"
              type="text"
              size="sm"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <lorawan-form v-if="transportProtocol && transportProtocol.toLowerCase() === 'lorawan'" />
      <mysensors-form
        v-else-if="transportProtocol && transportProtocol.toLowerCase() === 'mysensors'"
      />
      <aloeslight-form
        v-else-if="transportProtocol && transportProtocol.toLowerCase() === 'aloeslight'"
      />
      <aloesclient-form
        v-else-if="transportProtocol && transportProtocol.toLowerCase() === 'aloes'"
      />

      <address-form
        v-if="deviceIdExists"
        :is-viewer="false"
        :edit-mode="editorMode"
        :owner-id="device.id"
        owner-type="Device"
        class="address-form"
      />
    </b-card-body>
    <b-card-footer>
      <b-button :disabled="!complete" class="save-device" @click="saveDevice">
        <fa-icon icon="check" size="lg" />
        <small>save</small>
      </b-button>
      <b-button :disabled="!deviceIdExists" class="remove-device" @click="onDeleteDevice">
        <fa-icon icon="trash" size="lg" />
        <small>delete</small>
      </b-button>
    </b-card-footer>

    <b-modal v-model="showModal" hide-backdrop size="sm" @ok="onYes" @cancel="onNo">
      {{ confirm.message }}
    </b-modal>
  </b-card>
</template>

<script type="text/javascript">
import has from 'lodash.has';
import { BButton } from 'bootstrap-vue';
import { BCard } from 'bootstrap-vue';
import { BCardBody } from 'bootstrap-vue';
import { BCardFooter } from 'bootstrap-vue';
import { BFormInput } from 'bootstrap-vue';
import { BFormGroup } from 'bootstrap-vue';
import { BFormSelect } from 'bootstrap-vue';
import { BModal } from 'bootstrap-vue';

export default {
  name: 'DeviceEditor',

  components: {
    'b-button': BButton,
    'b-card': BCard,
    'b-card-body': BCardBody,
    'b-card-footer': BCardFooter,
    'b-form-input': BFormInput,
    'b-form-group': BFormGroup,
    'b-form-select': BFormSelect,
    'b-modal': BModal,
    'address-form': () => import('@/components/Address/AddressForm.vue'),
    'aloesclient-form': () => import('@/components/Device/AloesClientForm.vue'),
    'aloeslight-form': () => import('@/components/Device/AloesLightForm.vue'),
    'lorawan-form': () => import('@/components/Device/LoraWanForm.vue'),
    'mysensors-form': () => import('@/components/Device/MySensorsForm.vue'),
  },

  props: {
    'is-viewer': {
      type: Boolean,
      default: true,
    },
    'edit-mode': {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      viewer: true,
      editorMode: false,
      complete: false,
      updatedStatus: null,
      showModal: false,
      confirm: {
        message: `Are you sure you want to delete this device ?`,
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
    dismissSecs: {
      get() {
        return this.$store.state.device.dismissSecs;
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
    // reference for device properties
    deviceTypes: {
      get() {
        return this.$store.state.deviceTypes;
      },
    },
    protocolNames: {
      get() {
        return this.$store.state.protocolNames;
      },
    },
    transportProtocolNames: {
      get() {
        return this.$store.state.transportProtocolNames;
      },
    },
    device: {
      get() {
        return this.$store.state.device.instance;
      },
      set(value) {
        if (value.sensors) {
          this.$store.commit('sensor/setStateKV', {
            key: 'deviceSensors',
            value: value.sensors,
          });
          delete value.sensors;
        }
        this.$store.commit('device/setModel', value);
      },
    },
    // common device properties
    name: {
      get() {
        return this.$store.state.device.instance.name;
      },
      set(value) {
        if (value && value !== null) {
          value.trim().toLowerCase();
          value = value.replace(/\s+/g, '-');
        }
        this.$store.commit('device/setModelKV', {
          key: 'name',
          value,
        });
      },
    },
    type: {
      get() {
        return this.$store.state.device.instance.type;
      },
      set(value) {
        this.$store.commit('device/setModelKV', {
          key: 'type',
          value,
        });
      },
    },
    status: {
      get() {
        return this.$store.state.device.instance.status;
      },
    },
    protocolName: {
      get() {
        return this.$store.state.device.instance.protocolName;
      },
      set(value) {
        this.$store.commit('device/setModelKV', {
          key: 'protocolName',
          value,
        });
      },
    },
    transportProtocolVersion: {
      get() {
        return this.$store.state.device.instance.transportProtocolVersion;
      },
      set(value) {
        this.$store.commit('device/setModelKV', {
          key: 'transportProtocolVersion',
          value,
        });
      },
    },
    transportProtocol: {
      get() {
        return this.$store.state.device.instance.transportProtocol;
      },
      set(value) {
        this.$store.commit('device/setModelKV', {
          key: 'transportProtocol',
          value,
        });
      },
    },
    description: {
      get() {
        return this.$store.state.device.instance.description;
      },
      set(value) {
        this.$store.commit('device/setModelKV', {
          key: 'description',
          value,
        });
      },
    },
    address: {
      get() {
        return this.$store.state.address.deviceAddress;
      },
    },
    deviceIdExists() {
      return has(this.device, 'id');
    },
    // specific device properties
    apiKey: {
      get() {
        return this.$store.state.device.instance.apiKey;
      },
    },
  },

  watch: {
    isViewer: {
      handler(state) {
        this.viewer = state;
      },
      immediate: true,
    },
    editMode: {
      handler(mode) {
        this.editorMode = mode;
      },
      immediate: true,
    },
    name() {
      this.updateDeviceForm();
    },
    accessPointUrl() {
      this.updateDeviceForm();
    },
    devEui() {
      this.updateDeviceForm();
    },
    type() {
      this.updateDeviceForm();
    },
    transportProtocol() {
      this.updateDeviceForm();
    },
    transportProtocolVersion() {
      this.updateDeviceForm();
    },
  },

  mounted() {
    //  console.log('profile form', this.status)
  },

  methods: {
    isDeviceNameValid() {
      if (this.name && this.name !== null && this.name.length && this.name.length >= 5) return true;
      return false;
    },
    isDeviceTypeValid() {
      if (this.type && this.type !== null && this.type.length && this.type.length >= 3) return true;
      return false;
    },
    isDeviceProtocolNameValid() {
      if (
        this.transportProtocol &&
        this.transportProtocol !== null &&
        this.transportProtocol.length &&
        this.transportProtocol.length > 3
      )
        return true;
      return false;
    },
    isDeviceProtocolVersionValid() {
      if (this.transportProtocolVersion && this.transportProtocolVersion !== null) return true;
      return false;
    },
    updateDeviceForm() {
      if (this.deviceIdExists) this.complete = true;
      else {
        this.complete =
          this.isDeviceNameValid() &&
          this.isDeviceProtocolNameValid() &&
          //  this.isDeviceProtocolVersionValid() &&
          this.isDeviceTypeValid();
      }
      //  console.log('updateDeviceForm : complete ?', this.complete);
    },

    async saveDevice(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      this.dismissCountDown = this.dismissSecs;
      if (!this.device.ownerId) {
        this.device.ownerId = this.$store.state.auth.account.id;
      }
      if (this.device.children) {
        delete this.device.children;
      }
      if (this.address && this.address.street !== null && this.address.city !== null) {
        this.device.fullAddress = `${this.address.street} ${this.address.postalCode} ${
          this.address.city
        }`;
      } else {
        this.device.fullAddress = null;
      }
      const device = await this.$store.dispatch('device/saveInstance', {
        device: this.device,
      });
      if (!device.id) {
        this.error = { message: 'error while saving device' };
        return this.error;
      }
      await this.saveCollectionAddress();
      this.success = { message: 'saved device' };
      return device;
    },

    async saveCollectionAddress() {
      return this.$store.dispatch('address/updateAddress', {
        route: this.$route.name,
        ownerId: this.device.id,
      });
    },

    onDeleteDevice(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      this.dismissCountDown = this.dismissSec;
      if (this.device && this.device.id) {
        this.showModal = true;
        // this.$refs.confirmPopup.show();
      }
    },

    async onYes() {
      await this.$store.dispatch('device/deleteInstance', {
        device: this.device,
      });
      this.showModal = false;
      return;
      //  return this.$refs.confirmPopup.hide();
    },

    onNo() {
      //  this.$refs.confirmPopup.hide();
      this.showModal = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/device-editor.scss';
</style>
