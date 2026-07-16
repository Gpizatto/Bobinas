// Constantes API
const API_BASE_URL = "https://bobinas.onrender.com";

function gerarSequencial() {
  const chave = "SEQ_BOBINA";
  let atual = parseInt(localStorage.getItem(chave) || "0", 10);
  atual++;
  localStorage.setItem(chave, atual);
  return String(atual).padStart(4, "0");
}

function gerarCodigoBobina({ tipoPapel, peso, largura, gramatura, seqCustom }) {
  const tipos = {
    "OffSet": "PO",
    "Kraft Natural": "KN",
    "Kraft Branco": "KB",
    "Kraft Monolúcido": "KM",
    "BOPP Branco": "BB",
    "BOPP Metalizado": "BM",
    "Glassine": "GL",
    "Seda": "SD",
    "Monolúcido": "MO",
    "Glasspel": "GP",
    "Papel barreira gordura": "BG",
    "Filme Plástico": "PL",
    "Off White": "OW",
    "Bobina Papel Alumínio Térmico": "AT",
    "Bobina Papel Metalizado": "PM",
    "Bobina Papel Acoplado": "PA"
  };

  const tipo = tipos[tipoPapel] || "XX";

  const pes = Math.round(peso || 0).toString().padStart(3, "0");
  const larg = Math.round(largura || 0).toString().padStart(2, "0");
  const gram = Math.round(gramatura || 0).toString().padStart(2, "0");

  const cor = "Z";
  const seq = seqCustom || gerarSequencial();


  return `${tipo}${pes}${larg}${gram}${cor}${seq}`;
}

// === STATUS DA BOBINA (fonte única de verdade) ===
// Status automático (derivado da movimentação/saldo):
//   está fora (possui dataSaida) -> EM USO  (mesmo com saldo baixo/zero)
//   voltou e saldo (peso) <= 0    -> FINALIZADA
//   caso contrário                -> DISPONÍVEL
function statusAutomatico(bobina) {
  if (bobina && bobina.dataSaida) return "EM USO";
  const peso = parseFloat(bobina && bobina.peso) || 0;
  if (peso <= 0) return "FINALIZADA";
  return "DISPONÍVEL";
}

// Status exibido. O status manual "INATIVA" tem prioridade sobre o automático.
function calcularStatusBobina(bobina) {
  if (bobina && bobina.status === "INATIVA") return "INATIVA";
  return statusAutomatico(bobina);
}

// Retorna a classe CSS correspondente ao status
function classeStatusBobina(status) {
  switch (status) {
    case "FINALIZADA":
      return "status-finalizada";
    case "INATIVA":
      return "status-inativa";
    case "EM USO":
      return "status-indisponivel";
    default:
      return "status-disponivel";
  }
}





