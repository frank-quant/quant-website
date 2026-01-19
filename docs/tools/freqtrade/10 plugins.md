---
id: plugins
title: 插件
sidebar_label: 插件
description: Freqtrade 官方"Plugins"页面完整中文翻译，详细介绍插件系统和扩展功能。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/plugins/`](https://www.freqtrade.io/en/stable/plugins/)

# 插件

Freqtrade 支持插件系统，允许您扩展机器人的功能而无需修改核心代码。

## 插件类型

Freqtrade 支持以下类型的插件：

### 1. Pairlist Plugins（交易对列表插件）

交易对列表插件用于动态生成或过滤交易对列表。

#### 可用的交易对列表插件

* **StaticPairList** - 静态交易对列表
* **VolumePairList** - 基于成交量的动态列表
* **AgeFilter** - 基于上市时间过滤
* **PrecisionFilter** - 基于精度过滤
* **PriceFilter** - 基于价格过滤
* **ShuffleFilter** - 随机排序
* **SpreadFilter** - 基于价差过滤
* **RangeStabilityFilter** - 基于价格稳定性过滤
* **VolatilityFilter** - 基于波动性过滤
* **PerformanceFilter** - 基于性能过滤

#### 配置示例

```json
{
  "pairlists": [
    {
      "method": "VolumePairList",
      "number_assets": 20,
      "sort_key": "quoteVolume",
      "min_value": 0,
      "refresh_period": 1800
    },
    {
      "method": "AgeFilter",
      "min_days_listed": 10
    },
    {
      "method": "PriceFilter",
      "low_price_ratio": 0.01
    },
    {
      "method": "SpreadFilter",
      "max_spread_ratio": 0.005
    },
    {
      "method": "RangeStabilityFilter",
      "lookback_days": 10,
      "min_rate_of_change": 0.01,
      "refresh_period": 1440
    }
  ]
}
```

#### StaticPairList

最简单的交易对列表，使用固定的交易对列表。

```json
{
  "pairlists": [
    {
      "method": "StaticPairList"
    }
  ],
  "exchange": {
    "pair_whitelist": [
      "BTC/USDT",
      "ETH/USDT",
      "BNB/USDT"
    ]
  }
}
```

#### VolumePairList

基于成交量动态选择交易对。

```json
{
  "pairlists": [
    {
      "method": "VolumePairList",
      "number_assets": 20,
      "sort_key": "quoteVolume",
      "min_value": 0,
      "refresh_period": 1800,
      "lookback_days": 1,
      "lookback_timeframe": "1d",
      "lookback_period": 1
    }
  ]
}
```

参数说明：
- `number_assets`: 要选择的资产数量
- `sort_key`: 排序键（`quoteVolume` 或 `volume`）
- `min_value`: 最小成交量值
- `refresh_period`: 刷新周期（秒）
- `lookback_days`: 回看天数
- `lookback_timeframe`: 回看时间框架
- `lookback_period`: 回看周期

### 2. Protection Plugins（保护插件）

保护插件用于实现各种保护机制，防止在不利条件下交易。

#### 可用的保护插件

* **StoplossGuard** - 止损保护
* **MaxDrawdown** - 最大回撤保护
* **LowProfitPairs** - 低利润交易对保护
* **CooldownPeriod** - 冷却期保护

#### 配置示例

```json
{
  "protections": [
    {
      "method": "StoplossGuard",
      "lookback_period_candles": 60,
      "trade_limit": 4,
      "stop_duration_candles": 60,
      "only_per_pair": false
    },
    {
      "method": "MaxDrawdown",
      "lookback_period_candles": 200,
      "trade_limit": 20,
      "stop_duration_candles": 10,
      "max_allowed_drawdown": 0.2
    },
    {
      "method": "LowProfitPairs",
      "lookback_period_candles": 1440,
      "trade_limit": 2,
      "stop_duration_candles": 60,
      "required_profit": 0.02
    },
    {
      "method": "CooldownPeriod",
      "stop_duration_candles": 5
    }
  ]
}
```

#### StoplossGuard

在多次止损后停止交易。

```json
{
  "method": "StoplossGuard",
  "lookback_period_candles": 60,  # 回看 60 根蜡烛
  "trade_limit": 4,               # 4 次止损后
  "stop_duration_candles": 60,    # 停止 60 根蜡烛
  "only_per_pair": false          # 全局应用
}
```

#### MaxDrawdown

在最大回撤后停止交易。

```json
{
  "method": "MaxDrawdown",
  "lookback_period_candles": 200,  # 回看 200 根蜡烛
  "trade_limit": 20,               # 最少 20 笔交易
  "stop_duration_candles": 10,     # 停止 10 根蜡烛
  "max_allowed_drawdown": 0.2      # 最大 20% 回撤
}
```

### 3. Exit Signal Plugins（出场信号插件）

这些插件可以基于各种条件生成出场信号。

#### 配置示例

```json
{
  "exit_pricing": {
    "price_side": "ask",
    "use_order_book": true,
    "order_book_top": 1
  }
}
```

## 自定义插件开发

### 创建自定义交易对列表插件

```python
from freqtrade.plugins.pairlist.IPairList import IPairList
from freqtrade.plugins.pairlist.pairlist_helpers import expand_pairlist
from typing import Any, Dict, List

