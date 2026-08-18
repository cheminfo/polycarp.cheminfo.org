import { useSignals } from '@preact/signals-react/runtime';
import { ShareDialog as SharedShareDialog } from 'react-cheminfo/ui';

import { SITE_NAME, SITE_URL, routeForPath } from '../../routes.ts';
import { state } from '../../state/index.ts';
import { SHARE_VOCABULARY } from '../../state/shareConfig.ts';

/**
 * One dialog for the whole site: it offers the link and the iframe snippet,
 * built from the current address plus the configuration drafted here.
 */
export function ShareDialog() {
  useSignals();
  const path = state.view.path.value;
  const title = routeForPath(path).title;

  return (
    <SharedShareDialog
      isOpen={state.view.shareDialogOpen.value}
      onClose={() => (state.view.shareDialogOpen.value = false)}
      vocabulary={SHARE_VOCABULARY}
      title={title}
      baseUrl={`${SITE_URL}${path}`}
      frameTitle={`${SITE_NAME} — ${title}`}
    />
  );
}
