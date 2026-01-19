---
id: configuration
title: 配置机器人
sidebar_label: 05 Configuration 配置
description: Freqtrade 官方"Configuration"页面完整中文翻译，保留所有原页面内容和细节。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/configuration/`](https://www.freqtrade.io/en/stable/configuration/)

# 配置机器人

Freqtrade 有许多可配置的功能和可能性。默认情况下，这些设置通过配置文件进行配置（见下文）。

## Freqtrade 配置文件

机器人在运行期间使用一组配置参数，这些参数共同构成机器人配置。它通常从文件（Freqtrade 配置文件）中读取其配置。

默认情况下，机器人从位于当前工作目录的 `config.json` 文件加载配置。

你可以使用 `-c/--config` 命令行选项指定机器人使用的不同配置文件。

如果你使用[快速开始](https://www.freqtrade.io/en/stable/docker_quickstart/)方法安装机器人，安装脚本应该已经为你创建了默认配置文件（`config.json`）。

如果未创建默认配置文件，我们建议使用 `freqtrade new-config --config user_data/config.json` 来生成基本配置文件。

Freqtrade 配置文件应以 JSON 格式编写。

除了标准的 JSON 语法外，你还可以在配置文件中使用单行 `// ...` 和多行 `/* ... */` 注释，以及参数列表中的尾随逗号。

如果你不熟悉 JSON 格式，不要担心——只需用你选择的编辑器打开配置文件，对你需要的参数进行一些更改，保存更改，最后重启机器人，或者如果它之前停止了，用你对配置所做的更改重新运行它。机器人在启动时验证配置文件的语法，如果你编辑时出现任何错误，会警告你，指出有问题的行。

### 环境变量

通过环境变量设置 Freqtrade 配置中的选项。这优先于配置或策略中的相应值。

环境变量必须以 `FREQTRADE__` 为前缀才能加载到 freqtrade 配置中。

`__` 作为级别分隔符，因此使用的格式应对应于 `FREQTRADE__{section}__{key}`。因此，定义为 `export FREQTRADE__STAKE_AMOUNT=200` 的环境变量将导致 `{stake_amount: 200}`。

一个更复杂的示例可能是 `export FREQTRADE__EXCHANGE__KEY=<yourExchangeKey>` 来保持你的交换密钥秘密。这将把值移动到配置的 `exchange.key` 部分。使用这种方案，所有配置设置也将作为环境变量可用。

请注意，环境变量将覆盖配置中的相应设置，但命令行参数总是获胜。

常见示例：

```bash
FREQTRADE__TELEGRAM__CHAT_ID=<telegramchatid>
FREQTRADE__TELEGRAM__TOKEN=<telegramToken>
FREQTRADE__EXCHANGE__KEY=<yourExchangeKey>
FREQTRADE__EXCHANGE__SECRET=<yourExchangeSecret>
```

Json 列表被解析为 json - 因此你可以使用以下方式设置交易对列表：

```bash
export FREQTRADE__EXCHANGE__PAIR_WHITELIST='["BTC/USDT", "ETH/USDT"]'
```

:::note 注意
检测到的环境变量会在启动时记录 - 因此如果你找不到为什么值不是你基于配置认为应该是的值，请确保它没有从环境变量加载。
:::

