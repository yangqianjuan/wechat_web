const apiDomain = process.env.VUE_APP_API_DOMAIN;

const gfApi = {
  /**
   * 1、授信
   * */

  // 查询授信状态
  gfCreditStatusQuery: `${apiDomain}app/gfCredit/creditStatusQuery`,
  // 授信申请
  gfCreditApply: `${apiDomain}app/gfCredit/creditApply`,
  // 查询授信合同
  gfCreditContractQuery: `${apiDomain}app/gfCredit/creditContractQuery`,
  // 授信资料上传
  gfCreditMaterialUpload: `${apiDomain}app/gfCredit/creditMaterialUpload`,
  // 授信结果查询
  gfCreditQuery: `${apiDomain}app/gfCredit/creditQuery`,

  /**
   * 基本通用
   * */

  // 发起会话
  gfSessionId: `${apiDomain}app/gf/auth/sessionId`,
  // 发起手机短信验证码
  gfSendMess: `${apiDomain}app/gf/auth/sendMess`,
  // 校验短信验证码
  gfVerifyMess: `${apiDomain}app/gf/auth/verifyMess`,
  // 调用广发的银联综合认证接口(四要素的验证)
  gfUnionPayVerify: `${apiDomain}app/gf/auth/unionPayVerify`,
  // 提交人脸识别验证
  gfFaceVerify: `${apiDomain}app/gf/auth/faceVerify`,
  // 职业查询
  gfOccupationDict: `${apiDomain}app/gf/assist/occupationDict`,
  // gf省市区的查询
  gfAreaDictQuery: `${apiDomain}app/gf/assist/areaDictQuery`,

  /**
   * 开户
   * */

  // gf客户开户列表
  gfAccountListQuery: `${apiDomain}app/gfBankCard/accountListQuery`,
  // gf开户详情
  gfDealOpenAccount: `${apiDomain}app/gfBankCard/dealOpenAccount`,
  // 账户余额查询
  gfAccountBalanceQuery: `${apiDomain}app/gfBankCard/accountBalanceQuery`,
  // 查询客户绑卡信息
  gfAccountBindQuery: `${apiDomain}app/gfBankCard/accountBindQuery`,
  // 绑定广发一类卡
  gfBankCardBind: `${apiDomain}app/gfBankCard/bankCardBind`,
  // 绑定广发二类户
  gfEaccountBind: `${apiDomain}app/gfBankCard/eaccountBind`,
  // 广发二类户申请
  gfEaccountApply: `${apiDomain}app/gfBankCard/gfEaccountApply`,
  // 广发二类户开户信息查询
  gfEaccountOpenQuery: `${apiDomain}app/gfBankCard/eaccountOpenQuery`,
  // 广发开户协议
  gfOpenAccountContract: `${apiDomain}app/gfBankCard/openAccountContract`,

  /**
   * 提现
   * */

  //提现申请
  gfWithDrawApply: `${apiDomain}app/gf/withdraw/withDrawApply`,
  //提现明细列表
  gfWithDrawList: `${apiDomain}app/gf/withdraw/withDrawList`,
  //提现结果查询
  gfWithDrawResult: `${apiDomain}app/gf/withdraw/withDrawResult`,

  /**
   * 充值
   * */

  //充值申请
  gfRechargeApply: `${apiDomain}app/gf/withdraw/rechargeApply`,
  //充值明细列表
  gfRechargeList: `${apiDomain}app/gf/withdraw/rechargeList`,
  //充值结果查询
  gfRechargeResult: `${apiDomain}app/gf/withdraw/rechargeResult`,

  /**
   * 借款 / 还款
   * */

  // 借款
  // 广发申请准备信息
  gfApplyPrepareInfo: `${apiDomain}app/gf/lending/applyPrepareInfo`,
  // 广发放款申请
  gfBorrowingApply: `${apiDomain}app/gf/lending/borrowingApply`,
  // 广发本地借款详情查询
  gfLendingDetail: `${apiDomain}app/gf/lending/lendingDetail`,
  // 广发借款列表以及还款计划
  gfLendingListWithRepayPlan: `${apiDomain}app/gf/lending/lendingListWithRepayPlan`,
  // 广发本地个人借款记录
  gfQueryBorrowingApplyList: `${apiDomain}app/gf/lending/queryBorrowingApplyList`,

  // 还款
  // 广发还款记录
  gfQueryCapRepayRetByUserId: `${apiDomain}app/gf/repay/queryCapRepayRetByUserId`,
  // 广发主动还款申请
  gfRepayApply: `${apiDomain}app/gf/repay/repayApply`,
  // 广发还款试算
  gfRepayCal: `${apiDomain}app/gf/repay/repayCal`,
  // 广发还款金额信息
  gfRepayDetail: `${apiDomain}app/gf/repay/repayDetail`,
  // 广发获取还款计划
  gfRepayPlanList: `${apiDomain}app/gf/repay/repayPlanList`,
  // 广发还款详情
  gfRepayResult: `${apiDomain}app/gf/repay/repayResult`,
  // 广发实时还款计划获取   app/gf/repay/repayPlan
  gfRealTimeRepayPlan: `${apiDomain}app/gf/repay/repayPlan`,

  // gf 的合同获取
  // 借款合同的获取
  getGFLendingContract: `${apiDomain}app/gf/lending/lendingContract`,
  // 授信合同的获取
  getGFCreditContract: `${apiDomain}app/gfCredit/creditContract`,
  // 广发授信合同_终版
  getGFCreditContractEnd: `${apiDomain}app/gfCredit/creditContractEnd`,
  // 广发借款合同_终版
  getGFLendingContractEnd: `${apiDomain}app/gf/lending/lendingContractEnd`,

  // 返显广发企业的地区
  getGFCorpArea: `${apiDomain}app/baseInfo/getGfCorpArea`,

  // 获取产品税局配置 (浦发和广发)
  getProductTaxConfig: `${apiDomain}app/baseInfo/getProductTaxConfig`,

  // gf的换绑卡
  // 查询当前申请是否有换绑中记录
  getQueryWaitBankChangeRecord: `${apiDomain}app/gfBankCard/queryWaitBankChangeRecord`,
  // 查询换绑中结果
  getQueryWaitBankChangeReslut: `${apiDomain}app/gfBankCard/queryWaitBankChangeReslut`,
  // 广发产品银行卡卡换绑
  gfOtherBankCardChange: `${apiDomain}app/gfBankCard/otherBankCardChange`
};

export default {
  gfApi
};
