// ============================================================
// MOTOR DE CLASSIFICAÇÃO — BRAD CAPTURA
// Todas as regras aplicadas via análise de texto (sem API)
// ============================================================

const GESTORES = {
  4008: "Conta Corrente / PIX / Movimentações",
  4010: "Ações Financeiras",
  4012: "Fundo de Investimento",
  4026: "Cartão Cred Mais Consignado",
  4027: "Private Label Parceiros",
  4040: "Genérico",
  4120: "Negativações Cedidas / Cobrança / Dívidas cedidas",
  4160: "Agência Bancária",
  4225: "Planos Econômicos / Poupança / CDB / LCI",
  4229: "Atendimento Telefônico",
  4230: "Imóvel / Leasing / Ambiental / Obras",
  4312: "BDN / Caixas 24h",
  4510: "Cheques / FGTS / Arrecadação",
  4769: "Next (Conta Digital)",
  4840: "Empréstimos / Financiamentos / Cheque Especial",
  4859: "Segurança Corporativa",
  4900: "Câmbio / Internacional",
  4920: "Bradesco Expresso",
  5203: "Digio / Bradesco Financiamentos Consignado",
  5310: "Seguro Vida / Previdência NÃO Reconhecido",
  5404: "Bradescard",
  5414: "Aplicação Financeira Não Reconhecida",
  5800: "Seguro Residencial / Auto NÃO Reconhecido",
  5850: "Capitalização NÃO Reconhecida",
  6565: "Consórcio Bradesco",
  7528: "Bitz (Carteira Digital)",
  7630: "Seguro Médico / Hospitalar NÃO Reconhecido",
  8041: "Financiamento de Veículo BF",
  8329: "Odontoprev",
  8627: "Cartões Bradesco Débito e Crédito",
  8706: "Aplicativo / Token / Internet Bank",
  9080: "Losango",
  25215: "Leasing Bradesco"
};

const COD_TIPOS = {
  90: "ACAO DE REPARACAO DE DANOS (Vara Cível)",
  91: "ACAO DE REPARACAO DE DANOS (Juizado Especial)",
  8914: "ACAO REVISIONAL (Vara Cível)",
  8921: "ACAO REVISIONAL (Juizado Especial)",
  63: "ACAO SUPERENDIVIDAMENTO",
  8908: "CADASTRO IRREGULAR",
  57: "ACAO BANCO REU",
  18: "ACAO CAUTELAR",
  1: "ACAO DE PLANOS ECONOMICOS (Vara Cível)",
  93: "ACAO DE PLANOS ECONOMICOS (Juizado Especial)",
  31: "ACAO DE EXECUCAO FISCAL",
  8944: "RECLAMACAO PRE-PROCESSUAL",
  323: "RECLAMACAO PRE-PROCESSUAL SUPERENDIVIDAMENTO",
  308: "CARTA CONVITE SUPERENDIVIDAMENTO",
  6: "ACAO DE PRESTACAO DE CONTAS",
  8: "ACAO DE USUCAPIAO"
};

