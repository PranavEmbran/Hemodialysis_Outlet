# Environment Variables Configuration

This document explains how to configure environment variables for the Dialysis App frontend.

## Overview

The frontend uses Vite, which requires all environment variables to be prefixed with `VITE_` to be accessible in the browser.

## Required Environment Variables

### 1. Data Mode Configuration

**Variable:** `VITE_DATA_MODE`

**Purpose:** Controls which data source the frontend uses.

**Values:**
- `mock` - Uses localStorage-based mock data (no backend required)
- `real` - Uses the Express + lowdb backend (default)
- `prod` - For future MSSQL backend integration

**Example:**
```bash
VITE_DATA_MODE=real
```

### 2. API URL Configuration

**Variable:** `VITE_API_URL`

**Purpose:** Override the default API URL if needed.

**Example:**
```bash
VITE_API_URL=http://192.168.50.50:5000/api
```

**Note:** If not set, the app will automatically determine the URL based on the current hostname.

## Setting Up Environment Variables

### Option 1: Create a `.env` file

Create a `.env` file in the project root:

```bash
# .env
VITE_DATA_MODE=real
VITE_API_URL=http://192.168.50.50:5000/api
```

### Option 2: Use system environment variables

Set the variables in your system or deployment environment:

```bash
export VITE_DATA_MODE=real
export VITE_API_URL=http://192.168.50.50:5000/api
```

### Option 3: Use `.env.local` for local development

Create a `.env.local` file (this will be ignored by git):

```bash
# .env.local
VITE_DATA_MODE=mock
VITE_API_URL=http://localhost:5000/api
```

## Environment File Priority

Vite loads environment files in this order (later files override earlier ones):

1. `.env`
2. `.env.local`
3. `.env.[mode]`
4. `.env.[mode].local`

## Troubleshooting

### Issue: `ReferenceError: process is not defined`

**Cause:** Using `process.env` instead of `import.meta.env` in frontend code.

**Solution:** Replace all `process.env` references with `import.meta.env` and ensure variables are prefixed with `VITE_`.

### Issue: Environment variables not accessible

**Cause:** Variables not prefixed with `VITE_`.

**Solution:** Add `VITE_` prefix to all environment variables used in the frontend.

### Issue: TypeScript errors with environment variables

**Solution:** The `vite-env.d.ts` file provides TypeScript definitions for environment variables.

## Development vs Production

### Development
```bash
VITE_DATA_MODE=mock
VITE_API_URL=http://localhost:5000/api
```

### Production
```bash
VITE_DATA_MODE=real
VITE_API_URL=https://your-production-api.com/api
```

## Security Note

All environment variables prefixed with `VITE_` are exposed to the browser. Do not include sensitive information like API keys or passwords in these variables. 