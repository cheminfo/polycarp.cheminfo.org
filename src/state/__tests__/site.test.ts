import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

/**
 * The site as a deployment stamped it, loaded fresh so its mount is read again.
 * @param baseUri - What `document.baseURI` reads on the page handed out.
 * @returns The module, bound to that mount.
 */
async function siteMountedAt(baseUri: string) {
  vi.stubGlobal('document', { baseURI: baseUri });
  vi.resetModules();
  return import('../site.ts');
}

test('a deployment on a host of its own writes its addresses unchanged', async () => {
  const site = await siteMountedAt('https://polycarp.cheminfo.org/');

  expect(site.BASE_PATH).toBe('');
  expect(site.withBase('/')).toBe('/');
  expect(site.withBase('/predict')).toBe('/predict');
  expect(site.pathWithoutBase('/predict')).toBe('/predict');
});

test('a deployment mounted under a path writes every address under it', async () => {
  const site = await siteMountedAt('https://eln.epfl.ch/cheminfo/polycarp/');

  expect(site.BASE_PATH).toBe('/cheminfo/polycarp');
  expect(site.withBase('/')).toBe('/cheminfo/polycarp/');
  expect(site.withBase('/predict')).toBe('/cheminfo/polycarp/predict');
  expect(site.pathWithoutBase('/cheminfo/polycarp/predict')).toBe('/predict');
  expect(site.pathWithoutBase('/cheminfo/polycarp')).toBe('/');
});

test('the same build serves both addresses, because the mount is not built in', async () => {
  const own = await siteMountedAt('https://polycarp.cheminfo.org/');
  const shared = await siteMountedAt('https://eln.epfl.ch/cheminfo/polycarp/');

  expect(own.withBase('/about')).toBe('/about');
  expect(shared.withBase('/about')).toBe('/cheminfo/polycarp/about');
});

test('a page of another tool on the shared host is not read as one of ours', async () => {
  const site = await siteMountedAt('https://eln.epfl.ch/cheminfo/polycarp/');

  expect(site.pathWithoutBase('/cheminfo/surge/exercises')).toBe(
    '/cheminfo/surge/exercises',
  );
  expect(site.pathWithoutBase('/cheminfo/polycarpx')).toBe(
    '/cheminfo/polycarpx',
  );
});
