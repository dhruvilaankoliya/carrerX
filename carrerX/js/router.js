/* ==========================================================================
   CareerX - Client-Side Router (Hash-based navigation)
   ========================================================================== */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentView = null;
    this.currentRoute = 'home';
  }

  register(name, factory) {
    this.routes.set(name, factory);
    return this;
  }

  navigate(name) {
    // Destroy previous view if cleanup needed
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }

    this.currentRoute = name;
    window.location.hash = `#${name}`;
    this._render(name);
    this._updateNav(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _render(name) {
    const appView = document.getElementById('app-view');
    if (!appView) return;

    const factory = this.routes.get(name) || this.routes.get('home');
    this.currentView = factory(appView);
    if (this.currentView && typeof this.currentView.render === 'function') {
      this.currentView.render();
    }
  }

  _updateNav(name) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkRoute = link.dataset.route;
      if (linkRoute === name) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  start() {
    const hash = window.location.hash.replace('#', '') || 'home';
    this._render(hash);
    this._updateNav(hash);

    window.addEventListener('hashchange', () => {
      const route = window.location.hash.replace('#', '') || 'home';
      if (route !== this.currentRoute) {
        this.currentRoute = route;
        if (this.currentView && typeof this.currentView.destroy === 'function') {
          this.currentView.destroy();
        }
        this._render(route);
        this._updateNav(route);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

export const router = new Router();
