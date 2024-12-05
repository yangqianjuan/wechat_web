<template>
  <div class="bind-bank-card-wrapper reset-form">
    <div v-if="isOverLoading">
      <div class="remind">客户 {{formItem.name}} 的电子户信息</div>
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
            <template #input>
              <div class="bank-card-no">
                <span
                  class="desc"
                >{{ bankCardOperateNo.bankCardShow ? formatBankNo(formItem.debitCardNum) : desensitizationInfo(formItem.debitCardNum, 'bankCard')}}</span>
                <img
                  class="search-eye"
                  v-if="!bankCardOperateNo.bankCardShow"
                  :src="eyeClose"
                  @click="bankCardOperateNo.bankCardShow = !bankCardOperateNo.bankCardShow"
                />
                <img
                  class="search-eye"
                  v-if="bankCardOperateNo.bankCardShow"
                  :src="eyeOpen"
                  @click="bankCardOperateNo.bankCardShow = !bankCardOperateNo.bankCardShow"
                />
              </div>
            </template>
          </van-field>
          <van-field
            v-model="formItem.stCard"
            label="电子账户"
            disabled
            name="stCard"
            required
            placeholder="请输入电子账户"
            :rules="ruleValidate.stCard"
          >
            <template #input>
              <div class="bank-card-no">
                <span
                  class="desc"
                >{{ ecCardOperateNo.bankCardShow ? formatBankNo(formItem.stCard) : desensitizationInfo(formItem.stCard, 'bankCard')}}</span>
                <img class="search-eye" v-if="!ecCardOperateNo.bankCardShow" :src="eyeClose" @click="elecShowNo" />
                <img class="search-eye" v-if="ecCardOperateNo.bankCardShow" :src="eyeOpen" @click="elecShowNo" />
              </div>
            </template>
          </van-field>
          <van-field
            v-model="formItem.phoneNum"
            name="phoneNum"
            required
            disabled
            label="预留手机号"
            placeholder="请输入银行预留手机号"
            :rules="ruleValidate.phoneNum"
          />
        </van-form>

        <div class="tootip">
          <div class="tootip-desc">尊敬的客户：望您知悉，当前流程不支持修改绑定银行卡信息，若您需要更换电子户绑定的他行一类卡，请完成授信后再进行换绑卡操作！</div>
        </div>
        <van-button
          class="btn-foot-fixed foot-operate-btn next-btn"
          type="primary"
          @click="handleSubmit('formDynamic')"
        >确定</van-button>
        <!-- <van-button class="btn-foot-fixed foot-operate-btn next-new-btn" type="primary" @click="bindPfCrad">我有浦发—类卡</van-button> -->
      </div>
    </div>
    <van-dialog
      v-model="ecCardOperateNo.openIframe"
      title="账户信息"
      cancelButtonText="关闭"
      show-cancel-button
      :showConfirmButton="false"
    >
      <iframe :src="ecCardOperateNo.cardShowlink" width="100%" height="100%" frameborder="0"></iframe>
    </van-dialog>
    <van-empty v-if="loadStatus === 'reject'" image="error" description="获取开户信息异常！" />
  </div>
</template>
<script>
import { validateIdCard, validatePhoneNo, bankCardCheck } from '@/utils/common/common';
import { getUnionKey } from '@/request/interface/common';
import { autoPFBindOldEAccount, getPFHisOpenEAccount } from '@/request/interface/common';
import { infoGet } from '@/utils/common/common';
import { desensitizationInfo } from '@/utils/common/common.js';
import commonFilters from '@/utils/vue/filters/common.js';

