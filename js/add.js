// === VARIÁVEIS GLOBAIS ===
const comunsPorCidade = {
  taboao: [
    "Jardim Saint Moritz", "Jardim Elizabeth", "Cidade Intercap", "Parque Marabá",
    "Parque São Joaquim", "Parque Laguna", "Vila Iasi - Central", "Jardim Maria Rosa",
    "Jardim Ouro Preto", "Vila Pazini", "Jardim São Judas Tadeu", "Jardim Clementino"
  ],
  embu: [
    "Capuava", "Itatuba - Parque São Leonardo", "Jardim Ângela", "Jardim Arabutam", 
    "Jardim da Luz", "Jardim dos Moraes", "Jardim Magaly", "Jardim Mimás", "Jardim Nossa Senhora de Fátima", 
    "Jardim Pinheirinho", "Jardim Presidente Kennedy", "Jardim Santa Clara", "Jardim Santa Luzia", 
    "Jardim Santa Tereza", "Jardim Santo Antônio", "Jardim São Luiz", "Jardim São Marcos", "Jardim Sílvia", 
    "Jardim Tomé", "Jardim Valo Verde", "Jardim Vista Alegre", "Ressaca - Fazenda Atalaia", "Vila Isis Cristina", 
    "Vila Real do Moinho Velho"
  ]
};

let comunsIncluidas = [];
let eventosIncluidos = [];

// === FUNÇÕES DE VISITAS (SELECTS) ===
function configurarSelecaoComuns() {
  const cidadeSelect = document.getElementById('cidadeSelect');
  const comumSelect = document.getElementById('comumSelect');
  const campoOutraCidade = document.getElementById('campoOutraCidade');
  const outraCidadeInput = document.getElementById('outraCidade');
  const outraComumInput = document.getElementById('outraComum');
  const incluirBtn = document.getElementById('incluirComumBtn');

  if (!cidadeSelect || !comumSelect || !incluirBtn) return;

  // Quando a cidade muda
  cidadeSelect.addEventListener('change', function() {
    const cidade = this.value;
    
    // Limpa e desabilita o select de comum
    comumSelect.innerHTML = '<option value="">Selecione a comum</option>';
    comumSelect.disabled = true;
    incluirBtn.disabled = true;
    
    // Mostra/oculta campo de "Outra Cidade"
    if (campoOutraCidade) {
      if (cidade === 'outra') {
        campoOutraCidade.style.display = 'block';
      } else {
        campoOutraCidade.style.display = 'none';
        if (outraCidadeInput) outraCidadeInput.value = '';
        if (outraComumInput) outraComumInput.value = '';
      }
    }

    // Se não for "outra", carrega as comuns da cidade selecionada
    if (cidade && cidade !== 'outra' && comunsPorCidade[cidade]) {
      comumSelect.disabled = false;
      comunsPorCidade[cidade].forEach(comum => {
        const option = document.createElement('option');
        option.value = comum;
        option.textContent = comum;
        comumSelect.appendChild(option);
      });
    }
  });

  // Quando a comum muda
  comumSelect.addEventListener('change', function() {
    // Habilita o botão Incluir apenas se ambos selects estiverem preenchidos
    const cidadeVal = cidadeSelect.value;
    const comumVal = this.value;
    
    if (cidadeVal === 'outra') {
      // Para "Outra Cidade", verifica se os campos estão preenchidos
      const outraCidadeVal = outraCidadeInput ? outraCidadeInput.value.trim() : '';
      const outraComumVal = outraComumInput ? outraComumInput.value.trim() : '';
      incluirBtn.disabled = !(outraCidadeVal && outraComumVal);
    } else {
      incluirBtn.disabled = !(cidadeVal && comumVal);
    }
  });

  // Para "Outra Cidade", verifica os campos de input
  if (outraCidadeInput && outraComumInput) {
    const verificarOutraCidade = () => {
      if (cidadeSelect.value === 'outra') {
        const cidadeVal = outraCidadeInput.value.trim();
        const comumVal = outraComumInput.value.trim();
        incluirBtn.disabled = !(cidadeVal && comumVal);
      }
    };
    
    outraCidadeInput.addEventListener('input', verificarOutraCidade);
    outraComumInput.addEventListener('input', verificarOutraCidade);
  }

  // Inicializa estado
  comumSelect.disabled = true;
  incluirBtn.disabled = true;
  if (campoOutraCidade) campoOutraCidade.style.display = 'none';
}

