# 02-node-remote-procedure-call

# Laboratório gRPC: Calculadora Remota Interativa (Soma e Subtração com Números Informados a partir do Teclado)

Este repositório contém um exemplo prático e simplificado de **Sistemas Distribuídos** utilizando **gRPC** (Remote Procedure Call) em **Node.js**. 

O gRPC é um *framework* de chamada de procedimento remoto (RPC) de código aberto criado pelo Google. Ele permite que um programa chame funções em outro computador como se fossem locais.

O objetivo deste projeto é demonstrar como um cliente pode solicitar operações matemáticas (Soma e Subtração) para serem processadas por um servidor remoto de forma transparente.

Os números são informados pelo usuário a partir do teclado.

---

## Passo 1: Configuração do Ambiente no Codespaces

1. Crie um arquivo `.gitignore` com o conteúdo abaixo:
   ```text
   node_modules/
   ```
2. Abra o terminal do seu GitHub Codespaces.
3. Inicialize o projeto Node.js executando o comando abaixo:
   ```bash
   npm init -y
   ```
4. Instale as duas dependências oficiais do gRPC:
   ```bash
   npm install @grpc/grpc-js @grpc/proto-loader
   ```
5. **IMPORTANTE:** abra o arquivo `package.json` que foi gerado e adicione a linha `"type": "module"` para permitir o uso de `import/export`. O seu arquivo deve ficar parecido com este:
   ```json
   {
     "name": "grpc-calculadora",
     "version": "1.0.0",
     "type": "module",
     "dependencies": {
       "@grpc/grpc-js": "^1.10.0",
       "@grpc/proto-loader": "^0.7.10"
     }
   }
   ```

---

## Passo 2: O Contrato de Interface (`calculadora.proto`)

Crie um arquivo chamado **`calculadora.proto`**. Este arquivo define o contrato de comunicação (mensagens e procedimentos) que tanto o cliente quanto o servidor devem respeitar.

```protobuf
// Define que estamos utilizando a versão mais recente do Protocol Buffers:
syntax = "proto3";

// Nome do pacote para evitar conflito de nomes em sistemas maiores:
package servico_calculadora;

// Estrutura de dados enviada pelo cliente (parâmetros de entrada):
message RequisicaoMatematica {
    int32 numero1 = 1; // Primeiro número inteiro (etiqueta de identificação binária 1, funciona como um ID).
    int32 numero2 = 2; // Segundo número inteiro (etiqueta de identificação binária 2, funciona como um ID).
}

// Estrutura de dados retornada pelo servidor (resultado da operação):
message RespostaMatematica {
    int32 resultado = 1; // Resultado numérico final (etiqueta de identificação binária 1, funciona como um ID).
}

// Definição do Serviço (as funções que o servidor deixará disponíveis na rede):
service ServicoCalculadora {
    // Procedimento Remoto 1: Recebe dois números e retorna a soma deles:
    rpc Somar (RequisicaoMatematica) returns (RespostaMatematica);

    // Procedimento Remoto 2: Recebe dois números e retorna a subtração deles:
    rpc Subtrair (RequisicaoMatematica) returns (RespostaMatematica);
}
```

---

## Passo 3: O Código do Servidor (`servidor.js`)

Crie um arquivo chamado **`servidor.js`**. Ele será o responsável por escutar as requisições na rede e executar os cálculos (somar e subtrair).

