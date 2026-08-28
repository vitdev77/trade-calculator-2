/* НАЧАЛО ЧАСТИ 1 */

let currentTab = localStorage.getItem("bybit_tab") || "futures";
let currentSide = localStorage.getItem("bybit_side") || "Long";
let currentOrderType = localStorage.getItem("bybit_order_type") || "limit";

// Спецификации монет и актуальные рыночные цены Bybit
const coinConfig = {
  BTCUSDT: { price: 79670, priceDecimals: 0, qtyDecimals: 5, recLeverage: 20 },
  ETHUSDT: { price: 2510, priceDecimals: 0, qtyDecimals: 4, recLeverage: 10 },
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
  localStorage.setItem(
    "bybit_balance",
    document.getElementById("balance").value,
  );
  localStorage.setItem("bybit_pair", document.getElementById("pair").value);
  localStorage.setItem(
    "bybit_leverage",
    document.getElementById("leverage").value,
  );
  localStorage.setItem(
    "bybit_entry",
    document.getElementById("entry-price").value,
  );
}

function loadFromStorage() {
  document.documentElement.classList.remove("init-spot-mode");

  if (localStorage.getItem("bybit_balance")) {
    document.getElementById("balance").value =
      localStorage.getItem("bybit_balance");
  }
  if (localStorage.getItem("bybit_pair")) {
    document.getElementById("pair").value = localStorage.getItem("bybit_pair");
  }

  // ИСПРАВЛЕНО: Сначала восстанавливаем только физическое положение табов, без перезаписи логики
  restoreTabsVisualOnly();

  if (localStorage.getItem("bybit_leverage")) {
    document.getElementById("leverage").value =
      localStorage.getItem("bybit_leverage");
  }

  // ИСПРАВЛЕНО: Инициализируем тип ордера со всеми сопутствующими текстовыми метками Bybit
  setOrderType(currentOrderType);

  if (localStorage.getItem("bybit_entry")) {
    document.getElementById("entry-price").value =
      localStorage.getItem("bybit_entry");
  }

  updateLeverageBadge();
  calculate();
}

// Вывод корректных классов подсветки кнопок при первичной загрузке страницы
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

  const sideItemWrapper = document.getElementById("side-item-wrapper");
  const leverageItem = document.getElementById("leverage-item");
  const liqSection = document.getElementById("liq-section");

  if (currentTab === "futures") {
    sideItemWrapper.classList.remove("fade-out");
    leverageItem.classList.remove("disabled-element");
    document.getElementById("leverage").disabled = false;
    liqSection.classList.remove("disabled-element");
  } else {
    sideItemWrapper.classList.add("fade-out");
    leverageItem.classList.add("disabled-element");
    document.getElementById("leverage").disabled = true;
    liqSection.classList.add("disabled-element");
  }
}

