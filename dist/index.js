!function(t,e){"undefined"!=typeof module&&"object"==typeof exports?module.exports=e():"function"==typeof define&&(define.amd||define.cmd)?define(function(){return e}):t.Nucleoid=e()}(this||("undefined"!=typeof window?window:global),function(){class t{static each(t,e){if(Array.isArray(t)){var s=t.length;for(let i=0;i<s;i++){if("_break"===e(t[i],i))break}return}let i=typeof t;if("object"!==i)if("number"!==i)this.systemError("each","Each only support object, array, number.",t);else for(let s=0;s<t;s++){if("_break"===e(s,s))break}else for(let s in t){if("_break"===e(t[s],s))break}}}class e{constructor(t){this.$moduleBase={name:t||"no name"}}$systemError(t,e,s="$_no_error"){throw"$_no_error"!==s&&(console.log("%c error : ","color:#FFF; background:red"),console.log(s)),new Error(`(☉д⊙)!! Nucleoid::${this.$moduleBase.name} => ${t} -> ${e}`)}$noKey(t,e,s){return null==e[s]||(this.$systemError(t,"Name already exists.",s),!1)}$verify(t,e,s={}){let i={};for(let s in e){let n=e[s];if(n[0]&&null==t[s])return void this.$systemError("verify","Must required",s);t[s]?typeof n[1]!==("string"==typeof t[s]&&"#"===t[s][0])||t[s].slice(1)?i[s]=t[s]:this.$systemError("verify",`Type(${typeof n[1]}) error`,s):i[s]=n[1]}return Object.assign(i,s)}$protection(t,e,s,i){s[e]=i,Object.defineProperty(t,e,{set:()=>{this.$systemError("protection","This key is a private key, can't be change.",e)},get:()=>s[e]})}}class s{}class i extends e{constructor(t,e){super("PollingEvent"),this.name=e.name,this.status=new c(this.name,"polling"),this.action=e.action,this.finish=!1,t.status.addChildren(this.status)}activate(){this.action(this.close.bind(this))}close(){this.status.set(!0),this.finish=!0}}class n extends e{constructor(t,e){super("Fragment"),this.over=0,this.name=e||"no name",this.stop=!1,this.status=new c(this.name,"fragment"),this.thread=[],t.status.addChildren(this.status)}install(t){this.callback=(e=>{e?this.status.set(!1,e):this.status.set(!0),t(e)})}use(){return{add:this.add.bind(this),eachAdd:this.eachAdd.bind(this),activate:this.activate.bind(this)}}add(t){this.thread.push(this.$verify(t,{name:[!0,"#string"],action:[!0,"#function"]}))}eachAdd(e,s="no name",i){return t.each(e,(t,e)=>{this.add({name:s+`(${e})`,action:function(s,n){i(t,e,s,n)}})}),this.use()}regsterError(t){return e=>{!1===this.stop&&(t.set(!1,e),this.stop=!0,this.callback(e||"unknown error"))}}regsterOnload(t){return()=>{t.set(!0),this.over+=1,!1===this.stop&&this.over>=this.thread.length&&(this.stop=!0,this.callback())}}actionThread(t){(async()=>{let e=new c(t.name,"frag-thread"),s=this.regsterOnload(e),i=this.regsterError(e);this.status.addChildren(e),t.action(i,s)})()}activate(t){let e=this.thread.length;this.install(t);for(let t=0;t<e;t++)this.actionThread(this.thread[t]);0===e&&this.callback(null),this.activate=(()=>{this.$systemError("activate",`This template(${this.name}) already  called`)})}}class o extends e{constructor(t,e){super("Auto"),this.name=e.name||"No name",this.root=t,this.status=new c(this.name,"auto"),this.action=this.createAction(e.action),this.finish=!1,this.init()}init(){this.root.status.addChildren(this.status),this.action(this.error.bind(this),this.onload.bind(this))}createAction(t){return"function"!=typeof t&&this.$systemError("createAction","Action not a function",t),async function(e,s){t(e,s)}}error(t){this.finish=!0,this.status.set(!1,t)}onload(){this.finish=!0,this.status.set(!0)}}class r extends e{constructor(t){super("Operon"),this.data=this.$verify(t,{units:[!0,{}],structure:[!1,[]]}),this.validate()}get units(){return this.data.units}validate(){!1===Array.isArray(this.data.structure)&&this.$systemError("validate","Structure not a array.",this.data.structure);for(let t in this.units){let e=this.units[t];null!=e.constructor&&null!=e.prototype||this.$systemError("validate","Unit not a constructor.",t);let s=Object.getOwnPropertyNames(e.prototype);for(let t of this.data.structure)!1===s.includes(t)&&this.$systemError("validate",`Property(${t}) not found.`,t)}}use(t,e){let s=this.createContext(t,e),i=this.getUnit(t);return this.useUnit(i,s)}createContext(t,e){return{data:e,useName:t}}useUnit(t,e){let s=new t(e),i={};for(let t of this.data.structure)i[t]=s[t].bind(s);return i}getUnit(t){if(this.data.units[t])return this.data.units[t];this.$systemError("getUnit","Unit not found.",t)}exports(){return{use:this.use.bind(this)}}}class a extends e{constructor(t){super("Root"),this.gene=t,this.name=t.name,this.base={},this.autos=[],this.delay=5,this.interval=null,this.operating="undefined"==typeof window?"node":"browser",this.rootStatus=new c(this.name,"root"),this.protection={},this.carryStatus=null,this.pollingEvents=[],this.initBase()}get status(){return this.carryStatus||this.rootStatus}initPolling(){this.interval=setInterval(()=>{let t=!1;for(let e=0;e<this.pollingEvents.length;e++){let s=this.pollingEvents[e];s.finish?t=!0:s.activate()}t&&this.clearPollingEvents()},this.delay)}initBase(){if(this.gene.genetic){let t=this.gene.genetic();if("object"==typeof t)for(let e in t)this.addBase(e,t[e]);else this.$systemError("initBase","Genetic retrun not a object",t)}}getBase(){let t={};for(let e in this.base)t[e]=this.base[e];for(let e in this.protection)t[e]=this.protection[e];return t}setTargetStatus(t){this.carryStatus=t}createSystemStatus(t,e,s){let i=new c(t,"system");i.set(e,s),this.status.addChildren(i)}addBase(t,e){null==this.base[t]?"$"===t.slice(0,1)?this.$protection(this.base,t,this.protection,e):this.base[t]=e:this.$systemError("addBase","Base key already exists.",t)}polling(t){null==this.interval&&this.initPolling(),this.pollingEvents.push(new i(this,t))}auto(t){this.autos.push(new o(this,t))}clearPollingEvents(){this.pollingEvents=this.pollingEvents.filter(t=>!1===t.finish)}createFragment(t){return new n(this,t).use()}close(t,e,s,i){let n=()=>{this.rootStatus.set(t,e),this.interval&&clearInterval(this.interval),i()};s?n():this.checkAutoOnload(n)}checkAutoOnload(t){null==this.autos.find(t=>!1===t.finish)?t():setTimeout(()=>{this.checkAutoOnload(t)},10)}}class h{constructor(t){this.name=t.name,this.base=t.base,this.gene=t.gene,this.status=t.rootStatus,this.success=t.rootStatus.success,this.getBase=t.getBase}isError(){return!this.success}getErrorMessage(){return this.isError?this.status.message:null}getStatusToJson(){return this.status.json()}getMode(){let t=[];return this.gene.mode.catchException&&t.push("try-catch-mode"),this.gene.mode.timeout&&t.push("timeout"),this.gene.mode.catchUncaughtException&&t.push("uncaught-exception-mode"),this.gene.mode.traceBase&&t.push("trace-base-mode"),t}}class c extends e{constructor(t,e){super("Status"),this.name=t||"no name",this.type=e||"no type",this.detail=null,this.message="",this.success=!1,this.children=[],this.startTime=Date.now(),this.attributes={},this.finishTime=null}get operationTime(){return(this.finishTime||Date.now())-this.startTime}addAttr(t,e){this.attributes[t]=e}installDetail(){null==this.detail&&(this.detail={operationTime:this.operationTime})}set(t,e=""){return null==this.finishTime&&(this.success=t,this.message=e instanceof Error?e.stack:e,this.finishTime=Date.now(),this.installDetail()),this}get(){let t={name:this.name,type:this.type,detail:this.detail,message:this.message,success:this.success,attributes:this.attributes,children:[]};for(let e of this.children)t.children.push(e.get());return t}inspect(t,e=[]){if(null==t)return null;let s=Array.isArray(t)?[]:{};for(let i in t){let n=t[i],o=typeof n;if("function"!==o)if("object"===o){let o=[t].concat(e);o.includes(n)?s[i]="Circular structure object.":s[i]=this.inspect(n,o)}else s[i]=n}return s}json(){let t=this.inspect(this.get());return JSON.stringify(t,null,4)}html(){let t=this.inspect(this.get()),e=function(t){let s=`<div style="padding:5px; margin: 5px; border:${`solid 1px ${t.success?"blue":"red"}`}">`;s+=`<div>type : ${t.type}</div>`,s+=`<div>name : ${t.name}</div>`,s+=t.message?`<div>message : <br><pre>${t.message}</pre></div>`:"",t.detail&&(s+="<div>detail : ",s+=`<pre>${JSON.stringify(t.detail,null,4)}</pre>`,s+="</div>");for(let e in t.attributes)s+=`<div> attributes(${e}) : `,s+=`<pre>${JSON.stringify(t.attributes[e],null,4)}</pre>`,s+="</div>";let i=t.children.length;for(let n=0;n<i;n++)s+=e(t.children[n]);return s+="</div>"};return e(t)}addChildren(t){t instanceof c?this.children.push(t):this.$systemError("addChildren","Child not a status class.",t)}}class l extends e{constructor(t,e){super("Gene"),this.setName(t||"no name"),this.templates=[],this.genetic=null,this.mode={timeout:null,traceBase:null,catchException:null,catchUncaughtException:null},this.synthesis={initiation:null,elongation:null,termination:null},e&&this.setOptions(e)}setOptions(t){if("object"!=typeof t&&this.$systemError("setOptions","Options not a object.",t),t.timeoutMode){let e=t.timeoutMode;this.setTimeoutMode(e.enable,e.ms,e.action)}if(t.catchMode){let e=t.catchMode;this.setCatchExceptionMode(e.enable,e.action)}if(t.uncaughtCatchMode){let e=t.uncaughtCatchMode;this.setCatchUncaughtExceptionMode(e.enable,e.action)}if(t.traceBaseMode){let e=t.traceBaseMode;this.setTraceBaseMode(e.enable,e.action)}t.initiation&&!1!==t.initiation.enable&&this.setInitiation(t.initiation.action),t.elongation&&!1!==t.elongation.enable&&this.setElongation(t.elongation.action),t.termination&&!1!==t.termination.enable&&this.setTermination(t.termination.action),t.genetic&&!1!==t.genetic.enable&&this.setGenetic(t.genetic.action),t.templates&&this.cloning(t.templates)}addName(t){"string"==typeof t?"no name"===this.name?this.name=t:this.name+="-"+t:this.$systemError("addName","Name not a string.",t)}setName(t){"string"==typeof t?this.name=t:this.$systemError("setName","Name not a string.",t)}setTraceBaseMode(t,e){"boolean"==typeof t&&"function"==typeof e?t&&(this.mode.traceBase={action:e}):this.$systemError("setTraceBaseMode","Params type error. try setTraceBaseMode(boolean, function)")}setTimeoutMode(t,e,s){"boolean"==typeof t&&"number"==typeof e&&"function"==typeof s?t&&(this.mode.timeout={action:s,millisecond:e}):this.$systemError("setTimeout","Params type error. try setTimeoutMode(boolean, number, function)")}setCatchExceptionMode(t,e){"boolean"==typeof t&&"function"==typeof e?t&&(this.mode.catchException={action:e}):this.$systemError("setCatchExceptionMode","Params type error, try setCatchExceptionMode(boolean, function).")}setCatchUncaughtExceptionMode(t,e){"boolean"==typeof t&&"function"==typeof e?t&&(this.mode.catchUncaughtException={action:e}):this.$systemError("setCatchUncaughtException","Params type error, try setCatchUncaughtException(boolean, function).")}setGenetic(t){"function"==typeof t?this.genetic=t:this.$systemError("setGenetic","Params type error, try setGenetic(callback).")}template(t,e){"string"==typeof t&&"function"==typeof e?this.templates.push({name:t,action:e}):this.$systemError("template","Params type error, try template(string, function).")}setInitiation(t){"function"==typeof t?this.synthesis.initiation=t:this.$systemError("setInitiation","Params type error, try setInitiation(function).")}setElongation(t){"function"==typeof t?this.synthesis.elongation=t:this.$systemError("setElongation","Params type error, try setElongation(function).")}setTermination(t){"function"==typeof t?this.synthesis.termination=t:this.$systemError("setTermination","Params type error, try setTermination(function).")}cloning(t){if("object"==typeof t)for(let e in t)"function"==typeof t[e]?this.template(e,t[e]):this.$systemError("cloning","template data not a function.",e);else this.$systemError("cloning","Template not a object.")}clearTemplate(){this.templates=[]}transcription(){return new Promise((t,e)=>{new u(this,t,e)})}}class u extends e{constructor(t,e,i){super("Transcription"),this.gene=t,this.case=new s,this.root=new a(this.gene),this.finish=!1,this.reject=i,this.resolve=e,this.forceClose=!1,this.templates=this.gene.templates,this.init(),this.synthesis()}get status(){return this.root.status}get base(){return this.root.base}init(){this.initBind(),this.initTimeoutMode(),this.initGenerator(),this.initCatchUncaughtExceptionMode()}initBind(){this.bind={exit:this.exit.bind(this),fail:this.fail.bind(this),next:this.next.bind(this),auto:this.root.auto.bind(this.root),cross:this.cross.bind(this),addBase:this.root.addBase.bind(this.root),polling:this.root.polling.bind(this.root),setStatusAttr:this.setStatusAttr.bind(this),setRootStatusAttr:this.setRootStatusAttr.bind(this),createFragment:this.root.createFragment.bind(this.root)}}initTimeoutMode(){if(this.gene.mode.timeout){let t=this.gene.mode.timeout;this.timeoutSystem=setTimeout(()=>{this.forceClose=!0,this.root.createSystemStatus("timeout",!0),t.action.bind(this.case)(this.base,this.bind.exit,this.bind.fail)},t.millisecond)}}initCatchUncaughtExceptionMode(){this.gene.mode.catchUncaughtException&&(this.uncaughtExceptionAction=(t=>{let e=t.stack?t:t.error;this.forceClose=!0,this.root.createSystemStatus("uncaught exception",!0,e.stack),this.gene.mode.catchUncaughtException.action.bind(this.case)(this.base,e,this.bind.exit,this.bind.fail)}),"node"===this.root.operating?(this.uncaughtExceptionDomain=require("domain").create(),this.uncaughtExceptionDomain.on("error",this.uncaughtExceptionAction)):window.addEventListener("error",this.uncaughtExceptionAction))}initGenerator(){let t=this;this.iterator=function*(){let e=1,s=t.templates[0];for(t.gene.synthesis.initiation&&(t.gene.synthesis.initiation.bind(t.case)(t.base,t.getSkill(),t.bind.next,t.bind.exit,t.bind.fail),yield);e<=1e4&&!t.finish;){if(null==s)t.bind.exit();else{let i=new c(s.name,"template");t.root.status.addChildren(i),t.root.setTargetStatus(i);let n=()=>{n=null,s=t.templates[e++],i.set(!0),t.bind.next(),t.root.setTargetStatus(null)};s.action.bind(t.case)(t.base,t.getSkill(),n,t.bind.exit,t.bind.fail)}yield}}()}deepClone(t,e=new WeakMap){if(Object(t)!==t)return t;if(t instanceof Set)return new Set(t);if(e.has(t))return e.get(t);const s=t instanceof Date?new Date(t):t instanceof RegExp?new RegExp(t.source,t.flags):Object.create(null);return e.set(t,s),t instanceof Map&&Array.from(t,([t,i])=>{s.set(t,this.deepClone(i,e))}),Object.assign(s,...Object.keys(t).map(s=>({[s]:this.deepClone(t[s],e)})))}getSkill(){return{each:t.each,auto:this.bind.auto,frag:this.bind.createFragment,cross:this.bind.cross,polling:this.bind.polling,addBase:this.bind.addBase,deepClone:this.deepClone,setStatusAttr:this.bind.setStatusAttr,setRootStatusAttr:this.bind.setRootStatusAttr,createFragment:this.bind.createFragment}}setRootStatusAttr(t,e){this.root.rootStatus.addAttr(t,e)}setStatusAttr(t,e){this.status.addAttr(t,e)}cross(t,e){t instanceof l?t.transcription().then(t=>{this.root.status.addChildren(t.status),e(null,t)},t=>{this.root.status.addChildren(t.status),e(t.getErrorMessage(),t)}):this.$systemError("cross","Target not a gene module.",t)}close(t,e,s){this.root.close(t,e,this.forceClose,()=>{this.timeoutSystem&&clearTimeout(this.timeoutSystem),this.gene.mode.catchUncaughtException&&"node"!==this.root.operating&&window.removeEventListener("error",this.uncaughtExceptionAction),this.gene.synthesis.termination&&this.gene.synthesis.termination.call(this.case,this.base,this.root.rootStatus),s()})}fail(t){!1===this.finish&&(this.finish=!0,this.close(!1,t||"unknown error",()=>{this.reject(new h(this.root))}))}exit(t){!1===this.finish&&(this.finish=!0,this.close(!0,t,()=>{this.resolve(new h(this.root))}))}next(){!1===this.finish&&(this.gene.mode.traceBase&&this.gene.mode.traceBase.action(this.deepClone(this.root.base),this.status),this.gene.synthesis.elongation&&this.gene.synthesis.elongation(this.base,this.bind.exit,this.bind.fail),setTimeout(()=>{this.synthesis()},1))}synthesis(){this.synthesisTryCatchMode()}synthesisTryCatchMode(){if(this.gene.mode.catchException)try{this.synthesisCatchUncaughtExceptionMode()}catch(t){return this.gene.mode.catchException&&(this.forceClose=!0,this.root.createSystemStatus("error catch",!0,t.stack),this.gene.mode.catchException.action.bind(this.case)(this.base,t,this.bind.exit,this.bind.fail)),!1}else this.synthesisCatchUncaughtExceptionMode()}synthesisCatchUncaughtExceptionMode(){this.gene.mode.catchUncaughtException&&"node"===this.root.operating?this.uncaughtExceptionDomain.run(()=>{this.iterator.next()}):this.iterator.next()}}return class{static createGene(t,e){return new l(t,e)}static createOperon(t){return new r(t).exports()}}});