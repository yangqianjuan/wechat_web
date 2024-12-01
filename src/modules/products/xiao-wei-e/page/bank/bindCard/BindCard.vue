<template>
  <div class="bind-bank-card-wrapper reset-form">
    <!-- <div class="remind">请填写 {{formItem.name}} 的银行储蓄卡</div> -->
    <div class="remind">请填写 网一四四 的银行储蓄卡</div>
    <div class="from-container">
      <van-form validate-first ref="formDynamic">
        <van-field
          v-model="formItem.debitCardNum"
          label="银行卡号"
          required
          name="debitCardNum"
          placeholder="请输入银行卡号"
          :maxlength="debitCardNumMaxLegnth"
          :rules="ruleValidate.debitCardNum"
        >
          <van-icon name="scan" slot="right-icon" @click="gotoQrcBankCard" />
        </van-field>
        <van-field
          v-model="formItem.bankName"
          class="error-msg"
          required
          name="bankName"
          :rules="ruleValidate.bankName"
        >
          <div slot="input" style="width:100%" class="bank-name">
            <van-cell
              is-link
              class="self-cell"
              arrow-direction="down"
              title="银行名称"
              :value="formItem.bankName"
              @click="bankNameShow = true"
            />
            <van-action-sheet
              v-model="bankNameShow"
              class="self-popup"
              :actions="bankNameList"
              description="银行名称"
              @select="onBankNameSelect"
              cancel-text="取消"
              close-on-click-action
            />
          </div>
        </van-field>
        <van-field
          v-model="formItem.phoneNum"
          name="phoneNum"
          required
          label="预留手机号"
          placeholder="请输入银行预留手机号"
          :rules="ruleValidate.phoneNum"
        />
        <van-field
          v-model="formItem.smsCode"
          required
          name="smsCode"
          label="验证码"
          placeholder="请输入验证码"
          :rules="ruleValidate.smsCode"
        >
          <div slot="right-icon" class="sms-content">
            <SendSms ref="send-sms-bank" @sendSms="sendSmsBank"></SendSms>
          </div>
        </van-field>
      </van-form>
      <van-button class="btn-foot-fixed foot-operate-btn" color="#b80701" @click="handleSubmit('formDynamic')">确定</van-button>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile } from '@/utils/common/common';
