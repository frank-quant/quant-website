---
title: 删除sqlite中的异常数据
---
 
### 1. SQLite异常数据

由于这种原因，导致bot异常重启，产生残留的异常数据，使freqtrade数据和biance交易所的数据不一致。

在bot机器人查看，显示有CRV挂单，freqtrade UI界面也能看到。
![](../../../static/img/Pasted%20image%2020250818075341.png)

打开biance交易所查看，实际没有当前委托。
![](../../../static/img/Pasted%20image%2020250818075404.png)

猜测是由于SQLite数据库锁表导致的异常重启，使数据不一致。如果不处理，挂单信息会一直保留，也不会再提交到交易所，实质上是僵尸挂单。

### 2. 清理异常数据
先暂停bot，防止产生新的异常数据。
```shell
docker compose stop
```

然后用python命令清理。
```python
import sqlite3

db_path = "tradesv3.sqlite"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 查看 trade
cursor.execute("select id, exchange, pair, open_rate, close_rate, max_rate, min_rate, close_profit, open_date, close_date, exit_reason, leverage, is_open
FROM trades
order by open_date desc  limit 30 ;")
for row in cursor.fetchall():
    print(row)

# 删除指定 trade（例如 id=123）
cursor.execute("DELETE FROM trades WHERE id=?", (123,))

conn.commit()
conn.close()

```

再重启bot后查看，数据显示已经正常，CRV/USDT的币值对挂单被删除。
```shell
docker compose up -d
```

![](../../../static/img/Pasted%20image%2020250818075800.png)

