---
id: linux-macos
title: Linux/MacOS/Raspberry 安装
sidebar_label: Linux/MacOS/Raspberry
description: Freqtrade 在 Linux、MacOS 和 Raspberry Pi 平台上的详细安装指南。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/installation/`](https://www.freqtrade.io/en/stable/installation/)

# 安装

本页面说明如何为运行机器人准备你的环境。

freqtrade 文档描述了安装 freqtrade 的各种方式

* [Docker 镜像](https://www.freqtrade.io/en/stable/docker_quickstart/)（单独页面）
* 脚本安装
* 手动安装
* 使用 Conda 安装

请考虑使用预构建的 docker 镜像，以便在评估 freqtrade 工作方式时快速开始。

---

## 信息

对于 Windows 安装，请使用 [Windows 安装指南](https://www.freqtrade.io/en/stable/windows_installation/)。

安装和运行 Freqtrade 的最简单方法是克隆机器人 Github 仓库，然后运行 `./setup.sh` 脚本（如果它适用于你的平台）。

:::note 版本考虑

克隆仓库时，默认工作分支的名称是 `develop`。该分支包含所有最新功能（由于自动化测试，可以认为是相对稳定的）。`stable` 分支包含最后一次发布的代码（通常每月发布一次，基于大约一周前的 `develop` 分支快照，以防止打包错误，因此可能更稳定）。
:::

:::note 注意
假设 Python3.11 或更高版本和相应的 `pip` 可用。如果不是这种情况，安装脚本将警告你并停止。还需要 `git` 来克隆 Freqtrade 仓库。  
此外，必须提供 python 头文件（`python<yourversion>-dev` / `python<yourversion>-devel`）才能成功完成安装。
:::

:::note 准确的时钟
运行机器人的系统上的时钟必须准确，并经常与 NTP 服务器同步，以避免与交易所通信出现问题。
:::

---

## 系统要求

这些要求适用于脚本安装和手动安装。

:::warning ARM64 系统
如果你运行的是 ARM64 系统（如 MacOS M1 或 Oracle VM），请使用 docker 来运行 freqtrade。虽然可以通过一些手动工作进行原生安装，但目前不支持这种方式。
:::

### 安装指南

* Python >= 3.11
* pip
* git
* virtualenv（推荐）

### 安装代码

我们包含/收集了 Ubuntu、MacOS 和 Windows 的安装说明。这些是指导原则，你在其他发行版上的成功可能会有所不同。OS 特定步骤首先列出，下面的通用部分对所有系统都是必需的。

:::note 注意
假设 Python3.11 或更高版本和相应的 pip 可用。
:::

#### Debian/Ubuntu

##### 安装必要的依赖项

```bash
# 更新仓库
sudo apt-get update

# 安装软件包
sudo apt install -y python3-pip python3-venv python3-dev python3-pandas git curl
```

#### MacOS

##### 安装必要的依赖项

如果您还没有安装 Homebrew，请先安装它。

```bash
# 安装软件包
brew install gettext libomp
```

:::note 注意
`setup.sh` 脚本将为您安装这些依赖项 - 假设您的系统上安装了 brew。
:::

#### RaspberryPi/Raspbian

以下假设最新的 Raspbian Buster lite 镜像。该镜像预装了 python3.11，使得启动和运行 freqtrade 变得容易。

使用 Raspberry Pi 3 和 Raspbian Buster lite 镜像进行测试，应用了所有更新。

```bash
sudo apt-get install python3-venv libatlas-base-dev cmake curl libffi-dev
# 使用 piwheels.org 加速安装
sudo echo "[global]\nextra-index-url=https://www.piwheels.org/simple" > tee /etc/pip.conf

git clone https://github.com/freqtrade/freqtrade.git
cd freqtrade

