---
id: hyperopt
title: 超参数优化
sidebar_label: 超参数优化
description: Freqtrade 官方"Hyperopt"页面完整中文翻译，详细介绍如何优化策略参数以获得最佳性能。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/hyperopt/`](https://www.freqtrade.io/en/stable/hyperopt/)

# 超参数优化

本页解释如何通过寻找最佳参数来调整您的策略，这一过程称为超参数优化。

机器人使用 `optuna` 包中的算法来实现这一点。搜索将占用所有 CPU 核心，使您的笔记本电脑听起来像喷气式飞机，并且仍然需要很长时间。

通常，寻找最佳参数的过程从一些随机组合开始（有关更多详细信息，请参阅下文），然后使用 optuna 的采样器算法（目前是 TPESampler）快速找到在搜索超空间中最小化损失函数值的参数组合。

## 安装超参数优化依赖项

由于超参数优化的依赖项不是运行机器人本身所需的，因此默认情况下不会安装。

在运行超参数优化之前，您需要安装相应的依赖项。

:::note ARM 设备
由于超参数优化是一个资源密集型的过程，不建议也不支持在 ARM 设备（如树莓派）上运行。
:::

### Docker

Docker 镜像已包含超参数优化的依赖项，无需进一步操作。

### 本地安装

```bash
source .venv/bin/activate
pip install -r requirements-hyperopt.txt
```

## 超参数优化命令

```bash
usage: freqtrade hyperopt [-h] [-v] [--logfile FILE] [-V] [-c PATH] [-d PATH]
                          [--userdir PATH] [-s NAME] [--strategy-path PATH]
                          [--recursive-strategy-search] [--freqaimodel NAME]
                          [--freqaimodel-path PATH] [-i TIMEFRAME]
                          [--timerange TIMERANGE]
                          [--data-format-ohlcv {json,jsongz,feather,parquet}]
                          [--max-open-trades INT] [--stake-amount STAKE_AMOUNT]
                          [--fee FLOAT] [--hyperopt-loss NAME] [--hyperopt-path PATH]
                          [-e INT] [--spaces {all,buy,sell,roi,stoploss,trailing,protection,default} [{all,buy,sell,roi,stoploss,trailing,protection,default} ...]]
                          [--print-all] [--print-colorized] [--print-json]
                          [--export-csv FILE] [--random-state INT] [--min-trades INT]
                          [--hyperopt-filename FILENAME] [--eps]
                          [--dmmp] [--enable-protections] [--dry-run-wallet DRY_RUN_WALLET]
                          [--timeframe-detail TIMEFRAME_DETAIL] [-j JOBS]
```

### 主要参数

- `--hyperopt-loss NAME` - 指定超参数优化损失类
- `-e INT, --epochs INT` - 指定优化迭代次数
- `--spaces` - 指定要优化的参数空间
- `--min-trades INT` - 过滤结果的最小交易数
- `--print-all` - 打印所有结果，不仅仅是最佳结果
- `--print-colorized` - 彩色输出结果
- `--export-csv FILE` - 将结果导出到 CSV 文件
- `--random-state INT` - 设置随机种子以获得可重现的结果
- `-j JOBS, --job-workers JOBS` - 并行工作进程数

## 基本超参数优化

### 简单示例

```bash
# 基本超参数优化
freqtrade hyperopt \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --hyperopt-loss SharpeHyperOptLoss \
  --epochs 100
```

### 指定优化空间

```bash
# 只优化 ROI 和止损
freqtrade hyperopt \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --hyperopt-loss SharpeHyperOptLoss \
  --spaces roi stoploss \
  --epochs 100
