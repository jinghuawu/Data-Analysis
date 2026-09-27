(() => {
  const $ = id => document.getElementById(id);
  const ELEMENTS = ['SiO2', 'Al2O3', 'FeO', 'TiO2', 'Na2O', 'K2O'];
  const MINERAL_COLS = ['Mineral', 'SiO2', 'Al2O3', 'MgO', 'FeO', 'TiO2', 'CaO', 'Na2O', 'K2O', 'DX miner-melt'];
  const MINERALS = [
    ['Quartz', 100, 0, 0, 0, 0, 0, 0, 0, 0],
    ['Albite', 69, 19, 0, 0, 0, 0, 12, 0, 0],
    ['K-feldspar', 65, 18, 0, 0, 0, 0, 0, 17, 0],
    ['Biotite', 35, 10, 0, 42, 0, 0, 0, 9, 0],
    ['Muscovite', 45, 38, 0, 0, 0, 0, 0, 12, 0],
    ['Ilmenite', 0, 0, 0, 47, 53, 0, 0, 0, 0]
  ];
  const CONSTRAINTS = [
    ['SiO2', 65, 80], ['Al2O3', 8, 16], ['FeO', 0, 4],
    ['TiO2', 0, 1], ['Na2O', 2, 5], ['K2O', 4, 6]
  ];
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
  const mineralRows = MINERALS.map(row => Object.fromEntries(MINERAL_COLS.map((col, i) => [col, row[i]])));
  const constraintRows = CONSTRAINTS.map(row => ({ Element: row[0], Min: row[1], Max: row[2] }));
  let worker = null;
  let output = null;
  let csvParts = [];
  let activeConfig = null;

  function setStatus(message, kind = '') {
    $('mineralStatus').textContent = message;
    $('mineralStatus').className = 'mineral-status' + (kind ? ' ' + kind : '');
  }
  function setRunning(running) {
    $('mineralRun').disabled = running;
    $('mineralCancel').disabled = !running;
    $('mineralProgressWrap').hidden = !running;
    if (!running) $('mineralRun').textContent = '运行模拟 ↗';
  }
  function clearOutput() {
    output = null;
    csvParts = [];
    activeConfig = null;
    ['mineralDownload', 'mineralToPreview', 'mineralXSelect', 'mineralYSelect', 'mineralRefresh']
      .forEach(id => { $(id).disabled = true; });
    $('mineralResultHint').textContent = '等待运行';
    $('mineralResultTable').replaceChildren();
    $('mineralTableNote').textContent = '';
    $('mineralChart').innerHTML = '<div class="mineral-chart-empty">运行后在这里查看散点图</div>';
    $('mineralPlotTitle').textContent = '';
    $('mineralPlotNote').textContent = '请先在配置页运行模拟。';
  }
  function invalidate() {
    if (worker) {
      worker.terminate();
      worker = null;
      setRunning(false);
    }
    clearOutput();
    setStatus('参数已修改。运行模拟以生成新结果。');
  }
  function cellInput(row, key, i, kind) {
    const label = kind === 'mineral' ? `第 ${i + 1} 行 ${key}` : `第 ${i + 1} 条约束 ${key}`;
    const common = `data-kind="${kind}" data-index="${i}" data-key="${escapeHtml(key)}" aria-label="${escapeHtml(label)}"`;
    if (key === 'Element') return `<select ${common}>${ELEMENTS.map(el => `<option value="${el}" ${row[key] === el ? 'selected' : ''}>${el}</option>`).join('')}</select>`;
    return `<input ${common} type="${key === 'Mineral' ? 'text' : 'number'}" ${key === 'Mineral' ? 'maxlength="60"' : 'step="any"'} value="${escapeHtml(row[key])}">`;
  }
  function renderEditors() {
    $('mineralTable').innerHTML = `<thead><tr><th>选</th>${MINERAL_COLS.map(col => `<th>${escapeHtml(col)}</th>`).join('')}</tr></thead><tbody>${mineralRows.map((row, i) =>
      `<tr><td><input type="radio" name="mineralRow" aria-label="选择第 ${i + 1} 种矿物" value="${i}"></td>${MINERAL_COLS.map(key => `<td>${cellInput(row, key, i, 'mineral')}</td>`).join('')}</tr>`
    ).join('')}</tbody>`;
    $('constraintTable').innerHTML = `<thead><tr><th>选</th><th>Element</th><th>Min</th><th>Max</th></tr></thead><tbody>${constraintRows.map((row, i) =>
      `<tr><td><input type="radio" name="constraintRow" aria-label="选择第 ${i + 1} 条约束" value="${i}"></td>${['Element', 'Min', 'Max'].map(key => `<td>${cellInput(row, key, i, 'constraint')}</td>`).join('')}</tr>`
    ).join('')}</tbody>`;
  }
  for (const id of ['mineralTable', 'constraintTable']) {
    $(id).addEventListener('input', event => {
      const el = event.target;
      if (!el.dataset.kind) return;
      const rows = el.dataset.kind === 'mineral' ? mineralRows : constraintRows;
      rows[Number(el.dataset.index)][el.dataset.key] = el.value;
      invalidate();
    });
    $(id).addEventListener('change', event => {
      const el = event.target;
      if (!el.dataset.kind || el.tagName !== 'SELECT') return;
      constraintRows[Number(el.dataset.index)][el.dataset.key] = el.value;
      invalidate();
    });
  }
  $('mineralAdd').onclick = () => {
    const row = Object.fromEntries(MINERAL_COLS.map(key => [key, key === 'Mineral' ? `Mineral ${mineralRows.length + 1}` : 0]));
    mineralRows.push(row); renderEditors(); invalidate();
  };
  $('constraintAdd').onclick = () => {
    constraintRows.push({ Element: 'SiO2', Min: 0, Max: 0 }); renderEditors(); invalidate();
  };
  function deleteSelected(table, rows, label) {
    const radio = $(table).querySelector('input[type=radio]:checked');
    if (!radio) { setStatus(`请先选中要删除的${label}。`, 'error'); return; }
    rows.splice(Number(radio.value), 1);
    renderEditors(); invalidate();
  }
  $('mineralDelete').onclick = () => deleteSelected('mineralTable', mineralRows, '矿物');
  $('constraintDelete').onclick = () => deleteSelected('constraintTable', constraintRows, '条件');

  const elOptions = ELEMENTS.map(el => `<option value="${el}">${el}</option>`).join('');
  $('mineralCorrX').innerHTML = elOptions;
  $('mineralCorrY').innerHTML = elOptions;
  $('mineralCorrX').value = 'SiO2';
  $('mineralCorrY').value = 'Na2O';
  function toggleCorr() {
    const enabled = $('mineralUseCorr').checked;
    $('mineralCorrFields').classList.toggle('is-disabled', !enabled);
    $('mineralCorrFields').querySelectorAll('input,select').forEach(el => { el.disabled = !enabled; });
  }
  $('mineralUseCorr').onchange = () => { toggleCorr(); invalidate(); };
  ['mineralCorrX', 'mineralCorrY', 'mineralSlope', 'mineralIntercept', 'mineralTolerance', 'mineralIterations', 'mineralSeed']
    .forEach(id => { $(id).addEventListener('input', invalidate); $(id).addEventListener('change', invalidate); });

  function numberValue(value, label) {
    if (String(value).trim() === '' || !Number.isFinite(Number(value))) throw new Error(`${label}必须是有效数字。`);
    return Number(value);
  }
  function readConfig() {
    if (!mineralRows.length) throw new Error('请至少保留一种矿物。');
    const minerals = mineralRows.map((row, i) => {
      const name = String(row.Mineral).trim();
      if (!name) throw new Error(`第 ${i + 1} 种矿物需要名称。`);
      return Object.fromEntries(MINERAL_COLS.map(key =>
        [key, key === 'Mineral' ? name : numberValue(row[key], `${name} 的 ${key}`)]));
    });
    if (new Set(minerals.map(row => row.Mineral)).size !== minerals.length) throw new Error('矿物名称不能重复。');
    const constraints = constraintRows.map((row, i) => {
      const min = numberValue(row.Min, `第 ${i + 1} 条约束的 Min`);
      const max = numberValue(row.Max, `第 ${i + 1} 条约束的 Max`);
      if (min > max) throw new Error(`第 ${i + 1} 条约束的 Min 不能大于 Max。`);
      return { Element: row.Element, Min: min, Max: max };
    });
    const iterations = numberValue($('mineralIterations').value, '模拟次数');
    if (!Number.isInteger(iterations) || iterations < 1000 || iterations > 10000000) throw new Error('模拟次数须为 1,000–10,000,000 的整数。');
    const seed = numberValue($('mineralSeed').value, '随机种子');
    if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) throw new Error('随机种子须为 0–4,294,967,295 的整数。');
    const enabled = $('mineralUseCorr').checked;
    const corr = {
      enabled, x: $('mineralCorrX').value, y: $('mineralCorrY').value,
      slope: enabled ? numberValue($('mineralSlope').value, '目标斜率') : 0,
      intercept: enabled ? numberValue($('mineralIntercept').value, '截距') : 0,
      tolerance: enabled ? numberValue($('mineralTolerance').value, '容差') : 0
    };
    if (corr.tolerance < 0) throw new Error('容差不能为负数。');
    return { iterations, seed, minerals, constraints, corr };
  }
  function csvHeader(value) {
    let s = String(value);
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function renderPreview() {
    if (!output) return;
    $('mineralResultTable').innerHTML = `<thead><tr>${output.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}</tr></thead><tbody>${output.preview.map(row =>
      `<tr>${row.map(value => `<td>${Number(value).toFixed(4)}</td>`).join('')}</tr>`
    ).join('')}</tbody>`;
    $('mineralTableNote').textContent = `表格显示前 ${output.preview.length} 组；CSV 包含全部 ${output.valid.toLocaleString('zh-CN')} 组的完整精度数值。`;
  }
  function finishRun(message) {
    worker?.terminate(); worker = null; setRunning(false);
    if (message.valid === 0) {
      setStatus('没有找到符合条件的组合。请放宽全岩约束或调整趋势容差。', 'error');
      $('mineralResultHint').textContent = '0 组有效结果';
      csvParts = [];
      return;
    }
    output = { ...message, columns: output.columns };
    $('mineralResultHint').textContent = `${message.valid.toLocaleString('zh-CN')} 组有效结果`;
    setStatus(`模拟成功！\n有效组数：${message.valid.toLocaleString('zh-CN')} / ${activeConfig.iterations.toLocaleString('zh-CN')}\nBulk DX 均值：${message.meanDx.toFixed(4)} · 随机种子：${activeConfig.seed}`, 'success');
    renderPreview();
    const options = output.columns.map((col, i) => `<option value="${i}">${escapeHtml(col)}</option>`).join('');
    $('mineralXSelect').innerHTML = options;
    $('mineralYSelect').innerHTML = options;
    $('mineralXSelect').value = '0';
    $('mineralYSelect').value = String(output.columns.length - 1);
    ['mineralDownload', 'mineralToPreview', 'mineralXSelect', 'mineralYSelect', 'mineralRefresh']
      .forEach(id => { $(id).disabled = false; });
    renderPlot();
  }
  $('mineralRun').onclick = () => {
    let config;
    try { config = readConfig(); }
    catch (error) { setStatus(error.message, 'error'); return; }
    if (worker) worker.terminate();
    clearOutput();
    activeConfig = config;
    setRunning(true);
    $('mineralProgress').value = 0;
    $('mineralProgressText').textContent = '准备中…';
    $('mineralRun').textContent = '正在计算…';
    setStatus('后台计算中，可以继续查看页面。');
    try {
      worker = new Worker('mineral-worker.js?v=1');
      worker.onmessage = ({ data }) => {
        if (data.type === 'start') {
          output = { columns: data.columns };
          csvParts.push('\ufeff' + data.columns.map(csvHeader).join(',') + '\r\n');
        } else if (data.type === 'csv') {
          csvParts.push(data.content);
        } else if (data.type === 'progress') {
          $('mineralProgress').value = data.completed / config.iterations * 100;
          $('mineralProgressText').textContent = `${Math.round(data.completed / config.iterations * 100)}% · ${data.valid.toLocaleString('zh-CN')} 组有效`;
        } else if (data.type === 'done') {
          finishRun(data);
        } else if (data.type === 'error') {
          worker?.terminate(); worker = null; setRunning(false); clearOutput();
          setStatus(`模拟出错：${data.message}`, 'error');
        }
      };
      worker.onerror = event => {
        worker?.terminate(); worker = null; setRunning(false); clearOutput();
        setStatus(`模拟出错：${event.message || '后台线程无法启动'}`, 'error');
      };
      worker.postMessage(config);
    } catch (error) {
      worker?.terminate(); worker = null; setRunning(false); clearOutput();
      setStatus(`无法启动模拟：${error.message}`, 'error');
    }
  };
  $('mineralCancel').onclick = () => {
    worker?.terminate(); worker = null; setRunning(false); clearOutput();
    setStatus('已取消模拟。');
  };
  $('mineralDownload').onclick = () => {
    if (!output?.valid) return;
    const url = URL.createObjectURL(new Blob(csvParts, { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mineral-estimation-results.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  function showTab(name) {
    for (const [tabId, paneId] of [['mineralConfigTab', 'mineralConfig'], ['mineralPreviewTab', 'mineralPreview']]) {
      const active = paneId === name;
      $(tabId).classList.toggle('active', active);
      $(tabId).setAttribute('aria-selected', String(active));
      $(paneId).classList.toggle('active', active);
      $(paneId).hidden = !active;
    }
    if (name === 'mineralPreview') renderPlot();
  }
  $('mineralConfigTab').onclick = () => showTab('mineralConfig');
  $('mineralPreviewTab').onclick = () => showTab('mineralPreview');
  $('mineralToPreview').onclick = () => showTab('mineralPreview');
  $('mineralRefresh').onclick = renderPlot;

  function renderPlot() {
    if (!output?.valid) return;
    const x = Number($('mineralXSelect').value), y = Number($('mineralYSelect').value);
    if (!Number.isInteger(x) || !Number.isInteger(y)) return;
    const points = output.plotSample.map(row => [row[x], row[y]]);
    let xmin = Math.min(...points.map(p => p[0])), xmax = Math.max(...points.map(p => p[0]));
    let ymin = Math.min(...points.map(p => p[1])), ymax = Math.max(...points.map(p => p[1]));
    const xpad = (xmax - xmin || Math.abs(xmin) || 1) * .06;
    const ypad = (ymax - ymin || Math.abs(ymin) || 1) * .08;
    xmin -= xpad; xmax += xpad; ymin -= ypad; ymax += ypad;
    const fmt = value => Number(value.toPrecision(4)).toString();
    const left = 84, right = 872, top = 28, bottom = 407;
    const plotX = value => left + (value - xmin) / (xmax - xmin) * (right - left);
    const plotY = value => bottom - (value - ymin) / (ymax - ymin) * (bottom - top);
    let grid = '';
    for (let i = 0; i <= 5; i++) {
      const px = left + (right - left) * i / 5;
      const py = bottom - (bottom - top) * i / 5;
      grid += `<line x1="${px}" y1="${top}" x2="${px}" y2="${bottom}" stroke="#e7edf1"/>`;
      grid += `<line x1="${left}" y1="${py}" x2="${right}" y2="${py}" stroke="#e7edf1"/>`;
      grid += `<text x="${px}" y="432" text-anchor="middle" fill="#657482" font-size="12">${fmt(xmin + (xmax - xmin) * i / 5)}</text>`;
      grid += `<text x="70" y="${py + 4}" text-anchor="end" fill="#657482" font-size="12">${fmt(ymin + (ymax - ymin) * i / 5)}</text>`;
    }
    const circles = points.map(([a, b]) => `<circle cx="${plotX(a).toFixed(2)}" cy="${plotY(b).toFixed(2)}" r="2.8" fill="#756393" fill-opacity=".32"/>`).join('');
    $('mineralChart').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" role="img" aria-label="${escapeHtml(output.columns[x])} 对 ${escapeHtml(output.columns[y])} 的有效组合散点图"><rect width="900" height="500" fill="#fff"/>${grid}<line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#758894"/><line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="#758894"/><g clip-path="url(#mineralClip)">${circles}</g><defs><clipPath id="mineralClip"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"/></clipPath></defs><text x="478" y="480" text-anchor="middle" fill="#253541" font-size="16">${escapeHtml(output.columns[x])}</text><text transform="translate(22 218) rotate(-90)" text-anchor="middle" fill="#253541" font-size="16">${escapeHtml(output.columns[y])}</text></svg>`;
    $('mineralPlotTitle').textContent = `${output.columns[x]} vs ${output.columns[y]}`;
    $('mineralPlotNote').textContent = `展示 ${points.length.toLocaleString('zh-CN')} / ${output.valid.toLocaleString('zh-CN')} 组有效结果${output.valid > points.length ? '（固定种子的均匀抽样）' : ''}；下载的 CSV 包含全部结果。`;
  }
  $('mineralXSelect').onchange = renderPlot;
  $('mineralYSelect').onchange = renderPlot;
  renderEditors();
  toggleCorr();
})();
