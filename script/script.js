// ========================================
// GERENCIADOR DE CONTATOS - CRUD COMPLETO
// ========================================

// Classe principal que gerencia todas as operações de contatos
class GerenciadorContatos {
    constructor() {
        // Carrega contatos salvos no localStorage ou inicia com array vazio
        this.contatos = JSON.parse(localStorage.getItem('contatos')) || [];
        // Variável para controlar qual contato está sendo editado
        this.contatoEditando = null;
        // Inicializa o sistema
        this.inicializar();
    }

    // Método que inicializa o sistema
    inicializar() {
        this.carregarContatos(); // Carrega contatos na tabela
        this.configurarEventos(); // Configura os eventos do formulário
    }

    // Configura os eventos de interação do usuário
    configurarEventos() {
        const form = document.getElementById('form-contatos');
        // Adiciona evento de submit no formulário
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Previne o comportamento padrão do formulário
            this.salvarContato(); // Chama método para salvar contato
        });
    }

    // Método para salvar um novo contato ou atualizar existente
    salvarContato() {
        // Obtém os valores dos campos do formulário e remove espaços em branco
        const nome = document.getElementById('nome').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const telefone = document.getElementById('telefone').value.trim();

        // Valida se todos os campos estão preenchidos
        if (!nome || !cpf || !telefone) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        // Verifica se está editando um contato existente
        if (this.contatoEditando) {
            // Atualiza os dados do contato que está sendo editado
            this.contatoEditando.nome = nome;
            this.contatoEditando.cpf = cpf;
            this.contatoEditando.telefone = telefone;
            this.contatoEditando = null; // Limpa a referência de edição
        } else {
            // Cria um novo contato com ID único baseado no timestamp
            const novoContato = {
                id: Date.now(), // ID único baseado na data/hora atual
                nome: nome,
                cpf: cpf,
                telefone: telefone,
                dataCadastro: new Date().toLocaleDateString('pt-BR') // Data formatada em português
            };
            // Adiciona o novo contato ao array
            this.contatos.push(novoContato);
        }

        // Salva no localStorage e atualiza a interface
        this.salvarNoLocalStorage();
        this.carregarContatos();
        this.limparFormulario();
        this.alterarModoFormulario('adicionar');
    }

    // Método para editar um contato existente
    editarContato(id) {
        // Encontra o contato pelo ID
        const contato = this.contatos.find(c => c.id === id);
        if (contato) {
            // Define o contato como sendo editado
            this.contatoEditando = contato;
            // Preenche o formulário com os dados do contato
            document.getElementById('nome').value = contato.nome;
            document.getElementById('cpf').value = contato.cpf;
            document.getElementById('telefone').value = contato.telefone;
            // Muda o formulário para modo de edição
            this.alterarModoFormulario('editar');
        }
    }

    // Método para excluir um contato
    excluirContato(id) {
        // Pede confirmação antes de excluir
        if (confirm('Tem certeza que deseja excluir este contato?')) {
            // Remove o contato do array usando filter
            this.contatos = this.contatos.filter(c => c.id !== id);
            // Salva no localStorage e atualiza a interface
            this.salvarNoLocalStorage();
            this.carregarContatos();
        }
    }

    // Método para cancelar a edição de um contato
    cancelarEdicao() {
        this.contatoEditando = null; // Remove referência de edição
        this.limparFormulario(); // Limpa o formulário
        this.alterarModoFormulario('adicionar'); // Volta para modo de adicionar
    }

    // Método para limpar todos os campos do formulário
    limparFormulario() {
        document.getElementById('form-contatos').reset();
    }

    // Método para alterar a aparência do formulário baseado no modo (adicionar/editar)
    alterarModoFormulario(modo) {
        const btnSalvar = document.getElementById('btn-salvar');
        const btnCancelar = document.getElementById('btn-cancelar');

        if (modo === 'editar') {
            // Modo de edição: muda texto do botão e mostra botão cancelar
            btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
            btnCancelar.style.display = 'inline-block';
        } else {
            // Modo de adicionar: volta ao texto original e esconde botão cancelar
            btnSalvar.innerHTML = '<i class="fas fa-plus"></i> Adicionar contato';
            btnCancelar.style.display = 'none';
        }
    }

    // Método para carregar e exibir todos os contatos na tabela
    carregarContatos() {
        const tbody = document.getElementById('tabela-corpo');
        tbody.innerHTML = ''; // Limpa a tabela

        // Para cada contato, cria uma nova linha na tabela
        this.contatos.forEach(contato => {
            const tr = document.createElement('tr'); // Cria elemento de linha
            // Define o HTML da linha com os dados do contato
            tr.innerHTML = `
                <td>${contato.nome}</td>
                <td>${this.formatarCPF(contato.cpf)}</td>
                <td>${this.formatarTelefone(contato.telefone)}</td>
                <td>${contato.dataCadastro}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="gerenciador.editarContato(${contato.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="gerenciador.excluirContato(${contato.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr); // Adiciona a linha à tabela
        });
    }

    // Método para formatar CPF com pontos e traço (000.000.000-00)
    formatarCPF(cpf) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Método para formatar telefone com parênteses e traços ((00) 0.0000-0000)
    formatarTelefone(telefone) {
        return telefone.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2.$3-$4');
    }

    // Método para salvar contatos no localStorage do navegador
    salvarNoLocalStorage() {
        localStorage.setItem('contatos', JSON.stringify(this.contatos));
    }

    // Método para exportar contatos para arquivo JSON
    exportarContatos() {
        // Converte array de contatos para string JSON formatada
        const dataStr = JSON.stringify(this.contatos, null, 2);
        // Cria um blob (arquivo virtual) com os dados
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        // Cria URL temporária para o blob
        const url = URL.createObjectURL(dataBlob);
        // Cria link invisível para download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'contatos.json'; // Nome do arquivo
        link.click(); // Simula clique para iniciar download
        URL.revokeObjectURL(url); // Libera memória
    }

    // Método para importar contatos de arquivo JSON
    importarContatos(file) {
        const reader = new FileReader(); // Objeto para ler arquivos
        reader.onload = (e) => {
            try {
                // Tenta converter o conteúdo do arquivo para objeto JavaScript
                const contatosImportados = JSON.parse(e.target.result);
                this.contatos = contatosImportados; // Substitui contatos atuais
                this.salvarNoLocalStorage(); // Salva no localStorage
                this.carregarContatos(); // Atualiza a tabela
                alert('Contatos importados com sucesso!');
            } catch (error) {
                // Se houver erro na conversão, mostra mensagem
                alert('Erro ao importar arquivo. Verifique se é um arquivo JSON válido.');
            }
        };
        reader.readAsText(file); // Lê o arquivo como texto
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Função para aplicar máscaras nos campos de input
function aplicarMascaras() {
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');

    // Máscara para CPF: permite apenas números, máximo 11 dígitos
    cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
        e.target.value = value;
    });

    // Máscara para telefone: permite apenas números, máximo 11 dígitos
    telefoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
        e.target.value = value;
    });
}

// ========================================
// INICIALIZAÇÃO DO SISTEMA
// ========================================

// Aguarda o DOM estar completamente carregado antes de inicializar
document.addEventListener('DOMContentLoaded', () => {
    // Cria instância global do gerenciador para acesso via onclick
    window.gerenciador = new GerenciadorContatos();
    // Aplica máscaras nos campos de input
    aplicarMascaras();
});

// Mensagem de confirmação de carregamento
console.log("Sistema de Gerenciamento de Contatos carregado!");
