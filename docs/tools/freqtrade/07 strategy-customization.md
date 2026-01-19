---
id: strategy-customization
title: 策略自定义（Strategy Customization）
sidebar_label: 07 策略自定义（Strategy Customization）
description: Freqtrade 官方"Strategy Customization"页面完整中文翻译，详细介绍如何自定义策略、添加指标和设置交易规则。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/strategy-customization/`](https://www.freqtrade.io/en/stable/strategy-customization/)

# 策略自定义（Strategy Customization）

本页解释如何自定义您的策略，添加新指标并设置交易规则。

如果您还没有，请先熟悉：

* Freqtrade 策略 101（Strategy Quickstart），它提供策略开发的快速入门：https://www.freqtrade.io/en/stable/strategy-101/
* Freqtrade 机器人基础（Freqtrade Basics），它提供机器人运作方式的总体信息：https://www.freqtrade.io/en/stable/bot-basics/

## 开发您自己的策略（Develop your own strategy）

机器人包含一个默认策略文件。

此外，策略仓库中还有其他几种策略可用。

然而，您很可能有自己的策略想法。

本文档旨在帮助您将想法转换为可工作的策略。

### 生成策略模板（Generate strategy template）

要开始，您可以使用命令：

```bash
freqtrade new-strategy --strategy AwesomeStrategy
```

这将从模板创建一个名为 `AwesomeStrategy` 的新策略，该策略将使用文件名 `user_data/strategies/AwesomeStrategy.py` 存放。

:::note 注意（Note）
策略的_名称_和文件名之间是有区别的。在大多数命令中，Freqtrade 使用策略的_名称_，_而不是文件名_。
:::

:::note 注意（Note）
`new-strategy` 命令生成的起始示例不会立即盈利。
:::

:::tip 不同的模板级别（Different template levels）
`freqtrade new-strategy` 有一个额外的参数 `--template`，它控制您在创建的策略中获得的预构建信息量。使用 `--template minimal` 获得没有任何指标示例的空策略，或使用 `--template advanced` 获得定义了更复杂功能的模板。
:::

### 策略剖析（Strategy anatomy）

策略文件包含构建策略逻辑所需的所有信息：

* OHLCV 格式的蜡烛数据
* 指标
* 入场逻辑
  * 信号
* 出场逻辑
  * 信号
  * 最小 ROI
  * 回调（"自定义函数"）
* 止损
  * 固定/绝对
  * 跟踪
  * 回调（"自定义函数"）
* 定价 [可选]
* 持仓调整 [可选]

机器人包含一个名为 `SampleStrategy` 的示例策略，您可以将其用作基础：`user_data/strategies/sample_strategy.py`。您可以使用参数 `--strategy SampleStrategy` 测试它。请记住，您使用的是策略类名，而不是文件名。

此外，还有一个名为 `INTERFACE_VERSION` 的属性，它定义了机器人应使用的策略接口版本。当前版本是 3 - 当它在策略中没有明确设置时，这也是默认值。

您可能会看到较旧的策略设置为接口版本 2，这些需要更新为 v3 术语，因为未来版本将要求设置此项。

在干跑或实盘模式下启动机器人使用 `trade` 命令完成：

```bash
freqtrade trade --strategy AwesomeStrategy
```

### 机器人模式（Bot modes）

Freqtrade 策略可以由 Freqtrade 机器人在 5 种主要模式下处理：

* 回测
* 超参优化
* 干跑（"前向测试"）
* 实盘
* FreqAI（此处未涵盖）

查看配置文档了解如何将机器人设置为干跑或实盘模式。

**在测试时始终使用干跑模式，因为这可以让您了解策略在现实中如何工作，而不会冒资金风险。**

## 深入了解（Deep dive）

**对于以下部分，我们将使用 user_data/strategies/sample_strategy.py 文件作为参考。**

:::caution 策略和回测（Strategies and Backtesting）
为了避免回测和干跑/实盘模式之间的问题和意外差异，请注意在回测期间，完整的时间范围会一次性传递给 `populate_*()` 方法。因此，最好使用向量化操作（跨整个数据框，而不是循环）并避免索引引用（`df.iloc[-1]`），而应使用 `df.shift()` 来获取前一根蜡烛。
:::

:::warning 使用未来数据（Warning: Using future data）
由于回测将完整的时间范围传递给 `populate_*()` 方法，策略作者需要注意避免策略利用来自未来的数据。本文档的常见错误部分列出了一些常见模式。
:::

:::tip 前瞻和递归分析（Lookahead and recursive analysis）
Freqtrade 包含两个有用的命令来帮助评估常见的前瞻偏差问题：`lookahead-analysis` 和 `recursive-analysis`。
:::

### 数据框（Dataframe）

数据框是策略接收的主要数据结构。此数据框包含开盘价、最高价、最低价、收盘价和成交量，通常称为 OHLCV 数据。

数据框始终按日期排序，最新的蜡烛位于数据框的底部（最大索引），最旧的蜡烛位于顶部（索引 0）。

数据框的基本列为：`date`、`open`、`high`、`low`、`close`、`volume`。您的指标会作为新列追加到该数据框中。

如果我们用 pandas 的 `head()` 函数查看主数据框的前几行，我们会看到（示例）：

```text
                          open     high      low     close     volume
