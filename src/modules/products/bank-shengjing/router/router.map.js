const beijingRouterMap = [
  // ----------------------------------------------------------------------------  授信流程  ----------------------------------------------------------------

  // 产品详情   creditProcess 授信
  {
    path: '/prod_sj',
    name: 'SJProDetail',
    component: () =>
      import(/* webpackChunkName: "bjb-credit-1" */ '../page/creditProcess/product/ProductionDetail.vue'),
    meta: {
      skipAuth: true,
      title: '产品详情'
    }
  },

  // 上传身份证
  {
    path: '/sj_upload_idcard',
    name: 'SJUploadIdcard',
    component: () =>
      import(/* webpackChunkName: "bjb-credit-1" */ '../page/creditProcess/uploadIdCard/UploadIdCard.vue'),
    meta: {
      skipAuth: true,
      title: '信息认证'
    }
  },

  // 4、活体识别（人脸识别）
  {
    path: '/sj_face_pp',
    name: 'SJFace_pp',
    component: () => import(/* webpackChunkName: "bjb-credit-2" */ '../page/creditProcess/face/FacePP.vue'),
    meta: {
      skipAuth: true,
      title: '人脸识别'
    }
  },

  // 5、企业认证(营业执照上传识别)
  {
    path: '/sj_company_approve',
    name: 'SJCompanyApprove',
    component: () => import(/* webpackChunkName: "bjb-credit-2" */ '../page/creditProcess/company/CompanyApprove.vue'),
    meta: {
      title: '营业执照'
    }
  },

  // 7、个人基本信息（居住地址）
  // {
  //   path: '/sj_base_info',
  //   name: 'SJBaseInfo',
  //   component: () => import(/* webpackChunkName: "bjb-credit-3" */ '../page/creditProcess/self/BaseInfo.vue'),
  //   meta: {
  //     title: '基本信息'
  //   }
  // },

  // 资料补充
  {
    path: '/sj_base_info',
    name: 'SJBaseInfo',
    component: () =>
      import(/* webpackChunkName: "bjb-credit-3" */ '../page/creditProcess/InfoCollect/InformationCollection.vue'),
    meta: {
      title: '资料补充'
    }
  },

  // 9、国税账号密码以及税局采集
  {
    path: '/sj_tax_info',
    name: 'SJTaxInfo',
    component: () => import(/* webpackChunkName: "bjb-credit-4" */ '../page/creditProcess/taxInfo/TaxInfo.vue')
  },

  // 10、申请结果，现在只有从申请记录里面进入  Credit result
  {
    path: '/sj_pre_credit_result',
    name: 'SJPreCreditResult',
    component: () =>
      import(/* webpackChunkName: "bjb-credit-5" */ '../page/creditProcess/result/BjbPreCreditResult.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 9、申请结果，从进件流程进入
  {
    path: '/sj_credit_result',
    name: 'SJCreditResult',
    component: () => import(/* webpackChunkName: "bjb-credit-5" */ '../page/creditProcess/result/CreditResult.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 授信区域拒绝
  {
    path: '/credit_area_reject',
    name: 'SJCreditAreaReject',
    component: () => import(/* webpackChunkName: "bjb-credit-5" */ '../page/creditProcess/result/CreditAreaReject.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 申请记录
  {
    path: '/sj_apply_record',
    name: 'SJApplyRecord',
    component: () => import(/* webpackChunkName: "bjb-result-5" */ '../page/result/BJBApplyRecord.vue'),
    meta: {
      title: '申请记录'
    }
  },

  // ----------------------------------------------------------------------------  借款流程  ----------------------------------------------------------------

  // 借款首页
  {
    path: '/sj_loans_home',
    name: 'SJLoansHome',
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
    path: '/sj_loans_base_info',
    name: 'SJLoansBaseInfo',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/baseInfo/Borrow.vue'),
    meta: {
      title: '借款信息'
    }
  },

  // 人脸识别
  {
    path: '/sj_borrow_face',
    name: 'SJBorrowFace',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/face/BorrowFace.vue'),
    meta: {
      title: '活体识别'
    }
  },

  // 确认借款
  {
    path: '/sj_confirm_loan',
    name: 'SJConfirmLoan',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/confirmLoan/ConfirmLoan.vue'),
    meta: {
      title: '借款信息确认'
    }
  },

  // 借款还款计划
  {
    path: '/sj_repay_plan',
    name: 'SJRepayPlan',
    component: () => import(/* webpackChunkName: "bjb-borrow-1" */ '../page/borrow/repayment/Schedule.vue'),
    meta: {
      title: '还款计划'
    }
  },

  // 审核结果页面
  {
    path: '/sj_loans_result',
    name: 'SJLoansResult',
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
    name: 'SJRepaymentInform',
    component: () =>
      import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/repaymentInform/RepaymentInform.vue'),
    meta: {
      title: '还款账户信息'
    }
  },
  //还款账单
  {
    path: '/repayment_bill',
    name: 'SJRepaymentBill',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/repaymentBill/RepaymentBill.vue'),
    meta: {
      title: '还款账单'
    }
  },
  // 账单详情
  {
    path: '/bill_details',
    name: 'SJBillDetails',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/billDetails/BillDetails.vue'),
    meta: {
      title: '账单详情'
    }
  },
  //借款记录
  {
    path: '/borrow_records',
    name: 'SJBorrowRecords',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/borrowRecords/BorrowRecords.vue'),
    meta: {
      title: '借款记录'
    }
  },
  // 借款详情
  {
    path: '/loan_details',
    name: 'SJLoanDetails',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/loanDetails/LoanDetails.vue'),
    meta: {
      title: '借款详情'
    }
  },
  // 还款记录
  {
    path: '/payment_history',
    name: 'SJPaymentHistory',
    component: () =>
      import(/* webpackChunkName: "bjb-info-1" */ '../page/infoModules/paymentHistory/PaymentHistory.vue'),
    meta: {
      title: '还款记录'
    }
  },
  // 还款详情
  {
    path: '/repayment_details',
    name: 'SJRepaymentDetails',
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
    name: 'SJSearchHome',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/searchProduct/SearchHome.vue'),
    meta: {
      title: '产品查询',
      skipAuth: true
    }
  },
  //产品查询详情页
  {
    path: '/searchDetail',
    name: 'SJSearchDetail',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/searchProduct/SearchDetail.vue'),
    meta: {
      title: '查询详情',
      skipAuth: true
    }
  },

  //空白页
  {
    path: '/sj_bank',
    name: 'SJBank',
    component: () => import(/* webpackChunkName: "bjb-info-1" */ '../page/Bank.vue'),
    meta: {
      title: '敬请期待',
      skipAuth: true
    }
  }
];

export default {
  beijingRouterMap
};
