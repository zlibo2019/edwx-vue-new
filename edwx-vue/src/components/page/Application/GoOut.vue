<template>
  <div class="go-out" :class="showFlag?'overf':''">
    <group class="apply-boxs" label-width="4.5em" label-margin-right="1em">
      <x-input title="公出地点" v-model="outPlace" text-align="right" placeholder="请输入公出地点" @on-change="getPlace"></x-input>
      <datetime title="开始时间" v-model="kssj" format="YYYY-MM-DD HH:mm" :max-hour=23
                :minute-list="minuteList" placeholder="选择时间" @on-change="changeStartTime"></datetime>
      <datetime title="结束时间" v-model="jssj" format="YYYY-MM-DD HH:mm"
                :max-hour=23 :minute-list="minuteList" placeholder="选择时间" @on-change="changeEndTime"></datetime>
      <x-textarea class="reason" :max="1000" name="description" placeholder="公出事由（最多输入1000字）" v-model="reason"
                  @on-change="getReason"></x-textarea>
    </group>
    <UploadImage :limitNum="limitNum" :icon="icon" :imgList="imgList" @saveImages="saveImages"
                 @deleteImage="deleteImage" title="附件" style="padding-left: 0.2rem"></UploadImage>
    <div class="select-box approver">
      <p><span>审批人</span><a v-if="approver.length == 0">没有审批规则或审批人，请手动选择审批人！</a></p>
      <div class="man-box">
        <dl v-for="(man,index) in approver" :key="index">
          <dt>
            <i class="iconfont icon-touxiang"></i>
            <i class="iconfont icon-close" @click="deleteApprover(index)" v-if="$params.approve === '1'"></i>
          </dt>
          <dd>{{man.userName}}</dd>
          <i class="iconfont icon-youjiantou"></i>
        </dl>
        <x-button mini plain @click.native="chooseApprover" v-if="approver.length < 10 && $params.approve === '1'">+
        </x-button>
      </div>
    </div>
    <div class="select-box copy-box" v-if="copyer.length > 0 || $params.copyuser === '1'">
      <p><span>抄送人</span>审批通过后，通知抄送人</p>
      <div class="man-box fixed" v-if="copyer.length>0">
        <p>固定抄送人：</p>
        <dl v-for="(man,index) in copyer" :key="index">
          <dt>
            <i class="iconfont icon-touxiang"></i>
          </dt>
          <dd>{{man.userName}}</dd>
        </dl>
      </div>
      <div class="man-box custom" v-if="$params.copyuser === '1'">
        <p>自定义抄送人：</p>
        <dl v-for="(man,index) in customer" :key="index">
          <dt>
            <i class="iconfont icon-touxiang"></i>
            <i class="iconfont icon-close" @click="deleteCustomer(index)"></i>
          </dt>
          <dd>{{man.userName}}</dd>
        </dl>
        <x-button mini plain @click.native="chooseCopyer">+</x-button>
      </div>
    </div>
    <div class="my-operate">
      <x-button :class="isDisabled?'disabled':''" type="primary" :disabled="isDisabled" @click.native="submitClick">提交
      </x-button>
    </div>
    <OrgTree v-model="showFlag" :selectType="selectType" dep-name="默认公司" dep-serial="10000" :info-checked="infoChecked"
             @onSelect="selectUsers"></OrgTree>
  </div>
</template>

