<template>
  <div>
    <b-tabs>
      <b-tab title="Journal Article" active>
        <b-card>
          <b-card>
            <h6>Authors</h6>
            <b-input-group class="mb-2">
              <b-form-input placeholder="Last name"></b-form-input>
              <b-form-input placeholder="First name"></b-form-input>
            </b-input-group>
            <b-button variant="link" pill size="sm">
              <b-icon-plus-circle-fill />
            </b-button>
          </b-card>
        </b-card>
      </b-tab>

      <b-tab title="GGG">
        <b-card>
          <b-input-group prepend="Author" class="mb-2">
            <b-form-input placeholder="Last name"></b-form-input>
            <b-form-input placeholder="First name"></b-form-input>
          </b-input-group>
        </b-card>
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import { BIconPlusCircleFill } from 'bootstrap-vue';

export default {
  components: {
    'b-icon-plus-circle-fill': BIconPlusCircleFill,
  },
};

</script>
