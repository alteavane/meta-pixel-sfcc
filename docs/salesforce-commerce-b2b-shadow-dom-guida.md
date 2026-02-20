# Best Practice: Accesso al DOM in Salesforce Commerce Cloud B2B (LWR/LWC)

## Contesto

Salesforce Commerce Cloud B2B (esperienza LWR — Lightning Web Runtime) costruisce le pagine utilizzando **Lightning Web Components (LWC)**. Molti di questi componenti adottano lo **Shadow DOM**, uno standard W3C che incapsula il markup interno rendendolo invisibile ai normali selettori CSS e JavaScript eseguiti dal documento principale.

Quando scrivi script personalizzati da iniettare nella `<head>` del sito (pixel di tracciamento, analytics, A/B testing, chatbot, ecc.), devi tenere conto di questo incapsulamento, altrimenti i tuoi `querySelector` restituiranno `null` anche se l'elemento è visibile nella pagina.

---

## Come funziona il Shadow DOM nei LWC

### Light DOM vs Shadow DOM

| Aspetto | Light DOM | Shadow DOM |
|---|---|---|
| Visibilità da `document.querySelector` | ✅ Raggiungibile | ❌ Non raggiungibile |
| Stili CSS globali | Si applicano | Non penetrano |
| Come accedere | Selettore diretto | `elemento.shadowRoot.querySelector(...)` |

### Come riconoscere il Shadow DOM in DevTools

Quando ispezioni un elemento in Chrome/Edge DevTools, cerca questi segnali:

1. **`#shadow-root (open)`** — riga visibile sotto il tag del componente. Tutto ciò che sta al suo interno è incapsulato.
2. **Attributi `lwc-*-host`** — ad esempio `lwc-4nfn2rc40ch-host` sul componente indica che è un LWC con il proprio Shadow DOM.
3. **Attributi `lwc-*` sui figli** — gli elementi interni avranno attributi come `lwc-4nfn2rc40ch` (senza `-host`).

### Regola fondamentale

> Un singolo `document.querySelector('componente-padre elemento-figlio')` **non** attraversa i confini del Shadow DOM. Devi spezzare la query in più passaggi, usando `.shadowRoot` a ogni confine.

---

## Pattern di accesso

### Elemento nel Light DOM (nessun Shadow DOM)

```javascript
// Funziona normalmente
document.querySelector('commerce_builder-order-confirmation-totals-summary lightning-formatted-number');
```

### Elemento dietro un livello di Shadow DOM

```javascript
// Il <span> con lo SKU è dentro il shadow root di <lightning-formatted-rich-text>
document.querySelector('commerce-field-display lightning-formatted-rich-text')
  ?.shadowRoot
  ?.querySelector('span');
```

### Elemento dietro più livelli di Shadow DOM

```javascript
// Attraversamento di due livelli di shadow
document.querySelector('componente-esterno')
  ?.shadowRoot
  ?.querySelector('componente-interno')
  ?.shadowRoot
  ?.querySelector('.classe-target');
```

### Lettura di testo da `lightning-formatted-number`

Questo componente Salesforce spesso incapsula il testo nel proprio Shadow DOM:

```javascript
// Approccio robusto con fallback
const el = document.querySelector('lightning-formatted-number[data-automation="productPricingMainPrice"]');
const testo = el?.shadowRoot?.textContent || el?.innerText || '';
```

---

## Strategia consigliata per scrivere selettori

1. **Identifica l'elemento target** in DevTools (Ispeziona Elemento).
2. **Risali l'albero DOM** e verifica se tra il `document` e l'elemento target compare `#shadow-root (open)`.
3. **Se non c'è Shadow DOM**: usa un `querySelector` diretto.
4. **Se c'è Shadow DOM**: spezza la query al confine del shadow root, usa `.shadowRoot` e prosegui con un secondo `querySelector`.
5. **Testa sempre in console** prima di scrivere il codice finale.
6. **Prevedi un fallback**: la struttura LWC può cambiare tra release di Salesforce. Usa l'optional chaining (`?.`) e valori di fallback.

---

## Attenzione ai falsi positivi

Alcuni componenti Salesforce espongono il contenuto sia nel Light DOM che nel Shadow DOM, ma il **testo visibile** potrebbe essere solo nel Shadow DOM. Esempio tipico:

```javascript
// Restituisce '' (stringa vuota) — il testo è nel shadow root
document.querySelector('lightning-formatted-number')?.textContent;

// Restituisce '199,89 €' — accesso corretto
document.querySelector('lightning-formatted-number')?.shadowRoot?.textContent;

// Restituisce '199,89 €' — alternativa che a volte funziona
document.querySelector('lightning-formatted-number')?.innerText;
```

> **Regola pratica**: se `textContent` restituisce una stringa vuota ma l'elemento è visibile nella pagina, prova con `shadowRoot.textContent` o `innerText`.

---

## Timing e rendering asincrono

