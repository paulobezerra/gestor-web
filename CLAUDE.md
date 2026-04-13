# CLAUDE.md

## Sobre o projeto

Frontend do Gestor — ERP SaaS multi-tenant para prestadores de serviço no Brasil.
Consome a API REST em `http://localhost:8080` (Spring Boot).

## Stack

- Vue 3 + TypeScript + Vite 8
- shadcn-vue v2.6.2 (componentes, estilo New York, cor Zinc) + Tailwind CSS v3
- Pinia v3 (estado global)
- Vue Router **v5** (navegação) — API compatível com v4, mas com diferenças importantes
- VueUse v14 (composables utilitários)
- vee-validate v4 + @vee-validate/zod + zod (validação de formulários)
- axios (HTTP)
- vue-sonner (toasts via Sonner)
- reka-ui (primitivos usados internamente pelo shadcn-vue)

## Comandos

```bash
npm run dev        # Servidor de desenvolvimento (http://localhost:5173)
npm run build      # Build de produção (type-check + bundling em paralelo)
npm run type-check # Verificação TypeScript (vue-tsc --build)
npm run lint       # oxlint + eslint com auto-fix
npm run format     # Prettier
```

> Não existe `lint:fix` separado — `npm run lint` já aplica auto-fix.

## Estrutura de pastas

```
src/
├── api/           # Funções de chamada HTTP por domínio
│   ├── auth.ts
│   ├── colaboradores.ts
│   ├── empresa.ts
│   ├── inquilino.ts
│   └── usuario.ts
├── assets/
│   └── main.css   # Tailwind directives + variáveis CSS do shadcn-vue (Zinc)
├── components/
│   ├── ui/        # shadcn-vue — NÃO editar manualmente
│   ├── AppLogo.vue
│   ├── PlaceholderPage.vue  # props: title, description
│   └── ThemeToggle.vue
├── composables/
│   └── useTheme.ts  # ThemeOption: 'light' | 'dark' | 'auto'
├── layouts/
│   ├── AppLayout.vue   # Sidebar + header (autenticado)
│   └── AuthLayout.vue  # Card centralizado (público)
├── pages/
│   ├── configuracoes/
│   │   ├── AsaasPage.vue
│   │   ├── EmpresaPage.vue
│   │   ├── FiscalPage.vue
│   │   └── UsuariosPage.vue
│   ├── AgendaPage.vue        # placeholder
│   ├── ClientesPage.vue      # placeholder
│   ├── DashboardPage.vue
│   ├── FinanceiroPage.vue    # placeholder
│   ├── LoginPage.vue
│   ├── NfsePage.vue          # placeholder
│   ├── OrcamentosPage.vue    # placeholder
│   ├── OsPage.vue            # placeholder
│   ├── PerfilPage.vue
│   ├── RecuperarSenhaPage.vue
│   ├── RedefinirSenhaPage.vue
│   ├── RegistroPage.vue      # wizard 2 passos
│   └── ServicosPage.vue      # placeholder
├── router/
│   └── index.ts
├── stores/
│   ├── auth.ts
│   └── empresa.ts
├── types/
│   ├── api.ts          # ProblemDetail
│   ├── auth.ts
│   ├── colaborador.ts  # Role
│   ├── empresa.ts
│   ├── inquilino.ts    # TipoPessoa, StatusAsaas, RegimeTributario
│   └── usuario.ts
└── lib/
    ├── axios.ts   # instância axios com interceptors
    └── utils.ts   # cn() do shadcn-vue
```

## Tema

Composable em `src/composables/useTheme.ts`. Usa `usePreferredDark()` do VueUse.
Opções: `'light'`, `'dark'`, `'auto'`. Persistido em `localStorage` com chave `theme-preference`.
Classe `dark` aplicada reativamente em `<html>`.

## Autenticação

- **Access token**: `sessionStorage` (mais seguro que localStorage para XSS) — também mantido no Pinia store
- **Refresh token**: `localStorage` com chave `refreshToken`
- Interceptor em `src/lib/axios.ts` renova automaticamente no 401 com fila de requisições pendentes
- JWT decodificado client-side: `JSON.parse(atob(token.split('.')[1]))`
- `logout()` usa `window.location.href = '/login'` — não usa `useRouter()` (fora de componente)

