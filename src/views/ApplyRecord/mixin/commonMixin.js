import { getPersonApplyList } from '@/request/interface/impower/Bill.js';
import { qqtApplyRecord } from '@/request/interface/common/index';
import empty from '@/common/components/common/Empty.vue';
import { APPROVE_CODE } from '@/utils/common/config';

export default {
  components: {
    'v-empty': empty
  },
  data() {
    return {
      emptyDesc: '暂无记录',
      recordIsEmpty: false,
      companyLogo: require('@/assets/imgs/icon/ic_logo.png'),
      icArrow: require('@/assets/imgs/icon/ic_arrow_wh.png'),
      isOverLoading: false,
      applyList: [],
      approveCode: APPROVE_CODE,
      nextPath: {
        1000: '/prod_xmkd',
        1023: '/prod_sass',
        1035: '/prod_xwe',
        1155: '/prod_bjb'
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      getPersonApplyList()
        .then(res => {
          res?.data?.data && (this.applyList = res.data.data);
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '获取申请记录失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
          this.isOverLoading = true;
        });
    },

    goBackHome() {
      this.$router.replace({ path: '/' });
    },

    gotoDetail(index) {
      let apply = this.applyList[index];
      String(apply.productId) === '1038' ? this.gotoDetailSanXian(apply) : this.gotoDetailCommon(apply);
    },

    gotoDetailCommon(apply) {
      if (!apply?.productId) {
        return;
      }
      if (String(apply.productId) === '1051') {
        this.gotoQQTDetailCommon(apply);
        return;
      }
      let params = {
        productName: apply.productName,
        productImage: apply.productImage,
        applyStatus: apply.applyStatus,
        productId: apply.productId
      };
      if (apply?.applyStatus === 'APPLYING') {
        this.$router.replace({
          path: `${this.nextPath[apply.productId]}?uid=${apply.saleManId}&prid=${apply.productId}`
        });
      } else {
        const path = String(apply.productId) === '1035' ? '/xwe_pre_credut_result' : '/pre_credut_resutl';
        this.$router.push({
          path,
          query: { applyInfo: JSON.stringify(params) }
        });
      }
    },

    /**
     * 企企通授信结果的查询
     * */
    gotoQQTDetailCommon(apply) {
      if (!apply.applyId) {
        this.$notify.info({ msg: '未查询到申请的唯一标识！' });
        return;
      }
      this.$toasting.show({ message: '查询中', forbidClick: true });
      qqtApplyRecord({
        applyId: apply.applyId
      })
        .then(res => {
          if (res?.data?.success && res?.data?.data) {
            setTimeout(() => {
              window.location.href = res.data.data;
            }, 10);
          } else {
            this.$notify.error({ msg: '查询失败！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '查询失败！' });
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },

    /**
     * 授信申请
     * */
    gotoApply() {
      const saleManId = process.env.NODE_ENV === 'production' ? 103 : 170;
      this.$router.replace({ path: `${this.nextPath[1000]}?uid=${saleManId}&prid=1000` });
    },
    dateFormate(date) {
      if (date) {
        const year = date.substring(0, 4);
        const month = date.substring(4, 6);
        const day = date.substring(6, 8);
        return `${year}-${month}-${day}`;
      }
      return '';
    },
    dateFormate1(date) {
      if (date) {
        return date.substring(0, 10);
      }
      return '';
    },
    interestRateHandler(value) {
      return value ? parseFloat(value * 100).toFixed(2) : '';
    }
  }
};
