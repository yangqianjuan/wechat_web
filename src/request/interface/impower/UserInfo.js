import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export const getUserBaseInfo = payload => {
  const api = ApiConfig.getPersonalInfo;
  return Http.send(api, 'get', payload);
};

export const logout = () => {
  const api = ApiConfig.logout;
  return Http.send(api, 'post');
};

export const getTokenByOpenid = payload => {
  const api = ApiConfig.getTokenByOpenid;
  return Http.send(api, 'post', payload);
};

export const weChatMpBind = payload => {
  const api = ApiConfig.weChatMpBind;
  return Http.send(api, 'post', payload);
};

export const updateUserBaseInfo = payload => {
  const api = ApiConfig.updateUserBaseInfo;
  return Http.send(api, 'put', payload, true);
};

export const threeMianVerify = payload => {
  const api = ApiConfig.threeMianVerify;
  return Http.send(api, 'post', payload, true);
};

export const salerThreeMianVerify = payload => {
  const api = ApiConfig.salerThreeMianVerify;
  return Http.send(api, 'get', payload);
};

export const salerThreeMianVerifyH5 = payload => {
  const api = ApiConfig.salerThreeMianVerifyH5;
  return Http.send(api, 'get', payload);
};

export const weChatChangeBind = payload => {
  const api = ApiConfig.weChatChangeBind;
  return Http.send(api, 'post', payload);
};

export const getUserBaseeinfoStatus = payload => {
  let isNeedUnionKey = payload ? false : true;
  const api = ApiConfig.getUserBaseeinfoStatus;
  return Http.send(api, 'get', payload, isNeedUnionKey);
};
export const getUserSaleBaseeinfoStatus = payload => {
  const api = ApiConfig.getUserBaseeinfoStatus;
  return Http.send(api, 'get', payload);
};
export const modifyPersonBaseInfo = payload => {
  const api = ApiConfig.modifyPersonBaseInfo;
  return Http.send(api, 'post', payload, true);
};

export const updateUserSaleBaseInfo = payload => {
  const api = ApiConfig.updateUserSaleBaseInfo;
  return Http.send(api, 'put', payload);
};

export const updateUserSaleBaseInfoNew = payload => {
  const api = ApiConfig.updateUserSaleBaseInfoNew;
  return Http.send(api, 'put', payload);
};

export const saveApplyPersonBaseInfo = payload => {
  const api = ApiConfig.saveApplyPersonBaseInfo;
  return Http.send(api, 'post', payload, true);
};

export const sendSmsCode = params => {
  const api = `${ApiConfig.sendSmsCode}`;
  let option = {};
  typeof params === 'object'
    ? (option = params)
    : (option = {
        mobileno: params
      });
  return Http.send(api, 'post', option);
};

export const beijingSendCode = params => {
  const api = `${ApiConfig.beijingSendSmsCode}`;
  return Http.send(api, 'post', params);
};

export const beijingChangePhone = params => {
  const api = `${ApiConfig.beijingChangePhone}`;
  return Http.send(api, 'get', params);
};

export const beijingLoansSendCode = params => {
  const api = `${ApiConfig.beijingLoansSendSmsCode}`;
  return Http.send(api, 'post', params);
};

export const beijingLoansVerifySmsCode = params => {
  const api = `${ApiConfig.beijingLoansVerifySmsCode}`;
  return Http.send(api, 'post', params);
};

export const addBeijingSingleBorrowInfo = params => {
  const api = `${ApiConfig.addBeijingSingleBorrowInfo}`;
  return Http.send(api, 'post', params);
};

export const getBeijingSingleBorrowInfoRecord = params => {
  const api = `${ApiConfig.getBeijingSingleBorrowInfoRecord}`;
  return Http.send(api, 'get', params);
};

export const getBeijingRepaymentPlanTrial = params => {
  const api = `${ApiConfig.getBeijingRepaymentPlanTrial}`;
  return Http.send(api, 'get', params);
};

export const sendSmsSlideCode = params => {
  const api = `${ApiConfig.sendSmsSlideCode}`;
  return Http.send(api, 'post', params);
};

export const verifySmsCode = payload => {
  const api = `${ApiConfig.verifySmsCode}`;
  return Http.send(api, 'post', { mobileno: payload.phoneNum, authcode: payload.smsCode });
};

//获取本次session的union key
export async function getUnionKey(payload) {
  const api = ApiConfig.getUnionKey;
  return Http.send(api, 'get', payload);
}

//用户授信
export const applyUserCredit = payload => {
  const api = ApiConfig.applyUserCredit;
  return Http.send(api, 'post', payload, true);
};
// 用户授信结果查询 所有
export const getUserCreditResult = payload => {
  const api = ApiConfig.getUserCreditResult;
  return Http.send(api, 'get', payload);
};
// 用户授信结果查询 单个
export const queryApplyInfoIndexStatus = payload => {
  const api = ApiConfig.queryApplyInfoIndexStatus;
  return Http.send(api, 'get', payload, true);
};
// 北京用信结果查询
export const queryBeijingLoansInfoIndexStatus = payload => {
  const api = ApiConfig.queryBeijingLoansInfoIndexStatus;
  return Http.send(api, 'get', payload);
};
export const getPreCredutResult = () => {
  const api = ApiConfig.getPreCredutResult;
  return Http.send(api, 'get', true);
};
// 获取用户企业信息
export const getCorpBaseInfo = payload => {
  const api = ApiConfig.getCorpBaseInfo;
  return Http.send(api, 'get', payload, true);
};

// 企业基本信息保存
export const saveCorpBaseInfo = payload => {
  const api = ApiConfig.saveCorpBaseInfo;
  return Http.send(api, 'post', payload, true);
};

// 更新企业信息
export const updateCorpBaseInfo = payload => {
  const api = ApiConfig.updateCorpBaseInfo;
  return Http.send(api, 'put', payload, true);
};

export const saveAduitFiles = payload => {
  const api = ApiConfig.saveAduitFiles;
  return Http.send(api, 'post', payload, true);
};

export const verifyClientAreaCode = payload => {
  const api = ApiConfig.verifyClientAreaCode;
  return Http.send(api, 'post', payload);
};
