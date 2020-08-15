<template>
  <div class="application">
    <div class="top-box">
      <grid :show-lr-borders="false" :show-vertical-dividers="false">
        <grid-item v-for="item in navData" :key="item.value" @on-item-click="navClick(item.iconUrlId)"
                   v-if="item.spareCol1==='0'">
          <i slot="icon" :class="item.iconId" :style="{'color': item.spareCol3}"></i>
          <span slot="label">{{item.menuName}}</span>
        </grid-item>
      </grid>
    </div>
    <div class="nav-box">
      <grid :show-lr-borders="false" :show-vertical-dividers="false" :cols="3">
        <grid-item v-for="item in navData" :key="item.value" @on-item-click="navClick(item.iconUrlId)"
                   v-if="item.spareCol1==='1'">
          <i slot="icon" :class="item.iconId" :style="{'color': item.spareCol3}"></i>
          <span slot="label">{{item.menuName}}</span>
        </grid-item>
      </grid>
    </div>
  </div>
</template>
<script>
  import {
    Grid, GridItem,
  } from 'vux';

  export default {
    name: 'Application',
    components: {
      Grid,
      GridItem,
    },
    data() {
      return {
        navData: [],
      };
    },
    computed: {},
    methods: {
      getHomeMenu() {
        this.$utils.Tools.loadShow();
        this.$api.Home.getHomeMenu({
          companyId: 0,
          userId: this.$utils.Store.getItem('userSerial'),
          spareCol2: 1,
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.loadHide();
            this.$utils.Tools.toastShow(msg);
          } else {
            this.navData = data;
            this.$utils.Store.setLocalItem('menuApp', JSON.stringify(data));
            this.$utils.Tools.loadHide();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      navClick(value) {
        if (value === '' || value === null) {
          this.$utils.Tools.toastShow('功能暂未开放');
        } else {
          this.$router.push(value);
        }
      },
      getUserPower: async function () {
        this.$utils.Tools.loadShow();
        let response = await this.$api.UserPower.selectByPrimaryKey(this.$utils.Store.getItem('userSerial'));
        this.$utils.Tools.loadHide();
        const {code, msg, data} = response;
        if (+code !== this.$code.success) {
          this.$utils.Tools.toastShow(msg);
        } else {
          if (data) {
            this.$params.setApprove(data.userType + '');
            this.$params.setCopyuser(data.userType + '');
          }
        }
      },
    },
    async created() {
      if (this.$params.appcopy === '1') {
        await this.getUserPower();
      }

      this.navData = JSON.parse(this.$utils.Store.getLocalItem('menuApp'));
      this.getHomeMenu();
      this.$utils.Store.removeItem('bh');
      this.$utils.Store.removeItem('oldVal');
      this.$utils.Store.removeItem('approver');
      this.$utils.Store.removeItem('copyer');
      this.$utils.Store.removeItem('customer');
      this.$utils.Store.removeItem('henchman');
      this.$utils.Store.removeItem('imgList');
      this.$utils.Store.removeItem('applyItem');
      this.$utils.Store.removeItem('applyLx');
      this.$utils.Store.removeItem('approvalItem');
      this.$utils.Store.removeItem('approvalLx');
    },
    mounted() {
      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/')  //输入要返回的上一级路由地址
      // }
    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .application {
    width: 100%;
    height: 100%;
    background: #F4F5F9;

    .top-box {
      width: 100%;
      height: auto;
      background: #3399ff;

      .weui-grids {
        .weui-grid {
          padding: 0.15rem;

          &:active {
            background: none;
          }

          .weui-grid__icon {
            width: 0.4rem;
            height: 0.4rem;
            position: relative;

            i {
              position: absolute;
              font-size: 0.5rem;
              color: #fff;
            }
          }

          .weui-grid__label {
            margin-top: 0.1rem;
            color: #fff;
            font-size: 0.15rem;
          }
        }

        &:before {
          border-top: none;
        }
      }
    }

    .nav-box {
      width: 100%;
      height: auto;
      padding: 0.15rem 0;
      margin-top: 0.15rem;
      background: #fff;

      .weui-grids {
        &:before {
          border-top: none;
        }

        .weui-grid {
          width: 33.33%;
          padding: 0.15rem;

          .weui-grid__icon {
            width: 0.5rem;
            height: 0.5rem;
            position: relative;
            text-align: center;

            i {
              width: 0.4rem;
              height: 0.4rem;
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              margin: auto;
              font-size: 0.4rem;
              color: #3399ff;
            }
          }

          .weui-grid__label {
            margin-top: 0;
            color: #666666;
            font-size: 0.15rem;
          }

          &:after {
            border-bottom: none;
          }
        }
      }
    }
  }
</style>
