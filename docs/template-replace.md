# Templates de replace (`TextGenerator`)

O motor de substituição está em `src/services/file-exporter-service.ts` (`TextGenerator.generate`). Ele recebe um **template** (string) e um objeto **`IRun`** e devolve o texto final.

Usado em:

- exportação de arquivos (`FileExporter` + `IExportFileRun`)
- título da live / Twitch (`seo_title_template`, `run.seoTitle`)
- URLs OBS e outros valores em `action-runner.ts`

---

## Ordem de processamento

| Etapa | O que faz | Observação |
|-------|-----------|--------------|
| 1 | `<loop>...</loop>` | Só se o **template original** contiver um bloco `<loop>` |
| 2 | `<item>...</item>` | Só se o **template original** contiver um bloco `<item>` |
| 3 | `{campo}` | Placeholders no nível da run (`IRun`) |
| 4 | Quebra por palavras | Se `maxCharsPerLine` > 0 em `IExportFileRun` |
| 5 | Quebra de linha literal | Sequências `\r\n`, `\r`, `\n` no template viram `os.EOL` |

Não há processamento recursivo: um template só pode ter **um** `<loop>` **ou** **um** `<item>` no topo (não os dois ao mesmo tempo, conforme o `match` no template inicial).

---

## Sintaxes de replace

### 1. Placeholder simples — `{campo}`

Substitui por `data[campo]` em `IRun`.

| Sintaxe | Regex / regra | Exemplo |
|---------|---------------|---------|
| `{nomeDoCampo}` | `/\{(.*?)\}/g` | `{game} - {category}` |

**Exemplo**

```text
{game} - {category} ({platform})
```

**Saída (exemplo)**

```text
The Legend of Zelda: Ocarina of Time - Any% (N64)
```

---

### 2. Loop em lista — `<loop>`

Repete um trecho para cada elemento de um array em `IRun`.

| Atributo | Obrigatório | Descrição |
|----------|-------------|-----------|
| `property` | sim | Nome do array em `IRun`: `runners`, `hosts` ou `comments` |
| `separator` | sim | Texto entre cada item gerado (ex.: `, `) |
| `prefix` | não | Prefixos por campo, separados por vírgula (ver fallback abaixo) |
| conteúdo interno | sim | Texto com placeholders `{grupo[campo]}` |

**Formato**

```xml
<loop property='runners' separator=', ' prefix=''>{runners[name]}</loop>
```

| Placeholder interno | Formato | Regra |
|---------------------|---------|--------|
| `{grupo[campo]}` | `{(.*?)\[(.*?)\]}` | `grupo` é apenas referência visual; o valor vem de **`campo`** no item atual |
| `{grupo[campo1,campo2]}` | campos separados por vírgula | Usa o **primeiro** campo não vazio; `prefix` alinha por índice com cada campo |

**Exemplo**

```xml
<loop property='hosts' separator=' | ' prefix='@,'>{hosts[primaryTwitch,name]}</loop>
```

Com dois hosts e `primaryTwitch` preenchido no primeiro: `@user1 | @user2`.

---

### 3. Item único por índice — `<item>`

Pega **um** elemento do array (`index` começa em `0`).

| Atributo | Obrigatório | Descrição |
|----------|-------------|-----------|
| `property` | sim | `runners`, `hosts` ou `comments` |
| `index` | sim | Posição no array (string numérica: `'0'`, `'1'`, …) |
| conteúdo interno | sim | Mesmo formato `{grupo[campo]}` do loop |

**Formato**

```xml
<item property='runners' index='0'>({runners[gender]}) {runners[name]}</item>
```

Em `<item>`, o atributo `prefix` do loop **não** é aplicado (prefixo vazio no código).

---

## Fallback de campos (`getFirstFieldFromItem`)

Quando há vários campos em `[campo1,campo2,...]`:

1. Percorre na ordem.
2. Para cada campo, se o valor no `IMember` existir e ainda não houver valor escolhido, usa `prefix[i] + valor`.
3. Para no primeiro valor encontrado.
4. Se nenhum campo tiver valor → string vazia.

| Template | Comportamento |
|----------|----------------|
| `{runners[gender,name]}` | Mostra `gender` se existir; senão `name` |
| `prefix='@,'` com `{runners[primaryTwitch,name]}` | Prefixo `@` só no primeiro campo da lista que tiver valor |

---

## Campos disponíveis (`IRun`)

Interface: `src/domain/run.interface.ts`

| Campo | Tipo | Uso em template | Exemplo de placeholder |
|-------|------|-----------------|--------------------------|
| `game` | `string` | `{game}` | `{game}` |
| `category` | `string` | `{category}` | `{category}` |
| `platform` | `string` | `{platform}` | `{platform}` |
| `estimate` | `string` | `{estimate}` | `{estimate}` |
| `year` | `string?` | `{year}` | `{year}` |
| `seoTitle` | `string?` | Não substituído diretamente; pode **ser** o template inteiro em integrações Twitch | — |
| `seoGame` | `string?` | Usado em `getRunGame`, não no replace genérico | — |
| `runners` | `IMember[]` | `<loop>` / `<item>` + `{runners[...]}` | ver tabela de membro |
| `hosts` | `IMember[]` | `<loop>` / `<item>` + `{hosts[...]}` | idem |
| `comments` | `IMember[]` | `<loop>` / `<item>` + `{comments[...]}` | idem |
| `images` | `IRunImage[]?` | Não usado nos templates padrão | — |

