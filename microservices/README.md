# Microservices

Each subfolder is an independent FastAPI service with its own venv,
requirements file, and `.env`. Services do not import each other - the
only contract between them is HTTP.

| Service           | Port | Purpose                                      |
|-------------------|------|----------------------------------------------|
| api-gateway       | 8000 | The only public entrypoint. Verifies JWTs.   |

More services will be added in later commits.
