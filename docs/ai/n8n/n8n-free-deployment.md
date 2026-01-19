---
id: n8n-free-deployment
title: 线上n8n免费部署
sidebar_label: 线上n8n免费部署
---
### 1. 需求背景

#### 1.1 n8n 是什么？

**n8n** 是一个开源的 **可视化工作流自动化（Workflow Automation）工具**，类似于 Zapier、Make (Integromat)，但更灵活、可自托管、可编程。

本质上就是一个 **低代码自动化中枢**：它把"人肉执行的多步任务"自动化成一个可复用、可监控、可调度的流程。

官网 https://n8n.io/

主要特点包括：

- **自动化工作流：** 它允许用户通过图形化界面（可视化）将数百种不同的服务和应用程序串联起来，创建复杂的自动化流程。
    
- **无代码/低代码：** 旨在让非技术用户也能快速构建自动化任务，将繁琐枯燥的手动任务转化为灵活智能的自动化工作。
    
- **开源和可扩展性：** 作为开源工具，用户可以自由部署和定制，并能接入各种外部工具和自定义代码。
    
- **强大的AI整合能力：** 它可以轻松整合各种AI工具，例如大型语言模型（LLM）如 OpenAI，用于内容生成、智能分析、自动回复等高级应用。

#### 1.2 n8n 在 Quant中的应用

量化交易的典型流程是多阶段的：  

**数据获取 → 特征处理 → 策略运行 → 交易执行 → 风控与告警 → 绩效汇总与报告。**

这些阶段中有大量"定时、触发、接口调用、消息发送"等任务，非常适合用 n8n 自动化。

在量化交易和投资领域，n8n 可以作为强大的"粘合剂"和自动化引擎，帮助交易员和开发者构建和维护复杂的自动化系统。应用方向包括：

（1）**数据采集与处理自动化：**
    
    - **自动抓取数据：** 定时从不同的数据源（如交易所 API、财经新闻网站、社交媒体、数据库等）抓取市场数据、公司公告或情绪指标。
        
    - **数据清洗与转换：** 在将数据导入分析系统前，自动进行格式转换、缺失值处理或指标计算。
        
（2） **交易策略执行自动化：**
    
    - **信号生成与触发：** 当分析模型（例如在 Python 或 R 中运行）生成交易信号时，n8n 可以接收此信号。
        
    - **自动下单：** 接收信号后，n8n 通过集成交易所的 API，自动执行买入或卖出订单。
        
（3） **信息监控与警报系统：**
    
    - **实时监控：** 持续监控仓位、资金变化或特定资产的价格波动。
        
    - **警报通知：** 一旦达到预设条件（例如价格突破、止损触发、大额交易发生），n8n 自动通过邮件、Telegram 或其他通讯工具发送实时通知。
        
（4） **AI 驱动的分析整合：**
    
    - **情绪分析自动化：** 自动抓取社交媒体或新闻评论，利用整合的 LLM 或其他 AI 服务进行情绪分析，并将结果作为量化策略的输入。
        
    - **报告生成：** 定期或根据需要，自动生成交易报告、绩效分析或市场总结，并自动发送给相关人员。
        
（5） **系统运维与日志管理：**
    
    - **日志记录：** 记录交易系统的运行状态、交易执行结果和遇到的错误。
        
    - **故障处理：** 当系统出现错误或交易失败时，自动尝试重新执行或通知运维人员。

#### 1.3 线上免费部署方案

n8n 提供了两种主要的部署和使用方式，其收费模式也因此不同：**线下版本（Self-Hosted/Community）** 和 **云化版本（Cloud/Managed Service）**。

由于 n8n 是一个**开源**项目，其核心软件本身是**免费**的。

云化版本是n8n 官方提供的托管服务，用户无需担心底层基础设施和维护，直接使用其平台，是收费的。

![](../../../static/img/Pasted%20image%2020251013211617.png)

对于初学者来说，每个月20欧元的价格还是比较贵。这里提供一个免费部署的模式。

