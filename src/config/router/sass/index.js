const routes = [
  // saas中关村 信息补充
  {
    path: '/sass_replenish',
    name: 'sass_replenish',
    component: () => import(/* webpackChunkName: "saas-1" */ '@/modules/products/saas/page/SassReplenish.vue'),
    meta: {
      title: '信息补充'
    }
  },
  // saas中关村
  {
    path: '/sass_replenish_id_card',
    name: 'sass_replenish_id_card',
    component: () => import(/* webpackChunkName: "saas-1" */ '@/modules/products/saas/page/SassReplenishIdCrad.vue'),
    meta: {
      title: '信息补充'
    }
  },
  // sass进件信息填写的入口
  {
    path: '/prod_sass',
    name: 'prod_sass',
    component: () => import(/* webpackChunkName: "saas-2" */ '@/modules/products/saas/page/SassProdcutDeatil.vue'),
    meta: {
      skipAuth: true,
      title: '产品详情'
    }
  },
  // saas中关村 合同上传
  {
    path: '/sass_contract_upload',
    name: 'sass_contract_upload',
    component: () => import(/* webpackChunkName: "saas-2" */ '@/modules/products/saas/page/SassContractUpload.vue'),
    meta: {
      title: '合同上传'
    }
  },
  // saas中关村 合同审核结果
  {
    path: '/sass_contract_result',
    name: 'sass_contract_result',
    component: () => import(/* webpackChunkName: "saas-3" */ '@/modules/products/saas/page/SassContractResult.vue'),
    meta: {
      title: '合同审核结果'
    }
  },
  // saas中关村 绑定银行卡
  {
    path: '/sass_bind_card',
    name: 'sass_bind_card',
    component: () => import(/* webpackChunkName: "saas-3" */ '@/modules/products/saas/page/SassBindBankCard.vue'),
    meta: {
      title: '绑定银行储蓄卡'
    }
  },
  // saas中关村 申请结果查询
  {
    path: '/sass_credit_result',
    name: 'sass_credit_result',
    component: () => import(/* webpackChunkName: "saas-4" */ '@/modules/products/saas/page/SassCreditResut.vue'),
    meta: {
      title: '申请结果'
    }
  },
  // saas中关村 跳转签署销售合同
  {
    path: '/sign_sass_contract',
    name: 'sign_sass_contract',
    component: () => import(/* webpackChunkName: "saas-4" */ '@/modules/products/saas/page/SingSassContract.vue'),
    meta: {
      // SaaS销售合同
      title: '合同预览'
    }
  },
  // saas中关村 预付款
  {
    path: '/advance_payment',
    name: 'advance_payment',
    component: () => import(/* webpackChunkName: "sass-loans-1" */ '@/modules/products/saas/page/AdvancePayment.vue'),
    meta: {
      title: '预付款'
    }
  },
  // sass中关村 借款基础信息填写
  {
    path: '/sass_loans_baseinfo',
    name: 'sass_loans_baseinfo',
    component: () =>
      import(/* webpackChunkName: "sass-loans-1" */ '@/modules/products/saas/page/SassLoansBaseInfo.vue'),
    meta: {
      title: '借款'
    }
  },
  // saas中关村上传转账凭证
  {
    path: '/sass_transer_voucher',
    name: 'sass_transer_voucher',
    component: () =>
      import(/* webpackChunkName: "sass-loans-2" */ '@/modules/products/saas/page/UploadTransferVoucher.vue'),
    meta: {
      title: '转账凭证'
    }
  },
  //saas中关村 账单详情
  {
    path: '/sass_bill_detail',
    name: 'sass_bill_detail',
    component: () => import(/* webpackChunkName: "sass-loans-2" */ '@/modules/products/saas/page/SassBillDetail.vue'),
    meta: {
      title: '账单详情'
    }
  },
  // saas中关村 借款结果
  {
    path: '/saas_loans_result',
    name: 'saas_loans_result',
    component: () => import(/* webpackChunkName: "sass-loans-2" */ '@/modules/products/saas/page/SaasLoansResult.vue'),
    meta: {
      title: '借款结果'
    }
  }
];

export default {
  routes
};
