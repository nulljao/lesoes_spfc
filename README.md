# Catálogo de lesões do São Paulo FC.

## O projeto

Esse site foi construído devido a sucessivas lesões que o São Paulo Futebol Clube tem enfrentado nos últimos anos, impactando significativamente o desempenho da equipe em competições nacionais e internacionais.

O intuito é justamente denunciar e pressionar por melhorias no departamento médico do clube, buscando garantir melhores condições de tratamento e prevenção para os atletas.

A fonte dos dados é do site <a href="https://www.transfermarkt.com.br/" target="_blank">Transfermarkt</a>, porém, com dados obtidos do elenco do clube no momento em que foi construído (novembro, 2025), eventuais jogadores que fizeram parte do elenco em 2025 e já haviam saído do clube não foram considerados.

Se a contagem de jogos estiver desatualizada (dos jogadores atualmente lesionados), é porque a alteração é manual então a cada jogo novo ausente preciso incrementar a quantidade e talevz eu esqueça de fazer isso após o novo jogo, ou simplesmente você foi mais rápido e acessou a página antes da atualização =P 
            
## Contribuição

Caso queira contribuir com o projeto, você pode fazer de duas formas.

### Issue
Vá em [Issues](https://github.com/nulljao/lesoes_spfc/issues), depois em New Issue, selecione lesão e preencha os dados solicitados e o título com o nome do jogador + data da lesão.

### Fork + pull request

Essa opção é para quem tem familiaridade com git, é um processo mais trabalhoso para leigos.

Crie um fork do projeto, edite o arquivo .csv seguindo o modelo dos demais registros e a ordem das colunas: 
- jogador
- dataLesao
- dataRetorno
- jogosAusentes
- tipo

OBS.: Insira sempre a lesão mais recente no topo.

Após isso, faça push para seu fork e abra uma solicitação de **pull request** do seu fork para o nosso.