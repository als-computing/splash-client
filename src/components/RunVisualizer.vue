<template>
  <div class="run-data">
      <!--<plotly v-if="isPlotLoaded" :data="data" :layout="layout" :display-mode-bar="true"></plotly>-->
      <div v-if="showImageElement">
        <b-overlay
        id="overlay-background"
        :show="isImageLoading"
        variant="light"
        opacity="0.8"
        rounded="sm">
          <b-img alt= "image of scan"
          fluid
          v-bind:src="requestUrl"
          @error="setSomethingWentWrong()"
          @loadstart="setLoading()"
          @load="setDoneLoading()"
          :aria-hidden="isImageLoading ? 'true' : null"/>
        </b-overlay>
        <b-form-input id="range-1" v-model="frameNum" type="range" :min="0" :max="numFrames-1"></b-form-input>
        <div class="mt-2">Frame Number: {{ frameNum }},   Beamline Energy: <span v-show="!isMetaDataLoading">{{imageMetadata.beamline_energy}}</span>,   I0: <span v-show="!isMetaDataLoading">{{imageMetadata.i_zero}}</span></div>
      </div>
      <h3 class="display-6" v-if="somethingWentWrong">Something went wrong. Try reloading the page. If the problem persists contact an administrator</h3>
  </div>
</template>

<script>

export default {
  props: {
    numFrames: Number,
  },
  data: () => ({
    isMetaDataLoading: false,
    isImageLoading: false,
    showImageElement: false,
    isPlotLoaded: false,
    frameNum: '0',
    somethingWentWrong: false,
    requestUrl: '',
    imageMetadata: {},
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


  watch: {
    '$route.params': {
      handler() {
        // console.log('watched');
        this.isImageLoading = false;
        this.somethingWentWrong = false;
        this.validateRoute();
        this.getJpeg(this.$route);
        this.isMetaDataLoading = true;
        this.getMetadata();
      },
      deep: true,
      immediate: true,
    },

    frameNum: {
      handler() {
        // console.log('reacting to frame change');
        if (Number(this.frameNum) === Number(this.$route.query.frame)) {
          // console.log('no route change');
          return;
        }
        // console.log('Route change!');
        this.$router.replace({ path: this.$route.path, query: { frame: this.frameNum } });
      },
      immediate: true,
    },
  },

  /* beforeRouteUpdate(to, from, next) {
    console.log('hello');
    if (this.$route.query.frame && !this.isNormalInteger(this.$route.query.frame)) {
      this.$router.replace({ path: this.$route.path });
      return next();
    }
    this.getJpeg(to);
    next();
  }, */

  mounted() {
    // console.log('mounted!');
    this.validateRoute();
    this.getJpeg(this.$route);
  },


  methods: {
    validateRoute() {
      // console.log('validating route!');
      if (this.$route.query.frame && !this.isPositiveInteger(this.$route.query.frame)) {
        this.$router.replace({ path: this.$route.path, query: { frame: 0 } });
        this.frameNum = '0';
      } else if (this.$route.query.frame && (Number(this.frameNum) !== Number(this.$route.query.frame))) {
        // console.log('they dont equal each other');
        this.frameNum = this.$route.query.frame;
      } else if (!this.$route.query.frame) {
        this.frameNum = '0';
      }
    },

    setSomethingWentWrong() {
      this.showImageElement = false;
      this.somethingWentWrong = true;
    },

    setLoading() {
      this.isImageLoading = true;
    },

    setDoneLoading() {
      this.isImageLoading = false;
    },

    isPositiveInteger(str) {
      const n = Math.floor(Number(str));
      return n !== Infinity && String(n) === str && n >= 0;
    },
    // TODO: Implement some sort of caching so that it doesn't request every time
    async getMetadata() {
      let url = this.$route.path.concat('?metadata=true');

      if (this.$route.query.frame) {
        url = url.concat('&frame=', this.$route.query.frame);
      }
      try {
        const response = await this.$api.get(url);
        this.imageMetadata = response.data;
        this.isMetaDataLoading = false;
      } catch (error) {
        this.somethingWentWrong = true;
      }
    },

    getJpeg($route) {
      if ($route.params.catalog && $route.params.uid) {
        this.requestUrl = this.$api_url.concat('/', this.$runs_url.concat('/', $route.params.catalog, '/', $route.params.uid));
        if (this.$route.query.frame) {
          this.requestUrl = this.requestUrl.concat('?frame=', this.$route.query.frame);
        }
        /* const response = await this.$api
          .get(requestUrl, {
            responseType: 'arraybuffer',
          });
        this.image = Buffer.from(response.data, 'binary').toString('base64'); */
        this.showImageElement = true;
      } else {
        this.requestUrl = '';
        this.showImageElement = false;
      }
    },

    /* async getBytes() {
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
      // console.log(buffer.byteLength);
      for (let rowBegin = 0; rowBegin < buffer.byteLength; rowBegin += BYTES_PER_ROW) {
        rowEnd = rowBegin + BYTES_PER_ROW;
        // slices up to but not including row end
        imageRow = new Uint16Array(buffer.slice(rowBegin, rowEnd));
        this.data[0].z.push(imageRow);
      }
    }, */
  },

};
</script>
