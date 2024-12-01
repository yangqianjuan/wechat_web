/*
 * @Author: yanpeng peng.yan01@weimob.com
 * @Date: 2023-06-13 17:35:11
 * @LastEditors: yanpeng peng.yan01@weimob.com
 * @LastEditTime: 2023-06-15 14:04:44
 * @FilePath: \mz-front\src\plugin\vant\vant-ui.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue';
import './toast/toast';
import './notify/notify';
// 按需导入组件
import {
  Button,
  CellGroup,
  Cell,
  NumberKeyboard,
  NavBar,
  List,
  Icon,
  PullRefresh,
  Field,
  Step,
  Steps,
  Popup,
  Loading,
  Form,
  Radio,
  RadioGroup,
  DropdownItem,
  DropdownMenu,
  Empty,
  Image as VanImage,
  ActionSheet,
  Area,
  Dialog,
  Collapse,
  CollapseItem,
  Tab,
  Tabs,
  Checkbox
} from 'vant';

// 注册全局组件
Vue.use(Button)
  .use(CellGroup)
  .use(Cell)
  .use(NumberKeyboard)
  .use(NavBar)
  .use(List)
  .use(Icon)
  .use(PullRefresh)
  .use(Field)
  .use(Step)
  .use(Steps)
  .use(Popup)
  .use(Loading)
  .use(Form)
  .use(Field)
  .use(Radio)
  .use(RadioGroup)
  .use(DropdownItem)
  .use(DropdownMenu)
  .use(Empty)
  .use(VanImage)
  .use(ActionSheet)
  .use(Area)
  .use(Dialog)
  .use(Collapse)
  .use(CollapseItem)
  .use(Tab)
  .use(Checkbox)
  .use(Tabs);
