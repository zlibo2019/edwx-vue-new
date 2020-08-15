<template>
  <div class="recharge">
    <div class="my-input">
      <i class="iconfont icon-icon-test"></i>
      <x-input v-model="rechargeValue" type="text" placeholder="请输入充值金额"
               @on-blur="checkValue"></x-input>
      <i class="iconfont icon-wodeshenqing" @click="showMore"></i>
    </div>
    <div class="face-value">
      <grid :cols="3" :show-lr-borders="false">
        <grid-item v-for="(item,index) in moneyData" :key="index">
          <dd :class="['grid-center',mySelected===index?'active':'']" @click="moneyClick(item, index)">
            {{item.title}}
          </dd>
        </grid-item>
      </grid>
    </div>
    <div class="my-operate">
      <x-button type="primary" @click.native="recharge"><!-- :class="isDisabled?'disabled':''" :disabled="isDisabled"-->
        充值
      </x-button>
    </div>
  </div>
</template>
<script>
  import {
    XButton, XInput, Grid, GridItem,
  } from 'vux';

  export default {
    name: 'Recharge',
    components: {
      XButton, XInput, Grid, GridItem,
    },

    data() {
      return {
        //充值金额
        rechargeValue: '',
        //充值金额数组
        moneyData: [
          {
            title: '50元',
            value: 50,
          },
          {
            title: '100元',
            value: 100,
          },
          {
            title: '150元',
            value: 150,
          },
          {
            title: '200元',
            value: 200,
          },
          {
            title: '300元',
            value: 300,
          },
          {
            title: '500元',
            value: 500,
          },
        ],
        //选中的充值金额，默认不选中
        mySelected: -1,
      };
    },
    watch: {
      rechargeValue(val) {
        if (val !== '' && val < 0) {
          this.rechargeValue = '';
          this.$utils.Tools.toastShow('请输入正确的金额');
        } else {
          this.mySelected = -1;
          this.moneyData.filter((money, index) => {
            if (+money.value === +val) {
              this.mySelected = index;
            }
          });
        }
      },
    },
    computed: {
      isDisabled() {
        return !(this.rechargeValue !== '' && this.rechargeValue > 0);
      },
    },
    methods: {
      moneyClick(obj, index) {
        this.mySelected = index;
        this.rechargeValue = obj.value;
      },
      showMore() {
        this.$router.push('/RechargeRecord');
      },
      checkValue(val) {
        if (val != '') {
          let reg = /(^[1-9][0-9]{0,4}$)|(^[0][\.]{1}[1-9]{1}$)|(^[0][\.]{1}[0-9]{1}[1-9]{1}$)|(^[1-9][0-9]{0,4}[\.]{1}[0-9]{0,2}$)/;
          if (reg.test(val)) {
            this.rechargeValue = val;
            this.$utils.Store.setItem('rechargeValue', val);
          } else {
            this.$utils.Tools.toastShow('必须为数字格式，且金额的整数位数最多5位，小数位最多2位');
          }
        }
      },
      setDtConfig: function () {
        this.$api.DingTalk.payDtOrderTemp({
          userSerial: this.$utils.Store.getItem('userSerial'),
          addMoney: this.rechargeValue,
          openId: this.$utils.Store.getItem('openId'),
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            const div = document.createElement('div');
            /* 此处form就是后台返回接收到的数据 */
            div.innerHTML = data.resp;
            document.body.appendChild(div);
            document.forms[0].submit();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });

        // let localUrl = window.location.href.split('#')[0];
        // this.$api.DingTalk.getDtConfig(localUrl).then(response => {
        //   const {code, msg, data} = response;
        //   if (+code !== this.$code.success) {
        //     this.$utils.Tools.toastShow(msg);
        //   } else {
        //     this.$utils.DingTalk.getConfig(data);
        //     setTimeout(() => {
        //       this.dtRecharge();
        //     }, 500);
        //   }
        // }).catch(err => {
        //   this.$utils.Tools.httpError();
        // });
      },
      dtRecharge() {
        this.$api.DingTalk.payDtOrder({
          userSerial: this.$utils.Store.getItem('userSerial'),
          addMoney: this.rechargeValue,
          openId: this.$utils.Store.getItem('openId'),
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            let that = this;
            this.$dd.ready(function () {
              that.$dd.biz.alipay.pay({
                info: data.resp, // 订单信息，
                onSuccess: function (result) {
                  if (result.resultStatus === '9000') {
                    that.$router.push({
                      path: '/PayResult', query: {
                        code: that.$code.success,
                        outTradeNo: data.tradeNo,
                      },
                    });
                  } else {
                    that.$router.push({
                      path: '/PayResult', query: {
                        code: that.$code.fail,
                      },
                    });
                  }
                },
                onFail: function (err) {
                  that.$router.push({
                    path: '/PayResult', query: {
                      code: that.$code.fail,
                    },
                  });
                },
              });
            });
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      wxRecharge() {
        let that = this;
        this.$api.Home.recharge({
          userSerial: this.$utils.Store.getItem('userSerial'),
          addMoney: this.rechargeValue * 100,
          openId: this.$utils.Store.getItem('openId'),
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            let params = {
              appId: data.appId, //公众号名称，由商户传入
              timeStamp: data.timeStamp, //时间戳，自1970年以来的秒数
              nonceStr: data.nonceStr, //随机串
              package: data.package,
              signType: data.signType, //微信签名方式：
              paySign: data.paySign, //微信签名
            };
            WeixinJSBridge.invoke('getBrandWCPayRequest', params,
              function (res) {
                if (res.err_msg === 'get_brand_wcpay_request:ok') {
                  // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
                  // 支付成功之后，跳转到支付详细信息页面
                  that.$router.push({
                    path: '/PayResult', query: {
                      code: that.$code.success,
                      outTradeNo: data.out_trade_no,
                    },
                  });
                } else {
                  // 支付失败
                  that.$router.push({
                    path: '/PayResult', query: {
                      code: that.$code.fail,
                    },
                  });
                }
              },
            );
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onBridgeReady() {
        this.$utils.Tools.getEnv(res => {
          if (res === 0) {
            this.$wechat.miniProgram.navigateTo({url: '../recharge/recharge?money=' + this.rechargeValue});
          } else {
            this.wxRecharge();
          }
        });
      },
      recharge() {
        let reg = /(^[1-9][0-9]{0,4}$)|(^[0][\.]{1}[1-9]{1}$)|(^[0][\.]{1}[0-9]{1}[1-9]{1}$)|(^[1-9][0-9]{0,4}[\.]{1}[0-9]{0,2}$)/;
        if (reg.test(this.rechargeValue)) {
          this.$utils.Tools.getEnv(res => {
            if (res === 0 || res === 1) {
              if (typeof WeixinJSBridge == 'undefined') {
                if (document.addEventListener) {
                  document.addEventListener('WeixinJSBridgeReady', this.onBridgeReady, false);
                } else if (document.attachEvent) {
                  document.attachEvent('WeixinJSBridgeReady', this.onBridgeReady);
                  document.attachEvent('onWeixinJSBridgeReady', this.onBridgeReady);
                }
              } else {
                this.onBridgeReady();
              }
            } else {
              this.setDtConfig();
            }
          });
        } else {
          this.$utils.Tools.toastShow('必须为数字格式，且金额的整数位数最多5位，小数位最多2位');
        }
      },
      /** 函数function 设定当前页面
       *  wzx
       *  2019.01.09
       **/
      pushHistory() {
        var state = {
          title: 'title',
          url: '',
        };
        window.history.pushState(state, state.title, state.url);
      },
    },
    mounted() {
      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/Account');
      // }
    },
  };
</script>
<style type="text/scss" lang="scss">
  .recharge {
    width: 100%;
    height: 100%;
    padding: 0.1rem;

    .my-input {
      width: 100%;
      height: 0.5rem;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      flex-direction: row;

      > i {
        flex-basis: 0.4rem;
        font-size: 0.35rem;
        position: relative;
        color: #666;

        &:before {
          width: 0.3rem;
          height: 0.36rem;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
        }
      }

      .weui-cell {
        flex: 1;
        line-height: 0.3rem;
        font-size: 0.24rem;
        padding-left: 0;
        border: none;

        &:before {
          display: none;
        }

        .weui-cell__ft {
          i {
            font-size: 0.2rem;
          }
        }

        .weui-cell__primary {
          line-height: 0.3rem;

          input {
            line-height: 0.3rem;
          }
        }
      }
    }

    .face-value {
      width: 100%;
      height: auto;
      padding: 0.2rem 0;

      .weui-grids {
        &:before, &:after {
          border: none;
        }

        .weui-grid {
          padding: 10px;

          &:before, &:after {
            border: none;
          }

          .grid-center {
            width: 100%;
            height: 0.9rem;
            font-size: 0.25rem;
            text-align: center;
            border: 1px solid #3399ff;
            border-radius: 8px;
            line-height: 0.9rem;
            color: #3399ff;

            &.active {
              background: #3399ff;
              color: #fff;
            }
          }
        }
      }
    }

    .my-operate {
      width: 100%;
      height: 0.5rem;
      margin: 0.3rem 0 0.1rem 0;

      .weui-btn {
        width: 90%;
        font-size: 0.18rem;

        &.disabled {
          background: #A2A2A2;
        }
      }
    }
  }
</style>
