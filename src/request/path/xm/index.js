const apiDomain = process.env.VUE_APP_API_DOMAIN;

const xmApi = {
  // add/修改 联系人信息
  insertOrModifyUserInfo: `${apiDomain}app/contract/insertOrModifyContract`,
  // 更新销售用户身份证基本信息
  updateUserSaleBaseInfo: `${apiDomain}app/baseInfo/modifySalePersonBaseInfo`,
  // 更新销售用户身份证基本信息 public/app/app/applyUnionKey/openUnionKey
  updateUserSaleBaseInfoNew: `${apiDomain}public/app/app/baseInfo/modifySalePersonBaseInfo`,
  // 更新用户身份证基本信息
  updateUserBaseInfo: `${apiDomain}app/baseInfo/modifyPersonBaseInfo`,
  // 更新申请人基本信息
  saveApplyPersonBaseInfo: `${apiDomain}app/baseInfo/saveApplyPersonBaseInfo`,
  modifyPersonBaseInfo: `${apiDomain}app/baseInfo/modifyPersonBaseInfo`,
  //发送手机验证码 auth
  sendSmsSlideCode: `${apiDomain}auth/mobile/sendCode/slide`,
  // 发送手机验证码
  sendSmsCode: `${apiDomain}app/appMobileAuth/sendVerifyCode`,
  // 北京（ 用信 ）发送手机验证码
  beijingSendSmsCode: `${apiDomain}app/bjbank/sms/send`,
  // 北京（ 用信 -- 信息上传 ）更换手机号
  beijingChangePhone: `${apiDomain}auth/third/changeMobile`,
  // 发送手机验证码 ( 用信 )
  beijingLoansSendSmsCode: `${apiDomain}app/bjbank/sms/loan/send`,
  // 发送手机验证码 ( 用信 ) 验证
  beijingLoansVerifySmsCode: `${apiDomain}app/bjbank/sms/loan/smsCodeVerify`,
  // 北京查看还款计划
  getBeijingRepaymentPlanTrial: `${apiDomain}app/repayment/bjbank/repaymentPlanTrial`,
  // 北京借款信息提交（ 单次信息的提交 ）
  addBeijingSingleBorrowInfo: `${apiDomain}app/borrowingApply/bjbank/borrowingApply`,
  // 北京借款中的记录信息查询（ 单次信息的查询 ）
  getBeijingSingleBorrowInfoRecord: `${apiDomain}app/borrowingApply/bjbank/borrowingQuery`,
  // 验证手机验证码
  verifySmsCode: `${apiDomain}app/appMobileAuth/authMobile`,
  // 保存机构基本信息
  saveCorpBaseInfo: `${apiDomain}app/baseInfo/saveCorpBaseInfo`,
  // 更新企业信息
  updateCorpBaseInfo: `${apiDomain}app/baseInfo/modifyCorpBaseInfo`,
  // 获取企业基本信息 *
  getCorpBaseInfo: `${apiDomain}app/baseInfo/findCorpBaseInfo`,
  // getUnionKey
  getUnionKey: `${apiDomain}app/applyUnionKey/unionkey`,
  // bind 银行卡
  bindBankCardAgree: `${apiDomain}app/bankCardAgree/applyBankCardAgree`,
  // 本行卡鉴定
  verifyBankCrad: `${apiDomain}app/bankCard/verifyBankCrad`,
  // 绑定浦发银行卡 *
  bindPFBankCard: `${apiDomain}app/bankCard/saveBankCard`,
  // 浦发银行电子账户开通 *
  applyEAcoount: `${apiDomain}app/eAccount/applyEAccount`,
  // 浦发电子账户开通验证 *
  eAccountVerify: `${apiDomain}app/eAccount/eAccountOpenVerify`,
  //银行卡申请变更
  bankCardChange: `${apiDomain}app/bankCard/bankCardChange`,
  // 他行卡变更申请
  ohterBnakChangeApply: `${apiDomain}app/bankCard/otherBankCardChange`,
  // 他行卡变更验证
  otherBankCardChangeVerify: `${apiDomain}app/bankCard/otherBankCardChangeVerify`,
  //bindBankCardSmsVerify  POST /app/eAccount/eAccountOpenVerify
  bindBankCardSmsVerify: `${apiDomain}app/eAccount/bankCardAgreeVerify`,
  //用户授信服务
  applyUserCredit: `${apiDomain}app/userCredit/applyUserCredit`,
  // 用户授信结果查询 所有
  getUserCreditResult: `${apiDomain}app/userCredit/queryCreditProductInfo`,
  // 用户授信结果查新 单个
  queryApplyInfoIndexStatus: `${apiDomain}app/applyInfoIndex/queryApplyInfoIndexByApplyUnionKey`,
  // 北京银行用信结果查询
  queryBeijingLoansInfoIndexStatus: `${apiDomain}app/repayment/bjbank/queryLoanStatus`,
  // 预授信结果查询
  getPreCredutResult: `${apiDomain}app/userCredit/queryPreCreditProductInfo`,
  // POST /eAccount/applyEAccount
  // applyEAccount: `${apiDomain}app/eAccount/applyEAccount`,
  // 借款申请
  borrowingApply: `${apiDomain}app/borrowingApply/borrowingApply`,
  // 计算产品担保费
  computeGuaranteeFee: `${apiDomain}app/guaranteeFee/computeGuaranteeFee`,
  // 借款结果查询
  queryBorrowApply: `${apiDomain}app/borrowingApply/queryBorrowingApply`,
  // 放款准备信息(订单支用的功能)
  preBorrowingApply: `${apiDomain}app/borrowingApply/preBorrowingApply`,
  // 担保协议准备信息
  borrowingApplyGuaranteeContract: `${apiDomain}app/borrowingApply/guaranteeContract`,
  // 最终的借款申请
  finallyBorrowingApply: `${apiDomain}app/borrowingApply/finallyBorrowingApply`,

  /**
   * 获取人脸识别
   * */

  // 获取活体识别腾讯云 token
  // getFacePPToken: `${apiDomain}auth/tencentCloudFaceId/bizToken`,
  getFacePPToken: `${apiDomain}app/tencentCloudFaceId/getFaceIdUrls`,
  // 获取验证结果
  // getFaceVerifyResult: `${apiDomain}auth/tencentCloudFaceId/detectInfo`,
  getFaceVerifyResult: `${apiDomain}app/tencentCloudFaceId/detectInfo`,

  // 生物活体识别检查 -- （ 北京银行生物识别检查 驱动节点更新 ）
  getFaceBjBankCheck: `${apiDomain}app/bjbank/bioassay/check`,

  // 查询是否做过借款人脸核身 + 生物核验（ 北京人脸识别核验 ）
  getFaceBjBankEffectiveCheck: `${apiDomain}app/tencentCloudFaceId/faceBioassayCheck`,

  // 获取产品详情
  getProduceDetail: `${apiDomain}app/product/productDetail`,
  // 获取银行卡列表
  getBankCardList: `${apiDomain}app/baseInfo/bankCardList`,
  // 获取某个产品下的银行卡列表
  getBankCardListByProdId: `${apiDomain}app/bankCard/queryBankCardInfoList`,
  // 根据授信单号获取银行卡信息
  getBankCardInfoByCreditNo: `${apiDomain}app/bankCard/queryBankCardAgreeInfoByCreditNo`,
  // 个人借款记录查询
  queryBorrowingApplyList: `${apiDomain}app/borrowingApply/queryBorrowingApplyList`,
  // 北京 -- 个人借款记录查询
  queryBjbBorrowingApplyList: `${apiDomain}app/borrowingApply/queryBorrowingApplyListWithStatus`,
  // 获取还款计划
  queryBorrowingAndRepaymentPlanList: `${apiDomain}app/borrowingApply/queryBorrowingAndRepaymentPlanList`,
  // 获取借款详情
  queryBorrowingDetail: `${apiDomain}app/borrowingApply/queryBorrowingDetailList`,
  // 还款记录查询 capitalRepaymentRet/queryCapRepayRetByUserId
  queryCapRepayRetByLoanReceiptNo: `${apiDomain}app/repayment/queryCapRepayRetByUserId`,
  // 查询个人申请产品列表
  getPersonApplyList: `${apiDomain}app/product/personApplyList`,
  // 提前还款试算
  advanceRepaymentTrial: `${apiDomain}app/repayment/advanceRepaymentTrial`,
  // 主动还款申请
  prepaymen: `${apiDomain}app/repayment/prepayment`,
  // 北京主动还款信息--（汇总）-- 查询
  beijingLoanRepaymentQuery: `${apiDomain}app/repayment/bjbank/loanRepaymentQuery`,
  // 查询是否有电子账户正在开通
  queryEaccountOpenRecord: `${apiDomain}app/eAccount/queryEaccountOpenRecord`,
  // 获取富税贷Url
  getFsdApplyUrl: `${apiDomain}app/fumin/fsd/apply`,
  // saas 代理产品四要素
  getSaasApplyUrl: `${apiDomain}saas/apply/newApply`,
  // 获取协议url
  getProtocolUrl: `${apiDomain}app/elecContract/queryElecContract`,
  // 获取北京协议url
  getBeijingProtocolUrl: `${apiDomain}app/elecContract/bjbank/showContract`,
  // 获取北京借款详情查看的协议url
  getBeijingLoanDetailProtocolUrl: `${apiDomain}app/elecContract/bjbank/showContractWithLocal`,
  // 获取借款后协议
  getProTocolTest: `${apiDomain}app/elecContract/queryLoanElecContract`,
  // 保存授信附件信息 POST /app/attachments/saveFiles
  saveAduitFiles: `${apiDomain}app/attachments/saveFiles`,
  // 查新还款账户信息 /app/bankCard/queryRepayBankCardInfoByCreditNo
  queryReapyAcountInfo: `${apiDomain}app/bankCard/queryRepayBankCardInfoByCreditNo`,
  // 获取北京银行还款银行卡信息
  getBeijingRepayAccountInfo: `${apiDomain}app/bankCard/bjbank/customerCardInfo`,
  // 改绑微信
  weChatChangeBind: `${apiDomain}auth/wxBind/weChatChangeBind`,
  // 三要素验证
  threeMianVerify: `${apiDomain}auth/threeMian/threeMianVerify`,
  // 销售三要素验证 -- 小程序
  salerThreeMianVerify: `${apiDomain}auth/threeMian/salerThreeMianVerify`,
  // 销售三要素验证 -- h5
  salerThreeMianVerifyH5: `${apiDomain}auth/threeMian/salerThreeMianVerifyH5`,
  // 电子账户提现的接口
  // 提现明细列表
  listWithDrawCashInfo: `${apiDomain}app/withdraw/listWithDrawCashInfo`,
  // 确认提现
  drawMoney: `${apiDomain}app/withdraw/drawMoney`,
  drawMoneyResult: `${apiDomain}app/withdraw/drawMoneyResult`,

  /**
   * pf的开户改动
   * */

  // 判断小萌快贷用户是否开通过电子账户
  getPFHisOpenEAccount: `${apiDomain}app/eAccount/getHisOpenEAccount`,
  // pf自动签约银行卡
  autoPFBindOldEAccount: `${apiDomain}app/eAccount/autoBindOldEAccount`
};

export default {
  xmApi
};
