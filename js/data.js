// === FUNÇÕES DE DATA ===
function configurarDataAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  const dataFormatada = `${ano}-${mes}-${dia}`;

  const dataInput = document.getElementById("data");
  if (dataInput) {
    dataInput.value = dataFormatada;
    setTimeout(() => {
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'mocas.html') {
        carregarDadosExistentes('mocas');
      } else if (currentPage === 'mocos.html') {
        carregarDadosExistentes('mocos');
      }
    }, 100);
  }
}

// === FUNÇÃO PARA CARREGAR DADOS EXISTENTES ===
function carregarDadosExistentes(lado) {
  const dataInput = document.getElementById("data");
  if (!dataInput || !dataInput.value) {
    console.log("Input de data não encontrado ou sem valor.");
    return;
  }

  const dataSelecionada = dataInput.value;
  
  console.log("Carregando dados para:", dataSelecionada, "Lado:", lado);
  
  db.ref("dias/" + dataSelecionada).once("value", (snapshot) => {
    const val = snapshot.val();
    
    // Limpar comuns e eventos atuais antes de carregar
    comunsIncluidas = [];
    eventosIncluidos = [];
    
    // Lista de todos os campos que podem existir
    const todosCampos = [
      "fila1_f", "fila2_f", "fila3_f", "fila4_f", "fila5_f", "ind_f", "org", "totalf", "total_rec_f",
      "fila1_m", "fila2_m", "fila3_m", "fila4_m", "fila5_m", "ind_m", "musicos", "totalm", "total_rec_m",
      "painosso", "orientada", "palavra", "total_geral"
    ];

    // Limpar todos os campos primeiro
    todosCampos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    
    if (val) {
      console.log("Dados encontrados:", val);
      
      // Carregar campos gerais (compartilhados)
      const camposGerais = ["painosso", "orientada", "palavra", "total_geral"];
      camposGerais.forEach((id) => {
        const el = document.getElementById(id);
        if (el && val[id] !== undefined && val[id] !== null) {
          el.value = val[id];
        }
      });

      // Carregar campos específicos do lado (se existirem)
      let camposLado = [];
      if (lado === 'mocas') {
        camposLado = ["fila1_f", "fila2_f", "fila3_f", "fila4_f", "fila5_f", "ind_f", "org", "totalf", "total_rec_f"];
      } else { // 'mocos'
        camposLado = ["fila1_m", "fila2_m", "fila3_m", "fila4_m", "fila5_m", "ind_m", "musicos", "totalm", "total_rec_m"];
      }

      camposLado.forEach((id) => {
        const el = document.getElementById(id);
        if (el && val[id] !== undefined && val[id] !== null) {
          el.value = val[id];
        }
      });
      
      // Carregar comuns incluídas
      if (val.visitas && val.visitas.trim() !== "") {
        comunsIncluidas = val.visitas.split(', ').filter(v => v.trim() !== '');
      }
      
      // Carregar eventos incluídos
      if (val.eventos && val.eventos.trim() !== "") {
        eventosIncluidos = val.eventos.split(' | ').filter(e => e.trim() !== '');
      }

      // Carregar palavras
      if (val.palavras) {
        try {
          const palavras = JSON.parse(val.palavras);
          if (Array.isArray(palavras)) {
            palavrasIncluidas = palavras;
          }
        } catch (e) {
          console.warn("Erro ao parsear palavras:", e);
        }
      }
      atualizarListaPalavras();
      
    } else {
      console.log("Nenhum dado encontrado para", dataSelecionada);
    }
    
    // Atualizar as listas
    atualizarListaComuns();
    atualizarListaEventos();
  });
}

// === CONFIGURAR OUVINTE DE MUDANÇA DE DATA ===
function configurarOuvinteData(lado) {
  const dataInput = document.getElementById("data");
  if (dataInput) {
    dataInput.addEventListener('change', function() {
      console.log("Data alterada para:", this.value);
      carregarDadosExistentes(lado);
    });
  }
}

