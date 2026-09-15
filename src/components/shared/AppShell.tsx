import { useSignals } from '@preact/signals-react/runtime';
import type { ReactNode } from 'react';
import type { NavItem } from 'react-cheminfo/ui';
import {
  CiteButton,
  EcosystemButton,
  NavLink,
  ShareButton,
  SiteFooter,
  SiteHeader,
} from 'react-cheminfo/ui';

import { ABOUT } from '../../about.ts';
import { ROUTES } from '../../routes.ts';
import { state } from '../../state/index.ts';
import { navigate } from '../../state/router.ts';

import { ShareDialog } from './ShareDialog.tsx';

/** The database is browsed in the NOMAD polymerization OASIS, not in-app. */
const NOMAD_DATA_URL = 'https://nomad-lab.eu/prod/v1/gui/search/polymerization';

const ABOUT_PATH = '/about';

/** The pages, at the left. About is a utility, so it is not one of them. */
const NAV = ROUTES.filter((route) => route.path !== ABOUT_PATH).map(
  (route) => ({
    id: route.path,
    label: route.label,
    href: route.path,
    onSelect: () => navigate(route.path),
  }),
);

const ABOUT_ITEM: NavItem = {
  id: ABOUT_PATH,
  label: 'About',
  icon: 'info-sign',
  href: ABOUT_PATH,
  onSelect: () => navigate(ABOUT_PATH),
};

const DATA_ITEM: NavItem = {
  id: 'data',
  label: 'Data',
  icon: 'database',
  href: NOMAD_DATA_URL,
  external: true,
  title: 'Browse the dataset in NOMAD',
};

/**
 * The site chrome: brand at the left, the pages next to it, the utilities
 * pushed right. An embedded page renders no chrome at all — what a course
 * frames already carries its own navigation.
 * @param root0 - Component props.
 * @param root0.children - The routed page.
 * @param root0.pageHasMain - True when the routed page renders its own main
 * landmark, so the shell wraps it in a plain block instead. Defaults to false.
 */
export function AppShell({
  children,
  pageHasMain = false,
}: {
  children: ReactNode;
  pageHasMain?: boolean;
}) {
  useSignals();
  const embedded = state.view.share.value.embed;
  const active = state.view.path.value;
  const Content = pageHasMain ? 'div' : 'main';

  if (embedded) return <Content className="app-content">{children}</Content>;

  return (
    <>
      <div className="app-screen">
        <SiteHeader
          siteId="polycarp"
          nav={NAV}
          activeId={active}
          onHome={() => navigate('/')}
          markSize={24}
          actions={
            <>
              <NavLink item={ABOUT_ITEM} active={active === ABOUT_PATH} />
              <NavLink item={DATA_ITEM} />
              <CiteButton works={ABOUT.cite ?? []} />
              <EcosystemButton currentSiteId="polycarp" />
              <ShareButton
                onClick={() => {
                  state.view.shareDialogOpen.value = true;
                }}
              />
            </>
          }
        />

        <Content className="app-content">{children}</Content>
      </div>
      <SiteFooter siteId="polycarp" />
      <ShareDialog />
    </>
  );
}
