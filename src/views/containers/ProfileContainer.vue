<template lang="html">
  <b-container v-show="profile" v-if="profile !== null" fluid class="profile-container-view">
    <profile-header
      :is-viewer="viewer"
      :account="account"
      :profile="profile"
      :profile-type="updatedProfileType"
      :profile-id="updatedProfileId"
    />
    <br />
    <!-- <profile-description
      :is-viewer="viewer"
      :edit-mode="editMode"
      class="account-profile"
    /> -->
    <br />
    <b-row align-h="center">
      <b-col v-if="!viewer && editorMode" sm="3">
        <b-button class="save-profile" @click="saveProfile">
          <i class="fa fa-check " />
          Enregistrer
        </b-button>
      </b-col>
    </b-row>
    <br />

    <!-- todo : wrap this in a modal and a editor mode message -->

    <b-row v-if="!viewer && editorMode" align-h="center">
      <b-col sm="8">
        <b-alert v-if="error" :show="error !== null" variant="warning">
          {{ error.message }}
        </b-alert>
        <b-alert v-if="success" :show="success !== null" variant="success">
          {{ success.message }}
        </b-alert>
      </b-col>
    </b-row>
  </b-container>
</template>

<script type="text/javascript">
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import ProfileHeader from '@/components/Profile/ProfileHeader.vue';
//  import ProfileDescription from '@/components/Profile/ProfileDescription.vue';
import logger from '@/services/logger';

export default {
  name: 'ProfileContainer',

  components: {
    'b-alert': bAlert,
    'b-button': bButton,
    'profile-header': ProfileHeader,
    // 'profile-description': ProfileDescription,
  },

  props: {
    account: {
      type: Object,
      default: null,
    },
    token: {
      type: String,
      default: '',
    },
    'profile-type': {
      type: String,
      required: true,
    },
    'profile-id': {
      type: [Number, String],
      default: '',
    },
    'is-viewer': {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      error: null,
      success: null,
      viewer: true,
      editMode: false,
      updatedProfileType: null,
      updatedProfileId: null,
    };
  },

  computed: {
    profile: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed;
        }
        return this.$store.state.auth.account;
      },
    },
    accountId: {
      get() {
        return this.$props.account.id.toString();
      },
    },
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
    verifiedAddress: {
      get() {
        return this.$store.state.auth.verifiedAddress;
      },
      set(value) {
        this.$store.commit('auth/setVerifiedAddress', value);
      },
    },
    status: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.status;
        }
        return this.$store.state.auth.account.status;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'status',
          value,
        });
      },
    },
    firstName: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.firstName;
        }
        return this.$store.state.auth.account.firstName;
      },
    },
    lastName: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.lastName;
        }
        return this.$store.state.auth.account.lastName;
      },
    },
    fullName: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.fullName;
        }
        return this.$store.state.auth.account.fullName;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'fullName',
          value,
        });
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
    editorMode: {
      handler(state) {
        this.editMode = state;
      },
      immediate: true,
    },
    profileType: {
      handler(type) {
        this.updatedProfileType = type;
      },
      immediate: true,
    },
    profileId: {
      handler(id) {
        this.updatedProfileId = id;
      },
      immediate: true,
    },
  },

  created() {
    this.checkProfile();
  },

  mounted() {},

  updated() {
    //  this.checkProfile();
  },

  methods: {
    async loadFavoriteProfiles() {
      this.error = null;
      this.success = null;
      const favorites = await this.$store
        .dispatch('teams/loadTeams', this.updatedProfileId)
        .then(res => res)
        .catch(err => {
          this.error = err;
          return this.error;
        });
      return favorites;
    },

    async checkProfile() {
      this.error = null;
      this.success = null;
      const result = await this.$store
        .dispatch('auth/findAccountById', {
          userId: this.updatedProfileId,
          viewer: this.viewer,
        })
        .catch(err => {
          logger.publish(3, this.$props.profileType, 'checkProfile:err', err);
          this.error = {
            message: 'Désolé, il semblerait que nous avons un problème pour afficher ce profil',
          };
          return setTimeout(() => {
            this.$router.go(-1);
          }, 1000);
        });
      logger.publish(3, this.updatedProfileType, 'checkProfile:res', result);

      if (result.id === this.$store.state.auth.account.id) {
        logger.publish(3, this.$props.profileType, 'checkProfile:res', {
          viewer: this.isViewer,
          editMode: this.editMode,
        });
        //  return this.loadFavoriteProfiles();
        return null;
      }
      logger.publish(3, this.$props.profileType, 'checkProfile:res', {
        viewer: this.isViewer,
        editMode: this.editMode,
      });
      return null;
    },

    scrollUp() {
      window.scrollTo(0, 100);
    },

    async saveProfile(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      try {
        this.fullName = `${this.firstName} ${this.lastName}`;
        const profile = await this.$store.dispatch('auth/updateAccount', this.profile);

        if (profile.id) {
          this.loading = false;
          this.success = { message: 'Modifications du profil enregistré' };
          this.editorMode = false;
          await this.scrollUp();
          return this.success;
        }
        logger.publish(4, this.updatedProfileType, 'saveProfile:err', profile);
        return null;
      } catch (error) {
        logger.publish(3, this.updatedProfileType, 'saveProfile:err', error);
        throw error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-container.scss';
</style>
