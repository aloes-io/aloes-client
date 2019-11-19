<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-container fluid class="search-container-view">
    <b-row>
      <b-col sm="12" md="12" lg="12" xl="12">
        <search-form v-if="$store.state.auth.account" :token="token" :user-id="userId" />
      </b-col>
    </b-row>
    <hr />
    <b-row v-if="searchResults && searchResults.content">
      <b-col sm="12" md="8" lg="8" xl="8" class="search-result-profiles">
        <search-result :token="token" :user-id="userId" />
      </b-col>
      <b-col sm="12" md="4" lg="4" xl="4">
        <search-map :token="token" :user-id="userId" :devices="searchResults.content" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script type="text/javascript">
export default {
  name: 'SearchContainer',

  components: {
    'search-form': () => import('@/components/Search/SearchForm.vue'),
    'search-map': () => import('@/components/Search/SearchMap.vue'),
    'search-result': () => import('@/components/Search/SearchResult.vue'),
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
};
</script>

<style lang="scss" scoped>
@import '../../style/search-container.scss';
</style>
