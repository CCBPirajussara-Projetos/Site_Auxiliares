// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', function() {
  console.log("Página carregada:", window.location.pathname);
  
  configurarDataAtual();
  configurarSugestao();
  inicializarSeletorComuns();
  
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'mocas.html') {
    console.log("Configurando para moças");
    configurarOuvinteData('mocas');
    // Carregar dados existentes após um pequeno delay para garantir que a data está configurada
    setTimeout(() => carregarDadosExistentes('mocas'), 200);
  } else if (currentPage === 'mocos.html') {
    console.log("Configurando para moços");
    configurarOuvinteData('mocos');
    // Carregar dados existentes após um pequeno delay para garantir que a data está configurada
    setTimeout(() => carregarDadosExistentes('mocos'), 200);
  } else if (currentPage === 'relatorio.html') {
    console.log("Configurando relatório");
    configurarDataRelatorio();
  }
  
  // Configurar evento para mostrar campo de evento
  const eventoSelect = document.getElementById('eventoSelect');
  if (eventoSelect) {
    eventoSelect.addEventListener('change', mostrarCampoEvento);
  }
});

// Nova função para configurar a data no relatório
function configurarDataRelatorio() {
  const dataRelatorioInput = document.getElementById("data-relatorio");
  const urlParams = new URLSearchParams(window.location.search);
  const dataUrl = urlParams.get('data');
  
  if (dataUrl && dataRelatorioInput) {
    // Se veio com data na URL, usa essa data
    dataRelatorioInput.value = dataUrl;
    carregarRelatorio();
  } else if (dataRelatorioInput) {
    // Se não veio com data, usa a data de hoje
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    dataRelatorioInput.value = dataFormatada;
    carregarRelatorio();
  }
}