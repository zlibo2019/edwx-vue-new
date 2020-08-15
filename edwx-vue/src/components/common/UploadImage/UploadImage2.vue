<template>
    <div class="load-img">
        <div>
            <iframe id="id_iframe" name="nm_iframe" style="display:none;"></iframe><!--submit的跳转-->
        </div>
        <form class="upload-div upload-new1" :id="formId" :action="form_action" enctype="multipart/form-data"
              method="post" target="nm_iframe">
            <dt class="upload-img">
                <div class="upload-warp-img-div" v-for="(item,index) in imgList">
                    <div class="upload-warp-img-div-top" v-if="!disabled"><!--禁用时无删除按钮,可查看-->
                        <img :src="delImgName" class="upload-warp-img-div-del" @click="fileDel(index, item)">
                    </div>
                    <img :src="item.file.src" @click="clickImg(index)" :style="imgDivStyle">
                    <!--<p class="progress-bar"></p>-->
                    <!--　　　　　　<p class="progress-txt">0%</p>-->
                </div>
                <div :class="'upload-dd upload-dd'+inputId"
                     :style="'background: url('+addImgName+')no-repeat center center /90% 90%;'">
                    <input :name="inp.name" :value="inp.value" style="display: none" v-for="(inp) in inputParam"/>
                    <!--其他参数-->
                    <input type="file" @change="fileChange($event)" :id="inputId" :name="inputName"
                             accept="image/*" :disabled="disabled" :style="disabled==true? 'cursor:not-allowed':'cursor:pointer'"><!-- :multiple="multiple"-->
                </div>
            </dt>
        </form>
        <imgSwiper v-if="showImg" @clickit="viewImg" :cindex_js="cidx_swp" :data="swipList"></imgSwiper>
    </div>
