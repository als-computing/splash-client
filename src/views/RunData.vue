<template>
  <div class="run-data">
    <plotly v-if="isLoaded" :data="data" :layout="layout" :display-mode-bar="false"></plotly>

    <div class="container">

    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    isLoaded: false,
    data: [
      {
        type: 'heatmapgl',
        z: [],
      },
    ],
    layout: {
      title: 'hello',
      width: 1024,
      height: 1024,
    },
  }),

  async mounted() {
    try {
      this.isLoaded = false;
      const data = { run_uid: '2c350117-dd92-4587-9f97-c4648fdeac5d', catalog: 'RSoXS_11012' };
      // TODO: Force axios to interpret error responses as JSON not as arraybuffer:
      // https://github.com/axios/axios/issues/815
      const response = await this.$api({
        url: this.$runs_url, responseType: 'arraybuffer', method: 'POST', data,
      });
      this.constructImage(response.data);
      this.isLoaded = true;
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
  // TODO: Generalize this function for different integer types, and different image widths
    constructImage(buffer) {
      const BYTES_PER_ROW = 2048;
      let imageRow;
      let rowEnd;
      console.log(buffer.byteLength);
      for (let rowBegin = 0; rowBegin < buffer.byteLength; rowBegin += BYTES_PER_ROW) {
        rowEnd = rowBegin + BYTES_PER_ROW;
        // slices up to but not including row end
        imageRow = new Uint16Array(buffer.slice(rowBegin, rowEnd));
        this.data[0].z.push(imageRow);
      }
    },
  },

};
</script>
