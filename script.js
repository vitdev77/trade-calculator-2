/* === НАЧАЛО ЧАСТИ 1 === */
let currentTab = localStorage.getItem("bybit_tab") || "futures";
let currentSide = localStorage.getItem("bybit_side") || "Long";
// ЖЁСТКАЯ СИНТАКСИЧЕСКАЯ ФИКСАЦИЯ: По умолчанию теперь ВСЕГДА market ордер
let currentOrderType = localStorage.getItem("bybit_order_type") || "market";
let currentTheme = localStorage.getItem("bybit_theme") || "dark";
let currentPrRatio = localStorage.getItem("bybit_pr_ratio") || "3";
let currentRiskPercent =
  parseFloat(localStorage.getItem("bybit_risk_percent")) || 2;

const coinConfig = {
  BTCUSDT: { price: 79670, priceDecimals: 2, qtyDecimals: 5, baseLeverage: 20 },
  ETHUSDT: { price: 2510, priceDecimals: 2, qtyDecimals: 4, baseLeverage: 10 },
  XAUTUSDT: {
    price: 4582.6,
    priceDecimals: 2,
    qtyDecimals: 4,
    baseLeverage: 10,
  },
  SOLUSDT: { price: 106.45, priceDecimals: 2, qtyDecimals: 3, baseLeverage: 5 },
  ZECUSDT: { price: 802.84, priceDecimals: 2, qtyDecimals: 3, baseLeverage: 3 },
  MNTUSDT: { price: 0.5231, priceDecimals: 4, qtyDecimals: 2, baseLeverage: 3 },
};

let cachedVolatilityATR = {
  BTCUSDT: 0.025,
  ETHUSDT: 0.032,
  XAUTUSDT: 0.015,
  SOLUSDT: 0.045,
  ZECUSDT: 0.05,
  MNTUSDT: 0.04,
};

