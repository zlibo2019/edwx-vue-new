import Base from './base';
import Login from './page/login';
import Dine from './page/dine';
import Info from './page/info';
import Sys from './page/sys';
import Spend from './page/spend';
import Attence from './page/attence';
import Door from './page/door';
import Home from './page/home';
import Org from './page/org';
import My from './page/my';
import Message from './page/message';
import Application from './page/application';
import Leave from './page/leave';
import Approver from './page/approver';
import Copyer from './page/copyer';
import Trip from './page/trip';
import Out from './page/out';
import Overtime from './page/overtime';
import ChangeShift from './page/changeshift';
import Repair from './page/repair';
import Meeting from './page/meeting';
import UploadImage from './page/uploadImage';
import Repairs from './page/repairs';
import Dict from './page/dict';
import Visit from './page/visit';
import Meal from './page/Meal';
import User from './page/user';
import CompanyInfo from './page/companyInfo';
import DepUser from './page/depUser';
import UserPower from './page/userPower';
import AcDep from './page/acDep';
import DingTalk from './page/dingtalk';
import Agent from './page/agent';
import MealAppraise from './page/mealAppraise';

const api = {
  Login,
  Dine,
  Info,
  Sys,
  Spend,
  Attence,
  Door,
  Home,
  Base,
  Org,
  My,
  Message,
  Application,
  Leave,
  Approver,
  Copyer,
  Trip,
  Out,
  Overtime,
  ChangeShift,
  Repair,
  Meeting,
  UploadImage,
  Repairs,
  Dict,
  Visit,
  Meal,
  User,
  CompanyInfo,
  DepUser,
  UserPower,
  AcDep,
  DingTalk,
  Agent,
  MealAppraise
};

export default {
  install(Vue) {
    Vue.prototype.$api = api;
  },
  $api: api,
};
