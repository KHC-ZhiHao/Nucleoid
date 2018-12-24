# Nucleoid

[![NPM Version][npm-image]][npm-url]

## 簡介

Nucleoid是一個流程控制系統，早期目的就是為了處裡server less中cloud function太難追蹤堆棧和錯誤的問題，但現在它具有一個完整的生命週期，甚至能順手處理Request與response等API模式，雖然稱不上是框架，但它也擁有了些許框架與函數式程式設計(functional programming)的特性。

>Nucleoid的建構模式與命名來自細胞生物學中基因表現"轉錄"的過程。

## Cloud Function

Nucleoid是因應cloud function而生，但實際上不一定得用在這個領域，畢竟只是一個流程控制的系統，之所以會不斷提到該主題，是因為接下來我會以執行一次cloud function作為範例

## 安裝

該函示庫開發的過程中有兩個分水嶺，從1.0.8版本後我發現它值得更好，因此決定重構內部代碼，借鏡了rxjs與async的概念，並在實戰一些專案後，才在1.4.5版從血泊中爬起。

因此請注意是否安裝的為1.4.5以上版本。

```bash
npm i nucleoid
```

## 文件

補充中...

## 如何開始

server less給了我們雲端伺服器架構的概念，我們不再需要像傳統伺服器一樣處理各種middleware，未來，我們只需要專注在function的編寫上

### 建立一支基因

基因是整個流程最高單位，你必須定義基因的週期與執行模板。

```js
//web
var gene = Nucleoid.createGene()

//webpack
import Nucleoid from 'nucleoid'
var gene = Nucleoid.createGene()

//nodejs
var Nucleoid = require('nucleoid')
var gene = Nucleoid.createGene()
```

### Base

DNA是由含氮鹼基(nitrogenous base)所構成的，在Nucleoid中以base代稱，base是一個物件，將在整個生命週期中被傳遞，直到最後被輸出

### 跳脫

Gene是基於Promise運行的，exit與fail分別對應resolve, reject兩個行為

next: 為接續下一個動作，於起始和模板中使用

exit: 直接執行或整個模板執行結束後呼叫，返回resolve

fail: 直接執行中斷流程，fail可以傳入一個參數，它將呈現在root status中的message，並返回reject

### 定義遺傳因子

如果定義了遺傳因子，這將在每次執行模板後自動加入回傳的物件於base中

若在key的首字加入$字號，則會建立一個受保護不能被更動的物件

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

### 定義生命週期

gene分為起始、延長與終止三個周期，分別處裡各種不同的狀況

起始

基本上起始就是一個模板屬性，但不會記載至status中

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

延長

在每次執行模板後都會呼叫一次延長週期，可以在這判定base的變異是否正確

```js
// 如果Response發生過改變，中斷程序
gene.setElongation((base, exit, fail) => {
    if (base.$response.change) {
        exit()
    }
})
```

終止

不論任何可能中斷了流程，最終都會呼叫終止期，此處最重要的地方是在於status的後處裡

```js
// 當Response Code錯誤，廣播錯誤通知工程師
gene.setTermination((base, status) => {
    if (base.$response.status !== 200) {
        status.addAttr('error', base.$response.message)
        YourBroadcastSystem(status.json())
    }
})
```

### 為這支基因描述模板

模板是整個流程控制的中樞，在cloud function的實踐中，我將其用來控制每個API的實際行為，可以視作為類似controller的實現

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

### 轉錄建立的基因

宣告轉錄是最後的步驟，回傳一個Promise，執行並等待整個生命周期結束，並擲出一個messenger物件

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

## 使用技能

雖然你已經成功定義好了API，但總有一些不順手對吧?

Skill扮演了一個helper的腳色，它穿梭於整個模板中，幫你度過難關，在某些技能的使用上甚至會加入至status中

在未來的版本更動中，多會以擴充skill為主

### 使用片段(fragment)

fragment在宣告activate時，會同步執行所有被加入的function，每個function都會被加入一個status，並等待所有function都呼叫onload或其中一隻呼叫error時執行callback。

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

### 加入鹼基

直接宣告base.$foo是不會有任何保護作用的，可以使用skill.addBase實現此功能

```js
gene.template('use fragment', (base, skill, next, exit, fail) => {
    skill.addBase('$foo', 'foo')
    base.$foo = 'bar' // error
    next()
})
```

### 基因雜交

或許你的API有著令人難以費解的複雜公式與資料結構，建立多支基因的可能性大增時，cross會幫助你執行外部基因並導入status至呼叫基因中

```js
gene.template('use fragment', (base, skill, next, exit, fail) => {
    let cross_gene = anotherGene
    skill.cross(cross_gene, (err, messenger) => {
        if (err) {
            base.error = err
        }
        base.cross = messenger.base
        next()
    })
})
```

### 深拷貝

複製一個物件

```js
gene.template('use fragment', (base, skill, next, exit, fail) => {
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

### 輪循

Nucleoid提供了一個Interval(5 millisecond)來實現輪循機制，避免再每個template中建立多個Interval

```js
gene.template('use fragment', (base, skill, next, exit, fail) => {
    base.count = 0
    system.polling({
        name: 'polling',
        action(finish) {
            base.count += 1
        }
    })
    next()
})
```

## 監聽模式

雖然我仍然建議再有疑慮的邏輯中加入try-catch來做例外處裡，但用全域處理比較好debug就是了...

在頂層定義基因時我們就可以順手定義以下模式 :

### 錯誤捕捉

如果將錯誤捕捉模式宣告為true，在每個template執行時都會用try-catch處理，
當發現錯誤，執行該函數

>錯誤後必定給執行exit或fail，整個流程並不會繼續執行下去

```js
gene.setCatchExceptionMode(true, (meg, exception, exit, fail) => {
    fail(exception.message)
})
```

### 補錯未捕捉錯誤

就算使用try-catc包覆，也無法catch非同步函數造成的錯誤，如果有這類的困擾，就使用UncaughtException吧

>錯誤後必定給執行exit或fail，整個流程並不會繼續執行下去

```js
gene.setCatchUncaughtExceptionMode(true, (meg, exception, exit, fail) => {
    fail(exception.message)
})
```
### 鹼基追蹤

在每次執行完template後，自動深拷貝一個base在定義的函數中，並可以操作該template的status

>深拷貝非常吃效能，請自行評估系統上線後是否關閉追蹤

```js
gene.setTraceBaseMode(true, (cloneBase, status) => {
    status.addAttr('base', cloneBase)
})
```

### 逾時處理

整個流程如果大於設定時間(毫秒)，執行設定的函數

```js
gene.setTimeoutMode(true, 20000, (meg, exit, fail) => {
    fail('Timeout')
})
```

## Assembly

[Assembly](https://github.com/KHC-ZhiHao/Assembly)是一個基於functional programming概念所編寫的函數包裝器，其實它是由本系統額外延伸的函示庫，因此它對於建構整個架構有著良好的相依性，算是某些補強Model的措施

>在整個基因表現的過程中，Assembly有如扮演著酵素的腳色

```js
// 可以在Initiation中將Assembly引入
let Assembly = require('assemblyjs')
let factory = new Assembly()
gene.setInitiation((base, skill, next, exit, fail) => {
    skill.addBase('$factory', factory)
})
```

## 支援環境(support)

Nodejs 8+ or support ES6 browser

[npm-image]: https://img.shields.io/npm/v/nucleoid.svg
[npm-url]: https://npmjs.org/package/nucleoid