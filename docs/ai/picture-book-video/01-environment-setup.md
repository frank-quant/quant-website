---
id: 01-environment-setup
title: 01 环境准备
sidebar_label: 01 环境准备
---
本章节将介绍如何在本地使用 Docker 部署 n8n 自动化平台。

![](../../../static/img/Pasted%20image%2020260102104702.png)

n8n支持自托管（self-hosted）和云托管两种大类。自托管免费，但需要自己管理服务器；云托管付费，但零维护。

Docker是n8n官方最推荐的**自托管方式**，尤其适合生产环境。具有以下优势：
- **环境隔离与一致性**：n8n运行在容器里，不会干扰你的系统或其他软件。无论Windows、Mac还是Linux，配置都一样，避免“在我机器上能跑，但是上生产不能跑”的问题。
- **便携性强**：整个n8n（包括依赖）打包成镜像，一键迁移到任何服务器。开发-测试-生产无缝切换。
- **易于更新与维护**：更新只需docker compose pull && docker compose up -d，几秒钟搞定。回滚也简单，不用担心版本冲突。
- **数据持久化**：用volume映射，工作流、凭证等数据不会因容器重启丢失。
- **资源高效**：容器轻量，启动快（少于1分钟），内存/CPU占用低。
- **安全性高**：隔离减少漏洞风险；易加SSL、认证（如basic auth）。
- **社区支持好**：官方提供现成docker-compose.yml；集成AI工具（如Ollama）超方便。
- **成本低**：本地执行免费。


### 1 环境准备

安装Docker Desktop，没有其他需要准备的。

### 2 n8n安装启动步骤

推荐使用Docker Compose方式，因为它更稳定、支持数据持久化、基本认证保护，并且方便管理（Windows上路径问题少）。

#### 2.1 创建文件夹和yaml文件

在电脑上创建一个专用文件夹，例如：C:\n8n。

进入这个文件夹（cd C:\n8n ），创建docker-compose.yml（用记事本新建，内容复制下面）。

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_SQLITE_VACUUM_ON_STARTUP=true
      - GENERIC_TIMEZONE=Asia/Shanghai  # 修改为你的时区，例如 Europe/Berlin 或 America/New_York
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin  # 可修改用户名
      - N8N_BASIC_AUTH_PASSWORD=your_strong_password_here  # 务必修改为强密码！
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

创建完成。

![](../../../static/img/Pasted%20image%2020260102103943.png)

#### 2.2 启动n8n

打开命令提示符或PowerShell，在刚才创建的文件夹目录下，执行“docker compose up -d”，拉取镜像并启动容器。

第一次运行会下载n8n镜像（几百MB，需联网），可能需要几分钟。

![](../../../static/img/Pasted%20image%2020260102103144.png)

执行完成后，可以通过“docker ps”命令检查是否运行成功，可以看到一个叫 n8n 的容器在运行。

![](../../../static/img/Pasted%20image%2020260102103204.png)

在docker desktop也能看到。

![](../../../static/img/Pasted%20image%2020260102104223.png)

说明n8n已经启动，可以登录访问。

#### 2.3 访问n8n

打开浏览器，访问：**[http://localhost:5678](http://localhost:5678/?referrer=grok.com)**

第一次访问会提示设置主账户（Owner account），填写邮箱和密码（这个是n8n内部登录密码，和上面basic auth不同）。

![](../../../static/img/Pasted%20image%2020260102103533.png)

设置完成后，就能进入n8n编辑器界面，开始创建工作流了！

![](../../../static/img/Pasted%20image%2020260102103701.png)



到这一步，你就有了本地可用的n8n实例！可以开始后面的内容。


