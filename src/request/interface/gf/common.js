import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

// 发起广发的会话
export const gfSessionId = payload => {
  const api = ApiConfig.gfSessionId;
  return Http.send(api, 'post', payload);
};

// 发起广发的手机验证码发送
export const gfSendMess = payload => {
  const api = ApiConfig.gfSendMess;
  return Http.send(api, 'get', payload);
};

// 校验
export const gfVerifyMess = payload => {
  const api = ApiConfig.gfVerifyMess;
  return Http.send(api, 'post', payload);
};

// 调用广发的银联综合认证接口
export const gfUnionPayVerify = payload => {
  const api = ApiConfig.gfUnionPayVerify;
  return Http.send(api, 'post', payload);
};

// 调用人脸识别认证
export const gfFaceVerify = payload => {
  const api = ApiConfig.gfFaceVerify;
  return Http.send(api, 'post', payload);
};

// 职业查询
export const gfOccupationDict = payload => {
  const api = ApiConfig.gfOccupationDict;
  return Http.send(api, 'get', payload);
};

// 省市区的查询
export const gfAreaDictQuery = payload => {
  const api = ApiConfig.gfAreaDictQuery;
  return Http.send(api, 'get', payload);
};

// 客户开户列表
export const gfAccountListQuery = payload => {
  const api = ApiConfig.gfAccountListQuery;
  return Http.send(api, 'get', payload);
};

// 客户开户详情
export const gfDealOpenAccount = payload => {
  const api = ApiConfig.gfDealOpenAccount;
  return Http.send(api, 'get', payload);
};

/**
 * 广发申请准备信息
 * params 暂无
 *
 * */

export const gfApplyPrepareInfo = payload => {
  const api = ApiConfig.gfApplyPrepareInfo;
  return Http.send(api, 'post', payload);
};

/**
 * 广发放款申请
 * params 暂无
 *
 * */

export const gfBorrowingApply = payload => {
  const api = ApiConfig.gfBorrowingApply;
  return Http.send(api, 'post', payload);
};

/**
 * 广发本地借款详情查询
 * params 暂无
 *
 * */

export const gfLendingDetail = payload => {
  const api = ApiConfig.gfLendingDetail;
  return Http.send(api, 'get', payload);
};

/**
 * 广发借款列表以及还款计划
 * params 暂无
 *
 * */

export const gfLendingListWithRepayPlan = (payload, isNeedUnionKey = false) => {
  const api = ApiConfig.gfLendingListWithRepayPlan;
  return Http.send(api, 'get', payload, isNeedUnionKey);
};

/**
 * 广发本地个人借款记录
 * params 暂无
 *
 * */

export const gfQueryBorrowingApplyList = payload => {
  const api = ApiConfig.gfQueryBorrowingApplyList;
  return Http.send(api, 'get', payload);
};

/**
 * 广发还款记录
 * params 暂无
 *
 * */

export const gfQueryCapRepayRetByUserId = payload => {
  const api = ApiConfig.gfQueryCapRepayRetByUserId;
  return Http.send(api, 'get', payload);
};

/**
 * 广发主动还款申请
 * params 暂无
 *
 * */

export const gfRepayApply = payload => {
  const api = ApiConfig.gfRepayApply;
  return Http.send(api, 'post', payload);
};

/**
 * 广发还款试算
 * params 暂无
 *
 * */

export const gfRepayCal = payload => {
  const api = ApiConfig.gfRepayCal;
  return Http.send(api, 'post', payload);
};

/**
 * 广发还款金额信息
 * params 暂无
 *
 * */

export const gfRepayDetail = payload => {
  const api = ApiConfig.gfRepayDetail;
  return Http.send(api, 'get', payload);
};

/**
 * 广发获取还款计划
 * params 暂无
 *
 * */

export const gfRepayPlanList = payload => {
  const api = ApiConfig.gfRepayPlanList;
  return Http.send(api, 'post', payload);
};

/**
 * 广发还款详情
 * params 暂无
 *
 * */

export const gfRepayResult = payload => {
  const api = ApiConfig.gfRepayResult;
  return Http.send(api, 'get', payload);
};

/**
 * 充值申请
 * params 暂无
 *
 * */

export const gfRechargeApply = payload => {
  const api = ApiConfig.gfRechargeApply;
  return Http.send(api, 'post', payload);
};

/**
 * 充值明细列表
 * params 暂无
 *
 * */

export const gfRechargeList = payload => {
  const api = ApiConfig.gfRechargeList;
  return Http.send(api, 'post', payload);
};

/**
 * 充值结果查询
 * params 暂无
 *
 * */

export const gfRechargeResult = payload => {
  const api = ApiConfig.gfRechargeResult;
  return Http.send(api, 'get', payload);
};

/**
 * 提现申请
 * params 暂无
 *
 * */

export const gfWithDrawApply = payload => {
  const api = ApiConfig.gfWithDrawApply;
  return Http.send(api, 'post', payload);
};

/**
 * 提现明细列表
 * params 暂无
 *
 * */

