---
id: strategy-callbacks
title: 策略回调（Strategy Callbacks）
sidebar_label: 08 策略回调（Strategy Callbacks）
description: Freqtrade 官方"Strategy Callbacks"页面完整中文翻译，详细介绍策略回调函数的使用。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/strategy-callbacks/`](https://www.freqtrade.io/en/stable/strategy-callbacks/)

# 策略回调（Strategy Callbacks）

本页面解释不同的策略回调以及何时调用它们。

## 机器人启动（Bot start）

机器人启动时调用一次。这可以用于执行一些初始设置或验证。

```python
import requests

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    def bot_start(self, **kwargs) -> None:
        """
        仅在机器人实例化后调用一次。
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        """
        if self.config["runmode"].value in ("live", "dry_run"):
            # 使用 self.* 将此分配给类
            # 然后可以在 populate_* 方法中使用
            self.custom_remote_data = requests.get("https://some_remote_source.example.com")
```

## 机器人循环开始（Bot loop start）

在每个机器人循环的开始调用（在获取新数据后，但在分析任何交易对之前）。

```python
import requests

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    def bot_loop_start(self, current_time: datetime, **kwargs) -> None:
        """
        在每个机器人循环的开始调用（在获取新数据后，但在分析任何交易对之前）
        可用于执行交易对独立的任务（发送通知、Web 请求、分析整体市场情况等）
        例如，您可以实施一个 5 分钟的冷却期：
        if current_time - timedelta(minutes=5) > self.last_bt_loop_start:
            self.last_bt_loop_start = current_time
            # 在这里执行您的任务
        :param current_time: datetime 对象，包含当前日期时间
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        """
        if self.config["runmode"].value in ("live", "dry_run"):
            # 分配给类变量，以便您可以在 populate_* 方法中使用
            self.remote_data = requests.get("https://some_remote_source.example.com")
```

## 自定义持仓大小（Custom stake size）

在计算持仓大小时调用。允许您根据当前市场状况或任何其他您认为重要的因素来调整持仓大小。

```python
class AwesomeStrategy(IStrategy):
    def custom_stake_amount(self, pair: str, current_time: datetime, current_rate: float,
                           proposed_stake: float, min_stake: Optional[float], max_stake: float,
                           leverage: float, entry_tag: Optional[str], side: str,
                           **kwargs) -> float:

        dataframe, _ = self.dp.get_analyzed_dataframe(pair=pair, timeframe=self.timeframe)
        current_candle = dataframe.iloc[-1].squeeze()

        if current_candle['fastk_rsi_1h'] > current_candle['fastd_rsi_1h']:
            if self.config['stake_amount'] == 'unlimited':
                # 使用最大可能的持仓金额
                return max_stake
            else:
                # 增加持仓
                return proposed_stake * 1.2

        # 使用默认持仓大小
        return proposed_stake
```

有关此回调的更多详细信息，请参阅[文档](https://www.freqtrade.io/en/stable/strategy-customization/#custom-stake-size)。

## 自定义价格（Custom price）

在计算入场和出场价格时调用。允许您根据当前市场状况或任何其他您认为重要的因素来调整价格。

### 自定义入场价格（Custom entry price）

```python
class AwesomeStrategy(IStrategy):

    def custom_entry_price(self, pair: str, current_time: datetime, proposed_rate: float,
                          entry_tag: Optional[str], side: str, **kwargs) -> float:

        dataframe, last_updated = self.dp.get_analyzed_dataframe(pair=pair,
                                                                timeframe=self.timeframe)
        entry_price = (dataframe['close'].iloc[-1] + dataframe['open'].iloc[-1]) / 2

        return entry_price
```

### 自定义出场价格（Custom exit price）

```python
class AwesomeStrategy(IStrategy):

    def custom_exit_price(self, pair: str, trade: Trade, current_time: datetime,
                         proposed_rate: float, current_profit: float,
                         exit_tag: Optional[str], **kwargs) -> float:

        dataframe, last_updated = self.dp.get_analyzed_dataframe(pair=pair,
                                                                timeframe=self.timeframe)
        exit_price = dataframe['close'].iloc[-1]

        return exit_price
```

## 自定义出场信号（Custom exit signal）

在每个蜡烛图上调用（在 `populate_exit_trend` 之后），允许策略定义自定义出场方法。

```python
from freqtrade.persistence import Trade

