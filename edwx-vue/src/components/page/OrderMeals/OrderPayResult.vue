<template>
  <div class="pay-result">
    <div class="food-wrapper" ref="foodsWrapper">
      <ul>
        <li v-for="(item,index) in goods" :key="index" class="food-list food-list-hook">
          <h1 class="title"><span>{{item.mealName}}</span></h1>
          <group gutter="0" class="goods-list">
            <cell v-for="(food,idx) in foods" :title="food.foodName" :inline-desc="'￥'+food.foodPrice+'元/份'"
                  :value="'×'+food.foodNum" :key="idx" v-if="item.mealId === food.mealId">
              <img slot="icon" :src="food.foodPhoto" alt="" v-if="food.foodPhoto">
              <i slot="icon" class="iconfont icon-morentupian" v-else></i>
              <div class="subtotal" slot="child"><span>{{(food.foodPrice*food.foodNum).toFixed(2)}}</span>元</div>
            </cell>
          </group>
        </li>
      </ul>
    </div>
    <div class="order-wrapper" :style="sendFlag === true?'flex-basis:2.95rem':'flex-basis:2.7rem'">
      <div class="total-box">
        <dl>
          <a class="countPrice"><span>{{orderPrice}}</span>元</a>
          <a class="countNum">合计<span>{{orderNum}}</span>份</a>
        </dl>
        <div class="result">
          <dt>
            <i class="iconfont icon-duigou3"></i>
          </dt>
          <div id="paySuccess">
            <span v-if="orderState === '1'">支付成功</span>
            <span v-if="orderState === '2'">撤单成功</span>
            <span v-if="orderState === '3'">取餐成功</span>
          </div>
        </div>
      </div>
      <group class="order-info" label-width="7em">
        <cell title="是否送餐" :value="sendFlag === '1'?'是':'否'" value-align="left"></cell>
        <cell title="送餐地址" :value="addrName" value-align="left" v-if="sendFlag === true"></cell>
        <!--<cell title="订单状态" :value="orderState === '1'?'已支付':''" value-align="left"></cell>-->
        <cell title="下单时间" :value="orderDate" value-align="left"></cell>
        <cell title="订单编号" :value="orderId" value-align="left"></cell>
      </group>
      <div class="my-operate" v-if="showOrders === 'true'">
        <dd @click="historyClick">查看订餐记录</dd>
      </div>
    </div>
    <div class="pay-button" v-if="operate === '1'">
      <div :style="{width: cancelFlag === '1'?'50%':'100%'}">
        <x-button type="primary" @click.native="getOrder">取餐
        </x-button>
      </div>
      <div :style="{width: cancelFlag === '1'?'50%':'100%'}" v-if="cancelFlag === '1'">
        <x-button type="primary" @click.native="cancelOrder">撤单
        </x-button>
      </div>
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
    name: 'OrderPayResult',
    directives: {
      TransferDom,
    },
    components: {
      XInput, XButton, Group, Cell, InlineXNumber, XSwitch, PopupPicker, Popover, Confirm,
    },
    beforeRouteEnter(to, from, next) {
      if (from.name !== 'OrderPay') {
        vm.$utils.Store.setItem('showOrders', false);
        next();
      } else {
        vm.$utils.Store.setItem('showOrders', true);
        next();
      }
    },
    data() {
      return {
        goods: [],
        foods: [],
        showPay: true,
        orderDate: '',
        orderState: '',
        orderId: '',
        orderPrice: '',
        orderNum: '',
        addrName: '',
        sendFlag: false, //需否送餐
        showOrders: this.$utils.Store.getItem('showOrders'),
        mealId: null,
        operate: '0',
        cancelFlag: '',
      };
    },
    computed: {},
    methods: {
      cancelOrder() {
        this.$utils.Tools.confirm(() => {
          this.$api.Meal.updateByPrimaryKey({
            subOrderId: this.orderId,
            mealState: '2',
          }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.$utils.Tools.toastShow(msg);
              setTimeout(() => {
                this.$router.replace('/OrderRecord');
              }, 1000);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }, '确定撤销订单吗？');
      },
      getOrder() {
        this.$utils.Tools.confirm(() => {
          this.$api.Meal.updateByPrimaryKey({
            subOrderId: this.orderId,
            mealState: '3',
          }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.$utils.Tools.toastShow(msg);
              setTimeout(() => {
                this.$router.replace('/OrderRecord');
              }, 1000);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }, '确定手动取餐吗？');
      },
      getOrderDetail() {
        this.$utils.Tools.loadShow();
        this.$api.Meal.getOrderDetail(this.orderId, this.mealId).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.goods = data.mealList;
            this.foods = data.foodList;
            this.addrName = data.addrName;
            this.orderDate = data.ctDate;
            this.orderState = data.orderState;
            this.orderId = data.orderId;
            this.orderPrice = data.orderPrice;
            this.orderNum = data.foodNum;
            this.sendFlag = data.sendFlag;
            this.operate = data.operate;
            this.cancelFlag = data.cancelFlag;
            this.fade();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      historyClick() {
        this.$router.push('/OrderRecord');
      },
      fade() {
        // $('.result dt').addClass('animated bounceIn');
        // $('#paySuccess').addClass('animated bounceIn');
      },
    },
    created() {
      this.orderId = this.$route.query.orderId;
      this.mealId = this.$route.query.mealId;
      this.getOrderDetail();
    },
    mounted() {

    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .pay-result {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .pay-button {
      margin-bottom: 0.1rem;
      display: flex;
      justify-content: center;

      button {
        width: 80%;
      }
    }

    .food-wrapper {
      flex: 1;
      padding: 0.15rem 0;
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
                padding: 0.02rem 0.3rem 0.02rem 0.1rem;

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
                  padding-right: 0.05rem;

                  p {
                    color: #333 !important;
                    font-size: 0.15rem;
                    overflow: hidden;
                  }

                  span {
                    color: #FF6600;
                    font-size: 0.11rem;
                  }
                }

                .weui-cell__ft {
                  width: 15%;
                  padding-left: 0.05rem;
                  text-align: left;
                }

                .subtotal {
                  width: 25%;
                  text-align: right;
                  color: #999;

                  span {
                    color: #FF6600;
                    font-size: 0.16rem;
                    padding: 0 0.05rem;
                  }
                }
              }
            }
          }
        }
      }
    }

    .order-wrapper {
      /*flex-basis: 3.45rem;*/
      .total-box {
        height: 1.1rem;
        padding: 0 0.3rem;
        border-bottom: 5px solid #eaeaea;

        dl {
          height: 0.5rem;

          .countPrice {
            float: right;
            color: #999;
            padding: 0.05rem;
            font-size: 0.15rem;
            line-height: 0.4rem;

            span {
              padding: 0 0.1rem;
              font-size: 0.28rem;
              color: #FF6600;
            }
          }

          .countNum {
            float: right;
            color: #999;
            padding: 0.05rem;
            font-size: 0.15rem;
            line-height: 0.4rem;

            span {
              padding: 0 0.1rem;
              font-size: 0.18rem;
              color: #3399ff;
            }
          }
        }

        .result {
          height: 0.5rem;
          clear: both;
          font-size: 0.2rem;
          color: #12C9A4;
          text-align: right;
          line-height: 0.5rem;
          position: relative;
          padding-left: 0.6rem;

          dt {
            width: 0.3rem;
            height: 0.5rem;
            border-radius: 50%;
            position: absolute;
            right: 0.9rem;
            top: 0;
            overflow: hidden;
            transform: scale(1.2);

            i {
              font-size: 0.3rem;
              width: 0.3rem;
              position: relative;
            }

            .active {
              animation: scaleBig 3s linear 5s;
            }

            @-webkit-keyframes scaleBig {
              0% {
                transform: scale(0);
              }
              100% {
                transform: scale(1.2);
              }
            }

            > div {
              width: 0.5rem;
              height: 0.5rem;
              position: absolute;
              top: 0;
              left: 0.5rem;
              z-index: 10;
              background: #fff;
              animation: moving 1s linear;
            }

            @keyframes moving {
              0% {
                left: 0;
              }
              100% {
                left: 0.5rem;
                display: none;
              }
            }
          }

          #paySuccess {
            width: 0.8rem;
            float: right;
            text-align: center;
          }
        }
      }

      .other-info {
        height: auto;
        max-height: 1.2rem;
        clear: both;

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
              color: #333;
            }
          }
        }
      }

      .order-info {
        height: auto;
        min-height: 1.1rem;
        padding: 0.05rem 0;

        .weui-cells {
          margin-top: 0;

          &:before, &:after {
            border: none;
          }

          .weui-cell {
            height: 0.25rem !important;
            min-height: 0.25rem !important;
            line-height: 0.25rem;

            &:before, &:after {
              border: none;
            }
          }
        }
      }

      .my-operate {
        width: 100%;
        height: 0.5rem;
        padding: 0;

        dd {
          width: 40%;
          margin: 0 auto;
          text-align: center;
          text-decoration: underline;
          color: #3399ff;
          font-size: 0.14rem;
          line-height: 0.5rem;
        }
      }
    }
  }
</style>
