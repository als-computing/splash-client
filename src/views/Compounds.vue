<template>
  <div>
    <b-container fluid>
      <b-row>
        <b-col class="text-left" cols="8">
          <b-jumbotron header="Model Fluid Platform" lead="">
            <h4>
              The Model Fluid Platform (MFP) describes the hierarchy of fluids
              that will be used among all GAPs.
            </h4>
            <br />
            <p>
              The platform consists of a series of stages to characterize the
              effects of different chemical species on membrane performance.
            </p>
            <p>MFP compounds are selected based on:</p>
            <ol>
              <li>Fundamental properties</li>
              <li>
                Prevalent interactions of the compounds or functional groups
                with membrane fluids and materials
              </li>
              <li>
                Their presence and impact on separation and/or recovery from
                energy related fluids such as produced water
              </li>
            </ol>
          </b-jumbotron>
        </b-col>
        <b-col><b-img :src="require('@/assets/images/mfp.png')" /></b-col>
      </b-row>
    </b-container>
    <pages-wrapper
      title="Compounds"
      button-text="Create Compound Page"
      form-text="Page Title"
      page-type="compound"
      modal-title="Enter Compound Name"
      :hide-category="true"
      :default-documentation="defaultDocumentation"
    />
  </div>
</template>

<script>
import PagesWrapper from '../components/pages/PagesWrapper.vue';

export default {
  components: {
    PagesWrapper,
  },
  data() {
    return {
      defaultDocumentation: '# Relevance to MWET\n# Physiochemical Properties\n# Analysis',
    };
  },
};
</script>

<style>
#edit-container {
  margin: 5px;
  height: 40px;
}
#mfp_main {
  font-size: 0.7em;
}
</style>
