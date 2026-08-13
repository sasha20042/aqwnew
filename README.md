# Публічна анкета · Угорщина (Тимчасовий захист)

Next.js форма для клієнтів. Дані йдуть у CRM через захищений API.

## Локально

```bash
cp .env.example .env.local
npm install
npm run dev
```

Відкрийте `http://localhost:3000/?t=TOKEN` (токен створюється в CRM → «Посилання на форму»).

## Env

```
CRM_API_URL=https://your-crm-domain.example
CRM_API_KEY=той_самий_ключ_що_PUBLIC_FORM_API_KEY_в_CRM
```

Опційно для політики конфіденційності:

```
NEXT_PUBLIC_DATA_CONTROLLER_NAME=
NEXT_PUBLIC_DATA_CONTROLLER_EMAIL=
NEXT_PUBLIC_DATA_CONTROLLER_ADDRESS=
```

## Vercel

1. Import репозиторію
2. Framework: Next.js
3. Env: `CRM_API_URL`, `CRM_API_KEY`
4. Deploy → скопіюйте URL у CRM `.env` як `PUBLIC_FORM_URL`
