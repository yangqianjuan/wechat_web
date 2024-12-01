import { getProductTaxConfig } from '@/request/interface/common/index.js';
import { modifyTaxRequestId } from '@/request/interface/impower/Tax.js';
import { updateCorpBaseInfo } from '@/request/interface/impower/UserInfo';
/**
 * 税局采集方式
 *      private Integer collectionType; 采集方式 1:自有 2:其他
 *      private Integer skipFlag; 是否跳过 0: 可跳过，也可以不跳过， 1: 不跳过，必须自动化采集
 *      private Integer normalFlag; 税局维护情况 0:在维护 1:正常
 *      invoiceCollectionType 采票方式 null 不采 1 自有 2 微风企
 *      taxCollectType 1_采税，2_采票，3_其他（待扩展）
 *          如果值是 '1' 只看collectionType  '2'：只看invoiceCollectionType
 *      判断顺序 先判断是否跳过----》在判断是否可以采集----》在判断采集的方式
 */
export const taxProductConfigHandler = async (option, instance, callBack) => {
  let returnResult = {
    invoiceCollectionType: undefined,
    taxCollectType: undefined,
    skipFlag: undefined,
    collectionType: undefined,
    normalFlag: undefined
  };
  try {
    callBack = callBack && typeof callBack === 'function' ? callBack : () => {};
    const taxConfig =
      (
        await getProductTaxConfig({
          corpId: option.taxId,
          productId: option.productId
        })
      )?.data?.data || null;
    taxConfig &&
      (returnResult = {
        invoiceCollectionType: taxConfig.invoiceCollectionType,
        taxCollectType: taxConfig.taxCollectType,
        skipFlag: taxConfig.skipFlag,
        collectionType: taxConfig.collectionType,
        normalFlag: taxConfig.normalFlag
      });
    callBack(returnResult);
    instance.isPageOverLoad = true;
  } catch (e) {
    instance.$notify.error({
      msg: e?.data?.msg || '未获取到产品的税局配置信息！'
    });
  }
};

/**
 * requestId的更新
 * */
export const updateRequestIdHandler = async (option, instance, callBack) => {
  try {
    callBack = callBack && typeof callBack === 'function' ? callBack : () => {};
    if (!option?.requestId) {
      instance.$notify.error({ msg: '未获取到request ID！', duration: 0 });
      return;
    }
    const updateResult = await modifyTaxRequestId({ nationalTaxAccount: option.taxId, requestId: option.requestId });
    updateResult?.data?.success && callBack(updateResult.data?.data);
  } catch (e) {
    instance.$notify.error({
      msg: e?.data?.msg || '信息保存失败！'
    });
  } finally {
    instance.$toasting.hide();
  }
};

/**
 * 企业税务信息的更新
 * */
export const updateCorpBaseInfoHandler = async (option, instance, callBack) => {
  try {
    callBack = callBack && typeof callBack === 'function' ? callBack : () => {};
    const updateResult = await updateCorpBaseInfo(option);
    updateResult?.data?.success && callBack(updateResult.data?.data);
  } catch (e) {
    instance.$notify.error({
      msg: e?.data?.msg || '信息保存失败！'
    });
  }
};

/**
 * 税局的登录
 * */
export const taxLoginHandler = async (loginFun, params, instance, callBack, errorCallBack) => {
  try {
    callBack = callBack && typeof callBack === 'function' ? callBack : () => {};
    errorCallBack = errorCallBack && typeof errorCallBack === 'function' ? errorCallBack : () => {};
    const loginResult = await loginFun(params);
    loginResult?.data?.success ? callBack(loginResult.data?.data) : errorCallBack(undefined);
  } catch (e) {
    instance.$notify.error({
      msg: e?.data?.msg || '信息保存失败！'
    });
    errorCallBack(e);
  } finally {
    instance.$toasting.hide();
  }
};