```javascript
// Importa a biblioteca principal do gRPC:
import grpc from '@grpc/grpc-js';
// Importa o carregador de arquivos de especificação (.proto):
import protoLoader from '@grpc/proto-loader';

// Carrega o arquivo do contrato de forma síncrona mantendo a grafia original das variáveis:
const definicaoPacote = protoLoader.loadSync('calculadora.proto', { keepCase: true });

// Extrai o objeto do serviço de dentro do pacote carregado:
const protoCalculadora = grpc.loadPackageDefinition(definicaoPacote).servico_calculadora;

// Função que implementa o procedimento remoto de Soma:
function somar(chamada, respostaCallback) {
    // Extrai os dois números enviados na requisição do cliente:
    const { numero1, numero2 } = chamada.request;
    
    // Realiza o cálculo matemático localmente:
    const totalSoma = numero1 + numero2;
    
    // Retorna o resultado para o cliente (primeiro parâmetro null indica que não houve erro):
    respostaCallback(null, { resultado: totalSoma });
}

// Função que implementa o procedimento remoto de Subtração:
function subtrair(chamada, respostaCallback) {
    // Extrai os dois números enviados na requisição do cliente:
    const { numero1, numero2 } = chamada.request;
    
    // Realiza o cálculo matemático localmente:
    const totalSubtracao = numero1 - numero2;
    
    // Retorna o resultado para o cliente:
    respostaCallback(null, { resultado: totalSubtracao });
}

// Função principal que configura e inicializa o servidor de rede:
function iniciarServidor() {
    // Cria uma nova instância do servidor gRPC:
    const servidor = new grpc.Server();
    
    // Vincula a interface do contrato .proto às funções JavaScript criadas acima:
    servidor.addService(protoCalculadora.ServicoCalculadora.service, { 
        Somar: somar,
        Subtrair: subtrair
    });
    
    // Configura o servidor para rodar na porta 50051 sem chaves de criptografia (Inseguro para testes)
    servidor.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (erro, porta) => {
        // Se houver algum erro ao tentar reservar a porta, exibe no terminal
        if (erro) {
            console.error('Erro ao iniciar servidor:', erro);
            return;
        }
        // Exibe mensagem de sucesso no terminal indicando que o servidor está pronto
        console.log(`Servidor gRPC da Calculadora rodando com sucesso na porta ${porta}`);
    });
}

// Executa a função de inicialização
iniciarServidor();
```

---

## Passo 4: O Código para Ler Dados do Teclado

Crie um arquivo chamado `entradaTeclado.js`. Ele conterá a função de leitura (lerTeclado) e  funções de validação de inteiros e strings. Note o uso da palavra-chave `export` antes de cada função.

```javascript
// Importa o módulo nativo do Node.js para ler entradas do teclado:
import readline from 'readline';

/* 
 * Função base (privada deste arquivo) para capturar o texto bruto do console.
 * Função auxiliar para criar uma pergunta no terminal que funciona com async/await.
 */
function lerTeclado(textoDaPergunta) {
    // Configura a interface de leitura do teclado (entrada e saída padrão do terminal):
    const interfaceLeitura = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Retorna uma Promise (promessa) que será resolvida quando o usuário apertar ENTER:
    return new Promise((resolver) => {
        interfaceLeitura.question(textoDaPergunta, (resposta) => {
            interfaceLeitura.close(); // Fecha a interface para liberar o terminal.
            resolver(resposta);       // Retorna a string digitada.
        });
    });
}

// Captura um texto do terminal e garante que ele não seja vazio:
export async function lerTexto(mensagem) {
    const resposta = await lerTeclado(mensagem);
    
    // Remove espaços em branco nas pontas e valida se está vazio:
    if (!resposta.trim()) {
        console.error('Erro: o texto digitado não pode ser vazio!');
        // Se estiver inválido, chama a função novamente (recursão) até o usuário digitar certo:
        return await lerTexto(mensagem);
    }
    return resposta.trim();
}

// Captura um número do terminal e garante que ele seja um número inteiro válido:
export async function lerInteiro(mensagem) {
    const resposta = await fazerPergunta(mensagem);
    const numero = parseInt(resposta, 10);

    // Valida se a conversão falhou ou se o número possui casas decimais:
    if (isNaN(numero) || !Number.isInteger(numero)) {
        console.error('Erro: Você deve digitar um número inteiro válido!');
        // Se estiver inválido, pede para digitar novamente:
        return await lerInteiro(mensagem);
    }
    return numero;
}
```

---

## Passo 5: O Código do Cliente (`cliente.js`)

Crie um arquivo chamado **`cliente.js`**. Ele fará as chamadas de rede para o servidor remoto.

