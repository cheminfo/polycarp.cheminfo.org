# PolyCarp

Copolymer reactivity prediction — a machine-learning tool that predicts the microstructure (alternating, random to block-like, or gradient) of radical copolymers from a monomer pair, solvent and reaction conditions.

The frontend is a React/Vite application served by nginx, which also reverse-proxies `/api/` to the backend. The backend is the [copolymer-reactivity](https://github.com/lamalab-org/copolymer-reactivity) Python/FastAPI service, built outside this repository.

## Local development

```sh
cp .env.example .env
npm install
npm run dev
```

The dev server runs on <http://localhost:10430> and proxies `/api` to `VITE_API_PROXY` (default: the live deployment), so `npm run dev` works with no local backend. Point it at your own with `VITE_API_PROXY=http://localhost:8000`.

Both ports derive from the repository's first commit date (2026-04-29 → 6+04+29 = 60429, over 60000 so minus 50000): the container publishes `PORT` 10429 on the host, and the dev server takes `PORT + 1`. `VITE_PORT` overrides the latter.

Checks — `npm run test` runs all of them (tests, type-check, ESLint, Prettier):

```sh
npm run test-only      # vitest with coverage
npm run test-e2e       # Playwright against the dev server, with /api answered from a fixture
npm run check-types    # tsc --noEmit
npm run eslint-fix
npm run prettier-write
npm run build          # production build into dist/
```

## Environment

| Variable          | Used by                    | Meaning                                                                                                                                          |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `COMPOSE_FILE`    | docker compose             | Selects the deployment mode; uncomment exactly one line in `.env`.                                                                               |
| `IMAGE_NAME`      | compose                    | Image this repository publishes (`ghcr.io/cheminfo/polycarp.cheminfo.org`).                                                                      |
| `IMAGE_TAG`       | compose                    | Rewritten by the server's deploy script — never edit by hand.                                                                                    |
| `BACKEND_IMAGE`   | compose                    | Prediction backend image.                                                                                                                        |
| `PORT`            | `compose.yaml`             | Host port (10429, derived from the first commit date); the container always serves on 80.                                                        |
| `DOMAIN`          | `compose.traefik.yaml`     | Public hostname routed by Traefik.                                                                                                               |
| `TUNNEL_TOKEN`    | `compose.cloudflared.yaml` | Cloudflare Tunnel token.                                                                                                                         |
| `TRACKING_SCRIPT` | container startup          | Analytics snippet, injected at the end of `<head>` of the served page. Unset means nothing is loaded, so a `npm run dev` session tracks nothing. |
| `VITE_API_URL`    | build                      | API base URL baked into the bundle; keep the default `/api`.                                                                                     |

## Deployment

Copy the template, then choose a mode by uncommenting exactly one `COMPOSE_FILE` line in `.env`:

```sh
cp .env.example .env
docker compose up -d          # pull the released image
docker compose up -d --build  # or build from this checkout
```

| `COMPOSE_FILE`                      | Exposure                                                 |
| ----------------------------------- | -------------------------------------------------------- |
| `compose.yaml` (default when unset) | Publishes `PORT` on the host (`http://localhost:10429`). |
| `compose.traefik.yaml`              | Behind an existing Traefik instance, at `${DOMAIN}`.     |
| `compose.cloudflared.yaml`          | Behind a Cloudflare Tunnel, no published port.           |

**Traefik** requires an external Docker network named `traefik` with a `websecure` entrypoint and a `letsencrypt` cert resolver. Set `DOMAIN` in `.env` (default `polycarp.cheminfo.org`).

**Cloudflare Tunnel** — in the [Cloudflare dashboard](https://dash.cloudflare.com): Networking → Tunnels → Create a tunnel → Cloudflared connector → copy the token into `.env` as `TUNNEL_TOKEN=...` → open the tunnel → Published applications tab → add an application with Service = HTTP, URL = `frontend:80`.

Deployment on our servers is driven by a global `deploy.sh` installed on the host, which rewrites `IMAGE_TAG` and can roll back — do not run `git pull && docker compose up -d --build` by hand.

## Addresses the tool understands

Every page is a real address, so a link reproduces exactly what its author was
looking at, and a crawler gets a page with its own title and description.

| Path        | Page               |
| ----------- | ------------------ |
| `/`         | Prediction         |
| `/results`  | Model performance  |
| `/api-docs` | REST API reference |
| `/guide`    | User guide         |
| `/about`    | About              |

Two query parameters configure a shared or embedded page. An unknown `hide` key
is ignored, so a link written before a feature was renamed still opens.

| Parameter | Meaning                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------- |
| `embed`   | Drop the site chrome — header, navigation, external links. `?embed` and `?embed=1` are equivalent. |
| `hide`    | Comma-separated features to switch off: `templates`, `optimization`, `architecture`, `literature`. |

A hidden control still applies the value the link carries, so an embedder can
preset conditions the visitor cannot change. The Share button in the header
builds both the link and the iframe snippet:

```html
<iframe
  src="https://polycarp.cheminfo.org/?embed=1&hide=architecture"
  width="100%"
  height="700"
  style="border: 1px solid #ddd; border-radius: 8px"
  title="PolyCarp — Prediction"
></iframe>
```

## Server routes

| Path                          | Serves                                                                      |
| ----------------------------- | --------------------------------------------------------------------------- |
| `/api/`                       | Reverse-proxied to the prediction backend.                                  |
| `/view/`                      | The legacy cheminfo visualizer view (`html/`, driven by `views/script.js`). |
| `/robots.txt`, `/sitemap.xml` | Generated from the route table at build time.                               |
| `/healthz`                    | Health probe.                                                               |
