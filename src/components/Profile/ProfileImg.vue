<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div class="profile-img">
    <b-card
      :img-src="header"
      overlay
      img-alt="Header image"
      text-variant="white"
      class="header-card"
      @mouseover="displayHeaderButton = true"
      @mouseleave="displayHeaderButton = false"
    >
      <b-img
        :src="avatar"
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
      resource-type="Images"
      image-type="Header"
    />
    <file-import-container
      v-if="!viewer && editorMode"
      ref="avatarImport"
      :access-token="$store.state.auth.access_token"
      resource-type="Images"
      image-type="Avatar"
    />
  </div>
</template>

<script type="text/javascript">
import { BButton } from 'bootstrap-vue';
import { BCard } from 'bootstrap-vue';
import { BImg } from 'bootstrap-vue';
import throttle from 'lodash.throttle';
import FileImportContainer from '@/views/containers/FileImportContainer.vue';
import logger from '@/services/logger';
import File from '@/mixins/file';

export default {
  name: 'ProfileImg',

  components: {
    'b-button': BButton,
    'b-card': BCard,
    'b-img': BImg,
    'file-import-container': FileImportContainer,
  },

  mixins: [File],

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
      error: null,
      loading: false,
      displayHeaderButton: false,
      displayAvatarButton: false,
      avatar: null,
      header: null,
      viewer: true,
      editorMode: false,
    };
  },

  computed: {
    serverUrl() {
      return this.$store.state.serverUrl;
    },
    userImgPlaceholder() {
      return this.$store.state.style.pictures.team;
    },
    headerImgUrl: {
      get() {
        if (this.viewer) {
          return `${this.serverUrl}${this.$store.state.auth.viewed.headerImgUrl}`;
        }
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
        return `${this.serverUrl}${this.$store.state.auth.account.avatarImgUrl}`;
      },
      set(value) {
        this.$store.commit('auth/setModelKV', {
          key: 'avatarImgUrl',
          value,
        });
      },
    },
    defaultImgUrl() {
      return this.$store.state.imgPlaceholder;
    },
    defaultHeaderUrl() {
      return this.$store.state.headerPlaceholder;
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
    avatarImgUrl: {
      async handler(newValue, oldValue) {
        if (this.$el && newValue && newValue !== oldValue) {
          await this.getFileDelayed('avatar', newValue);
        }
      },
      immediate: true,
    },
    headerImgUrl: {
      async handler(newValue, oldValue) {
        if (this.$el && newValue && newValue !== oldValue) {
          await this.getFileDelayed('header', newValue);
        }
      },
      immediate: true,
    },
  },

  created() {
    this.getFileDelayed = throttle(this.getFile, 100);
  },

  async mounted() {
    await this.getFileDelayed('avatar', this.avatarImgUrl);
    await this.getFileDelayed('header', this.headerImgUrl);
  },

  methods: {
    async getFile(type, url) {
      try {
        if (!url || !type) throw new Error('Missing arguments');
        if (type !== 'avatar' && type !== 'header') throw new Error('Wrong type');
        logger.publish(4, 'file', 'getFile:req', { type, url });
        const file = await this.$store.dispatch('files/download', url);
        if (file && file !== null) {
          this[type] = await this.parseImage(file);
        } else if (type === 'avatar') {
          this.avatar = this.defaultImgUrl;
        } else if (type === 'header') {
          this.header = this.defaultHeaderUrl;
        }
        return null;
      } catch (error) {
        if (error.message !== 'Wrong type') {
          if (type === 'avatar') {
            this.avatar = this.defaultImgUrl;
          } else if (type === 'header') {
            this.header = this.defaultHeaderUrl;
          }
        }
        logger.publish(4, 'file', 'getFile:err', error);
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-img.scss';
</style>
