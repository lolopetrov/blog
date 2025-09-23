const eurBgn = 1.95583; 
let chart;
let btcBgnRate = 0; // текущ курс BTC → BGN

async function fetchBTC() {
  try {
    let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur");
    let data = await response.json();
    let btcEur = data.bitcoin.eur;
    btcBgnRate = btcEur * eurBgn;
    let bgnBtc = 1 / btcBgnRate;

    document.getElementById("btc-bgn").textContent = `1 BTC = ${btcBgnRate.toFixed(2)} BGN`;
    document.getElementById("bgn-btc").textContent = `1 BGN = ${bgnBtc.toFixed(8)} BTC`;
  } catch (error) {
    document.getElementById("btc-bgn").textContent = "⚠️ Грешка при зареждане";
  }
}

async function fetchChart(days = 7) {
  let response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=${days}`);
  let data = await response.json();
  let prices = data.prices.map(p => [new Date(p[0]), p[1] * eurBgn]);

  let labels, values;
  if (days === 1) {
    labels = prices.map(p => p[0].toLocaleTimeString("bg-BG", { hour: '2-digit', minute: '2-digit' }));
  } else {
    labels = prices.map(p => p[0].toLocaleDateString("bg-BG", { day: '2-digit', month: '2-digit' }));
  }
  values = prices.map(p => p[1]);

  if (chart) chart.destroy();
  let ctx = document.getElementById("btcChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: `BTC/BGN (${days === 1 ? "24ч" : days + " дни"})`,
        data: values,
        borderColor: "#2b6cb0",
        backgroundColor: "rgba(43,108,176,0.1)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { title: { display: true, text: "Цена в BGN" }},
        x: { title: { display: true, text: days === 1 ? "Час" : "Дата" }}
      }
    }
  });
}

// Калкулатор
function convertToBTC() {
  let bgn = parseFloat(document.getElementById("bgnInput").value);
  if (!isNaN(bgn) && btcBgnRate > 0) {
    let btc = bgn / btcBgnRate;
    document.getElementById("btcInput").value = btc.toFixed(8);
    document.getElementById("calcResult").textContent = `${bgn} BGN ≈ ${btc.toFixed(8)} BTC`;
  }
}

function convertToBGN() {
  let btc = parseFloat(document.getElementById("btcInput").value);
  if (!isNaN(btc) && btcBgnRate > 0) {
    let bgn = btc * btcBgnRate;
    document.getElementById("bgnInput").value = bgn.toFixed(2);
    document.getElementById("calcResult").textContent = `${btc} BTC ≈ ${bgn.toFixed(2)} BGN`;
  }
}

// Първоначално зареждане
fetchBTC();
fetchChart(7);
setInterval(fetchBTC, 60000);