采用**Hugging Face Spaces + Supabase** 部署，非常适合个人开发者和小规模的应用。


### 2. 前期准备

#### 2.1 注册账号

##### 2.1.1 Hugging Face

**Hugging Face（简称 HF）** 是整个 AI 工程生态中最核心的基础设施之一。可以理解为「AI 模型界的 GitHub」。

**是全球最大的开源模型生态**  ，几乎所有主流模型（Llama、Mistral、Qwen、Gemma、Stable Diffusion、CLIP、Whisper、Falcon）都在 Hugging Face 上发布。

访问  https://huggingface.co/join 免费注册（用 GitHub 或邮箱）。创建后，生成 Personal Access Token（Settings > Access Tokens，用于后续集成）。免费层支持无限 Spaces，但公网需 Public 可见性。

用邮箱注册。

![](../../../static/img/Pasted%20image%2020251012140703.png)

这里要求确认邮件地址，在gmail中点击邮件链接确认。

![](../../../static/img/Pasted%20image%2020251012141000.png)
![](../../../static/img/Pasted%20image%2020251012141032.png)

注册完成。

![](../../../static/img/Pasted%20image%2020251013212133.png)


##### 2.1.2 Supabase

Supabase 是一个开源的后端即服务（Backend-as-a-Service, BaaS）平台，被誉为"Firebase 的开源替代品"。

它基于 PostgreSQL 数据库构建，提供一站式工具，帮助开发者快速构建和管理应用程序的后端，包括认证、数据库、实时订阅、存储和边缘函数等功能。

Supabase 的目标是让开发者无需从零搭建基础设施，就能获得可靠、可扩展的后端服务，同时避免专有平台的供应商锁定。

访问 https://supabase.com/signup 免费注册，也支持用github账号登录，这里我选择用github账号直接登录。

![](../../../static/img/Pasted%20image%2020251012143152.png)

![](../../../static/img/Pasted%20image%2020251012143212.png)


### 3. n8n免费部署

##### 3.1 创建Supabase项目（数据库后端）

登录 Supabase 仪表盘，如果是第一次登录，会要求先新建organization，依次填写即可。

![](../../../static/img/Pasted%20image%2020251012143327.png)

免费版的额度已经足够使用，包括免费的Postgres数据库、500M存储空间。
![](../../../static/img/Pasted%20image%2020251012143939.png)

新建organization后，再选择新建project。如果你是从上面的步骤依次操作过来的，会自动跳转到这里。

![](../../../static/img/Pasted%20image%2020251012143505.png)


![](../../../static/img/Pasted%20image%2020251012143602.png)


![](../../../static/img/Pasted%20image%2020251012143649.png)


这里我选择启用 pgvector，用于未来 RAG 存储 X 数据 embedding。

这一步是可选的，如果没有向量搜索的诉求，可以忽略。

![](../../../static/img/Pasted%20image%2020251012145143.png)

接下来可以验证一下数据库可用性，在 SQL 编辑器（Database 页面右上角的 "SQL Editor"）运行以下查询：

```sql
select 1;
```

![](../../../static/img/Pasted%20image%2020251012145313.png)

如果连接正常，会返回结果（证明数据库连通）。

![](../../../static/img/Pasted%20image%2020251012145341.png)

进一步验证 pgvector，运行 CREATE EXTENSION IF NOT EXISTS vector。若无错误，即启用成功。

![](../../../static/img/Pasted%20image%2020251012145431.png)

在 Connection String 区域，可以看到数据库URI（可用于 Python 一行连接），格式如 postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres。


![](../../../static/img/Pasted%20image%2020251012151401.png)

![](../../../static/img/Pasted%20image%2020251012151428.png)

[YOUR_PASSWORD] 是你创建项目时设置的数据库密码；
[PROJECT_REF] 是你的项目 ID（e.g., "abcde12345"，自动填充）

通过python连接数据库可参考代码：

