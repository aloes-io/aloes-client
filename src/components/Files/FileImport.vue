<template lang="html">
  <div class="file-import">
    <div v-if="isSaving">
      <fa-icon icon="spinner" :transform="{ rotate: 42 }" size="lg" />
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
        <!-- <img :src="imageUrl" /> -->
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
          <label :for="`${resourceType.toLowerCase()}${imgType}-uploader`" class="add-file">
            {{ importBtnTitle }}
          </label>
          <input
            :id="`${resourceType.toLowerCase()}${imgType}-uploader`"
            :disabled="isSaving"
            :accept="mimetype"
            type="file"
            class="input-file"
            @change="onFilesChange($event.target.files, $event.target.files.length)"
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
          <fa-icon icon="circle" class="failed" size="lg" />
          {{ error.message }}
        </b-alert>
        <b-alert v-if="success" :show="success !== null" variant="success">
          <fa-icon icon="circle" class="file-added" size="lg" />
          {{ success.message }}
        </b-alert>
      </b-col>
    </b-row>
  </div>
</template>

<script type="text/javascript">
import { BAlert } from 'bootstrap-vue';
import { BButton } from 'bootstrap-vue';
import { BForm } from 'bootstrap-vue';
import Notification from '@/mixins/notification';
import File from '@/mixins/file';
import logger from '@/services/logger';

