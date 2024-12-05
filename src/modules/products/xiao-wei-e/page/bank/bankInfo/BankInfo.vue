<template>
  <div class="bind-bank-card-wrapper reset-form" v-if="isOverLoading">
    <!-- 需要复原 -->
    <div class="remind" v-if="gfOpenAccountStatus.code === '1002'">电子户 {{formItem.name}} 的本人信息</div>
    <div class="remind" v-if="gfOpenAccountStatus.code === '1004'">银行卡 {{formItem.name}} 的本人信息</div>
    <div class="remind" v-else>银行 {{formItem.name}} 的本人信息</div>
    <div class="from-container">
      <van-form validate-first ref="formDynamic">
        <van-field
          v-model="formItem.name"
          required
          disabled
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="ruleValidate.name"
        />
        <van-field
          v-model="formItem.idCard"
          name="idCard"
          label="身份证号"
          disabled
          required
          placeholder="请输入身份证号"
          :rules="ruleValidate.idCard"
        />
        <van-field
          v-model="formItem.debitCardNum"
          label="银行卡号"
          name="debitCardNum"
          disabled
          required
          placeholder="请输入银行卡号"
          :maxlength="debitCardNumMaxLegnth"
          :rules="ruleValidate.debitCardNum"
        >
          <!-- <van-icon disabled name="scan" slot="right-icon" @click="gotoQrcBankCard" /> -->
          <!-- <van-icon disabled name="scan" slot="right-icon" /> -->
        </van-field>
        <!-- 需要复原 -->
        <van-field
          v-model="formItem.stCard"
          v-if="gfOpenAccountStatus.code === '1002' || isFromBindCard"
          label="电子账户"
          disabled
          name="stCard"
          required
          placeholder="请输入电子账户"
          :rules="ruleValidate.stCard"
        ></van-field>
        <van-field
          v-model="formItem.phoneNum"
          name="phoneNum"
          required
          label="预留手机号"
          placeholder="请输入银行预留手机号"
          :rules="ruleValidate.phoneNum"
        />
      </van-form>
      <!-- 协议 -->
      <div class="protocol-link-wrapper" v-if="gfOpenAccountStatus.code === '1002' && !isFromBindCard">
        <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
        <p>
          <label class="agree-text" for="agree">请阅读并同意协议</label>
          <span @click="switchShowProtocol" class="protocol">《广发银行个人银行账户管理协议》</span>
        </p>
      </div>

      <div class="pdf-wrapper" v-if="isShowProtocol">
        <p-protocol-list
          @closeProtocol="switchShowProtocol"
          @getProtocolText="getProtocolText"
          :isShowDoc="true"
          :protocoldoc="protocolText"
          :protocolList="protocolList"
        ></p-protocol-list>
      </div>
      <div class="tootip" v-if="!isFromBindCard">
        <!-- 需要复原 -->
        <!-- 尊敬的客户：您已开通广发银行一类卡，此卡可作为您后续借款流程的放款卡和还款卡使用，请填写此银行卡预留的手机号！若您需要使用一张新的银行卡进行放款还款，请点击新开户按钮！ -->
        <div
          class="tootip-desc"
          v-if="gfOpenAccountStatus.code === '1004'"
        >尊敬的客户：您已开通广发银行一类卡，此卡可作为您后续借款流程的放款卡和还款卡使用，请填写此银行卡预留的手机号！若您需要使用一张新的银行卡进行放款还款，请点击新开户按钮！</div>
        <!-- 需要复原 -->
        <div class="tootip-desc" v-if="gfOpenAccountStatus.code === '1002'">尊敬的客户：您已在小萌开立过广发电子账户，请知悉！</div>
      </div>
      <van-button
        class="btn-foot-fixed foot-operate-btn next-btn"
        type="primary"
        @click="handleSubmit('formDynamic')"
      >确定</van-button>
      <!-- 需要复原 -->
      <van-button
        v-if="gfOpenAccountStatus.code === '1004'"
        class="btn-foot-fixed foot-operate-btn next-new-btn"
        type="primary"
        @click="cancel"
      >新开户</van-button>
    </div>

    <van-dialog
      v-model="showDialog"
      title="提示"
      show-cancel-button
      cancelButtonText="新开户"
      @confirm="confirm"
      @cancel="cancel"
    >
      <div class="dialog-container">
        <div class="desc">请确认是否使用一类卡？</div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile } from '@/utils/common/common';
