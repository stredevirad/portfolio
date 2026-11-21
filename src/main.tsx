import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { initPrefs } from './lib/prefs';
import './styles/tokens.css';
import './styles/global.css';
import './styles/sections.css';

initPrefs();

const root = document.getElementById('root');
if (root) {
  const app = <App initialPath={window.location.pathname} />;
  // Prerendered pages hydrate; the dev server (no prerender) renders from scratch.
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