function incluirComum() {
  const cidadeSelect = document.getElementById('cidadeSelect');
  const comumSelect = document.getElementById('comumSelect');
  const outraCidadeInput = document.getElementById('outraCidade');
  const outraComumInput = document.getElementById('outraComum');
  
  if (!cidadeSelect || !comumSelect) return;
  
  const cidade = cidadeSelect.value;
  const comum = comumSelect.value;
  
  if (!cidade) {
    alert('Selecione uma cidade!');
    return;
  }

  let visitaCompleta = '';
  
  if (cidade === 'outra') {
    const outraCidade = outraCidadeInput ? outraCidadeInput.value.trim() : '';
    const outraComum = outraComumInput ? outraComumInput.value.trim() : '';
    
    if (!outraCidade || !outraComum) {
      alert('Preencha o nome da Cidade e da Comum para "Outra".');
      return;
    }
    
    visitaCompleta = `${outraCidade} - ${outraComum}`;
    
    // Limpa campos
    if (outraCidadeInput) outraCidadeInput.value = '';
    if (outraComumInput) outraComumInput.value = '';
  } else {
    if (!comum) {
      alert('Selecione uma comum!');
      return;
    }
    visitaCompleta = `${formatarNomeCidade(cidade)} - ${comum}`;
  }
  
  if (visitaCompleta && !comunsIncluidas.includes(visitaCompleta)) {
    comunsIncluidas.push(visitaCompleta);
    comunsIncluidas.sort();
    atualizarListaComuns();
    
    // Limpa seleções
    cidadeSelect.value = '';
    comumSelect.innerHTML = '<option value="">Selecione a comum</option>';
    comumSelect.disabled = true;
    document.getElementById('incluirComumBtn').disabled = true;
    
    // Esconde campo de outra cidade se estiver visível
    const campoOutraCidade = document.getElementById('campoOutraCidade');
    if (campoOutraCidade) campoOutraCidade.style.display = 'none';
  } else if (visitaCompleta) {
    alert('Visita já incluída.');
  }
}

function formatarNomeCidade(codigo) {
  const nomes = {
    'taboao': 'Taboão da Serra',
    'embu': 'Embu das Artes'
  };
  return nomes[codigo] || codigo;
}

function atualizarListaComuns() {
  const container = document.getElementById('comunsSelecionadas');
  
  if (!container) return;
  
  if (comunsIncluidas.length === 0) {
    container.innerHTML = '<p style="margin: 0; color: #666; font-style: italic;">Nenhuma comum incluída</p>';
    return;
  }
  
  container.innerHTML = '';
  
  comunsIncluidas.forEach((comum, index) => {
    const div = document.createElement('div');
    div.className = 'comum-item';
    div.innerHTML = `
      <span>${comum}</span>
      <button type="button" class="remover-comum" onclick="removerComum(${index})">×</button>
    `;
    container.appendChild(div);
  });
}

function removerComum(index) {
  comunsIncluidas.splice(index, 1);
  atualizarListaComuns();
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', function() {
  configurarSelecaoComuns(); // Configura os selects de cidade/comum
  atualizarListaComuns();
  configurarSugestao();
  
  // Inicializa eventos (mantenha suas funções existentes)
  if (typeof mostrarCampoEvento === 'function') mostrarCampoEvento();
  if (typeof atualizarListaEventos === 'function') atualizarListaEventos();
});


function incluirVisitaPorPesquisa() {
    const pesquisaInput = document.getElementById('comumPesquisaInput');
    const outraCidadeInput = document.getElementById('outraCidadeInput'); // Campo renomeado
    const outraComumInput = document.getElementById('outraComum');
    
    let visitaCompleta = '';
    
    const termo = pesquisaInput.value.trim();

    if (!termo) {
        alert('Digite ou selecione uma comum!');
        return;
    }

    if (termo === 'Outra') {
        const outraCidade = outraCidadeInput ? outraCidadeInput.value.trim() : '';
        const outraComum = outraComumInput ? outraComumInput.value.trim() : '';
        
        if (!outraCidade || !outraComum) {
            alert('Preencha o nome da Cidade e da Comum para "Outra".');
            return;
        }
        
        visitaCompleta = `${outraCidade} - ${outraComum}`;
        
        if (outraCidadeInput) outraCidadeInput.value = '';
        if (outraComumInput) outraComumInput.value = '';
        if (document.getElementById('outraComumInput')) document.getElementById('outraComumInput').style.display = 'none';

    } else {
        // Se o valor for preenchido pela pesquisa (Cidade - Comum)
        visitaCompleta = termo;
    }
    
    if (visitaCompleta && !comunsIncluidas.includes(visitaCompleta)) {
        comunsIncluidas.push(visitaCompleta);
        comunsIncluidas.sort();
        atualizarListaComuns();
    } else if (visitaCompleta) {
        alert('Visita já incluída.');
    }
    
    // Resetar campos de seleção
    pesquisaInput.value = '';
    document.getElementById('incluirComumBtn').disabled = true;
}

function atualizarListaComuns() {
  const container = document.getElementById('comunsSelecionadas');
  
  if (!container) return;
  
  if (comunsIncluidas.length === 0) {
    container.innerHTML = '<p style="margin: 0; color: #666; font-style: italic;">Nenhuma comum incluída</p>';
    return;
  }
  
  container.innerHTML = '';
  
  comunsIncluidas.forEach((comum, index) => {
    const div = document.createElement('div');
    div.className = 'comum-item';
    div.innerHTML = `
      <span>${comum}</span>
      <button type="button" class="remover-comum" onclick="removerComum(${index})">×</button>
    `;
    container.appendChild(div);
  });
}

