<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-form ref="form" class="forgot-form-view" @submit.prevent="sendRecoverEmail">
    <b-form-group
      id="reset-password-group"
      label="Enter email address of your account"
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
        @keydown.enter="sendRecoverEmail"
      />
    </b-form-group>
  </b-form>
</template>

<script type="text/javascript">
import { BForm, BFormInput, BFormGroup } from 'bootstrap-vue';

export default {
  name: 'ForgotPassword',

  components: {
    'b-form': BForm,
    'b-form-group': BFormGroup,
    'b-form-input': BFormInput,
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
            message: 'A mail to create a new password has been sent',
          };
          return this.success;
        })
        .catch((err) => {
          if (err.details && err.code === 'EMAIL_NOT_FOUND') {
            this.error = {
              code: err.code,
              message: 'Email address not found',
            };
          } else {
            this.error = err;
          }
          this.loading = false;
          return err;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/forgot-password.scss';
</style>
