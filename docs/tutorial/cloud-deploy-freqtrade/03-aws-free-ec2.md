---
title: 03 AWS申请免费层EC2服务器
sidebar_label: 03 AWS申请免费层EC2服务器
---

AWS 是全球最大的云服务提供商，其免费资源非常适合新手零成本试水 Freqtrade。

本节将从零开始申请并启动一个 EC2 实例。

### 1 AWS中的几个概念

在开始前，我们先明确几个核心概念，避免混淆。
#### 1.1 Lightsail和EC2

**Lightsail**是AWS 推出的简化版 VPS（虚拟私人服务器），专为新手和小项目设计。 

优点是界面简单，支持一键部署，固定月费（捆绑CPU、内存、存储、流量），适合小型应用、测试验证等简单场景。缺点也很明显，配置选项少、扩展性有限。

**EC2**（Elastic Compute Cloud）是AWS 核心计算服务，功能极其强大。

支持数百种实例类型、可自定义网络/存储、支持 Auto Scaling（自动扩容）、无缝集成 AWS 生态。但配置稍显复杂，新手可能会被各种陌生的概念绕的晕头转向。

总而言之，Lightsail 是“开箱即用”的简化产品（底层基于EC2，但隐藏复杂性），EC2 是“全功能自定义”，适合专业需求。

**这里强烈推荐直接用 EC2**，因为后续涉及到多策略实例执行、Hyperopt优化、大数据回测，肯定需要扩容。Lightsail有资源上限（最大256GB RAM、实例数限20），高流量负载均衡弱，一旦超限，需要手动迁移到EC2。

用社区案例来看，Freqtrade社区很少用Lightsail长期实盘，大多是用EC2或直接转Vultr（下一节介绍）。

#### 1.2 t3.micro 和 t2.micro 的区别

**t3.micro** 和 **t2.micro** 是AWS EC2的两种**Burstable Performance Instances**（突发性能实例），都适合间歇性负载（如开发、测试、小型应用、Freqtrade dry-run试水），基本配置相同：**2 vCPU、1 GiB RAM**。

**t3.micro** 是新一代（2018年后推出），整体优于旧的 **t2.micro**（2014年推出）。

从性能/成本看，t3.micro全面优于t2.micro（更快、更稳、更便宜），社区和AWS都建议新实例优先t3（或更新t4g/t3a）。

#### 1.3 AWS免费资源策略

AWS Free Tier（免费层）是新用户的入门福利。

用**AWS免费资源**运行**t3.micro**实例（EC2），根据账号创建时间有一些差异：

- **旧账号（2025年7月15日前创建）**：每月750小时 t3.micro（或t2.micro，视地区而定）免费，使用12个月。够1个实例24/7运行（约730小时/月）。
- **新账号（2025年7月15日后创建）**：无固定750小时免费，转为信用额模式（注册送$100 + 任务赚$100，总$200信用额，最多6个月）。t3.micro全月运行约需$8-15（视地区），信用额够跑几个月24/7，但用完或6个月后收费。

另外，Lightsail有限时推广：选定入门bundle（捆绑计划）前3个月（90天）免费，包含每月750小时使用。因为这里不推荐用Lightsail，就不过多介绍了。



### 2 申请EC2服务器

#### 2.1 前置准备