const TAKER_FEE = 0.00055;
const MMR = 0.004;
/* === КОНЕЦ ЧАСТИ 1 === */
/* === НАЧАЛО ЧАСТИ 2 === */
function saveToStorage() {
  localStorage.setItem("bybit_tab", currentTab);
  localStorage.setItem("bybit_side", currentSide);
  localStorage.setItem("bybit_order_type", currentOrderType);
  localStorage.setItem("bybit_theme", currentTheme);
  localStorage.setItem("bybit_pr_ratio", currentPrRatio);
  localStorage.setItem("bybit_risk_percent", currentRiskPercent);
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
/* === КОНЕЦ ЧАСТИ 2 === */
/* === НАЧАЛО ЧАСТИ 3 === */
function toggleTheme() {
  const btn = document.getElementById("theme-toggle-btn");
  if (currentTheme === "dark") {
    currentTheme = "light";
    document.documentElement.classList.add("light-theme");
    if (btn)
      btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:var(--text-muted);stroke-width:2;stroke-linecap:round;"><circle cx="12" cy="12" r="5" fill="var(--text-muted)" stroke="none"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="23" y2="12"/><line x1="4.93" y1="4.93" x2="6.03" y2="6.03"/><line x1="17.97" y1="17.97" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="6.03" y2="17.97"/><line x1="17.97" y1="6.03" x2="19.07" y2="4.93"/></svg>`;
  } else {
    currentTheme = "dark";
    document.documentElement.classList.remove("light-theme");
    if (btn)
      btn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text-muted);"><path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992V3z"/></svg>`;
  }
  saveToStorage();
}
/* === КОНЕЦ ЧАСТИ 3 === */
/* === НАЧАЛО ЧАСТИ 4 === */
function loadFromStorage() {
  document.documentElement.classList.remove("init-spot-mode");
  const btn = document.getElementById("theme-toggle-btn");

  if (currentTheme === "light") {
    document.documentElement.classList.add("light-theme");
    if (btn)
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
  if (localStorage.getItem("bybit_pr_ratio")) {
    const prSelect = document.getElementById("pr-ratio");
    if (prSelect) prSelect.value = localStorage.getItem("bybit_pr_ratio");
    currentPrRatio = localStorage.getItem("bybit_pr_ratio");
  }

  // Если в кэше пусто — выставляем рыночный тип ордера принудительно
  if (!localStorage.getItem("bybit_order_type")) {
    currentOrderType = "market";
  } else {
    currentOrderType = localStorage.getItem("bybit_order_type");
  }

  const selectedPair = document.getElementById("pair").value;
  if (localStorage.getItem("bybit_entry")) {
    document.getElementById("entry-price").value =
      localStorage.getItem("bybit_entry");
  } else {
    document.getElementById("entry-price").value =
      coinConfig[selectedPair].price;
  }

  document
    .querySelectorAll(".risk-toggle-btn")
    .forEach((b) => b.classList.remove("active"));
  const targetRiskBtn = document.getElementById(
    `risk-${Math.round(currentRiskPercent)}`,
  );
  if (targetRiskBtn) targetRiskBtn.classList.add("active");

  restoreTabsVisualOnly();
  fetchBybitVolatilityATR(selectedPair);
}
/* === КОНЕЦ ЧАСТИ 4 === */
/* === НАЧАЛО ЧАСТИ 5 === */
function restoreTabsVisualOnly() {
  // ИСПРАВЛЕНИЕ: Инъекция правильной SVG-иконки темы при каждом обновлении DOM-дерева
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    if (currentTheme === "light") {
      themeBtn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:var(--text-muted);stroke-width:2;stroke-linecap:round;"><circle cx="12" cy="12" r="5" fill="var(--text-muted)" stroke="none"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="23" y2="12"/><line x1="4.93" y1="4.93" x2="6.03" y2="6.03"/><line x1="17.97" y1="17.97" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="6.03" y2="17.97"/><line x1="17.97" y1="6.03" x2="19.07" y2="4.93"/></svg>`;
    } else {
      themeBtn.innerHTML = `<svg class="icon-theme" viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text-muted);"><path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992V3z"/></svg>`;
    }
  }

  const tabSpot = document.getElementById("tab-spot");
  const tabFutures = document.getElementById("tab-futures");
  if (tabSpot) tabSpot.classList.remove("active");
  if (tabFutures) tabFutures.classList.remove("active");

  const currentTabBtn = document.getElementById(`tab-${currentTab}`);
  if (currentTabBtn) currentTabBtn.classList.add("active");

  const sideLong = document.getElementById("side-long");
  const sideShort = document.getElementById("side-short");
  if (sideLong) sideLong.classList.remove("active");
  if (sideShort) sideShort.classList.remove("active");

  const currentSideBtn = document.getElementById(
    currentSide === "Long" ? "side-long" : "side-short",
  );
  if (currentSideBtn) currentSideBtn.classList.add("active");

  const orderLimit = document.getElementById("order-limit");
  const orderMarket = document.getElementById("order-market");
  if (orderLimit) orderLimit.classList.remove("active");
  if (orderMarket) orderMarket.classList.remove("active");

  const currentOrderBtn = document.getElementById(`order-${currentOrderType}`);
  if (currentOrderBtn) currentOrderBtn.classList.add("active");

  const entryLabel = document.getElementById("entry-label");
  const resEntryLabel = document.getElementById("res-entry-label");
  /* === КОНЕЦ ЧАСТИ 5 === */
  /* === НАЧАЛО ЧАСТИ 6 === */
  if (currentOrderType === "market") {
    if (entryLabel) entryLabel.innerText = "Текущая цена Bybit (USDT)";
    if (resEntryLabel) resEntryLabel.innerText = "Текущая цена Bybit (USDT)";
  } else {
    if (entryLabel) entryLabel.innerText = "Цена входа (USDT)";
    if (resEntryLabel) resEntryLabel.innerText = "Цена входа (USDT)";
  }

  const sideItemWrapper = document.getElementById("side-item-wrapper");
  const liqSection = document.getElementById("liq-section");
  const resLeverageSection = document.getElementById("res-leverage-section");

  if (currentTab === "futures") {
    if (sideItemWrapper) sideItemWrapper.classList.remove("fade-out");
    if (liqSection) liqSection.classList.remove("disabled-element");
    if (resLeverageSection)
      resLeverageSection.classList.remove("disabled-element");
  } else {
    if (sideItemWrapper) sideItemWrapper.classList.add("fade-out");
    if (liqSection) liqSection.classList.add("disabled-element");
    if (resLeverageSection)
      resLeverageSection.classList.add("disabled-element");
  }

  const resultsDisplay = document.querySelector(".results-display");
  if (resultsDisplay) {
    if (currentSide === "Long") {
      resultsDisplay.classList.remove("active-short");
      resultsDisplay.classList.add("active-long");
    } else {
      resultsDisplay.classList.remove("active-long");
      resultsDisplay.classList.add("active-short");
    }
  }
}
/* === КОНЕЦ ЧАСТИ 6 === */
/* === НАЧАЛО ЧАСТИ 7 === */
function fetchBybitVolatilityATR(pair) {
  calculate();
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
  restoreTabsVisualOnly();
  saveToStorage();
  calculate();
}

function setOrderType(type) {
  currentOrderType = type;
  const entryInput = document.getElementById("entry-price");
  const selectedPair = document.getElementById("pair").value;
  if (entryInput) entryInput.value = coinConfig[selectedPair].price;
  restoreTabsVisualOnly();
  saveToStorage();
  calculate();
}

function handlePrRatioChange() {
  const prSelect = document.getElementById("pr-ratio");
  if (prSelect) currentPrRatio = prSelect.value;
  saveToStorage();
  calculate();
}

function setRiskPercent(val) {
  currentRiskPercent = val;
  document
    .querySelectorAll(".risk-toggle-btn")
    .forEach((b) => b.classList.remove("active"));
  const activeBtn = document.getElementById(`risk-${val}`);
  if (activeBtn) activeBtn.classList.add("active");
  saveToStorage();
  calculate();
}
/* === КОНЕЦ ЧАСТИ 7 === */
/* === НАЧАЛО ЧАСТИ 8 === */
function formatSmartValue(value, decimals) {
  if (value === "—" || value === undefined) return "—";
  if (decimals === 0) return Math.round(value).toString();
  return value.toFixed(decimals);
}

