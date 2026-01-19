---
title: 04 部署bot并执行策略（核心）
sidebar_label: 04 部署bot并执行策略（核心）
---
到目前为止，我们已经完成了前置准备环节，可以正式部署freqtrade了。

### 1 直接安装还是用docker?

强烈推荐使用 Docker 方式部署 Freqtrade，而不是直接裸 Linux 安装（pip install freqtrade）。

这是 Freqtrade 官方和社区的最佳实践，尤其在云服务器上。

（1）安装：docker一条命令即可拉取镜像，docker compose pull 几秒更新；裸linux安装需要手动管理 Python 依赖、虚拟环境，更新易出错。此一胜也；

（2）环境隔离：docker能实现完全隔离，不污染系统 Python环境，避免依赖冲突；裸linux安装容易与系统其他 Python 包冲突。此二胜也；

（3）官方支持度：官方文档、镜像、社区脚本全围绕 Docker，已逐步弱化裸安装支持。官网文档明确说 “We strongly recommend using Docker for production use”。此三胜也；

（4）移植性：docker安装的config、策略、数据全在 user_data 目录，迁移服务器只需复制目录，相比裸linux安装方便太多。此四胜也；

（5）多策略测试：docker轻松跑多个容器（不同策略/交易所），裸安装复杂。此五胜也。

有此5胜，还有什么理由不用docker呢？

所以综合而言，用docker部署，后续更新、备份、迁移都会轻松很多。

### 2 初始化环境

完成docker安装、freqtrade基础框架部署。

SSH 登录服务器后（用户名 ubuntu），直接复制粘贴以下命令，一段一段执行。

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Docker 和 Docker Compose（Ubuntu 24.04 推荐 v2）
sudo apt install docker.io docker-compose-v2 -y

# 3. 启动并开机自启 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 4. 把当前用户加入 docker 组（避免每次 sudo docker）
sudo usermod -aG docker ubuntu

# 5. 重新登录让权限生效（重要！）
exit
```


**重新用 XShell 连接一次服务器**（退出后重新登录）。

![](../../../static/img/Pasted%20image%2020251224223704.png)

重新连接后继续：

```bash
# 6. 创建 Freqtrade 主目录
mkdir ~/freqtrade && cd ~/freqtrade
mkdir user_data
```

执行结果如下，已创建user_data目录。

![](../../../static/img/Pasted%20image%2020251224223835.png)

依次执行以下命令。

```bash
# 7. 拉取官方稳定版镜像
docker pull freqtradeorg/freqtrade:stable

# 8. 初始化用户目录和配置文件（生成模板）
docker run --rm -v $(pwd)/user_data:/freqtrade/user_data \
  freqtradeorg/freqtrade:stable create-userdir --userdir user_data
```

拉取镜像执行结果如下，约十秒钟。

![](../../../static/img/Pasted%20image%2020251224224128.png)

初始化用户目录后，能看到标准目录结构，后续的部署会用到。

![](../../../static/img/Pasted%20image%2020251224224533.png)

初始化配置文件的时候，用 new-config的话会启动交互式向导（询问交易所、stake currency 等），但在 Docker 容器中运行时，标准输入（stdin）不是终端（not a terminal），会导致 prompt_toolkit 库无法读取输入，最终抛出 PermissionError 和 EOFError。

这里直接手动创建即可，后续会覆盖成我们真正用的config.json。

```bash
# 手动创建一个最小的 config.json 模板（避免所有交互问题） 
nano user_data/config.json
```

在 nano 编辑器中直接粘贴以下完整内容（XShell 右键粘贴）。

```json
{
    "max_open_trades": 3,
    "stake_currency": "USDT",
    "stake_amount": 100,
    "fiat_display_currency": "USD",
    "dry_run": true,
    "dry_run_wallet": 10000,
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
    "exit_pricing": {
        "price_side": "same",
        "use_order_book": true,
        "order_book_top": 1
    },
    "exchange": {
        "name": "binance",
        "key": "",
        "secret": "",
        "ccxt_config": {},
        "ccxt_async_config": {
            "enableRateLimit": true,
            "rateLimit": 200
        },
        "pair_whitelist": [
            "BTC/USDT",
            "ETH/USDT",
            "BNB/USDT"
        ],
        "pair_blacklist": []
    },
    "pairlists": [
        {
            "method": "StaticPairList"
        }
    ],
    "telegram": {
	    "enabled": false,
	    "token": "your_telegram_bot_token_here",   // 随便填，占位就行
	    "chat_id": "your_chat_id_here",            // 随便填，占位就行
	    "allow_custom_messages": true,
	    "notification_settings": {
	        "entry_fill": "off",
	        "exit_fill": "on",
	        "protection_trigger": "on",
	        "protection_trigger_global": "on"
    }
},
    "api": {
        "enabled": true,
        "listen_ip_address": "127.0.0.1",
        "listen_port": 8080,
        "verbosity": "error",
        "jwt_secret_key": "your-super-secret-jwt-key-change-me",
        "CORS_origins": [],
        "username": "admin",
        "password": "SuperSecretPasswordChangeMe"
    },
    "bot_name": "freqtrade",
    "initial_state": "running",
    "force_entry_enable": false,
    "disable_dataframe_checks": false,
    "internals": {
        "process_throttle_secs": 5
    }
}
```

保存退出：Ctrl+O → Enter → Ctrl+X

![](../../../static/img/Pasted%20image%2020251224225339.png)

这里要说明一下，Freqtrade 最新版（2025.11+）对 config.json 中的 telegram 配置校验更严格了，即使把 "enabled": false，它仍然要求 token 和 chat_id 必须存在（不能缺失），否则验证不通过。

所以在这里，需要把 telegram 部分补全（随便填个占位的 token 和 chat_id，反正暂时不启用 Telegram 也没影响）。

```bash
# 9. 创建 docker-compose.yml（推荐方式）
nano docker-compose.yml
```

粘贴以下内容（右键粘贴）：

```yaml
version: '3'
services:
  freqtrade:
    image: freqtradeorg/freqtrade:stable
    restart: unless-stopped
    container_name: freqtrade
    volumes:
      - ./user_data:/freqtrade/user_data
    ports:
      - "8080:8080"                  # FreqUI（建议用 SSH 隧道访问）
    command: >
      trade --config user_data/config.json --strategy SampleStrategy