const SUBTIPOS = {
  // Gestor 4008
  "4008_90": [
    { cod: 296, nome: "PIX-GOLPE/ESTELIONATO/FRAUDE", palavras: ["pix", "golpe", "fraude", "estelionato", "transferência não reconhecida", "transferencia nao reconhecida"] },
    { cod: 165, nome: "CONTA-TRANSF/PAGTO N RECONHEC VIA INTERNET BANKING", palavras: ["internet banking", "internet bank", "acesso indevido", "transferência via internet", "transferencia via internet"] },
    { cod: 296, nome: "PIX-GOLPE/ESTELIONATO/FRAUDE", palavras: ["pix fraudulento", "pix não autorizado", "pix nao autorizado"] },
    { cod: 13, nome: "CONTA-BLOQUEIO INDEVIDO", palavras: ["bloqueio indevido", "conta bloqueada", "bloqueio da conta"] },
    { cod: 14, nome: "CONTA-BLOQUEIO JUDICIAL", palavras: ["bloqueio judicial", "penhora", "arresto"] },
    { cod: 38, nome: "CONTA-PEDIDO ENCERRAMENTO N ATENDIDO", palavras: ["encerramento", "fechamento da conta", "cancelamento da conta"] },
    { cod: 163, nome: "CONTA-COBRANCA DE TARIFAS", palavras: ["tarifa", "cobrança indevida", "taxa de manutenção"] },
    { cod: 258, nome: "DEBITO AUTOM-NAO AUTORIZ PELO CLIENTE", palavras: ["débito automático não autorizado", "debito automatico nao autorizado"] },
    { cod: 168, nome: "CONTA-ESTORNO NAO AUTORIZADO PELO CLIENT", palavras: ["estorno não autorizado", "estorno nao autorizado", "estorno indevido"] },
    { cod: 269, nome: "CONTA-MOV POR REPRESENTACAO IRREGULAR", palavras: ["representação irregular", "procuração", "procuracao"] },
    { cod: 122, nome: "CONTRATO-RESCISAO CONTRATO PREST SERVICO", palavras: ["rescisão", "rescisao", "cancelamento do contrato de serviço"] }
  ],
  // Gestor 4840
  "4840_90": [
    { cod: 79, nome: "FINAN-CONTRATO NAO RECONHECIDO", palavras: ["empréstimo não reconhecido", "emprestimo nao reconhecido", "contrato não reconhecido", "contrato nao reconhecido", "ccb", "cédula de crédito", "cedula de credito", "empréstimo fraudulento", "emprestimo fraudulento"] },
    { cod: 159, nome: "EMP CONSIG-CONTRATO NAO RECONHECIDO", palavras: ["consignado não reconhecido", "desconto em folha não reconhecido"] },
    { cod: 192, nome: "EMP CONSIG-COMPROMETIMENTO DE RENDA", palavras: ["comprometimento de renda", "margem consignável"] },
    { cod: 241, nome: "EMPREST-NAO COMUNICACAO DA NEGATIVACAO", palavras: ["negativação sem comunicação", "negativacao sem comunicacao", "spc sem aviso", "serasa sem aviso"] },
    { cod: 242, nome: "EMPREST-COBR CONTR EM DISCUSSAO JUDICIAL", palavras: ["cobrança em discussão judicial", "cobranca em discussao judicial"] },
    { cod: 282, nome: "EMPREST-DEMORA NA BAIXA DE RESTRICAO", palavras: ["demora na baixa", "baixa de restrição", "baixa de restricao"] },
    { cod: 117, nome: "LIMITE CHEQUE ESPECIAL-ALTERACAO NAO SOLICITADA", palavras: ["cheque especial", "limite alterado", "limite não solicitado"] },
    { cod: 9, nome: "FINANCIAMENTO-TARIFAS", palavras: ["tarifa de financiamento", "iof", "taxa de abertura"] }
  ],
  // Gestor 8627
  "8627_90": [
    { cod: 68, nome: "CART CRED-EMISSAO NAO SOLIC PELO CLIENTE", palavras: ["cartão não solicitado", "cartao nao solicitado", "emissão não solicitada", "emissao nao solicitada"] },
    { cod: 208, nome: "CART CRED-COMPRA NAO AUTORIZADA", palavras: ["compra não autorizada", "compra nao autorizada", "compra indevida", "compra não reconhecida"] },
    { cod: 211, nome: "CART CRED-CONTRATO NAO RECONHECIDO", palavras: ["contrato de cartão não reconhecido", "cartão não reconhecido"] },
    { cod: 205, nome: "CART CRED-SAQUE NAO RECONHECIDO", palavras: ["saque no cartão não reconhecido", "saque nao reconhecido no cartao"] },
    { cod: 207, nome: "CART CRED-COBRANCA DE ANUIDADE", palavras: ["anuidade", "cobrança de anuidade"] },
    { cod: 209, nome: "CART CRED-COBRANCA PARCELA PAGA", palavras: ["parcela já paga", "parcela ja paga", "cobrança de parcela paga", "estorno não realizado", "estorno nao realizado"] },
    { cod: 212, nome: "CART CRED-COBR SEGURO NAO RECONHECIDO", palavras: ["seguro no cartão não reconhecido", "seguro nao reconhecido no cartao"] },
    { cod: 265, nome: "CART DEBITO-SAQUE NAO RECONHECIDO", palavras: ["saque no débito não reconhecido", "saque no debito nao reconhecido"] },
    { cod: 268, nome: "CART DEBITO-COMPRA NAO RECONHECIDA", palavras: ["compra no débito não reconhecida", "compra no debito nao reconhecida"] },
    { cod: 149, nome: "CART CRED-CANCELAMENTO DO CARTAO", palavras: ["cancelamento do cartão", "cancelamento do cartao"] },
    { cod: 219, nome: "CART CRED-DEMORA NA BAIXA DE RESTRICAO", palavras: ["demora na baixa de restrição do cartão"] }
  ],
  // Gestor 4312
  "4312_90": [
    { cod: 267, nome: "BDN-SAQUE ERRO NA LIBERACAO DAS NOTAS", palavras: ["saque não reconhecido", "saque nao reconhecido", "saque indevido", "caixa eletrônico", "caixa eletronico", "caixa 24h"] },
    { cod: 23, nome: "BDN-CARTAO RETIDO", palavras: ["cartão retido", "cartao retido", "cartão engolido"] },
    { cod: 97, nome: "BDN-SAQUE NOTAS FALSAS/DANIFICADAS", palavras: ["notas falsas", "cédula falsa", "cedula falsa"] },
    { cod: 136, nome: "BDN-SAQUE EM RZ SEQUESTRO RELAMPAGO", palavras: ["sequestro relâmpago", "sequestro relampago", "coação no caixa"] },
    { cod: 354, nome: "BDN-DEMORA NO CREDITO DO DEPOSITO", palavras: ["depósito não creditado", "deposito nao creditado"] }
  ],
  // Gestor 4120
  "4120_90": [
    { cod: 79, nome: "FINAN-CONTRATO NAO RECONHECIDO", palavras: ["dívida não reconhecida", "divida nao reconhecida", "contrato cedido não reconhecido"] },
    { cod: 241, nome: "EMPREST-NAO COMUNICACAO DA NEGATIVACAO", palavras: ["negativação indevida", "negativacao indevida", "nome sujo", "spc", "serasa"] },
    { cod: 242, nome: "EMPREST-COBR CONTR EM DISCUSSAO JUDICIAL", palavras: ["cobrança de dívida prescrita", "cobrança indevida de empresa", "empresa de cobrança"] },
    { cod: 159, nome: "EMP CONSIG-CONTRATO NAO RECONHECIDO", palavras: ["consignado cedido não reconhecido"] }
  ],
  // Gestor 4160
  "4160_90": [
    { cod: 53, nome: "ATENDIMENTO-DEMORA OU AUSENCIA RESPOSTA", palavras: ["demora no atendimento", "falta de resposta", "ausência de resposta"] },
    { cod: 35, nome: "ATENDIMENTO-DESAVENCA COM FUNCIONARIO", palavras: ["desavença", "briga", "discussão com funcionário", "mal atendimento"] },
    { cod: 78, nome: "ATENDIMENTO-TEMPO DE ESPERA PARA ATENDIMENTO", palavras: ["tempo de espera", "fila de espera", "espera excessiva"] },
    { cod: 1, nome: "ATENDIMENTO-ACIDENTE COM CLIENTE/USUARIO", palavras: ["acidente na agência", "queda na agência", "acidente no banco"] },
    { cod: 250, nome: "ATENDIMENTO-AGRESSAO FISICA FUNCIONARIO", palavras: ["agressão física", "agressao fisica"] },
    { cod: 251, nome: "ATENDIMENTO-DISCRIMINACAO POR FUNCIONARI", palavras: ["discriminação", "preconceito", "racismo"] }
  ],
  // Gestor 4859
  "4859_90": [
    { cod: 285, nome: "SEGURANCA-ASSALTO AGENCIA", palavras: ["assalto na agência", "assalto na agencia", "roubo na agência"] },
    { cod: 286, nome: "SEGURANCA-ASSALTO BDN", palavras: ["assalto no caixa", "roubo no caixa eletrônico"] },
    { cod: 287, nome: "SEGURANCA-ASSALTO ESTACIONAMENTO", palavras: ["assalto no estacionamento", "roubo no estacionamento"] }
  ],
  // Gestor 5310
  "5310_90": [
    { cod: 122, nome: "CONTRATO-RESCISAO CONTRATO PREST SERVICO", palavras: ["seguro de vida não reconhecido", "previdência não reconhecida", "desconto de seguro de vida"] },
    { cod: 16, nome: "PREVIDENCIA PRIVADA", palavras: ["previdência privada", "previdencia privada", "plano de previdência"] },
    { cod: 388, nome: "PREVIDENCIA-NAO RECEBIMENTO CONTRIBUICAO", palavras: ["contribuição não recebida", "contribuicao nao recebida"] }
  ],
  // Gestor 5800
  "5800_90": [
    { cod: 122, nome: "CONTRATO-RESCISAO CONTRATO PREST SERVICO", palavras: ["seguro residencial não reconhecido", "seguro auto não reconhecido", "seguro de carro não reconhecido"] }
  ],
  // Gestor 6565
  "6565_90": [
    { cod: 186, nome: "CONSORCIO-CONTRATO NAO RECONHECIDO", palavras: ["consórcio não reconhecido", "consorcio nao reconhecido"] },
    { cod: 19, nome: "CONSORCIO-CANCELAMENTO DE CONTRATO", palavras: ["cancelamento do consórcio", "cancelamento do consorcio"] },
    { cod: 49, nome: "CONSORCIO-DEMORA ENTREGA CARTA CREDITO", palavras: ["carta de crédito", "carta de credito", "contemplação"] },
    { cod: 162, nome: "CONSORCIO-TAXA DE ADMINISTRACAO", palavras: ["taxa de administração do consórcio"] }
  ],
  // Gestor 5404
  "5404_90": [
    { cod: 221, nome: "PRIVATE LABEL-CONTRATO NAO RECONHECIDO", palavras: ["bradescard não reconhecido", "cartão c&a", "cartão amazon", "cartão ibi"] },
    { cod: 199, nome: "PRIVATE LABEL-EMISSAO NAO SOLICITADA", palavras: ["bradescard não solicitado", "cartão private label não solicitado"] },
    { cod: 228, nome: "PRIVATE LABEL-COBRANCA PARCELA PAGA", palavras: ["cobrança de parcela paga bradescard"] }
  ],
  // Gestor 8706
  "8706_90": [
    { cod: 165, nome: "CONTA-TRANSF/PAGTO N RECONHEC VIA INTERNET BANKING", palavras: ["app não reconhecido", "aplicativo fraude", "token indevido", "internet banking fraude"] }
  ],
  // Gestor 5203
  "5203_90": [
    { cod: 159, nome: "EMP CONSIG-CONTRATO NAO RECONHECIDO", palavras: ["digio não reconhecido", "bradesco financiamentos consignado"] },
    { cod: 192, nome: "EMP CONSIG-COMPROMETIMENTO DE RENDA", palavras: ["comprometimento digio", "margem digio"] }
  ]
};