import { bankCardOCR } from '@/request/interface/txQrc/readerPci';
import { SESSION_ID } from '@/utils/common/config';
import { BankCard } from '@/model/BankCard';
import SendSms from '../../../component/sms/SendSms.vue';
import { BANKLIST_COMMON } from '@/utils/common/bank';
import { queryUserInfo, jdugeIsCanBindBankCard } from '@/controller/userController.js';
import { validatePhoneNo } from '../../../utils/common';
import { PFCardNote } from '../components/config';
import { gfSendMess, gfOtherBankCardChange, getQueryWaitBankChangeRecord } from '@/request/interface/gf/common.js';
import { getGfSessionId } from '@/controller/common.js';
import { bankCardCheck } from '@/utils/common/common';
export default {
  /**
   * 换绑银行卡的页面
   *      银行卡管理页 ----> 换绑银行卡的页面
   * */
  data() {
    return {
      bankNameShow: false,
      formItem: {
        debitCardNum: '',
        bankName: '',
        phoneNum: '',
        bankNo: '',
        name: '',
        applyUnionKey: '',
        smsSerialNo: ''
      },
      protocol: { isNess: true, isRead: false },
      PFCardNote,
      isShowProtocol: false,
      timer: '',
      isNeedBack: false,
      isSmsSendSucc: false,
      bankCard: {},
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      isPicLoadOver: true,
      icScanUrl: require('@/assets/imgs/icon/ic_scan.png'),
      bankNameList: BANKLIST_COMMON,
      ruleValidate: {
        debitCardNum: [
          { required: true, message: '请填写银行卡号', trigger: 'onBlur' },
          { validator: bankCardCheck, message: '请输入正确的银行卡号' }
        ],
        bankName: [{ required: true, message: '请选择银行名', trigger: 'onBlur' }],
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'onBlur' },
          { validator: validatePhoneNo, message: '请输入正确手机号' }
        ],
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'onBlur' }],
        protocol: [{ required: true, message: '请阅读并同意协议', trigger: 'onBlur' }]
      },
      bankCardTitle: {
        userName: '姓名',
        bankCardReservePhone: '手机号',
        bankName: '开户行',
        bankCard: '银行卡号'
      }
    };
  },
  components: {
    SendSms
  },

  created() {
    // this.init();
  },
  methods: {
    init() {
      if (this.$route.query.applyUnionKey) {
        this.formItem.applyUnionKey = this.$route.query.applyUnionKey;
        this.formItem.name = this.$store.state.userInfo.name;
        getGfSessionId({ applyUnionKey: this.formItem.applyUnionKey, type: 5 });
      }
    },

    // 提交
    handleSubmit(name) {
      this.$refs[name].validate(['debitCardNum', 'bankName', 'phoneNum', 'smsCode']).then((vaild) => {
        if (!vaild) {
          // this.bindCard();
        }
      });
    },

    switchShowPdf() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    // 绑定银行卡
    bindCard() {
      //     "applyUnionKey": 0,
      // "bankCardNo": "string",
      // "bankCardReservePhone": "string",
      // "bankName": "string",
      // "bankNo": "string",
      // "productId": 0,
      // "sessionId": "string",
      // "smsSerialNo": "string",
      // "verifyCode": "string"
      let params = {
        applyUnionKey: this.formItem.applyUnionKey,
        bankCardNo: this.formItem.debitCardNum,
        bankCardReservePhone: this.formItem.phoneNum,
        bankName: this.formItem.bankName,
        bankNo: this.formItem.bankNo,
        productId: 1035,
        verifyCode: this.formItem.smsCode,
        smsSerialNo: this.formItem.smsSerialNo,
        sessionId: sessionStorage.getItem(SESSION_ID.changeCardSessionId)
      };
      if (params.verifyCode) {
        if (!params.bankNo) {
          params.bankNo = this.getBankNumByName(params.bankName);
        }
        this.$toasting.show({ message: '申请中', forbidClick: true });
        gfOtherBankCardChange(params)
          .then((res) => {
            res?.data?.data && this.bindCardStatusHandler(res.data.data);
          })
          .catch((err) => {
            this.$notify.error({ msg: err?.data?.msg || '绑定银行卡失败！' });
          })
          .finally(() => {
            this.$toasting.hide();
          });
      } else {
        this.$notify.info({ msg: '请输入验证码！' });
      }
    },

    // 银行名称的选择
    onBankNameSelect(item) {
      if (item) {
        this.formItem.bankName = item.name;
      }
    },

    // 获取银行卡信息
    gotoQrcBankCard() {
      if (!this.isPicLoadOver) {
        return;
      }
      this.isPicLoadOver = false;
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let picFace = '';
      chooseWxImage(japiList)
        .then((res) => {
          this.$toasting.show({ message: '识别中', forbidClick: true });
          picFace = dataURLtoFile(res, getFileName());
          return this.uploadUtil(picFace);
        })
        .then((res) => {
          return bankCardOCR({ imageUrl: res, userId: this.formItem.userId });
        })
        .then((res) => {
          let bankCard = new BankCard(res?.data?.data);
          this.bankCard = bankCard;
          this.formItem.debitCardNum = bankCard.cardNo;
          let bankCardCode = this.getBankNumByName(bankCard.bankName);
          this.formItem.bankNo = bankCardCode;
          if (bankCardCode) {
            this.formItem.bankName = bankCard.bankName;
          }
        })
        .catch((err) => {
          this.hideLoading();
          this.$notify.error({
            msg: '识别失败，请确认图片内容！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
          this.hideLoading();
        });
    },

    hideLoading() {
      this.isPicLoadOver = true;
    },

    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(
          that,
          new Date().getTime(),
          picFace,
          'image',
          (res) => {
            resolve(res.pic);
          },
          'bank_card'
        );
      });
    },

    /**
     * 通过银行的名字，获取银行的编号code
     *
     */
    getBankNumByName(bankName) {
      let bankList = this.bankNameList;
      let bankNum;
      bankList.forEach((bank) => {
        if (bank.name === bankName) {
          bankNum = bank.value;
        }
      });
      return bankNum;
    },

    // 发送验证码
    sendSmsBank() {
      /**
       * 验证码发送的前提是：
       *      1、银行卡号存在，且有效
       *      2、手机号存在且有效
       * */
      this.$refs.formDynamic.validate(['debitCardNum']).then((res) => {
        if (!res) {
          this.$refs.formDynamic.validate(['phoneNum']).then((res) => {
            if (!res) {
              if (
                sessionStorage.getItem(SESSION_ID.changeCardSessionId) &&
                sessionStorage.getItem(SESSION_ID.unionKey)
              ) {
                let params = {
                  applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
                  sessionId: sessionStorage.getItem(SESSION_ID.changeCardSessionId)
                };
                this.$toasting.show({ message: '发送中', forbidClick: true });
                this.$refs['send-sms-bank'].smsSending();
                gfSendMess(params)
                  .then((res) => {
                    if (res?.data?.data) {
                      this.formItem.smsSerialNo = res.data.data;
                      this.$refs['send-sms-bank'].sendSuccess();
                    } else {
                      this.$refs['send-sms-bank'].sendError();
                    }
                  })
                  .catch((err) => {
                    if (err.code !== 403) {
                      this.$refs['send-sms-bank'].sendError();
                    } else {
                      this.$refs['send-sms-bank'].reset();
                    }
                  });
              } else {
                this.$refs['send-sms-bank'].sendError();
              }
            }
          });
        }
      });
    },

    // 绑卡的（结果）状态的处理
    bindCardStatusHandler(data) {
      //       otherBankCardChange   ：   {
      //   "code": "string",
      //   "data": {
      //     "bancardInfo": {
      //       "bankCard": "string",
      //       "bankCardReservePhone": "string",
      //       "bankCode": "string",
      //       "bankName": "string",
      //       "eacountId": 0,
      //       "stCard": "string",
      //       "userName": "string"
      //     },
      //     "code": "string",
      //     "result": "string"
      //   },
      //   "msg": "string",
      //   "respid": "string",
      //   "success": true
      // }
      if (data.code === '1001') {
        // 本行换本行
        if (data.result === '1') {
          this.$notify.success({ msg: '添加银行卡成功！' });
          setTimeout(() => {
            this.$router.replace({
              path: 'xwe_bank_card_mana',
              query: {
                applyUnionKey: this.$route.query.applyUnionKey,
                productId: '1035'
              }
            });
          }, 1000);
        } else if (data.result === '0') {
          this.$notify.error({ msg: '添加银行卡失败，请检查自己信息，是否有误！' });
        }
      } else if (data.code === '1002') {
        // 去开户 ---
        this.$notify.info({ msg: '暂不支持，本行卡变他行卡的操作！' });
        // getGfSessionId({ applyUnionKey:this.$route.query.applyUnionKey, type: 4 })
        //     .then(() => {
        //       this.$router.replace({
        //         path: "/xwe_open_account_face",
        //         query:{
        //           fromType:'bindCard'
        //         }
        //       });
        //     })
        //     .catch(err => {
        //       this.$notify.error({ msg: err.data.msg ? err.data.msg : "会话失败" });
        //     });
        // 本行变他行 --- 去到开户页面
      } else if (data.code === '1003') {
        // 本行变他行 --- 电子户确认页面
        this.$notify.info({ msg: '暂不支持，本行卡变他行卡的操作！' });
      } else if (data.code === '1004') {
        // 他行变本行
        // --- 电子户信息展示页 --- 自动确认开通
        this.$router.replace({
          path: '/xwe_bank_info',
          query: {
            productId: '1035',
            applyUnionKey: this.$route.query.applyUnionKey,
            bindCardInfo: JSON.stringify(data.bancardInfo)
          }
        });
      } else if (data.code === '1005') {
        // 他行变他行
        if (data.result === '1') {
          this.$notify.success({ msg: '添加银行卡成功！' });
          setTimeout(() => {
            this.$router.replace({
              path: 'xwe_bank_card_mana',
              query: {
                applyUnionKey: this.$route.query.applyUnionKey,
                productId: '1035'
              }
            });
          }, 1000);
        } else if (data.result === '0') {
          this.$notify.error({ msg: '添加银行卡失败，请检查自己信息，是否有误！' });
        } else if (data.result === '2') {
          this.$toasting.show({ message: '获取结果中', forbidClick: true });
          getQueryWaitBankChangeRecord({ applyUnionKey: this.$route.query.applyUnionKey })
            .then((res) => {
              // console.log("dadada", res);
              if (!res.data.data) {
                this.$router.push({
                  path: 'xwe_bind_bank_card',
                  query: { applyUnionKey: this.applyUnionKey }
                });
              } else {
                this.$router.push({
                  path: 'xwe_bind_bank_card_result',
                  query: {
                    changeNo: res.data.data.id,
                    applyUnionKey: res.data.data.applyUnionKey
                  }
                });
              }
            })
            .catch((err) => {
              this.$notify.error({ msg: err?.data?.msg || '获取结果失败！' });
            })
            .finally((_) => {
              this.$toasting.hide();
            });
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.bind-bank-card-wrapper .from-container {
  padding-top: 20px;
}
.bind-bank-card-wrapper .sub-btn {
  width: 80%;
  margin-top: 10px;
  bottom: 50px;
  position: fixed;
  right: 10%;
}
.bank-name {
  /deep/.van-cell {
    padding: 0;
  }
  .van-cell::after {
    border: 0 !important;
  }
}
.bank-card-warpper {
  background: #f4f6f9;
  height: 100vh;
}
.info-item {
  padding: 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #f2f4f8;
  .title {
    font-weight: 500;
    font-size: 28px;
  }
  .desc {
    font-weight: 500;
    font-size: 26px;
  }
}
.black-col {
  color: #333333;
}
.bind-bank-card-wrapper .ivu-form-item {
  margin-bottom: 40px;
  /deep/.ivu-form-item-error-tip {
    padding-top: 0px;
  }
}
.ic-snan {
  height: 30px;
  width: 30px;
}
.errMsg {
  padding-left: 1.25rem;
}
.error-msg {
  /deep/.van-field__error-message {
    margin-left: 130px;
  }
}
</style>
