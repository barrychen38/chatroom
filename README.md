## NODEJS_CHAT-ROOM

[![Build Status](https://travis-ci.org/Chen38/nodejs_chat-room.svg?branch=develop)](https://travis-ci.org/Chen38/nodejs_chat-room)

主要还是一个聊天的小玩意儿，照着 `Socket.io` 官方文档一步步写下来，花了点时间去理解。其中主要是事件的触发和数据的传递，当然还有很多其他功能等着去发现。

想玩的人可以克隆下整个目录：

```bash
git clone https://github.com/Chen38/nodejs_chat-room.git
# Install the node packages
npm i
# Run the node server
npm run serve
```

多人聊天需要把 `127.0.0.1` 改成本机 `ip`，实现局域网内的通信。

这是当前版本的样子，借鉴了一点 `Google Material Design` 的样式：

![chat](assets/chat.png)

### 用到的技术点：

- `NodeJS` 来搭建服务器，`express` 快速开发 `web` 平台

- `MongoDB` 用来存储最近一次的10条聊天记录

- `Socket.io` 用作及时聊天数据的传输库

- `Vue` 用来写单页面应用，`MVVM` 模式

### 现有功能：

- 显示在线人数

- 显示谁加入聊天，谁离开聊天（不针对自己）

- 浏览器消息通知（ `Chrome` 有效）

- 发送可爱滴 `emoji`，数量有限（60个）

- 发送小于2MB的图片（jpg|jpeg|png|gif）

- 保存最后一次聊天的10条消息记录

### 发现的小问题

刚把本地项目部署在 `heroku` 的时候，因为是免费的，所以响应时间有点慢。之后测试的话发送图片和 `emoji` 是没有问题的，但是发送图片的时候程序会突然中断，并在 `logs` 里面有错误：

```js
Node.js throw new Error('Can\'t set headers after they are sent.');
```

在 `StackOverflow` 上找了半天找到了原因，是因为 `res.send` 执行了两次，两次的顺序也没有放在同一个回调函数里，所以解决的方案是把需要返回的值先统一记录在一个变量里，最后统一发送给客户端。

现在代码没有报错了，但是图片并没有保存在指定的目录中，然后发现得把保存图片的目录先新建好才行。

总的来说过程很痛苦，结局很开心，还有很多需要优化的地方，这只是个开始。

### 还存在的缺陷

- 编辑服务端和客户端的代码时，需要开两个窗口，一个用来跑服务器，一个用来编译，当初建立的时候没有规划好

- 整个项目的结构都是自己参照来的，可能不是特别好

- 其实网上像这样的聊天室是蛮多的，我这种应该并不出彩，纯当自己练手，不喜勿喷

### 写在结尾的话：

开发主要在 `develop` 分支上进行，稳定版会在 `master` 上。其实自己是希望借这个 `repo` 来规范自己的 `Git` 开发规范，之后可以在工作的项目中，和其他同事有更好的配合。

以后有想到的新功能都会加上去并实现，代码还是要写的优雅。
