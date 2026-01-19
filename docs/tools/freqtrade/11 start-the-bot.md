---
id: start-the-bot
title: 启动机器人
sidebar_label: 启动机器人
description: Freqtrade 官方"Start the bot"页面完整中文翻译，详细介绍如何启动和配置机器人。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/bot-usage/`](https://www.freqtrade.io/en/stable/bot-usage/)

# 启动机器人

本页解释机器人的不同参数以及如何运行它。

:::note 注意
如果您使用了 `setup.sh`，在运行 freqtrade 命令之前，请不要忘记激活您的虚拟环境（`source .venv/bin/activate`）。
:::

:::caution 时钟同步
运行机器人的系统时钟必须准确，并经常与 NTP 服务器同步，以避免与交易所通信出现问题。
:::

## 机器人命令

以下是 freqtrade 的命令行用法：

```bash
usage: freqtrade [-h] [-V]
                 {trade,create-userdir,new-config,show-config,new-strategy,download-data,convert-data,convert-trade-data,trades-to-ohlcv,list-data,backtesting,backtesting-show,backtesting-analysis,edge,hyperopt,hyperopt-list,hyperopt-show,list-exchanges,list-markets,list-pairs,list-strategies,list-freqaimodels,list-timeframes,show-trades,test-pairlist,convert-db,install-ui,plot-dataframe,plot-profit,webserver,strategy-updater,lookahead-analysis,recursive-analysis}
                 ...
```

这是一个免费的开源加密货币交易机器人。

**位置参数：**

- `trade` - 交易模块
- `create-userdir` - 创建用户数据目录
- `new-config` - 创建新的配置文件
- `show-config` - 显示解析后的配置
- `new-strategy` - 创建新的策略
- `download-data` - 下载回测数据
- `convert-data` - 将蜡烛图（OHLCV）数据从一种格式转换为另一种
- `convert-trade-data` - 将交易数据从一种格式转换为另一种
- `trades-to-ohlcv` - 将交易数据转换为 OHLCV 数据
- `list-data` - 列出已下载的数据
- `backtesting` - 回测模块
- `backtesting-show` - 显示过去的回测结果
- `backtesting-analysis` - 进行回测分析
- `edge` - 边缘分析模块
- `hyperopt` - 超参数优化模块
- `hyperopt-list` - 列出超参数优化结果
- `hyperopt-show` - 显示超参数优化结果的详细信息
- `list-exchanges` - 打印可用的交易所
- `list-markets` - 打印交易所的市场
- `list-pairs` - 打印交易对
- `list-strategies` - 打印可用的策略
- `list-freqaimodels` - 打印可用的 FreqAI 模型
- `list-timeframes` - 打印交易所可用的时间框架
- `show-trades` - 显示交易
- `test-pairlist` - 测试您的交易对列表配置
- `convert-db` - 将数据库迁移到不同的系统
- `install-ui` - 安装 FreqUI
- `plot-dataframe` - 绘制带有指标的蜡烛图
- `plot-profit` - 生成显示利润的图表
- `webserver` - 启动 Web 服务器模块
- `strategy-updater` - 更新过时的策略文件到当前版本
- `lookahead-analysis` - 检查潜在的前瞻偏差
- `recursive-analysis` - 检查潜在的递归公式问题

## 机器人交易命令

```bash
usage: freqtrade trade [-h] [-v] [--logfile FILE] [-V] [-c PATH] [-d PATH]
                       [--userdir PATH] [-s NAME] [--strategy-path PATH]
                       [--recursive-strategy-search] [--freqaimodel NAME]
                       [--freqaimodel-path PATH] [--db-url PATH] [--sd-notify]
                       [--dry-run] [--dry-run-wallet DRY_RUN_WALLET]
```

启动交易机器人。

**可选参数：**

- `--db-url PATH` - 覆盖交易数据库的 URL，这在自定义部署中很有用（默认值：`sqlite:///tradesv3.sqlite` 用于实时运行模式，`sqlite:///tradesv3.dryrun.sqlite` 用于 Dry Run）
- `--sd-notify` - 通知 systemd 服务管理器
- `--dry-run` - 强制进行 Dry Run（移除交易所密钥并模拟交易）
- `--dry-run-wallet DRY_RUN_WALLET, --starting-balance DRY_RUN_WALLET` - 起始余额，用于回测/超参数优化和干跑

**常用参数：**

