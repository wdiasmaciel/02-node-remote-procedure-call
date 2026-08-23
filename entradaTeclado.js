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