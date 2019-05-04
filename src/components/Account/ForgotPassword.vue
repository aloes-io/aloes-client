<template lang="html">
  <b-form ref="form" class="forgot-form-view" @submit.prevent="sendRecoverEmail">
    <b-form-group
      id="reset-password-group"
      label="Entrez l'adresse email de votre compte"
      label-for="reset-password"
    >
      <b-form-input
        id="reset-password"
        ref="reset-email"
        v-model="email"
        required
        autocomplete="email"
        type="email"
        size="sm"
        plain
        placeholder="Votre addresse email"
        @keydown.enter="sendRecoverEmail"
      />
    </b-form-group>
  </b-form>
</template>

<script type="text/javascript">
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

export default {
  name: 'ForgotPassword',

  components: {
    'b-form': bForm,
    'b-form-group': bFormGroup,
    'b-form-input': bFormInput,
  },

  data() {
    return {};
  },

  computed: {
    loading: {
      get() {
        return this.$store.state.auth.forgotPassword.loading;
      },
      set(value) {
        this.$store.commit('auth/setForgotPasswordKV', {
          key: 'loading',
          value,
        });
      },
    },
    error: {
      get() {
        return this.$store.state.auth.forgotPassword.error;
      },
      set(value) {
        this.$store.commit('auth/setForgotPasswordKV', {
          key: 'error',
          value,
        });
      },
    },
    success: {
      get() {
        return this.$store.state.auth.forgotPassword.success;
      },
      set(value) {
        this.$store.commit('auth/setForgotPasswordKV', {
          key: 'success',
          value,
        });
      },
    },
    email: {
      get() {
        return this.$store.state.auth.forgotPassword.email;
      },
      set(value) {
        this.$store.commit('auth/setForgotPasswordKV', {
          key: 'email',
          value,
        });
      },
    },
  },

  mounted() {},

  methods: {
    async sendRecoverEmail(evt) {
      //  const form = this.$refs.form;
      this.error = null;
      this.success = null;
      //  if (form.checkValidity()) {
      this.loading = true;
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      return this.$store
        .dispatch('auth/rememberPassword', this.email)
        .then(() => {
          this.loading = false;
          this.success = {
            message: 'Un mail pour créer un nouveau mot de passe a été envoyé',
          };
          return this.success;
        })
        .catch(err => {
          if (err.details && err.code === 'EMAIL_NOT_FOUND') {
            this.error = {
              code: err.code,
              message: 'Addresse email introuvable',
            };
          } else {
            this.error = err;
          }
          this.loading = false;
          return this.error;
          //  console.log('error sending mail', err);
        });
      // } else {
      //   this.loading = false;
      //   this.error = {
      //     message: 'Veuillez introduire votre addresse email',
      //   };
      //   return this.error;
      // }
      //  return null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/forgot-password.scss';
</style>
