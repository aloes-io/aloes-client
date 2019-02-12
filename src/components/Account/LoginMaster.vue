<template lang="html">
  <div class="login-view">
    <p class="login-title">
      {{ loginTitle }}
    </p>
    <p class="login-subtitle">
      {{ loginSubtitle }}
    </p>
    <b-row align-h="center">
      <b-col sm="12" md="10" lg="8" xl="8">
        <login-form v-if="newTabIndex === 0" ref="login" />
        <forgot-password v-else-if="newTabIndex === 1" ref="forgotPassword" />
      </b-col>
    </b-row>
    <br />
    <b-row v-if="newTabIndex === 0" align-h="center">
      <b-col sm="12" md="10" lg="8" xl="8">
        <b-button class="return-button" @click="$router.push({ name: 'home' })">
          <i class="fa fa-angle-left" />
          Retour
        </b-button>
        <b-button type="submit" class="login" @click="sendReq">
          S'identifier
        </b-button>
        <br />
      </b-col>
      <b-col sm="12" md="10" lg="8" xl="8">
        <a
          class="forgot-pass"
          @click="
            newTabIndex = 1;
            loginError = null;
          "
        >
          Mot de passe oublié ?
        </a>
      </b-col>
    </b-row>
    <b-row v-else-if="newTabIndex === 1" align-h="center">
      <b-col sm="12" md="10" lg="8" xl="8">
        <b-button
          class="cancel"
          @click="
            newTabIndex = 0;
            forgotPasswordError = null;
          "
        >
          Annuler
        </b-button>
        <b-button type="submit" class="send" @click="sendReq">
          Valider
        </b-button>
      </b-col>
    </b-row>
    <br />
    <login-alert
      :login-error="loginError"
      :forgot-password-error="forgotPasswordError"
      :forgot-password-success="forgotPasswordSuccess"
    />
  </div>
</template>

<script type="text/javascript">
import bButton from "bootstrap-vue/es/components/button/button";
import ForgotPassword from "@/components/Account/ForgotPassword.vue";
import LoginAlert from "@/components/Account/LoginAlert.vue";
import LoginForm from "@/components/Account/LoginForm.vue";

export default {
  name: "LoginMaster",

  components: {
    "b-button": bButton,
    "forgot-password": ForgotPassword,
    "login-alert": LoginAlert,
    "login-form": LoginForm
  },

  props: {
    sessionError: {
      type: Error,
      default: null
    },
    tabIndex: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      newTabIndex: 0,
      loading: false,
      error: false
    };
  },

  computed: {
    loginTitle: {
      get() {
        if (this.newTabIndex === 0) {
          return "Bon retour parmi nous";
        } else if (this.newTabIndex === 1) {
          return "Commençons par trouver votre compte";
        }
        return "";
      }
    },
    loginSubtitle: {
      get() {
        if (this.newTabIndex === 0) {
          return " Ne manquez pas votre prochaine opportunité ! Identifiez vous pour rester au courant de ce qui se passe dans votre sphère professionnelle.";
        } else if (this.newTabIndex === 1) {
          return "";
        }
        return "";
      }
    },
    loginError: {
      get() {
        return this.$store.state.auth.login.error;
      },
      set(value) {
        this.$store.commit("auth/setLoginKV", {
          key: "error",
          value
        });
      }
    },
    forgotPasswordError: {
      get() {
        return this.$store.state.auth.forgotPassword.error;
      },
      set(value) {
        this.$store.commit("auth/setForgotPasswordKV", {
          key: "error",
          value
        });
      }
    },
    forgotPasswordSuccess: {
      get() {
        return this.$store.state.auth.forgotPassword.success;
      },
      set(value) {
        this.$store.commit("auth/setForgotPasswordKV", {
          key: "success",
          value
        });
      }
    }
  },

  watch: {
    sessionError: {
      handler(err) {
        this.error = err;
      },
      immediate: true
    },
    tabIndex: {
      handler(index) {
        this.newTabIndex = index;
      },
      immediate: true
    }
  },

  mounted() {
    this.onReset();
  },

  updated() {
    // if (this.newTabIndex === 0) {
    //   this.$store.commit('auth/cleanForgotPassword');
    // } else if (this.newTabIndex === 1) {
    //   this.$store.commit('auth/cleanLogin');
    // }
  },

  beforeDestroy() {
    this.onReset();
  },

  methods: {
    async sendReq(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.loginError = null;
      this.forgotPasswordError = null;
      this.forgotPasswordSuccess = null;

      if (this.newTabIndex === 0) {
        await this.$refs.login.onLogin(evt);
        if (this.$store.state.auth.login.error) {
          this.loginError = this.$store.state.auth.login.error;
          return this.loginError;
        }
      } else if (this.newTabIndex === 1) {
        await this.$refs.forgotPassword.sendRecoverEmail(evt);
        if (!this.$store.state.auth.forgotPassword.error) {
          this.forgotPasswordSuccess = this.$store.state.auth.forgotPassword.success;
          return this.forgotPasswordSuccess;
          // this.$refs.modal.hide();
        }
        this.forgotPasswordError = this.$store.state.auth.forgotPassword.error;
        return this.forgotPasswordError;
      }
      return null;
    },

    onVerify() {
      this.forgotPasswordSuccess = null;
      this.$store.dispatch(
        "auth/verifyEmail",
        this.$store.state.auth.forgotPassword.email
      );
      this.forgotPasswordError = {
        message:
          "Un nouveau mail de vérification a été envoyé, l'avez-vous reçu ?"
      };
    },

    onReset() {
      if (this.newTabIndex === 0) {
        this.$store.commit("auth/cleanLogin");
      } else if (this.newTabIndex === 1) {
        this.$store.commit("auth/cleanForgotPassword");
      }
      this.forgotPasswordError = null;
      this.forgotPasswordSuccess = null;
      this.loginError = null;
      this.newTabIndex = 0;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/login-master.scss";
</style>
