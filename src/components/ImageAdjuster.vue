<template>
    <div id='info-box'> 
        
        <div>
            <label>brightness</label>
            <b-form-input type="range" v-model="brightness" min="0" max="200" step="5" @update="changeBrightness" ></b-form-input>

            <label>contrast</label>
            <b-form-input type="range" v-model="contrast" min="0" max="200" step="5" @update="changeContrast" ></b-form-input>
<!-- 
            <label>saturation</label>
            <b-form-input type="range" v-model="saturation" min="0" max="1000" step="25" @update="changeSaturation" ></b-form-input> -->
        </div>
    </div>
</template>

<script>
export default {
    // https://codepen.io/khr2003/pen/GwdaEG
    data(){
        return{
            image: null,
            brightness: 100,
            contrast: 50,
            // saturation: 50
        }
    },
    mounted(){

        
    },
    created() {
        this.image = this.$parent.$refs.image
    },
    props: {
        // image: null
    },
    methods: {
        handleUpdate: function(filter, index) {
            const filterSpecs = this.filterSpecs[index]
            var newValue = filter.amount;
            filter.changed = true;
            this.filters[index].changed = true;
        },
        changeBrightness: function(value){
             this.image.style.filter = 'brightness(' + value + '%)';
        },
        changeContrast: function(value){
             this.image.style.filter = 'contrast(' + value + '%)';
        }
        // changeSaturation: function(value){
        //      this.image.style.filter = 'saturate(' + value + '%)';
        // }
    }
};


</script>
<style scoped>


</style>