import { Icon } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactNode } from 'react';
import { EcosystemButton } from 'react-cheminfo/ui';

import type { RoutePath } from '../../routes.ts';
import { ROUTES } from '../../routes.ts';
import { state } from '../../state/index.ts';
import { navigate } from '../../state/router.ts';

import { BrandMark, Wordmark } from './Brand.tsx';
import { ShareDialog } from './ShareDialog.tsx';

/** The database is browsed in the NOMAD polymerization OASIS, not in-app. */
const NOMAD_DATA_URL =
  'https://nomad-lab.eu/prod/v1/oasis/gui/search/polymerization';

/**
 * The site chrome: brand at the left, the pages next to it, the utilities
 * pushed right. An embedded page renders no header at all — what a course
 * frames already carries its own navigation.
 * @param root0 - Component props.
 * @param root0.children - The routed page.
 */
export function AppShell({ children }: { children: ReactNode }) {
  useSignals();
  const embedded = state.view.share.value.embed;
  const active = state.view.path.value;

  if (embedded) return <div className="app-content">{children}</div>;

  return (
    <>
      <header className="app-header no-print">
        <div className="app-header__inner">
          <a
            href="/"
            className="brand"
            title="polycarp.cheminfo.org"
            onClick={(event) => {
              event.preventDefault();
              navigate('/');
            }}
          >
            <BrandMark size={24} />
            <Wordmark />
          </a>

          <nav className="app-header-nav">
            {ROUTES.map((route) => (
              <NavLink key={route.path} path={route.path} active={active}>
                {route.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-header-actions">
            <a
              className="nav-link"
              href={NOMAD_DATA_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="database" size={14} />
              Data
            </a>
            <EcosystemButton currentSiteId="polycarp" />
            <button
              type="button"
              className="nav-link"
              title="Share a link to this page, or embed it in your own site"
              onClick={() => (state.view.shareDialogOpen.value = true)}
            >
              <Icon icon="share" size={14} />
              Share
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">{children}</div>
      <ShareDialog />
    </>
  );
}

function NavLink({
  path,
  active,
  children,
}: {
  path: RoutePath;
  active: RoutePath;
  children: ReactNode;
}) {
  return (
    <a
      className={`nav-link${path === active ? ' nav-link--active' : ''}`}
      href={path}
      onClick={(event) => {
        event.preventDefault();
        navigate(path);
      }}
    >
      {children}
    </a>
  );
}
