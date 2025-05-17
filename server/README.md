# Store Traffic Server

This is the backend server for the Store Traffic Dashboard application. It simulates Kafka events, stores data in MongoDB, and provides real-time updates via Socket.IO.

## Features

- **Kafka Simulator:** Generates random customer traffic data to simulate Kafka events
- **MongoDB Storage:** Stores all customer traffic events in MongoDB
- **Real-time Updates:** Uses Socket.IO to push updates to connected clients
- **REST API:** Provides REST endpoints for historical data

## API Endpoints

- `GET /api/traffic/hourly` - Get hourly traffic data for the last 24 hours
- `GET /api/traffic/recent` - Get recent traffic events (default limit: 10)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or remote)
- npm or yarn

### Configuration

Create a `.env` file in the server directory with the following variables:

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/store-traffic
NODE_ENV=development
```

### Installation

```bash
cd server
npm install
```

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## Technical Implementation

- Built with TypeScript, Express, Socket.IO, and Mongoose
- Uses a service-oriented architecture
- Implements proper error handling and environment configuration
