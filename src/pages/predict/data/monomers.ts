export interface Template {
  name: string;
  smiles: string;
}

export const MONOMERS: Template[] = [
  { name: 'Styrene', smiles: 'C=Cc1ccccc1' },
  { name: 'Methyl methacrylate', smiles: 'C=C(C)C(=O)OC' },
  { name: 'Acrylonitrile', smiles: 'C=CC#N' },
  { name: 'Ethylene', smiles: 'C=C' },
  { name: 'Vinyl acetate', smiles: 'C=COC(C)=O' },
  { name: 'Methyl acrylate', smiles: 'C=CC(=O)OC' },
  { name: 'Butyl acrylate', smiles: 'C=CC(=O)OCCCC' },
  { name: 'Propylene', smiles: 'CC=C' },
  { name: 'Butadiene', smiles: 'C=CC=C' },
  { name: 'Acrylamide', smiles: 'C=CC(N)=O' },
  { name: 'Acrylic acid', smiles: 'C=CC(=O)O' },
  { name: 'Maleic anhydride', smiles: 'O=C1C=CC(=O)O1' },
  { name: 'Methacrylic acid', smiles: 'C=C(C)C(=O)O' },
  { name: 'Vinyl chloride', smiles: 'C=CCl' },
  { name: 'Glycidyl methacrylate', smiles: 'C=C(C)C(=O)OCC1CO1' },
  { name: '2-Hydroxyethyl methacrylate', smiles: 'C=C(C)C(=O)OCCO' },
  { name: 'N-Vinyl pyrrolidone', smiles: 'C=CN1CCCC1=O' },
  { name: '1-Hexene', smiles: 'C=CCCCC' },
  { name: 'Isoprene', smiles: 'C=CC(=C)C' },
  { name: 'Methacrylonitrile', smiles: 'C=C(C)C#N' },
];
