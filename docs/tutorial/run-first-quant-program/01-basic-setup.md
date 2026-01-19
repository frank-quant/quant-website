---
title: 01 基础环境准备
sidebar_label: 01 基础环境准备
---
### 1 安装Python

Freqtrade 需要 Python 3.8 或更高版本。对windows用户来说，可以直接从官网下载安装。

官网 https://www.python.org/downloads/ 

![](../../../static/img/Pasted%20image%2020251019132459.png)

下载之后双击打开，安装就可以，记得要选中"add to path"选项。

因为我已经安装了3.13版本，所以这里只是提示我要不要upgrade。

![](../../../static/img/Pasted%20image%2020251019132624.png)


安装完成后，在命令行验证 Python 版本：

```bash
python --version
```

如果已经安装成功，会显示所安装的版本，如下图：

![](../../../static/img/Pasted%20image%2020251019132742.png)

除了安装python，还需要安装一系列后续要用到的依赖包和环境工具。


```bash
pip install pandas numpy scipy ccxt ta pandas-ta scikit-learn \
matplotlib plotly aiohttp websockets requests loguru python-telegram-bot

```

至此，python相关的环境都已经完备了。

这里要说明一下，虽然后续我们使用docker方式安装python，理论上本地可以没有python环境。但是很多调试或者关键模块的测试，还是可能会用到。

另外freqtrade就是python项目，包括很多strategy策略文件都是python写的，建议还是先学习一下python基础语法。


### 2 安装Freqtrade

对windows用户，强烈建议用 **Docker 安装 Freqtrade** ，这是最省事、最干净、最推荐的方式。你需要的一切环境，全都在容器里自动搞定。

官方的安装文档详见 https://www.freqtrade.io/en/stable/windows_installation/  

#### 2.1 安装Docker

官方下载地址 https://www.docker.com/products/docker-desktop/ 

![](../../../static/img/Pasted%20image%2020251019134258.png)

安装时注意 ✅ 勾选 "Use WSL 2 based engine"。

安装完需要重启电脑。可以看到docker desktop的图标。

![](../../../static/img/Pasted%20image%2020251019134524.png)

在cmd验证docker是否可用，输出类似的信息说明安装成功。

![](../../../static/img/Pasted%20image%2020251019134412.png)

打开docker desktop，能看到这样的界面。

![](../../../static/img/Pasted%20image%2020251019134723.png)


#### 2.2 拉取官方freqtrade镜像

新建一个目录，比如在 

C:\Users\10718\Desktop\crypto\demo_strategy 

在该空文件夹下，shift+右键，选择"在此处打开powershell窗口"。

![](../../../static/img/Pasted%20image%2020251019135156.png)

freqtrade提供了官方镜像和docker compose file，可以依次执行以下步骤。

```bash
mkdir ft_userdata
cd ft_userdata/
# 从官方仓库中下载docker-compose file
curl https://raw.githubusercontent.com/freqtrade/freqtrade/stable/docker-compose.yml -o docker-compose.yml

# 拉取freqtrade镜像
docker compose pull

# 创建用户目录结构
docker compose run --rm freqtrade create-userdir --userdir user_data

```

拉取官方镜像，可以看到如图所示的界面信息。

![](../../../static/img/Pasted%20image%2020251019135417.png)

拉取的docker-compose.yml在 C:\Users\10718\Desktop\crypto\demo_strategy\ft_userdata 目录下，这里的信息可以先简单了解一下，后续也会用到。

![](../../../static/img/Pasted%20image%2020251019142548.png)


默认有一个策略类，是 SampleStrategy，如果要执行其他策略，要确保要执行的策略类名添加到这里。

![](../../../static/img/Pasted%20image%2020251019144233.png)



创建用户目录结构后，目录结构如下：

![](../../../static/img/Pasted%20image%2020251019135807.png)

这是**Freqtrade 的核心工作区**，所有与策略、数据、回测结果、日志、调优结果相关的内容，都放在这里。

