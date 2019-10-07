<template lang="html">
  <b-card class="signup-view">
    <b-form @submit="onSignup" @reset="onReset">
      <signup-form>
        <b-row align-h="center" class="signup-actions">
          <b-col sm="12" md="12" lg="12" xl="12">
            <b-button id="signup-button" type="submit" variant="primary">
              <fa-icon v-if="loading" icon="spinner" :transform="{ rotate: 42 }" size="lg" />
              Signup
            </b-button>
          </b-col>
        </b-row>
      </signup-form>
    </b-form>
    <b-alert v-if="error" :show="error !== null" variant="warning">
      {{ error.message }}
      <b-button
        v-if="error.code && error.code === 'NOT_VERIFIED'"
        class="btn btn-warning"
        size="sm"
        @click="sendVerifyMail"
      >
        <small>
          Send confirmation link
        </small>
      </b-button>
    </b-alert>
    <b-alert v-if="success" :show="success !== null" variant="success">
      {{ success.message }}
      <b-button class="btn btn-success" size="sm" @click="onYes">
        <small>
          Yes
        </small>
      </b-button>
      <b-button class="btn btn-warning" size="sm" @click="onNo">
        <small>
          No
        </small>
      </b-button>
    </b-alert>
  </b-card>
</template>

<script type="text/javascript">
import { BAlert, BButton, BForm, BCard } from 'bootstrap-vue';
import SignupForm from '@/components/Account/SignupForm.vue';
import notification from '@/views/mixins/notification';

export default {
  name: 'Signup',

  components: {
    'b-alert': BAlert,
    'b-button': BButton,
    'b-card': BCard,
    'b-form': BForm,
    'signup-form': SignupForm,
  },

  mixins: [notification],

  props: {
    sessionError: {
      type: Error,
      default: null,
    },
  },

  data() {
    return {
      coinHiveVerification: false,
      confirmPassword: '',
      captchaBody: null,
      signedUp: false,
      show: true,
      error: null,
      loading: false,
      success: null,
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
    verified: {
      get() {
        return this.$store.state.auth.verified;
      },
      set(value) {
        this.$store.commit('auth/setVerifiedAddress', value);
      },
    },
  },

  watch: {
    sessionError: {
      handler(err) {
        this.error = err;
      },
      immediate: true,
    },
  },

  methods: {
    async onSignup(evt) {
      this.error = null;
      this.success = null;
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      try {
        if (
          this.$store.state.auth.signup.password !== this.$store.state.auth.signup.confirmPassword
        ) {
          this.error = {
            message: "Your password don't match",
          };
          return;
        }

        this.loading = true;
        const firstName = this.$store.state.auth.signup.firstName;
        const lastName = this.$store.state.auth.signup.lastName;
        const account = await this.$store.dispatch(`auth/signUp`, {
          email: this.$store.state.auth.signup.email,
          password: this.$store.state.auth.signup.password,
          firstName,
          lastName,
          // fullName: `${firstName} ${lastName}`,
        });
        if (account.id) {
          this.account = account;
          this.success = {
            message: 'A confirmation link has been sent, have you received it ?',
          };
          //  this.$store.commit('auth/setAccount', account);
          this.loading = false;
          return this.success;
        }
        throw new Error('Sorry there was an error while creating your account');
      } catch (error) {
        this.loading = false;
        this.error = error;
        throw error;
      }
    },

    onReset(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      // this.$store.commit('auth/setAccountType', '');
      this.error = null;
      this.loading = false;
      this.success = null;
      /* Trick to reset/clear native browser form validation state */
      // this.show = false;
      // this.$nextTick(() => {
      //   this.show = true;
      // });
    },

    onYes(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.onReset();
      this.$router.push({ name: 'home' });
    },

    async onNo(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      //  this.success = null;
      const result = await this.$store.dispatch('auth/verifyEmail', {
        user: this.account,
      });
      if (result) {
        this.success = {
          message: 'A new confirmation link has been sent, have you received it ?',
        };
        this.error = null;
        return this.success;
      }
      this.success = null;
      this.error = {
        code: 'NOT_VERIFIED',
        message: "Sorry we can't find your email address in our database",
      };
      return this.error;
      // todo : ajouter un compteur de no -> à 2 refaire l'inscription et cacher la modal
    },

    async sendVerifyMail() {
      try {
        const result = await this.$store.dispatch(
          'auth/findAccountByEmail',
          this.$store.state.auth.signup.email,
        );
        if (result) {
          this.success = {
            message: 'A new confirmation link has been sent, have you received it ?',
          };
          this.error = null;
          return this.success;
        }
        this.success = null;
        this.error = {
          code: 'NOT_VERIFIED',
          message: "Sorry we can't find your email address in our database",
        };
        return this.error;
      } catch (error) {
        this.success = null;
        this.error = error;
        return this.error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/signup.scss';
</style>