function addBobina(bobina) {
  return new Promise((resolve, reject) => {
    bobina.dataEntrada = new Date();
    bobina.tipo = "bobina";

    fetch(`${API_BASE_URL}/bobinas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bobina),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      });

  })
    .catch((error) => {
      reject(error);
    });

}

// Função para adicionar folhas
function addFolhas(folhas) {
  return new Promise((resolve, reject) => {
    // Guarda o código lógico (identificador visual) num campo próprio.
    // O _id do documento é gerado automaticamente pelo Mongo (ObjectId).
    folhas.codigoInterno = `FOLHAS-${Date.now()}`;
    folhas.tipo = "folhas"; // Define o tipo como folhas
    folhas.dataEntrada = new Date();

    fetch(`${API_BASE_URL}/folhas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(folhas),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function getAllBobinas() {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/bobinas`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function getBobinaById(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/bobinas/${id}`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function updateBobina(bobina) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/bobinas/${bobina._id || bobina.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bobina),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function addMovimentoHistorico(movimento) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/movimentacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movimento),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getAllHistorico() {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/movimentacoes`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getHistoricoByBobina(idBobina) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/movimentacoes?idBobina=${idBobina}`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function addBobinaOrigem(relacionamento) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/bobinas-origem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(relacionamento),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getBobinasFilhas(idBobinaOrigem) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/bobinas-origem?idBobinaOrigem=${idBobinaOrigem}`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        const bobinasFilhas = [];
        const fetchPromises = data.map((rel) =>
          getBobinaById(rel.idBobinaNova)
            .then((bobina) => {
              if (bobina) bobinasFilhas.push(bobina);
            })
            .catch((error) => {
              console.error("Erro ao buscar bobina filha:", error);
            })
        );

        Promise.all(fetchPromises).then(() => resolve(bobinasFilhas));
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function getFolhasByBobina(idBobinaOrigem) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/folhas?idBobinaOrigem=${idBobinaOrigem}`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function updateMovimentoHistorico(movimento) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/movimentacoes/${movimento._id}`, {
      // usar _id, não id
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movimento),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function imprimirEtiqueta() {
  window.print();
}
function registrarSaida(event) {
  event.preventDefault();

  const idBobina = document.getElementById("idBobinaSaida").value;
  const pesoSaida = parseFloat(document.getElementById("pesoSaida").value);
  const tipoMaquina = document.getElementById("tipoMaquina").value;
  const usuario = document.getElementById("usuarioSaida").value;
  const observacoes = document.getElementById("observacaoSaida").value;

  if (!idBobina || isNaN(pesoSaida) || !tipoMaquina || !usuario) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  getBobinaById(idBobina)
    .then((bobina) => {
      if (!bobina) {
        throw new Error("Bobina não encontrada.");
      }

      if (pesoSaida > bobina.peso) {
        throw new Error(
          "Peso de saída não pode ser maior que o peso atual da bobina."
        );
      }

      // Atualiza bobina com peso e data de saída
      bobina.peso -= pesoSaida;
      bobina.dataSaida = new Date();
      bobina.maquinaAtual = tipoMaquina || '';
      // Bobina passa a EM USO (está fora, mesmo que o saldo fique baixo/zero)
      bobina.status = statusAutomatico(bobina);

      // Atualiza no banco via API
      return updateBobina(bobina).then(() => bobina);
    })
    .then((bobina) => {
      // ✅ Cria registro de movimentação com o peso usado incluído nas observações
      const textoObs =
        observacoes && observacoes.trim() !== ""
          ? `Peso usado: ${pesoSaida.toFixed(2)} kg | ${observacoes}`
          : `Peso usado: ${pesoSaida.toFixed(2)} kg`;

      const movimentacao = {
        idBobina: bobina._id,
        tipoMovimentacao: "SAÍDA",
        quantidade: pesoSaida,
        tipoMaquina,
        usuario,
        observacoes: textoObs,
        data: new Date(),
      };



      return addMovimentoHistorico(movimentacao);
    })
    .then((movimentacao) => {
      return getBobinaById(idBobina); // recupera a bobina de novo
    })
    .then((bobina) => {
      alert("Saída registrada com sucesso!");
      document.getElementById("modalSaida").style.display = "none";
      carregarEstoque();
      carregarHistorico?.();
    })
    .catch((error) => {
      console.error("Erro ao registrar saída:", error);
      alert("Erro ao registrar saída. Consulte o console para detalhes.");
    });
}
const MIGRAR_TODAS_AS_BOBINAS = false// 👈 mude para false depois

// Alterna manualmente o status INATIVA de uma bobina.
// - Se estiver INATIVA, reativa (volta ao status automático).
// - Caso contrário, marca como INATIVA (após confirmação).
let _alternandoInativa = false; // trava contra cliques duplicados
async function alternarInativaBobina(id) {
  if (_alternandoInativa) return; // já tem uma operação em andamento
  _alternandoInativa = true;

  try {
    // 1) Pega a versão MAIS RECENTE da bobina (não confia em cache)
    const bobina = await getBobinaById(id);
    if (!bobina) throw new Error("Bobina não encontrada.");

    const estaInativa = bobina.status === "INATIVA";

    if (estaInativa) {
      // Reativa: recalcula o status real (DISPONÍVEL / EM USO / FINALIZADA)
      bobina.status = statusAutomatico(bobina);
    } else {
      const ok = confirm(
        "Marcar esta bobina como INATIVA?\nEla não poderá ser movimentada (saída/retorno) enquanto estiver inativa."
      );
      if (!ok) return;
      bobina.status = "INATIVA";
    }

    // 2) Salva no backend
    await updateBobina(bobina);

    // 3) Confirma com o banco que o status foi gravado de verdade
    const verificada = await getBobinaById(id);
    if (verificada && verificada.status !== bobina.status) {
      console.warn(
        "⚠️ O backend não persistiu o novo status. Esperado:",
        bobina.status,
        "| Recebido:",
        verificada.status
      );
      alert(
        "Atenção: o backend não gravou o novo status. Provavelmente o deploy do modelo 'Bobina.js' (com o campo 'status') ainda não está ativo no Render."
      );
    }

    // 4) Recarrega a lista (rebusca do servidor, não do cache)
    await carregarEstoque();
  } catch (error) {
    console.error("Erro ao alterar status da bobina:", error);
    alert("Erro ao alterar o status da bobina. Consulte o console.");
  } finally {
    _alternandoInativa = false;
  }
}

function carregarEstoque() {
  console.log("Carregando estoque...");

  getAllBobinas()
    .then((bobinas) => {
      bobinasEstoqueCache = Array.isArray(bobinas) ? bobinas : [];
      popularFiltrosEstoque();
      aplicarFiltrosEstoque();
    })
    .catch((error) => {
      console.error("Erro detalhado ao carregar estoque:", error);
      alert("Erro ao carregar estoque. Verifique o console para detalhes.");

      // Mostra mensagem de erro na tabela
      const corpoTabela = document.getElementById("corpoTabelaEstoque");
      corpoTabela.innerHTML = `
                <tr>
                    <td colspan="8" style="color: red;">
                        Erro ao carregar estoque. Recarregue a página ou limpe os dados do site.
                        <button onclick="limparBancoDados()">Limpar Dados</button>
                    </td>
                </tr>
            `;
    });
}
// ====== FILTROS COMBINADOS DO ESTOQUE ======
let bobinasEstoqueCache = [];
let filtroStatusEstoque = "TODAS"; // TODAS | DISPONÍVEL | EM USO | FINALIZADA | INATIVA
let mostrandoSomenteEmUso = false; // mantido por compatibilidade

// Lê o estado atual de todos os filtros
function obterFiltrosEstoque() {
  const texto = (document.getElementById("filtro")?.value || "")
    .toLowerCase()
    .trim();
  const tipo = document.getElementById("filtroTipo")?.value || "";
  const fornecedor = document.getElementById("filtroFornecedor")?.value || "";
  return { texto, tipo, fornecedor, status: filtroStatusEstoque };
}

// Decide se uma bobina passa em TODOS os filtros (lógica E)
function bobinaPassaNosFiltros(bobina, f) {
  const statusTexto = calcularStatusBobina(bobina);

  // Filtro de status
  if (f.status === "TODAS") {
    // Por padrão, bobinas INATIVAS não aparecem na visão geral
    if (statusTexto === "INATIVA") return false;
  } else if (statusTexto !== f.status) {
    return false;
  }

  // Filtro por tipo de papel
  if (f.tipo && (bobina.tipoPapel || "") !== f.tipo) return false;

  // Filtro por fornecedor
  if (f.fornecedor && (bobina.fornecedor || "") !== f.fornecedor) return false;

  // Busca livre por texto (em vários campos)
  if (f.texto) {
    const alvo = [
      bobina.codigoQR,
      bobina.tipoPapel,
      bobina.fabricante,
      bobina.fornecedor,
      bobina.localizacao,
      bobina.largura,
      bobina.gramatura,
      bobina.peso,
      statusTexto,
    ]
      .map((v) => String(v ?? "").toLowerCase())
      .join(" ");
    if (!alvo.includes(f.texto)) return false;
  }

  return true;
}

// Renderiza a tabela aplicando os filtros sobre o cache (sem rebuscar a API)
function aplicarFiltrosEstoque() {
  const corpoTabela = document.getElementById("corpoTabelaEstoque");
  if (!corpoTabela) return;
  corpoTabela.innerHTML = "";

  if (!bobinasEstoqueCache || bobinasEstoqueCache.length === 0) {
    corpoTabela.innerHTML = `<tr><td colspan="8">Nenhuma bobina cadastrada</td></tr>`;
    return;
  }

  const f = obterFiltrosEstoque();
  const filtradas = bobinasEstoqueCache.filter((b) =>
    bobinaPassaNosFiltros(b, f)
  );

  if (filtradas.length === 0) {
    corpoTabela.innerHTML = `<tr><td colspan="8">Nenhuma bobina encontrada para os filtros aplicados</td></tr>`;
    return;
  }

  filtradas.forEach((bobina) => {
    const tr = document.createElement("tr");

    const statusTexto = calcularStatusBobina(bobina);
    const status = `<span class="${classeStatusBobina(statusTexto)}">${statusTexto}</span>`;

    const btnVisualizar = `<button class="btn" onclick="visualizarBobina('${bobina._id}')">Visualizar</button>`;
    const btnEditar = `<button class="btn" onclick="editarBobina('${bobina._id}')">Editar</button>`;
    const btnExcluir = `<button class="btn btn-danger" onclick="deletarBobina('${bobina._id}')">Excluir</button>`;

    // Botão de movimentação só aparece para bobinas operáveis
    let btnMovimento = "";
    let btnTransferir = "";
    if (statusTexto === "DISPONÍVEL") {
      btnMovimento = `<button class="btn" onclick="prepararSaida('${bobina._id}')">Registrar Saída</button>`;
    } else if (statusTexto === "EM USO") {
      btnMovimento = `<button class="btn" onclick="prepararRetorno('${bobina._id}')">Registrar Retorno</button>`;
      btnTransferir = `<button class="btn" onclick="abrirTransferirBobina('${bobina._id}')">Transferir</button>`;
    }

    // Inativar (manual) / Reativar
    const btnInativar =
      statusTexto === "INATIVA"
        ? `<button class="btn" onclick="alternarInativaBobina('${bobina._id}')">Reativar</button>`
        : `<button class="btn" onclick="alternarInativaBobina('${bobina._id}')">Inativar</button>`;

    const acoes = `${btnVisualizar}${btnMovimento}${btnTransferir}${btnEditar}${btnInativar}${btnExcluir}`;

    // Peso + máquina atual (quando EM USO)
    const pesoTxt = bobina.peso ? bobina.peso.toFixed(2) : "0.00";
    const pesoHtml = statusTexto === "EM USO" && bobina.maquinaAtual
      ? `${pesoTxt} <small style="color:#666;">(na ${bobina.maquinaAtual})</small>`
      : pesoTxt;

    tr.innerHTML = `
                   <td>${bobina.codigoQR || "N/A"}</td>
                    <td>${bobina.tipoPapel || "N/A"}</td>
                    <td>${bobina.localizacao || "N/A"}</td>
                    <td>${pesoHtml}</td>
                    <td>${bobina.largura ? bobina.largura + " cm" : "N/A"}</td>
                    <td>${bobina.gramatura ? bobina.gramatura + " g/m²" : "N/A"}</td>
                    <td>${status}</td>
                    <td class="no-print">${acoes}</td>
                `;

    corpoTabela.appendChild(tr);
  });
}

// Popula os selects de Tipo de Papel e Fornecedor a partir dos dados,
// preservando a seleção atual do usuário
function popularFiltrosEstoque() {
  const selTipo = document.getElementById("filtroTipo");
  const selForn = document.getElementById("filtroFornecedor");
  if (!selTipo || !selForn) return;

  const tipos = [
    ...new Set(bobinasEstoqueCache.map((b) => b.tipoPapel).filter(Boolean)),
  ].sort();
  const fornecedores = [
    ...new Set(bobinasEstoqueCache.map((b) => b.fornecedor).filter(Boolean)),
  ].sort();

  preencherSelectFiltro(selTipo, tipos, "Todos os tipos");
  preencherSelectFiltro(selForn, fornecedores, "Todos os fornecedores");
}

function preencherSelectFiltro(sel, valores, labelTodos) {
  const atual = sel.value;
  sel.innerHTML = "";

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = labelTodos;
  sel.appendChild(opt0);

  valores.forEach((v) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });

  // mantém a seleção anterior se ainda existir
  sel.value = valores.includes(atual) ? atual : "";
}

// Define o filtro de status (chamado pelos botões)
function setFiltroStatus(valor, botao) {
  filtroStatusEstoque = valor;
  mostrandoSomenteEmUso = valor === "EM USO";

  // destaca o botão ativo
  document
    .querySelectorAll("#filtroStatusEstoque .filtro-status")
    .forEach((b) => b.classList.remove("active"));
  const alvo =
    botao ||
    document.querySelector(
      `#filtroStatusEstoque .filtro-status[data-status="${valor}"]`
    );
  if (alvo) alvo.classList.add("active");

  // atualiza o título
  const titulo = document.getElementById("tituloEstoque");
  if (titulo) {
    const nomes = {
      TODAS: "Estoque Atual",
      "DISPONÍVEL": "Bobinas Disponíveis",
      "EM USO": "Bobinas em Uso",
      FINALIZADA: "Bobinas Finalizadas",
      INATIVA: "Bobinas Inativas",
    };
    titulo.textContent = nomes[valor] || "Estoque Atual";
  }

  aplicarFiltrosEstoque();
}

// Limpa todos os filtros
function limparFiltrosEstoque() {
  const inputTexto = document.getElementById("filtro");
  const selTipo = document.getElementById("filtroTipo");
  const selForn = document.getElementById("filtroFornecedor");
  if (inputTexto) inputTexto.value = "";
  if (selTipo) selTipo.value = "";
  if (selForn) selForn.value = "";
  setFiltroStatus("TODAS");
}

// Mantido por compatibilidade: alterna entre "Em uso" e "Todas"
function toggleBobinasEmUso() {
  setFiltroStatus(filtroStatusEstoque === "EM USO" ? "TODAS" : "EM USO");
}

async function visualizarBobina(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/bobinas/${id}`);
    const bobina = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar bobina:", bobina.error);
      return;
    }

    let conteudo = `
            <p><strong>ID:</strong> ${(bobina._id || "").slice(-6)}</p>
            <p><strong>Tipo de Papel:</strong> ${bobina.tipoPapel}</p>
            <p><strong>Fabricante:</strong> ${bobina.fabricante}</p>
            <p><strong>Peso:</strong> ${bobina.peso} kg</p>
            <p><strong>Largura:</strong> ${bobina.largura} cm</p>
            <p><strong>Gramatura:</strong> ${bobina.gramatura} g/m²</p>
            <p><strong>Localização:</strong> ${bobina.localizacao}</p>
            <p><strong>Fornecedor:</strong> ${bobina.fornecedor}</p>
            <p><strong>Data de Entrada:</strong> ${new Date(
              bobina.dataEntrada
            ).toLocaleString()}</p>
        `;

    // ✅ Bobinas Filhas
    const bobinasFilhas = await getBobinasFilhas(bobina._id);
    if (bobinasFilhas.length > 0) {
      conteudo += `<p><strong>Bobinas Derivadas:</strong></p><ul>`;
      bobinasFilhas.forEach((filha) => {
        conteudo += `<li>${filha.codigoQR} - ${
          filha.largura
        } cm - ${filha.peso.toFixed(2)} kg</li>`;
      });
      conteudo += `</ul>`;
    }

    // ✅ Folhas Geradas
    const folhasGeradas = await getFolhasByBobina(bobina._id);
    if (folhasGeradas.length > 0) {
      conteudo += `<p><strong>Folhas Geradas:</strong></p><ul>`;
      folhasGeradas.forEach((folha) => {
        conteudo += `<li>${folha.quantidade} folhas - ${folha.formato} - Cliente: ${folha.cliente}</li>`;
      });
      conteudo += `</ul>`;
    }

    document.getElementById("modalConteudo").innerHTML = conteudo;

    // ✅ QR Code
    const qrContainer = document.getElementById("qrCodeContainer");
    qrContainer.innerHTML = ""; // Limpa antes

    if (bobina.codigoQR && bobina.codigoQR.trim() !== "") {
      const canvas = document.createElement("canvas");
      qrContainer.appendChild(canvas);

      QRCode.toCanvas(canvas, bobina.codigoQR, { width: 200 }, (error) => {
        if (error) console.error("Erro ao gerar QR Code:", error);
      });
    } else {
      qrContainer.innerHTML = "<p>Sem QR Code disponível para esta bobina.</p>";
    }

    // ✅ Abre o modal
    document.getElementById("modalBobina").style.display = "block";
  } catch (error) {
    console.error("Erro ao visualizar bobina:", error);
    alert("Erro ao visualizar bobina. Consulte o console para detalhes.");
  }
}
function prepararSaida(id) {
  getBobinaById(id)
    .then((bobina) => {
      if (!bobina) {
        alert("Bobina não encontrada!");
        return;
      }

      document.getElementById("idBobinaSaida").value = bobina._id;
      document.getElementById("pesoSaida").max = bobina.peso;
      document.getElementById("pesoSaida").value = bobina.peso;

      // Mostra o modal de saída
      document.getElementById("modalSaida").style.display = "block";
    })
    .catch((error) => {
      console.error("Erro ao preparar saída:", error);
      alert("Erro ao preparar saída. Consulte o console para detalhes.");
    });
}

// Função preparada para corrigir filtro de saída no modal de retorno
function carregarEliminadas() {
  getAllBobinas()
    .then((bobinas) => {
      const eliminadas = bobinas.filter((b) => b.peso <= 0);
      const corpoTabela = document.getElementById("corpoTabelaEliminadas");
      if (!corpoTabela) return;

      corpoTabela.innerHTML = "";

      if (eliminadas.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="8">Nenhuma bobina eliminada</td></tr>`;
        return;
      }

      eliminadas.forEach((bobina) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${bobina.codigoQR}</td>

          <td>${bobina.tipoPapel || "N/A"}</td>
          <td>${bobina.fabricante || "N/A"}</td>
          <td>${bobina.peso.toFixed(2)}</td>
          <td>${bobina.largura || "-"} cm</td>
          <td>${bobina.gramatura || "-"} g/m²</td>
          <td>${bobina.dataSaida ? new Date(bobina.dataSaida).toLocaleString() : "-"}</td>
          <td class="no-print">
            <button class="btn-excluir" onclick="excluirBobinaEliminada('${bobina._id}')">Excluir</button>
          </td>
        `;
        corpoTabela.appendChild(tr);
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar bobinas eliminadas:", error);
    });
}
function excluirBobinaEliminada(id) {
  const confirmar = confirm("⚠️ Tem certeza que deseja excluir definitivamente esta bobina?");
  if (!confirmar) return; // Se clicar em 'Cancelar', nada acontece

  fetch(`https://bobinas.onrender.com/api/bobinas/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao excluir bobina");
      alert("✅ Bobina excluída com sucesso!");
      carregarEliminadas(); // Atualiza a tabela após exclusão
    })
    .catch((error) => {
      console.error("Erro ao excluir bobina:", error);
      alert("❌ Falha ao excluir bobina. Consulte o console para detalhes.");
    });
}


function alternarTabelas() {
  const tabelaNormal = document.getElementById("tabelaEstoqueContainer");
  const tabelaEliminadas = document.getElementById("tabelaEliminadasContainer");
  const titulo = document.getElementById("tituloEstoque");
  const botao = document.getElementById("btnAlternarEstoque");
  const filtro = document.getElementById("filtroEstoqueContainer");

  if (tabelaNormal.style.display !== "none") {
    // Oculta o estoque normal, mostra eliminadas
    tabelaNormal.style.display = "none";
    filtro.style.display = "none";
    tabelaEliminadas.style.display = "block";
    titulo.textContent = "Bobinas Eliminadas";
    botao.textContent = "Voltar para Estoque Atual";
    carregarEliminadas();
  } else {
    // Volta para estoque normal
    tabelaNormal.style.display = "block";
    filtro.style.display = "block";
    tabelaEliminadas.style.display = "none";
    titulo.textContent = "Estoque Atual";
    botao.textContent = "Ver Bobinas Eliminadas";
    carregarEstoque();
  }
}


async function visualizarBobina(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/bobinas/${id}`);
    const bobina = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar bobina:", bobina.error);
      return;
    }
//<p><strong>Código:</strong> ${bobina.codigoQR}</p>
    let conteudo = `
           

            <p><strong>Tipo de Papel:</strong> ${bobina.tipoPapel}</p>
            <h1></h1>
            <p><strong>Peso:</strong> ${bobina.peso} kg</p>
            <h1></h1>
            <p><strong>Largura:</strong> ${bobina.largura} cm</p>
            <h1></h1>
            <p><strong>Gramatura:</strong> ${bobina.gramatura} g/m²</p>
            <h1></h1>
            <p><strong>Localização:</strong> ${bobina.localizacao}</p>
            <h1></h1>
            <p><strong>Codigo:</strong> ${bobina.codigoQR}</p>
            
            
        `;

    // ✅ Bobinas Filhas
    const bobinasFilhas = await getBobinasFilhas(bobina._id);
    if (bobinasFilhas.length > 0) {
      conteudo += `<p><strong>Bobinas Derivadas:</strong></p><ul>`;
      bobinasFilhas.forEach((filha) => {
        conteudo += `<li>${filha.codigoQR} - ${filha.largura
          } cm - ${filha.peso.toFixed(2)} kg</li>`;
      });
      conteudo += `</ul>`;
    }

    // ✅ Folhas Geradas
    const folhasGeradas = await getFolhasByBobina(bobina._id);
    if (folhasGeradas.length > 0) {
      conteudo += `<p><strong>Folhas Geradas:</strong></p><ul>`;
      folhasGeradas.forEach((folha) => {
        conteudo += `<li>${folha.quantidade} folhas - ${folha.formato} - Cliente: ${folha.cliente}</li>`;
      });
      conteudo += `</ul>`;
    }

    document.getElementById("modalConteudo").innerHTML = conteudo;

    
  /*// ✅ QR Code
    const qrContainer = document.getElementById("qrCodeContainer");
    qrContainer.innerHTML = ""; // Limpa antes

    if (bobina.codigoQR && bobina.codigoQR.trim() !== "") {
      const canvas = document.createElement("canvas");
      qrContainer.appendChild(canvas);

      QRCode.toCanvas(canvas, bobina.codigoQR, { width: 200 }, (error) => {
        if (error) console.error("Erro ao gerar QR Code:", error);
      });
    } else {
      qrContainer.innerHTML = "<p>Sem QR Code disponível para esta bobina.</p>";
    }
*/
    // ✅ Abre o modal
    document.getElementById("modalBobina").style.display = "block";
  } catch (error) {
    console.error("Erro ao visualizar bobina:", error);
    alert("Erro ao visualizar bobina. Consulte o console para detalhes.");
  }
}
function prepararSaida(id) {
  getBobinaById(id)
    .then((bobina) => {
      if (!bobina) {
        alert("Bobina não encontrada!");
        return;
      }

      document.getElementById("idBobinaSaida").value = bobina._id;
      document.getElementById("pesoSaida").max = bobina.peso;
      document.getElementById("pesoSaida").value = bobina.peso;

      // Mostra o modal de saída
      document.getElementById("modalSaida").style.display = "block";
    })
    .catch((error) => {
      console.error("Erro ao preparar saída:", error);
      alert("Erro ao preparar saída. Consulte o console para detalhes.");
    });
}

// Função preparada para corrigir filtro de saída no modal de retorno
async function prepararRetorno(id) {
  try {
    // Busca a bobina
    const bobina = await getBobinaById(id);
    if (!bobina) {
      alert("Bobina não encontrada!");
      return;
    }

    // Preenche o ID do retorno
    document.getElementById("idBobinaRetorno").value = bobina._id;

    // Busca o histórico e loga para debug
    const historico = await getHistoricoByBobina(bobina._id);
    console.log("Histórico retornado para bobina", bobina._id, historico);

    // Ajusta filtro para encontrar a saída
    const saida = historico.find((mov) => {
      console.log("checando movimento:", mov);
      const tipo = mov.tipoMovimentacao
        ? mov.tipoMovimentacao.toString().toLowerCase()
        : "";
      const retornou = mov.dataRetorno || mov.data_retorno;
      return tipo.includes("saída") && !retornou;
    });

    if (!saida) {
      alert("Não foi encontrado registro de saída para esta bobina!");
      return;
    }

    // Preenche os campos do modal de retorno
    document.getElementById("idMovimentoRetorno").value = saida._id || saida.id;
    document.getElementById("tipoMaquinaRetorno").value = saida.tipoMaquina;
    const pesoTotal = saida.quantidade;
    document.getElementById("pesoRestante").value = 0;
    document.getElementById("pesoUtilizado").readOnly = true;

    // Atualiza o campo pesoUtilizado automaticamente

    document.getElementById("pesoRestante").addEventListener("input", () => {
      const restante =
        parseFloat(document.getElementById("pesoRestante").value) || 0;
      const utilizado = pesoTotal - restante;
      document.getElementById("pesoUtilizado").value =
        utilizado > 0 ? utilizado.toFixed(2) : "0.00";
    });

    // Preenche largura e gramatura atuais como valores iniciais
    document.getElementById("novaLargura").value = bobina.largura;
    document.getElementById("novaGramatura").value = bobina.gramatura;

    // Seleciona o tipo de retorno padrão (bobinas/folhas/ambos)
    document.getElementById("retornoBobinas").checked = true;

    // Exibe/esconde seções conforme tipo de máquina
    const bobinasContainer = document.getElementById("bobinasContainer");
    const folhasContainer = document.getElementById("folhasContainer");

    // Mostra sempre ambas por padrão; se quiser refinar, teste saida.tipoMaquina aqui
    bobinasContainer.style.display = "block";
    folhasContainer.style.display = "block";

    // ... restante da configuração dos campos de retorno ...

    // Abre modal
    document.getElementById("modalRetorno").style.display = "block";
  } catch (error) {
    console.error("Erro ao preparar retorno:", error);
    alert("Erro ao preparar retorno. Consulte o console para detalhes.");
  }
}

function fecharModal() {
  document.getElementById("modalBobina").style.display = "none";
  document.getElementById("modalSaida").style.display = "none";
  document.getElementById("modalRetorno").style.display = "none";
}

async function registrarRetorno(event) {
  event.preventDefault();

  // 1) Validação manual dos campos dinâmicos
  const tipoRetorno = document.querySelector(
    'input[name="tipoRetorno"]:checked'
  ).value;
  const quantidadeBobinas = parseInt(
    document.getElementById("quantidadeBobinas").value,
    10
  );

  if (
    (tipoRetorno === "bobinas" || tipoRetorno === "ambos") &&
    quantidadeBobinas > 0
  ) {
    for (let i = 0; i < quantidadeBobinas; i++) {
      const peso = document.getElementById(`pesoBobina${i}`).value;
      const largura = document.getElementById(`larguraBobina${i}`).value;
      const gram = document.getElementById(`gramaturaBobina${i}`).value;
      if (!peso || !largura || !gram) {
        alert(`Preencha peso, largura e gramatura da bobina ${i + 1}`);
        return;
      }
    }
  }

  // 2) Coleta de dados do modal
  const idBobina = document.getElementById("idBobinaRetorno").value;
  const idMovimento = document.getElementById("idMovimentoRetorno").value;
  const tipoMaquina = document.getElementById("tipoMaquinaRetorno").value;
  const pesoUtilizado = parseFloat(
    document.getElementById("pesoUtilizado").value
  );
  const pesoRestante = parseFloat(
    document.getElementById("pesoRestante").value
  );
  const novaLargura = parseFloat(document.getElementById("novaLargura").value);
  const novaGramatura = parseInt(
    document.getElementById("novaGramatura").value,
    10
  );
  const quantidadeFolhas = parseInt(
    document.getElementById("quantidadeFolhas").value,
    10
  );
  const formatoFolhas = document.getElementById("formatoFolhas").value;
  const clienteFolhas = document.getElementById("clienteFolhas").value;
  const observacoes = document.getElementById("observacaoRetorno").value;
  const pesoPerda = parseFloat(document.getElementById("pesoPerda").value) || 0;
  const obsFinal = `Perda: ${pesoPerda.toFixed(2)} kg. ${observacoes}`;


  if (!idBobina || !idMovimento || isNaN(pesoUtilizado)) {
    alert("Preencha todos os campos obrigatórios corretamente!");
    return;
  }

  try {
    // 3) Busca bobina e histórico
    const bobina = await getBobinaById(idBobina);
    const historico = await getHistoricoByBobina(idBobina);

    if (!bobina) {
      alert("Bobina não encontrada!");
      return;
    }

    const movimento = historico.find(
      (mov) => mov._id === idMovimento || mov.id === idMovimento
    );
    if (!movimento) {
      alert("Movimento de saída não encontrado!");
      return;
    }

    if (pesoUtilizado > movimento.quantidade) {
      alert("O peso utilizado não pode ser maior que o peso retirado.");
      return;
    }

    // 4) Atualiza bobina (peso e status) corretamente — soma o peso retornado com o que ainda restava no estoque
    bobina.dataSaida = null;
    bobina.maquinaAtual = '';

    // 🔧 Recupera o peso atual da bobina (que estava em estoque)
    const pesoAtual = parseFloat(bobina.peso) || 0;

    // 🔧 Soma o peso retornado (pesoRestante) com o peso que já estava
    const novoPesoTotal = pesoAtual + (parseFloat(pesoRestante) || 0);

    // 🔧 Atualiza a bobina com o novo total
    bobina.peso = novoPesoTotal;

    // Mantém outros ajustes
    if (!isNaN(novaLargura)) bobina.largura = novaLargura;
    if (!isNaN(novaGramatura)) bobina.gramatura = novaGramatura;

    // Atualiza status automaticamente (FINALIZADA se zerou o saldo, senão DISPONÍVEL)
    bobina.status = statusAutomatico(bobina);

    // Atualiza no banco
    await updateBobina(bobina);


    // Se o peso retornado for 0, mover automaticamente para bobinas eliminadas
    if (bobina.peso === 0) {
      alert("O peso retornado é 0. A bobina será movida para Bobinas Eliminadas.");
      bobina.eliminada = true;
      await updateBobina(bobina);
    }


    // ✅ Corrige o problema de o nome do usuário ser substituído por observações

    // 1️⃣ Garante que o usuário original da SAÍDA seja lido corretamente
    let usuarioOriginal =
      (typeof movimento.usuario === "string" && movimento.usuario.trim() !== "")
        ? movimento.usuario.trim()
        : (
          movimento.user ||
          movimento.usuarioSaida ||
          movimento.nomeUsuario ||
          document.getElementById("usuarioSaida")?.value ||
          "Sistema"
        );

    // 2️⃣ Se o campo 'usuario' parece uma observação, limpa e usa o usuário atual do formulário de retorno
    if (/perda|peso usado|produzimos|folhas|kg/i.test(usuarioOriginal)) {
      console.warn("⚠️ Campo 'usuario' parecia observação, substituindo por usuário do retorno");
      usuarioOriginal = document.getElementById("usuarioRetorno")?.value?.trim() || "Sistema";
    }

    // 3️⃣ Registra o histórico com o usuário correto e observações separadas
    await addMovimentoHistorico({
      idBobina: bobina._id,
      tipoMovimentacao: "RETORNO",
      quantidade: pesoUtilizado,
      tipoMaquina,
      usuario: usuarioOriginal, // 👈 agora garantido
      cliente: (document.getElementById("clienteFolhas")?.value || "").trim(),
      observacoes: obsFinal, // 👈 apenas observações aqui
      idMovimentoOrigem: movimento._id,
      data: new Date(),
    });

    console.log("✅ Movimento de retorno gravado com usuário:", usuarioOriginal);



    // 6) Gera bobinas filhas e/ou folhas, se aplicável
    const promises = [];
    if (
      (tipoRetorno === "bobinas" || tipoRetorno === "ambos") &&
      quantidadeBobinas > 0
    ) {
      for (let i = 0; i < quantidadeBobinas; i++) {
        const pesoIndividual = parseFloat(
          document.getElementById(`pesoBobina${i}`)?.value || "0"
        );

        const novaBobina = {
          tipoPapel: bobina.tipoPapel,
          fabricante: bobina.fabricante,
          peso: pesoIndividual,
          pesoInicial: pesoIndividual,
          largura: parseFloat(
            document.getElementById(`larguraBobina${i}`)?.value ||
            bobina.largura
          ),
          gramatura: parseInt(
            document.getElementById(`gramaturaBobina${i}`)?.value ||
            bobina.gramatura
          ),
          localizacao: bobina.localizacao,
          fornecedor: bobina.fornecedor,
          dataEntrada: new Date(),
          codigoQR: gerarCodigoBobina({
            tipoPapel: bobina.tipoPapel,
            peso: pesoIndividual,
            largura: novaLargura,
            gramatura: novaGramatura,
          }),


        };

        promises.push(
          addBobina(novaBobina).then((bn) =>
            addBobinaOrigem({
              idBobinaOrigem: bobina._id,
              idBobinaNova: bn._id || bn.id,
            })
          )
        );
      }
    }
    // Cria folha no estoque de "Folhas de Bobina" (FB-XXXX) sempre que os campos
    // de quantidade e formato estiverem preenchidos, independente do radio
    // (evita casos em que o usuário esquece de trocar de "bobinas" para "folhas").
    if (quantidadeFolhas > 0 && formatoFolhas) {
      promises.push(
        fetch(`${API_BASE_URL}/folhas-bobina`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: bobina.tipoPapel || bobina.tipo || "Folha de bobina",
            localizacao: bobina.localizacao || "",
            quantidade: quantidadeFolhas,
            formato: formatoFolhas,
            gramatura: bobina.gramatura || 0,
            bobinaOrigem: bobina._id,
            observacoes: `Originada do retorno da bobina ${bobina.codigoQR || bobina._id}` +
              (clienteFolhas ? ` — cliente: ${clienteFolhas}` : ""),
          }),
        }).then(async (r) => {
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(`Falha ao criar folha de bobina (${r.status}): ${txt}`);
          }
          return r.json();
        })
      );
    }
    await Promise.all(promises);

    // 7) Confirma e atualiza UI
    alert("Retorno registrado com sucesso!");
    fecharModal();
    carregarEstoque();
    carregarHistorico?.();
  } catch (error) {
    console.error("Erro ao registrar retorno:", error);
    alert("Erro ao registrar retorno. Consulte o console para detalhes.");
  }
}

// substituir a função carregarHistorico existente por esta versão
async function carregarHistorico() {
  try {
    // busca histórico, bobinas e folhas de bobina em paralelo
    const [historico, bobinas, folhasBobina] = await Promise.all([
      getAllHistorico(),
      getAllBobinas(),
      fetch(`${API_BASE_URL}/folhas-bobina`).then(r => r.ok ? r.json() : []).catch(() => [])
    ]);

    // cria mapa id -> código legível (prioriza codigoQR, senão últimos 6 do _id)
    const mapaBobinas = {};
    bobinas.forEach((b) => {
      mapaBobinas[b._id] = b.codigoQR || "-";
    });

    // Indexa folhas de bobina por bobinaOrigem para lookup rápido
    const folhasPorBobina = {};
    (folhasBobina || []).forEach((f) => {
      const origem = String(f.bobinaOrigem || "");
      if (!origem) return;
      if (!folhasPorBobina[origem]) folhasPorBobina[origem] = [];
      folhasPorBobina[origem].push(f);
    });

    const corpoTabela = document.getElementById("corpoTabelaHistorico");
    if (!corpoTabela) return;
    corpoTabela.innerHTML = "";

    // helper: tenta extrair perda em kg de diferentes campos
    function extrairPerda(mov) {
      if (typeof mov.perda === "number") return mov.perda.toFixed(2);
      if (typeof mov.pesoPerda === "number") return mov.pesoPerda.toFixed(2);
      // tenta achar "Perda: X kg" dentro de observações
      const obs = mov.observacoes || "";
      const m = obs.match(/Perda:\s*([0-9.,]+)\s*kg/i);
      if (m) return parseFloat(m[1].replace(",", ".")).toFixed(2);
      return "-";
    }

    historico.forEach((mov) => {
      // Filtra: só mostra movimentações de bobinas nesta tabela.
      // Movimentações antigas (sem tipoItem) são de bobinas por padrão.
      const tipoItem = mov.tipoItem || "bobina";
      if (tipoItem !== "bobina") return;
      const data = mov.data ? new Date(mov.data) : null;
      const dataTexto = data ? `${data.toLocaleDateString()} ${data.toLocaleTimeString()}` : "-";

      // determina código legível da bobina
      let codigo = "-";
      if (mov.idBobina) codigo = mapaBobinas[mov.idBobina] || "-";

      else if (mov.idFolhas) codigo = "FOLHAS";

      // tipo, quantidade/peso
      const tipo = mov.tipoMovimentacao ? mov.tipoMovimentacao + (mov.tipoMaquina ? " (" + mov.tipoMaquina + ")" : "") : "-";

      // Sempre mostra o peso utilizado (valor da movimentação), não o peso atual
      let peso = "0.00";
      if (typeof mov.quantidade === "number") {
        peso = mov.quantidade.toFixed(2);
      } else if (mov.quantidade) {
        peso = parseFloat(String(mov.quantidade).replace(",", ".")).toFixed(2);
      }

      // extração de perda e observações
      const perda = extrairPerda(mov);
      const observacoes = mov.observacoes || "-";

      // ✅ Garante que sempre seja usado o campo 'usuario' original, sem heurísticas
      let usuario = mov.usuario || mov.user || mov.usuario_nome || mov.nomeUsuario || "Sistema";

      // Se o usuário contém texto que parece ser observação, substitui por 'Sistema' e registra no console
      if (typeof usuario === "string" && /perda|peso usado|peso usado:|kg|folhas/i.test(usuario)) {
        console.warn("⚠️ Corrigido campo 'usuario' incorreto:", usuario, "→ Sistema");
        usuario = "Sistema";
      }


      // fallback final: se ainda não tem usuário, tenta pegar a última SAÍDA da mesma bobina
      if (!usuario && mov.idBobina) {
        const saidas = historico
          .filter((m) => (m.idBobina === mov.idBobina || m.idBobina === mov.idBobina) &&
            (m.tipoMovimentacao || "").toString().toLowerCase().includes("saída"));
        if (saidas.length > 0) {
          const semRetorno = saidas.find(s => !s.dataRetorno && !s.data_retorno) || saidas[saidas.length - 1];
          usuario = semRetorno?.usuario || semRetorno?.user || null;
        }
      }

      // por fim, se nada foi encontrado, define um valor padrão
      if (!usuario) usuario = "Sistema";

      // Descobre a gramatura da bobina (se tiver referência)
      let gramatura = "-";
      if (mov.idBobina) {
        const bAtual = bobinas.find(b => b._id === mov.idBobina);
        if (bAtual && bAtual.gramatura) gramatura = bAtual.gramatura + " g/m²";
      }

      // Se for RETORNO, verifica se há folhas de bobina geradas na janela desta movimentação
      // (mesma bobinaOrigem e data dentro de ~5min).
      let folhasDoRetorno = [];
      const ehRetorno = (mov.tipoMovimentacao || "").toLowerCase().includes("retorno");
      if (ehRetorno && mov.idBobina) {
        const dataMov = data ? data.getTime() : 0;
        const candidatas = folhasPorBobina[String(mov.idBobina)] || [];
        // Aceita as filhas geradas até 10 minutos após a data da movimentação
        folhasDoRetorno = candidatas.filter((f) => {
          const dCad = f.dataCadastro ? new Date(f.dataCadastro).getTime() : 0;
          const diff = Math.abs(dCad - dataMov);
          return diff <= 10 * 60 * 1000;
        });
      }

      // Função que constrói uma linha (usada para 1 ou múltiplas folhas)
      const criarLinha = (folha) => {
        const dataFolhaTxt = folha && folha.dataCadastro ? new Date(folha.dataCadastro).toLocaleString() : "-";
        const codigoFolha = folha ? (folha.codigo || "-") : "-";
        const formatoFolha = folha ? (folha.formato || "-") : "-";
        const qtdFolha = folha ? (folha.quantidade ?? "-") : "-";
        const perdaFolha = folha && folha.observacoes && folha.observacoes.match(/perda:\s*([0-9.,]+)/i)
          ? folha.observacoes.match(/perda:\s*([0-9.,]+)/i)[1]
          : "-";
        const maquinaFolha = folha && folha.maquinaAtual ? folha.maquinaAtual : "-";
        const obsFolha = folha ? (folha.observacoes || "-") : "-";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${dataTexto}</td>
          <td>${codigo}</td>
          <td>${tipo}</td>
          <td>${gramatura}</td>
          <td>${peso}</td>
          <td>${usuario}</td>
          <td>${mov.cliente || "-"}</td>
          <td>${perda}</td>
          <td>${observacoes}</td>
          <td>${dataFolhaTxt}</td>
          <td>${codigoFolha}</td>
          <td>${formatoFolha}</td>
          <td>${qtdFolha}</td>
          <td>${perdaFolha}</td>
          <td>${maquinaFolha}</td>
          <td>${obsFolha}</td>
          <td class="no-print">
            <button class="btn" onclick="editarMovimentacao('${mov._id || mov.id}')">Editar</button>
            <button class="btn-danger" onclick="excluirMovimentacao('${mov._id || mov.id}')">Excluir</button>
          </td>
        `;
        return tr;
      };

      if (folhasDoRetorno.length > 0) {
        // Uma linha por folha filha
        folhasDoRetorno.forEach((f) => corpoTabela.appendChild(criarLinha(f)));
      } else {
        // Sem folhas filhas: uma linha só, com as colunas de folha vazias
        corpoTabela.appendChild(criarLinha(null));
      }
    });

  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    alert("Erro ao carregar histórico. Consulte o console para detalhes.");
  }
}
// Função robusta para excluir movimentação e mostrar diagnóstico em caso de erro
async function excluirMovimentacao(idMov) {
  if (!confirm("⚠️ Tem certeza que deseja excluir permanentemente esta movimentação?")) return;

  // Checagem rápida
  console.log("Tentando excluir movimentação:", idMov);
  if (!idMov) {
    alert("ID da movimentação inválido. Verifique o console.");
    console.error("excluirMovimentacao: idMov indefinido ou vazio");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/movimentacoes/${idMov}`, {
      method: "DELETE",
      // se seu servidor requer autenticação/cookies descomente abaixo:
      // credentials: 'include'
    });

    // lê o corpo como texto (poderá ser JSON ou mensagem simples)
    const bodyText = await res.text();

    if (!res.ok) {
      // Mostra status e corpo no console para diagnóstico
      console.error("Falha ao excluir movimentação. Status:", res.status, "Resposta:", bodyText);
      // tenta extrair uma mensagem JSON se for JSON
      try {
        const parsed = JSON.parse(bodyText);
        alert(`Erro ao excluir movimentação: ${parsed.error || parsed.message || res.status}`);
      } catch (e) {
        alert(`Erro ao excluir movimentação. Status ${res.status}. Verifique o console para detalhes.`);
      }
      return;
    }

    // Sucesso — tenta parsear JSON de confirmação, se houver
    try {
      const data = JSON.parse(bodyText || "{}");
      console.log("Movimentação excluída (resposta):", data);
    } catch (e) {
      console.log("Movimentação excluída. Resposta (texto):", bodyText);
    }

    alert("✅ Movimentação excluída e saldo ajustado.");
    // atualiza a tabela e o estoque (que pode ter sido alterado pelo backend)
    if (typeof carregarHistorico === "function") carregarHistorico();
    if (typeof carregarEstoque === "function") carregarEstoque();
    if (typeof carregarHistoricoPapelcartao === "function") carregarHistoricoPapelcartao();
    if (typeof carregarPapelcartao === "function") carregarPapelcartao();
  } catch (err) {
    console.error("Erro de rede ao tentar excluir movimentação:", err);
    alert("Erro de conexão ao excluir movimentação. Verifique o console e se o servidor está rodando.");
  }
}



function gerarRelatorio() {
  const tipoRelatorio = document.getElementById("tipoRelatorio").value;
  const resultado = document.getElementById("resultadoRelatorio");
  const conteudo = document.getElementById("conteudoRelatorio");

  resultado.style.display = "none";

  if (tipoRelatorio === "estoqueAtual") {
    getAllBobinas().then((bobinas) => {
      let html = `<h3>Estoque Atual - Total: ${bobinas.length} bobinas</h3>`;
      html += `<table border="1" style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Tipo</th>
                                    <th>Fabricante</th>
                                    <th>Peso (kg)</th>
                                    <th>Largura</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>`;

      bobinas.forEach((bobina) => {
        const status = calcularStatusBobina(bobina);
        html += `<tr>
                                <td>${bobina.codigoQR}</td>



                                <td>${bobina.tipoPapel}</td>
                                <td>${bobina.fabricante}</td>
                                <td>${bobina.peso.toFixed(2)}</td>
                                <td>${bobina.largura} cm</td>
                                <td>${status}</td>
                            </tr>`;
      });

      html += `</tbody></table>`;
      conteudo.innerHTML = html;
      resultado.style.display = "block";
    });
  } else if (tipoRelatorio === "movimentacaoPeriodo") {
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    if (!dataInicio || !dataFim) {
      alert("Por favor, selecione o período para o relatório!");
      return;
    }

    Promise.all([getAllHistorico(), getAllBobinas()])
      .then(([historico, bobinas]) => {
        const mapaBobinas = {};
        bobinas.forEach((b) => {
          mapaBobinas[b._id] = b.codigoQR || "-";

        });

        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);

        const movimentacoes = historico.filter((mov) => {
          const dataMov = new Date(mov.data);
          return dataMov >= inicio && dataMov <= fim;
        });

        let html = `<h3>Movimentações de ${inicio.toLocaleDateString()} até ${fim.toLocaleDateString()}</h3>`;
        html += `<p>Total de movimentações: ${movimentacoes.length}</p>`;
        html += `<table border="1" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Código</th>
            <th>Nome da Bobina</th>
            <th>Tipo</th>
            <th>Máquina</th>
            <th>Peso Entrada</th>
            <th>Peso Saída</th>
            <th>Usuário</th>
            <th>Cliente</th>
            <th>Perda (kg)</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>`;

        movimentacoes.forEach((mov) => {
          const data = new Date(mov.data);
          const tipo = mov.tipoMovimentacao || "-";
          const maquina = mov.tipoMaquina || "Não informado";
          const usuario = mov.usuario || "Não informado";
          const peso = mov.quantidade ? mov.quantidade.toFixed(2) : "0.00";
          const obs = mov.observacoes || "-";
          let perdaMatch = obs.match(/Perda:\s*([\d,.]+)/i);
          const perda = perdaMatch
            ? parseFloat(perdaMatch[1].replace(",", "."))
            : 0;


          let pesoEntrada = "-";
          let pesoSaida = "-";
          if (tipo === "ENTRADA" || tipo === "RETORNO") {
            pesoEntrada = peso + " kg";
          } else if (tipo === "SAÍDA") {
            pesoSaida = peso + " kg";
          }

          html += `<tr>
          <td>${data.toLocaleDateString()} ${data.toLocaleTimeString()}</td>
          <td>
  ${mov.idBobina && mapaBobinas[mov.idBobina]
              ? mapaBobinas[mov.idBobina]
              : (mov.idBobina || mov.idFolhas || "-").slice(-6)
            }
</td>
          <td>${tipoPapel}</td>
          <td>${tipo}</td>
          <td>${maquina}</td>
          <td>${pesoEntrada}</td>
          <td>${pesoSaida}</td>
          <td>${usuario}</td>
          <td>${mov.cliente || "-"}</td>
          <td>${perda.toFixed(2)}</td>
          <td>${obs}</td>
        </tr>`;
        });

        html += `</tbody></table>`;
        conteudo.innerHTML = html;
        resultado.style.display = "block";
      })
      .catch((error) => {
        console.error("Erro ao gerar relatório:", error);
        alert("Erro ao gerar relatório. Consulte o console.");
      });
  } else if (tipoRelatorio === "estoqueMinimo") {
    conteudo.innerHTML =
      "<h3>Alerta de Estoque Mínimo</h3><p>Funcionalidade em desenvolvimento.</p>";
    resultado.style.display = "block";
  }
}
function gerarEtiqueta(bobina, maquina, usuario) {
  document.getElementById("etiquetaCodigo").textContent =
    bobina.codigoQR || "-"
  document.getElementById("etiquetaTipoPapel").textContent =
    bobina.tipoPapel || "-";
  document.getElementById("etiquetaFabricante").textContent =
    bobina.fabricante || "-";
  document.getElementById("etiquetaPeso").textContent =
    bobina.peso?.toFixed(2) || "0.00";
  document.getElementById("etiquetaLargura").textContent =
    bobina.largura || "-";
  document.getElementById("etiquetaGramatura").textContent =
    bobina.gramatura || "-";
  document.getElementById("etiquetaUsuario").textContent = usuario || "-";
    document.getElementById("etiquetaMaquina").textContent = maquina || "-";
  
  document.getElementById("etiquetaData").textContent =
    new Date().toLocaleString();

  document.getElementById("etiqueta").style.display = "block";
  window.print();
  document.getElementById("etiqueta").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  carregarEstoque();

  // Formulário de cadastro
  // Substitua o listener de submit do formBobina por este
  document.getElementById("formBobina").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = document.getElementById("formBobina");
    const idEditando = form.getAttribute("data-editando");

    const novaBobina = {
      tipoPapel: document.getElementById("tipoPapel").value,
      fabricante: document.getElementById("fabricante").value,
      peso: parseFloat(document.getElementById("peso").value),
      largura: parseFloat(document.getElementById("largura").value),
      gramatura: parseFloat(document.getElementById("gramatura").value),
      localizacao: document.getElementById("localizacao").value,
      fornecedor: document.getElementById("fornecedor").value,
      
    };

    try {
      if (idEditando) {
        // EDIÇÃO: busca a bobina original e mantém campos imutáveis
        const bobinaOriginal = await getBobinaById(idEditando);

        // preserve identificadores e metadados que não devem mudar
        novaBobina._id = bobinaOriginal._id;
        novaBobina.codigoQR = bobinaOriginal.codigoQR;
        novaBobina.dataEntrada = bobinaOriginal.dataEntrada;
        novaBobina.pesoInicial = bobinaOriginal.pesoInicial ?? bobinaOriginal.peso;
        // preserva movimentação e status manual (ex.: INATIVA) ao editar
        novaBobina.dataSaida = bobinaOriginal.dataSaida;
        novaBobina.status = bobinaOriginal.status;

        // Faz o PUT com os dados atualizados (mantendo o id)
        await updateBobina(novaBobina);

        alert("✅ Bobina atualizada com sucesso!");
        form.removeAttribute("data-editando");
        document.querySelector("#formBobina button[type='submit']").textContent = "Cadastrar Bobina";
        document.getElementById("cancelarEdicao").style.display = "none";
      } else {
        // NOVA BOBINA
        novaBobina.pesoInicial = novaBobina.peso;
        novaBobina.dataEntrada = new Date();
        //novaBobina.codigoQR = `BOBINA-${Date.now()}`;
        novaBobina.codigoQR = gerarCodigoBobina(novaBobina);

        const data = await addBobina(novaBobina);
        // addBobina já cria e retorna o registro; atualizamos o codigoQR com o _id
        //data.codigoQR = data._id;
        //await updateBobina(data);

        // registra movimentação de entrada
        await addMovimentoHistorico({
          idBobina: data._id,
          tipoMovimentacao: "ENTRADA",
          quantidade: data.peso,
          data: new Date(),
          usuario: "Sistema",
          observacoes: "Cadastro inicial",
        });

        alert("✅ Bobina cadastrada com sucesso!");
      }

      form.reset();
      carregarEstoque();
      if (typeof carregarHistorico === "function") carregarHistorico();
    } catch (error) {
      console.error("Erro ao salvar bobina:", error);
      alert("❌ Erro ao salvar bobina. Consulte o console para mais detalhes.");
    }
  });



  // Formulário de saída
  document
    .getElementById("formSaida")
    .addEventListener("submit", registrarSaida);

  // Formulário de retorno
  document
    .getElementById("formRetorno")
    .addEventListener("submit", registrarRetorno);

  // Controle de tipo de retorno
  document.querySelectorAll('input[name="tipoRetorno"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
      const tipo = event.target.value;
      const bobinasContainer = document.getElementById("bobinasContainer");
      const folhasContainer = document.getElementById("folhasContainer");

      if (tipo === "bobinas") {
        bobinasContainer.style.display = "block";
        folhasContainer.style.display = "none";
      } else if (tipo === "folhas") {
        bobinasContainer.style.display = "none";
        folhasContainer.style.display = "block";
      } else if (tipo === "ambos") {
        bobinasContainer.style.display = "block";
        folhasContainer.style.display = "block";
      }
    });
  });

  // Controle de quantidade de bobinas geradas
  document
    .getElementById("quantidadeBobinas")
    .addEventListener("change", (event) => {
      const quantidade = parseInt(event.target.value);
      const container = document.getElementById("bobinasGeradasContainer");
      const divBobinas = document.getElementById("bobinasGeradas");

      if (quantidade > 0) {
        container.style.display = "block";
        divBobinas.innerHTML = "";

        for (let i = 0; i < quantidade; i++) {
          divBobinas.innerHTML += `
        <div class="form-group">
            <label>Bobina ${i + 1} - Peso (kg):</label>
            <input type="number" id="pesoBobina${i}" name="pesoBobina${i}" step="0.01" min="0" >
            <label>Largura (cm):</label>
            <input type="number" id="larguraBobina${i}" name="larguraBobina${i}" step="0.01" min="0" >
            <label>Gramatura (g/m²):</label>
            <input type="number" id="gramaturaBobina${i}" name="gramaturaBobina${i}" step="0.01" min="0" >
        </div>
    `;
        }
      } else {
        container.style.display = "none";
      }
    });

  // Filtro de estoque (busca livre + selects combinados)
  const inputFiltro = document.getElementById("filtro");
  if (inputFiltro) {
    inputFiltro.addEventListener("input", () => aplicarFiltrosEstoque());
  }
  const selFiltroTipo = document.getElementById("filtroTipo");
  if (selFiltroTipo) {
    selFiltroTipo.addEventListener("change", () => aplicarFiltrosEstoque());
  }
  const selFiltroForn = document.getElementById("filtroFornecedor");
  if (selFiltroForn) {
    selFiltroForn.addEventListener("change", () => aplicarFiltrosEstoque());
  }

  // Controle do relatório
  document
    .getElementById("tipoRelatorio")
    .addEventListener("change", (event) => {
      const filtroPeriodo = document.getElementById("filtroPeriodo");
      filtroPeriodo.style.display =
        event.target.value === "movimentacaoPeriodo" ? "block" : "none";
    });
  document.getElementById("cancelarEdicao").addEventListener("click", () => {
    document.getElementById("formBobina").reset();
    document.getElementById("formBobina").removeAttribute("data-editando");
    document.querySelector("#formBobina button[type='submit']").textContent =
      "Cadastrar Bobina";
    document.getElementById("cancelarEdicao").style.display = "none";
  });
});

function openTab(tabId, event) {
  // Esconde todos os conteúdos de tab
  const tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove("active");
    // como fallback, também escondemos via style (caso o CSS use display)
    tabContents[i].style.display = "none";
  }

  // Remove a classe active de todas as tabs
  const tabs = document.getElementsByClassName("tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }

  // Mostra o conteúdo da tab selecionada (se existir)
  const conteudo = document.getElementById(tabId);
  if (conteudo) {
    conteudo.classList.add("active");
    conteudo.style.display = "block";
  } else {
    console.warn(`openTab: conteúdo com id "${tabId}" não encontrado.`);
  }

  // Seta o botão (event.currentTarget) como active, se fornecido
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  } else {
    // fallback: tenta encontrar o botão por texto/atributo (silencioso)
    // (não necessário, só evita que nada quebre)
  }

  // Atualiza os dados se necessário
  if (tabId === "estoque") {
    if (typeof carregarEstoque === "function") carregarEstoque();
  } else if (tabId === "movimentacao") {
    if (typeof carregarHistorico === "function") carregarHistorico();
  } else if (tabId === "relatorios") {
    if (typeof gerarRelatorio === "function") {
      // pega o select de tipoRelatorio e dispara mudança caso necessário
      document.getElementById("tipoRelatorio")?.dispatchEvent(new Event("change"));
    }
  }
}

function deletarBobina(id) {
  if (
    !confirm(
      "Tem certeza que deseja excluir esta bobina? Essa ação não pode ser desfeita."
    )
  ) {
    return;
  }

  fetch(`${API_BASE_URL}/bobinas/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => Promise.reject(text));
      }
      alert("Bobina excluída com sucesso!");
      carregarEstoque();
    })
    .catch((error) => {
      console.error("Erro ao excluir bobina:", error);
      alert(
        "Erro ao excluir a bobina. Verifique o console para mais detalhes."
      );
    });
}