<script>
  import {Group, Cell, XInput, Selector, PopupPicker, Datetime, XTextarea, XSwitch, XButton} from 'vux';
  import UploadImage from '@/components/common/UploadImage/UploadImage';
  import OrgTree from '@/components/common/OrgTree/OrgTree';

  export default {
    name: 'GoOut',
    components: {
      Group, Cell, XInput, Selector, PopupPicker, Datetime, XTextarea, OrgTree, XSwitch, XButton, UploadImage,
    },
    beforeRouteLeave(to, from, next) {
      if (this.showFlag) {
        next(false);
        this.showFlag = false;
      } else {
        this.$utils.Store.removeItem('kssj');
        this.$utils.Store.removeItem('jssj');
        this.$utils.Store.removeItem('outPlace');
        this.$utils.Store.removeItem('reason');
        next();
      }
    },
    data() {
      return {
        actions: this.$api.Base.dev + '/management/insertPhoto', //上传图片接口
        bh: '00110',    //假类编号
//				roomName:'',    //会议室名称
        outPlace: this.$utils.Store.getItem('outPlace') ? this.$utils.Store.getItem('outPlace') : '',     //目的地
        startDate: '',   //开始日期
        endDate: '',     //截止日期
        kssj: this.$utils.Store.getItem('kssj') ? this.$utils.Store.getItem('kssj') : '',   //开始时间
        jssj: this.$utils.Store.getItem('jssj') ? this.$utils.Store.getItem('jssj') : '',   //结束时间
        minuteList: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],  //定义分钟列表
        reason: this.$utils.Store.getItem('reason') ? this.$utils.Store.getItem('reason') : '',   //外出目的
        approver: this.$utils.Store.getItem('oldVal') ? JSON.parse(this.$utils.Store.getItem('oldVal')) : [],    //审批人
        approverChecked: [], //审批人序号
        copyer: [   //抄送人数组
          {
            userName: '刘来馨',
            userSerial: '200003',
            flag: 0,
          },
          {
            userName: '徐庆宁',
            userSerial: '200004',
            flag: 0,
          },
        ],
        copyer: [],  //固定抄送人数组
        customer: [],  //自定义抄送人数组
        copyerChecked: [],  //抄送人序号
        inputParam: [
          {
            name: 'att_id',
            value: 0,
          }, {
            name: 'base64String',
            value: '',
          }, {
            name: 'typeId',
            value: -1,
          },
        ],
        imgList: [],   //图片列表数组
        limitNum: 5,     //最多上传图片张数
        approverString: '', //审批人序号--字符串
        customerString: '', //抄送人序号--字符串
        depSerial: this.$utils.Store.getItem('orgId'),    //企业ID
        depName: this.$utils.Store.getItem('orgName'),    //企业名称
        imgPath: [], //图片地址
        imgIndex: 0, //图片数组下标
        choose: this.$utils.Store.getItem('choose') ? this.$utils.Store.getItem('choose') : 0,   //添加人员类型   1：审批人  2：抄送人  3：同行人
        showFlag: false, //是否显示组织架构弹窗
        selectType: 0,   //组织架构选择类型
        infoChecked: [], //
        approverChecked: [], //审批人选中
        customerChecked: [], //自定义抄送人选中
        icon: 'icon-jiahao', //icon加号
      };
    },
    computed: {
      isDisabled() {
        if (this.kssj != '' && this.jssj != '' && this.outPlace != '' && this.reason != '' && this.approver.length > 0) {    /**/
          return false;
        } else {
          return true;
        }
      },
      infoChecked() {
        if (this.selectType == 1 && this.approverChecked.length > 0) {
          return this.approverChecked;
        } else if (this.selectType == 9999 && this.customerChecked.length > 0) {
          return this.customerChecked;
        }
      },
    },
    methods: {
      /** function 获取服务器时间---今日日期
       *   wzx
       *   2019-01-11
       **/
      getSysDate() {
        this.$utils.Tools.loadShow();
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.startDate = data.sysDate.substring(0, 10);
            console.log(111111, this.startDate);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 获取目的地
       *   wzx
       *   2019-01-05
       **/
      getPlace(val) {
        this.outPlace = val;
        this.$utils.Store.setItem('outPlace', val);
      },
      /** function 获取外出开始时间
       *   wzx
       *   2019-01-05
       **/
      changeStartTime(val) {
        this.kssj = val;
        this.$utils.Store.setItem('kssj', val);
        this.startDate = val.substring(0, 10);
        // this.endHour = parseInt(val.substring(11,13));
        // console.log(666,this.endHour)
        /*if(this.jssj != '' && this.kssj>this.jssj){
            this.$utils.Tools.toastShow("开始时间不能大于结束时间");
            setTimeout(()=>{
                this.kssj = '';
            },2000)
        }*/
      },
      /** function 获取外出结束时间
       *   wzx
       *   2019-01-05
       **/
      changeEndTime(val) {
        this.jssj = val;
        this.$utils.Store.setItem('jssj', val);
        this.endDate = val.substring(0, 10);
        // this.startHour = parseInt(val.substring(11,13));
        // console.log(666,this.endHour)
        /*if(this.kssj != '' && this.jssj<this.kssj){
            this.$utils.Tools.toastShow("结束时间不能小于开始时间");
            setTimeout(()=>{
                this.jssj = '';
            },2000)
        }*/
      },
      /** function 获取外出事由
       *   wzx
       *   2019-01-05
       **/
      getReason(val) {
        this.reason = val;
        this.$utils.Store.setItem('reason', val);
      },
      onChange(val) {
        console.log('val change', val);
      },
      onShow() {
        console.log('on show');
      },
      onHide(type) {
        console.log('on hide', type);
      },
      /** function 获取审批人数组
       *   wzx
       *   2018-12-26
       * */
      selectUsers(val) {
        if (this.selectType == 1) {
          if (this.approver.length > 0) {
            let result = this.approver.some(item => {
              if (item.userSerial == val[0].userSerial) {
                return true;
              }
            });
            if (result) {
              this.$utils.Tools.toastShow('审批人不可重复');
            } else {
              this.approver.push(...val);
            }
          } else {
            this.approver.push(...val);
          }
        } else {
          if (this.customer.length > 0) {
            this.customer = [];
            this.customer.push(...val);
            let hash = {};
            /*es6数组去重*/
            const newArr = this.customer.reduceRight((item, next) => {
              hash[next.userSerial] ? '' : hash[next.userSerial] = true && item.push(next);
              return item;
            }, []);
            this.customer = newArr;
            for (const b of this.customer) {
              this.customerChecked.push(b.userSerial);
            }
          } else {
            this.customer.push(...val);
            for (const b of this.customer) {
              this.customerChecked.push(b.userSerial);
            }
          }
        }
      },
      selectApprovalUser() {
        this.$utils.Tools.loadShow();
        this.$api.Approver.selectApprovalUser({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            // this.$utils.Tools.toastShow(msg);
          } else {
            console.log(6666, data);
            this.approver = [];
            this.approver.push(...data);
            this.$utils.Store.setItem('oldVal', JSON.stringify(data[0]));
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 删除审批人
       *   wzx
       *   2018-12-28
       * */
      deleteApprover(index) {
        this.approver.splice(index, 1);
        if (this.approver.length == 0) {
          this.$utils.Store.removeItem('oldVal');
        } else {
          this.$utils.Store.setItem('oldVal', JSON.stringify(this.approver[index - 1]));
        }
      },
      /** function 获取固定抄送人数组
       *   wzx
       *   2018-12-27
       **/
      selectCopyUser() {
        this.$api.Copyer.selectCopyUser({
          lx: 2,    //0:请假  1:出差  2:外出  3:加班  4:调班  5:补出勤 6:合同
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          const {code, msg, data} = response;
          // console.log(666,response)
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.copyer.push(...data);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 删除自定义抄送人
       *   wzx
       *   2019-01-04
       * */
      deleteCustomer(index) {
        this.customer.splice(index, 1);
      },
      /** function 添加审批人
       *   wzx
       *   2018-12-29
       * */
      chooseApprover() {       //copyType----1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.infoChecked = [];
        this.selectType = 1;
        this.showFlag = true;
      },
      /** function 添加抄送人
       *   wzx
       *   2018-12-29
       * */
      chooseCopyer() {       //copyType----1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.infoChecked = [];
        this.selectType = 9999;
        this.showFlag = true;
        for (const b of this.customer) {
          this.infoChecked.push(b.userSerial);
        }
      },
      /** function 提交出差申请
       *   wzx
       *   2019-01-05
       * */
      submitClick() {
        if (this.kssj > this.jssj) {
          this.$utils.Tools.toastShow('开始时间不能大于结束时间');
        } else {
          this.approverChecked = [];
          this.imgPath = [];
          for (const i of this.approver) {
            this.approverChecked.push(i.userSerial);
          }
          let myapprover = JSON.stringify(this.approverChecked).replace(/\[|]|"/g, '');
          this.approverString = myapprover;
          let mycopyer = JSON.stringify(this.customerChecked).replace(/\[|]|"/g, '');
          this.customerString = mycopyer;
          for (var imgs of this.imgList) {
            this.imgPath.push(imgs.serverId);
          }
          // console.log(6666,this.imgPath)
          let imgPath = JSON.stringify(this.imgPath).replace(/\[|]|"/g, '');
          this.$utils.Tools.loadShow();
          this.$api.Out.insertOut({
            bh: this.bh,
            bz: this.reason,
            imgPath: imgPath,
            kssj: this.kssj,
            jssj: this.jssj,
            outPlace: this.outPlace,
            processId: '',
            qjlx: 1,
            userSerial: this.$utils.Store.getItem('userSerial'),
            xh: '',
            approver: this.approverString,
            copyUser: this.customerString,
          }).then(response => {
            this.$utils.Tools.loadHide();
            console.log(2222, response);
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
              if (code == 602) {

              }
            } else {
              this.$utils.Tools.toastShow('提交成功');
              this.$router.go(-1);
              // this.$router.replace('/MyApply')
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
      getSysApproveUser() {
        this.approver = [];
        this.$api.DepUser.selectListByEntity({
          userSerial: this.$utils.Store.getItem('userSerial'),
          lx: 1,
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            // this.$utils.Tools.toastShow(msg);
          } else {
            this.approver.push(...data);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.getSysDate();
      if (this.$params.approve === '1') {
        this.selectApprovalUser();
      } else {
        this.getSysApproveUser();
      }
      this.selectCopyUser();
    },
    mounted() {

    },
    destroyed() {
      this.$utils.Store.removeItem('oldVal');
    },
  };
</script>

<style type="text/scss" lang="scss">
  .go-out {
    width: 100%;
    height: 100%;

    &.overf {
      overflow: hidden;
    }

    .apply-boxs {
      width: 100%;
      height: auto;

      .weui-cells {
        margin: 0;

        .weui-cell {
          height: 0.5rem;
          padding-left: 0.3rem;
          position: relative;

          &:after {
            width: 0.2rem;
            height: 0.5rem;
            content: "*";
            position: absolute;
            top: 0.15rem;
            left: 0.15rem;
            font-size: 0.2rem;
            color: red;
            border: none;
            transform: scaleY(1);
          }

          .vux-cell-primary {
            text-align: right;

            .vux-x-switch {
              padding: 0;

              .weui-cell__bd {
                .weui-label {
                  float: right;
                }
              }
            }
          }

          &.reason {
            height: auto;
            min-height: 1rem;
            padding: 0.1rem 0.2rem 0.1rem 0.3rem;
            overflow-y: scroll;

            &:after {
              top: 0.1rem;
            }

            .weui-cell__bd {
              height: 0.6rem;

              textarea {
                height: 0.6rem;
                line-height: 0.2rem;
                /*font-size: 0.13rem;*/
              }
            }
          }
        }

        .vux-datetime {
          > div {
            p {
              color: #999;
            }
          }

          .vux-cell-primary {
            .vux-cell-value {
              color: #333;
            }
          }
        }
      }
    }

    .upload-boxs {
      width: 100%;
      height: 1.2rem;
      padding: 0.1rem;
      background: #fff;
      border-top: 0.1rem solid #F4F5F9;

      p {
        font-size: 0.13rem;
        line-height: 0.3rem;
        padding-left: 0.1rem;
      }

      .upload-box {
        height: auto;

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

    .select-box {
      width: 100%;
      height: auto;
      padding: 0.1rem 0.2rem 0.02rem 0.3rem;
      border-top: 10px solid #F4F5F9;
      background: #fff;
      position: relative;

      &:before {
        width: 0.2rem;
        height: 0.4rem;
        content: "*";
        position: absolute;
        top: 0.1rem;
        left: 0.15rem;
        font-size: 0.2rem;
        color: red;
        border: none;
        transform: scaleY(1);
      }

      &.approver {
        > p {
          a {
            color: red;
          }
        }

        .man-box {
          dl {
            margin-right: 0.2rem;
            position: relative;

            i.icon-youjiantou {
              font-size: 0.15rem;
              position: absolute;
              top: 0.2rem;
              margin: auto;
              right: -0.2rem;
              color: #D2D5DD;
            }

            &:last-of-type {
              i.icon-youjiantou {
                display: none;
              }
            }
          }
        }
      }

      &.copy-box {
        padding-bottom: 0.9rem;

        &:before {
          content: "";
        }
      }

      > p {
        font-size: 0.12rem;
        line-height: 0.2rem;
        color: #A7A9A8;

        span {
          font-size: 0.14rem;
          margin-right: 0.1rem;
          color: #666;
        }
      }

      .man-box {
        width: 100%;
        height: auto;
        min-height: 0.6rem;
        overflow: hidden;
        padding: 0.05rem 0;

        p {
          font-size: 0.13rem;
          line-height: 0.3rem;
        }

        dl {
          width: 0.6rem;
          height: 0.65rem;
          float: left;
          text-align: center;
          margin-right: 0.05rem;
          margin-bottom: 0.06rem;

          dt {
            position: relative;

            i {
              font-size: 0.4rem;
              display: block;
              color: #ccc;

              &.icon-close {
                position: absolute;
                top: -0.02rem;
                right: 0.05rem;
                font-size: 0.18rem;
                color: red;
              }
            }
          }

          dd {
            height: 0.2rem;
            font-size: 0.12rem;
            line-height: 0.2rem;
            overflow: hidden;
          }
        }

        .weui-btn_mini {
          width: 0.4rem;
          height: 0.4rem;
          padding: 0;
          background: #3399ff;
          text-align: center;
          line-height: 0.4rem;
          font-size: 0.3rem;
          color: #fff;
          border-radius: 50%;
          border: none;
          float: left;
          box-shadow: 0 2px 8px 2px rgba(51, 153, 255, .3);
        }
      }
    }

    .my-operate {
      width: 100%;
      height: 0.86rem;
      padding: 0.2rem 0;
      background: #fff;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 30;
      border-top: 1px solid #e5e5e5;

      .weui-btn {
        width: 80%;
        height: 0.46rem;
        font-size: 0.18rem;

        &.disabled {
          background: #A2A2A2;
        }
      }
    }
  }
</style>
