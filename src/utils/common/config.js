// 环境
export const ENV = {
  development: 'development'
};

// cookie中存取
export const COOKIE_ID = {
  // token
  jwtToken: 'wecaheat_xm_token',
  refreshToken: 'refresh_wecaheat_xm_token',
  // 用户id
  userId: 'wecaheat_xm_userid',
  // 授信的人脸识别路径获取的token
  bizToken: 'tencent_biz_token',
  // 申请标识
  applyUnionKey: 'union_key',
  // 机构号
  instNo: 'inst_no'
};

// sessionstorage中存取的字段
export const SESSION_ID = {
  unionKey: 'union_key',

  // 广发的会话id，
  // 授信
  creditSessionId: 'credit_session_id',
  // 开户
  openSessionId: 'open_session_id',
  // 还款
  repaySessionId: 'repay_session_id',
  // 提款
  withdrawSessionId: 'withdraw_session_id',
  // 换卡
  changeCardSessionId: 'change_card_session_id',

  // 腾讯人脸识别的token 和 url

  // 授信的人脸识别路径
  bizUrl: 'tencent_biz_url',

  // 开户人脸识别路径获取token
  openACBizToken: 'tencent_open_acc_biz_token',
  // 开户人脸识别路径
  openACBizUrl: 'tencent_open_acc_biz_url',

  // 还款人脸识别路径获取token
  repayBizToken: 'tencent_repay_biz_token',
  // 还款人脸识别路径
  repayBizUrl: 'tencent_repay_biz_url',

  // 提款人脸识别路径获取token
  withdrawBizToken: 'tencent_withdraw_biz_token',
  // 提款人脸识别路径
  withdrawBizUrl: 'tencent_withdraw_biz_url'
};
export const HOME_TABS = [
  {
    desc: '借款',
    selectIcon: require('../../assets/imgs/icon/ic_brow_selected.png'),
    unSelectIcon: require('../../assets/imgs/icon/ic_brow_unselected.png'),
    targetPath: '/'
  },
  {
    desc: '我的',
    selectIcon: require('../../assets/imgs/icon/ic_personal_selected.png'),
    unSelectIcon: require('../../assets/imgs/icon/ic_personal_unselected.png'),
    targetPath: '/psersonal'
  }
];

export const PROTOCOL_ARR = [
  { code: '00', name: '个人信息查询和使用授权书' },
  { code: '01', name: '个人信息查询和提供在线授权书' },
  { code: '02', name: '还款账户变更和授信期限变更协议' },
  { code: '03', name: '授信合同' },
  { code: '04', name: '数据使用授权书' },
  { code: '05', name: '微萌助手平台用户注册协议' },
  { code: '06', name: '微萌助手隐私政策' },
  { code: '07', name: '互联网个人经营性贷款借款合同' },
  { code: '08', name: '用途申明书' },
  { code: '09', name: '征信授权协议' }
];

export const APPROVE_CODE = {
  APPLYING: '审核中',
  FAIL: '审核拒绝',
  PASS: '审核通过',
  // 授信职业信息失败
  JOB_FAIL: '授信失败'
};

export const APPROVE_ICON = {
  APPLYING: require('@/assets/imgs/icon/ic_cre_ing.png'),
  FAIL: require('@/assets/imgs/icon/ic_cre_fail.png'),
  PASS: require('@/assets/imgs/icon/ic_result.png'),
  // 授信职业信息失败
  JOB_FAIL: require('@/assets/imgs/icon/ic_cre_fail.png')
};

export const redirectUrl = 'login_by_verify';
export const APPID = process.env.VUE_APP_WX_APP_ID;
export const authWxHost = 'https://open.weixin.qq.com/connect/oauth2/authorize';
export const authWxUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_re`;
// https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx58a25f70fa79f4cb&redirect_uri=https%3A%2F%2Fwx_xm_one.cn%3A8080%2F%23%2F&response_type=code&scope=snsapi_base&state=123#wechat_redirect

// 借款（立即借款的按钮之后的跳转）
export const BORROW_ROUTER = {
  1000: '/loans_base_info',
  1023: '/advance_payment',
  1035: '/xwe_open_account',
  // beijing - bank
  1155: '/bjb_loans_base_info'
};

// 在用户无状态的时候，没有借款额度（授信没有通过的）广发的查看申请记录的入口
export const APPLY_ROUTER = {
  1000: '/apply_record',
  1023: '/apply_record',
  1035: '/apply_record'
};

// 入口卡片的路由分类
export const CARD_CONFIG_ROUTER = {
  1000: [
    {
      title: '还款账户信息',
      targetPath: '/repay_acount'
    },
    {
      title: '待还账单',
      targetPath: '/bill'
    },
    {
      title: '借款记录',
      targetPath: '/loans_record'
    },
    {
      title: '还款记录',
      targetPath: '/repay_record'
    },
    {
      title: '银行卡管理',
      targetPath: '/bank_card_mana'
    }
  ],
  1023: [
    {
      title: '还款账户信息',
      targetPath: '/repay_acount'
    },
    {
      title: '待还账单',
      targetPath: '/bill'
    },
    {
      title: '借款记录',
      targetPath: '/loans_record'
    },
    {
      title: '还款记录',
      targetPath: '/repay_record'
    },
    {
      title: '银行卡管理',
      targetPath: '/bank_card_mana'
    }
  ],
  1035: [
    {
      title: '还款账户信息',
      targetPath: '/xwe_repay_acount'
    },
    {
      title: '待还账单',
      targetPath: '/xwe_bill'
    },
    {
      title: '借款记录',
      targetPath: '/xwe_loans_record'
    },
    {
      title: '还款记录',
      targetPath: '/xwe_repay_record'
    },
    {
      title: '银行卡管理',
      targetPath: '/xwe_bank_card_mana'
    }
  ],
  // 暂未定
  1155: [
    {
      title: '还款账户信息',
      targetPath: '/'
    },
    {
      title: '待还账单',
      targetPath: '/'
    },
    {
      title: '借款记录',
      targetPath: '/'
    },
    {
      title: '还款记录',
      targetPath: '/'
    },
    {
      title: '银行卡管理',
      targetPath: '/'
    }
  ]
};

// 还款
export const BILL_ROUTER = {
  1000: '/bill_detail',
  1023: '/sass_bill_detail',
  1035: '/xwe_bill_detail'
};
