<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-card no-body class="profile-header">
    <profile-img :is-viewer="viewer" :edit-mode="editorMode" :profile-type="profileRole" />
    <br />
    <profile-form
      :is-viewer="viewer"
      :edit-mode="editorMode"
      :account="account"
      :profile-id="profileId"
      :profile-type="profileRole"
    />
  </b-card>
</template>

<script type="text/javascript">
import { BCard } from 'bootstrap-vue';
import ProfileForm from '@/components/Profile/ProfileForm.vue';
import ProfileImg from '@/components/Profile/ProfileImg.vue';

export default {
  name: 'ProfileHeader',

  components: {
    'b-card': BCard,
    'profile-form': ProfileForm,
    'profile-img': ProfileImg,
  },

  props: {
    account: {
      type: Object,
      default: null,
    },
    profile: {
      type: Object,
      default: null,
    },
    'profile-id': {
      type: [Number, String],
      require: true,
      default: null,
    },
    'profile-role': {
      type: String,
      require: true,
      default: null,
    },
    'is-viewer': {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      error: null,
      loading: false,
      viewer: true,
      isFavorite: null,
      favoriteId: null,
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
    favorites: {
      get() {
        return this.$store.state.favorites.model;
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
    account: {
      handler(account) {
        this.updatedAccount = account;
      },
      immediate: true,
    },
    isViewer: {
      handler(state) {
        this.viewer = state;
      },
      immediate: true,
    },
  },

  mounted() {
    this.editorMode = false;
  },

  beforeDestroy() {
    this.editorMode = false;
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-header.scss';
</style>
