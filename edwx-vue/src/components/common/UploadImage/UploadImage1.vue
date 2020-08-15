<template>
    <div class="uploadCont">
        <ul class="showImage">
            <li @click="chooseImage">
                <i class="iconfont icon-tianjia"></i>
            </li>
            <li @click="previewImage(saveImages.previewImageList[index])"
                v-for="(item,index) in saveImages.previewThumbList">
                <img :src="item"/>
                <i class="icon iconfont icon-shanchu remove" @click.stop @click="remove(index)"></i>
            </li>
        </ul>
    </div>
</template>
<script>
    // var wx = require('weixin-js-sdk');
    export default {
        data() {
            return {
                userCode: localStorage.userCode || '',//用户code
                images: {
                    localId: [], //已选择的本地图片
                    serverId: [] //微信服务器返回的mediaId
                },
                saveImages: {
                    previewImageList: [], //预览大图数组,
                    previewThumbList: [], //预览缩略图数组
                    saveImageList: [], //预览大图数组//保存图片
                },
                uploadPath: '' //图片上传的路径：为空时，默认下载到当前项目的/mcupload路径下
            }
        },
        methods: {
            /**
             * 选择图片
             */
            chooseImage() {
                let _this = this
                wx.chooseImage({
                    success: function (res) {
                        //res.localIds 是一个数组　保存了用户一次性选择的所有图片的信息　
                        _this.images.localId = res.localIds;//把图片的路径保存在images[localId]中--图片本地的id信息，用于上传图片到微信浏览器时使用
                        //alert('已选择 ' + res.localIds.length + '张图片 ');
                        //===上传
                        let length = res.localIds.length
                        if (length == 0) {
                            _this.$alert("请选择图片");
                            return;
                        }
                        var i = 0

                        _this.images.serverId = []

                        function upload() {
                            wx.uploadImage({
                                localId: _this.images.localId[i],
                                success: function (res) {
                                    i++;
                                    _this.images.serverId.push(res.serverId);
                                    //下载刚刚上传的图片
                                    JssdkService.getMediaByUser(res.serverId, _this.uploadPath, _this.userCode, function (res) {
                                        //  alert(res.substr(45));
                                        var path = res.responseParam1.split("mecwish")[1];
                                        var path_thumb = path.replace("/mcupload/", "/mcupload/_thumb/");
                                        if (path != null && path.length != 0) {
                                            _this.saveImages.saveImageList.push(path);
                                            _this.saveImages.previewImageList.push(window.location.protocol + "//" + window.location.host + '/mecwish' + path);//将图片上传的位置
                                            _this.saveImages.previewThumbList.push(window.location.protocol + "//" + window.location.host + '/mecwish' + path_thumb);//将缩略图上传的位置
                                        }
                                    })

                                    if (i < length) {
                                        upload();
                                    }
                                },
                                fail: function (res) {
                                    // alert(JSON.stringify(res));
                                }
                            });
                            _this.$emit('saveImages', _this.saveImages.saveImageList)
                        }

                        upload();
                    }
                });
            },
            //预览图片
            previewImage(currentImg) {
                let _this = this
                wx.previewImage({
                    current: currentImg,//当前图片
                    urls: _this.saveImages.previewImageList
                });
            },
            //删除图片，数据库里没删除
            remove(index) {
                this.$emit('removed', index)
                this.saveImages.saveImageList.splice(index, 1)
                this.saveImages.previewImageList.splice(index, 1)
                this.saveImages.previewThumbList.splice(index, 1)
            }
        },
        created() {
            let _this = this;
            let url = location.href.split('#')[0];
            let userCode = _this.userCode;
            _this.$emit('saveImages', _this.saveImages.saveImageList)
            JssdkService.getSignatureByUser(url, userCode, function (res) {
                if (res.responseCode != 0) {
                    _this.$alert(res.responseText);
                } else {
                    let signatureData = JSON.parse(res.responseText);
                    let timestamp = signatureData.timestamp;
                    let nonceStr = signatureData.nonceStr;
                    let signature = signatureData.signature;
                    let appId = res.responseParam1;
                    wx.config({
                        debug: false,
                        appId: appId,
                        timestamp: timestamp,
                        nonceStr: nonceStr,
                        signature: signature,
                        jsApiList: [
                            'checkJsApi',
                            'onMenuShareAppMessage',
                            'chooseImage',
                            'previewImage',
                            'uploadImage',
                            'downloadImage'
                        ]
                    });

                    wx.error(function (res) {
                        this.$alert(res.errMsg);
                    });
                }

            });

        }
    }
</script>
<style type="text/scss" lang="scss" scoped>
    .uploadCont {
        .showImage {
            display: flex;
            list-style: none;
            flex-wrap: wrap;
            li{
                position: relative;
                width: 0.5rem;
                height: 0.5rem;
                list-style: none;
                margin: 5px 2vw 7px 0;
                i{
                    display: block;
                    font-size: 0.4rem;
                }
            }
            .remove {
                z-index: 11;
                position: absolute;
                top: -14px;
                right: -20px;
                font-size: 26px
            }
            img {
                width: 100%;
                height: 100%;
            }
        }
    }
</style>
