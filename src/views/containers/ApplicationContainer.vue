<template lang="html">
  <b-container fluid class="application-container">
    <b-tabs content-class="mt-3" justified>
      <b-tab title="Config" active>
        <b-row class="about-header">
          <b-col v-if="application" sm="8">
            <application-card v-if="application" :application="application" ref="applicationCard" />
            <application-editor ref="applicationEditor" :is-viewer="false" :edit-mode="true" />
            <br />
            <!--  <app-tree
          v-if="app"
          :application="JSON.stringify(app)"
          :client-url="$store.state.clientUrl"
          :height="300"
          :width="450"
        /> -->
          </b-col>
          <b-col sm="4">
            <applications-list
              v-if="applications"
              :token="token"
              :user-id="userId"
              :applications="applications"
            />
          </b-col>
        </b-row>
        <b-row v-if="!viewer && editorMode" align-h="center">
          <b-col sm="8">
            <b-alert
              v-if="error"
              :show="dismissCountDown && errorMessageExists"
              dismissible
              variant="warning"
              @dismissed="dismissCountDown = 0"
              @dismiss-count-down="countDownChanged"
            >
              {{ error.message }}
            </b-alert>
            <b-alert v-if="success" :show="successMessageExists" dismissible variant="success">
              {{ success.message }}
            </b-alert>
          </b-col>
        </b-row>
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script type="text/javascript">
import has from 'lodash.has';
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bTabs from 'bootstrap-vue/es/components/tabs/tabs';
import bTab from 'bootstrap-vue/es/components/tabs/tab';
import ApplicationEditor from '@/components/Application/ApplicationEditor.vue';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'ApplicationContainer',

  components: {
    'b-alert': bAlert,
    'b-tabs': bTabs,
    'b-tab': bTab,
    'application-editor': ApplicationEditor,
    'application-card': () => import('@/components/Application/ApplicationCard.vue'),
    //  'application-editor': () => import('@/components/Application/ApplicationEditor.vue'),
    'applications-list': () => import('@/components/Application/ApplicationsList.vue'),
  },

  props: {
    token: {
      type: String,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      required: true,
    },
    'application-id': {
      type: [String, Number],
      required: false,
    },
    'is-viewer': {
      type: Boolean,
      required: false,
    },
    'edit-mode': {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      applicationTreeLoaded: true,
      viewer: false,
      editorMode: true,
      loading: false,
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
    applications: {
      get() {
        return this.$store.state.application.collection;
      },
      set(value) {
        this.$store.commit('application/setCollection', value);
      },
    },
    application: {
      get() {
        // if (this.$props.applicationId)
        return this.$store.state.application.instance;
      },
      set(value) {
        this.$store.commit('application/setModel', value);
      },
    },
    applicationsCacheExists() {
      return this.$store.cache.has(
        'application/findApplicationsByAccount',
        this.$store.state.auth.account.id,
      );
    },
    errorMessageExists() {
      return has(this.error, 'message');
      //  return _.;
    },
    successMessageExists() {
      return has(this.sucess, 'message');
    },
  },

  watch: {
    isViewer: {
      handler(state) {
        this.viewer = state;
      },
      immediate: true,
    },
    editorMode: {
      handler(state) {
        this.editMode = state;
      },
      immediate: true,
    },
  },

  async mounted() {
    this.loading = false;
    await this.loadApplications();
    await this.setListeners();
  },

  beforeDestroy() {
    this.loading = false;
    this.removeListeners();
  },

  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },

    async loadApplications() {
      try {
        this.error = null;
        this.success = null;
        this.dismissCountDown = this.dismissSecs;
        this.loading = true;
        logger.publish(4, 'application', 'loadApplications:req', this.applicationsCacheExists);
        const applications = await this.$store.cache.dispatch(
          'application/findApplicationsByAccount',
          this.$store.state.auth.account.id,
        );
        if (!applications) {
          this.loading = false;
          this.error = { message: 'error while looking for applications' };
          return this.error;
        } else if (applications.length < 1) {
          this.loading = false;
          this.error = { message: 'you have no application registered' };
          return this.error;
        }
        logger.publish(4, 'application', 'loadApplications:res', this.applicationsCacheExists);
        this.loading = false;
        this.success = { message: 'found applications' };
        return applications;
      } catch (error) {
        this.loading = false;
        return error;
      }
    },

    setListeners() {
      EventBus.$on('onApplicationDeleted', application => {
        if (application && !this.loading) {
          return setTimeout(this.loadApplications, 200);
        }
      });

      EventBus.$on('onApplicationCreated', application => {
        if (application && !this.loading) {
          return setTimeout(this.loadApplications, 200);
        }
      });

      EventBus.$on('onApplicationUpdated', application => {
        if (application && !this.loading) {
          return setTimeout(this.loadApplications, 200);
        }
      });

      //  await this.$store.dispatch("application/subscribeToApplicationsUpdate", {userId: this.$props.userId});
    },

    removeListeners() {
      //  this.$store.dispatch("application/unsubscribeFromApplicationsUpdate", {userId: this.$props.userId});
      EventBus.$off('onApplicationCreated');
      EventBus.$off('onApplicationDeleted');
      EventBus.$off('onApplicationUpdated');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/application-container.scss';
</style>
