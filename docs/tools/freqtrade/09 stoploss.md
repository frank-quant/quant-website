---
id: stoploss
title: 止损
sidebar_label: 止损
description: Freqtrade 官方"Stoploss"页面完整中文翻译，详细介绍各种止损策略和配置。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/stoploss/`](https://www.freqtrade.io/en/stable/stoploss/)

# 止损

止损功能是为了限制损失。这是通过在价格下跌到某个点以下时出售资产来实现的。

## 静态止损

最简单的止损是静态止损。这是一个固定的百分比，如果价格下跌到该百分比以下，资产将被出售。

```python
class MyStrategy(IStrategy):
    stoploss = -0.10  # 10% 止损
```

使用这种配置，如果价格下跌 10% 或更多，Freqtrade 将出售资产。

## 跟踪止损

跟踪止损是一种更高级的止损形式，它会随着价格上涨而"跟踪"价格。

### 基本跟踪止损

```python
class MyStrategy(IStrategy):
    stoploss = -0.10
    trailing_stop = True
```

这将创建一个跟踪止损，从 -10% 开始，并在价格上涨时跟踪价格。

### 跟踪止损偏移

```python
class MyStrategy(IStrategy):
    stoploss = -0.10
    trailing_stop = True
    trailing_stop_positive = 0.02  # 当利润达到 2% 时开始跟踪
```

### 仅在利润时跟踪

```python
class MyStrategy(IStrategy):
    stoploss = -0.10
    trailing_stop = True
    trailing_stop_positive = 0.02
    trailing_only_offset_is_reached = True  # 仅在达到偏移时开始跟踪
```

## 交易所上的止损

某些交易所支持在交易所上设置止损订单。

```python
class MyStrategy(IStrategy):
    stoploss = -0.10
    stoploss_on_exchange = True
    stoploss_on_exchange_interval = 60  # 每 60 秒检查一次
```

### 交易所止损的优势

* 即使机器人离线也能工作
* 减少延迟
* 某些交易所提供更好的执行

### 交易所止损的缺点

* 不是所有交易所都支持
* 某些交易所的实现可能有限制
* 调试更困难

## 自定义止损

您可以实现自定义止损逻辑，该逻辑可以基于各种因素动态调整止损。

```python
from freqtrade.persistence import Trade

def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                   current_rate: float, current_profit: float, **kwargs) -> float:
    """
    自定义止损逻辑
    返回：
    - 正值或 None：不更改止损
    - 负值：新的止损值
    """
    
    # 基于时间的止损
    trade_duration = current_time - trade.open_date_utc
    
    if trade_duration < timedelta(minutes=20):
        # 前 20 分钟：紧止损
        return -0.05
    elif trade_duration < timedelta(hours=2):
        # 2 小时内：标准止损
        return -0.10
    elif current_profit > 0:
        # 盈利时：收紧止损
        if current_profit > 0.20:
            return -0.02  # 保护 20% 利润
        elif current_profit > 0.10:
            return -0.05  # 保护 10% 利润
        elif current_profit > 0.05:
            return -0.07  # 保护 5% 利润
    
    # 长期持有：放宽止损
    return -0.15
```

### 基于指标的止损

```python
def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                   current_rate: float, current_profit: float, **kwargs) -> float:
    """基于技术指标的动态止损"""
    
    dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
    last_candle = dataframe.iloc[-1].squeeze()
    
    # 基于 ATR 的止损
    if 'atr' in last_candle:
        atr_stop = last_candle['atr'] * 2 / current_rate
        return -atr_stop
    
    # 基于布林带的止损
    if 'bb_lowerband' in last_candle:
        bb_stop = (current_rate - last_candle['bb_lowerband']) / current_rate
        return -max(bb_stop, 0.02)  # 最小 2% 止损
    
    return self.stoploss
```

### 基于成交量的止损

```python
def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                   current_rate: float, current_profit: float, **kwargs) -> float:
    """基于成交量的动态止损"""
    
    dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
    last_candle = dataframe.iloc[-1].squeeze()
    
    # 计算平均成交量
    avg_volume = dataframe['volume'].rolling(20).mean().iloc[-1]
    
    if last_candle['volume'] < avg_volume * 0.5:
        # 成交量低时收紧止损
        return -0.05
    elif last_candle['volume'] > avg_volume * 2:
        # 成交量高时放宽止损
        return -0.15
    
    return self.stoploss