// ============================================================
// REGRAS DE TRIAGEM INICIAL
// ============================================================
function triagem(texto) {
  const t = texto.toLowerCase();

  // Execução fiscal
  if ((t.includes("execução fiscal") || t.includes("execucao fiscal") || t.includes("tributo") || t.includes("iptu") || t.includes("iss ")) &&
      (t.includes("município") || t.includes("municipio") || t.includes("estado") || t.includes("prefeitura") || t.includes("fazenda"))) {
    return { gestor: 4146, codTipo: 31, codSubtipo: null, nome: "EXECUÇÃO FISCAL — encaminhar esteira fiscal", triagem: true };
  }

  // Superendividamento
  if (t.includes("superendividamento") || t.includes("repactuação") || t.includes("repactuacao")) {
    if (!t.includes("dano moral") && !t.includes("indenização") && !t.includes("indenizacao")) {
      return { gestor: null, codTipo: 63, codSubtipo: null, nome: "SUPERENDIVIDAMENTO", triagem: true };
    }
  }

  // Cautelar
  if (t.includes("produção antecipada de provas") || t.includes("producao antecipada de provas") ||
      t.includes("exibição de documentos") || t.includes("exibicao de documentos") ||
      (t.includes("cautelar") && !t.includes("tutela cautelar"))) {
    return { gestor: null, codTipo: 18, codSubtipo: null, nome: "AÇÃO CAUTELAR", triagem: true };
  }

  // Ação banco réu
  if (t.includes("honorários advocatícios") || t.includes("honorarios advocaticios") ||
      t.includes("sustação de leilão") || t.includes("sustacao de leilao") ||
      t.includes("consolidação da propriedade") || t.includes("consolidacao da propriedade")) {
    return { gestor: null, codTipo: 57, codSubtipo: null, nome: "AÇÃO BANCO RÉU", triagem: true };
  }

  // Planos econômicos
  if (t.includes("plano bresser") || t.includes("plano cruzado") || t.includes("plano collor") ||
      t.includes("plano verão") || t.includes("plano verao") || t.includes("plano real") ||
      (t.includes("poupança") && (t.includes("correção") || t.includes("deflação") || t.includes("expurgo")))) {
    return { gestor: 4225, codTipo: 1, codSubtipo: null, nome: "PLANOS ECONÔMICOS", triagem: true };
  }

  return null;
}

