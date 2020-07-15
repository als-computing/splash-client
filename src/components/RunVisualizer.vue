<template>
  <div class="run-data">
      <plotly v-if="isPlotLoaded" :data="data" :layout="layout" :display-mode-bar="true"></plotly>
      <b-img alt= "image of scan" v-if="isImageLoaded" fluid v-bind:src="requestUrl" @error="setSomethingWentWrong()" />
      <h3 class="display-6" v-if="somethingWentWrong">Something went wrong. Try reloading the page. If the problem persists contact an administrator</h3>
  </div>
</template>

<script>

export default {
  data: () => ({
    isImageLoaded: false,
    isPlotLoaded: false,
    imageNotFound: false,
    somethingWentWrong: false,
    requestUrl: '',
    image: '',
    data: [
      {
        type: 'heatmapgl',
        z: [],
      },
    ],
    layout: {
      title: '',
      width: 1024,
      height: 1024,
    },
  }),
  /* beforeRouteUpdate(to, from, next) {
    this.imageNotFound = false;
    this.somethingWentWrong = false;
    this.isImageLoaded = false;
    this.isPlotLoaded = false;
    this.getJpeg(to);
    next();
  }, */

  async mounted() {
    this.getJpeg(this.$route);
  },
  methods: {
    async setSomethingWentWrong() {
      this.isImageLoaded = false;
      this.somethingWentWrong = true;
    },
    async getJpeg($route) {
      if ($route.params.catalog && $route.params.uid) {
        this.requestUrl = this.$api_url.concat('/', this.$runs_url.concat('/', $route.params.catalog, '/', $route.params.uid));
        /* const response = await this.$api
          .get(requestUrl, {
            responseType: 'arraybuffer',
          });
        this.image = Buffer.from(response.data, 'binary').toString('base64'); */
        this.isImageLoaded = true;
      } else {
        this.requestUrl = '';
        this.isImageLoaded = false;
      }
    },
    async getBytes() {
      try {
        this.isLoaded = false;
        this.layout.title = `Preview of ${this.$route.params.uid}`;
        // TODO: Force axios to interpret error responses as JSON not as arraybuffer:
        // https://github.com/axios/axios/issues/815

        const requestUrl = this.$runs_url.concat('/', this.$route.params.catalog, '/', this.$route.params.uid);

        const response = await this.$api({
          url: requestUrl, responseType: 'arraybuffer', method: 'GET',
        });
        this.constructImage(response.data);
        this.isPlotLoaded = true;
      } catch (e) {
        console.error(e);
      }
    },
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
