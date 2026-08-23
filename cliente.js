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
    
    const dadosParaCalcular = { numero1, numero2 };

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
    });
    
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
}

// Executa o fluxo do cliente:
iniciarCliente();