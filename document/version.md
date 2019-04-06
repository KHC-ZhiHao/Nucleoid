# Version Log

## 1.4.6

### FIX

* timeout : 排除timeout偵測並沒有在結束事件後被停止，導致lambda無法結束

## 1.4.7

### FIX

* README => 修飾文字
* deepclone : 排除WeakMap沒有在遞迴中被引入的錯誤
* status => json : attributes序列化的過程會排除循環引用結構

### NEW

* skill => setStatusAttr : 可以在template中設定當下status屬性
* skill => setRootStatusAttr : 可以在template中設定根status的屬性

## 1.4.8

### FIX

* status => json : 解決深度循環引用結構的問題

## 1.4.9

### NEW

* Status => html() : 提供初步的HTML輸出，提供更良好的堆棧檢查畫面，內文美化的部分還在加強中

### FIX

* README => 修正錯字與修飾文字
* Polling => 修正宣告停止出現的清除錯誤
* Fragment => 針對status的success上顯示錯誤修正 

### MODIFY

* Status => 更動Try-Catch的Exception在status的輸出
* TraceBase => 保護的Base不會被clone出來

## 1.5.0

### FIX

* README => 修正錯字與修飾文字
* Polling => 輪詢時間修正

### MODIFY

* Polling => 如果整個模板中沒有呼叫過輪詢，interval不會被啟動

## 1.5.1

### INFO

以秒計費的時代，我們需要更多的迭代，更多的非同步操作！

為了統一io，現在有operons來模擬類似狀態機的模式，但因為cloud function的可能性太多了，必須預留彈性，沒有規範實在太糟糕了:(

由於Nucleoid越來越有複雜化的趨勢，是時候安排重構了。

### NEW

* Skill => each : 一個通用的迭代器
* Skill => auto : 新的外部執行續，在宣告結束前tarnscription不會結束，但錯誤擲出的模式會強行略過auto的執行
* Skill => frag : createFragment比較簡短的宣告
* Fragment => eachAdd : 迭代加入非同步片段
* Operon : 統一狀態IO
* Gene => cloning : 可通用模板接口
* Gene : 第二個參數options將協助定義行為，提供更直觀的閱讀模式
* Gene => addName : 允許我們對name添加前綴
* Gene => clearTemplate: 清空模板

### FIX

* Status => remove totalOperationTime : root的時間和總時間一樣，不曉得還放這個的目的是什麼

### MODIFY

* Status => detail : 把某些狀態移至detail
* Status => message : 在message是Error物件時，顯示stack
* 移除babel與minify改用uglifyJS，代表版本不再向下支援至es5

## 1.5.2

### NEW

* Gene => setAlias : 一個基於Name後的別名
* Gene => protect : 保護模式，每一個模式宣告後就不能再改變
* Operon => 支援繼承的structure
* Status => getErrorStatus : 只獲取錯誤的狀態

### FIX

* 修正elongation, trace-base的this沒有導向case的bug
* 修正Each丟進錯誤資料時宣告錯誤
* 修正auto和timeout衝突的bug

### MODIFY

* 重構Gene與Mode，更嚴格的檢查與更具有擴充性，且更好維護
* 盡可能統一語法至符合eslint

## 1.5.3

### NEW

* Nucleoid => isGene : 檢查一個物件使否是基因
* 開發者文件上線啦

### FIX

* Operon => 支援繼承無效修正

## 1.5.4

### FIX

* Transcription => Template concat修正

### MODIFY

* 重構Transcription

## 1.5.5

### NEW

* Nucleoid => isMessenger : 檢查一個物件使否是messenger
* Nucleoid => isStatus : 檢查一個物件使否是status
* Book上線啦

## 1.5.6

### NEW

* Skill => frag => setError : 一個錯誤執行的接口
* Skill => frag => add : add會回傳exports
* Skill => scan : 統一呼叫的函式列

### FIX

* frag => error : 修正錯誤如果是null在status輸出不會出現unknown error

## 1.5.7

### NEW

* Skill => pump : 累積式函數宣告

## 1.5.8

### NEW

* Skill => frag => setSuccess : 一個成功執行的接口