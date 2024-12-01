const routes = [
  // 首页
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "common-borrow-1" */ '@/views/home/BorrowMoney.vue'),
    meta: {
      skipAuth: false,
      isTab: true,
      keepAlive: true,
      title: '首页'
    }
  },
  {
    path: '/borrow_money',
    name: 'BorrowMoney',
    component: () => import(/* webpackChunkName: "common-borrow-1" */ '@/views/home/BorrowMoney.vue'),
    meta: {
      skipAuth: false,
      isTab: true,
      keepAlive: true,
      title: ''
    }
  },
  // 我的
  {
    path: '/psersonal',
    name: 'Psersonal',
    component: () => import(/* webpackChunkName: "common-user-1" */ '@/views/User/Psersonal.vue'),
    meta: {
      isTab: true,
      skipAuth: true,
      title: '我的'
    }
  },
  // 用户设置
  {
    path: '/user_setting',
    name: 'UserSetting',
    component: () => import(/* webpackChunkName: "common-user-2" */ '@/views/User/UserSetting.vue'),
    meta: {
      skipAuth: true,
      title: '账户设置'
    }
  },
  // 废弃
  {
    path: '/rebind_wx',
    name: 'RebindWx',
    component: () => import(/* webpackChunkName: "common-user-3" */ '@/views/User/RebindWx.vue'),
    meta: {
      skipAuth: true,
      title: '账户设置'
    }
  },
  // 还款账户信息
  {
    path: '/repay_acount',
    name: 'RepayAcount',
    component: () => import(/* webpackChunkName: "common-repay-1" */ '@/modules/common/Bank/RepayAcount.vue'),
    meta: {
      title: '还款账户信息'
    }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import(/* webpackChunkName: "common-borrow-2" */ '@/views/User/Auth.vue'),
    meta: {
      skipAuth: true
    }
  },
  {
    path: '/login_by_verify',
    name: 'loginByVerify',
    component: () => import(/* webpackChunkName: "common-login-1" */ '@/views/login/Login.vue'),
    meta: {
      title: '登录',
      skipAuth: true
    }
  },
  // 第三方通用登录
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "common-login-1" */ '@/views/login/CommonLogin.vue'),
    meta: {
      title: '',
      skipAuth: true
    }
  },
  // 产品详情
  {
    path: '/prod_xmkd',
    name: 'ProductionDetail',
    component: () =>
      import(
        /* webpackChunkName: "common-credit-1" */ '@/modules/products/xiao-meng-kd/page/creditProcess/productionDetail/ProductionDetail.vue'
      ),
    meta: {
      skipAuth: true,
      title: '产品详情'
    }
  },
  // 上传身份证（个人信息）
  {
    path: '/upload_idcard',
    name: 'uploadIdcard',
    component: () => import(/* webpackChunkName: "common-credit-1" */ '@/modules/common/UploadIdcard.vue'),
    meta: {
      title: '上传身份证照片'
    }
  },
  // 三要素验证
  {
    path: '/idno_name_phone_verify',
    name: 'IdnoNamePhoneVerify',
    component: () => import(/* webpackChunkName: "common-credit-2" */ '@/modules/common/IdnoNamePhoneVerify.vue'),
    meta: {
      title: '绑定手机号'
    }
  },
  // 活体识别（人脸识别）
  {
    path: '/face_pp',
    name: 'face_pp',
    component: () => import(/* webpackChunkName: "common-credit-2" */ '@/modules/common/FacePP.vue'),
    meta: {
      title: '活体识别'
    }
  },
  // 企业认证(营业执照上传识别)
  {
    path: '/company_approve',
    name: 'CompanyApprove',
    component: () => import(/* webpackChunkName: "common-credit-3" */ '@/modules/common/CompanyApprove.vue')
  },

  // 补充信息
  {
    path: '/replenish_file_upload',
    name: 'replenishFIleUpload',
    component: () =>
      import(
        /* webpackChunkName: "common-credit-3" */ '@/modules/products/xiao-meng-kd/page/loans/replenishFileUpload.vue'
      ),
    meta: {
      title: '补充信息'
    }
  },
  // 申请结果，现在只有从申请记录里面进入
  {
    path: '/pre_credut_resutl',
    name: 'PreCredutResutl',
    component: () => import(/* webpackChunkName: "common-credit-4" */ '@/views/CredutResult/PreCredutResutl.vue'),
    meta: {
      title: '申请结果'
    }
  },

  // 申请结果，从进件流程进入
  {
    path: '/credut_result',
    name: 'CredutResult',
    component: () => import(/* webpackChunkName: "common-credit-4" */ '@/views/CredutResult/CredutResult.vue'),
    meta: {
      title: '申请结果'
    }
  },
  // 借款个人信息填写
  {
    path: '/loans_base_info',
    name: 'LoansBaseInfo',
    component: () =>
      import(/* webpackChunkName: "common-loans-1" */ '@/modules/products/xiao-meng-kd/page/loans/LoansBaseInfo.vue'),
    meta: {
      title: '借款'
    }
  },
  //绑定银行卡
  {
    path: '/bind_bank_card',
    name: 'BindBankCard',
    component: () => import(/* webpackChunkName: "common-bank-1" */ '@/modules/common/Bank/BindBankCard.vue'),
    meta: {
      title: '绑定银行储蓄卡',
      skipAuth: true
    }
  },

  /**
   * 浦发新开户
   * */
  {
    path: '/xm_bc_entry',
    name: 'XMBindBankCardEntry',
    component: () =>
      import(
        /* webpackChunkName: "common-bank-1" */ '@/modules/products/xiao-meng-kd/page/bank/pfBindCard/PFPreBankCard.vue'
      ),
    meta: {
      title: '绑定银行储蓄卡',
      skipAuth: true
    }
  },
  // xm 新绑卡页面 -- 实体卡
  {
    path: '/xm_bc',
    name: 'XMBindBankCard',
    component: () =>
      import(
        /* webpackChunkName: "common-bank-2" */ '@/modules/products/xiao-meng-kd/page/bank/pfBindCard/PFBindBankCard.vue'
      ),
    meta: {
      title: '绑定银行储蓄卡',
      skipAuth: true
    }
  },

  // xm 新绑卡页面 -- 实体卡（非浦发）-- > 电子户信息确认
  {
    path: '/xm_bc_ce',
    name: 'XMBankCardCEA',
    component: () =>
      import(
        /* webpackChunkName: "common-bank-2" */ '@/modules/products/xiao-meng-kd/page/bank/pfBindCard/EAVerifyPhone.vue'
      ),
    meta: {
      title: '填写验证码',
      skipAuth: true
    }
  },

  // xm 新绑卡页面 -- 电子户
  {
    path: '/xm_ebc',
    name: 'XMBindEABankCard',
    component: () =>
      import(
        /* webpackChunkName: "common-bank-3" */ '@/modules/products/xiao-meng-kd/page/bank/pfBindCard/PFBindBankCardEA.vue'
      ),
    meta: {
      title: '银行卡信息确认',
      skipAuth: true
    }
  },

  // 电子账户开通验证码验证
  {
    path: '/verify_phone',
    name: 'LoansVerifyPhone',
    component: () => import(/* webpackChunkName: "common-bank-3" */ '@/modules/common/Bank/LoansVerifyPhone.vue'),
    meta: {
      title: '填写验证码'
    }
  },
  // 银行卡管理（列表页）
  {
    path: '/bank_card_mana',
    name: 'BankCardMana',
    component: () => import(/* webpackChunkName: "common-loans-1" */ '@/modules/common/Bank/BankCardMana.vue'),
    meta: {
      title: '银行卡管理'
    }
  },
  // 添加银行卡
  {
    path: '/add_bank_card',
    name: 'AddBankCardBind',
    component: () => import(/* webpackChunkName: "common-loans-2" */ '@/modules/common/Bank/AddBankCardBind.vue'),
    meta: {
      title: '添加银行卡'
    }
  },
  // 确认借款信息
  {
    path: '/confirm_loans_info',
    name: 'ConfirmLoansInfo',
    component: () =>
      import(
        /* webpackChunkName: "common-loans-2" */ '@/modules/products/xiao-meng-kd/page/loans/ConfirmLoansInfo.vue'
      ),
    meta: {
      title: '确认借款'
    }
  },
  // 确认借款信息
  {
    path: '/pay_guarantee_cost',
    name: 'PayGuaranteeCost',
    component: () =>
      import(
        /* webpackChunkName: "common-loans-3" */ '@/modules/products/xiao-meng-kd/page/loans/PayGuaranteeCost.vue'
      ),
    meta: {
      title: '担保费确认'
    }
  },
  // 借款结果
  {
    path: '/loans_result',
    name: 'LoansResult',
    component: () =>
      import(/* webpackChunkName: "common-loans-3" */ '@/modules/products/xiao-meng-kd/page/loans/LoansResult.vue'),
    meta: {
      title: '借款结果'
    }
  },
  // 借款记录
  {
    path: '/loans_record',
    name: 'LoansRecord',
    component: () => import(/* webpackChunkName: "common-loans-4" */ '@/modules/common/Bill/LoansRecord.vue'),
    meta: {
      title: '借款记录'
    }
  },
  // 待还账单
  {
    path: '/bill',
    name: 'Bill',
    component: () => import(/* webpackChunkName: "common-bill-1" */ '@/modules/common/Bill/Bill.vue'),
    meta: {
      title: '待还账单'
    }
  },
  {
    path: '/bill_detail',
    name: 'BillDetail',
    component: () => import(/* webpackChunkName: "common-bill-1" */ '@/modules/common/Bill/BillDetail.vue'),
    meta: {
      title: '账单详情'
    }
  },
  // 还款记录
  {
    path: '/repay_record',
    name: 'RepayRecord',
    component: () => import(/* webpackChunkName: "common-bill-2" */ '@/modules/common/Bill/RepayRecord.vue'),
    meta: {
      title: '还款记录'
    }
  },
  // 借款详情
  {
    path: '/loans_detail',
    name: 'LoansDetail',
    component: () => import(/* webpackChunkName: "common-bill-2" */ '@/modules/common/Bill/LoansDetail.vue'),
    meta: {
      title: '借款详情'
    }
  },
  // 申请记录
  {
    path: '/apply_record',
    name: 'ApplyRecord',
    component: () => import(/* webpackChunkName: "common-1" */ '@/views/ApplyRecord/ApplyRecord.vue'),
    meta: {
      title: '申请记录'
    }
  },

  // 其他代理产品的四要素 (小萌) -- 完整
  {
    path: '/prod_fsd',
    name: 'PorductFSD',
    component: () => import(/* webpackChunkName: "common-1" */ '@/views/Product/PorductFSD.vue'),
    meta: {
      skipAuth: true
    }
  },
  // 其他代理产品的四要素 (小萌) -- 完整 -- 去掉公司名称
  {
    path: '/prod_cfsd',
    name: 'PorductCFSD',
    component: () => import(/* webpackChunkName: "common-1" */ '@/views/Product/PorductCFSD.vue'),
    meta: {
      skipAuth: true
    }
  },

  // saas 代理产品的四要素 -- 完整
  {
    path: '/prods_fsd',
    name: 'PorductSFSD',
    component: () => import(/* webpackChunkName: "common-1" */ '@/views/Product/PorductsFSD.vue'),
    meta: {
      skipAuth: true
    }
  },

  // saas 代理产品的四要素 -- 完整 -- 去掉公司名称
  {
    path: '/prods_cfsd',
    name: 'PorductSCFSD',
    component: () => import(/* webpackChunkName: "common-1" */ '@/views/Product/PorductsCFSD.vue'),
    meta: {
      skipAuth: true
    }
  },

  // Error
  {
    path: '/error',
    name: 'error',
    component: () => import(/* webpackChunkName: "common-2" */ '@/modules/common/Bill/Error.vue'),
    meta: {
      title: '错误'
    }
  },

  // 非 saas 的产品列表
  {
    path: '/prod_list',
    name: 'ProductList',
    component: () => import(/* webpackChunkName: "common-borrow-1" */ '@/views/open/ProductList.vue'),
    meta: {
      skipAuth: true
    }
  }
];

export default {
  routes
};
