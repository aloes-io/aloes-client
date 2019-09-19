<template lang="html">
  <div class="profile-form-view">
    <b-form class="profile-form">
      <b-row class="profile-header-title">
        <b-col cols="6" sm="6" md="5" lg="4" xl="4">
          <b-form-input
            id="first-name"
            v-model="firstName"
            :invalid-feedback="invalidFirstName"
            :valid-feedback="validFirstName"
            :state="firstNameState"
            :plaintext="!editorMode"
            :disabled="!editorMode"
            type="text"
            size="sm"
            autocomplete="username"
          />
        </b-col>
        <b-col cols="6" sm="6" md="5" lg="4" xl="4">
          <b-form-input
            id="last-name"
            v-model="lastName"
            :invalid-feedback="invalidLastName"
            :valid-feedback="validLastName"
            :state="lastNameState"
            :plaintext="!editorMode"
            :disabled="!editorMode"
            type="text"
            size="sm"
            autocomplete="username"
          />
        </b-col>
        <b-col
          v-if="!viewer && !editorMode"
          cols="2"
          sm="2"
          md="2"
          lg="2"
          xl="1"
          offset-lg="2"
          offset-xl="3"
        >
          <b-button class="profile-messenger" @click="toggleEditMode">
            <img :src="$store.state.style.pictures.pencilSquare" />
          </b-button>
        </b-col>
        <b-col
          v-if="viewer && !editorMode"
          cols="4"
          sm="2"
          md="2"
          xl="2"
          offset-lg="2"
          offset-xl="2"
          class="profile-team"
        >
          <b-button
            :disabled="!account.role.startsWith('admin')"
            class="profile-inline-button"
            @click="$refs.teamPopup.showModal(receiver, isMember, memberId)"
          >
            <img
              v-if="!account.role.startsWith('admin')"
              :src="$store.state.style.pictures.teamAlt"
            />
            <img
              v-else-if="account.role.startsWith('admin') && isMember"
              :src="$store.state.style.pictures.team"
            />
            <img
              v-else-if="account.role.startsWith('admin') && !isMember"
              :src="$store.state.style.pictures.teamOff"
            />
          </b-button>
          <b-button
            :disabled="!account.role.startsWith('admin')"
            class="profile-messenger"
            @click="sendMessage"
          >
            <img
              v-if="!account.role.startsWith('admin')"
              :src="$store.state.style.pictures.messageAlt"
            />
            <img
              v-else-if="account.role.startsWith('admin')"
              :src="$store.state.style.pictures.message"
            />
          </b-button>
        </b-col>
      </b-row>
    </b-form>
    <b-row v-if="!viewer" class="profile-header-title">
      <b-col cols="12" sm="8" md="7" lg="6" xl="6">
        <b-form-input
          id="change-email"
          v-model="email"
          :plaintext="!editorMode"
          :disabled="!editorMode"
          size="sm"
          type="email"
          autocomplete="email"
          aria-describedby="emailHelp"
          required
        />
      </b-col>
    </b-row>
    <br />
    <address-form
      :is-viewer="viewer"
      :edit-mode="editorMode"
      :owner-id="updatedAccount.id"
      owner-type="user"
      class="address-form"
    />
    <b-button v-show="editorMode" class="save-profile" @click="saveProfile">
      <fa-icon icon="check" size="lg" />
      UPDATE PROFILE
    </b-button>
    <br />
    <br />
    <change-password :is-viewer="viewer" :edit-mode="editorMode" />

    <team-popup v-if="viewer" ref="teamPopup" :account-type="account.type" />
  </div>
</template>

