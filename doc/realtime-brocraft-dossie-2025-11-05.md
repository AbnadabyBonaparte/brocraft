Dossiê do Realtime “brocraft” — Estado Atual, Histórico de Ações e Plano de Restauração
Última atualização: [preencha a data]

Resumo executivo
O canal Realtime do projeto “brocraft” está atualmente pausado para clientes comuns (anon e authenticated), impedindo que recebam ou enviem mensagens via realtime.messages.
Não há atividade recente registrada na tabela realtime.messages nas últimas horas de análise.
O comportamento observado é consistente com a pausa proposital via RLS.
Para restaurar o ambiente de produção como estava antes, basta reativar as políticas corretas e remover as políticas “pause_” (ou desabilitá-las), além de validar os índices e o fluxo de assinatura dos clientes._
Contexto e objetivo
O objetivo desta intervenção foi pausar completamente o tráfego Realtime para usuários comuns no projeto “brocraft”, garantindo que:

Nenhuma leitura de mensagens do Realtime fosse possível por anon/authenticated.
Nenhuma escrita (envio) de mensagens fosse possível por anon/authenticated.
Apenas processos com service_role pudessem operar, caso necessário, para tarefas administrativas.
Ações executadas
1) Pausa do Realtime via RLS
Foram ativadas duas políticas em realtime.messages:

pause_all_realtime_reads — SELECT bloqueado para {anon, authenticated}
pause_all_realtime_writes — INSERT bloqueado para {anon, authenticated}
Efeito: clientes comuns não recebem nem enviam mensagens via Realtime. O service_role permanece com acesso irrestrito (bypassa RLS).

2) Validação das políticas
Consulta utilizada:

Listagem de políticas em realtime.messages para confirmar escopo e comandos afetados.
Resultado:

Políticas confirmadas ativas e aplicadas para anon e authenticated.
3) Auditoria de atividade
Consultas utilizadas:

Contagem de mudanças na última hora, usando a coluna updated_at.
Amostra de tópicos/eventos recentes (limitada a 50), ordenada por updated_at.
Ajustes importantes:

A tabela realtime.messages é particionada, portanto testes de INSERT “crus” geram “no partition of relation” se o payload não corresponde à partição.
A tabela não possui created_at no ambiente atual; usamos updated_at.
Resultado:

changes_60m: 0
Amostras recentes: 0
Tentativas de SELECT sob role anon foram bloqueadas (coerente com RLS ativo).
Estado atual do Realtime
Leitura (SELECT) por anon/authenticated: bloqueada
Escrita (INSERT) por anon/authenticated: bloqueada
Atividade recente: inexistente (0 mudanças na janela analisada)
Conexões previamente abertas podem aparentar “suscrito” nos clientes, mas não recebem eventos novos
Como restaurar para produção (voltar “como estava”)
Escolha UMA das opções, conforme sua estratégia de segurança:

Opção A — Reativar acesso com políticas específicas (recomendado)
Objetivo: reabrir o Realtime apenas para usuários autorizados, mantendo segurança e isolamento por tópico/organização/sala.
Passos:

Remover ou desativar as políticas “pause_all_realtime_reads” e “pause_all_realtime_writes”.
Criar políticas RLS específicas no realtime.messages para:
SELECT: permitir apenas membros de um escopo (ex.: sala/room, organização) receberem broadcasts do respectivo tópico.
INSERT: permitir que o mesmo grupo autorizado envie mensagens ao tópico correspondente.
Garantir que os índices necessários existam para acelerar as condições de RLS (ex.: índices em tabelas de relacionamento user ↔ room/tenant).
Habilitar private: true nos canais do cliente (recomendado) e configurar Realtime para “private-only” em produção.
Exemplo de políticas (ajuste nomes das tabelas/colunas conforme seu modelo):

SELECT: room_members pode ler mensagens do tópico room:<room_id>:messages
INSERT: room_members pode enviar mensagens ao mesmo tópico
Índice: idx_room_members_user_room em room_members(user_id, room_id)
Após aplicar:

Force reconexão dos clientes (renovar JWT e refazer subscribe).
Verifique logs e comportamento.
Opção B — Reativar acesso amplo (rápida, menos segura)
Objetivo: restaurar comportamento aberto rapidamente, aceitando risco maior.
Passos:

