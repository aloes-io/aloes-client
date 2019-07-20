<template lang="html">
  <b-modal
    id="team-popup"
    ref="teamPopup"
    :title="teamPopupTitle"
    size="sm"
    hide-footer
    lazy
    class="team-popup-view"
    modal-class="team-popup-modal"
    header-class="team-popup-header"
    body-class="team-popup-body"
    @hidden="onModalHidden"
  >
    <b-button v-if="isMember" class="team-popup-button" @click="delTeamMember">
      Delete
    </b-button>
    <b-button v-else-if="!isMember" class="team-popup-button" @click="addTeamMember">
      Add
    </b-button>
  </b-modal>
</template>

<script type="text/javascript">
import { BButton } from 'bootstrap-vue';
import { BModal } from 'bootstrap-vue';

export default {
  name: 'TeamPopup',

  components: {
    'b-button': BButton,
    'b-modal': BModal,
  },

  props: {
    'account-type': {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      error: null,
      success: null,
      profile: null,
      loading: false,
      isMember: false,
      memberId: null,
    };
  },

  computed: {
    teamPopupTitle: {
      get() {
        if (!this.isMember) {
          return 'Add to the team ?';
        }
        return 'Remove from the team ?';
      },
    },
  },

  methods: {
    onModalHidden() {
      this.error = null;
      this.success = null;
      this.profile = null;
      this.loading = false;
    },

    hideModal() {
      this.$refs.teamPopup.hide();
    },

    showModal(profile, isMember, memberId) {
      this.profile = profile;
      this.memberId = memberId;
      this.isMember = isMember;
      this.$refs.teamPopup.show();
    },

    async addTeamMember(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      await this.$store
        .dispatch('team/addTeamMember', {
          ownerId: this.$store.state.auth.account.id,
          memberId: this.profile.id,
        })
        .then(res => res)
        .catch(err => err);
      return this.hideModal();
    },

    async delTeamMember(evt) {
      if (evt) evt.preventDefault();
      if (evt) evt.stopPropagation();
      await this.$store
        .dispatch('team/delTeamMember', {
          ownerId: this.$store.state.auth.account.id,
          memberId: this.memberId,
        })
        .then(res => res)
        .catch(err => err);
      return this.hideModal();
    },
  },
};
</script>

<style lang="scss">
@import '../../style/team-popup.scss';
</style>
