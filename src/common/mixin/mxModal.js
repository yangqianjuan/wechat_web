import Modal from '@/common/components/common/Modal';
export default {
  data() {
    return {
      errMsg: '',
      isShowErrMsg: false
    };
  },
  components: {
    'p-modal': Modal
  },
  methods: {
    errHandle(err, defaultMsg) {
      this.errMsg = err?.data?.msg || defaultMsg;
      this.switchModel();
    },
    switchModel() {
      this.isShowErrMsg = !this.isShowErrMsg;
    }
  }
};
