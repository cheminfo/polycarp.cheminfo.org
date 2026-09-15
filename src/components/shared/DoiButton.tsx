import { Button, PopoverNext } from '@blueprintjs/core';
import { SvgLogoDoi } from 'cheminfo-font';
import { CopyButton } from 'react-cheminfo/ui';

interface Props {
  doi: string;
  url: string;
}

/** How long the copy stays confirmed, in milliseconds. */
const COPY_RESET_AFTER = 2000;

function PopoverContent({ doi, url }: Props) {
  return (
    <div style={{ padding: '10px 14px', maxWidth: 380, minWidth: 220 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          color: '#738091',
          marginBottom: 5,
        }}
      >
        DOI
      </div>
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 12,
          wordBreak: 'break-all',
          color: '#1c2127',
          marginBottom: 10,
          lineHeight: 1.5,
        }}
      >
        {doi}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <CopyButton
          small
          content={url}
          label="Copy link"
          copiedLabel="Copied!"
          resetAfter={COPY_RESET_AFTER}
          title="Copy the DOI link"
        />
        <Button
          size="small"
          variant="minimal"
          icon="share"
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        >
          Open
        </Button>
      </div>
    </div>
  );
}

/**
 * Shows a hover popover with the DOI text, a copy button, and an open link.
 * @param root0
 * @param root0.doi
 * @param root0.url
 */
export function DoiButton({ doi, url }: Props) {
  return (
    <PopoverNext
      content={<PopoverContent doi={doi} url={url} />}
      interactionKind="hover"
      hoverOpenDelay={200}
      hoverCloseDelay={300}
      placement="top"
    >
      <button
        type="button"
        style={{
          background: 'none',
          border: 'none',
          padding: '0 2px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          opacity: 0.85,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '0.85';
        }}
        aria-label={`DOI: ${doi}`}
      >
        <SvgLogoDoi width={22} height={22} />
      </button>
    </PopoverNext>
  );
}
