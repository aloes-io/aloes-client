<template lang="html">
  <div class="search-result-view">
    <div v-if="searchSuccess">
      <b-alert :show="searchSuccess" variant="success">
        Votre recherche a donné {{ searchSuccess }} résultat(s)
      </b-alert>
      <profile-inline
        v-for="profile in searchResults"
        :key="profile.id"
        :account="$store.state.auth.account"
        :token="token"
        :profile="profile"
        :profile-type="profileType"
      />
    </div>
    <b-alert
      v-else-if="searchError"
      :show="searchError !== null"
      variant="danger"
    >
      {{ searchError.message }}
    </b-alert>
  </div>
</template>

<script type="text/javascript">
import bAlert from "bootstrap-vue/es/components/alert/alert";
import ProfileInline from "@/components/Profile/ProfileInline.vue";

export default {
  name: "SearchResult",

  components: {
    "b-alert": bAlert,
    "profile-inline": ProfileInline
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
      updatedSearchResults: null
    };
  },

  computed: {
    searchProfileType: {
      get() {
        return this.$store.state.search.model.profileType;
      }
    },
    profileType: {
      get() {
        if (this.searchProfileType) {
          return this.searchProfileType;
        }
        return "Teacher";
      }
    },
    searchResults: {
      get() {
        return this.$store.state.search.model.results;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "results", value });
      }
    },
    searchError: {
      get() {
        return this.$store.state.search.model.error;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "error", value });
      }
    },
    searchSuccess: {
      get() {
        return this.$store.state.search.model.success;
      },
      set(value) {
        this.$store.commit("search/setModelKV", { key: "success", value });
      }
    }
  },

  created() {},

  mounted() {
    // console.log('mounted', this.profileType);
    // console.log('mounted', this.searchProfileType);
  },

  methods: {}
};
</script>

<style lang="scss" scoped>
@import "../../style/search-result.scss";
</style>
