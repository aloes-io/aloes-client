<template lang="html">
  <div class="file-import">
    <div v-if="isSaving">
      <i class="fa fa-spinner" />
      uploading {{ fileCount }} files...
    </div>
    <b-row v-else-if="!isSaving" align-h="center">
      <b-col v-if="resourceType === 'Images'" sm="12">
        <vue-croppie
          :ref="`${imgType.toLowerCase()}Croppie`"
          :viewport="{ width: maxViewportWidth, height: maxViewportHeight }"
          :boundary="{ width: maxBoundaryWidth, height: maxBoundaryHeight }"
          :enableOrientation="false"
          :enableResize="false"
        >
        </vue-croppie>
        <img :src="imageUrl" />
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col cols="6" sm="6">
        <b-form
          v-if="isInitial || isFailed || isSuccess"
          :ref="`${resourceType.toLowerCase()}Uploader`"
          enctype="multipart/form-data"
          novalidate
          class="file-uploader"
        >
          <label
            :for="`${resourceType.toLowerCase()}${imgType}-uploader`"
            class="add-file"
          >
            {{ importBtnTitle }}
          </label>
          <input
            :id="`${resourceType.toLowerCase()}${imgType}-uploader`"
            :disabled="isSaving"
            :accept="mimetype"
            type="file"
            class="input-file"
            @change="
              onFilesChange(
                resourceType,
                $event.target.name,
                $event.target.files
              );
              fileCount = $event.target.files.length;
            "
          />
        </b-form>
      </b-col>
      <!--   <b-col
        sm="2"
        lg="1">
        <b-button
          :class="`${imgType.toLowerCase()}-button`"
          :disabled="isLoading"
          @click="onRotate">
          <i class="fa fa-repeat "/>
        </b-button>
      </b-col> -->
      <b-col cols="6" sm="6">
        <b-button
          :class="`${imgType.toLowerCase()}-button`"
          :disabled="isSaving"
          @click="onFileSave"
        >
          Confirm
        </b-button>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col cols="10" sm="10">
        <br />
        <b-alert v-if="error" :show="error !== null" variant="warning">
          <i class="fa fa-circle failed" />
          {{ error }}
        </b-alert>
        <b-alert v-if="success" :show="success !== null" variant="success">
          <i class="fa fa-circle file-added" />
          {{ success.message }}
        </b-alert>
      </b-col>
    </b-row>
  </div>
</template>

<script type="text/javascript">
import bAlert from "bootstrap-vue/es/components/alert/alert";
import bButton from "bootstrap-vue/es/components/button/button";
import bForm from "bootstrap-vue/es/components/form/form";
import notification from "@/views/mixins/notification";
import logger from "@/services/logger";