```

### 优化空间说明

- `roi` - 最小 ROI 表
- `stoploss` - 止损值
- `trailing` - 跟踪止损参数
- `buy` - 买入信号参数（已弃用，使用 entry）
- `sell` - 卖出信号参数（已弃用，使用 exit）
- `entry` - 入场信号参数
- `exit` - 出场信号参数
- `protection` - 保护参数
- `all` - 所有可用空间
- `default` - 默认空间（roi, stoploss, trailing）

## 损失函数

损失函数定义了优化目标。Freqtrade 提供多种内置损失函数：

### 内置损失函数

- **SharpeHyperOptLoss** - 优化 Sharpe 比率（推荐）
- **SortinoHyperOptLoss** - 优化 Sortino 比率
- **CalmarHyperOptLoss** - 优化 Calmar 比率
- **MaxDrawDownHyperOptLoss** - 最小化最大回撤
- **MaxDrawDownRelativeHyperOptLoss** - 最小化相对最大回撤
- **ProfitLoss** - 最大化总利润
- **ShortTradeDurHyperOptLoss** - 最小化交易持续时间

### 使用不同损失函数

```bash
# 优化 Sharpe 比率
freqtrade hyperopt --hyperopt-loss SharpeHyperOptLoss

# 优化 Sortino 比率
freqtrade hyperopt --hyperopt-loss SortinoHyperOptLoss

# 最小化最大回撤
freqtrade hyperopt --hyperopt-loss MaxDrawDownHyperOptLoss

# 最大化利润
freqtrade hyperopt --hyperopt-loss ProfitLoss
```

## 策略中的超参数空间

### 定义参数空间

```python
from skopt.space import Categorical, Dimension, Integer, Real

class MyStrategy(IStrategy):
    
    # 买入参数
    buy_rsi_enabled = CategoricalParameter([True, False], default=True, space='buy')
    buy_rsi = IntParameter(20, 40, default=30, space='buy')
    buy_ema_short = IntParameter(5, 20, default=10, space='buy')
    buy_ema_long = IntParameter(50, 200, default=100, space='buy')
    
    # 卖出参数
    sell_rsi = IntParameter(60, 80, default=70, space='sell')
    sell_ema_short = IntParameter(5, 20, default=10, space='sell')
    
    # ROI 参数
    roi_t1 = IntParameter(10, 120, default=60, space='roi')
    roi_t2 = IntParameter(10, 60, default=30, space='roi')
    roi_t3 = IntParameter(10, 40, default=20, space='roi')
    roi_p1 = DecimalParameter(0.01, 0.04, default=0.01, space='roi')
    roi_p2 = DecimalParameter(0.01, 0.07, default=0.02, space='roi')
    roi_p3 = DecimalParameter(0.01, 0.20, default=0.03, space='roi')
    
    # 止损参数
    stoploss = DecimalParameter(-0.35, -0.07, default=-0.10, space='stoploss')
    
    # 跟踪止损参数
    trailing_stop = CategoricalParameter([True, False], default=False, space='trailing')
    trailing_stop_positive = DecimalParameter(0.01, 0.35, default=0.05, space='trailing')
    trailing_stop_positive_offset = DecimalParameter(0.01, 0.35, default=0.07, space='trailing')
    trailing_only_offset_is_reached = CategoricalParameter([True, False], default=False, space='trailing')
    
    @property
    def minimal_roi(self):
        """
        动态生成 ROI 表
        """
        return {
            "0": self.roi_p1.value,
            str(self.roi_t3.value): self.roi_p2.value,
            str(self.roi_t2.value): self.roi_p3.value,
            str(self.roi_t1.value): 0
        }
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        dataframe['ema_short'] = ta.EMA(dataframe, timeperiod=self.buy_ema_short.value)
        dataframe['ema_long'] = ta.EMA(dataframe, timeperiod=self.buy_ema_long.value)
        return dataframe
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        conditions = []
        
        if self.buy_rsi_enabled.value:
            conditions.append(dataframe['rsi'] < self.buy_rsi.value)
        
        conditions.append(dataframe['ema_short'] > dataframe['ema_long'])
        
        if conditions:
            dataframe.loc[
                reduce(lambda x, y: x & y, conditions),
                ['enter_long', 'enter_tag']
            ] = (1, 'hyperopt_entry')
        
        return dataframe