</template>
<script>
    import imgSwiper from '@/components/common/UploadImage/BigImg-swiper'
    // import Exif from 'exif-js'

    export default {
        components: {
            imgSwiper
        },
        props: {
            limitNum: {//上传照片限制张数，默认 5 张(18/3/12定pc及手机端上传张数最多五张)
                type: Number,
                default: 5
            },
            multiple: {//是否可选多张图片
                type: Boolean,
                default: true
            },
            inputId: {//input id 必设项
                type: String,
                default: ''
            },
            formId: {//form id 必设项
                type: String,
                default: ''
            },
            form_action: {//form action接口url
                type: String,
                default: ''
            },
            inputName: {//form input对应name
                type: String,
                default: 'image'
            },
            inputParam: {//form input其他参数列表
                type: Array,
                default: function () {
                    return [{//格式-> name:'',value:''
                        name: '',
                        value: ''
                    }]
                }
            },
            /*delUrl: {//删除图片接口名称(暂时没用，删除方法已提供)
                type: String,
                default: ''
            },
            delParams: {//删除图片接口的参数(暂时没用，删除方法已提供)
                type: Array,
                default: function () {
                    return []
                }
            },*/
            addImgName: {//加号图片背景名称
                type: String,
                default: require("./icons/addImg.png")
            },
            delImgName: {//删除按钮图片名称
                type: String,
                default: require("./icons/smallDel.png")
            },
            imgDivStyle: {//img样式，可设置border角度
                type: String,
                default: ''
            },
            typeImg: {//参数 区分大小图的---> 图片上传类型 1 代表文件流 2 代表数据流
                type: Number,
                default: 0
            },
            imgList: {
                type: Array,
                default() {
                    return []
                }
            },
            disabled: {//禁用属性
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                // imgList: this.imgLists,
                showImg: false,
                cidx_swp: '',
                swipList: [],//图片轮播swiper
                baseJson: '',//base格式数据流
                typeId: this.typeImg,   // 图片上传类型 1 代表文件流 2 代表数据流
                options: {
                    getThumbBoundsFn(index) {
                        let thumbnail = document.querySelectorAll('.previewer-demo-img')[index]
                        let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
                        let rect = thumbnail.getBoundingClientRect()
                        return {x: rect.left, y: rect.top + pageYScroll, w: rect.width}
                    }
                },
            }
        },
        computed: {},
        watch: {
            imgList() {//监听数组的变化并遍历拼接-成轮播列表
                let arr = []
                for (let i = 0; i < this.imgList.length; i++) {
                    var file = {};
                    file.img = this.imgList[i].file.src;
                    arr[i] = file;
                }
                //传给swiper指定数组 swiper的数组需要使用img字段接收
                this.swipList = arr;//要二次赋值，否则会被清空
            }
        },
        methods: {
            fileChange(el) {
                if (!el.target.files[0].size) return;
                this.fileList(el.target);
//                el.target.value = ''//submit之后清空，可上传重复图片
            },
            fileList(fileList) {
                let files = fileList.files;
                //上传图片的按钮是否显示
                if ((this.imgList.length + files.length) > this.limitNum) return
                if ((this.imgList.length + files.length) == this.limitNum) {
                    $('.upload-dd' + this.inputId).css('display', 'none');
                }
                for (let i = 0; i < files.length; i++) {
                    //判断是否为文件夹
                    if (files[i].type != '') {
                        this.fileAdd(files[i]);
                    } else {
                        //文件夹处理
                        this.folders(fileList.items[i]);
                    }
                }
            },
            //文件夹处理
            folders(files) {
                let _this = this;
                //判断是否为原生file
                if (files.kind) {
                    files = files.webkitGetAsEntry();
                }
                files.createReader().readEntries(function (file) {
                    for (let i = 0; i < file.length; i++) {
                        if (file[i].isFile) {
                            _this.foldersAdd(file[i]);
                        } else {
                            _this.folders(file[i]);
                        }
                    }
                })
            },
            foldersAdd(entry) {
                let _this = this;
                entry.file(function (file) {
                    _this.fileAdd(file)
                })
            },
            fileAdd(file) {
                let self = this;
                self.$utils.Tools.loadShow();
                let Orientation;
                //去获取拍照时的信息，解决拍出来的照片旋转问题
                EXIF.getData(file, function () {
                    Orientation = EXIF.getTag(this, 'Orientation');
                });
                //判断是否为图片文件
                if (file.type.indexOf('image') == -1) {
                    file.src = 'wenjian.png';
                    this.imgList.push({
                        file
                    });
                } else {
                    let reader = new FileReader();
                    reader.vue = this;
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        let result = this.result;
                        let img = new Image();
                        img.src = result;
                        if (this.result.length <= (1000 * 1024)) {
                            self.typeId = 2;
                            // console.log('resule',result)
                            img.onload = function () {
                                let data = self.compress(img, Orientation);
                                file.src = data;
                                data = data.substring(data.indexOf(',') + 1);
                                self.baseJson = data;
                                self.$emit('compressBaseData', self.baseJson) //提交之前将压缩baseData数据传到外面
                                // self.$emit('compressBaseData', '') //提交之前将压缩baseData数据传到外面
                                self.imgList.push({
                                    file
                                });
                                setTimeout(function () {//内部传外部baseData，再从外部传到内部的baseData参数有延迟，不能及时当成参数放到submit之前
                                    $("#" + self.formId).submit();
                                })
                            }
                        } else {
                            self.typeId = 2;
                            img.onload = function () {
                                let data = self.compress(img, Orientation);
                                file.src = data;
                                data = data.substring(data.indexOf(',') + 1);
                                self.baseJson = data;
                                self.$emit('compressBaseData', self.baseJson) //提交之前将压缩baseData数据传到外面
                                // console.log(2222,data)
                                self.imgList.push({
                                    file
                                });
                                setTimeout(function () {//内部传外部baseData，再从外部传到内部的baseData参数有延迟，不能及时当成参数放到submit之前
                                    $("#" + self.formId).submit();
                                })
                            }
                        }
                    }
                }
            },
            fileDel(index, item) {
                this.imgList.splice(index, 1);
                if (this.limit !== undefined) this.limit = this.imgList.length;
                // 上传按钮的显示
                if (this.imgList.length < this.limitNum) {
                    $('.upload-dd' + this.inputId).css('display', 'inline-block');
                }
                this.$emit('delUploadImg', item)//删除图片事件
            },
            rotateImg(img, direction, canvas) {
                // alert("旋转90度")
                //最小与最大旋转方向，图片旋转4次后回到原方向
                // alert("1次")
                const min_step = 0;
                const max_step = 3;
                if (img == null) return;
                //img的高度和宽度不能在img元素隐藏后获取，否则会出错
                let height = img.height;
                let width = img.width;
                let step = 2;
                if (step == null) {
                    step = min_step;
                }
                if (direction == 'right') {
                    step++;
                    //旋转到原位置，即超过最大值
                    step > max_step && (step = min_step);
                } else {
                    step--;
                    step < min_step && (step = max_step);
                }
                //旋转角度以弧度值为参数
                let degree = step * 90 * Math.PI / 180;
                let ctx = canvas.getContext('2d');
                switch (step) {
                    case 0:
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0);
                        break;
                    case 1:
                        canvas.width = height;
                        canvas.height = width;
                        ctx.rotate(degree);
                        ctx.drawImage(img, 0, -height);
                        break;
                    case 2:
                        canvas.width = width;
                        canvas.height = height;
                        ctx.rotate(degree);
                        ctx.drawImage(img, -width, -height);
                        break;
                    case 3:
                        // alert("旋转90度")
                        canvas.width = height;
                        canvas.height = width;
                        ctx.rotate(degree);
                        ctx.drawImage(img, -width, 0);
                        break;
                }
            },
            compress(img, Orientation) {
                // alert(Orientation)
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext('2d');
                //瓦片canvas
                let tCanvas = document.createElement("canvas");
                let tctx = tCanvas.getContext("2d");
                let initSize = img.src.length;
                let width = img.width;
                let height = img.height;
                //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
                let ratio;
                if ((ratio = width * height / 4000000) > 1) {
                    //console.log("大于400万像素")
                    ratio = Math.sqrt(ratio);
                    width /= ratio;
                    height /= ratio;
                } else {
                    ratio = 1;
                }
                canvas.width = width;
                canvas.height = height;
                //        铺底色
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                //如果图片像素大于100万则使用瓦片绘制
                let count,ndata;
                if ((count = width * height / 1000000) > 1) {
                    //console.log("超过100W像素");
                    count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
                    //            计算每块瓦片的宽和高
                    let nw = ~~(width / count);
                    let nh = ~~(height / count);
                    tCanvas.width = nw;
                    tCanvas.height = nh;
                    for (let i = 0; i < count; i++) {
                        for (let j = 0; j < count; j++) {
                            tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                            ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                        }
                    }
                    //console.log("走这里了")
                } else {
                    ctx.drawImage(img, 0, 0, width, height);
                    //console.log("不走这里了",width,height)
                }
                //修复ios上传图片的时候 被旋转的问题
                if (Orientation != "" && Orientation != 1) {
                    switch (Orientation) {
                        case 6://需要顺时针（向左）90度旋转
                            this.rotateImg(img, 'left', canvas);
                            break;
                        case 8://需要逆时针（向右）90度旋转
                            this.rotateImg(img, 'right', canvas);
                            break;
                        case 3://需要180度旋转
                            this.rotateImg(img, 'right', canvas);//转两次
                            this.rotateImg(img, 'right', canvas);
                            break;
                    }
                }
                //进行最小压缩
                ndata = canvas.toDataURL('image/jpeg', 0.1);
                //console.log('压缩前：' + initSize);
                //console.log('压缩后：' + ndata.length);
                //console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
                tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
                return ndata;
            },
            //将以base64的图片url数据转换为Blob,用url方式表示的base64图片数据
            convertBase64UrlToBlob(urlData) {
                var arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], {type: mime});
            },
            viewImg() {
                this.showImg = false;
            },
            clickImg(e, index) {
                this.cidx_swp = index
                //点击图片隐藏
                this.showImg = true;
            },

            /** function 图片预览--显示大图
             *   wzx
             *   2018-12-17
             * */
            logIndexChange(arg) {
                // console.log(arg)
            },
            formLoad() {//加载formjs回调函数
                let vthis = this
                const token = vthis.$utils.Store.getItem('token');
                var options = {
                    dataType: 'json',
                    headers:
                        {
                            "Authorization": token
                        },
                    beforeSubmit: function (formData, jqForm, options) {
                        // console.log('222', vthis.inputParam)
                        // var base = {name:'base64String',value: vthis.baseJson}
                        // formData.push(base)
                        // var typeId = {name:'typeId',value: vthis.typeId}
                        // formData.push(typeId)
                        // console.log('formbeforeSubmit', formData, jqForm, options)
                    },
                    success: function (responseText, statusText, xhr, $form) {
                        // console.log('form提交之后回调', responseText)
                        //赋值给当前att_id
                        // vthis.att_id1 = responseText.data.list[0].att_id;
                        //获取图片-给图片附上id
                        vthis.$emit('loadSuccess', responseText, vthis.baseJson)//form回调函数之后的加载接口
                        // console.log('list', this.imgList)
                    },
                    error: function (xhr, status, err) {
                        // alert("操作失败");
                        vthis.$emit('loadError', xhr)//form回调函数之后的加载接口
                    }
                };
                $("#" + this.formId).submit(function () {
                    //初始化
                    // console.log(2222, options, $(this))
                    $(this).ajaxSubmit(options);
                    return false;   //防止表单自动提交
                });
            },
        },
        mounted() {
//            this.limitNum = 6;//最多上传五张(原方法有bug)
            let vthis = this
            //监听文本框输入的时候
            /*$('textarea').bind('input propertychange', function () {
                vthis.onvalue($(this).val())
            });*/
            $('.upload-div .upload-dd').width($('.upload-div .upload-dd').height())
            this.formLoad();//加载form回调函数
        },
        updated() {
            $('.upload-div li dd > div').width($('.upload-div .upload-dd').height())
            $('.upload-div .upload-dd').width($('.upload-div .upload-dd').height())
        },
        destroyed() {
        }
    }
