import { SmilesSvgRenderer } from 'react-ocl';

interface Props {
  smiles: string;
  width?: number;
  height?: number;
}

/**
 * Renders a SMILES string as an SVG molecule diagram.
 * @param root0
 * @param root0.smiles
 * @param root0.width
 * @param root0.height
 */
export function MoleculeDisplay({ smiles, width = 120, height = 90 }: Props) {
  if (!smiles) return <span style={{ color: '#999', fontSize: 11 }}>—</span>;
  return <SmilesSvgRenderer smiles={smiles} width={width} height={height} />;
}
