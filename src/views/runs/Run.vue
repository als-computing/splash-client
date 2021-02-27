<template>
  <div >

      <b-container>
          <b-row >
              <b-col >
                <b-card class="m-3">
                  <h3>Summary</h3>
                  <b-table :items="metadata" small bordered hover>
                    <template #cell(name)="data">
                      {{ convertToTitleCase(data.value) }}
                    </template>
                  </b-table>
                </b-card>
              </b-col>
              <b-col lg="4">
                <div class="bg-light m-3">
                  <run-visualizer :numFrames="1"/>
                </div>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-card class="m-3">
                  <h3>Instrument Settings</h3>
                  <b-table :items="stream_configuration" small bordered hover>
                    <template #cell(name)="data">
                      <div class="text-left">{{ data.value }}</div>
                    </template>
                  </b-table>
                </b-card>
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
      stream_configuration: [],
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
      utils.sortNameValueArray(metaArray);
      this.metadata = metaArray

      const streamConfigResponse = await this.$api.get(
        `${this.$runs_url}/${this.$route.params.catalog}/${this.$route.params.uid}/stream/primary/configuration`,
      );

      const streamConfigs = streamConfigResponse.data.all.data;
      const configFields = [];
      Object.entries(streamConfigs).forEach((entry) => {
        configFields.push({ name: entry[0], value: entry[1] });
      });
      utils.sortNameValueArray(configFields);
      this.stream_configuration = configFields;
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
