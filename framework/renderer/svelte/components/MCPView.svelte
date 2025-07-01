<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let url = '';
  export let serverName = '';
  export let title = '';
  export let viewMode = 'normal'; // 'normal', 'compact', 'fullscreen', 'mini'
  export let width = '100%';
  export let height = '100%';
  export let minWidth = 400;
  export let minHeight = 300;
  export let resizable = true;
  export let showControls = true;
  
  // Add timestamp to URL to bypass cache
  $: urlWithTimestamp = url ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` : '';
  
  const dispatch = createEventDispatcher();
  
  let webviewElement;
  let containerElement;
  let isReady = false;
  let zoomLevel = 1.0;
  let hasCleared = false;
  
  // View mode configurations
  const viewModeConfigs = {
    normal: { zoom: 1.0, controls: true },
    compact: { zoom: 1.0, controls: true }, // Changed from 0.8 to 1.0 to fix rendering issues
    fullscreen: { zoom: 1.0, controls: true }, // Changed to show controls in fullscreen
    mini: { zoom: 0.6, controls: true } // Keep minimal controls in mini mode
  };
  
  $: {
    // Apply view mode configuration
    if (viewMode && viewModeConfigs[viewMode]) {
      const config = viewModeConfigs[viewMode];
      setZoom(config.zoom);
      showControls = config.controls;
    }
  }
  
  let hasInitiallyLoaded = false;
  
  onMount(() => {
    if (!webviewElement) return;
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + I to toggle WebView DevTools
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        try {
          if (webviewElement.isDevToolsOpened()) {
            webviewElement.closeDevTools();
          } else {
            webviewElement.openDevTools();
          }
        } catch (error) {
          console.error('Failed to toggle DevTools:', error);
        }
      }
      
      // Ctrl/Cmd + Shift + R to hard reload WebView
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        webviewElement.reloadIgnoringCache();
      }
      
      // ESC to exit fullscreen
      if (e.key === 'Escape' && viewMode === 'fullscreen') {
        setViewMode('normal');
      }
    });
    
    // Configure webview
    webviewElement.addEventListener('dom-ready', () => {
      isReady = true;
      
      // Only clear cache on first load
      if (!hasInitiallyLoaded) {
        hasInitiallyLoaded = true;
        
        // Note: Cache clearing not available in renderer process
        // The timestamp in URL handles cache busting
      }
      
      // Apply initial zoom
      applyViewMode();
      
      // Inject CSS for better integration
      webviewElement.insertCSS(`
        body {
          margin: 0;
          padding: 0;
          overflow: auto;
        }
        
        /* Hide elements in compact mode - use more specific selectors */
        ${viewMode === 'compact' ? `
          /* Target only specific navigation elements, not all elements containing 'header' */
          nav.header, div.app-header, .page-header { display: none !important; }
          nav.footer, div.app-footer, .page-footer { display: none !important; }
          .sidebar, .side-menu { display: none !important; }
          .main-content { padding: 0 !important; }
        ` : ''}
        
        /* Mini mode adjustments */
        ${viewMode === 'mini' ? `
          * { font-size: 90% !important; }
          .container { padding: 5px !important; }
        ` : ''}
      `);
      
      dispatch('ready');
    });
    
    // Handle console messages from webview
    webviewElement.addEventListener('console-message', (event) => {
      if (event.level === 2) { // error level
        // Skip Electron security warnings in development
        if (event.message.includes('Electron Security Warning')) {
          return;
        }
        console.error('[WebView Error]:', event.message);
      }
    });
    
    // Handle navigation
    webviewElement.addEventListener('will-navigate', (event) => {
      dispatch('navigate', { url: event.url });
    });
    
    // Handle page errors
    webviewElement.addEventListener('did-fail-load', (event) => {
      console.error('WebView failed to load:', event.errorCode, event.errorDescription);
    });
    
    // Handle new window requests
    webviewElement.addEventListener('new-window', (event) => {
      event.preventDefault();
      // You can handle this differently based on your needs
      if (event.disposition === 'foreground-tab' || event.disposition === 'background-tab') {
        webviewElement.loadURL(event.url);
      }
    });
    
    // IPC communication with the webview
    webviewElement.addEventListener('ipc-message', (event) => {
      handleIPCMessage(event.channel, event.args);
    });
  });
  
  onDestroy(() => {
    if (webviewElement && webviewElement.isConnected) {
      webviewElement.remove();
    }
  });
  
  function applyViewMode() {
    if (!webviewElement || !isReady) return;
    
    const config = viewModeConfigs[viewMode] || viewModeConfigs.normal;
    setZoom(config.zoom);
    
    // Send view mode to the web page
    webviewElement.send('view-mode-changed', { mode: viewMode });
  }
  
  function setZoom(level) {
    if (!webviewElement || !isReady) return;
    zoomLevel = level;
    webviewElement.setZoomFactor(zoomLevel);
  }
  
  function handleIPCMessage(channel, args) {
    switch (channel) {
      case 'resize-request':
        // Handle resize requests from the web page
        if (args[0] && resizable) {
          const { width: reqWidth, height: reqHeight } = args[0];
          dispatch('resize-request', { width: reqWidth, height: reqHeight });
        }
        break;
        
      case 'state-update':
        // Forward state updates
        dispatch('state-update', args[0]);
        break;
        
      default:
        dispatch('message', { channel, args });
    }
  }
  
  // Public API methods
  export function reload() {
    if (webviewElement) {
      // Hard reload to bypass cache
      webviewElement.reloadIgnoringCache();
    }
  }
  
  export function setViewMode(mode) {
    viewMode = mode;
    applyViewMode();
  }
  
  export function executeJavaScript(code) {
    if (!webviewElement || !isReady) return Promise.reject('WebView not ready');
    return webviewElement.executeJavaScript(code);
  }
  
  export function send(channel, ...args) {
    if (!webviewElement || !isReady) return;
    webviewElement.send(channel, ...args);
  }
  
  export function setSize(newWidth, newHeight) {
    width = newWidth;
    height = newHeight;
  }
  
  export function toggleFullscreen() {
    if (viewMode === 'fullscreen') {
      setViewMode('normal');
    } else {
      setViewMode('fullscreen');
    }
  }
</script>

<div 
  class="mcp-view-container {viewMode}"
  bind:this={containerElement}
  style="width: {width}; height: {height}; min-width: {minWidth}px; min-height: {minHeight}px;"
>
  {#if showControls}
    <div class="view-controls" class:compact={viewMode === 'compact' || viewMode === 'mini'}>
      <div class="controls-left">
        {#if viewMode !== 'mini'}
          <span class="server-name">{serverName}</span>
          {#if title && title !== serverName}
            <span class="title">{title}</span>
          {/if}
        {:else}
          <span class="title">{title || serverName}</span>
        {/if}
      </div>
      <div class="controls-right">
        {#if viewMode === 'mini'}
          <!-- Minimal controls for mini mode -->
          <button on:click={() => setViewMode('compact')} title="Compact">□</button>
          <button on:click={() => setViewMode('normal')} title="Normal">◱</button>
        {:else if viewMode === 'compact'}
          <!-- Compact controls -->
          <button on:click={() => setViewMode('mini')} title="Mini">◿</button>
          <button on:click={() => setViewMode('normal')} title="Normal">◱</button>
          <button on:click={toggleFullscreen} title="Fullscreen">⛶</button>
        {:else}
          <!-- Full controls for normal mode -->
          <button on:click={() => setViewMode('mini')} class:active={viewMode === 'mini'}>
            Mini
          </button>
          <button on:click={() => setViewMode('compact')} class:active={viewMode === 'compact'}>
            Compact
          </button>
          <button on:click={() => setViewMode('normal')} class:active={viewMode === 'normal'}>
            Normal
          </button>
          <button on:click={toggleFullscreen}>
            {viewMode === 'fullscreen' ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        {/if}
        <button on:click={reload} title="Reload">↻</button>
      </div>
    </div>
  {/if}
  
  <webview
    bind:this={webviewElement}
    src={urlWithTimestamp}
    nodeintegration="false"
    nodeintegrationinsubframes="false"
    webpreferences="contextIsolation=yes, webSecurity=false"
    partition="persist:mcp"
    allowpopups="true"
    class="mcp-webview"
  />
</div>

<style>
  .mcp-view-container {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  
  .mcp-view-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 1000;
    border-radius: 0;
  }
  
  .mcp-view-container.mini {
    max-width: 600px;
    max-height: 400px;
  }
  
  .view-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    transition: none;
  }
  
  .view-controls.compact {
    padding: 4px 8px;
  }
  
  .controls-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .server-name {
    font-weight: 600;
    color: #212121;
    font-size: 1rem;
  }
  
  .title {
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .controls-right {
    display: flex;
    gap: 0.5rem;
  }
  
  .controls-right button {
    padding: 4px 8px;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    color: #212121;
    transition: none;
  }
  
  .controls-right button:hover {
    background: #e0e0e0;
  }
  
  .controls-right button.active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
  }
  
  .mcp-webview {
    flex: 1;
    width: 100%;
    border: none;
  }
  
  /* No animations */
</style>