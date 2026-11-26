const libraryCommon = {
  initializeProtectedPage(activePage) {
    if (!sessionStorage.getItem('libraryActiveUser')) {
      window.location.replace('login.html');
      return false;
    }
    this.renderShell(activePage);
    this.bindMobileNav();
    return true;
  },

  renderShell(activePage) {
    const user = JSON.parse(sessionStorage.getItem('libraryActiveUser') || '{}');
    const app = document.querySelector('[data-app]');
    if (!app) return;
    const pageContent = document.querySelector('[data-page-content]')?.innerHTML || '';

    app.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="dashboard.html">
          <span class="brand-mark"><i class="fa-solid fa-book-open"></i></span>
          <span><strong>Digital Library</strong><small>University Portal</small></span>
        </a>
        <nav class="side-nav">
          ${[
            ['dashboard', 'Dashboard', '◫'],
            ['books', 'Books', '▤'],
            ['members', 'Members', '◎'],
            ['issue-book', 'Issue Book', '⇄'],
            ['return-book', 'Return Book', '↩'],
            ['reports', 'Reports', '▥'],
            ['about', 'About', 'ⓘ']
          ].map(([page, label, icon]) => `
            <a href="${page}.html" class="${activePage === page ? 'active' : ''}">
              <b>${icon}</b><span>${label}</span>
            </a>`).join('')}
        </nav>
        <button class="logout-link" id="logoutButton" type="button">
          <b>↪</b><span>Logout</span>
        </button>
      </aside>
      <main class="main-shell">
        <header class="topbar">
          <button class="menu-toggle" id="menuToggle" type="button" aria-label="Toggle navigation">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div>
            <p class="eyebrow">Library Administration</p>
            <h1>${document.body.dataset.title || 'Dashboard'}</h1>
          </div>
          <div class="profile">
            <div class="avatar">${(user.fullName || user.username || 'A').charAt(0).toUpperCase()}</div>
            <div><strong>${user.fullName || user.username || 'Administrator'}</strong><small>Administrator</small></div>
          </div>
        </header>
        <section class="page-content">${pageContent}</section>
      </main>`;

    document.getElementById('logoutButton').addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('libraryActiveUser');
        window.location.href = 'login.html';
      }
    });
  },

  bindMobileNav() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    toggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
  },

  notify(message, type = 'success') {
    let box = document.getElementById('notification');
    if (!box) {
      box = document.createElement('div');
      box.id = 'notification';
      document.body.appendChild(box);
    }
    box.className = `notification ${type} show`;
    box.textContent = message;
    clearTimeout(box.timer);
    box.timer = setTimeout(() => box.classList.remove('show'), 3500);
  },

  escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  formatDate(date) {
    if (!date) return '-';
    return new Date(`${date}T00:00:00`).toLocaleDateFormat ? '' : new Date(`${date}T00:00:00`).toLocaleDateString();
  }
};
