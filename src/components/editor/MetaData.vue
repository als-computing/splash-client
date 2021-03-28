<template>
  <b-card>
    <div class="mx-auto">
      Created at:
      {{
        localDateFromUtc(
          splashMd.create_date
        ).toLocaleDateString()
      }}
    </div>
    <div class="mx-auto">Created by: {{ creatorName }}</div>
    <div class="mx-auto" v-if="splashMd.edit_record.length !== 0">
      Last edited at:
      {{
        localDateFromUtc(splashMd.last_edit).toLocaleDateString()
      }}
    </div>
    <div class="mx-auto" v-if="splashMd.edit_record.length !== 0">
      Edited by: {{ editorName }}
    </div>
  </b-card>
</template>

<script>
import utils from '@/utils';

export default {
  props: {
    splashMd: Object,
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
        console.log(e);
        this.creatorName = 'ERROR';
      }
      if (this.splashMd.edit_record.length > 0) {
        try {
          const resp = await this.$api.get(
            `${this.$users_url}/${this.splashMd.edit_record.slice(-1)[0].user}`,
          );
          this.editorName = `${resp.data.given_name} ${resp.data.family_name}`;
        } catch (e) {
          console.log(e);
          this.editorName = 'ERROR';
        }
      }
    },

  },
  watch: {
    $props: {
      handler() {
        this.retrieveUserData();
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>