let tradingLog = JSON.parse(localStorage.getItem("bybit_trading_log")) || [];

function calculate() {
  const balance = parseFloat(document.getElementById("balance").value) || 0;
  const entryPrice =
    parseFloat(document.getElementById("entry-price").value) || 0;
  const selectedPair = document.getElementById("pair").value;

  if (balance <= 0 || entryPrice <= 0) return;

  const analyticsBalanceEl = document.getElementById("res-analytics-balance");
  if (analyticsBalanceEl)
    analyticsBalanceEl.innerText = `$${balance.toFixed(2)}`;

  const config = coinConfig[selectedPair] || {
    priceDecimals: 2,
    qtyDecimals: 2,
    baseLeverage: 10,
  };

  const resEntryDupEl = document.getElementById("res-entry-dup");
  if (resEntryDupEl)
    resEntryDupEl.innerText = formatSmartValue(
      entryPrice,
      config.priceDecimals,
    );

  const marketVolatility = cachedVolatilityATR[selectedPair] || 0.025;
  let leverage = config.baseLeverage;
  if (currentTab === "futures") {
    leverage = Math.max(
      1,
      Math.min(
        100,
        Math.round(config.baseLeverage * (0.025 / marketVolatility)),
      ),
    );
  } else {
    leverage = 1;
  }

  const cost = balance / 5;
  const qty = (cost * leverage) / entryPrice;
  const totalVolume = cost * leverage;
  const freeMargin = balance - cost;
  const remainingTrades = Math.floor(freeMargin / cost);

  document.getElementById("res-margin-free").innerText =
    `$${freeMargin.toFixed(2)}`;
  document.getElementById("margin-trades").innerText =
    `Запас на ${remainingTrades} сделки`;

  const riskAmount = balance * (currentRiskPercent / 100);
  document.getElementById("risk-cash").innerText = `$${riskAmount.toFixed(2)}`;

  const rewardMultiplier = parseInt(currentPrRatio) || 3;
  const prRatioEl = document.getElementById("res-pr-ratio");
  if (prRatioEl) prRatioEl.innerText = `1 : ${rewardMultiplier}`;

  let sl = 0,
    tp = 0,
    liq = "—",
    pctChangeSL = 0,
    pctChangeTP = 0,
    cashLoss = riskAmount,
    cashProfit = riskAmount * rewardMultiplier;
  let bybitRawProfit = 0,
    bybitRawLoss = 0,
    bybitRoiTP = 0,
    bybitRoiSL = 0;
  /* === КОНЕЦ ЧАСТИ 8 === */
  /* === НАЧАЛО ЧАСТИ 9 === */
  if (currentTab === "futures") {
    const rPct = currentRiskPercent / 100;
    const entryFee = currentOrderType === "limit" ? 0.0002 : 0.00055;
    const exitFeeSL = 0.00055,
      exitFeeTP = 0.00055;

    if (currentSide === "Long") {
      sl = entryPrice * ((1 - rPct / 5 - entryFee) / (1 + exitFeeSL));
      tp =
        entryPrice *
        ((1 + (rewardMultiplier * rPct) / 5 + entryFee) / (1 - exitFeeTP));
      liq = entryPrice * (1 - 1 / leverage + MMR);
      pctChangeSL = ((sl - entryPrice) / entryPrice) * 100;
      pctChangeTP = ((tp - entryPrice) / entryPrice) * 100;
      bybitRawProfit = (tp - entryPrice) * qty;
      bybitRawLoss = (entryPrice - sl) * qty;
    } else {
      sl = entryPrice * ((1 + rPct / 5 + entryFee) / (1 - exitFeeSL));
      tp =
        entryPrice *
        ((1 - (rewardMultiplier * rPct) / 5 - entryFee) / (1 + exitFeeTP));
      liq = entryPrice * (1 + 1 / leverage - MMR);
      pctChangeSL = ((entryPrice - sl) / entryPrice) * 100;
      pctChangeTP = ((entryPrice - tp) / entryPrice) * 100;
      bybitRawProfit = (entryPrice - tp) * qty;
      bybitRawLoss = (sl - entryPrice) * qty;
    }
    bybitRoiTP = (bybitRawProfit / cost) * 100;
    bybitRoiSL = (bybitRawLoss / cost) * 100;
  } else {
    const spotFee = 0.001;
    const spotSlippage = currentOrderType === "market" ? 0.0005 : 0;
    sl = entryPrice * (1 - riskAmount / cost - spotFee * 2 - spotSlippage);
    tp =
      entryPrice * (1 + (riskAmount * rewardMultiplier) / cost + spotFee * 2);
    liq = "—";
    pctChangeSL = ((sl - entryPrice) / entryPrice) * 100;
    pctChangeTP = ((tp - entryPrice) / entryPrice) * 100;
    bybitRawProfit = (tp - entryPrice) * qty;
    bybitRawLoss = (entryPrice - sl) * qty;
    bybitRoiTP = (bybitRawProfit / cost) * 100;
    bybitRoiSL = (bybitRawLoss / cost) * 100;
  }

  if (sl < 0) sl = 0;
  if (tp < 0) tp = 0;
  if (liq !== "—" && liq < 0) liq = 0;

  document.getElementById("res-volume-badge").innerText =
    `$${totalVolume.toFixed(2)}`;
  document.getElementById("res-volume-copy").innerText = totalVolume.toFixed(2);

  const levCopyEl = document.getElementById("res-leverage-copy");
  if (levCopyEl)
    levCopyEl.innerText =
      currentTab === "futures" ? Math.round(leverage).toString() : "—";
  /* === КОНЕЦ ЧАСТИ 9 === */
  /* === НАЧАЛО ЧАСТИ 10 === */
  document.getElementById("pct-tp").innerText =
    `${Math.abs(pctChangeTP).toFixed(2)}%`;
  document.getElementById("cash-tp").innerText = `(+$${cashProfit.toFixed(2)})`;
  document.getElementById("pct-sl").innerText =
    `${Math.abs(pctChangeSL).toFixed(2)}%`;
  document.getElementById("cash-sl").innerText = `(-$${cashLoss.toFixed(2)})`;

  let bybitTpView = document.getElementById("bybit-tp-view");
  let bybitSlView = document.getElementById("bybit-sl-view");

  if (!bybitTpView && document.getElementById("pct-tp")) {
    bybitTpView = document.createElement("div");
    bybitTpView.id = "bybit-tp-view";
    bybitTpView.className = "bybit-compare-badge";
    document.getElementById("pct-tp").parentNode.appendChild(bybitTpView);
  }
  if (!bybitSlView && document.getElementById("pct-sl")) {
    bybitSlView = document.createElement("div");
    bybitSlView.id = "bybit-sl-view";
    bybitSlView.className = "bybit-compare-badge";
    document.getElementById("pct-sl").parentNode.appendChild(bybitSlView);
  }

  if (bybitTpView && bybitSlView) {
    if (currentTab === "futures") {
      bybitTpView.innerText = `Bybit: ROI +${bybitRoiTP.toFixed(2)}% (+${bybitRawProfit.toFixed(4)} USDT)`;
      bybitSlView.innerText = `Bybit: ROI -${bybitRoiSL.toFixed(2)}% (-${bybitRawLoss.toFixed(4)} USDT)`;
      bybitTpView.style.display = "block";
      bybitSlView.style.display = "block";
    } else {
      bybitTpView.style.display = "none";
      bybitSlView.style.display = "none";
    }
  }

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
  /* === КОНЕЦ ЧАСТИ 10 === */
  /* === НАЧАЛО ЧАСТИ 11 === */
  const liqValEl = document.getElementById("res-liq");
  const barWrapper = document.getElementById("res-liq-bar-wrapper");
  const barFill = document.getElementById("res-liq-bar-fill");
  const statusTxt = document.getElementById("res-liq-status-text");
  const safetyPctEl = document.getElementById("res-liq-safety-pct");

  if (liqValEl) {
    if (currentTab === "futures" && liq !== "—" && liq > 0) {
      liqValEl.innerText = formatSmartValue(liq, config.priceDecimals);

      const distanceToLiq = Math.abs(entryPrice - liq);
      const distanceToSL = Math.abs(entryPrice - sl);
      let safetyPercent = Math.max(
        0,
        Math.min(100, (1 - distanceToSL / distanceToLiq) * 100),
      );

      if (barWrapper) barWrapper.style.display = "block";
      if (safetyPctEl) safetyPctEl.innerText = `${Math.round(safetyPercent)}%`;

      if (barFill && statusTxt) {
        barFill.style.transform = `scaleX(${safetyPercent / 100})`;
        barFill.style.boxShadow = "none";

        if (
          (currentSide === "Long" && sl <= liq) ||
          (currentSide === "Short" && sl >= liq) ||
          safetyPercent < 25
        ) {
          barFill.className = "liquidation-bar-fill liquidation-critical-flash";
          statusTxt.innerText = "🛑 АЛЕРТ: Ликвидация ближе Стопа! Убавь риск!";
          statusTxt.style.color = "var(--c-red)";
          liqValEl.style.color = "var(--c-red)";
          liqValEl.style.textShadow = "0 0 10px var(--c-red-glow)";
        } else if (safetyPercent >= 25 && safetyPercent < 60) {
          barFill.className = "liquidation-bar-fill";
          barFill.style.backgroundColor = "var(--c-king)";
          statusTxt.innerText = "⚠️ ВНИМАНИЕ: Опасная зона, снизь плечо";
          statusTxt.style.color = "var(--c-king)";
          liqValEl.style.color = "var(--c-king)";
          liqValEl.style.textShadow = "0 0 10px var(--c-orange-glow)";
        } else if (safetyPercent >= 60 && safetyPercent < 85) {
          barFill.className = "liquidation-bar-fill";
          barFill.style.backgroundColor = "var(--text-main)";
          statusTxt.innerText = "⚡ В НОРМЕ: Запас волатильности учтен";
          statusTxt.style.color = "var(--text-main)";
          liqValEl.style.color = "var(--c-orange)";
          liqValEl.style.textShadow = "none";
        } else {
          barFill.className = "liquidation-bar-fill";
          barFill.style.backgroundColor = "var(--c-green)";
          barFill.style.boxShadow = "0 0 8px var(--c-green-glow)";
          statusTxt.innerText = "🟢 ИДЕАЛЬНО: Полная защита от ATR выноса";
          statusTxt.style.color = "var(--c-green)";
          liqValEl.style.color = "var(--c-green)";
          liqValEl.style.textShadow = "none";
        }
      }
    } else {
      liqValEl.innerText = "—";
      liqValEl.style.color = "var(--text-main)";
      liqValEl.style.textShadow = "none";
      if (barWrapper) barWrapper.style.display = "none";
    }
  }
  renderLogTable();
}
/* === КОНЕЦ ЧАСТИ 11 === */
/* === НАЧАЛО ЧАСТИ 12 === */
function pushToLogManual() {
  const selectedPair = document.getElementById("pair").value;
  const pairText =
    document.getElementById("pair").options[
      document.getElementById("pair").selectedIndex
    ].text;
  const entryPrice =
    parseFloat(document.getElementById("entry-price").value) || 0;
  const tpText = document.getElementById("res-tp").innerText;
  const slText = document.getElementById("res-sl").innerText;
  const volume = document.getElementById("res-volume-copy").innerText;
  const qty = document.getElementById("res-qty").innerText;
  const inputBalance =
    parseFloat(document.getElementById("balance").value) || 0;

  const bybitTpEl = document.getElementById("bybit-tp-view");
  const bybitSlEl = document.getElementById("bybit-sl-view");
  let bybitTpText = "";
  let bybitSlText = "";

  if (currentTab === "futures" && bybitTpEl && bybitSlEl) {
    bybitTpText = bybitTpEl.innerText.replace("Bybit: ", "");
    bybitSlText = bybitSlEl.innerText.replace("Bybit: ", "");
  }

  if (tpText === "—" || slText === "—" || entryPrice <= 0) return;

  let computedBePrice = entryPrice;
  if (currentTab === "futures") {
    const entryFee = currentOrderType === "limit" ? 0.0002 : 0.00055;
    const exitFee = 0.00055;
    if (currentSide === "Long") {
      computedBePrice = entryPrice * (1 + entryFee + exitFee);
    } else {
      computedBePrice = entryPrice * (1 - entryFee - exitFee);
    }
  } else {
    const spotFee = 0.001;
    const spotSlippage = currentOrderType === "market" ? 0.0005 : 0;
    computedBePrice = entryPrice * (1 + spotFee * 2 + spotSlippage);
  }

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

  const displayedLeverageEl = document.getElementById("res-leverage-copy");
  const currentLeverage = displayedLeverageEl
    ? displayedLeverageEl.innerText
    : "1";

  const logItem = {
    id: Date.now(),
    outcome: "active",
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
    bePrice: computedBePrice,
    tp: tpText,
    sl: slText,
    rawValues: { tp: parseFloat(tpText) || 0, sl: parseFloat(slText) || 0 },
    dep: `$${inputBalance.toFixed(2)}`,
    details: `$${volume} / ${qty}`,
    bybitTpData: bybitTpText,
    bybitSlData: bybitSlText,
    rawSide: currentSide,
  };

  if (tradingLog.length > 0) {
    const last = tradingLog.at(0);
    if (
      last &&
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
/* === КОНЕЦ ЧАСТИ 12 === */
/* === НАЧАЛО ЧАСТИ 13 === */
function renderLogTable() {
  const tbody = document.getElementById("log-table-body");
  const counter = document.getElementById("log-counter");
  if (!tbody || !counter) return;

  counter.innerText = tradingLog.length.toString() + " записей";
  tbody.innerHTML = "";

  const currentSelectedPair = document.getElementById("pair")
    ? document.getElementById("pair").value
    : "";

  tradingLog.forEach((item) => {
    const cleanPairName = item.pair ? item.pair.replace("/", "") : "";
    const isSamePair = currentSelectedPair === cleanPairName;

    if (
      isSamePair &&
      informerLastPrice > 0 &&
      item.outcome === "active" &&
      item.bePrice
    ) {
      if (item.market === "Спот" || item.rawSide === "Long") {
        if (informerLastPrice >= item.bePrice) item.isBeHitNow = true;
      } else if (item.rawSide === "Short") {
        if (informerLastPrice <= item.bePrice) item.isBeHitNow = true;
      }
    }

    if (item.outcome === "active" && isSamePair && informerLastPrice > 0) {
      const targetTp = item.rawValues ? item.rawValues.tp : 0;
      const targetSl = item.rawValues ? item.rawValues.sl : 0;
      const targetBe = item.bePrice || 0;

      if (targetTp > 0 && targetSl > 0) {
        if (item.market === "Спот" || item.rawSide === "Long") {
          if (informerLastPrice >= targetTp) {
            item.outcome = "profit";
          } else if (item.isBeHitNow && informerLastPrice < targetBe) {
            item.outcome = "breakeven";
          } else if (!item.isBeHitNow && informerLastPrice <= targetSl) {
            item.outcome = "loss";
          }
        } else if (item.rawSide === "Short") {
          if (informerLastPrice <= targetTp) {
            item.outcome = "profit";
          } else if (item.isBeHitNow && informerLastPrice > targetBe) {
            item.outcome = "breakeven";
          } else if (!item.isBeHitNow && informerLastPrice >= targetSl) {
            item.outcome = "loss";
          }
        }

        if (item.outcome !== "active") {
          localStorage.setItem("bybit_trading_log", JSON.stringify(tradingLog));
        }
      }
    }

    const tr = document.createElement("tr");
    if (item.outcome !== "active") {
      tr.className = item.sideClass + " historical-closed-row";
    } else {
      tr.className = item.sideClass;
    }

    const displayDate = item.date || "—";
    const leverageMarkup = item.leverage
      ? `${item.leverage}<span style="opacity:0.5; font-size:9px; margin-left:1px; font-weight:700; text-transform:lowercase;">x</span>`
      : "";
    const displayDep = item.dep || "—";
    /* === КОНЕЦ ЧАСТИ 13 === */
    /* === НАЧАЛО ЧАСТИ 14 === */
    let beCellMarkup = "—";
    if (item.bePrice) {
      const decimals = coinConfig[cleanPairName]
        ? coinConfig[cleanPairName].priceDecimals
        : 2;
      const formattedBe = item.bePrice.toFixed(decimals);

      if (item.outcome !== "active") {
        beCellMarkup = `<span style="color:var(--text-muted); opacity:0.5; font-weight:500; text-decoration:line-through;">${formattedBe}</span>`;
      } else if (item.isBeHitNow) {
        beCellMarkup = `
          <div class="be-reached-glow" title="КРИТИЧЕСКИЙ АССИСТЕНТ: Цена в Б/У! Перенесите Стоп-Лосс!" style="display:inline-flex; align-items:center; justify-content:center; gap:5px; background:#00ff9d !important; color:#000000 !important; font-weight:600 !important; font-size:11px !important; padding:2px 8px; border-radius:20px; outline: 2px solid #ffffff; box-shadow: 0 0 12px #00ff9d, 0 0 25px rgba(0, 255, 157, 0.25); inset 0 0 4px rgba(255, 255, 255, 0.4); text-shadow:none !important;">
            <span>${formattedBe}</span>
            <svg viewBox="0 0 24 24" style="width:11px; height:11px; fill:#000000; vertical-align:middle; display:inline-block;">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
          </div>`;
      } else {
        beCellMarkup = `<span style="color:var(--text-muted); font-weight:500;">${formattedBe}</span>`;
      }
    }

    let titleTooltip =
      item.bybitTpData && item.bybitSlData
        ? `Bybit Ориентиры:\nTP: ${item.bybitTpData}\nSL: ${item.bybitSlData}`
        : "Расчет объема позиции";

    let detailsCellContent = `<div style="color:var(--c-orange); font-size:10px; cursor:help;" title="${titleTooltip}">${item.details}</div>`;

    if (item.outcome === "profit") {
      detailsCellContent = `<div class="log-outcome-badge outcome-profit" title="${titleTooltip}">🎯 ТЕЙК ВЗЯТ</div>`;
    } else if (item.outcome === "loss") {
      detailsCellContent = `<div class="log-outcome-badge outcome-loss" title="${titleTooltip}">🛑 СТОП-ЛОСС</div>`;
    } else if (item.outcome === "breakeven") {
      detailsCellContent = `<div class="log-outcome-badge outcome-breakeven" title="${titleTooltip}">🛡 БЕЗУБЫТОК</div>`;
    }

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
      <td>${beCellMarkup}</td>
      <td style="color:var(--c-green);">${item.tp}</td>
      <td style="color:var(--c-red);">${item.sl}</td>
      <td>${detailsCellContent}</td>
    `;
    tbody.appendChild(tr);
  });
}
/* === КОНЕЦ ЧАСТИ 14 === */
/* === НАЧАЛО ЧАСТИ 15 === */
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
    toggleBtn.mathbf.classList.add("active-log-btn");
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
  if (tradingLog.length === 0)
    return alert("Журнал пуст. Нечего экспортировать.");
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
  localStorage.removeItem("bybit_pr_ratio");
  localStorage.removeItem("bybit_risk_percent");

  currentTab = "futures";
  currentSide = "Long";
  // ИСПРАВЛЕНИЕ: При полном сбросе системы выставляется market тип
  currentOrderType = "market";
  currentPrRatio = "3";
  currentRiskPercent = 2;
  const defaultPair = "BTCUSDT";

  document.getElementById("balance").value = "100";
  document.getElementById("pair").value = defaultPair;
  document.getElementById("entry-price").value = coinConfig[defaultPair].price;
  document.getElementById("pr-ratio").value = "3";

  document
    .querySelectorAll(".risk-toggle-btn")
    .forEach((b) => b.classList.remove("active"));
  const r2 = document.getElementById("risk-2");
  if (r2) r2.classList.add("active");

  restoreTabsVisualOnly();
  initWebSocketInformer();
}
/* === КОНЕЦ ЧАСТИ 15 === */
/* === НАЧАЛО ЧАСТИ 16 === */
let informerWs = null;
let informerPingInterval = null;
let informerCountdownInterval = null;
let informerFlatTimeout = null;
let infNextFundingTimestamp = 0;
let informerLastPrice = 0;
const INF_CRITICAL_LIMIT = 0.05;

let localCachedBid = 0;
let localCachedAsk = 0;

const SVG_TREND_UP = `<svg viewBox='0 0 24 24' style='width:22px; height:22px; fill:var(--c-green); filter: drop-shadow(0 0 6px var(--c-green-glow)); vertical-align:middle; display:inline-block;'><path d='M12 3l10 16H2z'/></svg>`;
const SVG_TREND_DOWN = `<svg viewBox='0 0 24 24' style='width:22px; height:22px; fill:var(--c-red); filter: drop-shadow(0 0 6px var(--c-red-glow)); vertical-align:middle; display:inline-block;'><path d='M12 21L2 5h20z'/></svg>`;
const SVG_TREND_FLAT = `<svg viewBox='0 0 24 24' style='width:22px; height:22px; fill:var(--text-muted); opacity:0.4; vertical-align:middle; display:inline-block;'><path d='M20 13H4v-2h16z'/></svg>`;

function injectPriceToCalculator(value) {
  if (!value || isNaN(value) || value <= 0) return;

  const entryInput = document.getElementById("entry-price");
  const selectedPair = document.getElementById("pair")?.value;
  if (!entryInput || !selectedPair) return;

  const decimals = coinConfig[selectedPair]
    ? coinConfig[selectedPair].priceDecimals
    : 2;
  const cleanPrice = parseFloat(value.toFixed(decimals));

  entryInput.value = cleanPrice;
  navigator.clipboard.writeText(cleanPrice.toString()).catch(() => {});

  saveToStorage();
  calculate();
}

function initWebSocketInformer() {
  if (informerWs) {
    clearInterval(informerPingInterval);
    clearInterval(informerCountdownInterval);
    clearTimeout(informerFlatTimeout);
    informerWs.close();
  }

  localCachedBid = 0;
  localCachedAsk = 0;
  informerLastPrice = 0;

  const informerContainer = document.querySelector(".bybit-live-informer");
  const livePriceEl = document.getElementById("live-price");
  const arrowEl = document.getElementById("live-arrow");
  const askEl = document.getElementById("live-ask");
  const bidEl = document.getElementById("live-bid");
  const spreadEl = document.getElementById("live-spread");
  const fundingBox = document.getElementById("live-funding-box");
  const fundingRateEl = document.getElementById("live-funding-rate");
  const fundingTimeEl = document.getElementById("live-funding-time");

  const selectedPair = document.getElementById("pair")
    ? document.getElementById("pair").value
    : "BTCUSDT";
  if (fundingBox)
    fundingBox.style.display = currentTab === "futures" ? "flex" : "none";

  if (livePriceEl) {
    livePriceEl.innerText = "Загрузка...";
    livePriceEl.className = "live-price-val";
  }
  if (askEl) askEl.innerText = "0.00";
  if (bidEl) bidEl.innerText = "0.00";
  if (spreadEl) spreadEl.innerText = "0.00 (0.00%)";
  if (arrowEl) {
    arrowEl.innerHTML = SVG_TREND_FLAT;
    arrowEl.className = "live-arrow flat";
  }
  if (informerContainer)
    informerContainer.classList.remove("trend-up", "trend-down");

  if (livePriceEl) {
    livePriceEl.style.cursor = "copy";
    livePriceEl.onclick = () => {
      if (localCachedBid > 0 && localCachedAsk > 0) {
        const mid = (localCachedAsk + localCachedBid) / 2;
        injectPriceToCalculator(mid);
      }
    };
  }
  if (askEl) {
    askEl.style.cursor = "copy";
    askEl.onclick = () => {
      if (localCachedAsk > 0) injectPriceToCalculator(localCachedAsk);
    };
  }
  if (bidEl) {
    bidEl.style.cursor = "copy";
    bidEl.onclick = () => {
      if (localCachedBid > 0) injectPriceToCalculator(localCachedBid);
    };
  }

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
    if (informerWs.readyState !== WebSocket.OPEN) return;
    informerWs.send(
      JSON.stringify({
        op: "subscribe",
        args: [`orderbook.1.${selectedPair}`],
      }),
    );

    if (currentTab === "futures") {
      informerWs.send(
        JSON.stringify({ op: "subscribe", args: [`tickers.${selectedPair}`] }),
      );
    }

    informerPingInterval = setInterval(() => {
      if (informerWs && informerWs.readyState === WebSocket.OPEN)
        informerWs.send(JSON.stringify({ op: "ping" }));
    }, 20000);

    if (currentTab === "futures") {
      informerCountdownInterval = setInterval(() => {
        if (infNextFundingTimestamp <= 0) return;
        const dist = infNextFundingTimestamp - Date.now();
        if (dist <= 0) {
          if (fundingTimeEl) fundingTimeEl.innerText = "00:00:00";
          return;
        }
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);
        if (fundingTimeEl)
          fundingTimeEl.innerText = `через ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }, 1000);
    }
    calculate();
  };

  informerWs.onmessage = (event) => {
    const res = JSON.parse(event.data);
    if (res.op === "pong") return;

    if (res.topic === `orderbook.1.${selectedPair}` && res.data) {
      const ob = res.data;
      let hasUpdate = false;

      if (ob.b && ob.b.length > 0) {
        localCachedBid = parseFloat(ob.b) || localCachedBid;
        hasUpdate = true;
      }
      if (ob.a && ob.a.length > 0) {
        localCachedAsk = parseFloat(ob.a) || localCachedAsk;
        hasUpdate = true;
      }

      if (localCachedBid > 0 && localCachedAsk > 0 && hasUpdate) {
        const mid = (localCachedAsk + localCachedBid) / 2;
        const decimals = coinConfig[selectedPair]
          ? coinConfig[selectedPair].priceDecimals
          : 2;

        if (askEl) askEl.innerText = formatSmartValue(localCachedAsk, decimals);
        if (bidEl) bidEl.innerText = formatSmartValue(localCachedBid, decimals);
        if (livePriceEl)
          livePriceEl.innerText = formatSmartValue(mid, decimals);

        clearTimeout(informerFlatTimeout);
        if (informerLastPrice > 0) {
          if (mid > informerLastPrice) {
            if (livePriceEl) livePriceEl.className = "live-price-val up";
            if (arrowEl) {
              arrowEl.className = "live-arrow up";
              arrowEl.innerHTML = SVG_TREND_UP;
            }
            if (informerContainer) {
              informerContainer.classList.remove("trend-down");
              informerContainer.classList.add("trend-up");
            }
          } else if (mid < informerLastPrice) {
            if (livePriceEl) livePriceEl.className = "live-price-val down";
            if (arrowEl) {
              arrowEl.className = "live-arrow down";
              arrowEl.innerHTML = SVG_TREND_DOWN;
            }
            if (informerContainer) {
              informerContainer.classList.remove("trend-up");
              informerContainer.classList.add("trend-down");
            }
          }
        } else if (arrowEl) {
          arrowEl.className = "live-arrow flat";
          arrowEl.innerHTML = SVG_TREND_FLAT;
        }

        if (informerLastPrice === 0) calculate();
        informerLastPrice = mid;

        renderLogTable();

        informerFlatTimeout = setTimeout(() => {
          if (arrowEl) {
            arrowEl.className = "live-arrow flat";
            arrowEl.innerHTML = SVG_TREND_FLAT;
          }
          if (livePriceEl) livePriceEl.className = "live-price-val";
          if (informerContainer)
            informerContainer.classList.remove("trend-up", "trend-down");
        }, 1500);

        const sprAbs = localCachedAsk - localCachedBid;
        const sprPct = (sprAbs / localCachedBid) * 100;
        if (spreadEl)
          spreadEl.innerText = `${sprAbs.toFixed(decimals)} (${sprPct.toFixed(3)}%)`;
      }
    }

    if (
      currentTab === "futures" &&
      res.topic === `tickers.${selectedPair}` &&
      res.data
    ) {
      const t = res.data;
      if (t.fundingRate !== undefined) {
        const rate = parseFloat(t.fundingRate) * 100;
        if (fundingRateEl) {
          fundingRateEl.innerText = `Fnd: ${rate > 0 ? "+" : ""}${rate.toFixed(4)}%`;
          fundingRateEl.style.color =
            rate >= 0 ? "var(--c-green)" : "var(--c-red)";
        }
        if (fundingBox) {
          if (Math.abs(rate) >= INF_CRITICAL_LIMIT)
            fundingBox.classList.add("critical-alert");
          else fundingBox.classList.remove("critical-alert");
        }
      }
      if (t.nextFundingTime !== undefined)
        infNextFundingTimestamp = parseInt(t.nextFundingTime);
    }
  };
}

const balanceInput = document.getElementById("balance");
const entryPriceInput = document.getElementById("entry-price");
if (balanceInput) balanceInput.addEventListener("input", saveToStorage);
if (entryPriceInput) entryPriceInput.addEventListener("input", saveToStorage);

function loadFromStorageManual() {
  if (localStorage.getItem("bybit_balance")) {
    document.getElementById("balance").value =
      localStorage.getItem("bybit_balance");
  }
  if (localStorage.getItem("bybit_pair")) {
    document.getElementById("pair").value = localStorage.getItem("bybit_pair");
  }
  if (localStorage.getItem("bybit_entry")) {
    document.getElementById("entry-price").value =
      localStorage.getItem("bybit_entry");
  }
}

window.onload = () => {
  loadFromStorageManual();
  // ИСПРАВЛЕНИЕ БАГА: Добавлен принудительный запуск визуального рендеринга табов при загрузке DOM дерева
  restoreTabsVisualOnly();
  initWebSocketInformer();
  renderLogTable();

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
/* === КОНЕЦ ЧАСТИ 16 === */