Remover/desativar as políticas “pause_*”.
Criar políticas amplas “permitir todos autenticados” para SELECT/INSERT em realtime.messages.*_
Observação: Não recomendado para produção, apenas se for crítico restaurar imediatamente e refinar depois.

Checklist de restauração
Remover políticas de pausa:
pause_all_realtime_reads (SELECT)
pause_all_realtime_writes (INSERT)
Criar políticas específicas de SELECT/INSERT alinhadas ao seu modelo (room/tenant/user).
Validar índices das tabelas usadas nas condições de RLS (ex.: room_members).
Confirmar que os clientes usam canais private: true e que a configuração de Realtime em produção favorece private-only.
Forçar reconexão dos clientes (logout/login, recarregar app) para atualizar o token e refazer o subscribe.
Verificar se não há Edge Functions, crons ou jobs emitindo mensagens com service_role inadvertidamente.
Observações técnicas e armadilhas
Tabela particionada: realtime.messages é particionada; INSERT direto de teste pode falhar sem conluir a regra de partição (mensagem “no partition of relation”). Use triggers e fluxo normal de broadcast, ou insira com o payload/partição corretos.
Colunas de auditoria: em alguns ambientes, created_at não existe; use updated_at.
RLS do service_role: service_role ignora RLS. Verifique quem usa essa chave no backend.
Cache do cliente: depois de mudar políticas, clientes podem exibir “subscribed”, mas não receber eventos. Uma reconexão limpa o estado.
Plano de validação pós-restauração
Testes de leitura:
Usuário autenticado membro de room X recebe eventos em room:X:messages.
Usuário não membro NÃO recebe.
Testes de escrita:
Usuário autenticado membro de room X consegue enviar.
Usuário não membro NÃO consegue enviar.
Auditoria:
Monitorar updated_at em realtime.messages e amostrar tópicos/eventos por 60 minutos.
Performance:
Confirmar presença de índices mencionados nas cláusulas RLS.
Medir latência de subscribe e entrega de eventos.
Como manter “pausa total” quando necessário
Reaplicar as duas políticas “pause_*” em SELECT/INSERT para anon/authenticated.
Opcional: reiniciar o serviço Realtime para encerrar conexões antigas imediatamente.
Manter um runbook com os comandos/DDL correspondentes e janelas de auditoria.*_
Próximos passos sugeridos
Confirmar o modelo de autorização (por room, por organização, por tenant).
Criar/ajustar as políticas RLS específicas com base nesse modelo.
Documentar os nomes de tópicos e convenções (ex.: room::messages), seguindo o padrão scope:entity:id.
Habilitar private-only nos canais de produção e exigir private: true nos clientes.
Anexos de referência (SQL ilustrativo – ajuste ao seu schema)
Atenção: estes blocos são exemplos ilustrativos para documentação. Adapte nomes de tabelas/colunas e execute-os apenas após revisão.

Exemplo de políticas por room:

SQL Query



-- SELECT: membros podem ler broadcasts do room
CREATE POLICY "room_members_can_read" ON realtime.messages
FOR SELECT TO authenticated
USING (
  topic LIKE 'room:%:messages' AND
  EXISTS (
    SELECT 1 FROM room_members
    WHERE user_id = auth.uid()
      AND room_id = (split_part(topic, ':', 2))::uuid
  )
);

-- INSERT: membros podem enviar broadcasts para o room
CREATE POLICY "room_members_can_write" ON realtime.messages
FOR INSERT TO authenticated
WITH CHECK (
  topic LIKE 'room:%:messages' AND
  EXISTS (
    SELECT 1 FROM room_members
    WHERE user_id = auth.uid()
      AND room_id = (split_part(topic, ':', 2))::uuid
  )
);

-- Índice auxiliar
CREATE INDEX IF NOT EXISTS idx_room_members_user_room ON room_members(user_id, room_id);

Exemplo de auditoria leve:

SQL Query



-- Mudanças na última hora
SELECT count(*) AS changes_60m
FROM realtime.messages
WHERE updated_at > now() - interval '60 minutes';

-- Amostras recentes
SELECT topic, event, updated_at
FROM realtime.messages
WHERE updated_at > now() - interval '60 minutes'
ORDER BY updated_at DESC
LIMIT 50;

Contato e governança
Proprietário do projeto: [preencher]
Responsável técnico: [preencher]
Processo de mudança: PR + revisão + migração com janelas de manutenção quando alterar RLS
Observabilidade: revisar periodicamente logs de Realtime e auditorias SQL
