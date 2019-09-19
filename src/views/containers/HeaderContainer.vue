<template lang="html">
  <b-navbar :class="className" toggleable toggle-breakpoint="sm" class="header-container">
    <b-navbar-toggle target="nav_collapse" />
    <b-navbar-brand :to="{ name: 'home' }" class="logo w-45 mr">
      <b-row>
        <b-col cols="5" sm="5">
          <img :src="$store.state.style.pictures.logo" alt="aloes logo" class="brand-logo" />
        </b-col>
        <b-col cols="7" sm="7">
          <p class="brand-font">
            aloes
          </p>
        </b-col>
      </b-row>
    </b-navbar-brand>
    <b-collapse id="nav_collapse" is-nav>
      <b-navbar-nav v-if="access_token && account" class="w-55">
        <b-nav-item
          :to="{
            name: 'search',
            query: {
              ['access-token']: access_token.id,
              ['user-id']: access_token.userId,
            },
          }"
        >
          <fa-icon icon="search" size="lg" />
        </b-nav-item>
        <!-- <b-nav-item
          :to="{
            name: 'team',
          }"
        >
          <i class="fa fa-users" />
        </b-nav-item> -->
        <b-nav-item
          :to="{
            name: 'device',
            query: {
              ['access-token']: access_token.id,
              ['user-id']: access_token.userId,
            },
          }"
        >
          <b-img :src="$store.state.style.pictures.node" class="thumb-icon" />
        </b-nav-item>
        <b-nav-item
          :to="{
            name: 'application',
            query: {
              ['access-token']: access_token.id,
              ['user-id']: access_token.userId,
            },
          }"
        >
          <b-img :src="$store.state.style.pictures.device" class="thumb-icon" />
        </b-nav-item>
        <b-nav-item
          :to="{
            name: 'account',
            query: {
              ['access-token']: access_token.id,
              ['user-id']: access_token.userId,
            },
          }"
        >
          <b-img v-if="$store.state.auth.account.avatarImgUrl" :src="userIcon" class="thumb-icon" />
          <fa-icon v-else icon="user" size="lg" />
          <small v-show="screenIsLarge">
            {{ $store.state.auth.account.firstName }}
          </small>
        </b-nav-item>
        <b-nav-item @click.prevent.stop="onLogoutClick">
          <fa-icon icon="sign-out-alt" size="lg" />
        </b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav v-else class="w-55">
        <!-- <b-navbar-nav v-else-if="!access_token || access_token === null" class="w-55"> -->
        <b-nav-item @click.prevent.stop="$refs.loginPopup.showModal()">
          <fa-icon icon="sign-in-alt" size="lg" /> Signin
        </b-nav-item>
        <b-nav-item @click.prevent.stop="$refs.signupPopup.showModal()">
          <fa-icon icon="user-plus" size="lg" /> Signup
        </b-nav-item>
        <login-popup ref="loginPopup" />
        <signup-popup ref="signupPopup" />
      </b-navbar-nav>
      <!--   <b-navbar-nav v-else-if="access_token && !account" class="w-55">
        <b-nav-item @click.prevent.stop="onLogoutClick">
          <fa-icon icon="sign-out-alt" size="lg" /> Signout
        </b-nav-item>
      </b-navbar-nav> -->
    </b-collapse>
  </b-navbar>
</template>

<script type="text/javascript">
import { BCollapse } from 'bootstrap-vue';
import { BImg } from 'bootstrap-vue';
import { BNavbar } from 'bootstrap-vue';
import { BNavbarNav } from 'bootstrap-vue';
import { BNavbarBrand } from 'bootstrap-vue';
import { BNavbarToggle } from 'bootstrap-vue';
import { BNavItem } from 'bootstrap-vue';
import File from '@/views/mixins/file';
import Notification from '@/views/mixins/notification';

export default {
  components: {
    'b-collapse': BCollapse,
    'b-img': BImg,
    'b-navbar': BNavbar,
    'b-navbar-nav': BNavbarNav,
    'b-navbar-brand': BNavbarBrand,
    'b-navbar-toggle': BNavbarToggle,
    'b-nav-item': BNavItem,
    'login-popup': () => import('@/views/containers/LoginPopup.vue'),
    'signup-popup': () => import('@/views/containers/SignupPopup.vue'),
  },

  mixins: [File, Notification],

  props: {
    // eslint-disable-next-line camelcase
    access_token: {
      type: Object,
      default: null,
      required: false,
    },
    account: {
      type: Object,
      default: null,
      required: false,
    },
  },

  data() {
    return {
      showNotifications: false,
      userIcon: null,
    };
  },

  computed: {
    serverUrl() {
      return this.$store.state.serverUrl;
    },

    windowWidth: {
      get() {
        return this.$store.state.windowWidth;
      },
      set(value) {
        this.$store.commit('setModelKV', { key: 'windowWidth', value });
      },
    },
    windowHeight: {
      get() {
        return this.$store.state.windowHeight;
      },
      set(value) {
        this.$store.commit('setModelKV', { key: 'windowHeight', value });
      },
    },
    screenIsLarge() {
      if (this.windowWidth > 480) {
        return true;
      }
      return false;
    },
    className() {
      if (this.$route.name === 'home') {
        return 'home';
      }
      return 'out';
    },
  },

  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.getWindowWidth);
      window.addEventListener('resize', this.getWindowHeight);
      this.getWindowWidth();
      this.getWindowHeight();
      this.getUserIcon();
    });
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.getWindowWidth);
    window.removeEventListener('resize', this.getWindowHeight);
  },

  methods: {
    getWindowWidth() {
      this.windowWidth = document.documentElement.clientWidth;
    },

    getWindowHeight() {
      this.windowHeight = document.documentElement.clientHeight;
    },

    async getUserIcon() {
      try {
        if (this.$store.state.auth.account && this.$store.state.auth.account.avatarImgUrl) {
          const url = `${this.$store.state.serverUrl}${
            this.$store.state.auth.account.avatarImgUrl
          }`;
          const file = await this.$store.dispatch('files/download', url);
          if (file && file !== null) {
            this.userIcon = await this.parseImage(file);
          } else {
            this.userIcon = this.$store.state.user;
          }
        }
        return true;
      } catch (error) {
        this.userIcon = this.$store.state.user;
        throw error;
      }
    },

    async onLogoutClick() {
      try {
        if (this.account && this.account !== null) {
          this.$store.commit('device/cleanModel');
          this.$store.commit('team/setTeams', null);
          //  this.$store.cache.clear()
          await this.$store.dispatch('auth/signOut');
          return setTimeout(
            () =>
              this.$router.push({
                name: 'home',
              }),
            500,
          );
        }
        await this.$store.dispatch('auth/externalSignOut');
        return setTimeout(
          () =>
            this.$router.push({
              name: 'home',
            }),
          500,
        );
      } catch (error) {
        this.notifyError(error);
        throw error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/header-container.scss';
</style>
