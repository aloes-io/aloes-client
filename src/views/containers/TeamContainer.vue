<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-container fluid class="teams-container-view">
    <p class="teams-container-subtitle">
      Team members list
    </p>
    <b-row v-show="teamsProfiles" v-if="teamsProfiles !== null" align-h="center">
      <b-col cols="12" sm="12" md="10" lg="8" xl="7">
        <profile-inline
          v-for="profile in teamsProfiles"
          :key="profile.id"
          :account="account"
          :token="token"
          :profile="profile"
          :profile-type="profileType"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script type="text/javascript">
import ProfileInline from '@/components/Profile/ProfileInline.vue';
import { EventBus } from '@/services/PubSub';
import logger from '@/services/logger';

export default {
  name: 'TeamContainer',

  components: {
    'profile-inline': ProfileInline,
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
  },

  data() {
    return {
      error: null,
      success: null,
      updatedProfileType: null,
      updatedProfileId: null,
      teamsProfiles: null,
    };
  },

  computed: {
    accountType: {
      get() {
        return this.$props.account.type;
      },
    },
    profile: {
      get() {
        return this.$store.state.auth.account;
      },
    },
    profileType: {
      get() {
        if (this.accountType.toLowerCase() === 'teacher') {
          return 'Studio';
        }
        if (this.accountType.toLowerCase() === 'studio') {
          return 'Teacher';
        }
        return '';
      },
    },
    teams: {
      get() {
        return this.$store.state.teams.collection;
      },
    },
  },

  watch: {
    // favorites: {
    //   handler(favorites) {
    //     //  this.updatedFavorites = favorites;
    //     this.$store.dispatch("favorites/loadFavoriteProfiles", {
    //       profileType: this.profileType,
    //       favorites,
    //     });
    //   },
    //   immediate: true,
    // },
  },

  created() {
    this.setListeners();
  },

  mounted() {
    this.loadTeamsProfiles();
  },

  beforeDestroy() {
    EventBus.$off('onTeamCreated');
    EventBus.$off('onTeamDeleted');
  },

  methods: {
    setListeners() {
      EventBus.$on('onTeamCreated', async team => {
        if (team && this.loaderCounter < 1) {
          this.loaderCounter += 1;
          return setTimeout(async () => {
            await this.loadTeamsProfiles();
          }, 200);
        }
      });

      EventBus.$on('onTeamDeleted', team => {
        if (team && this.loaderCounter < 1) {
          this.loaderCounter += 1;
          return setTimeout(async () => {
            await this.loadTeamsProfiles();
          }, 200);
        }
      });
    },

    async loadTeamsProfiles() {
      this.error = null;
      this.success = null;
      const teams = await this.$store
        .dispatch('team/loadTeams', this.$props.account.id)
        .then(res => res)
        .catch(err => {
          this.loaderCounter = 0;
          this.error = err;
          return this.error;
        });
      this.teamsProfiles = await this.$store
        .dispatch('team/loadTeamsProfiles', teams)
        .then(res => {
          this.loaderCounter = 0;
          return res;
        })
        .catch(err => {
          this.loaderCounter = 0;
          this.error = err;
          return this.error;
        });
      logger.publish(4, 'team', 'loadTeamsProfiles:res', this.teamsProfiles);
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/team-container.scss';
</style>
