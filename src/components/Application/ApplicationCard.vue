<template lang="html">
  <b-card :class="className" no-body class="application-card">
    <b-card-header>
      <b-row>
        <b-col cols="6" sm="6">
          <h5>
            {{ application.name }}
          </h5>
        </b-col>
        <b-col cols="6" sm="6">
          <h5>
            {{ application.accessPointUrl }}
          </h5>
        </b-col>
      </b-row>
    </b-card-header>
    <b-card-body class="application-specs">
      <b-row>
        <b-col cols="6" sm="6" md="4" lg="2" xl="2">
          <img v-if="application.icons" :src="application.icons[0]" class="application-icon" />
        </b-col>
        <b-col cols="6" sm="6" md="4" lg="3" xl="3">
          <div>
            appEui :
            <p>{{ application.appEui }}</p>
          </div>
          <div>
            last signal :
            <p>{{ lastSignal }}</p>
          </div>
        </b-col>
        <b-col cols="6" sm="6" md="4" lg="3" xl="3">
          <div class="application-status">
            status :
            <img v-if="!application.status" :src="$store.state.style.pictures.deviceOff" />
            <img v-else-if="application.status" :src="$store.state.style.pictures.deviceOn" />
          </div>
        </b-col>
        <b-col cols="6" sm="6" md="4" lg="3" xl="3">
          <div>
            Pattern :
            {{ application.pattern }}
          </div>
        </b-col>
        <!-- application.validators -->
      </b-row>
    </b-card-body>
    <b-card-footer @click="showToken = !showToken">
      <b-row>
        <b-col cols="9" sm="10" md="9" lg="9" xl="10">
          API key :
          <p v-show="showToken && application.apiKey !== null">
            {{ application.apiKey }}
          </p>
        </b-col>
        <b-col cols="3" sm="2" md="3" lg="3" xl="2">
          <b-button
            :disabled="!application.id"
            class="refresh-token-btn"
            @click.prevent.stop="showRefreshTokenPopup"
          >
            <fa-icon icon="sync" size="lg" />
          </b-button>
        </b-col>
      </b-row>
    </b-card-footer>
    <b-modal
      id="refresh-token-popup"
      ref="refreshTokenPopup"
      title="refresh token ?"
      size="sm"
      hide-footer
      lazy
      class="refresh-token-popup-view"
      modal-class="refresh-token-popup-modal"
      header-class="refresh-token-popup-header"
      body-class="refresh-token-popup-body"
      @hidden="onModalHidden"
    >
      <b-button class="refresh-token-popup-button" @click.prevent.stop="refreshToken">
        Confirm
      </b-button>
      <b-button class="refresh-token-popup-button" @click.prevent.stop="hideRefreshTokenPopup">
        Cancel
      </b-button>
    </b-modal>
  </b-card>
</template>

<script type="text/javascript">
import { BButton } from 'bootstrap-vue';
import { BCard } from 'bootstrap-vue';
import { BCardBody } from 'bootstrap-vue';
import { BCardFooter } from 'bootstrap-vue';
import { BCardHeader } from 'bootstrap-vue';
import { BModal } from 'bootstrap-vue';

export default {
  name: 'ApplicationCard',

  components: {
    'b-button': BButton,
    'b-card': BCard,
    'b-card-body': BCardBody,
    'b-card-footer': BCardFooter,
    'b-card-header': BCardHeader,
    'b-modal': BModal,
  },

  props: {
    application: {
      type: Object,
      required: true,
      default: null,
    },
    'new-application': {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      showToken: false,
      typeNumber: 0,
      errorCorrectionLevel: 'M',
    };
  },

  computed: {
    className() {
      return 'viewer';
    },
    lastSignal() {
      //  return this.$moment(this.application.lastSignal).format('DD-MM-YY - HH:mm');
      return this.application.lastSignal || null;
    },
    showAppKey: {
      get() {
        // if (this.application.accountId === this.$store.state.auth.account.id.toString()) {
        //   return this.shownToken;
        // }
        return true;
      },
      // set(value) {
      //   if (this.application.accountId === this.$store.state.auth.account.id.toString()) {
      //     this.shownToken = value;
      //   }
      // },
    },
  },

  mounted() {},

  methods: {
    onModalHidden() {
      this.error = null;
      this.success = null;
      this.profile = null;
      this.loading = false;
    },

    hideRefreshTokenPopup() {
      this.$refs.refreshTokenPopup.hide();
    },

    showRefreshTokenPopup() {
      this.$refs.refreshTokenPopup.show();
    },

    async refreshToken() {
      const application = await this.$store.dispatch('application/refreshToken', this.application);
      if (application && application.apiKey) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/application-card.scss';
</style>
