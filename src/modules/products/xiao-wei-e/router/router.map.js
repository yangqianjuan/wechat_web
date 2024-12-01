const xweRouterMap = [
  // ----------------------------------------------------------------------------  授信流程  ----------------------------------------------------------------

  // 产品详情   creditProcess 授信
  {
    path: '/prod_xwe',
    name: 'XWEProDetail',
    component: () =>
      import(/* webpackChunkName: "xwe-credit-1" */ '../page/creditProcess/product/ProductionDetail.vue'),
    meta: {
      skipAuth: true,
      title: '产品详情'
    }
  },

  // 上传身份证
  {
    path: '/xwe_upload_idcard',
    name: 'XWEUploadIdcard',
    component: () =>
      import(/* webpackChunkName: "xwe-credit-1" */ '../page/creditProcess/uploadIdCard/UploadIdCard.vue'),
    meta: {
      title: '上传身份证'
    }
  },
  // 3、三要素验证
  {
    path: '/xwe_idno_name_phone_verify',
    name: 'XWEIdnoNamePhoneVerify',
    component: () => import(/* webpackChunkName: "xwe-credit-1" */ '../page/creditProcess/threeInfo/ThreeInfo.vue'),
    meta: {
      title: '绑定手机号'
    }
  },

  // 4、活体识别（人脸识别）
  {
    path: '/xwe_face_pp',
    name: 'XWEFace_pp',
    component: () => import(/* webpackChunkName: "xwe-credit-2" */ '../page/creditProcess/face/FacePP.vue'),
    meta: {
      title: '人脸识别'
    }
  },

  // 5、企业认证(营业执照上传识别)
  {
    path: '/xwe_company_approve',
    name: 'XWECompanyApprove',
    component: () => import(/* webpackChunkName: "xwe-credit-2" */ '../page/creditProcess/company/CompanyApprove.vue')
  },

  // 6、银行四要素的录入
  {
    path: '/xwe_bankCard_info_entry',
    name: 'XWEBankCardEntryInfo',
    component: () => import(/* webpackChunkName: "xwe-credit-2" */ '../page/creditProcess/bank/BankCardEntryInfo.vue'),
    meta: {
      skipAuth: true,
      title: '个人信息填写'
    }
  },

  // 7、个人基本信息（居住地址）
  {
    path: '/xwe_base_info',
    name: 'XWEBaseInfo',
    component: () => import(/* webpackChunkName: "xwe-credit-3" */ '../page/creditProcess/self/BaseInfo.vue'),
    meta: {
      title: '基本信息'
    }
  },

  // 8、补存信息
  {
    path: '/xwe_replenish_file_upload',
    name: 'XWEReplenishFIleUpload',
    component: () =>
      import(/* webpackChunkName: "xwe-credit-3" */ '../page/creditProcess/self/replenishFileUpload.vue'),
    meta: {
      title: '补充信息'
    }
  },

  // 9、国税账号密码以及税局采集
  {
    path: '/xwe_tax_info',
    name: 'XWETaxInfo',
    component: () => import(/* webpackChunkName: "xwe-credit-4" */ '../page/creditProcess/taxInfo/TaxInfo.vue')
  },

  // gf微风的税局登录,结果页
  {
    path: '/xwe_tax_wf_res',
    name: 'XWETaxWFResult',
    component: () => import(/* webpackChunkName: "xwe-credit-4" */ '../page/creditProcess/taxInfo/WfTaxLoginRes.vue'),
    meta: {
      title: '税局登录结果'
    }
  },

  // 9、税局跳过  (税局的登录都是通用的)
  {
    path: '/xwe_tax_info_skip',
    name: 'XWETaxInfoSkip',
    component: () => import(/* webpackChunkName: "xwe-credit-4" */ '../page/creditProcess/taxInfo/TaxInfoSkip.vue')
  },

  // 10、申请结果，现在只有从申请记录里面进入
  {
    path: '/xwe_pre_credut_result',
    name: 'XWEPreCredutResutl',
    component: () =>
      import(/* webpackChunkName: "xwe-credit-5" */ '../page/creditProcess/result/XwePreCredutResutl.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 9、申请结果，从进件流程进入
  {
    path: '/xwe_credut_result',
    name: 'XWECredutResult',
    component: () => import(/* webpackChunkName: "xwe-credit-5" */ '../page/creditProcess/result/CredutResult.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 银行卡管理（列表页）
  {
    path: '/xwe_bank_card_mana',
    name: 'XWEBankCardMana',
    component: () => import(/* webpackChunkName: "xwe-bank-1" */ '../page/bank/cardManage/CardManage.vue'),
    meta: {
      title: '银行卡管理'
    }
  },

  //绑定银行卡
  {
    path: '/xwe_bind_bank_card',
    name: 'XWEBindBankCard',
    component: () => import(/* webpackChunkName: "xwe-bank-1" */ '../page/bank/bindCard/BindCard.vue'),
    meta: {
      title: '添加银行卡',
      skipAuth: true
    }
  },

  //绑定银行卡的结果页面
  {
    path: '/xwe_bind_bank_card_result',
    name: 'XWEBindBankCardResult',
    component: () => import(/* webpackChunkName: "xwe-bank-1" */ '../page/bank/bindCard/result/BindCardResult.vue'),
    meta: {
      title: '绑定银行卡结果',
      skipAuth: true
    }
  },

  //开户绑卡
  {
    path: '/xwe_open_bind_bank_card',
    name: 'XWEOpenBindBankCard',
    component: () =>
      import(/* webpackChunkName: "xwe-bank-2" */ '../page/bank/bankAccount/openBindCard/OpenBindCard.vue'),
    meta: {
      title: '开户绑卡',
      skipAuth: true
    }
  },

  //开户结果
  {
    path: '/xwe_open_card_result',
    name: 'XWEOpenCardResult',
    component: () => import(/* webpackChunkName: "xwe-bank-2" */ '../page/bank/bankAccount/result/OpenResult.vue'),
    meta: {
      title: '开户结果',
      skipAuth: true
    }
  },

  /**
   * 当个人有额度额度时候 从立即借款-个人信息填写
   *    1、没有绑定银行卡，就去绑定银行卡
   *    2、绑定之后进行借款
   *    BorrowMoney这个路由下，进行点击立即申请的时候进行处理
   * */

  // ----------------------  借款 ----------------------------------------------------------
  // xwe立即借款--开户绑卡（进行验证）
  {
    path: '/xwe_open_account',
    name: 'XWEOpenAccount',
    component: () =>
      import(/* webpackChunkName: "xwe-bank-2" */ '../page/bank/bankAccount/openAccount/OpenAccount.vue'),
    meta: {
      // title: '开户绑卡'
    }
  },
  // 立即借款--开户人脸识别
  {
    path: '/xwe_open_account_face',
    name: 'XWEOpenAccountFace',
    component: () =>
      import(/* webpackChunkName: "xwe-bank-3" */ '../page/bank/bankAccount/openAccount/OpenAccountFace.vue'),
    meta: {
      title: '活体识别'
    }
  },
  // 银行卡信息 广发一类卡的信息和电子账户的信息
  {
    path: '/xwe_bank_info',
    name: 'XWEBankInfo',
    component: () => import(/* webpackChunkName: "xwe-bank-3" */ '../page/bank/bankInfo/BankInfo.vue'),
    meta: {
      title: '电子户信息确认'
    }
  },

  //信息填写
  {
    path: '/xwe_loans_base_info',
    name: 'XWELoansBaseInfo',
    component: () => import(/* webpackChunkName: "xwe-borrow-1" */ '../page/borrow/baseInfo/Borrow.vue'),
    meta: {
      title: '借款'
    }
  },

  // 人脸识别
  {
    path: '/xwe_borrow_face',
    name: 'XWEBorrowFace',
    component: () => import(/* webpackChunkName: "xwe-borrow-1" */ '../page/borrow/face/BorrowFace.vue'),
    meta: {
      title: '活体识别'
    }
  },

  // 确认借款信息
  {
    path: '/xwe_confirm_loans_info',
    name: 'XWEConfirmLoansInfo',
    component: () => import(/* webpackChunkName: "xwe-borrow-1" */ '../page/borrow/confirmBorrow/ConfirmBorrow.vue'),
    meta: {
      title: '确认借款'
    }
  },
  // 担保信息确认
  {
    path: '/xwe_pay_guarantee_cost',
    name: 'XWEPayGuaranteeCost',
    component: () =>
      import(/* webpackChunkName: "xwe-borrow-2" */ '../page/borrow/payGuaranteeCost/PayGuaranteeCost.vue'),
    meta: {
      title: '担保费确认'
    }
  },
  // 审核结果页面
  {
    path: '/xwe_loans_result',
    name: 'XWELoansResult',
    component: () => import(/* webpackChunkName: "xwe-borrow-2" */ '../page/borrow/result/Result.vue'),
    meta: {
      title: '借款结果'
    }
  },

  // ----------------------  提现  / 充值  ------------------------------

  // 还款账户信息 展示充值  / 提现 / 详细明细按钮
  {
    path: '/xwe_repay_acount',
    name: 'XWERepayAcountInfo',
    component: () => import(/* webpackChunkName: "xwe-repay-1" */ '../page/repay/repayInfo/Info.vue'),
    meta: {
      title: '还款账户信息'
    }
  },

  // 提现明细 / 充值明细的按钮
  {
    path: '/xwe_bank_detail_info',
    name: 'XWEBankAcountDetailInfo',
    component: () => import(/* webpackChunkName: "xwe-repay-1" */ '../page/repay/repayInfo/detailInfo/DetailInfo.vue'),
    meta: {
      title: '还款账户信息'
    }
  },

  // 提现 --------------------------

  {
    path: '/xwe_bank_WithDrawal',
    name: 'XWEBankAcountWithDrawal',
    component: () =>
      import(/* webpackChunkName: "xwe-repay-1" */ '../page/repay/repayInfo/withdrawal/withDrawal/WithDrawal.vue'),
    meta: {
      title: '余额提现'
    }
  },
  // 提现详情
  {
    path: '/xwe_bank_WithDrawal_detail',
    name: 'XWEBankAcountWithDrawalDetail',
    component: () =>
      import(
        /* webpackChunkName: "xwe-repay-2" */ '../page/repay/repayInfo/withdrawal/withDrawalDetail/WithDrawalDetail.vue'
      ),
    meta: {
      title: '提现详情'
    }
  },

  {
    path: '/xwe_bank_withDrawal_detail_list',
    name: 'XWEBankAcountDetailWithDrawalList',
    component: () =>
      import(
        /* webpackChunkName: "xwe-repay-2" */ '../page/repay/repayInfo/withdrawal/withDrawalDetailList/WithDrawalDetailList.vue'
      ),
    meta: {
      title: '提现明细'
    }
  },

  // 充值 -------------------------
  {
    path: '/xwe_bank_Charge',
    name: 'XWEBankAcountCharge',
    component: () => import(/* webpackChunkName: "xwe-repay-2" */ '../page/repay/repayInfo/charge/Charge.vue'),
    meta: {
      title: '电子账户充值'
    }
  },
  // 充值详情
  {
    path: '/xwe_bank_Charge_detail',
    name: 'XWEBankAcountChargeDetail',
    component: () =>
      import(/* webpackChunkName: "xwe-repay-3" */ '../page/repay/repayInfo/charge/chargeDetail/ChargeDetail.vue'),
    meta: {
      title: '充值详情'
    }
  },

  // 充值明细
  {
    path: '/xwe_bank_Charge_detail_list',
    name: 'XWEBankAcountChargeDetailList',
    component: () => import(/* webpackChunkName: "xwe-repay-3" */ '../page/repay/repayInfo/charge/list/DetailList.vue'),
    meta: {
      title: '充值明细'
    }
  },

  // ---------------------------------------------------------------------------     还款        -----------------------------------------------------------------
  // 首页-代还账单
  // 待还账单
  {
    path: '/xwe_bill',
    name: 'XWEBill',
    component: () => import(/* webpackChunkName: "xwe-bill-1" */ '../page/repay/bill/Bill.vue'),
    meta: {
      title: '待还账单'
    }
  },
  // 账单详情
  {
    path: '/xwe_bill_detail',
    name: 'XWEBillDetail',
    component: () => import(/* webpackChunkName: "xwe-bill-1" */ '../page/repay/bill/billDetail/BillDetail.vue'),
    meta: {
      title: '账单详情'
    }
  },
  // 借款详情
  {
    path: '/xwe_loans_detail',
    name: 'XWELoansDetail',
    component: () => import(/* webpackChunkName: "xwe-bill-1" */ '../page/repay/loans/loansDetail/LoansDetail.vue'),
    meta: {
      title: '借款详情'
    }
  },

  // 借款-借款记录
  // 借款记录
  {
    path: '/xwe_loans_record',
    name: 'XWELoansRecord',
    component: () => import(/* webpackChunkName: "xwe-bill-2" */ '../page/repay/loans/result/LoansRecord.vue'),
    meta: {
      title: '借款记录'
    }
  },

  // 借款-还款记录
  // 还款记录
  {
    path: '/xwe_repay_record',
    name: 'XWERepayRecord',
    component: () => import(/* webpackChunkName: "xwe-bill-2" */ '../page/repay/record/result/RepayRecord.vue'),
    meta: {
      title: '还款记录'
    }
  }
  // --------------------------------------------------------------------------------------------------------------------------------------------
];

export default {
  xweRouterMap
};