class CustomPairList(IPairList):
    
    def __init__(self, exchange, pairlistmanager,
                 config: Dict[str, Any], pairlistconfig: Dict[str, Any],
                 pairlist_pos: int) -> None:
        super().__init__(exchange, pairlistmanager, config, pairlistconfig, pairlist_pos)
    
    @property
    def needstickers(self) -> bool:
        return True  # 如果需要 ticker 数据
    
    def short_desc(self) -> str:
        return f"{self._pairlistconfig.get('method')} - 自定义交易对列表"
    
    def gen_pairlist(self, tickers: Dict) -> List[str]:
        """生成交易对列表"""
        # 您的自定义逻辑
        pairs = []
        
        for pair, ticker in tickers.items():
            # 示例：选择价格在特定范围内的交易对
            if 0.001 < ticker['last'] < 100:
                pairs.append(pair)
        
        return pairs[:self._number_pairs]
    
    def filter_pairlist(self, pairlist: List[str], tickers: Dict) -> List[str]:
        """过滤交易对列表"""
        # 您的自定义过滤逻辑
        return pairlist
```

### 创建自定义保护插件

```python
from freqtrade.plugins.protections.IProtection import IProtection
from freqtrade.persistence import PairLocks, Trade
from datetime import datetime, timezone

class CustomProtection(IProtection):
    
    def __init__(self, config: Dict[str, Any], protection_config: Dict[str, Any]) -> None:
        super().__init__(config, protection_config)
    
    def short_desc(self) -> str:
        return f"自定义保护 - {self._protection_config.get('method')}"
    
    def _reason(self) -> str:
        return (f'{self._protection_config.get("method")} '
                f'触发了保护机制')
    
    def global_stop(self, date: datetime, side: str) -> Optional[PairLocks]:
        """
        全局停止逻辑
        """
        # 您的自定义全局停止逻辑
        return None
    
    def stop_per_pair(self, pair: str, date: datetime, side: str) -> Optional[PairLocks]:
        """
        每个交易对的停止逻辑
        """
        # 您的自定义每对停止逻辑
        return None
