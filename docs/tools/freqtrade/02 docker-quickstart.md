---
id: docker-quickstart
title: 使用 Docker 快速开始
sidebar_label: 02 基于Docker快速开始
description: Freqtrade 官方“Quickstart with Docker”页面的中文翻译，保留原有的章节结构、Note/Warning 提示与代码块格式。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/docker_quickstart/`](https://www.freqtrade.io/en/stable/docker_quickstart/)

# 使用 Freqtrade 与 Docker

本页面说明如何使用 Docker 运行机器人。它并非开箱即用的解决方案。你仍需要通读文档并了解如何正确配置它。

## 安装 Docker

首先为你的平台下载并安装 Docker / Docker Desktop：

* [Mac](https://docs.docker.com/desktop/install/mac-install/)
* [Windows](https://docs.docker.com/desktop/install/windows-install/)
* [Linux](https://docs.docker.com/desktop/install/linux-install/)

:::note Docker compose 安装

Freqtrade 文档假设使用 Docker desktop（或 docker compose 插件）。  
虽然独立的 docker-compose 安装仍然可用，但需要将所有 `docker compose` 命令改为 `docker-compose` 才能工作（例如 `docker compose up -d` 需要改为 `docker-compose up -d`）。
:::

:::warning Windows 上的 Docker

如果你刚在 Windows 系统上安装了 docker，请确保重启你的系统，否则你可能会遇到与 docker 容器网络连接相关的无法解释的问题。
:::

## 使用 Docker 的 Freqtrade

Freqtrade 在 [Dockerhub](https://hub.docker.com/r/freqtradeorg/freqtrade) 上提供官方 Docker 镜像，以及一个可以直接使用的 docker compose 文件。

:::note 注意

* 以下部分假设 `docker` 已安装并且可供登录用户使用。
* 下面的所有命令都使用相对目录，必须从包含 `docker-compose.yml` 文件的目录执行。
:::

### Docker 快速开始

创建一个新目录并将 docker-compose 文件放在此目录中。

```bash
mkdir ft_userdata
cd ft_userdata/
# 从仓库下载 docker-compose 文件
curl https://raw.githubusercontent.com/freqtrade/freqtrade/stable/docker-compose.yml -o docker-compose.yml

# 拉取 freqtrade 镜像
docker compose pull

# 创建用户目录结构
docker compose run --rm freqtrade create-userdir --userdir user_data

# 创建配置 - 需要回答交互式问题
docker compose run --rm freqtrade new-config --config user_data/config.json
```

上面的片段创建了一个名为 `ft_userdata` 的新目录，下载最新的 compose 文件并拉取 freqtrade 镜像。片段中的最后 2 个步骤创建带有 `user_data` 的目录，以及基于你的选择（交互式）生成默认配置。

:::tip 如何编辑机器人配置？

你可以随时编辑配置，使用上述配置时，配置文件为 `user_data/config.json`（在目录 `ft_userdata` 中）。

你也可以通过编辑 `docker-compose.yml` 文件的 command 部分来更改策略和命令。
:::

#### 添加自定义策略

1. 配置现在可以在 `user_data/config.json` 中找到
2. 将自定义策略复制到目录 `user_data/strategies/`
3. 将策略的类名添加到 `docker-compose.yml` 文件

默认运行 `SampleStrategy`。

:::caution `SampleStrategy` 只是演示！

`SampleStrategy` 仅供你参考并为你提供自己策略的想法。请始终回测你的策略并在冒真钱风险之前先干跑一段时间！你可以在[策略文档](https://www.freqtrade.io/en/stable/strategy-customization/)中找到有关策略开发的更多信息。
:::

完成此操作后，你就可以启动机器人的交易模式（干跑或实盘交易，取决于你对上述相应问题的回答）。

```bash
docker compose up -d
```

:::note 默认配置

虽然生成的配置大多是功能性的，但在启动机器人之前，你仍然需要验证所有选项是否符合你的要求（如定价、交易对列表...）。
:::

#### 访问 UI

如果你在 `new-config` 步骤中选择启用 FreqUI，你将在端口 `localhost:8080` 上可以使用 freqUI。

你现在可以通过在浏览器中输入 localhost:8080 来访问 UI。

:::tip 远程服务器上的 UI 访问

如果你在 VPS 上运行，你应该考虑使用 ssh 隧道或设置 VPN（openVPN、wireguard）来连接到你的机器人。这将确保 freqUI 不会直接暴露在互联网上，出于安全原因不建议这样做（freqUI 不支持开箱即用的 https）。这些工具的设置不是本教程的一部分，但是在互联网上可以找到许多好的教程。请同时阅读[使用 docker 的 API 配置](https://www.freqtrade.io/en/stable/rest-api/#docker)部分以了解有关此配置的更多信息。
:::

#### 监控机器人

你可以使用 `docker compose ps` 检查正在运行的实例。这应该将服务 `freqtrade` 列为 `running`。如果不是这种情况，最好检查日志（参见下一点）。

#### Docker compose 日志

日志将写入：`user_data/logs/freqtrade.log`。  
你也可以使用命令 `docker compose logs -f` 检查最新的日志。

#### 数据库

数据库将位于：`user_data/tradesv3.sqlite`

#### 使用 docker 更新 freqtrade

使用 `docker` 时更新 freqtrade 就像运行以下 2 个命令一样简单：

```bash
# 下载最新镜像
docker compose pull
# 重启镜像
docker compose up -d
```

这将首先拉取最新镜像，然后使用刚拉取的版本重启容器。

:::caution 检查变更日志

你应该始终检查变更日志以了解破坏性更改/需要手动干预的内容，并确保机器人在更新后正确启动。
:::

### 编辑 docker-compose 文件

高级用户可以进一步编辑 docker-compose 文件以包含所有可能的选项或参数。

所有 freqtrade 参数都可以通过运行 `docker compose run --rm freqtrade <command> <optional arguments>` 来使用。

:::note 交易命令的 `docker compose`

交易命令（`freqtrade trade <...>`）不应通过 `docker compose run` 运行 - 而应使用 `docker compose up -d`。这确保容器正确启动（包括端口转发）并确保容器在系统重启后重新启动。如果你打算使用 freqUI，请同时确保相应调整配置，否则 UI 将不可用。
:::

:::tip `docker compose run --rm`

包含 `--rm` 将在完成后删除容器，强烈建议用于除交易模式之外的所有模式（使用 `freqtrade trade` 命令运行）。
:::

:::note 不使用 docker compose 的情况

"`docker compose run --rm`" 将需要提供 compose 文件。一些不需要身份验证的 freqtrade 命令（如 `list-pairs`）可以改用 "`docker run --rm`" 运行。  
例如 `docker run --rm freqtradeorg/freqtrade:stable list-pairs --exchange binance --quote BTC --print-json`。  
这对于获取交易所信息添加到你的 `config.json` 而不影响正在运行的容器很有用。
:::

#### 示例：使用 docker 下载数据

从 Binance 下载 ETH/BTC 交易对 5 天的回测数据，时间框架为 1h。数据将存储在主机上的 `user_data/data/` 目录中。

```bash
docker compose run --rm freqtrade download-data --pairs ETH/BTC --exchange binance --days 5 -t 1h
```

前往[数据下载文档](https://www.freqtrade.io/en/stable/data-download/)了解下载数据的更多详细信息。

#### 示例：使用 docker 回测

在 docker 容器中为 SampleStrategy 运行回测，指定历史数据的时间范围，时间框架为 5m：

```bash
docker compose run --rm freqtrade backtesting --config user_data/config.json --strategy SampleStrategy --timerange 20190801-20191001 -i 5m
```

前往[回测文档](https://www.freqtrade.io/en/stable/backtesting/)了解更多信息。

### 使用 docker 的额外依赖

如果你的策略需要默认镜像中未包含的依赖项 - 则需要在你的主机上构建镜像。为此，请创建一个包含额外依赖项安装步骤的 Dockerfile（查看 docker/Dockerfile.custom 作为示例）。

然后你还需要修改 `docker-compose.yml` 文件并取消注释构建步骤，以及重命名镜像以避免命名冲突。

```yaml
    image: freqtrade_custom
    build:
      context: .
      dockerfile: "./Dockerfile.<yourextension>"
