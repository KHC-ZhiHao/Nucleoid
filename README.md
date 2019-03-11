![logo](https://khc-zhihao.github.io/MyBook/Nucleoid/static/images/logo.png)

[![NPM Version][npm-image]][npm-url]

## 簡介 (Summary)

Nucleoid是基於Promise的一個流程控制系統，早期目的就是為了處裡server less中cloud function太難追蹤堆棧和錯誤的問題，但現在它具有一個完整的生命週期與友善的非同步操作、堆棧追蹤等，能協助各種模式。

## 安裝 (Install)

#### html

```html
<script src="https://khc-zhihao.github.io/Nucleoid/dist/index.js"></script>
```

#### webpack

```js
import Nucleoid from 'nucleoid'
```

#### node

```bash
npm i nucleoid
```

## 開始 (How to use?)

[教學文件 (base gitbook)](https://khc-zhihao.github.io/MyBook/Nucleoid/static/)

```js
const Nucleoid = require('nucleoid')
Nucleoid.createGene('my first gene', {
    templates: {
        'first template': (base, skill, next, exit, fail) => {
            base.start = true
            next()
        },
        'next template': (base, skill, next, exit, fail) => {
            base.next = true
            next()
        }
    }
}).transcription().then((messenger) => {
    console.log(messenger.base.start) // true
})
```

---

## 其他
[版本日誌](https://github.com/KHC-ZhiHao/Nucleoid/blob/master/document/version.md)

[開發者文件](https://khc-zhihao.github.io/Nucleoid/document/document.html)

[npm-image]: https://img.shields.io/npm/v/nucleoid.svg
[npm-url]: https://npmjs.org/package/nucleoid
