<template>
  <div class="borrow-home" v-if="isOverLoading && !lockPage">
    <MYDApplyResult v-if="isMYDProduct" :creditInfo="userCreditSummary" :isQuotaPause="isQuotaPause"></MYDApplyResult>
    <div v-else>
      <div class="other-content" :style="!userCreditSummary.totalApproveCredit ? emptyBg : ''">
        <template v-if="!hasSelectCredit && userCreditSummary.totalApproveCredit">
          <div class="credit-list">
            <v-credit-limit-card
              v-for="creditInfo in userCreditSummary.creditInfoArr"
              :cardConfig="creditInfo"
              :key="creditInfo.applyUnionKey"
              @getNowCredit="singleCreditHandler"
            ></v-credit-limit-card>
          </div>
        </template>
        <template v-if="hasSelectCredit">
          <div class="logo-content">
            <img
              class="logo"
              :src="nowCreditInfo.productImage"
              :style="{
                minWidth: productId === 1000 || productId === 1035 ? 'unset' : '53px'
              }"
              alt
            />
            <p class="company-name">{{ nowCreditInfo.productName }}</p>
          </div>
          <div class="loans-content">
            <div class="loans-title">可借额度(元)</div>
            <div class="loans-limit">{{ nowCreditInfo.avaliableCredit }}</div>
            <div class="loans-total">总额度 {{ nowCreditInfo.approveCredit }} 元</div>
            <van-button class="loans-btn foot-operate-btn" @click="loanProcessor">立即借款</van-button>
          </div>
          <div class="user-list-content">
            <div class="bill-content">
              <v-list-item :applyUnionKey="applyUnionKey" :cardConfig="cardConfig[0]"></v-list-item>
            </div>
            <div class="bill-list">
              <v-list-item :applyUnionKey="applyUnionKey" :cardConfig="cardConfig[1]"></v-list-item>
              <div class="line"></div>
              <v-list-item :applyUnionKey="applyUnionKey" :cardConfig="cardConfig[2]"></v-list-item>
              <div class="line"></div>
              <v-list-item :applyUnionKey="applyUnionKey" :cardConfig="cardConfig[3]"></v-list-item>
              <div class="line"></div>
              <v-list-item :applyUnionKey="applyUnionKey" :cardConfig="cardConfig[4]"></v-list-item>
            </div>
          </div>
        </template>
        <template v-if="!userCreditSummary.totalApproveCredit">
          <div class="empty-content">
            <img class="empty-icon" :src="emptyIcon" alt />
            <p>{{ desc }}</p>
            <van-button @click="applyRecord" class="record-btn foot-operate-btn">申请记录</van-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import CreditLimitCard from '@/common/components/home/CreditLimitCard';
import { getUserBaseInfo } from '@/request/interface/impower/UserInfo';
import { getUserCreditInfo } from '@/controller/userController.js';
import ListItem from '@/common/components/home/ListItem';
import sanXianMixin from './mixin/sanXianMixin';
import xmMixin from './mixin/xmMixin';
import beijingMixin from './mixin/beijingMixin';

