let currentTab = "futures";
let currentSide = "Long";
let currentOrderType = "limit";

const coinConfig = {
  BTCUSDT: { price: 60000, priceDecimals: 2, qtyDecimals: 5 },
  ETHUSDT: { price: 3300, priceDecimals: 2, qtyDecimals: 4 },
  SOLUSDT: { price: 140, priceDecimals: 2, qtyDecimals: 3 },
  XRPUSDT: { price: 0.55, priceDecimals: 4, qtyDecimals: 1 },
};

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
  calculate();
}

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

  entryInput.value = coinConfig[selectedPair].price;
  calculate();
}

function formatSmartValue(value, decimals, currentInputPrice) {
  if (value === "—") return "—";
  if (currentInputPrice >= 1000) {
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
  document.getElementById("res-volume").innerText =
    `$${totalVolume.toFixed(2)}`;

  const freeMargin = balance - cost;
  const remainingTrades = Math.floor(freeMargin / cost);
  document.getElementById("res-margin-free").innerText =
    `$${freeMargin.toFixed(2)}`;
  document.getElementById("margin-trades").innerText =
    `Запас на ${remainingTrades} сделки`;

  const riskAmount = balance * 0.02;
  document.getElementById("risk-cash").innerText = `$${riskAmount.toFixed(2)}`;

  const allowedPriceChange = (riskAmount * entryPrice) / (cost * leverage);

  let sl = 0,
    tp = 0,
    liq = 0;

  if (currentSide === "Long") {
    sl = entryPrice - allowedPriceChange;
    tp = entryPrice + allowedPriceChange * 2;
    liq = entryPrice * (1 - 1 / leverage + 0.004);
  } else {
    sl = entryPrice + allowedPriceChange;
    tp = entryPrice - allowedPriceChange * 2;
    liq = entryPrice * (1 + 1 / leverage - 0.004);
  }

  if (sl < 0) sl = 0;
  if (liq < 0) liq = 0;

  const pctChangeSL = ((sl - entryPrice) / entryPrice) * 100;
  const pctChangeTP = ((tp - entryPrice) / entryPrice) * 100;

  document.getElementById("pct-tp").innerText =
    `${pctChangeTP > 0 ? "+" : ""}${pctChangeTP.toFixed(2)}%`;
  document.getElementById("pct-sl").innerText =
    `${pctChangeSL > 0 ? "+" : ""}${pctChangeSL.toFixed(2)}%`;

  document.getElementById("res-cost").innerText = cost.toFixed(2);
  document.getElementById("res-qty").innerText = qty.toFixed(
    config.qtyDecimals,
  );

  document.getElementById("res-tp").innerText = formatSmartValue(
    tp,
    config.priceDecimals,
    entryPrice,
  );
  document.getElementById("res-sl").innerText = formatSmartValue(
    sl,
    config.priceDecimals,
    entryPrice,
  );

  if (currentTab === "futures") {
    document.getElementById("res-liq").innerText = formatSmartValue(
      liq,
      config.priceDecimals,
      entryPrice,
    );
  } else {
    document.getElementById("res-liq").innerText = "—";
  }
}

function handlePairChange() {
  const selectedPair = document.getElementById("pair").value;
  const entryInput = document.getElementById("entry-price");
  entryInput.value = coinConfig[selectedPair].price;
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

window.onload = () => switchTab("futures");
