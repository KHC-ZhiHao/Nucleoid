!function(t,e){"undefined"!=typeof module&&"object"==typeof exports?module.exports=e():"function"==typeof define&&(define.amd||define.cmd)?define(function(){return e}):t.Nucleoid=e()}(this||("undefined"!=typeof window?window:global),function(){class t{static each(e,s){if(Array.isArray(e)){var i=e.length;for(let t=0;t<i;t++){if("_break"===s(e[t],t))break}return}let n=typeof e;if("object"!==n)if("number"!==n)t.systemError("Supports","each","Each only support object, array, number.",e);else for(let t=0;t<e;t++){if("_break"===s(t,t))break}else for(let t in e){if("_break"===s(e[t],t))break}}static systemError(t,e,s,i="$_no_error"){throw"$_no_error"!==i&&console.log("error data => ",i),new Error(`(☉д⊙)!! Nucleoid::${t} => ${e} -> ${s}`)}static deepClone(e,s=new WeakMap){if(Object(e)!==e)return e;if(e instanceof Set)return new Set(e);if(s.has(e))return s.get(e);const i=e instanceof Date?new Date(e):e instanceof RegExp?new RegExp(e.source,e.flags):Object.create(null);return s.set(e,i),e instanceof Map&&Array.from(e,([e,n])=>{i.set(e,t.deepClone(n,s))}),Object.assign(i,...Object.keys(e).map(i=>({[i]:t.deepClone(e[i],s)})))}static inspect(e,s=[]){if(null==e)return null;let i=Array.isArray(e)?[]:{};for(let n in e){let r=e[n],o=typeof r;if("function"!==o)if("object"===o){let o=[e].concat(s);o.includes(r)?i[n]="Circular structure object.":i[n]=t.inspect(r,o)}else i[n]=r}return i}static getAllPrototype(e){let s=[];return e.prototype&&(s=Object.getOwnPropertyNames(e.prototype)),e.__proto__&&(s=s.concat(t.getAllPrototype(e.__proto__))),s.filter((t,e,s)=>s.indexOf(t)===e&&"constructor"!==t)}}class e{constructor(t){this.$moduleBase={name:t||"no name"}}$systemError(e,s,i){t.systemError(this.$moduleBase.name,e,s,i)}$noKey(t,e,s){return null==e[s]||(this.$systemError(t,`Name(${s}) already exists.`),!1)}$verify(t,e,s={}){let i={};for(let s in e){let n=e[s];if(n[0]&&null==t[s])return void this.$systemError("verify","Must required",s);t[s]?typeof n[1]!==("string"==typeof t[s]&&"#"===t[s][0])||t[s].slice(1)?i[s]=t[s]:this.$systemError("verify",`Type(${typeof n[1]}) error`,s):i[s]=n[1]}return Object.assign(i,s)}$protection(t,e,s,i){s[e]=i,Object.defineProperty(t,e,{set:()=>{this.$systemError("protection","This key is a private key, can't be change.",e)},get:()=>s[e]})}}class s{}class i extends e{constructor(t,e){super("PollingEvent"),this.name=e.name,this.status=new l(this.name,"polling"),this.action=e.action,this.finish=!1,t.status.addChildren(this.status)}activate(){this.action(this.close.bind(this))}close(){this.status.set(!0),this.finish=!0}}class n extends e{constructor(t,e){super("Fragment"),this.over=0,this.name=e||"no name",this.stop=!1,this.status=new l(this.name,"fragment"),this.thread=[],t.status.addChildren(this.status)}install(t){this.callback=(e=>{e?this.status.set(!1,e):this.status.set(!0),t(e)})}use(){return{add:this.add.bind(this),eachAdd:this.eachAdd.bind(this),activate:this.activate.bind(this)}}add(t){this.thread.push(this.$verify(t,{name:[!0,"#string"],action:[!0,"#function"]}))}eachAdd(e,s="no name",i){return t.each(e,(t,e)=>{this.add({name:s+`(${e})`,action:function(s,n){i(t,e,s,n)}})}),this.use()}regsterError(t){return e=>{!1===this.stop&&(t.set(!1,e),this.stop=!0,this.callback(e||"unknown error"))}}regsterOnload(t){return()=>{t.set(!0),this.over+=1,!1===this.stop&&this.over>=this.thread.length&&(this.stop=!0,this.callback())}}actionThread(t){(async()=>{let e=new l(t.name,"frag-thread"),s=this.regsterOnload(e),i=this.regsterError(e);this.status.addChildren(e),t.action(i,s)})()}activate(t){let e=this.thread.length;this.install(t);for(let t=0;t<e;t++)this.actionThread(this.thread[t]);0===e&&this.callback(null),this.activate=(()=>{this.$systemError("activate",`This template(${this.name}) already  called`)})}}class r extends e{constructor(t,e){super("Auto"),this.name=e.name||"No name",this.root=t,this.status=new l(this.name,"auto"),this.action=this.createAction(e.action),this.finish=!1,this.init()}init(){this.root.status.addChildren(this.status),this.action(this.error.bind(this),this.onload.bind(this))}createAction(t){return"function"!=typeof t&&this.$systemError("createAction","Action not a function",t),async function(e,s){t(e,s)}}error(t){this.finish=!0,this.status.set(!1,t)}onload(){this.finish=!0,this.status.set(!0)}}class o extends e{constructor(t){super("Operon"),this.data=this.$verify(t,{units:[!0,{}],structure:[!0,[]]}),this.validate()}get units(){return this.data.units}validate(){!1===Array.isArray(this.data.structure)&&this.$systemError("validate","Structure not a array.",this.data.structure);for(let e in this.units){let s=this.units[e];null!=s.constructor&&null!=s.prototype||this.$systemError("validate","Unit not a constructor.",e);let i=t.getAllPrototype(s);for(let t of this.data.structure)!1===i.includes(t)&&this.$systemError("validate",`Property(${t}) not found.`,t)}}use(t,e){let s=this.createContext(t,e),i=this.getUnit(t);return this.useUnit(i,s)}createContext(t,e){return{data:e,useName:t}}useUnit(t,e){let s=new t(e),i={};for(let t of this.data.structure)i[t]=s[t].bind(s);return i}getUnit(t){if(this.data.units[t])return this.data.units[t];this.$systemError("getUnit","Unit not found.",t)}exports(){return{use:this.use.bind(this)}}}class a extends e{constructor(t){super("Root"),this.gene=t,this.name=t.name,this.base={},this.autos=[],this.delay=5,this.interval=null,this.operating="undefined"==typeof window?"node":"browser",this.rootStatus=new l(this.name,"root"),this.protection={},this.carryStatus=null,this.pollingEvents=[],this.initBase()}get status(){return this.carryStatus||this.rootStatus}initPolling(){this.interval=setInterval(()=>{let t=!1;for(let e=0;e<this.pollingEvents.length;e++){let s=this.pollingEvents[e];s.finish?t=!0:s.activate()}t&&this.clearPollingEvents()},this.delay)}initBase(){if(this.gene.mode.isEnable("genetic")){let t=this.gene.mode.use("genetic").action();if("object"==typeof t)for(let e in t)this.addBase(e,t[e]);else this.$systemError("initBase","Genetic retrun not a object",t)}}getBase(){let t={};for(let e in this.base)t[e]=this.base[e];for(let e in this.protection)t[e]=this.protection[e];return t}setTargetStatus(t){this.carryStatus=t}createSystemStatus(t,e,s){let i=new l(t,"system");i.set(e,s),this.status.addChildren(i)}addBase(t,e){null==this.base[t]?"$"===t.slice(0,1)?this.$protection(this.base,t,this.protection,e):this.base[t]=e:this.$systemError("addBase","Base key already exists.",t)}polling(t){null==this.interval&&this.initPolling(),this.pollingEvents.push(new i(this,t))}auto(t){this.autos.push(new r(this,t))}clearPollingEvents(){this.pollingEvents=this.pollingEvents.filter(t=>!1===t.finish)}createFragment(t){return new n(this,t).use()}close(t,e){this.rootStatus.set(t,e),this.interval&&clearInterval(this.interval)}checkAutoOnload(){return null==this.autos.find(t=>!1===t.finish)}}class h{constructor(t){this.name=t.name,this.base=t.base,this.gene=t.gene,this.status=t.rootStatus,this.success=t.rootStatus.isSuccess(),this.getBase=t.getBase}isError(){return!this.success}getErrorMessage(){return this.isError?this.status.getMessage():null}getStatusToJson(){return this.status.json()}getMode(){return this.gene.mode.used()}}class l extends e{constructor(t,e){super("Status"),this.name=t||"no name",this.type=e||"no type",this.detail=null,this.message="",this.success=!1,this.children=[],this.startTime=Date.now(),this.attributes={},this.finishTime=null}get operationTime(){return(this.finishTime||Date.now())-this.startTime}getMessage(){return this.message||"no message"}isSuccess(){return this.success}addAttr(t,e){this.attributes[t]=e}installDetail(){null==this.detail&&(this.detail={operationTime:this.operationTime})}set(t,e=""){return null==this.finishTime&&(this.success=t,this.message=e instanceof Error?e.stack:e,this.finishTime=Date.now(),this.installDetail()),this}get(){let t={name:this.name,type:this.type,detail:this.detail,message:this.message,success:this.success,attributes:this.attributes,children:[]};for(let e of this.children)t.children.push(e.get());return t}getErrorStatus(){let e=t.inspect(this.get()),s=[],i=function(t,e){!1===t.success&&s.push(t);for(let e of t.children)i(e);if(e)return s};return i(e,!0)}json(){let e=t.inspect(this.get());return JSON.stringify(e,null,4)}html(){let e=t.inspect(this.get()),s=function(t){let e=`<div style="padding:5px; margin: 5px; border:${`solid 1px ${t.success?"blue":"red"}`}">`;e+=`<div>type : ${t.type}</div>`,e+=`<div>name : ${t.name}</div>`,e+=t.message?`<div>message : <br><pre>${t.message}</pre></div>`:"",t.detail&&(e+="<div>detail : ",e+=`<pre>${JSON.stringify(t.detail,null,4)}</pre>`,e+="</div>");for(let s in t.attributes)e+=`<div> attributes(${s}) : `,e+=`<pre>${JSON.stringify(t.attributes[s],null,4)}</pre>`,e+="</div>";let i=t.children.length;for(let n=0;n<i;n++)e+=s(t.children[n]);return e+="</div>"};return s(e)}addChildren(t){t instanceof l?this.children.push(t):this.$systemError("addChildren","Child not a status class.",t)}}class c extends e{constructor(){super("Mode"),this.data={},this.init()}init(){this.createMode("try-catch-mode"),this.createMode("uncaught-exception-mode"),this.createMode("trace-base-mode"),this.createMode("genetic"),this.createMode("initiation"),this.createMode("elongation"),this.createMode("termination"),this.createMode("timeout",{ms:{type:"number",value:0,require:!0}})}proxy(t){let e=this;return new Proxy(t,{get(t,s){let i="_"===s[0];i&&(s=s.slice(1));let n=t[s];return null==n?e.$systemError("getMode",`Param(${s}) not found.`):i?n:n.value},set(t,s,i){let n=t[s];return null==n?(e.$systemError("setMode",`Param(${s}) not allowed.`),!1):t.protect.value?(e.$systemError("setMode",`Param(${s}) is protect.`),!1):typeof i!==n.type?(e.$systemError("setMode",`Param(${s}) type is ${typeof i}, must require ${n.type}.`),!1):(n.value=i,!0)}})}createMode(t,e={}){this.data[t]=this.proxy({action:{type:"function",value:null,require:!0},enable:{type:"boolean",value:!1,require:!0},protect:{type:"boolean",value:!1,require:!1},...e})}exports(){return{use:this.use.bind(this),set:this.set.bind(this),used:this.getUsed.bind(this),isEnable:this.isEnable.bind(this)}}getUsed(){let t=[];for(let e in this.data)this.data[e].enable&&t.push(e);return t}isEnable(t){return null==this.data[t]&&this.$systemError("isEnable",`Mode(${t}) not found.`),this.data[t].enable}hasRequire(t,e){for(let s in t)if(t["_"+s].require&&null==e[s])return this.$systemError("hasRequire",`Param(${s}) is require.`,e),!1;return!0}use(t){return null==this.data[t]&&this.$systemError("useMode",`Mode(${t}) not found.`),this.data[t]}set(t,e){let s=this.data[t];"object"!=typeof e&&this.$systemError("setMode","Options not a object."),null==s&&this.$systemError("setMode",`Mode(${t}) not found.`),this.hasRequire(s,e)&&this.setMode(s,e)}setMode(t,e){for(let s in e)t[s]=e[s]}}class u extends e{constructor(t,e){super("Gene"),this.setName(t||"no name"),this.mode=(new c).exports(),this.alias=null,this.templates=[],this.setOptions(e)}get name(){return this.mainName+(this.alias||"")}setOptions(t={}){"object"!=typeof t&&this.$systemError("setOptions","Options not a object.",t),t.timeoutMode&&this.mode.set("timeout",t.timeoutMode),t.catchMode&&this.mode.set("try-catch-mode",t.catchMode),t.uncaughtCatchMode&&this.mode.set("uncaught-exception-mode",t.uncaughtCatchMode),t.traceBaseMode&&this.mode.set("trace-base-mode",t.traceBaseMode),t.initiation&&this.mode.set("initiation",t.initiation),t.elongation&&this.mode.set("elongation",t.elongation),t.termination&&this.mode.set("termination",t.termination),t.genetic&&this.mode.set("genetic",t.genetic),t.templates&&this.cloning(t.templates)}addName(t){"string"==typeof t?this.mainName+="-"+t:this.$systemError("addName","Name not a string.",t)}setName(t){"string"==typeof t?this.mainName=t:this.$systemError("setName","Name not a string.",t)}setAlias(t){"string"==typeof t?this.alias="-"+t:this.$systemError("setAlias","Name not a string.",t)}setTraceBaseMode(t,e,s={}){this.mode.set("trace-base-mode",{enable:t,action:e,...s})}setTimeoutMode(t,e,s,i={}){this.mode.set("timeout",{enable:t,ms:e,action:s,...i})}setCatchExceptionMode(t,e,s={}){this.mode.set("try-catch-mode",{enable:t,action:e,...s})}setCatchUncaughtExceptionMode(t,e,s={}){this.mode.set("uncaught-exception-mode",{enable:t,action:e,...s})}setGenetic(t,e={}){this.mode.set("genetic",{enable:!0,action:t,...e})}template(t,e){"string"==typeof t&&"function"==typeof e?this.templates.push({name:t,action:e}):this.$systemError("template","Params type error, try template(string, function).")}setInitiation(t,e={}){this.mode.set("initiation",{enable:!0,action:t,...e})}setElongation(t,e={}){this.mode.set("elongation",{enable:!0,action:t,...e})}setTermination(t,e={}){this.mode.set("termination",{enable:!0,action:t,...e})}cloning(t){if("object"==typeof t)for(let e in t)"function"==typeof t[e]?this.template(e,t[e]):this.$systemError("cloning","template data not a function.",e);else this.$systemError("cloning","Template not a object.")}clearTemplate(){this.templates=[]}transcription(){return new Promise((t,e)=>{new d(this,t,e)})}}class d extends e{constructor(t,e,i){super("Transcription"),this.gene=t,this.case=new s,this.root=new a(this.gene),this.finish=!1,this.reject=i,this.resolve=e,this.templates=this.gene.templates.concat(this.gene.lastTemplates),this.forceClose=!1,this.init(),this.synthesis()}get status(){return this.root.status}get base(){return this.root.base}init(){this.initBind(),this.initTimeoutMode(),this.initGenerator(),this.initCatchUncaughtExceptionMode()}initBind(){this.bind={exit:this.exit.bind(this),fail:this.fail.bind(this),next:this.next.bind(this),auto:this.root.auto.bind(this.root),cross:this.cross.bind(this),addBase:this.root.addBase.bind(this.root),polling:this.root.polling.bind(this.root),setStatusAttr:this.setStatusAttr.bind(this),setRootStatusAttr:this.setRootStatusAttr.bind(this),createFragment:this.root.createFragment.bind(this.root)}}initTimeoutMode(){if(this.gene.mode.isEnable("timeout")){let t=this.gene.mode.use("timeout");this.timeoutSystem=setTimeout(()=>{this.forceClose=!0,this.root.createSystemStatus("timeout",!0),t.action.call(this.case,this.base,this.bind.exit,this.bind.fail)},t.ms)}}initCatchUncaughtExceptionMode(){this.gene.mode.isEnable("uncaught-exception-mode")&&(this.uncaughtExceptionAction=(t=>{let e=t.stack?t:t.error;this.forceClose=!0,this.root.createSystemStatus("uncaught exception",!0,e.stack),this.gene.mode.use("uncaught-exception-mode").action.call(this.case,this.base,e,this.bind.exit,this.bind.fail)}),"node"===this.root.operating?(this.uncaughtExceptionDomain=require("domain").create(),this.uncaughtExceptionDomain.on("error",this.uncaughtExceptionAction)):window.addEventListener("error",this.uncaughtExceptionAction))}initGenerator(){let t=this;this.iterator=function*(){let e=1,s=t.templates[0];for(t.gene.mode.isEnable("initiation")&&(t.gene.mode.use("initiation").action.call(t.case,t.base,t.getSkill(),t.bind.next,t.bind.exit,t.bind.fail),yield);e<=1e4&&!t.finish;){if(null==s)t.bind.exit();else{let i=new l(s.name,"template");t.root.status.addChildren(i),t.root.setTargetStatus(i);let n=()=>{n=null,s=t.templates[e++],i.set(!0),t.bind.next(),t.root.setTargetStatus(null)};s.action.call(t.case,t.base,t.getSkill(),n,t.bind.exit,t.bind.fail)}yield}}()}getSkill(){return{each:t.each,auto:this.bind.auto,frag:this.bind.createFragment,cross:this.bind.cross,polling:this.bind.polling,addBase:this.bind.addBase,deepClone:t.deepClone,setStatusAttr:this.bind.setStatusAttr,setRootStatusAttr:this.bind.setRootStatusAttr,createFragment:this.bind.createFragment}}setRootStatusAttr(t,e){this.root.rootStatus.addAttr(t,e)}setStatusAttr(t,e){this.status.addAttr(t,e)}cross(t,e){t instanceof u?t.transcription().then(t=>{this.root.status.addChildren(t.status),e(null,t)},t=>{this.root.status.addChildren(t.status),e(t.getErrorMessage(),t)}):this.$systemError("cross","Target not a gene module.",t)}close(t,e,s){this.forceClose?(this.root.close(t,e),this.timeoutSystem&&clearTimeout(this.timeoutSystem),this.gene.mode.isEnable("uncaught-exception-mode")&&"node"!==this.root.operating&&window.removeEventListener("error",this.uncaughtExceptionAction),this.gene.mode.isEnable("termination")&&this.gene.mode.use("termination").action.call(this.case,this.base,this.root.rootStatus),s()):(this.root.checkAutoOnload()&&(this.forceClose=!0),setTimeout(()=>{this.close(t,e,s)},10))}fail(t){!1===this.finish&&(this.finish=!0,this.close(!1,t||"unknown error",()=>{this.reject(new h(this.root))}))}exit(t){!1===this.finish&&(this.finish=!0,this.close(!0,t,()=>{this.resolve(new h(this.root))}))}next(){!1===this.finish&&(this.gene.mode.isEnable("trace-base-mode")&&this.gene.mode.use("trace-base-mode").action.call(this.case,t.deepClone(this.base),this.status),this.gene.mode.isEnable("elongation")&&this.gene.mode.use("elongation").action.call(this.case,this.base,this.bind.exit,this.bind.fail),setTimeout(()=>{this.synthesis()},1))}synthesis(){this.synthesisTryCatchMode()}synthesisTryCatchMode(){if(this.gene.mode.isEnable("try-catch-mode"))try{this.synthesisCatchUncaughtExceptionMode()}catch(t){return this.forceClose=!0,this.root.createSystemStatus("error catch",!0,t.stack),this.gene.mode.use("try-catch-mode").action.call(this.case,this.base,t,this.bind.exit,this.bind.fail),!1}else this.synthesisCatchUncaughtExceptionMode()}synthesisCatchUncaughtExceptionMode(){this.gene.mode.isEnable("uncaught-exception-mode")&&"node"===this.root.operating?this.uncaughtExceptionDomain.run(()=>{this.iterator.next()}):this.iterator.next()}}return class{static createGene(t,e){return new u(t,e)}static isGene(t){return t instanceof u}static createOperon(t){return new o(t).exports()}}});