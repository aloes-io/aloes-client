<template lang="html">
  <b-container v-show="profile" v-if="profile !== null" fluid class="profile-container-view">
    <profile-header
      :is-viewer="viewer"
      :account="account"
      :profile="profile"
      :profile-type="updatedProfileRole"
      :profile-id="updatedProfileId"
    />
    <br />
    <!-- <profile-description
      :is-viewer="viewer"
      :edit-mode="editMode"
      class="account-profile"
    /> 
    <br />-->

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
import { BAlert } from 'bootstrap-vue';
import ProfileHeader from '@/components/Profile/ProfileHeader.vue';
//  import ProfileDescription from '@/components/Profile/ProfileDescription.vue';
import logger from '@/services/logger';

export default {
  name: 'ProfileContainer',

  components: {
    'b-alert': BAlert,
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
    'profile-role': {
      type: String,
      required: false,
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
      updatedProfileRole: null,
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
    profileRole: {
      handler(type) {
        this.updatedProfileRole = type;
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

  mounted() {
    // this.checkProfile();
  },

  updated() {
    //  this.checkProfile();
  },

  methods: {
    async loadFavoriteProfiles() {
      try {
        this.error = null;
        this.success = null;
        const members = await this.$store.cache.dispatch('teams/loadTeams', this.updatedProfileId);
        // if (members && members.length <1)
        return members;
      } catch (error) {
        this.error = error;
        throw error;
      }
    },

    async checkProfile() {
      try {
        this.error = null;
        this.success = null;
        const result = await this.$store.cache.dispatch('auth/findAccountById', {
          userId: this.updatedProfileId,
          viewer: this.viewer,
        });

        logger.publish(3, this.updatedProfileRole, 'checkProfile:res', result);

        if (result.id === this.$store.state.auth.account.id) {
          logger.publish(3, this.updatedProfileRole, 'checkProfile:res', {
            viewer: this.isViewer,
            editMode: this.editMode,
          });
          //  return this.loadFavoriteProfiles();
          return null;
        }
        logger.publish(3, this.updatedProfileRole, 'checkProfile:res', {
          viewer: this.isViewer,
          editMode: this.editMode,
        });
        return null;
      } catch (error) {
        this.error = error;
        logger.publish(3, this.updatedProfileRole, 'checkProfile:err', error);
        setTimeout(() => {
          this.$router.go(-1);
        }, 1000);
        throw error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-container.scss';
</style>
