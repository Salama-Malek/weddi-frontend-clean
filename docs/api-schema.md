# API Schema References

The frontend communicates with the backend via a RESTful API.

## Authentication
- `POST /auth/login` – authenticate user credentials
- `POST /auth/refresh` – refresh an expired access token

## Users
- `GET /users` – list all users
- `GET /users/:id` – retrieve user by id

Additional endpoints should follow the schema above and return JSON responses.
