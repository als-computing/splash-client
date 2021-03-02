<template>
  <div>
    <b-table
      striped
      hover
      :items="pages"
      :fields="fields"
      responsive="true"
      @row-clicked="rowClickHandler"
    >
    </b-table>
    <div class="d-flex justify-content-center mb-3">
      <b-spinner v-if="pagesLoading" label="Loading..."></b-spinner>
    </div>
  </div>
</template>

<script>
const PAGE_SIZE = 5;
export default {
  props: {
    pageType: String,
  },
  data() {
    return {
      fields: [{ key: 'title', label: 'Title' }],
      error: false,
      pages: [],
      pagesLoading: false,
      allItems: false,
    };
  },

  async mounted() {
    this.pagesLoading = true;
    await this.fillWindowWithRuns();
    this.pagesLoading = false;
    this.scroll();
  },
  methods: {
    async scroll() {
      window.onscroll = async () => {
        if (this.allItems === true) {
          return;
        }
        this.pagesLoading = true;
        const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight
          === document.documentElement.offsetHeight;
        if (bottomOfWindow) {
          const numToAdd = await this.addPages(this.pages.length / PAGE_SIZE + 1, PAGE_SIZE);
          if (numToAdd < PAGE_SIZE) {
            this.allItems = true;
          }
        }
        this.pagesLoading = false;
      };
    },

    async fillWindowWithRuns() {
      if (this.allItems === true) {
        return;
      }
      while (true) {
        if (this.$el.getBoundingClientRect().bottom > 1.5 * window.innerHeight) {
          this.pagesLoading = false;
          break;
        }
        const numToAdd = await this.addPages(this.pages.length / PAGE_SIZE + 1, PAGE_SIZE);
        if (numToAdd < PAGE_SIZE) {
          this.pagesLoading = false;
          this.allItems = true;
          break;
        }
      }
    },

    async addPages(page, page_size) {
      const query = `?page=${page}&page_size=${page_size}`;
      const config = { headers: { 'Content-Type': 'application/json' } };
      if (this.pageType === undefined) {
        try {
          const response = await this.$api.get(this.$pages_url + query, config);
          this.pages.push(...response.data);
          return response.data.length;
        } catch (e) {
          console.log(e);
          this.$emit('errorConnecting');
          return 0;
        }
      } else {
        try {
          const response = await this.$api.get(`${this.$pages_url}/page_type/${this.pageType}${query}`, config);
          this.pages.push(...response.data);
          return response.data.length;
        } catch (e) {
          console.log(e);
          this.$emit('errorConnecting');
          return 0;
        }
      }
    },
    rowClickHandler(page) {
      this.$router.push({ path: `pages/${page.uid}` });
    },
  },
};
</script>