// === FUNÇÕES DE SALVAR DADOS ===
async function salvar(lado) {
  const data = document.getElementById("data").value;
  if (!data) return alert("Selecione uma data!");

  const dados = {};
  let campos = [];
  
  if (lado === 'mocas') {
    campos = ["fila1_f", "fila2_f", "fila3_f", "fila4_f", "fila5_f", "ind_f", "org", "totalf"];
  } else {
    campos = ["fila1_m", "fila2_m", "fila3_m", "fila4_m", "fila5_m", "ind_m", "musicos", "totalm"];
  }
  
  // Campos gerais (compartilhados)
  campos = campos.concat(["palavra"]);

  campos.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      dados[id] = el.value;
    }
  });

  // --- MESCLAGEM DE VISITAS (não sobrescrever) ---
  let visitasExistentes = [];
  try {
    const snapshot = await db.ref("dias/" + data + "/visitas").once("value");
    const val = snapshot.val();
    if (val && typeof val === 'string' && val.trim() !== '') {
      visitasExistentes = val.split(', ').filter(v => v.trim() !== '');
    } else if (Array.isArray(val)) {
      visitasExistentes = val;
    }
  } catch (e) {
    console.warn("Erro ao buscar visitas existentes:", e);
  }

  // Combinar com a lista local (comunsIncluidas)
  const visitasCombinadas = [...new Set([...visitasExistentes, ...comunsIncluidas])];
  dados.visitas = visitasCombinadas.join(', ');

  // --- MESCLAGEM DE EVENTOS (não sobrescrever) ---
  let eventosExistentes = [];
  try {
    const snapshot = await db.ref("dias/" + data + "/eventos").once("value");
    const val = snapshot.val();
    if (val && typeof val === 'string' && val.trim() !== '') {
      eventosExistentes = val.split(' | ').filter(e => e.trim() !== '');
    } else if (Array.isArray(val)) {
      eventosExistentes = val;
    }
  } catch (e) {
    console.warn("Erro ao buscar eventos existentes:", e);
  }

  const eventosCombinados = [...new Set([...eventosExistentes, ...eventosIncluidos])];
  dados.eventos = eventosCombinados.join(' | ');

  // --- Cálculo de totais (já existente) ---
  const somar = (...ids) => ids.reduce((soma, id) => soma + (parseInt(document.getElementById(id)?.value) || 0), 0);
  
  let totalGeral = 0;

  if (lado === 'mocas') {
    const total_rec_f = somar("fila1_f", "fila2_f", "fila3_f", "fila4_f", "fila5_f");
    totalGeral = parseInt(document.getElementById("totalf")?.value) || 0;
    dados.total_rec_f = total_rec_f;
    dados.totalf = totalGeral;
  } else { // 'mocos'
    const total_rec_m = somar("fila1_m", "fila2_m", "fila3_m", "fila4_m", "fila5_m");
    totalGeral = parseInt(document.getElementById("totalm")?.value) || 0;
    dados.total_rec_m = total_rec_m;
    dados.totalm = totalGeral;
  }

  try {
    // Buscar totais atuais do Firebase para somar total_geral
    const snapshot = await db.ref("dias/" + data).once("value");
    const dadosAtuais = snapshot.val() || {};

    let totalMocasBD = parseInt(dadosAtuais.totalf) || 0;
    let totalMocosBD = parseInt(dadosAtuais.totalm) || 0;

    if (lado === 'mocas') {
      totalMocasBD = totalGeral;
    } else {
      totalMocosBD = totalGeral;
    }
    
    dados.total_geral = totalMocasBD + totalMocosBD;

    // --- ADICIONE ESTA LINHA AQUI ---
    dados.palavras = JSON.stringify(palavrasIncluidas);
    // ---------------------------------

    // Usar update para mesclar com os dados existentes
    await db.ref("dias/" + data).update(dados);
    
    alert("Dados salvos com sucesso!");
    
  } catch (error) {
    alert("Erro ao salvar: " + error.message);
  }
}