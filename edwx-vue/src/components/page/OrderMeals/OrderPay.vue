<template>
  <div class="order-pay">
    <div class="food-wrapper" ref="foodsWrapper">
      <ul>
        <li v-for="(item,index) in goods" :key="index" class="food-list food-list-hook">
          <h1 class="title" v-if="item.mealName"><span>{{item.mealName}}</span></h1>
          <group gutter="0" class="goods-list">
            <cell v-for="(food,idx) in item.foods" :title="food.foodName" :inline-desc="'￥'+food.foodPrice+'元/份'"
                  :key="idx">
              <img slot="icon" :src="food.foodPhoto" alt="" v-if="food.foodPhoto">
              <i slot="icon" class="iconfont icon-morentupian" v-else></i>
              <inline-x-number slot="child" width="50px" v-model="food.foodOrder" min="0"
                               :max="food.foodNum-food.foodUse"
                               @on-change="changeNumber(food.foodOrder,food,idx,index)"></inline-x-number>
            </cell>
          </group>
        </li>
      </ul>
    </div>
    <div class="order-wrapper">
      <group class="address-box" label-width="7em">
        <x-switch title="是否送餐" v-model="required"></x-switch>
        <popup-picker title="送餐地点" :data="addressList" v-model="address"
                      :placeholder="required?'请选择':'不可选'"
                      :show-name="true" :disabled="!required"></popup-picker><!---->
      </group>
      <group class="total-box" label-width="7em">
        <cell class="total" title="订餐份数">
          <div slot="child"><span>{{ totalNum }}</span>份</div>
        </cell>
        <cell class="room" title="取餐餐厅" v-if="false">
          <div slot="child">一楼餐厅<span>（配送）</span></div>
        </cell>
        <cell class="money" title="消费金额">
          <div slot="child"><span>{{ totalPrice }}</span>元</div>
        </cell>
      </group>
      <div class="my-operate">
        <!--<a @click="cancelClick">取消订单</a>-->
        <x-button :class="isDisabled?'disabled':''" type="primary" :disabled="isDisabled" @click.native="submitClick">
          确认支付
        </x-button>
      </div>
    </div>
    <div v-transfer-dom>
      <confirm
        v-model="showPay"
        :hide-on-blur="true"
        :show-cancel-button="false"
        :show-confirm-button="false">
        <div class="content-box" slot="default">
          <div class="close-box" @click="closeConfirm">
            <i class="iconfont icon-close"></i>
          </div>
          <dl>
            <dt>
              <i class="iconfont icon-shibai1"></i>
            </dt>
            <dd>支付失败</dd>
            <dd>网络连接失败，请重新支付</dd>
          </dl>
          <x-button type="primary" @click.native="submitClick">重新支付</x-button>
          <!--<a @click="cancelClick">取消订单</a>-->
        </div>
      </confirm>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showConfirm"
               title="操作提示"
               @on-cancel="onCancel"
               @on-confirm="onConfirm"
               @on-show="onShow"
               @on-hide="onHide" class="operate-box">
        <p style="text-align:center;">取消订单将清除订单信息，您确定要取消吗？</p>
      </confirm>
    </div>
  </div>
