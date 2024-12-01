/*
 * @Author: yanpeng
 * @Date: 2023-06-13 17:35:11
 * @LastEditors: yanpeng
 * @LastEditTime: 2023-07-26 14:53:32
 * @Description:
 */
const apiDomain = process.env.VUE_APP_API_DOMAIN;

const saasApi = {
  // 保存合同信息
  saveSaleContract: `${apiDomain}app/baseInfo/saveSaleContract`,
  // sass 保存联系人信息
  sassSaveConnection: `${apiDomain}app/baseInfo/contactInfo`,
  // 获取合同签署url
  querySassContractUrl: `${apiDomain}app/saasEcontractInd/getEcontractURL`,
  // 发送sass电子账户验证码
  sassSendSmsCode: `${apiDomain}app/saasElecAcc/agreePay`,
  // sass电子账户验证
  sassEAcountVerify: `${apiDomain}app/saasElecAcc/newEacctount`,
  // saas电子户换绑卡
  saasNewEacountCard: `${apiDomain}app/saasElecAcc/newEaccountCard`,
  // saas自动签约银行卡，用于已存在该产品电子户，自动签约
  saasAutoAgreeBankCard: `${apiDomain}app/saasElecAcc/autoAgreeBankCard`,
  // sass获取合同状态
  qeurySassEcontractStatus: `${apiDomain}app/saasEcontractInd/creditNoEcontractQuery`,
  // sass获取借款合同状态
  qeurySassLoansEcontractStatus: `${apiDomain}app/saasEcontractInd/loanEcontractQuery`,
  // 判断是否存在saas产品电子账户
  querySassIsOpenEaccount: `${apiDomain}app/saasElecAcc/isOpenEaccount`,
  // 预付款额度查询
  querySassLoansAdvanceCharge: `${apiDomain}app/saasLoanApply/loanAdvanceChargeQuery`,
  // 放款前流程状态查询
  saasLoanBeforeStatusQuery: `${apiDomain}app/saasLoanApply/saasLoanBeforeStatusQuery`,
  // saas放款合同查询,
  queryLoanEcontract: `${apiDomain}app/saasLoanApply/saasLoanBeforeStatusQuery`,
  // 是否上传转账凭证
  transferVoucherUpload: `${apiDomain}app/saasLoanApply/transferVoucherUpload`,
  // 贷款额度查询
  querySaasLoansLimit: `${apiDomain}app/saasLoanApply/loanLimitQuery`,
  // saas借款
  saasLoans: `${apiDomain}app/saasLoanApply/newSingleBpApply`,
  //  saas提前还款试算
  sassAdvanceRepaymentTrial: `${apiDomain}app/saasCredit/saasAdvanceRepayTried`,
  // saas提前还款
  saasPreRepay: `${apiDomain}app/saasCredit/preRepayApply`,
  // 中关村电子户余额查询接口
  saasEaAcountBalance: `${apiDomain}app/saasElecAcc/saasEAccountBalance`,
  // 小萌本地saas合同查询
  queryElecContract: `${apiDomain}app/saasEcontractInd/queryElecContract`,
  //产品进件状态查询
  userProductApplyInfo: `${apiDomain}public/app/app/product/userProductApplyInfo`
};

export default {
  saasApi
};
