# Nucleoid

[![NPM Version][npm-image]][npm-url]

### 簡介(overview)

#### 中文:

對於雲端服務在建構的過程中，除錯、驗證、request-response等響應往往要搭配複合式的服務去建立，這讓我們在編寫cloud function時得花很長的時間去尋找查詢方向，且在迭代器的處理也沒有足夠底層能應付各類狀況。

而serverless的誕生讓組件的共用性提高，因此能夠擔任偽週期處理的Nucleoid就此誕生。

Nucleoid是基於Promise的流程控制系統，起初目的為cloud functions流程處理，因此會有些不合常理的嚴格判定，但Nucleoid並沒有限制運行環境與使用方向。

#### english:

>以下翻譯都來自 google translate，等待高人出手相救

In the process of constructing the cloud service, the response, debugging, re-application and response are often combined with the composite service, which makes it take a long time to find the query direction when writing the cloud function. There is not enough bottom layer in the iterator to handle various situations.

The absence of a server has increased the commonality of components, so the class that can be used as a pseudo-cycle is born.

Nucleoid is a Promise based process control system. The original purpose is to process the cloud functions, So there will be some unreasonable strict judgments, But Nucleoid does not limit the operating environment and direction of use.

### 支援環境(support)

Nodejs 8+ or support ES6 browser

### 安裝(install)

```bash
$ npm i nucleoid
```

### 如何開始(How to use)

```js
let Nucleoid = require('nucleoid')
```

#### Methods

設定全域方法，可以個別導入貯列中，協助封裝與效能優化系統，再被使用前封裝內容不會被宣告，你不必再每次呼叫時引入不必要的套件

Set the global method, which can be introduced separately in the storage, assist the packaging and performance optimization system, and the package content will not be announced before being used. You don't have to introduce unnecessary kits every time you call.

```js
Nucleoid.regsterMethod('helloWorld', (store) => {
    //you can use require() on here
    store.hello = 'hello ';
    return function(){
        return 'world!';
    }
})
```

判定有無Method來防止require()快取錯誤

HasMethod prevent of the nodejs require() cache.

```js
Nucleoid.hasMethod('helloWorld') //return true
```

可以互相引用強化code的復用性

Reciprocity of enhanced code can be referenced to each other

```js
Nucleoid.regsterMethod('hello', (store) => {
    return function(){
        return 'hello ';
    }
})

Nucleoid.regsterMethod('hello_world', (store, piece) => {
    let hello = piece('hello').action();
    return function(){
        return hello + 'world!';
    }
})
```

#### Set Name And Use Method

建立與設定名稱，並引用Method

Create and set a name, and use method.

```js
let nuc = new Nucleoid()
    nuc.setName('demo');
    nuc.use('helloWorld');
```

#### Messenger

建立信使，他將協助你在流程中攜帶你所需的物件，並在完成流程後被擲出

Add Messenger, it carrying the objects you need in the process. And thrown after completing.

```js
//devMessage is private message.
nuc.addMessenger('body', '');
nuc.addMessenger('queryParam', Math.round(Math.random()));
nuc.addMessenger('statusCode', null);
nuc.addMessenger('devMessage', null);
```

保護模式，當使用$字號作為變數命名時，將其變數保護不可變

Protected mode, when the name is used '$' as a variable, the variable protection is immutable.

```js
//devMessage is private message.
nuc.addMessenger('$test', 1);

//example
nuc.queue('example', (messenger, next)=>{
    messenger.$test = 2
    //throw error 'This key is a private key, can't be change.'.
})
```

#### Promoter

設定啟動子，在運行時呼叫並可以判定是否跳出

Set promoter, run at the beginning, can use exit method.

```js
nuc.setPromoter((messenger, exit)=>{
    if( messenger.statusCode !== null ){
        messenger.body = 'Unknown error';
        messenger.statusCode = 500;
        messenger.devMessage = 'Status Code already exists.'
        exit()
    }
});
```

#### Mediator

設定中介者，在每次呼叫貯列後運行，可以判定是否跳出

Set mediator, run at the queue middle, can use exit method.

```js
//Watch status code have change.
nuc.setMediator((messenger, exit)=>{
    if( messenger.statusCode !== null ){
        exit()
    }
});
```

#### Terminator

設定終結點，當運行exit或流程結束時運行，你可以在此修改輸出的status

Set terminator, run at the exit or end of process. You can rewrite status on here.

```js
nuc.setTerminator((messenger, status)=>{
    if( messenger.statusCode !== 200 ){
        status.errorCode = messenger.statusCode
        status.devMessage = messenger.devMessage
        broadcast(status) //You custom broadcast system
    }
})
```

#### Timeout

設定逾時，整體流程運行時間超過時跳出並執行
>基於javascript單線程設計，這裡設定的時間並不準確，若在cloud function的運行環境請預留更多的判定時間

Set timeout, break out and execute when the overall process runs longer than.
>Based on javascript single-threaded design, the time set here is not accurate. If you are in the cloud function environment, please reserve more judgment time.

