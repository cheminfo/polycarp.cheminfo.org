import type { Template } from './monomers.ts';

export const SOLVENTS: Template[] = [
  { name: 'Benzene', smiles: 'c1ccccc1' },
  { name: 'Toluene', smiles: 'Cc1ccccc1' },
  { name: 'Water', smiles: 'O' },
  { name: 'DMF', smiles: 'CN(C)C=O' },
  { name: 'Dioxane', smiles: 'C1COCCO1' },
  { name: 'THF', smiles: 'C1CCOC1' },
  { name: 'Heptane', smiles: 'CCCCCCC' },
  { name: 'DMSO', smiles: 'CS(C)=O' },
  { name: 'Methyl ethyl ketone', smiles: 'CCC(C)=O' },
  { name: 'Dichloromethane', smiles: 'ClCCl' },
  { name: 'Acetone', smiles: 'CC(C)=O' },
  { name: 'Methanol', smiles: 'CO' },
  { name: 'Chloroform', smiles: 'ClC(Cl)Cl' },
  { name: 'Acetonitrile', smiles: 'CC#N' },
  { name: 'Cyclohexane', smiles: 'C1CCCCC1' },
  { name: 'tert-Butanol', smiles: 'CC(C)(C)O' },
  { name: 'Ethyl acetate', smiles: 'CCOC(C)=O' },
  { name: 'Cyclohexanone', smiles: 'O=C1CCCCC1' },
];
