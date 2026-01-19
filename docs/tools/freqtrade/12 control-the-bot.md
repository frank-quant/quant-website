---
id: control-the-bot
title: 控制机器人
sidebar_label: 控制机器人
description: Freqtrade 官方"Control the bot"页面完整中文翻译，详细介绍各种控制和监控机器人的方法。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/bot-usage/`](https://www.freqtrade.io/en/stable/bot-usage/)

# 控制机器人

本页解释如何控制和监控运行中的 Freqtrade 机器人。

## 控制方式概览

Freqtrade 提供多种方式来控制和监控运行中的机器人：

1. **FreqUI** - Web 界面（推荐）
2. **Telegram** - 移动设备集成
3. **REST API** - 程序化访问
4. **命令行工具** - 直接命令
5. **日志文件** - 监控和调试
6. **Webhooks** - 第三方集成

## FreqUI - Web 界面

FreqUI 是最容易上手的控制方式，提供直观的 Web 界面。

### 安装 FreqUI

```bash
# 安装 FreqUI
freqtrade install-ui

# 或者在配置中启用
"freqUI": {
    "enabled": true,
    "listen_ip_address": "127.0.0.1",
    "listen_port": 8080,
    "verbosity": "error",
    "jwt_secret_key": "somethingrandom",
    "CORS_origins": [],
    "username": "freqtrader",
    "password": "SuperSecurePassword"
}
```

### 启动 FreqUI

```bash
# 方法 1：与机器人一起启动
freqtrade trade --config user_data/config.json --strategy MyStrategy

# 方法 2：单独启动 Web 服务器
freqtrade webserver --config user_data/config.json
```

### 访问 FreqUI

启动后，在浏览器中访问：`http://localhost:8080`

:::note 默认凭据
默认用户名：`freqtrader`
默认密码：`SuperSecurePassword`
:::

### FreqUI 功能

- 📊 **实时监控**：查看当前持仓、利润、性能统计
- 🎯 **交易控制**：手动开仓、平仓、调整持仓
- 📈 **图表分析**：查看价格图表和技术指标
- ⚙️ **配置管理**：查看和修改配置
- 📋 **交易历史**：查看历史交易和统计
- 🔄 **机器人控制**：启动、停止、重载策略

:::tip 远程访问
如果在服务器上运行，建议使用反向代理（如 nginx）或 VPN 来安全访问 FreqUI。
:::

## Telegram 集成

Telegram 集成允许您通过手机控制和监控机器人。

### 配置 Telegram

1. **创建 Telegram Bot**
   - 与 @BotFather 对话
   - 创建新机器人并获取 token
   - 获取您的 chat_id

2. **配置文件设置**

```json
{
  "telegram": {
    "enabled": true,
    "token": "your_telegram_bot_token",
    "chat_id": "your_telegram_chat_id",
    "allow_custom_messages": true,
    "notification_settings": {
      "status": "on",
      "warning": "on",
      "startup": "on",
      "entry": "on",
      "entry_fill": "on",
      "exit": "on",
      "exit_fill": "on",
      "protection_trigger": "on",
      "protection_trigger_global": "on",
      "show_candle": "off",
      "strategy_msg": "on"
    },
    "reload": true,
    "balance_dust_level": 0.01
  }
}
```

### Telegram 命令

#### 基本命令

- `/start` - 显示可用命令
- `/help` - 显示帮助信息
- `/status` - 显示机器人状态
- `/profit` - 显示利润统计
- `/balance` - 显示账户余额
- `/whitelist` - 显示当前交易对白名单
- `/blacklist` - 显示黑名单
- `/logs` - 显示最近的日志
- `/count` - 显示当前活跃交易数量

#### 交易控制命令

- `/trades` - 显示当前开放交易
- `/delete <trade_id>` - 删除指定交易
- `/reload_config` - 重新加载配置
- `/stop` - 停止机器人
- `/stopentry` - 停止新入场
- `/reload_strategy` - 重新加载策略

#### 强制交易命令

```bash
# 启用强制入场（配置中需要设置 force_entry_enable: true）
/forceexit <trade_id>  # 强制退出指定交易
/forceentry <pair> [rate]  # 强制入场指定交易对
```

:::warning 强制交易风险
强制交易会绕过策略逻辑，请谨慎使用。
:::

### Telegram 通知设置

```json
{
  "notification_settings": {
    "status": "silent",      # 状态更新：on/off/silent
    "warning": "on",         # 警告消息
    "startup": "on",         # 启动消息
    "entry": "on",           # 入场信号
    "entry_fill": "on",      # 入场成交
    "exit": "on",            # 出场信号
    "exit_fill": "on",       # 出场成交
    "protection_trigger": "on",         # 保护触发
    "protection_trigger_global": "on",  # 全局保护触发
    "show_candle": "off",    # 显示蜡烛数据
    "strategy_msg": "on"     # 策略消息
  }
}
```

## REST API

REST API 提供程序化访问机器人功能。

### 启用 REST API

```json
{
  "api_server": {
    "enabled": true,
    "listen_ip_address": "127.0.0.1",
    "listen_port": 8080,
    "verbosity": "error",
    "enable_openapi": false,
    "jwt_secret_key": "somethingrandom",
    "CORS_origins": [],
    "username": "freqtrader",
    "password": "SuperSecurePassword"
  }
}
```

### API 端点示例

