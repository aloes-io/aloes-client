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
        <b-col cols="6" sm="6" md="4" lg="2" xl="2">
          <img v-if="device.icons" :src="device.icons[0]" class="device-icon" />
        </b-col>
        <b-col cols="6" sm="6" md="4" lg="3" xl="3">
          <div>
            devEui :
            <p>{{ device.devEui }}</p>
          </div>
          <div>
            last signal :
            <p>{{ lastSignal }}</p>
          </div>
        </b-col>
        <b-col cols="6" sm="6" md="4" lg="3" xl="3">
          <div class="device-status">
            status :
            <img
              v-if="!device.status"
              :src="$store.state.style.pictures.deviceOff"
            />
            <img
              v-else-if="device.status"
              :src="$store.state.style.pictures.deviceOn"
            />
          </div>
          <br />
          <div class="device-status">
            frame counter :
            <p>{{ device.frameCounter }}</p>
          </div>
        </b-col>
        <b-col cols="6" sm="6" md="4" lg="3" xl="3">
          <div>
            AP link :
            <div id="qr-holder" ref="qrHolder" class="qr-code-holder" />
          </div>
        </b-col>
      </b-row>
    </b-card-body>
    <b-card-footer @click="showToken = !showToken">
      API key :
      <p v-show="showToken && device.appKey !== null">
        {{ device.appKey }}
      </p>
    </b-card-footer>
  </b-card>
</template>

<script type="text/javascript">
import qrcode from "qrcode-generator";
import bCard from "bootstrap-vue/es/components/card/card";
import bCardBody from "bootstrap-vue/es/components/card/card-body";
import bCardHeader from "bootstrap-vue/es/components/card/card-header";
import bCardFooter from "bootstrap-vue/es/components/card/card-footer";

export default {
  name: "DeviceCard",

  components: {
    "b-card": bCard,
    "b-card-body": bCardBody,
    "b-card-footer": bCardFooter,
    "b-card-header": bCardHeader
  },

  props: {
    device: {
      type: Object,
      required: true,
      default: null
    },
    "new-device": {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data() {
    return {
      showToken: false,
      typeNumber: 0,
      errorCorrectionLevel: "M"
    };
  },

  computed: {
    className() {
      // if (this.device.accountId === this.$store.state.auth.account.id.toString() && !this.$props.newDevice) {
      //   return "owner";
      // } else if (this.device.accountId === this.$store.state.auth.account.id.toString() && this.$props.newDevice) {
      //   return "editor";
      // }
      return "viewer";
    },
    lastSignal() {
      return this.$moment(this.device.lastSignal).format("DD-MM-YY - HH:mm");
    },
    showAppKey: {
      get() {
        // if (this.device.accountId === this.$store.state.auth.account.id.toString()) {
        //   return this.shownToken;
        // }
        return true;
      }
      // set(value) {
      //   if (this.device.accountId === this.$store.state.auth.account.id.toString()) {
      //     this.shownToken = value;
      //   }
      // },
    }
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
      this.$el.querySelector("#qr-holder").innerHTML = this.qr.createImgTag();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/device-card.scss";
</style>
