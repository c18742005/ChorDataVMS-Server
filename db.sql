CREATE DATABASE chordata;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS anaesthetic_period;
DROP TABLE IF EXISTS anaesthetic;
DROP TABLE IF EXISTS cremation;
DROP TABLE IF EXISTS tooth;
DROP TABLE IF EXISTS dental;
DROP TABLE IF EXISTS xray;
DROP TABLE IF EXISTS drug_log;
DROP TABLE IF EXISTS drug_stock;
DROP TABLE IF EXISTS drug;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS staff_member;
DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS clinic;

CREATE TABLE clinic(
    clinic_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_name VARCHAR(255) NOT NULL,
    clinic_address VARCHAR(255) NOT NULL
);

CREATE TABLE staff_member(
    staff_member_id SERIAL PRIMARY KEY,
    staff_username VARCHAR(255) UNIQUE NOT NULL,
    staff_password VARCHAR(255) NOT NULL,
    staff_role VARCHAR(255) NOT NULL,
    staff_clinic_id uuid NOT NULL,
    CONSTRAINT fk_clinic
        FOREIGN KEY (staff_clinic_id)
            REFERENCES clinic(clinic_id)
            ON DELETE CASCADE
);

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
    client_clinic_id uuid NOT NULL,
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
    patient_microchip VARCHAR(255) UNIQUE NOT NULL,
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

