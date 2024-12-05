<template>
  <div class="bind-bank-card-wrapper reset-form" v-if="isOverLoading">
    <div class="remind">银行卡信息</div>
    <div class="from-container">
      <van-form validate-first ref="formDynamic">
        <van-field
          v-model="formItem.debitCardNum"
          label="银行卡号"
          required
          :disabled="disableNoGFBankInfo"
          name="debitCardNum"
          placeholder="请输入银行卡号"
          :maxlength="debitCardNumMaxLegnth"
          :rules="ruleValidate.debitCardNum"
        >
          <van-icon name="scan" v-if="!disableNoGFBankInfo" slot="right-icon" @click="gotoQrcBankCard" />
        </van-field>
        <van-field
          v-model="formItem.bankName"
          class="error-msg"
          :label="disableNoGFBankInfo ? '银行名称' : ''"
          required
          :disabled="disableNoGFBankInfo"
          name="bankName"
          :rules="ruleValidate.bankName"
        >
          <div v-if="!disableNoGFBankInfo" slot="input" style="width:100%" class="bank-name">
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
          :disabled="disableNoGFBankInfo"
          placeholder="请输入预留手机号"
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
      <div class="tootip">
        <div class="circle"></div>
        <div class="tootip-desc" v-if="initBankInfo">
          尊敬的客户：您当前的银行卡信息，可以直接用于后续的放款和还款，若您需要使用一张新的银行卡进行开户绑卡，请点击
          <a @click="resetChangeBank">更换银行卡</a>
        </div>

        <div class="tootip-desc" v-else>
          尊敬的客户：望您知悉，此次更换的银行卡，将作为您后续借款流程的放款卡和还款卡使用，填写时请确认银行卡号与预留手机号匹配一致，再提交！
        </div>
      </div>
      <van-button class="btn-foot-fixed foot-operate-btn" type="primary" @click="handleSubmit('formDynamic')"
        >确定</van-button
      >
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
import SendSms from '../../../../component/sms/SendSms.vue';
import { BANKLIST_COMMON } from '@/utils/common/bank';
import { validatePhoneNo, validateIdCard } from '../../../../utils/common';
import { bankCardCheck } from '@/utils/common/common';
import { gfSendMess, gfEaccountApply, gfDealOpenAccount } from '@/request/interface/gf/common.js';
import { getGfSessionId } from '@/controller/common.js';
import { getUnionKey } from '@/request/interface/common/index';
export default {
  /**
   *  立即借款 ---- 》开户绑卡页面
   *
   */
  data() {
    return {
      formItem: {
        // 银行卡号
        debitCardNum: '',
        // 银行名
        bankName: '',
        // 手机号
        phoneNum: '',
        // 用户名
        name: '',
        // 销售id
        referrer: '',
        // 产品id
        productId: '',
        // 一次授信的记录
        applyUnionKey: '',
        //
        acctSerialNo: '',
        // 银行编号
        bankCardCode: '',

        // 流水号
        smsSerialNo: ''
      },
      isOverLoading: false,
      // 银行卡扫描信息
      bankCard: {},
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      isPicLoadOver: true,

      bankNameShow: false,
      // 银行名验证
      bankNameList: BANKLIST_COMMON,

      // 控制更换银行卡的显示
      initBankInfo: true,

      // 广发的开户信息
      gfOpenAccountStatus: {},

      // 禁用银行卡信息修改（除广发）
      disableNoGFBankInfo: false,
      // 表单验证
      ruleValidate: {
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'onBlur' },
          { required: true, validator: validateIdCard, message: '请输入正确身份证号！' }
        ],
        debitCardNum: [
          { required: true, message: '请填写银行卡号', trigger: 'onBlur' },
          { validator: bankCardCheck, message: '请输入正确的银行卡号' }
        ],
        bankName: [{ required: true, message: '请选择银行名', trigger: 'onBlur' }],
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'onBlur' },
          { validator: validatePhoneNo, message: '请输入正确手机号' }
        ],
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'onBlur' }]
      }
    };
  },

  components: {
    SendSms
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      if (sessionStorage.getItem(SESSION_ID.unionKey)) {
        getGfSessionId({ applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey), type: 4 })
          .then(() => {
            if (this.$route.query.userNewOpen !== 'y') {
              // 用户从1001进来的，需调用一级的开户状态
              this.getGfDealOpenAccount();
            } else {
              // 用户从1004状态到新开户，因为二级的开户状态查询，已经调用过，无需一级的再次调用
              let params = { bancardInfo: this.$route.query.bancardInfo };
              this.formatePageLocalData(params);
            }
          })
          .catch(err => {
            this.$notify.error({ msg: err?.data?.msg || '会话失败' });
          });
      } else {
        this.getApplyUnionKey();
      }
    },

    // 查询广发银行的开户状态、
    getGfDealOpenAccount() {
      let params = { applyUnionKey: sessionStorage.getItem('union_key') };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      gfDealOpenAccount(params)
        .then(res => {
          if (res.data && res.data.data) {
            this.gfOpenAccountStatus = res.data.data;
            this.formatePageLocalData(res.data.data);
          } else {
            this.$notify.info({ msg: '未获取到开户状态信息！' });
          }
        })
        .catch(err => {
          this.$toasting.error({ msg: err?.data?.msg || '加载失败' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 格式化填充页面的数据
    formatePageLocalData(data) {
      let user = this.$store.state.userInfo;
      if (data?.bancardInfo) {
        // 回显信息
        // this.formItem.stCard = data.bancardInfo.stCard;
        this.formItem.debitCardNum = data.bancardInfo.bankCard;
        this.formItem.phoneNum = data.bancardInfo.bankCardReservePhone;
        this.formItem.name = data.bancardInfo.userName;
        this.formItem.bankName = data.bancardInfo.bankName;
        /**
         * 概述
         *  1、在查询开户状态的时候，bancardInfo是有值的
         *    （1）、本行卡，不可再次绑卡，需要重置，（也就是更换银行卡的模块）
         *    （2）、他行卡，信息返显，禁止修改，但是可以更改，银行卡
         * 2、在查询开户状态的时候，bancardInfo是没有值的
         *   （1）直接到更改银行卡的模块部分
         *
         * */
        if (data.bancardInfo.bankCode === '306581000003') {
          // 广发的本行卡，需要重置，用户的回显的信息，不允许再次绑定该行卡
          this.resetChangeBank();
        } else {
          // 非广发的本行卡，禁止修改
          this.disableNoGFBankInfo = true;
        }
      } else {
        this.setWechatTitle('更换银行卡');
        this.initBankInfo = false;
      }
      // console.log("用户的信息", user);
      // 用户名
      // this.formItem.name = user.name;
      this.formItem.applyUnionKey = sessionStorage.getItem('union_key');
      // 用户id
      this.formItem.userId = user.id;
      // 用户的身份id
      this.formItem.idNo = user.idNo;
      // 销售id
      this.formItem.referrer = this.$store.state.referrer;
      // 产品id
      this.formItem.productId = this.$store.state.productId;
      this.isOverLoading = true;
      if (data) {
        this.handlePathJump(data);
      }
    },

    // 提交
    handleSubmit(name) {
      this.$refs[name].validate(['debitCardNum', 'bankName', 'phoneNum', 'smsCode']).then(vaild => {
        if (!vaild) {
          this.formItem.bankNo = this.getBankNumByName(this.formItem.bankName);
          if (this.formItem.bankNo !== '306581000003') {
            this.$dialog
              .confirm({
                title: '提示',
                message: '请确认是否进行开户！'
              })
              .then(() => {
                this.openBindCard();
              });
          } else {
            this.$toasting.info({ msg: '目前不支持使用广发一类卡进行开户，请更换银行卡！' });
          }
        }
      });
    },

    // 开户绑卡
    openBindCard() {
      if (sessionStorage.getItem(SESSION_ID.openSessionId)) {
        if (this.formItem.smsSerialNo) {
          let params = {
            applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
            bindingCardNo: this.formItem.debitCardNum,
            oBankCode: this.formItem.bankNo,
            oBankName: this.formItem.bankName,
            productId: this.formItem.productId || localStorage.productId,
            referrer: this.formItem.referrer || localStorage.referrer,
            phone: this.formItem.phoneNum,
            smsCode: this.formItem.smsCode,
            sessionId: sessionStorage.getItem(SESSION_ID.openSessionId),
            userId: this.formItem.userId,
            smsSerialNo: this.formItem.smsSerialNo
          };
          this.$toasting.show({ message: '申请中', forbidClick: true });
          gfEaccountApply(params)
            .then(res => {
              if (res?.data?.success) {
                this.$toasting.success({ msg: '成功' });
                setTimeout(() => {
                  this.$router.replace({
                    path: '/xwe_open_card_result',
                    query: { productId: this.formItem.productId }
                  });
                }, 1500);
              } else {
                this.$toasting.error({ msg: '失败' });
              }
            })
            .catch(err => {
              this.$notify.error({ msg: err?.data?.msg || '申请失败！' });
            })
            .finally(() => {
              this.$toasting.hide();
            });
        } else {
          this.$notify.info({ msg: '验证码失效，请一分钟之后，再次发送！' });
        }
      } else {
        this.$notify.error({ msg: '暂无会话标识，请刷新页面，再次发起请求！' });
      }
    },

    onBankNameSelect(item) {
      if (item) {
        this.formItem.bankName = item.name;
      }
      // console.log("item", item);
    },

    // 更换银行卡
    resetChangeBank() {
      // 修改文档的title
      this.setWechatTitle('更换银行卡');
      this.initBankInfo = false;
      this.formItem.debitCardNum = '';
      this.formItem.phoneNum = '';
      this.formItem.bankName = '';
      this.disableNoGFBankInfo = false;
    },

    handlePathJump(obj) {
      if (obj) {
        // 跳到开户页
        if (obj.code === '1001') {
          // // 开户的都是电子账户
          // getGfSessionId({ applyUnionKey: this.formItem.applyUnionKey, type: 4 })
          //   .then(() => {
          //     this.$router.replace({
          //       path: "/xwe_open_account_face",
          //       query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
          //     });
          //   })
          //   .catch(err => {
          //     this.$notify.error({ msg: err.data.msg ? err.data.msg : "会话失败" });
          //   });
        }

        // 存在电子卡信息，并不是第一次开户，直接跳到银行卡信息展示，确认是否使用
        if (obj.code === '1002') {
          this.$router.replace({
            path: '/xwe_bank_info',
            query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
          });
        }

        // 已开户，跳过开户
        if (obj.code === '1003') {
          this.$router.replace({
            path: '/xwe_loans_base_info',
            query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
          });
        }

        // 有本行的银行卡，但是没有在本系统开过户，需要绑卡
        if (obj.code === '1004') {
          this.$router.replace({
            path: '/xwe_bank_info',
            query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
          });
        }

        // 正在开户中
        if (obj.code === '1005') {
          this.$router.replace({
            path: '/xwe_open_card_result',
            query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
          });
        }

        // 开户失败
        if (obj.code === '1006') {
          // 开户的都是电子账户
          getGfSessionId({ applyUnionKey: this.formItem.applyUnionKey, type: 4 })
            .then(() => {
              this.$router.replace({
                path: '/xwe_open_account_face',
                query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
              });
            })
            .catch(err => {
              this.$notify.error({ msg: err?.data?.msg || '会话失败' });
            });
        }
      }
    },

    // 通过选中图片的形式，快速填入用户信息
    gotoQrcBankCard() {
      if (!this.isPicLoadOver) {
        return;
      }
      this.isPicLoadOver = false;
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let picFace = '';
      chooseWxImage(japiList)
        .then(res => {
          this.$toasting.show({ message: '识别中', forbidClick: true });
          picFace = dataURLtoFile(res, getFileName());
          return this.uploadUtil(picFace);
        })
        .then(res => {
          return bankCardOCR({ imageUrl: res, userId: this.formItem.userId });
        })
        .then(res => {
          let bankCard = new BankCard(res?.data?.data);
          this.bankCard = bankCard;
          this.formItem.debitCardNum = bankCard.cardNo;
          let bankCardCode = this.getBankNumByName(bankCard.bankName);
          if (bankCardCode) {
            this.formItem.bankName = bankCard.bankName;
          }
        })
        .catch(err => {
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
          res => {
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
      bankList.forEach(bank => {
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
      this.$refs.formDynamic.validate(['debitCardNum']).then(res => {
        if (!res) {
          this.$refs.formDynamic.validate(['phoneNum']).then(res => {
            if (!res) {
              if (sessionStorage.getItem(SESSION_ID.openSessionId) && sessionStorage.getItem(SESSION_ID.unionKey)) {
                let params = {
                  applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
                  mobile: this.formItem.phoneNum,
                  sessionId: sessionStorage.getItem(SESSION_ID.openSessionId)
                };
                this.$toasting.show({ message: '发送中', forbidClick: true });
                this.$refs['send-sms-bank'].smsSending();
                gfSendMess(params)
                  .then(res => {
                    if (res?.data?.data) {
                      this.formItem.smsSerialNo = res.data.data;
                      this.$refs['send-sms-bank'].sendSuccess();
                    } else {
                      this.$refs['send-sms-bank'].sendError();
                    }
                  })
                  .catch(err => {
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

    /**
     * 获取用户申请信息的标识
     *
     * */
    getApplyUnionKey() {
      let payload = {};
      payload.referrer = this.$store.state.referrer;
      payload.productId = this.$store.state.productId;
      getUnionKey(payload)
        .then(res => {
          if (res?.data?.data) {
            this.formItem.applyUnionKey = res.data.data;
            sessionStorage.setItem(SESSION_ID.unionKey, this.formItem.applyUnionKey);
            sessionStorage.setItem('applyUnionKey_1035', this.formItem.applyUnionKey);
            // this.beforeGetResult();
            getGfSessionId({ applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey), type: 4 })
              .then(() => {
                if (this.$route.query.userNewOpen !== 'y') {
                  this.getGfDealOpenAccount();
                } else {
                  this.formatePageLocalData();
                }
              })
              .catch(err => {
                this.$notify.error({ msg: err?.data?.msg || '会话失败' });
              });
          } else {
            this.$notify.error({ msg: '未获取到用户申请信息！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '未获取到用户申请信息！' });
        });
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
  ::v-deep(.van-cell) {
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
.tootip {
  display: flex;
  justify-content: center;
  padding: 50px 40px;
  // .circle {
  //   margin: 20px 30px 0 20px;
  //   width: 20px;
  //   height: 16px;
  //   background: #d8d8d8;
  //   border: 1px solid #979797;
  //   border-radius: 50%;
  // }
  .tootip-desc {
    font-size: 26px;
    font-weight: 400;
    color: #a7a7a7;
    text-stroke: 1px #979797;
  }
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
  ::v-deep(.ivu-form-item-error-tip) {
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
  ::v-deep(.van-field__error-message) {
    margin-left: 170px;
  }
}
</style>
