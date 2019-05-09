<template lang="html">
  <div class="profile-description-view">
    <b-card no-body>
      <h6 class="profile-title">Favorite colors</h6>
      <b-row v-if="!viewer && editorMode">
        <b-col sm="5" md="4" lg="3" xl="2">
          <b-form-select v-model="favoriteColor" :options="palette" size="sm" required />
        </b-col>
        <b-col sm="1">
          <b-button size="sm" class="favorite-color-button" @click="addFavoriteColor">
            <fa-icon icon="plus" size="lg" />
          </b-button>
        </b-col>
      </b-row>
      <b-row
        v-for="(element, index) in favoriteColors"
        :key="element"
        class="account-favorite-colors"
      >
        <b-col sm="5" md="4" lg="3" xl="2" class="account-favorite-color">
          {{ element }}
        </b-col>
        <b-col sm="1">
          <b-button
            v-if="!viewer && editorMode"
            size="sm"
            class="favorite-color-button"
            @click="delFavoriteColor(index)"
          >
            <fa-icon icon="times" size="lg" />
          </b-button>
        </b-col>
      </b-row>
    </b-card>
    <br />
    <b-card
      v-if="$store.state.auth.account.subscribed.startsWith('paid')"
      no-body
      class="account-agenda"
    >
      <h6 class="profile-title">Agenda</h6>
      <slot />
    </b-card>
  </div>
</template>

<script type="text/javascript">
import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';

export default {
  name: 'ProfileDescription',

  components: {
    'b-button': bButton,
    'b-card': bCard,
    'b-form-select': bFormSelect,
  },

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
      viewer: true,
      editorMode: false,
      favoriteColor: null,
    };
  },

  computed: {
    palette: {
      get() {
        return this.$store.state.style.palette;
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
    favoriteColors: {
      get() {
        if (this.viewer) {
          return this.$store.state.auth.viewed.model.favoriteColors;
        }
        return this.$store.state.auth.account.favoriteColors;
      },
      set(value) {
        this.$store.commit('auth/setAccountList', {
          command: 'add',
          list: 'favoriteColors',
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

  methods: {
    addFavoriteColor(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      if (this.favoriteColor) {
        const found = this.favoriteColors.find(practice => practice === this.favoriteColor);
        if (!found) {
          this.favoriteColors = this.favoriteColor;
        }
      }
    },

    delFavoriteColor(index) {
      this.$store.commit('auth/setModelList', {
        command: 'del',
        list: 'favoriteColors',
        value: index,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/profile-description.scss';
</style>