// ============================================================
// DETECÇÃO DO TIPO DE VARA
// ============================================================
function detectarVara(texto) {
  const t = texto.toLowerCase();
  if (t.includes("juizado especial") || t.includes("jecrim") || t.includes("jec ") ||
      t.includes("juizado especial cível") || t.includes("juizado especial civel")) {
    return "JEC";
  }
  return "VARA_CIVEL";
}

// ============================================================
// DETECÇÃO DO GESTOR PRINCIPAL
// ============================================================
function detectarGestor(texto) {
  const t = texto.toLowerCase();

  // Odontoprev
  if (t.includes("odontoprev")) return 8329;

  // Next
  if (t.includes("next") && (t.includes("conta digital") || t.includes("agência next") || t.includes("agencia next"))) return 4769;

  // Losango
  if (t.includes("losango") || /\b(0043|4320|062)\d+/.test(t)) return 9080;

  // Bradescard / Private Label específico
  if (t.includes("bradescard") || t.includes("04.184.779") || t.includes("cartão c&a") ||
      t.includes("cartao c&a") || t.includes("cartão amazon") || t.includes("cartão ibi")) return 5404;

  // Digio
  if (t.includes("digio") || t.includes("bradesco financiamentos consignado")) return 5203;

  // Bitz
  if (t.includes("bitz") || t.includes("carteira digital bitz")) return 7528;

  // Consórcio
  if (t.includes("consórcio") || t.includes("consorcio")) return 6565;

  // Segurança corporativa
  if (t.includes("assalto") || t.includes("roubo na agência") || t.includes("porta giratória") ||
      t.includes("porta giratoria")) return 4859;

  // Seguro não reconhecido
  if ((t.includes("seguro de vida") || t.includes("seguro vida") || t.includes("previdência") || t.includes("previdencia")) &&
      (t.includes("não reconhec") || t.includes("nao reconhec") || t.includes("não autorizado") || t.includes("nao autorizado") || t.includes("não contratei") || t.includes("nao contratei"))) return 5310;

  if ((t.includes("seguro residencial") || t.includes("seguro auto") || t.includes("seguro veículo") || t.includes("seguro veiculo") || t.includes("seguro do carro")) &&
      (t.includes("não reconhec") || t.includes("nao reconhec") || t.includes("não autorizado") || t.includes("nao autorizado"))) return 5800;

  if ((t.includes("capitalização") || t.includes("capitalizacao") || t.includes("título de capitalização") || t.includes("titulo de capitalizacao")) &&
      (t.includes("não reconhec") || t.includes("nao reconhec") || t.includes("não autorizado") || t.includes("nao autorizado"))) return 5850;

  if ((t.includes("seguro médico") || t.includes("seguro medico") || t.includes("seguro saúde") || t.includes("seguro saude") || t.includes("plano de saúde") || t.includes("plano de saude")) &&
      (t.includes("não reconhec") || t.includes("nao reconhec") || t.includes("não autorizado") || t.includes("nao autorizado"))) return 7630;

  // Leasing Bradesco
  if (t.includes("leasing bradesco") || t.includes("25215")) return 25215;

  // Imóvel / Leasing
  if (t.includes("imóvel") || t.includes("imovel") || t.includes("financiamento imobiliário") ||
      t.includes("financiamento imobiliario") || t.includes("cédula hipotecária") || t.includes("leilão do imóvel")) return 4230;

  // Financiamento de veículo BF
  if ((t.includes("financiamento de veículo") || t.includes("financiamento de veiculo") ||
       t.includes("bradesco financiamentos") || t.includes("bf ") || t.includes("gravame")) &&
      !t.includes("empréstimo pessoal")) return 8041;

  // Câmbio
  if (t.includes("câmbio") || t.includes("cambio") || t.includes("dólar") || t.includes("euro") ||
      t.includes("remessa internacional")) return 4900;

  // Bradesco Expresso
  if (t.includes("bradesco expresso") || t.includes("correspondente bancário") ||
      t.includes("correspondente bancario")) return 4920;

  // Aplicativo / Token / Internet Banking com fraude
  if ((t.includes("aplicativo") || t.includes("app") || t.includes("token") || t.includes("internet banking")) &&
      (t.includes("fraude") || t.includes("golpe") || t.includes("não reconhec") || t.includes("nao reconhec")) &&
      !t.includes("pix") && !t.includes("empréstimo") && !t.includes("emprestimo")) return 8706;

  // Cheque / FGTS
  if (t.includes("cheque") || t.includes("fgts") || t.includes("talão") || t.includes("talao")) return 4510;

  // BDN / Caixa 24h
  if ((t.includes("caixa eletrônico") || t.includes("caixa eletronico") || t.includes("caixa 24") ||
       t.includes("bdn") || t.includes("saque em caixa")) &&
      !t.includes("pix") && !t.includes("empréstimo") && !t.includes("emprestimo")) return 4312;

  // Atendimento em agência (problemas presenciais)
  if ((t.includes("agência") || t.includes("agencia")) &&
      (t.includes("funcionário") || t.includes("funcionario") || t.includes("gerente") ||
       t.includes("tempo de espera") || t.includes("fila") || t.includes("discriminação") ||
       t.includes("discriminacao") || t.includes("desavença") || t.includes("desavenca")) &&
      !t.includes("pix") && !t.includes("empréstimo") && !t.includes("emprestimo") &&
      !t.includes("cartão") && !t.includes("cartao")) return 4160;

  // Atendimento telefônico
  if (t.includes("atendimento telefônico") || t.includes("atendimento telefonico") ||
      (t.includes("ligação") && t.includes("central") && !t.includes("fraude"))) return 4229;

  // Negativação / dívida cedida
  if ((t.includes("empresa de cobranç") || t.includes("empresa de cobranca") ||
       t.includes("recuperação de crédito") || t.includes("recuperacao de credito") ||
       t.includes("dívida cedida") || t.includes("divida cedida") ||
       t.includes("cessão de crédito") || t.includes("cessao de credito") ||
       t.includes("credor originário") || t.includes("credor originario") ||
       t.includes("dívida prescrita") || t.includes("divida prescrita"))) return 4120;

  // Cartão de crédito/débito Bradesco
  if ((t.includes("cartão de crédito") || t.includes("cartao de credito") ||
       t.includes("cartão de débito") || t.includes("cartao de debito") ||
       t.includes("59.438.325") || t.includes("fatura") || t.includes("anuidade")) &&
      !t.includes("consignado") && !t.includes("4025")) return 8627;

  // Empréstimos / financiamentos / cheque especial
  if (t.includes("empréstimo") || t.includes("emprestimo") ||
      t.includes("financiamento") || t.includes("cheque especial") ||
      t.includes("ccb") || t.includes("cédula de crédito") || t.includes("cedula de credito") ||
      t.includes("consignado")) return 4840;

  // PIX / Conta corrente
  if (t.includes("pix") || t.includes("transferência") || t.includes("transferencia") ||
      t.includes("conta corrente") || t.includes("saldo") || t.includes("movimentação") ||
      t.includes("movimentacao")) return 4008;

  // Poupança / Investimentos
  if (t.includes("poupança") || t.includes("poupanca") || t.includes("cdb") ||
      t.includes("lci") || t.includes("aplicação financeira") || t.includes("aplicacao financeira")) return 4225;

  return 4040; // Genérico
}

