# kkm-pulse-demo

Dynatrace Hands-On Workshop App for KKM — simulates a hospital clinic queue dashboard with a chaos engineering endpoint to demonstrate Dynatrace Davis AI anomaly detection.

## Project Structure

```
kkm-pulse-demo/
├── package.json
├── server.js
├── Dockerfile
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── views/
│   └── index.html
└── test/
    └── server.test.js
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v8+
- [Docker](https://www.docker.com/) (for containerized builds)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) + a running Kubernetes cluster (for deployment)

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app

```bash
npm start
```

The app will start on [http://localhost:3000](http://localhost:3000).

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Hospital queue dashboard (HTML) |
| GET | `/api/status` | Returns live simulated clinic metrics as JSON |
| GET | `/api/trigger-anomaly` | Injects a 3-second CPU spike to trigger a Dynatrace Davis AI alert |

### 3. Run tests

```bash
npm test
```

Uses [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest) to test the API endpoints.

---

## Docker

### Build the Docker image

```bash
docker build -t kkm-pulse-demo:latest .
```

### Run the container locally

```bash
docker run -p 3000:3000 kkm-pulse-demo:latest
```

The app will be accessible at [http://localhost:3000](http://localhost:3000).

### Tag and push to a registry (optional)

```bash
# Replace <your-registry> with your Docker Hub username or private registry
docker tag kkm-pulse-demo:latest <your-registry>/kkm-pulse-demo:latest
docker push <your-registry>/kkm-pulse-demo:latest
```

---

## Kubernetes Deployment

Kubernetes manifests are located in the [k8s/](k8s/) directory.

### Prerequisites

Ensure `kubectl` is configured to point at your target cluster:

```bash
kubectl cluster-info
```

### Deploy

Apply the Deployment and Service manifests:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Or apply the entire directory at once:

```bash
kubectl apply -f k8s/
```

### Verify the deployment

```bash
# Check pods are running
kubectl get pods -l app=kkm-pulse-demo

# Check service
kubectl get svc kkm-pulse-demo

# View pod logs
kubectl logs -l app=kkm-pulse-demo --tail=50
```

### Access the app

If using `NodePort` (default in the service manifest), access the app at:

```
http://<node-ip>:30080
```

To get the node IP:

```bash
kubectl get nodes -o wide
```

If using a cloud provider with a LoadBalancer, watch for the external IP:

```bash
kubectl get svc kkm-pulse-demo --watch
```

### Tear down

```bash
kubectl delete -f k8s/
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the Express server listens on |
