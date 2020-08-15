<template>
  <div class="door-detail">
    <view-box body-padding-top="0" body-padding-bottom="0.65rem" v-if="doors.length>0">
      <div :class="['door-detail-body', {'body-scroll':showFlag}]">
        <draggable v-model="doors" :options="options">
          <div class="door-content" v-for="(door, i) in doors" :key="i" @click="onOpen(door)">
            <i slot="icon" class="iconfont icon-kaimen" style="color: #4AA8FF;font-size: 1rem;"
               v-show="door.flag === 1"></i>
            <i slot="icon" class="iconfont icon-guanmen" style="color: #A4A4A4;font-size: 1rem;"
               v-show="door.flag === 0"></i>
            <i slot="icon" class="iconfont icon-guanmen" style="color: #4AA8FF;font-size: 1rem;"
               v-show="door.flag === -1"></i>
            <p>{{door.doorName}}</p>
          </div>
        </draggable>
      </div>
      <div class="door-detail-bottom">
        <flexbox :gutter="0" align="center">
          <flexbox-item v-if="showFlag===true" :span="0.25">
            <x-button text="取消" type="primary" @click.native="onCancel" style="width:90%;"></x-button>
          </flexbox-item>
          <flexbox-item v-if="showFlag===true" :span="0.5" style="text-align: center;">
            <span>拖动门可改变位置</span>
          </flexbox-item>
          <flexbox-item>
            <x-button v-if="showFlag===false" text="设置" type="primary" @click.native="onSetting"
                      style="width:80%;"></x-button>
            <x-button v-if="showFlag===true" text="完成" type="primary" @click.native="onUpdate"
                      style="width:90%;"></x-button>
          </flexbox-item>
        </flexbox>
      </div>
      <audio id="ok" ref="okAudio" hidden="hidden" controls="controls">
        <source src="@/assets/ok.mp3">
        <source src="@/assets/ok.wav">
        <source src="@/assets/ok.ogg">
        你的浏览器不支持html5的audio标签
      </audio>
      <audio id="no" ref="noAudio" hidden="hidden" controls="controls">
        <source src="@/assets/no.mp3">
        <source src="@/assets/no.wav">
        <source src="@/assets/no.ogg">
        你的浏览器不支持html5的audio标签
      </audio>
    </view-box>
    <div v-else>{{msg}}</div>
  </div>
</template>

<script>
  import {XButton, ViewBox, Grid, GridItem, Flexbox, FlexboxItem} from "vux";
  import Draggable from 'vuedraggable';
  import Icon from "vux/src/components/icon/index";

  export default {
    name: "DoorControl",
    components: {
      Icon,
      XButton,
      ViewBox,
      Grid,
      GridItem,
      Flexbox,
      FlexboxItem,
      Draggable,
    },
    data() {
      return {
        userSerial: 0,
        doors: [],
        options: {
          // delay: 1000,
          disabled: true,
          animation: 150,
          scroll: true
        },
        showFlag: false,
        msg: ""
      };
    },
    methods: {
      onOpen(door) {
        if (this.showFlag) {
          return;
        }
        this.$utils.Tools.loadShow("远程开门中");
        let ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
          this.$refs.okAudio.play();
          this.$refs.okAudio.pause();
          this.$refs.noAudio.play();
          this.$refs.noAudio.pause();
        }
        this.$api.Door.openDoor({
          gateBh: door.gateBh,
          userSerial: this.userSerial
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            door.flag = 0;
            this.$refs.noAudio.pause();
            this.$refs.noAudio.play();
            this.$utils.Tools.toastCancel(msg);
            setTimeout(function () {
              door.flag = -1;
            }, 1500);
          } else {
            door.flag = 1;
            this.$refs.okAudio.pause();
            this.$refs.okAudio.play();
            this.$utils.Tools.toastSuccess(msg);
            setTimeout(function () {
              door.flag = -1;
            }, 1500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onSetting: function () {
        this.showFlag = true;
        this.options.disabled = false;
      },
      onCancel: function () {
        this.showFlag = false;
        this.options.disabled = true;
        this.getDoor();
      },
      onUpdate: function () {
        this.showFlag = false;
        this.options.disabled = true;
        for (let index in this.doors) {
          this.doors[index].gateOrder = index;
        }
        this.$api.Door.updateDoor({
          doorList: this.doors,
          userSerial: this.userSerial
        }).then(response => {
            const {code, msg, data} = response;
            this.$utils.Tools.toastCustom(code, msg);
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      getDoor: function () {
        this.$api.Door.getDoor({
          userSerial: this.userSerial
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.doors = data;
              for (let index in this.doors) {
                this.$set(this.doors[index], 'flag', -1)
              }
              if (this.doors.length === 0) {
                this.$utils.Tools.toastShow("可操作的门列表为空,请联系管理员设置!");
                setTimeout(() => {
                  this.$router.go(-1);
                }, 2000);
                // this.msg = "可操作的门列表为空，请联系管理员设置";
              }
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      }
    },
    created() {
      this.$utils.Tools.loadShow();
      this.userSerial = this.$utils.Store.getItem("userSerial");
      this.getDoor();
    }
  };
</script>

<style type="text/scss" lang="scss" scoped>
  .door-detail {
    height: 100%;
    width: 100%;

    .door-detail-bottom {
      /*width: 100%;*/
      /*position: absolute;*/
      /*top: 0;*/
      /*left: 0;*/
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
    }

    .door-detail-body {
      font-size: 0.14rem;
      height: 100%;
      padding-top: 0.15rem;
      overflow-y: scroll;

      .door-content {
        width: 33%;
        height: 1.5rem;
        float: left;
        text-align: center;

        .door-image {
          width: 0.157*6rem;
          height: 0.17*6rem;
        }
      }
    }

    .body-scrolls {
      /*滚动条样式*/
      &::-webkit-scrollbar { /*滚动条整体样式*/
        width: 30px; /*高宽分别对应横竖滚动条的尺寸*/
        height: 4px;
      }

      &::-webkit-scrollbar-thumb { /*滚动条里面小方块*/
        border-radius: 5px;
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: rgba(0, 0, 0, 0.1);
      }

      &::-webkit-scrollbar-track { /*滚动条里面轨道*/
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        border-radius: 0;
        /*background: rgba(0, 0, 0, 0.1);*/
      }
    }
  }
</style>