// ============================================================
// DETECÇÃO DO SUBTIPO
// ============================================================
function detectarSubtipo(texto, gestor, codTipo) {
  const t = texto.toLowerCase();
  const chave = `${gestor}_${codTipo > 8900 ? 90 : codTipo}`;
  const lista = SUBTIPOS[chave] || SUBTIPOS[`${gestor}_90`] || [];

  for (const sub of lista) {
    for (const palavra of sub.palavras) {
      if (t.includes(palavra.toLowerCase())) {
        return sub;
      }
    }
  }

  // Fallbacks por gestor
  const fallbacks = {
    4008: { cod: 296, nome: "PIX-GOLPE/ESTELIONATO/FRAUDE" },
    4840: { cod: 79, nome: "FINAN-CONTRATO NAO RECONHECIDO" },
    8627: { cod: 208, nome: "CART CRED-COMPRA NAO AUTORIZADA" },
    4312: { cod: 267, nome: "BDN-SAQUE ERRO NA LIBERACAO DAS NOTAS" },
    4120: { cod: 242, nome: "EMPREST-COBR CONTR EM DISCUSSAO JUDICIAL" },
    4160: { cod: 53, nome: "ATENDIMENTO-DEMORA OU AUSENCIA RESPOSTA" },
    4859: { cod: 285, nome: "SEGURANCA-ASSALTO AGENCIA" },
    5310: { cod: 122, nome: "CONTRATO-RESCISAO CONTRATO PREST SERVICO" },
    5800: { cod: 122, nome: "CONTRATO-RESCISAO CONTRATO PREST SERVICO" },
    6565: { cod: 186, nome: "CONSORCIO-CONTRATO NAO RECONHECIDO" },
    5404: { cod: 221, nome: "PRIVATE LABEL-CONTRATO NAO RECONHECIDO" },
    8041: { cod: 79, nome: "FINAN-CONTRATO NAO RECONHECIDO" },
    8706: { cod: 165, nome: "CONTA-TRANSF/PAGTO N RECONHEC VIA INTERNET BANKING" },
    5203: { cod: 159, nome: "EMP CONSIG-CONTRATO NAO RECONHECIDO" },
    4040: { cod: 2, nome: "CADASTRO IRREGULAR" }
  };

  return fallbacks[gestor] || { cod: 0, nome: "VERIFICAR MANUALMENTE" };
}

