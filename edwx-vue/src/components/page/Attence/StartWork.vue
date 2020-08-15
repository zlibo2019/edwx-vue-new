<template>
  <div class="startwork-detail">
    <div class="startwork-head">
      <p style="font-size: 0.18rem">{{weekcn}}</p>
      <p>{{currDate===''?'':this.$utils.DateUtils.getFullDateCn(currDate)}}</p>
      <div class="startwork-dw">
        <i slot="icon" class="iconfont icon-dingwei"
           style="font-size: 0.3rem;padding:0.02rem 0.05rem 0 0;float:left;"></i>
        <p @click="jumpMapBig">{{address}}</p>
        <p v-if="control==='0'" class="redfont">{{tip}}</p>
        <p v-if="control==='1'">{{tip}}</p>
        <span v-if="control==='2'" class="redfont">不在打卡范围内，建议切换至wifi网络重试</span>
        <span v-if="control==='-1'" style="line-height: 0.35rem;">定位获取中</span>
      </div>
    </div>
    <group gutter="10">
      <cell title="外勤" :is-link="true" link="OutSide" v-if="$params.outside === '1'">
        <i slot="icon" class="iconfont icon-waiqin" style="color: #F7A76E;font-size: 0.3rem;padding-right:0.05rem;"></i>
      </cell>
      <cell title="考勤记录" :is-link="true" link="Attendances">
        <i slot="icon" class="iconfont icon-kaoqinjilu"
           style="color: #3DD5E1;font-size: 0.3rem;padding-right:0.05rem;"></i>
      </cell>
    </group>
    <div class="startwork-body">
      <div v-for="(item, index) in workData" :key="index" class="div-body">
        <div style="padding:0.1rem 0 0.1rem 0;">
          <div>
            <i class="iconfont icon-shangban" style="color: #FF6601;font-size: 0.5rem;" v-if="index===0"></i>
            <i class="iconfont icon-xiaban" style="color: #6567A5;font-size: 0.5rem;" v-else></i>
          </div>
          <div>{{index===0?'上班':'下班'}}</div>
        </div>
        <div :class="{'div-line-blue':!ifstart[index], 'div-line-green':ifstart[index]}"></div>
        <div class="div-record">
          <p v-for="(time, i) in item.oktime" :key="i" @click="showDetail(time.bh)">已打卡&nbsp;{{time.time}}</p>
          <p v-show="!ifstart[index]">未打卡</p>
        </div>
        <div :class="{'startwork-btn-blue':!ifstart[index], 'startwork-btn-green':ifstart[index]}">
          <x-button type="primary" @click.native="dkclick(item,index)" mini>{{index===0?'上班':'下班'}}打卡</x-button>
        </div>
      </div>
    </div>
    <div id="allmap"></div>
    <x-dialog v-model="showToast" hide-on-blur class="startwork-dialog">
      <x-icon type="ios-close-empty" size="35" style="position: absolute;right:0" @click="showToast=false"></x-icon>
      <div class="dialog-image">
        <img :src="attenceDetail.image">
        <!--<img class="previewer-demo-img" v-for="(item, index) in list" :src="item.src" @click="show(index)">-->
        <!--<div v-transfer-dom>-->
        <!--<previewer :list="list" ref="previewer" :options="options"></previewer>-->
        <!--</div>-->
      </div>
      <p>
        <icon type="waiting-circle"></icon>
        <span>打卡时间：{{$utils.DateUtils.formatDate(attenceDetail.sj, 'HH:mm:ss')}}</span>
      </p>
      <flexbox class="dialog-btn">
        <flexbox-item>
          <x-button type="primary" mini plain @click.native="showOther(-1)">查看上一条</x-button>
        </flexbox-item>
        <flexbox-item>
          <x-button type="primary" mini plain @click.native="showOther(1)">查看下一条</x-button>
        </flexbox-item>
      </flexbox>
    </x-dialog>
  </div>
</template>

