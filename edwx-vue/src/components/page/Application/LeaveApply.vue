<template>
  <div class="leave-apply">
    <div :class="showFlag?'overfh':'overfa'" style="padding-bottom: 0.86rem;height: 100%;">
      <group class="apply-boxs" label-width="8.5em" label-margin-right="1em">
        <popup-picker class="leave-type" title="请假类型" :data="leaveList" :columns="1" v-model="leaveType"
                      placeholder="请选择"
                      :show-name="true" @on-change="changeLeave"></popup-picker>
        <datetime title="开始时间" v-model="kssj" format="YYYY-MM-DD HH:mm" :max-hour=23
                  :minute-list="minuteList" placeholder="选择时间" @on-change="changeStartTime"></datetime>
        <!-- :start-date="startDate" :min-hour="curHour" :end-date="endDate"-->
        <datetime title="结束时间" v-model="jssj" format="YYYY-MM-DD HH:mm"
                  :max-hour=23 :minute-list="minuteList" placeholder="选择时间" @on-change="changeEndTime"></datetime>
        <!-- :start-date="startDate"-->
        <x-input title="请假时长（小时）" v-model="leaveLength" type="text" placeholder="输入格式：2、1.5" text-align="right"
                 @on-blur="getLeaveLength" v-if="$params.leaveLength === '1'"></x-input>
        <x-textarea class="reason" :max="1000" name="description" placeholder="请假事由（最多输入1000字）" v-model="reason"
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
          <!--<i class="iconfont icon-tianjia" @click="chooseApprover" v-if="approver.length<=10"></i>-->
        </div>
      </div>
      <div class="select-box copy-box" v-if="copyer.length > 0 || $params.copyuser === '1'">
        <p><span>抄送人</span>审批通过后，通知抄送人</p>
        <div class="man-box fixed" v-if="copyer.length > 0">
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
          <!--<i class="iconfont icon-tianjia" @click="chooseCopyer"></i>-->
        </div>
      </div>
    </div>
    <div class="my-operate">
      <x-button :class="isDisabled?'disabled':''" type="primary" :disabled="isDisabled"
                @click.native="submitClick">提交
      </x-button>
    </div>
    <OrgTree v-model="showFlag" :selectType="selectType" dep-name="默认公司" dep-serial="10000"
             :info-checked="infoChecked"
             @onSelect="selectUsers"></OrgTree>
  </div>
