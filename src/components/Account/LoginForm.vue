<template lang="html">
  <b-form ref="form" class="login-form-view" @submit.prevent="onLogin">
    <b-form-input
      id="login-email"
      ref="login-email"
      v-model="email"
      type="email"
      autocomplete="email"
      placeholder="Email address"
      required
    />
    <b-form-input
      id="login-password"
      ref="login-password"
      v-model="password"
      type="password"
      autocomplete="current-password"
      placeholder="Your password"
      required
      plain
      @keypress.native.enter="onLogin"
    />
    <label class="container">
      <small class="label-title">
        Remember me
      </small>
      <input v-model="rememberMe" type="checkbox" checked="checked" />
      <span class="checkmark" />
    </label>
  </b-form>
</template>

<script type="text/javascript">
import { BForm } from 'bootstrap-vue';
import { BFormInput } from 'bootstrap-vue';

export default {
  name: 'LoginForm',

  components: {
    'b-form': BForm,
    'b-form-input': BFormInput,
  },

  // props: {
  //   sessionError: {
  //     type: Error,
  //     default: null,
  //   },
  // },

  data() {
    return {
      show: true,
      dismissSecs: 4,
      dismissCountDown: 0,
    };
  },

  computed: {
    email: {
      get() {
        return this.$store.state.auth.login.email;
      },
      set(value) {
        this.$store.commit('auth/setLoginKV', {
          key: 'email',
          value,
        });
      },
    },
    password: {
      get() {
        return this.$store.state.auth.login.password;
      },
      set(value) {
        this.$store.commit('auth/setLoginKV', {
          key: 'password',
          value,
        });
      },
    },
    loading: {
      get() {
        return this.$store.state.auth.login.loading;
      },
      set(value) {
        this.$store.commit('auth/setLoginKV', {
          key: 'loading',
          value,
        });
      },
    },
    error: {
      get() {
        return this.$store.state.auth.login.error;
      },
      set(value) {
        this.$store.commit('auth/setLoginKV', {
          key: 'error',
          value,
        });
      },
    },
    rememberMe: {
      get() {
        return this.$store.state.auth.login.save;
      },
      set(value) {
        this.$store.commit('auth/setLoginKV', {
          key: 'save',
          value,
        });
      },
    },
  },

  mounted() {
    //  this.$refs.email.focus();
  },

  methods: {
    async onLogin(evt) {
      this.loading = true;
      this.error = null;
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();

      try {
        const accessToken = await this.$store.dispatch('auth/signIn', {
          email: this.email,
          password: this.password,
          save: this.save,
        });
        this.loading = false;
        if (accessToken && accessToken.id) {
          return this.$router.push({
            name: 'account',
            query: {
              'access-token': accessToken.id,
              'user-id': accessToken.userId,
            },
          });
        }
        const error = new Error('Your password seems incorrect');
        throw error;
      } catch (error) {
        this.loading = false;
        this.errorCounter += 1;
        if (error.details && error.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED') {
          this.error = {
            code: 'NOT_VERIFIED',
            message: 'Have you received confirmation link ?',
          };
        } else {
          this.error = error;
        }
        throw error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/login-form.scss';
</style>