注册 AWS 账号：
    访问 [https://aws.amazon.com/](https://aws.amazon.com/?referrer=grok.com)
    点击右上角“创建 AWS 账号”或“免费账户”
    填写邮箱、密码、账号名称
    提供信用卡验证（临时扣款约1美元，会退回）
    新账号自动获得 $200 信用额（信用额模式）

登录 AWS 管理控制台：[https://console.aws.amazon.com/](https://console.aws.amazon.com/?referrer=grok.com)

#### 2.2 创建 EC2 实例

控制台首页搜索“EC2”，或直接访问 https://console.aws.amazon.com/ec2/

右上角选择 亚太地区-东京 (ap-northeast-1) 机房，更适合低延迟连接 Binance。

![](../../../static/img/Pasted%20image%2020251222230928.png)

在EC2控制台，选择 Launch instance。

![](../../../static/img/Pasted%20image%2020251222231058.png)

设置实例名称和标签（可选），这里命名为“freqtrade_demo”。

选择操作系统镜像（AMI），在“Amazon Machine Image (AMI)”部分：
    选择 **Quick Start** > **Ubuntu**。
    推荐 **Ubuntu Server 22.04 LTS** 或 **24.04 LTS**（64-bit x86 或 Arm，根据配置）。
    右侧会显示“Free tier eligible”（免费层）标记。

![](../../../static/img/Pasted%20image%2020251222231325.png)

选择实例类型（Instance type），默认 t3.micro（2 vCPU、1 GiB 内存）。这里选择 **t3.small**（2 vCPU、2 GiB），性能更好一些，也有一定的免费额度。

![](../../../static/img/Pasted%20image%2020251223230636.png)

密钥对（Key pair）用于 SSH 登录，在“Key pair (login)”部分：
    点击“创建新密钥对”（Create new key pair）。
    名称：自定义，如 freqtrade。
    类型：RSA 或 ED25519。
    格式：.pem（用于 XShell）。
    点击“创建密钥对”，浏览器自动下载 .pem 文件（**一定要妥善保存**，丢失无法找回）。

![](../../../static/img/Pasted%20image%2020251222231636.png)


![](../../../static/img/Pasted%20image%2020251222231549.png)

![](../../../static/img/Pasted%20image%2020251222231709.png)

网络设置（Network settings），按照以下调整：
- VPC：默认即可。
- 子网：默认（No preference）。
- 自动分配公共 IP：启用（Enable）。
- 防火墙（安全组 Security group）：
    选择“创建安全组”（Create security group）。
    安全组名称：如 freqtrade-sg。
    描述：可选。
    规则：
        - SSH（端口 22）：来源选择“Anywhere”（0.0.0.0/0，方便但稍不安全）。

![](../../../static/img/Pasted%20image%2020251222231905.png)

存储配置（Configure storage），选择30 GiB gp3 SSD。

![](../../../static/img/Pasted%20image%2020251222232012.png)

选择完后，在右侧可以看到总结详情，点击右下角“启动实例”（Launch instance）。

![](../../../static/img/Pasted%20image%2020251222232112.png)

实例启动中，预计10秒钟。

![](../../../static/img/Pasted%20image%2020251222232240.png)

状态从“Pending”变为“Running”（绿色），可以看到已经启动了。

![](../../../static/img/Pasted%20image%2020251222232308.png)

选中实例，可以看到运行详情。

![](../../../static/img/Pasted%20image%2020251223212037.png)

![](../../../static/img/Pasted%20image%2020251223212110.png)


另外还要提醒一点，要经常看一下AWS的账单，以免有额外费用产生。

前面我们申请资源的时候，会看到“Free tier eligible”，这句话的主语是“AWS账号”，而不是“实例套餐”。

再解释一下AWS 的 Free Tier三层逻辑：
（1）账号是否具备 Free Tier 资格；
（2）资源类型是否在 Free Tier 范围；
（3）是否超出免费额度

所以，如果不用的话，可以选择stop实例，节省一点额度。

### 3 SSH连接使用

用XShell填写主机IP，端口22，用户ubuntu，认证用pem密钥（XShell > Tools > User Key Manager导入）。

![](../../../static/img/Pasted%20image%2020251223213003.png)

![](../../../static/img/Pasted%20image%2020251223213019.png)

首次连接会提醒是否保存主机密钥，选择接受并保存。

![](../../../static/img/Pasted%20image%2020251223212321.png)

恭喜！你已经成功通过 SSH 连接到 AWS  EC2 的 Ubuntu 24.04 实例了！这是部署 Freqtrade 的第一步，服务器已经准备好了。

![](../../../static/img/Pasted%20image%2020251223213100.png)

现在看到的提示“System restart required” ，这是因为 sudo apt upgrade -y 更新了内核（kernel）或其他系统核心组件，Ubuntu 建议重启来加载新版本。但在云服务器上，当前会话和运行的服务不会受影响。

现在可以暂时先忽略这个重启提示，继续下一步配置 config.json、启动 Freqtrade、测试策略。

等有空时，用 sudo reboot 或控制台重启一下就行，不影响后续部署进度。

再试试Xftp连接。

![](../../../static/img/Pasted%20image%2020251225210352.png)

连接成功。


下一节，我们讲讲怎么在云服务器上部署策略。