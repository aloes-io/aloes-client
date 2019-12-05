<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div class="address-form-view">
    <b-row v-if="!viewer || editorMode" :class="complete" class="address-editor">
      <b-col cols="12" sm="12" md="8" lg="8" xl="8">
        <b-form-group
          id="street-group"
          label-cols="4"
          label="Street :"
          label-for="street"
          label-size="sm"
          breakpoint="sm"
        >
          <b-form-input
            id="street"
            ref="street"
            v-model="street"
            :disabled="!editorMode"
            type="search"
            size="sm"
            autocomplete="search"
            required
          />
        </b-form-group>
      </b-col>
      <b-col cols="6" sm="6" md="4" lg="4" xl="4">
        <b-form-group
          id="city-group"
          label-cols="3"
          label="City :"
          label-for="city"
          label-size="sm"
          breakpoint="sm"
        >
          <b-form-input
            id="city"
            ref="city"
            v-model="city"
            :disabled="!editorMode"
            type="search"
            size="sm"
            autocomplete="search"
            required
          />
        </b-form-group>
      </b-col>
      <b-col cols="6" sm="6" md="5" lg="5" xl="5">
        <b-form-group
          id="zip-code-group"
          label-cols="5"
          label="Zipcode :"
          label-for="zip-code"
          label-size="sm"
          breakpoint="sm"
        >
          <b-form-input
            id="zip-code"
            ref="postalCode"
            v-model="postalCode"
            :disabled="!editorMode"
            type="search"
            size="sm"
            autocomplete="search"
            required
          />
        </b-form-group>
      </b-col>
      <b-col cols="6" sm="4" md="3" lg="3" xl="2">
        <label class="container">
          <small class="label-title">
            public ?
          </small>
          <input v-model="publicAddress" :disabled="!editorMode" type="checkbox" />
          <span class="checkmark" />
        </label>
      </b-col>
      <b-col cols="6" sm="6" md="4" lg="4" xl="4">
        <b-form-group
          id="verify-address-group"
          label-cols="8"
          label="Check address :"
          label-for="verify-address"
          label-size="sm"
          breakpoint="sm"
        >
          <b-button
            id="verify-address"
            size="sm"
            class="verify-address"
            @click.prevent.stop="verifyAddress"
          >
            <i v-if="verifiedAddress" class="fa fa-check" />
            <i v-else class="fa fa-plus" />
          </b-button>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row v-if="viewer && !editorMode && publicAddress">
      <h6>Address</h6>
      <b-col cols="12" sm="12" md="10" lg="8" xl="7">
        {{ street }} {{ postalCode }} {{ city }}
      </b-col>
    </b-row>
    <b-modal ref="addressModal" hide-backdrop hide-footer size="sm">
      <p v-if="verify">
        {{ verify.message }}
      </p>
    </b-modal>
  </div>
</template>

<script type="text/javascript">
import { BButton, BFormGroup, BFormInput, BModal } from 'bootstrap-vue';

export default {
  name: 'AddressForm',

  components: {
    'b-button': BButton,
    'b-form-group': BFormGroup,
    'b-form-input': BFormInput,
    'b-modal': BModal,
  },

  props: {
    'is-viewer': {
      type: Boolean,
      required: true,
    },
    'edit-mode': {
      type: Boolean,
      default: false,
    },
    'owner-id': {
      type: [Object, Number, String],
      required: true,
    },
    'owner-type': {
      type: String,
      required: true,
      default: 'user',
    },
  },

  data() {
    return {
      viewer: true,
      editorMode: false,
      verify: null,
      complete: false,
      validate: { message: 'Check' },
    };
  },

  computed: {
    address: {
      get() {
        if (this.$props.ownerType === 'Device') {
          return this.$store.state.address.deviceAddress;
        } else if (this.$props.ownerType === 'user') {
          return this.$store.state.address.profileAddress;
        }
        return null;
      },
    },
    street: {
      get() {
        if (this.address && this.address !== null && this.address.street) {
          return this.address.street;
        }
        return null;
      },
      set(value) {
        this.$store.commit('address/setModelKV', {
          ownerType: this.$props.ownerType,
          key: 'street',
          value,
        });
      },
    },
    postalCode: {
      get() {
        if (this.address && this.address !== null && this.address.postalCode) {
          return this.address.postalCode;
        }
        return null;
      },
      set(value) {
        this.$store.commit('address/setModelKV', {
          ownerType: this.$props.ownerType,
          key: 'postalCode',
          value,
        });
      },
    },
    city: {
      get() {
        if (this.address && this.address !== null && this.address.city) {
          return this.address.city;
        }
        return null;
      },
      set(value) {
        this.$store.commit('address/setModelKV', {
          ownerType: this.$props.ownerType,
          key: 'city',
          value,
        });
      },
    },
    publicAddress: {
      get() {
        if (this.address && this.address !== null) {
          return this.address.public;
        }
        return null;
      },
      set(value) {
        this.$store.commit('address/setModelKV', {
          ownerType: this.$props.ownerType,
          key: 'public',
          value,
        });
      },
    },
    verifiedAddress: {
      get() {
        if (this.address && this.address !== null) {
          return this.address.verified;
        }
        return null;
      },
      set(value) {
        this.$store.commit('address/setModelKV', {
          ownerType: this.$props.ownerType,
          key: 'verified',
          value,
        });
      },
    },
    className: {
      get() {
        if (!this.editorMode) {
          return 'viewer';
        }
        return 'editor';
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
    ownerId: {
      handler() {
        this.getCollectionAddress();
      },
      immediate: true,
    },
    street() {
      this.updateAddressForm();
    },
    postalCode() {
      this.updateAddressForm();
    },
    city() {
      this.updateAddressForm();
    },
  },

  mounted() {
    this.verifiedAddress = false;
    //  this.getCollectionAddress();
  },

  methods: {
    validStreet() {
      if (this.street !== null && this.street.length > 2) return true;
      return false;
    },
    validPostalCode() {
      if (this.postalCode !== null && this.postalCode.length > 5) return true;
      return false;
    },
    validCity() {
      if (this.city !== null && this.city.length > 2) return true;
      return false;
    },

    updateAddressForm() {
      this.complete = this.validStreet && this.validPostalCode && this.validCity;
      if (this.complete) {
        this.fullAddress = `${this.street} ${this.postalCode} ${this.city}`;
      }
    },

    async getCollectionAddress() {
      return this.$store.dispatch('address/findAddress', {
        ownerType: this.$props.ownerType,
        ownerId: this.$props.ownerId,
        viewer: this.viewer,
      });
    },

    async saveCollectionAddress() {
      return this.$store.dispatch('address/updateAddress', {
        ownerType: this.$props.ownerType,
        ownerId: this.$props.ownerId,
      });
    },

    async verifyAddress() {
      // if (evt) evt.preventDefault();
      // if (evt) evt.stopPropagation();
      return this.$store
        .dispatch('address/verifyAddress', this.$props.ownerType)
        .then(res => {
          if (res.message) {
            this.verifiedAddress = false;
            this.verify = res;
            this.$refs.addressModal.show();
            return this.verify;
          } else if (!res.message && res.street && res.city) {
            this.verifiedAddress = true;
            this.verify = { message: 'Adress checked, thx' };
            this.$refs.addressModal.show();
            return this.saveCollectionAddress();
          }
          this.$refs.addressModal.show();
          this.verify = {
            message: 'Sorry the address seems incorrect',
          };
          return false;
        })
        .catch(err => {
          this.verifiedAddress = false;
          this.verify = err;
          this.$refs.addressModal.show();
          return err;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/address-form.scss';
</style>
