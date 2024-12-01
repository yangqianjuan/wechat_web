import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export const saveSaleContract = payload => {
  const api = ApiConfig.saveSaleContract;
  return Http.send(api, 'put', payload, true);
};

export const querySassContractUrl = payload => {
  const api = ApiConfig.querySassContractUrl;
  return Http.send(api, 'get', payload, true);
};

export const sassSaveConnection = payload => {
  const api = ApiConfig.sassSaveConnection;
  return Http.send(api, 'put', payload, true);
};

export const sassSendSmsCode = payload => {
  const api = ApiConfig.sassSendSmsCode;
  return Http.send(api, 'post', payload, true);
};

export const sassEAcountVerify = payload => {
  const api = ApiConfig.sassEAcountVerify;
  return Http.send(api, 'post', payload, true);
};

export const qeurySassEcontractStatus = payload => {
  const api = ApiConfig.qeurySassEcontractStatus;
  return Http.send(api, 'get', payload, true);
};

export const querySassIsOpenEaccount = payload => {
  const api = ApiConfig.querySassIsOpenEaccount;
  return Http.send(api, 'get', payload, true);
};

export const querySassLoansAdvanceCharge = payload => {
  const api = ApiConfig.querySassLoansAdvanceCharge;
  return Http.send(api, 'get', payload);
};

export const saasLoanBeforeStatusQuery = payload => {
  const api = ApiConfig.saasLoanBeforeStatusQuery;
  return Http.send(api, 'get', payload);
};

export const transferVoucherUpload = payload => {
  const api = ApiConfig.transferVoucherUpload;
  return Http.send(api, 'post', payload);
};

export const querySaasLoansLimit = payload => {
  const api = ApiConfig.querySaasLoansLimit;
  return Http.send(api, 'get', payload);
};

export const saasLoans = payload => {
  const api = ApiConfig.saasLoans;
  return Http.send(api, 'post', payload);
};

export const qeurySassLoansEcontractStatus = payload => {
  const api = ApiConfig.qeurySassLoansEcontractStatus;
  return Http.send(api, 'get', payload);
};

export const sassAdvanceRepaymentTrial = payload => {
  const api = ApiConfig.sassAdvanceRepaymentTrial;
  return Http.send(api, 'post', payload);
};

export const saasPreRepay = payload => {
  const api = ApiConfig.saasPreRepay;
  return Http.send(api, 'post', payload);
};

export const saasEaAcountBalance = payload => {
  const api = ApiConfig.saasEaAcountBalance;
  return Http.send(api, 'get', payload);
};

export const saasAutoAgreeBankCard = payload => {
  const api = ApiConfig.saasAutoAgreeBankCard;
  return Http.send(api, 'post', payload);
};

export const queryLoanEcontract = payload => {
  const api = ApiConfig.queryLoanEcontract;
  return Http.send(api, 'get', payload);
};

export const querySaasElecContract = payload => {
  const api = ApiConfig.queryElecContract;
  return Http.send(api, 'post', payload);
};
