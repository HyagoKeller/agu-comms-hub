# Roadmap

## Curto prazo

- Migrar a persistência de `localStorage` para **Lovable Cloud (Postgres + RLS)**.
- Autenticação real via **AD** (LDAP) e **Microsoft 365** (OIDC).
- Implementar TOTP conforme RFC 6238 (biblioteca `otplib`) e QR code em canvas.
- Exportação de relatórios em CSV e PDF assinado.
- Notificações por e-mail (Lovable Email) em eventos-chave: violação MDM, termo pendente, importação concluída.

## Médio prazo

- Integração automática com o PABX institucional para conciliação de ramais em tempo real.
- Ingestão automática da bilhetagem (CDR) das operadoras.
- Integração com o **AGU Serviços (ITSM)** para abrir chamados diretamente do SGT e refletir status.
- Dashboard executivo com séries históricas de custo por região.
- API pública autenticada para consumo por outros sistemas AGU.

## Longo prazo

- Provisionamento automático de linhas móveis junto às operadoras via API.
- Aplicação mobile para gestores regionais.
- Módulo de contratos vinculado a custos (SLA, penalidades, vigências contratuais).
- Machine learning para detecção de anomalias de uso (consumo atípico, chamadas fora do horário).
