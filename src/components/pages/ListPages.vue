<template>
  <div>
    <b-container fluid>
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
    </b-container>
  </div>
</template>

<script>
import utils from '@/utils';

const { localDateFromUtc } = utils;

const PAGE_SIZE = 5;
export default {
  props: {
    pageType: String,
    hideCategory: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fields: [
        {
          key: 'page.title',
          label: 'Title',
        },
        {
          key: 'page.page_type',
          label: 'Type',
          formatter(value) {
            switch (value) {
              case 'compound':
                return 'Compound';
              case 'generic_page':
                return '-';
              default:
                return value;
            }
          },
        },
        {
          key: 'page.splash_md.create_date',
          label: 'Created',
          formatter(value) {
            // Append .000Z so that Date knows it's UTC time
            const date = localDateFromUtc(value);
            return date.toLocaleDateString();
          },
        },
        {
          key: 'createUser',
          label: 'Created By',
          formatter(value) {
            if (value === null) return '-';
            return `${value.given_name} ${value.family_name}`;
          },
        },
        {
          key: 'page.splash_md.last_edit',
          label: 'Last Edited',
          formatter(value, key, item) {
            // Don't print an edit date if the edit record is empty,
            // In this case last_edit === create_date
            if (item.page.splash_md.edit_record.length === 0) return '-';
            // Append .000Z so that Date knows it's UTC time
            const dateObj = localDateFromUtc(value);
            const date = dateObj.toLocaleDateString();
            return date;
          },
        },
        {
          key: 'editUser',
          label: 'Last Edited By',
          formatter(value) {
            if (value === null) return '-';
            return `${value.given_name} ${value.family_name}`;
          },
        },
      ],
      error: false,
      pages: [],
      pagesLoading: false,
      allItems: false,
    };
  },

  async mounted() {
    if (this.hideCategory === true) {
      this.fields.splice(1, 1);
    }
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
      let response;
      if (this.pageType === undefined) {
        try {
          response = await this.$api.get(this.$pages_url + query, config);
        } catch (e) {
          console.log(e);
          this.$emit('errorConnecting');
          return 0;
        }
      } else {
        try {
          response = await this.$api.get(
            `${this.$pages_url}/page_type/${this.pageType}${query}`,
            config,
          );
        } catch (e) {
          console.log(e);
          this.$emit('errorConnecting');
          return 0;
        }
      }
      const newTableItems = await Promise.all(
        response.data.map(async (elem) => {
          let createUser;
          try {
            const resp = await this.$api.get(
              `${this.$users_url}/${elem.splash_md.creator}`,
              config,
            );
            createUser = resp.data;
          } catch (e) {
            console.log(e);
            createUser = null;
          }

          let editUser;
          if (elem.splash_md.edit_record.length === 0) {
            editUser = null;
          } else {
            try {
              const resp = await this.$api.get(
                `${this.$users_url}/${elem.splash_md.edit_record.slice(-1)[0].user}`,
                config,
              );
              editUser = resp.data;
            } catch (e) {
              console.log(e);
              createUser = null;
            }
          }
          return { page: elem, editUser, createUser };
        }),
      );
      this.pages.push(...newTableItems);
      return response.data.length;
    },
    rowClickHandler(element) {
      this.$router.push({ path: `pages/${element.page.uid}` });
    },
  },
};
</script>
