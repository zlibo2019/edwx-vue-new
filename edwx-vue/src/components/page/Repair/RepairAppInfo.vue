<template>
  <div class="repair-info">
    <view-box body-padding-top="0" :body-padding-bottom="bodyBottom">
      <group :gutter="0" style="overflow-y: scroll;height: 100%;">
        <cell title="提报人">{{repairInfo.initiatorUserName}}</cell>
        <cell title="提报人联系方式">{{repairInfo.initiatorTel}}</cell>
        <cell title="故障地点">{{repairInfo.repairAddress}}</cell>
        <cell title="维修类别">{{repairInfo.repairTypeName}}</cell>
        <x-textarea title="报修问题描述" :rows="5" v-model="repairInfo.initiatorRemark" readonly></x-textarea>
        <div class="img-boxs vux-1px-t" slot="default">
          <p>附件</p>
          <span v-if="imgList.length===0">无</span>
          <img class="previewer-demo-img" v-for="(item, index) in imgList" :src="item.src"
               @click="show(index)" v-if="imgList.length>0" />
          <div v-transfer-dom>
            <previewer :list="imgList" ref="previewer" :options="options"></previewer>
          </div>
        </div>
        <cell title="报修时间">{{repairInfo.startDate}}</cell>
        <div style="height: 0.1rem;background: #F4F5F9;border-top: 1px #ECECEC solid"></div>
        <x-textarea title="维修描述" :rows="5" v-model="repairInfo.repairRemark" readonly
                    v-if="repairInfo.repairState==='1'"></x-textarea>
        <div class="img-boxs vux-1px-t" slot="default" v-if="repairInfo.repairState==='1'">
          <p>附件</p>
          <span v-if="showImgList.length===0">无</span>
          <img class="previewer-demo-img-second" v-for="(item, index) in showImgList" :src="item.src"
               @click="showSecond(index)" v-if="showImgList.length>0" />
          <div v-transfer-dom>
            <previewer :list="showImgList" ref="previewerSecond" :options="optionsSecond"></previewer>
          </div>
        </div>
        <div v-else>
          <x-textarea placeholder="维修反馈信息" :rows="5" :max="200" v-model="repairRemark"></x-textarea>
          <upload-image :limitNum="limitNum" :imgList="doneImgList"></upload-image>
        </div>
        <cell title="维修时间" v-if="repairInfo.repairState==='1'">{{repairInfo.endDate}}</cell>
        <cell title="维修评价" v-if="repairInfo.readFlag==='2'">
          <rater active-color="#3399ff" v-model="repairInfo.repairResult" disabled></rater>
        </cell>
        <x-textarea title="评价说明" :rows="5" v-model="repairInfo.resultRemark" readonly
                    v-if="repairInfo.readFlag==='2'"></x-textarea>
      </group>
      <div class="repair-bottom" v-if="repairInfo.repairState!=='1'">
        <div v-if="repairInfo.readFlag==='0'">
          <x-button text="维修受理" type="primary" @click.native="submitData('0')"></x-button>
        </div>
        <div>
          <x-button text="完成维修" type="primary" @click.native="submitData('1')"></x-button>
        </div>
      </div>
    </view-box>
  </div>
</template>
<script>
  import {Cell, Group, XButton, ViewBox, XTextarea, Previewer, Rater, TransferDom} from 'vux';
  import UploadImage from '@/components/common/UploadImage/UploadImage';

  export default {
    name: 'RepairAppInfo',
    components: {Cell, Group, XButton, ViewBox, XTextarea, Previewer, Rater, TransferDom, UploadImage},
    data() {
      return {
        doneImgList: [],   //图片列表数组
        showImgList: [],
        limitNum: 5,     //最多上传图片张数
        imgList: [],   //图片列表数组
        repairInfo: {dicFmtMap: {repairTypeCn: ''}},
        repairRemark: '',
        options: {
          getThumbBoundsFn(index) {
            let thumbnail = document.querySelectorAll('.previewer-demo-img')[index];
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            let rect = thumbnail.getBoundingClientRect();
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
          },
        },
        optionsSecond: {
          getThumbBoundsFn(index) {
            let thumbnail = document.querySelectorAll('.previewer-demo-img-second')[index];
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            let rect = thumbnail.getBoundingClientRect();
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
          },
        },
      };
    },
    directives: {
      TransferDom,
    },
    computed: {
      bodyBottom: function () {
        return this.repairInfo.repairState !== '1' ? '0.64rem' : '0';
      },
    },
    methods: {
      show: function (index) {
        this.$refs.previewer.show(index);
      },
      showSecond: function (index) {
        this.$refs.previewerSecond.show(index);
      },
      submitData: function (type) {
        this.$utils.Tools.loadShow();
        let params = {};
        if (type === '0') {
          params = {
            id: this.$route.params.state,
            readFlag: '1',
          };
        } else {
          let temp = [];
          for (let imgs of this.doneImgList) {
            temp.push(imgs.serverId);
          }
          let imgPath = temp.join(',');
          params = {
            id: this.$route.params.state,
            repairRemark: this.repairRemark,
            resultPhoto: imgPath,
            repairState: '1',
          };
        }
        this.$api.Repairs.updateByPrimaryKey(params).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.Tools.toastShow(msg);
            if (this.$route.params.notification) {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              this.$router.replace('/RepairAppList');
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getRepairInfo: function () {
        this.$utils.Tools.loadShow();
        this.$api.Repairs.selectByPrimaryKey(this.$route.params.state).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.repairInfo = data;
            if (data.photoList != null) {
              for (let i = 0; i < data.photoList.length; i++) {
                this.imgList.push({src: data.photoList[i], msrc: data.photoList[i]});
              }
            }
            if (data.resultPhotoList != null) {
              for (let i = 0; i < data.resultPhotoList.length; i++) {
                this.showImgList.push({src: data.resultPhotoList[i], msrc: data.resultPhotoList[i]});
              }
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.getRepairInfo();
    },
    mounted() {
      this.$utils.Store.setItem('repairApp', this.$route.params.index);
      if (this.$route.params.notification) {
        this.$utils.Tools.pushHistory();
      }
    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .repair-info {
    width: 100%;
    height: 100%;

    .upload-boxs {
      width: 100%;
      height: 1.4rem;
      padding: 0.1rem;
      background: #fff;
      border-top: 0.1rem solid #F4F5F9;

      p {
        font-size: 0.15rem;
        line-height: 0.3rem;
        padding-left: 0.05rem;
        color: #999999;
      }

      .upload-box {
        height: 0.5rem;

        .uploadCont {
          .showImage {
            .add-box {
              i {
                line-height: 0.5rem;
              }
            }
          }
        }

        input, img {
          float: left;
        }

        .upload-warp-img-div {
          width: 20%;
        }

        .upload-dd {
          width: 20% !important;
          float: left;
        }
      }
    }

    .img-boxs {
      width: 100%;
      float: left;
      padding: 0.05rem 0;

      span {
        margin: 0.1rem 0.1rem 0.1rem 0.15rem;
      }

      p {
        padding-left: 0.15rem;
        color: #999;
      }

      img {
        height: 0.5rem;
        width: 0.5rem;
        /*height: 100%;*/
        max-width: 0.7rem;
        max-height: 100%;
        float: left;
        margin: 0.1rem 0.1rem 0.1rem 0.15rem;
      }
    }

    .repair-bottom {
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      position: absolute;
      z-index: 500;
      bottom: 0;
      width: 100%;
      background-color: #f7f7fa;
      padding: 0.1rem 0;

      div {
        flex-grow: 1;

        button {
          width: 80% !important;
        }
      }
    }
  }
</style>