:::note 验证组合结果
你可以使用 [show-config](https://www.freqtrade.io/en/stable/utils/#show-config) 子命令查看最终的组合配置。
:::

:::note 加载顺序
环境变量在初始配置后加载。因此，你不能通过环境变量提供配置的路径。请为此使用 `--config path/to/config.json`。这也在某种程度上适用于 `user_dir`。虽然用户目录可以通过环境变量设置 - 配置将**不会**从该位置加载。
:::

### 多配置文件

多个配置文件可以被指定并被机器人使用，或者机器人可以从多个配置文件读取其配置参数。

如果多个文件提供相同的参数，则最后指定的文件获胜（因此最后指定的文件可以覆盖之前文件中的参数）。

对于 `--config` 参数，最后指定的文件获胜。

```bash
freqtrade trade --config ./config.json --config ./config-private.json <...>
```

在这里，`config-private.json` 中的设置将覆盖 `config.json` 中的设置。

对于环境变量，它们将始终覆盖配置文件设置。

对于命令行参数，它们将覆盖环境变量和配置文件设置。

::::note Validate combined result
你可以使用 `show-config` 子命令来查看最终合并后的配置（考虑了命令行、环境变量以及多个配置文件的覆盖顺序）。这有助于在启动前验证配置是否按预期生效。

```bash
freqtrade show-config --config user_data/config.json --config user_data/config-private.json
```
::::

::::note Use multiple configuration files to keep secrets secret
建议将敏感信息（如 API Key、Webhook 密钥等）放入单独的私密配置文件中，并在启动时通过多个 `--config` 参数叠加加载：

```bash
freqtrade trade \
  --config user_data/config.json \
  --config user_data/config-private.json
```

将私密配置文件排除在版本控制之外（例如通过 `.gitignore`）。
::::

:::::note Config collision handling
当同一键在多个来源（策略、配置文件、环境变量、命令行）中同时出现时，按以下优先级处理，后者覆盖前者：

1) 命令行参数 > 2) 环境变量 > 3) 配置文件（后指定的覆盖先指定的） > 4) 策略 > 5) 默认值。

使用 `show-config` 可以直观检查最终生效的参数来源与结果。
:::::

#### 示例 1：两个配置文件的覆盖（后指定者生效）

`user_data/config.json`：

```json
{
  "max_open_trades": 2,
  "stake_amount": 50,
  "exchange": {
    "name": "binance"
  }
}
```

`user_data/config-private.json`：

```json
{
  "stake_amount": 100,
  "exchange": {
    "key": "YOUR_KEY",
    "secret": "YOUR_SECRET"
  }
}
```

启动命令：

```bash
freqtrade show-config \
  --config user_data/config.json \
  --config user_data/config-private.json
```

合并结果要点：

```json
{
  "max_open_trades": 2,
  "stake_amount": 100,
  "exchange": {
    "name": "binance",
    "key": "YOUR_KEY",
    "secret": "YOUR_SECRET"
  }
}
```

#### 示例 2：环境变量覆盖配置文件

`user_data/config.json`：

```json
{
  "dry_run": true,
  "fiat_display_currency": "USD"
}
```

环境变量：

```bash
export FREQTRADE__DRY_RUN=false
export FREQTRADE__FIAT_DISPLAY_CURRENCY=EUR
```

合并结果要点：

```json
{
  "dry_run": false,
  "fiat_display_currency": "EUR"
}
```

#### 示例 3：多层字典的合并（同键覆盖，未声明项保留）

`user_data/config.json`：

```json
{
  "entry_pricing": {
    "use_order_book": true,
    "order_book_top": 1
  },
  "exit_pricing": {
    "use_order_book": false
  }
}
```

`user_data/config-private.json`：

```json
{
  "entry_pricing": {
    "order_book_top": 3
  }
}
```

合并结果要点（`entry_pricing.order_book_top` 被覆盖为 3，`use_order_book` 保留；`exit_pricing` 未改动）：

```json
{
  "entry_pricing": {
    "use_order_book": true,
    "order_book_top": 3
  },
  "exit_pricing": {
    "use_order_book": false
  }
}
```

## 编辑器自动补全和验证

为了帮助你快速设置配置文件，你可以使用提供的 JSON 模式。

当使用支持 JSON 模式的编辑器时，这将在编辑配置文件时提供自动补全和验证。