bash setup.sh -i
```

:::caution 安装持续时间
根据您的互联网速度和 Raspberry Pi 版本，安装可能需要多个小时才能完成。因此，我们建议按照 Docker 快速入门文档为 Raspberry 使用预构建的 docker 镜像。
:::

:::note 注意
以上不会安装 hyperopt 依赖项。要安装这些，请使用 `python3 -m pip install -e .[hyperopt]`。我们不建议在 Raspberry Pi 上运行 hyperopt，因为这是一个非常消耗资源的操作，应该在强大的机器上完成。
:::

---

## Freqtrade 仓库

Freqtrade 是一个开源加密货币交易机器人，其代码托管在 `github.com`

```bash
# 下载 freqtrade 仓库的 `develop` 分支
git clone https://github.com/freqtrade/freqtrade.git

# 进入下载的目录
cd freqtrade

# 你的选择 (1): 新手用户
git checkout stable

# 你的选择 (2): 高级用户
git checkout develop
```

(1) 此命令将克隆的仓库切换到使用 `stable` 分支。如果你希望停留在 (2) `develop` 分支上，则不需要此命令。

你以后可以随时使用 `git checkout stable`/`git checkout develop` 命令在分支之间切换。

:::note 从 pypi 安装
安装 Freqtrade 的另一种方法是从 pypi。缺点是此方法需要预先正确安装 ta-lib，因此目前不是安装 Freqtrade 的推荐方法。

```bash
pip install freqtrade
```
:::

---

## 脚本安装

安装 Freqtrade 的第一种方法是使用提供的 Linux/MacOS `./setup.sh` 脚本，该脚本安装所有依赖项并帮助你配置机器人。

确保你满足系统要求并已下载 Freqtrade 仓库。

### 使用 /setup.sh -install (Linux/MacOS)

如果你使用的是 Debian、Ubuntu 或 MacOS，freqtrade 提供了从头安装 freqtrade 的脚本。

```bash
# --install, 从头安装 freqtrade
./setup.sh -i
```

### 激活你的虚拟环境

每次打开新终端时，你必须运行 `source .venv/bin/activate` 来激活你的虚拟环境。

```bash
# 激活虚拟环境
source ./.venv/bin/activate
```

你现在可以运行机器人了。

### /setup.sh 脚本的其他选项

你也可以使用 `./script.sh` 更新、配置和重置机器人的代码库

```bash
# --update, 命令 git pull 更新。
./setup.sh -u
# --reset, 硬重置你的 develop/stable 分支。
./setup.sh -r
```

:::note 脚本选项详解

**--install**

使用此选项，脚本将安装机器人和大多数依赖项：
你需要预先安装 git 和 python3.11+ 才能正常工作。

* 强制软件如：`ta-lib`
* 在 `.venv/` 下设置你的 virtualenv

此选项是安装任务和 `--reset` 的组合

**--update**

此选项将拉取你当前分支的最新版本并更新你的 virtualenv。定期使用此选项运行脚本以更新你的机器人。

**--reset**

此选项将硬重置你的分支（仅当你在 `stable` 或 `develop` 上时）并重新创建你的 virtualenv。
:::

---

## 手动安装

确保你满足系统要求并已下载 Freqtrade 仓库。

### 设置 Python 虚拟环境 (virtualenv)

你将在分离的 `虚拟环境` 中运行 freqtrade

```bash
# 在目录 /freqtrade/.venv 中创建 virtualenv
python3 -m venv .venv

# 运行 virtualenv
source .venv/bin/activate
```

### 安装 python 依赖项

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
# 安装 freqtrade
python3 -m pip install -e .
```

你现在可以运行机器人了。

### （可选）安装后任务

:::note 注意
如果你在服务器上运行机器人，你应该考虑使用 Docker 或终端多路复用器，如 `screen` 或 tmux，以避免机器人在注销时停止。
:::

