<template>
  <div class="company-page">
    <div style="height: 100%;padding-bottom: 62px;">
      <search @on-result-click="resultClick"
              @on-change="getResult"
              :results="results"
              v-model="search"
              position="absolute"
              auto-scroll-to-top>
      </search>
      <group :gutter="0">
        <cell title="企业名称" :value="companyName"></cell>
      </group>
    </div>
    <div style="position: absolute;bottom:0;width: 100%;padding: 10px 20px;">
      <x-button type="primary" @click.native="nextStep">确定</x-button>
    </div>
  </div>
</template>
<script>
  import {Search, Cell, Group, XButton} from "vux"

  export default {
    name: "CompanyInfoPage",
    components: {Search, Cell, Group, XButton},
    data() {
      return {
        companyName: '',
        companyId: '',
        search: '',
        results: [],
      }
    },
    computed: {},
    methods: {
      nextStep: function () {
        if(this.companyName){
          this.$router.push({
            path: '/VisitorRegister', query: {companyId: this.companyId}
          });
        }else{
          this.$utils.Tools.toastShow("请选择被访企业");
        }
      },
      resultClick: function (item) {
        this.companyName = item.title;
        this.companyId = item.companyId;
      },
      getResult: function () {
        if (this.search) {
          this.$api.CompanyInfo.selectListByEntity({
            companyName: this.search
          }).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.results = [];
              if (data.length > 0) {
                data.forEach(item => {
                  const info = {
                    title: item.companyName,
                    companyId: item.companyId
                  };
                  this.results.push(info);
                });
              }
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
    },
    created() {
    },
    mounted() {

    },
    destroyed() {
    }
  }
</script>
<style type="text/scss" lang="scss">
  .company-page {
    width: 100%;
    height: 100%;
    font-size: 0.16rem;
  }
</style>