I componenti LWC si renderizzano in modo asincrono. Il DOM potrebbe non essere pronto al `DOMContentLoaded`. Strategie:

```javascript
// ✅ setInterval con guardia — pattern più affidabile su Salesforce LWR
let tracked = false;
setInterval(() => {
  if (tracked) return;
  const el = document.querySelector('...');
  if (!el) return; // non ancora renderizzato
  // ... logica ...
  tracked = true;
}, 1000);

// ✅ MutationObserver — più elegante ma più complesso
const observer = new MutationObserver((mutations) => {
  const el = document.querySelector('...');
  if (el) {
    // ... logica ...
    observer.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
```

> **Nota**: il `MutationObserver` non riceve notifiche per modifiche *dentro* un Shadow DOM a meno che non osservi direttamente il shadow root del componente. Per semplicità, il pattern `setInterval` è spesso la scelta più pragmatica su Salesforce Commerce.

---

## Pagine chiave e componenti tipici

| Pagina | Componenti comuni | Note |
|---|---|---|
| Lista prodotti / Categoria | `commerce-product-pricing`, `commerce-action-button` | Spesso Light DOM |
| Dettaglio prodotto | `commerce_product_details-heading`, `commerce-product-pricing-details`, `lightning-formatted-number`, `lightning-formatted-rich-text` | Spesso Shadow DOM per prezzi e campi custom |
| Carrello | `commerce_cart-item` | Generalmente Light DOM |
| Checkout | `commerce_cart-item`, `commerce_builder-checkout-*` | Mix Light/Shadow |
| Conferma ordine | `commerce_builder-order-confirmation-*`, `lightning-formatted-number` | Shadow DOM per i totali |

> Questa tabella è indicativa. La struttura può variare in base alla versione di Salesforce, al template e alle personalizzazioni del sito.

---

## Comandi console per debug e verifica

Copia e incolla questi comandi nella console di DevTools (F12) per diagnosticare i problemi.

### 1. Verifica se un componente esiste

```javascript
// Controlla se il componente è presente nella pagina
document.querySelector('commerce_product_details-heading');
// Se restituisce null → il componente non è nel DOM (pagina sbagliata o non ancora renderizzato)
```

### 2. Verifica se un componente ha Shadow DOM

```javascript
// Se ha shadow root, restituisce un oggetto ShadowRoot; altrimenti null
document.querySelector('lightning-formatted-rich-text')?.shadowRoot;
```

### 3. Ispeziona tutto il contenuto di un Shadow DOM

```javascript
// Elenca tutti gli elementi dentro il shadow root
document.querySelector('lightning-formatted-rich-text')?.shadowRoot?.querySelectorAll('*');
```

### 4. Trova tutti i `lightning-formatted-number` nella pagina e leggi i loro valori

```javascript
document.querySelectorAll('lightning-formatted-number').forEach((el, i) => {
  const lightText = el.textContent?.trim();
  const shadowText = el.shadowRoot?.textContent?.trim();
  const innerText = el.innerText?.trim();
  console.log(`[${i}]`, {
    lightText,
    shadowText,
    innerText,
    dataAutomation: el.getAttribute('data-automation'),
    element: el
  });
});
```

### 5. Cerca elementi per attributo `data-automation`

```javascript
// Salesforce usa spesso data-automation per identificare componenti chiave
document.querySelectorAll('[data-automation]').forEach(el => {
  console.log(el.getAttribute('data-automation'), '→', el.tagName, el);
});
```

### 6. Testa un selettore con attraversamento Shadow DOM

```javascript
// Template generico: modifica i selettori in base al tuo caso
function queryShadow(hostSelector, innerSelector) {
  const host = document.querySelector(hostSelector);
  if (!host) return console.warn('Host non trovato:', hostSelector);
  if (!host.shadowRoot) return console.warn('Nessun shadowRoot su:', hostSelector);
  const result = host.shadowRoot.querySelector(innerSelector);
  console.log(result ? result.textContent?.trim() : 'Elemento interno non trovato');
  return result;
}

// Esempio: leggere lo SKU
queryShadow('lightning-formatted-rich-text', 'span');

// Esempio: leggere il prezzo
queryShadow('lightning-formatted-number[data-automation="productPricingMainPrice"]', '*');
```

### 7. Monitora un elemento che si carica in ritardo

```javascript
// Utile per verificare i tempi di rendering
const check = setInterval(() => {
  const el = document.querySelector('IL-TUO-SELETTORE');
  if (el) {
    console.log('✅ Elemento trovato dopo', performance.now().toFixed(0), 'ms', el);
    clearInterval(check);
  }
}, 200);
setTimeout(() => clearInterval(check), 15000); // stop dopo 15s
```

### 8. Elenca tutti i LWC con Shadow DOM nella pagina

```javascript
document.querySelectorAll('*').forEach(el => {
  if (el.shadowRoot) {
    console.log(el.tagName.toLowerCase(), el);
  }
});
```
