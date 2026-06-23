# AEGIS Lab

Laboratorio local con backend, frontend, Docker Compose y Ollama.

El proyecto funciona como prueba de concepto para experimentar con IA aplicada a análisis, auditoría y automatización.

## Estructura principal

* backend/: API y lógica principal.
* frontend/: interfaz web.
* docker-compose.yml: definición de servicios.
* .env.example: variables de entorno de ejemplo.

## Notas

* .env no se sube al repositorio.
* data/ y backend/data/ no se suben porque contienen datos generados localmente.
* .opencode/ no se sube porque contiene información local.
* reference/ no se sube porque contiene proyectos externos usados como referencia.

## Ejecución local

Para iniciar:

docker compose up -d --build

Para detener:

docker compose down

## Autor

Leandro Saavedra
