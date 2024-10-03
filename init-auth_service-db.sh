#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE auth_service;
	GRANT ALL PRIVILEGES ON DATABASE auth_service TO $POSTGRES_USER;
EOSQL
