// Dados iniciais extraídos da solicitação e da Ficha DOCX
const DEFAULT_PATRIMONIOS = [
  { patrimonio: "1385224", kitNumero: "Kit 01" },
  { patrimonio: "1385229", kitNumero: "Kit 02" },
  { patrimonio: "1385228", kitNumero: "Kit 03" },
  { patrimonio: "1385231", kitNumero: "Kit 04" },
  { patrimonio: "1385219", kitNumero: "Kit 05" },
  { patrimonio: "1385222", kitNumero: "Kit 06" },
  { patrimonio: "1385230", kitNumero: "Kit 07" }
];

const DEFAULT_ALUNOS = [
  { numero: 1, nome: "André da Cunha Mossoleto" },
  { numero: 2, nome: "Augusto Cesar Almeida Militz" },
  { numero: 3, nome: "Bárbara Timporim de Souza" },
  { numero: 4, nome: "Betina Beluci Adamo Menezes" },
  { numero: 5, nome: "Carlos Ubiratan Nunes Rossi" },
  { numero: 6, nome: "Davi José Oliveira da Silva" },
  { numero: 7, nome: "Evellyn Dias Narciso" },
  { numero: 8, nome: "Felipe Fernandes Salvioni" },
  { numero: 9, nome: "Gabriel Constantino Garcia" },
  { numero: 10, nome: "Guilherme Batista da Silva" },
  { numero: 11, nome: "Hellena da Silva Valerio" },
  { numero: 12, nome: "Herichy Miguel Oliveira Brizoti" },
  { numero: 13, nome: "Ingrid Moreira Azevedo" },
  { numero: 14, nome: "Isabelle Galinari" },
  { numero: 15, nome: "João Bernardo dos Santos Freitas" },
  { numero: 16, nome: "Julia Araguê Pirola dos Santos" },
  { numero: 17, nome: "Kauã da Silva Rodrigues" },
  { numero: 18, nome: "Livia Buzzo Silva" },
  { numero: 19, nome: "Luiza Caberlin de Carvalho Settemo Cervantes" },
  { numero: 20, nome: "Maria Antonia Pádua de Paula" },
  { numero: 21, nome: "Maria Clara Cunha Oliveira" },
  { numero: 22, nome: "Mariana Scatena" },
  { numero: 23, nome: "Nickolas Paganini Nascimento" },
  { numero: 24, nome: "Nicolle Santos Trentini" },
  { numero: 25, nome: "Pedro Augusto da Silva Garcia" },
  { numero: 26, nome: "Pedro Henrique Lima da Silva" },
  { numero: 27, nome: "Pedro Lucas de Lima Gonçalves do Nascimento" },
  { numero: 28, nome: "Rogério Augustini da Silva" },
  { numero: 29, nome: "Romeu Ravagnani Pontes" },
  { numero: 30, nome: "Sabryna Vasconcelos de Brito" },
  { numero: 31, nome: "Victor Hugo Paulino" },
  { numero: 32, nome: "Yuri Gabriel da Silva Santana" }
];

const CHECKLIST_ITEMS_TEMPLATE = [
  {
    id: "corpo",
    item: "Corpo da Câmera",
    descricao: "Canon EOS R50 (LCD articulado, botões, sensor limpo, tampa do corpo)"
  },
  {
    id: "cartao",
    item: "Cartão de Memória",
    descricao: "Cartão SD (Limpo/Formatado na câmera, sem trincas)"
  },
  {
    id: "lente1",
    item: "Lente 1 (Zoom)",
    descricao: "Objetiva Canon RF-S 18-45mm f/4.5-6.3 IS STM (com tampas frontal e traseira)"
  },
  {
    id: "lente2",
    item: "Lente 2 (Macro)",
    descricao: "Objetiva Canon RF 100mm f/2.8 L Macro IS USM (com tampas frontal e traseira)"
  },
  {
    id: "bateria",
    item: "Bateria",
    descricao: "Bateria Recarregável Canon LP-E17 (Carga a 100%)"
  },
  {
    id: "carregador",
    item: "Carregador",
    descricao: "Carregador LC-E17 + Cabo de Alimentação"
  },
  {
    id: "cordao",
    item: "Cordão / Alça",
    descricao: "Correia de Pescoço Canon presa firmemente aos ilhós do corpo"
  },
  {
    id: "caixa",
    item: "Caixa de Transporte",
    descricao: "Caixa/Maleta organizadora para guardar o kit com segurança"
  }
];