class AwesomeStrategy(IStrategy):

    def custom_exit(self, pair: str, trade: Trade, current_time: datetime, current_rate: float,
                   current_profit: float, **kwargs):
        """
        自定义出场逻辑，在每个蜡烛图上调用。
        对于完整文档请查看 https://www.freqtrade.io/en/stable/strategy-customization/#custom-exit-signal

        返回字符串或 True 时，将使用自定义出场原因退出。
        返回 'force_exit' 将强制退出，忽略 `minimum_roi` 和 `ignore_roi_if_entry_signal`。

        :param pair: 当前分析的交易对
        :param trade: 当前交易的交易对象
        :param current_time: datetime 对象，包含当前日期时间
        :param current_rate: 当前蜡烛图的收盘价。
        :param current_profit: 当前利润（百分比），计算为：
            (current_rate - entry_rate) / entry_rate
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 要使用的退出原因。
        """

        # 在 10% 利润时退出
        if current_profit > 0.1:
            return 'ten_percent_profit'

        # 在亏损 4% 时退出
        if current_profit < -0.04:
            return 'four_percent_loss'

        # 获取分析的数据框
        dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
        last_candle = dataframe.iloc[-1].squeeze()

        # 在 RSI 达到 70 时退出
        if last_candle['rsi'] > 70:
            return 'rsi_too_high'
```

有关此回调的更多详细信息，请参阅[文档](https://www.freqtrade.io/en/stable/strategy-customization/#custom-exit-signal)。

:::note 注意（Note）
返回非空的字符串或 `True`，等同于在指定时间的蜡烛上设置退出信号。
:::

## 自定义止损（Custom stoploss）

每个蜡烛图都会调用止损逻辑，允许您根据交易的当前利润（百分比）或任何其他您认为重要的因素来调整止损。

有关此回调的更多详细信息，请参阅[止损文档](https://www.freqtrade.io/en/stable/stoploss/)。

```python
from datetime import datetime
from freqtrade.persistence import Trade

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                       current_rate: float, current_profit: float, **kwargs) -> float:
        """
        自定义止损逻辑，在每个蜡烛图上调用。
        :param pair: 当前分析的交易对
        :param trade: 当前交易的交易对象
        :param current_time: datetime 对象，包含当前日期时间
        :param current_rate: 当前蜡烛图的收盘价。
        :param current_profit: 当前利润（百分比），计算为：
            (current_rate - entry_rate) / entry_rate
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 新的止损值，相对于当前汇率
        """

        # 在 10% 利润后收紧止损到 5%
        if current_profit > 0.10:
            return -0.05

        # 在 4% 利润后收紧止损到 2%
        if current_profit > 0.04:
            return -0.02

        # 使用策略定义的止损
        return self.stoploss
```

## 自定义订单超时规则（Custom order timeout rules）

简单的超时设置通过 `unfilledtimeout` 配置设置处理。但是，可能有情况需要更复杂的超时规则。对于这种情况，可以实现 `check_entry_timeout()` 和/或 `check_exit_timeout()`。

:::warning 警告（Warning）
在回测或超参数优化期间，未成交订单超时不相关，仅在真实（实时）交易中相关。因此，这些方法仅在这些情况下被调用。
:::

### 自定义订单超时示例（Custom order timeout example）

一个简单的示例，它将在 5 分钟后取消买入订单，在 10 分钟后取消卖出订单，忽略配置中的 `unfilledtimeout` 设置。

```python
from datetime import datetime, timedelta, timezone
from freqtrade.persistence import Trade

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    # 设置 unfilledtimeout 为很长的时间
    unfilledtimeout = {
        'entry': 10000,
        'exit': 10000
    }

    def check_entry_timeout(self, pair: str, trade: Trade, order: Dict[str, Any],
                           current_time: datetime, **kwargs) -> bool:
        """
        检查入场订单是否应该超时。
        :param pair: 当前分析的交易对
        :param trade: 当前交易的交易对象
        :param order: 当前订单对象
        :param current_time: datetime 对象，包含当前日期时间
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 如果订单应该被取消则返回 True
        """
        ob = self.dp.orderbook(pair, 1)
        current_price = ob[f"{order['side']}s"][0][0]
        # 取消买入订单如果价格上涨 2%
        if order['side'] == 'buy':
            if current_price > order['price'] * 1.02:
                return True
        # 取消卖出订单如果价格下跌 2%
        else:
            if current_price < order['price'] * 0.98:
                return True

        # 5 分钟后取消买入订单
        if (current_time - trade.open_date_utc).total_seconds() > 300:
            return True
        return False

    def check_exit_timeout(self, pair: str, trade: Trade, order: Dict[str, Any],
                          current_time: datetime, **kwargs) -> bool:
        """
        检查出场订单是否应该超时。
        :param pair: 当前分析的交易对
        :param trade: 当前交易的交易对象
        :param order: 当前订单对象
        :param current_time: datetime 对象，包含当前日期时间
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 如果订单应该被取消则返回 True
        """
        # 10 分钟后取消卖出订单
        if (current_time - trade.open_date_utc).total_seconds() > 600:
            return True
        return False