```

保存退出：Ctrl+O → Enter → Ctrl+X

![](../../../static/img/Pasted%20image%2020251224225550.png)

然后，做一个基础的功能性验证。

```bash
# 10. 先启动一次测试环境是否正常（用官方 SampleStrategy）
docker compose up -d

# 11. 查看日志确认启动成功
docker logs -f freqtrade
```

看到类似 Engine started 和心跳日志，说明运行没问题，按 Ctrl+C 退出查看。

![](../../../static/img/Pasted%20image%2020251224230151.png)

启动正常，可以关闭容器实例。

```bash
# 12. 停掉容器，准备迁移本地策略
docker compose down
```

到这里，环境初始化就完成了，freqtrade基础框架已就位。


### 3 迁移本地策略

强烈推荐用 XFTP 迁移，非常方便丝滑。

（1）打开 XFTP，新建会话（IP、ubuntu 用户、.pem 私钥）。
（2）连接成功后：
    - 左侧窗口：打开你本地 Freqtrade 项目中的 user_data 文件夹（里面有 config.json、strategies 文件夹、历史数据等）。
    - 右侧窗口：导航到服务器 /home/ubuntu/freqtrade/user_data。

![](../../../static/img/Pasted%20image%2020251225210755.png)


（3）**直接把左侧整个 user_data 内容拖拽到右侧**（会覆盖服务器上刚生成的模板文件）。
    - 必须迁移的关键内容：
        - config.json（你本地调好的配置）
        - strategies/ 整个文件夹（你的自定义 .py 策略文件）
        - data/ 文件夹（如果有本地下载的历史数据，可选，迁移可省下载时间）
        - hyperopt_results/、backtest_results/ 等（可选）
（4）传输完成（几秒到几分钟，看文件大小）。

![](../../../static/img/Pasted%20image%2020251225210928.png)

（5）修改docker-compose.yml文件，改成要执行的策略。

![](../../../static/img/Pasted%20image%2020251225213924.png)

执行 docker logs -f freqtrade 看日志，策略已经正常启动了。

![](../../../static/img/Pasted%20image%2020251225214337.png)



### 4 查看FreqUI

要能看到 **Freqtrade UI**，必须 **同时满足**：

1️⃣ AWS **安全组放行 8080 端口**  
2️⃣ Freqtrade **UI 模式启动（listen 0.0.0.0）**  
3️⃣ Docker **端口正确映射 `-p 8080:8080`**

#### 4.1 AWS 控制台放行 8080 端口

EC2 → Instances → 选中实例→ Security → Security groups → 点击 security group 

编辑 Inbound rules（入站规则），新增一条。

![](../../../static/img/Pasted%20image%2020251225221537.png)

#### 4.2 连接UI

连接http://云服务器公网IP:8080

登录后，成功打开FreqUI。

![](../../../static/img/Pasted%20image%2020251225222308.png)

#### 4.3 更安全的做法

只通过 Xshell 隧道访问 Freqtrade UI，更安全。



至此，本地策略迁移完成。

如需替换策略，参考第三节部署即可。