import { bankCardOCR } from '@/request/interface/txQrc/readerPci';
import { SESSION_ID } from '@/utils/common/config';
import { BankCard } from '@/model/BankCard';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { validateIdCard, validatePhoneNo } from '../../../utils/common';
import { getGfSessionId } from '@/controller/common.js';
import { bankCardCheck } from '@/utils/common/common';
import {
  gfDealOpenAccount,
  gfEaccountBind,
  gfBankCardBind,
  gfEaccountOpenQuery,
  gfOpenAccountContract
} from '@/request/interface/gf/common.js';
import { getUnionKey } from '@/request/interface/common/index';

export default {
  /**
   * 银行卡信息的展示 (二类户的开通)
   * */
  name: 'BankCardInfo',
  components: {
    'p-protocol-list': ProtocolList
  },
  data() {
    return {
      // 表单信息
      formItem: {
        debitCardNum: '',
        phoneNum: '',
        name: '',
        referrer: '',
        productId: '',
        applyUnionKey: '',
        idCard: '',
        smsCode: '',
        // 电子二类户信息
        stCard: '',
        userId: ''
      },
      // 是否阅读协议
      isAgree: '',
      isShowProtocol: false,
      protocolText: '',
      protocolList: [
        { code: '03', name: '广发银行个人银行账户管理协议', isNess: true, isReadOver: false }
        // { code: "03", name: "个人经营贷款资金用途承诺函", isNess: true, isReadOver: false },
        // { code: "04", name: "信息授权书+借款合同（经营）+个人贷款电子借据", isReadOver: false }
      ],
      // 是否加载结束
      isOverLoading: false,
      // 图片信息
      bankCard: {},
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      // 银行图片是否已经扫过
      isPicLoadOver: true,
      showDialog: false,
      // 广发的开户信息
      gfOpenAccountStatus: {},

      // 是否来自于绑卡页
      isFromBindCard: false,

      // 校验规则
      ruleValidate: {
        name: [{ required: true, message: '请输入姓名', trigger: 'onBlur' }],
        debitCardNum: [
          { required: true, message: '请输入银行卡号', trigger: 'onBlur' },
          { validator: bankCardCheck, message: '请输入正确的银行卡号' }
        ],
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'onBlur' },
          { required: true, validator: validatePhoneNo, message: '请输入正确手机号！' }
        ],
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'onBlur' },
          { required: true, validator: validateIdCard, message: '请输入正确身份证号！' }
        ],
        stCard: [{ required: true, message: '请输入电子账户', trigger: 'onBlur' }]
      }
    };
  },

  created() {
    this.init();
  },

  methods: {
    /**
     * 初始化：
     *    1、授信的页面进入，不需要产品id
     *    2、有产品id，看是否需要绑卡，如果已经绑定，到查看结果页
     * */
    init() {
      if (sessionStorage.getItem(SESSION_ID.unionKey)) {
        this.formItem.applyUnionKey = sessionStorage.getItem(SESSION_ID.unionKey);
        getGfSessionId({ applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey), type: 4 })
          .then(() => {
            if (this.$route.query.bindCardInfo) {
              this.isFromBindCard = true;
              // 来自于绑卡页面
              let params = {
                bancardInfo: JSON.parse(this.$route.query.bindCardInfo)
              };
              this.formatePageLocalData(params);
            } else {
              this.getGfDealOpenAccount();
            }
          })
          .catch((err) => {
            this.$notify.error({ msg: err?.data?.msg || '会话失败' });
          });
      } else {
        this.getApplyUnionKey();
      }
    },

    //  表单提交
    handleSubmit(name) {
      this.isShowProtocol = false;
      // 电子户
      if (this.gfOpenAccountStatus.code === '1002') {
        // 二类户的开通

        if (!this.protocolList[0].isReadOver) {
          this.$notify.info({
            msg: '请阅读授信合同'
          });
          this.isShowProtocol = true;
          return false;
        }
        // 电子账户的开通
        this.$refs[name].validate(['name', 'idCard', 'debitCardNum', 'phoneNum']).then((valid) => {
          if (!valid) {
            this.$dialog
              .confirm({
                title: '提示',
                message: '请确认是否开通！'
              })
              .then(() => {
                this.gfEaccountOpen();
              });
          }
        });
      }
      // 一类卡
      if (this.gfOpenAccountStatus.code === '1004') {
        if (!this.protocolList[0].isReadOver) {
          this.$notify.info({
            msg: '请阅读授信合同'
          });
          this.isShowProtocol = true;
          return false;
        }
        // 广发一类卡信息
        this.$refs[name].validate(['name', 'idCard', 'debitCardNum', 'phoneNum']).then((valid) => {
          if (!valid) {
            // this.showDialog = true;
            this.$dialog
              .confirm({
                title: '提示',
                message: '请确认是否开通！'
              })
              .then(() => {
                this.confirm();
              });
          }
        });
      }

      // 绑卡的自动开通
      if (this.isFromBindCard && this.$route.query.bindCardInfo) {
        this.$dialog
          .confirm({
            title: '提示',
            message: '请确认是否开通！'
          })
          .then(() => {
            this.gfEaccountOpen();
          });
      }
    },

    // 查询广发银行的开户状态、
    getGfDealOpenAccount() {
      let params = { applyUnionKey: this.formItem.applyUnionKey };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      gfDealOpenAccount(params)
        .then((res) => {
          if (res?.data?.data) {
            this.gfOpenAccountStatus = res.data.data;
            this.formatePageLocalData(res.data.data);
          } else {
            this.$notify.info({ msg: '未获取到开户状态信息！' });
          }
        })
        .catch((err) => {
          this.$toasting.error({ msg: err?.data?.msg || '加载失败' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 格式化本地数据
    formatePageLocalData(data) {
      let user = this.$store.state.userInfo;

      if (data?.bancardInfo) {
        // 信息的回显
        this.formItem.stCard = data.bancardInfo.stCard;
        this.formItem.debitCardNum = data.bancardInfo.bankCard;
        this.formItem.phoneNum = data.bancardInfo.bankCardReservePhone;
        this.formItem.name = data.bancardInfo.userName;
      }

      this.formItem.userId = user.id;
      this.formItem.idCard = user.idNo;
      this.formItem.referrer = this.$store.state.referrer;
      this.formItem.productId = this.$store.state.productId;
      this.isOverLoading = true;

      if (data) {
        this.handlePathJump(data);
      }
    },
    // 切换协议是否展示
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },
    handlePathJump(obj) {
      if (obj) {
        // 跳到开户页
        if (obj.code === '1001') {
          // 开户的都是电子账户
          getGfSessionId({ applyUnionKey: this.formItem.applyUnionKey, type: 4 })
            .then(() => {
              this.$router.replace({
                path: '/xwe_open_account_face',
                query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
              });
            })
            .catch((err) => {
              this.$notify.error({ msg: err?.data?.msg || '会话失败' });
            });
        }

        // 存在电子卡信息，并不是第一次开户，直接跳到银行卡信息展示，确认是否使用
        if (obj.code === '1002') {
          this.setWechatTitle('电子户信息确认');
          // this.$router.replace({
          //   path: "/xwe_bank_info",
          //   query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
          // });
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
          this.setWechatTitle('广发一类卡信息确认');
          // this.$router.replace({
          //   path: "/xwe_bank_info",
          //   query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey }
          // });
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
            .catch((err) => {
              this.$notify.error({ msg: err?.data?.msg || '会话失败' });
            });
        }
      }
    },

    // 识别银行卡, 扫描图片
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
        })
        .catch((err) => {
          console.log(err);
          this.hideLoading();
          this.$notify.error({
            msg: '银行卡识别失败，请重新尝试！'
          });
        })
        .finally(() => {
          this.hideLoading();
          this.$toasting.hide();
        });
    },

    // 关掉loading
    hideLoading() {
      this.isPicLoadOver = true;
    },

    // 文件上传
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

    // 电子账户的开通 (广发二类户开通)
    gfEaccountOpen() {
      let params = {
        applyUnionKey: this.formItem.applyUnionKey,
        bankCardNo: this.formItem.debitCardNum,
        idNo: this.formItem.idCard,
        // 电子二类户
        stCard: this.formItem.stCard,
        productId: 1035,
        referrer: this.formItem.referrer,
        userId: this.formItem.userId
      };
      this.$toasting.show({ message: '申请中', forbidClick: true });
      // 存在电子账户，点击绑定二类户
      gfEaccountBind(params)
        .then((res) => {
          if (res?.data?.success) {
            setTimeout(() => {
              // 绑卡等待写入
              if (this.isFromBindCard && this.$route.query.bindCardInfo) {
                this.$router.replace({
                  path: 'xwe_bank_card_mana',
                  query: {
                    applyUnionKey: this.formItem.applyUnionKey,
                    productId: '1035'
                  }
                });
              } else {
                this.$router.replace({ path: '/xwe_open_card_result', query: { productId: this.formItem.productId } });
              }
            }, 1500);
          } else {
            this.$toasting.error({ msg: '失败' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '开通失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 提交绑卡申请 （广发一类户绑卡申请）
    confirm() {
      let params = {
        applyUnionKey: this.formItem.applyUnionKey,
        bankCardNo: this.formItem.debitCardNum,
        idNo: this.formItem.idCard,
        bankCardReservePhone: this.formItem.phoneNum,
        bankName: this.gfOpenAccountStatus.bancardInfo.bankName,
        stCard: this.formItem.stCard,
        productId: this.formItem.productId,
        referrer: this.formItem.referrer,
        userId: this.formItem.userId,
        name: this.formItem.name,
        bankNo: this.gfOpenAccountStatus.bancardInfo.bankCode
      };
      // console.log("ddd", params);
      this.$toasting.show({ message: '申请中', forbidClick: true });
      gfBankCardBind(params)
        .then((res) => {
          if (res?.data?.success) {
            setTimeout(() => {
              this.$router.replace({ path: '/xwe_open_card_result', query: { productId: this.formItem.productId } });
            }, 1500);
          } else {
            this.$toasting.error({ msg: '失败' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '绑定失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 新开户
     *
     * 查询电子账户的开户状态，（层级是二级的），
     *
     * */
    cancel() {
      gfEaccountOpenQuery({ applyUnionKey: this.formItem.applyUnionKey })
        .then((res) => {
          if (res?.data?.data) {
            // 本页面，需要进行初始化
            if (res.data.data.code === '1002') {
              this.init();
            }
            if (res.data.data.code === '1001') {
              this.$toasting.show({ message: '跳转中', forbidClick: true });
              getGfSessionId({ applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey), type: 4 })
                .then(() => {
                  setTimeout(() => {
                    this.$router.replace({
                      path: '/xwe_open_account_face',
                      query: {
                        userNewOpen: 'y',
                        bancardInfo: res.data.data.bancardInfo
                      }
                    });
                    // this.$router.replace({
                    //   path: "/xwe_open_account",
                    //   query: { productId: this.formItem.productId, applyUnionKey: this.formItem.applyUnionKey,  }
                    // });
                  }, 1500);
                })
                .catch((err) => {
                  this.$notify.error({ msg: err?.data?.msg || '会话失败！' });
                })
                .finally(() => {
                  this.$toasting.hide();
                });
            }
          } else {
            this.$notify.error({ msg: '账户信息获取失败！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '账户信息获取失败！' });
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
        .then((res) => {
          if (res?.data?.data) {
            this.formItem.applyUnionKey = res.data.data;
            sessionStorage.setItem(SESSION_ID.unionKey, this.formItem.applyUnionKey);
            sessionStorage.setItem('applyUnionKey_1035', this.formItem.applyUnionKey);
            // this.beforeGetResult();
            getGfSessionId({ applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey), type: 4 })
              .then(() => {
                // this.getGfDealOpenAccount();
                if (this.$route.query.bindCardInfo) {
                  this.isFromBindCard = true;
                  // 来自于绑卡页面
                  let params = {
                    bancardInfo: JSON.parse(this.$route.query.bindCardInfo)
                  };
                  this.formatePageLocalData(params);
                } else {
                  this.getGfDealOpenAccount();
                }
              })
              .catch((err) => {
                this.$notify.error({ msg: err?.data?.msg || '会话失败' });
              });
          } else {
            this.$notify.error({ msg: '未获取到用户申请信息！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '未获取到用户申请信息！' });
        });
    },

    // 获取开户的协议
    getProtocolText(protocol) {
      let index = protocol.index;
      this.protocolText = '';

      gfOpenAccountContract()
        .then((res) => {
          if (res) {
            this.protocolList[index].isReadOver = true;
            this.protocolText = res;
          } else {
            this.isShowProtocol = false;
            this.$notify.error({
              msg: '文件获取失败！'
            });
          }
        })
        .catch((err) => {
          this.isShowProtocol = false;
          this.$notify.error({
            msg: '文件获取失败！'
          });
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.errMsg {
  padding: 0 1.25rem;
  max-height: 120px;
  display: flex;
  overflow: auto;
}
.rebindbtn-wrapper {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  a {
    font-size: 30px;
    font-weight: 500;
  }
}
.next-btn {
  bottom: 120px;
}
.next-new-btn {
  bottom: 65px;
  background-color: #fff !important;
  ::v-deep span {
    color: #333 !important;
  }
}

.tootip {
  display: flex;
  justify-content: center;
  padding: 20px 40px 50px 40px;
  .circle {
    margin: 20px 30px 0 20px;
    width: 20px;
    height: 16px;
    background: #d8d8d8;
    border: 1px solid #979797;
    border-radius: 50%;
  }
  .tootip-desc {
    font-size: 26px;
    font-weight: 400;
    color: #a7a7a7;
    text-stroke: 1px #979797;
  }
}
.dialog-container {
  .desc {
    min-height: 50px;
    font-size: 26px;
    font-weight: 500;
    text-align: center;
    padding: 30px;
  }
}
::v-deep(.van-dialog) {
  .van-dialog__header {
    font-size: 30px;
    font-weight: 500;
    padding-top: 20px;
  }
  .van-dialog__footer {
    .van-dialog__cancel {
      .van-button__content {
        span {
          font-size: 28px;
          color: #333;
          font-weight: 500;
        }
      }
    }
    .van-dialog__confirm {
      .van-button__content {
        span {
          font-size: 28px;
          color: #3552d0;
          font-weight: 500;
        }
      }
    }
  }
}
.protocol-link-wrapper {
  margin-top: 12px;
  padding: 0.625rem 0 1.25rem 2rem;
  display: flex;
  align-items: center;
  .agree-text {
    color: #999999;
  }
  .protocol-select-btn {
    margin-right: 0.25rem;
  }
  .protocol {
    color: #1b6ffb;
  }
}
</style>