function editarBobina(id) {
  getBobinaById(id)
    .then((bobina) => {
      if (!bobina) {
        alert("Bobina não encontrada para edição.");
        return;
      }

      // Preenche o formulário de cadastro com os dados da bobina
      document.getElementById("tipoPapel").value = bobina.tipoPapel || "";
      document.getElementById("fabricante").value = bobina.fabricante || "";
      document.getElementById("peso").value = bobina.peso || "";
      document.getElementById("largura").value = bobina.largura || "";
      document.getElementById("gramatura").value = bobina.gramatura || "";
      document.getElementById("localizacao").value = bobina.localizacao || "";
      document.getElementById("fornecedor").value = bobina.fornecedor || "";
      

      // Armazena o ID da bobina para uso na atualização
      document
        .getElementById("formBobina")
        .setAttribute("data-editando", bobina._id);
      document.querySelector("#formBobina button[type='submit']").textContent =
        "Salvar Alterações";
      document.getElementById("cancelarEdicao").style.display = "inline-block";

      // Vai para a aba de cadastro
      openTab("cadastro");
    })
    .catch((error) => {
      console.error("Erro ao carregar bobina para edição:", error);
      alert("Erro ao carregar bobina. Consulte o console para mais detalhes.");
    });
}
function normalizarLinhaExcel(linha) {
  return {
    tipoPapel: String(
      linha["Tipo"] ||
      linha["Tipo de Papel"] ||
      ""
    ).trim(),

    fabricante: String(
      linha["Fabricante"] || ""
    ).trim(),

    fornecedor: String(
      linha["Fornecedor"] ||
      linha["Fabricante"] ||
      ""
    ).trim(),

    peso: Number(
      String(
        linha["Peso_kg"] ||
        linha["Peso (kg)"] ||
        ""
      ).replace(",", ".")
    ),

    largura: Number(
      String(
        linha["Largura_cm"] ||
        linha["Largura"] ||
        linha["Largura (cm)"] ||
        ""
      ).replace(",", ".")
    ),

    gramatura: Number(
      String(
        linha["Gramatura_gm2"] ||
        linha["Gramatura"] ||
        linha["Gramatura (g/m²)"] ||
        ""
      ).replace(",", ".")
    ),

    cor: String(linha["Cor"] || "Branco").trim(),
    localizacao: String(
      linha["Localização"] || "Armazém Principal"
    )
  };
}

async function importarExcel() {
  const input = document.getElementById("inputExcel");

  if (!input.files.length) {
    alert("Selecione uma planilha Excel");
    return;
  }

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = async function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const linhasExcel = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false
      });

      if (!linhasExcel.length) {
        alert("Planilha vazia");
        return;
      }

      // 🔎 busca bobinas existentes UMA vez
      const resp = await fetch(`${API_BASE_URL}/bobinas`);
      const todasBobinas = await resp.json();

      const novas = [];
      const atualizadas = [];

      for (const linha of linhasExcel) {
        const bobina = normalizarLinhaExcel(linha);

        const codigoExcel = String(
          linha["Código"] || linha["Codigo"] || ""
        ).trim();

        // 🆕 SEM CÓDIGO → NOVA
        if (!codigoExcel) {
          novas.push({
            ...bobina,
            codigoQR: gerarCodigoBobina(bobina),
            dataEntrada: new Date(),
            pesoInicial: bobina.peso
          });
          continue;
        }

        // 🔎 COM CÓDIGO → BUSCA EXISTENTE
        const existente = todasBobinas.find(
          b => String(b.codigoQR).trim() === codigoExcel
        );

        // 🆕 código não existe no sistema
        if (!existente) {
          novas.push({
            ...bobina,
            codigoQR: codigoExcel,
            dataEntrada: new Date(),
            pesoInicial: bobina.peso
          });
          continue;
        }

        // 🔁 EXISTE → ATUALIZA
        atualizadas.push({
          _id: existente._id,
          ...bobina
        });
      }

      // 🚀 ENVIA TUDO DE UMA VEZ
      const response = await fetch(`${API_BASE_URL}/bobinas/importar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novas, atualizadas })
      });

      if (!response.ok) {
        throw new Error("Erro na importação em lote");
      }

      const resultado = await response.json();

      alert(
        `Importação finalizada ✅\n` +
        `Criadas: ${resultado.criadas}\n` +
        `Atualizadas: ${resultado.atualizadas}`
      );

      carregarEstoque();

    } catch (err) {
      console.error("Erro ao importar Excel:", err);
      alert("Erro ao importar planilha. Veja o console.");
    }
  };

  reader.readAsArrayBuffer(file);
}





function parseNumero(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return NaN;
  return Number(String(valor).replace(",", "."));
}

async function exportarEstoqueCompletoExcel() {
  try {
    const wb = XLSX.utils.book_new();

    /* =======================
       ABA 1 – ESTOQUE ATUAL
       ======================= */
    let bobinas = await getAllBobinas();

    const estoque = bobinas.filter(b => !b.eliminada);
    const eliminadas = bobinas.filter(b => b.eliminada);

    if (estoque.length === 0 && eliminadas.length === 0) {
      alert("⚠️ Não há dados para exportar.");
      return;
    }

    if (estoque.length > 0) {
      const dadosEstoque = estoque.map(b => ({
        Código: b.codigoQR,
        Tipo: b.tipoPapel,
        Fabricante: b.fabricante,
        Peso_kg: b.peso,
        Largura_cm: b.largura,
        Gramatura_gm2: b.gramatura,
        Fornecedor: b.fornecedor || "",
        Localização: b.localizacao || "",
        Status: calcularStatusBobina(b)
      }));

      const wsEstoque = XLSX.utils.json_to_sheet(dadosEstoque);
      XLSX.utils.book_append_sheet(wb, wsEstoque, "Estoque Atual");
    }

    /* =======================
       ABA 2 – ELIMINADAS
       ======================= */
    if (eliminadas.length > 0) {
      const dadosEliminadas = eliminadas.map(b => ({
        Código: b.codigoQR,
        Tipo: b.tipoPapel,
        Fabricante: b.fabricante,
        Peso_kg: b.peso,
        Largura_cm: b.largura,
        Gramatura_gm2: b.gramatura,
        "Data de Saída": b.dataSaida || ""
      }));

      const wsEliminadas = XLSX.utils.json_to_sheet(dadosEliminadas);
      XLSX.utils.book_append_sheet(wb, wsEliminadas, "Bobinas Eliminadas");
    }

    /* =======================
       ABA 3 – HISTÓRICO
       ======================= */
    if (typeof getHistorico === "function") {
      const historico = await getHistorico();

      if (historico && historico.length > 0) {
        const dadosHistorico = historico.map(h => ({
          Data: h.data,
          Bobina: h.codigoQR || h.idBobina,
          Tipo: h.tipoPapel,
          Máquina: h.tipoMaquina,
          Peso_kg: h.peso,
          Usuário: h.usuario,
          Perda_kg: h.perda || 0,
          Observações: h.observacao || ""
        }));

        const wsHistorico = XLSX.utils.json_to_sheet(dadosHistorico);
        XLSX.utils.book_append_sheet(wb, wsHistorico, "Histórico");
      }
    }

    XLSX.writeFile(wb, "controle_estoque_bobinas.xlsx");

  } catch (error) {
    console.error("Erro ao exportar estoque completo:", error);
    alert("❌ Erro ao exportar. Veja o console.");
  }
}


function aplicarEstiloCabecalho(worksheet) {
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const endereco = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[endereco]) continue;

    worksheet[endereco].s = {
      font: { bold: true },
      alignment: { horizontal: "center" }
    };
  }

  // Ativa filtro automático
  worksheet["!autofilter"] = {
    ref: worksheet["!ref"]
  };
}



document.getElementById("inputExcel").addEventListener("change", importarExcel);
 async function apagarTodoEstoque() {
  const senha = prompt("Digite a senha para apagar TODO o estoque:");
  if (senha !== "admin123") {
    alert("❌ Senha incorreta");
    return;
  }

  const confirmar = confirm(
    "⚠️ ATENÇÃO!\nIsso irá apagar TODAS as bobinas do sistema.\nEssa ação é IRREVERSÍVEL.\n\nDeseja continuar?"
  );

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_BASE_URL}/bobinas`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const erro = await res.text();
      throw new Error(erro);
    }

    alert("✅ Estoque apagado com sucesso!");
    carregarEstoque();
    carregarHistorico?.();
  } catch (err) {
    console.error("Erro ao apagar estoque:", err);
    alert("❌ Erro ao apagar o estoque. Veja o console.");
  }
}

// ============================================================
// ====== ABA PAPELCARTÃO (folhas/chapas cortadas) ============
// ============================================================
const PAPELCARTAO_API = `${API_BASE_URL}/papelcartao`;

let papelcartaoCache = [];
let filtroStatusPapelcartao = "TODAS"; // TODAS | DISPONÍVEL | SEM ESTOQUE | INATIVA
let _movimentandoPC = false; // trava para evitar duplo clique

// ---- Status calculado ----
// INATIVA (manual) > EM USO (algum lote ativo) > SEM ESTOQUE (saldo zero) > DISPONÍVEL
function calcularStatusPapelcartao(p) {
  if (p && p.status === "INATIVA") return "INATIVA";
  const lotes = Array.isArray(p && p.lotesEmUso) ? p.lotesEmUso : [];
  const somaLotes = lotes.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
  const emUso = somaLotes || parseInt(p && p.quantidadeEmUso, 10) || 0;
  if (emUso > 0) return "EM USO";
  const qtd = parseInt(p && p.quantidade, 10) || 0;
  if (qtd <= 0) return "SEM ESTOQUE";
  return "DISPONÍVEL";
}
function classeStatusPapelcartao(status) {
  switch (status) {
    case "INATIVA": return "status-inativa";
    case "EM USO": return "status-indisponivel";
    case "SEM ESTOQUE": return "status-finalizada";
    default: return "status-disponivel";
  }
}

