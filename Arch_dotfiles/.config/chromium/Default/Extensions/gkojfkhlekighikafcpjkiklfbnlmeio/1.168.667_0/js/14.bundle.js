// LICENSE_CODE ZON
(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[14],{7:function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__);__webpack_require__.d(__webpack_exports__,"init",(function(){return init}));var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(19);var react__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);var react_dom__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(32);var react_dom__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);var _bext_vpn_ui_page_lib_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(59);var _bext_vpn_ui_ui_lib_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(34);var _util_url_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(18);var _util_url_js__WEBPACK_IMPORTED_MODULE_4___default=__webpack_require__.n(_util_url_js__WEBPACK_IMPORTED_MODULE_4__);var _util_etask_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__(11);var _util_etask_js__WEBPACK_IMPORTED_MODULE_5___default=__webpack_require__.n(_util_etask_js__WEBPACK_IMPORTED_MODULE_5__);var _bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__(25);
// LICENSE_CODE ZON
function _extends(){_extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key]}}}return target};return _extends.apply(this,arguments)}function _slicedToArray(arr,i){return _arrayWithHoles(arr)||_iterableToArrayLimit(arr,i)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function _iterableToArrayLimit(arr,i){if(!(Symbol.iterator in Object(arr)||Object.prototype.toString.call(arr)==="[object Arguments]")){return}var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i["return"]!=null)_i["return"]()}finally{if(_d)throw _e}}return _arr}function _arrayWithHoles(arr){if(Array.isArray(arr))return arr}const useState=react__WEBPACK_IMPORTED_MODULE_0___default.a.useState,useEffect=react__WEBPACK_IMPORTED_MODULE_0___default.a.useEffect;const T=_bext_vpn_ui_ui_lib_js__WEBPACK_IMPORTED_MODULE_3__["a"].T;const REPORT_HASH="#report_issue";const Report_problem=()=>{const _useState=useState(false),_useState2=_slicedToArray(_useState,2),modal=_useState2[0],set_modal=_useState2[1];const _useState3=useState(""),_useState4=_slicedToArray(_useState3,2),url=_useState4[0],set_url=_useState4[1];const _useState5=useState(""),_useState6=_slicedToArray(_useState5,2),subj=_useState6[0],set_subj=_useState6[1];useEffect(()=>{const on_hash_change=()=>set_modal(window.location.hash==REPORT_HASH);window.addEventListener("hashchange",on_hash_change,false);on_hash_change();let qs=_util_url_js__WEBPACK_IMPORTED_MODULE_4___default.a.qs_parse(window.location.search.replace(/^\?/,""));set_url(qs.url);set_subj(qs.subj);return()=>window.removeEventListener("hashchange",on_hash_change)},[]);const hide_modal=()=>window.location.hash="";return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",{className:"section report-problem"},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a",{className:"title",href:"#report_issue"},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(T,null,"Report a problem")),modal&&react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_bext_vpn_ui_page_lib_js__WEBPACK_IMPORTED_MODULE_2__["e"],{url:url,init_subj:subj,close_cb:hide_modal}))};let dev_mode_counter=0,dev_mode_first_ts=0;const About_details=()=>{const _useState7=useState(_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].get_dev_mode()),_useState8=_slicedToArray(_useState7,2),dev_mode=_useState8[0],set_dev_mode=_useState8[1];const info=_bext_vpn_ui_ui_lib_js__WEBPACK_IMPORTED_MODULE_3__["a"].use_etask(()=>_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].get_product_info(),[]);useEffect(()=>{const update=()=>set_dev_mode(_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].get_dev_mode());_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].on("dev_mode_changed",update);return()=>_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].off("dev_mode_changed",update)},[]);const on_title_click=()=>{let now=Date.now();if(!dev_mode_first_ts||now-dev_mode_first_ts>5e3){dev_mode_first_ts=now;dev_mode_counter=0}dev_mode_counter++;if(dev_mode_counter!=5)return;dev_mode_counter=0;dev_mode_first_ts=0;_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].set_dev_mode(!dev_mode)};const send_email=e=>{_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].perr("be_report_problem",{email:1},{with_log:true,rate_limit:{count:1}})};let s=dev_mode?" (Dev mode)":"";return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_bext_vpn_ui_page_lib_js__WEBPACK_IMPORTED_MODULE_2__["f"],{title:T("About Hola")+s,on_click:on_title_click},info.map(line=>react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_bext_vpn_ui_page_lib_js__WEBPACK_IMPORTED_MODULE_2__["a"],{key:line.name,label:T(line.name)+":"},line.value)),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_bext_vpn_ui_page_lib_js__WEBPACK_IMPORTED_MODULE_2__["a"],null,"Send email to ",react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_bext_vpn_ui_ui_lib_js__WEBPACK_IMPORTED_MODULE_3__["a"].Link_mailto,{on_click:send_email})))};const About_layout=()=>{const get_user_info=()=>({user:_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].get_user(),is_plus:_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].get_is_premium()});const _useState9=useState(get_user_info()),_useState10=_slicedToArray(_useState9,2),user_info=_useState10[0],set_user_info=_useState10[1];useEffect(()=>{const update=()=>set_user_info(get_user_info());_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].on("user_changed",update);return()=>_bext_vpn_ui_ui_api_js__WEBPACK_IMPORTED_MODULE_6__["a"].off("user_changed",update)},[]);return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_bext_vpn_ui_page_lib_js__WEBPACK_IMPORTED_MODULE_2__["d"],_extends({},user_info,{title:T("About"),cls:"about"}),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Report_problem,null),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(About_details,null),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_bext_vpn_ui_page_lib_js__WEBPACK_IMPORTED_MODULE_2__["b"],null))};const init=()=>_util_etask_js__WEBPACK_IMPORTED_MODULE_5___default()((function*(){yield Object(_bext_vpn_ui_page_lib_js__WEBPACK_IMPORTED_MODULE_2__["g"])();react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(About_layout,null),document.querySelector(".react-root"))}))}}]);
//# sourceMappingURL=https://hola.org/be_source_map/1.168.667/14.js.map