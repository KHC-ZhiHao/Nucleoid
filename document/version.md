# Version Log

## 1.4.6

* timeout : 排除timeout偵測並沒有在結束事件後被停止，導致lambda無法結束

## 1.4.7

* README => 修飾文字
* deepclone : 排除WeakMap沒有在遞迴中被引入的錯誤
* status => json : attributes序列化的過程會排除循環引用結構
* skill => (new) setStatusAttr : 可以在template中設定當下status屬性
* skill => (new) setRootStatusAttr : 可以在template中設定根status的屬性