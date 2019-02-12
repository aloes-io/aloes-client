<template lang="html">
  <div
    v-if="$store.state.coinHive.siteKey"
    id="coinhive-captcha"
    ref="captcha"
    :data-key="$store.state.coinHive.siteKey"
    :data-hashes="$store.state.coinHive.hashes"
    :data-callback="captchaCallback"
    class="coinhive-captcha"
    data-whitelabel="true"
    data-disable-elements="button[type=submit]#signup-button"
  >
    <em>
      Loading Captcha...<br />
      If it doesn't load, <br />
      please disable Adblock or refresh the page.
    </em>
  </div>
</template>

<script type="text/javascript">
export default {
  name: "Captcha",

  data() {
    return {
      coinHiveVerification: true,
      recaptchaScript: null
    };
  },

  created() {
    this.recaptchaScript = document.createElement("script");
    this.recaptchaScript.setAttribute(
      "src",
      "https://authedmine.com/lib/captcha.min.js"
    );
    this.recaptchaScript.setAttribute("async", true);
    document.body.appendChild(this.recaptchaScript);
  },

  mounted() {},

  beforeDestroy() {
    document.body.removeChild(this.recaptchaScript);
  },

  methods: {
    captchaCallback(token) {
      return token;
    },

    async verifyCaptcha(target) {
      //  console.log("verifycaptcha", target);
      let token;
      if (this.coinHiveVerification === false) {
        this.verified = true;
        return this.verified;
      }
      token = target[4].value;
      //  console.log("captcha token :", token);
      return this.$store
        .dispatch("auth/verifyCaptcha", token)
        .then(res => res)
        .catch(err => err);
    }
  }
};
</script>

<style lang="scss">
@import "../../style/captcha.scss";
</style>
