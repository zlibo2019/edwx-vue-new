<template>
  <div class="upload-image">
    <p v-if="title">{{title}}</p>
    <ul class="image-list">
      <li>
        <img class="previewer-demo-img" :src="item.msrc" v-for="(item,index) in imgList" @click="show(index)">
        <div v-transfer-dom>
          <previewer :list="imgList" ref="previewer" :options="options" @on-index-change="logIndexChange"></previewer>
        </div>
        <i class="iconfont icon-close remove" @click.stop="deleteImage(indx)" v-for="(itm,indx) in imgList"
           :style="{left:0.5*(indx+1)+indx*0.15-0.05+'rem'}"></i>
      </li>
      <li class="add-box" @click="chooseImage" v-if="imgList.length<limitNum">
        <i class="iconfont" :class="icon"></i>
      </li>
    </ul>
  </div>
</template>
<script>
  import {Previewer, TransferDom} from 'vux';

  export default {
    directives: {
      TransferDom,
    },
    components: {
      Previewer,
    },
    props: {
      limitNum: {//上传照片限制张数，默认 5 张(18/3/12定pc及手机端上传张数最多五张)
        type: Number,
        default: 5,
      },
      icon: {
        type: String,
        default: 'icon-jiahao',
      },
      title: {
        type: String,
        default: '上传照片',
      },
      sourceType: {
        type: Array,
        default: function () {
          return ['album', 'camera'];
        },
      },
      imgList: {
        type: Array,
        default() {
          return [];
        },
      },
    },
    data() {
      return {
        images: {
          localId: [], //已选择的本地图片
          serverId: [], //微信服务器返回的mediaId
        },
        // imgList: [], //Base64图片数组
        imgPath: [], //图片路径数组
        saveImages: {
          previewImageList: [], //预览大图数组,
          previewThumbList: [], //预览缩略图数组
          saveImageList: [], //预览大图数组//保存图片
        },
        uploadPath: '', //图片上传的路径：为空时，默认下载到当前项目的/mcupload路径下
        options: {
          getThumbBoundsFn(index) {
            let thumbnail = document.querySelectorAll('.previewer-demo-img')[index];
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            let rect = thumbnail.getBoundingClientRect();
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
          },
        },
      };
    },
    methods: {
      chooseImage() {
        this.$utils.Tools.getEnv(res => {
          if (res === 0 || res === 1) {
            this.wxChooseImage();
          } else {
            this.dtChooseImage();
          }
        });
      },
      dtChooseImage() {
        this.limitNum = this.limitNum - this.imgList.length;
        this.$utils.DingTalk.uploadImage(res => {
          if (this.$utils.Tools.isArray(res)) {
            for (const item of res) {
              this.imgList.push({src: item, msrc: item, serverId: item});
            }
          }
        }, this.limitNum);
      },
      /**
       * 选择图片
       */
      wxChooseImage() {
        this.limitNum = this.limitNum - this.imgList.length;
        let i = 0;
        this.$utils.WeiXin.wxChooseImage(res => {
          if (res.length > 0) {
            this.uploadImage(res, i);
          }
        }, this.limitNum, this.sourceType);
      },
      uploadImage(res, i) {
        this.$utils.WeiXin.wxUploadImage(serverId => {
          this.$api.Sys.getWxImageUrl(serverId, this.$params.mode).then(ress => {
            this.imgList.push({src: ress.data, msrc: res[i], serverId: serverId});
            i++;
            if (i < res.length) {
              this.uploadImage(res, i);
            }
          }).catch();
        }, res[i]);
      },
      //预览图片
      logIndexChange(arg) {
        // console.log(arg)
      },
      show(index) {
        this.$refs.previewer.show(index);
      },
      //删除图片，数据库里没删除
      deleteImage(index) {
        // console.log("删除的是第" + index + "张图片")
        this.imgList.splice(index, 1);
        this.$emit('deleteImage', index);
      },
    },
    created() {
      this.$emit('saveImages', this.imgList);
      let localUrl = window.location.href.split('#')[0];
      this.$api.Sys.getConfig(localUrl, this.$params.mode).then(response => {
        const {code, msg, data} = response;
        if (+code !== this.$code.success) {
          this.$utils.Tools.toastShow(msg);
        } else {
          this.$utils.WeiXin.wxConfig(data);
        }
      }).catch(err => {
        this.$utils.Tools.httpError();
      });
    },
  };
</script>
<style type="text/scss" lang="scss" scoped>
  .upload-image {
    overflow: hidden;
    width: 100%;
    padding: 0.1rem;
    background: #fff;
    border-top: 0.1rem solid #F4F5F9;

    p {
      font-size: 0.15rem;
      line-height: 0.3rem;
      padding-left: 0.05rem;
      color: #999999;
    }

    .image-list {
      display: flex;
      list-style: none;
      flex-wrap: wrap;
      margin-left: 0.05rem;

      li {
        position: relative;
        width: auto;
        height: 0.5rem;
        list-style: none;
        margin: 5px 0;

        i {
          width: 100%;
          height: 100%;
          display: block;
          font-size: 0.5rem;
          color: #999;
          position: relative;

          &:before {
            position: absolute;
            top: 0;
            left: 0;
            line-height: 0.5rem;
            margin: 0;
            padding: 0;
          }

          &.remove {
            font-size: 0.2rem;
            position: absolute;
            top: -0.2rem;
            color: red;
          }
        }

        &.add-box {
          width: 0.5rem;
        }

        img {
          width: 0.5rem;
          height: 100%;
          display: block;
          float: left;
          margin-right: 0.15rem;
        }
      }
    }
  }
</style>
