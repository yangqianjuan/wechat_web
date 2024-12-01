import { quertProtocolUrl, querySaasProtocol } from '@/controller/protocol.js';

export const PROTOCOL_OBJ = {
  '/prod_xmkd': {
    1000: [
      { code: '06', name: '微萌助手隐私政策', isReadOver: false },
      { code: '05', name: '微萌助手平台用户注册协议', isReadOver: false }
    ]
  },
  '/prod_myd': {
    1038: [
      { code: '06', name: '微萌助手隐私政策', isReadOver: false },
      { code: '05', name: '微萌助手平台用户注册协议', isReadOver: false }
    ]
  },
  '/prod_sass': {
    1023: [
      { code: '06', name: '微萌助手隐私政策', isReadOver: false },
      { code: '05', name: '微萌助手平台用户注册协议', isReadOver: false }
    ]
  },

  '/upload_idcard': {
    1000: [
      { code: '00', name: '个人信息查询和使用授权书', isReadOver: false },
      { code: '01', name: '个人信息查询和提供在线授权书', isNess: true, isReadOver: false }
    ],
    1023: [{ code: '00', name: '个人信息查询和使用授权书', isReadOver: false }]
  },
  '/myd_upload_idcard': {
    1038: [
      { code: '00', name: '个人信息查询和使用授权书', isReadOver: false }
      // { code: '04', name: '数据使用授权书', isReadOver: false },
      // { code: '09', name: '征信授权协议', isReadOver: false }
      // { code: '01', name: '个人信息查询和提供在线授权书', isReadOver: false }
    ]
  },

  '/myd_company_approve': {
    1038: [
      { code: '06', name: '微萌助手隐私政策', isReadOver: false },
      { code: '04', name: '数据使用授权书', isReadOver: false },
      { code: '09', name: '征信授权协议', isReadOver: false }
    ]
  },
  '/company_approve': {
    1000: [{ code: '06', name: '微萌助手隐私政策', isReadOver: false }],
    1023: [
      { code: '04', name: '数据使用授权书', isReadOver: false },
      { code: '09', name: '征信授权协议', isReadOver: false }
    ]
  },
  '/xm_company_approve': {
    1000: [
      { code: '03', name: '授信合同', isNess: true, isReadOver: false },
      { code: '04', name: '数据使用授权书', isReadOver: false },
      { code: '09', name: '征信授权协议', isReadOver: false }
    ]
  },
  '/prod_xwe': {
    1035: [
      { code: '06', name: '微萌助手隐私政策', isReadOver: false },
      { code: '05', name: '微萌助手平台用户注册协议', isReadOver: false }
    ]
  },
  '/xwe_upload_idcard': {
    1035: [{ code: '00', name: '个人信息查询和使用授权书', isReadOver: false }]
  },
  '/xwe_company_approve': {
    1035: [
      { code: '04', name: '数据使用授权书', isReadOver: false },
      { code: '09', name: '征信授权协议', isReadOver: false }
    ]
  },

  '/prod_bjb': {
    1155: [
      { code: '06', name: '小萌企业服务平台隐私政策', isReadOver: false },
      { code: '05', name: '小萌企业服务平台用户注册协议', isReadOver: false }
    ]
  },

  '/bjb_upload_idcard': {
    1155: [{ code: '23', name: '个人信息查询和使用授权书', isPdf: false, isReadOver: false }]
  },

  '/bjb_company_approve': {
    1155: [
      { code: '09', name: '银行征信授权书', isPdf: true, isReadOver: false, isNess: true },
      { code: '24', name: '数据使用授权书', isPdf: false, isReadOver: false },
      { code: '21', name: '征信授权协议', isReadOver: false }
    ]
  },
  '/bjb_confirm_loan': {
    1155: [{ code: '09', name: '借款合同', isPdf: true, isReadOver: false, isNess: true }]
  },
  '/auth_upload_idcard': {
    sales: [{ code: '20', name: '销售展业承诺书', isNess: true, isReadOver: false }]
  },

  '/prod_sj': {
    9999: [
      { code: '06', name: '小萌服务平台隐私征程', isReadOver: false },
      { code: '05', name: '小萌服务平台用户注册协议', isReadOver: false }
    ]
  },
  '/sj_upload_idcard': {
    9999: [
      { code: '23', name: '个人信息查询和使用授权书', isPdf: true, isReadOver: false },
      { code: '09', name: '借款协议', isPdf: true, isReadOver: false, isNess: true },
      { code: '24', name: '征信查询授权书', isPdf: true, isReadOver: false },
      { code: '21', name: '委托担保合同', isPdf: true, isReadOver: false }
    ]
  },
  '/sj_confirm_loan': {
    9999: [{ code: '09', name: '借款合同', isReadOver: false }]
  }
};

export const PROTOCOL_FUN = {
  1000: quertProtocolUrl,
  1023: querySaasProtocol,
  1035: quertProtocolUrl,
  1038: quertProtocolUrl,
  1155: quertProtocolUrl,
  sales: quertProtocolUrl,
  9999: quertProtocolUrl
};

// 协议对照
// 00	个人信息查询和使用授权书
// 01	个人信息查询和提供在线授权书
// 02	还款账户变更和授信期限变更协议
// 03	授信合同
// 04	数据使用授权书
// 05	微萌助手平台用户注册协议
// 06	微萌助手隐私政策
// 07	互联网个人经营性贷款借款合同
// 08	用途申明书
// 09	征信授权协议
// 10	担保服务合同
// 11	上海浦东发展银行电子银行个人客户服务协议及隐私协议
// 12	上海浦东发展银行个人电子账户产品服务协议
// 19	浦发银行开户及电子户相关协议
