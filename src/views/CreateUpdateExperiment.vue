<template>
  <div class="experiment">
    <h1>{{experiment.name}}</h1>
    <b-jumbotron>
        <b-card-group deck>
            <p>Name</p>
            <b-form-input v-model="text" placeholder="Enter experiment name" :id="input_e_name" :type="text"></b-form-input>
        </b-card-group>
    </b-jumbotron>
    <b-button type="submit" @click.stop.prevent="submit()">Submit</b-button>
  </div>
</template>

<script>

import ReadField from '@/components/ReadField.vue';

import axios from 'axios';

const axiosInst = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
export default {
  data() {
    return {
      experiment: {},
    };
  },
  async submit() {
    const result = await axiosInst.post('experiments', this.experiment);

    this.$router.push(`/search?${this.foobar}`);
  },

};
</script>
