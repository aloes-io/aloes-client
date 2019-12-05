<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div class="not-found-view">
    <header-container :access_token="acces_token" :account="account" />
    <b-container class="auth-container">
      <b-row v-if="sessionIsValid" align-h="center">
        <h5>Success</h5>

        <b-col sm="12">
          <p>You will be redirected</p>
          <p>{{ $props.userId }}</p></b-col
        >

        <b-col v-for="type in linkTypes" :key="type" sm="3" md="3" lg="2" xl="2">
          <b-button
            v-if="type !== 'local'"
            :href="`${$store.state.serverUrl}${$store.state.restApiRoot}/link/${type}`"
            target="_blank"
            @click.prevent.stop="loginType = type"
          >
            <!--  @click="$store.dispatch('auth/externalSignIn', {provider: type})" -->
            {{ type }}
          </b-button>
          <!-- linked accounts -->
        </b-col>
      </b-row>

      <div v-else>
        <h5>Please refresh the page</h5>
        <br />
      </div>
    </b-container>
    <footer-container />
  </div>
</template>

<script type="text/javascript">
import { BButton } from 'bootstrap-vue';
import HeaderContainer from '@/views/containers/HeaderContainer.vue';
import FooterContainer from '@/views/containers/FooterContainer.vue';

export default {
  name: 'Auth',

  props: {
    'access-token': {
      type: String,
      required: false,
    },
    'user-id': {
      type: [String, Number],
      required: false,
    },
  },

  components: {
    'b-button': BButton,
    'footer-container': FooterContainer,
    'header-container': HeaderContainer,
  },

  data() {
    return {
      linkTypes: ['github'],
      linkType: null,
      loading: false,
      error: false,
    };
  },

  computed: {
    acces_token() {
      return this.$store.state.auth.access_token;
    },
    account() {
      return this.$store.state.auth.account;
    },
    sessionIsValid() {
      if (
        this.$props.accessToken &&
        this.$props.accessToken !== null &&
        this.$props.userId &&
        this.$props.userId !== null
      ) {
        return true;
      } else if (this.access_token && this.acces_token !== null) {
        return true;
      }
      return false;
    },
  },

  mounted() {
    const token = this.$store.dispatch('auth/externalSignIn', true);
    if (token && token !== null) {
      //  console.log('token', this.access_token);
      // this.$router.push({
      //   name: 'account',
      //   query: {
      //     'access-token': token.id,
      //     'user-id': token.userId,
      //   },
      // });
    }
  },
};
</script>

<style lang="scss" scoped>
@import '../style/not-found.scss';
</style>
