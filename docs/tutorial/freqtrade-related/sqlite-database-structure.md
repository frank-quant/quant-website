---
title: sqlite数据库的表结构
---
 
### 1. SQLite在Freqtrade中的角色

**SQLite** 是一个 **轻量级、嵌入式的关系型数据库（RDBMS）**，和 MySQL、PostgreSQL 一样遵循 SQL 标准，但它最大的特点是：
- **无需单独的数据库服务器进程**（没有"服务端"），应用程序直接操作数据库文件；
- 数据存储在一个单独的文件里（通常后缀是 `.sqlite` 或 `.db`）。
因此，SQLite 特别适合嵌入式应用、本地应用和小型项目。
简单来说，SQLite 就像一个 **本地 Excel 升级版** ——它不仅能存表，还能执行 SQL、支持事务，稳健轻量。详情可查看  [SQLite官方网站](https://sqlite.org/)。
![](../../../static/img/Pasted%20image%2020250817141354.png)



### 2. 为什么默认用SQLite
####  (1) 无需安装数据库服务
- SQLite 是嵌入式数据库，一个单独的 `.sqlite` 文件就能完成所有读写。
- 不像 MySQL/Postgres，需要安装、配置、开端口，增加了复杂度。
- 在 Docker 环境中更轻便，直接挂载一个 `.sqlite` 文件即可持久化。
####  (2) 跨平台、便于迁移
- SQLite 数据库就是一个单文件，拷贝走就能用。
- 非常适合 Freqtrade 用户 **本地实验** → **服务器部署** 的工作流。
#### (3) 性能足够
- 量化交易一般并不是超大规模高并发写入场景。
- Freqtrade 每次下单只写几行记录，对 SQLite 来说绰绰有余。
- SQLite 单机能轻松支持 **百万级交易记录**，对个人/小团队完全够用。
####  (4) 内置支持（Python 生态友好）
- Python 自带 `sqlite3` 库，Freqtrade 直接调用，不需要额外依赖。
- 用户只需一个 `sqlite` 文件即可完成调试。
### 3. SQLite的局限性和进阶优化方向
虽然 SQLite 很好用，但也有一些限制：
- **不适合高并发**（比如多个 bot 同时共享数据库）。
- **缺少高级功能**（比如分布式、复杂权限管理）。
- 如果你想做数据仓库级别的分析，最好还是把数据导出到 **PostgreSQL / MySQL / ClickHouse** 之类的大数据库。

### 4. 怎么连接并查询SQLite库表
推荐用python连接查询，因为很多后续的分析，都需要用到python，这样可以做全链路的分析计算。

```python
import sqlite3
import pandas as pd
import os 

DB = r"C:/Users/10718/Desktop/crypto/freqtrade/ft_userdata/user_data/tradesv3.sqlite"  # 这是sqlite对应的数据库文件，默认名为tradesv3.sqlite

# 首先判断文件是否存在
if not os.path.exists(DB):
    raise FileNotFoundError(f"DB not found: {DB}")
print("DB size (bytes):", os.path.getsize(DB))

# 连接数据库
conn = sqlite3.connect(DB, uri=true)

# 列出所有的表
tables = pd.read_sql_query(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;", conn
)
print("tables:", tables["name"].tolist())

# 查询其中的trades表
trades = pd.read_sql_query("""
    SELECT *
    FROM trades
    WHERE close_date IS NOT NULL
    ORDER BY open_date ASC
""", conn, parse_dates=["open_date","close_date"])

print("trades rows:", len(trades))
print(trades)

conn.close()
```

有几个地方需要注意：
- 数据库文件的位置是可以修改的，在config.json中，配置 **"db_url": "sqlite:///user_data/tradesv3.sqlite"**；
- 并不是只能通过python连接，也可以用SQLite命令行操作，如 **sqlite3 user_data/tradesv3.sqlite**；

上述代码执行后，显示结果如下。可以看到部分内容自动省略了。

![](../../../static/img/Pasted%20image%2020250817144145.png)

可以在代码中增加pandas显示选项，让数据展示更加美观：
```python
trades = pd.read_sql_query("""
    select * from trades limit 10;
""", conn)

# 设置 pandas 的显示选项
pd.set_option("display.max_columns", None)   # 显示所有列
pd.set_option("display.max_rows", None)      # 显示所有行
pd.set_option("display.width", 200)          # 每行字符宽度
pd.set_option("display.max_colwidth", None)  # 列内容完整显示

# print("trades rows:", len(trades))
print(trades)
```

![](../../../static/img/Pasted%20image%2020250817171758.png)

或者导出成csv文件在excel中分析。
```python
df.to_csv("trades.csv", index=False)
df.to_excel("trades.xlsx", index=False)

```

==注意python读写的死锁问题！！！==
在 **freqtrade** 里，`tradesv3.sqlite` 是核心数据库文件，SQLite 是**单文件数据库**，它的并发处理能力有限，SQLite 同时只允许 **一个写入**。
**如果 bot 在写（记录一笔交易），你又用 Python/工具查询并且触发了写锁（哪怕只是 `SELECT` 也可能申请共享锁），就可能导致阻塞。阻塞太久，freqtrade 就可能报错、重启。

```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) ==**unable to open database file**==
[SQL: SELECT trades.id, trades.exchange, trades.pair, trades.base_currency, trades.stake_currency, trades.is_open, trades.fee_open, trades.fee_open_cost, trades.fee_open_currency, trades.fee_close, trades.fee_close_cost, trades.fee_close_currency, trades.open_rate, trades.open_rate_requested, trades.open_trade_value, trades.close_rate, trades.close_rate_requested, trades.realized_profit, trades.close_profit, trades.close_profit_abs, trades.stake_amount, trades.max_stake_amount, trades.amount, trades.amount_requested, trades.open_date, trades.close_date, trades.stop_loss, trades.stop_loss_pct, trades.initial_stop_loss, trades.initial_stop_loss_pct, trades.is_stop_loss_trailing, trades.max_rate, trades.min_rate, trades.exit_reason, trades.exit_order_status, trades.strategy, trades.enter_tag, trades.timeframe, trades.trading_mode, trades.amount_precision, trades.price_precision, trades.precision_mode, trades.precision_mode_price, trades.contract_size, trades.leverage, trades.is_short, trades.liquidation_price, trades.interest_rate, trades.funding_fees, trades.funding_fee_running, trades.record_version 
FROM trades 
WHERE trades.fee_close_currency IS NULL AND (EXISTS (SELECT 1 
FROM orders 
WHERE trades.id = orders.ft_trade_id)) AND trades.is_open IS 0]
(Background on this error at: https://sqlalche.me/e/20/e3q8)
```

解决办法，就是强制使用只读模式连接，同时防止误写。
```python
# 连接数据库
conn = sqlite3.connect(DB, uri=True)

# 查询完成后关闭连接
conn.close()
```


### 5. 交易相关的表介绍

在SQLite库中，一共有4个交易相关的表：

| 表名                | 用途                                           |
| ----------------- | -------------------------------------------- |
| trades            | 核心表，存储每一笔交易（从开仓到平仓）的信息。                      |
| orders            | 一笔 trade 通常对应多条 order（因为 DCA / 分批建仓 / 分批平仓）。 |
| pairlocks         | 记录交易对的「锁仓」信息。比如在亏损后冻结某个交易对一段时间，不允许新开仓。       |
| trade_custom_data | 用于扩展存储每笔交易的自定义信息（如果策略里用了 `custom_info`）      |
下面分别介绍每张表的字段明细及用途。
#### 5.1 trades

trades 是 Freqtrade 的核心交易表，记录单笔交易从开仓到平仓的完整生命周期。
可用以下命令查看表结构
```sql
PRAGMA table_info(trades);
```

执行结果示例：

| 字段                    | 类型           | 非空  | 默认值 | 主键  | 说明                                                         |
| --------------------- | ------------ | --- | --- | --- | ---------------------------------------------------------- |
| id                    | INTEGER      | 是   | 无   | 是   | 交易主键，自增ID                                                  |
| exchange              | VARCHAR(25)  | 是   | 无   | 否   | 交易所标识，例如 `binance`、`okx`                                   |
| pair                  | VARCHAR(25)  | 是   | 无   | 否   | 交易对，例如 `BTC/USDT`                                          |
| base_currency         | VARCHAR(25)  | 否   | 无   | 否   | 基础币种，例如 `BTC`                                              |
| stake_currency        | VARCHAR(25)  | 否   | 无   | 否   | 计价/投入币种，例如 `USDT`                                          |
| is_open               | BOOLEAN      | 是   | 无   | 否   | 是否仍持仓中（未平仓）                                                |
| fee_open              | FLOAT        | 是   | 无   | 否   | 开仓费率（比例）                                                   |
| fee_open_cost         | FLOAT        | 否   | 无   | 否   | 开仓手续费绝对值（以手续费币计）                                           |
| fee_open_currency     | VARCHAR(25)  | 否   | 无   | 否   | 开仓手续费币种                                                    |
| fee_close             | FLOAT        | 是   | 无   | 否   | 平仓费率（比例）                                                   |
| fee_close_cost        | FLOAT        | 否   | 无   | 否   | 平仓手续费绝对值（以手续费币计）                                           |
| fee_close_currency    | VARCHAR(25)  | 否   | 无   | 否   | 平仓手续费币种                                                    |
| **open_rate**         | FLOAT        | 是   | 无   | 否   | 实际开仓成交价（加权平均）                                              |
| open_rate_requested   | FLOAT        | 否   | 无   | 否   | 下单期望的开仓价（请求价）                                              |
| open_trade_value      | FLOAT        | 否   | 无   | 否   | 开仓成交额（以计价币计）                                               |
| **close_rate**        | FLOAT        | 否   | 无   | 否   | 实际平仓成交价（加权平均）                                              |
| close_rate_requested  | FLOAT        | 否   | 无   | 否   | 下单期望的平仓价（请求价）                                              |
| realized_profit       | FLOAT        | 否   | 无   | 否   | 已实现盈亏（百分比，含分批卖出累计）                                         |
| **close_profit**      | FLOAT        | 否   | 无   | 否   | 本次平仓收益率（百分比）                                               |
| **close_profit_abs**  | FLOAT        | 否   | 无   | 否   | 本次平仓绝对收益（以计价币计）                                            |
| stake_amount          | FLOAT        | 是   | 无   | 否   | 初始投入金额（以计价币计）                                              |
| max_stake_amount      | FLOAT        | 否   | 无   | 否   | 最大累计投入金额（含加仓后）                                             |
| amount                | FLOAT        | 是   | 无   | 否   | 头寸数量（基础币数量）                                                |
| amount_requested      | FLOAT        | 否   | 无   | 否   | 请求买入的头寸数量                                                  |
| **open_date**         | DATETIME     | 是   | 无   | 否   | 开仓时间（UTC）                                                  |
| **close_date**        | DATETIME     | 否   | 无   | 否   | 平仓时间（UTC）                                                  |
| stop_loss             | FLOAT        | 否   | 无   | 否   | 当前止损价格                                                     |
| stop_loss_pct         | FLOAT        | 否   | 无   | 否   | 当前止损距离（相对开仓价的百分比）                                          |
| initial_stop_loss     | FLOAT        | 否   | 无   | 否   | 初始止损价格                                                     |
| initial_stop_loss_pct | FLOAT        | 否   | 无   | 否   | 初始止损百分比                                                    |
| is_stop_loss_trailing | BOOLEAN      | 是   | 无   | 否   | 是否启用跟踪止损                                                   |
| **max_rate**          | FLOAT        | 否   | 无   | 否   | 持仓期间最高成交价                                                  |
| **min_rate**          | FLOAT        | 否   | 无   | 否   | 持仓期间最低成交价                                                  |
| exit_reason           | VARCHAR(255) | 否   | 无   | 否   | 平仓原因，例如 `sell_signal`、`stop_loss`、`roi`、`force_exit` 等     |
| exit_order_status     | VARCHAR(100) | 否   | 无   | 否   | 平仓订单状态，如 `filled`、`canceled`、`rejected`、`partially_filled` |
| strategy              | VARCHAR(100) | 否   | 无   | 否   | 策略名称                                                       |
| enter_tag             | VARCHAR(255) | 否   | 无   | 否   | 入场标签/信号（自定义标记）                                             |
| timeframe             | INTEGER      | 否   | 无   | 否   | K线周期（分钟），例如 `5`、`15`、`60`                                  |
| trading_mode          | VARCHAR(7)   | 否   | 无   | 否   | 交易模式，如 `spot`/`futures`                                    |
| amount_precision      | FLOAT        | 否   | 无   | 否   | 交易数量精度                                                     |
| price_precision       | FLOAT        | 否   | 无   | 否   | 价格精度                                                       |
| precision_mode        | INTEGER      | 否   | 无   | 否   | 精度模式标识（与交易所适配有关）                                           |
| precision_mode_price  | INTEGER      | 否   | 无   | 否   | 价格精度模式标识                                                   |
| contract_size         | FLOAT        | 否   | 无   | 否   | 合约乘数（期货/合约模式）                                              |
| **leverage**          | FLOAT        | 否   | 无   | 否   | 杠杆倍数（期货/杠杆）                                                |
| is_short              | BOOLEAN      | 是   | 无   | 否   | 是否空头方向（期货/杠杆）                                              |
| liquidation_price     | FLOAT        | 否   | 无   | 否   | 强平价（期货/杠杆）                                                 |
| interest_rate         | FLOAT        | 是   | 无   | 否   | 融资/借贷利率（某些交易所/模式）                                          |
| funding_fees          | FLOAT        | 否   | 无   | 否   | 资金费用（期货资金费总额）                                              |
| funding_fee_running   | FLOAT        | 否   | 无   | 否   | 资金费用累计值                                                    |
| record_version        | INTEGER      | 是   | 无   | 否   | 记录版本号（用于迁移/兼容）                                             |

提示：`contract_size`、`leverage`、`is_short`、`liquidation_price`、`funding_fees`、`funding_fee_running` 等字段主要在期货/杠杆模式下有效，现货模式下通常为空。


#### 5.2 orders

orders 表按单据维度记录每一次下单、成交、取消等信息，和 `trades.id` 通过 `ft_trade_id` 建立关联。

可用以下命令查看表结构：
```sql
PRAGMA table_info(orders);
```

执行结果示例：

| 字段 | 类型 | 非空 | 默认值 | 主键 | 说明 |
| --- | --- | --- | --- | --- | --- |
| id | INTEGER | 是 | 无 | 是 | 订单主键，自增ID |
| ft_trade_id | INTEGER | 是 | 无 | 否 | 关联的交易ID（对应 `trades.id`） |
| ft_order_side | VARCHAR(25) | 是 | 无 | 否 | Freqtrade 统一的订单方向：`buy`/`sell`（用于标识开/平方向） |
| ft_pair | VARCHAR(25) | 是 | 无 | 否 | Freqtrade 标准化交易对，如 `BTC/USDT` |
| ft_is_open | BOOLEAN | 是 | 无 | 否 | 是否为开仓相关订单（开仓/加仓 为 True；减仓/平仓 为 False） |
| ft_amount | FLOAT | 是 | 无 | 否 | Freqtrade 侧下单数量（基础币数量） |
| ft_price | FLOAT | 是 | 无 | 否 | Freqtrade 侧下单价格（通常为限价） |
| ft_cancel_reason | VARCHAR(255) | 否 | 无 | 否 | 取消原因（如价格偏离、信号撤销、超时等） |
| order_id | VARCHAR(255) | 是 | 无 | 否 | 交易所订单ID（唯一标识） |
| status | VARCHAR(255) | 否 | 无 | 否 | 订单状态（`open`、`closed/filled`、`canceled`、`expired` 等） |
| symbol | VARCHAR(25) | 否 | 无 | 否 | 交易所原始符号（可能包含合约后缀，如 `BTC/USDT:USDT`） |
| order_type | VARCHAR(50) | 否 | 无 | 否 | 订单类型（`limit`、`market`、`stop`、`stop_limit` 等） |
| side | VARCHAR(25) | 否 | 无 | 否 | 交易所返回的订单方向（与 `ft_order_side` 含义相同但为原始值） |
| price | FLOAT | 否 | 无 | 否 | 订单价格（对限价单为挂单价格） |
| average | FLOAT | 否 | 无 | 否 | 成交均价（部分成交按加权平均） |
| amount | FLOAT | 否 | 无 | 否 | 订单请求数量（基础币数量） |
| filled | FLOAT | 否 | 无 | 否 | 已成交数量 |
| remaining | FLOAT | 否 | 无 | 否 | 剩余未成交数量 |
| cost | FLOAT | 否 | 无 | 否 | 已成交金额（以计价币计） |
| stop_price | FLOAT | 否 | 无 | 否 | 触发价（止损/止盈/触发单用） |
| order_date | DATETIME | 否 | 无 | 否 | 下单时间（UTC） |
| order_filled_date | DATETIME | 否 | 无 | 否 | 完全成交时间（UTC） |
| order_update_date | DATETIME | 否 | 无 | 否 | 最近一次状态更新（UTC） |
| funding_fee | FLOAT | 否 | 无 | 否 | 资金费用（期货资金费，部分交易所/模式下存在） |
| ft_fee_base | FLOAT | 否 | 无 | 否 | Freqtrade 计算的基础手续费（通常以计价币计） |
| ft_order_tag | VARCHAR(255) | 否 | 无 | 否 | 订单标签（如 `roi`、`stoploss`、自定义入场/出场标签） |

说明：
- `ft_order_side`/`side`：前者为 Freqtrade 标准化方向，后者为交易所原始返回，二者在绝大多数情况下等价。
- `ft_pair`/`symbol`：前者统一为 Freqtrade 规范的交易对，后者可能包含交易所特有后缀或格式。
- 期货/杠杆模式下，`funding_fee` 可能有值，现货模式下通常为空。


#### 5.3 pairlocks

pairlocks 用于在一段时间内「冻结」某个交易对的开仓行为，常用于止损后冷静期、风控限制等，避免在短时间内重复触发亏损。

可用以下命令查看表结构：
```sql
PRAGMA table_info(pairlocks);
```

执行结果示例：

| 字段 | 类型 | 非空 | 默认值 | 主键 | 说明 |
| --- | --- | --- | --- | --- | --- |
| id | INTEGER | 是 | 无 | 是 | 主键，自增ID |
| pair | VARCHAR(25) | 是 | 无 | 否 | 交易对，例如 `BTC/USDT` |
| side | VARCHAR(25) | 是 | 无 | 否 | 方向限制。现货常见为 `buy`；合约/杠杆可为 `long`/`short` |
| reason | VARCHAR(255) | 否 | 无 | 否 | 锁定原因（如 `stoploss`、风控规则名、手动锁定说明等） |
| lock_time | DATETIME | 是 | 无 | 否 | 锁定开始时间（UTC） |
| lock_end_time | DATETIME | 是 | 无 | 否 | 锁定结束时间（UTC），到期后理论上允许重新开仓 |
| active | BOOLEAN | 是 | 无 | 否 | 当前是否仍生效（True/False） |

常用查询示例：
```sql
-- 查询当前有效的锁定
SELECT *
FROM pairlocks
WHERE pair = 'BTC/USDT'
  AND active = 1
  AND lock_end_time > CURRENT_TIMESTAMP;
```


#### 5.4 trade_custom_data

`trade_custom_data` 用于存储与交易相关的自定义键值信息（如策略在运行时写入的 `custom_info`、调试标签、指标快照等）。通常通过 `ft_trade_id` 关联到 `trades.id`，同一笔交易可对应多条自定义记录。

可用以下命令查看表结构：
```sql
PRAGMA table_info(trade_custom_data);
```

执行结果示例：

| 字段          | 类型           | 非空  | 默认值 | 主键  | 说明                                                                       |
| ----------- | ------------ | --- | --- | --- | ------------------------------------------------------------------------ |
| id          | INTEGER      | 是   | 无   | 是   | 主键，自增ID                                                                  |
| ft_trade_id | INTEGER      | 否   | 无   | 否   | 关联交易ID（对应 `trades.id`）。通常用于把自定义数据挂到某一笔交易上                                |
| cd_key      | VARCHAR(255) | 是   | 无   | 否   | 自定义数据键名，例如 `entry_signal`、`feature_snapshot`、`debug_note`                |
| cd_type     | VARCHAR(25)  | 是   | 无   | 否   | 值类型标识。常见如 `str`、`int`、`float`、`bool`、`json`、`datetime` 等，用于解释 `cd_value` |
| cd_value    | TEXT         | 是   | 无   | 否   | 实际值（文本存储）。若为结构化数据，一般以 JSON 字符串形式保存                                       |
| created_at  | DATETIME     | 是   | 无   | 否   | 记录创建时间（UTC）                                                              |
| updated_at  | DATETIME     | 否   | 无   | 否   | 最近更新时间（UTC）                                                              |

说明与建议：
- 使用 `ft_trade_id` 建立与 `trades` 的一对多关系，便于按交易聚合自定义标签与指标。
- `cd_type` 与 `cd_value` 搭配使用：当为复杂结构时建议设置 `cd_type = 'json'` 并在 `cd_value` 中保存序列化后的 JSON。
- 可在分析时按 `cd_key` 进行筛选与透视，实现灵活的特征/标签管理。



### 6. 常用场景查询
一般情况下，在freqrtade UI或者Telegram Bot的监控指标已经能够满足要求。但这里的指标比较固定，如果要进一步下钻做分析，做实盘复盘，就需要更多灵活的指标。
#### 6.1 查询整体盈利情况 
```sql
SELECT 
    COUNT(*) AS total_trades,
    SUM(CASE WHEN close_profit > 0 THEN 1 ELSE 0 END) AS win_trades,
    ROUND(AVG(close_profit)*100, 2) AS avg_profit_pct
FROM trades where is_open=0  ;
```

执行结果如下，和freqtrade UI上的数据一致。
```
   total_trades  win_trades  avg_profit_pct
0           197         171            1.35
```

![](../../../static/img/Pasted%20image%2020250817173043.png)

#### 6.2 查询每个交易对的盈利情况

```sql
SELECT pair,
       COUNT(*) AS trade_count,
       ROUND(SUM(close_profit_abs), 4) AS total_profit,
       ROUND(AVG(close_profit)*100, 2) AS avg_profit_pct
FROM trades
GROUP BY pair order by 4 desc ;
```

执行结果示例：

```
                  pair  trade_count  total_profit  avg_profit_pct
0       DOGE/USDT:USDT           15        2.9401            3.92
1        ADA/USDT:USDT           10        2.2785            3.65
2        XLM/USDT:USDT           12        2.0579            3.28
3        LTC/USDT:USDT            4        1.3610            3.24
4   1000PEPE/USDT:USDT           17        1.5275            3.10
5        ENA/USDT:USDT           11        1.3852            2.63
6   FARTCOIN/USDT:USDT           26        1.5466            1.91
7      TRUMP/USDT:USDT           23        1.4187            1.77
8        ETH/USDT:USDT           10        1.1086            1.50
9       LINK/USDT:USDT            9       -0.1596           -0.11
10       XRP/USDT:USDT           15       -1.1635           -0.23
11       BNB/USDT:USDT            5       -0.2064           -0.62
12        OM/USDT:USDT            5       -0.2944           -1.13
13       CRV/USDT:USDT           12       -1.3014           -1.53
14  1000BONK/USDT:USDT           18       -1.8730           -1.57
15       THE/USDT:USDT            6       -1.2625           -1.58
```

#### 6.3 查询每日盈利情况

```sql
SELECT date(close_date),
       COUNT(*) AS trade_count,
       ROUND(SUM(close_profit_abs), 4) AS total_profit,
       ROUND(AVG(close_profit)*100, 2) AS avg_profit_pct
FROM trades
GROUP BY date(close_date) ;
```

执行结果示例：
```
   date(close_date)  trade_count  total_profit  avg_profit_pct
0              None            1           NaN             NaN
1        2025-07-28            7       -0.0356            1.44
2        2025-07-29            5       -4.6732          -11.04
3        2025-07-30            6       -1.3560           -2.08
4        2025-07-31            5       -2.2538           -7.03
5        2025-08-01            1       -0.9584          -14.82
6        2025-08-05            4        1.1243            3.63
7        2025-08-07           17        3.5794            3.51
8        2025-08-08           19        1.0264            1.66
9        2025-08-09           17        1.8419            1.28
10       2025-08-10            8       -1.1520           -1.42
11       2025-08-11           20        0.2287            1.10
12       2025-08-12           19        5.0990            4.07
13       2025-08-13           20        3.6692            2.73
14       2025-08-14           13       -0.6300            1.06
15       2025-08-15           21        3.7858            3.26
16       2025-08-16            8       -0.5854            1.15
17       2025-08-17            7        0.6529            1.64
```


### 7. 进阶问题分析
以下为结合实盘记录的进阶分析示例，可参考。

[2025-08-17-策略ANF实盘复盘](../../live-trading/2025/2025-08-17-strategy-anf-review)