```

### 参数类型

- **CategoricalParameter** - 分类参数（True/False, 字符串列表等）
- **IntParameter** - 整数参数
- **DecimalParameter** - 小数参数
- **RealParameter** - 实数参数（与 DecimalParameter 相同）

## 运行超参数优化

### 基本运行

```bash
# 运行 100 次迭代
freqtrade hyperopt \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --hyperopt-loss SharpeHyperOptLoss \
  --epochs 100 \
  --spaces roi stoploss
```

### 高级运行选项

```bash
# 使用多个 CPU 核心
freqtrade hyperopt \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --hyperopt-loss SharpeHyperOptLoss \
  --epochs 500 \
  --spaces all \
  --jobs 4 \
  --min-trades 10 \
  --timerange 20230101-20231231
```

### 导出结果

```bash
# 导出结果到 CSV
freqtrade hyperopt \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --hyperopt-loss SharpeHyperOptLoss \
  --epochs 100 \
  --export-csv user_data/hyperopt_results/results.csv
```

## 查看超参数优化结果

### 列出结果

```bash
# 列出所有超参数优化结果
freqtrade hyperopt-list

# 列出最佳结果
freqtrade hyperopt-list --best

# 列出盈利结果
freqtrade hyperopt-list --profitable

# 按损失排序
freqtrade hyperopt-list --sort-by loss
```

### 显示详细结果

```bash
# 显示最佳结果的详细信息
freqtrade hyperopt-show -n -1

# 显示特定结果
freqtrade hyperopt-show -n 123

# 显示前 5 个结果
freqtrade hyperopt-show --best --no-header -n 1 2 3 4 5
```

### 导出最佳参数

```bash
# 导出最佳参数到策略文件
freqtrade hyperopt-show -n -1 --print-json --no-header > best_params.json
```

## 超参数优化策略

### 1. 分阶段优化

```bash
# 第一阶段：优化基本参数
freqtrade hyperopt --spaces roi stoploss --epochs 100

# 第二阶段：优化入场参数
freqtrade hyperopt --spaces entry --epochs 200

# 第三阶段：优化出场参数
freqtrade hyperopt --spaces exit --epochs 200

# 第四阶段：优化跟踪止损
freqtrade hyperopt --spaces trailing --epochs 100
```

### 2. 渐进式优化

```bash
# 从少量迭代开始
freqtrade hyperopt --epochs 50

# 根据结果增加迭代次数
freqtrade hyperopt --epochs 200

# 最终精细调整
freqtrade hyperopt --epochs 500
```

### 3. 时间段分割

```bash
# 在不同时间段优化
freqtrade hyperopt --timerange 20230101-20230630  # 上半年
freqtrade hyperopt --timerange 20230701-20231231  # 下半年

# 交叉验证
freqtrade hyperopt --timerange 20220101-20221231  # 训练期
freqtrade backtesting --timerange 20230101-20231231  # 验证期
```

## 自定义损失函数

### 创建自定义损失函数

```python
from freqtrade.optimize.hyperopt import IHyperOptLoss
from datetime import datetime
from pandas import DataFrame

class CustomHyperOptLoss(IHyperOptLoss):
    """
    自定义损失函数示例
    """
    
    @staticmethod
    def hyperopt_loss_function(results: DataFrame, trade_count: int,
                              min_date: datetime, max_date: datetime,
                              config: Dict, processed: Dict[str, DataFrame],
                              backtest_stats: Dict[str, Any], **kwargs) -> float:
        """
        自定义损失计算
        """
        # 获取关键指标
        total_profit = results['profit_ratio'].sum()
        max_drawdown = backtest_stats['max_drawdown']
        trade_count = len(results)
        
        # 自定义损失计算
        if trade_count < 10:
            return 1000  # 惩罚交易太少的策略
        
        # 结合利润和回撤的损失函数
        risk_adjusted_return = total_profit / max_drawdown if max_drawdown > 0 else 0
        
        return -risk_adjusted_return  # 负数因为我们要最小化损失