export const gfWithDrawList = payload => {
  const api = ApiConfig.gfWithDrawList;
  return Http.send(api, 'post', payload);
};

/**
 * 提现结果查询
 * params 暂无
 *
 * */

export const gfWithDrawResult = payload => {
  const api = ApiConfig.gfWithDrawResult;
  return Http.send(api, 'get', payload);
};

/**
 * 账户余额查询
 * params 暂无
 *
 * */

export const gfAccountBalanceQuery = payload => {
  const api = ApiConfig.gfAccountBalanceQuery;
  return Http.send(api, 'get', payload);
};

/**
 * 查询客户绑卡信息
 * params 暂无
 *
 * */

export const gfAccountBindQuery = payload => {
  const api = ApiConfig.gfAccountBindQuery;
  return Http.send(api, 'get', payload);
};

/**
 * 绑定广发一类卡
 * params 暂无
 *
 * */

export const gfBankCardBind = payload => {
  const api = ApiConfig.gfBankCardBind;
  return Http.send(api, 'post', payload);
};

/**
 * 绑定广发二类户
 * params 暂无
 *
 * */

export const gfEaccountBind = payload => {
  const api = ApiConfig.gfEaccountBind;
  return Http.send(api, 'post', payload);
};

/**
 * 广发二类户开户信息查询
 * params 暂无
 *
 * */

export const gfEaccountOpenQuery = payload => {
  const api = ApiConfig.gfEaccountOpenQuery;
  return Http.send(api, 'get', payload);
};

/**
 * 广发二类户申请
 * params 暂无
 *
 * */

export const gfEaccountApply = payload => {
  const api = ApiConfig.gfEaccountApply;
  return Http.send(api, 'post', payload);
};

// 获取开户合同
export const gfOpenAccountContract = payload => {
  const api = ApiConfig.gfOpenAccountContract;
  return Http.send(api, 'post', payload, false, true);
};

// 查询授信状态
export const gfCreditStatusQuery = payload => {
  const api = ApiConfig.gfCreditStatusQuery;
  return Http.send(api, 'get', payload);
};

/**
 *  授信申请
 * params 暂无
 *
 * */

export const gfCreditApply = payload => {
  const api = ApiConfig.gfCreditApply;
  return Http.send(api, 'post', payload);
};

/**
 * 查询授信合同
 * params 暂无
 *
 * */

export const gfCreditContractQuery = payload => {
  const api = ApiConfig.gfCreditContractQuery;
  return Http.send(api, 'get', payload);
};

/**
 * 授信资料上传
 * params 暂无
 *
 * */

export const gfCreditMaterialUpload = payload => {
  const api = ApiConfig.gfCreditMaterialUpload;
  return Http.send(api, 'post', payload);
};

/**
 * 授信结果查询
 * params 暂无
 *
 * */

export const gfCreditQuery = payload => {
  const api = ApiConfig.gfCreditQuery;
  return Http.send(api, 'get', payload);
};

/**
 * 借款合同的获取
 * params 暂无
 *
 * */

export const getGFLendingContract = payload => {
  const api = ApiConfig.getGFLendingContract;
  return Http.send(api, 'post', payload, false, true);
};

/**
 * 授信合同的获取
 * params 暂无
 *
 * */

export const getGFCreditContract = payload => {
  const api = ApiConfig.getGFCreditContract;
  return Http.send(api, 'post', payload, false, true);
};

/**
 * 广发授信合同_终版
 * params 暂无
 *
 * */

export const getGFCreditContractEnd = payload => {
  const api = ApiConfig.getGFCreditContractEnd;
  return Http.send(api, 'post', payload, false, true);
};

/**
 * 广发借款合同_终版
 * params 暂无
 *
 * */

export const getGFLendingContractEnd = payload => {
  const api = ApiConfig.getGFLendingContractEnd;
  return Http.send(api, 'post', payload, false, true);
};

/**
 * 返显广发企业的地区
 * params 暂无
 *
 * */

export const getGFCorpArea = payload => {
  const api = ApiConfig.getGFCorpArea;
  return Http.send(api, 'get', payload);
};

/**
 * 广发实时还款计划获取
 * params 暂无
 *
 * */

export const gfRealTimeRepayPlan = payload => {
  const api = ApiConfig.gfRealTimeRepayPlan;
  return Http.send(api, 'get', payload);
};

/**
 * gf查询当前申请是否有换绑中记录
 * params 暂无
 *
 * */

export const getQueryWaitBankChangeRecord = payload => {
  const api = ApiConfig.getQueryWaitBankChangeRecord;
  return Http.send(api, 'get', payload);
};

/**
 * gf查询换绑的结果
 * params 暂无
 *
 * */

export const getQueryWaitBankChangeReslut = payload => {
  const api = ApiConfig.getQueryWaitBankChangeReslut;
  return Http.send(api, 'get', payload);
};

/**
 * gf广发产品银行卡卡换绑
 * params 暂无
 *
 * */

export const gfOtherBankCardChange = payload => {
  const api = ApiConfig.gfOtherBankCardChange;
  return Http.send(api, 'post', payload);
};
