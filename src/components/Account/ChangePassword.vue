<template lang="html">
  <div class="change-password-view">
    <b-form @submit="onSubmit">
      <b-form-group
        label="Current password"
        label-for="changed-password"
        label-cols="3"
        label-size="sm"
        breakpoint="sm"
      >
        <b-form-input
          id="changed-password"
          v-model="password"
          :plaintext="!editorMode"
          :disabled="!editorMode"
          size="sm"
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
          :plaintext="!editorMode"
          :disabled="!editorMode"
          size="sm"
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
          :plaintext="!editorMode"
          :disabled="!editorMode"
          size="sm"
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
      <b-button v-show="editorMode" type="submit" variant="success">
        <fa-icon v-if="loading" icon="spinner" :transform="{ rotate: 42 }" size="lg" />
        <fa-icon v-else icon="check" size="lg" />
        Update password
      </b-button>
    </b-form>
  </div>
</template>

<script type="text/javascript">
import { BAlert } from 'bootstrap-vue';
import { BButton } from 'bootstrap-vue';
import { BForm } from 'bootstrap-vue';
import { BFormInput } from 'bootstrap-vue';
import { BFormGroup } from 'bootstrap-vue';

export default {
  name: 'ChangePassword',

  components: {
    'b-alert': BAlert,
    'b-button': BButton,
    'b-form': BForm,
    'b-form-group': BFormGroup,
    'b-form-input': BFormInput,
  },

  props: {
    'is-viewer': {
      type: Boolean,
      default: true,
    },
    'edit-mode': {
      type: Boolean,
      default: false,
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
      viewer: true,
    };
  },

  computed: {
    editorMode: {
      get() {
        if (this.viewer) {
          return null;
        }
        return this.$store.state.auth.editorMode;
      },
      set(value) {
        this.$store.commit('auth/setEditorMode', value);
      },
    },
  },

  watch: {
    isViewer: {
      handler(state) {
        this.viewer = state;
      },
      immediate: true,
    },
    // editMode: {
    //   handler(mode) {
    //     this.editorMode = mode;
    //   },
    //   immediate: true,
    // },
  },

  methods: {
    async onSubmit(evt) {
      evt.preventDefault();
      this.loading = true;
      this.error = null;

      try {
        if (this.newPassword !== this.confirmPassword) {
          throw new Error('The password does not match, please try again');
          //  this.error = new Error('The password does not match, please try again');
        }
        await this.$store.dispatch('auth/changePassword', {
          oldPassword: this.password,
          newPassword: this.newPassword,
        });
        this.loading = false;
        this.success = { message: 'Password updated' };
        return null;
      } catch (error) {
        this.error = error;
        this.loading = false;
        return error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/change-password.scss';
</style>
