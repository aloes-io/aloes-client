<template lang="html">
  <b-container fluid class="search-container-view">
    <b-card title="Commencez votre recherche ici" class="search-card">
      <b-row>
        <b-col sm="12" md="12" lg="12" xl="12">
          <search-form
            v-if="$store.state.auth.account"
            :token="token"
            :user-id="userId"
          />
        </b-col>
      </b-row>
      <hr />
      <b-row>
        <b-col class="search-options-button-col" sm="12">
          <b-button
            v-show="!showSearchOptions"
            :disabled="!$store.state.auth.account.subscribed.startsWith('paid')"
            size="sm"
            class="search-options-button"
            @click="showSearchOptions = true"
          >
            <i class="fa fa-plus" />
          </b-button>
        </b-col>
        <b-col sm="12" md="12" lg="12" xl="12">
          <search-optional-form v-show="showSearchOptions" />
        </b-col>
        <b-col class="search-options-button-col" sm="12">
          <b-button
            v-show="showSearchOptions"
            size="sm"
            class="search-options-button"
            @click="showSearchOptions = false"
          >
            <i class="fa fa-close" />
          </b-button>
        </b-col>
      </b-row>
    </b-card>
    <b-row>
      <b-col sm="12" md="8" lg="8" xl="8" class="search-result-profiles">
        <search-result :token="token" :user-id="userId" />
      </b-col>
      <b-col sm="12" md="4" lg="4" xl="4">
        <search-map :token="token" :user-id="userId" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script type="text/javascript">
import bButton from "bootstrap-vue/es/components/button/button";
import bCard from "bootstrap-vue/es/components/card/card";
import SearchForm from "@/components/Search/SearchForm.vue";
import SearchOptionalForm from "@/components/Search/SearchOptionalForm.vue";
import SearchMap from "@/components/Search/SearchMap.vue";
import SearchResult from "@/components/Search/SearchResult.vue";

export default {
  name: "SearchContainer",

  components: {
    "b-button": bButton,
    "b-card": bCard,
    "search-form": SearchForm,
    "search-optional-form": SearchOptionalForm,
    "search-map": SearchMap,
    "search-result": SearchResult
  },

  props: {
    token: {
      type: String,
      required: true,
      default: ""
    },
    "user-id": {
      type: [String, Number],
      required: true,
      default: null
    }
  },

  data() {
    return {
      showSearchOptions: false
    };
  },

  mounted() {},

  // beforeDestroy() {
  //   this.searchSuccess = null;
  //   this.searchError = null;
  //   this.searchResults = null;
  //   this.searchFilter = null;
  // },

  methods: {}
};
</script>

<style lang="scss" scoped>
@import "../../style/search-container.scss";
</style>
