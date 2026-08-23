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