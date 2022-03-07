CREATE DATABASE chordata;

DROP TABLE IF EXISTS xray;
DROP TABLE IF EXISTS drug_log;
DROP TABLE IF EXISTS drug_stock;
DROP TABLE IF EXISTS drug;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS staff_member;
DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS clinic;

CREATE TABLE clinic(
    clinic_id SERIAL PRIMARY KEY,
    clinic_name VARCHAR(255) NOT NULL,
    clinic_address VARCHAR(255) NOT NULL
);

INSERT INTO clinic(clinic_name, clinic_address) 
VALUES ('Example Clinic', '10 Test Lane, Dublin 4');

CREATE TABLE staff_member(
    staff_member_id SERIAL PRIMARY KEY,
    staff_username VARCHAR(255) NOT NULL,
    staff_password VARCHAR(255) NOT NULL,
    staff_role VARCHAR(255) NOT NULL,
    staff_clinic_id INTEGER NOT NULL,
    CONSTRAINT fk_clinic
        FOREIGN KEY (staff_clinic_id)
            REFERENCES clinic(clinic_id)
            ON DELETE CASCADE
);

INSERT INTO staff_member(staff_username, staff_password, staff_role, staff_clinic_id) 
VALUES ('testuser', 'password', 'vet', 1);

CREATE TABLE client(
    client_id SERIAL PRIMARY KEY,
    client_forename VARCHAR(255) NOT NULL,
    client_surname VARCHAR(255) NOT NULL,
    client_address VARCHAR(255) NOT NULL,
    client_city VARCHAR(255) NOT NULL,
    client_county VARCHAR(255) NOT NULL,
    client_phone VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_inactive BOOLEAN NOT NULL,
    client_reason_inactive VARCHAR(255),
    client_clinic_id INTEGER NOT NULL,
    CONSTRAINT fk_clinic_client
        FOREIGN KEY (client_clinic_id)
            REFERENCES clinic(clinic_id)
            ON DELETE CASCADE
);

CREATE TABLE patient(
    patient_id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INTEGER NOT NULL,
    patient_species VARCHAR(255) NOT NULL,
    patient_breed VARCHAR(255) NOT NULL,
    patient_sex VARCHAR(3) NOT NULL,
    patient_color VARCHAR(255) NOT NULL,
    patient_microchip VARCHAR(255) NOT NULL,
    patient_inactive BOOLEAN NOT NULL,
    patient_reason_inactive VARCHAR(255),
    patient_client_id INTEGER NOT NULL,
    CONSTRAINT fk_client_patient
        FOREIGN KEY (patient_client_id)
            REFERENCES client(client_id)
            ON DELETE CASCADE
);

CREATE TABLE drug(
    drug_id SERIAL PRIMARY KEY,
    drug_name VARCHAR(255) NOT NULL,
    drug_link VARCHAR(255) NOT NULL
);

INSERT INTO drug(drug_name, drug_link) 
VALUES ('Methadone', 'https://rb.gy/6jbtqh');

INSERT INTO drug(drug_name, drug_link) 
VALUES ('Pentobarbital', 'https://rb.gy/ragqx5');

INSERT INTO drug(drug_name, drug_link) 
VALUES ('Fentanyl', 'https://rb.gy/tc6kdc');

INSERT INTO drug(drug_name, drug_link) 
VALUES ('Ketamine', 'https://rb.gy/yrzynx');

INSERT INTO drug(drug_name, drug_link) 
VALUES ('Morphine', 'https://rb.gy/9y5ijt');

INSERT INTO drug(drug_name, drug_link) 
VALUES ('Pethidine', 'https://rb.gy/ctcd2g');


CREATE TABLE drug_stock(
    drug_batch_id VARCHAR(255) PRIMARY KEY,
    drug_expiry_date DATE NOT NULL,
    drug_quantity NUMERIC(6, 2) NOT NULL,
    drug_quantity_measure VARCHAR(255) NOT NULL,
    drug_quantity_remaining NUMERIC(6, 2) NOT NULL,
    drug_concentration VARCHAR(255) NOT NULL,
    drug_stock_drug_id INTEGER NOT NULL,
    drug_stock_clinic_id INTEGER NOT NULL,
    CONSTRAINT fk_drug_drug_stock
        FOREIGN KEY (drug_stock_drug_id)
            REFERENCES drug(drug_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_drug_clinic_id
        FOREIGN KEY (drug_stock_clinic_id)
            REFERENCES clinic(clinic_id)
            ON DELETE CASCADE
);

CREATE TABLE drug_log(
    drug_log_id SERIAL PRIMARY KEY,
    drug_quantity_given VARCHAR(255) NOT NULL,
    drug_date_administered DATE NOT NULL,
    drug_log_drug_stock_id VARCHAR(255) NOT NULL,
    drug_patient_id INTEGER NOT NULL,
    drug_staff_id INTEGER NOT NULL,
    CONSTRAINT fk_drug_log_drug_stock
        FOREIGN KEY (drug_log_drug_stock_id)
            REFERENCES drug_stock(drug_batch_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_drug_log_patient
        FOREIGN KEY (drug_patient_id)
            REFERENCES patient(patient_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_drug_log_staff
        FOREIGN KEY (drug_staff_id)
            REFERENCES staff_member(staff_member_id)
            ON DELETE CASCADE
);

CREATE TABLE xray(
    xray_id SERIAL PRIMARY KEY,
    xray_date DATE NOT NULL,
    xray_image_quality VARCHAR(8) NOT NULL,
    xray_kV NUMERIC(6, 2) NOT NULL,
    xray_mAs  NUMERIC(6, 2) NOT NULL,
    xray_position VARCHAR(255) NOT NULL,
    xray_patient_id INTEGER NOT NULL,
    xray_staff_id INTEGER NOT NULL,
    xray_clinic_id INTEGER NOT NULL,
    CONSTRAINT fk_xray_patient
        FOREIGN KEY (xray_patient_id)
            REFERENCES patient(patient_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_xray_staff
        FOREIGN KEY (xray_staff_id)
            REFERENCES staff_member(staff_member_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_xray_clinic
        FOREIGN KEY (xray_clinic_id)¸
            REFERENCES clinic(clinic_id)
            ON DELETE CASCADE
);