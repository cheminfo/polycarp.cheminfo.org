import { Button, HTMLSelect, Icon, InputGroup } from '@blueprintjs/core';
import { useMemo, useState } from 'react';

import { archColor } from '../../archColors.ts';
import { DoiButton } from '../../components/shared/DoiButton.tsx';
import type { NearestNeighbor } from '../../types.ts';

import { MoleculeDisplay } from './MoleculeDisplay.tsx';

interface Props {
  neighbors: NearestNeighbor[];
}

/** Columns that can be sorted, mapped to the field used for comparison. */
type SortKey = 'temperature' | 'method' | 'polytype' | 'arch' | 'similarity';

interface SortState {
  key: SortKey;
  dir: 'asc' | 'desc';
}

/** Default ordering matches the API response: similarity, descending. */
const DEFAULT_SORT: SortState = { key: 'similarity', dir: 'desc' };

const ALL_ARCH = '__all__';

/**
 * Returns the comparable value for a neighbor under a given sort key.
 * Numbers sort numerically; everything else sorts case-insensitively.
 * @param n - The neighbor row.
 * @param key - The active sort key.
 */
function sortValue(n: NearestNeighbor, key: SortKey): number | string {
  switch (key) {
    case 'temperature':
      return n.temperature;
    case 'similarity':
      return n.similarity;
    case 'method':
      return n.method.toLowerCase();
    case 'polytype':
      return n.polytype.toLowerCase();
    case 'arch':
      return n.predicted_class_name.toLowerCase();
    default:
      throw new Error(`Unknown sort key: ${String(key)}`);
  }
}

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
}

/**
 * Clickable, sortable column header with a sort-direction indicator.
 * @param root0
 * @param root0.label - Visible header text.
 * @param root0.sortKey - The sort key this header controls.
 * @param root0.sort - The current table sort state.
 * @param root0.onSort - Callback invoked with this header's sort key.
 */
function SortHeader({ label, sortKey, sort, onSort }: SortHeaderProps) {
  const active = sort.key === sortKey;
  return (
    <th
      className={`nearest-th-sort${active ? ' is-active' : ''}`}
      aria-sort={
        active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        className="nearest-th-inner"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <Icon
          className="nearest-sort-icon"
          icon={
            active
              ? sort.dir === 'asc'
                ? 'chevron-up'
                : 'chevron-down'
              : 'double-caret-vertical'
          }
          size={12}
        />
      </button>
    </th>
  );
}

/**
 * Table of nearest database neighbors for the current monomer pair.
 * The table is sortable by clicking column headers (Temp, Method, Type,
 * Architecture, Similarity) and filterable by architecture class and a
 * free-text query matching solvent / method / type.
 * @param root0
 * @param root0.neighbors
 */
export function NearestResults({ neighbors }: Props) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [archFilter, setArchFilter] = useState<string>(ALL_ARCH);
  const [query, setQuery] = useState('');

  /** Distinct architecture classes present in the data, alphabetically. */
  const archOptions = useMemo(() => {
    const distinct = [
      ...new Set(neighbors.map((n) => n.predicted_class_name)),
    ].toSorted((a, b) => a.localeCompare(b));
    return [
      { label: 'All architectures', value: ALL_ARCH },
      ...distinct.map((a) => ({ label: a, value: a })),
    ];
  }, [neighbors]);

  /** Neighbors after applying the architecture and free-text filters. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return neighbors.filter((n) => {
      if (archFilter !== ALL_ARCH && n.predicted_class_name !== archFilter) {
        return false;
      }
      if (q.length > 0) {
        const haystack = `${n.solvent_name} ${n.method} ${n.polytype}`;
        if (!haystack.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [neighbors, archFilter, query]);

  /**
   * Filtered neighbours sorted by the active column and direction.
   *
   * Same-monomer rows are pinned to the top regardless of the chosen sort —
   * an exact-pair literature reaction is always the most relevant evidence,
   * and we don't want a similarity-asc sort to bury it beneath dissimilar
   * pairs that happen to share the query's solvent.
   */
  const rows = useMemo(() => {
    const sorted = filtered.toSorted((a, b) => {
      if (Boolean(a.same_monomer) !== Boolean(b.same_monomer)) {
        return a.same_monomer ? -1 : 1;
      }
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb));
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filtered, sort]);

  if (neighbors.length === 0) return null;

  /**
   * Toggles sort direction for a column, or activates it descending-first.
   * @param key - The column's sort key.
   */
  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' },
    );
  }

  const filterActive = archFilter !== ALL_ARCH || query.trim().length > 0;

  return (
    <div className="nearest-card">
      <h2>Nearest database results</h2>

      <div className="nearest-controls">
        <HTMLSelect
          className="nearest-arch-filter"
          value={archFilter}
          onChange={(e) => setArchFilter(e.target.value)}
          options={archOptions}
          aria-label="Filter by architecture class"
        />
        <InputGroup
          className="nearest-text-filter"
          leftIcon="search"
          placeholder="Filter solvent / method / type…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {filterActive && (
          <>
            <span className="nearest-count">
              showing {rows.length} of {neighbors.length}
            </span>
            <Button
              size="small"
              variant="minimal"
              icon="cross"
              onClick={() => {
                setArchFilter(ALL_ARCH);
                setQuery('');
              }}
            >
              Clear
            </Button>
          </>
        )}
      </div>

      <div className="nearest-table-wrap">
        <table className="nearest-table">
          <thead>
            <tr>
              <th>Monomer 1</th>
              <th>Monomer 2</th>
              <th>Solvent</th>
              <SortHeader
                label="Temp (°C)"
                sortKey="temperature"
                sort={sort}
                onSort={toggleSort}
              />
              <SortHeader
                label="Method"
                sortKey="method"
                sort={sort}
                onSort={toggleSort}
              />
              <SortHeader
                label="Type"
                sortKey="polytype"
                sort={sort}
                onSort={toggleSort}
              />
              <SortHeader
                label="Architecture"
                sortKey="arch"
                sort={sort}
                onSort={toggleSort}
              />
              <SortHeader
                label="Similarity"
                sortKey="similarity"
                sort={sort}
                onSort={toggleSort}
              />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="nearest-empty" colSpan={8}>
                  No results match the current filters.
                </td>
              </tr>
            ) : (
              rows.map((n) => (
                <tr
                  key={n.rank}
                  className={n.same_monomer ? 'is-same-monomer' : undefined}
                >
                  <td>
                    {n.same_monomer && (
                      <span
                        className="same-monomer-badge"
                        title="This literature reaction uses the exact same monomer pair as your query."
                      >
                        same monomers
                      </span>
                    )}
                    <MoleculeDisplay
                      smiles={n.monomer1_smiles}
                      width={100}
                      height={75}
                    />
                  </td>
                  <td>
                    <MoleculeDisplay
                      smiles={n.monomer2_smiles}
                      width={100}
                      height={75}
                    />
                  </td>
                  <td>{n.solvent_name}</td>
                  <td>{n.temperature}</td>
                  <td>{n.method}</td>
                  <td>{n.polytype}</td>
                  <td>
                    <span
                      className="arch-badge"
                      style={{ background: archColor(n.predicted_class_name) }}
                    >
                      {n.predicted_class_name}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span className="similarity-badge">
                        {n.similarity.toFixed(2)}
                      </span>
                      {n.doi_url && (
                        <DoiButton doi={n.doi ?? n.doi_url} url={n.doi_url} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
