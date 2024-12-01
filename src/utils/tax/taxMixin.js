import { jdugeNewUserRoute } from '@/controller/userController';
import { getCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import WfTaxInfo from '@/common/components/taxInfo/wf/WfTaxInfo.vue';
export const commonMixin = {
  provide() {
    return {
      initBuildParams: this.buildParams
    };
  },
  data() {
    return {
      buildParams: {
        applyUnionKey: '',
        productId: '',
        corpId: '',
        nsrsbh: '',
        creditNo: '',
        companyName: ''
      },
      formItem: {
        companyName: '',
        acountNum: '',
        acountPwd: '',
        comfirmAcountPwd: '',
        id: ''
      },
      taxCollect: {
        normalFlag: undefined,
        collectionType: undefined,
        invoiceCollectionType: undefined,
        taxCollectType: undefined,
        skipFlag: undefined,
        pageType: undefined
      },
      userInfo: {},
      isLoading: false,
      isPageOverLoad: false
    };
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      this.setWechatTitle('企业税务电子信息授权');
      this.updateInfo();
      Promise.all([
        jdugeNewUserRoute().then(user => {
          this.userInfo = user;
        }),
        this.getUserCorpBaseInfo()
      ]);
    },

    async getUserCorpBaseInfo() {
      let unionKeyResult = true;
      this.getMydUnionKey && (unionKeyResult = await this.getMydUnionKey());
      if (!unionKeyResult) {
        return;
      }
      let params = {};
      this.applyUnionKey && (params.applyUnionKey = this.applyUnionKey);
      getCorpBaseInfo(params)
        .then(res => {
          if (res?.data?.data) {
            const result = res.data.data;
            this.buildParams.corpId = result.id;
            this.buildParams.nsrsbh = result.corpId;
            this.buildParams.creditNo = result.corpId;
            this.buildParams.companyName = result.corpName;
            this.formItem.companyName = result.corpName;
            this.formItem.acountNum = result.corpId;
            this.formItem.id = result.id;
            this.taxStatusControl();
          } else {
            this.$notify.error({
              msg: '企业信息获取失败！'
            });
          }
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '企业信息获取失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    taxStatusConfigHandler(config) {
      this.taxCollect.normalFlag = config.normalFlag;
      this.taxCollect.collectionType = config.collectionType;
      this.taxCollect.invoiceCollectionType = config.invoiceCollectionType;
      this.taxCollect.taxCollectType = config.taxCollectType;
      this.taxCollect.skipFlag = config.skipFlag;
      if (config.taxCollectType) {
        if (config.taxCollectType === '1') {
          // 采税
          this.taxCollect.pageType = config.collectionType;
        } else if (config.taxCollectType === '2') {
          // 采票
          this.taxCollect.pageType = config.invoiceCollectionType;
        }
      }
      if (config.skipFlag === 1) {
        this.$store.commit('setTaxInitSkipStatsu', false);
      }
      if (config.collectionType === 2) {
        sessionStorage.setItem('nsrsbh', this.formItem.acountNum);
      }
    }
  }
};

export const loginMixin = {
  components: {
    WfTaxInfo
  }
};