```

### 使用附加数据的自定义订单超时示例（Custom order timeout example using additional data）

```python
from datetime import datetime
from freqtrade.persistence import Trade

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    # 设置 unfilledtimeout 为很长的时间
    unfilledtimeout = {
        'entry': 10000,
        'exit': 10000
    }

    def check_entry_timeout(self, pair: str, trade: Trade, order: Dict[str, Any],
                           current_time: datetime, **kwargs) -> bool:
        ob = self.dp.orderbook(pair, 1)
        current_price = ob[f"{order['side']}s"][0][0]
        # 取消买入订单如果价格上涨 2%
        if order['side'] == 'buy':
            if current_price > order['price'] * 1.02:
                return True
        # 取消卖出订单如果价格下跌 2%
        else:
            if current_price < order['price'] * 0.98:
                return True

        return False

    def check_exit_timeout(self, pair: str, trade: Trade, order: Dict[str, Any],
                          current_time: datetime, **kwargs) -> bool:
        ob = self.dp.orderbook(pair, 1)
        current_price = ob[f"{order['side']}s"][0][0]
        # 取消卖出订单如果价格上涨 2%
        if order['side'] == 'sell':
            if current_price > order['price'] * 1.02:
                return True
        # 取消买入订单如果价格下跌 2%
        else:
            if current_price < order['price'] * 0.98:
                return True

        return False
```

## 自定义订单价格规则（Custom order price rules）

默认情况下，freqtrade 将使用入场和出场信号的收盘价。对于市价单，这通常是可以的，但对于限价单，您可能希望使用不同的价格（通常是开盘价或基于指标的价格）。

通过覆盖 `custom_entry_price()` 和 `custom_exit_price()` 方法，您可以定义自定义入场和出场价格。

### 入场价格（Entry price）

#### 基于指标的入场价格（Indicator based entry price）

```python
class AwesomeStrategy(IStrategy):

    def custom_entry_price(self, pair: str, current_time: datetime, proposed_rate: float,
                          entry_tag: Optional[str], side: str, **kwargs) -> float:

        dataframe, last_updated = self.dp.get_analyzed_dataframe(pair=pair,
                                                                timeframe=self.timeframe)
        entry_price = dataframe['bollinger_10_lowerband'].iloc[-1]

        return entry_price
```

#### 基于订单簿的入场价格（Orderbook based entry price）

```python
class AwesomeStrategy(IStrategy):

    def custom_entry_price(self, pair: str, current_time: datetime, proposed_rate: float,
                          entry_tag: Optional[str], side: str, **kwargs) -> float:
        ob = self.dp.orderbook(pair, 1)
        current_price = ob[f"{side}s"][0][0]
        # 稍微调整价格以获得更好的成交机会
        if side == 'buy':
            return current_price * 1.01
        else:
            return current_price * 0.99
```

### 出场价格（Exit price）

#### 基于指标的出场价格（Indicator based exit price）

```python
class AwesomeStrategy(IStrategy):

    def custom_exit_price(self, pair: str, trade: Trade, current_time: datetime,
                         proposed_rate: float, current_profit: float,
                         exit_tag: Optional[str], **kwargs) -> float:

        dataframe, last_updated = self.dp.get_analyzed_dataframe(pair=pair,
                                                                timeframe=self.timeframe)
        exit_price = dataframe['bollinger_10_upperband'].iloc[-1]

        return exit_price
