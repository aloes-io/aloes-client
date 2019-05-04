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
      API key :
      <p v-show="showToken && application.apiKey !== null">
        {{ application.apiKey }}
      </p>
    </b-card-footer>
  </b-card>
</template>

<script type="text/javascript">
import bCard from 'bootstrap-vue/es/components/card/card';
import bCardBody from 'bootstrap-vue/es/components/card/card-body';
import bCardHeader from 'bootstrap-vue/es/components/card/card-header';
import bCardFooter from 'bootstrap-vue/es/components/card/card-footer';

export default {
  name: 'ApplicationCard',

  components: {
    'b-card': bCard,
    'b-card-body': bCardBody,
    'b-card-footer': bCardFooter,
    'b-card-header': bCardHeader,
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

  updated() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../../style/application-card.scss';
</style>
