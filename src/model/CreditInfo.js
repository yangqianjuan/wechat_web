import { toThousands } from '@/utils/common/common';
import { sdUnionKey } from '@/utils/common/global.js';

/**
 * 授信记录（单个）格式化
 * */
export default class CreditInfo {
  constructor(params) {
    let initInfo = params ? params : {};
    this.formatField(initInfo);
    this.saveInfo();
  }

  saveInfo() {
    this.agreeProduct &&
      this.applyUnionKey &&
      sdUnionKey({ productId: this.agreeProduct, applyUnionKey: this.applyUnionKey, saveStatus: true });
  }

  formatField(params) {
    // 签约代扣通道
    this.agreeChannel = params.agreeChannel || '';
    // 产品id
    this.agreeProduct = params.agreeProduct || '';
    // 审批状态
    this.approveCode = params.approveCode || '';
    // 授信额度
    this.approveCredit = params.approveCredit || 0;
    // 授信期限
    this.crdTerm = params.crdTerm || '';
    // 销售id
    this.referrerId = params.saleManId || '';
    // 可用额度
    // this.avaliableCredit = params.avaliableCredit || 0;
    // 小萌快贷的可用额度
    this.avaliableCredit = params.xmAvaliableCredit || 0;
    // 审批通过日期
    this.approveExpiryDate = params.approveExpiryDate || '';
    // 创建时间
    this.createTime = params.createTime || '';
    // 更新时间
    this.updateTime = params.updateTime || '';
    // 授信合同状态
    this.contStatus = params.contStatus || '';
    // 小萌内部授信合同状态
    this.contXmStatus = params.contXmStatus || '';
    // 额度确认状态
    this.amtConfirmStatus = params.amtConfirmStatus || '00';
    // 银行额度失效
    this.isBankOnEffect = this.contStatus === '104';
    // 银行额度冻结
    this.isBankQuotaPause = this.contStatus === '105';
    // 小萌额度失效
    this.isOnEffect = this.contXmStatus === '104';
    // 小萌额度冻结
    this.isQuotaPause = this.contXmStatus === '105';
    // 授信的单号
    this.creditNo = params.creditNo || '';
    // 贷款的利率
    this.interestRate = params.interestRate || '';
    // 授信的申请记录
    this.applyUnionKey = params.applyUnionKey || '';
    // 产品的图片路径
    this.productImage = params.productImage || '';
    // 产品的名
    this.productName = params.productName || '';
    this.instUserId = params.instUserId || '';
    this.formateApproveCredit = toThousands(this.approveCredit) || 0;
    this.formateAvaliableCredit = toThousands(this.avaliableCredit) || 0;
    this.applyId = params.applyId || '';
    this.crdEndDate = params.crdEndDate || '';
    this.quotaValidFlag = params.quotaValidFlag;
    this.historyCredit = params.historyCredit || 0;
    // beijing 借款是否结清
    this.loanSettlementStatus = params.loanSettlementStatus;
  }
}
