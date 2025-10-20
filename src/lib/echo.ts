// src/lib/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Extend Window interface
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

// Initialize Pusher on window
window.Pusher = Pusher;

// Initialize Echo
const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  encrypted: true,
  disableStats: false,
  enabledTransports: ['ws', 'wss'],
});

// Optional: Make Echo available globally
window.Echo = echo;

console.log('🔌 Echo initialized with Pusher Cloud');
console.log('Key:', import.meta.env.VITE_PUSHER_APP_KEY ? '✅ Loaded' : '❌ Missing');
console.log('Cluster:', import.meta.env.VITE_PUSHER_APP_CLUSTER ? '✅ Loaded' : '❌ Missing');

export default echo;