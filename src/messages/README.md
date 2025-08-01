# 🌍 Estrutura de Internacionalização

Esta pasta contém todas as traduções do projeto organizadas por idioma e componente.

## 📁 Estrutura

```
src/messages/
├── pt/                    # Português
│   ├── common.json       # Traduções comuns (botões, labels, erros)
│   ├── navigation.json   # Navegação e header
│   ├── home.json         # Página inicial
│   ├── markets.json      # Mercados e listagens
│   ├── auth.json         # Autenticação (login/registro)
│   ├── createMarket.json # Criação de mercados
│   └── footer.json       # Footer
└── en/                    # Inglês
    ├── common.json
    ├── navigation.json
    ├── home.json
    ├── markets.json
    ├── auth.json
    ├── createMarket.json
    └── footer.json
```

## 🎯 Benefícios

### ✅ **Manutenibilidade**
- Cada componente tem seu próprio arquivo JSON
- Fácil localização de traduções específicas
- Menos conflitos de merge no Git

### ✅ **Escalabilidade**
- Adicionar novos idiomas é simples
- Novos componentes podem ter seus próprios arquivos
- Estrutura clara e organizada

### ✅ **Performance**
- Carregamento sob demanda
- Bundle size otimizado
- Tree-shaking automático

## 🔧 Como Usar

### Adicionando novas traduções:

1. **Para um componente existente:**
   ```json
   // src/messages/pt/markets.json
   {
     "newKey": "Nova tradução"
   }
   ```

2. **Para um novo componente:**
   - Crie `src/messages/pt/novoComponente.json`
   - Crie `src/messages/en/novoComponente.json`
   - Adicione 'novoComponente' no array `messageFiles` em `src/i18n/request.ts`

### Adicionando novo idioma:

1. Crie a pasta `src/messages/es/` (exemplo para espanhol)
2. Copie todos os arquivos JSON de `pt/` para `es/`
3. Traduza o conteúdo
4. Adicione 'es' no array `locales` em `src/i18n/config.ts`

## 📝 Convenções

- **Nomes de arquivos**: camelCase (ex: `createMarket.json`)
- **Chaves de tradução**: camelCase (ex: `createMarket`)
- **Estrutura**: Organizar por contexto/funcionalidade
- **Comentários**: Usar quando necessário para contexto

## 🚀 Exemplo de Uso

```tsx
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('markets') // Carrega markets.json
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('search.placeholder')}</p>
    </div>
  )
}
``` 