// ---- API ----
async function pcListar() {
  const res = await fetch(PAPELCARTAO_API);
  if (!res.ok) throw new Error("Falha ao listar papelcartão");
  return res.json();
}
async function pcObter(id) {
  const res = await fetch(`${PAPELCARTAO_API}/${id}`);
  if (!res.ok) throw new Error("Registro não encontrado");
  return res.json();
}
async function pcCriar(dados) {
  const res = await fetch(PAPELCARTAO_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar");
  return res.json();
}
async function pcAtualizar(id, dados) {
  const res = await fetch(`${PAPELCARTAO_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao atualizar");
  return res.json();
}
async function pcExcluir(id) {
  const res = await fetch(`${PAPELCARTAO_API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao excluir");
  return res.json();
}
async function pcMovimentar(id, tipo, quantidade) {
  const res = await fetch(`${PAPELCARTAO_API}/${id}/${tipo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantidade }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao movimentar");
  return res.json();
}
async function pcRetornar(id, payload) {
  // payload: { quantidadeRetorno, perdaKg, filhas: [{formato, quantidade}], usuario, observacoes }
  const res = await fetch(`${PAPELCARTAO_API}/${id}/retorno`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro no retorno");
  return res.json();
}
async function pcTransferir(id, payload) {
  // payload: { novaMaquina, usuario, observacoes }
  const res = await fetch(`${PAPELCARTAO_API}/${id}/transferir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao transferir");
  return res.json();
}
async function pcSaidaCompleta(id, payload) {
  // payload: { quantidade, tipoMaquina, usuario, observacoes }
  const res = await fetch(`${PAPELCARTAO_API}/${id}/saida`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro na saída");
  return res.json();
}

// ---- Carregamento e render ----
async function carregarPapelcartao() {
  try {
    papelcartaoCache = await pcListar();
    if (!Array.isArray(papelcartaoCache)) papelcartaoCache = [];
    popularFiltroTipoPapelcartao();
    aplicarFiltrosPapelcartao();
  } catch (err) {
    console.error(err);
    const corpo = document.getElementById("corpoTabelaPapelcartao");
    if (corpo) {
      corpo.innerHTML = `<tr><td colspan="8" style="color:red;">Erro ao carregar papelcartão. Verifique o console.</td></tr>`;
    }
  }
}

function popularFiltroTipoPapelcartao() {
  const sel = document.getElementById("filtroTipoPapelcartao");
  if (!sel) return;
  const atual = sel.value;
  const tipos = [...new Set(papelcartaoCache.map((p) => p.tipo).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">Todos os tipos</option>` +
    tipos.map((t) => `<option value="${t}">${t}</option>`).join("");
  sel.value = tipos.includes(atual) ? atual : "";
}

function aplicarFiltrosPapelcartao() {
  const corpo = document.getElementById("corpoTabelaPapelcartao");
  if (!corpo) return;

  const texto = (document.getElementById("filtroPapelcartao")?.value || "")
    .toLowerCase().trim();
  const tipo = document.getElementById("filtroTipoPapelcartao")?.value || "";

  const filtrados = papelcartaoCache.filter((p) => {
    const statusTxt = calcularStatusPapelcartao(p);
    const temSaldo = (parseInt(p.quantidade, 10) || 0) > 0;
    const lotes = Array.isArray(p.lotesEmUso) ? p.lotesEmUso : [];
    const somaLotes = lotes.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
    const temEmUso = somaLotes > 0 || (parseInt(p.quantidadeEmUso, 10) || 0) > 0;

    if (filtroStatusPapelcartao === "TODAS") {
      if (statusTxt === "INATIVA") return false;
    } else if (filtroStatusPapelcartao === "DISPONÍVEL") {
      if (statusTxt === "INATIVA" || !temSaldo) return false;
    } else if (filtroStatusPapelcartao === "EM USO") {
      if (statusTxt === "INATIVA" || !temEmUso) return false;
    } else if (statusTxt !== filtroStatusPapelcartao) {
      return false;
    }

    if (tipo && (p.tipo || "") !== tipo) return false;

    if (texto) {
      const alvo = [p.codigo, p.tipo, p.localizacao, p.formato, p.gramatura, p.quantidade, p.quantidadeEmUso, p.observacoes, statusTxt]
        .map((v) => String(v ?? "").toLowerCase()).join(" ");
      if (!alvo.includes(texto)) return false;
    }
    return true;
  });

  if (filtrados.length === 0) {
    corpo.innerHTML = `<tr><td colspan="8">Nenhum registro encontrado</td></tr>`;
    return;
  }

  // Se o filtro é "EM USO", cada LOTE do PC vira uma linha separada.
  // Nos outros filtros, uma linha por PC (comportamento normal).
  if (filtroStatusPapelcartao === "EM USO") {
    const linhas = [];
    filtrados.forEach((p) => {
      const lotes = Array.isArray(p.lotesEmUso) ? p.lotesEmUso : [];
      if (lotes.length === 0) return;
      lotes.forEach((lote) => {
        linhas.push(renderLinhaLotePapelcartao(p, lote));
      });
    });
    if (linhas.length === 0) {
      corpo.innerHTML = `<tr><td colspan="8">Nenhum lote em uso encontrado</td></tr>`;
      return;
    }
    corpo.innerHTML = linhas.join("");
    return;
  }

  // Renderização padrão (uma linha por PC)
  corpo.innerHTML = filtrados.map((p) => renderLinhaPapelcartao(p)).join("");
}

// Uma linha por PC (usada nos filtros TODAS / DISPONÍVEL / SEM ESTOQUE / INATIVA)
function renderLinhaPapelcartao(p) {
  const statusTxt = calcularStatusPapelcartao(p);
  const statusHtml = `<span class="${classeStatusPapelcartao(statusTxt)}">${statusTxt}</span>`;
  const lotes = Array.isArray(p.lotesEmUso) ? p.lotesEmUso : [];
  const emUso = lotes.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);

  const btnVisualizar = `<button class="btn" onclick="visualizarPapelcartao('${p._id}')">Visualizar</button>`;
  const podeMovimentar = statusTxt !== "INATIVA";
  const btnEntrada = podeMovimentar
    ? `<button class="btn" onclick="abrirMovimentoPapelcartao('${p._id}', 'entrada')">Entrada</button>`
    : "";
  const btnSaida = podeMovimentar && (parseInt(p.quantidade, 10) || 0) > 0
    ? `<button class="btn" onclick="abrirSaidaPapelcartao('${p._id}')">Saída</button>`
    : "";
  const btnInativar = statusTxt === "INATIVA"
    ? `<button class="btn" onclick="alternarInativaPapelcartao('${p._id}')">Reativar</button>`
    : `<button class="btn" onclick="alternarInativaPapelcartao('${p._id}')">Inativar</button>`;

  // Quantidade: mostra disponível + resumo dos lotes em uso
  let qtdHtml = `${p.quantidade ?? 0}`;
  if (emUso > 0) {
    const detalhe = lotes.map((l) =>
      `${l.quantidade} na ${l.maquinaAtual || "-"}`
    ).join(" · ");
    qtdHtml = `<strong>${p.quantidade ?? 0}</strong> disponível<br>` +
      `<small style="color:#666;">+ ${emUso} em uso (${detalhe})</small>`;
  }

  return `<tr>
    <td>${p.codigo || "-"}</td>
    <td>${p.tipo || "-"}</td>
    <td>${p.localizacao || "-"}</td>
    <td>${qtdHtml}</td>
    <td>${p.formato || "-"}</td>
    <td>${p.gramatura ? p.gramatura + " g/m²" : "-"}</td>
    <td>${statusHtml}</td>
    <td class="no-print">
      ${btnVisualizar}
      ${btnEntrada}
      ${btnSaida}
      <button class="btn" onclick="editarPapelcartao('${p._id}')">Editar</button>
      ${btnInativar}
      <button class="btn btn-danger" onclick="excluirPapelcartao('${p._id}')">Excluir</button>
    </td>
  </tr>`;
}

// Uma linha por LOTE (usada no filtro EM USO)
function renderLinhaLotePapelcartao(p, lote) {
  const qtd = parseInt(lote.quantidade, 10) || 0;
  const maq = lote.maquinaAtual || "-";
  const dataSaida = lote.dataSaida ? new Date(lote.dataSaida).toLocaleDateString() : "-";
  const statusHtml = `<span class="status-indisponivel">EM USO</span>`;

  const btnVisualizar = `<button class="btn" onclick="visualizarPapelcartao('${p._id}')">Visualizar</button>`;
  const btnRetorno = `<button class="btn" onclick="abrirRetornoPapelcartaoLote('${p._id}', '${lote._id}')">Retorno</button>`;
  const btnTransferir = `<button class="btn" onclick="abrirTransferirPapelcartaoLote('${p._id}', '${lote._id}')">Transferir</button>`;

  const qtdHtml = `<strong>${qtd}</strong> folhas<br>` +
    `<small style="color:#666;">na ${maq} · desde ${dataSaida}</small>`;

  return `<tr>
    <td>${p.codigo || "-"}</td>
    <td>${p.tipo || "-"}</td>
    <td>${p.localizacao || "-"}</td>
    <td>${qtdHtml}</td>
    <td>${p.formato || "-"}</td>
    <td>${p.gramatura ? p.gramatura + " g/m²" : "-"}</td>
    <td>${statusHtml}</td>
    <td class="no-print">
      ${btnVisualizar}
      ${btnRetorno}
      ${btnTransferir}
    </td>
  </tr>`;
}

function setFiltroStatusPapelcartao(valor, botao) {
  filtroStatusPapelcartao = valor;
  document.querySelectorAll("#filtroStatusPapelcartao .filtro-status")
    .forEach((b) => b.classList.remove("active"));
  const alvo = botao || document.querySelector(
    `#filtroStatusPapelcartao .filtro-status[data-status="${valor}"]`
  );
  if (alvo) alvo.classList.add("active");
  aplicarFiltrosPapelcartao();
}

function limparFiltrosPapelcartao() {
  const t = document.getElementById("filtroPapelcartao");
  const s = document.getElementById("filtroTipoPapelcartao");
  if (t) t.value = "";
  if (s) s.value = "";
  setFiltroStatusPapelcartao("TODAS");
}

// ---- Cadastro / Edição ----
function abrirCadastroPapelcartao() {
  const form = document.getElementById("formPapelcartao");
  form.reset();
  document.getElementById("idPapelcartao").value = "";
  document.getElementById("tituloModalPapelcartao").textContent = "Cadastrar Papelcartão";
  document.getElementById("modalPapelcartao").style.display = "flex";
}

function editarPapelcartao(id) {
  const item = papelcartaoCache.find((p) => p._id === id);
  if (!item) return alert("Registro não encontrado.");
  document.getElementById("idPapelcartao").value = item._id;
  document.getElementById("tipoPapelcartao").value = item.tipo || "";
  document.getElementById("localizacaoPapelcartao").value = item.localizacao || "";
  document.getElementById("quantidadePapelcartao").value = item.quantidade ?? 0;
  document.getElementById("formatoPapelcartao").value = item.formato || "";
  document.getElementById("gramaturaPapelcartao").value = item.gramatura ?? "";
  document.getElementById("observacoesPapelcartao").value = item.observacoes || "";
  document.getElementById("tituloModalPapelcartao").textContent =
    "Editar Papelcartão" + (item.codigo ? ` (${item.codigo})` : "");
  document.getElementById("modalPapelcartao").style.display = "flex";
}

function fecharModalPapelcartao() {
  document.getElementById("modalPapelcartao").style.display = "none";
}

async function excluirPapelcartao(id) {
  if (!confirm("Excluir este registro de papelcartão?")) return;
  try {
    await pcExcluir(id);
    await carregarPapelcartao();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir: " + err.message);
  }
}

// ---- Visualizar papelcartão (reusa o modal genérico #modalBobina) ----
async function visualizarPapelcartao(id) {
  try {
    const item = await pcObter(id);
    const statusTxt = calcularStatusPapelcartao(item);
    const lotesArr = Array.isArray(item.lotesEmUso) ? item.lotesEmUso : [];
    const somaLotes = lotesArr.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
    const emUso = somaLotes || parseInt(item.quantidadeEmUso, 10) || 0;

    let lotesHtml = "";
    if (lotesArr.length > 0) {
      lotesHtml = `<p><strong>Em uso:</strong> ${emUso} folhas em ${lotesArr.length} lote(s):</p><ul>`;
      lotesArr.forEach((l) => {
        const d = l.dataSaida ? new Date(l.dataSaida).toLocaleDateString() : "-";
        lotesHtml += `<li>${l.quantidade} folhas na ${l.maquinaAtual || "-"} <small>(desde ${d})</small></li>`;
      });
      lotesHtml += `</ul>`;
    } else if (emUso > 0) {
      lotesHtml = `<p><strong>Em uso:</strong> ${emUso} folhas${item.maquinaAtual ? ` — na <strong>${item.maquinaAtual}</strong>` : ""}</p>`;
    } else {
      lotesHtml = `<p><strong>Em uso:</strong> 0 folhas</p>`;
    }

    let conteudo = `
      <p><strong>Código:</strong> ${item.codigo || "-"}</p>
      <p><strong>Tipo:</strong> ${item.tipo || "-"}</p>
      <p><strong>Formato:</strong> ${item.formato || "-"}</p>
      <p><strong>Gramatura:</strong> ${item.gramatura ? item.gramatura + " g/m²" : "-"}</p>
      <p><strong>Localização:</strong> ${item.localizacao || "-"}</p>
      <p><strong>Quantidade em estoque:</strong> ${item.quantidade ?? 0} folhas</p>
      ${lotesHtml}
      <p><strong>Status:</strong> <span class="${classeStatusPapelcartao(statusTxt)}">${statusTxt}</span></p>
      <p><strong>Cadastrado em:</strong> ${item.dataCadastro ? new Date(item.dataCadastro).toLocaleString() : "-"}</p>
      ${item.observacoes ? `<p><strong>Observações:</strong> ${item.observacoes}</p>` : ""}
    `;

    // Busca histórico completo de movimentações deste papelcartão
    let historicoHtml = "";
    try {
      const movs = await (await fetch(`${API_BASE_URL}/movimentacoes`)).json();
      const doItem = (movs || [])
        .filter((m) => m.tipoItem === "papelcartao" && String(m.idItem) === String(item._id))
        .sort((a, b) => new Date(b.data) - new Date(a.data)); // mais recentes primeiro

      if (doItem.length > 0) {
        historicoHtml = `<hr style="margin:10px 0;"><p><strong>Histórico (${doItem.length} movimentação${doItem.length > 1 ? "ões" : ""}):</strong></p>`;
        historicoHtml += `<ul style="padding-left:18px; margin:0;">`;
        doItem.forEach((m) => {
          const data = m.data ? new Date(m.data).toLocaleString() : "-";
          const partes = [];
          partes.push(`<strong>${m.tipoMovimentacao || "-"}</strong>`);
          partes.push(data);
          if (m.quantidade != null) partes.push(`${m.quantidade} ${m.unidade || "folhas"}`);
          if (m.tipoMaquina) partes.push(`máq: ${m.tipoMaquina}`);
          if (m.usuario) partes.push(`por ${m.usuario}`);
          if (m.perdaKg) partes.push(`perda: ${m.perdaKg} folhas`);
          if (m.filhasGeradas) {
            if (m.tipoMovimentacao === "TRANSFERENCIA") {
              partes.push(`folhas perdidas: ${m.filhasGeradas}`);
            } else {
              partes.push(`filhas: ${m.filhasGeradas}`);
            }
          }
          historicoHtml += `<li style="margin-bottom:6px;">${partes.join(" · ")}`;
          if (m.observacoes) {
            historicoHtml += `<br><em style="color:#555;">obs: ${m.observacoes}</em>`;
          }
          historicoHtml += `</li>`;
        });
        historicoHtml += `</ul>`;
      }
    } catch (e) {
      console.error("Falha ao buscar histórico do papelcartão:", e);
      historicoHtml = `<hr><p style="color:#a05a00;"><em>Não foi possível carregar o histórico.</em></p>`;
    }
    conteudo += historicoHtml;

    // Folhas filhas geradas deste papelcartão (idPai === id)
    const filhas = papelcartaoCache.filter((p) => String(p.idPai) === String(item._id));
    if (filhas.length > 0) {
      conteudo += `<hr style="margin:10px 0;"><p><strong>Folhas Filhas:</strong></p><ul>`;
      filhas.forEach((f) => {
        conteudo += `<li>${f.codigo} — ${f.formato || "-"} — ${f.quantidade ?? 0} folhas</li>`;
      });
      conteudo += `</ul>`;
    }

    document.getElementById("modalTitulo").textContent = `Papelcartão ${item.codigo || ""}`;
    document.getElementById("modalConteudo").innerHTML = conteudo;
    document.getElementById("modalBobina").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Erro ao visualizar: " + err.message);
  }
}

// ---- Inativar / Reativar ----
async function alternarInativaPapelcartao(id) {
  if (_movimentandoPC) return;
  _movimentandoPC = true;
  try {
    const item = await pcObter(id);
    const estaInativa = item.status === "INATIVA";

    if (estaInativa) {
      item.status = "DISPONÍVEL";
    } else {
      if (!confirm("Marcar este papelcartão como INATIVA?\nEle não poderá ser movimentado enquanto estiver inativo.")) return;
      item.status = "INATIVA";
    }

    await pcAtualizar(id, item);

    // Confirma persistência
    const verif = await pcObter(id);
    if (verif.status !== item.status) {
      console.warn("⚠️ Backend não persistiu status do papelcartão.", verif);
      alert("Atenção: o backend não gravou o novo status. Verifique se o deploy do model Papelcartao está ativo.");
    }
    await carregarPapelcartao();
  } catch (err) {
    console.error(err);
    alert("Erro ao alterar status: " + err.message);
  } finally {
    _movimentandoPC = false;
  }
}

// ---- Movimentação (Entrada/Saída) ----
function abrirMovimentoPapelcartao(id, tipo) {
  const item = papelcartaoCache.find((p) => p._id === id);
  if (!item) return alert("Registro não encontrado.");

  document.getElementById("idMovimentoPapelcartao").value = id;
  document.getElementById("tipoMovimentoPapelcartao").value = tipo;
  document.getElementById("quantidadeMovimentoPapelcartao").value = "";

  const titulo = tipo === "entrada" ? "Registrar Entrada" : "Registrar Saída";
  document.getElementById("tituloModalMovimentoPapelcartao").textContent =
    `${titulo} — ${item.codigo || ""} ${item.tipo || ""}`;
  document.getElementById("infoMovimentoPapelcartao").innerHTML =
    `Formato: <strong>${item.formato || "-"}</strong> | ` +
    `Gramatura: <strong>${item.gramatura ? item.gramatura + " g/m²" : "-"}</strong><br>` +
    `Estoque atual: <strong>${item.quantidade ?? 0} folhas</strong>` +
    ((item.quantidadeEmUso ?? 0) > 0 ? ` | Em uso: <strong>${item.quantidadeEmUso} folhas</strong>` : "");

  const inp = document.getElementById("quantidadeMovimentoPapelcartao");
  if (tipo === "saida") inp.max = item.quantidade ?? 0;
  else inp.removeAttribute("max");

  document.getElementById("modalMovimentoPapelcartao").style.display = "flex";
}

function fecharModalMovimentoPapelcartao() {
  document.getElementById("modalMovimentoPapelcartao").style.display = "none";
}

// ---- SAÍDA do Papelcartão (modal completo com máquina/usuário/obs/etiqueta) ----
function abrirSaidaPapelcartao(id) {
  const item = papelcartaoCache.find((p) => p._id === id);
  if (!item) return alert("Registro não encontrado.");
  if ((parseInt(item.quantidade, 10) || 0) <= 0) {
    return alert("Sem estoque disponível para saída.");
  }

  document.getElementById("idSaidaPapelcartao").value = id;
  document.getElementById("quantidadeSaidaPapelcartao").value = "";
  document.getElementById("quantidadeSaidaPapelcartao").max = item.quantidade;
  document.getElementById("tipoMaquinaPapelcartao").value = "";
  document.getElementById("usuarioSaidaPapelcartao").value = "";
  document.getElementById("obsSaidaPapelcartao").value = "";

  document.getElementById("tituloModalSaidaPapelcartao").textContent =
    `Registrar Saída — ${item.codigo || ""} ${item.tipo || ""}`;
  document.getElementById("infoSaidaPapelcartao").innerHTML =
    `Formato: <strong>${item.formato || "-"}</strong> | ` +
    `Gramatura: <strong>${item.gramatura ? item.gramatura + " g/m²" : "-"}</strong><br>` +
    `Estoque disponível: <strong>${item.quantidade ?? 0} folhas</strong>`;

  document.getElementById("modalSaidaPapelcartao").style.display = "flex";
}

function fecharModalSaidaPapelcartao() {
  document.getElementById("modalSaidaPapelcartao").style.display = "none";
}

// ---- RETORNO do Papelcartão (modal completo: folhas filhas + perda kg + etiqueta) ----
let _filhaSeq = 0;

// Abre retorno perguntando qual lote (se houver mais de um)
function abrirRetornoPapelcartao(id) {
  const item = papelcartaoCache.find((p) => p._id === id);
  if (!item) return alert("Registro não encontrado.");
  const lotes = Array.isArray(item.lotesEmUso) ? item.lotesEmUso : [];
  if (lotes.length === 0) return alert("Esse registro não tem lote em uso.");
  if (lotes.length === 1) return abrirRetornoPapelcartaoLote(id, lotes[0]._id);
  // Mais de um lote: pede pra escolher
  const escolha = prompt(
    "Este papelcartão tem múltiplos lotes em uso. Digite o número do lote:\n\n" +
      lotes
        .map((l, i) => `${i + 1}. ${l.quantidade} folhas na ${l.maquinaAtual || "-"}`)
        .join("\n")
  );
  const idx = parseInt(escolha, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= lotes.length) return;
  abrirRetornoPapelcartaoLote(id, lotes[idx]._id);
}

// Abre modal de retorno direto para um lote específico
function abrirRetornoPapelcartaoLote(id, loteId) {
  const item = papelcartaoCache.find((p) => p._id === id);
  if (!item) return alert("Registro não encontrado.");
  const lotes = Array.isArray(item.lotesEmUso) ? item.lotesEmUso : [];
  const lote = lotes.find((l) => String(l._id) === String(loteId));
  if (!lote) return alert("Lote não encontrado.");

  document.getElementById("idRetornoPapelcartao").value = id;
  document.getElementById("loteIdRetornoPapelcartao").value = loteId;
  document.getElementById("quantidadeRetornoPapelcartao").value = 0;
  document.getElementById("quantidadeRetornoPapelcartao").max = lote.quantidade;
  document.getElementById("perdaKgPapelcartao").value = 0;
  document.getElementById("usuarioRetornoPapelcartao").value = "";
  document.getElementById("obsRetornoPapelcartao").value = "";
  document.getElementById("filhasContainerPapelcartao").innerHTML = "";
  _filhaSeq = 0;

  document.getElementById("tituloModalRetornoPapelcartao").textContent =
    `Registrar Retorno — ${item.codigo || ""} ${item.tipo || ""}`;
  document.getElementById("infoRetornoPapelcartao").innerHTML =
    `Tipo: <strong>${item.tipo || "-"}</strong> | ` +
    `Gramatura: <strong>${item.gramatura ? item.gramatura + " g/m²" : "-"}</strong><br>` +
    `Lote: <strong>${lote.quantidade} folhas na ${lote.maquinaAtual || "-"}</strong><br>` +
    `<small>Informe quantas folhas inteiras voltam ao estoque, as folhas filhas (cortes) geradas e a perda em kg. ` +
    `O que não voltar inteiro é considerado processado/refilo.</small>`;

  atualizarResumoRetornoPapelcartao();
  document.getElementById("modalRetornoPapelcartao").style.display = "flex";
}

function fecharModalRetornoPapelcartao() {
  document.getElementById("modalRetornoPapelcartao").style.display = "none";
}

function adicionarFilhaPapelcartao() {
  const cont = document.getElementById("filhasContainerPapelcartao");
  const idx = ++_filhaSeq;
  const div = document.createElement("div");
  div.className = "filha-papelcartao-linha";
  div.style.cssText = "display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap;";
  div.innerHTML = `
    <input type="text" placeholder="Formato (ex.: 32x48)" class="filha-formato" style="flex:1; min-width:140px;" required />
    <input type="number" placeholder="Qtd" class="filha-quantidade" min="1" style="width:90px;" required />
    <button type="button" class="btn btn-danger" onclick="this.parentElement.remove(); atualizarResumoRetornoPapelcartao();" style="padding:4px 10px;">✕</button>
  `;
  // recalcula resumo quando o usuário digita
  div.querySelectorAll("input").forEach((i) =>
    i.addEventListener("input", atualizarResumoRetornoPapelcartao)
  );
  cont.appendChild(div);
  atualizarResumoRetornoPapelcartao();
}

function atualizarResumoRetornoPapelcartao() {
  const id = document.getElementById("idRetornoPapelcartao").value;
  const loteId = document.getElementById("loteIdRetornoPapelcartao").value;
  const item = papelcartaoCache.find((p) => p._id === id);
  if (!item) return;
  const lotes = Array.isArray(item.lotesEmUso) ? item.lotesEmUso : [];
  const lote = lotes.find((l) => String(l._id) === String(loteId));
  const emUso = lote ? parseInt(lote.quantidade, 10) || 0 : 0;

  const qtdRetorno = parseInt(document.getElementById("quantidadeRetornoPapelcartao").value, 10) || 0;
  const filhas = [...document.querySelectorAll("#filhasContainerPapelcartao .filha-papelcartao-linha")];
  const totalFilhas = filhas.reduce((s, f) => {
    return s + (parseInt(f.querySelector(".filha-quantidade").value, 10) || 0);
  }, 0);
  const perdaKg = parseFloat(document.getElementById("perdaKgPapelcartao").value) || 0;

  const erro = qtdRetorno > emUso;
  const cor = erro ? "#b02a2a" : "#444";

  let resumo = `<span style="color:${cor};">` +
    `<strong>Lote em uso:</strong> ${emUso} folhas → ` +
    `voltam ao estoque: <strong>${qtdRetorno}</strong>, ` +
    `processadas/consumidas: <strong>${emUso - qtdRetorno}</strong>` +
    `</span>`;

  if (totalFilhas > 0) {
    resumo += `<br><span style="color:#444;">` +
      `<strong>Folhas filhas geradas (cortes):</strong> ${totalFilhas} folhas` +
      `</span>`;
  }
  if (perdaKg > 0) {
    resumo += `<br><span style="color:#444;"><strong>Perda registrada:</strong> ${perdaKg} kg</span>`;
  }

  document.getElementById("resumoRetornoPapelcartao").innerHTML = resumo;
}

// ---- ETIQUETA do Papelcartão (impressão) ----
function gerarEtiquetaPapelcartao(item, contexto = {}) {
  // contexto: { tipo: 'SAIDA'|'RETORNO_FILHA', maquina, usuario, extra }
  const el = (id) => document.getElementById(id);
  el("etiquetaPcCodigo").textContent = item.codigo || "-";
  el("etiquetaPcTipo").textContent = item.tipo || "-";
  el("etiquetaPcFormato").textContent = item.formato || "-";
  el("etiquetaPcGramatura").textContent = item.gramatura ? item.gramatura + " g/m²" : "-";
  el("etiquetaPcQuantidade").textContent = (contexto.quantidade ?? item.quantidade ?? 0) + " folhas";
  el("etiquetaPcLocalizacao").textContent = item.localizacao || "-";
  el("etiquetaPcMaquina").textContent = contexto.maquina || "-";
  el("etiquetaPcUsuario").textContent = contexto.usuario || "-";
  el("etiquetaPcData").textContent = new Date().toLocaleString();
  el("etiquetaPcExtra").textContent = contexto.extra || "";

  const etiqueta = el("etiquetaPapelcartao");
  etiqueta.style.display = "block";
  window.print();
  etiqueta.style.display = "none";
}

// Abre modal de retorno (reusa o modal de movimento como "tipo=retorno")
// (Esta função antiga foi substituída por abrirRetornoPapelcartao no bloco acima.)


// ---- Listeners ----
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPapelcartao");
  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const id = document.getElementById("idPapelcartao").value;
      const dados = {
        tipo: document.getElementById("tipoPapelcartao").value.trim(),
        localizacao: document.getElementById("localizacaoPapelcartao").value.trim(),
        quantidade: parseInt(document.getElementById("quantidadePapelcartao").value, 10) || 0,
        formato: document.getElementById("formatoPapelcartao").value.trim(),
        gramatura: parseFloat(document.getElementById("gramaturaPapelcartao").value) || 0,
        observacoes: document.getElementById("observacoesPapelcartao").value.trim(),
      };
      try {
        if (id) {
          // preserva status manual ao editar
          const original = papelcartaoCache.find((p) => p._id === id);
          if (original) dados.status = original.status;
          await pcAtualizar(id, dados);
        } else {
          await pcCriar(dados);
        }
        fecharModalPapelcartao();
        await carregarPapelcartao();
      } catch (err) {
        console.error(err);
        alert("Erro ao salvar: " + err.message);
      }
    });
  }

  const formMov = document.getElementById("formMovimentoPapelcartao");
  if (formMov) {
    formMov.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (_movimentandoPC) return;
      _movimentandoPC = true;
      try {
        const id = document.getElementById("idMovimentoPapelcartao").value;
        const tipo = document.getElementById("tipoMovimentoPapelcartao").value;
        const qtd = parseInt(document.getElementById("quantidadeMovimentoPapelcartao").value, 10);
        if (!qtd || qtd <= 0) return alert("Informe uma quantidade válida.");
        await pcMovimentar(id, tipo, qtd);
        fecharModalMovimentoPapelcartao();
        await carregarPapelcartao();
      } catch (err) {
        console.error(err);
        alert("Erro: " + err.message);
      } finally {
        _movimentandoPC = false;
      }
    });
  }

  const inpFiltroPC = document.getElementById("filtroPapelcartao");
  if (inpFiltroPC) inpFiltroPC.addEventListener("input", aplicarFiltrosPapelcartao);
  const selFiltroTipoPC = document.getElementById("filtroTipoPapelcartao");
  if (selFiltroTipoPC) selFiltroTipoPC.addEventListener("change", aplicarFiltrosPapelcartao);

  // SAÍDA do Papelcartão (modal completo)
  const formSaidaPC = document.getElementById("formSaidaPapelcartao");
  if (formSaidaPC) {
    formSaidaPC.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (_movimentandoPC) return;
      _movimentandoPC = true;
      try {
        const id = document.getElementById("idSaidaPapelcartao").value;
        const qtd = parseInt(document.getElementById("quantidadeSaidaPapelcartao").value, 10);
        const maquina = document.getElementById("tipoMaquinaPapelcartao").value;
        const usuario = document.getElementById("usuarioSaidaPapelcartao").value.trim();
        const obs = document.getElementById("obsSaidaPapelcartao").value.trim();
        if (!qtd || qtd <= 0) return alert("Informe uma quantidade válida.");
        if (!maquina) return alert("Selecione a máquina.");
        if (!usuario) return alert("Informe o usuário.");

        const atualizado = await pcSaidaCompleta(id, {
          quantidade: qtd,
          tipoMaquina: maquina,
          usuario,
          observacoes: obs,
        });

        fecharModalSaidaPapelcartao();
        await carregarPapelcartao();

        // Gera etiqueta da saída
        gerarEtiquetaPapelcartao(atualizado, {
          quantidade: qtd,
          maquina,
          usuario,
          extra: obs ? `Obs: ${obs}` : "",
        });
      } catch (err) {
        console.error(err);
        alert("Erro: " + err.message);
      } finally {
        _movimentandoPC = false;
      }
    });
  }

  // RETORNO do Papelcartão (modal completo, com folhas filhas)
  const inpQtdRet = document.getElementById("quantidadeRetornoPapelcartao");
  if (inpQtdRet) inpQtdRet.addEventListener("input", atualizarResumoRetornoPapelcartao);
  const inpPerdaKg = document.getElementById("perdaKgPapelcartao");
  if (inpPerdaKg) inpPerdaKg.addEventListener("input", atualizarResumoRetornoPapelcartao);

  const formRetornoPC = document.getElementById("formRetornoPapelcartao");
  if (formRetornoPC) {
    formRetornoPC.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (_movimentandoPC) return;
      _movimentandoPC = true;
      try {
        const id = document.getElementById("idRetornoPapelcartao").value;
        const loteId = document.getElementById("loteIdRetornoPapelcartao").value;
        const item = papelcartaoCache.find((p) => p._id === id);
        if (!item) return alert("Registro não encontrado.");
        const lotes = Array.isArray(item.lotesEmUso) ? item.lotesEmUso : [];
        const lote = lotes.find((l) => String(l._id) === String(loteId));
        if (!lote) return alert("Lote não encontrado.");
        const emUso = parseInt(lote.quantidade, 10) || 0;

        const qtdRetorno = parseInt(document.getElementById("quantidadeRetornoPapelcartao").value, 10) || 0;
        const perdaKg = parseFloat(document.getElementById("perdaKgPapelcartao").value) || 0;
        const usuario = document.getElementById("usuarioRetornoPapelcartao").value.trim();
        const obs = document.getElementById("obsRetornoPapelcartao").value.trim();

        if (!usuario) return alert("Informe o usuário.");
        if (qtdRetorno < 0) return alert("Quantidade de retorno inválida.");
        if (perdaKg < 0) return alert("Perda inválida.");

        const linhas = [...document.querySelectorAll("#filhasContainerPapelcartao .filha-papelcartao-linha")];
        const filhas = linhas
          .map((l) => ({
            formato: l.querySelector(".filha-formato").value.trim(),
            quantidade: parseInt(l.querySelector(".filha-quantidade").value, 10) || 0,
          }))
          .filter((f) => f.formato && f.quantidade > 0);

        if (qtdRetorno > emUso) {
          return alert(`Folhas que voltam ao estoque (${qtdRetorno}) maior que o lote (${emUso}).`);
        }

        const resultado = await pcRetornar(id, {
          loteId,
          quantidadeRetorno: qtdRetorno,
          perdaKg,
          filhas,
          usuario,
          observacoes: obs,
        });

        fecharModalRetornoPapelcartao();
        await carregarPapelcartao();

        // Etiquetas: uma para o pai (se voltou ao estoque) + uma para cada filha
        if (qtdRetorno > 0 && resultado.pai) {
          gerarEtiquetaPapelcartao(resultado.pai, {
            quantidade: qtdRetorno,
            usuario,
            extra: `Retorno ao estoque${perdaKg > 0 ? ` | Perda: ${perdaKg} kg` : ""}${obs ? ` | Obs: ${obs}` : ""}`,
          });
        }
        if (Array.isArray(resultado.filhas)) {
          for (const filha of resultado.filhas) {
            gerarEtiquetaPapelcartao(filha, {
              quantidade: filha.quantidade,
              usuario,
              extra: `Folha filha de ${resultado.pai && resultado.pai.codigo}`,
            });
          }
        }
      } catch (err) {
        console.error(err);
        alert("Erro: " + err.message);
      } finally {
        _movimentandoPC = false;
      }
    });
  }
});