## Vue Router v5 — diferenças importantes

Guards de navegação usam **retorno de valor** em vez de `next()` (que está deprecated):

```ts
// ✅ correto (v5)
router.beforeEach((to, _from) => {
  if (!autenticado) return '/login'
  return true
})

// ❌ deprecated (v4 style)
router.beforeEach((to, _from, next) => {
  if (!autenticado) next('/login')
  else next()
})
```

## Roles e autorização

Roles: `ADMINISTRADOR`, `FINANCEIRO`, `TECNICO`, `RECEPCAO`.
`authStore.hasRole(...roles)` verifica se o usuário tem um dos roles listados.
Guard de rota usa `to.meta.roles: Role[]` para proteger rotas por role.
Menu lateral em `AppLayout.vue` filtra itens usando `hasRole()`.

| Funcionalidade     | ADMINISTRADOR | FINANCEIRO | TECNICO  | RECEPCAO |
|--------------------|:-------------:|:----------:|:--------:|:--------:|
| Configurações      |      sim      |    não     |   não    |   não    |
| Gestão de usuários |      sim      |    não     |   não    |   não    |
| Financeiro         |      sim      |    sim     |   não    |   não    |
| NFS-e              |      sim      |    sim     |   não    |   não    |
| Agenda             |      sim      |    sim     | própria  |  todas   |
| Clientes           |      sim      |    sim     | leitura  |   sim    |
| OS                 |      sim      |    sim     | próprias | leitura  |
| Orçamentos         |      sim      |    sim     |   não    |   sim    |

## Erros da API

A API retorna erros no formato ProblemDetail (RFC 7807):
```json
{ "type": "/erros/requisicao-invalida", "title": "...", "detail": "...", "status": 400 }
```
Sempre exibir o campo `detail` ao usuário. Interface `ProblemDetail` em `src/types/api.ts`.

Padrão de captura de erro em handlers:
```ts
} catch (err) {
  const ax = err as AxiosError<ProblemDetail>
  errorMsg.value = ax.response?.data?.detail ?? 'Mensagem de fallback.'
}
```

## Formulários com vee-validate + zod

Padrão adotado (Composition API):
```ts
const schema = toTypedSchema(z.object({ campo: z.string().min(1) }))
const { handleSubmit, errors, defineField } = useForm({ validationSchema: schema })
const [campo, campoAttrs] = defineField('campo')
```

No template: `v-model="campo" v-bind="campoAttrs"` + `errors.campo` para mensagem de erro.

## shadcn-vue — configuração

- `components.json` na raiz com `style: "new-york"`, `baseColor: "zinc"`, `cssVariables: true`
- Para adicionar novos componentes: `npx shadcn-vue@latest add <nome> --yes`
- Nunca editar `src/components/ui/` manualmente — esses arquivos são ignorados pelo ESLint
- `tailwind.config.js` usa ES import para o plugin animate: `import tailwindcssAnimate from 'tailwindcss-animate'`

## Dependência circular — como evitar

`stores/auth.ts` importa de `api/auth.ts` que importa de `lib/axios.ts`.
`lib/axios.ts` importa `stores/auth` de forma **lazy** (dynamic import) para evitar circular.
`router/index.ts` importa `stores/auth` — para evitar circular, a store **não importa** o router.

## Toasts

Usar `toast` do `vue-sonner`:
```ts
import { toast } from 'vue-sonner'
toast.success('Mensagem')
toast.error('Erro')
toast.info('Info')
```
O componente `<Toaster>` está registrado globalmente em `App.vue`.

## Princípios

- Acessibilidade: `<label for="id">` em todos os campos, `aria-invalid`, `aria-describedby` nos erros, `aria-label` em botões só-ícone
- Responsividade: mobile-first; sidebar vira Sheet em `< md`; tabelas com `overflow-x-auto`
- Sem CSS manual — apenas classes Tailwind e componentes shadcn-vue
- Loading state em todo botão que dispara HTTP: spinner + `disabled` + `aria-busy`
- Ações destrutivas pedem confirmação via `AlertDialog`