</template>
<script>
  import {
    XInput,
    XButton,
    Group,
    Cell,
    Popover,
    InlineXNumber,
    XSwitch,
    PopupPicker,
    Confirm,
    TransferDomDirective as TransferDom,
  } from 'vux';

  export default {
    name: 'OrderPay',
    directives: {
      TransferDom,
    },
    components: {
      XInput, XButton, Group, Cell, InlineXNumber, XSwitch, PopupPicker, Popover, Confirm,
    },
    data() {
      return {
        goods: [],
        foods: [],
        addressList: [[]],
        address: [],
        required: false,
        showPay: false,
        showConfirm: false,
        mealList: [],
        totalNum: 0,
        totalPrice: 0,
        orderDate: '',
        placeId: '',    //场所编号
      };
    },
    computed: {},
    watch: {
      required: function (val) {
        if (!val) {
          this.address = [];
        }
      },
    },
    methods: {
      /**
       * @function获取上一次订餐订单信息
       *      wzx
       *   2019.05.06
       **/
      getOrderInfo() {
        this.$utils.Tools.loadShow();
        this.$api.Meal.getOrderInfo(this.$utils.Store.getItem('userSerial')).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data.addrId) {
              this.required = true;
              this.address.push(data.addrId);
            } else {
              this.address = [];
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function获取送餐地点列表
       *      wzx
       *   2019.05.06
       **/
      getAddressList() {
        this.$utils.Tools.loadShow();
        this.$api.Meal.getAddressList({}).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            for (let item of data) {
              this.addressList[0].push({name: item.addressName, value: item.addressId});
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function改变订餐菜品份数
       *      wzx
       *   2019.05.06
       **/
      changeNumber(val, food, idx, index) {
        if (val === 0) {
          this.goods[index].foods.splice(idx, 1);
          if (this.goods[index].foods.length === 0) {
            this.goods.splice(index, 1);
            if (this.goods.length === 0) {
              this.$store.dispatch('actionFoodList', []);
              this.$router.push('/MealOrdering');
              return;
            }
          }
        }
        for (let item of this.mealList) {
          if (item.mealId === this.goods[index].mealId && item.foodId === food.foodId) {
            item.foodOrder = val;
            break;
          }
        }
        console.log(this.mealList);
        this.$store.dispatch('actionFoodList', this.mealList);

        this.totalPrice = 0;
        this.totalNum = 0;
        let totalPrice = 0;
        for (let item of this.goods) {
          for (let food of item.foods) {
            totalPrice += parseFloat((food.foodPrice * food.foodOrder).toFixed(2));
            this.totalNum += food.foodOrder;
          }
        }
        this.totalPrice = Math.round(totalPrice * 100) / 100;
      },
      /**
       * @function新增订餐订单
       *      wzx
       *   2019.05.07
       **/
      submitClick() {
        let orderInfo = JSON.stringify(this.goods);
        if (this.required && this.address.length === 0) {
          this.$utils.Tools.toastShow('请选择送餐地点！');
        } else {
          this.$utils.Tools.loadShow();
          this.$api.Meal.insertOrder({
            addrId: this.address.length > 0 ? this.address[0] : '',
            orderChannel: 1,
            orderDate: this.orderDate,
            orderState: 1,
            sendFlag: this.required ? 1 : 0,
            userName: this.$utils.Store.getItem('userLname'),
            userSerial: this.$utils.Store.getItem('userSerial'),
            placeId: this.placeId,
            orderInfo: orderInfo,
            orderPrice: this.totalPrice,
            cancelFlag: this.$route.query.cancelFlag,
          }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              if (+code === 610 || +code === 611 || +code === 612 || +code === 613) {
                this.$utils.Tools.toastShow(msg);
              } else {
                this.showPay = true;
              }
            } else {
              this.$store.dispatch('actionFoodList', []);
              this.$utils.Tools.toastShow('支付成功');
              setTimeout(() => {
                this.$router.replace('/OrderRecord');
              }, 1500);
              // this.$router.replace({path: '/OrderPayResult', query: {orderId: data}});
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
      cancelClick() {
        this.showConfirm = true;
      },
      onCancel() {
      },
      onConfirm() {
        this.showConfirm = false;
        this.$router.push('/MealOrdering');
      },
      closeConfirm() {
        this.showPay = false;
      },
      /**
       * @function对象数组排序
       *      wzx
       *   2019.05.06
       **/
      compare(property) {
        return function (obj1, obj2) {
          let value1 = obj1[property];
          let value2 = obj2[property];
          return value1 - value2;     // 升序
        };
      },
    },
    created() {
      this.mealList = this.$store.getters.getterFoodList;
      this.orderDate = this.$route.query.orderDate;
      this.placeId = this.$route.query.placeId;
      let hash = {};
      /*es6数组去重*/
      const newArr = this.mealList.reduceRight((item, next) => {
        hash[next.mealId] ? '' : hash[next.mealId] = true && item.push(next);
        return item;
      }, []);
      let meals = newArr.sort(this.compare('mealId'));
      for (let item of meals) {
        this.goods.push({mealId: item.mealId, mealName: item.mealName, foods: []});
      }
      let totalPrice = 0;
      for (let food of this.mealList) {
        for (let item of this.goods) {
          if (food.mealId === item.mealId) {
            item.foods.push({
              mealId: food.mealId,
              mealName: food.mealName,
              foodId: food.foodId,
              foodName: food.foodName,
              foodPrice: food.foodPrice,
              foodOrder: food.foodOrder,
              foodPhoto: food.foodPhoto,
              foodNum: food.foodNum,
              foodUse: food.foodUse,
              merchantId: food.merchantId,
            });
          }
        }
        totalPrice += parseFloat((food.foodPrice * food.foodOrder).toFixed(2));
        this.totalNum += food.foodOrder;
      }
      this.totalPrice = Math.round(totalPrice * 100) / 100;
      this.getOrderInfo();
      this.getAddressList();
    },
    mounted() {

    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .order-pay {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .food-wrapper {
      flex: 1;
      padding: 0.05rem 0;
      border-bottom: 5px solid #eaeaea;
      overflow: hidden;

      ul {
        height: 100%;
        overflow-y: scroll;

        li {
          padding-left: 0.1rem;

          h1 {
            height: 0.2rem;
            font-size: 0.13rem;
            line-height: 0.2rem;
            padding-left: 0.1rem;
            position: relative;
            overflow: hidden;
            font-weight: normal;

            &:before {
              width: 3px;
              height: 0.2rem;
              content: "";
              background: #3399ff;
              position: absolute;
              left: 0;
            }

            &:after {
              width: 100%;
              height: 1px;
              content: "";
              background: #eaeaea;
              position: absolute;
              left: 0.1rem;
              bottom: 0;
              z-index: 1;
            }

            span {
              padding-right: 0.05rem;
              padding-bottom: 1px;
              position: absolute;
              z-index: 2;
              background: #fff;
              color: #999;
            }
          }

          .goods-list {
            height: auto;
            margin: 0.15rem 0;

            .weui-cells {
              &:before, &:after {
                border: none;
              }

              .weui-cell {
                height: 0.64rem;
                padding: 0.02rem 0.1rem;

                &:before {
                  border: none;
                }

                .weui-cell__hd {
                  width: 20%;

                  img {
                    width: 0.6rem;
                    height: 0.6rem;
                  }

                  i {
                    font-size: 0.6rem;
                    display: block;
                    color: #999999;
                  }
                }

                .vux-cell-primary {
                  width: 40%;
                  padding-left: 0.05rem;

                  p {
                    color: #333 !important;
                    font-size: 0.15rem;
                  }

                  span {
                    color: #FF6600;
                    font-size: 0.11rem;
                  }
                }

                .vux-inline-x-number {
                  width: 40%;

                  > div {
                    padding: 0 0.1rem;

                    .vux-number-selector {
                      width: 0.3rem;
                      height: 0.3rem;
                      padding: 0;
                      text-align: center;
                      line-height: 0.3rem;
                      border: none;

                      &.vux-number-selector-sub {
                        position: relative;

                        &:after {
                          position: absolute;
                          left: 0;
                          top: 0;
                          content: "\e666";
                          font-family: "iconfont" !important;
                          font-style: normal;
                          -webkit-font-smoothing: antialiased;
                          -moz-osx-font-smoothing: grayscale;
                          font-size: 0.3rem;
                          color: #ccc;
                        }

                        > svg {
                          display: none;
                        }
                      }

                      &.vux-number-selector-plus {
                        position: relative;

                        &:after {
                          position: absolute;
                          left: 0;
                          top: 0;
                          content: "\e646";
                          font-family: "iconfont" !important;
                          font-style: normal;
                          -webkit-font-smoothing: antialiased;
                          -moz-osx-font-smoothing: grayscale;
                          font-size: 0.3rem;
                          color: #FF6600;
                        }

                        > svg {
                          display: none;
                        }
                      }

                      &.vux-number-disabled {
                        position: relative;

                        &:after {
                          position: absolute;
                          left: 0;
                          top: 0;
                          content: "\e646";
                          font-family: "iconfont" !important;
                          font-style: normal;
                          -webkit-font-smoothing: antialiased;
                          -moz-osx-font-smoothing: grayscale;
                          font-size: 0.3rem;
                          color: #ccc;
                        }

                        > svg {
                          display: none;
                        }
                      }
                    }

                    .vux-number-input {
                      border: none;
                      font-size: 0.15rem;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .order-wrapper {
      .address-box {
        border-bottom: 5px solid #eaeaea;

        .weui-cells {
          margin-top: 0;

          &:before, &:after {
            border: none;
          }

          .weui-cell {
            height: 0.45rem !important;
            min-height: 0.45rem !important;
            /*line-height: 0.45rem;*/
          }
        }
      }

      .total-box {
        .weui-cells {
          margin-top: 0;

          &:before, &:after {
            border: none;
          }

          .weui-cell {
            height: 0.4rem !important;
            min-height: 0.4rem !important;
            line-height: 0.4rem;

            &:before, &:after {
              border: none;
            }

            .vux-cell-primary {
              .vux-label-desc {
                display: none;
              }
            }

            &.total {
              color: #999;
              font-size: 0.13rem;

              span {
                color: #333;
                font-size: 0.2rem;
                padding: 0 0.1rem;
              }
            }

            &.room {
              color: #333;
              font-size: 0.18rem;

              span {
                color: #3399ff;
                font-size: 0.12rem;
              }
            }

            &.money {
              color: #999;
              font-size: 0.13rem;

              span {
                color: #FF6600;
                font-size: 0.2rem;
                padding: 0 0.1rem;
              }
            }
          }
        }
      }

      .my-operate {
        width: 100%;
        height: 0.67rem;
        padding: 0.1rem 0;
        background: #fff;
        z-index: 30;
        border-top: 1px solid #e5e5e5;

        a {
          display: block;
          margin: 0.08rem 0.5rem;
          line-height: 0.3rem;
          float: left;
          font-size: 0.13rem;
          color: #FF6600;
          text-decoration: underline;
          /*color:;*/
        }

        .weui-btn {
          width: 80%;
          height: 0.46rem;
          /*display: block;*/
          /*float:left;*/
          font-size: 0.18rem;

          &.disabled {
            background: #A2A2A2;
          }

          &:after {
            border: none;
          }
        }
      }
    }
  }

  .v-transfer-dom {
    .vux-confirm {
      .vux-x-dialog {
        .weui-dialog__bd {
          .content-box {
            height: 3rem;
            padding: 0.2rem 0.4rem;

            .close-box {
              position: absolute;
              top: 0.05rem;
              right: 0.05rem;

              .icon-close {
                font-size: 0.2rem;
              }
            }

            dl {
              dt {
                i {
                  font-size: 0.6rem;
                  color: #FF6600;
                }
              }

              dd:first-of-type {
                color: #FF6600;
                font-size: 0.2rem;
                line-height: 0.4rem;
              }

              dd:last-of-type {
                color: #999;
                font-size: 0.13rem;
                line-height: 0.3rem;
              }
            }

            .weui-btn {
              margin-top: 0.3rem;
            }

            a {
              display: block;
              margin: 0.15rem auto;
              line-height: 0.3rem;
              font-size: 0.13rem;
              color: #FF6600;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }

  .operate-box {
    .vux-x-dialog {
      .weui-dialog {
        .weui-dialog__hd {
          strong {
            font-size: 0.15rem;
          }
        }

        .weui-dialog__bd {
          height: 1.8rem;
          padding: 0.35rem 0.2rem !important;

          p {
            line-height: 0.3rem;
            letter-spacing: 2px;
            font-size: 0.14rem;
          }
        }

        .weui-dialog__ft {
          a {
            font-size: 0.14rem;
          }
        }
      }
    }
  }

  .vux-popup-dialog {
    .vux-popup-picker-container {
      .vux-popup-header {
        .vux-popup-header-right {
          &:before {
            content: "";
          }
        }
      }
    }
  }
</style>
