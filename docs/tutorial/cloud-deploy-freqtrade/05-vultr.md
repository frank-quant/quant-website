---
title: 05 Vultr部署（推荐）
sidebar_label: 05 Vultr部署（推荐）
---

### 1 比AWS更具性价比的选择

AWS的免费层（EC2信用额模式）确实是极佳的入门选择，能让你零成本跑通整个Freqtrade部署流程，熟悉云服务器操作。

但是对个人量化开发者，会觉得AWS“太贵了”，有没有更具性价比的选择呢？

这里推荐用**Vultr**，尤其对于个人量化开发者、小型工作室往往更合适，原因如下：

（1）**成本更可控、更便宜**。AWS免费期结束后，同样配置的实例费用通常比Vultr高20-50%，而且容易产生“惊喜账单”（数据传输、存储等隐藏费用）。Vultr定价完全透明，按小时计费、流量大方，入门级东京机房实例长期只需10-20美元/月，个人开发者更容易承受。

（2） **亚洲低延迟优势明显**。Binance等主流交易所服务器主要位于东京AWS区域，Vultr的东京机房延迟极低（常在50-150ms），社区实测比AWS东京机房更稳定、更快执行订单。对高频或快速策略来说，这毫秒级的差异可能直接影响盈亏。

（3）**上手与维护更简单**。Vultr界面简洁、新手友好，一键部署Docker、支付宝/微信支付，几分钟就能搞定。AWS控制台功能强大但复杂，安全组、VPC、账单监控等设置容易让个人开发者分心。Vultr让你把精力集中在策略优化上，而不是云配置。

（4） **社区实盘首选**。在Freqtrade官方Discord、Reddit、GitHub讨论中，个人实盘用户提到Vultr的频率远高于AWS。许多自动化部署脚本、教程都以Vultr东京机房为标准配置，迁移和求助都更方便。

最后总结一下，建议按照实际情况选择：

- **个人量化开发者 / 小型工作室**：Vultr（低成本、低延迟、简单上手，性价比）。
- **大型企业用户**：AWS（强大扩展、安全合规、生态完整，适合复杂生产环境）。

| 项目     | Vultr    | AWS (EC2)  |
| ------ | -------- | ---------- |
| 部署难度   | ⭐⭐⭐⭐（容易） | ⭐⭐⭐（相对复杂）  |
| 入门成本   | ⭐⭐⭐⭐⭐（低） | ⭐⭐（中等～高）   |
| 运营成本   | ⭐⭐⭐⭐     | ⭐⭐（常被反馈更贵） |
| 社区常见用法 | ⭐⭐⭐⭐⭐    | ⭐⭐         |
| 可扩展性   | ⭐⭐       | ⭐⭐⭐⭐⭐      |
|        |          |            |

![](../../../static/img/Pasted%20image%2020251227212537.png)


### 2 Vultr 申请与部署

#### 步骤 1：注册账号并充值

（1）访问 Vultr 官网：https://www.vultr.com/?ref=9846028-9J

（2）点击右上角 **Sign Up** 注册，填写邮箱、密码，会收到验证邮件，点击验证。

![](../../../static/img/Pasted%20image%2020251227173926.png)

（3）登录后，进入 **Billing** 页面充值。最低 10 美元起充，支持支付宝、微信、信用卡。

![](../../../static/img/Pasted%20image%2020251227175059.png)



注册完我才发现，其实可以通过别人的邀请链接注册激活，新用户可以免费获得300美元额度，能省下不少钱！

一定要通过邀请链接注册！！

一定要通过邀请链接注册！！

一定要通过邀请链接注册！！

我的邀请链接 https://www.vultr.com/?ref=9846028-9J


#### 步骤 2：创建东京机房实例

（1）登录后点击左侧 **Deploy** 或首页 **+ Deploy Server**。

![](../../../static/img/Pasted%20image%2020251227180835.png)


（2）**Server Type**

**Shared CPU**：共享 CPU 的标准云实例（以前叫 Regular Performance），价格最低，适合一般负载（如 Freqtrade dry-run 或低频策略）。

**Dedicated CPU**：专用 CPU 实例（Optimized Cloud Compute），无 noisy neighbors，性能稳定一致，适合实盘运行。

这里我先选择 Shared CPU类型试用。后续可以随时直接升级到 Dedicated CPU，操作非常简单，无需重新部署或迁移数据。要注意，只能升级，不能降级（Dedicated → Shared 不支持）。

![](../../../static/img/Pasted%20image%2020251227191920.png)

（3） **Server Location**
    - 选择 **Asia > Tokyo**（日本东京，低延迟最低）。

![](../../../static/img/Pasted%20image%2020251227191402.png)

（4）**Server Plans**

先选择2vcores+2GB规格，价格每月18美元，相比AWS便宜不少。

