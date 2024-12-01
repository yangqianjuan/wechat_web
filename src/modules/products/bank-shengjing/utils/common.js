import _ from 'lodash';
import { Dialog } from 'vant';
import { getUnionKey } from '@/request/interface/common/index';

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
  const reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
  if (!reg_tel.test(value)) {
    return false;
  } else {
    return true;
  }
  // const regPhone = new RegExp(/^1\d{10}$/);
  // if (regPhone.test(value)) {
  //   return true;
  // } else {
  //   return false;
  // }
};

/**
 * sms -- code 校验
 * */
export const validateSmsCode = (value, rule) => {
  const reg = new RegExp(/^\d{4}$/);
  if (!reg.test(value)) {
    return false;
  } else {
    return true;
  }
};

/**
 * 按钮点击限制
 * */
export const clickControl = (callBack, option) => {
  let waitTime = 250;
  let otherOption = {
    maxWait: 1000
  };
  if (option && typeof option === 'object') {
    option.wait && (waitTime = option.wait);
    otherOption = { ...option, ...otherOption };
  }
  if (typeof callBack == 'function') {
    let func = _.debounce(
      function() {
        callBack();
      },
      waitTime,
      otherOption
    );
    func();
  }

  // let registerFunction = _.debounce(callBack, waitTime, otherOption);
  // return registerFunction;
};

/**
 * cache page info with
 * */
export async function pageKeyInfoSearch() {
  let result = {
    referrer: undefined,
    productId: '9999',
    applyUnionKey: '',
    phone: ''
  };

  // 1、cache search
  try {
    let singleCreditInfo = sessionStorage.getItem('single_credit_info') || {};

    try {
      if (singleCreditInfo && typeof JSON.parse(singleCreditInfo) === 'object') {
        let creditInfo = JSON.parse(singleCreditInfo);
        result = {
          ...creditInfo,
          referrer: creditInfo.referrer,
          productId: creditInfo.productId || '9999'
        };

        return result;
      }
    } catch (error) {
      console.log(error);
    }

    // 2、url search and interface get info
    let referrer = this.getUrlParam('referrer') || this.getUrlParam('uid');
    if (referrer) {
      // scene: 1、product detail； 2、other common credit page； 3、global、and so on;
      result = {
        referrer: referrer,
        productId: '9999',
        applyUnionKey: '',
        phone: ''
      };

      let unionKeyRes = await getUnionKey({ productId: result.productId, referrer: result.referrer });
      result.applyUnionKey = unionKeyRes.data.data;
      sessionStorage.setItem('union_key', result.applyUnionKey);

      sessionStorage.setItem('single_credit_info', JSON.stringify(result));

      return result;
    }

    return result;
  } catch (error) {
    return result;
  }
}

/**
 * 北京银行弹窗
 */
export const beijingDialog = obj => {
  let { title, message, describe, className, confirmButtonText, cancelButtonText, img, showConfirmButton } = obj;
  img = img || 'common-tip-info-bg.png';
  describe = describe ?? '';
  return new Promise((resolve, reject) => {
    if (cancelButtonText) {
      // 消息确认
      Dialog.confirm({
        title: title || '',
        overlayStyle: { zIndex: 20000001 },
        message: `<div class='face-content'><img class='topImg' alt='' src='${require('@/modules/products/bank-beiJing/static/image/' +
          img)}'></img><div class='desc'>${message}</div><div class='tip'>${describe}</div></div>`,
        className: className || 'beijingBank',
        confirmButtonText: confirmButtonText || '确认',
        cancelButtonText: cancelButtonText || '取消'
      })
        .then(() => {
          // on confirm
          resolve('ok');
        })
        .catch(() => {
          // on cancel
          reject('no');
        });
    } else {
      // 消息提示
      Dialog.alert({
        title: title || '',
        overlayStyle: { zIndex: 20000001 },
        message: `<div class='face-content'><img class='topImg' alt='' src='${require('@/modules/products/bank-beiJing/static/image/' +
          img)}'></img><div class='desc'>${message}</div><div class='tip'>${describe}</div></div>`,
        className: className || 'beijingBank',
        confirmButtonText: confirmButtonText || '确认',
        showConfirmButton: typeof showConfirmButton === 'boolean' ? showConfirmButton : true
      }).then(() => {
        // on confirm
        resolve('ok');
      });
    }
  });
};
