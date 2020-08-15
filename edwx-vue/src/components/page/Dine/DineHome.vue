<template>
  <div class="dine-home">
    <view-box body-padding-top="0.95rem" body-padding-bottom="0.89rem">
      <div class="dine-home-head">
        <flexbox :gutter="0">
          <flexbox-item :span="2/3" style="padding-left: 0.1rem;">
            <inline-x-switch v-model="dineFlag" @on-change="setAutoDine"
                             :value-map="[0,1]"></inline-x-switch>
            <span class="auto-lab">&nbsp;考勤关联订餐</span>
          </flexbox-item>
          <flexbox-item :span="1/3" style="display: none;">
            <x-button text="菜谱查看" type="primary" mini></x-button>
          </flexbox-item>
        </flexbox>
        <x-table class="dine-home-head-table">
          <thead>
          <th>日期</th>
          <th v-for="(meal, i) in meals" :key="i">
            {{meal.mealName}}
          </th>
          </thead>
        </x-table>
      </div>

      <div style="overflow-y:auto;" ref="content" class="dine-home-body">
        <x-table class="dine-home-body-table">
          <tbody>
          <tr v-for="i in dineNums" :key="i">
            <td><span>{{nextWeek(i)}}</span><span>{{nextDay(i)}}</span></td>
            <td v-for="(meal, k) in meals" :key="k"
                @click.stop.prevent="setDineNums(nextDay(i), meal.mealBh, i, meal.dineVali)"
                :class="{'td-readonly':i>meal.dineVali || isCurrentDine(meal, i)}">
              {{setUserOrder(nextDay(i), meal.mealBh)}}
            </td>
          </tr>
          </tbody>
        </x-table>
      </div>
      <div class="operate-box" ref="bottom">
        <x-button text="查看订餐记录" type="primary" @click.native="dineDetail"></x-button>
        <a @click.stop="getDineRemark">订餐说明</a>
      </div>
    </view-box>
    <div class="dialog-box" v-transfer-dom>
      <confirm v-model="showConfirm" title="修改订餐" @on-confirm="onConfirm">
        <inline-x-number v-model="currNum" :min="0" :max="99"></inline-x-number>
      </confirm>
    </div>
    <alert v-model="alertFlag" title="订餐说明" :hide-on-blur=true>
      <div style="overflow-y:auto;height:3rem;text-align: left;">{{remark}}</div>
    </alert>
  </div>
</template>

