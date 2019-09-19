<template lang="html">
  <b-row class="files-gallery">
    <b-col cols="6" sm="6">
      <b-form-select v-if="filesMeta && filesMeta.length > 0" v-model="fileSelected" class="mb-3">
        <option :value="null">Select a file</option>
        <optgroup label="name">
          <option v-for="meta in filesMeta" :key="meta.name" :value="meta">
            {{ meta.name }}
          </option>
        </optgroup>
      </b-form-select>
    </b-col>
    <b-col cols="6" sm="6">
      <b-form-select
        v-if="fileSelected"
        ref="fileAssignement"
        v-model="fileAssignement"
        :options="assignements"
        size="sm"
      />
    </b-col>

    <!--  assign file to device 
    OTA source
    device icons
     pubKey / privKey-->
  </b-row>
</template>

<script type="text/javascript">
import { BFormSelect } from 'bootstrap-vue';
// import logger from '@/services/logger';
import Collection from '@/views/mixins/collection';

export default {
  name: 'FilesGallery',

  components: {
    'b-form-select': BFormSelect,
  },

  mixins: [Collection],

  props: {
    userId: {
      type: [Object, String],
      required: true,
      default: null,
    },
    relationId: {
      type: String,
      required: false,
      default: null,
    },
    userType: {
      type: String,
      required: true,
      default: 'users',
    },
  },

  data() {
    return {
      error: null,
      success: null,
      fileName: '',
      file: null,
      files: [],
      filesMeta: [],
      fileSelected: null,
      assignements: [
        { text: 'Firmware', value: 'firmware' },
        { text: 'Public Key', value: 'pubKey' },
        { text: 'Private Key', value: 'privKey' },
        { text: 'Icon', value: 'icon' },
      ],
      fileAssignement: null,
    };
  },

  computed: {
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
    // userId: {
    //   handler(value) {
    //     if (value && value !== null) {
    //       return this.getFilesMeta(value);
    //     } else {
    //       this.filesMeta = [];
    //       this.files = [];
    //     }
    //   },
    //   immediate: true,
    // },
    relationId: {
      handler(value) {
        if (value && value !== null && this.$props.userId && this.$props.userId !== null) {
          this.getFilesMeta(this.$props.userId, value);
        } else {
          this.filesMeta = [];
          this.files = [];
        }
      },
      immediate: true,
    },
    fileSelected: {
      handler(value) {
        if (value && value !== null && this.$props.userId) {
          this.getFile(this.$props.userId, value);
        } else {
          this.file = null;
        }
      },
      immediate: true,
    },
    fileAssignement: {
      handler(value) {
        if (value && value !== null && this.$props.userId !== null && this.fileSelected !== null) {
          this.assignRoleToFile(this.$props.userId, this.fileSelected, value);
        } else {
          this.file = null;
        }
      },
      immediate: true,
    },
  },

  mounted() {},

  beforeDestroy() {
    this.onReset();
  },

  methods: {
    async onReset() {
      this.error = null;
      this.success = null;
      this.fileName = '';
      this.file = null;
      this.files = [];
      this.filesMeta = [];
      this.fileSelected = null;
      return this.$store.dispatch('files/onResetFileImport', {
        resourceType: this.$props.resourceType,
        role: this.$props.resourceRole,
      });
    },

    async getFilesMeta(userId, name) {
      try {
        if (!userId) throw new Error('Missing user Id');
        const filesMeta = await this.$store.dispatch('files/getFilesMetaByOwner', {
          ownerId: userId,
          name,
        });
        if (filesMeta) {
          this.filesMeta = filesMeta;
        } else {
          this.filesMeta = [];
        }
        return true;
      } catch (error) {
        throw error;
      }
    },

    async getFile(userId, meta) {
      try {
        if (!userId || !meta || !meta.name) throw new Error('Missing arguments');
        //  console.log('getFile', meta);
        const file = await this.$store.dispatch('files/getFile', {
          ownerId: userId,
          name: meta.name,
        });
        if (file && file !== null) {
          this.file = file;
        } else {
          this.file = null;
        }
        return true;
      } catch (error) {
        throw error;
      }
    },

    async assignRoleToFile(userId, fileMeta, role) {
      try {
        if (!userId || !fileMeta || !role) throw new Error('Missing params');
        fileMeta.role = role;
        const updatedMeta = await this.$store.dispatch('files/updateFileMeta', {
          ownerType: this.$props.userType,
          fileMeta,
        });
        // console.log('updatedMeta', updatedMeta);
        if (updatedMeta && updatedMeta !== null) {
          //  this.files = result.files;
          return this.updateCollection('filesMeta', 'update', updatedMeta);
        }
        return false;
      } catch (error) {
        throw error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/file-import.scss';
</style>
