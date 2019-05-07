<template lang="html">
  <b-card :class="className" no-body class="device-card">
    <b-card-header>
      <b-row>
        <b-col cols="6" sm="6">
          <h5>
            {{ device.name }}
          </h5>
        </b-col>
        <b-col cols="6" sm="6">
          <h5>
            {{ device.type }}
          </h5>
        </b-col>
      </b-row>
    </b-card-header>
    <b-card-body class="device-sensors">
      <b-row>
        <b-col cols="4" sm="4" md="4" lg="4" xl="4">
          <img v-if="device.icons" :src="device.icons[0]" class="device-icon" />
        </b-col>
        <b-col cols="4" sm="4" md="4" lg="4" xl="4">
          <div v-if="device.id">
            <p>id : {{ device.id }}</p>

            <p>devEui : {{ device.devEui }}</p>
          </div>
        </b-col>
        <b-col cols="4" sm="4" md="4" lg="4" xl="4">
          <div>
            <div id="qr-holder" ref="qrHolder" class="qr-code-holder" />
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="4" md="4" lg="4" xl="4" class="device-status">
          status :
          <img v-if="!device.status" :src="$store.state.style.pictures.deviceOff" />
          <img v-else-if="device.status" :src="$store.state.style.pictures.deviceOn" />
        </b-col>
        <b-col cols="6" sm="4" md="4" lg="4" xl="4" class="device-status">
          frame counter :
          <p>{{ device.frameCounter }}</p>
        </b-col>
        <b-col cols="6" sm="4" md="4" lg="4" xl="4">
          last signal :
          <p>{{ lastSignal }}</p>
        </b-col>
      </b-row>
    </b-card-body>
    <b-card-footer @click="showToken = !showToken">
      <b-row>
        <b-col cols="9" sm="10" md="9" lg="9" xl="10">
          API key :
          <p v-show="showToken && device.apiKey !== null">
            {{ device.apiKey }}
          </p>
        </b-col>
        <b-col cols="3" sm="2" md="3" lg="3" xl="2">
          <b-button
            :disabled="!device.id"
            class="refresh-token-btn"
            @click.prevent.stop="showRefreshTokenPopup"
          >
            <i class="fa fa-refresh" />
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
import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';
import bCardBody from 'bootstrap-vue/es/components/card/card-body';
import bCardHeader from 'bootstrap-vue/es/components/card/card-header';
import bCardFooter from 'bootstrap-vue/es/components/card/card-footer';
import bModal from 'bootstrap-vue/es/components/modal/modal';
import qrcode from 'qrcode-generator';

export default {
  name: 'DeviceCard',

  components: {
    'b-button': bButton,
    'b-card': bCard,
    'b-card-body': bCardBody,
    'b-card-footer': bCardFooter,
    'b-card-header': bCardHeader,
    'b-modal': bModal,
  },

  props: {
    device: {
      type: Object,
      required: true,
      default: null,
    },
    'new-device': {
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
    windowWidth: {
      get() {
        return this.$store.state.windowWidth;
      },
    },
    windowHeight: {
      get() {
        return this.$store.state.windowHeight;
      },
    },
    className() {
      // if (this.device.accountId === this.$store.state.auth.account.id.toString() && !this.$props.newDevice) {
      //   return "owner";
      // } else if (this.device.accountId === this.$store.state.auth.account.id.toString() && this.$props.newDevice) {
      //   return "editor";
      // }
      return 'viewer';
    },
    lastSignal() {
      //  return this.$moment(this.device.lastSignal).format('DD-MM-YY - HH:mm');
      return this.device.lastSignal;
    },
    showAppKey: {
      get() {
        // if (this.device.accountId === this.$store.state.auth.account.id.toString()) {
        //   return this.shownToken;
        // }
        return true;
      },
      // set(value) {
      //   if (this.device.accountId === this.$store.state.auth.account.id.toString()) {
      //     this.shownToken = value;
      //   }
      // },
    },

    qrCodeSize() {
      if (window.innerWidth >= 320 && window.innerWidth <= 480) {
        return '70px';
      } else if (window.innerWidth >= 480 && window.innerWidth <= 768) {
        return '90px';
      } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
        return '100px';
      } else if (window.innerWidth >= 1024 && window.innerWidth <= 1400) {
        return '120px';
      } else {
        return '120px';
      }
    },
  },

  mounted() {
    if (this.device.qrCode) {
      this.createQRCode(this.device.qrCode);
    }
  },

  updated() {
    if (this.device.qrCode) {
      this.createQRCode(this.device.qrCode);
    }
  },

  methods: {
    createQRCode(data) {
      this.qr = qrcode(this.typeNumber, this.errorCorrectionLevel);
      this.qr.addData(data);
      this.qr.make();
      this.$el.querySelector('#qr-holder').innerHTML = this.qr.createImgTag();
      this.$el.querySelector('#qr-holder > img').style.width = this.qrCodeSize;
      this.$el.querySelector('#qr-holder > img').style.height = this.qrCodeSize;
    },

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
      const device = await this.$store.dispatch('device/refreshToken', this.device);
      if (device && device.apiKey) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/device-card.scss';
</style>
