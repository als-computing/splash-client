<template>
  <div vi>

      <b-container fluid>
          <b-row>
              <b-col  lg="3">
                  <div class="bg-light rounded p-sm m-4">
                    <read-fields :fields="metadata" name="name" value="value"></read-fields>
                  </div>
              </b-col>
              <b-col lg="8">
                <div class="bg-light m-4">
                      <run-visualizer :numFrames="1"/>
                </div>
              </b-col>
          </b-row>
      </b-container>
  </div>
</template>

<script>
import RunVisualizer from "@/components/RunVisualizer.vue";
import ReadFields from "@/components/ReadFields.vue";
import utils from "@/views/utils";

export default {
  data() {
    return {
        metadata: []
    };
  },
async mounted() {
    try {
      const response = await this.$api.get(
        `${this.$runs_url}/${this.$route.params.catalog}/${this.$route.params.uid}/metadata`
      );
      const meta_array = [];
      for (let field in response.data){
          meta_array.push({"name": field, "value": response.data[field]})
      }
      this.metadata = meta_array.sort();
      this.mounted = true;
      console.log("mounted");
    } catch (e) {
      this.somethingWentWrong = true;
      console.log(e);
    }

  },
  methods: {
  },
  components: {
    "read-fields": ReadFields,
    "run-visualizer": RunVisualizer
  }
};
</script>