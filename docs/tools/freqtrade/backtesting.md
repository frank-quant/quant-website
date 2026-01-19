---
id: backtesting
title: 回测（Backtesting）
sidebar_label: 回测
description: Freqtrade 官方“Backtesting”页面中文翻译，保留原始结构、提示框与命令参考。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/backtesting/`](https://www.freqtrade.io/en/stable/backtesting/)

## 概览

回测用于在历史数据上验证策略表现。开始前需准备可用的历史数据（详见“数据下载”）。

:::note 数据准备
请先下载对应交易所与交易对的历史 K 线数据，并与策略所需的时间周期一致。
:::

## 常用命令

示例（在 Docker 中回测示例策略）：

```bash
docker compose run --rm freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20190801-20191001 -i 5m
```

## 命令参考（节选）

```bash
usage: freqtrade backtesting [-h] [-v] [--no-color] [--logfile FILE] [-V]
                             [-c PATH] [-d PATH] [--userdir PATH] [-s NAME]
                             [--strategy-path PATH]
                             [--recursive-strategy-search]
                             [--freqaimodel NAME] [--freqaimodel-path PATH]
                             [-i TIMEFRAME] [--timerange TIMERANGE]
                             [--data-format-ohlcv {json,jsongz,feather,parquet}]
                             [--max-open-trades INT]
                             [--stake-amount STAKE_AMOUNT] [--fee FLOAT]
                             [-p PAIRS [PAIRS ...]] [--eps]
                             [--enable-protections]
                             [--dry-run-wallet DRY_RUN_WALLET]
                             [--timeframe-detail TIMEFRAME_DETAIL]
                             [--strategy-list STRATEGY_LIST [STRATEGY_LIST ...]]
                             [--export {none,trades,signals}]
                             [--export-filename PATH]
                             [--breakdown {day,week,month,year} [{day,week,month,year} ...]]
                             [--cache {none,day,week,month}]
                             [--freqai-backtest-live-models]
```

### 关键选项（节选）

- `-i, --timeframe`：时间周期（如 `1m`、`5m`、`30m`、`1h`、`1d`）
- `--timerange`：数据时间范围
- `--data-format-ohlcv`：OHLCV 数据格式（默认 `feather`）
- `--max-open-trades`：覆盖配置中的 `max_open_trades`
- `--stake-amount`：覆盖配置中的 `stake_amount`
- `--fee`：手续费比例（进出场各应用一次）
- `-p, --pairs`：限定交易对列表（空格分隔）
- `--enable-protections`：启用保护（会显著降低速度）
- `--export` 与 `--export-filename`：导出交易/信号
- `--strategy-list`：一次性回测多策略

:::tip 常见实践
- 使用较长时间范围评估稳健性
- 与干跑（Dry-run）结果对照
- 结合可视化（plot）与明细数据分析
:::

## 下一步

- 超参数优化（Hyperopt）
- 交易保护与风险控制
- FreqAI 辅助建模


