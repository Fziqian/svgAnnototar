# Case-SvgAnnotator.js

文本结构化标注工具 - jQuery插件版本。

[![license](https://img.shields.io/github/license/felixhpp/Case-SvgAnnotator.svg)](https://github.com/felixhpp/Case-SvgAnnotator/blob/master/LICENSE)
[![version](https://img.shields.io/badge/npm%20version-1.1.3-brightgreen.svg)](https://www.npmjs.com/package/case-annotator)
[![GitHub release](https://img.shields.io/github/release/felixhpp/Case-SvgAnnotator.svg)](https://github.com/felixhpp/Case-SvgAnnotator/releases)

暂时不支持IE浏览器。

## 声明

本项目是对项目[poplar](https://github.com/synyi/poplar)扩展的一个jQuery插件版本，方便在非ES6的开发环境中调用。此外还优化了插件在谷歌浏览器的兼容性问题，并新增了一些使用的方法。如果您的开发环境为ES6，建议去使用[poplar](https://github.com/synyi/poplar)。

在此特别感谢@[synyi](https://github.com/synyi)的开源项目[poplar](https://github.com/synyi/poplar)。

## 使用方法

### 直接下载js文件引用

直接从[dist](https://github.com/felixhpp/Case-SvgAnnotator/tree/master/dist)目录中获取js文件;

```
 <script src="jquery-1.11.1.js"></script>
 <script src="Case-SvgAnnotator.js"></script>
 <script>
    var svgAnnotator = $.SvgAnnotator(document.getElementById("div"), "这是一段文本或者一个对象", {});
 </script>
 
```

### 从源码编译本项目

```
npm install

gulp(gulp watch)

```

### Demo

[demo](https://Fziqian.github.io/svgAnnototar/demo/Index.html)

### API
请查看[API](https://github.com/felixhpp/Case-SvgAnnotator/blob/master/doc/api.md)