// Recarrega a aba quando ela é aberta (hook em openTab)
const _openTabOriginal = typeof openTab === "function" ? openTab : null;
openTab = function (tabId, event) {
  if (_openTabOriginal) _openTabOriginal(tabId, event);
  if (tabId === "papelcartao") carregarPapelcartao();
};


// ============================================================
// ====== SUB-ABAS de Movimentação e Relatórios ===============
// ============================================================
function abrirSubTabMov(subId, btn) {
  const cont = document.querySelector("#movimentacao");
  cont.querySelectorAll(".sub-tab").forEach((b) => b.classList.remove("active"));
  cont.querySelectorAll(".sub-tab-content").forEach((c) => c.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const alvo = document.getElementById(subId);
  if (alvo) alvo.classList.add("active");

  if (subId === "mov-papelcartao") carregarHistoricoPapelcartao();
  else if (subId === "mov-insumos") carregarHistoricoInsumosTab();
}

function abrirSubTabRel(subId, btn) {
  const cont = document.querySelector("#relatorios");
  cont.querySelectorAll(".sub-tab").forEach((b) => b.classList.remove("active"));
  cont.querySelectorAll(".sub-tab-content").forEach((c) => c.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const alvo = document.getElementById(subId);
  if (alvo) alvo.classList.add("active");
}

// ============================================================
// ====== Histórico de movimentações - PAPELCARTÃO ============
// ============================================================
async function carregarHistoricoPapelcartao() {
  const corpo = document.getElementById("corpoTabelaHistoricoPC");
  if (!corpo) return;
  corpo.innerHTML = `<tr><td colspan="12">Carregando...</td></tr>`;
  try {
    const [movs, pcs] = await Promise.all([
      (await fetch(`${API_BASE_URL}/movimentacoes`)).json(),
      (await fetch(`${API_BASE_URL}/papelcartao`)).json(),
    ]);
    const mapaPc = new Map((pcs || []).map((p) => [String(p._id), p]));
    const lista = (movs || []).filter((m) => m.tipoItem === "papelcartao");

    if (lista.length === 0) {
      corpo.innerHTML = `<tr><td colspan="13">Nenhuma movimentação de papelcartão encontrada</td></tr>`;
      return;
    }

    // ordena: mais recentes primeiro
    lista.sort((a, b) => new Date(b.data) - new Date(a.data));

    corpo.innerHTML = lista
      .map((m) => {
        const data = m.data ? new Date(m.data).toLocaleString() : "-";
        const pc = mapaPc.get(String(m.idItem));
        const gramatura = pc && pc.gramatura ? pc.gramatura + " g/m²" : "-";
        return `<tr>
          <td>${data}</td>
          <td>${m.codigoItem || "-"}</td>
          <td>${m.descricaoItem || "-"}</td>
          <td>${gramatura}</td>
          <td>${m.tipoMovimentacao || "-"}</td>
          <td>${(m.quantidade ?? 0) + " " + (m.unidade || "folhas")}</td>
          <td>${m.tipoMaquina || "-"}</td>
          <td>${m.usuario || "-"}</td>
          <td>${m.cliente || "-"}</td>
          <td>${m.perdaKg ? m.perdaKg + " folhas" : "-"}</td>
          <td>${m.filhasGeradas ?? "-"}</td>
          <td>${m.observacoes || "-"}</td>
          <td class="no-print">
            <button class="btn" onclick="editarMovimentacao('${m._id}')">Editar</button>
            <button class="btn-danger" onclick="excluirMovimentacao('${m._id}')">Excluir</button>
          </td>
        </tr>`;
      })
      .join("");
  } catch (err) {
    console.error(err);
    corpo.innerHTML = `<tr><td colspan="13" style="color:red;">Erro ao carregar. Veja o console.</td></tr>`;
  }
}

// ============================================================
// ====== Histórico de Insumos (reaproveita os lançamentos) ===
// ============================================================
async function carregarHistoricoInsumosTab() {
  const corpo = document.getElementById("corpoTabelaHistoricoInsumos");
  if (!corpo) return;
  corpo.innerHTML = `<tr><td colspan="9">Carregando...</td></tr>`;
  try {
    const lancamentos = await (await fetch(INSUMOS_API)).json();
    if (!Array.isArray(lancamentos) || lancamentos.length === 0) {
      corpo.innerHTML = `<tr><td colspan="9">Nenhum lançamento de insumo</td></tr>`;
      return;
    }

    // ordena por data crescente p/ calcular total acumulado
    lancamentos.sort((a, b) => {
      const da = new Date(a.data || 0).getTime();
      const db = new Date(b.data || 0).getTime();
      if (da !== db) return da - db;
      return String(a._id).localeCompare(String(b._id));
    });

    const totais = new Map();
    const linhas = lancamentos.map((l) => {
      const t = (totais.get(l.codigo) || 0) +
        (parseFloat(l.entrada) || 0) -
        (parseFloat(l.saida) || 0);
      totais.set(l.codigo, t);
      return { l, total: t };
    });

    // mostra do mais recente para o mais antigo
    corpo.innerHTML = linhas
      .slice()
      .reverse()
      .map(({ l, total }) => {
        const data = l.data ? new Date(l.data).toLocaleDateString() : "-";
        const entrada = parseFloat(l.entrada) || 0;
        const saida = parseFloat(l.saida) || 0;
        const fmt = (n) => (n === 0 ? "-" : n);
        return `<tr>
          <td>${data}</td>
          <td>${l.codigo || "-"}</td>
          <td>${l.fabricante || "-"}</td>
          <td>${l.descricao || "-"}</td>
          <td>${l.funcionario || "-"}</td>
          <td>${l.setor || "-"}</td>
          <td>${fmt(entrada)}</td>
          <td>${fmt(saida)}</td>
          <td>${total}</td>
          <td class="no-print">
            <button class="btn" onclick="editarInsumoMov('${l._id}')">Editar</button>
            <button class="btn-danger" onclick="excluirInsumoMov('${l._id}')">Excluir</button>
          </td>
        </tr>`;
      })
      .join("");
  } catch (err) {
    console.error(err);
    corpo.innerHTML = `<tr><td colspan="9" style="color:red;">Erro ao carregar. Veja o console.</td></tr>`;
  }
}

// ============================================================
// ====== RELATÓRIOS - PAPELCARTÃO ============================
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const selRelPC = document.getElementById("tipoRelatorioPC");
  if (selRelPC) {
    selRelPC.addEventListener("change", function () {
      document.getElementById("filtroPeriodoPC").style.display =
        this.value === "movimentacaoPeriodo" ? "block" : "none";
    });
  }
  const selRelIns = document.getElementById("tipoRelatorioIns");
  if (selRelIns) {
    selRelIns.addEventListener("change", function () {
      const v = this.value;
      const precisaData = v === "lancamentosPeriodo" || v === "porFuncionario" || v === "porSetor" || v === "saldoAtual";
      document.getElementById("filtroPeriodoIns").style.display = precisaData ? "block" : "none";
    });
  }
});

async function gerarRelatorioPC() {
  const tipo = document.getElementById("tipoRelatorioPC").value;
  const conteudo = document.getElementById("conteudoRelatorioPC");
  const card = document.getElementById("resultadoRelatorioPC");

  try {
    if (tipo === "estoqueAtual") {
      const itens = await (await fetch(`${API_BASE_URL}/papelcartao`)).json();
      if (!Array.isArray(itens) || itens.length === 0) {
        conteudo.innerHTML = `<p>Nenhum papelcartão cadastrado.</p>`;
      } else {
        let html = `<h4>Estoque Atual de Papelcartão</h4>
          <table><thead><tr>
            <th>Código</th><th>Tipo</th><th>Formato</th><th>Gramatura</th>
            <th>Localização</th><th>Quantidade</th><th>Em uso</th><th>Status</th>
          </tr></thead><tbody>`;
        itens.forEach((p) => {
          const s = calcularStatusPapelcartao(p);
          html += `<tr>
            <td>${p.codigo || "-"}</td>
            <td>${p.tipo || "-"}</td>
            <td>${p.formato || "-"}</td>
            <td>${p.gramatura ? p.gramatura + " g/m²" : "-"}</td>
            <td>${p.localizacao || "-"}</td>
            <td>${p.quantidade ?? 0}</td>
            <td>${p.quantidadeEmUso ?? 0}</td>
            <td>${s}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
        conteudo.innerHTML = html;
      }
    } else if (tipo === "movimentacaoPeriodo") {
      const inicio = document.getElementById("dataInicioPC").value;
      const fim = document.getElementById("dataFimPC").value;
      if (!inicio || !fim) {
        alert("Selecione data início e fim.");
        return;
      }
      const movs = await (await fetch(`${API_BASE_URL}/movimentacoes`)).json();
      const filtradas = (movs || []).filter((m) => {
        if (m.tipoItem !== "papelcartao") return false;
        const d = new Date(m.data);
        return d >= new Date(inicio + "T00:00:00") && d <= new Date(fim + "T23:59:59");
      });

      if (filtradas.length === 0) {
        conteudo.innerHTML = `<p>Nenhuma movimentação no período.</p>`;
      } else {
        let html = `<h4>Movimentações de Papelcartão (${inicio} → ${fim})</h4>
          <table><thead><tr>
            <th>Data</th><th>Código</th><th>Tipo</th><th>Quantidade</th>
            <th>Máquina</th><th>Usuário</th><th>Cliente</th><th>Perda (folhas)</th><th>Filhas</th><th>Obs.</th>
          </tr></thead><tbody>`;
        filtradas.sort((a, b) => new Date(b.data) - new Date(a.data));
        filtradas.forEach((m) => {
          html += `<tr>
            <td>${new Date(m.data).toLocaleString()}</td>
            <td>${m.codigoItem || "-"}</td>
            <td>${m.tipoMovimentacao || "-"}</td>
            <td>${m.quantidade ?? 0} ${m.unidade || "folhas"}</td>
            <td>${m.tipoMaquina || "-"}</td>
            <td>${m.usuario || "-"}</td>
            <td>${m.cliente || "-"}</td>
            <td>${m.perdaKg ?? "-"}</td>
            <td>${m.filhasGeradas ?? "-"}</td>
            <td>${m.observacoes || "-"}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
        conteudo.innerHTML = html;
      }
    }
    card.style.display = "block";
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar relatório: " + err.message);
  }
}

// ============================================================
// ====== RELATÓRIOS - INSUMOS ================================
// ============================================================
async function gerarRelatorioIns() {
  const tipo = document.getElementById("tipoRelatorioIns").value;
  const conteudo = document.getElementById("conteudoRelatorioIns");
  const card = document.getElementById("resultadoRelatorioIns");
  const inicio = document.getElementById("dataInicioIns").value;
  const fim = document.getElementById("dataFimIns").value;

  try {
    const lancamentos = await (await fetch(INSUMOS_API)).json();
    if (!Array.isArray(lancamentos) || lancamentos.length === 0) {
      conteudo.innerHTML = `<p>Nenhum lançamento de insumo.</p>`;
      card.style.display = "block";
      return;
    }
    lancamentos.sort((a, b) => new Date(a.data) - new Date(b.data));

    function noPeriodo(l) {
      if (!inicio && !fim) return true;
      const d = new Date(l.data || 0);
      if (inicio && d < new Date(inicio + "T00:00:00")) return false;
      if (fim && d > new Date(fim + "T23:59:59")) return false;
      return true;
    }

    if (tipo === "saldoAtual") {
      // Saldo por código considerando filtro de período (opcional)
      const filtrados = lancamentos.filter(noPeriodo);
      const mapa = new Map();
      for (const l of filtrados) {
        const atual = mapa.get(l.codigo) || { codigo: l.codigo, fabricante: l.fabricante, descricao: l.descricao, entrada: 0, saida: 0 };
        atual.entrada += parseFloat(l.entrada) || 0;
        atual.saida += parseFloat(l.saida) || 0;
        // mantém último fabricante/descrição preenchidos
        if (l.fabricante) atual.fabricante = l.fabricante;
        if (l.descricao) atual.descricao = l.descricao;
        mapa.set(l.codigo, atual);
      }
      const linhas = [...mapa.values()].sort((a, b) => String(a.codigo).localeCompare(String(b.codigo)));
      let html = `<h4>Saldo por Código${inicio || fim ? ` (${inicio || "..."} → ${fim || "..."})` : ""}</h4>
        <table><thead><tr><th>Código</th><th>Fabricante</th><th>Descrição</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>`;
      linhas.forEach((r) => {
        const saldo = r.entrada - r.saida;
        const cor = saldo <= 0 ? "color:#b02a2a; font-weight:bold;" : "";
        html += `<tr>
          <td>${r.codigo || "-"}</td>
          <td>${r.fabricante || "-"}</td>
          <td>${r.descricao || "-"}</td>
          <td>${r.entrada}</td>
          <td>${r.saida}</td>
          <td style="${cor}">${saldo}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
      conteudo.innerHTML = html;
    } else if (tipo === "lancamentosPeriodo") {
      if (!inicio || !fim) { alert("Selecione data início e fim."); return; }
      const filtrados = lancamentos.filter(noPeriodo);
      if (filtrados.length === 0) {
        conteudo.innerHTML = `<p>Nenhum lançamento no período.</p>`;
      } else {
        let html = `<h4>Lançamentos (${inicio} → ${fim})</h4>
          <table><thead><tr>
            <th>Data</th><th>Código</th><th>Fabricante</th><th>Descrição</th>
            <th>Funcionário</th><th>Setor</th><th>Entrada</th><th>Saída</th>
          </tr></thead><tbody>`;
        filtrados.slice().reverse().forEach((l) => {
          html += `<tr>
            <td>${new Date(l.data).toLocaleDateString()}</td>
            <td>${l.codigo || "-"}</td>
            <td>${l.fabricante || "-"}</td>
            <td>${l.descricao || "-"}</td>
            <td>${l.funcionario || "-"}</td>
            <td>${l.setor || "-"}</td>
            <td>${l.entrada || 0}</td>
            <td>${l.saida || 0}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
        conteudo.innerHTML = html;
      }
    } else if (tipo === "porFuncionario" || tipo === "porSetor") {
      const campo = tipo === "porFuncionario" ? "funcionario" : "setor";
      const filtrados = lancamentos.filter(noPeriodo);
      const mapa = new Map();
      for (const l of filtrados) {
        const k = (l[campo] || "(sem informação)").trim() || "(sem informação)";
        const atual = mapa.get(k) || { chave: k, qtdLanc: 0, entrada: 0, saida: 0 };
        atual.qtdLanc++;
        atual.entrada += parseFloat(l.entrada) || 0;
        atual.saida += parseFloat(l.saida) || 0;
        mapa.set(k, atual);
      }
      const linhas = [...mapa.values()].sort((a, b) => String(a.chave).localeCompare(String(b.chave)));
      const titulo = tipo === "porFuncionario" ? "Funcionário" : "Setor";
      let html = `<h4>Lançamentos por ${titulo}${inicio || fim ? ` (${inicio || "..."} → ${fim || "..."})` : ""}</h4>
        <table><thead><tr><th>${titulo}</th><th>Qtd. Lançamentos</th><th>Total Entradas</th><th>Total Saídas</th></tr></thead><tbody>`;
      linhas.forEach((r) => {
        html += `<tr>
          <td>${r.chave}</td>
          <td>${r.qtdLanc}</td>
          <td>${r.entrada}</td>
          <td>${r.saida}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
      conteudo.innerHTML = html;
    }
    card.style.display = "block";
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar relatório: " + err.message);
  }
}

// Hook no openTab para carregar histórico inicial da aba Movimentação
const _openTabBaseMov = typeof openTab === "function" ? openTab : null;
openTab = function (tabId, event) {
  if (_openTabBaseMov) _openTabBaseMov(tabId, event);
  if (tabId === "movimentacao") {
    // recarrega o histórico atualmente visível
    const visivel = document.querySelector("#movimentacao .sub-tab-content.active");
    if (visivel) {
      if (visivel.id === "mov-papelcartao") carregarHistoricoPapelcartao();
      else if (visivel.id === "mov-insumos") carregarHistoricoInsumosTab();
    }
  }
};

// ============================================================
// ====== EDITAR/EXCLUIR de movimentações (Bobinas/Papelcartão)
// ============================================================
async function editarMovimentacao(id) {
  try {
    // Busca a movimentação direto do backend
    const todas = await (await fetch(`${API_BASE_URL}/movimentacoes`)).json();
    const mov = todas.find((m) => String(m._id) === String(id));
    if (!mov) return alert("Movimentação não encontrada.");

    const tipoItem = mov.tipoItem || "bobina";
    const nomesTipos = { bobina: "Bobina", papelcartao: "Papelcartão", produto_acabado: "Produto Acabado" };
    const nomeTipo = nomesTipos[tipoItem] || tipoItem;

    document.getElementById("idMovEdit").value = mov._id;
    document.getElementById("tituloEditarMov").textContent =
      `Editar Movimentação — ${mov.tipoMovimentacao || ""} (${nomeTipo})`;
    document.getElementById("infoMovEdit").innerHTML =
      `Item: <strong>${(mov.codigoItem || mov.descricaoItem || "-")}</strong> | ` +
      `Data: <strong>${mov.data ? new Date(mov.data).toLocaleString() : "-"}</strong>`;

    let lblQtd = "Peso (kg)";
    if (tipoItem === "papelcartao") lblQtd = "Quantidade (folhas)";
    else if (tipoItem === "produto_acabado") lblQtd = "Quantidade";
    document.getElementById("lblQuantidadeMovEdit").textContent = lblQtd;

    const inpQtd = document.getElementById("quantidadeMovEdit");
    inpQtd.value = mov.quantidade ?? 0;
    inpQtd.step = tipoItem === "bobina" ? "0.01" : "1";

    document.getElementById("maquinaMovEdit").value = mov.tipoMaquina || "";
    document.getElementById("usuarioMovEdit").value = mov.usuario || "";
    document.getElementById("clienteMovEdit").value = mov.cliente || "";
    document.getElementById("obsMovEdit").value = mov.observacoes || "";
    document.getElementById("perdaMovEdit").value = mov.perdaKg ?? 0;
    // Perda é em kg para bobinas; em folhas para papelcartão e folhas de bobina
    const lblPerda = document.getElementById("lblPerdaMovEdit");
    if (lblPerda) {
      lblPerda.textContent = tipoItem === "bobina" ? "Perda (kg)" : "Perda (folhas)";
    }
    const inpPerda = document.getElementById("perdaMovEdit");
    if (inpPerda) inpPerda.step = tipoItem === "bobina" ? "0.001" : "1";

    // Perda só faz sentido em RETORNO de bobina/papelcartão; máquina só em SAÍDA de bobina/papelcartão.
    // Produtos acabados não têm nenhum dos dois.
    const temMaquinaEPerda = tipoItem !== "produto_acabado";
    document.getElementById("grupoPerdaMovEdit").style.display =
      temMaquinaEPerda && mov.tipoMovimentacao === "RETORNO" ? "block" : "none";
    document.getElementById("grupoMaquinaMovEdit").style.display =
      temMaquinaEPerda && mov.tipoMovimentacao === "SAIDA" ? "block" : "none";

    document.getElementById("modalEditarMov").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Erro ao abrir edição: " + err.message);
  }
}

function fecharModalEditarMov() {
  document.getElementById("modalEditarMov").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formEditarMov");
  if (!form) return;
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const id = document.getElementById("idMovEdit").value;
    const dados = {
      quantidade: parseFloat(document.getElementById("quantidadeMovEdit").value) || 0,
      tipoMaquina: document.getElementById("maquinaMovEdit").value.trim(),
      usuario: document.getElementById("usuarioMovEdit").value.trim(),
      cliente: document.getElementById("clienteMovEdit").value.trim(),
      observacoes: document.getElementById("obsMovEdit").value.trim(),
      perdaKg: parseFloat(document.getElementById("perdaMovEdit").value) || 0,
    };
    try {
      const res = await fetch(`${API_BASE_URL}/movimentacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) {
        const erro = await res.json().catch(() => ({}));
        throw new Error(erro.error || `HTTP ${res.status}`);
      }
      alert("✅ Movimentação editada e saldo ajustado.");
      fecharModalEditarMov();
      // recarrega tudo que pode ter mudado
      if (typeof carregarHistorico === "function") carregarHistorico();
      if (typeof carregarHistoricoPapelcartao === "function") carregarHistoricoPapelcartao();
      if (typeof carregarEstoque === "function") carregarEstoque();
      if (typeof carregarPapelcartao === "function") carregarPapelcartao();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar edição: " + err.message);
    }
  });
});

// ============================================================
// ====== INSUMOS na aba Movimentação: editar/excluir =========
// ============================================================
// Reutiliza o modal de Insumos que já existe na aba Insumos.
async function editarInsumoMov(id) {
  // Garante que insumosCache está populado
  if (!insumosCache || insumosCache.length === 0) {
    await carregarInsumos();
  }
  editarInsumo(id);
}

async function excluirInsumoMov(id) {
  if (!confirm("Excluir este lançamento de insumo?")) return;
  try {
    await insExcluir(id);
    // recarrega tudo que mostra insumos
    if (typeof carregarInsumos === "function") await carregarInsumos();
    if (typeof carregarHistoricoInsumosTab === "function") await carregarHistoricoInsumosTab();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir: " + err.message);
  }
}

// ============================================================
// ====== TRANSFERÊNCIA entre máquinas (Papelcartão) ==========
// ============================================================
function abrirTransferirPapelcartao(id) {
  const item = papelcartaoCache.find((p) => p._id === id);
  if (!item) return alert("Registro não encontrado.");
  const lotes = Array.isArray(item.lotesEmUso) ? item.lotesEmUso : [];
  if (lotes.length === 0) return alert("Este papelcartão não está em uso.");
  if (lotes.length === 1) return abrirTransferirPapelcartaoLote(id, lotes[0]._id);
  const escolha = prompt(
    "Este papelcartão tem múltiplos lotes em uso. Digite o número do lote a transferir:\n\n" +
      lotes
        .map((l, i) => `${i + 1}. ${l.quantidade} folhas na ${l.maquinaAtual || "-"}`)
        .join("\n")
  );
  const idx = parseInt(escolha, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= lotes.length) return;
  abrirTransferirPapelcartaoLote(id, lotes[idx]._id);
}

function abrirTransferirPapelcartaoLote(id, loteId) {
  const item = papelcartaoCache.find((p) => p._id === id);
  if (!item) return alert("Registro não encontrado.");
  const lotes = Array.isArray(item.lotesEmUso) ? item.lotesEmUso : [];
  const lote = lotes.find((l) => String(l._id) === String(loteId));
  if (!lote) return alert("Lote não encontrado.");

  document.getElementById("idTransferirPapelcartao").value = id;
  document.getElementById("loteIdTransferirPapelcartao").value = loteId;
  document.getElementById("novaMaquinaPapelcartao").value = "";
  document.getElementById("usuarioTransferirPapelcartao").value = "";
  document.getElementById("obsTransferirPapelcartao").value = "";
  document.getElementById("perdaKgTransferirPapelcartao").value = 0;
  document.getElementById("folhasPerdidasTransferirPapelcartao").value = 0;

  document.getElementById("tituloModalTransferirPapelcartao").textContent =
    `Transferir entre máquinas — ${item.codigo || ""}`;
  document.getElementById("infoTransferirPapelcartao").innerHTML =
    `Lote: <strong>${lote.quantidade} folhas</strong><br>` +
    `Máquina atual: <strong>${lote.maquinaAtual || "-"}</strong><br>` +
    `<small>Este lote será movido para a nova máquina. O estoque não é alterado.</small>`;

  document.getElementById("modalTransferirPapelcartao").style.display = "flex";
}

function fecharModalTransferirPapelcartao() {
  document.getElementById("modalTransferirPapelcartao").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formTransferirPapelcartao");
  if (!form) return;
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (_movimentandoPC) return;
    _movimentandoPC = true;
    try {
      const id = document.getElementById("idTransferirPapelcartao").value;
      const loteId = document.getElementById("loteIdTransferirPapelcartao").value;
      const novaMaquina = document.getElementById("novaMaquinaPapelcartao").value;
      const usuario = document.getElementById("usuarioTransferirPapelcartao").value.trim();
      const obs = document.getElementById("obsTransferirPapelcartao").value.trim();
      const perdaKg = parseFloat(document.getElementById("perdaKgTransferirPapelcartao").value) || 0;
      const folhasPerdidas = parseInt(document.getElementById("folhasPerdidasTransferirPapelcartao").value, 10) || 0;

      if (!novaMaquina) return alert("Selecione a nova máquina.");
      if (!usuario) return alert("Informe o usuário.");
      if (!loteId) return alert("Lote não identificado.");
      if (folhasPerdidas < 0) return alert("Folhas perdidas inválidas.");

      const item = papelcartaoCache.find((p) => p._id === id);
      const lote = item && (item.lotesEmUso || []).find((l) => String(l._id) === String(loteId));
      if (lote && folhasPerdidas > (lote.quantidade || 0)) {
        return alert(`Folhas perdidas (${folhasPerdidas}) maior que o lote (${lote.quantidade}).`);
      }
      if (lote && (lote.maquinaAtual || "") === novaMaquina) {
        return alert("A máquina escolhida é a mesma atual deste lote. Selecione outra.");
      }

      await pcTransferir(id, { loteId, novaMaquina, usuario, observacoes: obs, perdaKg, folhasPerdidas });

      fecharModalTransferirPapelcartao();
      await carregarPapelcartao();
    } catch (err) {
      console.error(err);
      alert("Erro: " + err.message);
    } finally {
      _movimentandoPC = false;
    }
  });
});

