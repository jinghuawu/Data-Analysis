# 数据分析 / Data Analysis

## 🌐 [点击这里，直接打开在线网页 →](https://jinghuawu.github.io/Data-Analysis/)

**在线使用地址：<https://jinghuawu.github.io/Data-Analysis/>**

[![打开数据分析网页](https://img.shields.io/badge/立即使用-数据分析网页-66528c?style=for-the-badge&logo=github)](https://jinghuawu.github.io/Data-Analysis/)

在浏览器中使用，无需安装。支持数据导入与整理、分组投图分析和矿物估测。

### 频率统计

1. 打开“投图分析”，在 X 轴或 Y 轴设置框的“单位”下方勾选“频率统计”。X 轴统计显示在散点图上侧，Y 轴统计显示在右侧。
2. 各分组沿用散点图例颜色。点击频率曲线、直方图或左侧“设置…”可打开对应轴的设置。
3. 可切换正态 / KDE、频数 / 相对频率，单独开关曲线与直方图，调整分箱步长、起点、KDE 带宽、填充透明度、线宽、坐标范围、刻度间隔、分格数、图幅大小和字号。
4. SVG 和 PNG 导出包含已启用的频率图。

统计使用当前勾选且 X、Y 均有效的投图样品，按当前“是否分组”设置计算。相对频率为每箱样本数除以本组有效样本数。曲线按概率密度 × 分箱步长缩放；频数模式再乘本组样本数。所有分组共用分箱边界，缩放坐标范围只裁切显示。LOG10 轴按原始数值统计。正态拟合采用样本标准差；单一样本或常数分组提示无法拟合，可改用 KDE。KDE 自动带宽采用 Silverman 规则，常数分组使用分箱步长作为尺度。

### 本地运行与验证

```bash
python -m http.server 8000
node --test tests/frequency.test.cjs
```

然后在浏览器打开 `http://localhost:8000`。

运行包含设置窗口、分组切换及导出的 DOM 回归测试：`npm install && npm test`。
