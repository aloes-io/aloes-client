<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-card
    v-show="updatedProfile"
    v-if="updatedProfile !== null"
    class="profile-inline-view"
    :disabled="!account.role === 'admin'"
    @mouseover="highlightProfile(updatedProfile)"
    @mouseleave="highlightProfile(null)"
  >
    <b-row>
      <b-col cols="12" sm="3">
        <img
          :src="updatedProfile.avatarImgUrl"
          class="profile-inline-avatar"
          @click="goToProfile"
        />
        <!--  <b-button
          :disabled="!accout.role === 'paid'"
          class="profile-inline-button"
          @click="goToProfile">
          Voir le profil
        </b-button> -->
      </b-col>
      <b-col cols="12" sm="9">
        <b-row class="profile-inline-row">
          <b-col class="profile-props" cols="10" sm="10">
            <h6 class="profile-inline-name">
              {{ updatedProfile.firstName }} {{ updatedProfile.lastName }}
            </h6>
            <p
              v-if="
                account.role === 'admin' && updatedProfile.fullAddress && updatedProfile.address
              "
              class="profile-inline-address"
            >
              {{ updatedProfile.fullAddress }}
            </p>
            <p v-if="account.role === 'admin'" class="profile-inline-description">
              {{ updatedProfile.description }}
            </p>
          </b-col>
          <b-col class="profile-inline-team" cols="1" sm="1">
            <b-button
              :disabled="!account.role === 'admin'"
              @click="$refs.teamPopup.showModal(updatedProfile, isMember, memberId)"
            >
              <img
                v-if="isMember && account.role === 'admin'"
                :src="$store.state.style.pictures.team"
              />
              <img
                v-else-if="!isMember && account.role === 'admin'"
                :src="$store.state.style.pictures.teamOff"
              />
              <img
                v-else-if="!account.role === 'admin'"
                :src="$store.state.style.pictures.teamAlt"
              />
            </b-button>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <team-popup ref="teamPopup" :account-type="account.type" />
  </b-card>
</template>

<script type="text/javascript">
import { BButton } from 'bootstrap-vue';
import { BCard } from 'bootstrap-vue';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'ProfileInline',

  components: {
    'b-button': BButton,
    'b-card': BCard,
    'team-popup': () => import('@/views/containers/TeamPopup.vue'),
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
    profile: {
      type: Object,
      required: true,
    },
    'profile-type': {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      error: null,
      success: null,
      loaderCounter: 0,
      isViewer: true,
      editMode: false,
      isMember: null,
      memberId: null,
      updatedAccount: null,
      updatedProfile: null,
      updatedClassName: null,
    };
  },

  computed: {
    status: {
      get() {
        return this.$store.state.auth.viewed.status;
      },
    },
    profileAddress: {
      get() {
        return this.$store.state.address.viewer.address;
      },
    },
    teams: {
      get() {
        return this.$store.state.teams.collection;
      },
    },
  },

  watch: {
    account: {
      handler(account) {
        this.updatedAccount = account;
      },
      immediate: true,
    },
    profile: {
      handler(profile) {
        this.updatedProfile = profile;
      },
      immediate: true,
    },
    className: {
      handler(name) {
        this.updatedClassName = name;
      },
      immediate: true,
    },
  },

  created() {
    this.setListeners();
  },

  mounted() {
    this.loaderCounter = 0;
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

      EventBus.$on('profileSelected', profile => {
        if (
          profile &&
          profile !== null &&
          profile.id.toString() === this.updatedProfile.id.toString()
        ) {
          this.$el.style.background = this.$store.state.style.color.secondary;
        } else {
          this.$el.style.background = 'white';
        }
        return null;
      });
    },

    removeListeners() {
      EventBus.$off('onTeamDeleted');
      EventBus.$off('onTeamCreated');
      EventBus.$off('profileSelected');
    },

    async loadTeams() {
      this.error = null;
      this.success = null;
      return this.$store
        .dispatch('team/loadTeams', this.$store.state.auth.account.id)
        .then(res => {
          this.loaderCounter = 0;
          return res;
        })
        .catch(err => {
          this.loaderCounter = 0;
          this.error = err;
          return this.error;
        });
    },

    isTeamMember(teams) {
      if (teams) {
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

    highlightProfile(profile) {
      EventBus.$emit('profileSelected', profile);
      EventBus.$emit('highlightProfile', profile);
    },

    async goToProfile(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      logger.publish(4, 'profile', 'goToProfile:req', this.updatedProfile.id);
      await this.$store.commit('auth/setAccount', {
        viewer: true,
        account: this.updatedProfile,
      });
      return this.$router.push({
        name: 'profile',
        query: {
          profileId: this.updatedProfile.id,
          profileRole: this.updatedProfile.role,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-inline.scss';
</style>
