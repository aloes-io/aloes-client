<template lang="html">
  <b-container fluid class="search-container-view">
    <b-card title="Start your device research here" class="search-card">
      <b-row>
        <b-col sm="12" md="12" lg="12" xl="12">
          <search-form v-if="$store.state.auth.account" :token="token" :user-id="userId" />
        </b-col>
      </b-row>
      <hr />
    </b-card>
    <b-row>
      <b-col sm="12" md="8" lg="8" xl="8" class="search-result-profiles">
        <search-result :token="token" :user-id="userId" :devices="searchResults" />
      </b-col>
      <b-col sm="12" md="4" lg="4" xl="4">
        <search-map :token="token" :user-id="userId" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script type="text/javascript">
import bCard from 'bootstrap-vue/es/components/card/card';
import SearchForm from '@/components/Search/SearchForm.vue';
import SearchMap from '@/components/Search/SearchMap.vue';
import SearchResult from '@/components/Search/SearchResult.vue';

export default {
  name: 'SearchContainer',

  components: {
    'b-card': bCard,
    'search-form': SearchForm,
    'search-map': SearchMap,
    'search-result': SearchResult,
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
      showSearchOptions: false,
    };
  },

  computed: {
    searchResults: {
      get() {
        return this.$store.state.search.model.results;
      },
    },
  },

  mounted() {},

  // beforeDestroy() {
  //   this.searchSuccess = null;
  //   this.searchError = null;
  //   this.searchResults = null;
  //   this.searchFilter = null;
  // },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../../style/search-container.scss';
</style>