```

## 插件配置最佳实践

### 1. 交易对列表优化

```json
{
  "pairlists": [
    {
      "method": "VolumePairList",
      "number_assets": 50,
      "sort_key": "quoteVolume",
      "refresh_period": 1800
    },
    {
      "method": "AgeFilter",
      "min_days_listed": 10
    },
    {
      "method": "PriceFilter",
      "low_price_ratio": 0.01,
      "min_price": 0.00001,
      "max_price": 1000
    },
    {
      "method": "SpreadFilter",
      "max_spread_ratio": 0.005
    },
    {
      "method": "VolatilityFilter",
      "lookback_days": 10,
      "min_volatility": 0.02,
      "max_volatility": 0.75
    },
    {
      "method": "ShuffleFilter",
      "seed": 42
    }
  ]
}
```

### 2. 保护配置

```json
{
  "protections": [
    {
      "method": "CooldownPeriod",
      "stop_duration_candles": 2
    },
    {
      "method": "MaxDrawdown",
      "lookback_period_candles": 200,
      "trade_limit": 20,
      "stop_duration_candles": 10,
      "max_allowed_drawdown": 0.2
    },
    {
      "method": "StoplossGuard",
      "lookback_period_candles": 60,
      "trade_limit": 2,
      "stop_duration_candles": 60,
      "only_per_pair": true
    },
    {
      "method": "LowProfitPairs",
      "lookback_period_candles": 1440,
      "trade_limit": 2,
      "stop_duration_candles": 60,
      "required_profit": 0.02
    }
  ]
}
```

## 插件调试

### 日志记录

```python
import logging
logger = logging.getLogger(__name__)

class CustomPairList(IPairList):
    def gen_pairlist(self, tickers: Dict) -> List[str]:
        logger.info(f"生成交易对列表，可用 tickers: {len(tickers)}")
        # 您的逻辑
        return pairs
```

### 测试插件

```bash
# 测试交易对列表插件
freqtrade list-pairs --config config.json

# 测试保护插件
freqtrade backtesting --config config.json --strategy TestStrategy
```

## 插件性能优化

### 1. 缓存结果

```python
from functools import lru_cache

class CustomPairList(IPairList):
    
    @lru_cache(maxsize=1)
    def _get_cached_tickers(self, timestamp: int) -> Dict:
        """缓存 ticker 数据"""
        return self._exchange.get_tickers()
```

### 2. 减少 API 调用

```python
def gen_pairlist(self, tickers: Dict) -> List[str]:
    # 重用传入的 tickers，避免额外 API 调用
    if not tickers:
        return []
    
    # 您的逻辑
    return pairs
```

### 3. 批量处理

```python
def filter_pairlist(self, pairlist: List[str], tickers: Dict) -> List[str]:
    # 批量处理而不是逐个处理
    filtered_pairs = []
    
    for pair in pairlist:
        if self._validate_pair(pair, tickers.get(pair)):
            filtered_pairs.append(pair)
    
    return filtered_pairs
```

## 社区插件

### 安装社区插件

1. 将插件文件复制到 `user_data/plugins/` 目录
2. 在配置中引用插件

```json
{
  "pairlists": [
    {
      "method": "user_data.plugins.CustomPairList",
      "config_param": "value"
    }
  ]
}
```

### 插件开发指南

1. **继承正确的基类**：`IPairList` 或 `IProtection`
2. **实现必要方法**：`gen_pairlist()`, `filter_pairlist()` 等
3. **处理错误**：妥善处理异常情况
4. **文档化**：提供清晰的配置说明
5. **测试**：在不同市场条件下测试

### 插件示例：自定义波动性过滤器

```python
from freqtrade.plugins.pairlist.IPairList import IPairList
import numpy as np

class VolatilityPairList(IPairList):
    
    def __init__(self, exchange, pairlistmanager, config, pairlistconfig, pairlist_pos):
        super().__init__(exchange, pairlistmanager, config, pairlistconfig, pairlist_pos)
        self._min_volatility = pairlistconfig.get('min_volatility', 0.02)
        self._max_volatility = pairlistconfig.get('max_volatility', 0.75)
        self._lookback_period = pairlistconfig.get('lookback_period', 10)
    
    @property
    def needstickers(self) -> bool:
        return False
    
    def short_desc(self) -> str:
        return f"波动性过滤器 ({self._min_volatility:.2%} - {self._max_volatility:.2%})"
    
    def filter_pairlist(self, pairlist: List[str], tickers: Dict) -> List[str]:
        """基于波动性过滤交易对"""
        filtered_pairs = []
        
        for pair in pairlist:
            # 获取历史数据
            try:
                klines = self._exchange.get_historic_ohlcv(
                    pair=pair,
                    timeframe='1d',
                    since_ms=None,
                    limit=self._lookback_period
                )
                
                if len(klines) < self._lookback_period:
                    continue
                
                # 计算波动性
                closes = np.array([kline[4] for kline in klines])
                returns = np.diff(closes) / closes[:-1]
                volatility = np.std(returns)
                
                # 过滤条件
                if self._min_volatility <= volatility <= self._max_volatility:
                    filtered_pairs.append(pair)
                    
            except Exception as e:
                self.log_once(f"无法获取 {pair} 的数据: {e}", logger.warning)
                continue
        
        return filtered_pairs