export default {
  name: 'FileImport',

  components: {
    'b-alert': BAlert,
    'b-button': BButton,
    'b-form': BForm,
  },

  mixins: [File, Notification],

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
      error: null,
      success: null,
      imgType: null,
      rscType: null,
      maxSize: 10000000,
      fileCount: null,
      fileName: '',
      imageUrl: '',
      uploadedFile: null,
      imgEditor: null,
      elementsMounted: false,
      STATUS_INITIAL: this.$store.state.files.STATUS_INITIAL,
      STATUS_SAVING: this.$store.state.files.STATUS_SAVING,
      STATUS_SUCCESS: this.$store.state.files.STATUS_SUCCESS,
      STATUS_FAILED: this.$store.state.files.STATUS_FAILED,
      HEADER_MAX_WIDTH: 820,
      HEADER_MAX_HEIGHT: 312,
      AVATAR_MAX_WIDTH: 170,
      AVATAR_MAX_HEIGHT: 170,
    };
  },

  computed: {
    importBtnTitle() {
      if (this.isFailed) return 'Try again';
      return 'Import a picture';
    },
    mimetype() {
      return `${this.rscType.toLowerCase().slice(0, this.rscType.lastIndexOf('s'))}/*`;
    },
    filetype() {
      return `${this.rscType.toLowerCase().slice(0, this.rscType.lastIndexOf('s'))}`;
    },
    serverUrl() {
      return this.$store.state.serverUrl;
    },
    defaultImgUrl() {
      return this.$store.state.imgPlaceholder;
    },
    isInitial: {
      get() {
        return this.$store.state.files[this.rscType][this.imgType].status === this.STATUS_INITIAL;
      },
    },
    isSaving: {
      get() {
        return this.$store.state.files[this.rscType][this.imgType].status === this.STATUS_SAVING;
      },
    },
    isSuccess: {
      get() {
        return this.$store.state.files[this.rscType][this.imgType].status === this.STATUS_SUCCESS;
      },
    },
    isFailed: {
      get() {
        return this.$store.state.files[this.rscType][this.imgType].status === this.STATUS_FAILED;
      },
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
    owner() {
      if (this.$route.name === 'account' || this.$route.name === 'profile') {
        return this.$store.state.auth.account;
      } else if (this.$route.name === 'application') {
        return this.$store.state.application.instance;
      }
      return null;
    },
    source: {
      get() {
        if (this.$route.name === 'account' || this.$route.name === 'profile') {
          return `${this.serverUrl}${
            this.$store.state.auth.account[`${this.imgType.toLowerCase()}ImgUrl`]
          }`;
        } else if (this.$route.name === 'application') {
          return `${this.serverUrl}${this.$store.state.application.instance.icon}`;
        }
        return null;
      },
      set(value) {
        if (this.$route.name === 'account' || this.$route.name === 'profile') {
          this.$store.commit('auth/setModelKV', {
            key: `${this.imgType.toLowerCase()}ImgUrl`,
            value,
          });
        } else if (this.$route.name === 'application') {
          this.$store.commit('application/setModelKV', {
            key: 'icon',
            value,
          });
        }
      },
    },

    ratio() {
      if (this.imgType.toLowerCase() === 'header') {
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
        if (this.imgType.toLowerCase() === 'header') {
          return 820 / this.ratio;
        }
        return 170 / this.ratio;
      },
    },
    maxBoundaryHeight: {
      get() {
        if (this.imgType.toLowerCase() === 'header') {
          return 312 / this.ratio;
        }
        return 170 / this.ratio;
      },
    },
    maxViewportWidth: {
      get() {
        if (this.imgType.toLowerCase() === 'header') {
          return 820 / 1.2 / this.ratio;
        }
        return 170 / 1.2 / this.ratio;
      },
    },
    maxViewportHeight: {
      get() {
        if (this.imgType.toLowerCase() === 'header') {
          return 312 / 1.2 / this.ratio;
        }
        return 170 / 1.2 / this.ratio;
      },
    },
    windowWidth: {
      get() {
        return this.$store.state.windowWidth;
      },
    },
    windowHeight: {
      get() {
        return this.$store.state.windowHeight;
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

  async mounted() {
    await this.getImg();
    this.mountElements();
  },

  beforeDestroy() {
    this.onReset();
  },

  methods: {
    mountElements() {
      this.imgEditor = this.$refs[`${this.imgType.toLowerCase()}Croppie`];
      if (!this.imgEditor) {
        this.elementsMounted = false;
      } else {
        this.imgEditor.refresh();
        if (this.imageUrl && this.imageUrl !== null) {
          this.imgEditor.bind({
            url: this.imageUrl,
          });
        } else {
          this.imgEditor.bind({
            url: this.defaultImgUrl,
          });
        }
        this.elementsMounted = true;
      }
    },

    onReset() {
      this.error = null;
      this.success = null;
      this.imageUrl = null;
      this.imgEditor = null;
      this.uploadedFile = null;
      this.elementsMounted = false;
      this.status = this.STATUS_INITIAL;
      this.$store.dispatch('files/onResetFileImport', {
        resourceType: this.rscType,
        role: this.imgType,
      });
    },

    async getImg() {
      try {
        if (this.source && this.source !== null) {
          const file = await this.$store.cache.dispatch('files/download', this.source);
          if (file && file !== null) {
            const dataUrl = await this.parseImage(file);
            this.imageUrl = dataUrl;
          } else {
            this.imageUrl = null;
          }
        }
        return this.imageUrl;
      } catch (error) {
        this.imageUrl = this.defaultImgUrl;
        throw error;
      }
    },

    async onFilesChange(files, count) {
      try {
        if (!this.elementsMounted) return;
        logger.publish(4, 'files', 'onFilesChange:req', count);
        this.error = null;
        this.success = null;
        if (files && files[0]) {
          this.fileName = files[0].name;
          this.imageUrl = await this.parseImage(files[0]);
          this.imgEditor.bind({
            url: this.imageUrl,
          });
          return;
        }
        const error = new Error("Sorry your browser can't send this picture");
        throw error;
      } catch (error) {
        this.error = error;
        logger.publish(4, 'files', 'onFilesChange:err', error);
        throw error;
      }
    },

    onRotate(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      if (!this.elementsMounted) return;
      this.imgEditor.rotate(parseInt(90, 10));
    },

    async onResult(output) {
      try {
        let blob;
        if (output instanceof Blob) {
          blob = output;
        } else {
          blob = await fetch(output).then(res => res.blob());
        }
        if (!blob || !blob.type) {
          const error = new Error('Error while creating Blob');
          throw error;
        }
        logger.publish(4, 'files', 'onResult:req', blob);
        this.uploadedFile = await this.$store.dispatch('files/onFileImport', {
          resourceType: this.rscType,
          ownerId: this.$store.state.auth.account.id,
          role: this.imgType,
          file: blob,
          name: `${this.imgType}.${blob.type.split('/')[1]}`,
        });

        if (this.isSuccess) {
          logger.publish(4, 'files', 'onResult:res', this.uploadedFile);
          this.source = this.uploadedFile.url;
          // this.updateAccount(this.onwer)
          //  await this.getImg();
          // this.imgEditor.refresh();
          // this.imgEditor.bind({
          //   url: this.imageUrl,
          // });
          this.success = { message: 'Picture saved' };
          return;
        } else if (this.isFailed) {
          const error = new Error('File upload has failed, please try again');
          throw error;
        }
        logger.publish(4, 'files', 'onResult:err', 'still loading ?');
        return;
      } catch (error) {
        this.error = error;
        logger.publish(4, 'files', 'onResult:err', error);
        throw error;
      }
    },

    onFileSave(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      if (!this.elementsMounted) return;
      this.error = null;
      this.success = null;
      if (!this.imgEditor.croppie || !this.imgEditor.croppie.data.url) {
        return;
      }
      logger.publish(4, 'files', 'onFileSave:req', this.imgEditor.croppie.data.url);
      const options = {
        type: 'blob',
        // type: 'rawcanvas',
        size: {
          width: this[`${this.imgType.toUpperCase()}_MAX_WIDTH`],
          height: this[`${this.imgType.toUpperCase()}_MAX_HEIGHT`],
        },
      };
      this.imgEditor.result(options, this.onResult);
      return;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/file-import.scss';
</style>
