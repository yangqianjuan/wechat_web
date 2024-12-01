import gfApi from '@/request/path/gf/index';
import taxApi from '@/request/path/tax/index';
import commonApi from '@/request/path/common/index';
import xmApi from '@/request/path/xm/index';
import saasApi from '@/request/path/saas/index';

export default { ...gfApi.gfApi, ...taxApi.taxApi, ...commonApi.commonApi, ...xmApi.xmApi, ...saasApi.saasApi };
