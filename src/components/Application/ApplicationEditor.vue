<template lang="html">
  <b-card class="application-editor" no-body>
    <b-card-body>
      <b-row align-h="center">
        <b-col cols="12" sm="12">
          <b-img
            :src="icon"
            fluid
            class="avatar-image"
            @click.native.prevent.stop="
              displayIconButton ? (displayIconButton = false) : (displayIconButton = true)
            "
            @mouseover="displayIconButton = true"
            @mouseleave="displayIconButton = false"
          />
          <b-button
            v-if="displayIconButton"
            class="avatar-button"
            @mouseover="displayIconButton = true"
            @mouseleave="displayIconButton = false"
            @click.prevent.stop="$refs.avatarImport.showModal()"
          >
            <fa-icon icon="image" size="lg" />
          </b-button>
        </b-col>
      </b-row>
      <b-row v-if="!viewer && editorMode" :class="{ complete }">
        <b-col cols="12" sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="application-name-group"
            label-cols="4"
            label="Name :"
            label-for="application-name"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-input
              id="application-name"
              ref="applicationName"
              class="form-group-input"
              v-model="name"
              type="text"
              size="sm"
              autocomplete="username"
              required
            />
          </b-form-group>
        </b-col>

        <b-col cols="12" sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="app-eui-group"
            label-cols="4"
            label="AppEUI :"
            label-for="app-eui"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-input
              id="app-eui"
              ref="applicationAppEui"
              class="form-group-input"
              v-model="appEui"
              type="text"
              size="sm"
              autocomplete="off"
              placeholder="Server Unique Id"
              required
              @click.native="generateAppEui"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" sm="12">
          <b-form-group
            id="application-description-group"
            label-cols="2"
            label="Description :"
            label-for="application-description"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-input
              id="application-description"
              ref="applicationDescription"
              class="form-group-input"
              v-model="description"
              type="text"
              size="sm"
              placeholder="Optional app description"
              autocomplete="off"
              required
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" sm="12">
          <b-form-group
            id="application-pattern-group"
            label-cols="2"
            label="MQTT Pattern :"
            label-for="application-pattern"
            label-size="sm"
            breakpoint="sm"
            description="Must start with AppEUI/ ; compatible with wildcards"
          >
            <b-input-group size="sm">
              <b-form-input
                id="application-pattern"
                v-model="pattern"
                type="text"
                size="sm"
                autocomplete="off"
                placeholder="<AppEUI>/resources/+resourceId/#props"
                required
              />
              <b-input-group-append>
                <b-button size="sm" variant="outline-success" @click.prevent.stop="">? </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="access-point-url-group"
            label-cols="4"
            label="Access point:"
            label-for="access-point-url"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-input
              id="access-point-url"
              ref="ApplicationAPUrl"
              class="form-group-input"
              v-model="accessPointUrl"
              type="url"
              size="sm"
              autocomplete="url"
              placeholder="will be used to generate a qr code"
              required
            />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="application-transport-protocol-group"
            label-cols="4"
            label="Transport :"
            label-for="application-transport-protocol"
            label-size="sm"
            breakpoint="sm"
          >
            <b-form-select
              id="application-transport-protocol"
              ref="applicationTransportProtocolName"
              class="form-group-input"
              v-model="transportProtocol"
              :options="transportProtocolNames"
              size="sm"
              required
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" sm="12" md="6" lg="6" xl="6">
          <b-form-group
            id="application-protocol-version-group"
            label-cols="4"
            label="API version :"
            label-for="application-protocol-version"
            breakpoint="sm"
            label-size="sm"
          >
            <b-form-input
              id="application-protocol-version"
              ref="applicationProtocolVersion"
              class="form-group-input"
              v-model="protocolVersion"
              type="text"
              size="sm"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <hr />
      <h5>Validators</h5>
      <application-validators ref="validators" :edit-mode="editorMode" :is-viewer="viewer" />
    </b-card-body>
    <b-card-footer>
      <b-button :disabled="!complete" class="save-application" @click="saveApplication">
        <fa-icon icon="check" size="lg" />
      </b-button>
      <b-button
        :disabled="!applicationIdExists"
        class="remove-application"
        @click="removeApplication"
      >
        <fa-icon icon="trash" size="lg" />
      </b-button>
    </b-card-footer>
    <file-import-container
      v-if="!viewer && editorMode"
      ref="avatarImport"
      :access-token="$store.state.auth.access_token"
      resource-type="Images"
      image-type="Avatar"
    />
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
import bImg from 'bootstrap-vue/es/components/image/img';
import BInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
import BInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append';
// import ApplicationValidators from '@/components/Application/ApplicationValidators.vue';
// import FileImportContainer from '@/views/containers/FileImportContainer.vue';
import builder from '@/services/builder';

