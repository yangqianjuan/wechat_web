import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export async function getUnionKey(payload) {
  const api = ApiConfig.getUnionKey;
  return Http.send(api, 'get', payload);
}

export async function getCodeUrl(payload) {
  const api = ApiConfig.getCodeUrl;
  return Http.send(api, 'get', payload);
}

export async function queryChildArea(payload) {
  const api = ApiConfig.queryChildArea;
  return Http.send(api, 'get', payload);
}

/**
 * 获取产品税局配置 (浦发和广发)
 * params 暂无
 *
 * */

export const getProductTaxConfig = payload => {
  const api = ApiConfig.getProductTaxConfig;
  return Http.send(api, 'get', payload);
};

/**
 * 更新注册的产品机构账号
 * params 暂无
 *
 * */

export const modifyInstProduct = payload => {
  const api = ApiConfig.modifyInstProduct;
  return Http.send(api, 'get', payload);
};

/**
 * 浦发开户逻辑的修改
 * */
// 判断小萌快贷用户是否开通过电子账户
export const getPFHisOpenEAccount = payload => {
  const api = ApiConfig.getPFHisOpenEAccount;
  return Http.send(api, 'get', payload);
};

// pf自动签约银行卡
export const autoPFBindOldEAccount = payload => {
  const api = ApiConfig.autoPFBindOldEAccount;
  return Http.send(api, 'post', payload);
};

// pf提款之前的校验
export const borrowVerifyApplyPF = payload => {
  const api = ApiConfig.borrowVerifyApply;
  return Http.send(api, 'post', payload);
};

// 北京额度查询
export const beijingQuotaQuery = payload => {
  const api = ApiConfig.beijingQuotaQuery;
  return Http.send(api, 'get', payload);
};

// pf提款之前的校验的结果
export const getBorrowVerifyResultPF = payload => {
  const api = ApiConfig.getBorrowVerifyResult;
  return Http.send(api, 'get', payload);
};

// 三湘页面跳转准备信息
export const getSXPrepareMess = payload => {
  const api = ApiConfig.sxPrepareMess;
  return Http.send(api, 'get', payload);
};

// 三湘页面跳转准备信息
export const sxCheckAuditConfirm = payload => {
  const api = ApiConfig.sxCheckAuditConfirm;
  return Http.send(api, 'get', payload);
};

// 浦发 add/修改 联系人信息
export const insertOrModifyUserInfo = payload => {
  const api = ApiConfig.insertOrModifyUserInfo;
  return Http.send(api, 'post', payload);
};
// 企企通记录跳转的接口
export const qqtApplyRecord = payload => {
  const api = ApiConfig.qqtApplyRecord;
  return Http.send(api, 'get', payload);
};

// 获取租户的配置
export const getInstNoConfig = payload => {
  const api = ApiConfig.getInstNoConfig;
  return Http.send(api, 'get', payload);
};

//  独立产品信息列表
export const openpGetProductInfos = payload => {
  const api = ApiConfig.openpGetProductInfos;
  return Http.send(api, 'get', payload);
};

//  获取当前位置信息
export const getCurrentLocation = payload => {
  const api = ApiConfig.getCurrentLocation;
  return Http.send(api, 'get', payload);
};

//北京银行
//产品进件状态查询
export const userProductApplyInfo = payload => {
  const api = ApiConfig.userProductApplyInfo;
  return Http.send(api, 'get', payload);
};

// 推广海报
export const getPoster = payload => {
  const api = ApiConfig.getPoster + payload.productId;
  return Http.send(api, 'post', payload);
};

// 开放平台中的申请单号登录信息获取
export const getOpenUnionKeyInfoHandler = payload => {
  const api = ApiConfig.getOpenUnionKeyInfo;
  return Http.send(api, 'get', payload, false);
};