<script>
  import {
    InlineXSwitch,
    XTable,
    XButton,
    InlineXNumber,
    Confirm,
    Flexbox,
    FlexboxItem,
    TransferDomDirective as TransferDom,
    Alert,
    ViewBox,
  } from 'vux';

  export default {
    name: 'DineHome',
    components: {
      InlineXSwitch,
      XTable,
      XButton,
      InlineXNumber,
      Confirm,
      Flexbox,
      FlexboxItem,
      Alert,
      ViewBox,
    },
    directives: {
      TransferDom,
    },
    data() {
      return {
        dineFlag: +this.$utils.Store.getLocalItem('isAuto'),
        meals: '',
        orders: [],
        currDate: '',
        dineNums: 0,
        showConfirm: false,
        userSerial: 0,
        obj: {},
        currNum: 1,
        temp: 0,
        mealDate: '',
        mealBh: '',
        remark: '',
        alertFlag: false,
      };
    },
    methods: {
      isCurrentDine(meal, index) {
        if (index === 1) {
          let curr = this.$utils.DateUtils.getTimeStamp(this.currDate);
          let temp = this.$utils.DateUtils.getFullDate(this.currDate) + ' ' + meal.jssj;
          let jssj = this.$utils.DateUtils.getTimeStamp(temp);
          return curr > jssj;
        }
        return false;
      },
      getDineRemark: function () {
        this.$api.Dine.getDineRemark().then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.remark = data.remark;
              this.alertFlag = true;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      //设置自动订餐
      setAutoDine: function () {
        this.$api.Dine.updateUserAutoFlag({
          userSerial: this.userSerial,
          isAuto: this.dineFlag,
        }).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.$utils.Store.setLocalItem('isAuto', this.dineFlag);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      //获取自动订餐
      getAutoDine: function () {
        this.$api.Dine.getUserAutoFlag(this.userSerial).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              if (data === null || data.isAuto === null) {
                this.dineFlag = 0;
              } else {
                this.dineFlag = data.isAuto;
              }
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      //获取用户订餐列表
      getUserOrderList: function () {
        this.$api.Dine.getUserOrderList({
          userSerial: this.userSerial,
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.orders = data;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      //设置用户订餐列表
      setUserOrder: function (mealDate, mealBh) {
        let rtn = this.orders.filter(order => {
          return order.key === mealDate + mealBh;
        })[0];

        if (rtn !== undefined) {
          return rtn.dineNums === 0 ? '' : rtn.dineNums + '份';
        }
      },
      //查询用户订餐份数
      setDineNums: function (mealDate, mealBh, index, maxNum) {
        if (index > maxNum) {
          this.$utils.Tools.toastShow('此时间段不允许订餐！');
          return;
        }
        this.$api.Dine.getDineNums({
          rq: mealDate,
          mealBh: mealBh,
          userSerial: this.userSerial,
        }).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              if (data != null) {
                this.currNum = data.dineNums === 0 ? 1 : data.dineNums;
                this.temp = data.dineNums;
                this.xh = data.xh;
              } else {
                this.xh = null;
                this.currNum = 1;
                this.temp = 0;
              }
              this.mealDate = mealDate;
              this.mealBh = mealBh;
              this.showConfirm = true;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      //修改用户订餐份数
      onConfirm: function () {
        if (this.temp !== this.currNum) {
          this.$api.Dine.updateDineNums({
            xh: this.xh,
            mealBh: this.mealBh,
            rq: this.mealDate,
            userSerial: this.userSerial,
            dineType: 1,
            dineNums: this.currNum,
          }).then(response => {
              const {code, msg, data} = response;
              if (+code !== this.$code.success) {
                this.$utils.Tools.toastShow(msg);
              } else {
                this.$utils.Tools.toastShow(msg);
                this.getMeals();
                this.getAutoDine();
                this.getUserOrderList();
              }
            }).catch(err => {
              this.$utils.Tools.httpError();
            });
        }
      },
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.currDate = data.sysDate;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      nextWeek: function (days) {
        return this.$utils.DateUtils.getWeekDaysCn(this.currDate, days - 1);
      },
      nextDay: function (days) {
        return this.$utils.DateUtils.addDate(this.currDate, days - 1);
      },
      getMeals: function () {
        this.$api.Dine.getMeals({}).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.meals = data;
              let maxNum = 0;
              for (let index in data) {
                maxNum = Math.max(maxNum, data[index].dineVali);
              }
              this.dineNums = maxNum;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      dineDetail: function () {
        this.$router.push({
          name: 'DineDetail',
        });
      },
      pushHistory() {
        var state = {
          title: 'title',
          url: '#',
        };
        window.history.pushState(state, state.title, state.url);
      },
    },
    computed: {},
    created() {
      this.$utils.Tools.loadShow();
      this.userSerial = this.$utils.Store.getItem('userSerial');
      this.getSysDate();
      this.getMeals();
      this.getAutoDine();
      this.getUserOrderList();
    },
    mounted() {
      if (this.$route.params.notification) {
        this.pushHistory();
      }
    },
  };
</script>

<style type="text/scss" lang="scss">
  .dine-home {
    width: 100%;
    height: 100%;

    .dine-home-head {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
      padding-top: 0.05rem;

      .weui-switch {
        float: left;
        margin-top: 0.02rem;
      }

      .auto-lab {
        float: left;
        line-height: 0.4rem;
        font-size: 0.16rem;
      }

      .weui-btn_primary {
        margin-top: -0.05rem;
      }

      .dine-home-head-table {
        font-size: 0.14rem;
        background-color: #efefef;

        thead {
          height: 0.5rem;
          display: flex;
          flex-direction: row;

          th {
            flex: 1;
            line-height: 0.5rem;
          }

          th:nth-of-type(1) {
            flex-basis: 0.8rem;
          }
        }
      }
    }

    .dine-home-body {
      height: 100%;
      overflow: hidden;

      .dine-home-body-table {
        font-size: 0.14rem;

        tbody {
          tr {
            width: 100%;
            display: flex;
            flex-direction: row;
            height: 0.5rem;

            td {
              flex: 1;
              line-height: 0.5rem;
              padding: 0.05rem 0;

              span {
                display: block;
                margin: 0 auto;
                line-height: 0.22rem;
              }
            }

            .td-readonly {
              background-color: #f3f3f3;
            }

            td:nth-of-type(1) {
              flex-basis: 0.8rem;
            }
          }
        }

        &:after {
          border-top: none;
        }
      }
    }

    .operate-box {
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      position: absolute;
      z-index: 500;
      bottom: 0;
      width: 100%;
      background-color: #f7f7fa;
      padding: 0.1rem 0;
      font-size: 0.16rem;
      flex-direction: column;

      .weui-btn {
        width: 80%;
        /*font-size: 0.15rem;*/
      }

      a {
        color: #96e496;
        text-decoration: underline;
        width: 0.6rem;
        font-size: 0.13rem;
        display: block;
        margin: 0.1rem auto 0;
      }
    }
  }
</style>
