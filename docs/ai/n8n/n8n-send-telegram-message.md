---
id: n8n-send-telegram-message
title: n8n发送telegram消息
sidebar_label: n8n发送telegram消息
---
在 **n8n 部署的自动化工作流中向 Telegram 发送消息** 是一个非常常见、实用的功能，用得非常多。

尤其在量化交易（Quant Trading）中，用 n8n + Telegram是一个非常高频、非常实用的组合，几乎所有私有部署的量化系统都会用到它。

本篇文章主要讲解怎么在n8n中配置节点，将关键信息推送到Telegram。尤其是在 Hugging face+supabase部署模式下。

### 1. 为什么量化交易中常用 Telegram 通知

（1）**轻量 & 安全**  
Telegram 的 bot 接口简单，token 即可调用，不需要复杂运维，也不依赖国内通知渠道。

（2）**实时性强**  
交易信号、成交信息、异常预警都能第一时间推送到手机。

（3）**跨平台使用**
Telegram 在手机、桌面、网页端同步无缝，非常适合交易者随时监控。

（4）**低耦合**
用 n8n 管理消息逻辑，不必修改交易脚本或 Freqtrade 策略代码。

### 2. 获取Telegram配置信息

要配置Telegram机器人，需要获取bot token和chat id。

具体方法我在[01 基础环境准备](https://frank-quant.github.io/quant-website/docs/tutorial/%E8%B7%91%E9%80%9A%E7%AC%AC%E4%B8%80%E4%B8%AA%E9%87%8F%E5%8C%96%E7%A8%8B%E5%BA%8F/01%20%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83%E5%87%86%E5%A4%87)中介绍过，这里再讲一遍。

#### 2.1 获取bot token

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

#### 2.2 获取 chat id

Chat ID 用于告诉机器人消息发送到哪个聊天。

打开你刚创建的 Bot，点击 **Start**。

在 Telegram Web 或手机端打开浏览器：

`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`

例如：`https://api.telegram.org/bot1234567890:ABCDefGhIJKlmNOPQRsTUVWXYZ123456789/getUpdates`

发送任意消息给 Bot，然后刷新浏览器页面。

JSON 响应里会看到：
    `{     "update_id":123456789,     "message":{         "message_id":1,         "from":{"id":987654321,"is_bot":false,...},         "chat":{"id":987654321,"first_name":"Frank",...},         "text":"Hello"     } }`

✅ `"chat":{"id":987654321,...}` 中的 `id` 就是 **Chat ID**。


### 3. 添加Telegram节点

常规情况下，配置Telegram节点是非常方便简单的。搜索"Telegram"后选择具体的action节点即可。


![](../../../static/img/Pasted%20image%2020251104202626.png)

首先要创建Telegram的credential，填写关键的token信息。

![](../../../static/img/Pasted%20image%2020251104203315.png)

![](../../../static/img/Pasted%20image%2020251104203419.png)


创建Telegram节点，选择刚才创建的credential，，再填写chat id，就可以了，非常简单。

![](../../../static/img/Pasted%20image%2020251104203523.png)



对以下三种情况，上述简单版都是行之有效的：
- 本地docker部署的n8n；
- 用官方cloud版n8n；
- 部署在Hugging face，但是开了pro会员。

如果仅仅是免费版 Hugging face部署，上述方法不行，会报错连接异常。

![](../../../static/img/Pasted%20image%2020251104203957.png)

这是因为Hugging Face Spaces环境的核心网络限制导致，主要针对外部API如Telegram、YouTube等，阻塞"api."域（e.g., api.telegram.org、api.wit.ai），旨在防滥用/DoS。

只有免费用户受此影响。

下面告诉大家怎么规避，解决方案仍然是免费的。


### 3. Cloudflare Worker代理（此路不通）

刚开始我寻求用Cloudflare Worker代理解决。用免费Cloudflare Workers作为透明代理（Worker解析Telegram API，避免Spaces DNS问题）。

Cloudflare Workers免费额度100k请求/天。

注册dashboard.cloudflare.com，并创建worker。

![](../../../static/img/Pasted%20image%2020251104204619.png)


在Editor中，编写Worker代码，替换默认代码。

![](../../../static/img/Pasted%20image%2020251104204732.png)

部署后，能够获取URL。

![](../../../static/img/Pasted%20image%2020251104205304.png)

在本地测试，Telegram能够收到消息。（中文乱码先不用担心）

![](../../../static/img/Pasted%20image%2020251104204833.png)

然后在n8n中配置HTTP Request节点，测试却仍然报错。

![](../../../static/img/Pasted%20image%2020251104204950.png)


发现报错原因和之前一样！

查了一下才知道，Hugging Face Spaces的网络限制下，会阻塞"*.workers.dev"等动态子域。

还是不行。


### 4. Vercel Edge Functions（成功）

然后我又尝试了其他几种方法，最终通过在Vercel上创建Edge Function（api/sendMessage.js）作为Telegram代理，解决了这一问题。

Vercel免费额度足够，有100k请求/月。

下面给出详细步骤。

#### 步骤1: 创建GitHub空仓库（Repo）

- 登录GitHub (github.com)。
- 点击右上角"+" → "New repository"。
- Repository name: "telegram-proxy-vercel" (任意，如telegram-bot-proxy)。
- Description: "Telegram API proxy for n8n" (可选)。
- Visibility: Private/Public (推荐Public，便于Vercel导入)。
- **不要**初始化README或.gitignore（保持空repo）。
- 点击"Create repository" → 复制repo URL (e.g., [https://github.com/your-username/telegram-proxy-vercel)。](https://github.com/your-username/telegram-proxy-vercel\)%E3%80%82)

![](../../../static/img/Pasted%20image%2020251103204910.png)
#### 步骤2: 在本地创建代码文件并推送到GitHub

在本地电脑创建api/sendMessage.js文件备用。

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, chat_id, text } = req.body;
  if (!token || !chat_id || !text) {
    return res.status(400).json({ error: 'Missing params' });
  }

  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text })
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

