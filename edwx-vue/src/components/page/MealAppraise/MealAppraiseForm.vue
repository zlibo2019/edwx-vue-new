<template>
  <div class="page-form">
    <view-box body-padding-top="0" :body-padding-bottom="operation==='1'?'0.62rem':'0'">
      <group :gutter="0">
        <cell title="餐别名称" :value="form.mealName"></cell>
        <cell title="消费金额" :value="form.mealMoneyCn"></cell>
        <cell title="消费时间" :value="form.mealDate"></cell>
      </group>
        <i style="font-size: 1rem;position: absolute;top: 0;right: 0.6rem;color: #00CC66" class="iconfont icon-shenpimanyi" v-if="form.mealAppraise === '1'"></i>
        <i style="font-size: 1rem;position: absolute;top: 0;right: 0.6rem;color: #FF3333" class="iconfont icon-shenpibumanyi" v-if="form.mealAppraise === '2'"></i>
      <group title="菜品明细" class="food-detail" v-if="form.list && form.list.length > 0">
        <cell v-for="(item, index) in form.list" :key="index" :title="item.menuName"
              :value="item.newMoneyCn"></cell>
      </group>
      <div class="page-bottom" v-if="operation==='1'">
        <x-button text="不满意" type="primary" style="width: 45%;" @click.native="submitData('2')"></x-button>
        <span></span>
        <x-button text="满意" type="primary" style="width: 45%;" @click.native="submitData('1')"></x-button>
      </div>
    </view-box>
  </div>
</template>
<script>
  import {Group, Cell, XButton, ViewBox} from 'vux';

  export default {
    name: 'MealAppraiseForm',
    components: {Group, Cell, XButton, ViewBox},
    data() {
      return {
        xh: '',
        // currDate: '',
        operation: '',
        // btnText: '',
        // list: [[]],
        // select: [],
        // appraiseOptions: [{key: '1', value: '满意'}, {key: '2', value: '不满意'}],
        form: {
          bh: '',
          userSerial: '',
          mealId: '',
          mealName: '',
          mealDate: '',
          mealAppraise: '',
          mealMoneyCn: '',
        },
      };
    },
    computed: {},
    methods: {
      getRecordInfo: function () {
        this.$utils.Tools.loadShow();
        this.$api.MealAppraise.selectByPrimaryKey(this.xh).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.form = data;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      submitData: function (val) {
        // if (!this.form.mealAppraise) {
        //   this.$utils.Tools.toastShow('请选择就餐评价');
        //   return;
        // }
        this.form.mealAppraise = val;
        this.$api.MealAppraise.updateByPrimaryKey(this.form).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.Tools.toastShow(msg);
            setTimeout(() => {
              this.$router.replace('/MealAppraiseList');
              this.$router.go(-1);
            }, 1500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.xh = this.$route.query.xh;
      this.operation = this.$route.query.operation;
      if (this.xh) {
        this.getRecordInfo();
        // this.btnText = '提交';
      } else {
        // this.btnText = '提交';
      }
    },
    mounted() {
    },
    destroyed() {
    },
  };
</script>
<style type="text/scss" lang="scss">
  .page-form {
    width: 100%;
    height: 100%;

    .weui-cells__title {
      color: #3399ff;
    }

    .food-detail {

      .weui-cells {
        /*overflow-y: auto;*/
        /*height: 2rem;*/

        &::after {
          /*border-bottom: none;*/
        }
      }
    }

    .page-bottom {
      background-color: #ffffff;
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      position: absolute;
      z-index: 500;
      bottom: 0;
      width: 100%;
      padding: 0.1rem 0;
    }
  }
</style>
