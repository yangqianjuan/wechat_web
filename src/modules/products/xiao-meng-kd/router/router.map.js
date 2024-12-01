const xmkdRouterMap = [
  {
    path: '/xmkd_repay_elec_Info',
    name: 'ElecAccountInfo',
    component: () =>
      import(/* webpackChunkName: "xm-repay-1" */ '../page/repay/electronicAccountInfo/ElecAccountInfo.vue'),
    meta: {
      title: '还款账户信息'
    }
  },
  {
    path: '/xmkd_repay_elec_detail_list',
    name: 'WithDrawalDetailList',
    component: () =>
      import(/* webpackChunkName: "xm-repay-1" */ '../page/repay/withDrawalDetailList/WithDrawalDetailList.vue'),
    meta: {
      title: '提现明细'
    }
  },
  {
    path: '/xmkd_repay_elec_withdrawal',
    name: 'WithDrawal',
    component: () => import(/* webpackChunkName: "xm-repay-1" */ '../page/repay/withDrawal/WithDrawal.vue'),
    meta: {
      title: '余额提现'
    }
  },
  {
    path: '/xmkd_repay_elec_withDrawalDetail',
    name: 'WithDrawalDetail',
    component: () => import(/* webpackChunkName: "xm-repay-2" */ '../page/repay/withDrawalDetail/WithDrawalDetail.vue'),
    meta: {
      title: '提现详情'
    }
  },
  // 企业认证(营业执照上传识别)
  {
    path: '/xm_company_approve',
    name: 'XMCompanyApprove',
    component: () =>
      import(
        /* webpackChunkName: "xm-credit-1" */ '@/modules/products/xiao-meng-kd/page/creditProcess/companyApprove/XMCompanyApprove.vue'
      )
  },
  // 预授信结果页
  {
    path: '/xm_front_pre_credit',
    name: 'XMFrontPreCredit',
    component: () =>
      import(
        /* webpackChunkName: "xm-credit-1" */ '@/modules/products/xiao-meng-kd/page/creditProcess/frontPreCredit/FrontPreCredit.vue'
      ),
    meta: {
      title: '申请结果'
    }
  },
  // 税局登录
  {
    path: '/tax_info',
    name: 'TaxInfo',
    component: () =>
      import(
        /* webpackChunkName: "xm-credit-2" */ '@/modules/products/xiao-meng-kd/page/creditProcess/taxInfo/TaxInfo.vue'
      )
  },

  // XM微风的税局登录,结果页 (浦发)
  {
    path: '/tax_wf_res',
    name: 'TaxWFResult',
    component: () =>
      import(
        /* webpackChunkName: "xm-credit-2" */ '@/modules/products/xiao-meng-kd/page/creditProcess/taxInfo/wfTaxLogin/WfTaxLoginRes.vue'
      ),
    meta: {
      title: '税局登录结果'
    }
  },

  // 税局跳过
  {
    path: '/tax_info_skip',
    name: 'TaxInfoSkip',
    component: () =>
      import(
        /* webpackChunkName: "xm-credit-2" */ '@/modules/products/xiao-meng-kd/page/creditProcess/taxInfo/TaxInfoSkip.vue'
      )
  },
  // 基本信息
  {
    path: '/base_info',
    name: 'BaseInfo',
    component: () =>
      import(
        /* webpackChunkName: "xm-credit-1" */ '@/modules/products/xiao-meng-kd/page/creditProcess/baseInfo/BaseInfo.vue'
      ),
    meta: {
      title: '基本信息'
    }
  },
  // 已签订的合同的浏览（担保费合同）
  {
    path: '/xm_browse_contract',
    name: 'XMBrowseContract',
    component: () =>
      import(/* webpackChunkName: "xm-credit-1" */ '@/modules/products/xiao-meng-kd/page/loans/BrowseContract.vue'),
    meta: {
      title: '合同预览'
    }
  },

  // 进件补充信息
  {
    path: '/xm_common_info',
    name: 'XMCommonInfo',
    component: () =>
      import(
        /* webpackChunkName: "xm-credit-1" */ '@/modules/products/xiao-meng-kd/page/creditProcess/InfoCollect/InformationCollection.vue'
      ),
    meta: {
      title: '联系人信息采集'
    }
  }
];

export default {
  xmkdRouterMap
};
