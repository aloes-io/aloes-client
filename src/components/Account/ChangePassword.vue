<template lang="html">
  <div class="change-password-view">
    <b-form @submit="onSubmit">
      <b-form-group
        v-if="access_token === null"
        label="Current password"
        label-for="changed-password"
        label-cols="3"
        label-size="sm"
        breakpoint="sm"
      >
        <b-form-input
          id="changed-password"
          v-model="password"
          size="md"
          type="password"
          autocomplete="current-password"
          required
        />
      </b-form-group>
      <b-form-group
        label="New password"
        label-for="new-password"
        label-cols="3"
        label-size="sm"
        breakpoint="sm"
      >
        <b-form-input
          id="new-password"
          v-model="newPassword"
          size="md"
          type="password"
          autocomplete="new-password"
          required
        />
      </b-form-group>
      <b-form-group
        label="Confirm password"
        label-for="confirm-new-password"
        label-cols="3"
        label-size="sm"
        breakpoint="sm"
      >
        <b-form-input
          id="confirm-new-password"
          v-model="confirmPassword"
          size="md"
          type="password"
          autocomplete="new-password"
          required
        />
      </b-form-group>
      <b-alert v-if="error" vairant="danger">
        {{ error.message }}
      </b-alert>
      <b-alert v-if="success" vairant="success">
        {{ success.message }}
      </b-alert>
      <b-button type="submit" variant="success">
        <i v-if="loading" class="fa fa-spinner" />
        <i v-else class="fa fa-check" />
        SAVE
      </b-button>
    </b-form>
  </div>
</template>

<script type="text/javascript">
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

export default {
  name: 'ChangePassword',

  components: {
    'b-alert': bAlert,
    'b-button': bButton,
    'b-form': bForm,
    'b-form-group': bFormGroup,
    'b-form-input': bFormInput,
  },

  props: {
    // eslint-disable-next-line camelcase
    access_token: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      password: null,
      newPassword: null,
      confirmPassword: null,
      error: null,
      success: null,
      loading: false,
    };
  },

  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.loading = true;
      this.error = null;

      if (this.newPassword !== this.confirmPassword) {
        this.loading = false;
        this.error = new Error('The password does not match, please try again');
        return;
      }

      this.$store
        .dispatch('auth/changePassword', {
          oldPassword: this.password,
          newPassword: this.newPassword,
          // eslint-disable-next-line camelcase
          access_token: this.access_token,
        })
        .then(() => {
          this.loading = false;
          this.success = { message: 'Password updated' };
        })
        .catch(err => {
          this.error = err;
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/change-password.scss';
</style>
