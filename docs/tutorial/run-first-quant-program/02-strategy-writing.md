---
title: 02 编写策略
sidebar_label: 02 编写策略
---
### 1 写一个自己的策略

量化交易策略说白了很简单，只需要遵循一个非常简单的原则：低买高卖。

![](../../../static/img/Pasted%20image%2020251019155017.png)

关键是，怎么才能确定现在是在高点还是低点？

一种简单的方法，是借助移动平均线，Moving Average。

移动平均线有两个，分别是：

- **慢移动平均线**（Slow Moving Average， SMA）：用过去长周期计算的平均价，代表长期趋势，像一条稳重的"老大哥"。
- **快移动平均线**（Fast Moving Average，FMA）：用过去短周期计算的平均价，代表短期趋势，像一个敏感的"侦察兵"。

移动平均线交叉策略（Moving Average Crossover Strategy）就是用这两条线（一条慢、一条快）来捕捉趋势变化：快线向上穿越慢线时买入（趋势向上），快线向下穿越慢线时卖出（趋势向下）。

这是一种趋势跟踪策略，比较适合波动大的加密市场。

所以我们的策略只需要严格遵循：

**买入信号**：当快线从下向上穿越慢线时，说明短期趋势开始向上，市场可能进入上升通道——赶紧买！ 
**卖出信号**：当快线从上向下穿越慢线时，短期趋势转弱——及时卖出锁定利润。

举个例子：在ETH/BTC交易对上，如果快线（蓝色）向上穿黄线（慢线），就发买入信号；反之卖出。简单吧？

![](../../../static/img/Pasted%20image%2020251020204350.png)

这个策略虽然实测胜率不高，但胜在易懂，非常适合用来做入门练习。


### 2 策略核心逻辑

Freqtrade提供了一个模板，可以先在cmd运行这条命令创建一个新策略文件：

```
docker-compose run --rm freqtrade new-strategy -s SimpleMA_strategy --template minimal
```

这会生成一个SimpleMA_strategy.py文件，位于user_data/strategies/文件夹下。

![](../../../static/img/Pasted%20image%2020251020204940.png)

打开这个文件，会看到一个继承自IStrategy的类。

在 Freqtrade 策略中，有 **三个最核心的函数**，几乎决定了策略的全部逻辑：

1. `populate_indicators()` → 计算指标（所有数据列必须准备好）
2. `populate_buy_trend()` → 根据指标条件生成买入信号
3. `populate_sell_trend()` → 根据指标条件生成卖出信号

在回测、实盘或 dry-run 中，freqtrade会自动调用这三个函数，对每根 K 线依次计算信号，并执行交易。

现在需要修改三个关键方法，补全策略。

另外，为了简化，我们暂时禁用ROI（投资回报率）和止损功能（后续文章会细聊）。

#### 2.1 计算移动平均线

在populate_indicators()方法中，我们用TA-Lib库计算两条移动平均线。

快线用5期，慢线用50期（你可以根据资产调整）。

```python
import talib.abstract as ta  # 导入TA-Lib
import freqtrade.vendor.qtpylib.indicators as qtpylib  # 导入交叉检测工具

class SimpleMA_strategy(IStrategy):
    
    # 禁用ROI和止损
    minimal_roi = {"0": 100}  # ROI设为100%，实际不触发
    stoploss = -1.0  # 止损设为-100%，实际不触发
    
    def populate_indicators(self, dataframe, metadata):
        fast_period = 5
        slow_period = 50
        dataframe['fast_MA'] = ta.SMA(dataframe, timeperiod=fast_period)  # 快移动平均
        dataframe['slow_MA'] = ta.SMA(dataframe, timeperiod=slow_period)  # 慢移动平均
        
        return dataframe
```

这里我们直接操作Pandas DataFrame，这是Freqtrade的输入数据格式。

ta.SMA()函数超级方便，它会自动在DataFrame中添加新列fast_MA和slow_MA。

![](../../../static/img/Pasted%20image%2020251020205650.png)


#### 2.2 生成买入信号

现在，进入populate_buy_trend()方法。

用qtpylib.crossed_above()检测快线向上穿越慢线，一旦触发，就在DataFrame的buy列标记为1（表示买入）。

```python
def populate_buy_trend(self, dataframe, metadata):
    dataframe.loc[
        (qtpylib.crossed_above(dataframe['fast_MA'], dataframe['slow_MA'])),
        'buy'
    ] = 1
    
    return dataframe
```

loc[]是Pandas的条件赋值操作。

只有当条件为True时，才设置buy=1。这确保信号只在交叉点触发，避免噪音。

![](../../../static/img/Pasted%20image%2020251020205748.png)

#### 2.3 生成卖出信号

类似地，populate_sell_trend()用crossed_below()检测向下穿越。

```
def populate_sell_trend(self, dataframe, metadata):
    dataframe.loc[
        (qtpylib.crossed_below(dataframe['fast_MA'], dataframe['slow_MA'])),
        'sell'
    ] = 1
    
    return dataframe
```

对称设计，卖出逻辑和买入是镜像的。

需要注意，Freqtrade默认会持有头寸直到卖出信号出现，所以这个策略是"趋势跟随型"——骑牛不上马。

![](../../../static/img/Pasted%20image%2020251020205843.png)


基于刚才生成的标准模板，修改后就得到我们的策略文件了，重命名为Moving_Average_Crossover_Strategy.py。

完整的策略内容为：

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


### 3 其他策略

此外，在安装freqtrade后，在strategies目录下，也有一个默认策略。

![](../../../static/img/Pasted%20image%2020251019154846.png)

这个策略相对来说内容比较丰富，是一个典型的**超买超卖反转策略**，通过RSI指标识别市场的超买超卖状态，结合TEMA（三重指数移动平均线）和布林带进行趋势确认，在反转信号出现时入场。

入场条件 (`enter_short = 1`)

```
✅ RSI从下方向上穿过70（或优化后的short_rsi值）
✅ TEMA位于布林带中轨以上
✅ TEMA呈下降趋势
✅ 成交量 > 0
```


出场条件 (`exit_short = 1`)

```
✅ RSI从下方向上穿过30（或优化后的exit_short_rsi值）
✅ TEMA位于布林带中轨以下
✅ TEMA呈上升趋势
✅ 成交量 > 0
```

整体来看，这是一个很好的入门级策略模板，可以在此基础上进一步优化！

同时，freqtrade官方也有一些开源的策略，地址在 https://github.com/freqtrade/freqtrade-strategies

![](../../../static/img/Pasted%20image%2020251019155625.png)

从官方发布的性能来看，回测效果其实并不算太好。

![](../../../static/img/Pasted%20image%2020251019155546.png)


下一节，我们讲讲怎么回测验证。

