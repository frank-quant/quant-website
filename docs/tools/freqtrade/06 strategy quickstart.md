---
id: strategy-101
title: 策略快速入门（Strategy Quickstart）
sidebar_label: 06 策略快速入门
description: Freqtrade 官方"Strategy Quickstart"页面中文翻译，保留原结构、提示块与代码块格式。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/strategy-101/`](https://www.freqtrade.io/en/stable/strategy-101/)

# Freqtrade 策略 101：策略开发快速入门

为了本快速入门的目的，我们假设您熟悉交易的基本概念，并已阅读过 Freqtrade 基础页面（见[Freqtrade Basics](https://www.freqtrade.io/en/stable/bot-basics/)）。

## 必备知识

在 Freqtrade 中，策略是一个定义了买入和卖出加密货币`资产`逻辑的 Python 类。

资产被定义为`交易对`，表示`币种`和`基准货币`的组合。币种是您使用另一种货币作为基准进行交易的资产。

数据由交易所以`K线`的形式提供，K线由六个值组成：`日期`、`开盘价`、`最高价`、`最低价`、`收盘价`和`成交量`。

`技术分析`函数使用各种计算和统计公式分析K线数据，并产生称为`指标`的次要值。

指标在资产对K线上进行分析以生成`信号`。

信号被转换为加密货币`交易所`上的`订单`，即`交易`。

我们使用术语`入场`和`出场`而不是`买入`和`卖出`，因为 Freqtrade 支持`做多`和`做空`交易。

* **做多**：您基于基准货币购买币种，例如使用 USDT 作为基准购买 BTC 币种，并通过以高于您支付价格的价格卖出币种来获利。在做多交易中，利润来自币种相对于基准货币的升值。
* **做空**：您从交易所借入币种形式的资本，稍后偿还币种的基准货币价值。在做空交易中，利润来自币种相对于基准货币的贬值（您以较低的价格偿还贷款）。

虽然 Freqtrade 支持某些交易所的现货和期货市场，但为简单起见，我们将只关注现货（做多）交易。

## 基本策略的结构

### 主数据框

Freqtrade 策略使用一种称为`数据框`的行列表格数据结构来生成入场和出场交易的信号。

您配置的交易对列表中的每个交易对都有其自己的数据框。数据框由`日期`列索引，例如 `2024-06-31 12:00`。

接下来的 5 列表示`开盘价`、`最高价`、`最低价`、`收盘价`和`成交量`（OHLCV）数据。

### 填充指标值

`populate_indicators` 函数向数据框添加代表技术分析指标值的列。

常见指标的示例包括相对强弱指数、布林带、资金流量指数、移动平均线和平均真实范围。

通过调用技术分析函数（例如 ta-lib 的 RSI 函数 `ta.RSI()`）并将它们分配给列名（例如 `rsi`）来将列添加到数据框中

```python
dataframe['rsi'] = ta.RSI(dataframe)
```

::::note 技术分析库
不同的库以不同的方式生成指标值。请查看每个库的文档以了解如何将其集成到您的策略中。您还可以查看 [Freqtrade 示例策略](https://github.com/freqtrade/freqtrade-strategies) 来获得想法。
::::

### 填充入场信号

`populate_entry_trend` 函数定义入场信号的条件。

数据框列 `enter_long` 被添加到数据框中，当此列中的值为 `1` 时，Freqtrade 会看到入场信号。

:::note 做空
要进入做空交易，请使用 `enter_short` 列。
:::

### 填充出场信号

`populate_exit_trend` 函数定义出场信号的条件。

数据框列 `exit_long` 被添加到数据框中，当此列中的值为 `1` 时，Freqtrade 会看到出场信号。

:::note 做空
要退出做空交易，请使用 `exit_short` 列。
:::

## 一个简单的策略

以下是 Freqtrade 策略的最小示例：

```python
from freqtrade.strategy import IStrategy
from pandas import DataFrame
import talib.abstract as ta

class MyStrategy(IStrategy):

    timeframe = '15m'

    # 设置初始止损为 -10%
    stoploss = -0.10

    # 在利润大于 1% 时随时退出盈利头寸
    minimal_roi = {"0": 0.01}

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # 生成技术分析指标值
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # 基于指标值生成入场信号
        dataframe.loc[
            (dataframe['rsi'] < 30),
            'enter_long'] = 1

        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # 基于指标值生成出场信号
        dataframe.loc[
            (dataframe['rsi'] > 70),
            'exit_long'] = 1

        return dataframe
