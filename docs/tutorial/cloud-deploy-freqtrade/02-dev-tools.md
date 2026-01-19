---
title: 02 通用开发工具准备
sidebar_label: 02 通用开发工具准备
---

在云服务器部署模式下，经常需要通过SSH远程登录（执行命令、部署代码）和文件传输（上传策略文件、下载日志），推荐使用XShell+XFTP个人免费版，比大多数免费工具好用得多。

- 个人免费版永久免费（非试用），几乎保留全部专业功能；
- XShell和XFTP完美联动：在XShell右键选中文件/文件夹 → 直接用XFTP打开传输；
- XFTP支持断点续传、文件夹同步、权限修改、直接编辑远程文件（保存自动上传）；
- XShell界面美观、响应快、支持高亮、搜索、快捷键、主题自定义；XFTP拖拽上传、同步文件夹超方便。

### 1 SSH终端工具-Xshell

在官网下载免费版，下载地址为 https://www.xshell.com/zh/free-for-home-school/ 

![](../../../static/img/Pasted%20image%2020251222214313.png)
下载后双击打开安装包，看到安装启动界面，点击下一步。

![](../../../static/img/Pasted%20image%2020251222214505.png)

选择“我接受许可证协议中的条款”，点击下一步。

![](../../../static/img/Pasted%20image%2020251222214518.png)

选择合适的安装位置，windows电脑推荐安装在非C盘，点击下一步。

![](../../../static/img/Pasted%20image%2020251222214629.png)

点击安装。


![](../../../static/img/Pasted%20image%2020251222214644.png)

安装过程大概持续五六秒钟，很快。

![](../../../static/img/Pasted%20image%2020251222214701.png)

安装完成后，就可以使用了。

![](../../../static/img/Pasted%20image%2020251222214716.png)

这里要注意一下，虽然是免费版，但还是需要注册激活一下。这里的注册流程非常简单，可以参考指南 https://netsarang.atlassian.net/wiki/spaces/ENSUP/pages/2027552778/Free+User+Registration

安装完成后第一次打开，可以看到注册界面，填写用户名和邮箱地址，会发送一封注册邮件。

![](../../../static/img/Pasted%20image%2020251222214938.png)

打开邮箱，找到对应的邮件，点击注册链接。

![](../../../static/img/Pasted%20image%2020251222215316.png)


提示注册完成，已经可以永久免费使用。

![](../../../static/img/Pasted%20image%2020251222215341.png)
打开“帮助”下的“关于Xshell”，可以看到状态已经是 Validated。

![](../../../static/img/Pasted%20image%2020251222215511.png)

Xshell已经可以正常使用了，能够看到显示的是“free for Home/School”，功能已经能够满足几乎所有个人使用的场景。

![](../../../static/img/Pasted%20image%2020251222215215.png)


### 2 文件传输工具-Xftp

Xftp是SFTP/FTP客户端，支持拖拽上传/下载、文件夹同步、直接编辑远程文件、多窗口、FXP（服务器间直传）。可以与XShell无缝集成（从XShell直接打开XFTP传输文件），速度快、安全。

双击打开Xftp的安装包，开始安装，点击“下一步”。

![](../../../static/img/Pasted%20image%2020251222215607.png)

选择“我接受许可证协议中的条款”。

![](../../../static/img/Pasted%20image%2020251222215621.png)

同样的，选择合适的安装位置，点击“下一步”。

![](../../../static/img/Pasted%20image%2020251222215725.png)

点击“安装”。

![](../../../static/img/Pasted%20image%2020251222215743.png)

等待约四五秒钟，安装完成。

![](../../../static/img/Pasted%20image%2020251222215800.png)

同样的，填写用户名和邮箱，提交获取注册邮件。

![](../../../static/img/Pasted%20image%2020251222215830.png)

点击发送过来的注册链接。

![](../../../static/img/Pasted%20image%2020251222215940.png)

注册成功，已经能够永久免费使用。

![](../../../static/img/Pasted%20image%2020251222220001.png)
Xftp主界面。

![](../../../static/img/Pasted%20image%2020251222220053.png)


 
必要的开发工具已经安装完成，下一节讲解AWS服务器申请。