```

## 杠杆回调（Leverage Callback）

当使用期货交易时，可以实现 `leverage()` 回调来定义您想要使用的杠杆量。

```python
class AwesomeStrategy(IStrategy):

    def leverage(self, pair: str, current_time: datetime, current_rate: float,
                proposed_leverage: float, max_leverage: float, entry_tag: Optional[str],
                side: str, **kwargs) -> float:
        """
        自定义杠杆逻辑，为每笔交易调用。
        :param pair: 当前分析的交易对
        :param current_time: datetime 对象，包含当前日期时间
        :param current_rate: 当前蜡烛图的收盘价。
        :param proposed_leverage: 配置中提议的杠杆。
        :param max_leverage: 交易所允许的最大杠杆。
        :param entry_tag: 可选的入场标签
        :param side: 'long' 或 'short' - 表示交易方向
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 要使用的杠杆。必须在 1.0 和 max_leverage 之间。
        """

        return 1.0
```

## 确认交易入场（Confirm trade entry）

`confirm_trade_entry()` 可以用来在入场订单即将下达之前中止交易入场。

```python
class AwesomeStrategy(IStrategy):

    def confirm_trade_entry(self, pair: str, order_type: str, amount: float, rate: float,
                           time_in_force: str, current_time: datetime, entry_tag: Optional[str],
                           side: str, **kwargs) -> bool:
        """
        在入场订单即将下达之前调用。
        :param pair: 当前分析的交易对
        :param order_type: 订单类型如 market, limit, ...
        :param amount: 此交易的金额
        :param rate: 此交易的汇率
        :param time_in_force: 订单的有效时间
        :param current_time: datetime 对象，包含当前日期时间
        :param entry_tag: 可选的入场标签
        :param side: 'long' 或 'short' - 表示交易方向
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 如果交易应该进行则返回 True
        """

        return True
```

## 确认交易出场（Confirm trade exit）

`confirm_trade_exit()` 可以用来在出场订单即将下达之前中止交易出场。

```python
class AwesomeStrategy(IStrategy):

    def confirm_trade_exit(self, pair: str, trade: Trade, order_type: str, amount: float,
                          rate: float, time_in_force: str, exit_reason: str,
                          current_time: datetime, **kwargs) -> bool:
        """
        在出场订单即将下达之前调用。
        :param pair: 当前分析的交易对
        :param trade: 当前交易的交易对象
        :param order_type: 订单类型如 market, limit, ...
        :param amount: 此交易的金额
        :param rate: 此交易的汇率
        :param time_in_force: 订单的有效时间
        :param exit_reason: 退出原因字符串
        :param current_time: datetime 对象，包含当前日期时间
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 如果交易应该退出则返回 True
        """
        return True
```

## 调整交易持仓（Adjust trade position）

`adjust_trade_position()` 可以用来执行额外的订单，以增加或减少您的持仓。

```python
class AwesomeStrategy(IStrategy):

    position_adjustment_enable = True

    def adjust_trade_position(self, trade: Trade, current_time: datetime,
                             current_rate: float, current_profit: float,
                             min_stake: Optional[float], max_stake: float,
                             current_entry_rate: float, current_exit_rate: float,
                             current_entry_profit: float, current_exit_profit: float,
                             **kwargs) -> Optional[float]:
        """
        自定义交易调整逻辑，允许您管理您的入场和出场。
        这只在 `position_adjustment_enable` 设置为 True 时调用。

        有关完整文档请查看 https://www.freqtrade.io/en/stable/strategy-advanced/#adjust-trade-position

        当不返回任何内容时，不会发生调整。
        当返回 None 时，不会发生调整。
        当返回正值时，这将以基础货币购买该金额的交易对。
        当返回负值时，这将以基础货币出售该金额的交易对。
        持仓将相应地增加/减少。
        当返回的值将导致持仓为 0 或更少时，整个交易将被关闭。

        :param trade: 当前交易的交易对象
        :param current_time: datetime 对象，包含当前日期时间
        :param current_rate: 当前蜡烛图的收盘价。
        :param current_profit: 当前利润（百分比），计算为：
            (current_rate - entry_rate) / entry_rate
        :param min_stake: 最小持仓金额
        :param max_stake: 交易所允许的最大持仓金额
        :param current_entry_rate: 当前入场汇率
        :param current_exit_rate: 当前出场汇率
        :param current_entry_profit: 当前入场利润
        :param current_exit_profit: 当前出场利润
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 要添加到持仓的金额。正值 = 买入，负值 = 卖出，None = 不做任何事情
        """
        return None
