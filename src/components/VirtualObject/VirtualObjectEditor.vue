<template lang="html">
  <b-card class="virtual-object-editor" no-body>
    <b-card-body>
      <b-row
        v-if="!viewer && editorMode"
        :class="{ complete }"
        align-h="center"
      >
        <b-col cols="12" sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="virtual-object-name-group"
            horizontal
            label-cols="4"
            label="Device name :"
            label-for="virtual-object-name"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-input
              id="virtual-object-name"
              ref="virtualObjectName"
              v-model="name"
              type="text"
              size="sm"
              class="virtual-object-name"
              autocomplete="username"
              required
              @change="virtualObjectName"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="vo-access-point-url-group"
            horizontal
            label-cols="4"
            label="Access point:"
            label-for="vo-access-point-url"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-input
              id="vo-access-point-url"
              ref="virtualObjectAPUrl"
              v-model="accessPointUrl"
              type="url"
              size="sm"
              autocomplete="url"
              placeholder="will be used to generate a qr code"
              required
              @change="virtualObjectAPUrl"
            />
          </b-form-group>
        </b-col>
        <b-col sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="virtual-object-type-group"
            label-cols="4"
            horizontal
            label="Device type :"
            label-for="virtual-object-type"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-select
              id="virtual-object-type"
              ref="virtualObjectType"
              v-model="type"
              :options="virtualObjectTypes"
              size="sm"
              required
              @change="virtualObjectType"
            />
          </b-form-group>
        </b-col>
      </b-row>
    </b-card-body>
    <b-card-footer>
      <b-button
        :disabled="!complete"
        class="save-virtual-object"
        @click="saveVirtualObject"
      >
        <i class="fa fa-check" />
      </b-button>
      <b-button
        :disabled="!deviceIdExists"
        class="remove-virtual-object"
        @click="removeVirtualObject"
      >
        <i class="fa fa-trash" />
      </b-button>
    </b-card-footer>
  </b-card>
</template>

<script type="text/javascript">
import has from "lodash.has";
import bButton from "bootstrap-vue/es/components/button/button";
import bCard from "bootstrap-vue/es/components/card/card";
import bCardBody from "bootstrap-vue/es/components/card/card-body";
import bCardFooter from "bootstrap-vue/es/components/card/card-footer";
import bFormInput from "bootstrap-vue/es/components/form-input/form-input";
import bFormGroup from "bootstrap-vue/es/components/form-group/form-group";
import bFormSelect from "bootstrap-vue/es/components/form-select/form-select";

export default {
  name: "VirtualObjectEditor",

  components: {
    "b-button": bButton,
    "b-card": bCard,
    "b-card-body": bCardBody,
    "b-card-footer": bCardFooter,
    "b-form-input": bFormInput,
    "b-form-group": bFormGroup,
    "b-form-select": bFormSelect
  },

  props: {
    "is-viewer": {
      type: Boolean,
      default: true
    },
    "edit-mode": {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      viewer: true,
      editorMode: false,
      complete: false,
      updatedStatus: null
    };
  },

  computed: {
    success: {
      get() {
        return this.$store.state.virtualObject.success;
      },
      set(value) {
        this.$store.commit("virtualObject/setStateKV", {
          key: "success",
          value
        });
      }
    },
    error: {
      get() {
        return this.$store.state.virtualObject.error;
      },
      set(value) {
        this.$store.commit("virtualObject/setStateKV", {
          key: "error",
          value
        });
      }
    },
    dismissSecs: {
      get() {
        return this.$store.state.virtualObject.dismissSecs;
      }
    },
    dismissCountDown: {
      get() {
        return this.$store.state.virtualObject.dismissCountDown;
      },
      set(value) {
        this.$store.commit("virtualObject/setStateKV", {
          key: "dismissCountDown",
          value
        });
      }
    },
    virtualObjectTypes: {
      get() {
        return this.$store.state.virtualObjectTypes;
      }
    },
    virtualObject: {
      get() {
        return this.$store.state.virtualObject.instance;
      },
      set(value) {
        this.$store.commit("virtualObject/setModel", value);
      }
    },
    devEui: {
      get() {
        return this.$store.state.virtualObject.instance.devEui;
      },
      set(value) {
        this.$store.commit("virtualObject/setModelKV", {
          key: "devEui",
          value
        });
      }
    },
    accessPointUrl: {
      get() {
        return this.$store.state.virtualObject.instance.accessPointUrl;
      },
      set(value) {
        this.$store.commit("virtualObject/setModelKV", {
          key: "accessPointUrl",
          value
        });
      }
    },
    name: {
      get() {
        return this.$store.state.virtualObject.instance.name;
      },
      set(value) {
        this.$store.commit("virtualObject/setModelKV", {
          key: "name",
          value
        });
      }
    },
    type: {
      get() {
        return this.$store.state.virtualObject.instance.type;
      },
      set(value) {
        this.$store.commit("virtualObject/setModelKV", {
          key: "type",
          value
        });
      }
    },
    status: {
      get() {
        return this.$store.state.virtualObject.instance.status;
      }
    },
    description: {
      get() {
        return this.$store.state.virtualObject.instance.description;
      },
      set(value) {
        this.$store.commit("virtualObject/setModelKV", {
          key: "description",
          value
        });
      }
    },
    virtualObjectIdExists() {
      //  console.log(has(this.virtualObject, "id"));
      return has(this.virtualObject, "id");
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
    name() {
      this.updateVirtualObjectForm();
    },
    accessPointUrl() {
      this.updateVirtualObjectForm();
    },
    type() {
      this.updateVirtualObjectForm();
    }
  },

  created() {
    //  import address
  },

  mounted() {
    //  console.log('profile form', this.status)
  },

  methods: {
    virtualObjectName() {
      if (this.name !== null && this.name.length && this.name.length > 2)
        return true;
      return false;
    },
    virtualObjectAPUrl() {
      if (
        this.accessPointUrl !== null &&
        this.accessPointUrl.length &&
        this.accessPointUrl.length > 2
      )
        return true;
      return false;
    },
    virtualObjectType() {
      if (this.type !== null && this.type.length && this.type.length > 3)
        return true;
      return false;
    },
    updateVirtualObjectForm() {
      if (this.deviceIdExists) this.complete = true;
      else {
        this.complete =
          this.virtualObjectName() &&
          this.virtualObjectAPUrl() &&
          this.virtualObjectType();
      }
    },

    async saveVirtualObject(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      this.dismissCountDown = this.dismissSecs;
      const virtualObject = await this.$store.dispatch(
        "virtualObject/saveVirtualObject",
        {
          accountId: this.$store.state.auth.account.id,
          virtualObject: this.virtualObject
        }
      );
      if (!virtualObject.id) {
        this.error = { message: "error while saving virtualObject" };
        return this.error;
      }
      this.success = { message: "saved virtualObject" };
      return virtualObject;
    },

    async removeVirtualObject(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      this.dismissCountDown = this.dismissSec;
      await this.$store
        .dispatch("virtualObject/delVirtualObject", {
          accountId: this.$store.state.auth.account.id,
          virtualObject: this.virtualObject
        })
        .then(res => res)
        .catch(err => err);
      return null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/virtual-object-editor.scss";
</style>
