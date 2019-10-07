<template>
  <b-modal
    id="login-popup"
    ref="loginPopup"
    hide-footer
    no-close-on-esc
    no-close-on-backdrop
    modal-class="header-popup-modal"
    body-class="header-popup-body"
    class="header-popup-view"
    hide-backdrop
    @shown="onModalShown"
    @hidden="onModalHidden"
  >
    <img :src="$store.state.style.pictures.logo" alt="Aloes logo" class="header-popup-image" />
    <login-master ref="loginMaster" :tab-index="newTabIndex">
      <b-button @click.prevent.stop="hideModal">
        <fa-icon icon="chevron-left" size="lg" />
        Back
      </b-button>
    </login-master>
  </b-modal>
</template>

<script type="text/javascript">
import { BButton, BModal } from 'bootstrap-vue';
import LoginMaster from '@/components/Account/LoginMaster.vue';

export default {
  name: 'LoginPopup',

  components: {
    'b-button': BButton,
    'b-modal': BModal,
    'login-master': LoginMaster,
  },

  props: {
    sessionError: {
      type: Error,
      default: null,
    },
    tabIndex: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      newTabIndex: 0,
    };
  },

  watch: {
    sessionError: {
      handler(err) {
        this.error = err;
      },
      immediate: true,
    },
    tabIndex: {
      handler(index) {
        this.newTabIndex = index;
      },
      immediate: true,
    },
  },

  mounted() {
    //  console.log('login component', this);
  },

  methods: {
    onModalShown() {
      //  this.$refs.loginMaster.onReset();
    },

    onModalHidden() {},

    hideModal() {
      if (this.$route.name !== 'home') {
        this.$router.push({ name: 'home' });
      }
      if (this.$refs.loginMaster && this.$refs.loginMaster !== null) {
        this.$refs.loginMaster.onReset();
      }
      this.$refs.loginPopup.hide();
    },

    showModal() {
      this.$refs.loginPopup.show();
    },
  },
};
</script>

<style lang="scss">
@import '../../style/login-popup.scss';
</style>