| 目录                    | 用途说明                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| **backtest_results/** | 存放回测（Backtesting）的结果文件。每次运行 `freqtrade backtesting` 后，会生成包含交易记录、收益率、胜率等统计信息的结果文件（JSON/CSV）。            |
| **data/**             | 存放市场行情数据（OHLCV 数据）。Freqtrade 会从交易所下载蜡烛数据并缓存在此目录下，按交易所、交易对、时间周期分类存放，例如 `data/binance/BTC_USDT-1h.json`。 |
| **hyperopts/**        | 存放 Hyperopt（参数优化）使用的配置脚本。可定义优化目标、搜索空间等。                                                                |
| **hyperopt_results/** | 存放 Hyperopt 的优化结果文件。每次运行 `freqtrade hyperopt` 后会在此保存最优参数组合及结果统计。                                       |
| **logs/**             | 存放机器人运行日志，包括交易执行、异常、回测日志等。便于调试与排错。                                                                     |
| **notebooks/**        | 存放与 Jupyter Notebook 相关的文件，用于数据分析、可视化或策略调试。Freqtrade 提供了一些示例 notebook 文件供参考。                           |
| **plot/**             | 存放图表输出结果（如回测结果的收益曲线、买卖点图、性能图等）。执行 `freqtrade plot-dataframe` 后的图形文件会保存在此处。                             |
| **strategies/**       | 存放自定义策略脚本（Python 文件）。Freqtrade 会从这里加载策略类（如 `MyStrategy.py`），用于实盘和回测。                                   |

#### 2.3 创建默认配置文件

接下来是非常关键的一步，创建一个默认的config配置文件，这是我们后续主要会使用到的。

```bash
# 创建配置文件，需要交互
docker compose run --rm freqtrade new-config --config user_data/config.json
```

会要求一系列交互式的确认，第一次可以按照我图中所示的确认。

![](../../../static/img/Pasted%20image%2020251019140633.png)

这些问题的含义分别是: 

（1） **Do you want to enable Dry-run (simulated trades)?** 

是否启用 **Dry-run 模拟交易模式**。启用后不会下真实订单，只会模拟买卖，用于测试策略。 
在一开始，一定要选择**Yes（开启）**，适合调试和学习阶段。 

（2）**Please insert your stake currency:**

机器人使用的**本金币种**，也就是用于下单的货币。 一般是USDT，当然也可以选择其他的比如BTC。

（3）**Please insert your stake amount (Number or 'unlimited'):** 

每笔交易的下单金额。输入数字 表示 固定下单金额；`unlimited` 表示 自动使用最大可用余额。
这里选择`unlimited`即可，方便调试。 


（4）**Please insert max_open_trades (Integer or -1 for unlimited open trades):** 

限制机器人**同时最多持有的交易数量**。选择默认3即可。


（5）**Time Have the strategy define timeframe.** 

是否让**策略文件自行定义K线周期**。大多数策略会在代码中定义 `timeframe`，因此无需在配置里重复设置。这里保持默认。


（6）**Please insert your display Currency for reporting (leave empty to disable FIAT conversion):** 

设置报告中显示的法币计价货币，用于计算盈亏时换算。通常选择`USD`。

（7）**Select exchange** 

 选择使用的交易所。Freqtrade 支持多家交易所，如 `binance`, `bybit`, `okx`, `kucoin` 等。这里选择`binance`。

（8）**Do you want to trade Perpetual Swaps (perpetual futures)?** 

是否交易**永续合约**。Freqtrade 默认做现货，若想用合约需开启此项。这里先选择**No（不开启）**，初学阶段只做现货。 

（9）**Do you want to enable Telegram?** 

是否启用 Telegram 通知机器人（可接收买卖提醒）。 这里先选择**No**。一会我们再说怎么获取bot 信息并在 `config.json` 中配置。

（10）**Do you want to enable the Rest API (includes FreqUI)?** 

是否启用 **内置 REST API 服务**，用于与 Web 前端（FreqUI）或其他客户端交互。 这里选择**Yes**，这样可以用浏览器查看策略运行状态。 

（11） **Insert Api server Listen Address (0.0.0.0 for docker, otherwise best left untouched):** 

设置 API 服务监听地址。Docker 环境必须填 `0.0.0.0`（让容器内外都能访问）。

（12）**Insert api-server username:** 

设置 Web 界面或 API 登录用户名。 默认是`freqtrader` 。

（13）**Insert api-server password:** 

设置 Web 界面或 API 登录密码（隐藏输入）。这里自行输入密码即可。


经过这些信息的确认，会在 ./user_data/目录下生产对应的config.json配置文件。

![](../../../static/img/Pasted%20image%2020251019142135.png)

默认的配置文件显示这些选项，后期可以自由修改，这里保持即可，暂时不用调整什么。

```json

{
    "$schema": "https://schema.freqtrade.io/schema.json",
    "max_open_trades": 3,
    "stake_currency": "USDT",
    "stake_amount": "unlimited",
    "tradable_balance_ratio": 0.99,
    "fiat_display_currency": "USD",
    "dry_run": true,
    "dry_run_wallet": 1000,
    "cancel_open_orders_on_exit": false,
    "trading_mode": "spot",
    "margin_mode": "",
    "unfilledtimeout": {
        "entry": 10,
        "exit": 10,
        "exit_timeout_count": 0,
        "unit": "minutes"
    },
    "entry_pricing": {
        "price_side": "same",
        "use_order_book": true,
        "order_book_top": 1,
        "price_last_balance": 0.0,
        "check_depth_of_market": {
            "enabled": false,
            "bids_to_ask_delta": 1
        }
    },
    "exit_pricing":{
        "price_side": "same",
        "use_order_book": true,
        "order_book_top": 1
    },
    "exchange": {
        "name": "binance",
        "key": "",
        "secret": "",
        "ccxt_config": {},
        "ccxt_async_config": {},
        "pair_whitelist": [
        ],
        "pair_blacklist": [
            "BNB/.*"
        ]
    },
    "pairlists": [
        {
            "method": "VolumePairList",
            "number_assets": 20,
            "sort_key": "quoteVolume",
            "min_value": 0,
            "refresh_period": 1800
        }
    ],
    "telegram": {
        "enabled": false,
        "token": "",
        "chat_id": ""
    },
    "api_server": {
        "enabled": true,
        "listen_ip_address": "0.0.0.0",
        "listen_port": 8080,
        "verbosity": "error",
        "enable_openapi": false,
        "jwt_secret_key": "ffe3e22d81de992ac19b113bd699aea426e1688b9eb09f4757cf068da97541bb",
        "ws_token": "X7AXcbhOYVgFXolmSEGIApUn-C_rh254yg",
        "CORS_origins": [],
        "username": "freqtrader",
        "password": "freqtrader"
    },
    "bot_name": "freqtrade",
    "initial_state": "running",
    "force_entry_enable": false,
    "internals": {
        "process_throttle_secs": 5
    }
}
```

到这里，freqtrade就安装完成了。

### 3 配置Telegram

freqtrade可以非常方便地和telegram结合，执行策略运行的监控、控制。

修改刚才的config.json 文件，增加telegram机器人的部分。

```json
"telegram": {
        "enabled": true,
        "token": "xxxxxxx",
        "chat_id": "xxxxxx"

    },
```

最关键的就是获取到telegram bot的 token 和 chat_id.

#### 3.1 获取bot token

打开 Telegram，搜索 **@BotFather**。

![](../../../static/img/Pasted%20image%2020251019143433.png)

点击 **Start**，发送 `/start`。

![](../../../static/img/Pasted%20image%2020251019143455.png)

创建新 Bot：`/newbot`，按提示：
- 输入 Bot 名字（随意，比如 `FreqtradeBot`）；
- 输入 Bot 用户名（必须以 `bot` 结尾，例如 `freqtrade_bot`）。

![](../../../static/img/Pasted%20image%2020251019143724.png)

完成后，BotFather 会返回一条消息，其中包含 **API Token**：
    `1234567890:ABCDefGhIJKlmNOPQRsTUVWXYZ123456789`

✅ 这就是你在 `config.json` 中填写的 **telegram token**。

![](../../../static/img/Pasted%20image%2020251019143753.png)

#### 3.2 获取 chat id

Chat ID 用于告诉机器人消息发送到哪个聊天。

打开你刚创建的 Bot，点击 **Start**。

在 Telegram Web 或手机端打开浏览器：

`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`

例如：`https://api.telegram.org/bot1234567890:ABCDefGhIJKlmNOPQRsTUVWXYZ123456789/getUpdates`

发送任意消息给 Bot，然后刷新浏览器页面。

JSON 响应里会看到：
    `{     "update_id":123456789,     "message":{         "message_id":1,         "from":{"id":987654321,"is_bot":false,...},         "chat":{"id":987654321,"first_name":"Frank",...},         "text":"Hello"     } }`

✅ `"chat":{"id":987654321,...}` 中的 `id` 就是 **Chat ID**。

配置好后，等freqtrade启动，就能在telegram看到相关信息，并控制。

![](../../../static/img/Pasted%20image%2020251019144128.png)


### 4 启动freqtrade

可以启动freqtrade，确认安装、运行是否正常。

```bash
docker compose up -d
```

执行后可以看到提示 Started

![](../../../static/img/Pasted%20image%2020251019144515.png)

在本地浏览器打开 [http://localhost:8080/](http://localhost:8080/) 

输入密码登录后，就能看到freqtrade的UI界面。

![](../../../static/img/Pasted%20image%2020251019144830.png)

dashboard页面可以看到策略的整体表现。

![](../../../static/img/Pasted%20image%2020251019145449.png)

当前进行中的交易情况：

![](../../../static/img/Pasted%20image%2020251019152548.png)

其他常用命令包括：

```bash
# 重启
docker-compose restart

# 停止
docker-compose down  

# 看日志 
docker compose logs -f
```

至此，基础环境准备完成。

下一节，我们讲讲怎么编写策略。