```

有关此回调的更多详细信息，请参阅[文档](https://www.freqtrade.io/en/stable/strategy-advanced/#adjust-trade-position)。

## 订单成交回调（Order filled callback）

`order_filled()` 在订单成交后调用，可用于通知或其他自定义操作，这些操作需要在订单成交后立即执行。

```python
from freqtrade.persistence import Trade

class AwesomeStrategy(IStrategy):

    def order_filled(self, pair: str, trade: Trade, order: Dict[str, Any], 
                    current_time: datetime, **kwargs) -> None:
        """
        在订单成交后调用
        :param pair: 当前分析的交易对
        :param trade: 当前交易的交易对象
        :param order: 成交的订单对象
        :param current_time: datetime 对象，包含当前日期时间
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        """
        if order['side'] == 'buy':
            # 对买入订单的操作
            pass

        elif order['side'] == 'sell':
            # 对卖出订单的操作
            pass
```

## 调整订单（Adjust order）

`adjust_order_price()` 回调可以用来实现自定义逻辑来调整订单价格。订单调整将在订单创建后和每次机器人循环中调用，直到订单成交或取消。

```python
from freqtrade.persistence import Trade

class AwesomeStrategy(IStrategy):

    def adjust_entry_price(self, trade: Trade, order: Dict[str, Any], pair: str,
                          current_time: datetime, proposed_rate: float, current_order_rate: float,
                          entry_tag: Optional[str], side: str, **kwargs) -> float:
        """
        入场价格调整逻辑，在每个机器人循环中为未成交的入场订单调用。
        :param trade: 当前交易的交易对象
        :param order: 当前订单对象
        :param pair: 当前分析的交易对
        :param current_time: datetime 对象，包含当前日期时间
        :param proposed_rate: 当前提议的汇率
        :param current_order_rate: 当前订单汇率
        :param entry_tag: 可选的入场标签
        :param side: 'long' 或 'short' - 表示交易方向
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 新的订单汇率
        """
        return proposed_rate

    def adjust_exit_price(self, trade: Trade, order: Dict[str, Any], pair: str,
                         current_time: datetime, proposed_rate: float, current_order_rate: float,
                         **kwargs) -> float:
        """
        出场价格调整逻辑，在每个机器人循环中为未成交的出场订单调用。
        :param trade: 当前交易的交易对象
        :param order: 当前订单对象
        :param pair: 当前分析的交易对
        :param current_time: datetime 对象，包含当前日期时间
        :param proposed_rate: 当前提议的汇率
        :param current_order_rate: 当前订单汇率
        :param **kwargs: 确保保留此参数，以便未来更新不会破坏您的策略。
        :return: 新的订单汇率
        """
        return proposed_rate
```

## 数据框架访问（Dataframe access）

您可以使用 `self.dp.get_analyzed_dataframe(pair, timeframe)` 从回调中获取分析的数据框。

```python
class AwesomeStrategy(IStrategy):

    def confirm_trade_entry(self, pair: str, order_type: str, amount: float, rate: float,
                           time_in_force: str, current_time: datetime, entry_tag: Optional[str],
                           side: str, **kwargs) -> bool:

        dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
        last_candle = dataframe.iloc[-1].squeeze()

        if last_candle['rsi'] < 35:
            return True

        return False
```

:::note 注意（Note）
有关数据框架访问的更多信息，请参阅[数据框架访问](https://www.freqtrade.io/en/stable/strategy-customization/#dataframe-access)。
:::

## 钱包（Wallets）

钱包对象可以在策略回调中使用，以获取有关可用资金的信息。

```python
class AwesomeStrategy(IStrategy):

    def custom_stake_amount(self, pair: str, current_time: datetime, current_rate: float,
                           proposed_stake: float, min_stake: Optional[float], max_stake: float,
                           leverage: float, entry_tag: Optional[str], side: str,
                           **kwargs) -> float:

        if self.wallets:
            # 仅在可用资金超过 20% 时交易
            if self.wallets.get_free('USDT') > self.wallets.get_total('USDT') * 0.2:
                return proposed_stake
        return 0
```

:::note 注意（Note）
钱包将仅在实时模式下可用，在回测期间不可用。
:::

## 下一步（Next steps）

现在您已经了解了策略回调，您可能想要学习更高级的止损技术。您的下一步是阅读[止损文档](https://www.freqtrade.io/en/stable/stoploss/)。