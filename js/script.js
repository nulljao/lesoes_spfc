window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-SBLMBTGRM4');



async function loadCSV() {
  const response = await fetch("data/lesoes.csv");
  const data = await response.text();

  const rows = data.split("\n").slice(1); // ignora cabeçalho
  const injuries = rows
    .filter(row => row.trim() !== "") // evita linhas vazias
    .map(row => {
      const [jogador, dataLesao, dataRetorno, jogosAusentes, tipo] = row.split(",");
      return { 
        jogador: jogador.trim(), 
        dataLesao: dataLesao.trim(), 
        dataRetorno: dataRetorno ? dataRetorno.trim() : "", 
        jogosAusentes: jogosAusentes.trim(), 
        tipo: tipo.trim() 
      };
    });

  return injuries;
}

// Renderizar tabela
function renderTable(injuries) {
  const tbody = document.getElementById("injuryTable");
  tbody.innerHTML = "";
  injuries.forEach(injury => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${injury.jogador}</td>
      <td>${injury.dataLesao}</td>
      <td>${injury.dataRetorno ? injury.dataRetorno : "-"}</td>
      <td>${injury.jogosAusentes}</td>
      <td>${injury.tipo}</td>
    `;
    tbody.appendChild(tr);
  });

  updateCurrentInjuries(injuries);
}


// Popular anos disponíveis
function populateYears(injuries) {
  const yearSelect = document.getElementById("year");
  const years = [...new Set(injuries.map(i => i.dataLesao.split("-")[0]))];
  yearSelect.innerHTML = `<option value="">Todos</option>`;
  years.forEach(year => {
    yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
  });
}

// Filtrar dados
function filterData(injuries) {
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;
  const onlyInjured = document.getElementById("onlyInjured").checked;

  // Se não tiver ano selecionado, usa o último disponível
  const selectedYear = year || getLastYear(injuries).toString();

  return injuries.filter(i => {
    const [y, m] = i.dataLesao.split("-");
    let matches = (y === selectedYear) && (!month || m === month);

    if (onlyInjured) {
      const today = new Date();
      if (!i.dataRetorno || i.dataRetorno.trim() === "") {
        return matches; // ainda lesionado
      }
      const retorno = new Date(i.dataRetorno);
      return matches && (retorno > today);
    }

    return matches;
    });
}


// Obter dados anuais para gráfico
function getYearlyData(injuries) {
  const year = document.getElementById("year").value || getLastYear(injuries).toString();
  const counts = Array(12).fill(0);

  injuries.forEach(i => {
    if (i.dataLesao) {
      const [y, m] = i.dataLesao.split("-");
      if (y === year) {
        const month = parseInt(m, 10);
        counts[month - 1]++;
      }
    }
  });

  return counts;
}

// Inicialização
(async function init() {
    const injuries = await loadCSV();
    populateYears(injuries);

    // Aplica filtro inicial (usa último ano se nenhum selecionado)
    const filteredInitial = filterData(injuries);
    renderTable(filteredInitial);
    setupChart(getYearlyData(injuries));
    updateChartTitle(injuries);
    renderCurrentInjuries(injuries); // continua independente
    updateFilterSummary();

  // Atualiza tabela e gráfico quando filtros mudarem
  document.getElementById("year").addEventListener("change", () => {
    const filtered = filterData(injuries);
    renderTable(filtered);
    updateChart(injuries);
    updateChartTitle(injuries);
    renderCurrentInjuries(injuries); // continua independente
    updateFilterSummary();

});

  document.getElementById("month").addEventListener("change", () => {
    const filtered = filterData(injuries);
    renderTable(filtered);
    updateChartTitle(injuries);
    renderCurrentInjuries(injuries); // continua independente
    updateFilterSummary();
});

  document.getElementById("onlyInjured").addEventListener("change", () => {
    const filtered = filterData(injuries);
    renderTable(filtered);
    renderCurrentInjuries(injuries);
    updateFilterSummary();
});
})();

// Renderizar tabela
function renderTable(injuries) {
  const tbody = document.getElementById("injuryTable");
  tbody.innerHTML = "";
  injuries.forEach(injury => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${injury.jogador}</td>
      <td>${injury.dataLesao}</td>
      <td>${injury.dataRetorno ? injury.dataRetorno : "-"}</td>
      <td>${injury.jogosAusentes}</td>
      <td>${injury.tipo}</td>
    `;
    tbody.appendChild(tr);
  });

  // Atualizar contagem de lesionados no momento
  updateCurrentInjuries(injuries);
}

// Função para contar jogadores lesionados no momento
function updateCurrentInjuries(injuries) {
  const current = injuries.filter(i => !i.dataRetorno || i.dataRetorno === "");
  document.getElementById("currentInjuries").textContent =
    `Jogadores lesionados no momento: ${current.length}`;
}

// Função para gerar dados do gráfico
function getMonthlyData(filteredInjuries) {
  const counts = Array(12).fill(0);
  filteredInjuries.forEach(i => {
    if (i.dataLesao) {
      const month = parseInt(i.dataLesao.split("-")[1], 10);
      if (!Number.isNaN(month)) counts[month - 1]++;
    }
  });
  return counts;
}


function getLastYear(injuries) {
  const years = injuries.map(i => i.dataLesao.split("-")[0]);
  return Math.max(...years.map(y => parseInt(y, 10)));
}


let injuryChart = null;

function setupChart(initialData) {
  const ctx = document.getElementById("injuryChart").getContext("2d");
  injuryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
      datasets: [{
        label: "Lesões",
        data: initialData,
        backgroundColor: "rgba(255, 0, 0, 0.75)",
        borderColor: "rgba(255, 0, 0, 0.75)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'center',
          align: 'center',
          color: '#ffffffff',
          font: { weight: 'bold' },
          formatter: value => value === 0 ? null : value
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { display: false },
          title: { display: false }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function updateChart(injuries) {
  if (!injuryChart) return;
  const yearlyCounts = getYearlyData(injuries);
  injuryChart.data.datasets[0].data = yearlyCounts;
  injuryChart.update();

}

function updateChartTitle(injuries) {
    const year = document.getElementById("year").value || getLastYear(injuries).toString();
    const titleElement = document.getElementById("chartTitle");
    titleElement.textContent = `Lesões por Mês em ${year}`;
}


function countCurrentInjuries(injuries) {
  const today = new Date();

  return injuries.filter(i => {
    if (!i.dataRetorno || i.dataRetorno.trim() === "") {
      // sem data de retorno → ainda lesionado
      return true;
    }
    const retorno = new Date(i.dataRetorno);
    return retorno > today; // retorno ainda no futuro
  }).length;
}

function renderCurrentInjuries(injuries) {
  const container = document.getElementById("currentInjuries");
  const total = countCurrentInjuries(injuries);

  container.textContent = "Jogadores lesionados no momento: " + total;
}

document.getElementById("onlyInjured").addEventListener("change", () => {
  const filtered = filterData(injuries);
  renderTable(filtered);
});

function updateFilterSummary() {
    const visibleRows = document.querySelectorAll('#injuryTable tr:not([style*="display: none"])').length;
    document.getElementById('totalRecords').textContent = visibleRows;
}

async function getLastCommit() {
  const repo = "nulljao/lesoes_spfc"; // substitua pelo seu repo
  const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`);
  const data = await response.json();
  const lastCommitDate = new Date(data[0].commit.author.date);

  // Formata a data para dd/mm/yyyy
  const formattedDate = lastCommitDate.toLocaleDateString("pt-BR");
  document.getElementById("last-update").textContent = formattedDate;
}

getLastCommit();


