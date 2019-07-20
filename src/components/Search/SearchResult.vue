<template lang="html">
  <div class="search-result-view">
    <div v-if="searchSuccess">
      <b-alert :show="searchSuccess" variant="success">
        Your search has {{ searchSuccess }} results
      </b-alert>
      <device-inline
        v-for="device in searchResults"
        :key="device.id"
        :account="$store.state.auth.account"
        :token="token"
        :device="device"
      />
    </div>
    <b-alert v-else-if="searchError" :show="searchError !== null" variant="danger">
      {{ searchError.message }}
    </b-alert>
  </div>
</template>

<script type="text/javascript">
import { BAlert } from 'bootstrap-vue';
import DeviceInline from '@/components/Device/DeviceInline.vue';

export default {
  name: 'SearchResult',

  components: {
    'b-alert': BAlert,
    'device-inline': DeviceInline,
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
  },

  data() {
    return {
      updatedSearchResults: null,
    };
  },

  computed: {
    searchResults: {
      get() {
        return this.$store.state.search.model.results;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'results', value });
      },
    },
    searchError: {
      get() {
        return this.$store.state.search.model.error;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'error', value });
      },
    },
    searchSuccess: {
      get() {
        return this.$store.state.search.model.success;
      },
      set(value) {
        this.$store.commit('search/setModelKV', { key: 'success', value });
      },
    },
  },

  created() {},

  mounted() {
    // console.log('mounted', this.profileType);
    // console.log('mounted', this.searchProfileType);
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../../style/search-result.scss';
</style>
