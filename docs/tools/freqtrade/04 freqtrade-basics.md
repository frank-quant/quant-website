---
id: freqtrade-basics
title: Freqtrade 基础
sidebar_label: 04 Freqtrade基础
description: Freqtrade 官方"Freqtrade Basics"页面中文翻译，保留原结构、提示块与代码块格式。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/bot-basics/`](https://www.freqtrade.io/en/stable/bot-basics/)

# Freqtrade 基础

本页面为你提供一些关于 Freqtrade 如何工作和运行的基本概念。

## Freqtrade 术语

* **Strategy（策略）**: 你的交易策略，告诉机器人要做什么。
* **Trade（交易）**: 开放仓位。
* **Open Order（开放订单）**: 当前在交易所下达的订单，尚未完成。
* **Pair（交易对）**: 可交易的对，通常为 Base/Quote 格式（如现货 `XRP/USDT`，期货 `XRP/USDT:USDT`）。
* **Timeframe（时间框架）**: 要使用的蜡烛图长度（如 `"5m"`，`"1h"`，...）。
* **Indicators（指标）**: 技术指标（SMA，EMA，RSI，...）。
* **Limit order（限价单）**: 以定义的限价或更好的价格执行的限价订单。
* **Market order（市价单）**: 保证成交，可能会根据订单大小移动价格。
* **Current Profit（当前利润）**: 此交易当前待定（未实现）利润。这主要在整个机器人和 UI 中使用。
* **Realized Profit（已实现利润）**: 已经实现的利润。仅与[部分退出](https://www.freqtrade.io/en/stable/strategy-customization/#exit-signal-rules)相关 - 这也解释了此项的计算逻辑。
* **Total Profit（总利润）**: 已实现和未实现利润的组合。相对数字（%）是根据此交易的总投资计算的。

## 费用处理

Freqtrade 的所有利润计算都包含费用。对于回测/超参数优化/干跑模式，使用交易所默认费用（交易所的最低档费用）。对于实盘操作，使用交易所应用的费用（这包括 BNB 返利等）。

## 交易对命名

Freqtrade 遵循 [ccxt](https://github.com/ccxt/ccxt) 的货币命名约定。在错误的市场中使用错误的命名约定通常会导致机器人无法识别该交易对，通常会出现"this pair is not available"等错误。

### 现货交易对命名

对于现货交易对，命名为 `base/quote`（如 `ETH/USDT`）。

### 期货交易对命名

对于期货交易对，命名为 `base/quote:settle`（如 `ETH/USDT:USDT`）。

## 机器人执行逻辑

在干跑或实盘模式下启动 freqtrade（使用 `freqtrade trade`）将启动机器人并开始机器人迭代循环。这也会运行 `bot_start()` 回调。

默认情况下，机器人循环每隔几秒（`internals.process_throttle_secs`）运行一次，并执行以下操作：

* 从持久化存储获取开放交易。
* 计算当前可交易交易对列表。
* 为交易对列表下载 OHLCV 数据，包括所有信息性交易对  
此步骤每根蜡烛图只执行一次，以避免不必要的网络流量。
* 调用 `bot_loop_start()` 策略回调。
* 按交易对分析策略。  
  * 调用 `populate_indicators()`  
  * 调用 `populate_entry_trend()`  
  * 调用 `populate_exit_trend()`
* 从交易所更新交易开放订单状态。  
  * 对已成交订单调用 `order_filled()` 策略回调。  
  * 检查开放订单的超时。  
    * 对开放入场订单调用 `check_entry_timeout()` 策略回调。  
    * 对开放退出订单调用 `check_exit_timeout()` 策略回调。  
    * 对开放订单调用 `adjust_order_price()` 策略回调。  
      * 对开放入场订单调用 `adjust_entry_price()` 策略回调。_仅在未实现 `adjustorderprice()` 时调用_  
      * 对开放退出订单调用 `adjust_exit_price()` 策略回调。_仅在未实现 `adjustorderprice()` 时调用_
* 验证现有仓位并最终下达退出订单。  
  * 考虑止损、ROI 和退出信号、`custom_exit()` 和 `custom_stoploss()`。  
  * 根据 `exit_pricing` 配置设置或使用 `custom_exit_price()` 回调确定退出价格。  
  * 在下达退出订单之前，调用 `confirm_trade_exit()` 策略回调。
* 如果启用，通过调用 `adjust_trade_position()` 检查开放交易的仓位调整，如果需要则下达额外订单。
* 检查交易槽是否仍然可用（如果达到 `max_open_trades`）。
* 验证入场信号尝试进入新仓位。  
  * 根据 `entry_pricing` 配置设置或使用 `custom_entry_price()` 回调确定入场价格。  
  * 在保证金和期货模式下，调用 `leverage()` 策略回调以确定所需杠杆。  
  * 通过调用 `custom_stake_amount()` 回调确定投注大小。  
  * 在下达入场订单之前，调用 `confirm_trade_entry()` 策略回调。

此循环将一遍又一遍地重复，直到机器人停止。

## 回测 / 超参数优化执行逻辑

回测或超参数优化只执行上述逻辑的一部分，因为大多数交易操作都是完全模拟的。

* 为配置的交易对列表加载历史数据。
* 调用一次 `bot_start()`。
* 计算指标（每个交易对调用一次 `populate_indicators()`）。
* 计算入场/退出信号（每个交易对调用一次 `populate_entry_trend()` 和 `populate_exit_trend()`）。
* 按蜡烛图循环模拟入场和退出点。  
  * 调用 `bot_loop_start()` 策略回调。  
  * 检查订单超时，通过 `unfilledtimeout` 配置，或通过 `check_entry_timeout()` / `check_exit_timeout()` 策略回调。  
  * 对开放订单调用 `adjust_order_price()` 策略回调。  
    * 对开放入场订单调用 `adjust_entry_price()` 策略回调。_仅在未实现 `adjustorderprice()` 时调用！_  
    * 对开放退出订单调用 `adjust_exit_price()` 策略回调。_仅在未实现 `adjustorderprice()` 时调用！_  
  * 检查交易入场信号（`enter_long` / `enter_short` 列）。  
  * 确认交易入场/退出（如果在策略中实现，则调用 `confirm_trade_entry()` 和 `confirm_trade_exit()`）。  
  * 调用 `custom_entry_price()`（如果在策略中实现）以确定入场价格（价格被移动到开盘蜡烛图内）。  
  * 在保证金和期货模式下，调用 `leverage()` 策略回调以确定所需杠杆。  
  * 通过调用 `custom_stake_amount()` 回调确定投注大小。  
  * 如果启用，检查开放交易的仓位调整并调用 `adjust_trade_position()` 以确定是否请求额外订单。  
  * 对已成交入场订单调用 `order_filled()` 策略回调。  
  * 调用 `custom_stoploss()` 和 `custom_exit()` 以找到自定义退出点。  
  * 对于基于退出信号、自定义退出和部分退出的退出：调用 `custom_exit_price()` 以确定退出价格（价格被移动到收盘蜡烛图内）。  
  * 对已成交退出订单调用 `order_filled()` 策略回调。
* 生成回测报告输出

:::note 注意
回测和超参数优化都在计算中包含交易所默认费用。可以通过指定 `--fee` 参数将自定义费用传递给回测/超参数优化。
:::

:::note 回调调用频率
回测将每个回调最多每根蜡烛图调用一次（`--timeframe-detail` 修改此行为为每根详细蜡烛图调用一次）。大多数回调在实盘中每次迭代都会被调用（通常每 ~5 秒） - 这可能导致回测不匹配。
:::


