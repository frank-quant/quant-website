---
title: 04 实盘部署
sidebar_label: 04 实盘部署
---
### 1 dry-run 模拟实盘

在 **Freqtrade** 或任何量化交易系统中，**dry-run 模式**（模拟实盘）都是"必选项"。

请一定先 dry-run 再 live-trade！！

请一定先 dry-run 再 live-trade！！

请一定先 dry-run 再 live-trade！！

dry-run模式下，会使用真实的实时市场数据，按照配置的策略逻辑，在内部模拟下单与持仓，和live trade的唯一区别是不会真正调用交易所API下单。

简单来说，就是 dry-run在"假装交易"， 一切行为都和实盘一致，只是不会真的动你的钱。

经过dry-run，可以验证：

- ✅ 策略信号是否能正常触发；
- ✅ 策略逻辑在实时行情下是否稳定；
- ✅ 下单逻辑、仓位控制是否合理；
- ✅ Telegram / Webhook / 日志是否正常；
- ✅ 数据库记录、订单状态流是否正确；
- ✅ 程序是否能长时间稳定运行。

它是 **实盘上线前的最后一次全链路彩排**。

dry-run通过配置文件中的参数开启。

![](../../../static/img/Pasted%20image%2020251221175113.png)

这时候要注意一下，StaticPairList 需要在配置文件中设置 pair_whitelist（交易对白名单）。

![](../../../static/img/Pasted%20image%2020251221175207.png)

### 2 binance API配置

要实盘交易，需要通过交易所API。这里以binance为例。

（1）打开官网：[https://www.binance.com](https://www.binance.com/) 
（2）登录账户 
（3）登录后，点击右上角头像 → 选择 **"API Management"**（API 管理） 
（4）输入API 名称后，点击 **"Create API"**（创建 API） 
（5）根据提示完成 邮箱验证码、手机验证码

最终，API页面如图所示，记录密钥。

![](../../../static/img/Pasted%20image%2020251221175311.png)

这里需要注意的是，如果要做合约交易，需要开启"**允许合约**"，强制开启"只允许受信任的IP"，也就是只在白名单的IP才能调用API。

如果用了梯子，可以使用以下方法获取对外IP：

```
# 代理情况下查询当前的ip(Invoke-WebRequest -Uri "[https://ipinfo.io/ip](https://ipinfo.io/ip)" -Proxy "[http://127.0.0.1:7890](http://127.0.0.1:7890)").Content
```

获取到返回的ip后，在binance配置。

![](../../../static/img/Pasted%20image%2020251221171820.png)

然后将binance api信息填写到配置文件

![](../../../static/img/Pasted%20image%2020251221171833.png)

### 3 live trade

建议修改docker-compose.yml文件，保有两个配置文件，将关键的账号信息放在另一个config_live.json配置文件中，这样可以更好地隔离敏感信息，环境切换也更灵活。

![](../../../static/img/Pasted%20image%2020251025161825.png)

在这个专门用来live trade的配置文件中，存放关键的交易所API信息，避免意外上传到github或者误分享。

![](../../../static/img/Pasted%20image%2020251025155235.png)

配置完成后，执行以下命令启动freqtrade进程。

```
docker compose up -d
```

就会启动机器人啦。

在web UI也能看到，这里会显示"Live"，为了方便演示，我就不实盘了。

![](../../../static/img/Pasted%20image%2020251025162809.png)

### 4 Telegram bot 监控指标

这时候打开Telegram，应该能看到相关信息。

![](../../../static/img/Pasted%20image%2020251025163200.png)

通过下方的工具栏命令，可以简单控制机器人，获取关键信息。

![](../../../static/img/Pasted%20image%2020251025163228.png)


好了，恭喜你，已经跑通了第一个量化策略！！

欢迎来到Crypto Quant的世界！！

