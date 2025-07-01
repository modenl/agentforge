<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let url = '';
  export let serverName = '';
  export let title = '';
  
  const dispatch = createEventDispatcher();
  
  let webviewElement;
  let isReady = false;
  let loadError = null;
  
  onMount(() => {
    if (!webviewElement) return;
    
    // WebView events
    webviewElement.addEventListener('dom-ready', () => {
      console.log('WebView DOM ready');
      isReady = true;
      
      // Enable DevTools in development
      if (process.env.NODE_ENV === 'development') {
        webviewElement.openDevTools();
      }
      
      // Inject custom CSS if needed
      webviewElement.insertCSS(`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `);
      
      dispatch('ready');
    });
    
    webviewElement.addEventListener('did-fail-load', (event) => {
      console.error('WebView load failed:', event);
      loadError = event.errorDescription || 'Failed to load';
      dispatch('error', { error: loadError });
    });
    
    webviewElement.addEventListener('new-window', (event) => {
      // Prevent popups, handle in same webview
      event.preventDefault();
      if (event.url) {
        webviewElement.loadURL(event.url);
      }
    });
    
    webviewElement.addEventListener('ipc-message', (event) => {
      console.log('IPC message from webview:', event.channel, event.args);
      dispatch('message', { channel: event.channel, args: event.args });
    });
    
    // Security: Configure webview permissions
    webviewElement.addEventListener('permission-request', (event) => {
      // Only allow necessary permissions
      const allowedPermissions = ['media', 'geolocation', 'notifications'];
      if (allowedPermissions.includes(event.permission)) {
        event.request.allow();
      } else {
        event.request.deny();
      }
    });
  });
  
  onDestroy(() => {
    if (webviewElement && webviewElement.isConnected) {
      webviewElement.remove();
    }
  });
  
  // Public methods
  export function reload() {
    if (webviewElement && isReady) {
      webviewElement.reload();
    }
  }
  
  export function goBack() {
    if (webviewElement && webviewElement.canGoBack()) {
      webviewElement.goBack();
    }
  }
  
  export function goForward() {
    if (webviewElement && webviewElement.canGoForward()) {
      webviewElement.goForward();
    }
  }
  
  export function executeJavaScript(code) {
    if (webviewElement && isReady) {
      return webviewElement.executeJavaScript(code);
    }
  }
</script>

<div class="webview-container">
  <div class="webview-header">
    <div class="header-info">
      <span class="server-name">{serverName}</span>
      <span class="title">{title}</span>
    </div>
    <div class="header-controls">
      <button on:click={goBack} title="Back">←</button>
      <button on:click={goForward} title="Forward">→</button>
      <button on:click={reload} title="Reload">↻</button>
    </div>
  </div>
  
  {#if loadError}
    <div class="error-message">
      <p>Failed to load: {loadError}</p>
      <button on:click={reload}>Try Again</button>
    </div>
  {:else}
    <webview
      bind:this={webviewElement}
      src={url}
      nodeintegration="false"
      contextIsolation="true"
      webpreferences="contextIsolation=yes"
      class="webview-element"
    />
  {/if}
</div>

<style>
  .webview-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
  }
  
  .webview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }
  
  .header-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .server-name {
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .title {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  .header-controls {
    display: flex;
    gap: 0.5rem;
  }
  
  .header-controls button {
    padding: 0.25rem 0.5rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .header-controls button:hover {
    background: var(--bg-hover);
  }
  
  .webview-element {
    flex: 1;
    width: 100%;
    border: none;
  }
  
  .error-message {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }
  
  .error-message p {
    color: var(--error);
    margin-bottom: 1rem;
  }
  
  .error-message button {
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>