<script type="text/javascript">
import { BButton } from 'bootstrap-vue';
import { BForm } from 'bootstrap-vue';
import { BFormInput } from 'bootstrap-vue';
import AddressForm from '@/components/Address/AddressForm.vue';
import ChangePassword from '@/components/Account/ChangePassword.vue';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'ProfileForm',

  components: {
    'b-button': BButton,
    'b-form': BForm,
    'b-form-input': BFormInput,
    'address-form': AddressForm,
    'change-password': ChangePassword,
    'team-popup': () => import('@/views/containers/TeamPopup.vue'),
  },

  props: {
    account: {
      type: Object,
      default: null,
    },
    'profile-id': {
      type: [Number, String],
      default: null,
    },
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
      error: null,
      succes: null,
      loading: null,
      viewer: true,
      updatedStatus: null,
      updatedAccount: null,
      isMember: null,
      memberId: null,
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
    description: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.model.description;
        }
        return this.$store.state.auth.account.description;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'description',
          value,
        });
      },
    },
    email: {
      get() {
        return this.$store.state.auth.account.email;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'email',
          value,
        });
      },
    },
    firstName: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.model.firstName;
        }
        return this.$store.state.auth.account.firstName;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'firstName',
          value,
        });
      },
    },
    firstNameState() {
      return this.firstName.length >= 4;
    },
    invalidFirstName() {
      if (this.firstName.length > 4) {
        return '';
      } else if (this.firstName.length > 0) {
        return 'Enter at least 4 characters';
      }
      return 'Please enter something';
    },
    validFirstName() {
      return this.firstNameState === true ? 'Thank you' : '';
    },

    lastName: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.model.lastName;
        }
        return this.$store.state.auth.account.lastName;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'lastName',
          value,
        });
      },
    },
    lastNameState() {
      return this.lastName.length >= 4;
    },
    invalidLastName() {
      if (this.lastName.length > 4) {
        return '';
      } else if (this.lastName.length > 0) {
        return 'Enter at least 4 characters';
      }
      return 'Please enter something';
    },
    validLastName() {
      return this.lastNameState === true ? 'Thank you' : '';
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
    status: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.status;
        }
        return this.$store.state.auth.account.status;
      },
    },
    teams: {
      get() {
        return this.$store.state.teams.collection;
      },
    },
    profile: {
      get() {
        return this.$store.state.auth.account;
      },
    },
    receiver: {
      get() {
        return this.$store.state.auth.viewed;
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
    status: {
      handler(status) {
        this.updatedStatus = status;
      },
      immediate: true,
    },
    account: {
      handler(account) {
        this.updatedAccount = account;
      },
      immediate: true,
    },
  },

  created() {
    this.setListeners();
  },

  async mounted() {
    try {
      this.editorMode = false;
      await this.loadTeams();
      return this.isTeamMember(this.favorites);
    } catch (error) {
      throw error;
    }
  },

  beforeDestroy() {
    this.removeListeners();
  },

  methods: {
    async loadTeams() {
      try {
        this.error = null;
        this.success = null;
        const members = await this.$store.dispatch('team/loadTeams', this.profile.id);
        this.loaderCounter = 0;
        return members;
      } catch (error) {
        this.error = error;
        this.loaderCounter = 0;
        throw error;
      }
    },

    isTeamMember(teams) {
      if (this.viewer && teams) {
        const foundFavorite = this.teams.find(team => team.memberId === this.profile.id);
        if (foundFavorite) {
          logger.publish(4, 'profile', 'isTeamMember:res', true);
          this.memberId = foundFavorite.id;
          this.isMember = true;
          return true;
        }
      }
      logger.publish(4, 'profile', 'isTeamMember:res', false);
      this.isMember = false;
      return false;
    },

    async onTeamCreated(team) {
      try {
        if (team && this.loaderCounter < 1) {
          this.loaderCounter += 1;
          await this.loadTeams();
          this.isTeamMember(this.teams);
        }
        return;
      } catch (error) {
        throw error;
      }
    },

    async onTeamDeleted(team) {
      try {
        if (team && this.loaderCounter < 1) {
          this.loaderCounter += 1;
          await this.loadTeams();
          this.isTeamMember(this.teams);
        }
        return;
      } catch (error) {
        throw error;
      }
    },

    setListeners() {
      EventBus.$on('onTeamDeleted', this.onTeamDeleted);
      EventBus.$on('onTeamCreated', this.onTeamCreated);
    },

    removeListeners() {
      EventBus.$off('onTeamCreated');
      EventBus.$off('onTeamDeleted');
    },

    toggleEditMode(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      if (!this.editorMode) {
        this.editorMode = true;
        //  this.scrollUp();
      } else if (this.editorMode) {
        this.editorMode = false;
      }
      logger.publish(4, 'profile', 'toggleEditMode:res', this.editorMode);
    },

    async saveProfile(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      try {
        this.fullName = `${this.firstName} ${this.lastName}`;
        this.profile.username = this.email;
        const profile = await this.$store.dispatch('auth/updateAccount', this.profile);

        if (profile.id) {
          this.loading = false;
          this.success = { message: 'Profile updated' };
          this.editorMode = false;
          window.scrollTo(0, 100);
          return this.success;
        }
        logger.publish(4, 'Profile', 'saveProfile:err', profile);
        return null;
      } catch (error) {
        logger.publish(3, 'Profile', 'saveProfile:err', error);
        throw error;
      }
    },

    sendMessage(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.$refs.messagePopup.showModal(this.receiver, this.profile, '', 'greet');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-form.scss';
</style>