const STORAGE_KEY = "canon_r50_checklist_v1";

let state = {
  selectedPatrimonio: DEFAULT_PATRIMONIOS[0].patrimonio,
  alunos: [...DEFAULT_ALUNOS],
  kits: {}
};

function createEmptyKitData(patrimonio, kitNumero) {
  const itens = {};
  CHECKLIST_ITEMS_TEMPLATE.forEach(t => {
    itens[t.id] = {
      retirada: "", // "OK" | "AVARIADO" | ""
      devolucao: "", // "OK" | "AVARIADO" | ""
      detalheAvaria: ""
    };
  });

  const dias = [];
  for (let i = 1; i <= 9; i++) {
    dias.push({
      dia: `Dia ${i}`,
      data: "",
      retiradaHora: "",
      retiradaAluno: "",
      retiradaProf: "",
      devolucaoHora: "",
      devolucaoAluno: "",
      devolucaoProf: "",
      observacoes: ""
    });
  }

  return {
    patrimonio,
    kitNumero,
    statusManual: "disponivel", // "disponivel" | "em_uso" | "avaria"
    alunoResponsavel: "",
    turmaGrupo: "",
    integrantesGrupo: [],
    itens,
    dias
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.kits) {
        state.selectedPatrimonio = parsed.selectedPatrimonio || DEFAULT_PATRIMONIOS[0].patrimonio;
        state.alunos = parsed.alunos && parsed.alunos.length ? parsed.alunos : [...DEFAULT_ALUNOS];
        state.kits = parsed.kits;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar dados do navegador:", e);
  }

  // Garantir que todos os 7 patrimônios existam
  DEFAULT_PATRIMONIOS.forEach(p => {
    if (!state.kits[p.patrimonio]) {
      state.kits[p.patrimonio] = createEmptyKitData(p.patrimonio, p.kitNumero);
    }
  });
}

function saveState(toastMsg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
  if (toastMsg) showToast(toastMsg);
}

function computeKitStatus(kit) {
  // Verifica se há algum item marcado como AVARIADO
  const hasAvariaItem = Object.values(kit.itens).some(
    i => i.retirada === "AVARIADO" || i.devolucao === "AVARIADO"
  );
  if (hasAvariaItem || kit.statusManual === "avaria") return "avaria";

  // Verifica se há dia com retirada preenchida mas sem devolução
  const hasOpenDay = kit.dias.some(
    d => (d.retiradaHora || d.retiradaAluno) && !d.devolucaoHora && !d.devolucaoAluno
  );
  if (hasOpenDay || kit.statusManual === "em_uso") return "em_uso";

  return "disponivel";
}

function getStatusLabel(status) {
  if (status === "em_uso") return "Em Uso (Retirada)";
  if (status === "avaria") return "Com Avaria";
  return "Disponível";
}

// Navegação de Abas
function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `tab-${tabId}`);
  });
}

