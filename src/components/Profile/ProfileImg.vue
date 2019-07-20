<template lang="html">
  <div class="profile-img">
    <b-card
      :img-src="headerImgUrl"
      overlay
      img-alt="Header image"
      text-variant="white"
      class="header-card"
      @mouseover="displayHeaderButton = true"
      @mouseleave="displayHeaderButton = false"
    >
      <b-img
        :src="avatarImgUrl"
        fluid
        class="avatar-image"
        @click.native.prevent.stop="
          displayAvatarButton ? (displayAvatarButton = false) : (displayAvatarButton = true)
        "
        @mouseover="displayAvatarButton = true"
        @mouseleave="displayAvatarButton = false"
      />
      <b-button
        v-if="!viewer && editorMode && displayHeaderButton && !displayAvatarButton"
        class="header-button"
        @click.prevent.stop="
          $refs.headerImport.showModal();
          displayHeaderButton = false;
        "
      >
        <fa-icon icon="image" size="lg" />
      </b-button>
      <b-button
        v-else-if="!viewer && editorMode && displayAvatarButton"
        class="avatar-button"
        @mouseover="displayAvatarButton = true"
        @mouseleave="displayAvatarButton = false"
        @click.prevent.stop="$refs.avatarImport.showModal()"
      >
        <fa-icon icon="image" size="lg" />
      </b-button>
    </b-card>
    <file-import-container
      v-if="!viewer && editorMode"
      ref="headerImport"
      :access-token="$store.state.auth.access_token"
      :profile-type="profileType"
      resource-type="Images"
      image-type="Header"
    />
    <file-import-container
      v-if="!viewer && editorMode"
      ref="avatarImport"
      :access-token="$store.state.auth.access_token"
      :profile-type="profileType"
      resource-type="Images"
      image-type="Avatar"
    />
  </div>
</template>

<script type="text/javascript">
import { BButton } from 'bootstrap-vue';
import { BCard } from 'bootstrap-vue';
import { BImg } from 'bootstrap-vue';
import FileImportContainer from '@/views/containers/FileImportContainer.vue';

export default {
  name: 'ProfileImg',

  components: {
    'b-button': BButton,
    'b-card': BCard,
    'b-img': BImg,
    'file-import-container': FileImportContainer,
  },

  props: {
    'profile-type': {
      type: String,
      require: true,
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
      loading: false,
      displayHeaderButton: false,
      displayAvatarButton: false,
      viewer: true,
      editorMode: false,
    };
  },

  computed: {
    serverUrl() {
      return this.$store.state.serverUrl;
    },
    headerImgUrl: {
      get() {
        if (this.viewer) {
          return `${this.serverUrl}${this.$store.state.auth.viewed.headerImgUrl}`;
        }
        //  return `${this.$store.state.auth.account.headerImgUrl}`;
        return `${this.serverUrl}${this.$store.state.auth.account.headerImgUrl}`;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'headerImgUrl',
          value,
        });
      },
    },
    avatarImgUrl: {
      get() {
        if (this.viewer) {
          return `${this.serverUrl}${this.$store.state.auth.viewed.avatarImgUrl}`;
        }
        //  return `${this.$store.state.auth.account.avatarImgUrl}`;
        return `${this.serverUrl}${this.$store.state.auth.account.avatarImgUrl}`;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'avatarImgUrl',
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
    editMode: {
      handler(mode) {
        this.editorMode = mode;
      },
      immediate: true,
    },
  },

  mounted() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-img.scss';
</style>
