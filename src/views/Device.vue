<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <div class="device-view">
    <header-container
      :access_token="$store.state.auth.access_token"
      :account="$store.state.auth.account"
    />
    <device-container
      :token="accessToken"
      :user-id="userId"
      :device-id="deviceId"
      :is-viewer="false"
      :edit-mode="true"
    />
    <footer-container />
  </div>
</template>

<script type="text/javascript">
import HeaderContainer from '@/views/containers/HeaderContainer.vue';
import FooterContainer from '@/views/containers/FooterContainer.vue';

export default {
  name: 'Device',

  components: {
    'header-container': HeaderContainer,
    'footer-container': FooterContainer,
    'device-container': () => import('@/views/containers/DeviceContainer.vue'),
  },

  props: {
    'access-token': {
      type: String,
      default: '',
    },
    'user-id': {
      type: [String, Number],
      required: true,
    },
    'device-id': {
      type: [String, Number],
      required: false,
    },
  },

  data() {
    return {};
  },

  mounted() {},

  beforeDestroy() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../style/device.scss';
</style>
