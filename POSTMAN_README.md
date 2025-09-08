# Postman Collections

- H2 (dev/test): import `postman/FinanceForecast-H2.postman_collection.json`
- PostgreSQL (staging/prod): import `postman/FinanceForecast-PG.postman_collection.json`

Set the `baseUrl` variable accordingly:
- dev/test: http://localhost:8080
- staging: https://staging.yourdomain.com
- prod: https://api.yourdomain.com

JWT auth: call `/api/auth/login`, set `Authorization: Bearer {{accessToken}}`.
