<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-modal
    :id="`${rscType.toLowerCase()}${imgType}Import`"
    :ref="`${rscType.toLowerCase()}${imgType}Import`"
    size="lg"
    hide-footer
    no-close-on-esc
    no-close-on-backdrop
    modal-class="file-import-container-modal"
    header-class="file-import-container-header"
    body-class="file-import-container-body"
    class="file-import-container"
    hide-backdrop
  >
    <!--  @hidden="onModalHidden"
    @shown="onModalShown" -->
    <file-import
      :ref="`${imgType}Import`"
      :access-token="accessToken"
      :image-type="imgType"
      resource-type="Images"
    />
  </b-modal>
</template>

<script type="text/javascript">
import { BModal } from 'bootstrap-vue';
// import FileImport from '@/components/Files/FileImport.vue';

export default {
  name: 'FileImportContainer',

  components: {
    // 'file-import': FileImport,
    'file-import': () => import('@/components/Files/FileImport.vue'),
    'b-modal': BModal,
  },

  props: {
    'access-token': {
      type: Object,
      default: null,
    },
    'resource-type': {
      type: String,
      required: false,
      default: 'Images',
    },
    'image-type': {
      type: String,
      required: true,
      default: 'Avatar',
    },
  },

  data() {
    return {
      imgType: 'Avatar',
      rscType: 'Images',
    };
  },

  computed: {
    modalSize() {
      return this.imgType === 'Avatar' ? 'sm' : 'lg';
    },
    status: {
      get() {
        return this.$store.state.files[this.rscType][this.imgType].status;
      },
      set(status) {
        this.$store.commit('files/setUploadStatus', {
          resourceType: this.rscType,
          role: this.imgType,
          status,
        });
      },
    },
  },

  watch: {
    imageType: {
      handler(type) {
        this.imgType = type;
      },
      immediate: true,
    },
    resourceType: {
      handler(type) {
        this.rscType = type;
      },
      immediate: true,
    },
  },

  methods: {
    hideModal() {
      this.$refs[`${this.rscType.toLowerCase()}${this.imgType}Import`].hide();
    },

    showModal() {
      this.$refs[`${this.rscType.toLowerCase()}${this.imgType}Import`].show();
    },
  },
};
</script>

<style lang="scss">
@import '../../style/file-import-container.scss';
</style>
