<template>
  <div >

      <b-container>
          <b-row>
              <b-col  lg="8">
                <b-table :items="metadata" small bordered hover>
                  <template #cell(name)="data">
                    {{ convertToTitleCase(data.value) }}
                  </template>
                </b-table>
              </b-col>
              <b-col lg="4">
                <div class="bg-light m-4">
                  <run-visualizer :numFrames="1"/>
                </div>
              </b-col>
          </b-row>
      </b-container>

  </div>
</template>

<script>
import RunVisualizer from '@/components/RunVisualizer.vue';
import utils from '@/utils';
export default {
  data() {
    return {
      metadata: [],
      fields: ['name', 'value'],
    };
  },

  async mounted() {
    try {
      const response = await this.$api.get(
        `${this.$runs_url}/${this.$route.params.catalog}/${this.$route.params.uid}/metadata`,
      );
      const metaArray = [];
      Object.entries(response.data).forEach((e) => {
        let stringValue = e[1];
        if (stringValue) {
          stringValue = stringValue.toString();
        }
        metaArray.push({ name: e[0], value: stringValue});
      });
      this.metadata = metaArray.sort();
      this.mounted = true;
    } catch (e) {
      this.somethingWentWrong = true;
      console.log(e);
    }

  },
  methods: {
    convertToTitleCase: utils.convertToTitleCase,
  },
  components: {
    "run-visualizer": RunVisualizer,
  },
};
</script>
