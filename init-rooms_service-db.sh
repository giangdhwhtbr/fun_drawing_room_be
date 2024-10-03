#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE rooms_service;
	GRANT ALL PRIVILEGES ON DATABASE rooms_service TO $POSTGRES_USER;
EOSQL
