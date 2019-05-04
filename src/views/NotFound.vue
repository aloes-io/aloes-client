<template lang="html">
  <div class="not-found-view">
    <header-container
      :access_token="$store.state.auth.access_token"
      :account="$store.state.auth.account"
    />
    <b-container class="not-found-container">
      <h5>Error 404</h5>
      <br />
      <p>Are you lost ?</p>
      <p>
        <router-link to="/" class="go-back-home">
          <i class="fa fa-arrow-left" />
          This way !
        </router-link>
      </p>
      <img :src="$store.state.style.pictures.notFound" class="not-found-img" />
    </b-container>
    <footer-container />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from '@/views/containers/HeaderContainer.vue';
import FooterContainer from '@/views/containers/FooterContainer.vue';

export default {
  name: 'NotFound',

  components: {
    'footer-container': FooterContainer,
    'header-container': HeaderContainer,
  },

  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
@import '../style/not-found.scss';
</style>
