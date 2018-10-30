# Nucleoid

[![NPM Version][npm-image]][npm-url]

### 簡介(overview)

#### 中文:

Nucleoid是基於Promise的流程控制系統，起初目的為cloud functions流程處理，因此會有些不合常理的嚴格判定，但Nucleoid並沒有限制運行環境與使用方向。

#### english:

Nucleoid is a Promise based process control system. The original purpose is to process the cloud functions, So there will be some unreasonable strict judgments, But Nucleoid does not limit the operating environment and direction of use.

### 安裝(install)

node & webpack
```bash
$ npm i nucleoid
```

### 如何開始(How to use)

```js
let Nucleoid = require('nucleoid')
let nuc = new Nucleoid()
    nuc.setName('demo');
```

#### Messenger

建立信使，他將協助你在流程中攜帶你所需的物件，並在完成流程後被擲出

Add Messenger, It carrying the objects you need in the process. And thrown after completing.

```js
nuc.addMessenger('count', 0);
```

#### Promoter

設定啟動子，在運行時呼叫並可以判定是否跳出

Set promoter, Run at the beginning, Can use exit method.

```js
nuc.setPromoter((messenger, exit)=>{
    if( messenger.count !== 0 ){
        exit()
    }
});
```

#### Mediator

設定中介者，在每次呼叫貯列後運行，可以判定是否跳出

Set mediator, Run at the queue middle, Can use exit method.

```js
nuc.setMediator((messenger, exit)=>{
    if( messenger.count === 0 ){
        exit()
    }
});
```

#### Terminator

設定終結點，當運行exit或流程結束時運行，你可以在此修改輸出的status

Set terminator, Run at the exit or end of process. You can rewrite status on here.

```js
nuc.setTerminator((messenger, status)=>{
    console.log('finish!')
})
```

#### Timeout

設定逾時，整體流程運行時間超過時跳出並執行
>基於javascript單線程設計，這裡設定的時間並不準確，若在cloud function的運行環境請預留更多的判定時間

Set timeout, Break out and execute when the overall process runs longer than.
>Based on javascript single-threaded design, The time set here is not accurate. If you are in the cloud function environment, Please reserve more judgment time.

```js
nuc.setTimeout( 3000, (messenger)=>{
    console.log('time out!')
})
```

#### Queue

建立流程貯列，在呼叫運行時依序運行。

Create queue function, Run sequentially while the call is running.

```js
nuc.queue( 'add_count', (messenger, next)=>{
    messenger.count += 1;
    next()
})

nuc.queue( 'add_count_2', (messenger, next)=>{
    setTimeout(()=>{
        messenger.count += 1;
        next()
    }, 1000)
})
```

#### Transcription 

transcription 將回傳一個 Promise 物件，並運行整個流程，每一個實例化的Nucleoid只能運行一次。

>關於 stack start 屬性為起始運行時間，基於判定是否有回應時間過長的api，但此時間是不準確的，僅供參考。

Transcription will return a Promise object and run the entire process, And each instantiated Nucleoid can only be run once.

>The stack start attribute is the starting runtime, Based on the determination of whether there is an api that takes too long to respond, But this time is not accurate and is for reference only.

```js
//Trymode為測試模式，當你開啟他時，會將每個貯列使用try-catch宣告，當遇到catch時則宣告exit並丟出error
//Trymode default false, If open and every queue try-catch call, Exits and throws error when it encounters a capture.
nuc.trymode = true
nuc.transcription().then((data)=>{
    console.log(data)
})

//data
{
    "status": {
        "name": "demo",
        "step": "finish",
        "stack": [
            {
                "step": "promoter",
                "start": 0
            },
            {
                "step": "queue:add_count",
                "start": 0
            },
            {
                "step": "mediator",
                "start": 0
            },
            {
                "step": "queue:add_count_2",
                "start": 1
            },
            {
                "step": "mediator",
                "start": 246
            },
            {
                "step": "finish",
                "start": 247
            }
        ]
    },
    "messenger": {
        "count": 2
    }
}
```

[npm-image]: https://img.shields.io/npm/v/nucleoid.svg
[npm-url]: https://npmjs.org/package/nucleoid