<template lang="html">
  <div class="file-import">
    <div v-if="isSaving">
      <fa-icon icon="spinner" :transform="{ rotate: 42 }" size="lg" />
      uploading {{ fileCount }} files...
    </div>
    <b-row v-else-if="!isSaving" align-h="center"> </b-row>
    <b-row align-h="center">
      <b-col cols="6" sm="6">
        <b-form
          v-if="isInitial || isFailed || isSuccess"
          :ref="`device-file-uploader`"
          enctype="multipart/form-data"
          novalidate
          class="file-uploader"
        >
          <label :for="`device-file-uploader`" class="add-file">
            {{ importBtnTitle }}
          </label>
          <input
            :id="`device-file-uploader`"
            :disabled="isSaving"
            :accept="mimetype"
            type="file"
            class="input-file"
            @change="
              onFilesChange($event.target.name, $event.target.files);
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
          :class="`device-file-save-button`"
          :disabled="isSaving"
          @click.prevent.stop="onFileSave"
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

          {{ error }}
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
import { BAlert, BButton, BForm } from 'bootstrap-vue';
import logger from '@/services/logger';

export default {
  name: 'DeviceFiles',

  components: {
    'b-alert': BAlert,
    'b-button': BButton,
    'b-form': BForm,
  },

  props: {
    device: {
      type: Object,
      required: true,
      default: null,
    },
    'resource-type': {
      type: String,
      required: false,
      default: 'Binaries',
    },
    'resource-role': {
      type: String,
      required: false,
      default: 'Firmware',
    },
  },

  data() {
    return {
      error: null,
      success: null,
      imgType: null,
      mimetype: `${this.$props.resourceType
        .toLowerCase()
        .slice(0, this.$props.resourceType.lastIndexOf('s'))}/*`,
      filetype: `${this.$props.resourceType
        .toLowerCase()
        .slice(0, this.$props.resourceType.lastIndexOf('s'))}`,
      maxSize: 10000000,
      fileCount: null,
      fileName: '',
      imageUrl: '',
      uploadedFile: null,
      STATUS_INITIAL: this.$store.state.files.STATUS_INITIAL,
      STATUS_SAVING: this.$store.state.files.STATUS_SAVING,
      STATUS_SUCCESS: this.$store.state.files.STATUS_SUCCESS,
      STATUS_FAILED: this.$store.state.files.STATUS_FAILED,
    };
  },

  computed: {
    importBtnTitle: {
      get() {
        if (this.isFailed) return 'Try again';
        return 'Import a file';
      },
    },
    isInitial: {
      get() {
        return (
          this.$store.state.files[this.$props.resourceType][this.$props.resourceRole].status ===
          this.STATUS_INITIAL
        );
      },
    },
    isSaving: {
      get() {
        return (
          this.$store.state.files[this.$props.resourceType][this.$props.resourceRole].status ===
          this.STATUS_SAVING
        );
      },
    },
    isSuccess: {
      get() {
        return (
          this.$store.state.files[this.$props.resourceType][this.$props.resourceRole].status ===
          this.STATUS_SUCCESS
        );
      },
    },
    isFailed: {
      get() {
        return (
          this.$store.state.files[this.$props.resourceType][this.$props.resourceRole].status ===
          this.STATUS_FAILED
        );
      },
    },
    status: {
      get() {
        return this.$store.state.files[this.$props.resourceType][this.$props.resourceRole].status;
      },
      set(status) {
        this.$store.commit('files/setUploadStatus', {
          resourceType: this.$props.resourceType,
          role: this.$props.resourceRole,
          status,
        });
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

  watch: {},

  mounted() {},

  beforeDestroy() {
    this.onReset();
  },

  methods: {
    async onReset() {
      this.error = null;
      this.success = null;
      this.imageUrl = null;
      this.uploadedFile = null;
      this.status = this.STATUS_INITIAL;
      if (this.$props.resourceType) {
        return this.$store.dispatch('files/onResetFileImport', {
          resourceType: this.$props.resourceType,
          role: this.$props.resourceRole,
        });
      }
      return null;
    },

    onFilesChange(name, files) {
      try {
        //  console.log('onFilesChange', name, files);
        // if (this.fileCount === 1)
        if (!this.$props.device || !this.$props.device.id) return null;
        this.error = null;
        this.success = null;
        this.fileName = name || files[0].name;
        //  this.uploadedFile = files[0];
        const reader = new FileReader();
        reader.onload = () => {
          this.uploadedFile = reader.result;
        };
        reader.readAsArrayBuffer(files[0]);
        return null;
      } catch (error) {
        this.error = error;
        logger.publish(4, 'files', 'onFileChange:err', error);
        return error;
      }
    },

    async onFileSave() {
      try {
        //  logger.publish(4, 'files', 'onFileSave:req', this.uploadedFile);
        if (!this.$props.device || !this.$props.device.id) return null;
        this.error = null;
        this.success = null;

        // todo : format file name base on deviceId, resourceRole
        const buffer = Buffer.from(this.uploadedFile);
        this.uploadedFile = await this.$store.dispatch('files/uploadBuffer', {
          resourceType: this.$props.resourceType,
          role: this.$props.resourceRole,
          buffer,
          name: `${this.$props.device.id}-${this.fileName}`,
          ownerId: this.$props.device.ownerId,
        });

        if (this.isSuccess) {
          logger.publish(4, 'files', 'onFileSave:res', this.uploadedFile);
          //  this.source = this.uploadedFile.url;
          this.success = { message: 'File saved' };
          return this.success;
        } else if (this.isFailed) {
          logger.publish(4, 'files', 'onFileSave:err', 'uploadFailed');
          this.error = {
            message: 'File upload has failed, please try again',
          };
          return this.error;
        }
        logger.publish(4, 'files', 'onFileSave:err', 'still loading ?');
        return null;
      } catch (error) {
        this.error = error;
        logger.publish(4, 'files', 'onFileSave:err', error);
        return error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/file-import.scss';
</style>