export default {
  name: 'Home',
  mixins: [xmMixin, sanXianMixin, beijingMixin],
  components: {
    'v-list-item': ListItem,
    'v-credit-limit-card': CreditLimitCard
  },
  data() {
    return {
      cardConfig: [],
      creditNo: '',
      logo: '',
      productName: '',
      userCreditSummary: {},
      nowCreditInfo: undefined,
      desc: '暂无额度',
      emptyIcon: require('@/assets/imgs/icon/ic_empty.png'),
      emptyBg: 'background: #ffffff',
      productId: '',
      isOverLoading: false,
      hasSelectCredit: false,
      emptyDesc: '暂无记录',
      applyUnionKey: '',
      borrowPath: '',
      linesFreezeText: '',
      isQuotaPause: false,
      isMYDProduct: false
    };
  },
  activated() {
    this.$route.query.isShowList && this.nowCreditInfo ? (this.hasSelectCredit = false) : this.init();
  },
  deactivated() {
    this.$notify.clear();
  },
  methods: {
    async init() {
      await getUserBaseInfo();
      this.getCredits();
    },
    /**
     * 授信的产品信息
     * */
    getCredits() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      getUserCreditInfo()
        .then(res => {
          res ? this.creditHandler(res) : this.$notify.error({ msg: '获取到用户授信结果异常！' });
        })
        .catch(err => {
          this.isOverLoading = true;
          this.$toasting.error({ msg: err?.msg || '加载失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 申请记录
     * */
    applyRecord() {
      this.$router.push({ path: '/apply_record' });
    },

    /**
     * 用授信信息的分类处理
     * */
    creditHandler(userCreditSummary) {
      this.pageMountController({}, [
        this.beijingPageMount.bind(this, userCreditSummary),
        this.mydHandler.bind(this, userCreditSummary)
      ]);

      userCreditSummary.creditInfoArr.length && this.creditHandlerOne(userCreditSummary);
    },

    // more product mount start step
    pageMountController(option, callBackList) {
      async function activeFunctionCall(arr) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] && (await arr[i]());
        }
      }

      if (!option) {
        return;
      }

      if (callBackList) activeFunctionCall(callBackList);
    },

    creditHandlerOne(userCreditSummary) {
      userCreditSummary.creditInfoArr.length === 1 &&
        !this.applyUnionKey &&
        this.singleCreditHandler(userCreditSummary.creditInfoArr[0]);
      this.applyUnionKey && this.singleCreditHandler(this.getCreditByUnionKey(userCreditSummary.creditInfoArr));
      this.$store.commit('setCreditInfo', userCreditSummary);
    },

    /**
     * 去借款
     * */
    async loanProcessor() {
      let credit = this.nowCreditInfo;
      // 小萌
      let isOnEffect = credit.isOnEffect;
      let isQuotaPause = credit.isQuotaPause;
      this.isQuotaPause = credit.isQuotaPause;
      // 银行
      let isBankOnEffect = credit.isBankOnEffect;
      let isBankQuotaPause = credit.isBankQuotaPause;
      let applyUnionKey = credit.applyUnionKey;
      let paramsJump = {
        path: this.borrowPath,
        productId: this.productId,
        applyUnionKey: applyUnionKey
      };

      /**
       * 放款准备信息的获取
       */
      const awaitBorrowingResult = await this.preBorrowApplyHandler(applyUnionKey, this.productId, paramsJump);
      if (!awaitBorrowingResult) {
        this.$toasting.hide();
        return;
      }

      this.LoanStepOne({
        credit,
        isOnEffect,
        isQuotaPause,
        isBankOnEffect,
        isBankQuotaPause,
        applyUnionKey,
        paramsJump
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.borrow-home {
  .other-content {
    padding: 0 120px;
    min-height: 100vh;
    background: rgba(244, 246, 249, 1);
    background-image: url('../../assets/imgs/bg_home.png');
    background-position: top;
    background-size: contain;
    background-repeat: no-repeat;
    padding: 23px 20px 0 20px;

    .logo-content {
      display: flex;
      align-items: center;
      height: 73px;

      .logo {
        max-width: 80px;
        min-width: 53px;
        height: 53px;
      }

      .company-name {
        margin-left: 17px;
        font-size: 36px;

        font-weight: 600;
        color: rgba(255, 255, 255, 1);
      }
    }

    .loans-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #ffffff;
      margin-top: 20px;
      border-radius: 5px;
      padding: 45px 0 40px 0;

      .lines-freeze-text {
        color: red;
        margin: 4px 24px 0;
      }

      .loans-title {
        font-size: 28px;
        font-weight: 600;
        color: #999999;
      }

      .loans-limit {
        font-size: 80px;
        font-weight: 500;
        color: rgba(27, 111, 251, 1);
      }

      .loans-total {
        margin-top: 8px;
        font-size: 30px;
        font-weight: 600;
      }

      ::v-deep .loans-btn {
        width: 80%;
        margin-top: 35px;
        background-color: #2d8cf0 !important;
        border: 1px solid #2d8cf0 !important;
      }
    }

    .user-list-content {
      padding-bottom: 90px;

      .bill-content {
        border-radius: 5px;
        margin-top: 20px;
      }

      .bill-list {
        background: #ffffff;
        border-radius: 5px;
        margin-top: 20px;
        margin-bottom: 70px;

        .line {
          width: 90%;
          margin-left: 5%;
          height: 3px;
          background-color: #f3f3f3;
        }
      }
    }
  }

  .credit-list {
    background: #ffffff;
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    padding: 0 0.78125rem;
    background: rgba(244, 246, 249, 1);
    padding-bottom: 160px;
    overflow: auto;
  }

  .empty-content {
    position: absolute;
    top: -70px;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    p {
      font-size: 34px;
      margin-top: 18px;
      font-weight: 600;
    }

    .empty-icon {
      width: 350px;
      height: 350px;
    }
  }

  .record-btn {
    background-color: #2d8cf0 !important;
    border: 1px solid #2d8cf0 !important;
    margin-top: 42px;
    width: 33%;
    padding: 4px 0;
    height: unset;

    ::v-deep .van-button__content {
      padding: 12px 0;
    }
  }
}
</style>
