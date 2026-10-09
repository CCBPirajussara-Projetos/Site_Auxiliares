// === FUNÇÕES DE NAVEGAÇÃO ===
function mostrarLado(lado) {
  if (lado === 'moças') {
    window.location.href = 'mocas.html';
  } else {
    window.location.href = 'mocos.html';
  }
}

function voltarSelecao() {
  window.location.href = 'selecao.html';
}

function irParaRecitativo() {
  window.location.href = 'recitativo.html';
}

function irParaRelatorio() {
  // Obter a data atual no formato YYYY-MM-DD
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  const dataFormatada = `${ano}-${mes}-${dia}`;
  
  // Ir para o relatório com a data de hoje
  window.location.href = `relatorio.html?data=${dataFormatada}`;
}

function irParaRelatorioComData() {
  const data = document.getElementById("data").value;
  if (!data) {
    // Se não há data selecionada, usa a data de hoje
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    window.location.href = `relatorio.html?data=${dataFormatada}`;
  } else {
    window.location.href = `relatorio.html?data=${data}`;
  }
}