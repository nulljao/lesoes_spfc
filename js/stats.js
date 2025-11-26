// ...existing code...
const CSV_PATH = 'data/lesoes.csv';

const elements = {
  year: document.getElementById('year'),
  month: document.getElementById('month'),
  onlyInjured: document.getElementById('onlyInjured'),
  tableBody: document.getElementById('injuryTable'),
  totalRecords: document.getElementById('totalRecords'),
  topPlayers: document.getElementById('topPlayers'),
  topByGames: document.getElementById('topByGames'),
  topByDays: document.getElementById('topByDays'),
  lastUpdate: document.getElementById('last-update')
};

let allRecords = [];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const headers = lines.shift().split(',');
  return lines.map(line => {
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (cols[i]||'').trim());
    return obj;
  });
}

function isoToDisplay(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function populateYearOptions(records) {
  const years = Array.from(new Set(records.map(r => r.dataLesao.split('-')[0]))).sort((a,b) => b - a);
  elements.year.innerHTML = '<option value="">Todos</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
}

function renderTable(records) {
  elements.tableBody.innerHTML = records.map(r => `
    <tr>
      <td>${r.jogador}</td>
      <td>${isoToDisplay(r.dataLesao)}</td>
      <td>${r.dataRetorno ? isoToDisplay(r.dataRetorno) : ''}</td>
      <td>${r.jogosAusentes || ''}</td>
      <td>${r.tipo}</td>
    </tr>
  `).join('');
}

function applyFilters() {
  const year = elements.year.value;
  const month = elements.month.value;
  const onlyInjured = elements.onlyInjured.checked;

  const filtered = allRecords.filter(r => {
    if (year) {
      const y = r.dataLesao.split('-')[0];
      if (y !== year) return false;
    }
    if (month) {
      const m = r.dataLesao.split('-')[1];
      if (m !== month) return false;
    }
    if (onlyInjured) {
      if (r.dataRetorno) return false; // mostrar apenas sem data de retorno
    }
    return true;
  });

  renderTable(filtered);
  updateFilterSummary(filtered);
  // updateTopPlayers(filtered);
  // updateTopByGamesLost(filtered);
  // updateTopByDaysOut(filtered);
}

function updateStatsByYear(year) {
  const records = year
    ? allRecords.filter(r => r.dataLesao && r.dataLesao.split('-')[0] === year)
    : allRecords;

  updateTopPlayers(records);
  updateTopByGamesLost(records);
  updateTopByDaysOut(records);
}

function updateFilterSummary(filtered) {
  elements.totalRecords.textContent = filtered.length;
}

function updateTopPlayers(filtered) {
  const counts = {};
  filtered.forEach(r => counts[r.jogador] = (counts[r.jogador] || 0) + 1);
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0,5);
  elements.topPlayers.innerHTML = sorted.length
    ? sorted.map(([name,count]) => `<li>${name} | ${count} lesões</li>`).join('')
    : '<li>Nenhum registro</li>';
}

function updateTopByGamesLost(filtered) {
  const sums = {};
  filtered.forEach(r => {
    const n = parseInt(r.jogosAusentes, 10) || 0;
    sums[r.jogador] = (sums[r.jogador] || 0) + n;
  });
  const sorted = Object.entries(sums).sort((a,b) => b[1] - a[1]).slice(0,5);
  elements.topByGames.innerHTML = sorted.length
    ? sorted.map(([name,sum]) => `<li>${name} | ${sum} jogos</li>`).join('')
    : '<li>Nenhum registro</li>';
}

function updateTopByDaysOut(filtered) {
  const sums = {};
  const today = new Date();
  filtered.forEach(r => {
    const start = r.dataLesao ? new Date(r.dataLesao) : null;
    const end = r.dataRetorno ? new Date(r.dataRetorno) : today;
    if (!start || isNaN(start)) return;
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    sums[r.jogador] = (sums[r.jogador] || 0) + Math.max(0, days);
  });
  const sorted = Object.entries(sums).sort((a,b) => b[1] - a[1]).slice(0,5);
  elements.topByDays.innerHTML = sorted.length
    ? sorted.map(([name,days]) => `<li>${name} | ${days} dias</li>`).join('')
    : '<li>Nenhum registro</li>';
}

function setLastUpdate() {
  const now = new Date();
  elements.lastUpdate.textContent = now.toLocaleString();
}

async function init() {
  try {
    const resp = await fetch(CSV_PATH);
    const text = await resp.text();
    allRecords = parseCSV(text);
    populateYearOptions(allRecords);
    setLastUpdate();
    applyFilters();
    updateStatsByYear(elements.year.value);

  } catch (e) {
    console.error('Erro carregando CSV', e);
    elements.lastUpdate.textContent = 'erro ao carregar';
  }
}

elements.year.addEventListener('change', applyFilters);
elements.month.addEventListener('change', applyFilters);
elements.onlyInjured.addEventListener('change', applyFilters);

document.addEventListener('DOMContentLoaded', init);

