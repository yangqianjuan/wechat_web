const beijingRouterMap = [
  // ----------------------------------------------------------------------------  授信流程  ----------------------------------------------------------------

  // 产品详情   creditProcess 授信
  {
    path: '/prod_bjb',
    name: 'BJBProDetail',
    component: () =>
      import(/* webpackChunkName: "bjb-credit-1" */ '../page/creditProcess/product/ProductionDetail.vue'),
    meta: {
      skipAuth: true,
      title: '产品详情'
    }
  },

  // 上传身份证
  {
    path: '/bjb_upload_idcard',
    name: 'BJBUploadIdcard',
    component: () =>
      import(/* webpackChunkName: "bjb-credit-1" */ '../page/creditProcess/uploadIdCard/UploadIdCard.vue'),
    meta: {
      title: '信息认证'
    }
  },

  // 4、活体识别（人脸识别）
  {
    path: '/bjb_face_pp',
    name: 'BJBFace_pp',
    component: () => import(/* webpackChunkName: "bjb-credit-2" */ '../page/creditProcess/face/FacePP.vue'),
    meta: {
      title: '人脸识别'
    }
  },

  // 5、企业认证(营业执照上传识别)
  {
    path: '/bjb_company_approve',
    name: 'BJBCompanyApprove',
    component: () => import(/* webpackChunkName: "bjb-credit-2" */ '../page/creditProcess/company/CompanyApprove.vue'),
    meta: {
      title: '营业执照'
    }
  },

  // 7、个人基本信息（居住地址）
  // {
  //   path: '/bjb_base_info',
  //   name: 'BJBBaseInfo',
  //   component: () => import(/* webpackChunkName: "bjb-credit-3" */ '../page/creditProcess/self/BaseInfo.vue'),
  //   meta: {
  //     title: '基本信息'
  //   }
  // },

  // 资料补充
  {
    path: '/bjb_base_info',
    name: 'BJBBaseInfo',
    component: () =>
      import(/* webpackChunkName: "bjb-credit-3" */ '../page/creditProcess/InfoCollect/InformationCollection.vue'),
    meta: {
      title: '资料补充'
    }
  },

  // 9、国税账号密码以及税局采集
  {
    path: '/bjb_tax_info',
    name: 'BJBTaxInfo',
    component: () => import(/* webpackChunkName: "bjb-credit-4" */ '../page/creditProcess/taxInfo/TaxInfo.vue')
  },

  // 10、申请结果，现在只有从申请记录里面进入  Credit result
  {
    path: '/bjb_pre_credit_result',
    name: 'BJBPreCreditResult',
    component: () =>
      import(/* webpackChunkName: "bjb-credit-5" */ '../page/creditProcess/result/BjbPreCreditResult.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 9、申请结果，从进件流程进入
  {
    path: '/bjb_credit_result',
    name: 'BJBCreditResult',
    component: () => import(/* webpackChunkName: "bjb-credit-5" */ '../page/creditProcess/result/CreditResult.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 授信区域拒绝
  {
    path: '/credit_area_reject',
    name: 'BJBCreditAreaReject',
    component: () => import(/* webpackChunkName: "bjb-credit-5" */ '../page/creditProcess/result/CreditAreaReject.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 申请记录
  {
    path: '/bjb_apply_record',
    name: 'BJBApplyRecord',
    component: () => import(/* webpackChunkName: "bjb-result-5" */ '../page/result/BJBApplyRecord.vue'),
    meta: {
      title: '申请记录'
    }
  },

  // ----------------------------------------------------------------------------  借款流程  ----------------------------------------------------------------

  // 借款首页
  {
    path: '/bjb_loans_home',
    name: 'BJBLoansHome',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/home/BeijingHome.vue'),
    meta: {
      title: '借款额度',
      skipAuth: false,
      isTab: true
      // keepAlive: true
    }
  },

  // 基本信息填写
  {
    path: '/bjb_loans_base_info',
    name: 'BJBLoansBaseInfo',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/baseInfo/Borrow.vue'),
    meta: {
      title: '借款信息'
    }
  },

  // 人脸识别
  {
    path: '/bjb_borrow_face',
    name: 'BJBBorrowFace',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/face/BorrowFace.vue'),
    meta: {
      title: '活体识别'
    }
  },

  // 确认借款
  {
    path: '/bjb_confirm_loan',
    name: 'BJBConfirmLoan',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/confirmLoan/ConfirmLoan.vue'),
    meta: {
      title: '借款信息确认'
    }
  },

  // 借款还款计划
  {
    path: '/bjb_repay_plan',
    name: 'BJBRepayPlan',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/repayment/Schedule.vue'),
    meta: {
      title: '还款计划'
    }
  },

  // 审核结果页面
  {
    path: '/bjb_loans_result',
    name: 'BJBLoansResult',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/result/Result.vue'),
    meta: {
      title: '借款结果'
    }
  },

  /**
   *还款信息
   */
  // 还款账户信息
  {
    path: '/repayment_inform',
    name: 'BJBRepaymentInform',
    component: () =>
      import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/repaymentInform/RepaymentInform.vue'),
    meta: {
      title: '还款账户信息'
    }
  },
  //还款账单
  {
    path: '/repayment_bill',
    name: 'BJBRepaymentBill',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/repaymentBill/RepaymentBill.vue'),
    meta: {
      title: '还款账单'
    }
  },
  // 账单详情
  {
    path: '/bill_details',
    name: 'BJBBillDetails',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/billDetails/BillDetails.vue'),
    meta: {
      title: '账单详情'
    }
  },
  //借款记录
  {
    path: '/borrow_records',
    name: 'BJBBorrowRecords',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/borrowRecords/BorrowRecords.vue'),
    meta: {
      title: '借款记录'
    }
  },
  // 借款详情
  {
    path: '/loan_details',
    name: 'BJBLoanDetails',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/loanDetails/LoanDetails.vue'),
    meta: {
      title: '借款详情'
    }
  },
  // 还款记录
  {
    path: '/payment_history',
    name: 'BJBPaymentHistory',
    component: () =>
      import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/paymentHistory/PaymentHistory.vue'),
    meta: {
      title: '还款记录'
    }
  },
  // 还款详情
  {
    path: '/repayment_details',
    name: 'BJBRepaymentDetails',
    component: () =>
      import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/repaymentDetails/RepaymentDetails.vue'),
    meta: {
      title: '还款详情'
    }
  },
  // ---------------------------------------------------------------产品进件查询------------------------------------------------------------------
  // 产品查询
  {
    path: '/searchHome',
    name: 'BJBSearchHome',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/searchProduct/SearchHome.vue'),
    meta: {
      title: '产品查询',
      skipAuth: true
    }
  },
  //产品查询详情页
  {
    path: '/searchDetail',
    name: 'BJBSearchDetail',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/searchProduct/SearchDetail.vue'),
    meta: {
      title: '查询详情',
      skipAuth: true
    }
  }
];

export default {
  beijingRouterMap
};