```

## 进行交易

当找到信号（入场或出场列中的 `1`）时，Freqtrade 将尝试下订单，即`交易`或`头寸`。

每个新的交易头寸占用一个`槽位`。槽位表示可以开启的并发新交易的最大数量。

槽位数量由 `max_open_trades` 配置选项定义。

但是，可能存在一系列场景，其中生成信号并不总是创建交易订单。这些包括：

* 没有足够的剩余基准货币来购买资产，或钱包中没有足够的资金来出售资产（包括任何费用）
* 没有足够的剩余空闲槽位供新交易开启（您拥有的开放头寸数等于 `max_open_trades` 选项）
* 已经有一个交易对的开放交易（Freqtrade 无法堆叠头寸 - 但它可以调整现有头寸）
* 如果在同一根K线上出现入场和出场信号，它们被视为冲突，不会发出订单
* 策略通过使用相关的入场或出场回调，由于您指定的逻辑主动拒绝交易订单

通读[策略自定义文档](https://www.freqtrade.io/en/stable/strategy-customization/)以获取更多详细信息。

## 回测和前向测试

策略开发可能是一个漫长而令人沮丧的过程，因为将我们人类的"直觉"转化为一个有效的计算机控制（"算法"）策略并不总是直截了当的。

因此，应该测试策略以验证它将按预期工作。

Freqtrade 有两种测试模式：

* **回测**：使用从交易所下载的历史数据，回测是评估策略性能的快速方法。但是，很容易扭曲结果，使策略看起来比实际盈利得多。查看[回测文档](https://www.freqtrade.io/en/stable/backtesting/)以获取更多信息。
* **干跑**：通常被称为_前向测试_，干跑使用来自交易所的实时数据。但是，任何会导致交易的信号都会被 Freqtrade 正常跟踪，但不会在交易所本身开启任何交易。前向测试实时运行，所以虽然需要更长时间才能得到结果，但它比回测更可靠地指示**潜在**性能。

通过在配置中将 `dry_run` 设置为 true 来启用干跑。

:::caution 回测可能非常不准确
回测结果可能与现实不符的原因有很多。请查看回测假设和常见策略错误文档。一些列出和排名 Freqtrade 策略的网站显示了令人印象深刻的回测结果。不要假设这些结果是可实现的或现实的。
:::

::::tip 有用的命令
Freqtrade 包含两个有用的命令来检查策略中的基本缺陷：[`lookahead-analysis`](https://www.freqtrade.io/en/stable/utils/#lookahead-analysis) 和 [`recursive-analysis`](https://www.freqtrade.io/en/stable/utils/#recursive-analysis)。
::::

### 评估回测和干跑结果

在回测后始终干跑您的策略，以查看回测和干跑结果是否足够相似。

如果存在任何显著差异，请验证您的入场和出场信号在两种模式之间是一致的并出现在相同的K线上。但是，干跑和回测之间总会有差异：

* 回测假设所有订单都会成交。在干跑中，如果使用限价订单或交易所上没有成交量，这可能不是这种情况。
* 在K线收盘后的入场信号之后，回测假设交易在下一根K线的开盘价进入（除非您在策略中有自定义定价回调）。在干跑中，信号和交易开启之间通常会有延迟。这是因为当新K线在您的主时间框架上进入时，例如每 5 分钟，Freqtrade 需要时间来分析所有交易对数据框。因此，Freqtrade 将尝试在K线开盘后几秒钟（理想情况下尽可能小的延迟）开启交易。
* 由于干跑中的入场价格可能与回测不匹配，这意味着利润计算也会有所不同。因此，如果 ROI、止损、跟踪止损和回调出场不完全相同是正常的。
* 新K线进入和您的信号被发出以及交易被开启之间的计算"延迟"越多，价格不可预测性就越大。确保您的计算机足够强大，能够在合理的时间内处理您交易对列表中的交易对数量的数据。如果存在显著的数据处理延迟，Freqtrade 将在日志中警告您。

## 控制或监控运行中的机器人

一旦您的机器人在干跑或实盘模式下运行，Freqtrade 有六种机制来控制或监控运行中的机器人：

* **FreqUI**：最容易上手的，FreqUI 是一个 Web 界面，用于查看和控制机器人的当前活动。
* **Telegram**：在移动设备上，Telegram 集成可用于获取关于机器人活动的警报并控制某些方面。
* **FTUI**：FTUI 是 Freqtrade 的终端（命令行）界面，仅允许监控运行中的机器人。
* **freqtrade-client**：REST API 的 Python 实现，使从您的 Python 应用程序或命令行轻松发出请求和使用机器人响应成为可能。
* **REST API 端点**：REST API 允许程序员开发自己的工具来与 Freqtrade 机器人交互。
* **Webhooks**：Freqtrade 可以通过 webhooks 将信息发送到其他服务，例如 discord。

### 日志

Freqtrade 生成广泛的调试日志来帮助您了解正在发生的事情。请熟悉您可能在机器人日志中看到的信息和错误消息。

默认情况下，日志记录发生在标准输出（命令行）上。如果您想改为写入文件，许多 freqtrade 命令，包括 `trade` 命令，都接受 `--logfile` 选项来写入文件。

查看 [FAQ](https://www.freqtrade.io/en/stable/faq/) 以获取示例。

## 最终思考

算法交易是困难的，大多数公开策略由于使策略在多种场景下盈利工作所需的时间和努力而不是好的表现者。

因此，采用公开策略并使用回测作为评估性能的方式通常是有问题的。但是，Freqtrade 提供了有用的方法来帮助您做出决定并进行尽职调查。

有许多不同的方法可以实现盈利，没有一个单一的技巧、窍门或配置选项可以修复表现不佳的策略。

Freqtrade 是一个拥有庞大且乐于助人的社区的开源平台 - 请务必访问我们的 [Discord 频道](https://discord.gg/freqtrade) 与其他人讨论您的策略！

常见问题和答案可在我们的 [FAQ](https://www.freqtrade.io/en/stable/faq/) 上找到。

要继续，请参考更深入的 [Freqtrade 策略自定义文档](https://www.freqtrade.io/en/stable/strategy-customization/)。


