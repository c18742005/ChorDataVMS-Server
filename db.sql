CREATE DATABASE chordata;

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