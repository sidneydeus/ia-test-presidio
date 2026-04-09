# IA Test Presidio

Projeto simples em Node.js para testar o fluxo de deteccao e anonimização de texto com Microsoft Presidio.

O ambiente sobe 3 servicos:

- `app`: aplicacao Node.js na porta `8080`
- `presidio-analyzer`: servico de analise na porta `3000`
- `presidio-anonymizer`: servico de anonimização na porta `3001`

## Como rodar

Suba tudo com Docker Compose:

```bash
docker compose up --build
```

Se quiser rodar em background:

```bash
docker compose up -d --build
```

## Como testar no navegador

Abra:

```text
http://localhost:8080/
```

Essa pagina mostra um formulario onde voce pode informar o texto e testar a anonimização.

## Exemplo de uso passando o texto como parametro

Voce tambem pode testar direto pela URL, passando o texto no parametro `text`:

```text
http://localhost:8080/test?text=My%20name%20is%20John%20Doe%20and%20my%20phone%20is%20999-999
```

Resposta esperada:

```json
{
  "original": "My name is John Doe and my phone is 999-999",
  "analyzerResults": [
    {
      "analysis_explanation": null,
      "end": 19,
      "entity_type": "PERSON",
      "score": 0.85,
      "start": 11
    }
  ],
  "anonymized": "My name is <PERSON> and my phone is 999-999"
}
```

## Exemplo com curl

```bash
curl "http://localhost:8080/test?text=My%20name%20is%20John%20Doe%20and%20my%20phone%20is%20999-999"
```

## Teste via script Node.js

Existe tambem um script de teste local:

```bash
npm install
npm run test:presidio
```

## Endpoints uteis

- `GET /` interface web para teste
- `GET /health` healthcheck do app Node.js
- `GET /test?text=...` executa analise e anonimização
