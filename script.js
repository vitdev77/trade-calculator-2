/* === НАЧАЛО ЧАСТИ 1 === */

let currentTab = localStorage.getItem("bybit_tab") || "futures";
let currentSide = localStorage.getItem("bybit_side") || "Long";
let currentOrderType = localStorage.getItem("bybit_order_type") || "limit";
let currentTheme = localStorage.getItem("bybit_theme") || "dark";

// Кошелек coinConfig с торговыми параметрами Bybit
const coinConfig = {
  BTCUSDT: { price: 79670, priceDecimals: 0, qtyDecimals: 5, recLeverage: 20 },
  ETHUSDT: { price: 2510, priceDecimals: 0, qtyDecimals: 4, recLeverage: 10 },
  TONUSDT: { price: 5.345, priceDecimals: 3, qtyDecimals: 2, recLeverage: 3 },
  XAUTUSDT: {
    price: 4582.6,
    priceDecimals: 2,
    qtyDecimals: 4,
    recLeverage: 10,
  },
  SOLUSDT: { price: 106.45, priceDecimals: 2, qtyDecimals: 3, recLeverage: 5 },
  ZECUSDT: { price: 802.84, priceDecimals: 2, qtyDecimals: 3, recLeverage: 3 },
  MNTUSDT: { price: 0.5231, priceDecimals: 4, qtyDecimals: 2, recLeverage: 3 },
};

const TAKER_FEE = 0.00055;
const MMR = 0.004;

function saveToStorage() {
  localStorage.setItem("bybit_tab", currentTab);
  localStorage.setItem("bybit_side", currentSide);
  localStorage.setItem("bybit_order_type", currentOrderType);
  localStorage.setItem("bybit_theme", currentTheme);
  localStorage.setItem(
    "bybit_balance",
    document.getElementById("balance").value,
  );
  localStorage.setItem("bybit_pair", document.getElementById("pair").value);
  localStorage.setItem(
    "bybit_entry",
    document.getElementById("entry-price").value,
  );
}