// ============================================================
// ====== INSUMOS: edição rápida do valor de Entrada/Saída ====
// ============================================================
function ajustarValorInsumo(id, tipo) {
  const lanc = insumosCache.find((i) => i._id === id);
  if (!lanc) return alert("Lançamento não encontrado.");

  document.getElementById("idAjusteInsumo").value = id;
  document.getElementById("tipoAjusteInsumo").value = tipo;

  const label = tipo === "entrada" ? "Entrada" : "Saída";
  document.getElementById("tituloAjusteInsumo").textContent = `Ajustar ${label}`;
  document.getElementById("lblValorAjusteInsumo").textContent = label;
  document.getElementById("infoAjusteInsumo").innerHTML =
    `<strong>${lanc.codigo || "-"}</strong> — ${lanc.descricao || "-"}<br>` +
    `<small>Alterar apenas o valor de <strong>${label}</strong> deste lançamento.</small>`;

  const inp = document.getElementById("valorAjusteInsumo");
  inp.value = tipo === "entrada" ? (lanc.entrada ?? 0) : (lanc.saida ?? 0);

  document.getElementById("modalAjusteInsumo").style.display = "flex";
  setTimeout(() => { inp.focus(); inp.select(); }, 50);
}

function fecharModalAjusteInsumo() {
  document.getElementById("modalAjusteInsumo").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formAjusteInsumo");
  if (!form) return;
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const id = document.getElementById("idAjusteInsumo").value;
    const tipo = document.getElementById("tipoAjusteInsumo").value;
    const valor = parseFloat(document.getElementById("valorAjusteInsumo").value);
    if (isNaN(valor) || valor < 0) return alert("Valor inválido.");

    const lanc = insumosCache.find((i) => i._id === id);
    if (!lanc) return alert("Lançamento não encontrado.");

    // Monta o payload: mantém tudo, muda só o campo do tipo escolhido.
    const dados = {
      data: lanc.data,
      codigo: lanc.codigo,
      fabricante: lanc.fabricante,
      descricao: lanc.descricao,
      funcionario: lanc.funcionario,
      setor: lanc.setor,
      entrada: tipo === "entrada" ? valor : (parseFloat(lanc.entrada) || 0),
      saida: tipo === "saida" ? valor : (parseFloat(lanc.saida) || 0),
    };

    try {
      await insAtualizar(id, dados);
      fecharModalAjusteInsumo();
      await carregarInsumos();
      // atualiza também a sub-aba de Movimentação se estiver visível
      if (typeof carregarHistoricoInsumosTab === "function") carregarHistoricoInsumosTab();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar: " + err.message);
    }
  });
});

// ============================================================
// ====== TRANSFERÊNCIA entre máquinas (Bobinas) ==============
// ============================================================
async function abrirTransferirBobina(id) {
  try {
    const bobina = await getBobinaById(id);
    if (!bobina) return alert("Bobina não encontrada.");
    if (!bobina.dataSaida) return alert("Esta bobina não está em uso.");

    document.getElementById("idTransferirBobina").value = id;
    document.getElementById("novaMaquinaBobina").value = "";
    document.getElementById("usuarioTransferirBobina").value = "";
    document.getElementById("obsTransferirBobina").value = "";
    document.getElementById("perdaKgTransferirBobina").value = 0;

    document.getElementById("tituloModalTransferirBobina").textContent =
      `Transferir Bobina — ${bobina.codigoQR || ""}`;
    document.getElementById("infoTransferirBobina").innerHTML =
      `Peso atual: <strong>${(bobina.peso || 0).toFixed(2)} kg</strong><br>` +
      `Máquina atual: <strong>${bobina.maquinaAtual || "-"}</strong><br>` +
      `<small>O lote será movido para a nova máquina. O peso não é alterado.</small>`;

    document.getElementById("modalTransferirBobina").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Erro ao abrir transferência: " + err.message);
  }
}

function fecharModalTransferirBobina() {
  document.getElementById("modalTransferirBobina").style.display = "none";
}

let _transferindoBobina = false;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formTransferirBobina");
  if (!form) return;
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (_transferindoBobina) return;
    _transferindoBobina = true;
    try {
      const id = document.getElementById("idTransferirBobina").value;
      const novaMaquina = document.getElementById("novaMaquinaBobina").value;
      const usuario = document.getElementById("usuarioTransferirBobina").value.trim();
      const obs = document.getElementById("obsTransferirBobina").value.trim();
      const perdaKg = parseFloat(document.getElementById("perdaKgTransferirBobina").value) || 0;

      if (!novaMaquina) return alert("Selecione a nova máquina.");
      if (!usuario) return alert("Informe o usuário.");

      const bobina = await getBobinaById(id);
      if (bobina && (bobina.maquinaAtual || "") === novaMaquina) {
        return alert("A máquina escolhida é a mesma atual. Selecione outra.");
      }

      const res = await fetch(`${API_BASE_URL}/bobinas/${id}/transferir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novaMaquina, usuario, observacoes: obs, perdaKg }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao transferir");

      fecharModalTransferirBobina();
      await carregarEstoque();
      if (typeof carregarHistorico === "function") carregarHistorico();
    } catch (err) {
      console.error(err);
      alert("Erro: " + err.message);
    } finally {
      _transferindoBobina = false;
    }
  });
});

// ============================================================
// ====== ABA PRODUTOS ACABADOS ===============================
// ============================================================
const PRODAC_API = `${API_BASE_URL}/produtos-acabados`;

let prodacCache = [];
let filtroStatusProdAc = "TODOS"; // TODOS | DISPONIVEL | REPOR
let _movimentandoProdAc = false;

// ---- API ----
async function paListar() {
  const res = await fetch(PRODAC_API);
  if (!res.ok) throw new Error("Falha ao listar produtos acabados");
  return res.json();
}
async function paObter(id) {
  const res = await fetch(`${PRODAC_API}/${id}`);
  if (!res.ok) throw new Error("Produto não encontrado");
  return res.json();
}
async function paCriar(dados) {
  const res = await fetch(PRODAC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar");
  return res.json();
}
async function paAtualizar(id, dados) {
  const res = await fetch(`${PRODAC_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao atualizar");
  return res.json();
}
async function paExcluir(id) {
  const res = await fetch(`${PRODAC_API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao excluir");
  return res.json();
}
async function paMovimentar(id, tipo, payload) {
  const res = await fetch(`${PRODAC_API}/${id}/${tipo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Erro ao movimentar");
  return res.json();
}

// ---- Carregamento e render ----
async function carregarProdAc() {
  try {
    prodacCache = await paListar();
    if (!Array.isArray(prodacCache)) prodacCache = [];
    popularFiltroLocalProdAc();
    aplicarFiltrosProdAc();
  } catch (err) {
    console.error(err);
    const corpo = document.getElementById("corpoTabelaProdAc");
    if (corpo) {
      corpo.innerHTML = `<tr><td colspan="8" style="color:red;">Erro ao carregar. Verifique o console.</td></tr>`;
    }
  }
}

function popularFiltroLocalProdAc() {
  const sel = document.getElementById("filtroLocalProdAc");
  if (!sel) return;
  const atual = sel.value;
  const locais = [...new Set(prodacCache.map((p) => p.local).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">Todos os locais</option>` +
    locais.map((l) => `<option value="${l}">${l}</option>`).join("");
  if (locais.includes(atual)) sel.value = atual;
}

function aplicarFiltrosProdAc() {
  const corpo = document.getElementById("corpoTabelaProdAc");
  if (!corpo) return;
  const texto = (document.getElementById("filtroProdAc")?.value || "").toLowerCase().trim();
  const fLocal = (document.getElementById("filtroLocalProdAc")?.value || "").trim();

  const filtrados = prodacCache.filter((p) => {
    // Filtro por status (saldo = entradas - saídas)
    if (filtroStatusProdAc !== "TODOS") {
      const saldo = (parseFloat(p.totalEntradas) || 0) - (parseFloat(p.totalSaidas) || 0);
      if (filtroStatusProdAc === "DISPONIVEL" && saldo <= 0) return false;
      if (filtroStatusProdAc === "REPOR" && saldo > 0) return false;
    }
    if (fLocal && (p.local || "") !== fLocal) return false;
    if (!texto) return true;
    const alvo = [p.codigo, p.descricao, p.local, p.observacoes]
      .map((v) => String(v ?? "").toLowerCase()).join(" ");
    return alvo.includes(texto);
  });

  if (filtrados.length === 0) {
    corpo.innerHTML = `<tr><td colspan="7">Nenhum produto encontrado</td></tr>`;
    return;
  }

  corpo.innerHTML = filtrados.map((p) => {
    const entradas = parseFloat(p.totalEntradas) || 0;
    const saidas = parseFloat(p.totalSaidas) || 0;
    const total = entradas - saidas;
    const totalCor = total <= 0 ? 'color:#b02a2a; font-weight:bold;' : '';
    return `<tr>
      <td>${p.codigo || "-"}</td>
      <td>${p.descricao || "-"}</td>
      <td>${p.local || "-"}</td>
      <td>${entradas}</td>
      <td>${saidas}</td>
      <td style="${totalCor}">${total}</td>
      <td class="no-print">
        <button class="btn" onclick="abrirMovProdAc('${p._id}', 'entrada')">Entrada</button>
        <button class="btn" onclick="abrirMovProdAc('${p._id}', 'saida')">Saída</button>
        <button class="btn" onclick="editarProdAc('${p._id}')">Editar</button>
        <button class="btn btn-danger" onclick="excluirProdAc('${p._id}')">Excluir</button>
      </td>
    </tr>`;
  }).join("");
}

function filtrarProdAcPorStatus(status, btn) {
  filtroStatusProdAc = status;
  document.querySelectorAll("#produtos-acabados .btn-filtro-status").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  aplicarFiltrosProdAc();
}

function limparFiltrosProdAc() {
  const t = document.getElementById("filtroProdAc");
  if (t) t.value = "";
  const l = document.getElementById("filtroLocalProdAc");
  if (l) l.value = "";
  filtroStatusProdAc = "TODOS";
  document.querySelectorAll("#produtos-acabados .btn-filtro-status").forEach((b) => {
    b.classList.toggle("active", b.dataset.status === "TODOS");
  });
  aplicarFiltrosProdAc();
}

// ---- Cadastro / Edição ----
function abrirCadastroProdAc() {
  const form = document.getElementById("formProdAc");
  form.reset();
  document.getElementById("idProdAc").value = "";
  document.getElementById("codigoProdAc").readOnly = false;
  document.getElementById("tituloModalProdAc").textContent = "Novo Produto";
  document.getElementById("modalProdAc").style.display = "flex";
}

function editarProdAc(id) {
  const item = prodacCache.find((p) => p._id === id);
  if (!item) return alert("Produto não encontrado.");
  document.getElementById("idProdAc").value = item._id;
  document.getElementById("codigoProdAc").value = item.codigo || "";
  document.getElementById("codigoProdAc").readOnly = true; // não permite trocar o SKU
  document.getElementById("descricaoProdAc").value = item.descricao || "";
  document.getElementById("localProdAc").value = item.local || "";
  document.getElementById("obsProdAc").value = item.observacoes || "";
  document.getElementById("tituloModalProdAc").textContent = "Editar Produto";
  document.getElementById("modalProdAc").style.display = "flex";
}

function fecharModalProdAc() {
  document.getElementById("modalProdAc").style.display = "none";
}

async function excluirProdAc(id) {
  if (!confirm("Excluir este produto acabado?")) return;
  try {
    await paExcluir(id);
    await carregarProdAc();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir: " + err.message);
  }
}

// ---- Movimentação ----
function abrirMovProdAc(id, tipo) {
  const item = prodacCache.find((p) => p._id === id);
  if (!item) return alert("Produto não encontrado.");

  document.getElementById("idMovProdAc").value = id;
  document.getElementById("tipoMovProdAc").value = tipo;
  document.getElementById("quantidadeMovProdAc").value = "";
  document.getElementById("usuarioMovProdAc").value = "";
  document.getElementById("obsMovProdAc").value = "";

  const total = (parseFloat(item.totalEntradas) || 0) - (parseFloat(item.totalSaidas) || 0);
  const titulo = tipo === "entrada" ? "Registrar Entrada" : "Registrar Saída";
  document.getElementById("tituloModalMovProdAc").textContent = `${titulo} — ${item.codigo}`;
  document.getElementById("infoMovProdAc").innerHTML =
    `Produto: <strong>${item.descricao || "-"}</strong><br>` +
    `Local: <strong>${item.local || "-"}</strong><br>` +
    `Saldo atual: <strong>${total}</strong>`;

  const inp = document.getElementById("quantidadeMovProdAc");
  if (tipo === "saida") inp.max = total;
  else inp.removeAttribute("max");

  document.getElementById("modalMovProdAc").style.display = "flex";
  setTimeout(() => inp.focus(), 50);
}

function fecharModalMovProdAc() {
  document.getElementById("modalMovProdAc").style.display = "none";
}

// ---- Listeners ----
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formProdAc");
  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const id = document.getElementById("idProdAc").value;
      const dados = {
        codigo: document.getElementById("codigoProdAc").value.trim(),
        descricao: document.getElementById("descricaoProdAc").value.trim(),
        local: document.getElementById("localProdAc").value.trim(),
        observacoes: document.getElementById("obsProdAc").value.trim(),
      };
      if (!dados.codigo) return alert("Informe o código.");
      if (!dados.descricao) return alert("Informe a descrição.");
      try {
        if (id) await paAtualizar(id, dados);
        else await paCriar(dados);
        fecharModalProdAc();
        await carregarProdAc();
      } catch (err) {
        console.error(err);
        alert("Erro ao salvar: " + err.message);
      }
    });
  }

  const formMov = document.getElementById("formMovProdAc");
  if (formMov) {
    formMov.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (_movimentandoProdAc) return;
      _movimentandoProdAc = true;
      try {
        const id = document.getElementById("idMovProdAc").value;
        const tipo = document.getElementById("tipoMovProdAc").value;
        const qtd = parseFloat(document.getElementById("quantidadeMovProdAc").value);
        const usuario = document.getElementById("usuarioMovProdAc").value.trim();
        const obs = document.getElementById("obsMovProdAc").value.trim();
        if (!qtd || qtd <= 0) return alert("Informe uma quantidade válida.");
        if (!usuario) return alert("Informe o usuário.");

        await paMovimentar(id, tipo, { quantidade: qtd, usuario, observacoes: obs });
        fecharModalMovProdAc();
        await carregarProdAc();
        // atualiza histórico se estiver na tela
        if (typeof carregarHistoricoProdAc === "function") carregarHistoricoProdAc();
      } catch (err) {
        console.error(err);
        alert("Erro: " + err.message);
      } finally {
        _movimentandoProdAc = false;
      }
    });
  }

  const inpFiltro = document.getElementById("filtroProdAc");
  if (inpFiltro) inpFiltro.addEventListener("input", aplicarFiltrosProdAc);
  const selLocal = document.getElementById("filtroLocalProdAc");
  if (selLocal) selLocal.addEventListener("change", aplicarFiltrosProdAc);

  // Relatório: mostrar/esconder filtro de período
  const selRel = document.getElementById("tipoRelatorioProdAc");
  if (selRel) {
    selRel.addEventListener("change", function () {
      document.getElementById("filtroPeriodoProdAc").style.display =
        this.value === "movimentacaoPeriodo" ? "block" : "none";
    });
  }
});

// Hook em openTab
const _openTabAnteriorProdAc = typeof openTab === "function" ? openTab : null;
openTab = function (tabId, event) {
  if (_openTabAnteriorProdAc) _openTabAnteriorProdAc(tabId, event);
  if (tabId === "produtos-acabados") carregarProdAc();
};

// ============================================================
// ====== SUB-ABA MOVIMENTAÇÃO: histórico de Produtos Acabados
// ============================================================
async function carregarHistoricoProdAc() {
  const corpo = document.getElementById("corpoTabelaHistoricoProdAc");
  if (!corpo) return;
  corpo.innerHTML = `<tr><td colspan="8">Carregando...</td></tr>`;
  try {
    const movs = await (await fetch(`${API_BASE_URL}/movimentacoes`)).json();
    const lista = (movs || []).filter((m) => m.tipoItem === "produto_acabado");
    if (lista.length === 0) {
      corpo.innerHTML = `<tr><td colspan="8">Nenhuma movimentação de produto acabado</td></tr>`;
      return;
    }
    lista.sort((a, b) => new Date(b.data) - new Date(a.data));
    corpo.innerHTML = lista.map((m) => {
      const data = m.data ? new Date(m.data).toLocaleString() : "-";
      return `<tr>
        <td>${data}</td>
        <td>${m.codigoItem || "-"}</td>
        <td>${m.descricaoItem || "-"}</td>
        <td>${m.tipoMovimentacao || "-"}</td>
        <td>${m.quantidade ?? 0}</td>
        <td>${m.usuario || "-"}</td>
        <td>${m.observacoes || "-"}</td>
        <td class="no-print">
          <button class="btn" onclick="editarMovimentacao('${m._id}')">Editar</button>
          <button class="btn-danger" onclick="excluirMovimentacao('${m._id}')">Excluir</button>
        </td>
      </tr>`;
    }).join("");
  } catch (err) {
    console.error(err);
    corpo.innerHTML = `<tr><td colspan="8" style="color:red;">Erro ao carregar. Veja o console.</td></tr>`;
  }
}

// Injeta o carregamento na função abrirSubTabMov existente
const _abrirSubTabMovAnt = typeof abrirSubTabMov === "function" ? abrirSubTabMov : null;
abrirSubTabMov = function (subId, btn) {
  if (_abrirSubTabMovAnt) _abrirSubTabMovAnt(subId, btn);
  if (subId === "mov-prodac") carregarHistoricoProdAc();
};