date
2024-06-30 11:55:00    1.2345   1.2360   1.2330   1.2350   123.4567
2024-06-30 12:00:00    1.2350   1.2375   1.2340   1.2365   234.5678
2024-06-30 12:05:00    1.2365   1.2380   1.2355   1.2370   345.6789
2024-06-30 12:10:00    1.2370   1.2390   1.2360   1.2385   456.7890
2024-06-30 12:15:00    1.2385   1.2400   1.2375   1.2390   567.8901
```

说明：数据框中的列不是单个标量，而是一整列数据序列。因此，下面这种直接的 Python 比较方式是不可行的：

错误示例（不要这样写）：

```python
# dataframe['rsi'] 是一个 Series，不能直接用于 if 判断
if dataframe['rsi'] > 30:
    dataframe['enter_long'] = 1
```


上述错误示例会触发 pandas 的典型报错，提示 Series 的真假值不可直接用于 if 判断：

```text
The truth value of a Series is ambiguous. Use a.empty, a.bool(), a.item(), a.any() or a.all().
```

正确示例（向量化写法）：

```python
# 使用向量化条件 + loc 进行整列赋值
dataframe.loc[
    (dataframe['rsi'] > 30),
    'enter_long'
] = 1
```

本节将在您的数据框中新增一列，当 RSI 高于 30 时，该列会被赋值为 1。

Freqtrade 将使用此新列作为入场信号，假设交易将在下一个开盘蜡烛图时开启。

Pandas 提供了快速计算指标的方法，即“向量化”。为了充分利用这种速度，建议不要使用循环，而应使用向量化方法。

向量化操作会在整个数据范围内执行计算，因此，与循环遍历每一行相比，在计算指标时速度要快得多。

#### 为什么我看不到"实时"蜡烛数据？（Why can't I see "real time" candle data?）

大多数交易所返回不完整的蜡烛作为最后一根蜡烛。这些蜡烛不应用于回测，因为它们包含不完整的信息（缺少最高价、最低价和收盘价）。因此，Freqtrade 会自动移除这根蜡烛，以确保所有策略在所有模式下都能获得相同的数据。

### 自定义指标（Custom indicators）

您可以通过多种方式向策略添加更多指标。

大多数指标都有一个上游库，如 TA-Lib 或 pandas_ta，它们提供广泛的指标，可以直接使用。

#### 指标库（Indicator libraries）

除了 pandas 提供的内置指标外，以下库也可用：

* **TA-Lib** - 一个广泛的技术分析库
* **pandas_ta** - 基于 Pandas 的技术分析库
* **qtpylib** - Quantitative Trading Python Library

您还可以开发自己的指标。作为示例，您可以查看 `user_data/strategies/sample_strategy.py` 中的示例。

示例使用：

```python
import talib.abstract as ta
import pandas_ta as pta
from qtpylib import indicators as qtpylib

def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    # RSI
    dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
    
    # Bollinger Bands
    bollinger = qtpylib.bollinger_bands(dataframe['close'], window=20, stds=2)
    dataframe['bb_lowerband'] = bollinger['lower']
    dataframe['bb_middleband'] = bollinger['mid']
    dataframe['bb_upperband'] = bollinger['upper']
    
    # EMA - pandas_ta
    dataframe['ema21'] = pta.ema(dataframe['close'], length=21)
    
    return dataframe
