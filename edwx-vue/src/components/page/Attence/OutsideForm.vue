<template>
  <div class="page-form">
    <view-box body-padding-top="0" body-padding-bottom="0.62rem">
      <group :gutter="0" label-width="0.8rem">
        <cell title="员工姓名" :value="wxData.userLname"></cell>
        <cell title="记录时间" :value="wxData.recordTime"></cell>
        <!--<cell title="方向" :value="wxData.fx"></cell>-->
        <cell title="考勤地址" :value="wxData.address"></cell>
        <!--<cell title="经度" :value="wxData.lang"></cell>-->
        <!--<cell title="维度" :value="wxData.lat"></cell>-->
        <cell title="客户名称" :value="wxData.customerName"></cell>
        <cell title="备注" :value="wxData.outsideInfo">
        </cell>
        <cell title="审核人" :value="wxData.shenheLname" v-if="$route.query.tabItem === '2'"></cell>
      </group>
      <div class="copyers-title">抄送人</div>
      <dl v-for="(item, index) in copyer" :key="index" class="copyers-info">
        <dt>
          <i class="iconfont icon-touxiang"></i>
        </dt>
        <dd style="color: #999999;">{{item.userName}}</dd>
      </dl>
      <div class="page-bottom" v-if="(wxData.shenhe === null || wxData.shenhe === '') && $route.query.tabItem === '0'">
        <x-button text="通过" type="primary" style="width: 80%" @click.native="submitData"></x-button>
      </div>
    </view-box>
  </div>
</template>
<script>
  import {XInput, Group, XButton, ViewBox, Cell} from 'vux';

  export default {
    name: 'OutsideForm',
    components: {XInput, Group, XButton, ViewBox, Cell},
    data() {
      return {
        id: '',
        wxData: {},
        copyer: [],
      };
    },
    computed: {},
    methods: {
      selectWxByPrimaryKey: function () {
        this.$api.Attence.selectWxByPrimaryKey(this.id).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.wxData = data;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      selectCopyers: function () {
        this.copyer = [];
        this.$api.Copyer.selectCopyUser({
          lx: 7,
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            // this.$utils.Tools.toastShow(msg);
          } else {
            this.copyer.push(...data);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      submitData: function () {
        let params = {
          shenhe: this.$utils.Store.getItem('userSerial'),
          id: this.id,
        };
        this.$api.Attence.updateByPrimaryKey(params).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.Tools.toastShow(msg);
            let that = this;
            setTimeout(() => {
              that.$router.replace('/OutsideList');
            }, 1500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.id = this.$route.query.id;
      this.selectWxByPrimaryKey();
      this.selectCopyers();
    },
    mounted() {
      this.$utils.Store.setItem('tabItem', this.$route.query.tabItem);
    },
    destroyed() {
    },
  };
</script>
<style type="text/scss" lang="scss">
  .page-form {
    width: 100%;
    height: 100%;

    .copyers-title {
      color: #999999;
      font-size: 0.15rem;
      padding: 0.1rem 0.15rem;
    }

    .copyers-info {
      float: left;
      text-align: center;
      font-size: 0.15rem;
      padding-left: 0.15rem;

      i {
        color: #999999;
        font-size: 0.4rem;
      }
    }

    .page-bottom {
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