// Управление темами оформления терминала
function toggleTheme() {
  const btn = document.getElementById("theme-toggle-btn");
  if (currentTheme === "dark") {
    currentTheme = "light";
    document.documentElement.classList.add("light-theme");
    // ИСПРАВЛЕНИЕ: Утвержденное геометрическое солнце Google Translate (r=5, stroke-width=2, воздушный зазор)
    btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:var(--text-muted);stroke-width:2;stroke-linecap:round;"><circle cx="12" cy="12" r="5" fill="var(--text-muted)" stroke="none"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="23" y2="12"/><line x1="4.93" y1="4.93" x2="6.03" y2="6.03"/><line x1="17.97" y1="17.97" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="6.03" y2="17.97"/><line x1="17.97" y1="6.03" x2="19.07" y2="4.93"/></svg>`;
  } else {
    currentTheme = "dark";
    document.documentElement.classList.remove("light-theme");
    btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text-muted);"><path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992V3z"/></svg>`;
  }
  saveToStorage();
}
/* === КОНЕЦ ЧАСТИ 1 === */
/* === НАЧАЛО ЧАСТИ 2 === */

function loadFromStorage() {
  document.documentElement.classList.remove("init-spot-mode");
  const btn = document.getElementById("theme-toggle-btn");

  if (currentTheme === "light") {
    document.documentElement.classList.add("light-theme");
    if (btn)
      // ИСПРАВЛЕНИЕ: Утвержденное геометрическое солнце Google Translate при стартовой инициализации темы
      btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:var(--text-muted);stroke-width:2;stroke-linecap:round;"><circle cx="12" cy="12" r="5" fill="var(--text-muted)" stroke="none"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="23" y2="12"/><line x1="4.93" y1="4.93" x2="6.03" y2="6.03"/><line x1="17.97" y1="17.97" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="6.03" y2="17.97"/><line x1="17.97" y1="6.03" x2="19.07" y2="4.93"/></svg>`;
  } else {
    document.documentElement.classList.remove("light-theme");
    if (btn)
      btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text-muted);"><path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992V3z"/></svg>`;
  }

  if (localStorage.getItem("bybit_pair")) {
    document.getElementById("pair").value = localStorage.getItem("bybit_pair");
  }
  if (localStorage.getItem("bybit_balance")) {
    document.getElementById("balance").value =
      localStorage.getItem("bybit_balance");
  }

  const selectedPair = document.getElementById("pair").value;
  if (localStorage.getItem("bybit_entry")) {
    document.getElementById("entry-price").value =
      localStorage.getItem("bybit_entry");
  } else {
    document.getElementById("entry-price").value =
      coinConfig[selectedPair].price;
  }

  restoreTabsVisualOnly();
  calculate();
}

function restoreTabsVisualOnly() {
  document.getElementById("tab-spot").classList.remove("active");
  document.getElementById("tab-futures").classList.remove("active");
  document.getElementById(`tab-${currentTab}`).classList.add("active");

  document.getElementById("side-long").classList.remove("active");
  document.getElementById("side-short").classList.remove("active");
  if (currentSide === "Long") {
    document.getElementById("side-long").classList.add("active");
  } else {
    document.getElementById("side-short").classList.add("active");
  }

  document.getElementById("order-limit").classList.remove("active");
  document.getElementById("order-market").classList.remove("active");
  document.getElementById(`order-${currentOrderType}`).classList.add("active");

  const entryLabel = document.getElementById("entry-label");
  if (currentOrderType === "market") {
    entryLabel.innerText = "Текущая цена Bybit (USDT)";
  } else {
    entryLabel.innerText = "Цена входа (USDT)";
  }

  const sideItemWrapper = document.getElementById("side-item-wrapper");
  const liqSection = document.getElementById("liq-section");
  const resLeverageSection = document.getElementById("res-leverage-section");

  if (currentTab === "futures") {
    sideItemWrapper.classList.remove("fade-out");
    if (liqSection) liqSection.classList.remove("disabled-element");
    if (resLeverageSection)
      resLeverageSection.classList.remove("disabled-element");
  } else {
    sideItemWrapper.classList.add("fade-out");
    if (liqSection) liqSection.classList.add("disabled-element");
    if (resLeverageSection)
      resLeverageSection.classList.add("disabled-element");
  }
}

function switchTab(tab) {
  currentTab = tab;
  restoreTabsVisualOnly();
  if (tab === "spot") setSide("Long");
  saveToStorage();
  calculate();
  initWebSocketInformer();
}

function setSide(side) {
  if (currentTab === "spot" && side === "Short") return;
  currentSide = side;
  document.getElementById("side-long").classList.remove("active");
  document.getElementById("side-short").classList.remove("active");
  if (side === "Long") {
    document.getElementById("side-long").classList.add("active");
  } else {
    document.getElementById("side-short").classList.add("active");
  }
  saveToStorage();
  calculate();
}

function setOrderType(type) {
  currentOrderType = type;
  document.getElementById("order-limit").classList.remove("active");
  document.getElementById("order-market").classList.remove("active");
  document.getElementById(`order-${type}`).classList.add("active");
  const entryInput = document.getElementById("entry-price");
  const entryLabel = document.getElementById("entry-label");
  const selectedPair = document.getElementById("pair").value;

  if (type === "market") {
    entryLabel.innerText = "Текущая цена Bybit (USDT)";
    entryInput.value = coinConfig[selectedPair].price;
  } else {
    entryLabel.innerText = "Цена входа (USDT)";
    entryInput.value = coinConfig[selectedPair].price;
  }

  saveToStorage();
  calculate();
}
/* === КОНЕЦ ЧАСТИ 2 === */
/* === НАЧАЛО ЧАСТИ 3 === */

function formatSmartValue(value, decimals) {
  if (value === "—" || value === undefined) return "—";
  if (decimals === 0) return Math.round(value).toString();
  return value.toFixed(decimals);
}

// Глобальный массив для хранения записей журнала
let tradingLog = JSON.parse(localStorage.getItem("bybit_trading_log")) || [];

function calculate() {
  const balance = parseFloat(document.getElementById("balance").value) || 0;
  const entryPrice =
    parseFloat(document.getElementById("entry-price").value) || 0;
  const selectedPair = document.getElementById("pair").value;

  if (balance <= 0 || entryPrice <= 0) return;

  const analyticsBalanceEl = document.getElementById("res-analytics-balance");
  if (analyticsBalanceEl) {
    analyticsBalanceEl.innerText = `$${balance.toFixed(2)}`;
  }

  const config = coinConfig[selectedPair] || {
    priceDecimals: 2,
    qtyDecimals: 2,
    recLeverage: 1,
  };

  const leverage = currentTab === "futures" ? config.recLeverage : 1;
  const cost = balance / 5;
  const qty = (cost * leverage) / entryPrice;
  const totalVolume = cost * leverage;
  const freeMargin = balance - cost;
  const remainingTrades = Math.floor(freeMargin / cost);

  document.getElementById("res-margin-free").innerText =
    `$${freeMargin.toFixed(2)}`;
  document.getElementById("margin-trades").innerText =
    `Запас на ${remainingTrades} сделки`;

  const riskAmount = balance * 0.02;
  document.getElementById("risk-cash").innerText = `$${riskAmount.toFixed(2)}`;

  let sl = 0,
    tp = 0,
    liq = "—",
    pctChangeSL = 0,
    pctChangeTP = 0,
    cashLoss = riskAmount,
    cashProfit = riskAmount * 2;

  if (currentTab === "futures") {
    const rPct = 0.02;
    const entryFee = currentOrderType === "limit" ? 0.0002 : 0.00055;
    const exitFeeSL = 0.00055;
    const exitFeeTP = 0.00055;

    if (currentSide === "Long") {
      sl = entryPrice * ((1 - rPct / 5 - entryFee) / (1 + exitFeeSL));
      tp = entryPrice * ((1 + (2 * rPct) / 5 + entryFee) / (1 - exitFeeTP));
      liq = entryPrice * (1 - 1 / leverage + MMR);

      pctChangeSL = ((sl - entryPrice) / entryPrice) * 100;
      pctChangeTP = ((tp - entryPrice) / entryPrice) * 100;
    } else {
      sl = entryPrice * ((1 + rPct / 5 + entryFee) / (1 - exitFeeSL));
      tp = entryPrice * ((1 - (2 * rPct) / 5 - entryFee) / (1 + exitFeeTP));
      liq = entryPrice * (1 + 1 / leverage - MMR);

      pctChangeSL = ((entryPrice - sl) / entryPrice) * 100;
      pctChangeTP = ((entryPrice - tp) / entryPrice) * 100;
    }
  } else {
    const spotFee = 0.001;
    const spotSlippage = currentOrderType === "market" ? 0.0005 : 0;

    sl = entryPrice * (1 - riskAmount / cost - spotFee * 2 - spotSlippage);
    tp = entryPrice * (1 + (riskAmount * 2) / cost + spotFee * 2);
    liq = "—";

    pctChangeSL = ((sl - entryPrice) / entryPrice) * 100;
    pctChangeTP = ((tp - entryPrice) / entryPrice) * 100;
  }

  if (sl < 0) sl = 0;
  if (tp < 0) tp = 0;
  if (liq !== "—" && liq < 0) liq = 0;

  document.getElementById("res-volume-badge").innerText =
    `$${totalVolume.toFixed(2)}`;
  document.getElementById("res-volume-copy").innerText = totalVolume.toFixed(2);

  if (currentTab === "futures") {
    const levCopyEl = document.getElementById("res-leverage-copy");
    if (levCopyEl) levCopyEl.innerText = Math.round(leverage).toString();
  } else {
    const levCopyEl = document.getElementById("res-leverage-copy");
    if (levCopyEl) levCopyEl.innerText = "—";
  }

  document.getElementById("pct-tp").innerText =
    `${pctChangeTP > 0 ? "+" : ""}${pctChangeTP.toFixed(2)}%`;
  document.getElementById("pct-sl").innerText =
    `${pctChangeSL > 0 ? "-" : ""}${Math.abs(pctChangeSL).toFixed(2)}%`;
  document.getElementById("cash-tp").innerText = `(+$${cashProfit.toFixed(2)})`;
  document.getElementById("cash-sl").innerText = `(-$${cashLoss.toFixed(2)})`;
  document.getElementById("res-cost").innerText = cost.toFixed(2);
  document.getElementById("res-qty").innerText = qty.toFixed(
    config.qtyDecimals,
  );
  document.getElementById("res-tp").innerText = formatSmartValue(
    tp,
    config.priceDecimals,
  );
  document.getElementById("res-sl").innerText = formatSmartValue(
    sl,
    config.priceDecimals,
  );

  if (currentTab === "futures" && liq !== "—") {
    document.getElementById("res-liq").innerText = formatSmartValue(
      liq,
      config.priceDecimals,
    );
  } else {
    document.getElementById("res-liq").innerText = "—";
  }

  renderLogTable();
}
/* === КОНЕЦ ЧАСТИ 3 === */
/* === НАЧАЛО ЧАСТИ 4 === */

function pushToLogManual() {
  const selectedPair = document.getElementById("pair").value;
  const pairText =
    document.getElementById("pair").options[
      document.getElementById("pair").selectedIndex
    ].text;
  const entryPrice = document.getElementById("entry-price").value;
  const tp = document.getElementById("res-tp").innerText;
  const sl = document.getElementById("res-sl").innerText;
  const volume = document.getElementById("res-volume-copy").innerText;
  const qty = document.getElementById("res-qty").innerText;
  const inputBalance =
    parseFloat(document.getElementById("balance").value) || 0;

  if (tp === "—" || sl === "—" || !entryPrice) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const currentLeverage = coinConfig[selectedPair]
    ? coinConfig[selectedPair].recLeverage
    : 1;

  const logItem = {
    id: Date.now(),
    isMuted: false,
    date: dateStr,
    time: timeStr,
    leverage: currentTab === "futures" ? currentLeverage : "",
    market: currentTab === "futures" ? "Фьючерсы" : "Спот",
    sideClass:
      currentTab === "futures"
        ? `row-side-${currentSide.toLowerCase()}`
        : "row-side-long",
    badgeClass:
      currentTab === "futures"
        ? `log-badge-${currentSide.toLowerCase()}`
        : "log-badge-long",
    pair: pairText,
    type: currentOrderType === "limit" ? "Лимит" : "Рынок",
    entry: entryPrice,
    tp: tp,
    sl: sl,
    dep: `$${inputBalance.toFixed(2)}`,
    details: `$${volume} / ${qty}`,
  };

  if (tradingLog.length > 0) {
    const last = tradingLog[0];
    if (
      last.pair === logItem.pair &&
      last.market === logItem.market &&
      last.entry === logItem.entry &&
      last.sl === logItem.sl
    ) {
      alert("Этот расчет уже зафиксирован в журнале!");
      return;
    }
  }

  tradingLog.unshift(logItem);
  if (tradingLog.length > 50) tradingLog.pop();

  localStorage.setItem("bybit_trading_log", JSON.stringify(tradingLog));
  renderLogTable();

  const addBtn = document.getElementById("add-to-log-btn");
  const btnText = document.getElementById("add-to-log-text");
  const btnSvg = document.getElementById("add-to-log-svg");

  if (addBtn && btnText && btnSvg) {
    const oldText = btnText.innerText;
    const oldSvgPath = btnSvg.innerHTML;

    btnText.innerText = "Расчет зафиксирован в дневник!";
    btnSvg.innerHTML = `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>`;
    addBtn.style.background = "rgba(3, 194, 126, 0.15)";
    addBtn.style.borderColor = "var(--c-green)";
    addBtn.style.color = "var(--c-green)";
    btnSvg.style.fill = "var(--c-green)";

    setTimeout(() => {
      btnText.innerText = oldText;
      btnSvg.innerHTML = oldSvgPath;
      addBtn.style.background = "rgba(255, 177, 26, 0.15)";
      addBtn.style.borderColor = "var(--c-king)";
      addBtn.style.color = "var(--c-king)";
      btnSvg.style.fill = "var(--c-king)";
    }, 1200);
  }
}

function toggleMuteLogRow(id) {
  tradingLog = tradingLog.map((item) => {
    if (item.id === id) item.isMuted = !item.isMuted;
    return item;
  });
  localStorage.setItem("bybit_trading_log", JSON.stringify(tradingLog));
  renderLogTable();
}

function renderLogTable() {
  const tbody = document.getElementById("log-table-body");
  const counter = document.getElementById("log-counter");
  if (!tbody || !counter) return;

  counter.innerText = tradingLog.length.toString() + " записей";
  tbody.innerHTML = "";

  tradingLog.forEach((item) => {
    const tr = document.createElement("tr");
    tr.className = item.sideClass + (item.isMuted ? " muted-row" : "");
    const displayDate = item.date || "—";
    const leverageMarkup = item.leverage
      ? `${item.leverage}<span style="opacity:0.5; font-size:9px; margin-left:1px; font-weight:700; text-transform:lowercase;">x</span>`
      : "";
    const displayDep = item.dep || "—";

    tr.innerHTML = `
      <td>
        <div style="display:flex; flex-direction:column; line-height:1.3; font-size:11px;">
          <span style="color:var(--text-main); font-weight:700;">${displayDate}</span>
          <span style="color:var(--text-muted); font-size:9px; font-weight:500;">${item.time}</span>
        </div>
      </td>
      <td style="color:var(--text-main); font-weight:700;">${displayDep}</td>
      <td>${item.pair}</td>
      <td style="color:var(--text-main); font-weight:700;">${leverageMarkup}</td>
      <td class="${item.badgeClass}">${item.market}</td>
      <td>${item.type}</td>
      <td>${item.entry}</td>
      <td style="color:var(--c-green);">${item.tp}</td>
      <td style="color:var(--c-red);">${item.sl}</td>
      <td style="color:var(--c-orange); font-size:10px;">${item.details}</td>
      <td style="text-align:center;">
        <button class="log-row-mute-btn" onclick="toggleMuteLogRow(${item.id})" title="Приглушить/Активировать строку ордера">
          <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
