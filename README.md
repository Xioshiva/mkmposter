# mkmposter
Getting prices and posting your cards on MKM dynamically from a desktop app

A React Next.js, Node.js SQLite desktop app that uses Magic Card Market API to price cards and manage your collection.

## Features

- Fetch your collection with MKM API
- Show recommended prices based on market options
- Post cards to MKM marketplace
- Local SQLite database for collection management
- Desktop app functionality with Electron

## Getting Started

First, install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build and run the desktop app:

```bash
npm run electron-dev
```

## Environment Setup

Create a `.env.local` file with your MKM API credentials:

```
MKM_API_KEY=your_api_key
MKM_API_SECRET=your_api_secret
MKM_ACCESS_TOKEN=your_access_token
MKM_ACCESS_TOKEN_SECRET=your_access_token_secret
```
