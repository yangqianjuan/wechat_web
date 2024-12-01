const mutations = {
  setUPDATEFILEINFO(state, obj) {
    state.fileToken = obj;
  },
  setUserId(state, userId) {
    state.userId = userId;
  },
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo;
  },
  setProductId(state, productId) {
    state.productId = productId;
  },
  setReferrer(state, referrer) {
    state.referrer = referrer;
  },
  setIsBindBankCard(state, flag) {
    state.isBindBankCard = flag;
  },
  setCreditInfo(state, creditInfo) {
    state.creditInfo = creditInfo;
  },
  setJsTicket(state, jsTicket) {
    state.jsTicket = jsTicket;
  },
  setApplyUnionKey(state, applyUnionKey) {
    state.applyUnionKey = applyUnionKey;
  },
  setTaxInitSkipStatsu(state, taxInitSkipBtn) {
    state.taxInitSkipBtn = taxInitSkipBtn;
  }
};

export default {
  mutations
};
