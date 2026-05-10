SERVER_DIR := apps/server
CLIENT_DIR := apps/client

.PHONY: help up down logs server-build server-run server-test server-tidy server-docs client-dev

help:
	@echo "Targets:"
	@echo "  up            - levantar stack completo (postgres + server) con docker compose"
	@echo "  down          - bajar stack y borrar volúmenes"
	@echo "  logs          - seguir logs del server"
	@echo "  server-build  - compilar binario del server localmente"
	@echo "  server-run    - correr el server localmente (usa .env)"
	@echo "  server-test   - correr tests del server"
	@echo "  server-tidy   - go mod tidy en el server"
	@echo "  server-docs   - regenerar docs Swagger (requiere 'swag' instalado)"
	@echo "  client-dev    - levantar el cliente en modo dev"

up:
	docker compose up --build

down:
	docker compose down -v

logs:
	docker compose logs -f server

server-build:
	cd $(SERVER_DIR) && go build -o ./out/api ./cmd/api

server-run:
	cd $(SERVER_DIR) && go run ./cmd/api

server-test:
	cd $(SERVER_DIR) && go test ./...

server-tidy:
	cd $(SERVER_DIR) && go mod tidy

server-docs:
	cd $(SERVER_DIR) && swag init -g cmd/api/main.go -o docs --parseDependency

client-dev:
	cd $(CLIENT_DIR) && npm run dev
