import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
} from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useState } from 'react';

import { SITE_URL, routeForPath } from '../../routes.ts';
import { state } from '../../state/index.ts';
import type { HideKey, ShareConfig } from '../../state/shareConfig.ts';
import { HIDEABLE_FEATURES, shareUrl } from '../../state/shareConfig.ts';

// Inside a host page these repeat what the course already shows, so the dialog
// opens on the link somebody building a course tile would actually hand out.
const HIDDEN_BY_DEFAULT: HideKey[] = ['architecture'];

function initialDraft(current: ShareConfig): ShareConfig {
  if (current.embed || current.hide.length > 0) return current;
  return { embed: true, hide: HIDDEN_BY_DEFAULT };
}

/**
 * One dialog for the whole site: it offers the link and the iframe snippet,
 * built from the current address plus the configuration drafted here.
 */
export function ShareDialog() {
  useSignals();
  const isOpen = state.view.shareDialogOpen.value;
  const path = state.view.path.value;
  const [draft, setDraft] = useState<ShareConfig>(() =>
    initialDraft(state.view.share.value),
  );

  const search =
    globalThis.location === undefined ? '' : globalThis.location.search;
  const url = shareUrl(SITE_URL, path, draft, search);
  const title = routeForPath(path).title;
  const iframe = `<iframe\n  src="${url}"\n  width="100%"\n  height="700"\n  style="border: 1px solid #ddd; border-radius: 8px"\n  title="PolyCarp — ${title}"\n></iframe>`;

  function toggleHidden(key: HideKey, visible: boolean) {
    setDraft((previous) => ({
      ...previous,
      hide: visible
        ? previous.hide.filter((k) => k !== key)
        : [...previous.hide, key],
    }));
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => (state.view.shareDialogOpen.value = false)}
      title="Share this page"
      icon="share"
      style={{ width: 640 }}
    >
      <DialogBody>
        <section className="share-section">
          <h4>Layout</h4>
          <Checkbox
            checked={draft.embed}
            onChange={(e) =>
              setDraft({ ...draft, embed: e.currentTarget.checked })
            }
            label="Embedded — drop the header and navigation"
          />
        </section>

        <section className="share-section">
          <h4>Show on the page</h4>
          {HIDEABLE_FEATURES.map((feature) => (
            <div key={feature.key} className="share-feature">
              <Checkbox
                checked={!draft.hide.includes(feature.key)}
                onChange={(e) =>
                  toggleHidden(feature.key, e.currentTarget.checked)
                }
                label={feature.label}
              />
              <p className="share-feature-note">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="share-section">
          <h4>Link</h4>
          <code className="share-code">{url}</code>
          <div className="share-actions">
            <Button
              icon="duplicate"
              onClick={() => void navigator.clipboard?.writeText(url)}
            >
              Copy link
            </Button>
            <Button
              icon="share"
              onClick={() => globalThis.open(url, '_blank', 'noopener')}
            >
              Open in a new tab
            </Button>
          </div>
        </section>

        <section className="share-section">
          <h4>Iframe</h4>
          <code className="share-code share-code--block">{iframe}</code>
          <div className="share-actions">
            <Button
              icon="duplicate"
              onClick={() => void navigator.clipboard?.writeText(iframe)}
            >
              Copy iframe
            </Button>
          </div>
        </section>
      </DialogBody>
      <DialogFooter
        actions={
          <Button
            intent="primary"
            onClick={() => (state.view.shareDialogOpen.value = false)}
          >
            Done
          </Button>
        }
      />
    </Dialog>
  );
}
