<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div class="applications-list-view">
    <application-inline
      v-for="application in applications"
      :key="application.id"
      :account="$store.state.auth.account"
      :token="token"
      :application="application"
    />
    <b-button class="add-application" @click="newApplication">
      <fa-icon icon="plus" size="lg" />
    </b-button>
  </div>
</template>

<script type="text/javascript">
import { BButton } from 'bootstrap-vue';
import ApplicationInline from '@/components/Application/ApplicationInline.vue';

export default {
  name: 'ApplicationsList',

  components: {
    'b-button': BButton,
    'application-inline': ApplicationInline,
  },

  props: {
    token: {
      type: String,
      required: true,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      required: true,
      default: null,
    },
    applications: {
      type: Array,
      required: true,
      default: null,
    },
  },

  data() {
    return {
      updatedSearchResults: null,
    };
  },

  computed: {
    // application: {
    //   get() {
    //     return this.$store.state.application.instance;
    //   },
    //   set(value) {
    //     this.$store.commit("application/setModel", value);
    //   },
    // },
  },

  mounted() {},

  methods: {
    newApplication(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.$store.commit('application/cleanModel');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/applications-list.scss';
</style>