![](../../../static/img/Pasted%20image%2020251227192322.png)


（5）**Server Size，确认服务器规格**

Automatic Backups在初期试水阶段可以先关闭，可以省一些费用（20%）。

等后续要实盘，还是建议打开，服务器万一出问题（误操作、系统崩溃、Vultr 故障），自动备份能让你几分钟回滚到前一天状态，避免策略中断或数据丢失。

![](../../../static/img/Pasted%20image%2020251227192718.png)

（6） **Server OS**

选择**Ubuntu 24.04 x64**（稳定），和之前在AWS中的EC2同一版本。

![](../../../static/img/Pasted%20image%2020251227193154.png)

（7） **Server Hostname & Label**

这两个字段不影响实例性能、网络或功能，只是为了让你自己更容易管理和识别服务器（尤其是当你有多个实例时）。

Server Hostname（服务器主机名），是实例在系统内部的主机名（hostname），登录服务器后执行 hostname 命令看到的名称。显示在 SSH 登录提示中（如 root@freqtrade-tokyo）。

Server Label（服务器标签），是 Vultr 控制台显示的**外部标签名称**，仅在你的 Vultr 账户后台显示。

这里填写为 freqtrade-tokyo。

![](../../../static/img/Pasted%20image%2020251227193624.png)


（8）**Additional Features**

在 Vultr 部署页面，Additional Features 部分通常包含以下几个选项。

![](../../../static/img/Pasted%20image%2020251227194054.png)

这里按照默认选择即可。

![](../../../static/img/Pasted%20image%2020251227193905.png)

（9）**Server Settings**

Server Settings 部分有几个高级选项，包括 SSH Keys 和 Startup Script。这些选项可选，但对 Freqtrade 等量化部署非常有用。

**Startup Script** 是自定义脚本，在实例首次启动时自动执行（云初始化脚本）。可以自动安装 Docker、部署 Freqtrade，一键跑通环境。这里先不采用。

**SSH Keys** 可以上传你的公钥（public key），部署后服务器只允许密钥登录，禁用密码登录，安全级别大幅提升（root 密码不会暴露）。这里也先不配置，等后续再加。

![](../../../static/img/Pasted%20image%2020251227204318.png)


（10）点击 **Deploy Now**（几分钟部署完成）

在summary部分能看到整个服务器信息的总结。

![](../../../static/img/Pasted%20image%2020251227204427.png)

部署后，实例显示为 running 状态。

![](../../../static/img/Pasted%20image%2020251227204738.png)

在实例详情页，可查看公网 IP 地址、root 密码。

![](../../../static/img/Pasted%20image%2020251227204817.png)

到这一步，已经拥有了一个可用的Ubuntu操作系统的服务器，剩下就是部署freqtrade并迁移策略了。

#### 步骤 3：SSH 连接服务器

接下来的操作参考 [# 03 AWS申请免费层EC2服务器](https://frank-quant.github.io/quant-website/docs/tutorial/cloud-deploy-freqtrade/aws-free-ec2)中第三节的内容“SSH连接使用”。

在Xshell配置后即可连接。

![](../../../static/img/Pasted%20image%2020251227205300.png)

初始化环境并部署docker。

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Docker 和 Docker Compose
sudo apt install docker.io docker-compose-v2 -y

# 启动并开机自启
systemctl start docker
systemctl enable docker

# 创建目录
mkdir ~/freqtrade && cd ~/freqtrade
mkdir user_data

# 拉取官方镜像
docker pull freqtradeorg/freqtrade:stable

# 初始化目录结构（模板）
docker run --rm -v $(pwd)/user_data:/freqtrade/user_data \
  freqtradeorg/freqtrade:stable create-userdir --userdir user_data

# 手动创建最小 config.json（避免交互报错）
nano user_data/config.json
# 粘贴config.json模板内容

# 创建 docker-compose.yml
nano docker-compose.yml
# 粘贴模板内容
```

基础环境已部署完成。

![](../../../static/img/Pasted%20image%2020251227210102.png)


#### 步骤 4：迁移本地策略（核心步骤）

参考 [# 部署bot并执行策略（核心）](https://frank-quant.github.io/quant-website/docs/tutorial/cloud-deploy-freqtrade/bot-deploy)中“迁移本地策略”章节的内容。

首先用Xftp连接服务器并拖拽文件，覆盖。

![](../../../static/img/Pasted%20image%2020251227210318.png)

修改docker-compose.yml中的策略名为Moving_Average_Crossover_Strategy并启动。

看到以下日志表示启动成功，策略已经顺利部署。

![](../../../static/img/Pasted%20image%2020251227211657.png)

在页面  http://你的公网ip:8080/  查看freqUI。

![](../../../static/img/Pasted%20image%2020251227211818.png)


恭喜你，到此你已经完全掌握了freqtrade的云服务部署，enjoy!