```

### 策略启动期（Startup period）

大多数指标都有一个"预热期"或"启动期"，在此期间它们产生错误或不稳定的值。

要考虑这一点，策略可以定义启动期的长度。

```python
# 这个属性将在策略开始前加载更多蜡烛
startup_candle_count: int = 30
```

#### 示例（Example）

```python
def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    # 计算 SMA100 - 这需要 100 根蜡烛才能完全"预热"
    dataframe['sma100'] = ta.SMA(dataframe, timeperiod=100)
    
    # 设置 startup_candle_count 为 100 以确保 SMA100 可用
    return dataframe
```

### 入场信号规则（Entry signal rules）

编辑方法 `populate_entry_trend()` 以更新您的策略。

使用不同的指标来生成入场信号是一个很好的做法。

示例：

```python
def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    dataframe.loc[
        (
            (qtpylib.crossed_above(dataframe['rsi'], 30)) &  # RSI 从下方穿过 30
            (dataframe['tema'] <= dataframe['bb_middleband']) &  # TEMA 低于或等于 BB 中线
            (dataframe['tema'] > dataframe['tema'].shift(1)) &  # TEMA 上升
            (dataframe['volume'] > 0)  # 确保此蜡烛有成交量（对回测重要）
        ),
        ['enter_long', 'enter_tag']] = (1, 'rsi_cross')
    
    return dataframe
```

:::note 注意（Note）
在 `populate_entry_trend()` 中，您应该始终返回整个数据框。
:::

### 出场信号规则（Exit signal rules）

编辑方法 `populate_exit_trend()` 以更新您的策略。

示例：

```python
def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    dataframe.loc[
        (
            (qtpylib.crossed_above(dataframe['rsi'], 70)) &  # RSI 从下方穿过 70
            (dataframe['tema'] > dataframe['bb_middleband']) &  # TEMA 高于 BB 中线
            (dataframe['tema'] < dataframe['tema'].shift(1)) &  # TEMA 下降
            (dataframe['volume'] > 0)  # 确保此蜡烛有成交量（对回测重要）
        ),
        ['exit_long', 'exit_tag']] = (1, 'rsi_high')
    
    return dataframe
```

### 最小 ROI（Minimal ROI）

`minimal_roi` 是一个字典，定义了不同时间点的最小投资回报率。

```python
minimal_roi = {
    "0": 0.04,    # 4% 立即退出
    "30": 0.03,   # 30 分钟后 3%
    "60": 0.02,   # 60 分钟后 2%
    "120": 0      # 120 分钟后 0%（盈亏平衡）
}
```

#### 禁用最小 ROI

要禁用最小 ROI，可以设置一个非常高的值：

```python
minimal_roi = {
    "0": 10
}
```

#### 在最小 ROI 中使用计算

您还可以在 ROI 中使用计算：

```python
minimal_roi = {
    "0": 0.02 + stoploss,  # 止损 + 2%
    "30": 0.01 + stoploss,  # 止损 + 1%
    "60": stoploss  # 仅止损
}
```

### 止损（Stoploss）

设置 `stoploss` 值用于您的策略。

```python
# 这意味着如果价格下跌超过 10%，策略将退出交易
stoploss = -0.10
```

有关更高级的止损技术，请参阅[止损文档（Stoploss）](https://www.freqtrade.io/en/stable/stoploss/)。

### 时间框架（Timeframe）

这是您的策略将运行的时间框架。

```python
# 这意味着策略将在 5 分钟蜡烛上运行
timeframe = '5m'
```

### 可以做空（Shorting support）

这定义了策略是否可以做空。

```python
# 允许做空
can_short: bool = True
```

### 元数据字典（Metadata dict）

`metadata` 字典包含有关当前交易对的其他信息：

```python
{
    'pair': 'ETH/BTC',  # 当前交易对
    'timeframe': '5m',  # 当前时间框架
}
```

## 策略所需的导入（Imports necessary for a strategy）

```python
import numpy as np
import pandas as pd
from pandas import DataFrame
from freqtrade.strategy import IStrategy
import talib.abstract as ta
import freqtrade.vendor.qtpylib.indicators as qtpylib
```

## 策略文件加载（Strategy file loading）

默认情况下，Freqtrade 将尝试从 `user_data/strategies` 加载策略。

您可以通过以下方式指定其他位置：

```bash
freqtrade trade --strategy-path /path/to/strategies --strategy AwesomeStrategy
```

## 信息性交易对（Informative Pairs）

### 获取非交易对的数据（Get data for non-tradeable pairs）

数据可以从您的白名单之外的交易对获取，这些被称为"信息性交易对"。

#### 信息性交易对装饰器（Informative pairs decorator (@informative())）

```python
from freqtrade.strategy import informative

