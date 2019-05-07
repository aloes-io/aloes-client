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
              required
              @change="deviceName"
            />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6" lg="6" xl="6">
          <!-- horizontal -->
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
              :options="deviceTypes"
              size="sm"
              required
              @change="deviceType"
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
            breakpoint="sm"
            label-size="sm"
          >
            <b-form-input
              id="device-protocol-version"
              ref="deviceProtocolVersion"
              v-model="protocolVersion"
              type="text"
              size="sm"
              @change="deviceProtocolVersion"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <lorawan-form v-if="transportProtocol && transportProtocol.toLowerCase() === 'lorawan'" />
      <mysensors-form v-if="transportProtocol && transportProtocol.toLowerCase() === 'mysensors'" />
      <aloeslight-form
        v-if="transportProtocol && transportProtocol.toLowerCase() === 'aloeslight'"
      />
      <aloesclient-form v-if="transportProtocol && transportProtocol.toLowerCase() === 'aloes'" />
      <address-form
        v-if="deviceIdExists"
        :is-viewer="false"
        :edit-mode="editorMode"
        :owner-id="device.id"
        class="address-form"
      />
    </b-card-body>
    <b-card-footer>
      <b-button :disabled="!complete" class="save-device" @click="saveDevice">
        <i class="fa fa-check" />
        <small>save</small>
      </b-button>
      <b-button :disabled="!deviceIdExists" class="remove-device" @click="removeDevice">
        <i class="fa fa-trash" />
        <small>delete</small>
      </b-button>
    </b-card-footer>
  </b-card>
</template>

<script type="text/javascript">
import has from 'lodash.has';
import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';
import bCardBody from 'bootstrap-vue/es/components/card/card-body';
import bCardFooter from 'bootstrap-vue/es/components/card/card-footer';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';

export default {
  name: 'DeviceEditor',

  components: {
    'b-button': bButton,
    'b-card': bCard,
    'b-card-body': bCardBody,
    'b-card-footer': bCardFooter,
    'b-form-input': bFormInput,
    'b-form-group': bFormGroup,
    'b-form-select': bFormSelect,
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
        this.$store.commit('device/setModel', value);
      },
    },
    // common device properties
    name: {
      get() {
        return this.$store.state.device.instance.name;
      },
      set(value) {
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
    protocolVersion: {
      get() {
        return this.$store.state.device.instance.protocolVersion;
      },
      set(value) {
        this.$store.commit('device/setModelKV', {
          key: 'protocolVersion',
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
    deviceIdExists() {
      //  console.log(has(this.device, "id"));
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
    protocolVersion() {
      this.updateDeviceForm();
    },
  },

  mounted() {
    //  console.log('profile form', this.status)
  },

  methods: {
    deviceName() {
      if (this.name && this.name !== null && this.name.length && this.name.length > 2) return true;
      return false;
    },
    deviceType() {
      if (this.type && this.type !== null && this.type.length && this.type.length > 3) return true;
      return false;
    },
    deviceProtocolName() {
      if (
        this.transportProtocol &&
        this.transportProtocol !== null &&
        this.transportProtocol.length &&
        this.transportProtocol.length > 3
      )
        return true;
      return false;
    },
    deviceProtocolVersion() {
      if (
        this.protocolVersion &&
        this.protocolVersion !== null &&
        this.protocolVersion.length &&
        this.protocolVersion.length > 0
      )
        return true;
      return false;
    },
    updateDeviceForm() {
      if (this.deviceIdExists) this.complete = true;
      else {
        this.complete =
          this.deviceName() &&
          this.deviceProtocolName() &&
          this.deviceProtocolVersion() &&
          this.deviceType();
      }

      // if (this.deviceName()) {
      //   if (!this.deviceAPUrl()) {
      //     this.$refs.deviceAPUrl.focus();
      //   } else if (!this.deviceDevEui()) {
      //     this.$refs.deviceDevEui.focus();
      //   }
      //   //  else if (!this.deviceProtocol()) {
      //   //   this.$refs.deviceProtocol.focus();
      //   // }
      // } else if (this.deviceAPUrl()) {
      //   if (!this.deviceDevEui()) {
      //     this.$refs.deviceDevEui.focus();
      //   } else if (!this.deviceName()) {
      //     this.$refs.deviceName.focus();
      //   }
      //   //  else if (!this.deviceProtocol()) {
      //   //   this.$refs.deviceProtocol.focus();
      //   // }
      // } else if (this.deviceProtocol()) {
      //   if (!this.deviceDevEui()) {
      //     this.$refs.deviceDevEui.focus();
      //   } else if (!this.deviceName()) {
      //     this.$refs.deviceName.focus();
      //   } else if (!this.deviceAPUrl()) {
      //     this.$refs.cardExpiry.focus();
      //   }
      // }
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
      const device = await this.$store.dispatch('device/saveDevice', {
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
      return this.$store
        .dispatch('address/updateAddress', {
          route: this.$route.name,
          ownerId: this.device.id,
        })
        .then(res => res)
        .catch(err => err);
    },

    async removeDevice(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      this.dismissCountDown = this.dismissSec;
      await this.$store
        .dispatch('device/delDevice', {
          device: this.device,
        })
        .then(res => res)
        .catch(err => err);
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/device-editor.scss';
</style>
