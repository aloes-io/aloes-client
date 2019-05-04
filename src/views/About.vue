<template lang="html">
  <div class="about-view">
    <header-container
      :access_token="$store.state.auth.access_token"
      :account="$store.state.auth.account"
    />
    <b-container class="about-container">
      <div v-if="tab === null" class="about-header">
        <img :src="$store.state.style.pictures.background" />
      </div>
      <contact-form v-if="tab === 'contact'" />
      <ipso-tables v-else-if="tab === 'docs'" :client-url="$store.state.clientUrl" />
      <div
        v-else-if="staticPage"
        v-show="staticPage !== null"
        v-html="staticPage"
        class="static-page"
      />
    </b-container>
    <footer-container />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from '@/views/containers/HeaderContainer.vue';
import FooterContainer from '@/views/containers/FooterContainer.vue';

export default {
  name: 'About',

  components: {
    'header-container': HeaderContainer,
    'footer-container': FooterContainer,
    'contact-form': () => import('@/components/About/ContactForm.vue'),
    'ipso-tables': () => import('@/components/Docs/IpsoTables.vue'),
  },

  props: {
    tab: {
      type: String,
      default: null,
      validator: value => ['docs', 'contact', 'news-letter'].indexOf(value) !== -1,
    },
  },

  data() {
    return {
      showAbout: false,
      showContact: false,
      showFAQ: false,
      showLegalMentions: false,
      staticPage: null,
      currentTab: '',
    };
  },

  watch: {
    tab: {
      handler(newTab) {
        this.getStaticPage(newTab);
      },
      immediate: true,
    },
  },

  methods: {
    async getStaticPage(tab) {
      const staticPageBlob = await fetch(`${this.$store.state.clientUrl}/html/${tab}.html`).then(
        res => res.blob(),
      );
      const reader = new FileReader();
      reader.onload = () => {
        this.staticPage = reader.result;
      };
      await reader.readAsText(staticPageBlob);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../style/about.scss';
</style>
