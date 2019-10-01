<template lang="html">
  <div class="signup-form">
    <b-form-input
      id="account-first-name"
      v-model="firstName"
      size="sm"
      type="text"
      required
      placeholder="Entrer votre prénom"
    />
    <b-form-input
      id="account-last-name"
      v-model="lastName"
      size="sm"
      type="text"
      required
      placeholder="Entrer votre nom"
    />
    <b-form-input
      id="signup-email"
      v-model="email"
      type="email"
      autocomplete="email"
      size="sm"
      aria-describedby="emailHelp"
      required
      placeholder="Votre adresse email"
    />
    <b-form-input
      id="new-signup"
      v-model="password"
      type="password"
      autocomplete="new-password"
      size="sm"
      required
      placeholder="Insérer le nouveau mot de passe"
    />
    <b-form-input
      id="confirm-signup"
      v-model="confirmPassword"
      size="sm"
      type="password"
      autocomplete="new-password"
      required
      placeholder="Confirmer le mot de passe"
    />
    <slot>
      <p>Actions</p>
    </slot>
  </div>
</template>

<script type="text/javascript">
import { BFormInput } from 'bootstrap-vue';

export default {
  name: 'SignupForm',

  components: {
    'b-form-input': BFormInput,
  },

  data() {
    return {
      displaySignupForm: false,
      checked: [],
    };
  },

  computed: {
    firstName: {
      get() {
        return this.$store.state.auth.signup.firstName || '';
      },
      set(value) {
        this.$store.commit('auth/setCredentialsKV', {
          key: 'firstName',
          value,
        });
      },
    },

    lastName: {
      get() {
        return this.$store.state.auth.signup.lastName || '';
      },
      set(value) {
        this.$store.commit('auth/setCredentialsKV', {
          key: 'lastName',
          value,
        });
      },
    },

    email: {
      get() {
        return this.$store.state.auth.signup.email;
      },
      set(value) {
        this.$store.commit('auth/setCredentialsKV', {
          key: 'email',
          value,
        });
      },
    },

    password: {
      get() {
        return this.$store.state.auth.signup.password;
      },
      set(value) {
        this.$store.commit('auth/setCredentialsKV', {
          key: 'password',
          value,
        });
      },
    },
    confirmPassword: {
      get() {
        return this.$store.state.auth.signup.confirmPassword;
      },
      set(value) {
        this.$store.commit('auth/setCredentialsKV', {
          key: 'confirmPassword',
          value,
        });
      },
    },
    confirmPasswordState() {
      return this.confirmPassword.length > 5 && this.confirmPassword === this.password;
    },
    invalidConfirmPassword() {
      if (this.confirmPassword !== this.password && this.confirmPassword.length < 5) {
        return '';
      }
      return 'confirmation invalide';
    },
    validConfirmPassword() {
      return this.confirmPasswordState === true ? 'Thank you' : '';
    },
  },

  mounted() {
    this.onReset();
  },

  beforeDestroy() {
    this.onReset();
  },

  methods: {
    onReset() {
      this.$store.commit('auth/cleanSignup');
      this.displaySignupForm = false;

      /* Trick to reset/clear native browser form validation state */
      // this.show = false;
      // this.$nextTick(() => {
      //   this.show = true;
      // });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/signup-form.scss';
</style>
