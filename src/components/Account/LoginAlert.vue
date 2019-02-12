<template lang="html">
  <div class="login-alert-view">
    <b-alert v-if="loginError" :show="loginError !== null" variant="warning">
      {{ loginError.message }}
      <b-button
        v-if="loginError.code && loginError.code === 'NOT_VERIFIED'"
        class="btn btn-warning"
        size="sm"
        @click="sendVerifyMail"
      >
        <small>
          Send confirmation link
        </small>
      </b-button>
    </b-alert>
    <b-alert
      v-if="forgotPasswordError"
      :show="forgotPasswordError !== null"
      variant="warning"
    >
      {{ forgotPasswordError.message }}
      <b-button
        v-if="forgotPasswordError.code"
        :to="{ name: 'home' }"
        class="btn btn-warning"
      >
        <small>
          Signup
        </small>
      </b-button>
      <b-button
        v-if="!forgotPasswordError.code"
        class="btn btn-warning"
        @click="onVerify"
      >
        <small>
          Verify email address
        </small>
      </b-button>
    </b-alert>
    <b-alert
      v-if="forgotPasswordSuccess"
      :show="forgotPasswordSuccess !== null"
      variant="success"
    >
      {{ forgotPasswordSuccess.message }}
      <b-button :to="{ name: 'home' }" class="btn btn-success">
        X
      </b-button>
    </b-alert>
  </div>
</template>

<script type="text/javascript">
import bAlert from "bootstrap-vue/es/components/alert/alert";
import bButton from "bootstrap-vue/es/components/button/button";

export default {
  name: "Alert",

  components: {
    "b-alert": bAlert,
    "b-button": bButton
  },

  props: {
    loginError: {
      type: [Object, Error],
      default: null
    },
    forgotPasswordError: {
      type: [Object, Error],
      default: null
    },
    forgotPasswordSuccess: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      updatedLoginError: null,
      updatedForgotPasswordError: null,
      updatedForgotPasswordSuccess: null
    };
  },

  watch: {
    loginError: {
      handler(err) {
        this.updatedLoginError = err;
      },
      immediate: true
    },
    forgotPasswordError: {
      handler(err) {
        this.updatedForgotPasswordError = err;
      },
      immediate: true
    },
    forgotPasswordSuccess: {
      handler(success) {
        this.updatedForgotPasswordSuccess = success;
      },
      immediate: true
    }
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    async onVerify() {
      try {
        this.forgotPasswordSuccess = null;
        const result = await this.$store.dispatch(
          "auth/findAccountByEmail",
          this.$store.state.auth.forgotPassword.email
        );
        if (result) {
          // await this.$store.dispatch("auth/verifyEmail", {account});
          this.forgotPasswordError = {
            message:
              "A new confirmation link has been sent, have you received it ?"
          };
          return this.forgotPasswordError;
        }
        this.forgotPasswordError = {
          code: "NOT_VERIFIED",
          message: "Sorry we can't find your email address in our database"
        };
        return this.forgotPasswordError;
      } catch (error) {
        this.forgotPasswordError = error;
        return this.error;
      }
    },

    async sendVerifyMail() {
      try {
        const result = await this.$store.dispatch(
          "auth/findAccountByEmail",
          this.$store.state.auth.signin.email
        );
        if (result) {
          // await this.$store.dispatch("auth/verifyEmail", {account});
          this.loginError = {
            message:
              "A new confirmation link has been sent, have you received it ?"
          };
          return this.loginError;
        }
        this.loginError = {
          code: "NOT_VERIFIED",
          message: "Sorry we can't find your email address in our database"
        };
        return this.loginError;
      } catch (error) {
        this.loginError = error;
        return this.error;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/login-alert.scss";
</style>