</template>
<script>
  import {
    Group,
    Cell,
    XInput,
    Selector,
    PopupPicker,
    Datetime,
    XTextarea,
    XSwitch,
    XButton,
    Previewer,
    TransferDomDirective as TransferDom,
  } from 'vux';
  import UploadImage from '@/components/common/UploadImage/UploadImage';
  import OrgTree from '@/components/common/OrgTree/OrgTree';

  export default {
    name: 'LeaveApply',
    components: {
      Group,
      Cell,
      XInput,
      Selector,
      PopupPicker,
      Datetime,
      XTextarea,
      XSwitch,
      XButton,
      OrgTree,
      UploadImage,
      Previewer,
    },
    beforeRouteLeave(to, from, next) {
      if (this.showFlag) {
        next(false);
        this.showFlag = false;
      } else {
        this.$utils.Store.removeItem('kssj');
        this.$utils.Store.removeItem('jssj');
        this.$utils.Store.removeItem('leaveLength');
        this.$utils.Store.removeItem('reason');
        next();
      }
    },
    data() {
      return {
        actions: this.$api.Base.dev + '/management/insertPhoto', //上传图片接口
        leaveList: [
          {
            name: '事假',
            value: '1',
          },
          {
            name: '病假',
            value: '2',
          },
          {
            name: '婚假',
            value: '3',
          },
          {
            name: '丧假',
            value: '4',
          },
          {
            name: '陪护假',
            value: '5',
          },
          {
            name: '工伤假',
            value: '6',
          },
          {
            name: '其他',
            value: '7',
          },
        ],
        leaveList: [],
        leaveType: [],
        startDate: '',   //开始日期
        endDate: '',     //截止日期
        kssj: this.$utils.Store.getItem('kssj') ? this.$utils.Store.getItem('kssj') : '',   //开始时间
        jssj: this.$utils.Store.getItem('jssj') ? this.$utils.Store.getItem('jssj') : '',   //结束时间
        minuteList: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],  //定义分钟列表
        leaveLength: null,     //请假时长
        approver: this.$utils.Store.getItem('oldVal') ? JSON.parse(this.$utils.Store.getItem('oldVal')) : [],    //审批人
        approverChecked: [], //审批人序号
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
        imgPath: [], //图片地址
        limitNum: 5,     //最多上传图片张数
        bh: '00101',     //假类编号
        reason: this.$utils.Store.getItem('reason') ? this.$utils.Store.getItem('reason') : '',      //请假事由
        depSerial: this.$utils.Store.getItem('orgId'),    //企业ID
        depName: this.$utils.Store.getItem('orgName'),    //企业名称
        approverString: '', //审批人序号--字符串
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
        if (this.leaveType.length > 0 && this.kssj !== '' && this.jssj !== '' && this.reason !== '' && this.approver.length > 0) {    /**/
          if (this.$params.leaveLength === '1') {
            return this.leaveLength === '';
          } else {
            return false;
          }
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
            console.log(111111, data.sysDate, this.startDate);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 获取请假类型数组
       *   wzx
       *   2018-12-27
       * */
      getLeaveList() {
        this.$utils.Tools.loadShow();
        this.$api.Leave.selectLeave().then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            for (const i of data) {
              this.leaveList.push({name: i.mc, value: i.bh});
            }
            // console.log(33333333,this.leaveList)
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 获取假类编号
       *   wzx
       *   2018-12-26
       * */
      changeLeave(val) {
        this.leaveType = val;
        this.bh = val[0];
        this.$utils.Store.setItem('bh', val[0]);
        console.log('val change', val, this.bh);
      },
      /** function 获取请假开始时间
       *   wzx
       *   2018-12-26
       **/
      changeStartTime(val) {
        this.kssj = val;
        this.$utils.Store.setItem('kssj', val);
        this.startDate = val.substring(0, 10);
        /*if (this.jssj != '' && this.kssj > this.jssj) {
            this.$utils.Tools.toastShow("开始时间不能大于结束时间");
            setTimeout(() => {
                this.kssj = '';
            }, 2000)
        }*/
      },
      /** function 获取请假结束时间
       *   wzx
       *   2018-12-26
       **/
      changeEndTime(val) {
        this.jssj = val;
        this.$utils.Store.setItem('jssj', val);
        this.endDate = val.substring(0, 10);
        /*if (this.kssj != '' && this.jssj < this.kssj) {
            this.$utils.Tools.toastShow("结束时间不能小于开始时间");
            setTimeout(() => {
                this.jssj = '';
            }, 2000)
        }*/
      },
      /** function 获取请假总时长
       *   wzx
       *   2018-12-26
       **/
      getLeaveLength(val) {
        if (val != '') {
          let reg = /(^[0-9]+$)|(^[0-9]+[\.]{1}[0-9]{0,1}$)/;
          if (reg.test(val)) {
            this.leaveLength = val;
            // this.$utils.Store.setItem('stayDays',val);
          } else {
            this.$utils.Tools.toastShow('必须为数字格式，且时长小数位最多1位');
          }
          /*setTimeout(() => {
              this.leaveLength = (val.match(/^\d*(\.?\d{0,1})/g)[0]) || 0
          }, 0)*/
        }
        // this.leaveLength = val;
        // this.leaveLength = (e.target.value.match(/^\d*(\.?\d{0,1})/g)[0]) || null
        // console.log(666,leaveLength,this.leaveLength)
        // this.$utils.Store.setItem('leaveLength', this.leaveLength);
      },
      oninput(val) {
        this.leaveLength = this.leaveLength.toFixed(2);
        console.log(888, this.leaveLength);
      },
      onBlur(val) {
        console.log('on blur', val);
        this.leaveLength = val;
        this.$utils.Store.setItem('leaveLength', val);
      },
      /** function 获取请假事由
       *   wzx
       *   2018-12-26
       **/
      getReason(val) {
        this.reason = val;
        this.$utils.Store.setItem('reason', val);
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
      },
      /** function 获取固定抄送人数组
       *   wzx
       *   2018-12-27
       **/
      selectCopyUser() {
        this.$api.Copyer.selectCopyUser({
          lx: 0,    //0:请假  1:出差  2:外出  3:加班  4:调班  5:补出勤 6:合同
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
      /** function 提交请假申请
       *   wzx
       *   2018-12-26
       * */
      submitClick() {
        let reg = /(^[0-9]+$)|(^[0-9]+[\.]{1}[0-9]{0,1}$)/;
        if (this.kssj > this.jssj) {
          this.$utils.Tools.toastShow('开始时间不能大于结束时间');
        } else if (this.leaveLength && !reg.test(this.leaveLength)) {
          this.$utils.Tools.toastShow('必须为数字格式，且时长小数位最多1位');
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
          // console.log(8888,this.approverChecked,myapprover,this.approverString,imgPath)
          this.$utils.Tools.loadShow();
          this.$api.Leave.insertLeave({
            approver: this.approverString,
            bh: this.bh,
            bz: this.reason,
            imgPath: imgPath,
            kssj: this.kssj,
            jssj: this.jssj,
            leaveLength: this.leaveLength === null ? 0 : this.leaveLength,
            processId: '',
            qjlx: 1,
            userSerial: this.$utils.Store.getItem('userSerial'),
            xh: '',
            copyUser: this.customerString,
          }).then(response => {
            this.$utils.Tools.loadHide();
            // console.log(2222,response)
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
      this.$utils.Store.removeItem('oldVal');
      this.getSysDate();
      this.getLeaveList();
      if (this.$params.approve === '1') {
        this.selectApprovalUser();
      } else {
        this.getSysApproveUser();
      }
      this.selectCopyUser();
    },
    mounted() {
      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/Application')  //输入要返回的上一级路由地址
      // }
    },
    destroyed() {
      this.$utils.Store.removeItem('oldVal');
    },
  };
</script>
<style type="text/scss" lang="scss">
  .leave-apply {
    width: 100%;
    height: 100%;
    background: #F4F5F9;

    .overfh {
      overflow: hidden;
    }

    .overfa {
      overflow: auto;
    }

    .apply-boxs {
      width: 100%;
      height: auto;

      .weui-cells {
        margin: 0;

        &:before, &:after {
          border: none;
        }

        .vux-x-textarea {
          padding: 0;
        }

        .weui-cell {
          height: auto;
          min-height: 0.5rem;
          padding: 0 0.2rem 0 0.3rem;
          position: relative;

          &:before {
            border-bottom: 1px solid #F4F5F9;
          }

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

          .vux-cell-bd {
            flex-basis: 0.6rem;
            font-size: 0.13rem;
            color: #A3A3A3;
            text-align: right;
            line-height: 0.4rem;
          }

          .vux-cell-primary {
            flex: 1;
            color: #333;
            overflow: hidden;
            font-size: 0.13rem;
            line-height: 0.3rem;

            .img-boxs {
              width: 100%;
              height: 0.4rem;
              float: left;
              padding: 0.05rem 0;

              img {
                width: auto;
                max-width: 0.7rem;
                height: auto;
                max-height: 100%;
                float: left;
                margin-right: 0.1rem;
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

          &.agree {
            .vux-cell-primary {
              color: #51DC97;
            }
          }

          &.refuse {
            .vux-cell-primary {
              color: #FF6600;
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
      position: absolute;
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