```bash
# 获取机器人状态
curl -X GET "http://localhost:8080/api/v1/status" -H "Authorization: Bearer <token>"

# 获取利润信息
curl -X GET "http://localhost:8080/api/v1/profit" -H "Authorization: Bearer <token>"

# 获取当前交易
curl -X GET "http://localhost:8080/api/v1/trades" -H "Authorization: Bearer <token>"

# 强制退出交易
curl -X POST "http://localhost:8080/api/v1/forceexit" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tradeid": "1"}'
```

### Python 客户端

```python
from freqtrade_client import FtRestClient

# 创建客户端
client = FtRestClient("http://localhost:8080", "freqtrader", "SuperSecurePassword")

# 获取状态
status = client.status()
print(status)

# 获取利润
profit = client.profit()
print(profit)

# 获取交易
trades = client.trades()
for trade in trades:
    print(f"交易对: {trade['pair']}, 利润: {trade['profit_ratio']:.2%}")
```

## 命令行控制

### 查看机器人状态

```bash
# 显示当前交易
freqtrade show-trades --config user_data/config.json

# 显示交易统计
freqtrade show-trades --config user_data/config.json --trade-ids 1,2,3

# 显示利润
freqtrade show-trades --config user_data/config.json --print-json
```

### 数据库操作

```bash
# 查看数据库内容
freqtrade show-trades --config user_data/config.json --db-url sqlite:///tradesv3.sqlite

# 转换数据库
freqtrade convert-db --config user_data/config.json --db-url-from sqlite:///old.db --db-url sqlite:///new.db
```

## 日志监控

### 实时日志查看

```bash
# 查看实时日志
tail -f user_data/logs/freqtrade.log

# 过滤特定内容
tail -f user_data/logs/freqtrade.log | grep "Trade"

# 使用 journalctl（systemd）
journalctl -f -u freqtrade
```

### 日志分析

```bash
# 查看错误
grep "ERROR" user_data/logs/freqtrade.log

# 查看交易活动
grep -E "(BUY|SELL|ROI|STOP)" user_data/logs/freqtrade.log

# 查看策略信息
grep "Strategy" user_data/logs/freqtrade.log | tail -20
```

## Webhooks

Webhooks 允许您将机器人事件发送到外部服务。

### 配置 Webhooks

```json
{
  "webhook": {
    "enabled": true,
    "url": "https://your-webhook-url.com/webhook",
    "webhookentry": {
      "value1": "Opened {pair}",
      "value2": "limit {limit:8f}",
      "value3": "{stake_amount:8f} {stake_currency}"
    },
    "webhookexit": {
      "value1": "Closed {pair}",
      "value2": "limit {limit:8f}",
      "value3": "profit: {profit_amount:8f} {stake_currency} ({profit_ratio:.2%})"
    },
    "webhookstatus": {
      "value1": "Status: {status}",
      "value2": "",
      "value3": ""
    }
  }
}
```

### Discord Webhook 示例

```json
{
  "webhook": {
    "enabled": true,
    "url": "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL",
    "format": "discord",
    "webhookentry": {
      "content": "🟢 **新交易开启**\n交易对: {pair}\n价格: {limit:8f}\n金额: {stake_amount:8f} {stake_currency}"
    },
    "webhookexit": {
      "content": "🔴 **交易关闭**\n交易对: {pair}\n价格: {limit:8f}\n利润: {profit_amount:8f} {stake_currency} ({profit_ratio:.2%})"
    }
  }
}
```

## 性能监控

### 系统资源监控

```bash
# 查看 CPU 使用率
top -p $(pgrep freqtrade)

# 查看内存使用
ps -o pid,vsz,rss,comm -p $(pgrep freqtrade)

# 查看网络连接
netstat -tulpn | grep freqtrade
```

### 机器人性能指标

```bash
# 通过 API 获取性能指标
curl -X GET "http://localhost:8080/api/v1/stats" -H "Authorization: Bearer <token>"

# 通过 Telegram 获取状态
/status
/profit
/performance
```

## 故障排除

### 1. 机器人无响应

```bash
# 检查进程状态
ps aux | grep freqtrade

# 检查日志
tail -100 user_data/logs/freqtrade.log

# 重启机器人
sudo systemctl restart freqtrade
```

### 2. API 无法访问

```bash
# 检查端口是否开放
netstat -tulpn | grep 8080

# 检查防火墙设置
sudo ufw status

# 测试 API 连接
curl http://localhost:8080/api/v1/ping
```

### 3. Telegram 无响应

- 检查 token 和 chat_id 是否正确
- 验证网络连接
- 查看 Telegram 相关日志

## 最佳实践

### 1. 安全建议

- 🔒 使用强密码保护 API 和 FreqUI
- 🛡️ 限制网络访问（防火墙规则）
- 🔐 定期更换 API 密钥
- 📱 限制 Telegram 访问权限

### 2. 监控建议

- 📊 设置关键指标警报
- 📝 定期检查日志
- 💰 监控账户余额变化
- ⚡ 设置系统资源监控

### 3. 维护建议

- 🔄 定期重启机器人
- 💾 备份配置和数据库
- 📦 保持软件更新
- 🧪 在干跑模式下测试更改

## 下一步

现在您知道如何控制机器人，可能想要学习如何下载历史数据进行回测。您的下一步是阅读"数据下载"文档。
