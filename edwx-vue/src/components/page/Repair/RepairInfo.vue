<template>
  <div class="repair-info">
    <view-box body-padding-top="0" body-padding-bottom="0.62rem">
      <group :gutter="0" class="repair-form">
        <x-input title="故障地点" placeholder="" show-clear v-model="repairAddress" text-align="right"></x-input>
        <x-input title="提报人联系方式" placeholder="" show-clear v-model="initiatorTel" text-align="right"></x-input>
        <popup-picker title="维修类别" :data="dicList" v-model="repairType" placeholder="请选择"
                      :show-name="true"></popup-picker>
        <x-textarea placeholder="报修问题描述" :max="200" :rows="5" v-model="initiatorRemark"></x-textarea>
      </group>
      <upload-image :limitNum="limitNum" :imgList="imgList"></upload-image>
      <div class="repair-bottom">
        <x-button text="提交" type="primary" style="width: 80%;" @click.native="submit"></x-button>
      </div>
    </view-box>
  </div>
</template>
<script>
  import {XInput, Group, XButton, ViewBox, Datetime, XTextarea, PopupPicker} from 'vux';
  import UploadImage from '@/components/common/UploadImage/UploadImage';

  export default {
    name: 'RepairInfo',
    components: {XInput, Group, XButton, ViewBox, Datetime, XTextarea, PopupPicker, UploadImage},
    data() {
      return {
        repairAddress: '',
        initiatorTel: '',
        repairType: [],
        initiatorRemark: '',
        imgList: [],   //图片列表数组
        limitNum: 5,     //最多上传图片张数
        currDate: '',
        dicList: [[{name: '', value: ''}]],
      };
    },
    computed: {},
    methods: {
      submit: function () {
        if (this.repairAddress === '' || this.repairAddress === undefined) {
          this.$utils.Tools.toastShow('请输入故障地点');
          return;
        }
        if (this.repairType[0] === '' || this.repairType[0] === undefined) {
          this.$utils.Tools.toastShow('请选择维修类别');
          return;
        }
        this.$utils.Tools.loadShow();
        let temp = [];
        for (let imgs of this.imgList) {
          temp.push(imgs.serverId);
        }
        let imgPath = temp.join(',');
        let params = {
          repairType: this.repairType[0],
          repairAddress: this.repairAddress,
          initiatorTel: this.initiatorTel,
          initiatorRemark: this.initiatorRemark,
          repairState: '0',
          readFlag: '0',
          initiatorUser: this.$utils.Store.getItem('userSerial'),
          repairPhoto: imgPath,
        };
        this.$api.Repairs.insert(params).then(response => {
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
              this.$router.replace('/RepairList');
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getDictInfo: function () {
        this.dicList = [];
        let tempList = [];
        let params = {
          //   tenancyId: "0",
          //   typeCode: this.$constant.repairTypeDict
        };
        this.$api.Repairs.selectListByEntity(params).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            for (let item of data) {
              tempList.push({name: item.typeName, value: item.typeId});
            }
            this.dicList.push(tempList);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
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
    },
    created() {
      this.getSysDate();
      this.getDictInfo();
    },
    mounted() {
    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .repair-info {
    width: 100%;
    height: 100%;

    .repair-form {
      font-size: 0.14rem;
    }

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
