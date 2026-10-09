// === FUNÇÕES DE RELATÓRIO ===
function carregarRelatorio() {
  const data = document.getElementById("data-relatorio").value;
  if (!data) return alert("Selecione uma data!");

  db.ref("dias/" + data).once("value", (snapshot) => {
    const val = snapshot.val();
    const saida = document.getElementById("saida");
    
    if (val && saida) {
      saida.innerText = gerarRelatorioTexto(data, val);
    } else if (saida) {
      saida.innerText = "Sem dados salvos para este dia.";
    }
  });
}

function gerarRelatorioTexto(data, val) {
  const dataBR = new Date(data + "T03:00:00").toLocaleDateString("pt-BR");
  
  // Usar os totais salvos no banco de dados
  const totalRecitativosMocas = parseInt(val.total_rec_f) || 0;
  const totalRecitativosMocos = parseInt(val.total_rec_m) || 0;
  const totalIndividuais = (parseInt(val.ind_f) || 0) + (parseInt(val.ind_m) || 0);
  const totalRecitativos = totalRecitativosMocas + totalRecitativosMocos + totalIndividuais;
  
  // Formatar eventos para exibição
  const eventosTexto = val.eventos ? `${val.eventos.replace(/\|/g, ', ')}` : 'Eventos: -';
   // === LER PALAVRAS (nova lista) ===
  let palavrasTexto = 'Palavras: -';
  if (val.palavras) {
    try {
      const palavrasArray = JSON.parse(val.palavras);
      if (Array.isArray(palavrasArray) && palavrasArray.length > 0) {
        // Se for array de objetos com referencia e texto, exibir só a referência
        // ou se for array de strings (como estamos salvando), exibir cada uma
        if (typeof palavrasArray[0] === 'string') {
          palavrasTexto = `Palavras:\n  ${palavrasArray.join('\n  ')}`;
        } else if (typeof palavrasArray[0] === 'object' && palavrasArray[0].referencia) {
          // Caso tenha objeto com referencia e texto, exibir só a referência
          palavrasTexto = `Palavras:\n  ${palavrasArray.map(p => p.referencia).join('\n  ')}`;
        } else {
          palavrasTexto = `Palavras: ${JSON.stringify(palavrasArray)}`;
        }
      }
    } catch (e) {
      palavrasTexto = `Palavras: ${val.palavras}`;
    }
  } else if (val.palavra) {
    // Fallback para o campo antigo (string)
    palavrasTexto = `Palavra: ${val.palavra}`;
  }

  return `
📅 Data: ${dataBR}

Recitativos Moças:
  1ª Continuação: ${val.fila1_f || 0}
  2ª Continuação: ${val.fila2_f || 0}
  3ª Continuação: ${val.fila3_f || 0}
  4ª Continuação: ${val.fila4_f || 0}
  5ª Continuação: ${val.fila5_f || 0}
  Individuais: ${val.ind_f || 0}
  
  Recitativos Moços:
  1ª Continuação: ${val.fila1_m || 0}
  2ª Continuação: ${val.fila2_m || 0}
  3ª Continuação: ${val.fila3_m || 0}
  4ª Continuação: ${val.fila4_m || 0}
  5ª Continuação: ${val.fila5_m || 0}
  Individuais: ${val.ind_m || 0}
  
  Total Recitativos Moças: ${totalRecitativosMocas}
  Total Recitativos Moços: ${totalRecitativosMocos}
  Recitativos Individuais: ${totalIndividuais}
  Total de Recitativos: ${totalRecitativos}
  
  Organista: ${val.org || "-"}
  Músicos: ${val.musicos || "-"}
  Total geral de congregados: ${val.total_geral || 0}

${palavrasTexto}

Visitas: ${val.visitas || "Nenhuma"}

${eventosTexto}

==============================
DEUS ABENÇOE A TODOS
==============================`.trim();
}