export default {
  /**
   * pf(电子户的开通)
   * */
  name: 'PFBindBankCardEA',

  data() {
    return {
      formItem: {
        debitCardNum: '',
        phoneNum: '',
        name: '',
        referrer: '',
        productId: '1000',
        applyUnionKey: '',
        idCard: '',
        // 电子二类户信息
        stCard: '',
        userId: ''
      },
      loadStatus: 'resolve',
      // 是否加载结束
      isOverLoading: false,
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      // 开户信息
      openAccountStatus: {},
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
      },

      // bank (实体卡)
      bankCardOperateNo: {
        bankCardShow: false
      },
      // 电子户
      ecCardOperateNo: {
        bankCardShow: false,
        cardShowlink: '',
        openIframe: false
      },
      eyeOpen: require('@/assets/imgs/icon/ic_eye.svg'),
      eyeClose: require('@/assets/imgs/icon/ic-eye-close.svg')
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      let initInfo = infoGet('1000');
      this.formItem.referrer = initInfo.referrer ? initInfo.referrer : localStorage.referrer;
      if (this.formItem.referrer) {
        this.getApplyUnionKey();
      } else {
        this.loadStatus = 'reject';
        this.$notify.info({ msg: '未获到销售的标识！' });
      }
    },

    desensitizationInfo,
    formatBankNo: commonFilters.formatBankNo,
    elecShowNo() {
      if (this.openAccountStatus.successfulLink) {
        this.ecCardOperateNo.cardShowlink = this.openAccountStatus.successfulLink;
        this.ecCardOperateNo.openIframe = true;
      } else {
        this.ecCardOperateNo.bankCardShow = !this.ecCardOperateNo.bankCardShow;
      }
    },
    /**
     * pf电子户的开通
     */
    handleSubmit(name) {
      // 电子账户的开通
      this.$refs[name].validate(['name', 'idCard', 'debitCardNum', 'phoneNum']).then((valid) => {
        if (!valid) {
          this.$dialog
            .confirm({
              title: '提示',
              message: '请确认是否开通！'
            })
            .then(() => {
              this.pfEaccountOpen();
            });
        }
      });
    },

    /**
     * 绑定浦发一类卡
     * */
    bindPfCrad() {
      this.$router.replace({
        path: '/xm_bc',
        query: {
          productId: '1000',
          referrer: '',
          changeEABC: 'bindPf'
        }
      });
    },

    /**
     * 获取用户申请信息的标识
     *
     * */
    getApplyUnionKey() {
      let payload = {
        referrer: this.formItem.referrer,
        productId: this.formItem.productId
      };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      getUnionKey(payload)
        .then((res) => {
          if (res?.data?.data) {
            this.formItem.applyUnionKey = res.data.data;
            this.getPfDealOpenAccount();
          } else {
            this.$toasting.hide();
            this.$notify.info({ msg: '未获取用户申请标识！' });
            this.loadStatus = 'reject';
          }
        })
        .catch((err) => {
          this.$toasting.hide();
          this.$notify.error({ msg: err?.data?.msg || '获取用户申请标识失败！' });
          this.loadStatus = 'reject';
        });
    },

    // 电子户开通
    pfEaccountOpen() {
      let params = {
        applyUnionKey: this.formItem.applyUnionKey,
        bankCardNo: this.formItem.debitCardNum,
        infoKey: this.openAccountStatus.infoKey,
        stCardNo: this.formItem.stCard,
        productId: 1000,
        referrer: this.formItem.referrer,
        userId: this.formItem.userId
      };
      this.$toasting.show({ message: '申请中', forbidClick: true });
      autoPFBindOldEAccount(params)
        .then((res) => {
          if (res?.data?.success) {
            setTimeout(() => {
              this.$router.replace({ path: '/credut_result' });
            }, 1000);
          } else {
            this.$notify.info({ msg: '申请异常！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '申请失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 查询开户状态、
    getPfDealOpenAccount() {
      let params = {
        productId: '1000'
      };
      getPFHisOpenEAccount(params)
        .then((res) => {
          if (res?.data?.data) {
            this.statusHandler(res.data.data);
          } else {
            this.$notify.info({ msg: '未获取到开户状态信息！' });
            this.loadStatus = 'reject';
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '获取开户状态信息失败！' });
          this.loadStatus = 'reject';
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 格式化本地数据
    formatePageLocalData(data) {
      //   "eaccountInfo": {
      //   "applyUnionKey": 0,
      //   "bankCardNo": "string",
      //   "bankCardReservePhone": "string",
      //   "bankName": "string",
      //   "bankNo": "string",
      //   "idCardNo": "string",
      //   "infoKey": 0,
      //   "productId": 0,
      //   "referrer": 0,
      //   "stCardNo": "string",
      //   "userId": 0,
      //   "userName": "string"
      // },
      // console.log("ddaad", data);
      if (data) {
        this.openAccountStatus = data;
        this.formItem.stCard = data.stCardNo;
        this.formItem.debitCardNum = data.bankCardNo;
        this.formItem.phoneNum = data.bankCardReservePhone;
        this.formItem.name = data.userName;
        this.formItem.userId = data.userId;
        this.formItem.idCard = data.idCardNo;
        // this.formItem.referrer = data.referrer;
        // this.formItem.productId = data.productId || 1000;
        // if (data.applyUnionKey) this.formItem.applyUnionKey = data.applyUnionKey;
        this.isOverLoading = true;
      } else {
        this.loadStatus = 'reject';
      }
    },

    /**
     * 处理用户的开户状态
     * */
    statusHandler(data) {
      if (data) {
        let type = typeof data.opening;
        if (type === 'boolean') {
          if (data.opening) {
            // 电子户
            this.formatePageLocalData(data.eaccountInfo);
          } else {
            // 实体卡
            this.$router.replace({ path: '/xm_bc' });
          }
        }
        if (type === 'string') {
          if (data.opening === 'true') {
            // 电子户
            this.formatePageLocalData(data.eaccountInfo);
          } else if (data.opening === 'false') {
            // 实体卡
            this.$router.replace({ path: '/xm_bc' });
          }
        }
        if (type === 'undefined') {
          this.$notify.info({ msg: '未获取到开户状态信息！' });
          this.loadStatus = 'reject';
        }
      } else {
        this.$notify.info({ msg: '未获取到开户状态信息！' });
        this.loadStatus = 'reject';
      }
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
  padding: 50px 40px;
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
    text-indent: 2em;
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
.bank-card-no {
  display: flex;
  align-items: center;
  width: 100%;
  .desc {
    width: 85%;
    padding: 0 8px;
  }
  .search-eye {
    margin-left: 18px;
    margin-right: 8px;
    width: 40px;
    height: 32px;
  }
}
::v-deep(.van-dialog__content) {
  height: 50vh !important;
}
</style>