CREATE TABLE drug_stock(
    drug_batch_id VARCHAR(255) PRIMARY KEY,
    drug_expiry_date DATE NOT NULL,
    drug_quantity NUMERIC(6, 2) NOT NULL,
    drug_quantity_measure VARCHAR(255) NOT NULL,
    drug_quantity_remaining NUMERIC(6, 2) NOT NULL,
    drug_concentration VARCHAR(255) NOT NULL,
    drug_stock_drug_id INTEGER NOT NULL,
    drug_stock_clinic_id uuid NOT NULL,
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
    drug_quantity_given  NUMERIC(6, 2) NOT NULL,
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
    xray_image_quality VARCHAR(16) NOT NULL,
    xray_kV NUMERIC(4, 2) NOT NULL,
    xray_mAs  NUMERIC(4, 2) NOT NULL,
    xray_position VARCHAR(255) NOT NULL,
    xray_patient_id INTEGER NOT NULL,
    xray_staff_id INTEGER NOT NULL,
    xray_clinic_id uuid NOT NULL,
    CONSTRAINT fk_xray_patient
        FOREIGN KEY (xray_patient_id)
            REFERENCES patient(patient_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_xray_staff
        FOREIGN KEY (xray_staff_id)
            REFERENCES staff_member(staff_member_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_xray_clinic
        FOREIGN KEY (xray_clinic_id)
            REFERENCES clinic(clinic_id)
            ON DELETE CASCADE
);

CREATE TABLE tooth(
    tooth_id INTEGER,
    tooth_patient_id INTEGER,
    tooth_problem VARCHAR(255),
    tooth_note VARCHAR(1024),
    CONSTRAINT fk_tooth_patient
        FOREIGN KEY (tooth_patient_id)
            REFERENCES patient(patient_id)
            ON DELETE CASCADE,
    PRIMARY KEY(tooth_id, tooth_patient_id)
);

CREATE TABLE dental(
    dental_id SERIAL PRIMARY KEY,
    dental_patient_id INTEGER,
    dental_date_updated DATE,
    CONSTRAINT fk_dental_patient
        FOREIGN KEY (dental_patient_id)
            REFERENCES patient(patient_id)
            ON DELETE CASCADE
);

CREATE TABLE cremation(
    cremation_id SERIAL PRIMARY KEY,
    cremation_patient_id INTEGER NOT NULL,
    cremation_clinic_id uuid NOT NULL,
    cremation_form VARCHAR(255) NOT NULL,
    cremation_owner_contacted BOOLEAN NOT NULL,
    cremation_date_collected DATE,
    cremation_date_ashes_returned_practice DATE,
    cremation_date_ashes_returned_owner DATE,
    CONSTRAINT fk_cremation_patient
        FOREIGN KEY (cremation_patient_id)
            REFERENCES patient(patient_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_cremation_clinic
        FOREIGN KEY (cremation_clinic_id)
            REFERENCES clinic(clinic_id)
            ON DELETE CASCADE
);

CREATE TABLE anaesthetic(
    anaesthetic_id SERIAL PRIMARY KEY,
    anaesthetic_patient_id INTEGER NOT NULL,
    anaesthetic_date DATE,
    anaesthetic_staff_id INTEGER NOT NULL,
    CONSTRAINT fk_anaesthetic_patient
        FOREIGN KEY (anaesthetic_patient_id)
            REFERENCES patient(patient_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_anaesthetic_staff_id
        FOREIGN KEY (anaesthetic_staff_id)
            REFERENCES staff_member(staff_member_id)
            ON DELETE CASCADE
);

CREATE TABLE anaesthetic_period(
    anaesthetic_id INTEGER NOT NULL,
    anaesthetic_period INTEGER NOT NULL,
    anaesthetic_hr INTEGER NOT NULL,
    anaesthetic_rr INTEGER NOT NULL,
    anaesthetic_oxygen NUMERIC(4, 2) NOT NULL,
    anaesthetic_agent NUMERIC(4, 2) NOT NULL,
    anaesthetic_eye_pos VARCHAR(8) NOT NULL,
    anaesthetic_reflexes BOOLEAN NOT NULL,
    CONSTRAINT fk_anaesthetic
        FOREIGN KEY (anaesthetic_id)
            REFERENCES anaesthetic(anaesthetic_id)
            ON DELETE CASCADE,
    PRIMARY KEY(anaesthetic_id, anaesthetic_period)
);

-- INSERT EXAMPLE CLINICS
INSERT INTO clinic(clinic_id, clinic_name, clinic_address) 
VALUES ('292a485f-a56a-4938-8f1a-bbbbbbbbbbb1', 'Valley Vets', '10 Kilmacud Lane, Dublin 4');
INSERT INTO clinic(clinic_id, clinic_name, clinic_address) 
VALUES ('292a485f-a56a-4938-8f1a-bbbbbbbbbbb2', 'Country Choice', 'Sarsfield Street, Nenagh, Tipperary');

-- INSERT EXAMPLE STAFF MEMBERS
INSERT INTO staff_member(staff_username, staff_password, staff_role, staff_clinic_id)
VALUES ('vet.user', '$2a$10$NxvQrmH4kFNBuGwbC7m1Cus/m21tv3f3CjJMr/KnvEU3jcozWgJoi', 'Vet', '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO staff_member(staff_username, staff_password, staff_role, staff_clinic_id)
VALUES ('nurse.user', '$2a$10$D7a4.onIG5iPlTYB4yABxeQLvjbUZmdk8J3sPoDku3ltQpsGij2mi', 'Nurse', '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO staff_member(staff_username, staff_password, staff_role, staff_clinic_id)
VALUES ('reception.user', '$2a$10$NxvQrmH4kFNBuGwbC7m1Cus/m21tv3f3CjJMr/KnvEU3jcozWgJoi', 'Receptionist', '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');

-- INSERT EXAMPLE CLIENTS
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('John', 'Doe', '84 Strand st Skerries', 'Skerries', 'Dublin', '0112345', 'john.doe@gmail.com', FALSE, NULL, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Jane', 'Doe', 'Unit 35 Finglas Business Centre Jamestown Road Dublin 11', 'Dublin', 'Dublin', '0154321', 'jane.doe@gmail.com', FALSE, NULL, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Calvin', 'Ryan', 'Longford rd Mullingar', 'Mullingar', 'Westmeath', '06112244', 'crryan@gmail.com', TRUE, 'Client Relocating', '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Ashlea', 'McGee', '10 Kenyon St', 'Nenagh', 'Tipperary', '06712345', 'mcgeeashlea@gmail.com', FALSE, NULL, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Conn', 'Slattery', '6 Vandeleur st Kilrush', 'Kilrush', 'Clare', '06154321', 'c.slattery.com', FALSE, NULL, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Ron', 'Sullivan', 'Limerick Road', 'Tullahedy', 'Tipperary', '067876567', 'ronniesullivan@gmail.com', TRUE, 'Client Deceased', '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');

-- INSERT EXAMPLE PATIENTS
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Scout', 8, 'Canine', 'German Shepherd Dog', 'FN', 'Black', '123451234512345', FALSE, NULL, 1);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Holly', 16, 'Feline', 'European Shorthair', 'FN', 'Black', '647593647560908', FALSE, NULL, 1);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Bean', 6, 'Rodent', 'Mouse', 'M', 'Grey', '192834756675849', TRUE, 'Patient Deceased', 2);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Noodle', 7, 'Reptile', 'Ball Python', 'M', 'Yellow', '991128374678372', FALSE, NULL, 2);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Spud', 6, 'Canine', 'Pug', 'M', 'Grey', '683746574664857', TRUE, 'Client Relocating', 3);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Tayto', 4, 'Canine', 'Vizsla', 'M', 'Brown', '478210899823456', TRUE, 'Client Relocating', 3);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Cookie', 6, 'Canine', 'Bichon Frise', 'M', 'White', '223459129809765', FALSE, NULL, 4);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Jessie', 9, 'Canine', 'Shih Tzu', 'M', 'White', '234438767845968', FALSE, NULL, 4);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Brownie', 15, 'Canine', 'Jack Russel', 'MN', 'White & Brown', '164568675659846', TRUE, 'Patient Deceased', 5);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Felix', 7, 'Feline', 'Domestic Shorthair', 'F', 'Black & White', '265746597856738', FALSE, NULL, 5);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Captain', 8, 'Canine', 'Bernese Mountain Dog', 'MN', 'Black', '364578978676857', TRUE, 'Client Deceased', 6);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Tweety', 4, 'Avian', 'African Grey Parrot', 'F', 'Grey', '657485342387734', TRUE, 'Client Deceased', 6);
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Babe', 6, 'Feline', 'Domestic Longhair', 'F', 'Brown', '34857485901234', TRUE, 'Patient Deceased', 1);