function removerComum(index) {
  comunsIncluidas.splice(index, 1);
  atualizarListaComuns();
}

// === FUNÇÕES DE "OUTROS EVENTOS" ===
function mostrarCampoEvento() {
  const sel = document.getElementById('eventoSelect');
  const campo = document.getElementById('campoEventoExtra');
  const desc = document.getElementById('descricaoEvento');
  const btn = document.getElementById('incluirEventoBtn');

  if (!sel || !campo || !btn) return;

  if (sel.value) {
    campo.style.display = 'block';
    btn.disabled = false;
    // Placeholder condicional
    if (desc) {
      desc.placeholder = sel.value === 'outros' ? 'Descreva o evento' : 'Detalhes (opcional)';
    }
  } else {
    campo.style.display = 'none';
    btn.disabled = true;
    if (desc) desc.value = '';
  }
}

function incluirEvento() {
  const sel = document.getElementById('eventoSelect');
  const desc = document.getElementById('descricaoEvento');

  if (!sel) return alert('Elemento de evento não encontrado.');

  const val = sel.value;
  if (!val) return alert('Selecione um evento.');

  // Mapeamento amigável para exibição
  const labels = {
    despedidaCasal: 'Despedida de casal',
    apresentacaoMusicos: 'Apresentação de músicos',
    apresentacaoAuxiliar: 'Apresentação de auxiliar',
    outros: 'Outros'
  };

  let texto = '';
  const detalhe = desc && desc.value ? desc.value.trim() : '';

  if (val === 'outros') {
    if (!detalhe) return alert('Descreva o evento em "Outros".');
    texto = `Outros - ${detalhe}`;
  } else {
    texto = labels[val] + (detalhe ? ` — ${detalhe}` : '');
  }

  if (!eventosIncluidos.includes(texto)) {
    eventosIncluidos.push(texto);
    atualizarListaEventos();
  } else {
    alert('Evento já incluído.');
  }

  // limpar campos e esconder
  if (desc) desc.value = '';
  sel.value = '';
  mostrarCampoEvento();
}

function atualizarListaEventos() {
  const container = document.getElementById('eventosSelecionados');
  if (!container) return;

  if (eventosIncluidos.length === 0) {
    container.innerHTML = '<p style="margin: 0; color: #666; font-style: italic;">Nenhum evento incluído</p>';
    return;
  }

  container.innerHTML = '';

  eventosIncluidos.forEach((evento, index) => {
    const div = document.createElement('div');
    div.className = 'evento-item';
    div.innerHTML = `
      <span>${evento}</span>
      <button type="button" class="remover-evento" onclick="removerEvento(${index})">×</button>
    `;
    container.appendChild(div);
  });
}

function removerEvento(index) {
  eventosIncluidos.splice(index, 1);
  atualizarListaEventos();
}

// === FUNÇÕES DE SUGESTÃO ===
function configurarSugestao() {
  const btnSugestao = document.getElementById("btnSugestao");
  const blocoSugestao = document.getElementById("blocoSugestao");
  const btnEnviarSugestao = document.getElementById("btnEnviarSugestao");
  const textoSugestao = document.getElementById("textoSugestao");
  const msgSugestao = document.getElementById("msgSugestao");

  if (btnSugestao && blocoSugestao) {
    // Mostra ou esconde o bloco
    btnSugestao.addEventListener("click", () => {
      blocoSugestao.classList.toggle("hidden");
      if (msgSugestao) msgSugestao.textContent = "";
    });

    // Envia a sugestão para o Firebase
    if (btnEnviarSugestao) {
      btnEnviarSugestao.addEventListener("click", () => {
        const sugestao = textoSugestao.value.trim();
        if (sugestao === "") {
          if (msgSugestao) {
            msgSugestao.textContent = "Por favor, escreva uma sugestão.";
            msgSugestao.style.color = "#dc3545";
          }
          return;
        }

        const hoje = new Date();
        const data = hoje.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
        const novaSugestao = {
          texto: sugestao,
          data: data,
        };

        // salva em "sugestoes/<timestamp>"
        db.ref("sugestoes").push(novaSugestao)
          .then(() => {
            if (msgSugestao) {
              msgSugestao.textContent = "Sugestão enviada com sucesso!";
              msgSugestao.style.color = "green";
            }
            if (textoSugestao) textoSugestao.value = "";
            setTimeout(() => { blocoSugestao.classList.add("hidden"); }, 1500);
          })
          .catch(() => {
            if (msgSugestao) {
              msgSugestao.textContent = "Erro ao enviar sugestão. Tente novamente.";
              msgSugestao.style.color = "#dc3545";
            }
          });
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  atualizarListaComuns();
  atualizarListaEventos();
  configurarSugestao();
});