---
id: live-trading-methodology
title: 实盘复盘方法论
sidebar_label: 实盘复盘方法论
---

## 1. 复盘目标与范围

本方法论面向使用 Freqtrade 进行加密货币量化交易（spot/futures）的实盘复盘，目标是：
- 明确策略是否在当前市场环境下有效（可解释、可度量、可复现）。
- 找出主要的收益来源与风险来源，定位可优化环节（择时/仓位/风控/执行）。
- 形成日/周复盘闭环：发现问题 → 提出假设 → 小流量实验 → 验证落地。

建议先阅读数据结构说明：`trades`、`orders`、`pairlocks`、`trade_custom_data` 字段定义与含义，见《[SQLite 数据库的表结构](../tutorial/freqrtade/sqlite数据库的表结构)》。

## 2. 数据准备与标准化 (Data Preparation)
（1）**确定复盘周期**：明确本次复盘的时间范围，例如"最近30天"、"自上次复盘以来"或"2025年7月1日至8月15日"；
（2）**导出核心数据**：包括交易数据、性能图表、日志文件。
- 数据源：
  - `trades`：单笔交易生命周期与收益归因核心表。
  - `orders`：下单/部分成交/取消的执行细节，计算滑点、成交均价等。
  - `pairlocks`：风控冻结（冷静期），理解空窗期与信号压制的影响。
  - `trade_custom_data`：策略自定义埋点（标签、特征快照、调试信息）。

- 需要特别注意以下几点：
  - 时区统一为 UTC（可在展示层转换本地时区）。
  - 仅使用已平仓数据做收益统计：`WHERE is_open = 0`。
  - 现货/合约字段差异：合约特有字段在现货下通常为空（如 `leverage`、`liquidation_price`）。
  - 交易对规范：`symbol` 可能包含后缀，统一用 `pair` 做聚合更稳妥。

## 3. 宏观性能评估 (Macro Performance Review)

（1）收益类：
  - **总收益/累计收益：**`SUM(close_profit_abs)`；
  - **平均收益率：**`AVG(close_profit)`。
  - 胜率：`SUM(close_profit > 0)/COUNT(*)`；
  - 盈亏比：`AVG(盈利)/ABS(AVG(亏损))`。
  - 收益期望（Expectancy）：`胜率*平均盈利 - 败率*平均亏损`。

（2）风险类：
  - 最大回撤（基于权益曲线），衡量策略可能面临的最大风险；
  - 波动率；
  - 收益/回撤比；
  - 利润因子（PF）。
  - 持仓时长分布（分钟/小时）；
  - 超时/过早平仓占比；
  - **交易频率 (Trade Frequency)**：总共进行了多少次交易，平均每天/每周多少次；
  - **夏普比率 (Sharpe Ratio) / 索提诺比率 (Sortino Ratio)**：衡量承担单位风险所获得的回报；
  - MFE/MAE（如有埋点）。

（3）与基准比较
- 将策略的收益率与同期 **BTC 或 ETH 的买入并持有 (Buy & Hold) 收益率**进行比较。
- **目标**：你的策略是否跑赢了市场？如果没有，为什么还要运行它？（例如，它可能提供了更低的回撤或更稳定的回报）。

（4）执行类：
- 滑点（按方向归一）：买单 `(average - ft_price)/ft_price`；卖单 `(ft_price - average)/ft_price`。
- 手续费占比：开/平仓费对单笔与总体收益的影响。
（5）归因维度：
- 按交易对、时间（小时/weekday/月）、市场状态（波动、趋势）、入场标签 `enter_tag`、退出原因 `exit_reason`、K线周期 `timeframe`、多空（合约）。
- 按交易对 Top/N：识别强/弱标的与黑名单候选。
- 按 `exit_reason`：ROI、止损、信号反转、强平等退出路径对收益的贡献。
- 按入场标签 `enter_tag`：哪类信号最有效？是否存在过拟合标签？
- 按时间：小时/工作日/节假日/事件前后（波动聚集时段适配度）。
- 按仓位与加仓：`max_stake_amount` 与收益关系，DCA 是否有效。


## 4.   **微观交易分析 (Micro Trade Analysis)**

深入到单笔交易，回答"策略为什么会这样交易？"的问题。

（1）**分析典型交易**：
- **最大盈利单**：分析这笔交易为什么能抓住大幅行情。是指标信号精准，还是趋势跟随的结果？能否复制？
- **最大亏损单**：分析亏损原因。是止损设置不合理？是假信号？还是市场突然的剧烈波动？如何避免？
- **连续亏损/盈利期**：找出策略在哪些时间段表现特别好或特别差，并分析当时的市场特征（例如，高波动、低波动、趋势、盘整）。

（2） **进出场点位审查**：
- 随机抽取几笔盈利和亏损的交易；
- 在 K 线图上标记出实际的进场点、出场点（止盈或止损）；
- 评估：这个进场点是否符合策略的设计初衷？出场是否过早或过晚？止损是否有效规避了更大的损失？
## 5. 策略逻辑与代码审查 (Strategy Logic & Code Review)

