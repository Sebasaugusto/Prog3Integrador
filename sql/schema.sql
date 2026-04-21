-- SQL Schema for Clinic Management System

-- Table: especialidades
CREATE TABLE especialidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

-- Table: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

-- Table: usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id)
);

-- Table: medicos
CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    especialidad_id INTEGER REFERENCES especialidades(id)
);

-- Table: pacientes
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL
);

-- Table: obras_sociales
CREATE TABLE obras_sociales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

-- Table: medico_especialidades
CREATE TABLE medico_especialidades (
    medico_id INTEGER REFERENCES medicos(id),
    especialidad_id INTEGER REFERENCES especialidades(id),
    PRIMARY KEY (medico_id, especialidad_id)
);

-- Table: medico_obras_sociales
CREATE TABLE medico_obras_sociales (
    medico_id INTEGER REFERENCES medicos(id),
    obra_social_id INTEGER REFERENCES obras_sociales(id),
    PRIMARY KEY (medico_id, obra_social_id)
);

-- Table: paciente_obras_sociales
CREATE TABLE paciente_obras_sociales (
    paciente_id INTEGER REFERENCES pacientes(id),
    obra_social_id INTEGER REFERENCES obras_sociales(id),
    PRIMARY KEY (paciente_id, obra_social_id)
);

-- Table: turnos
CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id),
    medico_id INTEGER REFERENCES medicos(id),
    fecha_hora TIMESTAMP NOT NULL
);