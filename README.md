# Bookstore Web

Aplicação Angular para gerenciar Livros, Autores e Gêneros, com renderização no servidor (SSR) via Node/Express. Consome uma API .NET.

## Tecnologias
- Angular 20 (Standalone Components, Signals)
- SSR Node/Express
- RxJS
- Jasmine/Karma (testes)

## Estrutura
- `src/app/features/` telas: `authors`, `genres`, `books`
- `src/app/core/services/api/` clientes HTTP para API
- `src/app/core/store/` stores reativos (Signals)
- `src/environments/` configurações (`apiUrl`)

## Configuração
- API URL: ajuste em `src/environments/environment.ts` (`apiUrl`).
- Versão de API: use `v1` ou `v1.0` conforme seu backend.

## Desenvolvimento
- Instalar dependências: `npm install`
- Executar em dev: `npm start` e acessar `http://localhost:4200`
- API .NET deve estar acessível em `https://localhost:7192`

## Build/SSR
- Build: `npm run build`
- Executar SSR: `node dist/bookstore/server/server.mjs` (porta `4000`)

## Testes
- Todos os testes: `npm test -- --watch=false`
- Somente componentes: `npm test -- --watch=false --include "src/app/features/*/*.component.spec.ts"`

## Docker
- Build e subir: `docker compose up --build`
- Acesso: `http://localhost:4000`
- Variáveis: `API_URL` pode ser definida no `docker-compose.yml`

## Rotas Principais
- `/authors` — Autores
- `/genres` — Gêneros
- `/books` — Livros
