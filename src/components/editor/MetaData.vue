<template>
  <b-card>
    <div class="mx-auto">
      Created at:
      {{ localDateFromUtc(splashMd.create_date).toLocaleDateString() }}
    </div>
    <div class="mx-auto">Created by: {{ creatorName }}</div>
    <div class="mx-auto" v-if="splashMd.edit_record.length !== 0">
      Last edited at:
      {{ localDateFromUtc(splashMd.last_edit).toLocaleDateString() }}
    </div>
    <div class="mx-auto" v-if="splashMd.edit_record.length !== 0">
      Edited by: {{ editorName }}
    </div>
    <b-button
      v-show="pastVersionsBtn"
      :to="$route.path + '/v/'"
      :disabled="splashMd.edit_record.length == 0"
      >View past versions</b-button
    >
  </b-card>
</template>

<script>
import utils from '@/utils';

export default {
  props: {
    splashMd: Object,
    pastVersionsBtn: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      editorName: '',
      creatorName: '',
    };
  },
  watch: {
    splashMd: {
      deep: true,
      immediate: true,
      handler() {
        this.retrieveUserData();
      },
    },
  },
  mounted() {
    this.retrieveUserData();
  },
  methods: {
    localDateFromUtc: utils.localDateFromUtc,
    async retrieveUserData() {
      try {
        const resp = await this.$api.get(
          `${this.$users_url}/${this.splashMd.creator}`,
        );
        this.creatorName = `${resp.data.given_name} ${resp.data.family_name}`;
      } catch (e) {
        this.creatorName = 'ERROR';
      }
      if (this.splashMd.edit_record.length > 0) {
        try {
          const resp = await this.$api.get(
            `${this.$users_url}/${this.splashMd.edit_record.slice(-1)[0].user}`,
          );
          this.editorName = `${resp.data.given_name} ${resp.data.family_name}`;
        } catch (e) {
          this.editorName = 'ERROR';
        }
      }
    },

  },
};
</script>
