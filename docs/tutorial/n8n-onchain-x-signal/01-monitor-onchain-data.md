---
title: 01 监控链上数据
sidebar_label: 01 监控链上数据
---
### 1 核心思路




### 2 前提条件

n8n


#### 2.2 Cloudflare Worker代理

Cloudflare Workers免费额度100k请求/天，足够巨鲸警报。
登录地址 https://dash.cloudflare.com/ 

（1）**登录Cloudflare Dashboard**

可以选择直接用google账号登录。

左侧"Workers & Pages" → "Overview" → "Create application" → "Create Worker"，选择"Drag and drop your files"，用下一步创建的js文件。
Name: "telegram-proxy-2025"。

![](../../../static/img/Pasted%20image%2020251029210134.png)


![](../../../static/img/Pasted%20image%2020251029211012.png)



（2） **编写Worker代码**（透明代理Telegram Bot API）

在本地创建telegram-proxy-2025.js文件备用。
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token'); // 从URL ?token=...获取
  if (!token) {
    return new Response('Missing token', { status: 400 });
  }

  // 转发到Telegram API
  const telegramUrl = `https://api.telegram.org/bot${token}${url.pathname}`;
  const newRequest = new Request(telegramUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });

  return fetch(newRequest);
}
```

保存并上传创建worker节点。

![](../../../static/img/Pasted%20image%2020251029210023.png)


3. **部署 & 测试Worker**：
    - 点击"Deploy"。
    - 测试URL：https://telegram-proxy-2025.your-account.workers.dev/sendMessage?token=你的Token（用Postman POST Body `{"chat_id": "你的Chat ID", "text": "测试代理"}`）。
    - 响应：`{"ok":true, "result": {...}}`（Telegram收到消息）。若错，检查Token。
4. **绑定自定义域（可选）**：
    - Workers设置 → "Triggers" → Add Custom Domain（免费subdomain如proxy.yourdomain.com）。




### 3 工作流构建

新建workflow，命名为"on-chain-X-info"。
![](../../../static/img/Pasted%20image%2020251029192328.png)

#### 3.1 添加触发器：Schedule Trigger节点（定时执行）

添加Schedule Trigger，连接到起点。
- 配置：
    - Trigger Interval: "Hours"
    - Hours Between Triggers: 1
    - Trigger at Minute: 0

![](../../../static/img/Pasted%20image%2020251029192216.png)

**Trigger Interval: "Hours"** 表示触发间隔的单位是"小时"（Hours）。Cron节点支持多种单位，如Minutes（分钟）、Hours（小时）、Days（天）等。这里选择小时模式，意味着触发基于小时周期。

**Hours Between Triggers: 1** 表示触发之间的小时间隔为1小时。即每隔1小时执行一次工作流（例如，从触发后等待1小时再下次运行）。

**Trigger at Minute: 0** 表示在每个触发小时内的具体分钟数为0（即小时的开始时刻）。这确保工作流在整点（如XX:00）运行，而不是随机分钟（如XX:15）。如果设为30，则在XX:30运行。

这里做链上数据监控，适合低频监控（节省API调用，避免限流），先设置为1小时是足够的。

点击"Eexcute step"执行该步骤，提示执行成功。

![](../../../static/img/Pasted%20image%2020251029193112.png)

#### 3.2 添加数据获取：HTTP Request节点（拉取最近交易）

连接到Schedule Trigger，添加"HTTP Request"。
- 配置：
    - Method: **POST**
    - URL: https://api.hyperliquid.xyz/info
    - Authentication: None
    - Headers: Name Content-Type → Value application/json
    - Body: JSON
```
   {
   "type": "recentTrades",
  "coin": "BTC"
   }
```

添加后节点信息如图所示

![](../../../static/img/Pasted%20image%2020251029193839.png)

![](../../../static/img/Pasted%20image%2020251029193917.png)
执行节点，提示执行成功，能够输出最近的交易信息。

![](../../../static/img/Pasted%20image%2020251029194017.png)

输出结果类似于
```json
{ "coin": "BTC", // 交易的币种：Bitcoin（比特币） 
"side": "B", // 交易方向：B 代表 Buy（买入） 
"px": "113157.0", // 交易价格：113157.0（单位可能是 USDT 或 USD，具体取决于交易所）
 "sz": "0.28", // 交易数量：0.28 BTC（比特币数量） 
 "time": 1761738002717, // 交易时间戳：Unix 时间戳（毫秒），对应 UTC 时间 2025-10-29 11:40:02.717 
 "hash": "0x8552872040375d5686cc042e6ded8e02018d0005db3a7c28291b3272ff3b3741", // 交易哈希：链上交易的唯一标识符（Ethereum 风格的 tx hash） 
 "tid": 850984410748420, // 交易 ID：内部交易编号或订单 ID 
 "users": [ // 交易参与者地址（Ethereum 地址，可能是买家和卖家）
  "0xc6ac58a7a63339898aeda32499a8238a46d88e84", // 可能为一方地址（例如卖家）
   "0xae78adaba70f18c15418001263504af373884520" // 可能为另一方地址（例如买家） 
   ] }
```


#### 3.3 添加过滤逻辑：Code节点（识别巨鲸）

- 连接到HTTP，新建"Code" (JavaScript)。
- 配置：
    - Mode: "Run Once for All Items"。
    - language：javascript

![](../../../static/img/Pasted%20image%2020251029203039.png)

具体代码如下，通过whaleThreshold阈值判断交易量，大于阈值的为判断为巨鲸。

```javascript
// Loop over input items and add a new field called 'myNewField' to the JSON of each one

const inputItems = $input.all();
if (inputItems.length === 0) {
  return []; // 无输入，返回空
}

const whaleThreshold = 0.0002; // 巨鲸阈值
const filteredItems = [];

for (const item of inputItems) {
  const tradesArray = item.json;
  if (Array.isArray(tradesArray)) {
    for (const trade of tradesArray) {
      const size = parseFloat(trade.sz);
      if (!isNaN(size) && size > whaleThreshold) {
        // 复制trade并添加新字段（原样输出风格）
        const newTrade = { ...trade };
        newTrade.myNewField = 1;
        // 推入新item
        filteredItems.push({ json: newTrade });
      }
    }
  } else {
    // Fallback: 如果非数组，原样添加myNewField到item.json
    item.json.myNewField = 1;
    filteredItems.push(item);
  }
}

// 返回过滤后的items (原样，但只巨鲸交易)
return filteredItems;
```

执行后，输出如下
![](../../../static/img/Pasted%20image%2020251029203308.png)

#### 3.4 分支：IF节点

- 连Code，新建"IF"。
- Conditions: Number → `{{ $input.all().length }}` > 0。

![](../../../static/img/Pasted%20image%2020251029203607.png)


#### 3.5 

