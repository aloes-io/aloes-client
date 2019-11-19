<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-card
    v-show="updatedApplication"
    v-if="updatedApplication !== null"
    class="application-inline-view"
    @mouseover="highlightApplication(updatedApplication)"
    @mouseleave="highlightApplication(null)"
  >
    <b-row>
      <b-col cols="2" sm="4" md="4" lg="4" xl="3">
        <img
          :src="updatedApplication.icon"
          class="application-inline-icon"
          @click="goToApplication"
        />
        <!--  <b-button
          class="application-inline-button"
          @click="goToApplication">
          Voir le application
        </b-button> -->
      </b-col>
      <b-col cols="10" sm="8" md="8" lg="8" xl="9">
        <b-row class="application-inline-row">
          <b-col class="application-props" sm="12">
            <h6 class="application-inline-name">
              {{ updatedApplication.name }}
            </h6>
            <p class="application-inline-description">
              {{ updatedApplication.description }}
            </p>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="application-inline-status" cols="12">
            <div v-if="!updatedApplication.status" class="application-inline-status-off">
              <img :src="$store.state.style.pictures.deviceOff" />
              <small>
                Disconnected
              </small>
            </div>
            <div v-else-if="updatedApplication.status" class="application-inline-status-on">
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
import { BCard } from 'bootstrap-vue';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'ApplicationInline',

  components: {
    'b-card': BCard,
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
    application: {
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
      updatedApplication: null,
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
    application: {
      handler(application) {
        this.updatedApplication = application;
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
    this.updateBackground();
    EventBus.$on('applicationSelected', application => {
      this.updateBackground(application);
    });
  },

  beforeDestroy() {
    EventBus.$off('deviceSelected');
  },

  methods: {
    updateBackground(application) {
      if (
        application &&
        application !== null &&
        application.id.toString() === this.updatedApplication.id.toString()
      ) {
        if (this.updatedApplication.status) {
          this.$el.style.background = this.$store.state.style.palette.green;
        } else {
          this.$el.style.background = this.$store.state.style.palette.yellow;
        }
      } else {
        if (this.updatedApplication.status) {
          this.$el.style.background = this.$store.state.style.palette.lightgreen;
        } else {
          this.$el.style.background = this.$store.state.style.palette.lightyellow;
        }
      }
    },

    highlightApplication(application) {
      EventBus.$emit('applicationSelected', application);
    },

    async goToApplication(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      logger.publish(4, 'application', 'goToApplication:req', this.updatedApplication.id);
      return this.$store.commit('application/setModel', this.updatedApplication);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/application-inline.scss';
</style>
