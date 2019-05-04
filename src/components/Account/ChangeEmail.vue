<template lang="html">
  <b-form class="change-email-view" @submit="onSubmit">
    <b-form-group label="Email" label-for="change-email">
      <b-form-input
        id="change-email"
        v-model="email"
        :placeholder="email"
        size="md"
        type="email"
        autocomplete="email"
        aria-describedby="emailHelp"
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
</template>

<script type="text/javascript">
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

export default {
  name: 'ChangeEmail',

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
      error: null,
      loading: false,
    };
  },

  computed: {
    email: {
      get() {
        return this.$store.state.auth.account.email;
      },
      set(value) {
        this.$store.commit('auth/setEmail', value);
      },
    },
  },

  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.loading = true;
      this.error = null;

      this.$store
        .dispatch('auth/changeEmail', {
          email: this.email,
          // eslint-disable-next-line camelcase
          access_token: this.access_token,
        })
        .then(() => {
          this.loading = false;
          this.success = { message: 'Addresse email mise à jour' };
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
