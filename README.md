# Nucleoid

[![NPM Version][npm-image]][npm-url]

## 簡介 (Summary)

Nucleoid是基於Promise的一個流程控制系統，早期目的就是為了處裡server less中cloud function太難追蹤堆棧和錯誤的問題，但現在它具有一個完整的生命週期與友善的非同步操作、堆棧追蹤等，能協助各種雲端架構模式，例如RESTful API的Request與Response。

Nucleoid is a Promise based process control system. The early purpose was to make it difficult to track stacks and errors in the cloud function, but now it has a complete life cycle and can help with RESTful APIs such as Request and Response.

>Nucleoid是因應cloud function而生，但實際上不一定得用在這個領域，畢竟本質是一個流程控制的系統。

## 範例(Example)

因為Nucleoid越來越複雜，Readme已經難以加入說明，補足文件和範例看來是必要的了。

[Example](https://github.com/KHC-ZhiHao/Nucleoid/blob/master/example)

>範例採用了[joi](https://github.com/hapijs/joi)模塊作為驗證的工具。

>範例採用了[packhouse](https://github.com/KHC-ZhiHao/Packhouse)模塊作model使用。

## 安裝

該函示庫開發的過程中有兩個分水嶺，從1.0.8版本後我發現它值得更好，因此決定重構內部代碼，借鏡了rxjs與async的概念，並在實戰一些專案後，才在1.4.5版從血泊中爬起，因此本文件只支援1.4.5以上版本。

#### html

```html
<script src="https://khc-zhihao.github.io/Nucleoid/dist/index.js"></script>
```

#### node

```bash
npm i nucleoid
```

## 如何開始

server less給了我們雲端伺服器架構的藍圖，不再需要在程式碼中處理各種middleware，只需要構思如何一氣呵成的寫完每個functions。

---

### 建立一支基因

基因是整個流程最高單位，你必須定義基因的週期與執行模板。

#### web
```js
var gene = Nucleoid.createGene()
```

#### webpack

```js
import Nucleoid from 'nucleoid'
var gene = Nucleoid.createGene()
```

#### nodejs

```js
var Nucleoid = require('nucleoid')
var gene = Nucleoid.createGene()
```

---

### Base

DNA是由含氮鹼基(nitrogenous base)所構成的，在Nucleoid中以base代稱，base是一個物件，將在整個生命週期中被傳遞，直到最後被輸出。

---

### 跳脫

Gene是基於Promise運行的，exit與fail分別對應resolve, reject兩個行為。

#### next

為接續下一個動作，於起始和模板中使用。

#### exit

直接執行或整個模板執行結束後呼叫，返回resolve。

#### fail

直接執行中斷流程，fail可以傳入一個參數，它將呈現在root status中的message，並返回reject。

---

### 定義遺傳因子

如果定義了遺傳因子，這將在每次執行模板後自動加入回傳的物件於base中。

>若在key的首字加入$字號，則會建立一個受保護不能被更動的物件。

```js
gene.setGenetic(() => {
    return {
        $response: {
            body: null,
            status: 200,
            change: false,
            set: function(code, body) {
                this.body = body
                this.status = code
                this.change = true
            }
        }
    }
})
```

---

### 定義生命週期

gene分為起始、延長與終止三個周期，分別處裡各種不同的狀況。

#### 起始

基本上起始就是一個模板屬性，但不會記載至status中。

```js
// 將Initiation應用在處理request上
let request = {
    author: 'khc'
}
gene.setInitiation((base, skill, next, exit, fail) => {
    skill.addBase('$request', request)
    if (base.$request.author !== 'khc') {
        base.$response.set(422, 'wtf')
        exit()
    } else {
        next()
    }
})
```

#### 延長

在每次執行模板後都會呼叫一次延長週期，可以在這判定base的變異是否正確。

```js
// 如果Response發生過改變，中斷程序
gene.setElongation((base, exit, fail) => {
    if (base.$response.change) {
        exit()
    }
})
```

#### 終止

不論任何可能中斷了流程，最終都會呼叫終止期，此處最重要的地方是在於status的後處裡。

```js
// 當Response Code錯誤，廣播錯誤通知工程師
gene.setTermination((base, status) => {
    if (base.$response.status !== 200) {
        status.addAttr('error', base.$response.message)
        YourBroadcastSystem(status.json())
    }
})
```

---

### 為這支基因描述模板

模板是整個流程控制的中樞，在cloud function的實踐中，我將其用來控制每個API的實際行為，可以視作為類似controller的實現。

```js
//預設情況建立了兩支API
getAuthorGender() {
    gene.template('get gender', (base, skill, next, exit, fail) => {
        base.$response.set(200, 'boy')
        next()
    })
}

gerAuthorAge() {
    gene.template('get age', (base, skill, next, exit, fail) => {
        base.$response.set(200, 18)
        next()
    })
}
```

---

### 轉錄建立的基因

宣告轉錄是最後的步驟，回傳一個Promise，執行並等待整個生命周期結束，並擲出一個messenger物件。

```js
gene.transcription().then((messenger) => {
    // exit or finish
    let response = {
        body: messenger.base.$response.body
        status: messenger.base.$response.status,
    }
    YourResponseToClientSystem(response)
}, (messenger) => {
    // fail
    let response = {
        body: 500,
        status: 'Unknown error'
    }
    YourResponseToClientSystem(response)
})
```

---

## 使用技能

雖然你已經成功定義好了API，但總有一些不順手對吧？

Skill扮演了一個helper的腳色，它穿梭於整個模板中，幫你度過難關，在某些技能的使用上甚至會加入至status中。

---

### 使用片段(fragment)

fragment在宣告activate時，會同步執行所有被加入的function，每個function都會被加入一個status，並等待所有function都呼叫onload或其中一隻呼叫error時執行callback。

> 1.5.1版本支援skill.frag()，效果與createFragment相同

```js
gene.template('use fragment', (base, skill, next, exit, fail) => {
    let fragment = skill.createFragment('add count')
    base.count = 0
    fragment.add({
        name: 'add1',
        action(error, onload) {
            base.count += 1
            onload()
        }
    })
    fragment.add({
        name: 'add2',
        action(error, onload) {
            base.count += 1
            onload()
        }
    })
    fragment.activate((error) => {
        console.log(base.count) // 2
        next()
    })
})
```

#### 迭代加入片段

使用eachAdd迭代加入片段，eachAdd會回傳自身frag，協助優化代碼。

```js
gene.template('Fragment eachAdd', (base, skill, next, exit, fail) => {
    base.fragmentEachAdd = 0
    skill.frag('eachAdd').eachAdd([1,2,3,4], 'name', (data, index, err, onload) => {
        base.fragmentEachAdd += data
        onload()
    }).activate((error) => {
        next()
    })
})
```

---

### 自動處理

Auto能夠離開template的運作邏輯，在沒有宣告onload之前，Transcription不會結束。

```js
gene.template('use auto', (base, skill, next, exit, fail) => {
    skill.auto({
        name: 'auto',
        action(error, onload) {
            setTimeout(() => {
                base.auto = true
                onload()
            }, 2000)
        }
    })
    next()
})
gene.transcription().then((messenger) => {
    // wait 2000ms
    console.log(messenger.base.atuo)
})
```

---

### 加入鹼基

直接宣告base.$foo是不會有任何保護作用的，可以使用skill.addBase實現此功能。

```js
gene.template('use add base', (base, skill, next, exit, fail) => {
    skill.addBase('$foo', 'foo')
    base.$foo = 'bar' // error
    next()
})
```

---

### 基因雜交

或許你的API有著令人難以費解的複雜公式與資料結構，建立多支基因的可能性大增時，cross會幫助你執行外部基因並導入status至呼叫基因中。

```js
gene.template('use cross', (base, skill, next, exit, fail) => {
    let crossGene = anotherGene
    skill.cross(crossGene, (err, messenger) => {
        if (err) {
            base.error = err
        }
        base.cross = messenger.base
        next()
    })
})
```

---

### 深拷貝

複製一個物件。

```js
gene.template('use deep clone', (base, skill, next, exit, fail) => {
    let obj = {
        a: {
            b: 5
        }
    }
    base.clone = skill.deepClone(obj)
    base.clone.a.b = 10 // 10
    console.log(obj.a.b) // 5
    next()
})
```

---

### 輪詢

Nucleoid提供了一個Interval(5 millisecond)來實現輪詢機制，避免再每個template中建立多個Interval。

```js
gene.template('use polling', (base, skill, next, exit, fail) => {
    base.count = 0
    system.polling({
        name: 'polling',
        action(stop) {
            base.count += 1
        }
    })
    next()
})
```

---

### 添加狀態屬性

為最終的輸出狀態添加訊息。

```js
gene.template('use set status attr', (base, skill, next, exit, fail) => {
    // 記載至當年template的狀態
    skill.setStatusAttr('now', 5)
    // 記載根狀態的狀態
    skill.setRootStatusAttr('root', 10)
    next()
})
```

---

### 迭代器

到哪都能看見的each，且是同步的。

```js
gene.template('use each', (base, skill, next, exit, fail) => {
    skill.each([1,2,3,4], (data, index) => {
        console.log(data) // 1,2,3,4
    })
    next()
})
```

---

## 操控子 Operon

Operon為建立統一IO狀態模式的物件，協助規範class和接口，簡潔在邏輯層需要的配置。

### class

```js

    class Request {

        constructor(context) {
            // context = { data 可以外部傳進實例化的class }
            this.complete = false
        }

        set() {
            this.complete = true
        }

        isSet() {
            return this.complete
        }

    }

    //if Event like Request, have some prototype...

```

### operon

```js
let operon = Nucleoid.createOperon({
    structure: ['set', 'isSet'],
    units: {
        request: Request,
        event: Event
    }
})
```

### gene

```js
gene.setGenetic(() => {
    return {
        $io: operon.use('request', contextData)
    }
})

gene.setElongation((base, exit, fail) => {
    if (base.$io.isSet()) {
        exit()
    }
})
```

---

## 監聽模式

Nucleoid將協助你監聽每個template的狀態，加速開發除錯。

---

### 錯誤捕捉

如果將錯誤捕捉模式宣告為true，在每個template執行時都會用try-catch處理，
當發現錯誤，執行該函數。

>錯誤後必需執行exit或fail，整個流程並不會繼續執行下去。

>該模式會強制宣告try-catch在每個template內，建議勿使用於production版本內。

```js
gene.setCatchExceptionMode(true, (base, exception, exit, fail) => {
    fail(exception.message)
})
```

---

### 未捕捉錯誤

就算使用try-catc包覆，也無法catch非同步函數造成的錯誤，如果有這類的困擾，就使用UncaughtException吧。

>錯誤後必需執行exit或fail，整個流程並不會繼續執行下去。

```js
gene.setCatchUncaughtExceptionMode(true, (base, exception, exit, fail) => {
    fail(exception.message)
})
```

---

### 鹼基追蹤

在每次執行完template後，自動深拷貝一個base在定義的函數中，並可以操作該template的status。

>深拷貝非常吃效能，請自行評估系統上線後是否關閉追蹤。

```js
gene.setTraceBaseMode(true, (cloneBase, status) => {
    status.addAttr('base', cloneBase)
})
```

---

### 逾時處理

整個流程如果大於設定時間(毫秒)，執行設定的函數。

```js
gene.setTimeoutMode(true, 20000, (base, exit, fail) => {
    fail('Timeout')
})
```

---

## Messenger

Messenger是Transcription後的完成品，它主要攜帶著整個系統的兩個核心 **base** 和 **status**。

>可以藉由getBase()打印出受保護的base。

```js
// if base {a: 5, $b: 10}
gene.transcription().then((messenger) => {
    console.log(Object.keys(messenger.base)) // a
    console.log(Object.keys(messenger.getBase())) // a, $b
    console.log(messenger.status)
}
```

---

## Status

status是整個系統堆蹤堆棧的核心，其實也是Nucleoid最初的目的，它是一個樹狀結構。

>Messenger攜帶的status便是root status。

---

#### status.get()

status需要解讀必須經由get()來取得該狀態序列化的結構。

#### status.addAttr(key, value)

attributes是打印status中唯一的可自定義接口，使用addAttr()來加入attribute。

```js
status.addAttr('key', 'value')
console.log(status.get().attributes.key) // value
```

#### status.json()

回傳status樹狀結構的json文本。

#### status.html()

回傳一個html文本，雖然沒有json詳細，但更直觀。

---

## 支援環境(support)

Nodejs 8+ or support ES6 browser.

---

## 其他
[版本日誌](https://github.com/KHC-ZhiHao/Nucleoid/blob/master/document/version.md)

[開發者文件](https://khc-zhihao.github.io/Nucleoid/document/document.html)

[npm-image]: https://img.shields.io/npm/v/nucleoid.svg
[npm-url]: https://npmjs.org/package/nucleoid