function openCameraFicha(patrimonio) {
  state.selectedPatrimonio = patrimonio;
  saveState();
  switchTab("ficha");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Renderização Geral
function renderAll() {
  renderStats();
  renderDashboardCards();
  renderFichaSelector();
  renderFichaContent();
  renderAlunosTable();
}

function renderStats() {
  const kitsList = Object.values(state.kits);
  let disp = 0, emUso = 0, avaria = 0;

  kitsList.forEach(k => {
    const st = computeKitStatus(k);
    if (st === "disponivel") disp++;
    else if (st === "em_uso") emUso++;
    else if (st === "avaria") avaria++;
  });

  document.getElementById("stat-total").textContent = kitsList.length;
  document.getElementById("stat-disp").textContent = disp;
  document.getElementById("stat-uso").textContent = emUso;
  document.getElementById("stat-avaria").textContent = avaria;
}

function renderDashboardCards() {
  const container = document.getElementById("cameras-grid");
  container.innerHTML = "";

  DEFAULT_PATRIMONIOS.forEach(({ patrimonio }) => {
    const kit = state.kits[patrimonio];
    const status = computeKitStatus(kit);
    const statusLabel = getStatusLabel(status);

    const okRetiradaCount = Object.values(kit.itens).filter(i => i.retirada === "OK").length;
    const okDevolucaoCount = Object.values(kit.itens).filter(i => i.devolucao === "OK").length;
    const diasUsados = kit.dias.filter(d => d.data || d.retiradaHora || d.retiradaAluno).length;

    const integrantesText = kit.integrantesGrupo && kit.integrantesGrupo.length > 0
      ? `+ ${kit.integrantesGrupo.length} integrante(s): ${kit.integrantesGrupo.join(", ")}`
      : (kit.turmaGrupo ? `Turma/Grupo: ${kit.turmaGrupo}` : "Nenhum grupo vinculado");

    const card = document.createElement("div");
    card.className = `camera-card status-${status}`;
    card.innerHTML = `
      <div>
        <div class="camera-card-header">
          <div>
            <div class="kit-number">${escapeHtml(kit.kitNumero || "Kit Canon EOS R50")}</div>
            <div class="patrimonio-tag">📷 Patr. ${escapeHtml(kit.patrimonio)}</div>
          </div>
          <span class="status-badge ${status}">${statusLabel}</span>
        </div>

        <div class="camera-assignment" style="margin-top: 0.9rem;">
          <div class="label">Aluno Responsável</div>
          <div class="value">${kit.alunoResponsavel ? escapeHtml(kit.alunoResponsavel) : "<span style='color:var(--text-muted)'>Não atribuído</span>"}</div>
          <div class="sub-value">${escapeHtml(integrantesText)}</div>
        </div>

        <div class="camera-checklist-summary">
          <span>📤 Retirada: <strong>${okRetiradaCount}/8 OK</strong></span>
          <span>📥 Devolução: <strong>${okDevolucaoCount}/8 OK</strong></span>
          <span>📅 Dias: <strong>${diasUsados}/9</strong></span>
        </div>
      </div>

      <div class="camera-card-actions">
        <button class="btn btn-primary btn-block" onclick="openCameraFicha('${kit.patrimonio}')">
          📋 Abrir Checklist / Ficha
        </button>
        <button class="btn btn-secondary" title="Imprimir esta ficha" onclick="printSingleKit('${kit.patrimonio}')">
          🖨️
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFichaSelector() {
  const pillsContainer = document.getElementById("patrimonio-pills");
  pillsContainer.innerHTML = "";

  DEFAULT_PATRIMONIOS.forEach(({ patrimonio }) => {
    const kit = state.kits[patrimonio];
    const status = computeKitStatus(kit);
    const btn = document.createElement("button");
    btn.className = `patrimonio-pill ${state.selectedPatrimonio === patrimonio ? "active" : ""}`;
    btn.onclick = () => {
      state.selectedPatrimonio = patrimonio;
      saveState();
    };
    btn.innerHTML = `
      <span class="dot ${status}"></span>
      <span>${escapeHtml(kit.kitNumero)}: <strong>${escapeHtml(patrimonio)}</strong></span>
    `;
    pillsContainer.appendChild(btn);
  });
}

function renderFichaContent() {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit) return;

  // Cabeçalho da Ficha selecionada
  document.getElementById("current-patrimonio-display").textContent = kit.patrimonio;
  document.getElementById("ficha-kit-numero").value = kit.kitNumero || "";
  document.getElementById("ficha-status-manual").value = kit.statusManual || "disponivel";
  document.getElementById("ficha-turma-grupo").value = kit.turmaGrupo || "";

  // Select de Aluno Responsável
  const selectResp = document.getElementById("ficha-aluno-responsavel");
  selectResp.innerHTML = `<option value="">-- Selecione o Aluno Responsável (1 a 32) --</option>`;
  state.alunos.forEach(a => {
    const label = `${String(a.numero).padStart(2, "0")} - ${a.nome}`;
    const opt = document.createElement("option");
    opt.value = a.nome;
    opt.textContent = label;
    if (kit.alunoResponsavel === a.nome) opt.selected = true;
    selectResp.appendChild(opt);
  });

  // Select para adicionar integrantes ao grupo
  const selectAddMember = document.getElementById("ficha-add-integrante");
  selectAddMember.innerHTML = `<option value="">+ Adicionar outro aluno da lista ao grupo/dupla...</option>`;
  state.alunos.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.nome;
    opt.textContent = `${String(a.numero).padStart(2, "0")} - ${a.nome}`;
    selectAddMember.appendChild(opt);
  });

  // Chips de integrantes do grupo
  const chipsContainer = document.getElementById("integrantes-chips");
  chipsContainer.innerHTML = "";
  (kit.integrantesGrupo || []).forEach((nome, idx) => {
    const chip = document.createElement("span");
    chip.className = "student-chip";
    chip.innerHTML = `
      👤 ${escapeHtml(nome)}
      <button type="button" title="Remover integrante" onclick="removeIntegrante(${idx})">&times;</button>
    `;
    chipsContainer.appendChild(chip);
  });

  // Seção 2: Tabela de Itens do Kit
  const tbodyItens = document.getElementById("checklist-items-tbody");
  tbodyItens.innerHTML = "";

  CHECKLIST_ITEMS_TEMPLATE.forEach(template => {
    const itemState = kit.itens[template.id] || { retirada: "", devolucao: "", detalheAvaria: "" };
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><div class="item-name">${escapeHtml(template.item)}</div></td>
      <td>
        <div class="item-desc">${escapeHtml(template.descricao)}</div>
        ${
          itemState.retirada === "AVARIADO" || itemState.devolucao === "AVARIADO" || itemState.detalheAvaria
            ? `<input type="text" class="input-compact" style="margin-top:0.4rem; border-color:#f87171;"
                 placeholder="Descreva a avaria ou observação deste item..."
                 value="${escapeHtml(itemState.detalheAvaria || "")}"
                 onchange="updateItemNote('${template.id}', this.value)">`
            : ""
        }
      </td>
      <td>
        <div class="check-toggle-group">
          <button type="button" class="check-btn ok ${itemState.retirada === "OK" ? "selected" : ""}"
            onclick="setItemCheck('${template.id}', 'retirada', 'OK')">✓ OK</button>
          <button type="button" class="check-btn avariado ${itemState.retirada === "AVARIADO" ? "selected" : ""}"
            onclick="setItemCheck('${template.id}', 'retirada', 'AVARIADO')">! Avariado</button>
        </div>
      </td>
      <td>
        <div class="check-toggle-group">
          <button type="button" class="check-btn ok ${itemState.devolucao === "OK" ? "selected" : ""}"
            onclick="setItemCheck('${template.id}', 'devolucao', 'OK')">✓ OK</button>
          <button type="button" class="check-btn avariado ${itemState.devolucao === "AVARIADO" ? "selected" : ""}"
            onclick="setItemCheck('${template.id}', 'devolucao', 'AVARIADO')">! Avariado</button>
        </div>
      </td>
    `;
    tbodyItens.appendChild(tr);
  });

  // Seção 3: Registro Diário (Dia 1 a Dia 9)
  const tbodyDias = document.getElementById("daily-log-tbody");
  tbodyDias.innerHTML = "";

  // Datalist com nomes dos alunos para facilitar preenchimento do visto
  const datalistId = "alunos-datalist";
  let datalist = document.getElementById(datalistId);
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = datalistId;
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = state.alunos
    .map(a => `<option value="${escapeHtml(a.nome)}">Nº ${a.numero}</option>`)
    .join("");

  kit.dias.forEach((d, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="daily-label">${escapeHtml(d.dia)}</td>
      <td style="width: 135px;">
        <input type="date" class="input-compact" value="${escapeHtml(d.data)}"
          onchange="updateDailyLog(${idx}, 'data', this.value)">
      </td>
      <td>
        <div class="daily-subgrid">
          <div class="time-with-btn">
            <input type="time" class="input-compact" value="${escapeHtml(d.retiradaHora)}"
              onchange="updateDailyLog(${idx}, 'retiradaHora', this.value)">
            <button type="button" class="btn-now" title="Usar hora atual e preencher aluno responsável"
              onclick="fillQuickAction(${idx}, 'retirada')">Agora</button>
          </div>
          <input type="text" list="${datalistId}" class="input-compact" placeholder="Visto Aluno"
            value="${escapeHtml(d.retiradaAluno)}"
            onchange="updateDailyLog(${idx}, 'retiradaAluno', this.value)">
          <input type="text" class="input-compact" placeholder="Visto Prof."
            value="${escapeHtml(d.retiradaProf)}"
            onchange="updateDailyLog(${idx}, 'retiradaProf', this.value)">
        </div>
      </td>
      <td>
        <div class="daily-subgrid">
          <div class="time-with-btn">
            <input type="time" class="input-compact" value="${escapeHtml(d.devolucaoHora)}"
              onchange="updateDailyLog(${idx}, 'devolucaoHora', this.value)">
            <button type="button" class="btn-now" title="Usar hora atual e preencher aluno responsável"
              onclick="fillQuickAction(${idx}, 'devolucao')">Agora</button>
          </div>
          <input type="text" list="${datalistId}" class="input-compact" placeholder="Visto Aluno"
            value="${escapeHtml(d.devolucaoAluno)}"
            onchange="updateDailyLog(${idx}, 'devolucaoAluno', this.value)">
          <input type="text" class="input-compact" placeholder="Visto Prof."
            value="${escapeHtml(d.devolucaoProf)}"
            onchange="updateDailyLog(${idx}, 'devolucaoProf', this.value)">
        </div>
      </td>
      <td>
        <input type="text" class="input-compact" placeholder="Observações / Avarias..."
          value="${escapeHtml(d.observacoes)}"
          onchange="updateDailyLog(${idx}, 'observacoes', this.value)">
      </td>
    `;
    tbodyDias.appendChild(tr);
  });
}

// Manipuladores de Eventos da Ficha
function updateKitHeader(field, value) {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit) return;
  kit[field] = value;
  saveState("Dados do kit atualizados!");
}

function addIntegrante(nome) {
  if (!nome) return;
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit.integrantesGrupo) kit.integrantesGrupo = [];
  if (!kit.integrantesGrupo.includes(nome)) {
    kit.integrantesGrupo.push(nome);
    saveState("Integrante adicionado ao grupo!");
  }
  document.getElementById("ficha-add-integrante").value = "";
}

function removeIntegrante(idx) {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit || !kit.integrantesGrupo) return;
  kit.integrantesGrupo.splice(idx, 1);
  saveState("Integrante removido.");
}

function setItemCheck(itemId, stage, value) {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit) return;
  const current = kit.itens[itemId][stage];
  kit.itens[itemId][stage] = current === value ? "" : value;
  saveState();
}

function updateItemNote(itemId, note) {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit) return;
  kit.itens[itemId].detalheAvaria = note;
  saveState("Observação de avaria registrada.");
}

function markAllItems(stage, value) {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit) return;
  CHECKLIST_ITEMS_TEMPLATE.forEach(t => {
    kit.itens[t.id][stage] = value;
  });
  if (stage === "retirada") kit.statusManual = "em_uso";
  if (stage === "devolucao") kit.statusManual = "disponivel";
  saveState(`Todos os itens marcados como ${value} na ${stage === "retirada" ? "Retirada" : "Devolução"}!`);
}

function updateDailyLog(dayIdx, field, value) {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit || !kit.dias[dayIdx]) return;
  kit.dias[dayIdx][field] = value;
  saveState();
}

function fillQuickAction(dayIdx, type) {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit || !kit.dias[dayIdx]) return;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  const dayObj = kit.dias[dayIdx];
  if (!dayObj.data) {
    dayObj.data = `${yyyy}-${mm}-${dd}`;
  }

  if (type === "retirada") {
    dayObj.retiradaHora = `${hh}:${min}`;
    if (!dayObj.retiradaAluno && kit.alunoResponsavel) {
      dayObj.retiradaAluno = kit.alunoResponsavel;
    }
    kit.statusManual = "em_uso";
    saveState(`Retirada registrada no ${dayObj.dia} às ${hh}:${min}!`);
  } else {
    dayObj.devolucaoHora = `${hh}:${min}`;
    if (!dayObj.devolucaoAluno && (dayObj.retiradaAluno || kit.alunoResponsavel)) {
      dayObj.devolucaoAluno = dayObj.retiradaAluno || kit.alunoResponsavel;
    }
    kit.statusManual = "disponivel";
    saveState(`Devolução registrada no ${dayObj.dia} às ${hh}:${min}!`);
  }
}

function addExtraDay() {
  const kit = state.kits[state.selectedPatrimonio];
  if (!kit) return;
  const nextNum = kit.dias.length + 1;
  kit.dias.push({
    dia: `Dia ${nextNum}`,
    data: "",
    retiradaHora: "",
    retiradaAluno: "",
    retiradaProf: "",
    devolucaoHora: "",
    devolucaoAluno: "",
    devolucaoProf: "",
    observacoes: ""
  });
  saveState(`Dia ${nextNum} adicionado à ficha!`);
}

function clearCurrentKitFicha() {
  const patr = state.selectedPatrimonio;
  const kit = state.kits[patr];
  if (!confirm(`Tem certeza que deseja limpar os dados da ficha da câmera Patrimônio ${patr}?`)) return;
  state.kits[patr] = createEmptyKitData(patr, kit.kitNumero);
  saveState(`Ficha do patrimônio ${patr} limpa com sucesso.`);
}

// Aba de Alunos (32 Alunos)
function renderAlunosTable() {
  const search = (document.getElementById("student-search")?.value || "").toLowerCase();
  const tbody = document.getElementById("students-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const kitsList = Object.values(state.kits);

  state.alunos
    .filter(a => a.nome.toLowerCase().includes(search) || String(a.numero).includes(search))
    .forEach(aluno => {
      // Verifica em quais câmeras o aluno é responsável ou integrante ou tem visto
      const linkedKits = kitsList.filter(k =>
        k.alunoResponsavel === aluno.nome ||
        (k.integrantesGrupo && k.integrantesGrupo.includes(aluno.nome)) ||
        k.dias.some(d => d.retiradaAluno === aluno.nome || d.devolucaoAluno === aluno.nome)
      );

      const kitsBadges = linkedKits.length
        ? linkedKits
            .map(
              k =>
                `<button class="btn btn-sm btn-secondary" style="margin-right:4px;" onclick="openCameraFicha('${k.patrimonio}')">
                  📷 ${escapeHtml(k.kitNumero)} (${escapeHtml(k.patrimonio)})
                 </button>`
            )
            .join("")
        : `<span style="color:var(--text-muted); font-size:0.85rem;">Sem câmera vinculada no momento</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="student-num">#${String(aluno.numero).padStart(2, "0")}</td>
        <td style="font-weight: 600;">${escapeHtml(aluno.nome)}</td>
        <td>${kitsBadges}</td>
        <td style="text-align: right;">
          <select class="input-compact" style="width: auto; display: inline-block;"
            onchange="assignStudentToKit('${escapeHtml(aluno.nome)}', this.value); this.value='';">
            <option value="">Atribuir à Câmera...</option>
            ${DEFAULT_PATRIMONIOS.map(
              p => `<option value="${p.patrimonio}">${p.kitNumero} - Patr. ${p.patrimonio}</option>`
            ).join("")}
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

function assignStudentToKit(studentName, patrimonio) {
  if (!patrimonio || !state.kits[patrimonio]) return;
  const kit = state.kits[patrimonio];
  if (!kit.alunoResponsavel) {
    kit.alunoResponsavel = studentName;
    saveState(`${studentName} definido(a) como Aluno Responsável do Patr. ${patrimonio}!`);
  } else if (kit.alunoResponsavel !== studentName) {
    if (!kit.integrantesGrupo) kit.integrantesGrupo = [];
    if (!kit.integrantesGrupo.includes(studentName)) {
      kit.integrantesGrupo.push(studentName);
    }
    saveState(`${studentName} adicionado(a) ao grupo da câmera Patr. ${patrimonio}!`);
  }
}

// Impressão fiel ao DOCX
function buildPrintHtmlForKit(kit) {
  const formatDateBR = iso => {
    if (!iso) return "____/____/2026";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const grupoExtra =
    kit.integrantesGrupo && kit.integrantesGrupo.length
      ? `${kit.turmaGrupo ? kit.turmaGrupo + " | " : ""}${kit.integrantesGrupo.join(", ")}`
      : kit.turmaGrupo || "__________________________________________________";

  const rowsItens = CHECKLIST_ITEMS_TEMPLATE.map(t => {
    const st = kit.itens[t.id] || {};
    const retOk = st.retirada === "OK" ? "[ X ] OK" : "[   ] OK";
    const retAv = st.retirada === "AVARIADO" ? "[ X ] Avariado" : "[   ] Avariado";
    const devOk = st.devolucao === "OK" ? "[ X ] OK" : "[   ] OK";
    const devAv = st.devolucao === "AVARIADO" ? "[ X ] Avariado" : "[   ] Avariado";
    const nota = st.detalheAvaria ? `<br><small><em>Obs: ${escapeHtml(st.detalheAvaria)}</em></small>` : "";

    return `
      <tr>
        <td><strong>${escapeHtml(t.item)}</strong></td>
        <td>${escapeHtml(t.descricao)}${nota}</td>
        <td class="print-center">${retOk} &nbsp; ${retAv}</td>
        <td class="print-center">${devOk} &nbsp; ${devAv}</td>
      </tr>
    `;
  }).join("");

  const rowsDias = kit.dias
    .map(d => {
      const dataStr = formatDateBR(d.data);
      const retHora = d.retiradaHora || "____:____";
      const retAluno = d.retiradaAluno || "__________";
      const retProf = d.retiradaProf || "__________";
      const devHora = d.devolucaoHora || "____:____";
      const devAluno = d.devolucaoAluno || "__________";
      const devProf = d.devolucaoProf || "__________";
      return `
        <tr>
          <td class="print-center"><strong>${escapeHtml(d.dia)}</strong></td>
          <td class="print-center">${escapeHtml(dataStr)}</td>
          <td class="print-center">${escapeHtml(retHora)} | ${escapeHtml(retAluno)} | ${escapeHtml(retProf)}</td>
          <td class="print-center">${escapeHtml(devHora)} | ${escapeHtml(devAluno)} | ${escapeHtml(devProf)}</td>
          <td>${escapeHtml(d.observacoes || "")}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="print-sheet">
      <div class="print-header">
        <h2>📋 FICHA DE CHECKLIST E CONTROLE DE EQUIPAMENTO FOTOGRÁFICO</h2>
        <p>Unidade Curricular: Fotografia Digital &nbsp;|&nbsp; Kit Equipamento: Canon EOS R50 &nbsp;|&nbsp; Patrimônio: ${escapeHtml(kit.patrimonio)}</p>
      </div>

      <div class="print-section-title">1. Identificação do Kit e do Aluno</div>
      <div class="print-id-box">
        <div class="print-id-row">
          <span><strong>Nº da Caixa / Kit:</strong> [ ${escapeHtml(kit.kitNumero || "________")} ]</span>
          <span><strong>Nº de Patrimônio:</strong> [ <strong>${escapeHtml(kit.patrimonio)}</strong> ]</span>
        </div>
        <div class="print-id-row">
          <span><strong>Nome do Aluno Responsável:</strong> ${escapeHtml(kit.alunoResponsavel || "__________________________________________________")}</span>
        </div>
        <div class="print-id-row" style="margin-bottom:0;">
          <span><strong>Turma / Grupo:</strong> ${escapeHtml(grupoExtra)}</span>
        </div>
      </div>

      <div class="print-section-title">2. Itens do Kit (Checklist de Verificação de Componentes)</div>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 18%;">Item</th>
            <th style="width: 42%;">Componente / Descrição</th>
            <th style="width: 20%;">Estado na Retirada (Início)</th>
            <th style="width: 20%;">Estado na Devolução (Fim)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsItens}
        </tbody>
      </table>

      <div class="print-section-title">3. Registro Diário de Retirada e Devolução (Vistos duplos: Aluno e Professor)</div>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 9%;">Dia / Aula</th>
            <th style="width: 12%;">Data</th>
            <th style="width: 31%;">📤 RETIRADA (SAÍDA)<br><small>Hora | Visto Aluno | Visto Prof.</small></th>
            <th style="width: 31%;">📥 DEVOLUÇÃO (RETORNO)<br><small>Hora | Visto Aluno | Visto Prof.</small></th>
            <th style="width: 17%;">Observações / Avarias</th>
          </tr>
        </thead>
        <tbody>
          ${rowsDias}
        </tbody>
      </table>
    </div>
  `;
}

function printSingleKit(patrimonio) {
  const targetPatr = patrimonio || state.selectedPatrimonio;
  const kit = state.kits[targetPatr];
  if (!kit) return;
  const printArea = document.getElementById("print-area");
  printArea.innerHTML = buildPrintHtmlForKit(kit);
  window.print();
}

function printAllKits() {
  const printArea = document.getElementById("print-area");
  printArea.innerHTML = DEFAULT_PATRIMONIOS.map(p => buildPrintHtmlForKit(state.kits[p.patrimonio])).join("");
  window.print();
}

// Exportar / Importar Backup JSON
function exportBackupJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const a = document.createElement("a");
  a.href = dataStr;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `checklist_canon_r50_${dateStr}.json`;
  a.click();
  showToast("Backup JSON exportado com sucesso!");
}

function importBackupJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && imported.kits) {
        state = imported;
        saveState("Backup restaurado com sucesso!");
      } else {
        alert("Arquivo JSON inválido.");
      }
    } catch (err) {
      alert("Erro ao ler o arquivo JSON.");
    }
  };
  reader.readAsText(file);
}

// Utilitários
function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderAll();
});