/* === КОНЕЦ ЧАСТИ 4 === */
/* === НАЧАЛО ЧАСТИ 5 === */

function toggleLogVisibility() {
  document.documentElement.classList.remove("init-log-hidden");
  const logBlock = document.getElementById("global-table-log-block");
  const toggleBtn = document.getElementById("log-global-toggle-btn");
  if (!logBlock || !toggleBtn) return;

  const isCollapsed = logBlock.classList.toggle("collapsed");
  if (isCollapsed) {
    toggleBtn.classList.remove("active-log-btn");
    localStorage.setItem("bybit_log_visible", "hidden");
  } else {
    toggleBtn.classList.add("active-log-btn");
    localStorage.setItem("bybit_log_visible", "visible");
  }
}

function clearLog() {
  if (confirm("Очистить всю историю журнала расчетов?")) {
    tradingLog = [];
    localStorage.removeItem("bybit_trading_log");
    renderLogTable();
  }
}

function exportLogToCSV() {
  if (tradingLog.length === 0) {
    alert("Журнал пуст. Нечего экспортировать.");
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent +=
    "Дата и Время;Деп;Пара;Плечо;Рынок;Тип Ордера;Цена Входа;TP;SL;Объем и Монеты\r\n";

  tradingLog.forEach((row) => {
    const line = [
      `${row.date || "—"} ${row.time}`,
      row.dep || "—",
      row.pair,
      row.leverage || "",
      row.market,
      row.type,
      row.entry,
      row.tp,
      row.sl,
      row.details,
    ].join(";");
    csvContent += line + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Bybit_Risk_Log_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handlePairChange() {
  const selectedPair = document.getElementById("pair").value;
  document.getElementById("entry-price").value = coinConfig[selectedPair].price;
  saveToStorage();
  calculate();
  initWebSocketInformer();
}

function copyData(elementId, btnElement) {
  const valueText = document.getElementById(elementId).innerText;
  if (valueText === "—" || btnElement.closest(".disabled-element")) return;

  let textToCopy = valueText.startsWith("$")
    ? valueText.substring(1)
    : valueText;
  navigator.clipboard.writeText(textToCopy);

  const oldSvg = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="icon-copy" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
  btnElement.classList.add("copied");

  setTimeout(() => {
    btnElement.innerHTML = oldSvg;
    btnElement.classList.remove("copied");
  }, 1200);
}

function resetTerminal() {
  localStorage.removeItem("bybit_tab");
  localStorage.removeItem("bybit_side");
  localStorage.removeItem("bybit_order_type");
  localStorage.removeItem("bybit_balance");
  localStorage.removeItem("bybit_pair");
  localStorage.removeItem("bybit_entry");

  currentTab = "futures";
  currentSide = "Long";
  currentOrderType = "limit";
  const defaultPair = "BTCUSDT";

  document.getElementById("balance").value = "100";
  document.getElementById("pair").value = defaultPair;
  document.getElementById("entry-price").value = coinConfig[defaultPair].price;

  restoreTabsVisualOnly();
  calculate();
  initWebSocketInformer();
}

// АРХИТЕКТУРА ИНФОРМЕРА BYBIT WEBSOCKET V5 БЕЗ СЕНТИМЕНТ-БАРА
let informerWs = null;
let informerPingInterval = null;
let informerCountdownInterval = null;
let informerFlatTimeout = null;
let infNextFundingTimestamp = 0;
let informerLastPrice = 0;
const INF_CRITICAL_LIMIT = 0.05;

function initWebSocketInformer() {
  if (informerWs) {
    clearInterval(informerPingInterval);
    clearInterval(informerCountdownInterval);
    clearTimeout(informerFlatTimeout);
    informerWs.close();
  }

  const livePriceEl = document.getElementById("live-price");
  const arrowEl = document.getElementById("live-arrow");
  const askEl = document.getElementById("live-ask");
  const bidEl = document.getElementById("live-bid");
  const spreadEl = document.getElementById("live-spread");
  const fundingBox = document.getElementById("live-funding-box");
  const fundingRateEl = document.getElementById("live-funding-rate");
  const fundingTimeEl = document.getElementById("live-funding-time");

  const selectedPair = document.getElementById("pair").value;
  fundingBox.style.display = currentTab === "futures" ? "flex" : "none";

  const baseParts = [
    "wss",
    "://",
    "stream",
    ".",
    "bybit",
    ".",
    "com",
    "/v5/public/",
  ];
  baseParts.push(currentTab === "futures" ? "linear" : "spot");
  const wsUrl = baseParts.join("");

  informerWs = new WebSocket(wsUrl);

  informerWs.onopen = () => {
    if (informerWs.readyState === WebSocket.OPEN) {
      informerWs.send(
        JSON.stringify({
          op: "subscribe",
          args: [`orderbook.1.${selectedPair}`],
        }),
      );
      if (currentTab === "futures") {
        informerWs.send(
          JSON.stringify({
            op: "subscribe",
            args: [`tickers.${selectedPair}`],
          }),
        );
      }
    }

    informerPingInterval = setInterval(() => {
      if (informerWs && informerWs.readyState === WebSocket.OPEN) {
        informerWs.send(JSON.stringify({ op: "ping" }));
      }
    }, 20000);

    if (currentTab === "futures") {
      informerCountdownInterval = setInterval(() => {
        if (infNextFundingTimestamp <= 0) return;
        const dist = infNextFundingTimestamp - Date.now();
        if (dist <= 0) {
          fundingTimeEl.innerText = "00:00:00";
          return;
        }
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);
        fundingTimeEl.innerText = `через ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }, 1000);
    }
  };

  informerWs.onmessage = (event) => {
    const res = JSON.parse(event.data);
    if (res.op === "pong") return;

    if (res.topic === `orderbook.1.${selectedPair}` && res.data) {
      const ob = res.data;
      let up = false;
      let curBid =
        parseFloat(bidEl.innerText.replace(/[A-Za-z: ,$]/g, "")) || 0;
      let curAsk =
        parseFloat(askEl.innerText.replace(/[A-Za-z: ,$]/g, "")) || 0;

      if (ob.b && ob.b.length > 0) {
        curBid = parseFloat(ob.b);
        up = true;
      }
      if (ob.a && ob.a.length > 0) {
        curAsk = parseFloat(ob.a);
        up = true;
      }

      if (curBid > 0 && curAsk > 0 && up) {
        const mid = (curAsk + curBid) / 2;

        askEl.innerText = `${formatSmartValue(curAsk, coinConfig[selectedPair].priceDecimals)}`;
        bidEl.innerText = `${formatSmartValue(curBid, coinConfig[selectedPair].priceDecimals)}`;
        livePriceEl.innerText = formatSmartValue(
          mid,
          coinConfig[selectedPair].priceDecimals,
        );

        clearTimeout(informerFlatTimeout);
        if (informerLastPrice > 0) {
          if (mid > informerLastPrice) {
            livePriceEl.className = "live-price-val up";
            arrowEl.className = "live-arrow up";
            arrowEl.innerText = "▲";
          } else if (mid < informerLastPrice) {
            livePriceEl.className = "live-price-val down";
            arrowEl.className = "live-arrow down";
            arrowEl.innerText = "▼";
          }
        } else {
          arrowEl.className = "live-arrow flat";
          arrowEl.innerText = "▬";
        }
        informerLastPrice = mid;

        informerFlatTimeout = setTimeout(() => {
          arrowEl.className = "live-arrow flat";
          arrowEl.innerText = "▬";
          livePriceEl.className = "live-price-val";
        }, 1500);

        const sprAbs = curAsk - curBid;
        const sprPct = (sprAbs / curBid) * 100;
        spreadEl.innerText = `${sprAbs.toFixed(coinConfig[selectedPair].priceDecimals)} (${sprPct.toFixed(3)}%)`;
      }
    }

    if (
      currentTab === "futures" &&
      res.topic === `tickers.${selectedPair}` &&
      res.data
    ) {
      const t = Array.isArray(res.data) ? res.data : res.data;
      if (t && t.fundingRate !== undefined) {
        const rate = parseFloat(t.fundingRate) * 100;
        fundingRateEl.innerText = `Fnd: ${rate > 0 ? "+" : ""}${rate.toFixed(4)}%`;
        fundingRateEl.style.color = rate >= 0 ? "#0ecb81" : "#f6465d";

        if (Math.abs(rate) >= INF_CRITICAL_LIMIT) {
          fundingBox.classList.add("critical-alert");
        } else {
          fundingBox.classList.remove("critical-alert");
        }
      }
      if (t && t.nextFundingTime !== undefined)
        infNextFundingTimestamp = parseInt(t.nextFundingTime);
    }
  };
}

document.getElementById("balance").addEventListener("input", saveToStorage);
document.getElementById("entry-price").addEventListener("input", saveToStorage);

window.onload = () => {
  loadFromStorage();
  initWebSocketInformer();

  const savedLogState = localStorage.getItem("bybit_log_visible");
  const logBlock = document.getElementById("global-table-log-block");
  const toggleBtn = document.getElementById("log-global-toggle-btn");

  if (savedLogState === "hidden" && logBlock && toggleBtn) {
    logBlock.classList.add("collapsed");
    toggleBtn.classList.remove("active-log-btn");
  } else if (toggleBtn) {
    document.documentElement.classList.remove("init-log-hidden");
    toggleBtn.classList.add("active-log-btn");
  }
};
/* === КОНЕЦ ЧАСТИ 5 === */