```javascript
// Importa a biblioteca principal do gRPC:
import grpc from '@grpc/grpc-js';
// Importa o carregador de arquivos de especificação (.proto):
import protoLoader from '@grpc/proto-loader';

// Importa as funções do arquivo utilitário para leitura a partir do teclado. 
// No Node.js com ES Modules, a extensão ".js" no caminho é obrigatória!
import { lerInteiro } from './entradaTeclado.js';

// Carrega o arquivo do contrato de forma síncrona mantendo a grafia original das variáveis:
const definicaoPacote = protoLoader.loadSync('calculadora.proto', { keepCase: true });

// Extrai o objeto do serviço de dentro do pacote carregado:
const protoCalculadora = grpc.loadPackageDefinition(definicaoPacote).servico_calculadora;

// Função principal do cliente:
async function iniciarCliente() {
    // Instancia o Stub do cliente informando o endereço do servidor (localhost na porta 50051):
    const cliente = new protoCalculadora.ServicoCalculadora('localhost:50051', grpc.credentials.createInsecure());

    // Captura e valida o primeiro número:
    const numero1 = await lerInteiro('Digite o primeiro número inteiro (X): ');

    // Captura e valida o segundo número:
    const numero2 = await lerInteiro('Digite o segundo número inteiro (Y): ');

    console.log(`Conectado ao servidor. Enviando números: X = ${dadosParaCalcular.numero1}, Y = ${dadosParaCalcular.numero2}`);

    // Executa a Chamada de Procedimento Remoto (RPC) para a operação de SOMAR:
    cliente.Somar(dadosParaCalcular, (erroSoma, respostaSoma) => {
        // Se houver falha de rede ou erro no servidor, exibe a falha e interrompe:
        if (erroSoma) {
            console.error('Falha na operação de Soma:', erroSoma);
            return;
        }
        // Exibe o resultado devolvido pelo servidor:
        console.log(`[SERVIDOR] Resultado da Soma: ${respostaSoma.resultado}`);

        // Executa a Chamada de Procedimento Remoto (RPC) para a operação de SUBTRAIR:
        cliente.Subtrair(dadosParaCalcular, (erroSubtracao, respostaSubtracao) => {
            // Se houver erro na segunda chamada, exibe a falha e interrompe:
            if (erroSubtracao) {
                console.error('Falha na operação de Subtração:', erroSubtracao);
                return;
            }
            // Exibe o resultado devolvido pelo servidor:
            console.log(`[SERVIDOR] Resultado da Subtração: ${respostaSubtracao.resultado}`);
        });
    });
}

// Executa o fluxo do cliente:
iniciarCliente();
```

---

## Passo 6: Como Executar o Projeto

1. No terminal do Codespaces, inicialize o código do servidor:
   ```bash
   node servidor.js
   ```
2. O terminal exibirá a mensagem indicando que o servidor está rodando.
3. Abra uma **nova aba de terminal** no seu Codespaces (clicando no botão `+` do terminal).
4. Nessa nova aba, execute o cliente:
   ```bash
   node cliente.js
   ```

**Resultado esperado no terminal do cliente:**
```text
Conectando ao servidor. Enviando números: X = 20, Y = 8
[SERVIDOR] Resultado da Soma: 28
[SERVIDOR] Resultado da Subtração: 12
```

---

## Exercício

1. Altere o exemplo desta prática acrescentando as operações de multiplicação e subtração.

2. Usando gRPC, crie um serviço chamado `VerificadorTexto` capaz de validar se uma palavra é um **Palíndromo** (uma palavra que se lê da mesma forma de trás para frente, como "radar" ou "arara").
   * **Contrato (`.proto`):** defina uma mensagem de requisição que receba uma `string` (o texto a ser verificado) e uma resposta que retorne um campo `bool` (verdadeiro ou falso).
   * **Servidor:** implemente a lógica em JavaScript que remove espaços, ignora letras maiúsculas/minúsculas e verifica se a string é idêntica ao seu reverso.
   * **Cliente:** deve enviar uma palavra para o servidor e exibir uma mensagem amigável dizendo se ela é ou não um palíndromo com base na resposta do procedimento remoto executado no servidor.

3. Usando gRPC, crie um simulador simplificado de **Sistema de Autenticação (Login)**.
   * **Contrato (`.proto`):** crie uma mensagem de requisição chamada `DadosLogin` contendo dois campos de texto: `usuario` e `senha`. A mensagem de resposta deve conter um campo `bool` chamado `sucesso` e um campo `string` chamado `mensagem`.
   * **Servidor:** armazene uma constante com um usuário e senha padrão (ex: `admin` e `senha123`). O servidor deve comparar os dados recebidos. Se estiverem corretos, retorna `sucesso = true` e `mensagem = "Acesso concedido!"`. Se estiverem incorretos, retorna `false` e uma mensagem de erro.
   * **Cliente:** deve enviar um usuário e senha ao servidor e exibir o texto de boas-vindas ou de erro retornado pelo procedimento remoto.