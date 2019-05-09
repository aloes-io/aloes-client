<template lang="html">
  <div class="reset-password-view">
    <b-card size="sm">
      <div class="logo">
        <router-link :to="{ name: 'home' }">
          <img :src="$store.state.style.pictures.logo" />
        </router-link>
      </div>
      <b-form @submit="onSubmit">
        <div class="form-group">
          <input
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            class="form-control"
            placeholder="Nouveau mot de passe"
            required
          />
        </div>
        <div class="form-group">
          <input
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="form-control"
            placeholder="Confirmation mot de passe"
            required
          />
        </div>
        <b-button type="submit" class="reset-pass">
          <fa-icon v-if="loading" icon="spinner" :transform="{ rotate: 42 }" size="lg" />
          <fa-icon v-else icon="check" size="lg" />
          Confirm
        </b-button>
        <b-alert v-if="error" :show="error !== null" variant="warning">
          {{ error.message }}
        </b-alert>
        <b-alert v-if="success" :show="success !== null" variant="success">
          {{ success.message }}
          <b-button class="go-back" size="sm" @click="goHome">
            Signin
          </b-button>
        </b-alert>
      </b-form>
    </b-card>
    <footer-container />
  </div>
</template>

<script type="text/javascript">
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';
import bForm from 'bootstrap-vue/es/components/form/form';
import FooterContainer from '@/views/containers/FooterContainer.vue';

export default {
  name: 'ResetPassword',

  components: {
    'b-alert': bAlert,
    'b-button': bButton,
    'b-card': bCard,
    'b-form': bForm,
    'footer-container': FooterContainer,
  },

  props: {
    'user-id': {
      type: String,
      default: null,
    },
    'access-token': {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      newPassword: null,
      confirmPassword: null,
      error: null,
      loading: false,
      success: null,
    };
  },

  mounted() {},

  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.loading = true;
      this.error = null;
      this.success = null;

      if (this.newPassword !== this.confirmPassword) {
        this.loading = false;
        this.error = new Error('Les mots de passe ne correspondent pas');
        return;
      }
      const accessToken = {
        id: this.$props.accessToken,
        userId: this.$props.userId,
      };
      this.$store
        .dispatch('auth/updatePasswordFromToken', {
          accessToken,
          newPassword: this.newPassword,
        })
        .then(() => {
          this.loading = false;
          this.success = { message: 'Le mot de passe a été mis à jour' };
        })
        .catch(err => {
          this.error = err;
          this.loading = false;
        });
    },

    goHome() {
      this.$router.push({ name: 'login' });
      //  this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../style/reset-password.scss';
</style>