```

## 止损和 ROI 的交互

止损和最小 ROI 可以一起工作。机器人将在以下情况下退出：

1. 达到止损水平
2. 达到最小 ROI 目标
3. 收到退出信号

```python
class MyStrategy(IStrategy):
    minimal_roi = {
        "0": 0.20,   # 20% 立即退出
        "30": 0.15,  # 30 分钟后 15%
        "60": 0.10,  # 60 分钟后 10%
        "120": 0.05  # 120 分钟后 5%
    }
    stoploss = -0.10  # 10% 止损
```

## 止损的最佳实践

### 1. 基于市场波动性设置止损

```python
def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    # 计算 ATR 用于动态止损
    dataframe['atr'] = ta.ATR(dataframe, timeperiod=14)
    dataframe['atr_percent'] = dataframe['atr'] / dataframe['close']
    return dataframe

def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                   current_rate: float, current_profit: float, **kwargs) -> float:
    dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
    last_candle = dataframe.iloc[-1].squeeze()
    
    # 基于 ATR 的动态止损
    if 'atr_percent' in last_candle:
        dynamic_stop = last_candle['atr_percent'] * 2
        return -max(dynamic_stop, 0.02)  # 最小 2%
    
    return self.stoploss
```

### 2. 分级止损

```python
def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                   current_rate: float, current_profit: float, **kwargs) -> float:
    """分级止损系统"""
    
    if current_profit >= 0.30:
        return -0.05  # 30% 利润时，5% 止损
    elif current_profit >= 0.20:
        return -0.07  # 20% 利润时，7% 止损
    elif current_profit >= 0.10:
        return -0.10  # 10% 利润时，10% 止损
    elif current_profit >= 0.05:
        return -0.12  # 5% 利润时，12% 止损
    elif current_profit >= 0.02:
        return -0.15  # 2% 利润时，15% 止损
    
    return -0.20  # 默认 20% 止损
```

### 3. 时间衰减止损

```python
def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                   current_rate: float, current_profit: float, **kwargs) -> float:
    """时间衰减止损"""
    
    trade_duration = current_time - trade.open_date_utc
    hours = trade_duration.total_seconds() / 3600
    
    # 随时间放宽止损
    if hours < 1:
        return -0.05  # 第一小时：5%
    elif hours < 4:
        return -0.08  # 4 小时内：8%
    elif hours < 12:
        return -0.12  # 12 小时内：12%
    else:
        return -0.15  # 超过 12 小时：15%
```

## 止损测试和验证

### 回测中的止损

```python
# 在回测中测试不同的止损设置
freqtrade backtesting --strategy MyStrategy --timerange 20230101-20231231
```

### 止损分析

使用绘图功能分析止损效果：

```bash
freqtrade plot-dataframe --strategy MyStrategy -p BTC/USDT --timerange 20230101-20230201
```

### 止损优化

使用超参优化寻找最佳止损参数：

```python
from skopt.space import Real

class MyStrategy(IStrategy):
    stoploss = -0.10
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        return dataframe
    
    # 超参优化空间
    stoploss_space = Real(-0.25, -0.02, name='stoploss')
```

## 常见止损错误

### 1. 止损过紧

```python
# 错误：止损过紧，容易被噪音触发
stoploss = -0.02  # 2% 可能太紧
```

### 2. 止损过宽

```python
# 错误：止损过宽，可能导致大额亏损
stoploss = -0.50  # 50% 可能太宽
```

### 3. 忽略市场条件

```python
# 改进：根据市场波动性调整止损
def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                   current_rate: float, current_profit: float, **kwargs) -> float:
    # 考虑市场波动性
    dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
    volatility = dataframe['close'].pct_change().rolling(20).std().iloc[-1]
    
    # 高波动性时放宽止损
    if volatility > 0.03:  # 3% 日波动性
        return -0.15
    else:
        return -0.08
```

## 下一步

现在您了解了止损，可能想要学习关于插件系统。您的下一步是阅读插件文档。