export default {
  name: 'ApplicationEditor',

  components: {
    'b-button': bButton,
    'b-card': bCard,
    'b-card-body': bCardBody,
    'b-card-footer': bCardFooter,
    'b-form-input': bFormInput,
    'b-form-group': bFormGroup,
    'b-form-select': bFormSelect,
    'b-img': bImg,
    'b-input-group': BInputGroup,
    'b-input-group-append': BInputGroupAppend,
    //  'application-validators': ApplicationValidators,
    //  'file-import-container': FileImportContainer,
    'application-validators': () => import('@/components/Application/ApplicationValidators.vue'),
    'file-import-container': () => import('@/views/containers/FileImportContainer.vue'),
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
      displayIconButton: false,
    };
  },

  computed: {
    success: {
      get() {
        return this.$store.state.application.success;
      },
      set(value) {
        this.$store.commit('application/setStateKV', {
          key: 'success',
          value,
        });
      },
    },
    error: {
      get() {
        return this.$store.state.application.error;
      },
      set(value) {
        this.$store.commit('application/setStateKV', {
          key: 'error',
          value,
        });
      },
    },
    dismissSecs: {
      get() {
        return this.$store.state.application.dismissSecs;
      },
    },
    dismissCountDown: {
      get() {
        return this.$store.state.application.dismissCountDown;
      },
      set(value) {
        this.$store.commit('application/setStateKV', {
          key: 'dismissCountDown',
          value,
        });
      },
    },
    // reference for application properties

    transportProtocolNames: {
      get() {
        return this.$store.state.transportProtocolNames;
      },
    },
    application: {
      get() {
        return this.$store.state.application.instance;
      },
      set(value) {
        this.$store.commit('application/setModel', value);
      },
    },
    // common application properties
    name: {
      get() {
        return this.$store.state.application.instance.name;
      },
      set(value) {
        this.$store.commit('application/setModelKV', {
          key: 'name',
          value,
        });
      },
    },
    description: {
      get() {
        return this.$store.state.application.instance.description;
      },
      set(value) {
        this.$store.commit('application/setModelKV', {
          key: 'description',
          value,
        });
      },
    },
    icon: {
      get() {
        return this.$store.state.application.instance.icon;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'icon',
          value,
        });
      },
    },
    pattern: {
      get() {
        return this.$store.state.application.instance.pattern;
      },
      set(value) {
        //  value: `${this.appEui}/${value}`,
        this.$store.commit('application/setModelKV', {
          key: 'pattern',
          value,
        });
      },
    },
    appEui: {
      get() {
        return this.$store.state.application.instance.appEui;
      },
      set(value) {
        this.$store.commit('application/setModelKV', {
          key: 'appEui',
          value,
        });
      },
    },
    apiKey: {
      get() {
        return this.$store.state.application.instance.apiKey;
      },
    },
    status: {
      get() {
        return this.$store.state.application.instance.status;
      },
    },
    accessPointUrl: {
      get() {
        return this.$store.state.application.instance.accessPointUrl;
      },
      set(value) {
        this.$store.commit('application/setModelKV', {
          key: 'accessPointUrl',
          value,
        });
      },
    },
    protocolName: {
      get() {
        return this.$store.state.application.instance.protocolName;
      },
      set(value) {
        this.$store.commit('application/setModelKV', {
          key: 'protocolName',
          value,
        });
      },
    },
    protocolVersion: {
      get() {
        return this.$store.state.application.instance.protocolVersion;
      },
      set(value) {
        this.$store.commit('application/setModelKV', {
          key: 'protocolVersion',
          value,
        });
      },
    },
    transportProtocol: {
      get() {
        return this.$store.state.application.instance.transportProtocol;
      },
      set(value) {
        this.$store.commit('application/setModelKV', {
          key: 'transportProtocol',
          value,
        });
      },
    },

    applicationIdExists() {
      //  console.log(has(this.application, "id"));
      return has(this.application, 'id');
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
    pattern: {
      handler(newValue, oldValue) {
        this.updateApplicationForm();
        if (this.$refs.validators) {
          this.$refs.validators.setValidatorsOptions(newValue, oldValue);
        }
      },
      immediate: true,
    },
    name() {
      this.updateApplicationForm();
    },
    accessPointUrl() {
      this.updateApplicationForm();
    },
    appEui() {
      this.updateApplicationForm();
    },
    transportProtocol() {
      this.updateApplicationForm();
    },
    protocolVersion() {
      this.updateApplicationForm();
    },
  },

  mounted() {},

  methods: {
    applicationNameIsValid() {
      if (this.name !== null && this.name.length && this.name.length > 2) {
        return true;
      }
      return false;
    },

    applicationAppEuiIsValid() {
      if (this.appEui !== null && this.appEui.length && this.appEui.length === 32) {
        return true;
      }
      return false;
    },

    applicationPatternIsValid() {
      if (
        this.pattern !== null &&
        this.pattern.startsWith(this.appEui) &&
        this.pattern.length > 35
      ) {
        return true;
      }
      return false;
    },

    applicationProtocolIsValid() {
      if (
        this.transportProtocol !== null &&
        this.transportProtocol.length &&
        this.transportProtocol.length > 3
      ) {
        return true;
      }
      return false;
    },

    // applicationProtocolVersionIsValid() {
    //   if (
    //     this.protocolVersion !== null &&
    //     this.protocolVersion.length &&
    //     this.protocolVersion.length > 0
    //   )
    //     return true;
    //   return false;
    // },

    updateApplicationForm() {
      if (this.applicationIdExists) this.complete = true;
      else {
        this.complete =
          this.applicationNameIsValid() &&
          this.applicationPatternIsValid() &&
          this.applicationAppEuiIsValid() &&
          this.applicationProtocolIsValid();
      }
    },

    async generateAppEui() {
      if (!this.appEui || this.appEui === null) {
        const key = await builder.generateKeys(32);
        this.appEui = key;
        return key;
      }
      return null;
    },

    async saveApplication(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      this.dismissCountDown = this.dismissSecs;
      if (!this.application.userId) {
        this.application.userId = this.$store.state.auth.account.id;
      }
      const application = await this.$store.dispatch('application/saveApplication', {
        application: this.application,
      });
      if (!application.id) {
        this.error = { message: 'error while saving application' };
        return this.error;
      }
      this.success = { message: 'saved application' };
      return application;
    },

    async removeApplication(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      this.dismissCountDown = this.dismissSec;
      await this.$store
        .dispatch('application/delApplication', {
          application: this.application,
        })
        .then(res => res)
        .catch(err => err);
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/application-editor.scss';
</style>
