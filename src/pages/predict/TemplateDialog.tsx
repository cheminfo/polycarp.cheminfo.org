import { Dialog, DialogBody } from '@blueprintjs/core';

import { MoleculeDisplay } from './MoleculeDisplay.tsx';
import type { Template } from './data/monomers.ts';

interface Props {
  isOpen: boolean;
  title: string;
  templates: Template[];
  onSelect: (smiles: string) => void;
  onClose: () => void;
}

/**
 * Modal grid of molecule templates the user can click to pre-fill an editor.
 * @param root0
 * @param root0.isOpen
 * @param root0.title
 * @param root0.templates
 * @param root0.onSelect
 * @param root0.onClose
 */
export function TemplateDialog({
  isOpen,
  title,
  templates,
  onSelect,
  onClose,
}: Props) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      style={{ width: 700 }}
    >
      <DialogBody>
        <div className="template-grid">
          {templates.map((t) => (
            <button
              key={t.smiles}
              type="button"
              className="template-item"
              onClick={() => onSelect(t.smiles)}
            >
              <MoleculeDisplay smiles={t.smiles} width={110} height={80} />
              <div className="template-name">{t.name}</div>
            </button>
          ))}
        </div>
      </DialogBody>
    </Dialog>
  );
}