```python 
import psycopg2
from psycopg2 import Error

# 替换为你的 URI（密码已包含）
conn_string = "postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres"

try:
    # 连接数据库
    connection = psycopg2.connect(conn_string)
    cursor = connection.cursor()
    
    # 测试查询
    cursor.execute("SELECT 1;")
    result = cursor.fetchone()
    print("连接成功！结果:", result[0])
    
    # 示例：查询表（假设你有 events 表）
    cursor.execute("SELECT * FROM events LIMIT 5;")
    records = cursor.fetchall()
    print("查询结果:", records)
    
except (Exception, Error) as error:
    print("连接错误:", error)
finally:
    if connection:
        cursor.close()
        connection.close()
        print("连接已关闭")
```

可选：创建表存储工作流数据（e.g., executions、workflows），但 n8n 会自动初始化。

#### 3.2 准备 n8n Dockerfile 和 Repo

在 GitHub 新建 Repo（e.g., "n8n-hf-supabase"），网页端创建就可以。

![](../../../static/img/Pasted%20image%2020251012165204.png)

填写repo的名称，这里选用 n8n-hf-supabase

![](../../../static/img/Pasted%20image%2020251012165748.png)
注意要添加 README.md，描述项目（Hugging Face 需要）。

在根目录创建 Dockerfile文件。

![](../../../static/img/Pasted%20image%2020251012165942.png)

```
FROM n8nio/n8n:latest
# 暴露端口
EXPOSE 5678
# 健康检查
HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:5678/healthz || exit 1
```


#### 3.3 在 Hugging Face Spaces 部署 n8n

登录 Hugging Face，新建 Space（URL: https://huggingface.co/new-space )。

![](../../../static/img/Pasted%20image%2020251012164511.png)

设置：Name="n8n-crypto-agent"，License=MIT，SDK=Docker（重要！）。

这里的name可以根据自己的需求自由修改。

Visibility=Public（免费层限公网）。
![](../../../static/img/Pasted%20image%2020251012164647.png)
点击 Create Space，会自动生成一个新 HF Repo，并设置 README.md 的 YAML。

![](../../../static/img/Pasted%20image%2020251012170926.png)

构建开始（~1-2 分钟），但初始无 Dockerfile，下步添加。

在本地目录，下载刚才新建的repo n8n-hf-supabase

![](../../../static/img/Pasted%20image%2020251012170852.png)

在本地 GitHub Repo 目录（包含 Dockerfile 和 README.md），添加 HF Space 作为远程。

Hugging Face 从 2023 年 10 月 1 日起完全禁用了 Git 的密码认证（包括账号密码），必须用 Personal Access Token (PAT) 或 SSH 密钥替换。 推送命令 git push -u hf main 使用 HTTPS 协议时，会提示输入用户名/密码，但输入账号密码无效——需要用 PAT 作为"密码"。

推荐用 SSH 密钥。在 PowerShell输入命令：

```
ssh-keygen -t ed25519 -C "your_email@example.com"
```

提示路径：默认 C:\Users\10718\.ssh\id_ed25519（回车）。
密码：可选（空回车，无密码）。
输出：生成私钥 id_ed25519 和公钥 id_ed25519.pub。

![](../../../static/img/Pasted%20image%2020251012182322.png)

登录 https://huggingface.co/settings/keys ，添加公钥到 Hugging Face。

![](../../../static/img/Pasted%20image%2020251012182423.png)

readme.md内容格式应为

```
---
title: n8n Crypto Weekly Agent
emoji: 🤖
colorFrom: blue
colorTo: green
sdk: docker
app_port: 5678
---

# n8n for Crypto+Quant+LLM Weekly Report
Deployed on Hugging Face Spaces with Supabase integration.
```

添加并提交合并结果，推送 main 分支。

```
git add README.md
git commit -m "Resolve merge conflict in README.md"
git status
git push -u hf main
```

![](../../../static/img/Pasted%20image%2020251012181723.png)