-- ENTER DRUGS INTO DRUG TABLE 
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
INSERT INTO drug(drug_name, drug_link) 
VALUES ('Buprenorphine', 'https://rb.gy/baqkt0');
INSERT INTO drug(drug_name, drug_link) 
VALUES ('Butorphanol', 'https://rb.gy/v91lqi');

-- INSERT EXAMPLE DRUG STOCK
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('101', '2024-08-23', 20.00, 'ml', 17.30, '10mg/ml', 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('102', '2025-09-23', 20.00, 'ml', 20.00, '10mg/ml', 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('201', '2024-09-27', 100.00, 'ml', 97.30, '200mg/ml', 2, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('202', '2026-04-22', 100.00, 'ml', 100.00, '200mg/ml', 2, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('301', '2025-03-23', 20.00, 'ml', 17.30, '50ug/ml', 3, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('302', '2022-03-12', 20.00, 'ml', 20.00, '50ug/ml', 3, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('401', '2023-06-12', 20.00, 'ml', 17.30, '100mg/ml', 4, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('402', '2027-07-17', 20.00, 'ml', 20.00, '100mg/ml', 4, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('501', '2027-05-11', 10.00, 'ml', 7.30, '50ug/ml', 5, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('502', '2022-08-11', 10.00, 'ml', 10.00, '50ug/ml', 5, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('601', '2022-02-18', 20.00, 'ml', 17.30, '50mg/ml', 6, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('602', '2024-01-19', 20.00, 'ml', 20.00, '50mg/ml', 6, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('701', '2025-12-19', 10.00, 'ml', 7.30, '0.3mg/ml', 7, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('702', '2029-08-28', 10.00, 'ml', 10.00, '0.3mg/ml', 7, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('801', '2026-11-24', 10.00, 'ml', 7.30, '10mg/ml', 8, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('802', '2025-09-12', 10.00, 'ml', 10.00, '10mg/ml', 8, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');

INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('103', '2024-08-23', 20.00, 'ml', 20.00, '10mg/ml', 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('104', '2025-09-23', 20.00, 'ml', 20.00, '10mg/ml', 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('203', '2024-09-27', 100.00, 'ml', 100.00, '200mg/ml', 2, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('204', '2026-04-22', 100.00, 'ml', 100.00, '200mg/ml', 2, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('303', '2025-03-23', 20.00, 'ml', 20.00, '50ug/ml', 3, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('304', '2022-03-12', 20.00, 'ml', 20.00, '50ug/ml', 3, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('403', '2023-06-12', 20.00, 'ml', 20.00, '100mg/ml', 4, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('404', '2027-07-17', 20.00, 'ml', 20.00, '100mg/ml', 4, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('503', '2027-05-11', 10.00, 'ml', 10.00, '50ug/ml', 5, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('504', '2022-08-11', 10.00, 'ml', 10.00, '50ug/ml', 5, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('603', '2022-02-18', 20.00, 'ml', 20.00, '50mg/ml', 6, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('604', '2024-01-19', 20.00, 'ml', 20.00, '50mg/ml', 6, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('703', '2025-12-19', 10.00, 'ml', 10.00, '0.3mg/ml', 7, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('704', '2029-08-28', 10.00, 'ml', 10.00, '0.3mg/ml', 7, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('803', '2026-11-24', 10.00, 'ml', 10.00, '10mg/ml', 8, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('804', '2025-09-12', 10.00, 'ml', 10.00, '10mg/ml', 8, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2');

-- INSERT EXAMPLE DRUG LOGS
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('0.5', '2021-09-22', '101', 1, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.0', '2022-01-18', '101', 2, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.2', '2021-06-26', '101', 4, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('0.5', '2021-04-19', '201', 2, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.0', '2021-06-13', '201', 4, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.2', '2022-03-23', '201', 5, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('0.5', '2021-03-22', '301', 1, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.0', '2021-08-24', '301', 2, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.2', '2021-11-16', '301', 1, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('0.5', '2021-11-22', '401', 4, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.0', '2022-03-18', '401', 3, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.2', '2022-01-16', '401', 5, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('0.5', '2021-06-22', '501', 6, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.0', '2021-05-18', '501', 1, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.2', '2021-05-16', '501', 2, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('0.5', '2021-06-22', '601', 4, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.0', '2021-09-18', '601', 2, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.2', '2021-07-16', '601', 3, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('0.5', '2021-04-22', '701', 2, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.0', '2021-08-18', '701', 5, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.2', '2021-09-16', '701', 6, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('0.5', '2021-11-22', '801', 6, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.0', '2022-01-18', '801', 2, 1);
INSERT INTO drug_log(drug_quantity_given, drug_date_administered, drug_log_drug_stock_id, drug_patient_id, drug_staff_id) 
VALUES ('1.2', '2021-12-16', '801', 4, 1);

-- INSERT XRAY EXAMPLE
INSERT INTO xray(xray_date, xray_image_quality, xray_kV, xray_mAs, xray_position, xray_patient_id, xray_staff_id, xray_clinic_id) 
VALUES ('2022-02-26', 'Underexposed', 1.2, 1.4, 'Lateral', 1, 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO xray(xray_date, xray_image_quality, xray_kV, xray_mAs, xray_position, xray_patient_id, xray_staff_id, xray_clinic_id) 
VALUES ('2022-03-21', 'Overexposed', 1.6, 1.8, 'Supinated', 3, 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO xray(xray_date, xray_image_quality, xray_kV, xray_mAs, xray_position, xray_patient_id, xray_staff_id, xray_clinic_id) 
VALUES ('2021-11-12', 'Excellent', 1.1, 1.3, 'Pronated', 5, 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO xray(xray_date, xray_image_quality, xray_kV, xray_mAs, xray_position, xray_patient_id, xray_staff_id, xray_clinic_id) 
VALUES ('2021-08-14', 'Good', 1.9, 2.1, 'Lateral Decubitus', 3, 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');
INSERT INTO xray(xray_date, xray_image_quality, xray_kV, xray_mAs, xray_position, xray_patient_id, xray_staff_id, xray_clinic_id) 
VALUES ('2021-02-16', 'Overexposed', 2.1, 2.3, 'Supinated', 2, 1, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1');

-- INSERT DENTAL EXAMPLES
INSERT INTO dental(dental_patient_id, dental_date_updated) 
VALUES (1, '2022-01-15');
INSERT INTO dental(dental_patient_id, dental_date_updated) 
VALUES (5, '2022-02-12');

-- INSERT EXAMPLE DENTALS
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (101, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (102, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (103, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (104, 1, 'Furcation', null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (105, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (106, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (107, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (108, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (109, 1, 'Missing', 'Not present on inspection');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (110, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (201, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (202, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (203, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (204, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (205, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (206, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (207, 1, 'Extracted', 'Tooths badly worn had to be extracted');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (208, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (209, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (210, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (301, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (302, 1, 'Wear', 'Signs of wear');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (303, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (304, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (305, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (306, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (307, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (308, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (309, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (310, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (311, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (401, 1, 'Fracture', 'Small fracture at top of tooth');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (402, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (403, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (404, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (405, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (406, 1, 'Recession', 'Signs of recession');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (407, 1, 'Gingivitis', null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (408, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (409, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (410, 1, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (411, 1, null, null);

INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (101, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (102, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (103, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (104, 5, 'Furcation', null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (105, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (106, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (107, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (108, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (109, 5, 'Missing', 'Not present on inspection');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (110, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (201, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (202, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (203, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (204, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (205, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (206, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (207, 5, 'Extracted', 'Tooths badly worn had to be extracted');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (208, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (209, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (210, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (301, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (302, 5, 'Wear', 'Signs of wear');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (303, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (304, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (305, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (306, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (307, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (308, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (309, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (310, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (311, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (401, 5, 'Fracture', 'Small fracture at top of tooth');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (402, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (403, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (404, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (405, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (406, 5, 'Recession', 'Signs of recession');
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (407, 5, 'Gingivitis', null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (408, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (409, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (410, 5, null, null);
INSERT INTO tooth(tooth_id, tooth_patient_id, tooth_problem, tooth_note) 
VALUES (411, 5, null, null);

-- INSERT EXAMPLES INTO CREMATION
INSERT INTO cremation(cremation_patient_id, cremation_clinic_id, cremation_form, cremation_owner_contacted, cremation_date_collected, cremation_date_ashes_returned_practice, cremation_date_ashes_returned_owner) 
VALUES (3, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb1', 'Urn', TRUE, '2022-03-22', '2022-03-27', '2022-03-30');
INSERT INTO cremation(cremation_patient_id, cremation_clinic_id, cremation_form, cremation_owner_contacted, cremation_date_collected, cremation_date_ashes_returned_practice, cremation_date_ashes_returned_owner) 
VALUES (9, '292a485f-a56a-4938-8f1a-bbbbbbbbbbb2', 'Tribute Box', FALSE, '2022-03-22', '2022-03-27', NULL);

-- INSERT EXAMPLES INTO ANAESTHETIC
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (1, '2022-02-02', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (2, '2022-01-22', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (4, '2021-05-12', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (1, '2021-03-21', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (2, '2021-12-19', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (10, '2022-02-02', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (8, '2022-01-22', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (11, '2021-05-12', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (8, '2021-03-21', 1);
INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
VALUES (11, '2021-12-19', 1);

-- INSERT EXAMPLE ANAESTHETIC PERIODS
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (1, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (1, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (1, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (1, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (1, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (1, 25, 83, 25, 2.8, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (1, 30, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (1, 35, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (2, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (2, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (2, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (2, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (2, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (2, 25, 83, 25, 2.8, 1.5, 'Central', 'No');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (3, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (3, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (3, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (3, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (3, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (3, 25, 83, 25, 2.8, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (3, 30, 88, 28, 3.0, 1.7, 'Central', 'No');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 25, 83, 25, 2.8, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 30, 83, 25, 2.8, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 35, 83, 25, 2.8, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (4, 40, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (5, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (5, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (5, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (5, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (5, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (5, 25, 83, 25, 2.8, 1.5, 'Central', 'No');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (6, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (6, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (6, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (6, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (6, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (6, 25, 83, 25, 2.8, 1.5, 'Central', 'No');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (7, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (7, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (7, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (7, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (7, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (7, 25, 83, 25, 2.8, 1.5, 'Central', 'No');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (8, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (8, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (8, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (8, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (8, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (8, 25, 83, 25, 2.8, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (8, 30, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (8, 35, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (9, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (9, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (9, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (9, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (9, 20, 85, 26, 3.0, 1.5, 'Central', 'No');

INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (10, 0, 80, 24, 3.0, 1.5, 'Ventral', 'Yes');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (10, 5, 83, 25, 3.0, 1.6, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (10, 10, 82, 22, 3.0, 1.4, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (10, 15, 88, 28, 3.0, 1.7, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (10, 20, 85, 26, 3.0, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (10, 25, 83, 25, 2.8, 1.5, 'Central', 'No');
INSERT INTO anaesthetic_period(anaesthetic_id, anaesthetic_period, anaesthetic_hr, anaesthetic_rr, anaesthetic_oxygen, anaesthetic_agent, anaesthetic_eye_pos, anaesthetic_reflexes) 
VALUES (10, 30, 88, 28, 3.0, 1.7, 'Central', 'No');