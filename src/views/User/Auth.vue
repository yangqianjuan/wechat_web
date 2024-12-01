<template>
  <div class="about">
    <h1></h1>
  </div>
</template>
<script>
import { getToken } from '../../controller/userController';
export default {
  data() {
    return {
      code: ''
    };
  },
  created() {
    let code = this.getUrlParam('code');
    let prid = this.getUrlParam('prid');
    let pageCallbackUrl = this.getUrlParam('page_callback_url');
    this.$toasting.show({ message: '获取识别结果', forbidClick: true });
    code &&
      getToken(code)
        .then((user) => {
          pageCallbackUrl
            ? prid
              ? this.$router.push({ path: `/${pageCallbackUrl}&prid=${prid}` })
              : this.$router.push({ path: `/${pageCallbackUrl}` })
            : this.$router.push({ path: '/' });
        })
        .finally((_) => {
          this.$toasting.hide();
        });
  }
};
</script>
