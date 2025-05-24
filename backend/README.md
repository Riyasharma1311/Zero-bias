# Heart Sync FastAPI Backend

A scalable medical application backend built with FastAPI for managing patient data and health predictions.

## Features

- Async API operations
- JWT-based authentication
- Role-based access control
- Medical data management
- Risk prediction API
- Secure file handling

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scriptsctivate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the application is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

## Development

- Uses SQLite with Prisma for database operations
- Implements async operations for better performance
- Includes comprehensive test suite
- Follows type hints throughout the codebase