回归策略本身，检查其内在逻辑。
（1）**指标与信号**：
- 策略中使用的技术指标（如 MA, RSI, MACD）是否仍然有效？
- 买入/卖出信号的触发条件是否过于敏感或迟钝？
（2）**风险管理**：
- **止损逻辑**：当前的止损方式（例如，固定百分比、ATR 止损）是否合理？是否过于频繁地被"扫损"？
- **资金管理**：仓位大小是否合适？是否需要引入动态仓位管理？
（3）**代码健壮性**：
- 检查日志，是否有运行时错误或异常？
- 代码逻辑是否与策略思想完全一致？有没有潜在的 bug？

## 6. 结论与行动计划 (Conclusion & Action Plan)
这是复盘的最终产出，指导下一步的工作。
（1）**总结发现**：简洁地总结策略的优点、缺点和潜在风险。
（2）**做出决策**：
- **继续运行 (Continue)**：策略表现符合预期，无需改动。
- **参数优化 (Optimize)**：策略逻辑有效，但部分参数（如指标周期、止损百分比）需要微调。
- **逻辑修正 (Revise)**：发现策略逻辑上的缺陷，需要修改代码（例如，增加过滤条件、更换止损方式）。
- **暂停观察 (Halt)**：策略表现远逊于预期，或市场环境已不适合，需要暂停实盘并返回研究阶段。
- **退役 (Decommission)**：策略的盈利逻辑已被证实失效。
（3） **制定具体行动**：将决策转化为可执行的任务，并设定完成时间。例如："在下周末前，完成对止损逻辑的回测与修改。"
（4）**设定下次复盘日期**：保持复盘的规律性。


## 7. SQL 快速复盘模板

仅统计已平仓单：
```sql
SELECT 
  COUNT(*) AS total_trades,
  SUM(CASE WHEN close_profit > 0 THEN 1 ELSE 0 END) AS win_trades,
  ROUND(AVG(close_profit) * 100, 2) AS avg_profit_pct,
  ROUND(SUM(close_profit_abs), 6) AS total_profit
FROM trades
WHERE is_open = 0;
```

按交易对：
```sql
SELECT pair,
       COUNT(*) AS trade_count,
       ROUND(SUM(close_profit_abs), 6) AS total_profit,
       ROUND(AVG(close_profit) * 100, 2) AS avg_profit_pct
FROM trades
WHERE is_open = 0
GROUP BY pair
ORDER BY total_profit DESC;
```

按退出原因：
```sql
SELECT exit_reason,
       COUNT(*) AS trade_count,
       ROUND(SUM(close_profit_abs), 6) AS total_profit,
       ROUND(AVG(close_profit) * 100, 2) AS avg_profit_pct
FROM trades
WHERE is_open = 0
GROUP BY exit_reason
ORDER BY total_profit DESC;
```

持仓时长（分钟）：
```sql
SELECT 
  ROUND((julianday(close_date) - julianday(open_date)) * 24 * 60) AS hold_minutes,
  COUNT(*) AS trade_count,
  ROUND(AVG(close_profit) * 100, 2) AS avg_profit_pct
FROM trades
WHERE is_open = 0
GROUP BY hold_minutes
ORDER BY hold_minutes;
```

执行质量（滑点）示例（需 `orders`）：
```sql
SELECT 
  o.ft_order_side,
  ROUND(AVG(
    CASE 
      WHEN o.ft_order_side = 'buy'  THEN (o.average - o.ft_price) / o.ft_price
      WHEN o.ft_order_side = 'sell' THEN (o.ft_price - o.average) / o.ft_price
      ELSE NULL
    END
  ) * 100, 3) AS avg_slippage_pct,
  COUNT(*) AS order_count
FROM orders o
WHERE o.average IS NOT NULL AND o.ft_price IS NOT NULL
GROUP BY o.ft_order_side;
```

冷静期锁定（当前仍有效）：
```sql
SELECT pair, side, reason, lock_time, lock_end_time
FROM pairlocks
WHERE active = 1 AND lock_end_time > CURRENT_TIMESTAMP
ORDER BY lock_end_time DESC;
```

## 8. Python/Pandas 模板

只读连接与基础查询：
```python
import sqlite3
import pandas as pd

DB = r"C:/path/to/user_data/tradesv3.sqlite"
conn = sqlite3.connect(f"file:{DB}?mode=ro&cache=shared", uri=True)

trades = pd.read_sql_query(
    """
    SELECT * FROM trades
    WHERE is_open = 0
    ORDER BY close_date
    """,
    conn,
    parse_dates=["open_date", "close_date"],
)

orders = pd.read_sql_query("SELECT * FROM orders", conn, parse_dates=["order_date", "order_filled_date", "order_update_date"])
pairlocks = pd.read_sql_query("SELECT * FROM pairlocks", conn, parse_dates=["lock_time", "lock_end_time"])

# 计算日度收益
daily = (
    trades.assign(date=lambda df: df["close_date"].dt.date)
          .groupby("date", dropna=False)["close_profit_abs"]
          .sum()
          .to_frame("pnl")
)

# 简单滑点（方向归一）
def normalized_slippage(row):
    if pd.isna(row["average"]) or pd.isna(row["ft_price"]):
        return None
    if row["ft_order_side"] == "buy":
        return (row["average"] - row["ft_price"]) / row["ft_price"]
    if row["ft_order_side"] == "sell":
        return (row["ft_price"] - row["average"]) / row["ft_price"]
    return None

orders["slippage"] = orders.apply(normalized_slippage, axis=1)
print(orders.groupby("ft_order_side")["slippage"].mean() * 100)

conn.close()
```