- `-v, --verbose` - 详细模式（`-vv` 获取更多信息，`-vvv` 获取所有消息）
- `--logfile FILE, --log-file FILE` - 将日志记录到指定的文件。特殊值包括：`syslog`、`journald`。有关更多详细信息，请参阅文档
- `-V, --version` - 显示程序的版本号并退出
- `-c PATH, --config PATH` - 指定配置文件（默认：`userdir/config.json` 或 `config.json`，以存在的为准）。可以使用多个 `--config` 选项。可以设置为 `-` 以从标准输入读取配置
- `-d PATH, --datadir PATH, --data-dir PATH` - 包含历史回测数据的目录路径
- `--userdir PATH, --user-data-dir PATH` - 用户数据目录的路径

**策略参数：**

- `-s NAME, --strategy NAME` - 指定机器人将使用的策略类名称
- `--strategy-path PATH` - 指定额外的策略查找路径
- `--recursive-strategy-search` - 在策略文件夹中递归搜索策略
- `--freqaimodel NAME` - 指定自定义的 FreqAI 模型
- `--freqaimodel-path PATH` - 指定 FreqAI 模型的额外查找路径

## 如何指定使用哪个配置文件？

机器人允许您通过 `-c/--config` 命令行选项选择要使用的配置文件：

```bash
freqtrade trade -c path/far/far/away/config.json
```

默认情况下，机器人从当前工作目录加载 `config.json` 配置文件。

## 如何使用多个配置文件？

机器人允许您通过在命令行中指定多个 `-c/--config` 选项来使用多个配置文件。

```bash
freqtrade trade --config ./config.json --config ./config-private.json
```

:::note 注意
配置文件将按指定顺序加载，后面的文件会覆盖前面文件中的设置。
:::

## 自定义数据存储位置

Freqtrade 允许使用 `freqtrade create-userdir --userdir someDirectory` 创建用户数据目录。

### 目录结构

```
user_data/
├── backtest_results
├── data
├── hyperopts
├── hyperopt_results
├── logs
├── notebooks
├── plot
└── strategies
```

您可以在配置中添加 `user_data_dir` 设置，以始终将您的机器人指向此目录。或者，在每个命令中传递 `--userdir`。

```bash
freqtrade trade --userdir user_data --strategy AwesomeStrategy
```

:::note 注意
如果目录不存在，机器人将无法启动，但会创建必要的子目录。
:::

此目录应包含您的自定义策略、自定义超参数优化和超参数优化损失函数、历史回测数据（使用回测命令或下载脚本下载）和绘图输出。

:::tip 版本控制
建议使用版本控制来跟踪策略的更改。
:::

## 如何使用 --strategy？

此参数允许您加载自定义策略类。要测试机器人安装，您可以使用 `create-userdir` 子命令安装的 `SampleStrategy`（通常位于 `user_data/strategies/sample_strategy.py`）。

机器人将在 `user_data/strategies` 中搜索您的策略文件。要使用其他目录，请阅读下一节关于 `--strategy-path` 的内容。

要加载策略，只需在此参数中传递类名（例如：`CustomStrategy`）。

**示例：** 在 `user_data/strategies` 中，您有一个名为 `my_awesome_strategy.py` 的文件，其中包含一个名为 `AwesomeStrategy` 的策略类，要加载它：

```bash
freqtrade trade --strategy AwesomeStrategy
```

如果机器人找不到您的策略文件，它将在错误消息中显示原因（文件未找到，或代码中存在错误）。

了解更多关于策略文件的信息，请参阅策略自定义。

## 如何使用 --strategy-path？

此参数允许您添加额外的策略查找路径，该路径在默认位置之前被检查（传递的路径必须是目录！）：

```bash
freqtrade trade --strategy AwesomeStrategy --strategy-path /some/directory
```

### 如何安装策略？

这非常简单。将您的策略文件复制粘贴到 `user_data/strategies` 目录中，或者使用 `--strategy-path`。然后，机器人就可以使用它了。

## 如何使用 --db-url？

当您在 Dry-run 模式下运行机器人时，默认情况下不会将交易存储在数据库中。如果您想使用 `--db-url` 在 Dry-run 模式下将机器人的操作存储在数据库中。这也可以用于在生产模式下指定自定义数据库。

示例命令：

```bash
freqtrade trade -c config.json --db-url sqlite:///tradesv3.dry_run.sqlite
```

## 启动示例

### 基本启动

```bash
# 使用默认配置启动
freqtrade trade

# 使用特定配置文件启动
freqtrade trade --config user_data/config.json

# 使用特定策略启动
freqtrade trade --config user_data/config.json --strategy MyStrategy
```

### 干跑模式启动

```bash
# 强制干跑模式
freqtrade trade --config user_data/config.json --strategy MyStrategy --dry-run

# 设置干跑钱包金额
freqtrade trade --config user_data/config.json --strategy MyStrategy --dry-run --dry-run-wallet 1000
```

### 生产模式启动

