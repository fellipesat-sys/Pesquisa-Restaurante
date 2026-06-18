export function exportToCSV(data: any[], filename = "respostas_pesquisa.csv") {
  if (data.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  // Cabeçalhos em Português
  const headers = [
    "Data e Hora",
    "Nome do Cliente",
    "Atendimento",
    "Comida",
    "Ambiente",
    "Voltaria?",
    "Comentários/Sugestões"
  ];

  // Mapeia os dados para as linhas do CSV
  const rows = data.map(item => {
    const dataFormatada = item.created_at
      ? new Date(item.created_at).toLocaleString("pt-BR")
      : "N/A";

    return [
      dataFormatada,
      item.cliente_nome || "Anônimo",
      item.pergunta_atendimento || "",
      item.pergunta_comida || "",
      item.pergunta_ambiente || "",
      item.pergunta_retorno || "",
      item.comentario || ""
    ];
  });

  // Semicólon (;) é o separador padrão de CSV que o Excel em Português reconhece diretamente
  const csvContent = [
    headers.join(";"),
    ...rows.map(row => 
      row.map(val => {
        // Escapa aspas duplas internas duplicando-as
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(";")
    )
  ].join("\n");

  // Adiciona a marca de ordem de byte UTF-8 (BOM) para garantir acentuação correta no Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
