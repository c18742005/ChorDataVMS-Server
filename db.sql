CREATE DATABASE chordata;

DROP TABLE IF EXISTS cremation;
DROP TABLE IF EXISTS tooth;
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

CREATE TABLE staff_member(
    staff_member_id SERIAL PRIMARY KEY,
    staff_username VARCHAR(255) UNIQUE NOT NULL,
    staff_password VARCHAR(255) NOT NULL,
    staff_role VARCHAR(255) NOT NULL,
    staff_clinic_id INTEGER NOT NULL,
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
    xray_image_quality VARCHAR(16) NOT NULL,
    xray_kV NUMERIC(4, 2) NOT NULL,
    xray_mAs  NUMERIC(4, 2) NOT NULL,
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

CREATE TABLE cremation(
    cremation_id SERIAL PRIMARY KEY,
    cremation_patient_id INTEGER NOT NULL,
    cremation_clinic_id INTEGER NOT NULL,
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

-- INSERT EXAMPLE CLINICS
INSERT INTO clinic(clinic_name, clinic_address) 
VALUES ('Valley Vets', '10 Kilmacud Lane, Dublin 4');
INSERT INTO clinic(clinic_name, clinic_address) 
VALUES ('Country Choice', 'Sarsfield Street, Nenagh, Tipperary');

-- INSERT EXAMPLE CLIENTS
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('John', 'Doe', '84 Strand st Skerries', 'Skerries', 'Dublin', '0112345', 'john.doe@gmail.com', FALSE, NULL, 1);
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Jane', 'Doe', 'Unit 35 Finglas Business Centre Jamestown Road Dublin 11', 'Dublin', 'Dublin', '0154321', 'jane.doe@gmail.com', FALSE, NULL, 1);
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Calvin', 'Ryan', 'Longford rd Mullingar', 'Mullingar', 'Westmeath', '06112244', 'crryan@gmail.com', TRUE, 'Client Relocating', 1);
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Ashlea', 'McGee', '10 Kenyon St', 'Nenagh', 'Tipperary', '06712345', 'mcgeeashlea@gmail.com', FALSE, NULL, 2);
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Conn', 'Slattery', '6 Vandeleur st Kilrush', 'Kilrush', 'Clare', '06154321', 'c.slattery.com', FALSE, NULL, 2);
INSERT INTO client(
    client_forename, client_surname, client_address, client_city, client_county, client_phone, client_email, client_inactive, client_reason_inactive, client_clinic_id) 
VALUES ('Ron', 'Sullivan', 'Limerick Road', 'Tullahedy', 'Tipperary', '067876567', 'ronniesullivan@gmail.com', TRUE, 'Client Deceased', 2);

-- INSERT EXAMPLE PATIENTS
INSERT INTO patient(
    patient_name, patient_age, patient_species, patient_breed, patient_sex, patient_color, patient_microchip, patient_inactive, patient_reason_inactive, patient_client_id) 
VALUES ('Scout', 8, 'Canine', 'German Shepherd', 'FN', 'Black', '123451234512345', FALSE, NULL, 1);
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

-- ENTER DRUGS INTO DRUG TABLE 
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('101', '2024-08-23', 20.00, 'ml', 20.00, '10mg/ml', 1, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('102', '2025-09-23', 20.00, 'ml', 20.00, '10mg/ml', 1, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('201', '2024-09-27', 100.00, 'ml', 100.00, '200mg/ml', 2, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('202', '2026-04-22', 100.00, 'ml', 100.00, '200mg/ml', 2, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('301', '2025-03-23', 20.00, 'ml', 20.00, '50ug/ml', 3, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('302', '2022-03-12', 20.00, 'ml', 20.00, '50ug/ml', 3, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('401', '2023-06-12', 20.00, 'ml', 20.00, '100mg/ml', 4, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('402', '2027-07-17', 20.00, 'ml', 20.00, '100mg/ml', 4, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('501', '2027-05-11', 10.00, 'ml', 10.00, '50ug/ml', 5, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('502', '2022-08-11', 10.00, 'ml', 10.00, '50ug/ml', 5, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('601', '2022-02-18', 20.00, 'ml', 20.00, '50mg/ml', 6, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('602', '2024-01-19', 20.00, 'ml', 20.00, '50mg/ml', 6, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('701', '2025-12-19', 10.00, 'ml', 10.00, '0.3mg/ml', 7, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('702', '2029-08-28', 10.00, 'ml', 10.00, '0.3mg/ml', 7, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('801', '2026-11-24', 10.00, 'ml', 10.00, '10mg/ml', 8, 1);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('802', '2025-09-12', 10.00, 'ml', 10.00, '10mg/ml', 8, 1);

INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('103', '2024-08-23', 20.00, 'ml', 20.00, '10mg/ml', 1, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('104', '2025-09-23', 20.00, 'ml', 20.00, '10mg/ml', 1, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('203', '2024-09-27', 100.00, 'ml', 100.00, '200mg/ml', 2, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('204', '2026-04-22', 100.00, 'ml', 100.00, '200mg/ml', 2, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('303', '2025-03-23', 20.00, 'ml', 20.00, '50ug/ml', 3, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('304', '2022-03-12', 20.00, 'ml', 20.00, '50ug/ml', 3, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('403', '2023-06-12', 20.00, 'ml', 20.00, '100mg/ml', 4, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('404', '2027-07-17', 20.00, 'ml', 20.00, '100mg/ml', 4, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('503', '2027-05-11', 10.00, 'ml', 10.00, '50ug/ml', 5, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('504', '2022-08-11', 10.00, 'ml', 10.00, '50ug/ml', 5, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('603', '2022-02-18', 20.00, 'ml', 20.00, '50mg/ml', 6, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('604', '2024-01-19', 20.00, 'ml', 20.00, '50mg/ml', 6, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('703', '2025-12-19', 10.00, 'ml', 10.00, '0.3mg/ml', 7, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('704', '2029-08-28', 10.00, 'ml', 10.00, '0.3mg/ml', 7, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('803', '2026-11-24', 10.00, 'ml', 10.00, '10mg/ml', 8, 2);
INSERT INTO drug_stock(drug_batch_id, drug_expiry_date, drug_quantity, drug_quantity_measure, drug_quantity_remaining, drug_concentration, drug_stock_drug_id, drug_stock_clinic_id) 
VALUES ('804', '2025-09-12', 10.00, 'ml', 10.00, '10mg/ml', 8, 2);

-- INSERT EXAMPLES INTO CREMATION
INSERT INTO cremation(cremation_patient_id, cremation_clinic_id, cremation_form, cremation_owner_contacted, cremation_date_collected, cremation_date_ashes_returned_practice, cremation_date_ashes_returned_owner) 
VALUES (3, 1, 'Urn', TRUE, '2022-03-22', '2022-03-27', '2022-03-30');
INSERT INTO cremation(cremation_patient_id, cremation_clinic_id, cremation_form, cremation_owner_contacted, cremation_date_collected, cremation_date_ashes_returned_practice, cremation_date_ashes_returned_owner) 
VALUES (9, 2, 'Tribute Box', FALSE, '2022-03-22', '2022-03-27', NULL);