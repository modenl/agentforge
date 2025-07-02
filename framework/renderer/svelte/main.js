import { mount } from 'svelte';
import App from './App.svelte';

console.log('🔧 Svelte main.js loaded');

// 确保DOM准备就绪
function initSvelteApp() {
  const target = document.getElementById('svelte-app');
  console.log('🔧 Target element:', target);

  if (!target) {
    console.error('❌ Target element #svelte-app not found');
    return null;
  }

  try {
    console.log('🔧 Creating Svelte app...');
    const app = mount(App, {
      target: target
    });
    console.log('✅ Svelte app created successfully');
    return app;
  } catch (error) {
    console.error('❌ Failed to create Svelte app:', error);
    return null;
  }
}

let app = null;

// 如果DOM已经准备就绪，立即初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOM loaded, initializing Svelte app');
    app = initSvelteApp();
    // Make app available globally for debugging
    window.svelteApp = app;
  });
} else {
  console.log('🔧 DOM already ready, initializing Svelte app');
  app = initSvelteApp();
  // Make app available globally for debugging
  window.svelteApp = app;
}

export default app; 