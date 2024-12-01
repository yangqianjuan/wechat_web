const mydRouterMap = [
  {
    path: '/prod_myd',
    name: 'MYDProDetail',
    component: () => import(/* webpackChunkName: "myd-credit-1" */ '../page/creditProcess/MYDProductionDetail.vue'),
    meta: {
      title: '产品详情'
    }
  },
  {
    path: '/myd_upload_idcard',
    name: 'MYDUploadCard',
    component: () => import(/* webpackChunkName: "myd-credit-1" */ '../page/creditProcess/MYDUploadIdcard.vue'),
    meta: {
      title: '上传身份证照片'
    }
  },
  {
    path: '/myd_idno_name_phone_verify',
    name: 'MYDIdnoNamePhoneVerify',
    component: () => import(/* webpackChunkName: "myd-credit-1" */ '../page/creditProcess/MYDIdnoNamePhoneVerify.vue'),
    meta: {
      title: '绑定手机号'
    }
  },
  {
    path: '/myd_face_pp',
    name: 'MYDFace_pp',
    component: () => import(/* webpackChunkName: "myd-credit-1" */ '../page/creditProcess/MYDFacePP.vue'),
    meta: {
      title: '人脸识别'
    }
  },
  {
    path: '/myd_company_approve',
    name: 'MYDCompanyApprove',
    component: () => import(/* webpackChunkName: "myd-credit-2" */ '../page/creditProcess/MYDCompanyApprove.vue'),
    meta: {
      title: '企业认证'
    }
  },
  {
    path: '/myd_base_info',
    name: 'MYDBaseInfo',
    component: () => import(/* webpackChunkName: "myd-credit-2" */ '../page/creditProcess/MYDBaseInfo.vue'),
    meta: {
      title: '基本信息'
    }
  },
  // 补充信息
  {
    path: '/myd_replenish_file_upload',
    name: 'MYDReplenishFIleUpload',
    component: () => import(/* webpackChunkName: "myd-credit-2" */ '../page/creditProcess/MYDReplenishFileUpload.vue'),
    meta: {
      title: '补充信息'
    }
  },

  // 申请结果，从进件流程进入
  {
    path: '/myd_credit_result',
    name: 'MYDCreditResult',
    component: () => import(/* webpackChunkName: "myd-credit-3" */ '../page/creditProcess/MYDCredutResult.vue'),
    meta: {
      title: '申请结果'
    }
  },
  // 申请记录
  {
    path: '/myd_apply_record',
    name: 'MYDApplyRecord',
    component: () => import(/* webpackChunkName: "myd-result-3" */ '../page/result/MYDApplyRecord.vue'),
    meta: {
      title: '申请记录'
    }
  },
  // 税局登录
  {
    path: '/myd_tax_info',
    name: 'MYDTaxInfo',
    component: () => import(/* webpackChunkName: "myd-credit-4" */ '../page/creditProcess/taxInfo/TaxInfo.vue'),
    meta: {
      title: '税务采集'
    }
  },
  // 三湘微风的税局登录,结果页 (浦发)
  {
    path: '/myd_tax_wf_res',
    name: 'MYDTaxWFResult',
    component: () =>
      import(/* webpackChunkName: "myd-credit-4" */ '../page/creditProcess/taxInfo/wfTaxLogin/WfTaxLoginRes.vue'),
    meta: {
      title: '税局登录结果'
    }
  },
  // 税局跳过
  {
    path: '/myd_tax_info_skip',
    name: 'MYDTaxInfoSkip',
    component: () => import(/* webpackChunkName: "myd-credit-4" */ '../page/creditProcess/taxInfo/TaxInfoSkip.vue')
  },
  // 申请记录/额度显示
  {
    path: '/myd_apply_home',
    name: 'MYDApplyHome',
    component: () => import(/* webpackChunkName: "myd-credit-5" */ '../page/home/MYDApplyResult.vue'),
    meta: {
      title: ''
    }
  }
];

export default {
  mydRouterMap
};
