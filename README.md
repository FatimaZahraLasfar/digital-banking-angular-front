# Digital Banking — Angular Frontend

> Angular 21 client for the Digital Banking application, secured with JWT authentication via an HTTP interceptor and route guards.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Security Architecture](#security-architecture)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Features & Pages](#features--pages)
- [Services](#services)
- [Models](#models)
- [Routing & Guards](#routing--guards)
- [Commit History — Security Layer](#commit-history--security-layer)

---

## Overview

This is the Angular frontend for the Digital Banking use case. It communicates with a Spring Boot backend running on `http://localhost:8085`. After the security upgrade, every HTTP request automatically carries the JWT token obtained at login, and unauthenticated users are redirected to the login page before accessing any route.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components) |
| Language | TypeScript 5.9 |
| HTTP | Angular `HttpClient` + HTTP Interceptor |
| Forms | Angular Reactive Forms |
| Styles | Bootstrap 5.3 + Bootstrap Icons |
| State | RxJS 7.8 (Observables) |
| Auth | JWT stored in `localStorage` |

---

## Project Structure

```
src/app/
│
├── guards/
│   └── auth.guard.ts              # Redirects unauthenticated users to /login
│
├── interceptors/
│   └── app-http.interceptor.ts   # Injects Authorization: Bearer <token> on every request
│
├── services/
│   ├── auth.service.ts            # Login, logout, token management
│   ├── customer-service.ts        # Customer CRUD API calls
│   └── accounts.service.ts        # Account and operation API calls
│
├── model/
│   ├── customer_model.ts
│   └── account.model.ts
│
├── login/
│   ├── login.ts
│   └── login.html                 # Login form — username + password
│
├── navbar/
│   ├── navbar.ts                  # Shows username + logout button when authenticated
│   └── navbar.html
│
├── customers/
│   ├── customers.ts
│   └── customers.html             # Customer search + delete table
│
├── new-customer/
│   ├── new-customer.ts
│   └── new-customer.html          # Create customer form (ADMIN only)
│
├── accounts/
│   ├── accounts.ts
│   └── accounts.html              # Account search + operations form
│
├── app.routes.ts                  # Routes with canActivate guard
├── app.config.ts                  # provideHttpClient with interceptor
├── app.html
└── app.ts
```

---

## Security Architecture

```
User opens the app
      │
      ▼
AuthGuard checks localStorage for a valid JWT
      │
      ├── No token / expired  ──► redirect to /login
      │
      └── Token present ──► route activates normally
                                    │
                                    ▼
                          Component makes HTTP call
                                    │
                                    ▼
                          AppHttpInterceptor
                          adds header automatically:
                          Authorization: Bearer <token>
                                    │
                                    ▼
                          Spring Boot backend
                          validates token, returns data
```

### Key files added for security

| File | Role |
|---|---|
| `auth.service.ts` | Calls `POST /auth/login`, stores token in `localStorage`, exposes `isLoggedIn()` and `logout()` |
| `app-http.interceptor.ts` | Clones every outgoing request and injects the `Authorization` header |
| `auth.guard.ts` | `CanActivateFn` — reads the token; redirects to `/login` if absent |
| `login.ts` + `login.html` | Login form that calls `AuthService.login()` |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 11+
- Angular CLI 21: `npm install -g @angular/cli`
- The Spring Boot backend running on port `8085`

### 1. Clone the repository

```bash
git clone https://github.com/FatimaZahraLasfar/digital-banking-angular-front.git
cd digital-banking-angular-front
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
ng serve
```

App is available at `http://localhost:4200`.

---

## Environment Configuration

**`src/environments/environment.ts`** (development):
```typescript
export const environment = {
  production: false,
  backendHost: 'http://localhost:8085',
};
```

**`src/environments/environment.prod.ts`** (production):
```typescript
export const environment = {
  production: true,
  backendHost: 'https://your-production-api.com',
};
```

Change `backendHost` to point to your deployed backend.

---

## Features & Pages

### `/login`
- Reactive form with `username` and `password` fields
- Calls `AuthService.login()` on submit
- On success: stores the JWT token and navigates to `/customers`
- On failure: displays an error message

### `/customers`
- Search customers by keyword (calls `GET /customers/search?keyword=`)
- Table listing all results with Delete and Accounts buttons
- Delete button visible only to users with `ROLE_ADMIN`

### `/new-customer`
- Form to create a new customer (name + email with validation)
- Calls `POST /customers`
- Protected: only accessible to `ROLE_ADMIN` users (route guard + `@PreAuthorize` on backend)

### `/accounts`
- Search an account by ID → displays balance + paginated operation history
- Operations form: DEBIT / CREDIT / TRANSFER with amount and description
- The destination account field appears conditionally only for TRANSFER

### Navbar
- Shows the authenticated username and role
- Logout button calls `AuthService.logout()` and redirects to `/login`
- Hides Customers admin links when the user only has `ROLE_USER`

---

## Services

### `AuthService` — `services/auth.service.ts`

```typescript
login(username: string, password: string): Observable<LoginResponse>
logout(): void
getToken(): string | null
getUsername(): string | null
getRoles(): string[]
isLoggedIn(): boolean
isAdmin(): boolean
```

- Stores the `accessToken`, `username`, and `roles` from the backend response in `localStorage`.
- `logout()` clears `localStorage` and navigates to `/login`.

### `CustomerService` — `services/customer-service.ts`

| Method | HTTP | Endpoint |
|---|---|---|
| `getCustomers()` | GET | `/customers` |
| `searchCustomers(keyword)` | GET | `/customers/search?keyword=` |
| `getCustomerById(id)` | GET | `/customers/{id}` |
| `saveCustomer(customer)` | POST | `/customers` |
| `deleteCustomer(id)` | DELETE | `/customers/{id}` |

### `AccountsService` — `services/accounts.service.ts`

| Method | HTTP | Endpoint |
|---|---|---|
| `getAccount(id, page, size)` | GET | `/accounts/{id}/pageOperations` |
| `debit(accountId, amount, desc)` | POST | `/accounts/debit` |
| `credit(accountId, amount, desc)` | POST | `/accounts/credit` |
| `transfer(src, dest, amount, desc)` | POST | `/accounts/transfer` |

---

## Models

### `Customer`
```typescript
export interface Customer {
  id: number;
  name: string;
  email: string;
}
```

### `AccountDetails`
```typescript
export interface AccountDetails {
  accountId: string;
  balance: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  accountOperationDTOS: AccountOperation[];
}

export interface AccountOperation {
  id: number;
  operationDate: Date;
  amount: number;
  type: string;
  description: string;
}
```

### `LoginResponse` (new)
```typescript
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  roles: string[];
}
```

---

## Routing & Guards

**`app.routes.ts`** after the security update:

```typescript
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'customers', component: Customers, canActivate: [AuthGuard] },
  { path: 'accounts', component: Accounts, canActivate: [AuthGuard] },
  { path: 'new-customer', component: NewCustomer, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
];
```

**`app.config.ts`** after the security update — registers the interceptor:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([appHttpInterceptor])
    ),
  ],
};
```

**`auth.guard.ts`:**
```typescript
export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) return true;
  router.navigateByUrl('/login');
  return false;
};
```

**`app-http.interceptor.ts`:**
```typescript
export const appHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token),
    });
    return next(cloned);
  }
  return next(req);
};
```

---
