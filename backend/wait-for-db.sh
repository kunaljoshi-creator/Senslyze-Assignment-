#!/bin/bash
set -e

until PGPASSWORD=postgres psql -h "db" -U "postgres" -d "document_analyzer" -c "\q"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"

# If you have a migration or create_tables script, run it here
python create_tables.py

exec "$@"