---

## Campos de membro (`IMember`)

Interface: `src/domain/member.interface.ts`  
Usados dentro de `<loop>` / `<item>` como `{runners[campo]}`, `{hosts[campo]}`, `{comments[campo]}`.

| Campo | Tipo | Exemplo em template |
|-------|------|---------------------|
| `name` | `string` | `{runners[name]}` |
| `gender` | `string` | `{runners[gender]}` (pronome / rótulo configurado) |
| `primaryTwitch` | `string?` | `{runners[primaryTwitch]}` |
| `secondaryTwitch` | `string?` | `{runners[secondaryTwitch]}` |
| `streamAt` | `string?` | `{runners[streamAt]}` |
| `link` | `string?` | `{runners[link]}` |
| `id` | `string?` | `{runners[id]}` |
| `images` | `IMemberImage[]?` | Não há template padrão para imagens | — |

---

## Configuração de arquivo exportado (`IExportFileRun`)

Interface: `src/domain/export.interfaces.ts`

| Campo | Tipo | Função |
|-------|------|--------|
| `name` | `string` | Nome do arquivo gerado |
| `template` | `string` | String com sintaxes acima |
| `maxCharsPerLine` | `number?` | Quebra o texto final por palavras (espaços), não por caracteres fixos |
| `tags` | `string[]?` | Metadados da UI; não entram no replace |

---

## Quebras de linha no template

| No template você escreve | No arquivo / saída |
|--------------------------|-------------------|
| `\n` (dois caracteres: `\` + `n`) | Fim de linha do SO (`os.EOL`) |
| `\r` | Idem |
| `\r\n` | Normalizado para `\n` e depois para `os.EOL` |

Exemplo:

```text
Linha 1\nLinha 2
```

---

## Exemplos prontos (arquivos padrão)

Referência: `src/pages/v1/settings/files/default_files.ts`

| Arquivo | Template | Resultado típico |
|---------|----------|------------------|
| `all_runners.txt` | `<loop property='runners' separator=', ' prefix=''>{runners[name]}</loop>` | Nome1, Nome2, … |
| `runner_0_name.txt` | `<item property='runners' index='0'>{runners[name]}</item>` | Primeiro runner |
| `runner_0_name+pronoun.txt` | `<item property='runners' index='0'>({runners[gender]}) {runners[name]}</item>` | `(ele) Nome` |
| `full_run_title.txt` | `{game} - {category} ({platform})` | Título completo da run |
| `run_estimate.txt` | `{estimate}` | Tempo estimado |

O mesmo padrão se repete para `hosts` e `comments` (índices `0`–`3`).

---

## Título da live (SEO)

| Origem do template | Prioridade |
|--------------------|------------|
| `run.seoTitle` | 1 — se preenchido, substitui o template global |
| Template da ação Twitch (`module.value`) | 2 |
| `configuration.seo_title_template` | 3 — padrão global |

O conteúdo passa por `TextGenerator.generate(template, run)` com as mesmas regras deste documento.

---

## Referência rápida — qual sintaxe usar?

| Objetivo | Sintaxe recomendada |
|----------|---------------------|
| Dado da run (jogo, categoria, etc.) | `{game}`, `{category}`, … |
| Todos os runners separados por vírgula | `<loop property='runners' …>` |
| Runner / host / comentarista na posição N | `<item property='runners' index='N' …>` |
| Nome com fallback (ex.: Twitch ou nome) | `{runners[primaryTwitch,name]}` |
| Pronome + nome | `({runners[gender]}) {runners[name]}` dentro de `<item>` ou `<loop>` |
| Texto longo com limite de linha | `maxCharsPerLine` em `IExportFileRun` |
| Várias linhas no arquivo | `\n` literal no template |

---

## Interfaces (TypeScript)

```ts
// src/domain/run.interface.ts
interface IRun {
  runners: IMember[];
  hosts: IMember[];
  comments: IMember[];
  estimate: string;
  game: string;
  category: string;
  platform: string;
  year?: string;
  seoTitle?: string;
  seoGame?: string;
  // ...
}

// src/domain/member.interface.ts
interface IMember {
  gender: string;
  name: string;
  primaryTwitch?: string;
  secondaryTwitch?: string;
  streamAt?: string;
  link?: string;
  // ...
}

// src/domain/export.interfaces.ts
interface IExportFileRun {
  name: string;
  template: string;
  maxCharsPerLine?: number;
}
```

---

## API

```ts
import { TextGenerator, FileExporter } from "@/services/file-exporter-service";

const texto = TextGenerator.generate(template, run, maxCharsPerLineOpcional);

FileExporter.exportFilesToPath(arquivos, pastaDestino, run);
```
