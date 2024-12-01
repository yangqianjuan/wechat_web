import { infoGet, infoRegister } from '@/utils/common/common';
import productConfig from '@/config/product/product';
import { getUnionKey } from '@/request/interface/common';
import { updateUnionKey } from '@/utils/common/global';

/**
 * 身份证的校验
 * */

// 验证身份证的数据是否正确
export const validateIdCard = (value, rule) => {
  let _IDRe18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  let _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;
  const regIdNum18 = new RegExp(_IDRe18);
  const regIdNum15 = new RegExp(_IDre15);
  if (regIdNum18.test(value) || regIdNum15.test(value)) {
    return true;
  } else {
    return false;
  }
};

/**
 * 验证手机号
 * */
export const validatePhoneNo = (value, rule) => {
  const regPhone = new RegExp(/^1\d{10}$/);
  if (regPhone.test(value)) {
    return true;
  } else {
    return false;
  }
};

export const infoRegHandler = (option, instance) => {
  let saveObj = {};
  let getInfo = infoGet(option?.productId || productConfig.productId['myd']);
  if (!getInfo?.referrer) {
    saveObj = {
      ...option,
      referrer: option?.referrer,
      productId: option?.productId || productConfig.productId['myd'],
      entryType: option?.entryType || '0002'
    };
    infoRegister(option?.productId || productConfig.productId['myd'], saveObj);
  }
  if (instance) {
    localStorage.productId = option?.productId || getInfo?.productId || productConfig.productId['myd'];
    localStorage.referrer = option?.referrer || getInfo?.referrer || '';
    instance.$store.commit('setProductId', localStorage.productId);
    instance.$store.commit('setReferrer', localStorage.referrer);
  }

  return getInfo || saveObj;
};

export const commonMydMixin = {
  data() {
    return {
      applyUnionKey: '',
      creditPreInfo: {}
    };
  },
  methods: {
    async getMydUnionKey() {
      try {
        let productId = this.getUrlParam('productId');
        let referrer = this.getUrlParam('referrer');
        if (productId.indexOf('isOverVerify') !== -1) {
          productId = '1038';
        }
        if (referrer.indexOf('isOverVerify') !== -1) {
          referrer = referrer.split('?')[0];
        }
        this.creditPreInfo = infoRegHandler({ referrer, productId }, this);
        if (this.creditPreInfo.referrer) {
          const unionKey = (
            await getUnionKey({
              referrer: this.creditPreInfo.referrer,
              productId: this.creditPreInfo.productId || '1038'
            })
          )?.data?.data;
          this.applyUnionKey = unionKey;
          updateUnionKey(unionKey);
          return true;
        } else {
          this.$notify.error({ msg: '未获取到销售的唯一标识！' });
          return false;
        }
      } catch (e) {
        this.$notify.error({ msg: e?.data?.msg || '未获取到申请标识！' });
        return false;
      }
    }
  }
};