```

## 插件测试和调试

### 1. 单元测试

```python
import unittest
from unittest.mock import MagicMock

class TestCustomPairList(unittest.TestCase):
    
    def setUp(self):
        self.exchange = MagicMock()
        self.pairlistmanager = MagicMock()
        self.config = {}
        self.pairlistconfig = {'method': 'CustomPairList'}
        
        self.plugin = CustomPairList(
            self.exchange, self.pairlistmanager,
            self.config, self.pairlistconfig, 0
        )
    
    def test_filter_pairlist(self):
        # 测试过滤逻辑
        pairs = ['BTC/USDT', 'ETH/USDT', 'LTC/USDT']
        tickers = {
            'BTC/USDT': {'last': 50000},
            'ETH/USDT': {'last': 3000},
            'LTC/USDT': {'last': 0.0001}  # 价格太低
        }
        
        result = self.plugin.filter_pairlist(pairs, tickers)
        self.assertEqual(len(result), 2)  # 应该过滤掉 LTC/USDT
```

### 2. 集成测试

```bash
# 测试交易对列表
freqtrade list-pairs --config config.json --print-json

# 测试保护
freqtrade backtesting --config config.json --strategy TestStrategy --timerange 20230101-20230201
```

### 3. 性能测试

```python
import time

def gen_pairlist(self, tickers: Dict) -> List[str]:
    start_time = time.time()
    
    # 您的逻辑
    pairs = self._generate_pairs(tickers)
    
    end_time = time.time()
    logger.info(f"交易对列表生成耗时: {end_time - start_time:.2f}s")
    
    return pairs
```

## 插件配置技巧

### 1. 链式过滤

```json
{
  "pairlists": [
    {"method": "VolumePairList", "number_assets": 100},
    {"method": "AgeFilter", "min_days_listed": 10},
    {"method": "PriceFilter", "low_price_ratio": 0.01},
    {"method": "SpreadFilter", "max_spread_ratio": 0.005},
    {"method": "VolatilityFilter", "min_volatility": 0.02},
    {"method": "ShuffleFilter"}
  ]
}
```

### 2. 条件配置

```json
{
  "pairlists": [
    {
      "method": "VolumePairList",
      "number_assets": 20,
      "sort_key": "quoteVolume",
      "refresh_period": 1800,
      "lookback_days": 1
    }
  ],
  "process_only_new_candles": true
}
```

### 3. 环境特定配置

```json
{
  "pairlists": [
    {
      "method": "StaticPairList"
    }
  ],
  "exchange": {
    "pair_whitelist": [
      "BTC/USDT",
      "ETH/USDT"
    ]
  }
}
```

## 故障排除

### 常见问题

1. **插件未加载**
   - 检查插件文件路径
   - 验证类名和方法名
   - 查看启动日志

2. **配置错误**
   - 验证 JSON 语法
   - 检查必需参数
   - 使用 `freqtrade show-config` 验证

3. **性能问题**
   - 减少 API 调用
   - 使用缓存
   - 优化算法复杂度

### 调试技巧

```python
import logging
logger = logging.getLogger(__name__)

def filter_pairlist(self, pairlist: List[str], tickers: Dict) -> List[str]:
    logger.debug(f"输入交易对数量: {len(pairlist)}")
    
    filtered = []
    for pair in pairlist:
        if self._should_include_pair(pair, tickers):
            filtered.append(pair)
        else:
            logger.debug(f"过滤掉交易对: {pair}")
    
    logger.info(f"过滤后交易对数量: {len(filtered)}")
    return filtered
```

## 下一步

现在您了解了插件系统，可能想要学习如何启动和控制机器人。您的下一步是阅读"启动机器人"文档。
