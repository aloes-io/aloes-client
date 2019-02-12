<template lang="html">
  <div class="address-form-view">
    <b-row
      v-if="!viewer || editorMode"
      :class="complete"
      class="address-editor"
    >
      <b-col cols="12" sm="7" md="7" lg="7" xl="7">
        <b-form-group
          id="street-group"
          horizontal
          label-cols="3"
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
      <b-col cols="6" sm="5" md="5" lg="5" xl="5">
        <b-form-group
          id="city-group"
          horizontal
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
      <b-col cols="6" sm="5" md="5" lg="5" xl="5">
        <b-form-group
          id="zip-code-group"
          horizontal
          label-cols="4"
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
      <b-col cols="6" sm="4" md="4" lg="3" xl="3">
        <label class="container">
          <small class="label-title">
            public ?
          </small>
          <input
            v-model="publicAddress"
            :disabled="!editorMode"
            type="checkbox"
          />
          <span class="checkmark" />
        </label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="4">
        <b-form-group
          id="verify-address-group"
          horizontal
          label-cols="8"
          label="Check address :"
          label-for="verify-address"
          label-size="sm"
          breakpoint="sm"
        >
          <b-button
            id="verify-address"
            :disabled="verifiedAddress"
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
    <b-modal ref="addressModal" hide-footer size="sm">
      <p v-if="verify">
        {{ verify.message }}
      </p>
    </b-modal>
  </div>
</template>

<script type="text/javascript">
import bButton from "bootstrap-vue/es/components/button/button";
import bFormGroup from "bootstrap-vue/es/components/form-group/form-group";
import bFormInput from "bootstrap-vue/es/components/form-input/form-input";
import bModal from "bootstrap-vue/es/components/modal/modal";

export default {
  name: "AddressForm",

  components: {
    "b-button": bButton,
    "b-form-group": bFormGroup,
    "b-form-input": bFormInput,
    "b-modal": bModal
  },

  props: {
    "is-viewer": {
      type: Boolean,
      required: true
    },
    "edit-mode": {
      type: Boolean,
      default: false
    },
    "owner-id": {
      type: [Object, Number, String],
      required: true
    }
  },

  data() {
    return {
      viewer: true,
      editorMode: false,
      verify: null,
      complete: false,
      validate: { message: "vérifier" }
    };
  },

  computed: {
    street: {
      get() {
        if (this.$route.name === "device") {
          return this.$store.state.address.deviceAddress.street;
        } else if (this.$route.name === "account") {
          return this.$store.state.address.profileAddress.street;
        } else if (this.$route.name === "profile") {
          return this.$store.state.address.viewedProfileAddress.street;
        }
        return null;
      },
      set(value) {
        this.$store.commit("address/setModelKV", {
          route: this.$route.name,
          key: "street",
          value
        });
      }
    },
    postalCode: {
      get() {
        if (this.$route.name === "device") {
          return this.$store.state.address.deviceAddress.postalCode;
        } else if (this.$route.name === "account") {
          return this.$store.state.address.profileAddress.postalCode;
        } else if (this.$route.name === "profile") {
          return this.$store.state.address.viewedProfileAddress.postalCode;
        }
        return null;
      },
      set(value) {
        this.$store.commit("address/setModelKV", {
          route: this.$route.name,
          key: "postalCode",
          value
        });
      }
    },
    city: {
      get() {
        if (this.$route.name === "device") {
          return this.$store.state.address.deviceAddress.city;
        } else if (this.$route.name === "account") {
          return this.$store.state.address.profileAddress.city;
        } else if (this.$route.name === "profile") {
          return this.$store.state.address.viewedProfileAddress.city;
        }
        return null;
      },
      set(value) {
        this.$store.commit("address/setModelKV", {
          route: this.$route.name,
          key: "city",
          value
        });
      }
    },
    publicAddress: {
      get() {
        if (this.$route.name === "device") {
          return this.$store.state.address.deviceAddress.publicAddress;
        } else if (this.$route.name === "account") {
          return this.$store.state.address.profileAddress.publicAddress;
        } else if (this.$route.name === "profile") {
          return this.$store.state.address.viewedProfileAddress.publicAddress;
        }
        return null;
      },
      set(value) {
        this.$store.commit("address/setModelKV", {
          route: this.$route.name,
          key: "publicAddress",
          value
        });
      }
    },
    verifiedAddress: {
      get() {
        if (this.$route.name === "device") {
          return this.$store.state.address.deviceAddress.verified;
        } else if (this.$route.name === "account") {
          return this.$store.state.address.profileAddress.verified;
        } else if (this.$route.name === "profile") {
          return this.$store.state.address.viewedProfileAddress.verified;
        }
        return null;
      },
      set(value) {
        this.$store.commit("address/setModelKV", {
          route: this.$route.name,
          key: "verified",
          value
        });
      }
    },
    className: {
      get() {
        if (!this.editorMode) {
          return "viewer";
        }
        return "editor";
      }
    }
  },

  watch: {
    isViewer: {
      handler(state) {
        this.viewer = state;
      },
      immediate: true
    },
    editMode: {
      handler(mode) {
        this.editorMode = mode;
      },
      immediate: true
    },
    ownerId: {
      handler() {
        this.getCollectionAddress();
      },
      immediate: true
    },
    street() {
      this.updateAddressForm();
    },
    postalCode() {
      this.updateAddressForm();
    },
    city() {
      this.updateAddressForm();
    }
  },

  mounted() {
    this.verifiedAddress = false;
    this.getCollectionAddress();
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
      this.complete =
        this.validStreet && this.validPostalCode && this.validCity;
      this.fullAddress = `${this.street} ${this.postalCode} ${this.city}`;
      // if (this.street) {
      //   if (!this.postalCode) {
      //     this.$refs.postalCode.focus();
      //   } else if (!this.city) {
      //     this.$refs.city.focus();
      //   }
      // } else if (this.postalCode) {
      //   if (!this.street) {
      //     this.$refs.street.focus();
      //   } else if (!this.city) {
      //     this.$refs.city.focus();
      //   }
      // } else if (this.city) {
      //   if (!this.postalCode) {
      //     this.$refs.postalCode.focus();
      //   } else if (!this.street) {
      //     this.$refs.street.focus();
      //   }
      // }
    },

    async getCollectionAddress() {
      return this.$store
        .dispatch("address/findAddress", {
          route: this.$route.name,
          ownerId: this.$props.ownerId,
          viewer: this.viewer
        })
        .then(res => res)
        .catch(err => err);
    },

    async saveCollectionAddress() {
      return this.$store
        .dispatch("address/updateAddress", {
          route: this.$route.name,
          ownerId: this.$props.ownerId
        })
        .then(res => res)
        .catch(err => err);
    },

    async verifyAddress() {
      // if (evt) evt.preventDefault();
      // if (evt) evt.stopPropagation();
      await this.$store
        .dispatch("address/verifyAddress", this.$route.name)
        .then(res => {
          if (res.message) {
            this.verifiedAddress = false;
            this.verify = res;
            this.$refs.addressModal.show();
            return this.verify;
          } else if (!res.message && res.street && res.city) {
            this.verifiedAddress = true;
            this.verify = { message: "Adresse vérifiée, merci" };
            this.$refs.addressModal.show();
            return this.saveCollectionAddress();
          }
          this.$refs.addressModal.show();
          this.verify = {
            message: "Oups! L'adresse semble incorrecte, veuillez réessayer"
          };
          return false;
        })
        .catch(err => {
          this.verifiedAddress = false;
          this.verify = err;
          this.$refs.addressModal.show();
          return err;
        });
      return null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/address-form.scss";
</style>