该模式位于 `freqtrade/schema/config_schema.json` 中，可以在 [freqtrade GitHub 存储库](https://github.com/freqtrade/freqtrade/blob/develop/freqtrade/schema/config_schema.json) 中找到。

## 配置参数

以下参数可在你的配置文件中使用。所有参数都是可选的，在未指定时将使用默认值。

### 配置选项优先级

配置选项以以下优先级顺序加载：

1. **命令行参数**（最高优先级）
2. **环境变量**
3. **配置文件**（按指定顺序，最后指定的获胜）
4. **策略**
5. **默认值**（最低优先级）

### 参数表

以下是主要配置参数的详细表格：

| 参数 | 描述 | 类型 | 默认值 |
|------|------|------|--------|
| `max_open_trades` | 机器人可以同时持有的最大开放交易数。-1 表示无限制。 | Integer | 3 |
| `stake_currency` | 用于交易的货币（通常是基础货币）。 | String | "BTC" |
| `stake_amount` | 每笔交易的投注金额。可以是固定值或 "unlimited"。 | Float/String | 0.05 |
| `tradable_balance_ratio` | 用于交易的钱包余额比例。 | Float | 0.99 |
| `fiat_display_currency` | Telegram 报告中显示的法币。 | String | "USD" |
| `dry_run` | 启用干跑模式（模拟交易）。 | Boolean | true |
| `dry_run_wallet` | 干跑模式下的起始余额。 | Float | 1000 |
| `cancel_open_orders_on_exit` | 退出时取消开放订单。 | Boolean | false |
| `process_only_new_candles` | 仅处理新的蜡烛图数据。 | Boolean | false |
| `minimal_roi` | 最小投资回报率配置。 | Object | `{"0": 0.10, "40": 0.0}` |
| `stoploss` | 止损百分比（负值）。 | Float | -0.10 |
| `trailing_stop` | 启用跟踪止损。 | Boolean | false |
| `trailing_stop_positive` | 启用正跟踪止损的偏移量。 | Float | null |
| `trailing_stop_positive_offset` | 跟踪止损正偏移量的偏移量。 | Float | 0.0 |
| `trailing_only_offset_is_reached` | 仅在达到偏移量时跟踪。 | Boolean | false |
| `unfilledtimeout` | 未成交订单超时设置。 | Object | `{"entry": 10, "exit": 30}` |
| `entry_pricing` | 入场订单定价设置。 | Object | - |
| `exit_pricing` | 出场订单定价设置。 | Object | - |
| `exchange` | 交易所配置。 | Object | - |
| `pairlists` | 交易对列表配置。 | Array | - |
| `telegram` | Telegram 配置。 | Object | - |
| `api_server` | API 服务器配置。 | Object | - |
| `bot_name` | 机器人名称。 | String | "freqtrade" |
| `initial_state` | 机器人初始状态。 | String | "running" |
| `force_entry_enable` | 启用强制入场。 | Boolean | false |
| `internals` | 内部设置。 | Object | - |

有关所有可用参数的完整列表，请参阅官方文档中的[参数表](https://www.freqtrade.io/en/stable/configuration/#parameters-table)。

### 策略中的参数

某些参数可以在策略中定义。如果在策略和配置文件中都定义了参数，配置文件中的值将获胜（遵循常规优先级规则）。

### 配置每笔交易金额

Freqtrade 有几种方法来设置每笔交易的金额。

#### 最小交易金额

每个交易所对每个交易对都有最小交易金额。这通常在交易所的交易规则中指定。

Freqtrade 有一个内置的边界检查器，用于最小交易金额，但不会考虑手续费。确保配置的 `stake_amount` 高于交易所的最小值。

#### 干跑钱包

在干跑模式下，你可以使用 `dry_run_wallet` 配置选项覆盖起始余额。

```json
"dry_run_wallet": 1000
```

#### 可交易余额

默认情况下，机器人将使用你钱包中的全部余额。你可以使用 `tradable_balance_ratio` 限制这一点。

```json
"tradable_balance_ratio": 0.99
```

这意味着机器人将使用 99% 的可用余额进行交易，保留 1% 作为缓冲。

#### 分配可用资本

你可以使用 `available_capital` 设置机器人的可用资本。

```json
"available_capital": 1000
```

这将覆盖交易所余额，机器人将表现得好像它有指定的资本金额。

#### 修改最后的投注金额

你可以使用 `amend_last_stake_amount` 来修改最后的投注金额。

```json
"amend_last_stake_amount": true
```

这将确保最后一笔交易使用所有剩余的可用余额。

#### 静态投注金额

最简单的选择是使用静态投注金额。

```json
"stake_amount": 0.05
```

#### 动态投注金额

或者，你可以使用动态投注金额，它将使用可用余额的百分比。

```json
"stake_amount": "unlimited"
```

这将使用所有可用余额除以 `max_open_trades` 来确定每笔交易的金额。

#### 带有持仓调整的动态投注金额

你还可以将动态投注金额与持仓调整结合使用。

```json
"stake_amount": "unlimited",
"position_adjustment_enable": true
```

## 订单使用的价格

### 入场价格

#### 入场价格方向

`price_side` 设置确定机器人在下入场订单时使用买方价格还是卖方价格。

可能的值：
- `"same"` - 使用与策略信号相同的方向
- `"opposite"` - 使用与策略信号相反的方向
- `"ask"` - 始终使用卖方价格
- `"bid"` - 始终使用买方价格

```json
"entry_pricing": {
    "price_side": "same"
}
```

#### 启用订单簿的入场价格

当启用订单簿时，机器人将从订单簿获取价格。

```json
"entry_pricing": {
    "use_order_book": true,
    "order_book_top": 1,
    "price_last_balance": 0.0
}
```

- `order_book_top`: 从订单簿的第几层获取价格
- `price_last_balance`: 在订单簿价格和最后价格之间的平衡

#### 未启用订单簿的入场价格

当未启用订单簿时，机器人将使用 ticker 价格。

```json
"entry_pricing": {
    "use_order_book": false
}
```

#### 检查市场深度

你可以启用市场深度检查以确保有足够的流动性。

```json
"entry_pricing": {
    "check_depth_of_market": {
        "enabled": true,
        "bids_to_ask_delta": 1
    }
}
```

### 出场价格

#### 出场价格方向

```json
"exit_pricing": {
    "price_side": "same"
}
```

#### 启用订单簿的出场价格

```json
"exit_pricing": {
    "use_order_book": true,
    "order_book_top": 1
}
```

#### 未启用订单簿的出场价格

```json
"exit_pricing": {
    "use_order_book": false
}
```

### 市价单定价

对于市价单，机器人将使用当前市场价格。

```json
"order_types": {
    "entry": "market",
    "exit": "market"
}
```

## 进一步的配置详情

### 了解 minimal_roi

`minimal_roi` 是一个 JSON 对象，其中键是分钟数，值是在该时间点预期的最小投资回报率（ROI）。

```json
"minimal_roi": {
    "0": 0.04,
    "30": 0.03,
    "60": 0.02,
    "120": 0
}
```

这意味着：
- 在 0 分钟（立即）：如果利润达到 4%，则退出
- 在 30 分钟后：如果利润达到 3%，则退出
- 在 60 分钟后：如果利润达到 2%，则退出
- 在 120 分钟后：如果有任何利润（0%），则退出

### 了解 force_entry_enable

`force_entry_enable` 启用通过 Telegram 或 REST API 强制入场。

```json
"force_entry_enable": false
```

:::warning 警告
启用此功能可能导致意外的交易。仅在你完全理解其影响时才启用。
:::

### 忽略过期的蜡烛

你可以配置机器人忽略过期的蜡烛。

```json
"ignore_buying_expired_candle_after": 300
```

这将忽略超过 300 秒（5 分钟）的蜡烛图数据。

### 了解 order_types

`order_types` 配置不同情况下使用的订单类型。

```json
"order_types": {
    "entry": "limit",
    "exit": "limit",
    "emergency_exit": "market",
    "force_exit": "market",
    "force_entry": "market",
    "stoploss": "market",
    "stoploss_on_exchange": false,
    "stoploss_on_exchange_interval": 60
}
```

- `entry`: 入场订单类型（`"limit"` 或 `"market"`）
- `exit`: 出场订单类型（`"limit"` 或 `"market"`）  
- `emergency_exit`: 紧急退出时使用的订单类型
- `force_exit`: 强制退出时使用的订单类型
- `force_entry`: 强制入场时使用的订单类型
- `stoploss`: 止损订单类型
- `stoploss_on_exchange`: 是否在交易所设置止损
- `stoploss_on_exchange_interval`: 检查交易所止损的间隔（秒）

:::note 注意
并非所有交易所都支持所有订单类型。请检查你的交易所文档以了解支持的订单类型。
:::

### 了解 order_time_in_force

订单的有效时间策略控制订单在交易所上保持活跃的时间。

有 4 种常见策略：

**GTC (Good Till Canceled):**

这意味着订单将保持活跃状态，直到它被成交或你手动取消它。它可以被完全或部分成交。如果部分成交，剩余部分将保留在交易所直到被取消。

**FOK (Fill Or Kill):**

这意味着如果订单没有立即且完全执行，则交易所会取消它。

**IOC (Immediate Or Canceled):**

这与 FOK（上述）相同，除了它可以部分成交。剩余部分由交易所自动取消。

**PO (Post only):**

仅发布订单。订单要么作为制造商订单下达，要么被取消。这意味着订单必须以未成交状态在订单簿上放置至少一段时间。

请检查[交易所文档](https://www.freqtrade.io/en/stable/exchanges/)以了解你的交易所支持的有效时间值。

#### time_in_force 配置

`order_time_in_force` 参数包含一个带有入场和出场有效时间策略值的字典。这可以在配置文件中设置或在策略中设置。配置文件中设置的值会覆盖策略中的值，遵循常规优先级规则。

可能的值是：`GTC`（默认）、`FOK` 或 `IOC`。

```json
"order_time_in_force": {
    "entry": "GTC",
    "exit": "GTC"
}
```

:::warning 警告
除非你知道自己在做什么并且已经研究了为你的特定交易所使用不同值的影响，否则请不要更改默认值。
:::

### 法币转换

Freqtrade 使用 [Coingecko](https://www.coingecko.com/) API 将币值转换为其相应的法币值用于 Telegram 报告。法币货币可以在配置文件中设置为 `fiat_display_currency`。

从配置中完全移除 `fiat_display_currency` 将跳过初始化 coingecko，并且不会显示任何法币货币转换。这对机器人的正确运行没有重要性。

#### fiat_display_currency 可以使用什么值？

`fiat_display_currency` 配置参数设置用于在机器人 Telegram 报告中从币到法币转换的基础货币。

有效值是：

```
"AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR", "PLN", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "ZAR", "USD"
```

除了法币货币外，还支持一系列加密货币。

有效值是：

```
"BTC", "ETH", "XRP", "LTC", "BCH", "BNB"
```

#### Coingecko 速率限制问题

在某些 IP 范围内，coingecko 有严重的速率限制。在这种情况下，你可能想要将你的 coingecko API 密钥添加到配置中。

```json
{
    "fiat_display_currency": "USD",
    "coingecko": {
        "api_key": "your-api",
        "is_demo": true
    }
}
```

Freqtrade 支持演示版和专业版 coingecko API 密钥。

机器人正确运行不需要 Coingecko API 密钥。它仅用于 Telegram 报告中币到法币的转换，通常也可以在没有 API 密钥的情况下工作。

## 消费交易所 Websockets

Freqtrade 可以通过 [ccxt.pro](https://github.com/ccxt/ccxt/tree/master/js) 消费 websockets。

Freqtrade 旨在确保数据始终可用。如果 websocket 连接失败（或被禁用），机器人将回退到 REST API 调用。

如果你遇到怀疑是由 websockets 引起的问题，你可以通过设置 `exchange.enable_ws`（默认为 true）来禁用这些。

```json
"exchange": {
    // ...
    "enable_ws": false,
    // ...
}
```

如果你需要使用代理，请参阅[代理部分](https://www.freqtrade.io/en/stable/configuration/#using-a-proxy-with-freqtrade)获取更多信息。

:::note 推出
我们正在缓慢实施这一点，确保你的机器人的稳定性。目前，使用仅限于 ohlcv 数据流。它也仅限于少数交易所，新交易所正在持续添加。
:::

## 使用干跑模式

我们建议在干跑模式下启动机器人，以查看你的机器人将如何表现以及你的策略的性能如何。在干跑模式下，机器人不会使用你的资金。它只运行实时模拟而不在交易所创建交易。

1. 编辑你的 `config.json` 配置文件。
2. 将 `dry-run` 切换为 `true` 并为持久化数据库指定 `db_url`。

```json
"dry_run": true,
"db_url": "sqlite:///tradesv3.dryrun.sqlite"
```

3. 移除你的交易所 API 密钥和秘密（将它们更改为空值或虚假凭据）：

```json
"exchange": {
    "name": "binance",
    "key": "key",
    "secret": "secret",
    ...
}
```

一旦你对机器人在干跑模式下的性能感到满意，你就可以将其切换到生产模式。

:::note 注意
在干跑模式期间有一个模拟钱包可用，将假设 `dry_run_wallet` 的起始资本（默认为 1000）。
:::

### 干跑的注意事项

* API 密钥可能提供也可能不提供。在干跑模式下，只执行交易所上的只读操作（即不改变账户状态的操作）。
* 钱包（`/balance`）基于 `dry_run_wallet` 模拟。
* 订单被模拟，不会发布到交易所。
* 市价单基于下单时的订单簿成交量成交，最大滑点为 5%。
* 限价单一旦价格达到定义的水平就成交 - 或者基于 `unfilledtimeout` 设置超时。
* 限价单如果跨越价格超过 1%，将转换为市价单，并根据常规市价单规则立即成交（参见上述市价单点）。
* 与 `stoploss_on_exchange` 结合使用时，假设 stop_loss 价格被成交。
* 开放订单（不是交易，交易存储在数据库中）在机器人重启后保持开放，假设它们在离线时没有被成交。

## 切换到生产模式

在生产模式下，机器人将使用你的资金。要小心，因为错误的策略可能会损失你所有的资金。当你在生产模式下运行时，要意识到你在做什么。

切换到生产模式时，请确保使用不同/新的数据库，以避免干跑交易干扰你的交易所资金并最终污染你的统计数据。

### 设置你的交易所账户

你需要从交易所网站创建 API 密钥（通常你会得到 `key` 和 `secret`，一些交易所需要额外的 `password`），你需要将其插入到配置中的适当字段或在 `freqtrade new-config` 命令询问时插入。API 密钥通常只有在实时交易（用真钱交易，机器人在"生产模式"下运行，在交易所执行真实订单）时才需要，在机器人在干跑（交易模拟）模式下运行时不需要。当你在干跑模式下设置机器人时，你可以用空值填充这些字段。

### 切换你的机器人到生产模式

**编辑你的 `config.json` 文件。**

**将 dry-run 切换为 false，如果设置了，不要忘记调整你的数据库 URL：**

```json
"dry_run": false
```

**插入你的交易所 API 密钥（将它们更改为虚假的 API 密钥）：**

```json
{
    "exchange": {
        "name": "binance",
        "key": "af8ddd35195e9dc500b9a6f799f6f5c93d89193b",
        "secret": "08a9dc6db3d7b53e1acebd9275677f4b0a04f1a5",
        //"password": "", // Optional, not needed by all exchanges)
        // ...
    }
    //...
}
```

你还应该确保阅读文档的[交易所部分](https://www.freqtrade.io/en/stable/exchanges/)，以了解特定于你的交易所的潜在配置详情。

:::note 保持你的秘密秘密
为了保持你的秘密秘密，我们建议为你的 API 密钥使用第二个配置。只需在新的配置文件中使用上述代码片段（例如 `config-private.json`）并将你的设置保存在此文件中。然后你可以使用 `freqtrade trade --config user_data/config.json --config user_data/config-private.json <...>` 启动机器人以加载你的密钥。

**永远不要**与任何人分享你的私有配置文件或你的交易所密钥！
:::

## 在 Freqtrade 中使用代理

要在 freqtrade 中使用代理，请使用设置为适当值的变量 `"HTTP_PROXY"` 和 `"HTTPS_PROXY"` 导出你的代理设置。这将使代理设置应用于所有内容（telegram、coingecko、...）**除了**交易所请求。

```bash
export HTTP_PROXY="http://addr:port"
export HTTPS_PROXY="http://addr:port"
freqtrade
```

### 代理交易所请求

要为交易所连接使用代理 - 你必须将代理定义为 ccxt 配置的一部分。

```json
{ 
  "exchange": {
    "ccxt_config": {
      "httpsProxy": "http://addr:port",
      "wsProxy": "http://addr:port"
    }
  }
}
```

有关可用代理类型的更多信息，请查阅 [ccxt 代理文档](https://docs.ccxt.com/en/latest/manual.html#proxy)。

## 下一步

现在你已经配置了你的 config.json，下一步是[启动你的机器人](https://www.freqtrade.io/en/stable/bot-usage/)。
