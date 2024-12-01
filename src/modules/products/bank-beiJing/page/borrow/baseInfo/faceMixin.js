/*
 * @Author: hsf
 * @Date: 2023-07-07 10:51:49
 * @LastEditors: hsf
 * @LastEditTime: 2023-10-26 10:18:51
 * @Description:
 */
import { getFaceBjBankCheck, getFaceBjBankEffectiveCheck } from '@/request/interface/txQrc/faceP.js';
import { beijingDialog } from '../../../utils/common';

export default {
  methods: {
    /**
     * before fill info
     * */
    async getVerifyResult() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        // check self interface pass
        let selfCheckPass = await getFaceBjBankEffectiveCheck();

        if (selfCheckPass?.data?.success && selfCheckPass.data.data) {
          // face  是否做过人脸  faceIsInValid  人脸是否在有效期 loanBioassay:是否做过借款生物核验
          let face = selfCheckPass.data.data.face;
          let faceIsInValid = selfCheckPass.data.data.faceIsInValid;
          let loanBioassay = selfCheckPass.data.data.loanBioassay;

          if (face) {
            if (faceIsInValid) {
              if (!loanBioassay) {
                // check error no tips, submit to face
                try {
                  // check beijing bank interface pass
                  const checkBeijingRes = await getFaceBjBankCheck({
                    businessType: 4
                  });

                  if (checkBeijingRes?.data?.success) {
                    this.isBorrowNeedFace = false;
                    return;
                  }

                  // no pass
                  this.isBorrowNeedFace = true;
                  return;
                } catch (error) {
                  this.isBorrowNeedFace = true;

                  if (error?.data?.code === '10412') {
                    beijingDialog({
                      message: error?.data?.msg || '今天人脸识别已验证超过5次，请明天再重试!',
                      confirmButtonText: '确定',
                      showConfirmButton: false
                    });
                    return;
                  }
                }

                return;
              }

              // pass check
              this.isBorrowNeedFace = false;
              return;
            }

            // no pass and need face
            this.isBorrowNeedFace = true;
            return;
          }

          // no pass and need face
          this.isBorrowNeedFace = true;
          return;
        }

        // all error need face
        this.isBorrowNeedFace = true;
      } catch (error) {
        this.isBorrowNeedFace = true;
      } finally {
        this.$toasting.hide();
      }
    }
  }
};