```

### 使用自定义损失函数

```bash
# 使用自定义损失函数
freqtrade hyperopt \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --hyperopt-loss CustomHyperOptLoss \
  --hyperopt-path user_data/hyperopts \
  --epochs 100
```

## 超参数优化结果分析

### 结果统计

```bash
# 显示超参数优化统计
freqtrade hyperopt-list --best --min-trades 10

# 显示详细统计
freqtrade hyperopt-show -n -1 --print-json
```

### 结果可视化

```python
# 使用 Python 分析结果
import pandas as pd
import matplotlib.pyplot as plt

# 加载超参数优化结果
results = pd.read_csv('user_data/hyperopt_results/results.csv')

# 绘制损失分布
plt.figure(figsize=(12, 6))
plt.subplot(1, 2, 1)
plt.hist(results['loss'], bins=50)
plt.title('损失分布')
plt.xlabel('损失值')
plt.ylabel('频次')

# 绘制利润 vs 回撤
plt.subplot(1, 2, 2)
plt.scatter(results['profit'], results['max_drawdown'])
plt.title('利润 vs 最大回撤')
plt.xlabel('总利润')
plt.ylabel('最大回撤')
plt.show()
```

## 高级超参数优化

### 多目标优化

```python
from freqtrade.optimize.hyperopt import IHyperOptLoss

class MultiObjectiveLoss(IHyperOptLoss):
    """
    多目标优化损失函数
    """
    
    @staticmethod
    def hyperopt_loss_function(results: DataFrame, trade_count: int,
                              min_date: datetime, max_date: datetime,
                              config: Dict, processed: Dict[str, DataFrame],
                              backtest_stats: Dict[str, Any], **kwargs) -> float:
        
        # 获取多个目标
        profit = backtest_stats['profit_total']
        max_drawdown = backtest_stats['max_drawdown']
        sharpe = backtest_stats.get('sharpe', 0)
        trade_count = backtest_stats['trade_count']
        
        # 多目标组合
        if trade_count < 10:
            return 1000
        
        # 权重组合
        profit_weight = 0.4
        drawdown_weight = 0.3
        sharpe_weight = 0.3
        
        normalized_profit = profit / 100  # 假设 100% 为最大期望利润
        normalized_drawdown = max_drawdown / 50  # 假设 50% 为最大可接受回撤
        normalized_sharpe = sharpe / 3  # 假设 3 为优秀的 Sharpe 比率
        
        # 组合损失（要最小化）
        loss = -(profit_weight * normalized_profit - 
                drawdown_weight * normalized_drawdown + 
                sharpe_weight * normalized_sharpe)
        
        return loss
```

### 条件参数空间

```python
class AdvancedStrategy(IStrategy):
    
    # 条件参数
    use_rsi = CategoricalParameter([True, False], default=True, space='buy')
    rsi_period = IntParameter(10, 30, default=14, space='buy', load=True)
    rsi_buy_threshold = IntParameter(20, 40, default=30, space='buy', load=True)
    
    use_macd = CategoricalParameter([True, False], default=False, space='buy')
    macd_fast = IntParameter(8, 20, default=12, space='buy', load=True)
    macd_slow = IntParameter(20, 50, default=26, space='buy', load=True)
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        conditions = []
        
        # 条件性使用 RSI
        if self.use_rsi.value:
            conditions.append(dataframe['rsi'] < self.rsi_buy_threshold.value)
        
        # 条件性使用 MACD
        if self.use_macd.value:
            conditions.append(dataframe['macd'] > dataframe['macdsignal'])
        
        if conditions:
            dataframe.loc[
                reduce(lambda x, y: x & y, conditions),
                ['enter_long', 'enter_tag']
            ] = (1, 'hyperopt_entry')
        
        return dataframe
