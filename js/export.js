// Função auxiliar para formatar a data (YYYY-MM-DD) para (DD/MM/YYYY)
function formatarDataBR(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Mapeamento dos meses para nomes em português
const nomeMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Função principal para exportar os dados
async function exportarAnual(anoDesejado = null) {
    if (typeof db === 'undefined') {
        alert("Erro: Variável 'db' do Firebase não está definida. Verifique a inicialização.");
        return;
    }

    // 1. Coleta e processamento dos dados
    try {
        // Assume que 'dias' está no nó raiz do banco de dados
        const snapshot = await db.ref("dias").once("value");
        const dadosDias = snapshot.val();
        
        if (!dadosDias) {
            alert("Nenhum dado encontrado para gerar o relatório anual.");
            return;
        }

        const anoProcessado = anoDesejado ? parseInt(anoDesejado) : new Date().getFullYear();
        const dadosAno = Object.entries(dadosDias)
            .filter(([data]) => data.startsWith(String(anoProcessado)))
            .map(([data, dados]) => ({
                data, 
                ...dados
            }));

        if (dadosAno.length === 0) {
            alert(`Nenhum dado encontrado para o ano de ${anoProcessado}.`);
            return;
        }

        // --- Variáveis de Estatísticas ---
        let totalReunioes = 0;
        let totalRecitativos = 0;
        let totalCongregados = 0;
        let totalRecitativosMocas = 0;
        let totalRecitativosMocos = 0;
        let totalMusicos = 0;

        const organistasDiferentes = new Set();
        const visitasMap = {}; // Armazena a contagem de visitas por comum
        const eventosLista = []; // Lista de todos os eventos com o mês
        const dadosMensais = {};

        // Variáveis para máximos (Armazena o valor e a data)
        let maxMusicos = { valor: 0, data: '' };
        let maxCongregados = { valor: 0, data: '' };
        let maxRecitativosTotais = { valor: 0, data: '' };
        let maxRecitativosMocas = { valor: 0, data: '' };
        let maxRecitativosMocos = { valor: 0, data: '' };
        let maxIndividuais = { valor: 0, data: '' };

        // --- Loop para calcular estatísticas ---
        dadosAno.forEach(dia => {
            const dataISO = dia.data;
            const dataBR = formatarDataBR(dataISO);
            const mesNumero = parseInt(dataISO.split('-')[1]);
            const mesNome = nomeMeses[mesNumero - 1];

            // Inicializa o mês
            if (!dadosMensais[mesNumero]) {
                dadosMensais[mesNumero] = {
                    nome: mesNome,
                    congregados: 0,
                    recitativos: 0,
                    reunioes: 0
                };
            }

            // Garante que os campos são tratados como números (ou 0 se vazios/inválidos)
            const parseNum = (key) => parseInt(dia[key]) || 0;
            
            // --- A. Totais e Médias ---
            const totalDia = parseNum('total_geral');
            
            // Recitativos Lado Moças = total_rec_f
            const recF = parseNum('total_rec_f'); 
            // Recitativos Lado Moços = total_rec_m
            const recM = parseNum('total_rec_m'); 
            
            const totalRecDia = recF + recM;
            const musicosDia = parseNum('musicos');
            const recIndividuais = parseNum('ind_f') + parseNum('ind_m');

            if (totalDia > 0) totalReunioes++;
            totalRecitativos += totalRecDia;
            totalCongregados += totalDia;
            totalRecitativosMocas += recF;
            totalRecitativosMocos += recM;
            totalMusicos += musicosDia;
            
            // Dados mensais
            dadosMensais[mesNumero].congregados += totalDia;
            dadosMensais[mesNumero].recitativos += totalRecDia;
            if (totalDia > 0) dadosMensais[mesNumero].reunioes++;

            // --- B. Organistas ---
            // O campo 'org' contém o nome das organistas
            if (dia.org && dia.org.trim() !== "") {
                // Se houver mais de um nome, espera-se que estejam separados por vírgula
                dia.org.split(',').forEach(nome => organistasDiferentes.add(nome.trim()));
            }

            // --- C. Máximos ---
            if (musicosDia > maxMusicos.valor) maxMusicos = { valor: musicosDia, data: dataBR };
            if (totalDia > maxCongregados.valor) maxCongregados = { valor: totalDia, data: dataBR };
            if (totalRecDia > maxRecitativosTotais.valor) maxRecitativosTotais = { valor: totalRecDia, data: dataBR };
            if (recF > maxRecitativosMocas.valor) maxRecitativosMocas = { valor: recF, data: dataBR };
            if (recM > maxRecitativosMocos.valor) maxRecitativosMocos = { valor: recM, data: dataBR };
            if (recIndividuais > maxIndividuais.valor) maxIndividuais = { valor: recIndividuais, data: dataBR };

            // --- D. Visitas ---
            // Visitas estão separadas por ", "
            if (dia.visitas) {
                dia.visitas.split(', ').forEach(visitaCompleta => {
                    const visita = visitaCompleta.trim();
                    if (visita) visitasMap[visita] = (visitasMap[visita] || 0) + 1;
                });
            }

            // --- E. Eventos ---
            // Eventos estão separados por " | "
            if (dia.eventos) {
                dia.eventos.split(' | ').forEach(evento => {
                    const eventoTrim = evento.trim();
                    if (eventoTrim) eventosLista.push({ evento: eventoTrim, mes: mesNome });
                });
            }
        });

        // --- Cálculos Finais ---
        const mediaRecitativosMocas = totalReunioes > 0 ? (totalRecitativosMocas / totalReunioes).toFixed(1) : 0;
        const mediaRecitativosMocos = totalReunioes > 0 ? (totalRecitativosMocos / totalReunioes).toFixed(1) : 0;
        const mediaCongregados = totalReunioes > 0 ? (totalCongregados / totalReunioes).toFixed(0) : 0;
        const mediaMusicos = totalReunioes > 0 ? (totalMusicos / totalReunioes).toFixed(1) : 0;
        
        // Cidades diferentes
        const cidades = new Set(Object.keys(visitasMap).map(v => v.split(' - ')[0].trim()).filter(c => c));
        
        // Ranking de comuns (top 3)
        const rankingComuns = Object.entries(visitasMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([comum, contagem]) => `${comum} (${contagem}x)`);

        // --- Geração do PDF (Usando a lógica de jspdf/autotable da resposta anterior) ---
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

        const margin = 15;
        let y = margin;
        const lineHeight = 7;
        const fontSizeTitle = 16;
        const fontSizeSection = 12;
        const fontSizeNormal = 10;

        // Título
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(fontSizeTitle);
        doc.text(`Relatório Anual - Mocidade Pirajussara (${anoProcessado})`, 105, y, { align: 'center' });
        y += lineHeight;
        doc.setLineWidth(0.5);
        doc.line(margin, y, 210 - margin, y);
        y += lineHeight;

        // Funções de formatação de seção
        const addSectionTitle = (title) => {
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(fontSizeSection);
            doc.text(title, margin, y);
            y += lineHeight * 0.7;
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(fontSizeNormal);
        };
        
        const addLine = (label, value, isBold = false) => {
            doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
            doc.text(`${label}:`, margin, y);
            doc.setFont('Helvetica', 'normal');
            doc.text(String(value), 100, y);
            y += lineHeight * 0.6;
        };

        // 1. Estatísticas Gerais
        addSectionTitle('1. Estatísticas Gerais');
        addLine("Quantidade de Reuniões Realizadas", totalReunioes);
        addLine("Total de Recitativos Entregues no ano", totalRecitativos);
        addLine("Total de Pessoas Congregadas no ano", totalCongregados);
        y += lineHeight * 0.3;

        addLine("Média de Pessoas Congregadas (por reunião)", mediaCongregados);
        addLine("Média de Recitativos Lado Moças", mediaRecitativosMocas);
        addLine("Média de Recitativos Lado Moços", mediaRecitativosMocos);
        addLine("Média de Músicos", mediaMusicos);
        y += lineHeight;
        
        // 2. Máximos Registrados
        addSectionTitle('2. Máximos Registrados');
        addLine(`Maior N° de Congregados (${maxCongregados.valor})`, maxCongregados.data);
        addLine(`Maior N° de Recitativos Totais (${maxRecitativosTotais.valor})`, maxRecitativosTotais.data);
        addLine(`Maior N° de Recitativos Moças (${maxRecitativosMocas.valor})`, maxRecitativosMocas.data);
        addLine(`Maior N° de Recitativos Moços (${maxRecitativosMocos.valor})`, maxRecitativosMocos.data);
        addLine(`Maior N° de Recitativos Individuais (${maxIndividuais.valor})`, maxIndividuais.data);
        addLine(`Maior N° de Músicos (${maxMusicos.valor})`, maxMusicos.data);
        y += lineHeight;

        // 3. Organistas
        addSectionTitle('3. Organistas');
        addLine("Quantidade de Organistas Diferentes", organistasDiferentes.size);
        doc.text("Lista de Organistas:", margin, y);
        y += lineHeight * 0.6;
        doc.text(Array.from(organistasDiferentes).join(', '), margin, y, { maxWidth: 180 });
        y += (Math.ceil(Array.from(organistasDiferentes).join(', ').length / 100) * lineHeight);
        y += lineHeight * 0.3;

        // 4. Visitas
        addSectionTitle('4. Visitas');
        addLine("Total de Visitas Registradas (Comum)", Object.keys(visitasMap).length);
        addLine("Cidades Diferentes Visitantes", cidades.size);
        doc.text("Ranking das 3 Comuns Mais Visitantes:", margin, y);
        y += lineHeight * 0.6;
        rankingComuns.forEach(item => {
            doc.text(`- ${item}`, margin + 5, y);
            y += lineHeight * 0.6;
        });
        y += lineHeight * 0.3;

        // 5. Eventos
        addSectionTitle('5. Eventos Especiais');
        if (eventosLista.length > 0) {
            // Se precisar de uma nova página
            if (y > 270) { 
                 doc.addPage();
                 y = margin;
            }
            eventosLista.forEach(item => {
                doc.text(`- ${item.evento} (Mês: ${item.mes})`, margin, y, { maxWidth: 180 });
                y += lineHeight * 0.6;
            });
        } else {
            doc.text("Nenhum evento especial registrado.", margin, y);
            y += lineHeight * 0.6;
        }
        y += lineHeight * 0.3;

        // 6. Resumo Mensal (Tabela)
        addSectionTitle('6. Resumo Mensal');
        y += 2; 

        const resMeses = Object.values(dadosMensais).filter(mes => mes.reunioes > 0);

        if (resMeses.length > 0) {
            const head = [['Mês', 'Reuniões', 'Média Congregados', 'Média Recitativos']];
            const body = resMeses.map(mes => [
                mes.nome,
                mes.reunioes,
                mes.reunioes > 0 ? (mes.congregados / mes.reunioes).toFixed(0) : 0,
                mes.reunioes > 0 ? (mes.recitativos / mes.reunioes).toFixed(1) : 0
            ]);

            doc.autoTable({
                startY: y,
                head: head,
                body: body,
                styles: { fontSize: 9, cellPadding: 1, overflow: 'linebreak' },
                headStyles: { fillColor: [8, 60, 108], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [240, 245, 250] },
                margin: { left: margin, right: margin }
            });

            y = doc.autoTable.previous.finalY + lineHeight;
        } else {
            doc.text("Nenhum dado mensal para o ano atual.", margin, y);
            y += lineHeight * 0.6;
        }


        // Salvar o documento
        doc.save(`Relatorio_Anual_Mocidade_${anoProcessado}.pdf`);
        
    } catch (error) {
        console.error("Erro na exportação anual:", error);
        alert("Erro ao gerar o relatório. Verifique o console para mais detalhes.");
    }
}

