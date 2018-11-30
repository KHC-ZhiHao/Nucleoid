"use strict";var _createClass=function(){function i(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(t,e,n){return e&&i(t.prototype,e),n&&i(t,n),t}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};function _asyncToGenerator(t){return function(){var u=t.apply(this,arguments);return new Promise(function(o,s){return function e(t,n){try{var i=u[t](n),r=i.value}catch(t){return void s(t)}if(!i.done)return Promise.resolve(r).then(function(t){e("next",t)},function(t){e("throw",t)});o(r)}("next")})}}function _toConsumableArray(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _possibleConstructorReturn(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}!function(t,e){"undefined"!=typeof module&&"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=e():"function"==typeof define&&(define.amd||define.cmd)?define(function(){return e}):t.Nucleoid=e()}("undefined"!=typeof window?window:global,function(){var n=function(){function e(t){_classCallCheck(this,e),this.baseName=t}return _createClass(e,[{key:"systemError",value:function(t,e){var n=2<arguments.length&&void 0!==arguments[2]?arguments[2]:"$_no_error";throw"$_no_error"!==n&&(console.log("%c error object is : ","color:#FFF; background:red"),console.log(n)),new Error("(☉д⊙)!! Nucleoid::"+this.baseName+" => "+t+" -> "+e)}},{key:"noKey",value:function(t,e,n){return null==e[n]||(this.systemError(t,"Name already exists.",n),!1)}},{key:"verify",value:function(t,e){var n={};for(var i in e){var r=e[i];if(r[0]&&null==t[i])return void this.systemError("verify","Must required",i);t[i]?_typeof(r[1])===_typeof(t[i])?n[i]=t[i]:this.systemError("verify","Type("+_typeof(r[1])+") error",i):n[i]=r[1]}return n}}]),e}(),r=function t(){_classCallCheck(this,t)},o=function(t){function i(t,e){_classCallCheck(this,i);var n=_possibleConstructorReturn(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,"Curry"));return n.group=e,n.data=n.verify(t,{name:[!0,""],input:[!0,function(){}],output:[!0,function(){}],methods:[!0,{}]}),n.init(),n}return _inherits(i,n),_createClass(i,[{key:"init",value:function(){var t=this.data.methods;(t.action||t.promise||t.direct)&&this.systemError("init","Methods has private key(action, promise, direct)")}},{key:"use",value:function(){var e=this;return function(t){return new s(e,t).getRegisterMethod()}}},{key:"name",get:function(){return this.data.name}}]),i}(),s=function(t){function i(t,e){_classCallCheck(this,i);var n=_possibleConstructorReturn(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,"CurryUnit"));return n.case=new r,n.flow=[],n.main=t,n.index=0,n.params=e,n.previousFlow=null,n.initRegisterMethod(),n}return _inherits(i,n),_createClass(i,[{key:"direct",value:function(){var e=null;return this.activation(function(t){e=t},function(t){e=t}),e}},{key:"action",value:function(e){this.activation(function(t){e(t,null)},function(t){e(null,t)})}},{key:"promise",value:function(){var n=this;return new Promise(function(t,e){n.activation(e,t)})}},{key:"initRegisterMethod",value:function(){var e=this,n=this;this.registergMethod={direct:this.direct.bind(this),action:this.action.bind(this),promise:this.promise.bind(this)};var t=function(t){e.registergMethod[t]=function(){return n.register(t,[].concat(Array.prototype.slice.call(arguments))),n.getRegisterMethod()}};for(var i in this.main.data.methods)t(i)}},{key:"getRegisterMethod",value:function(){return this.registergMethod}},{key:"register",value:function(t,e){var n={name:t,nextFlow:null,previous:this.flow.slice(-1),index:this.index,method:this.main.data.methods[t],params:e};this.previousFlow&&(this.previousFlow.nextFlow=n),this.previousFlow=n,this.index+=1,this.flow.push(n)}},{key:"include",value:function(t){return this.main.group.getMethod(t).use()}},{key:"activation",value:function(e,n){var i=this,r=!1,o=0,s=function(t){e(t),r=!0},u=function(){o+=1,!1===r&&t()},t=function(){var t=i.flow[o];t?t.method.bind(i.case).apply(void 0,_toConsumableArray(t.params).concat([{index:t.index,include:i.include.bind(i),nextFlow:t.nextFlow,previous:t.previous},s,u])):i.main.data.output.bind(i.case)({include:i.include.bind(i)},function(t){s(t)},function(t){n(t)})},a=function(){t(),a=function(){}};this.main.data.input.bind(this.case)(this.params,{include:this.include.bind(this)},s,a)}}]),i}(),i=function(t){function i(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},e=arguments[1];_classCallCheck(this,i);var n=_possibleConstructorReturn(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,"MethodGroup"));return n.main=e||!1,n.case=new r,n.pool={},n.curryPool={},n.data=n.verify(t,{create:[!1,function(){}]}),n}return _inherits(i,n),_createClass(i,[{key:"create",value:function(t){this.data.create.bind(this.case)(t),this.create=null}},{key:"getMethod",value:function(t){return this.main?a.getMethod(t):this.pool[t]?this.pool[t]:void this.systemError("getMethod","method not found.",t)}},{key:"getCurry",value:function(t){return this.main?a.getCurry(t):this.curryPool[t]?this.curryPool[t]:void this.systemError("getCurry","curry not found.",t)}},{key:"callMethod",value:function(t){return this.getMethod(t).use()}},{key:"callCurry",value:function(t){return this.getCurry(t).use()}},{key:"currying",value:function(t){var e=new o(t,this);this.noKey("currying",this.curryPool,e.name)&&(this.curryPool[e.name]=e)}},{key:"addMethod",value:function(t){var e=new u(t,this);this.noKey("addMethod",this.pool,e.name)&&(this.pool[e.name]=e)}},{key:"hasCurry",value:function(t){return!!this.curryPool[t]}},{key:"hasMethod",value:function(t){return!!this.pool[t]}}]),i}(),u=function(t){function i(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},e=arguments[1];_classCallCheck(this,i);var n=_possibleConstructorReturn(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,"Method"));return n.case=new r,n.used=[],n.store={},n.group=e,n.data=n.verify(t,{name:[!0,""],create:[!1,function(){}],action:[!0,function(){}]}),n.init(),n}return _inherits(i,n),_createClass(i,[{key:"init",value:function(){null==this.group&&this.systemError("init","No has group",this),this.name.includes("-")&&this.systemError("init","Symbol - is group protection.",name),this.case=new r}},{key:"create",value:function(){this.data.create.bind(this.case)({store:this.store,include:this.include.bind(this)}),this.create=null}},{key:"include",value:function(t){return!1===this.used.includes(t)&&this.used.push(t),this.group.getMethod(t).use()}},{key:"system",value:function(){return{store:this.store,group:this.groupCase}}},{key:"direct",value:function(t){var e=null;return this.data.action.bind(this.case)(t,this.system(),function(t){e=t},function(t){e=t}),e}},{key:"action",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:function(){};this.data.action.bind(this.case)(t,this.system(),function(t){e(t,null)},function(t){e(null,t)})}},{key:"promise",value:function(n){var i=this;return new Promise(function(t,e){i.data.action.bind(i.case)(n,i.system(),e,t)})}},{key:"getStore",value:function(t){if(this.store[t])return this.store[t];this.systemError("getStore","Key not found.",t)}},{key:"use",value:function(){return this.create&&this.create(),{store:this.getStore.bind(this),direct:this.direct.bind(this),action:this.action.bind(this),promise:this.promise.bind(this)}}},{key:"name",get:function(){return this.data.name}},{key:"groupCase",set:function(t){console.log(t)},get:function(){return this.group.case}}]),i}(),a=new(function(t){function e(){_classCallCheck(this,e);var t=_possibleConstructorReturn(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,"Bucket"));return t.mainGroup=new i({},!0),t.groups={},t}return _inherits(e,n),_createClass(e,[{key:"hasGroup",value:function(t){return!!this.groups[t]}},{key:"hasMethod",value:function(t){return!!this.mainGroup.hasMethod(t)}},{key:"hasCurry",value:function(t){return!!this.mainGroup.hasCurry(t)}},{key:"getMethod",value:function(t){var e=t.includes("-"),n=e?t.split("-"):[null,t],i=e?this.groups[n[0]]:this.mainGroup;if(i){var r=i.pool[n[1]];if(r)return r;this.systemError("getMethod","Method not found.",n[1])}else this.systemError("getMethod","Group not found.",n[0])}},{key:"getCurry",value:function(t){var e=t.includes("-"),n=e?t.split("-"):[null,t],i=e?this.groups[n[0]]:this.mainGroup;if(i){var r=i.curryPool[n[1]];if(r)return r;this.systemError("getCurry","Method not found.",n[1])}else this.systemError("getCurry","Group not found.",n[0])}},{key:"addMethod",value:function(t){this.mainGroup.addMethod(t)}},{key:"currying",value:function(t){this.mainGroup.currying(t)}},{key:"addGroup",value:function(t,e,n){null==this.groups[t]?e instanceof i?(e.create&&e.create(n),this.groups[t]=e):this.systemError("addGroup","Must group.",e):this.systemError("addGroup","Name already exists.",t)}}]),e}()),c=function(t){function r(t,e,n){_classCallCheck(this,r);var i=_possibleConstructorReturn(this,(r.__proto__||Object.getPrototypeOf(r)).call(this,"Transcription"));return i.name="",i.used=[],i.start=Date.now(),i.stack=[],i.fail=null,i.finish=!1,i.reject=n,i.operating="undefined"==typeof window?"node":"browser",i.runIndex=0,i.callback=e,i.nucleoid=t,i.targetStack=null,i.initTimeOut(),i.initGenerator(),i.initUncaughtException(),i.validateNucleoid(),i}return _inherits(r,n),_createClass(r,[{key:"getSystem",value:function(){return{fail:this.callFail.bind(this),mixin:this.mixin.bind(this),curry:this.curry.bind(this),methods:this.methods.bind(this),template:this.template.bind(this)}}},{key:"template",value:function(t){var e,n=this,i=t.thread,r=t.error,o=t.finish,s=0,u=0,a=[],c=function(t){return function(){s+=1,!1===t.stop&&(t.stop=!0,n.addStackExtra("template",{name:t.name,success:!0})),u<=s&&o()}},h=function(e){return function(t){!1===e.stop&&(e.stop=!0,n.addStackExtra("template",{name:e.name,success:!1}),r(t))}};i((e=_asyncToGenerator(regeneratorRuntime.mark(function t(e){var n=e.name,i=e.action;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:u+=1,a.push({name:n,action:i,stop:!1});case 2:case"end":return t.stop()}},t,this)})),function(t){return e.apply(this,arguments)}));for(var l=0;l<a.length;l++)a[l].action(c(a[l]),h(a[l]));0===a.length&&o()}},{key:"methods",value:function(t){var e=a.getMethod(t).use();return this.addStackExtra("used",{name:t,used:a.getMethod(t).used}),e}},{key:"curry",value:function(t){var e=a.getCurry(t).use();return this.addStackExtra("curry",{name:t}),e}},{key:"mixin",value:function(t,e){var n=this;t instanceof h?t.transcription().then(function(t){n.addStackExtra("mixin",t.status),e(null,t.messenger)},function(t){n.addStackExtra("mixin",t.status),e(t,null)}):this.systemError("mixin","Target not a nucleoid module.",t)}},{key:"callFail",value:function(t){this.fail=!0,this.reject({error:t,messenger:this.nucleoid.messenger,status:this.createStatus()})}},{key:"validateNucleoid",value:function(){this.validate()&&(this.name=this.nucleoid.name,this.doNext())}},{key:"validate",value:function(){var t={name:[!0,"string"],tryCatchMode:[!0,"boolean"],tryCatchModeAction:[!1,"function"],timeout:[!1,"number"],timeoutAction:[!1,"function"],promoter:[!1,"function"],messenger:[!0,"object"],mediator:[!1,"function"],terminator:[!1,"function"],uncaughtException:[!0,"boolean"],uncaughtExceptionAction:[!1,"function"]};for(var e in t){var n=this.nucleoid[e];if(t[e][0]&&null==n)return this.systemError("validateNucleoid","Data "+e+" must required.",n),!1;if(null!==n&&t[e][1]!==(void 0===n?"undefined":_typeof(n)))return this.systemError("validateNucleoid","Data type must "+t[e][1]+".",n),!1}if(!1===Array.isArray(this.nucleoid.queues))return this.systemError("validateNucleoid","Data type must array.",this.nucleoid.queues),!1;for(var i=0;i<this.nucleoid.queues.length;i++){var r=this.nucleoid.queues[i];if("string"!=typeof r.name||"function"!=typeof r.action)return this.systemError("validateNucleoid","Queues type Incorrect.",r),!1}return!0}},{key:"addStack",value:function(t,e){var n={step:t,start:this.now};return e&&(n.desc=e),this.stack.push(n),n}},{key:"addStackExtra",value:function(t,e){this.targetStack&&(null==this.targetStack[t]&&(this.targetStack[t]=[]),this.targetStack[t].push(e))}},{key:"initGenerator",value:function(){var e=1e4,n=this,i=this.exit.bind(this),t=regeneratorRuntime.mark(function t(){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:n.nucleoid.timeoutAction&&n.nucleoid.timeout&&(n.timeout=setTimeout(n.timeoutEvent,n.nucleoid.timeout)),n.nucleoid.promoter&&(n.addStack("promoter"),n.nucleoid.promoter(n.nucleoid.messenger,i));case 2:if(!(0<=e)){t.next=13;break}if(n.finish)return t.abrupt("break",13);t.next=7;break;case 7:null==n.nucleoid.queues[n.runIndex]?(n.addStack("finish"),i()):function(){var t=n.next.bind(n);n.targetStack=n.addStack("queue",n.nucleoid.queues[n.runIndex].name),n.nucleoid.queues[n.runIndex].action(n.nucleoid.messenger,n.getSystem(),function(){t?(t(),t=null):console.warn("Nucleoid("+n.nucleoid.name+") => Next already called.")}),n.runIndex+=1}();case 8:return e--,void(t.next=11);case 11:t.next=2;break;case 13:return t.abrupt("return");case 14:case"end":return t.stop()}},t,this)});this.runtime=t()}},{key:"initUncaughtException",value:function(){var n=this;if(this.nucleoid.uncaughtException){this.uncaughtExceptionError=function(t){var e=t.stack?t:t.error;n.addStack("uncaught exception",(t.stack,e.message)),n.nucleoid.uncaughtExceptionAction(n.nucleoid.messenger,e,n.callFail.bind(n)),n.exit()}.bind(this),"node"===this.operating?(this.uncaughtExceptionDomain=require("domain").create(),this.uncaughtExceptionDomain.on("error",this.uncaughtExceptionError)):window.addEventListener("error",this.uncaughtExceptionError)}}},{key:"initTimeOut",value:function(){var t=this;this.timeout=null,this.timeoutEvent=function(){t.addStack("timeout"),t.nucleoid.timeoutAction(t.nucleoid.messenger,t.callFail.bind(t)),t.exit()}}},{key:"getMode",value:function(){var t=[];return this.nucleoid.tryCatchMode&&t.push("try-catch-mode"),this.nucleoid.timeoutAction&&t.push("timeout"),this.nucleoid.uncaughtException&&t.push("uncaught-exception-mode"),this.fail&&t.push("fail"),t}},{key:"createStatus",value:function(){return{name:this.name,mode:this.getMode(),step:this.stack.slice(-1)[0].step,stack:this.stack,totalRunTime:this.now}}},{key:"exit",value:function(){if(0==this.finish){this.finish=!0,this.timeout&&(clearTimeout(this.timeout),this.timeout=null),this.nucleoid.uncaughtException&&"node"!==this.operating&&window.removeEventListener("error",this.uncaughtExceptionAction);var t=this.createStatus();this.nucleoid.terminator&&this.nucleoid.terminator(this.nucleoid.messenger,t),this.callback({status:t,messenger:this.nucleoid.messenger})}else console.warn("Nucleoid("+this.nucleoid.name+") => Exit already called.")}},{key:"next",value:function(){var t=this;!1===this.finish&&(this.nucleoid.mediator&&(this.addStack("mediator"),this.nucleoid.mediator(this.nucleoid.messenger,this.exit.bind(this),this.callFail.bind(this))),setTimeout(function(){t.doNext()},1))}},{key:"doNext",value:function(){this.actionTryCatchMode()}},{key:"actionTryCatchMode",value:function(){if(this.nucleoid.tryCatchMode)try{this.actionUncaughtException()}catch(t){this.nucleoid.tryCatchModeAction&&this.nucleoid.tryCatchModeAction(this.nucleoid.messenger,t,this.callFail.bind(this)),this.addStack("catch",t.message),this.exit()}else this.actionUncaughtException()}},{key:"actionUncaughtException",value:function(){var t=this;this.nucleoid.uncaughtException&&"node"===this.operating?this.uncaughtExceptionDomain.run(function(){t.runtime.next()}):this.runtime.next()}},{key:"now",get:function(){return Date.now()-this.start}}]),r}(),h=function(t){function e(){_classCallCheck(this,e);var t=_possibleConstructorReturn(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,"Nucleoid"));return t.queues=[],t.tryCatchMode=!1,t.tryCatchModeAction=null,t.timeout=3600,t.timeoutAction=null,t.uncaughtException=!1,t.uncaughtExceptionAction=null,t.promoter=null,t.mediator=null,t.terminator=null,t.messenger={},t._protection={},t.setName("No name"),t}return _inherits(e,n),_createClass(e,[{key:"setName",value:function(t){"string"==typeof t?this.name=t:this.systemError("setName","Name not a string.",t)}},{key:"setTimeout",value:function(t,e){"number"==typeof t&&"function"==typeof e?(this.timeout=t,this.timeoutAction=e):this.systemError("setTimeout","Params type error. try setTimeout(number, function)")}},{key:"setTrymode",value:function(t,e){"boolean"!=typeof t||"function"!=typeof e&&null!=e?this.systemError("setTrymode","Params type error, try setTrymode(boolean, function)."):(this.tryCatchMode=t,this.tryCatchModeAction=e)}},{key:"setUncaughtException",value:function(t,e){"boolean"==typeof t&&"function"==typeof e?null==this.uncaughtExceptionAction?(this.uncaughtException=t,this.uncaughtExceptionAction=e):this.systemError("setUncaughtException","Uncaught Exception already exists.",this.uncaughtExceptionAction):this.systemError("setUncaughtException","Not a function.",e)}},{key:"addMessenger",value:function(t,e){var n=this,i=2<arguments.length&&void 0!==arguments[2]&&arguments[2];null==this.messenger[t]||!0===i?"$"===t.slice(0,1)?(this._protection[t]=e,Object.defineProperty(this.messenger,t,{set:function(){n.systemError("addMessenger","This key is a private key, can't be change.",t)},get:function(){return n._protection[t]}})):this.messenger[t]=e:this.systemError("addMessenger","Messenger key already exists.",t)}},{key:"queue",value:function(t,e){"string"==typeof t?"function"==typeof e?this.queues.push({name:t,action:e}):this.systemError("queue","Action not a function.",e):this.systemError("queue","Name not a string.",t)}},{key:"setPromoter",value:function(t){"function"==typeof t?null==this.promoter?this.promoter=t:this.systemError("setPromoter","Promoter already exists.",this.promoter):this.systemError("setPromoter","Promoter not a function.",t)}},{key:"setMediator",value:function(t){"function"==typeof t?null==this.mediator?this.mediator=t:this.systemError("setPromoter","Promoter already exists.",this.mediator):this.systemError("setMediator","Mediator not a function.",t)}},{key:"setTerminator",value:function(t){"function"==typeof t?null==this.terminator?this.terminator=t:this.systemError("setTerminator","Terminator already exists.",this.terminator):this.systemError("setTerminator","Terminator not a function.",t)}},{key:"transcription",value:function(){var n=this;return this.transcription=function(){console.warn("Nucleoid("+this.name+") => Transcription already called.")},new Promise(function(t,e){new c(n,t,e)})}}],[{key:"addGroup",value:function(t,e,n){a.addGroup(t,e,n)}},{key:"addMethod",value:function(t){a.addMethod(t)}},{key:"currying",value:function(t){a.currying(t)}},{key:"hasCurry",value:function(t){return a.hasCurry(t)}},{key:"hasMethod",value:function(t){return a.hasMethod(t)}},{key:"hasGroup",value:function(t){return a.hasGroup(t)}},{key:"callMethod",value:function(t){return a.getMethod(t).use()}},{key:"callCurry",value:function(t){return a.getCurry(t).use()}},{key:"createMethodGroup",value:function(t){return new i(t)}}]),e}();return h});