<script>
  import {
    Group,
    XInput,
    XTextarea,
    Cell,
    Radio,
    XButton,
    Flexbox,
    FlexboxItem,
    XDialog,
    Icon,
    // Previewer,
    // TransferDom,
  } from 'vux';

  import CryptoJS from 'crypto-js';

  export default {
    name: 'StartWork',
    interval: '',
    // directives: {
    //   TransferDom,
    // },
    components: {
      Group,
      XInput,
      XTextarea,
      Cell,
      Radio,
      XButton,
      Flexbox,
      FlexboxItem,
      XDialog,
      Icon,
      // Previewer,
    },
    data() {
      return {
        showToast: false,
        currDate: '',
        weekcn: '',
        address: '',
        tip: '',
        control: '-1',
        points: [],
        signx: '',
        signy: '',
        range: '',
        userSerial: '',
        date: [
          {
            worktype: '',
          },
        ],
        workData: [
          {
            time: '',
            status: 1,
            oktime: [],
          },
          {
            time: '',
            status: 0,
            oktime: [],
          },
        ],
        ifstart: [false, false],
        limitNum: 1,
        sourceType: ['camera'],
        imgList: [],
        // list: [],
        attenceDetail: {},
        // options: {
        //   getThumbBoundsFn(index) {
        //     // find thumbnail element
        //     let thumbnail = document.querySelectorAll('.previewer-demo-img')[index];
        //     // get window scroll Y
        //     let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
        //     // optionally get horizontal scroll
        //     // get position of element relative to viewport
        //     let rect = thumbnail.getBoundingClientRect();
        //     // w = width
        //     return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
        //     // Good guide on how to get element coordinates:
        //     // http://javascript.info/tutorial/coordinates
        //   },
        // },
      };
    },
    methods: {
      // show(index) {
      //   this.$refs.previewer.show(index);
      // },
      showDetail(bh) {
        if (this.$params.attence !== '1') {
          return;
        }
        this.showToast = true;
        this.$api.Attence.getKqDetail({
          bh: bh,
        }).then(response => {
          const {code, msg, data} = response;
          this.$utils.Tools.loadHide();
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            // this.list = [];
            // this.list.push({
            //   msrc: this.attenceDetail.image,
            //   src: this.attenceDetail.image,
            // });
            this.attenceDetail = data;
          }
        });
      },
      showOther(val) {
        this.$api.Attence.getKqDetail({
          recordType: val,
          sj: this.attenceDetail.sj,
          fx: this.attenceDetail.fx,
          userSerial: this.userSerial,
        }).then(response => {
          const {code, msg, data} = response;
          this.$utils.Tools.loadHide();
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            // this.list = [];
            // this.list.push({
            //   msrc: this.attenceDetail.image,
            //   src: this.attenceDetail.image,
            // });
            this.attenceDetail = data;
          }
        });
      },
      chooseImage(item, index, currDate) {
        this.$utils.Tools.getEnv(res => {
          if (res === 0 || res === 1) {
            this.wxChooseImage(item, index, currDate);
          } else {
            this.dtChooseImage(item, index, currDate);
          }
        });
      },
      dtChooseImage(item, index, currDate) {
        this.$utils.DingTalk.uploadImage(res => {
          if (this.$utils.Tools.isArray(res)) {
            this.addRecord(item, index, currDate, res[0]);
          }
        }, 1, 0);
      },
      wxChooseImage(item, index, currDate) {
        this.limitNum = this.limitNum - this.imgList.length;
        let i = 0;
        this.$utils.WeiXin.wxChooseImage(res => {
          if (res.length > 0) {
            this.uploadImage(res, i, item, index, currDate);
          }
        }, 1, this.sourceType);
      },
      uploadImage(res, i, item, index, currDate) {
        this.$utils.WeiXin.wxUploadImage(serverId => {
          this.$api.Sys.getWxImageUrl(serverId, this.$params.mode).then(ress => {
            this.imgList.push({src: ress.data, msrc: res[i], serverId: serverId});
            this.addRecord(item, index, currDate, serverId);
            i++;
            if (i < res.length) {
              this.uploadImage(res, i, item, index, currDate);
            }
          }).catch();
        }, res[i]);
      },
      jumpMapBig: function () {
        this.$router.push({
          name: 'BdMap',
          params: {
            mapcontrol: 20,
            flag: false,
          },
        });
      },
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.currDate = data.sysDate;
            this.weekcn = this.$utils.DateUtils.getWeekCnThree(data.sysDate);
            this.getToday();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getRange: async function () {
        try {
          this.$utils.Tools.loadShow();
          let response = await this.$api.Attence.getRange({userSerial: this.userSerial});
          const {code, msg, data} = response;
          this.$utils.Tools.loadHide();
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
            this.tip = '请先在SCM电脑端设置考勤地点及范围';
            this.control = '0';
          } else {
            if (data.length === 0) {
              this.tip = '请先在SCM电脑端设置考勤地点及范围';
              this.control = '0';
            } else {
              this.points = data;
            }
          }
        } catch (err) {
          this.$utils.Tools.httpError();
        }
      },
      setDtConfig: function () {
        let localUrl = window.location.href.split('#')[0];
        this.$api.DingTalk.getDtConfig(localUrl).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.DingTalk.getConfig(data);
            setTimeout(() => {
              this.onDtPosition();
            }, 500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onDtPosition: function () {
        this.$utils.Tools.loadShow();
        let that = this;
        that.$utils.DingTalk.dtGetLocation('allmap', 14, false, resp => {
          this.$utils.Tools.loadHide();
          if (resp.flag === true) {
            that.address = resp.address;
            that.control = '0';
            that.$utils.Store.setItem('address', resp.address);
            let range = that.$utils.Position.isRange('allmap', resp.longitude, resp.latitude, that.points);
            if (range) {
              that.signx = resp.longitude;
              that.signy = resp.latitude;
              // that.range = data[0].range;
              that.tip = '可打卡';
              that.control = '1';
            } else {
              that.tip = '';
              that.control = '2';
            }
          } else {
            that.$utils.Tools.loadHide();
            that.$utils.Tools.toastShow(i18n.t('location.failed'));
          }
        });
      },
      setConfig: function () {
        let localUrl = window.location.href.split('#')[0];
        this.$api.Sys.getConfig(localUrl, this.$params.mode).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.WeiXin.wxConfig(data);
            setTimeout(() => {
              this.onPosition();
            }, 500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onPosition: function () {
        this.$utils.Tools.loadShow();
        let that = this;
        that.$utils.WeiXin.wxGetLocation('allmap', 14, false, resp => {
          this.$utils.Tools.loadHide();
          if (resp.flag === true) {
            that.address = resp.address;
            that.control = '0';
            that.$utils.Store.setItem('address', resp.address);
            let range = that.$utils.Position.isRange('allmap', resp.longitude, resp.latitude, that.points);
            if (range) {
              that.signx = resp.longitude;
              that.signy = resp.latitude;
              // that.range = data[0].range;
              that.tip = '可打卡';
              that.control = '1';
            } else {
              that.tip = '';
              that.control = '2';
            }
          } else {
            that.$utils.Tools.loadHide();
            that.$utils.Tools.toastShow(i18n.t('location.failed'));
          }
        });
      },
      addRecord: function (item, index, currDate, image) {
        this.$utils.Tools.loadShow();
        let params = {
          fx: index === 0 ? 1 : 2,
          lname: this.$utils.Store.getItem('userLname'),
          lx: '0',
          openId: this.$utils.Store.getItem('openId'),
          sj: currDate,
          userNo: this.$utils.Store.getItem('userNo'),
          userSerial: this.userSerial,
          image: image,
          jing: this.signx,
          wei: this.signy,
          address: this.address,
        };
        let key = CryptoJS.enc.Utf8.parse('weds123456789012');
        let iv = CryptoJS.enc.Utf8.parse('weds123456789012');
        let temp = CryptoJS.enc.Utf8.parse(JSON.stringify(params));
        let data = CryptoJS.AES.encrypt(temp, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();
        this.$api.Attence.insertAttenct({
          data: data,
        }).then(response => {
          const {code, msg, data} = response;
          this.$utils.Tools.loadHide();
          if (+code !== this.$code.success) {
            if (+code === 603) {
              this.$utils.Tools.toastShow(i18n.t('attence.threedk'));
            }
          } else {
            this.ifstart[index] = true;
            // item.oktime.push(dateFormat(currDate, 'HH:mm:ss'));
            // this.$nextTick(() => {
            //   let divs = document.getElementsByClassName('div-record');
            //   divs[index].scrollTop = divs[index].scrollHeight;
            // });
            this.getToday();
            // for (let item of divs) {
            //   item.scrollTop = item.scrollHeight;
            // }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      dkclick: function (item, index) {
        if (this.control !== '1') {
          this.$utils.Tools.toastShow(i18n.t('attence.dontdk'));
        } else {
          this.index = index;
          this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              let a = this.$utils.DateUtils.getTimeStamp(data.sysDate);
              if (index === 1) {
                let b = this.$utils.DateUtils.getTimeStamp(data.sysDate.substring(0, 10) + ' ' + item.time + ':00');
                if (a < b) {
                  if (this.ifstart[1]) {
                    this.confirmTitle = '已有下班打卡记录，是否再次打卡?';
                  } else {
                    this.confirmTitle = '是否确定下班打卡?';
                  }

                  const _this = this; // 需要注意 onCancel 和 onConfirm 的 this 指向
                  this.$vux.confirm.show({
                    title: '提示',
                    content: _this.confirmTitle,
                    onConfirm() {
                      if (_this.$params.attence === '1') {
                        _this.chooseImage(item, index, data.sysDate);
                      } else {
                        _this.addRecord(item, index, data.sysDate);
                      }
                    },
                  });
                  return;
                }
              }
              if (this.$params.attence === '1') {
                this.chooseImage(item, index, data.sysDate);
              } else {
                this.addRecord(item, index, data.sysDate);
              }
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
      getBanci: function () {
        this.$api.Attence.getBanci({
          banciId: 1,
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.date = data;
            for (let i = 0; i < this.date.length; i++) {
              for (let key in this.date[i]) {
                if (key !== 'workType') {
                  this.date[i][key] = this.$utils.DateUtils.formatScmDate(
                    this.date[i][key],
                  );
                }
              }
              if (i === 0) {
                this.workData[0].time = this.date[i].startWork;
                this.workData[1].time = this.date[i].endWork;
              }
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getToday: function () {
        this.workData[0].oktime = [];
        this.workData[1].oktime = [];
        this.$api.Attence.getToday({
          userSerial: this.userSerial,
          dates: this.$utils.DateUtils.getFullDate(this.currDate),
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            // this.$utils.Tools.toastShow(msg)
          } else {
            for (let i = 0; i < data.length; i++) {
              let timeSource = data[i].sj;
              let fmtTime = '';

              // this.$params.attence === '1'
              if (timeSource.length === 19) {
                fmtTime = this.$utils.DateUtils.formatDate(timeSource, 'HH:mm:ss');
              } else {
                fmtTime = this.$utils.DateUtils.formatScmTime(timeSource);
              }

              if (+data[i].fx === 1) {
                this.workData[0].oktime.push(
                  {
                    time: fmtTime,
                    bh: data[i].bh,
                  },
                );
                this.ifstart[0] = true;
              } else if (+data[i].fx === 2) {
                this.workData[1].oktime.push(
                  {
                    time: fmtTime,
                    bh: data[i].bh,
                  },
                );
                this.ifstart[1] = true;
              }
            }
            this.$nextTick(() => {
              let divs = document.getElementsByClassName('div-record');
              for (let item of divs) {
                item.scrollTop = item.scrollHeight;
              }
            });
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    computed: {},
    created() {
      // this.jing = this.$utils.Store.getItem('longitude');
      // this.wei = this.$utils.Store.getItem('latitude');
      this.userSerial = this.$utils.Store.getItem('userSerial');
      this.getSysDate();
      this.getBanci();
    },
    async mounted() {
      await this.getRange();
      // this.$utils.WeiXin.wxReady(this.onPosition);
      this.$utils.Tools.getEnv(res => {
        if (res === 0 || res === 1) {
          this.setConfig();
          this.interval = setInterval(() => {
            // this.setConfig();
            this.onPosition();
          }, 60000);
        } else {
          this.setDtConfig();
          this.interval = setInterval(() => {
            // this.setConfig();
            this.onDtPosition();
          }, 60000);
        }
      });
    },
    destroyed() {
      clearInterval(this.interval);
      this.$utils.Tools.loadHide();
    },
  };
</script>

<style type="text/scss" lang="scss">
  .startwork-detail {
    background: #F4F5F9;

    .startwork-head {
      height: 1.2rem;
      background: #3399ff;
      color: #fff;
      font-size: 0.14rem;
      padding: 0.2rem 0.2rem;

      p {
        line-height: 0.2rem;
      }

      .startwork-dw {
        height: 0.3rem;

        .redfont {
          color: red;
        }

        .fontLine {
          line-height: 0.35rem;
        }
      }
    }

    .menu-class {
      width: 0.3rem;
      height: 0.3rem;
      margin: -0.05rem 0;
    }

    .startwork-body {
      background: #F4F5F9;
      padding-top: 0.2rem;
      font-size: 0.14rem;
      vertical-align: middle;
      text-align: center;

      div {
        padding: 0.1rem 0 0 0;
      }

      p {
        line-height: 0.3rem;
      }

      .div-body {
        float: left;
        width: 50%;

        &::before {
          border-top: 1px #d9d9d9 solid;
          -webkit-transform: scaleY(0.5);
          transform: scaleY(0.5);
          height: 1px;
        }

        .div-record {
          height: 1rem;
          overflow-y: scroll;
        }
      }

      .div-line-blue {
        height: 1px;
        border-bottom: 2px #006CFF solid;
      }

      .div-line-green {
        height: 1px;
        border-bottom: 2px #80bc05 solid;
      }

      .startwork-btn-blue {
        text-align: center;

        button {
          width: 60%;
          padding: 0.05rem 0;
        }

        .weui-btn_primary {
          background-color: #3399ff;
        }
      }

      .startwork-btn-green {
        text-align: center;

        button {
          width: 60%;
          padding: 0.05rem 0;
        }

        .weui-btn_primary {
          background-color: #80bc05;
        }
      }
    }

    .startwork-dialog {
      .dialog-image {
        padding: 0.3rem 0 0.1rem;

        img {
          height: 100%;
          width: 2.5rem;
          /*max-width: 100%;*/
          display: inline-block;
          vertical-align: middle;
        }
      }

      p {
        font-size: 0.2rem;
        padding: 0.1rem 0;

        span {
          height: 0.2rem;
          line-height: 0.2rem;
          vertical-align: middle;
        }

        i {
          font-size: 0.25rem;
          color: #000000;
        }
      }

      .dialog-btn {
        padding: 0.1rem 0;
      }
    }
  }
</style>