function updateLeverageBadge() {
  const selectedPair = document.getElementById("pair").value;
  const config = coinConfig[selectedPair];
  if (config) {
    document.getElementById("rec-lev-badge").innerText =
      `${config.recLeverage}x`;
  }
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById("tab-spot").classList.remove("active");
  document.getElementById("tab-futures").classList.remove("active");
  document.getElementById(`tab-${tab}`).classList.add("active");

  const sideItemWrapper = document.getElementById("side-item-wrapper");
  const leverageItem = document.getElementById("leverage-item");
  const liqSection = document.getElementById("liq-section");

  if (tab === "futures") {
    sideItemWrapper.classList.remove("fade-out");
    leverageItem.classList.remove("disabled-element");
    document.getElementById("leverage").disabled = false;
    liqSection.classList.remove("disabled-element");
  } else {
    sideItemWrapper.classList.add("fade-out");
    leverageItem.classList.add("disabled-element");
    document.getElementById("leverage").disabled = true;
    liqSection.classList.add("disabled-element");
    setSide("Long");
  }
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

/* КОНЕЦ ЧАСТИ 1 */
/* НАЧАЛО ЧАСТИ 2 */

function setOrderType(type) {
  currentOrderType = type;
  document.getElementById("order-limit").classList.remove("active");
  document.getElementById("order-market").classList.remove("active");
  document.getElementById(`order-${type}`).classList.add("active");

  const entryInput = document.getElementById("entry-price");
  const entryLabel = document.getElementById("entry-label");
  const costLabel = document.getElementById("label-cost");
  const selectedPair = document.getElementById("pair").value;

  entryInput.disabled = false;

  if (type === "market") {
    entryLabel.innerText = "Текущая цена Bybit (USDT)";
    costLabel.innerText = currentTab === "spot" ? "Всего" : "Стоимость";
  } else {
    entryLabel.innerText = "Цена входа (USDT)";
    costLabel.innerText = "Стоимость";
  }

  // Предотвращаем перезапись цены, если она уже корректно подгрузилась из хранилища
  if (!localStorage.getItem("bybit_entry") || entryInput.value == 0) {
    entryInput.value = coinConfig[selectedPair].price;
  }

  saveToStorage();
  calculate();
}

function formatSmartValue(value, decimals) {
  if (value === "—") return "—";
  if (decimals === 0) {
    return Math.round(value).toString();
  }
  return value.toFixed(decimals);
}

function calculate() {
  const balance = parseFloat(document.getElementById("balance").value) || 0;
  const entryPrice =
    parseFloat(document.getElementById("entry-price").value) || 0;
  const leverage =
    currentTab === "futures"
      ? parseFloat(document.getElementById("leverage").value) || 1
      : 1;
  const selectedPair = document.getElementById("pair").value;

  if (balance <= 0 || entryPrice <= 0) return;

  const config = coinConfig[selectedPair] || {
    priceDecimals: 2,
    qtyDecimals: 2,
  };

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
    liq = "—";
  let pctChangeSL = 0,
    pctChangeTP = 0;
  let cashLoss = 0,
    cashProfit = 0;

  if (currentTab === "futures") {
    const totalFee = totalVolume * TAKER_FEE * 2;
    const netRiskForPriceMove = riskAmount - totalFee;

    const allowedPriceChange =
      netRiskForPriceMove > 0
        ? (netRiskForPriceMove * entryPrice) / totalVolume
        : (riskAmount * 0.05 * entryPrice) / totalVolume;

    if (currentSide === "Long") {
      sl = entryPrice - allowedPriceChange;
      tp = entryPrice + allowedPriceChange * 2;
      liq = entryPrice * (1 - 1 / leverage + MMR);

      pctChangeSL = ((sl - entryPrice) / entryPrice) * 100;
      pctChangeTP = ((tp - entryPrice) / entryPrice) * 100;
    } else {
      sl = entryPrice + allowedPriceChange;
      tp = entryPrice - allowedPriceChange * 2;
      liq = entryPrice * (1 + 1 / leverage - MMR);

      pctChangeSL = ((entryPrice - sl) / entryPrice) * 100;
      pctChangeTP = ((entryPrice - tp) / entryPrice) * 100;
    }

    cashLoss = riskAmount;
    cashProfit =
      netRiskForPriceMove > 0
        ? netRiskForPriceMove * 2 + totalFee
        : riskAmount * 2;
  } else {
    // Расчет спот-рынка с гарантированным выравниванием знаков процентов
    const spotPriceStep = (riskAmount * entryPrice) / cost;

    sl = entryPrice - spotPriceStep;
    tp = entryPrice + spotPriceStep * 2;
    liq = "—";

    // На споте лонг всегда линеен: падение — минус, рост — плюс
    pctChangeSL = -Math.abs(((sl - entryPrice) / entryPrice) * 100);
    pctChangeTP = Math.abs(((tp - entryPrice) / entryPrice) * 100);

    cashLoss = riskAmount;
    cashProfit = riskAmount * 2;
  }

  if (sl < 0) sl = 0;
  if (liq !== "—" && liq < 0) liq = 0;

  document.getElementById("res-volume").innerText =
    `$${totalVolume.toFixed(2)}`;

  document.getElementById("pct-tp").innerText =
    `${pctChangeTP > 0 ? "+" : ""}${pctChangeTP.toFixed(2)}%`;
  document.getElementById("pct-sl").innerText =
    `${pctChangeSL > 0 ? "+" : ""}${pctChangeSL.toFixed(2)}%`;

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
}

function handlePairChange() {
  const selectedPair = document.getElementById("pair").value;
  const entryInput = document.getElementById("entry-price");
  const leverageInput = document.getElementById("leverage");

  entryInput.value = coinConfig[selectedPair].price;

  if (currentTab === "futures") {
    leverageInput.value = coinConfig[selectedPair].recLeverage;
  }

  updateLeverageBadge();
  saveToStorage();
  calculate();
}

function copyData(elementId, btnElement) {
  const valueText = document.getElementById(elementId).innerText;
  if (valueText === "—" || btnElement.closest(".disabled-element")) return;

  navigator.clipboard.writeText(valueText);

  btnElement.innerText = "Copied";
  btnElement.classList.add("copied");

  setTimeout(() => {
    btnElement.innerText = "Copy";
    btnElement.classList.remove("copied");
  }, 1200);
}

function resetTerminal() {
  localStorage.clear();

  currentTab = "futures";
  currentSide = "Long";
  currentOrderType = "limit";

  const defaultPair = "BTCUSDT";
  document.getElementById("balance").value = "100";
  document.getElementById("pair").value = defaultPair;
  document.getElementById("leverage").value =
    coinConfig[defaultPair].recLeverage;
  document.getElementById("entry-price").value = coinConfig[defaultPair].price;

  restoreTabsVisualOnly();
  setOrderType(currentOrderType);
  updateLeverageBadge();
  calculate();
}

document.getElementById("balance").addEventListener("input", saveToStorage);
document.getElementById("leverage").addEventListener("input", saveToStorage);
document.getElementById("entry-price").addEventListener("input", saveToStorage);

window.onload = () => loadFromStorage();

/* КОНЕЦ ЧАСТИ 2 */