在具有软件套件 `systemd` 的 Linux 上，作为可选的安装后任务，你可能希望将机器人设置为作为 `systemd 服务` 运行，或配置它将日志消息发送到 `syslog`/`rsyslog` 或 `journald` 守护进程。有关详细信息，请参阅[高级日志记录](https://www.freqtrade.io/en/stable/advanced-setup/)。

---

## 使用 Conda 安装

Freqtrade 也可以使用 Miniconda 或 Anaconda 安装。我们建议使用 Miniconda，因为它的安装占用空间更小。Conda 将自动准备和管理 Freqtrade 程序的广泛库依赖关系。

### 什么是 Conda？

Conda 是多种编程语言的包、依赖和环境管理器：[conda 文档](https://docs.conda.io/en/stable/)

### 使用 conda 安装

#### 安装 Conda

[Linux 安装](https://docs.conda.io/en/latest/miniconda.html)

[Windows 安装](https://docs.conda.io/en/latest/miniconda.html)

回答所有问题。安装后，强制性地关闭并重新打开你的终端。

#### Freqtrade 下载

下载并安装 freqtrade。

```bash
# 下载 freqtrade
git clone https://github.com/freqtrade/freqtrade.git

# 进入下载的目录 'freqtrade'
cd freqtrade      
```

#### Freqtrade 安装：Conda 环境

```bash
conda create --name freqtrade python=3.12
```

:::note 创建 Conda 环境
conda 命令 `create -n` 自动为选定的库安装所有嵌套依赖项，安装命令的一般结构是：

```bash
# 选择你自己的包
conda env create -n [环境名称] [python版本] [包]
```
:::

#### 进入/退出 freqtrade 环境

要检查可用环境，请输入

```bash
conda env list
```

进入已安装的环境

```bash
# 进入 conda 环境
conda activate freqtrade

# 退出 conda 环境 - 现在不要这样做
conda deactivate
```

使用 pip 安装最后的 python 依赖项

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
python3 -m pip install -e .
```

你现在可以运行机器人了。

### 重要快捷方式

```bash
# 列出已安装的 conda 环境
conda env list

# 激活基础环境
conda activate

# 激活 freqtrade 环境
conda activate freqtrade

# 停用任何 conda 环境
conda deactivate                              
```

### 关于 anaconda 的更多信息

:::note 新的重型包
可能会发生这样的情况：创建一个新的 Conda 环境，在创建时填充选定的包所花费的时间比将大型、重型库或应用程序安装到先前设置的环境中所花费的时间要少。
:::

:::note conda 内的 pip 安装
conda 的文档说 pip 不应该在 conda 内使用，因为可能会出现内部问题。但是，它们很少见。[Anaconda 博客文章](https://www.anaconda.com/blog/using-pip-in-a-conda-environment)

尽管如此，这就是为什么首选 `conda-forge` 频道的原因：

* 更多库可用（对 `pip` 的需求更少）
* `conda-forge` 与 `pip` 配合得更好
* 库更新

祝你交易愉快！
:::

---

## 你已经准备好了

你已经做到了这一点，所以你已经成功安装了 freqtrade。

### 初始化配置

```bash
# 步骤 1 - 初始化用户文件夹
freqtrade create-userdir --userdir user_data

# 步骤 2 - 创建新的配置文件
freqtrade new-config --config user_data/config.json
```

你已准备好运行，阅读[机器人配置](https://www.freqtrade.io/en/stable/configuration/)，记住从 `dry_run: True` 开始并验证一切正常。

要了解如何设置配置，请参阅[机器人配置](https://www.freqtrade.io/en/stable/configuration/)文档页面。

### 启动机器人

```bash
freqtrade trade --config user_data/config.json --strategy SampleStrategy
```

:::warning 警告
你应该阅读文档的其余部分，回测你将要使用的策略，并在启用真钱交易之前使用干跑。
:::

---

## 故障排除

### 常见问题："command not found"

如果你使用了 (1)`脚本` 或 (2)`手动` 安装，你需要在虚拟环境中运行机器人。如果你收到如下错误，请确保 venv 处于活动状态。

```bash
# 如果：
bash: freqtrade: command not found

# 然后激活你的虚拟环境
source ./.venv/bin/activate
```

### MacOS 安装错误

较新版本的 MacOS 可能安装失败，出现诸如 `error: command 'g++' failed with exit status 1` 之类的错误。

此错误将需要显式安装 SDK 头文件，这些头文件在此版本的 MacOS 中默认不安装。对于 MacOS 10.14，可以使用以下命令完成：

```bash
open /Library/Developer/CommandLineTools/Packages/macOS_SDK_headers_for_macOS_10.14.pkg
```

如果此文件不存在，那么你可能使用的是不同版本的 MacOS，因此你可能需要咨询互联网以获取具体的解决详细信息。
