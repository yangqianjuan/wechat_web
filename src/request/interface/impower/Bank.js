import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export const bindPFBankCard = payload => {
  const api = ApiConfig.bindPFBankCard;
  return Http.send(api, 'post', payload);
};

// 浦发电子账户开通
export const applyEAcoount = payload => {
  const api = ApiConfig.applyEAcoount;
  return Http.send(api, 'post', payload);
};

// 获取用户银行卡 getBankCardList
export const getBankCardList = () => {
  const api = ApiConfig.getBankCardList;
  return Http.send(api, 'get');
};

export const getBankCardListByProdId = payload => {
  const api = ApiConfig.getBankCardListByProdId;
  return Http.send(api, 'get', payload);
};

export const getBankCardInfoByCreditNo = payload => {
  const api = ApiConfig.getBankCardInfoByCreditNo;
  return Http.send(api, 'get', payload);
};

export const getBeijingRepayAccountInfo = payload => {
  const api = ApiConfig.getBeijingRepayAccountInfo;
  return Http.send(api, 'get', payload);
};

export const bindBankCardSmsVerify = payload => {
  const api = ApiConfig.bindBankCardSmsVerify;
  return Http.send(api, 'post', payload);
};
export const eAccountVerify = payload => {
  const api = ApiConfig.eAccountVerify;
  return Http.send(api, 'post', payload, true);
};

// 借款申请
export const borrowingApply = payload => {
  const api = ApiConfig.borrowingApply;
  return Http.send(api, 'post', payload);
};

// 放款准备信息
export const preBorrowingApply = payload => {
  const api = ApiConfig.preBorrowingApply;
  return Http.send(api, 'get', payload);
};

// 担保协议准备信息（合同）
export const borrowingApplyGuaranteeContract = payload => {
  const api = ApiConfig.borrowingApplyGuaranteeContract;
  return Http.send(api, 'post', payload);
};

// 担保合同签署地址的获取
export const guaranteeContractAddress = path => {
  const api = path;
  return Http.send(api, 'get', { getGuaranteeContract: true });
};

// 最终的借款申请
export const finallyBorrowingApply = payload => {
  const api = ApiConfig.finallyBorrowingApply;
  return Http.send(api, 'get', payload);
};

// 计算产品的担保费
export const computeGuaranteeFee = payload => {
  const api = ApiConfig.computeGuaranteeFee;
  return Http.send(api, 'post', payload);
};

export const queryBorrowApply = loanNo => {
  const api = `${ApiConfig.queryBorrowApply}/${loanNo}`;
  return Http.send(api, 'get');
};

export const getProduceDetail = payload => {
  const api = ApiConfig.getProduceDetail;
  return Http.send(api, 'get', payload);
};
// 提前还款试算
export const advanceRepaymentTrial = payload => {
  const api = ApiConfig.advanceRepaymentTrial;
  return Http.send(api, 'get', payload);
};
// 提前主动还款
export const prepaymen = payload => {
  const api = ApiConfig.prepaymen;
  return Http.send(api, 'post', payload);
};

// 北京主动还款信息--（汇总）-- 查询
export const beijingLoanRepaymentQuery = payload => {
  const api = ApiConfig.beijingLoanRepaymentQuery;
  return Http.send(api, 'get', payload);
};
//
export const queryEaccountOpenRecord = payload => {
  let isNeedUnionKey = payload ? false : true;
  const api = ApiConfig.queryEaccountOpenRecord;
  return Http.send(api, 'get', payload, isNeedUnionKey);
};

export const queryReapyAcountInfo = payload => {
  const api = ApiConfig.queryReapyAcountInfo;
  return Http.send(api, 'get', payload);
};

export const bankCardChange = payload => {
  const api = ApiConfig.bankCardChange;
  return Http.send(api, 'post', payload);
};

export const ohterBnakChangeApply = payload => {
  const api = ApiConfig.ohterBnakChangeApply;
  return Http.send(api, 'post', payload);
};

export const otherBankCardChangeVerify = payload => {
  const api = ApiConfig.otherBankCardChangeVerify;
  return Http.send(api, 'post', payload);
};

export const verifyBankCrad = payload => {
  const api = ApiConfig.verifyBankCrad;
  return Http.send(api, 'post', payload);
};

export const saasNewEacountCard = payload => {
  const api = ApiConfig.saasNewEacountCard;
  return Http.send(api, 'post', payload);
};