export default {
  name: "FileImport",

  components: {
    "b-alert": bAlert,
    "b-button": bButton,
    "b-form": bForm
  },

  mixins: [notification],

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
    return {
      error: null,
      success: null,
      imgType: null,
      mimetype: `${this.$props.resourceType
        .toLowerCase()
        .slice(0, this.$props.resourceType.lastIndexOf("s"))}/*`,
      filetype: `${this.$props.resourceType
        .toLowerCase()
        .slice(0, this.$props.resourceType.lastIndexOf("s"))}`,
      maxSize: 10000000,
      fileCount: null,
      fileName: "",
      imageUrl: null,
      uploadedFile: null,
      STATUS_INITIAL: this.$store.state.files.STATUS_INITIAL,
      STATUS_SAVING: this.$store.state.files.STATUS_SAVING,
      STATUS_SUCCESS: this.$store.state.files.STATUS_SUCCESS,
      STATUS_FAILED: this.$store.state.files.STATUS_FAILED,
      HEADER_MAX_WIDTH: 820,
      HEADER_MAX_HEIGHT: 312,
      AVATAR_MAX_WIDTH: 170,
      AVATAR_MAX_HEIGHT: 170
    };
  },

  computed: {
    importBtnTitle: {
      get() {
        if (this.isFailed) return "Try again";
        return "Import a picture";
      }
    },
    isInitial: {
      get() {
        return (
          this.$store.state.files[this.$props.resourceType][
            this.$props.imageType
          ].status === this.STATUS_INITIAL
        );
      }
    },
    isSaving: {
      get() {
        return (
          this.$store.state.files[this.$props.resourceType][
            this.$props.imageType
          ].status === this.STATUS_SAVING
        );
      }
    },
    isSuccess: {
      get() {
        return (
          this.$store.state.files[this.$props.resourceType][
            this.$props.imageType
          ].status === this.STATUS_SUCCESS
        );
      }
    },
    isFailed: {
      get() {
        return (
          this.$store.state.files[this.$props.resourceType][
            this.$props.imageType
          ].status === this.STATUS_FAILED
        );
      }
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
    },
    source: {
      get() {
        return this.$store.state.auth.account[
          `${this.$props.imageType.toLowerCase()}ImgUrl`
        ];
      },
      set(value) {
        this.$store.commit("auth/setModelKV", {
          key: `${this.$props.imageType.toLowerCase()}ImgUrl`,
          value
        });
      }
    },

    ratio() {
      if (this.imgType.toLowerCase() === "header") {
        if (window.innerWidth >= 320 && window.innerWidth <= 480) {
          return 3.2;
        } else if (window.innerWidth >= 480 && window.innerWidth <= 768) {
          return 2.7;
        } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
          return 2;
        } else if (window.innerWidth >= 1024 && window.innerWidth <= 1400) {
          return 1.6;
        } else {
          return 1.5;
        }
      } else if (window.innerWidth >= 320 && window.innerWidth <= 480) {
        return 1.4;
      } else if (window.innerWidth >= 480 && window.innerWidth <= 768) {
        return 1.3;
      } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
        return 1.2;
      } else if (window.innerWidth >= 1024 && window.innerWidth <= 1400) {
        return 1.1;
      } else {
        return 1;
      }
    },

    maxBoundaryWidth: {
      get() {
        if (this.imgType.toLowerCase() === "header") {
          return 820 / this.ratio;
        }
        return 170 / this.ratio;
      }
    },
    maxBoundaryHeight: {
      get() {
        if (this.imgType.toLowerCase() === "header") {
          return 312 / this.ratio;
        }
        return 170 / this.ratio;
      }
    },
    maxViewportWidth: {
      get() {
        if (this.imgType.toLowerCase() === "header") {
          return 820 / 1.2 / this.ratio;
        }
        return 170 / 1.2 / this.ratio;
      }
    },
    maxViewportHeight: {
      get() {
        if (this.imgType.toLowerCase() === "header") {
          return 312 / 1.2 / this.ratio;
        }
        return 170 / 1.2 / this.ratio;
      }
    },
    windowWidth: {
      get() {
        return this.$store.state.windowWidth;
      }
    },
    windowHeight: {
      get() {
        return this.$store.state.windowHeight;
      }
    }
  },

  watch: {
    imageType: {
      handler(type) {
        this.imgType = type;
      },
      immediate: true
    }
  },

  mounted() {
    this.$refs[`${this.imgType.toLowerCase()}Croppie`].bind({
      url: this.source
    });
  },

  updated() {},

  beforeDestroy() {
    this.onReset();
  },

  methods: {
    initCroppie() {
      this.$refs[`${this.imgType.toLowerCase()}Croppie`].refresh();
      this.$refs[`${this.imgType.toLowerCase()}Croppie`].bind({
        url: this.source
      });
    },

    async onReset() {
      this.error = null;
      this.success = null;
      this.imageUrl = null;
      this.uploadedFile = null;
      this.status = this.STATUS_INITIAL;
      return this.$store.dispatch("files/onResetFileImport", {
        resourceType: this.$props.resourceType,
        role: this.$props.imageType
      });
    },

    async onFilesChange(resourceType, name, files) {
      logger.publish(4, "files", "onFilesChange:req", name);
      this.error = null;
      this.success = null;
      this.fileName = name;
      if (files && files[0]) {
        const reader = await new FileReader();
        reader.onload = e => {
          this.$refs[`${this.imgType.toLowerCase()}Croppie`].bind({
            url: e.target.result
          });
        };
        return reader.readAsDataURL(files[0]);
      }
      this.error = {
        message: "Désolé, ce navigateur ne supporte pas l'envoi d'image"
      };
      logger.publish(4, "files", "onFilesChange:err", this.error);
      return this.error;
    },

    onRotate(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.$refs[`${this.imgType.toLowerCase()}Croppie`].rotate(
        parseInt(90, 10)
      );
    },

    crop() {
      const options = {
        type: "canvas",
        size: {
          width: this[`${this.imgType.toUpperCase()}_MAX_WIDTH`],
          height: this[`${this.imgType.toUpperCase()}_MAX_HEIGHT`]
        }
      };
      this.$refs[`${this.imgType.toLowerCase()}Croppie`].result(
        options,
        output => {
          //  this.imageUrl = output;
          return this.result(output);
        }
      );
      //  this.$refs[`${this.imgType.toLowerCase()}Croppie`].result(options);
    },

    async result(output) {
      //  this.imageUrl = output;
      const blob = await fetch(output).then(res => res.blob());
      const fileType = blob.type.split("/");
      const blobToFile = new File([blob], `${this.imgType}.${fileType[1]}`, {
        type: blob.type
      });
      this.uploadedFile = await this.$store
        .dispatch("files/onFileImport", {
          accessToken: this.$props.accessToken,
          resourceType: this.$props.resourceType,
          role: this.imgType,
          files: blobToFile
        })
        .catch(err => {
          this.error = err;
          logger.publish(4, "files", "onFileSave:err", err);
          return this.error;
        });

      if (this.isSuccess) {
        logger.publish(4, "files", "onFileSave:res", this.uploadedFile);
        this.source = this.uploadedFile.url;
        this.$refs[`${this.imgType.toLowerCase()}Croppie`].bind({
          url: this.uploadedFile.url
        });
        this.success = { message: "Votre image est enregistré" };
        this.$parent.hide();
        return this.success;
      } else if (this.isFailed) {
        logger.publish(4, "files", "onFileSave:err", "uploadFailed");
        this.error = {
          message: "L'envoi de l'image a échoué, veuillez réessayer"
        };
        return this.error;
      }
      logger.publish(4, "files", "onFileSave:err", "still loading ?");
      return null;
    },

    async onFileSave(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      this.error = null;
      this.success = null;
      // console.log(
      //   "onFileSave:req",
      //   this.$refs[`${this.imgType.toLowerCase()}Croppie`].croppie.data.url,
      // );
      if (
        !this.$refs[`${this.imgType.toLowerCase()}Croppie`].croppie.data.url
      ) {
        return null;
      }
      return this.crop();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../style/file-import.scss";
</style>
