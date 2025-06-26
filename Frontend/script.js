// Constantes API
const API_BASE_URL = "https://bobinas.onrender.com";
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
        // Agora que temos o _id, geramos o codigoQR com apenas o ID
        const codigoQR = data._id;

        return fetch(`${API_BASE_URL}/bobinas/${data._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, codigoQR }),
        }).then(() => resolve(data));
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Função para adicionar folhas
function addFolhas(folhas) {
  return new Promise((resolve, reject) => {
    // Gera um ID para as folhas
    folhas.id = `FOLHAS-${Date.now()}`;
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

      // Atualiza no banco via API
      return updateBobina(bobina).then(() => bobina);
    })
    .then((bobina) => {
      // Cria registro de movimentação
      const movimentacao = {
        idBobina: bobina._id || bobina._id,
        tipoMovimentacao: "SAÍDA",
        quantidade: pesoSaida,
        tipoMaquina,
        usuario,
        observacoes,
        data: new Date(),
      };

      return addMovimentoHistorico(movimentacao);
    })
    .then((movimentacao) => {
      return getBobinaById(idBobina); // recupera a bobina de novo
    })
    .then((bobina) => {
      gerarEtiqueta(bobina, tipoMaquina, usuario);
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

function carregarEstoque() {
  console.log("Carregando estoque...");

  getAllBobinas()
    .then((bobinas) => {
      console.log("Bobinas recebidas:", bobinas);
      const corpoTabela = document.getElementById("corpoTabelaEstoque");
      corpoTabela.innerHTML = "";

      if (!bobinas || bobinas.length === 0) {
        console.log("Nenhuma bobina encontrada");
        corpoTabela.innerHTML = `<tr><td colspan="8">Nenhuma bobina cadastrada</td></tr>`;
        return;
      }

      bobinas.forEach((bobina) => {
        console.log("Processando bobina:", bobina);
        const tr = document.createElement("tr");

        const status = bobina.dataSaida
          ? `<span class="status-indisponivel">EM USO</span>`
          : `<span class="status-disponível">DISPONÍVEL</span>`;

        const acoes = bobina.dataSaida
          ? `<button class="btn" onclick="visualizarBobina('${bobina._id}')">Visualizar</button>
     <button class="btn" onclick="prepararRetorno('${bobina._id}')">Registrar Retorno</button>
     <button class="btn" onclick="editarBobina('${bobina._id}')">Editar</button>
     <button class="btn btn-danger" onclick="deletarBobina('${bobina._id}')">Excluir</button>`
          : `<button class="btn" onclick="visualizarBobina('${bobina._id}')">Visualizar</button>
     <button class="btn" onclick="prepararSaida('${bobina._id}')">Registrar Saída</button>
     <button class="btn" onclick="editarBobina('${bobina._id}')">Editar</button>
     <button class="btn btn-danger" onclick="deletarBobina('${bobina._id}')">Excluir</button>`;

        tr.innerHTML = `
                   <td>${(bobina._id || "N/A").slice(-6)}</td>
                    <td>${bobina.tipoPapel || "N/A"}</td>
                    <td>${bobina.fabricante || "N/A"}</td>
                    <td>${bobina.peso ? bobina.peso.toFixed(2) : "0.00"}</td>
                    <td>${bobina.largura ? bobina.largura + " cm" : "N/A"}</td>
                    <td>${
                      bobina.gramatura ? bobina.gramatura + " g/m²" : "N/A"
                    }</td>
                    <td>${status}</td>
                    <td class="no-print">${acoes}</td>
                `;

        corpoTabela.appendChild(tr);
      });
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
            <p><strong>Fornecedor:</strong> ${bobina.fornecedor}</p>
            <p><strong>Localização:</strong> ${bobina.localizacao}</p>
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

    // 4) Atualiza bobina (peso e status)
    bobina.dataSaida = null;
    bobina.peso = pesoUtilizado === movimento.quantidade ? 0 : pesoRestante;
    if (!isNaN(novaLargura)) bobina.largura = novaLargura;
    if (!isNaN(novaGramatura)) bobina.gramatura = novaGramatura;
    await updateBobina(bobina);

    // 5) Cria novo movimento de RETORNO
    await addMovimentoHistorico({
      idBobina: bobina._id,
      tipoMovimentacao: "RETORNO",
      quantidade: pesoUtilizado,
      tipoMaquina,
      usuario: observacoes || "Sistema",
       observacoes: obsFinal,
      idMovimentoOrigem: movimento._id,
      data: new Date(),
    });

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
          fornecedor: bobina.fornecedor,
          localizacao: bobina.localizacao,
          dataEntrada: new Date(),
          codigoQR: `BOBINA-${Date.now()}-${i}`,
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
    if (
      (tipoRetorno === "folhas" || tipoRetorno === "ambos") &&
      quantidadeFolhas > 0 &&
      formatoFolhas
    ) {
      promises.push(
        addFolhas({
          idBobinaOrigem: bobina._id,
          quantidade: quantidadeFolhas,
          formato: formatoFolhas,
          cliente: clienteFolhas || "Não informado",
          pesoUtilizado,
          dataProcessamento: new Date(),
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

function carregarHistorico() {
  getAllHistorico()
    .then((historico) => {
      const corpoTabela = document.getElementById("corpoTabelaHistorico");
      corpoTabela.innerHTML = "";

      historico.forEach((mov) => {
        const tr = document.createElement("tr");
        const data = new Date(mov.data);

        tr.innerHTML = `
                    <td>${data.toLocaleDateString()} ${data.toLocaleTimeString()}</td>
                    <td>${mov.idBobina || mov.idFolhas || "-"}</td>
                    <td>${mov.tipoMovimentacao}${
          mov.tipoMaquina ? " (" + mov.tipoMaquina + ")" : ""
        }</td>
                    <td>${
                      mov.quantidade ? mov.quantidade.toFixed(2) : "0.00"
                    }</td>
                    <td>${mov.usuario}</td>
                    <td>${mov.observacoes || "-"}</td>
                `;

        corpoTabela.appendChild(tr);
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar histórico:", error);
      alert("Erro ao carregar histórico. Consulte o console para detalhes.");
    });
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
        const status = bobina.dataSaida ? "EM USO" : "DISPONÍVEL";
        html += `<tr>
                                <td>${(bobina._id || "").slice(-6)}</td>

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
          mapaBobinas[b._id] = b.tipoPapel || "-";
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
          const tipoPapel = mapaBobinas[mov.idBobina] || "-";

          let pesoEntrada = "-";
          let pesoSaida = "-";
          if (tipo === "ENTRADA" || tipo === "RETORNO") {
            pesoEntrada = peso + " kg";
          } else if (tipo === "SAÍDA") {
            pesoSaida = peso + " kg";
          }

          html += `<tr>
          <td>${data.toLocaleDateString()} ${data.toLocaleTimeString()}</td>
          <td>${(mov.idBobina || mov.idFolhas || "-").slice(-6)}</td>
          <td>${tipoPapel}</td>
          <td>${tipo}</td>
          <td>${maquina}</td>
          <td>${pesoEntrada}</td>
          <td>${pesoSaida}</td>
          <td>${usuario}</td>
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
  document.getElementById("etiquetaCodigo").textContent = bobina._id || "-";
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
  document.getElementById("etiquetaMaquina").textContent = maquina || "-";
  document.getElementById("etiquetaUsuario").textContent = usuario || "-";
  document.getElementById("etiquetaData").textContent =
    new Date().toLocaleString();

  document.getElementById("etiqueta").style.display = "block";
  window.print();
  document.getElementById("etiqueta").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  carregarEstoque();

  // Formulário de cadastro
  document.getElementById("formBobina").addEventListener("submit", (event) => {
    event.preventDefault();

    const bobina = {
      tipoPapel: document.getElementById("tipoPapel").value,
      fabricante: document.getElementById("fabricante").value,
      peso: parseFloat(document.getElementById("peso").value),
      pesoInicial: parseFloat(document.getElementById("peso").value),
      largura: parseFloat(document.getElementById("largura").value),
      gramatura: parseInt(document.getElementById("gramatura").value),
      fornecedor: document.getElementById("fornecedor").value,
      localizacao: document.getElementById("localizacao").value,
      dataEntrada: new Date(),
      codigoQR: `BOBINA-${Date.now()}`, // <-- Adiciona esta linha
    };

    addBobina(bobina)
      .then((data) => {
        data.codigoQR = data._id;
        return updateBobina(data);
      })
      .then((dataAtualizada) => {
        const movimento = {
          idBobina: dataAtualizada._id,
          tipoMovimentacao: "ENTRADA",
          quantidade: dataAtualizada.peso,
          data: new Date(),
          usuario: "Sistema",
          observacoes: "Cadastro inicial",
        };
        return addMovimentoHistorico(movimento);
      })
      .then(() => {
        alert("Bobina cadastrada com sucesso!");
        document.getElementById("formBobina").reset();
        carregarEstoque();
        carregarHistorico?.(); // Atualiza a tabela de movimentações
      })
      .catch((error) => {
        console.error("Erro ao cadastrar bobina:", error);
        alert("Erro ao cadastrar bobina. Consulte o console para detalhes.");
      });
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
            <input type="number" id="larguraBobina${i}" name="larguraBobina${i}" step="0.1" min="0" >
            <label>Gramatura (g/m²):</label>
            <input type="number" id="gramaturaBobina${i}" name="gramaturaBobina${i}" step="1" min="0" >
        </div>
    `;
        }
      } else {
        container.style.display = "none";
      }
    });

  // Filtro de estoque
  document.getElementById("filtro").addEventListener("input", (event) => {
    const filtro = event.target.value.toLowerCase();
    const linhas = document.querySelectorAll("#corpoTabelaEstoque tr");

    linhas.forEach((linha) => {
      const textoLinha = linha.textContent.toLowerCase();
      linha.style.display = textoLinha.includes(filtro) ? "" : "none";
    });
  });

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
  }

  // Remove a classe active de todas as tabs
  const tabs = document.getElementsByClassName("tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }

  // Mostra o conteúdo da tab selecionada e marca como active
  document.getElementById(tabId).classList.add("active");
  if (event && event.currentTarget) event.currentTarget.classList.add("active");

  // Atualiza os dados se necessário
  if (tabId === "estoque") {
    carregarEstoque();
  } else if (tabId === "movimentacao") {
    carregarHistorico();
  } else if (tabId === "relatorios") {
    // Se você quiser atualizar dados do relatório, coloque aqui
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
      document.getElementById("fornecedor").value = bobina.fornecedor || "";
      document.getElementById("localizacao").value = bobina.localizacao || "";

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