// ============================================================
// DETECÇÃO DA AGÊNCIA
// ============================================================
function detectarAgencia(texto, gestor) {
  const semAgencia = [8041, 7528, 5404, 4027, 4026, 9080, 5203, 4229];
  if (semAgencia.includes(gestor)) return "0";

  // Cartão crédito 8627 não tem agência (exceto emissão não solicitada)
  if (gestor === 8627) {
    const t = texto.toLowerCase();
    if (!t.includes("emissão não solicitada") && !t.includes("emissao nao solicitada")) return "0";
  }

  const padroes = [
    /agência\s*[nº°#]?\s*(\d{3,5})/gi,
    /agencia\s*[nº°#]?\s*(\d{3,5})/gi,
    /ag\.?\s*[nº°#]?\s*(\d{3,5})/gi,
    /\bag\s*[:\-]?\s*(\d{3,5})\b/gi,
    /agência\s+(\d{3,5})/gi,
    /agencia\s+(\d{3,5})/gi
  ];

  for (const padrao of padroes) {
    const matches = [...texto.matchAll(padrao)];
    if (matches.length > 0) {
      return matches[0][1];
    }
  }

  return "0";
}

// ============================================================
// DETECÇÃO DA DATA DE INÍCIO DOS DESCONTOS
// ============================================================
function detectarData(texto) {
  const padroes = [
    /(?:desde|a partir de|em|contratado em|iniciou em|data de|início em)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/gi,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g,
    /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/gi,
    /([A-Za-zÀ-ú]+\s+de\s+\d{4})/g
  ];

  for (const padrao of padroes) {
    const matches = [...texto.matchAll(padrao)];
    if (matches.length > 0) {
      return matches[0][1].trim();
    }
  }

  return null;
}

// ============================================================
// DETECÇÃO DE RÉUS ADICIONAIS
// ============================================================
function detectarReus(texto) {
  const t = texto.toLowerCase();
  const reus = [];

  const empresas = [
    { nome: "PicPay Serviços S.A.", cnpj: "22.896.431/0001-10", palavras: ["picpay"] },
    { nome: "Nu Pagamentos S.A. (Nubank)", cnpj: "18.236.120/0001-58", palavras: ["nubank", "nu pagamentos"] },
    { nome: "Mercado Pago", cnpj: "10.573.521/0001-91", palavras: ["mercado pago"] },
    { nome: "Inter S.A.", cnpj: "00.416.968/0001-01", palavras: ["banco inter", "inter bank"] },
    { nome: "Odontoprev S.A.", cnpj: "58.119.199/0001-51", palavras: ["odontoprev"], gestor: 8329 },
    { nome: "Banco Bradescard S.A.", cnpj: "04.184.779/0001-01", palavras: ["bradescard", "04.184.779"], gestor: 5404 },
    { nome: "Banco Bradesco Cartões S.A.", cnpj: "59.438.325/0001-01", palavras: ["59.438.325"] },
    { nome: "Losango Promotora de Vendas Ltda.", cnpj: "05.351.358/0001-07", palavras: ["losango"], gestor: 9080 },
    { nome: "Bradesco Expresso", cnpj: "", palavras: ["bradesco expresso", "correspondente bancário"], gestor: 4920 },
    { nome: "Ativos S.A. Securitizadora de Créditos Financeiros", cnpj: "05.913.991/0001-00", palavras: ["ativos s.a", "ativos sa"] },
    { nome: "Recovery do Brasil Cessão de Créditos S.A.", cnpj: "03.046.391/0001-09", palavras: ["recovery"] },
    { nome: "Digio S.A.", cnpj: "27.098.060/0001-45", palavras: ["digio"], gestor: 5203 }
  ];

  for (const empresa of empresas) {
    for (const palavra of empresa.palavras) {
      if (t.includes(palavra)) {
        reus.push(empresa);
        break;
      }
    }
  }

  return reus;
}

// ============================================================
// DETECÇÃO DE AUTORES ADICIONAIS
// ============================================================
function detectarAutores(texto) {
  const t = texto.toLowerCase();
  const padroes = [
    /autores?[:\s]+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)+)/g,
    /(?:o autor e a autora|os autores)[:\s]+([^,\.]+)/gi
  ];

  const autores = [];
  for (const padrao of padroes) {
    const matches = [...texto.matchAll(padrao)];
    for (const m of matches) {
      autores.push(m[1].trim());
    }
  }

  return autores.length > 1 ? autores : [];
}

// ============================================================
// DETECÇÃO DE NÍVEL DE CONFIANÇA
// ============================================================
function avaliarConfianca(texto, gestor, subtipo) {
  let pontos = 0;
  const t = texto.toLowerCase();

  // Gestor bem definido
  if (gestor !== 4040) pontos += 2;

  // Subtipo identificado com palavra-chave (não fallback)
  if (subtipo && subtipo.cod !== 0) pontos += 1;

  // Agência identificada
  if (detectarAgencia(texto, gestor) !== "0") pontos += 1;

  // Data identificada
  if (detectarData(texto)) pontos += 1;

  // Cabeçalho identificável
  if (t.includes("juizado") || t.includes("vara cível") || t.includes("vara civel") ||
      t.includes("comarca") || t.includes("foro")) pontos += 1;

  if (pontos >= 5) return { nivel: "Alto", obs: "" };
  if (pontos >= 3) return { nivel: "Médio", obs: "Alguns campos foram inferidos por padrão. Recomenda-se revisão do subtipo e agência." };
  return { nivel: "Baixo", obs: "Texto com poucas informações identificáveis. Revise todos os campos antes de cadastrar." };
}

// ============================================================
// FUNÇÃO PRINCIPAL DE CLASSIFICAÇÃO
// ============================================================
function classificar(texto) {
  if (!texto || texto.trim().length < 50) {
    return {
      erro: true,
      mensagem: "Texto muito curto. Cole o texto completo da petição inicial."
    };
  }

  // Triagem inicial
  const tri = triagem(texto);
  if (tri && tri.triagem) {
    return {
      gestor: tri.gestor,
      gestorNome: tri.gestor ? GESTORES[tri.gestor] : "Ver observação",
      agencia: "0",
      codTipo: tri.codTipo,
      codTipoNome: COD_TIPOS[tri.codTipo] || "",
      codSubtipo: tri.codSubtipo,
      codSubtipoNome: tri.nome,
      dataInicio: detectarData(texto) || "Não identificada na petição",
      reus: detectarReus(texto),
      autores: detectarAutores(texto),
      confianca: { nivel: "Médio", obs: "Caso identificado pela triagem inicial. Confirme os dados antes de cadastrar." },
      justificativa: `Caso enquadrado na triagem inicial: ${tri.nome}.`,
      obs: tri.nome
    };
  }

  // Vara
  const vara = detectarVara(texto);
  const sufixo = vara === "JEC" ? 1 : 0; // JEC = +1 no cod_tipo base

  // Gestor
  const gestor = detectarGestor(texto);

  // COD_TIPO
  let codTipo = vara === "JEC" ? 91 : 90;

  // Revisional
  const t = texto.toLowerCase();
  if ((t.includes("revisão de contrato") || t.includes("revisao de contrato") ||
       t.includes("revisional") || t.includes("taxa de juros abusiva") ||
       t.includes("juros abusivos")) && !t.includes("dano moral") && !t.includes("indenização")) {
    codTipo = vara === "JEC" ? 8921 : 8914;
  }

  // COD_SUBTIPO
  const subtipo = detectarSubtipo(texto, gestor, codTipo);

  // Agência
  const agencia = detectarAgencia(texto, gestor);

  // Data
  const dataInicio = detectarData(texto) || "Não identificada na petição";

  // Réus
  const reus = detectarReus(texto);

  // Autores
  const autores = detectarAutores(texto);

  // Confiança
  const confianca = avaliarConfianca(texto, gestor, subtipo);

  // Justificativa automática
  const justificativa = gerarJustificativa(texto, gestor, codTipo, subtipo, vara);

  return {
    gestor,
    gestorNome: GESTORES[gestor] || "Verificar",
    agencia,
    codTipo,
    codTipoNome: COD_TIPOS[codTipo] || "",
    codSubtipo: subtipo?.cod,
    codSubtipoNome: subtipo?.nome || "VERIFICAR MANUALMENTE",
    dataInicio,
    reus,
    autores,
    confianca,
    justificativa
  };
}

// ============================================================
// GERAÇÃO DE JUSTIFICATIVA
// ============================================================
function gerarJustificativa(texto, gestor, codTipo, subtipo, vara) {
  const gestorNome = GESTORES[gestor] || "desconhecido";
  const varaNome = vara === "JEC" ? "Juizado Especial Cível" : "Vara Cível";
  const subNome = subtipo?.nome || "não identificado";

  return `Gestor ${gestor} (${gestorNome}) identificado como evento gerador principal. ` +
         `Ação classificada como COD_TIPO ${codTipo} por tramitar em ${varaNome}. ` +
         `Subtipo ${subtipo?.cod || "?"} (${subNome}) aplicado com base nas palavras-chave identificadas no texto. ` +
         `Revise o resultado antes de cadastrar no Brad Captura, especialmente em casos com múltiplos produtos ou réus adicionais.`;
}

// Exporta para uso no browser e Node.js
if (typeof module !== 'undefined') module.exports = { classificar };
