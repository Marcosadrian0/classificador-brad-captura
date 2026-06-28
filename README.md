# Classificador Brad Captura — SBK

Sistema de classificação automática de processos jurídicos para cadastro no Brad Captura (Bradesco).

## Como funciona

A análise é feita 100% no navegador, via regras em JavaScript. Nenhum dado é enviado para servidores externos. Nenhuma API ou chave de acesso é necessária.

## Estrutura

```
classificador-brad-captura/
├── index.html        # Interface visual (layout SBK)
├── classificador.js  # Motor de classificação com todas as regras
├── vercel.json       # Configuração de deploy
└── README.md
```

## Deploy no Vercel (passo a passo)

### 1. Suba no GitHub

1. Crie um repositório no GitHub (pode ser privado)
2. Faça upload dos arquivos: `index.html`, `classificador.js`, `vercel.json`, `README.md`

### 2. Conecte ao Vercel

1. Acesse https://vercel.com e faça login com sua conta GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `classificador-brad-captura`
4. Clique em **"Deploy"** — sem nenhuma configuração adicional

O sistema ficará disponível em uma URL do tipo:
`https://classificador-brad-captura.vercel.app`

## Uso

1. Cole o texto completo da petição inicial (incluindo o cabeçalho com Vara/Juizado)
2. Clique em **Classificar processo**
3. O sistema retorna: Gestor, Agência, COD_TIPO, COD_SUBTIPO, Data de início dos descontos, Réus adicionais e Nível de confiança

## Observações

- Casos com nível de confiança **Médio** ou **Baixo** devem ser revisados manualmente
- O sistema cobre os principais gestores e subtipos do Brad Captura
- Réus adicionais conhecidos (Nubank, PicPay, Losango, Odontoprev etc.) são identificados automaticamente
- Para atualizar as regras, edite o arquivo `classificador.js`

## Manutenção

Para adicionar novos subtipos ou gestores, edite o arquivo `classificador.js`:
- `GESTORES`: tabela de gestores
- `SUBTIPOS`: regras de subtipo por gestor
- `detectarGestor()`: lógica de identificação do gestor principal
- `detectarReus()`: lista de réus adicionais conhecidos
