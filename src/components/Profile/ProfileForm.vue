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
            :disabled="!account.subscribed.startsWith('paid')"
            class="profile-inline-button"
            @click="$refs.teamPopup.showModal(receiver, isMember, memberId)"
          >
            <img
              v-if="!account.subscribed.startsWith('paid')"
              :src="$store.state.style.pictures.teamAlt"
            />
            <img
              v-else-if="account.subscribed.startsWith('paid') && isMember"
              :src="$store.state.style.pictures.team"
            />
            <img
              v-else-if="account.subscribed.startsWith('paid') && !isMember"
              :src="$store.state.style.pictures.teamOff"
            />
          </b-button>
          <b-button
            :disabled="!account.subscribed.startsWith('paid')"
            class="profile-messenger"
            @click="sendMessage"
          >
            <img
              v-if="!account.subscribed.startsWith('paid')"
              :src="$store.state.style.pictures.messageAlt"
            />
            <img
              v-else-if="account.subscribed.startsWith('paid')"
              :src="$store.state.style.pictures.message"
            />
          </b-button>
        </b-col>
      </b-row>
    </b-form>
    <address-form
      :is-viewer="viewer"
      :edit-mode="editorMode"
      :owner-id="updatedAccount.id"
      class="address-form"
    />
    <change-password />

    <team-popup
      v-if="viewer && account.subscribed.startsWith('paid')"
      ref="teamPopup"
      :account-type="account.type"
    />
  </div>
</template>

<script type="text/javascript">
import bButton from 'bootstrap-vue/es/components/button/button';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import AddressForm from '@/components/Address/AddressForm.vue';
import ChangePassword from '@/components/Account/ChangePassword.vue';

import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'ProfileForm',

  components: {
    'b-button': bButton,
    'b-form': bForm,
    'b-form-input': bFormInput,
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
    sender: {
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

  mounted() {
    this.editorMode = false;
    this.loadTeams();
    this.isTeamMember(this.favorites);
  },

  beforeDestroy() {
    this.removeListeners();
  },

  methods: {
    setListeners() {
      EventBus.$on('onTeamDeleted', async team => {
        if (team && this.loaderCounter < 1) {
          this.loaderCounter += 1;
          return setTimeout(async () => {
            await this.loadTeams();
            this.isTeamMember(this.teams);
          }, 200);
        }
      });

      EventBus.$on('onTeamCreated', team => {
        if (team && this.loaderCounter < 1) {
          this.loaderCounter += 1;
          return setTimeout(async () => {
            await this.loadTeams();
            this.isTeamMember(this.teams);
          }, 200);
        }
      });
    },

    removeListeners() {
      EventBus.$off('onTeamCreated');
      EventBus.$off('onTeamDeleted');
    },

    async loadTeams() {
      this.error = null;
      this.success = null;
      return this.$store
        .dispatch('team/loadTeams', this.sender.id)
        .then(res => {
          this.loaderCounter = 0;
          return res;
        })
        .catch(err => {
          this.loaderCounter = 0;
          this.error = err;
          return this.error;
        });
      //  return favorites;
    },

    isTeamMember(teams) {
      if (this.viewer && teams) {
        const foundFavorite = this.teams.find(team => team.memberId === this.profile.id);
        if (foundFavorite) {
          logger.publish(4, 'profile', 'isTeamMember:res', true);
          this.memberId = foundFavorite.id;
          this.isMember = true;
          return;
        }
      }
      logger.publish(4, 'profile', 'isTeamMember:res', false);
      this.isMember = false;
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

    sendMessage(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.$refs.messagePopup.showModal(this.receiver, this.sender, '', 'greet');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-form.scss';
</style>
