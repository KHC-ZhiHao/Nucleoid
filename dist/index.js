"use strict";var _createClass=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}!function(e,t){"undefined"!=typeof module&&"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=t():"function"==typeof define&&(define.amd||define.cmd)?define(function(){return t}):e.Nucleoid=t()}("undefined"!=typeof window?window:global,function(){var n=function(){function t(e){_classCallCheck(this,t),this.baseName=e}return _createClass(t,[{key:"systemError",value:function(e,t,n){throw n&&(console.log("%c error object is : ","color:#FFF; background:red"),console.log(n)),new Error("(☉д⊙)!! Nucleoid::"+this.baseName+" => "+e+" -> "+t)}}]),t}(),r=function(e){function i(e,t){var n=2<arguments.length&&void 0!==arguments[2]&&arguments[2];_classCallCheck(this,i);var r=_possibleConstructorReturn(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,"Transcription"));return r.name="",r.stack=[],r.finish=!1,r.trymode=n,r.runIndex=0,r.callback=t,r.nucleoid=e,r.initTimeOut(),r.initGenerator(),r.validateNucleoid(),r}return _inherits(i,n),_createClass(i,[{key:"validateNucleoid",value:function(){this.validate()&&(this.name=this.nucleoid.name,this.next())}},{key:"validate",value:function(){var e={name:[!0,"string"],timeout:[!1,"number"],timeoutError:[!1,"function"],promoter:[!1,"function"],messenger:[!0,"object"],mediator:[!0,"function"],terminator:[!1,"function"]};for(var t in e){var n=this.nucleoid[t];if(e[t][0]&&null==n)return this.systemError("validateNucleoid","Data "+t+" must required.",n),!1;if(e[t][1]!==(void 0===n?"undefined":_typeof(n)))return this.systemError("validateNucleoid","Data type must "+e[t][1]+".",n),!1}if(!1===Array.isArray(this.nucleoid.genes))return this.systemError("validateNucleoid","Data type must array.",this.nucleoid.genes),!1;for(var r=0;r<this.nucleoid.genes.length;r++){var i=this.nucleoid.genes[r];if("string"!=typeof i.name||"function"!=typeof i.action)return this.systemError("validateNucleoid","Genes type Incorrect.",i),!1}return!0}},{key:"addStack",value:function(e){this.stack.push({step:e,start:this.now})}},{key:"initGenerator",value:function(){var t=1e4,n=this,r=this.exit.bind(this),e=regeneratorRuntime.mark(function e(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:n.nucleoid.timeoutError&&n.nucleoid.timeout&&(n.timeout=setTimeout(n.timeoutEvent,n.nucleoid.timeout)),n.nucleoid.promoter&&(n.addStack("promoter"),n.nucleoid.promoter(n.nucleoid.messenger,r));case 2:if(!(0<=t)){e.next=13;break}if(n.finish)return e.abrupt("break",13);e.next=7;break;case 7:null==n.nucleoid.genes[n.runIndex]?(n.addStack("finish"),r()):function(){var e=n.next.bind(n);n.addStack("queue:"+n.nucleoid.genes[n.runIndex].name),n.nucleoid.genes[n.runIndex].action(n.nucleoid.messenger,function(){e?(e(),e=null):console.warn("Nucleoid("+n.nucleoid.name+") => Next already called.")}),n.runIndex+=1}();case 8:return t--,void(e.next=11);case 11:e.next=2;break;case 13:return e.abrupt("return");case 14:case"end":return e.stop()}},e,this)});this.runtime=e()}},{key:"initTimeOut",value:function(){var e=this;this.now=0,this.timeout=null,this.timeoutEvent=function(){e.addStack("timeout"),e.nucleoid.timeoutError(e.nucleoid.messenger),e.exit()},this.interval=setInterval(function(){e.now+=1},1)}},{key:"exit",value:function(){if(0==this.finish){this.finish=!0,this.timeout&&(clearTimeout(this.timeout),this.timeout=null),clearInterval(this.interval);var e={name:this.name,step:this.stack.slice(-1)[0].step.split(":")[0],stack:this.stack};this.nucleoid.terminator&&this.nucleoid.terminator(this.nucleoid.messenger,e),this.callback({status:e,messenger:this.nucleoid.messenger})}else console.warn("Nucleoid("+this.nucleoid.name+") => Exit already called.")}},{key:"next",value:function(){var t=this;!1===this.finish&&(this.nucleoid.mediator&&(this.addStack("mediator"),this.nucleoid.mediator(this.nucleoid.messenger,this.exit.bind(this))),setTimeout(function(){if(t.trymode)try{t.runtime.next()}catch(e){t.addStack("catch: "+e),t.exit()}else t.runtime.next()},1))}}]),i}();return function(e){function t(){_classCallCheck(this,t);var e=_possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,"Nucleoid"));return e.genes=[],e.timeout=3600,e.timeoutError=null,e.promoter=null,e.mediator=null,e.terminator=null,e.messenger={},e.setName("No name"),e}return _inherits(t,n),_createClass(t,[{key:"setName",value:function(e){"string"==typeof e?this.name=e:this.systemError("setName","Name not a string.",e)}},{key:"setTimeout",value:function(e,t){"number"==typeof e?"function"==typeof t?(this.timeout=e,this.timeoutError=t):this.systemError("setTimeout","Error not a function.",t):this.systemError("setTimeout","Timeout not a number.",e)}},{key:"addMessenger",value:function(e,t){var n=2<arguments.length&&void 0!==arguments[2]&&arguments[2];null==this.messenger[e]||!0===n?this.messenger[e]=t:this.systemError("addMessenger","Messenger key already exists.",e)}},{key:"queue",value:function(e,t){"string"==typeof e?"function"==typeof t?this.genes.push({name:e,action:t}):this.systemError("queue","Action not a function.",t):this.systemError("queue","Name not a string.",e)}},{key:"setPromoter",value:function(e){"function"==typeof e?null==this.promoter?this.promoter=e:this.systemError("setPromoter","Promoter already exists.",this.promoter):this.systemError("setPromoter","Promoter not a function.",e)}},{key:"setMediator",value:function(e){"function"==typeof e?null==this.mediator?this.mediator=e:this.systemError("setPromoter","Promoter already exists.",this.mediator):this.systemError("setMediator","Mediator not a function.",e)}},{key:"setTerminator",value:function(e){"function"==typeof e?null==this.terminator?this.terminator=e:this.systemError("setTerminator","Terminator already exists.",this.terminator):this.systemError("setTerminator","Terminator not a function.",e)}},{key:"transcription",value:function(){var t=this,n=0<arguments.length&&void 0!==arguments[0]&&arguments[0];return this.transcription=function(){console.warn("Nucleoid("+this.name+") => Transcription already called.")},new Promise(function(e){new r(t,e,n)})}}]),t}()});