```

## 超参数优化最佳实践

### 1. 合理设置迭代次数

```bash
# 快速测试：50-100 次迭代
freqtrade hyperopt --epochs 100

# 正常优化：200-500 次迭代
freqtrade hyperopt --epochs 300

# 精细优化：500-1000 次迭代
freqtrade hyperopt --epochs 1000
```

### 2. 使用足够的数据

```bash
# 使用至少 6 个月的数据
freqtrade hyperopt --timerange 20230101-20230630

# 更好：使用 1 年或更多数据
freqtrade hyperopt --timerange 20220101-20231231
```

### 3. 设置最小交易数

```bash
# 过滤交易数太少的结果
freqtrade hyperopt --min-trades 20
```

### 4. 并行处理

```bash
# 使用多核加速
freqtrade hyperopt --jobs 4  # 使用 4 个 CPU 核心
```

## 超参数优化后的验证

### 1. 样本外测试

```bash
# 在训练期优化
freqtrade hyperopt --timerange 20220101-20221231

# 在测试期验证
freqtrade backtesting \
  --strategy OptimizedStrategy \
  --timerange 20230101-20231231
```

### 2. 交叉验证

```bash
# 分割数据进行交叉验证
freqtrade hyperopt --timerange 20220101-20220630  # 训练集 1
freqtrade backtesting --timerange 20220701-20221231  # 测试集 1

freqtrade hyperopt --timerange 20220701-20221231  # 训练集 2
freqtrade backtesting --timerange 20220101-20220630  # 测试集 2
```

### 3. 干跑验证

```bash
# 使用优化后的参数进行干跑
freqtrade trade \
  --config user_data/config.json \
  --strategy OptimizedStrategy \
  --dry-run
```

## 性能优化技巧

### 1. 减少搜索空间

```python
# 限制参数范围
buy_rsi = IntParameter(25, 35, default=30, space='buy')  # 而不是 (10, 50)
```

### 2. 使用缓存

```bash
# 利用回测缓存
freqtrade hyperopt --cache day
```

### 3. 选择性优化

```bash
# 只优化最重要的参数
freqtrade hyperopt --spaces roi stoploss  # 而不是 --spaces all
```

### 4. 分批运行

```bash
# 分批运行长时间优化
freqtrade hyperopt --epochs 100 --hyperopt-filename batch1
freqtrade hyperopt --epochs 100 --hyperopt-filename batch2
freqtrade hyperopt --epochs 100 --hyperopt-filename batch3
```

## 常见超参数优化错误

### 1. 过度拟合

:::warning 过度拟合风险
- 使用太少的历史数据
- 设置太多的参数
- 运行太多的迭代次数
- 忽略样本外验证
:::

### 2. 数据偏差

```bash
# 错误：只在牛市数据上优化
freqtrade hyperopt --timerange 20210101-20211231

# 改进：包含不同市场条件
freqtrade hyperopt --timerange 20200101-20231231
```

### 3. 忽略交易成本

```bash
# 确保包含现实的费用
freqtrade hyperopt --fee 0.001  # 0.1% 费用
```

## 结果应用

### 应用最佳参数

```python
# 根据超参数优化结果更新策略
class OptimizedStrategy(IStrategy):
    
    # 应用优化后的参数
    minimal_roi = {
        "0": 0.0234,
        "23": 0.0456,
        "89": 0.0123,
        "234": 0
    }
    
    stoploss = -0.0987
    
    trailing_stop = True
    trailing_stop_positive = 0.0123
    trailing_stop_positive_offset = 0.0234
```

### 监控优化效果

```bash
# 在新数据上验证优化结果
freqtrade backtesting \
  --strategy OptimizedStrategy \
  --timerange 20240101-20240331  # 新的时间段
```

## 下一步

完成超参数优化后，您可能想要学习 FreqAI 功能或开始实盘交易。建议先在干跑模式下验证优化后的策略，然后再考虑实盘部署。
