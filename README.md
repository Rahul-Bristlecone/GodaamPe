# GodaamPe Frontend (ABS Suite)

GodaamPe is a React + Vite frontend for the ABS Suite workflow. It provides a login experience, a dashboard launcher, and multiple operations pages such as pick, stock, pricing, alias management, and table/config management.

## Tech Stack

- React 19
- Vite 8
- ESLint 9
- Plain CSS (module-level styles under `src/styles`)

## Features

- JWT-based login and logout flow
- Dashboard with quick access cards for all ABS modules
- App-level page switching without external routing
- Reusable auth utility for authenticated API requests
- API utility modules for store and upload/order workflows

## Project Structure

```text
.
|- src/
|  |- App.jsx                  # App shell, auth state, page switching
|  |- pages/
|  |  |- LoginPage.jsx         # Username/password login
|  |  |- DashboardPage.jsx     # Card-based navigation hub
|  |  |- PickPage.jsx
|  |  |- ConfigManagerPage.jsx
|  |  |- SalesManagerPage.jsx
|  |  |- ProductTablePage.jsx
|  |  |- CompanyTablePage.jsx
|  |  |- CustomerTablePage.jsx
|  |  |- LocationsTablePage.jsx
|  |  |- PriceListPage.jsx
|  |  |- AliasManagerPage.jsx
|  |  |- LogDisplayPage.jsx
|  |  |- StockPage.jsx
|  |  |- ReportViewerPage.jsx
|  |- utils/
|  |  |- authService.js        # Token/username storage + auth fetch helpers
|  |  |- storeService.js       # Store/location CRUD API wrappers
|  |  |- uploadService.js      # EDI upload + orders API wrappers
|  |- components/
|  |  |- Header.jsx            # Shared header component
|  |- styles/                  # Page/component styles
|- FLASK_SETUP.md              # Flask-side integration notes
|- FLOW_DIAGRAM.md             # Mermaid flow diagrams
```

## Module Navigation

After login, users land on the dashboard and can open:

- ABS Pick
- Config Manager
- Sales Manager
- Product Table
- Company Table
- Customer Table
- Locations Table
- ABS Price list
- ABS Alias manager
- ABS Log display
- ABS Stock
- ABS Report viewer

## API Integration

Current frontend code calls these backend services:

- Login API: `http://127.0.0.1:5001/login`
- Logout API: `http://127.0.0.1:49886/logout`
- Store APIs: `http://127.0.0.1:5002/create_store`, `http://127.0.0.1:5002/stores`
- Upload/Orders APIs: `http://127.0.0.1:5002/upload_edi`, `http://127.0.0.1:5002/orders`

For backend CORS and Flask integration details, see `FLASK_SETUP.md`.

## Local Development

### Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- Flask backend services running on expected ports

### Install

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

Default Vite URL:

- `http://localhost:5173`

### Build

```bash
npm run build
```

## Docker Build And Run

For a containerized frontend, remember that Vite injects `VITE_*` variables at build time, not when the container starts. That means the image must be built with browser-reachable backend URLs.

Example build for a backend running on the same Windows host:

```bash
docker build -t godaampe:v1 \
	--build-arg VITE_USER_SERVICE_URL=http://host.docker.internal:5001 \
	--build-arg VITE_STORE_SERVICE_URL=http://host.docker.internal:5002 \
	--build-arg VITE_ORDER_SERVICE_URL=http://host.docker.internal:5003 \
	.
```

Run the frontend container:

```bash
docker run -d --name godaampe-frontend -p 3000:3000 godaampe:v1
```

If your backend is exposed directly on the host at `localhost`, you can also bake those URLs instead:

```bash
docker build -t godaampe:v1 \
	--build-arg VITE_USER_SERVICE_URL=http://localhost:5001 \
	--build-arg VITE_STORE_SERVICE_URL=http://localhost:5002 \
	--build-arg VITE_ORDER_SERVICE_URL=http://localhost:5003 \
	.
```

Use `host.docker.internal` when the frontend container must call services running on the host machine. Use Docker service names like `user-service` only when the browser itself can resolve them, which is generally not the case when the React app is served as static assets and executed in the user's browser.

### Preview Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Authentication Flow (Summary)

1. User enters username/password on Login page.
2. Frontend POSTs credentials to login API.
3. On success, JWT token and username are stored in localStorage.
4. App switches to dashboard and enables authenticated calls.
5. Logout calls backend logout endpoint and always clears local auth state.

See complete diagrams in `FLOW_DIAGRAM.md`.

## Configuration Notes

- API URLs are currently hardcoded inside utility/page files.
- Recommended next step is to move all API base URLs to Vite environment variables (for dev/stage/prod switching).

## Troubleshooting

- Login fails with CORS error: verify Flask CORS setup in `FLASK_SETUP.md`.
- Login fails with 4xx/5xx: verify backend URL/port and credentials.
- Token-related issues: check browser localStorage keys `authToken` and `username`.

## Documentation

- Main backend setup guide: `FLASK_SETUP.md`
- System flow diagrams: `FLOW_DIAGRAM.md`