class AwesomeStrategy(IStrategy):
    
    @informative('1h')
    def populate_indicators_1h(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        return dataframe
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # 现在可以访问 1h 数据
        dataframe['rsi_1h'] = self.dp.get_pair_dataframe(metadata['pair'], '1h')['rsi']
        return dataframe
```

#### merge_informative_pair()

```python
from freqtrade.strategy import merge_informative_pair

def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    # 获取 1h 数据
    informative = self.dp.get_pair_dataframe(metadata['pair'], timeframe='1h')
    
    # 添加指标
    informative['rsi'] = ta.RSI(informative, timeperiod=14)
    
    # 合并到主数据框
    dataframe = merge_informative_pair(dataframe, informative, self.timeframe, '1h', ffill=True)
    
    return dataframe
```

## 额外数据（Additional data (DataProvider)）

### DataProvider 的可能选项（Possible options for DataProvider）

* `available_pairs` - 可用交易对列表
* `current_whitelist()` - 当前白名单
* `get_pair_dataframe(pair, timeframe)` - 获取特定交易对的数据框
* `get_analyzed_dataframe(pair, timeframe)` - 获取已分析的数据框
* `orderbook(pair, maximum)` - 获取订单簿数据
* `ticker(pair)` - 获取股票代码数据

### 示例用法（Example Usages）

```python
def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    if self.dp:
        # 获取其他时间框架数据
        dataframe_1h = self.dp.get_pair_dataframe(metadata['pair'], '1h')
        
        # 获取其他交易对数据
        btc_usdt = self.dp.get_pair_dataframe('BTC/USDT', self.timeframe)
        
        if not dataframe_1h.empty:
            dataframe['rsi_1h'] = ta.RSI(dataframe_1h, timeperiod=14).reindex(dataframe.index, method='ffill')
    
    return dataframe
```

### available_pairs

```python
if self.dp:
    for pair in self.dp.available_pairs:
        print(f"Available pair: {pair}")
```

### current_whitelist()

```python
if self.dp:
    pairs = self.dp.current_whitelist()
    print(f"Current whitelist: {pairs}")
```

### get_pair_dataframe(pair, timeframe)

```python
if self.dp:
    dataframe_1h = self.dp.get_pair_dataframe('ETH/BTC', '1h')
    if not dataframe_1h.empty:
        # 使用数据
        pass
```

### get_analyzed_dataframe(pair, timeframe)

```python
if self.dp:
    dataframe, last_updated = self.dp.get_analyzed_dataframe('ETH/BTC', self.timeframe)
    if not dataframe.empty:
        # 使用已分析的数据
        pass
```

### orderbook(pair, maximum)

```python
if self.dp:
    if self.dp.runmode.value in ('live', 'dry_run'):
        ob = self.dp.orderbook(metadata['pair'], 1)
        dataframe['best_bid'] = ob['bids'][0][0]
        dataframe['best_ask'] = ob['asks'][0][0]
```

### ticker(pair)

```python
if self.dp:
    if self.dp.runmode.value in ('live', 'dry_run'):
        ticker = self.dp.ticker(metadata['pair'])
        dataframe['last_price'] = ticker['last']
```

### 发送通知（Send Notification）

```python
if self.dp:
    self.dp.send_msg(f"交易对 {metadata['pair']} 的 RSI 为 {dataframe['rsi'].iloc[-1]}")
```

### 完整的 DataProvider 示例（Complete DataProvider sample）

```python
def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    if not self.dp:
        # 没有 DataProvider 可用
        return dataframe
    
    # 获取 1h 时间框架数据
    informative = self.dp.get_pair_dataframe(metadata['pair'], '1h')
    if not informative.empty:
        informative['rsi'] = ta.RSI(informative, timeperiod=14)
        dataframe = merge_informative_pair(dataframe, informative, self.timeframe, '1h', ffill=True)
    
    # 获取订单簿数据（仅实盘/干跑）
    if self.dp.runmode.value in ('live', 'dry_run'):
        ob = self.dp.orderbook(metadata['pair'], 1)
        dataframe['bid'] = ob['bids'][0][0]
        dataframe['ask'] = ob['asks'][0][0]
        dataframe['spread'] = dataframe['ask'] - dataframe['bid']
    
    return dataframe
```

## 额外数据（Additional data (Wallets)）

策略提供对 `wallets` 对象的访问。这包含交易所上您的钱包/账户的当前余额。

:::caution 回测 / 超参优化（Backtesting / Hyperopt）
钱包的行为因调用它的函数而异。在 `populate_*()` 方法中，它将返回配置的完整钱包。在回调中，您将获得与模拟过程中该点的实际模拟钱包相对应的钱包状态。
:::

始终检查 `wallets` 是否可用以避免回测期间失败。

```python
if self.wallets:
    free_eth = self.wallets.get_free('ETH')
    used_eth = self.wallets.get_used('ETH')
    total_eth = self.wallets.get_total('ETH')
```

### Wallets 的可能选项（Possible options for Wallets）

* `get_free(asset)` - 当前可交易余额
* `get_used(asset)` - 当前被占用余额（未完成订单）
* `get_total(asset)` - 总可用余额 - 上述两者之和

## 额外数据（Additional data (Trades)）

可以通过查询数据库在策略中检索交易历史。

在文件顶部，导入所需对象：

```python
from freqtrade.persistence import Trade
```

以下示例查询今天当前交易对（`metadata['pair']`）的交易。可以轻松添加其他过滤器。

```python
from datetime import datetime, timedelta, timezone

trades = Trade.get_trades_proxy(pair=metadata['pair'],
                                open_date=datetime.now(timezone.utc) - timedelta(days=1),
                                is_open=False,
            ).order_by(Trade.close_date).all()
# 汇总此交易对的利润
curdayprofit = sum(trade.close_profit for trade in trades)
```

有关可用方法的完整列表，请查阅 Trade 对象文档。

:::warning 警告（Warning）
交易历史在回测或超参优化期间的 `populate_*` 方法中不可用，将导致空结果。
:::

## 防止特定交易对发生交易（Prevent trades from happening for a specific pair）

Freqtrade 在交易对退出时会自动锁定交易对（直到该蜡烛结束），防止该交易对立即重新入场。

这是为了防止单个蜡烛内的许多频繁交易"瀑布"。

锁定的交易对将显示消息 `Pair <pair> is currently locked.`。

### 从策略内锁定交易对（Locking pairs from within the strategy）

有时可能希望在某些事件发生后锁定交易对（例如连续多次亏损交易）。

Freqtrade 有一个简单的方法从策略内执行此操作，通过调用 `self.lock_pair(pair, until, [reason])`。`until` 必须是未来的日期时间对象，在此之后将重新启用该交易对的交易，而 `reason` 是详细说明交易对被锁定原因的可选字符串。

锁定也可以手动解除，通过调用 `self.unlock_pair(pair)` 或 `self.unlock_reason(<reason>)`，提供交易对被解锁的原因。`self.unlock_reason(<reason>)` 将解锁当前以提供原因锁定的所有交易对。

要验证交易对当前是否被锁定，使用 `self.is_pair_locked(pair)`。

:::note 注意（Note）
锁定的交易对将始终向上舍入到下一根蜡烛。因此假设 `5m` 时间框架，设置 `until` 为 10:18 的锁定将锁定交易对直到从 10:15-10:20 的蜡烛完成。
:::

:::warning 警告（Warning）
手动锁定交易对在回测期间不可用。只允许通过保护进行锁定。
:::

#### 交易对锁定示例（Pair locking example）

```python
from freqtrade.persistence import Trade
from datetime import timedelta, datetime, timezone
# 将上述行放在策略文件的顶部，紧挨着所有其他导入
# --------

# 在 populate indicators（或 populate_entry_trend）内：
if self.config['runmode'].value in ('live', 'dry_run'):
    # 获取最近 2 天的已关闭交易
    trades = Trade.get_trades_proxy(
        pair=metadata['pair'], is_open=False, 
        open_date=datetime.now(timezone.utc) - timedelta(days=2))
    # 分析您想要锁定交易对的条件....对每个策略可能都不同
    sumprofit = sum(trade.close_profit for trade in trades)
    if sumprofit < 0:
        # 锁定交易对 12 小时
        self.lock_pair(metadata['pair'], until=datetime.now(timezone.utc) + timedelta(hours=12))
```

## 打印主数据框（Print the main dataframe）

要检查当前主数据框，您可以在 `populate_entry_trend()` 或 `populate_exit_trend()` 中发出打印语句。您可能还想打印交易对，以便清楚显示当前数据。

```python
def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    dataframe.loc[
        (
            #>> 任何条件 <<<
        ),
        ['enter_long', 'enter_tag']] = (1, 'somestring')

    # 打印分析的交易对
    print(f"result for {metadata['pair']}")

    # 检查最后 5 行
    print(dataframe.tail())

    return dataframe
```

打印更多行也可以通过使用 `print(dataframe)` 而不是 `print(dataframe.tail())` 来实现。但是不建议这样做，因为可能导致大量输出（每个交易对每 5 秒约 500 行）。

## 开发策略时的常见错误（Common mistakes when developing strategies）

### 回测时展望未来（Looking into the future while backtesting）

回测出于性能原因一次分析整个数据框时间范围。因此，策略作者需要确保策略不会前瞻未来，即使用在干跑或实盘模式下不可用的数据。

这是一个常见的痛点，可能导致回测和干跑/实盘运行方法之间的巨大差异。展望未来的策略在回测期间表现良好，通常具有令人难以置信的利润或胜率，但在实际条件下会失败或表现不佳。

以下列表包含一些应该避免的常见模式以防止挫折：

* 不要使用 `shift(-1)` 或其他负值。这在回测中使用来自未来的数据，在干跑或实盘模式下不可用。
* 不要在 `populate_` 函数中使用 `.iloc[-1]` 或数据框中的任何其他绝对位置，因为这在干跑和回测之间会不同。但是，绝对 `iloc` 索引在回调中是安全使用的 - 请参阅策略回调。
* 不要使用使用所有数据框或列值的函数，例如 `dataframe['mean_volume'] = dataframe['volume'].mean()`。由于回测使用完整数据框，在数据框的任何点，`'mean_volume'` 系列都会包含来自未来的数据。使用滚动计算代替，例如 `dataframe['volume'].rolling(<window>).mean()`。
* 不要使用 `.resample('1h')`。这使用期间间隔的左边界，因此将数据从小时边界移动到小时开始。使用 `.resample('1h', label='right')` 代替。
* 不要使用 `.merge()` 将较长时间框架合并到较短时间框架上。相反，使用信息性交易对助手。（普通合并可能隐式导致前瞻偏差，因为日期指的是开盘日期，而不是收盘日期）。

:::tip 识别问题（Identifying problems）
您应该始终使用两个辅助命令 `lookahead-analysis` 和 `recursive-analysis`，它们可以以不同方式帮助您找出策略问题。请将它们视为它们的本质 - 识别最常见问题的助手。每个的负面结果并不保证不包含上述错误。
:::

### 冲突信号（Colliding signals）

当冲突信号碰撞时（例如 `'enter_long'` 和 `'exit_long'` 都设置为 `1`），freqtrade 将不执行任何操作并忽略入场信号。这将避免立即入场和出场的交易。显然，这可能导致错过入场。

以下规则适用，如果设置了 3 个信号中的多个，入场信号将被忽略：

* `enter_long` -> `exit_long`, `enter_short`
* `enter_short` -> `exit_short`, `enter_long`

## 进一步的策略想法（Further strategy ideas）

要获得策略的其他想法，请前往策略仓库。随意将它们用作示例，但结果将取决于当前市场情况、使用的交易对等。因此，这些策略应仅被视为学习目的，而不是真实世界交易。请首先为您的交易所/所需交易对回测策略，然后干跑仔细评估，并自担风险使用。

随意使用任何策略作为您自己策略的灵感。我们很乐意接受包含新策略的 Pull Requests 到仓库。

## 下一步（Next steps）

现在您有了一个完美的策略，您可能想要回测它。您的下一步是学习如何使用回测。
