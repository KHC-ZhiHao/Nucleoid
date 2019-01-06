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