---
title: 03 回测验证
sidebar_label: 03 回测验证
---

在上一节，我们编写了一个移动平均线交叉策略，那么具体怎么用它呢？

在把真金白银交给策略之前，我们需要通过回测（Backtesting）来检验他的可靠性。

回测，就是用过去的K线数据模拟交易，看看它能赚多少、亏多少、胜率如何。


### 1 历史数据下载

首先需要下载历史k线数据。

用freqtrade download-data命令。这里定义拉取2025年ETH/BTC日线。

```
docker compose run --rm freqtrade download-data --config ./user_data/config.json --pairs ETH/USDT --exchange binance --timerange 20250101- --timeframes 1h
```

这里用到的参数分别表示：

- --exchange binance：指定交易所（binance等）；
- --pairs ETH/BTC：目标交易对，可用空格分隔多个，如ETH/BTC BTC/USDT，也可以用".*/USDT"拉所有USDT交易对）；
- --timerange 20250101-：绝对时间范围，YYYYMMDD格式，表示今年所有数据；
- --timeframes 1h：k线的时间。

![](../../../static/img/Pasted%20image%2020251022202534.png)

下载后，能够在./user_data/data/binance/目录下看到对应的数据文件。

![](../../../static/img/Pasted%20image%2020251022202856.png)


### 2 backtest回测

首先让我再列一下策略代码：

```python
# pragma pylint: disable=missing-docstring, invalid-name, pointless-string-statement
# flake8: noqa: F401
# isort: skip_file
# --- Do not remove these imports ---
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from pandas import DataFrame
from typing import Dict, Optional, Union, Tuple

from freqtrade.strategy import (
    IStrategy,
    Trade,
    Order,
    PairLocks,
    informative,  # @informative decorator
    # Hyperopt Parameters
    BooleanParameter,
    CategoricalParameter,
    DecimalParameter,
    IntParameter,
    RealParameter,
    # timeframe helpers
    timeframe_to_minutes,
    timeframe_to_next_date,
    timeframe_to_prev_date,
    # Strategy helper functions
    merge_informative_pair,
    stoploss_from_absolute,
    stoploss_from_open,
    AnnotationType,
)

# --------------------------------
# Add your lib to import here
import talib.abstract as ta
from technical import qtpylib

class Moving_Average_Crossover_Strategy(IStrategy):
    # 禁用ROI和止损
    minimal_roi = {"0": 100}  # ROI设为100%，实际不触发
    stoploss = -1.0  # 止损设为-100%，实际不触发
  

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        fast_period = 5
        slow_period = 50
        dataframe['fast_MA'] = ta.SMA(dataframe, timeperiod=fast_period)  # 快移动平均
        dataframe['slow_MA'] = ta.SMA(dataframe, timeperiod=slow_period)  # 慢移动平均
        return dataframe
  

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (qtpylib.crossed_above(dataframe['fast_MA'], dataframe['slow_MA'])),
            'buy'
        ] = 1
        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (qtpylib.crossed_below(dataframe['fast_MA'], dataframe['slow_MA'])),
            'sell'
        ] = 1
        return dataframe
```

同时，在配置文件要确保：

```json
    "pairlists": [
        {
            "method": "StaticPairList"
        }
    ],
```

这里要确保是StaticPairList，不是VolumePairList。

- VolumePairList：动态根据交易量选择交易对，需要实时数据，不支持回测；
- StaticPairList：使用静态交易对列表（从 pair_whitelist 或命令行参数），支持回测；

在cmd输入以下回测命令：

``` 
docker compose run --rm freqtrade backtesting  --strategy Moving_Average_Crossover_Strategy --timerange 20250101- -i 1h -p ETH/USDT
```

这里用到的参数分别是：

- --strategy Moving_Average_Crossover_Strategy：指定咱们的自定义策略文件；
- -i 1h：用小时K线（1小时一根），适合趋势策略；
- -p ETH/USDT：只交易ETH/USDT对；
- --timerange 20250101-：时间范围，2025全年数据；

运行后，Freqtrade会循环遍历每根K线：计算指标 → 生成买卖信号 → 模拟开平仓 → 统计盈亏。

几秒钟后，就会输出回测报告。

![](../../../static/img/Pasted%20image%2020251022204919.png)
![](../../../static/img/Pasted%20image%2020251022204933.png)![](../../../static/img/Pasted%20image%2020251022204947.png)
![](../../../static/img/Pasted%20image%2020251022205002.png)

![](../../../static/img/Pasted%20image%2020251022205015.png)

回测显示，该策略在测试期内产生了 130 笔交易，平均每笔亏损 0.09%，总亏损 5.03%。胜率仅为 28.5%（37 胜 93 亏），平均持仓时间约 1 天 2 小时 48 分钟。

这反映了在 2025 年 ETH/USDT 的震荡市场中，MA 交叉策略容易产生虚假信号，导致频繁交易和累积小额亏损。

#### 📉 深度风险指标解读

除了直观的盈亏，我们还需要关注量化交易中更重要的风险指标：

（1） 亏损大于盈利：盈利因子 $0.90$

盈利因子（Profit Factor）是衡量策略质量的核心指标。

- **如果** $PF > 1.0$**：** 策略盈利。
- **如果** $PF < 1.0$**：** 策略亏损。

该策略的盈利因子为 $0.90$，这直接表明：**该策略的损失总额超过了盈利总额**。从长远来看，这是一个持续亏损的系统。

（2）高风险低回报：最大回撤 $22.35\%$

**最大回撤（Drawdown）** 达到了 $22.35\%$，意味着在回测期间，您的账户资金从最高点到最低点损失了超过五分之一。同时，所有风险调整后的指标（如 **Sharpe** 值 $-0.25$，**SQN** 值 $-0.33$）均为负数，都发出信号：**这是一个风险高、回报差的策略。**

（3） "靠天吃饭"的策略：胜率低但有大单

- **平均每次交易盈利：** $-0.09\%$。
- **最佳单笔交易盈利：** $35.26\%$。
- **最差单笔交易亏损：** $-7.34\%$。

低胜率（$28.5\%$）结合负的总收益，但却出现了一个 $35.26\%$ 的最佳交易。这通常意味着策略的表现过度依赖于极少数的**"幸运儿"**或**"黑天鹅"**事件。一旦未来没有这种超级大赚的单子，策略的亏损将更加严重


虽然整个策略回测效果不佳，但从流程上看，整个策略已经可以实盘部署了！

下一节，我们就教大家如何实盘。