**验证推送**：

- 访问 [https://huggingface.co/spaces/frank-quant/n8n-crypto-agent](https://huggingface.co/spaces/frank-quant/n8n-crypto-agent)
- **Files and versions**：README.md 更新为你的合并版，Dockerfile 存在。
- **Build** 标签：构建启动（2-5 分钟，日志显示 "docker build" 过程）。成功后，访问 [https://frank-quant-n8n-crypto-agent.hf.space/](https://frank-quant-n8n-crypto-agent.hf.space/) 看到 n8n 界面（可能需等待构建）。

看起来正常了。

![](../../../static/img/Pasted%20image%2020251012184235.png)

![](../../../static/img/Pasted%20image%2020251012183527.png)


- **Queued at 2025-10-12 10:19:19**：构建已排队启动。
- **FROM docker.io/n8nio/n8n:latest**：成功拉取 n8n 的基础镜像（DONE 0.0s），这是 Dockerfile 的第一步。
- **Pushing image**：镜像推送完成（DONE 1.1s）。
- **Exporting cache**：缓存导出完成（DONE 0.1s）。

打开n8n界面，可以看到 https://frank-quant-n8n-crypto-agent.hf.space/home/workflows

![](../../../static/img/Pasted%20image%2020251012190031.png)


再配置数据库参数

![](../../../static/img/Pasted%20image%2020251012193551.png)

参数关键信息在 Transaction pooler

![](../../../static/img/Pasted%20image%2020251012193651.png)

- DB_TYPE=postgresdb
- DB_POSTGRESDB_HOST=aws-0-[your-region].pooler.supabase.com（e.g., aws-0-ap-southeast-1.pooler.supabase.com）
- DB_POSTGRESDB_PORT=6543
- DB_POSTGRESDB_DATABASE=postgres
- DB_POSTGRESDB_USER=postgres.[project-ref]（e.g., postgres.pgeouzkyqkspzmavcpce）
- DB_POSTGRESDB_PASSWORD=[your-password]（e.g., crypto_weekly_n8n）
- DB_POSTGRESDB_SSL_ENABLED=true（Supabase 强制 SSL）
- 额外（解决警告）：
    - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
    - N8N_RUNNERS_ENABLED=true
    - N8N_BLOCK_ENV_ACCESS_IN_NODE=false（如果用 Code 节点）
    - N8N_GIT_NODE_DISABLE_BARE_REPOS=true


最后重启space，确保一切正常，n8n页面可打开。

![](../../../static/img/Pasted%20image%2020251012193807.png)

![](../../../static/img/Pasted%20image%2020251012193819.png)

恭喜！根据之前的配置，你的 n8n 应该已经稳定运行在 HF Spaces 上。



### 4. n8n工作流构建（示例）

可以快速创建一个工作流，测试 n8n 核心功能。

首先创建一个凭证。n8n 的数据库节点设计是先创建/选择一个 Credential（凭证），然后凭证中存储连接细节。

![](../../../static/img/Pasted%20image%2020251012195841.png)

- 点击 **New** > **Blank Workflow**。
- 添加 **Schedule Trigger** 节点（拖拽）：Cron 0 * * * *（每小时测试）。
- 添加 **Postgres** 节点（连接）：操作 "Execute Query"，SQL: SELECT NOW() AS current_time;。
- 配置连接，选择刚才创建的凭证；
- 点击 **Execute Workflow**（手动运行）。
- 输出：应显示当前时间（e.g., `{"current_time": "2025-10-12T11:30:00Z"}`），证明 DB 连接 OK。

![](../../../static/img/Pasted%20image%2020251012200147.png)

如果能够输出预期的结果，说明一切都是正确的。

另外有几个注意事项：

（1）登录hugging face需要科学上网；

（2）搭建好的n8n需要创建一个每天执行的工作流，避免容器休眠被回收；

（3）n8n后台网址可以直接访问，不需要科学上网。