</script>

<style type="text/scss" lang="scss">
    .load-img {
        width: 100%;
        height: 100%;
    }

    .upload-div, .upload-new1 {
        width: 100%;
        height: 100%;
        letter-spacing: -5px;
        position: relative;

        dt {
            float: left;
        }
        dt.upload-img {
            width: 100%;
            height: 100%;
            white-space: nowrap;
            padding-bottom: 0;

            .upload-warp-img-div {
                width: 20%;
                height: 100%;
                position: relative;
                display: inline-block;
                padding: 1% 2%;
                float: left;

                img {
                    height: 100%;
                    width: 100%;
                    display: block;
                    float:left;
                    border: 1px solid #D3DBE3;
                    border-radius: 3px;
                }
                .upload-warp-img-div-top {

                    img {
                        width: 3vh;
                        height: 3vh;
                        position: absolute;
                        top: -0.05rem;
                        right: -0.05rem;
                        border: 0;
                    }
                }

                .progress-bar {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 30px;
                    line-height: 30px;
                    background-color: rgba(100, 100, 100, 0.5);
                    width: 0;
                    text-align: center;
                }
                .progress-txt {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    color: #fff;
                    width: 100%;
                    height: 30px;
                    line-height: 30px;
                    font-size: 16px;
                    z-index: 10;
                    text-align: center;
                }
            }
        }
        .upload-dd {
            display: inline-block;
            width: 20%;
            padding: 1% 2%;
            height: 100%;
            border: 0px solid;

            input[type='file'] {
                width: 100%;
                height: 100%;
                opacity: 0;
            }
        }
    }
</style>