```js
nuc.setTimeout( 3000, (messenger)=>{
    messenger.statusCode = 504;
    messenger.body = 'Time out';
})
```

#### Try-Catch-mode

Trymode為測試模式，當你開啟他時，會將每個貯列使用try-catch宣告，當遇到catch時則宣告exit並丟出exception

Trymode default false, if open and every queue try-catch call, exits and throws exception when it encounters a capture.

```js
nuc.setTrymode( true, (messenger, exception)=>{
    messenger.body = 'Unknown error';
    messenger.statusCode = 500;
    messenger.devMessage = 'exception:' + exception.message;
})
```

#### uncaught-exception-mode (v1.1.6)

未捕捉模式，能獲取非同步宣告造成的錯誤

>本模式在Browser端使用window.addEventListener('error')處理

>本模式在Node端使用domain module處理

>Node 不支援 Promise, async/await

Can get errors caused by non-synchronized announcements

>This mode is handled on the Browser side using window.addEventListener('error')

>This mode is processed by the domain module on the Node side.

>Node does not support Promise, async/await

```js
nuc.setUncaughtException(true, (messenger, error)=>{
    messenger.body = error.message;
    messenger.statusCode = 500;
})

nuc.queue( 'async next', function(messenger, next, methods){
    setTimeout(()=>{
        let a= 5
        a() // error
        next()
    }, 100)
})
```

#### Queue

建立流程貯列，在呼叫運行時依序運行。

Create queue function, run sequentially while the call is running.

```js
nuc.queue( 'add_count', (messenger, next, methods)=>{
    let hello = methods('helloWorld').store.hello
    messenger.helloworld = hello + methods('helloWorld').action()
    messenger.count += 1;
    next()
})

nuc.queue( 'add_count_for_query', (messenger, next, methods)=>{
    setTimeout(()=>{
        messenger.count += 1 + messenger.queryParam;
        if( messenger.count === 3 ){
            messenger.body = 'ok! drink coffee.';
            messenger.statusCode = 200;
        } else {
            messenger.body = 'ok! drink tea.';
            messenger.statusCode = 418;
        }
        next()
    }, 1000)
})
```

#### Transcription 

transcription 將回傳一個 Promise 物件，並運行整個流程，每一個實例化的Nucleoid只能運行一次。

>關於 stack start 屬性為起始運行時間，基於判定是否有回應時間過長的api，但此時間是不準確的，僅供參考。

Transcription will return a Promise object and run the entire process, and each instantiated Nucleoid can only be run once.

>The stack start attribute is the starting runtime, based on the determination of whether there is an api that takes too long to respond, but this time is not accurate and is for reference only.

```js
//In aws lambda
exports.handler = async(event, context, callback) => {
    let response = await nuc.transcription()
    return callback(null, {
        statusCode: response.messenger.statusCode,
        body: response.messenger.body,
    });
}
```
Transcription output data :
```json
{
    "status": {
        "name": "demo",
        "step": "finish",
        "totalRunTime": 1002,
        "mode": [
            "try-catch-mode",
            "timeout"
        ],
        "stack": [
            {
                "step": "promoter",
                "start": 0
            },
            {
                "step": "queue",
                "start": 0,
                "desc": "add_count",
                "used": [{
                    "name": "helloWorld",
                    "used": []
                }]
            },
            {
                "step": "mediator",
                "start": 0
            },
            {
                "step": "queue",
                "start": 1,
                "desc": "add_count_for_query",
                "used": []
            },
            {
                "step": "mediator",
                "start": 1001
            },
            {
                "step": "finish",
                "start": 1002
            }
        ],
        "useMethods": [
            "helloWorld"
        ]
    },
    "messenger": {
        "count": 3,
        "body": "ok! drink coffee.",
        "statusCode": 200,
        "queryParam": 1,
        "helloworld": "hello world!"
    }
}
```

### 關於Promise, async/await(about Promise async/await)

try-catch-mode 和 uncaught-exception-mode 都是基於開發模式時所使用的，當你的開發過程中使用Promise, async/await時請保持良好的程式編寫，Nucleoid並不會抓取任何錯誤。

Try-catch-mode and uncaught-exception-mode are based on the development mode. When you use Promise during development, async / await please keep a good program, Nucleoid will not grab any errors.

```js
nuc.addMessenger('res', '')
nuc.setUncaughtException( development ? true : false, (messenger, error)=>{
    messenger.res = 'bad'
})
nuc.setTrymode( development ? true : false, (messenger, exception)=>{
    messenger.res = 'bad'
})

let foo = function () {
    return new Promise((resolve, reject)=>{
        if (Math.round(Math.random()) === 1) {
            resolve('lucky')
        }else{
            reject('bad!!!!')
        }
    })
}

nuc.queue( 'async', async (messenger, next)=>{
    try{
        messenger.res = await foo()
    } catch(error){
        messenger.res = error
    }
    next()
})
```

[npm-image]: https://img.shields.io/npm/v/nucleoid.svg
[npm-url]: https://npmjs.org/package/nucleoid