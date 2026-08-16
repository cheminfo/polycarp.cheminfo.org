import { Button, PopoverNext } from '@blueprintjs/core';
import { SvgLogoDoi } from 'cheminfo-font';
import { useCallback, useState } from 'react';

interface Props {
  doi: string;
  url: string;
}

function PopoverContent({ doi, url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback for non-HTTPS or older browsers
      const el = document.createElement('textarea');
      el.value = url;
      document.body.append(el);
      el.select();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand('copy');
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

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
        <Button
          size="small"
          icon={copied ? 'tick' : 'duplicate'}
          intent={copied ? 'success' : 'none'}
          onClick={() => {
            void handleCopy();
          }}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
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