```

然后你可以运行 `docker compose build --pull` 来构建 docker 镜像，并使用上述命令运行它。

### 使用 docker 绘图

通过将 `docker-compose.yml` 文件中的镜像更改为 `*_plot`，命令 `freqtrade plot-profit` 和 `freqtrade plot-dataframe`（[文档](https://www.freqtrade.io/en/stable/plotting/)）可用。然后你可以按如下方式使用这些命令：

```bash
docker compose run --rm freqtrade plot-dataframe --strategy AwesomeStrategy -p BTC/ETH --timerange=20180801-20180805
```

输出将存储在 `user_data/plot` 目录中，可以用任何现代浏览器打开。

### 使用 docker compose 进行数据分析

Freqtrade 提供一个 docker-compose 文件，可以启动 jupyter lab 服务器。你可以使用以下命令运行此服务器：

```bash
docker compose -f docker/docker-compose-jupyter.yml up
```

这将创建一个运行 jupyter lab 的 docker 容器，可以通过 `https://127.0.0.1:8888/lab` 访问。请使用启动后控制台中打印的链接来简化登录。

由于此镜像的一部分是在你的机器上构建的，建议不时重建镜像以保持 freqtrade（和依赖项）为最新版本。

```bash
docker compose -f docker/docker-compose-jupyter.yml build --no-cache
```

## 故障排查

### Windows 上的 Docker

* 错误：`"Timestamp for this request is outside of the recvWindow."`  
市场 API 请求需要同步时钟，但 docker 容器中的时间会随着时间推移逐渐偏移到过去。要临时修复此问题，你需要运行 `wsl --shutdown` 并再次重启 docker（Windows 10 上会有弹窗要求你这样做）。永久解决方案是将 docker 容器托管在 Linux 主机上，或者不时使用调度程序重启 wsl。  
```powershell
taskkill /IM "Docker Desktop.exe" /F  
wsl --shutdown  
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"  
```
* 无法连接到 API（Windows）  
如果你在 Windows 上刚刚安装了 Docker（桌面版），请确保重启你的系统。没有重启的话，Docker 在网络连接方面可能会出现问题。当然，你也应该确保你的设置正确。

:::warning 警告

由于上述原因，我们不建议在 Windows 上使用 docker 进行生产设置，仅建议用于实验、数据下载和回测。最好使用 Linux-VPS 来可靠地运行 freqtrade。
:::


