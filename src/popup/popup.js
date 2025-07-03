// DTF Messenger - Popup script
console.log('DTF Messenger popup loaded');

// Basic popup functionality
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('popup-app');
  if (app) {
    app.innerHTML = `
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-2">DTF Messenger</h2>
        <p class="text-sm text-gray-600 mb-4">Extension is active on DTF.ru</p>
        <button class="bg-dtf-orange text-white px-4 py-2 rounded hover:bg-dtf-orange/90">
          Open Chat
        </button>
      </div>
    `;
  }
}); 