// ============================================================
// ====== RELATÓRIOS - Produtos Acabados ======================
// ============================================================
async function gerarRelatorioProdAc() {
  const tipo = document.getElementById("tipoRelatorioProdAc").value;
  const conteudo = document.getElementById("conteudoRelatorioProdAc");
  const card = document.getElementById("resultadoRelatorioProdAc");

  try {
    if (tipo === "estoqueAtual") {
      const itens = await (await fetch(PRODAC_API)).json();
      if (!Array.isArray(itens) || itens.length === 0) {
        conteudo.innerHTML = `<p>Nenhum produto cadastrado.</p>`;
      } else {
        let html = `<h4>Estoque Atual — Produtos Acabados</h4>
          <table><thead><tr>
            <th>Cód.</th><th>Descrição</th><th>Local</th>
            <th>Entradas</th><th>Saídas</th><th>Total</th>
          </tr></thead><tbody>`;
        itens.forEach((p) => {
          const e = parseFloat(p.totalEntradas) || 0;
          const s = parseFloat(p.totalSaidas) || 0;
          const t = e - s;
          const cor = t <= 0 ? 'style="color:#b02a2a; font-weight:bold;"' : "";
          html += `<tr>
            <td>${p.codigo || "-"}</td>
            <td>${p.descricao || "-"}</td>
            <td>${p.local || "-"}</td>
            <td>${e}</td>
            <td>${s}</td>
            <td ${cor}>${t}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
        conteudo.innerHTML = html;
      }
    } else if (tipo === "movimentacaoPeriodo") {
      const inicio = document.getElementById("dataInicioProdAc").value;
      const fim = document.getElementById("dataFimProdAc").value;
      if (!inicio || !fim) { alert("Selecione data início e fim."); return; }
      const movs = await (await fetch(`${API_BASE_URL}/movimentacoes`)).json();
      const filtradas = (movs || []).filter((m) => {
        if (m.tipoItem !== "produto_acabado") return false;
        const d = new Date(m.data);
        return d >= new Date(inicio + "T00:00:00") && d <= new Date(fim + "T23:59:59");
      });

      if (filtradas.length === 0) {
        conteudo.innerHTML = `<p>Nenhuma movimentação no período.</p>`;
      } else {
        let html = `<h4>Movimentações de Produtos Acabados (${inicio} → ${fim})</h4>
          <table><thead><tr>
            <th>Data</th><th>Cód.</th><th>Descrição</th><th>Tipo</th>
            <th>Quantidade</th><th>Usuário</th><th>Cliente</th><th>Obs.</th>
          </tr></thead><tbody>`;
        filtradas.sort((a, b) => new Date(b.data) - new Date(a.data));
        filtradas.forEach((m) => {
          html += `<tr>
            <td>${new Date(m.data).toLocaleString()}</td>
            <td>${m.codigoItem || "-"}</td>
            <td>${m.descricaoItem || "-"}</td>
            <td>${m.tipoMovimentacao || "-"}</td>
            <td>${m.quantidade ?? 0}</td>
            <td>${m.usuario || "-"}</td>
            <td>${m.cliente || "-"}</td>
            <td>${m.observacoes || "-"}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
        conteudo.innerHTML = html;
      }
    }
    card.style.display = "block";
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar relatório: " + err.message);
  }
}

// ============================================================
// ====== IMPORTAÇÃO EXCEL - Papelcartão, Insumos, ProdAc =====
// ============================================================
// Padrão: lê a primeira planilha do arquivo, aceita cabeçalhos em maiúsc/minúsc
// e acentuados. Para cada linha: se código já existe → atualiza (PUT);
// se não existe → cria (POST).

// Helper: normaliza chave de cabeçalho (remove acentos e minúsculo)
function _normKey(k) {
  return String(k || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Helper: acessa valor de uma linha aceitando várias variações de nome
function _getCampo(linha, ...variacoes) {
  const chaves = Object.keys(linha);
  for (const v of variacoes) {
    const alvo = _normKey(v);
    const k = chaves.find((c) => _normKey(c) === alvo);
    if (k !== undefined) return linha[k];
  }
  return "";
}

async function _lerArquivoExcel(input) {
  return new Promise((resolve, reject) => {
    if (!input || !input.files || !input.files.length) {
      return reject(new Error("Selecione uma planilha Excel."));
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const linhas = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
        resolve(linhas);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

// ---- Papelcartão ----
async function importarExcelPapelcartao() {
  const input = document.getElementById("inputExcelPapelcartao");
  try {
    const linhas = await _lerArquivoExcel(input);
    if (!linhas.length) return alert("Planilha vazia.");

    // Busca todos os PCs existentes
    const existentes = await (await fetch(PAPELCARTAO_API)).json();
    const mapaPorCodigo = new Map(existentes.map((p) => [String(p.codigo || "").trim(), p]));

    let criados = 0, atualizados = 0, erros = 0;
    for (const linha of linhas) {
      try {
        const codigo = String(_getCampo(linha, "codigo", "código", "cod")).trim();
        const dados = {
          codigo: codigo || undefined, // vazio → backend gera PC-XXXX
          tipo: String(_getCampo(linha, "tipo") || "").trim(),
          localizacao: String(_getCampo(linha, "localizacao", "localização", "local") || "").trim(),
          quantidade: parseInt(_getCampo(linha, "quantidade", "quant"), 10) || 0,
          formato: String(_getCampo(linha, "formato") || "").trim(),
          gramatura: parseFloat(_getCampo(linha, "gramatura")) || 0,
          observacoes: String(_getCampo(linha, "observacoes", "observações", "obs") || "").trim(),
        };
        if (!dados.tipo) {
          erros++;
          continue;
        }

        const existente = codigo && mapaPorCodigo.get(codigo);
        if (existente) {
          const res = await fetch(`${PAPELCARTAO_API}/${existente._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
          });
          if (res.ok) atualizados++; else erros++;
        } else {
          const res = await fetch(PAPELCARTAO_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
          });
          if (res.ok) criados++; else erros++;
        }
      } catch (e) {
        console.error("Linha com erro:", linha, e);
        erros++;
      }
    }

    alert(
      `Importação concluída:\n` +
      `✓ ${criados} novo(s)\n` +
      `✓ ${atualizados} atualizado(s)\n` +
      (erros > 0 ? `⚠ ${erros} com erro (veja o console)` : "")
    );
    input.value = "";
    await carregarPapelcartao();
  } catch (err) {
    console.error(err);
    alert("Erro na importação: " + err.message);
  }
}

// ---- Insumos ----
async function importarExcelInsumos() {
  const input = document.getElementById("inputExcelInsumo");
  try {
    const linhas = await _lerArquivoExcel(input);
    if (!linhas.length) return alert("Planilha vazia.");

    let criados = 0, erros = 0;
    for (const linha of linhas) {
      try {
        // Insumos são lançamentos (livro-razão). Cada linha da planilha vira 1 novo lançamento.
        // Não atualiza (não faz sentido - cada lançamento é um evento único).
        const codigo = String(_getCampo(linha, "codigo", "código", "cod")).trim();
        if (!codigo) { erros++; continue; }

        let dataVal = _getCampo(linha, "data");
        let dataObj = null;
        if (dataVal) {
          // tenta parse (aceita 'DD/MM/YYYY', 'YYYY-MM-DD', etc.)
          if (typeof dataVal === "string" && dataVal.includes("/")) {
            const [d, m, y] = dataVal.split("/");
            dataObj = new Date(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T12:00:00`);
          } else {
            dataObj = new Date(dataVal);
          }
          if (isNaN(dataObj.getTime())) dataObj = null;
        }

        const dados = {
          data: dataObj || new Date(),
          codigo,
          fabricante: String(_getCampo(linha, "fabricante") || "").trim(),
          descricao: String(_getCampo(linha, "descricao", "descrição", "desc") || "").trim(),
          funcionario: String(_getCampo(linha, "funcionario", "funcionário") || "").trim(),
          setor: String(_getCampo(linha, "setor") || "").trim(),
          entrada: parseFloat(_getCampo(linha, "entrada")) || 0,
          saida: parseFloat(_getCampo(linha, "saida", "saída")) || 0,
        };

        if (dados.entrada === 0 && dados.saida === 0) {
          erros++;
          continue;
        }

        await insCriar(dados);
        criados++;
      } catch (e) {
        console.error("Linha com erro:", linha, e);
        erros++;
      }
    }

    alert(
      `Importação de insumos concluída:\n` +
      `✓ ${criados} lançamento(s) criado(s)\n` +
      (erros > 0 ? `⚠ ${erros} com erro (veja o console)` : "")
    );
    input.value = "";
    await carregarInsumos();
  } catch (err) {
    console.error(err);
    alert("Erro na importação: " + err.message);
  }
}

// ---- Produtos Acabados ----
async function importarExcelProdAc() {
  const input = document.getElementById("inputExcelProdAc");
  try {
    const linhas = await _lerArquivoExcel(input);
    if (!linhas.length) return alert("Planilha vazia.");

    // Busca todos os produtos existentes
    const existentes = await (await fetch(PRODAC_API)).json();
    const mapaPorCodigo = new Map(existentes.map((p) => [String(p.codigo || "").trim(), p]));

    let criados = 0, atualizados = 0, erros = 0;
    for (const linha of linhas) {
      try {
        const codigo = String(_getCampo(linha, "codigo", "código", "cod")).trim();
        if (!codigo) { erros++; continue; }

        const dados = {
          codigo,
          descricao: String(_getCampo(linha, "descricao", "descrição", "desc") || "").trim(),
          local: String(_getCampo(linha, "local", "localizacao", "localização") || "").trim(),
          observacoes: String(_getCampo(linha, "observacoes", "observações", "obs") || "").trim(),
        };

        const existente = mapaPorCodigo.get(codigo);
        if (existente) {
          // Ao atualizar, NÃO mexer nos totalEntradas/totalSaidas (isso vem só de movimentações)
          const res = await fetch(`${PRODAC_API}/${existente._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
          });
          if (res.ok) atualizados++; else erros++;
        } else {
          const res = await fetch(PRODAC_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
          });
          if (res.ok) criados++; else erros++;
        }
      } catch (e) {
        console.error("Linha com erro:", linha, e);
        erros++;
      }
    }

    alert(
      `Importação concluída:\n` +
      `✓ ${criados} novo(s)\n` +
      `✓ ${atualizados} atualizado(s)\n` +
      (erros > 0 ? `⚠ ${erros} com erro (veja o console)` : "")
    );
    input.value = "";
    await carregarProdAc();
  } catch (err) {
    console.error(err);
    alert("Erro na importação: " + err.message);
  }
}

// Listeners dos inputs de arquivo
document.addEventListener("DOMContentLoaded", () => {
  const iPc = document.getElementById("inputExcelPapelcartao");
  if (iPc) iPc.addEventListener("change", importarExcelPapelcartao);
  const iIns = document.getElementById("inputExcelInsumo");
  if (iIns) iIns.addEventListener("change", importarExcelInsumos);
  const iPa = document.getElementById("inputExcelProdAc");
  if (iPa) iPa.addEventListener("change", importarExcelProdAc);
});

// ============================================================
// ====== FOLHAS DE BOBINA (código FB-XXXX) ==================
// ============================================================
const FOLHABOBINA_API = `${API_BASE_URL}/folhas-bobina`;

let folhaBobinaCache = [];
let filtroStatusFolhaBobina = "DISPONÍVEL";
let _movimentandoFB = false;
let _filhaFBSeq = 0;

// ---- API ----
async function fbListar() {
  const r = await fetch(FOLHABOBINA_API);
  if (!r.ok) throw new Error("Falha ao listar folhas de bobina");
  return r.json();
}
async function fbObter(id) {
  const r = await fetch(`${FOLHABOBINA_API}/${id}`);
  if (!r.ok) throw new Error("Registro não encontrado");
  return r.json();
}
async function fbCriar(dados) {
  const r = await fetch(FOLHABOBINA_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao criar");
  return r.json();
}
async function fbAtualizar(id, dados) {
  const r = await fetch(`${FOLHABOBINA_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao atualizar");
  return r.json();
}
async function fbExcluir(id) {
  const r = await fetch(`${FOLHABOBINA_API}/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao excluir");
  return r.json();
}
async function fbEntrar(id, payload) {
  const r = await fetch(`${FOLHABOBINA_API}/${id}/entrada`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro na entrada");
  return r.json();
}
async function fbDarSaida(id, payload) {
  const r = await fetch(`${FOLHABOBINA_API}/${id}/saida`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro na saída");
  return r.json();
}
async function fbRetornar(id, payload) {
  const r = await fetch(`${FOLHABOBINA_API}/${id}/retorno`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro no retorno");
  return r.json();
}
async function fbTransferir(id, payload) {
  const r = await fetch(`${FOLHABOBINA_API}/${id}/transferir`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao transferir");
  return r.json();
}

// ---- Status calculado ----
function calcularStatusFolhaBobina(p) {
  if (p && p.status === "INATIVA") return "INATIVA";
  const lotes = Array.isArray(p && p.lotesEmUso) ? p.lotesEmUso : [];
  const somaLotes = lotes.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
  const emUso = somaLotes || parseInt(p && p.quantidadeEmUso, 10) || 0;
  if (emUso > 0) return "EM USO";
  const qtd = parseInt(p && p.quantidade, 10) || 0;
  if (qtd <= 0) return "SEM ESTOQUE";
  return "DISPONÍVEL";
}
function classeStatusFolhaBobina(s) {
  if (s === "DISPONÍVEL") return "status-disponivel";
  if (s === "SEM ESTOQUE") return "status-finalizada";
  if (s === "INATIVA") return "status-inativa";
  return "status-indisponivel"; // EM USO
}

// ---- Sub-abas ----
function abrirSubTabBobinas(subId, btn) {
  const cont = document.getElementById("estoque");
  cont.querySelectorAll(".sub-tab").forEach((b) => b.classList.remove("active"));
  cont.querySelectorAll(".sub-tab-content").forEach((c) => c.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const alvo = document.getElementById(subId);
  if (alvo) alvo.classList.add("active");

  if (subId === "sub-folhas-bobina") carregarFolhaBobina();
}

// ---- Carregamento / render ----
async function carregarFolhaBobina() {
  try {
    folhaBobinaCache = await fbListar();
    if (!Array.isArray(folhaBobinaCache)) folhaBobinaCache = [];
    popularTiposFolhaBobina();
    aplicarFiltrosFolhaBobina();
  } catch (err) {
    console.error(err);
    const corpo = document.getElementById("corpoTabelaFolhaBobina");
    if (corpo) corpo.innerHTML = `<tr><td colspan="8" style="color:red;">Erro ao carregar. Veja o console.</td></tr>`;
  }
}

function popularTiposFolhaBobina() {
  const sel = document.getElementById("filtroTipoFolhaBobina");
  if (!sel) return;
  const atual = sel.value;
  const tipos = [...new Set(folhaBobinaCache.map((p) => p.tipo).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">Todos os tipos</option>` +
    tipos.map((t) => `<option value="${t}">${t}</option>`).join("");
  if (tipos.includes(atual)) sel.value = atual;
}

function filtrarFolhaBobinaPorStatus(status, btn) {
  filtroStatusFolhaBobina = status;
  document.querySelectorAll("#sub-folhas-bobina .btn-filtro-status").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  aplicarFiltrosFolhaBobina();
}

function limparFiltrosFolhaBobina() {
  document.getElementById("filtroFolhaBobina").value = "";
  document.getElementById("filtroTipoFolhaBobina").value = "";
  filtroStatusFolhaBobina = "DISPONÍVEL";
  document.querySelectorAll("#sub-folhas-bobina .btn-filtro-status").forEach((b) => {
    b.classList.toggle("active", b.dataset.status === "DISPONÍVEL");
  });
  aplicarFiltrosFolhaBobina();
}

function aplicarFiltrosFolhaBobina() {
  const corpo = document.getElementById("corpoTabelaFolhaBobina");
  if (!corpo) return;

  const texto = (document.getElementById("filtroFolhaBobina")?.value || "").toLowerCase().trim();
  const tipo = document.getElementById("filtroTipoFolhaBobina")?.value || "";

  const filtrados = folhaBobinaCache.filter((p) => {
    const statusTxt = calcularStatusFolhaBobina(p);
    const temSaldo = (parseInt(p.quantidade, 10) || 0) > 0;
    const lotes = Array.isArray(p.lotesEmUso) ? p.lotesEmUso : [];
    const somaLotes = lotes.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
    const temEmUso = somaLotes > 0 || (parseInt(p.quantidadeEmUso, 10) || 0) > 0;

    if (filtroStatusFolhaBobina === "TODAS") {
      if (statusTxt === "INATIVA") return false;
    } else if (filtroStatusFolhaBobina === "DISPONÍVEL") {
      if (statusTxt === "INATIVA" || !temSaldo) return false;
    } else if (filtroStatusFolhaBobina === "EM USO") {
      if (statusTxt === "INATIVA" || !temEmUso) return false;
    } else if (statusTxt !== filtroStatusFolhaBobina) {
      return false;
    }
    if (tipo && (p.tipo || "") !== tipo) return false;
    if (texto) {
      const alvo = [p.codigo, p.tipo, p.localizacao, p.formato, p.gramatura, p.quantidade, p.observacoes, statusTxt]
        .map((v) => String(v ?? "").toLowerCase()).join(" ");
      if (!alvo.includes(texto)) return false;
    }
    return true;
  });

  if (filtrados.length === 0) {
    corpo.innerHTML = `<tr><td colspan="8">Nenhum registro encontrado</td></tr>`;
    return;
  }

  if (filtroStatusFolhaBobina === "EM USO") {
    const linhas = [];
    filtrados.forEach((p) => {
      const lotes = Array.isArray(p.lotesEmUso) ? p.lotesEmUso : [];
      lotes.forEach((lote) => linhas.push(renderLinhaLoteFolhaBobina(p, lote)));
    });
    corpo.innerHTML = linhas.length ? linhas.join("") : `<tr><td colspan="8">Nenhum lote em uso</td></tr>`;
    return;
  }

  corpo.innerHTML = filtrados.map((p) => renderLinhaFolhaBobina(p)).join("");
}

function renderLinhaFolhaBobina(p) {
  const statusTxt = calcularStatusFolhaBobina(p);
  const statusHtml = `<span class="${classeStatusFolhaBobina(statusTxt)}">${statusTxt}</span>`;
  const lotes = Array.isArray(p.lotesEmUso) ? p.lotesEmUso : [];
  const emUso = lotes.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
  const podeMovimentar = statusTxt !== "INATIVA";

  const btnVisualizar = `<button class="btn" onclick="visualizarFolhaBobina('${p._id}')">Visualizar</button>`;
  const btnEntrada = podeMovimentar
    ? `<button class="btn" onclick="abrirEntradaFolhaBobina('${p._id}')">Entrada</button>` : "";
  const btnSaida = podeMovimentar && (parseInt(p.quantidade, 10) || 0) > 0
    ? `<button class="btn" onclick="abrirSaidaFolhaBobina('${p._id}')">Saída</button>` : "";
  const btnInativar = statusTxt === "INATIVA"
    ? `<button class="btn" onclick="alternarInativaFolhaBobina('${p._id}')">Reativar</button>`
    : `<button class="btn" onclick="alternarInativaFolhaBobina('${p._id}')">Inativar</button>`;

  let qtdHtml = `${p.quantidade ?? 0}`;
  if (emUso > 0) {
    const detalhe = lotes.map((l) => `${l.quantidade} na ${l.maquinaAtual || "-"}`).join(" · ");
    qtdHtml = `<strong>${p.quantidade ?? 0}</strong> disponível<br>` +
      `<small style="color:#666;">+ ${emUso} em uso (${detalhe})</small>`;
  }

  return `<tr>
    <td>${p.codigo || "-"}</td>
    <td>${p.tipo || "-"}</td>
    <td>${p.localizacao || "-"}</td>
    <td>${qtdHtml}</td>
    <td>${p.formato || "-"}</td>
    <td>${p.gramatura ? p.gramatura + " g/m²" : "-"}</td>
    <td>${statusHtml}</td>
    <td class="no-print">
      ${btnVisualizar}
      ${btnEntrada}
      ${btnSaida}
      <button class="btn" onclick="editarFolhaBobina('${p._id}')">Editar</button>
      ${btnInativar}
      <button class="btn btn-danger" onclick="excluirFolhaBobina('${p._id}')">Excluir</button>
    </td>
  </tr>`;
}

function renderLinhaLoteFolhaBobina(p, lote) {
  const qtd = parseInt(lote.quantidade, 10) || 0;
  const maq = lote.maquinaAtual || "-";
  const dataSaida = lote.dataSaida ? new Date(lote.dataSaida).toLocaleDateString() : "-";
  const statusHtml = `<span class="status-indisponivel">EM USO</span>`;
  const btnVisualizar = `<button class="btn" onclick="visualizarFolhaBobina('${p._id}')">Visualizar</button>`;
  const btnRetorno = `<button class="btn" onclick="abrirRetornoFolhaBobinaLote('${p._id}', '${lote._id}')">Retorno</button>`;
  const btnTransferir = `<button class="btn" onclick="abrirTransferirFolhaBobinaLote('${p._id}', '${lote._id}')">Transferir</button>`;
  const qtdHtml = `<strong>${qtd}</strong> folhas<br>` +
    `<small style="color:#666;">na ${maq} · desde ${dataSaida}</small>`;

  return `<tr>
    <td>${p.codigo || "-"}</td>
    <td>${p.tipo || "-"}</td>
    <td>${p.localizacao || "-"}</td>
    <td>${qtdHtml}</td>
    <td>${p.formato || "-"}</td>
    <td>${p.gramatura ? p.gramatura + " g/m²" : "-"}</td>
    <td>${statusHtml}</td>
    <td class="no-print">${btnVisualizar}${btnRetorno}${btnTransferir}</td>
  </tr>`;
}

// ---- Visualizar ----
async function visualizarFolhaBobina(id) {
  try {
    const item = await fbObter(id);
    const statusTxt = calcularStatusFolhaBobina(item);
    const lotesArr = Array.isArray(item.lotesEmUso) ? item.lotesEmUso : [];
    const emUso = lotesArr.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);

    let lotesHtml = "";
    if (lotesArr.length > 0) {
      lotesHtml = `<p><strong>Em uso:</strong> ${emUso} folhas em ${lotesArr.length} lote(s):</p><ul>`;
      lotesArr.forEach((l) => {
        const d = l.dataSaida ? new Date(l.dataSaida).toLocaleDateString() : "-";
        lotesHtml += `<li>${l.quantidade} folhas na ${l.maquinaAtual || "-"} <small>(desde ${d})</small></li>`;
      });
      lotesHtml += `</ul>`;
    } else {
      lotesHtml = `<p><strong>Em uso:</strong> 0 folhas</p>`;
    }

    let conteudo = `
      <p><strong>Código:</strong> ${item.codigo || "-"}</p>
      <p><strong>Tipo:</strong> ${item.tipo || "-"}</p>
      <p><strong>Formato:</strong> ${item.formato || "-"}</p>
      <p><strong>Gramatura:</strong> ${item.gramatura ? item.gramatura + " g/m²" : "-"}</p>
      <p><strong>Localização:</strong> ${item.localizacao || "-"}</p>
      <p><strong>Quantidade em estoque:</strong> ${item.quantidade ?? 0} folhas</p>
      ${lotesHtml}
      <p><strong>Status:</strong> <span class="${classeStatusFolhaBobina(statusTxt)}">${statusTxt}</span></p>
      <p><strong>Cadastrado em:</strong> ${item.dataCadastro ? new Date(item.dataCadastro).toLocaleString() : "-"}</p>
      ${item.observacoes ? `<p><strong>Observações:</strong> ${item.observacoes}</p>` : ""}
    `;

    // Histórico completo
    try {
      const movs = await (await fetch(`${API_BASE_URL}/movimentacoes`)).json();
      const doItem = (movs || [])
        .filter((m) => m.tipoItem === "folha_bobina" && String(m.idItem) === String(item._id))
        .sort((a, b) => new Date(b.data) - new Date(a.data));
      if (doItem.length > 0) {
        conteudo += `<hr><p><strong>Histórico (${doItem.length} movimentação${doItem.length > 1 ? "ões" : ""}):</strong></p><ul style="padding-left:18px;">`;
        doItem.forEach((m) => {
          const data = m.data ? new Date(m.data).toLocaleString() : "-";
          const partes = [`<strong>${m.tipoMovimentacao || "-"}</strong>`, data];
          if (m.quantidade != null) partes.push(`${m.quantidade} ${m.unidade || "folhas"}`);
          if (m.tipoMaquina) partes.push(`máq: ${m.tipoMaquina}`);
          if (m.usuario) partes.push(`por ${m.usuario}`);
          if (m.perdaKg) partes.push(`perda: ${m.perdaKg} folhas`);
          if (m.filhasGeradas) {
            partes.push(m.tipoMovimentacao === "TRANSFERENCIA"
              ? `folhas perdidas: ${m.filhasGeradas}` : `filhas: ${m.filhasGeradas}`);
          }
          conteudo += `<li style="margin-bottom:6px;">${partes.join(" · ")}`;
          if (m.observacoes) conteudo += `<br><em style="color:#555;">obs: ${m.observacoes}</em>`;
          conteudo += `</li>`;
        });
        conteudo += `</ul>`;
      }
    } catch (e) { console.error(e); }

    document.getElementById("modalTitulo").textContent = `Folha de Bobina ${item.codigo || ""}`;
    document.getElementById("modalConteudo").innerHTML = conteudo;
    document.getElementById("modalBobina").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Erro: " + err.message);
  }
}

// ---- Cadastro / Editar ----
function abrirCadastroFolhaBobina() {
  const form = document.getElementById("formFolhaBobina");
  form.reset();
  document.getElementById("idFolhaBobina").value = "";
  document.getElementById("codigoFolhaBobina").readOnly = false;
  document.getElementById("tituloModalFolhaBobina").textContent = "Nova Folha de Bobina";
  document.getElementById("modalFolhaBobina").style.display = "flex";
}
function editarFolhaBobina(id) {
  const item = folhaBobinaCache.find((p) => p._id === id);
  if (!item) return alert("Não encontrado.");
  document.getElementById("idFolhaBobina").value = item._id;
  document.getElementById("codigoFolhaBobina").value = item.codigo || "";
  document.getElementById("codigoFolhaBobina").readOnly = true;
  document.getElementById("tipoFolhaBobina").value = item.tipo || "";
  document.getElementById("localizacaoFolhaBobina").value = item.localizacao || "";
  document.getElementById("quantidadeFolhaBobina").value = item.quantidade ?? 0;
  document.getElementById("formatoFolhaBobina").value = item.formato || "";
  document.getElementById("gramaturaFolhaBobina").value = item.gramatura ?? 0;
  document.getElementById("observacoesFolhaBobina").value = item.observacoes || "";
  document.getElementById("tituloModalFolhaBobina").textContent = "Editar Folha de Bobina";
  document.getElementById("modalFolhaBobina").style.display = "flex";
}
function fecharModalFolhaBobina() {
  document.getElementById("modalFolhaBobina").style.display = "none";
}
async function excluirFolhaBobina(id) {
  if (!confirm("Excluir este registro?")) return;
  try { await fbExcluir(id); await carregarFolhaBobina(); }
  catch (err) { console.error(err); alert("Erro: " + err.message); }
}
async function alternarInativaFolhaBobina(id) {
  const item = folhaBobinaCache.find((p) => p._id === id);
  if (!item) return;
  const novoStatus = item.status === "INATIVA" ? "DISPONÍVEL" : "INATIVA";
  try {
    await fbAtualizar(id, { status: novoStatus });
    await carregarFolhaBobina();
  } catch (err) { alert("Erro: " + err.message); }
}

// ---- Entrada ----
function abrirEntradaFolhaBobina(id) {
  const item = folhaBobinaCache.find((p) => p._id === id);
  if (!item) return alert("Não encontrado.");
  document.getElementById("idEntradaFolhaBobina").value = id;
  document.getElementById("quantidadeEntradaFolhaBobina").value = "";
  document.getElementById("infoEntradaFolhaBobina").innerHTML =
    `<strong>${item.codigo}</strong> — ${item.tipo || "-"}<br>Estoque atual: ${item.quantidade ?? 0}`;
  document.getElementById("modalEntradaFolhaBobina").style.display = "flex";
}
function fecharModalEntradaFolhaBobina() {
  document.getElementById("modalEntradaFolhaBobina").style.display = "none";
}

// ---- Saída ----
function abrirSaidaFolhaBobina(id) {
  const item = folhaBobinaCache.find((p) => p._id === id);
  if (!item) return alert("Não encontrado.");
  const disp = parseInt(item.quantidade, 10) || 0;
  if (disp <= 0) return alert("Sem estoque disponível.");
  document.getElementById("idSaidaFolhaBobina").value = id;
  document.getElementById("quantidadeSaidaFolhaBobina").value = "";
  document.getElementById("quantidadeSaidaFolhaBobina").max = disp;
  document.getElementById("tipoMaquinaSaidaFolhaBobina").value = "";
  document.getElementById("usuarioSaidaFolhaBobina").value = "";
  document.getElementById("obsSaidaFolhaBobina").value = "";
  document.getElementById("tituloModalSaidaFolhaBobina").textContent = `Registrar Saída — ${item.codigo}`;
  document.getElementById("infoSaidaFolhaBobina").innerHTML =
    `Tipo: <strong>${item.tipo || "-"}</strong> · Formato: <strong>${item.formato || "-"}</strong><br>` +
    `Disponível: <strong>${disp} folhas</strong>`;
  document.getElementById("modalSaidaFolhaBobina").style.display = "flex";
}
function fecharModalSaidaFolhaBobina() {
  document.getElementById("modalSaidaFolhaBobina").style.display = "none";
}

// ---- Retorno ----
function abrirRetornoFolhaBobinaLote(id, loteId) {
  const item = folhaBobinaCache.find((p) => p._id === id);
  if (!item) return alert("Não encontrado.");
  const lote = (item.lotesEmUso || []).find((l) => String(l._id) === String(loteId));
  if (!lote) return alert("Lote não encontrado.");

  document.getElementById("idRetornoFolhaBobina").value = id;
  document.getElementById("loteIdRetornoFolhaBobina").value = loteId;
  document.getElementById("quantidadeRetornoFolhaBobina").value = 0;
  document.getElementById("quantidadeRetornoFolhaBobina").max = lote.quantidade;
  document.getElementById("perdaKgFolhaBobina").value = 0;
  document.getElementById("usuarioRetornoFolhaBobina").value = "";
  document.getElementById("obsRetornoFolhaBobina").value = "";
  document.getElementById("filhasContainerFolhaBobina").innerHTML = "";
  _filhaFBSeq = 0;
  document.getElementById("tituloModalRetornoFolhaBobina").textContent = `Registrar Retorno — ${item.codigo}`;
  document.getElementById("infoRetornoFolhaBobina").innerHTML =
    `Tipo: <strong>${item.tipo || "-"}</strong><br>` +
    `Lote: <strong>${lote.quantidade} folhas na ${lote.maquinaAtual || "-"}</strong>`;
  atualizarResumoRetornoFolhaBobina();
  document.getElementById("modalRetornoFolhaBobina").style.display = "flex";
}
function fecharModalRetornoFolhaBobina() {
  document.getElementById("modalRetornoFolhaBobina").style.display = "none";
}
function adicionarFilhaFolhaBobina() {
  _filhaFBSeq++;
  const idx = _filhaFBSeq;
  const div = document.createElement("div");
  div.className = "filha-folhabobina-linha";
  div.style.cssText = "display:flex; gap:6px; margin-bottom:4px; align-items:center;";
  div.innerHTML = `
    <input type="text" class="filha-formato" placeholder="Formato (ex.: 33x48)" style="flex:1;" />
    <input type="number" class="filha-quantidade" placeholder="Qtd" min="1" style="width:90px;" oninput="atualizarResumoRetornoFolhaBobina()" />
    <button type="button" class="btn btn-danger" onclick="this.parentNode.remove(); atualizarResumoRetornoFolhaBobina();">×</button>
  `;
  document.getElementById("filhasContainerFolhaBobina").appendChild(div);
  atualizarResumoRetornoFolhaBobina();
}
function atualizarResumoRetornoFolhaBobina() {
  const id = document.getElementById("idRetornoFolhaBobina").value;
  const loteId = document.getElementById("loteIdRetornoFolhaBobina").value;
  const item = folhaBobinaCache.find((p) => p._id === id);
  if (!item) return;
  const lote = (item.lotesEmUso || []).find((l) => String(l._id) === String(loteId));
  const emUso = lote ? parseInt(lote.quantidade, 10) || 0 : 0;
  const qtdRet = parseInt(document.getElementById("quantidadeRetornoFolhaBobina").value, 10) || 0;
  const perdaKg = parseFloat(document.getElementById("perdaKgFolhaBobina").value) || 0;
  const filhas = [...document.querySelectorAll("#filhasContainerFolhaBobina .filha-folhabobina-linha")];
  const totalFilhas = filhas.reduce((s, f) => s + (parseInt(f.querySelector(".filha-quantidade").value, 10) || 0), 0);
  const cor = qtdRet > emUso ? "#b02a2a" : "#444";
  let resumo = `<span style="color:${cor};"><strong>Lote em uso:</strong> ${emUso} → volta: <strong>${qtdRet}</strong>, processado: <strong>${emUso - qtdRet}</strong></span>`;
  if (totalFilhas > 0) resumo += `<br>Filhas: <strong>${totalFilhas}</strong>`;
  if (perdaKg > 0) resumo += `<br>Perda: <strong>${perdaKg} kg</strong>`;
  document.getElementById("resumoRetornoFolhaBobina").innerHTML = resumo;
}

// ---- Transferir ----
function abrirTransferirFolhaBobinaLote(id, loteId) {
  const item = folhaBobinaCache.find((p) => p._id === id);
  if (!item) return alert("Não encontrado.");
  const lote = (item.lotesEmUso || []).find((l) => String(l._id) === String(loteId));
  if (!lote) return alert("Lote não encontrado.");
  document.getElementById("idTransferirFolhaBobina").value = id;
  document.getElementById("loteIdTransferirFolhaBobina").value = loteId;
  document.getElementById("novaMaquinaFolhaBobina").value = "";
  document.getElementById("usuarioTransferirFolhaBobina").value = "";
  document.getElementById("obsTransferirFolhaBobina").value = "";
  document.getElementById("perdaKgTransferirFolhaBobina").value = 0;
  document.getElementById("folhasPerdidasTransferirFolhaBobina").value = 0;
  document.getElementById("tituloModalTransferirFolhaBobina").textContent = `Transferir — ${item.codigo}`;
  document.getElementById("infoTransferirFolhaBobina").innerHTML =
    `Lote: <strong>${lote.quantidade} folhas</strong><br>Máquina atual: <strong>${lote.maquinaAtual || "-"}</strong>`;
  document.getElementById("modalTransferirFolhaBobina").style.display = "flex";
}
function fecharModalTransferirFolhaBobina() {
  document.getElementById("modalTransferirFolhaBobina").style.display = "none";
}

// ---- Listeners ----
document.addEventListener("DOMContentLoaded", () => {
  const inpFiltro = document.getElementById("filtroFolhaBobina");
  if (inpFiltro) inpFiltro.addEventListener("input", aplicarFiltrosFolhaBobina);
  const selTipo = document.getElementById("filtroTipoFolhaBobina");
  if (selTipo) selTipo.addEventListener("change", aplicarFiltrosFolhaBobina);

  const formCad = document.getElementById("formFolhaBobina");
  if (formCad) formCad.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const id = document.getElementById("idFolhaBobina").value;
    const dados = {
      codigo: document.getElementById("codigoFolhaBobina").value.trim() || undefined,
      tipo: document.getElementById("tipoFolhaBobina").value.trim(),
      localizacao: document.getElementById("localizacaoFolhaBobina").value.trim(),
      quantidade: parseInt(document.getElementById("quantidadeFolhaBobina").value, 10) || 0,
      formato: document.getElementById("formatoFolhaBobina").value.trim(),
      gramatura: parseFloat(document.getElementById("gramaturaFolhaBobina").value) || 0,
      observacoes: document.getElementById("observacoesFolhaBobina").value.trim(),
    };
    if (!dados.tipo) return alert("Informe o tipo.");
    try {
      if (id) await fbAtualizar(id, dados); else await fbCriar(dados);
      fecharModalFolhaBobina();
      await carregarFolhaBobina();
    } catch (err) { console.error(err); alert("Erro: " + err.message); }
  });

  const formEnt = document.getElementById("formEntradaFolhaBobina");
  if (formEnt) formEnt.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const id = document.getElementById("idEntradaFolhaBobina").value;
    const qtd = parseInt(document.getElementById("quantidadeEntradaFolhaBobina").value, 10);
    if (!qtd || qtd <= 0) return alert("Quantidade inválida.");
    try {
      await fbEntrar(id, { quantidade: qtd });
      fecharModalEntradaFolhaBobina();
      await carregarFolhaBobina();
    } catch (err) { alert("Erro: " + err.message); }
  });

  const formSai = document.getElementById("formSaidaFolhaBobina");
  if (formSai) formSai.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (_movimentandoFB) return; _movimentandoFB = true;
    try {
      const id = document.getElementById("idSaidaFolhaBobina").value;
      const dados = {
        quantidade: parseInt(document.getElementById("quantidadeSaidaFolhaBobina").value, 10),
        tipoMaquina: document.getElementById("tipoMaquinaSaidaFolhaBobina").value,
        usuario: document.getElementById("usuarioSaidaFolhaBobina").value.trim(),
        observacoes: document.getElementById("obsSaidaFolhaBobina").value.trim(),
      };
      if (!dados.quantidade || dados.quantidade <= 0) return alert("Quantidade inválida.");
      if (!dados.tipoMaquina) return alert("Selecione a máquina.");
      if (!dados.usuario) return alert("Informe o usuário.");
      await fbDarSaida(id, dados);
      fecharModalSaidaFolhaBobina();
      await carregarFolhaBobina();
    } catch (err) { alert("Erro: " + err.message); }
    finally { _movimentandoFB = false; }
  });

  const formRet = document.getElementById("formRetornoFolhaBobina");
  if (formRet) formRet.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (_movimentandoFB) return; _movimentandoFB = true;
    try {
      const id = document.getElementById("idRetornoFolhaBobina").value;
      const loteId = document.getElementById("loteIdRetornoFolhaBobina").value;
      const usuario = document.getElementById("usuarioRetornoFolhaBobina").value.trim();
      if (!usuario) return alert("Informe o usuário.");
      const filhas = [...document.querySelectorAll("#filhasContainerFolhaBobina .filha-folhabobina-linha")]
        .map((l) => ({
          formato: l.querySelector(".filha-formato").value.trim(),
          quantidade: parseInt(l.querySelector(".filha-quantidade").value, 10) || 0,
        })).filter((f) => f.formato && f.quantidade > 0);
      await fbRetornar(id, {
        loteId,
        quantidadeRetorno: parseInt(document.getElementById("quantidadeRetornoFolhaBobina").value, 10) || 0,
        perdaKg: parseFloat(document.getElementById("perdaKgFolhaBobina").value) || 0,
        filhas,
        usuario,
        observacoes: document.getElementById("obsRetornoFolhaBobina").value.trim(),
      });
      fecharModalRetornoFolhaBobina();
      await carregarFolhaBobina();
    } catch (err) { console.error(err); alert("Erro: " + err.message); }
    finally { _movimentandoFB = false; }
  });

  const formTra = document.getElementById("formTransferirFolhaBobina");
  if (formTra) formTra.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (_movimentandoFB) return; _movimentandoFB = true;
    try {
      const id = document.getElementById("idTransferirFolhaBobina").value;
      const loteId = document.getElementById("loteIdTransferirFolhaBobina").value;
      const novaMaquina = document.getElementById("novaMaquinaFolhaBobina").value;
      const usuario = document.getElementById("usuarioTransferirFolhaBobina").value.trim();
      const perdaKg = parseFloat(document.getElementById("perdaKgTransferirFolhaBobina").value) || 0;
      const folhasPerdidas = parseInt(document.getElementById("folhasPerdidasTransferirFolhaBobina").value, 10) || 0;
      if (!novaMaquina) return alert("Selecione a máquina.");
      if (!usuario) return alert("Informe o usuário.");
      await fbTransferir(id, {
        loteId, novaMaquina, usuario,
        observacoes: document.getElementById("obsTransferirFolhaBobina").value.trim(),
        perdaKg, folhasPerdidas,
      });
      fecharModalTransferirFolhaBobina();
      await carregarFolhaBobina();
    } catch (err) { console.error(err); alert("Erro: " + err.message); }
    finally { _movimentandoFB = false; }
  });

  document.getElementById("perdaKgFolhaBobina")?.addEventListener("input", atualizarResumoRetornoFolhaBobina);
  document.getElementById("quantidadeRetornoFolhaBobina")?.addEventListener("input", atualizarResumoRetornoFolhaBobina);
});

// Hook em openTab
const _openTabAnteriorFB = typeof openTab === "function" ? openTab : null;
openTab = function (tabId, event) {
  if (_openTabAnteriorFB) _openTabAnteriorFB(tabId, event);
  if (tabId === "estoque") {
    const visivel = document.querySelector("#estoque .sub-tab-content.active");
    if (visivel && visivel.id === "sub-folhas-bobina") carregarFolhaBobina();
  }
};

// ============================================================
// ====== DOWNLOAD EM EXCEL ==================================
// ============================================================

// Baixa a tabela de uma sub-aba de Movimentação
// tipo: 'bobinas' | 'papelcartao' | 'insumos' | 'prodac'
function baixarExcelMov(tipo) {
  const config = {
    bobinas: { tbodyId: "corpoTabelaHistorico", nome: "movimentacao_bobinas" },
    papelcartao: { tbodyId: "corpoTabelaHistoricoPC", nome: "movimentacao_papelcartao" },
    insumos: { tbodyId: "corpoTabelaHistoricoInsumos", nome: "movimentacao_insumos" },
    prodac: { tbodyId: "corpoTabelaHistoricoProdAc", nome: "movimentacao_produtos_acabados" },
  };
  const cfg = config[tipo];
  if (!cfg) return alert("Tipo desconhecido.");
  const tbody = document.getElementById(cfg.tbodyId);
  if (!tbody) return alert("Tabela não encontrada.");
  const table = tbody.closest("table");
  gerarExcelDeTabela(table, cfg.nome);
}

// Baixa o relatório atualmente visível
function baixarExcelRelatorio(btn) {
  // O botão está dentro do "resultadoRelatorio*", o conteúdo fica no id irmão
  const card = btn.closest(".card");
  if (!card) return alert("Relatório não encontrado.");
  const table = card.querySelector("table");
  if (!table) return alert("Nenhum relatório visível para exportar. Clique em 'Gerar Relatório' primeiro.");
  const idCard = card.id || "";
  let nome = "relatorio";
  if (idCard.includes("PC")) nome = "relatorio_papelcartao";
  else if (idCard.includes("Ins")) nome = "relatorio_insumos";
  else if (idCard.includes("ProdAc")) nome = "relatorio_produtos_acabados";
  else nome = "relatorio_bobinas";
  gerarExcelDeTabela(table, nome);
}

// Converte uma <table> HTML em um arquivo XLSX e dispara o download.
// Ignora colunas com classe "no-print" (botões de ação).
function gerarExcelDeTabela(table, nomeArquivoBase) {
  try {
    if (!table) return alert("Tabela vazia.");
    // Descobre quais colunas ignorar (as .no-print)
    const heads = [...table.querySelectorAll("thead th")];
    const colsIgnorar = new Set();
    heads.forEach((h, i) => {
      if (h.classList.contains("no-print")) colsIgnorar.add(i);
    });

    // Cabeçalho
    const cabecalho = heads
      .filter((_, i) => !colsIgnorar.has(i))
      .map((h) => h.textContent.trim());

    // Linhas
    const rows = [...table.querySelectorAll("tbody tr")];
    const dados = rows
      .filter((tr) => tr.querySelectorAll("td").length >= cabecalho.length) // ignora "Carregando..."
      .map((tr) => {
        const tds = [...tr.querySelectorAll("td")];
        return tds
          .filter((_, i) => !colsIgnorar.has(i))
          .map((td) => td.textContent.replace(/\s+/g, " ").trim());
      });

    if (dados.length === 0) return alert("Sem linhas para exportar.");

    // Monta a planilha
    const aoa = [cabecalho, ...dados];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // largura automática básica
    const larguras = cabecalho.map((h, i) => {
      const max = Math.max(h.length, ...dados.map((r) => (r[i] || "").length));
      return { wch: Math.min(Math.max(max + 2, 10), 50) };
    });
    ws["!cols"] = larguras;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");

    const dataStr = new Date().toISOString().slice(0, 10);
    const nomeFinal = `${nomeArquivoBase}_${dataStr}.xlsx`;
    XLSX.writeFile(wb, nomeFinal);
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar Excel: " + err.message);
  }
}

// ============================================================
// ====== ABA INSUMOS (modelo produto, igual ProdAc) =========
// ============================================================
const INSUMOS_API = `${API_BASE_URL}/insumos`;

let insumosCache = [];
let filtroStatusInsumo = "TODOS"; // TODOS | DISPONIVEL | REPOR
let _movimentandoInsumo = false;

// ---- API ----
async function insListar() {
  const r = await fetch(INSUMOS_API);
  if (!r.ok) throw new Error("Falha ao listar insumos");
  return r.json();
}
async function insCriar(dados) {
  const r = await fetch(INSUMOS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao criar");
  return r.json();
}
async function insAtualizar(id, dados) {
  const r = await fetch(`${INSUMOS_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao atualizar");
  return r.json();
}
async function insExcluir(id) {
  const r = await fetch(`${INSUMOS_API}/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao excluir");
  return r.json();
}
async function insMovimentar(id, tipo, payload) {
  const r = await fetch(`${INSUMOS_API}/${id}/${tipo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao movimentar");
  return r.json();
}

// ---- Carregamento e render ----
async function carregarInsumos() {
  try {
    insumosCache = await insListar();
    if (!Array.isArray(insumosCache)) insumosCache = [];
    popularFiltroFabricanteInsumo();
    aplicarFiltrosInsumos();
  } catch (err) {
    console.error(err);
    const corpo = document.getElementById("corpoTabelaInsumos");
    if (corpo) corpo.innerHTML = `<tr><td colspan="7" style="color:red;">Erro ao carregar. Veja o console.</td></tr>`;
  }
}

function popularFiltroFabricanteInsumo() {
  const sel = document.getElementById("filtroFabricanteInsumo");
  if (!sel) return;
  const atual = sel.value;
  const fabricantes = [...new Set(insumosCache.map((i) => i.fabricante).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">Todos os fabricantes</option>` +
    fabricantes.map((f) => `<option value="${f}">${f}</option>`).join("");
  if (fabricantes.includes(atual)) sel.value = atual;
}

function aplicarFiltrosInsumos() {
  const corpo = document.getElementById("corpoTabelaInsumos");
  if (!corpo) return;
  const texto = (document.getElementById("filtroInsumo")?.value || "").toLowerCase().trim();
  const fFab = (document.getElementById("filtroFabricanteInsumo")?.value || "").trim();

  const filtrados = insumosCache.filter((p) => {
    const saldo = (parseFloat(p.totalEntradas) || 0) - (parseFloat(p.totalSaidas) || 0);
    if (filtroStatusInsumo === "DISPONIVEL" && saldo <= 0) return false;
    if (filtroStatusInsumo === "REPOR" && saldo > 0) return false;
    if (fFab && (p.fabricante || "") !== fFab) return false;
    if (!texto) return true;
    const alvo = [p.codigo, p.fabricante, p.descricao, p.observacoes]
      .map((v) => String(v ?? "").toLowerCase()).join(" ");
    return alvo.includes(texto);
  });

  if (filtrados.length === 0) {
    corpo.innerHTML = `<tr><td colspan="7">Nenhum insumo encontrado</td></tr>`;
    return;
  }

  corpo.innerHTML = filtrados.map((p) => {
    const entradas = parseFloat(p.totalEntradas) || 0;
    const saidas = parseFloat(p.totalSaidas) || 0;
    const total = entradas - saidas;
    const totalCor = total <= 0 ? 'color:#b02a2a; font-weight:bold;' : '';
    return `<tr>
      <td>${p.codigo || "-"}</td>
      <td>${p.fabricante || "-"}</td>
      <td>${p.descricao || "-"}</td>
      <td>${entradas}</td>
      <td>${saidas}</td>
      <td style="${totalCor}">${total}</td>
      <td class="no-print">
        <button class="btn" onclick="abrirMovInsumo('${p._id}', 'entrada')">Entrada</button>
        <button class="btn" onclick="abrirMovInsumo('${p._id}', 'saida')">Saída</button>
        <button class="btn" onclick="editarInsumo('${p._id}')">Editar</button>
        <button class="btn btn-danger" onclick="excluirInsumo('${p._id}')">Excluir</button>
      </td>
    </tr>`;
  }).join("");
}

function filtrarInsumoPorStatus(status, btn) {
  filtroStatusInsumo = status;
  document.querySelectorAll("#insumos .btn-filtro-status").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  aplicarFiltrosInsumos();
}

function limparFiltrosInsumo() {
  ["filtroInsumo", "filtroFabricanteInsumo"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  filtroStatusInsumo = "TODOS";
  document.querySelectorAll("#insumos .btn-filtro-status").forEach((b) => {
    b.classList.toggle("active", b.dataset.status === "TODOS");
  });
  aplicarFiltrosInsumos();
}

// ---- Cadastro / Edição ----
function abrirCadastroInsumo() {
  const form = document.getElementById("formInsumo");
  form.reset();
  document.getElementById("idInsumo").value = "";
  document.getElementById("codigoInsumo").readOnly = false;
  document.getElementById("tituloModalInsumo").textContent = "Novo Insumo";
  document.getElementById("modalInsumo").style.display = "flex";
}

function editarInsumo(id) {
  const item = insumosCache.find((p) => p._id === id);
  if (!item) return alert("Insumo não encontrado.");
  document.getElementById("idInsumo").value = item._id;
  document.getElementById("codigoInsumo").value = item.codigo || "";
  document.getElementById("codigoInsumo").readOnly = true;
  document.getElementById("fabricanteInsumo").value = item.fabricante || "";
  document.getElementById("descricaoInsumo").value = item.descricao || "";
  document.getElementById("obsInsumo").value = item.observacoes || "";
  document.getElementById("tituloModalInsumo").textContent = "Editar Insumo";
  document.getElementById("modalInsumo").style.display = "flex";
}

function fecharModalInsumo() {
  document.getElementById("modalInsumo").style.display = "none";
}

async function excluirInsumo(id) {
  if (!confirm("Excluir este insumo? Isso NÃO apaga o histórico de movimentações.")) return;
  try {
    await insExcluir(id);
    await carregarInsumos();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir: " + err.message);
  }
}

// ---- Movimentação ----
function abrirMovInsumo(id, tipo) {
  const item = insumosCache.find((p) => p._id === id);
  if (!item) return alert("Insumo não encontrado.");
  document.getElementById("idMovInsumo").value = id;
  document.getElementById("tipoMovInsumo").value = tipo;
  document.getElementById("quantidadeMovInsumo").value = "";
  document.getElementById("usuarioMovInsumo").value = "";
  document.getElementById("obsMovInsumo").value = "";

  const total = (parseFloat(item.totalEntradas) || 0) - (parseFloat(item.totalSaidas) || 0);
  const titulo = tipo === "entrada" ? "Registrar Entrada" : "Registrar Saída";
  document.getElementById("tituloModalMovInsumo").textContent = `${titulo} — ${item.codigo}`;
  document.getElementById("infoMovInsumo").innerHTML =
    `Insumo: <strong>${item.descricao || "-"}</strong><br>` +
    `Fabricante: <strong>${item.fabricante || "-"}</strong><br>` +
    `Saldo atual: <strong>${total}</strong>`;

  const inp = document.getElementById("quantidadeMovInsumo");
  if (tipo === "saida") inp.max = total; else inp.removeAttribute("max");
  document.getElementById("modalMovInsumo").style.display = "flex";
  setTimeout(() => inp.focus(), 50);
}

function fecharModalMovInsumo() {
  document.getElementById("modalMovInsumo").style.display = "none";
}

// ---- Sub-aba movimentação (histórico) - reescrita ----
async function carregarHistoricoInsumosTab() {
  const corpo = document.getElementById("corpoTabelaHistoricoInsumos");
  if (!corpo) return;
  corpo.innerHTML = `<tr><td colspan="10">Carregando...</td></tr>`;
  try {
    const movs = await (await fetch(`${API_BASE_URL}/movimentacoes`)).json();
    const lista = (movs || []).filter((m) => m.tipoItem === "insumo");
    if (lista.length === 0) {
      corpo.innerHTML = `<tr><td colspan="10">Nenhuma movimentação de insumo</td></tr>`;
      return;
    }
    lista.sort((a, b) => new Date(b.data) - new Date(a.data));
    corpo.innerHTML = lista.map((m) => {
      const data = m.data ? new Date(m.data).toLocaleString() : "-";
      return `<tr>
        <td>${data}</td>
        <td>${m.codigoItem || "-"}</td>
        <td>${m.descricaoItem || "-"}</td>
        <td>${m.tipoMovimentacao || "-"}</td>
        <td>${m.quantidade ?? 0}</td>
        <td>${m.usuario || "-"}</td>
        <td>${m.cliente || "-"}</td>
        <td>${m.observacoes || "-"}</td>
        <td class="no-print">
          <button class="btn" onclick="editarMovimentacao('${m._id}')">Editar</button>
          <button class="btn-danger" onclick="excluirMovimentacao('${m._id}')">Excluir</button>
        </td>
      </tr>`;
    }).join("");
  } catch (err) {
    console.error(err);
    corpo.innerHTML = `<tr><td colspan="10" style="color:red;">Erro. Veja o console.</td></tr>`;
  }
}

// ---- Listeners ----
document.addEventListener("DOMContentLoaded", () => {
  const formCad = document.getElementById("formInsumo");
  if (formCad) formCad.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const id = document.getElementById("idInsumo").value;
    const dados = {
      codigo: document.getElementById("codigoInsumo").value.trim(),
      fabricante: document.getElementById("fabricanteInsumo").value.trim(),
      descricao: document.getElementById("descricaoInsumo").value.trim(),
      observacoes: document.getElementById("obsInsumo").value.trim(),
    };
    if (!dados.codigo) return alert("Informe o código.");
    if (!dados.descricao) return alert("Informe a descrição.");
    try {
      if (id) await insAtualizar(id, dados);
      else await insCriar(dados);
      fecharModalInsumo();
      await carregarInsumos();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar: " + err.message);
    }
  });

  const formMov = document.getElementById("formMovInsumo");
  if (formMov) formMov.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (_movimentandoInsumo) return;
    _movimentandoInsumo = true;
    try {
      const id = document.getElementById("idMovInsumo").value;
      const tipo = document.getElementById("tipoMovInsumo").value;
      const qtd = parseFloat(document.getElementById("quantidadeMovInsumo").value);
      const usuario = document.getElementById("usuarioMovInsumo").value.trim();
      const obs = document.getElementById("obsMovInsumo").value.trim();
      if (!qtd || qtd <= 0) return alert("Quantidade inválida.");
      if (!usuario) return alert("Informe o usuário.");
      await insMovimentar(id, tipo, { quantidade: qtd, usuario, observacoes: obs });
      fecharModalMovInsumo();
      await carregarInsumos();
      if (typeof carregarHistoricoInsumosTab === "function") carregarHistoricoInsumosTab();
    } catch (err) {
      console.error(err);
      alert("Erro: " + err.message);
    } finally {
      _movimentandoInsumo = false;
    }
  });

  const inpFiltro = document.getElementById("filtroInsumo");
  if (inpFiltro) inpFiltro.addEventListener("input", aplicarFiltrosInsumos);
  const selFab = document.getElementById("filtroFabricanteInsumo");
  if (selFab) selFab.addEventListener("change", aplicarFiltrosInsumos);
});

// Hook em openTab
const _openTabAnteriorIns = typeof openTab === "function" ? openTab : null;
openTab = function (tabId, event) {
  if (_openTabAnteriorIns) _openTabAnteriorIns(tabId, event);
  if (tabId === "insumos") carregarInsumos();
};
