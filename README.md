# Blockchain Gateway

A Node.js/TypeScript gateway for blockchain-based draws, transfers, matches, and address management. Uses Express, Ethers.js, and Merkle Trees for secure, verifiable operations.

## Features

- REST API for blockchain draws, transfers, matches, and address management
- Merkle tree-based draw and winner selection
- Integration with Ethereum-compatible (chiliz in our case) blockchains via Ethers.js
- Configurable via `conf.json`
- Docker support for easy deployment

## Requirements

- Node.js v20+ (recommended v22)
- npm
- Docker (optional)

## Installation

```bash
npm install
```

## Configuration

- Copy `conf.example.json` to `conf.json` and edit as needed.
- Place contract ABI files in the `abi/` directory.
- Place address files in the `addresses/` directory (Temporary solutions).

## Build

```bash
npm run build
```

## Run

```bash
npm run start
```

## Development

- Use `npm run debug` for hot-reloading with nodemon.
- Use `npm run lint` and `npm run lint:fix` for code linting.

## Docker

Build and run the container:

```bash
docker build -t blockchain-gateway .
docker run -p 8080:8080 \
  -v $(pwd)/conf.json:/app/conf.json \
  -v $(pwd)/addresses:/app/addresses \
  blockchain-gateway
```

## API Endpoints

### Address Management (`/v1/address`)

- `POST   /v1/address/` — Create a new address (body: `{ userId: string }`)
- `GET    /v1/address/:addressId/balance` — Get main token balance for an address
- `GET    /v1/address/:addressId/balance/:token` — Get ERC20 token balance for an address
- `GET    /v1/address/:addressId/balance/nft` — Get NFT balances for an address in the collection we support
- `GET    /v1/address/:addressId/token/:token/tokenId/:tokenId/validity` — Check NFT token validity for an address
- `GET    /v1/address/:addressId/mintedToken` — Get minted tokens for a collection (to move to another collection route when multiple logical endpoint available)

### Transfer (`/v1/transfer`)

- `POST   /v1/transfer/erc20` — Transfer ERC20 tokens (body: `{ from, to, amount, token }`)
- `POST   /v1/transfer/main` — Transfer main chain tokens (body: `{ from, to, amount }`)
- `POST   /v1/transfer/nft` — Transfer NFT tokens (body: `{ from, to, amount, token, tokenId }`)

### Match (`/v1/match`)

- `POST   /v1/match/` — Commit a match summary (body: `{ matchSummary: [{ userId, score }], location }`)
- `GET    /v1/match/:transactionHash` — Get match summary commited in a given transaction

### Draw (`/v1/draw`)

- `POST   /v1/draw/` — Create a new draw (body: `[address1, address2, ...]`)
- `GET    /v1/draw/:drawId` — Get draw parameters for verification

## Project Structure

```
abi/            # Contract ABIs
addresses/      # Addresses files
conf.json       # Configuration file
src/            # Source code
  modules/      # Feature modules
    address/
    draw/
    match/
    transfer/
  tools/        # Utility
  main.ts       # Entry point
```

---
