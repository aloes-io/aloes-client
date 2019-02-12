<template lang="html">
  <b-modal
    :id="`${resourceType.toLowerCase()}${imgType}Import`"
    :ref="`${resourceType.toLowerCase()}${imgType}Import`"
    size="lg"
    hide-footer
    no-close-on-esc
    no-close-on-backdrop
    modal-class="file-import-container-modal"
    header-class="file-import-container-header"
    body-class="file-import-container-body"
    class="file-import-container"
    @hidden="onModalHidden"
    @shown="onModalShown"
  >
    <file-import
      :ref="`${imgType}Import`"
      :access-token="accessToken"
      :profile-type="profileType"
      :image-type="imgType"
      resource-type="Images"
    />
  </b-modal>
</template>

<script type="text/javascript">
import bModal from "bootstrap-vue/es/components/modal/modal";
import FileImport from "@/components/Files/FileImport.vue";

export default {
  name: "FileImport",

  components: {
    "file-import": FileImport,
    "b-modal": bModal
  },

  props: {
    "access-token": {
      type: Object,
      default: null
    },
    "profile-type": {
      type: String,
      required: true,
      default: null
    },
    "resource-type": {
      type: String,
      required: false,
      default: "Images"
    },
    "image-type": {
      type: String,
      required: true,
      default: "Avatar"
    }
  },

  data() {
    return {};
  },

  computed: {
    modalSize() {
      return this.imgType === "Avatar" ? "sm" : "lg";
    },
    status: {
      get() {
        return this.$store.state.files[this.$props.resourceType][
          this.$props.imageType
        ].status;
      },
      set(status) {
        this.$store.commit("files/setUploadStatus", {
          resourceType: this.$props.resourceType,
          role: this.$props.imageType,
          status
        });
      }
    }
  },

  watch: {
    imageType: {
      handler(type) {
        this.imgType = type;
      },
      immediate: true
    },
    windowHeight(newHeight, oldHeight) {
      this.txt = `it changed to ${newHeight} from ${oldHeight}`;
    }
  },

  updated() {},

  methods: {
    hideModal() {
      this.$refs[
        `${this.$props.resourceType.toLowerCase()}${this.imgType}Import`
      ].hide();
    },

    showModal() {
      this.$refs[
        `${this.$props.resourceType.toLowerCase()}${this.imgType}Import`
      ].show();
    },

    onModalHidden() {
      this.$refs[`${this.imgType}Import`].onReset();
      this.status = 1;
    },

    onModalShown() {
      this.$refs[`${this.imgType}Import`].initCroppie();
    }
  }
};
</script>

<style lang="scss">
@import "../../style/file-import-container.scss";
</style>