```bash
# 生产模式（使用真实资金）
freqtrade trade --config user_data/config.json --strategy MyStrategy
```

:::warning 警告
在生产模式下使用真实资金之前，请确保：
1. 已充分回测您的策略
2. 已在干跑模式下测试一段时间
3. 理解所有风险
4. 只投资您能承受损失的资金
:::

## 日志配置

### 日志级别

```bash
# 普通日志
freqtrade trade --config user_data/config.json

# 详细日志
freqtrade trade --config user_data/config.json -v

# 非常详细的日志
freqtrade trade --config user_data/config.json -vv

# 调试级别日志
freqtrade trade --config user_data/config.json -vvv
```

### 日志文件

```bash
# 输出到文件
freqtrade trade --config user_data/config.json --logfile user_data/logs/freqtrade.log

# 输出到系统日志
freqtrade trade --config user_data/config.json --logfile syslog

# 输出到 journald
freqtrade trade --config user_data/config.json --logfile journald
```

## 系统服务配置

### systemd 服务

在 Linux 系统上，您可以将 Freqtrade 设置为 systemd 服务：

```bash
# 通知 systemd
freqtrade trade --config user_data/config.json --sd-notify
```

### 示例 systemd 服务文件

```ini
[Unit]
Description=Freqtrade crypto trading bot
After=network.target

[Service]
Type=notify
User=freqtrade
WorkingDirectory=/home/freqtrade
ExecStart=/home/freqtrade/.venv/bin/freqtrade trade --config /home/freqtrade/user_data/config.json --strategy MyStrategy --sd-notify
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

## 环境变量

您可以通过环境变量覆盖配置设置：

```bash
# 设置交易所 API 密钥
export FREQTRADE__EXCHANGE__KEY="your_api_key"
export FREQTRADE__EXCHANGE__SECRET="your_api_secret"

# 设置干跑模式
export FREQTRADE__DRY_RUN=true

# 启动机器人
freqtrade trade --config user_data/config.json
```

## 验证配置

在启动机器人之前，验证您的配置：

```bash
# 显示解析后的配置
freqtrade show-config --config user_data/config.json

# 测试交易对列表
freqtrade test-pairlist --config user_data/config.json

# 列出可用策略
freqtrade list-strategies --strategy-path user_data/strategies

# 验证策略
freqtrade list-strategies --strategy MyStrategy --strategy-path user_data/strategies
```

## 启动前检查清单

在启动机器人之前，请确保：

### 1. 配置文件检查

- ✅ 配置文件语法正确
- ✅ 交易所设置正确
- ✅ API 密钥配置正确（生产模式）
- ✅ 交易对白名单设置
- ✅ 资金管理参数设置

### 2. 策略检查

- ✅ 策略文件在正确位置
- ✅ 策略语法无错误
- ✅ 策略已经过回测
- ✅ 策略已经过干跑测试

### 3. 数据检查

- ✅ 历史数据已下载（如需回测）
- ✅ 网络连接正常
- ✅ 交易所 API 访问正常

### 4. 系统检查

- ✅ 系统时钟准确
- ✅ 虚拟环境激活
- ✅ 依赖项已安装
- ✅ 磁盘空间充足

## 常见启动问题

### 1. 找不到策略

```bash
# 错误：Strategy 'MyStrategy' not found
# 解决：检查策略文件名和类名是否匹配
freqtrade list-strategies --strategy-path user_data/strategies
```

### 2. 配置错误

```bash
# 错误：Configuration error
# 解决：验证配置文件
freqtrade show-config --config user_data/config.json
```

### 3. API 连接错误

```bash
# 错误：Exchange connection failed
# 解决：检查网络、API 密钥、交易所状态
```

### 4. 数据库错误

```bash
# 错误：Database error
# 解决：检查数据库文件权限和磁盘空间
```

## 监控和日志

### 实时监控

```bash
# 查看实时日志
tail -f user_data/logs/freqtrade.log

# 使用 journalctl（systemd）
journalctl -f -u freqtrade
```

### 日志分析

```bash
# 查看错误日志
grep "ERROR" user_data/logs/freqtrade.log

# 查看交易日志
grep "Trade" user_data/logs/freqtrade.log

# 查看策略日志
grep "Strategy" user_data/logs/freqtrade.log
```

## 停止机器人

### 正常停止

- 按 `Ctrl+C`（前台运行）
- 发送 SIGINT 信号
- 使用 systemd 停止服务

### 强制停止

```bash
# 查找进程 ID
ps aux | grep freqtrade

# 强制终止
kill -9 <PID>

# 或使用 systemd
sudo systemctl stop freqtrade
```

## 下一步

机器人启动后，您可能想要学习如何控制和监控它。您的下一步是阅读"控制机器人"文档。