可以用文本编辑器，如vs code或者notepad++。

![](../../../static/img/Pasted%20image%2020251103205307.png)

然后将刚才文件，push到创建的新repo中。可以直接在github网页端操作。

![](../../../static/img/Pasted%20image%2020251103212825.png)


#### 步骤3: 在Vercel导入Git Repo并部署

登录Vercel (vercel.com)，用GitHub账号授权（Import from GitHub）。

Import Git Repository，选择刚才创建的repo。

![](../../../static/img/Pasted%20image%2020251103212925.png)

点击import后，创建新项目并部署。

- Framework Preset: "Other" (默认，Vercel自动检测Edge Function)。
- Root Directory: 留空（默认根目录）。
- Build & Output Settings: 留默认（Node.js 18+）。
- Environment Variables: 加TELEGRAM_TOKEN=你的Bot Token。
- 点击"Deploy"。

![](../../../static/img/Pasted%20image%2020251104210135.png)

等待~1min，部署完成。

![](../../../static/img/Pasted%20image%2020251103213129.png)

要记住项目URL，后面会用到。

demains后面就是Vercel API端点。

![](../../../static/img/Pasted%20image%2020251104210504.png)

另外关键的一步。

![](../../../static/img/Pasted%20image%2020251104210627.png)


#### 步骤4: 测试代理

可以在本地用powershell测试，或者用python程序测试。

```python
import requests
import json
from datetime import datetime

# 配置（替换为你的值）
VERCEL_URL = "https://telegram-proxy-vercel-xxxxx-franks-projects-bd164427.vercel.app/api/sendMessage"  # 你的Vercel API端点
BYPASS_SECRET = "32位的密码"  # 从Vercel Settings → Deployment Protection生成的Secret
BOT_TOKEN = "xxxxxx"  # Bot Token
CHAT_ID = "xxxxx"  # Chat ID

# 构建URL + bypass参数
bypass_url = f"{VERCEL_URL}?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass={BYPASS_SECRET}"

# 测试数据
payload = {
    "token": BOT_TOKEN,
    "chat_id": CHAT_ID,
    "text": f"🚨 Python验证保护密码成功！时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
}

# 发送POST请求
headers = {"Content-Type": "application/json"}
response = requests.post(bypass_url, headers=headers, data=json.dumps(payload))

# 输出结果
print(f"状态码: {response.status_code}")
print(f"响应Body: {response.text}")
  

if response.status_code == 200:
    try:
        data = response.json()
        if data.get("ok"):
            print("✅ 验证成功！Telegram收到消息，保护绕过正常。")
        else:
            print(f"❌ Telegram错误: {data.get('description', 'Unknown')}")
    except json.JSONDecodeError:
        print("❌ 响应非JSON，检查Bypass Secret或Vercel Logs。")
else:
    print(f"❌ Vercel错误: {response.status_code} - {response.text[:200]}...")  # 截断长HTML
```

本地执行后，可以看到消息发送成功。

![](../../../static/img/Pasted%20image%2020251103232317.png)

在Telegram机器人也收到了，验证成功。

![](../../../static/img/Pasted%20image%2020251103232330.png)

#### 步骤5: n8n集成

创建HTTP Request节点。

- **Method**: POST。
- **URL**: 纯URL，无bypass param
- **Authentication**: None。
- **Headers**: 添加两个：
    - Name: Content-Type，Value: application/json。
    - Name: x-vercel-protection-bypass，Value: 你的Bypass Secret（硬码测试；后期`{{ $env.VERCEL_AUTOMATION_BYPASS_SECRET }}`）。
- **Send Body**: Yes → JSON。

![](../../../static/img/Pasted%20image%2020251104211303.png)

执行该步骤验证，提示运行成功。

![](../../../static/img/Pasted%20image%2020251103234133.png)

在Telegram中也收到了。

![](../../../static/img/Pasted%20image%2020251103234144.png)

至此，在免费版Hugging face + supabase + n8n 部署下，推送Telegram消息的功能就实现了。

