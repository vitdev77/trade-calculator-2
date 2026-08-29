/* === НАЧАЛО ЧАСТИ 1 === */

let currentTab = localStorage.getItem("bybit_tab") || "futures";
let currentSide = localStorage.getItem("bybit_side") || "Long";
let currentOrderType = localStorage.getItem("bybit_order_type") || "limit";
let currentTheme = localStorage.getItem("bybit_theme") || "dark";

// ОБНОВЛЕНО: В кошелек coinConfig внедрена глубокая логика для TONUSDT
const coinConfig = {
  BTCUSDT: { price: 79670, priceDecimals: 0, qtyDecimals: 5, recLeverage: 20 },
  ETHUSDT: { price: 2510, priceDecimals: 0, qtyDecimals: 4, recLeverage: 10 },
  TONUSDT: { price: 5.345, priceDecimals: 3, qtyDecimals: 2, recLeverage: 3 }, // ИНТЕГРИРОВАНО: 3х плечо, сотые доли монет
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

function renderMarkdown(md) {
  return md
    .replace(/## (.*?)\n/g, "<h2>$1</h2>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\* (.*?)\n/g, "<li>$1</li>")
    .replace(/### (.*?)\n/g, "<h3>$1</h3>")
    .replace(/<\/li>\n<li>/g, "</li><li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n\n/g, "<br>");
}

function toggleModal(show) {
  const modal = document.getElementById("info-modal");
  if (show) {
    fetch("instruction.md")
      .then((response) => {
        if (!response.ok) throw new Error("Файл инструкции не найден");
        return response.text();
      })
      .then((text) => {
        document.getElementById("md-render-target").innerHTML =
          renderMarkdown(text);
        modal.classList.add("active");
      })
      .catch((err) => {
        document.getElementById("md-render-target").innerHTML =
          `<h2>Ошибка</h2><p>${err.message}. Убедитесь, что файл instruction.md лежит в той же папке.</p>`;
        modal.classList.add("active");
      });
  } else {
    modal.classList.remove("active");
  }
}

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

// ДОБАВЛЕНО: Полноценная функция живого переключения тем оформления терминала
function toggleTheme() {
  const btn = document.getElementById("theme-toggle-btn");
  if (currentTheme === "dark") {
    currentTheme = "light";
    document.documentElement.classList.add("light-theme");
    btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text-muted);"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0c-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0c-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zm-12.37 12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41z"/></svg>`;
  } else {
    currentTheme = "dark";
    document.documentElement.classList.remove("light-theme");
    btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text-muted);"><path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992V3z"/></svg>`;
  }
  saveToStorage();
}

function loadFromStorage() {
  document.documentElement.classList.remove("init-spot-mode");
  const btn = document.getElementById("theme-toggle-btn");

  if (currentTheme === "light") {
    document.documentElement.classList.add("light-theme");
    if (btn)
      btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text-muted);"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0c-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0c-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zm-12.37 12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41z"/></svg>`;
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

/* === КОНЕЦ ЧАСТИ 1 === */
/* === НАЧАЛО ЧАСТИ 2 === */

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

function formatSmartValue(value, decimals) {
  if (value === "—") return "—";
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
    document.getElementById("res-leverage-copy").innerText =
      Math.round(leverage).toString();
  } else {
    document.getElementById("res-leverage-copy").innerText = "—";
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

/* === КОНЕЦ ЧАСТИ 2 === */
/* === НАЧАЛО ЧАСТИ 3 === */

// Функция генерации и добавления записи в массив журнала расчетов
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

  if (tp === "—" || sl === "—" || !entryPrice) return;

  const now = new Date();

  // ДОБАВЛЕНО: Форматирование даты в компактный формат ДД.ММ.ГГГГ (например, 29.08.2026)
  const dateStr = now.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Время сессии в формате ЧЧ:ММ:СС
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Создаем объект строки. Интегрированы дата и время раздельно
  const logItem = {
    id: Date.now(),
    isMuted: false,
    date: dateStr,
    time: timeStr,
    market: currentTab === "futures" ? `Фьюч ${currentSide}` : "Спот Лонг",
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
    details: `$${volume} / ${qty}`,
  };

  if (tradingLog.length > 0) {
    const last = tradingLog;
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

// Переключение тумблера приглушения (тусклости) для строки ордера по её ID
function toggleMuteLogRow(id) {
  tradingLog = tradingLog.map((item) => {
    if (item.id === id) {
      item.isMuted = !item.isMuted;
    }
    return item;
  });
  localStorage.setItem("bybit_trading_log", JSON.stringify(tradingLog));
  renderLogTable();
}

// ОБНОВЛЕНО: Двухстрочный рендеринг колонки даты/времени с микро-стилизацией
function renderLogTable() {
  const tbody = document.getElementById("log-table-body");
  const counter = document.getElementById("log-counter");
  if (!tbody || !counter) return;

  counter.innerText = `${tradingLog.length} записей`;
  tbody.innerHTML = "";

  tradingLog.forEach((item) => {
    const tr = document.createElement("tr");
    tr.className = item.sideClass + (item.isMuted ? " muted-row" : "");

    // Получаем значение даты. Если в старых логах даты не было — подставим прочерк, для новых записей — дата запишется штатно.
    const displayDate = item.date || "—";

    // Формируем контент. Колонку времени превращаем в двухстрочный блок: дата сверху, время ниже и бледнее
    tr.innerHTML = `
      <td>
        <div style="display: flex; flex-direction: column; line-height: 1.3; font-size: 11px;">
          <span style="color: var(--text-main); font-weight: 700;">${displayDate}</span>
          <span style="color: var(--text-muted); font-size: 9px; font-weight: 500;">${item.time}</span>
        </div>
      </td>
      <td class="${item.badgeClass}">${item.market}</td>
      <td>${item.pair}</td>
      <td>${item.type}</td>
      <td>${item.entry}</td>
      <td style="color:var(--c-green);">${item.tp}</td>
      <td style="color:var(--c-red);">${item.sl}</td>
      <td style="color:var(--c-orange); font-size:10px;">${item.details}</td>
      <td style="text-align: center;">
        <button class="log-row-mute-btn" onclick="toggleMuteLogRow(${item.id})" title="Приглушить/Активировать строку ордера">
          <svg viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* === КОНЕЦ ЧАСТИ 3 === */
/* === НАЧАЛО ЧАСТИ 4 === */

// Скрытие журнала с полной Flicker-защитой и компенсацией пустых зон
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

// ОБНОВЛЕНО: Экспорт журнала с автоматическим объединением даты и времени для Excel
function exportLogToCSV() {
  if (tradingLog.length === 0) {
    alert("Журнал пуст. Нечего экспортировать.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent +=
    "Дата и Время;Рынок;Пара;Тип Ордера;Цена Входа;Тейк Профит;Стоп Лосс;Объем и Монеты\r\n";

  tradingLog.forEach((row) => {
    // Безопасно склеиваем дату и время для одной ячейки Excel
    const fullDateTime = `${row.date || "—"} ${row.time}`;
    const line = [
      fullDateTime,
      row.market,
      row.pair,
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
  const entryInput = document.getElementById("entry-price");
  entryInput.value = coinConfig[selectedPair].price;
  saveToStorage();
  calculate();
}

function copyData(elementId, btnElement) {
  const valueText = document.getElementById(elementId).innerText;
  if (valueText === "—" || btnElement.closest(".disabled-element")) return;

  let textToCopy = valueText;
  if (textToCopy.startsWith("$")) {
    textToCopy = textToCopy.substring(1);
  }

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
  localStorage.clear();
  currentTab = "futures";
  currentSide = "Long";
  currentOrderType = "limit";
  currentTheme = "dark";
  tradingLog = [];
  const defaultPair = "BTCUSDT";

  document.getElementById("balance").value = "100";
  document.getElementById("pair").value = defaultPair;
  document.getElementById("entry-price").value = coinConfig[defaultPair].price;

  document.documentElement.classList.remove("light-theme");
  document.documentElement.classList.remove("init-log-hidden");

  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24"><path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992V3z"/></svg>`;
  }

  const logBlock = document.getElementById("global-table-log-block");
  const toggleBtn = document.getElementById("log-global-toggle-btn");
  if (logBlock && toggleBtn) {
    logBlock.classList.remove("collapsed");
    toggleBtn.classList.add("active-log-btn");
  }

  restoreTabsVisualOnly();
  calculate();
}

document.getElementById("balance").addEventListener("input", saveToStorage);
document.getElementById("entry-price").addEventListener("input", saveToStorage);

window.onload = () => {
  loadFromStorage();
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

/* === КОНЕЦ ЧАСТИ 4 === */
