<template>
  <div class="repair-info">
    <view-box body-padding-top="0" :body-padding-bottom="bodyBottom">
      <group :gutter="0" style="overflow-y: scroll;height: 100%;">
        <cell title="故障地点">{{repairInfo.repairAddress}}</cell>
        <cell title="提报人联系方式">{{repairInfo.initiatorTel}}</cell>
        <cell title="维修类别">{{repairInfo.repairTypeName}}</cell>
        <x-textarea title="报修问题描述" :rows="5" v-model="repairInfo.initiatorRemark" readonly></x-textarea>
        <div class="img-boxs vux-1px-t" slot="default">
          <p>附件</p>
          <span v-if="imgList.length===0">无</span>
          <img class="previewer-demo-img" v-for="(item, index) in imgList" :src="item.src"
               @click="show(index)" v-if="imgList.length>0"/>
          <div v-transfer-dom>
            <previewer :list="imgList" ref="previewer" :options="options"></previewer>
          </div>
        </div>
        <cell title="报修时间">{{repairInfo.startDate}}</cell>
        <div style="height: 0.1rem;background: #F4F5F9;border-top: 1px #ECECEC solid"></div>
        <cell title="维修人">{{repairInfo.repairUserName}}</cell>
        <x-textarea title="维修描述" :rows="5" v-model="repairInfo.repairRemark" readonly
                    v-if="repairInfo.repairState==='1'"></x-textarea>
        <div class="img-boxs vux-1px-t" slot="default" v-if="repairInfo.repairState==='1'">
          <p>附件</p>
          <span v-if="showImgList.length===0">无</span>
          <img class="previewer-demo-img-second" v-for="(item, index) in showImgList" :src="item.src"
               @click="showSecond(index)" v-if="showImgList.length>0"/>
          <div v-transfer-dom>
            <previewer :list="showImgList" ref="previewerSecond" :options="optionsSecond"></previewer>
          </div>
        </div>
        <cell title="维修时间" v-if="repairInfo.repairState==='1'">{{repairInfo.endDate}}</cell>
        <cell title="维修评价" v-if="repairInfo.repairState==='1' && repairInfo.readFlag!=='2'">
          <rater active-color="#3399ff" v-model="repairResult"></rater>
        </cell>
        <cell title="维修评价" v-if="repairInfo.readFlag==='2'">
          <rater active-color="#3399ff" v-model="repairInfo.repairResult" disabled></rater>
        </cell>
        <x-textarea placeholder="评价说明" :rows="5" v-model="resultRemark"
                    v-if="repairInfo.repairState==='1' && repairInfo.readFlag!=='2'"></x-textarea>
        <x-textarea title="评价说明" :rows="5" v-model="repairInfo.resultRemark" readonly
                    v-if="repairInfo.readFlag==='2'"></x-textarea>
      </group>
      <div class="repair-bottom" v-if="repairInfo.repairState==='1' && repairInfo.readFlag!=='2'">
        <x-button text="提交" type="primary" style="width: 80%;" @click.native="submitData"></x-button>
      </div>
    </view-box>
  </div>
</template>
<script>
  import {Cell, Group, XButton, ViewBox, XTextarea, Previewer, Rater, TransferDom} from "vux"

  export default {
    name: "RepairDetail",
    components: {Cell, Group, XButton, ViewBox, XTextarea, Previewer, Rater, TransferDom},
    data() {
      return {
        imgList: [],   //图片列表数组
        showImgList: [],
        repairInfo: {dicFmtMap: {repairTypeCn: ''}},
        repairResult: 0,
        resultRemark: '',
        options: {
          getThumbBoundsFn(index) {
            let thumbnail = document.querySelectorAll('.previewer-demo-img')[index];
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            let rect = thumbnail.getBoundingClientRect();
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width}
          }
        },
        optionsSecond: {
          getThumbBoundsFn(index) {
            let thumbnail = document.querySelectorAll('.previewer-demo-img-second')[index];
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            let rect = thumbnail.getBoundingClientRect();
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width}
          }
        }
      }
    },
    directives: {
      TransferDom
    },
    computed: {
      bodyBottom: function () {
        return this.repairInfo.repairState === '1' && this.repairInfo.readFlag !== '2' ? "0.64rem" : "0";
      },
    },
    methods: {
      showSecond: function (index) {
        this.$refs.previewerSecond.show(index)
      },
      show: function (index) {
        this.$refs.previewer.show(index)
      },
      submitData: function () {
        this.$utils.Tools.loadShow();
        let params = {
          id: this.$route.params.state,
          repairResult: this.repairResult,
          resultRemark: this.resultRemark,
          readFlag: '2'
        };
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
              this.$router.replace("/RepairList");
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getRepairInfo: function () {
        this.$utils.Tools.loadShow();
        this.$api.Repairs.selectByPrimaryKey(this.$route.params.state).then(response => {
          const {code, msg, data} = response;
          this.$utils.Tools.loadHide();
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.repairInfo = data;
            if (data.photoList != null) {
              for (let i = 0; i < data.photoList.length; i++) {
                this.imgList.push({src: data.photoList[i], msrc: data.photoList[i]})
              }
            }
            if (data.resultPhotoList != null) {
              for (let i = 0; i < data.resultPhotoList.length; i++) {
                this.showImgList.push({src: data.resultPhotoList[i], msrc: data.resultPhotoList[i]})
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
      this.$utils.Store.setItem("repair", this.$route.params.index);
      if (this.$route.params.notification) {
        this.$utils.Tools.pushHistory();
      }
    },
    destroyed() {

    }
  }
</script>
<style type="text/scss" lang="scss">
  .repair-info {
    width: 100%;
    height: 100%;

    .repair-form {
      font-size: 0.14rem;
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
    }
  }
</style>
