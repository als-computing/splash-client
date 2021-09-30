<template>
  <div class="run-data">
      <div v-if="showImageElement">
        <b-overlay
        id="overlay-background"
        :show="isImageLoading"
        variant="light"
        opacity="0.8"
        rounded="sm">
          <b-img
          ref="image"
          alt= "image of scan"
          id="image"
          fluid
          v-bind:src="'data:image/png;base64,' + image"
          :aria-hidden="isImageLoading ? 'true' : null"/>
        </b-overlay>

        <image-adjuster/>
      </div>
  </div>
</template>

<script>
import ImageAdjuster from '@/components/ImageAdjuster.vue';

export default {
  props: {
    numFrames: Number,
  },
  data: () => ({
    image: [],
    isMetaDataLoading: false,
    isImageLoading: false,
    showImageElement: false,
    isPlotLoaded: false,
    frameNum: '0',
    frameNumDebounced: '0',
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

  mounted() {
    this.validateRoute();
    this.getJpeg(this.$route);
  },

  methods: {
    validateRoute() {
      if (this.$route.query.frame && !this.isPositiveInteger(this.$route.query.frame)) {
        this.$router.replace({ path: this.$route.path, query: { frame: 0 } });
        this.frameNumDebounced = '0';
        this.frameNum = '0';
      } else if (this.$route.query.frame && (Number(this.frameNum) !== Number(this.$route.query.frame))) {
        // console.log('they dont equal each other');
        this.frameNumDebounced = '0';
        this.frameNum = this.$route.query.frame;
      } else if (!this.$route.query.frame) {
        this.frameNumDebounced = '0';
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

    async getJpeg($route) {
      this.setLoading();
      this.isMetaDataLoading = true;
      if ($route.params.catalog && $route.params.uid) {
        let requestUrl = this.$runs_url.concat('/', $route.params.catalog, '/', `${$route.params.uid}/thumb`);
        if (this.$route.query.frame) {
          requestUrl = requestUrl.concat('?frame=', this.$route.query.frame);
        }
        try {
          const response = await this.$api
            .get(requestUrl, {
              responseType: 'arraybuffer',
            });
          this.image = Buffer.from(response.data, 'binary').toString('base64');
          this.setDoneLoading();
        } catch (e) {
          this.setSomethingWentWrong();
          return;
        }
        // await this.getMetadata();
        this.showImageElement = true;
      } else {
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
      }
    },

    // TODO: Generalize this function for different integer types, and different image widths
    constructImage(buffer) {
      const BYTES_PER_ROW = 2048;
      let imageRow;
      let rowEnd;
      for (let rowBegin = 0; rowBegin < buffer.byteLength; rowBegin += BYTES_PER_ROW) {
        rowEnd = rowBegin + BYTES_PER_ROW;
        // slices up to but not including row end
        imageRow = new Uint16Array(buffer.slice(rowBegin, rowEnd));
        this.data[0].z.push(imageRow);
      }
    }, */
  },
  components: {
    'image-adjuster': ImageAdjuster,
  },
};
</script>
