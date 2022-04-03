const request = require("supertest");
const app = require('../../app');
const PatientController = require("../../controllers/patient.controller");

describe("GET api/patients/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code and return patient object", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual([{
        patient_id: 1,
        patient_name: 'Scout',
        patient_age: 8,
        patient_species: 'Canine',
        patient_breed: 'German Shepherd Dog',
        patient_sex: 'FN',
        patient_color: 'Black',
        patient_microchip: '123451234512345',
        patient_inactive: false,
        patient_reason_inactive: null,
        patient_client_id: 1,
      }])
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).get("/api/patients/1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When incorrect patient ID is supplied", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/-1").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No patient found with ID supplied")
    });
  });
});

describe("GET api/patients/client/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code and return patient object", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/client/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object));
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).get("/api/patients/client/1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When incorrect client ID is supplied", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/client/-1").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No client found with ID supplied")
    });
  });
});

describe("GET api/patients/clinic/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code and return patient object", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/clinic/292a485f-a56a-4938-8f1a-bbbbbbbbbbb1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object));
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).get("/api/patients/clinic/292a485f-a56a-4938-8f1a-bbbbbbbbbbb1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When incorrect clinic ID is supplied", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/clinic/292a485f-a56a-4938-8f1a-bbbbbbbbbbb9").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No clinic found with ID supplied")
    });
  });
});

describe("GET api/patients/species/:species/clinic/:clinic_id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code and return patient object", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/species/Canine/clinic/292a485f-a56a-4938-8f1a-bbbbbbbbbbb1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object));
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).get("/api/patients/species/Canine/clinic/292a485f-a56a-4938-8f1a-bbbbbbbbbbb1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When incorrect clinic ID is supplied", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/species/Canine/clinic/292a485f-a56a-4938-8f1a-bbbbbbbbbbb9").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No clinic found with ID supplied")
    });
  });

  describe("When incorrect species is supplied", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patients/species/Aquatic/clinic/292a485f-a56a-4938-8f1a-bbbbbbbbbbb1").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No species found of this type")
    });
  });
});

describe("POST /api/patients", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code and return patient object", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "938279384667837",
        patient_client_id: 1
      }

      const userPayload = {
        patient_id: 100,
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "938279384667837",
        patient_client_id: 1
      }

      jest.spyOn(PatientController, "insertPatient").mockReturnValueOnce(userPayload)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/patients").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Patient added successfully");
      expect(response.body.body).toEqual(userPayload);
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).post("/api/patients")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 422 status code and return error messages", async () => {
      const bodyData = {
        patient_name: null,
        patient_age: '6',
        patient_species: null,
        patient_breed: null,
        patient_sex: 'Male',
        patient_color: null,
        patient_microchip: 12345,
        patient_client_id: '1'
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/patients").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toEqual(expect.any(Object));
    });
  });

  describe("When info is missing", () => {
    test("Should respond with a 422 status code and return error messages", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/patients").set("token", token).send({});

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toEqual(expect.any(Object));
    });
  });

  describe("When microchip is already taken", () => {
    test("Should respond with a 409 status code and return error messages", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "123451234512345",
        patient_client_id: 1
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/patients").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(409)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Microchip already belongs to another patient");
    });
  });

  describe("When client does not exist", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "123451544512345",
        patient_client_id: -1
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/patients").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No such client with ID supplied");
    });
  });

  describe("When patient sex is outside of specified values", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MF",
        patient_color: "Black and White",
        patient_microchip: "374857485773647",
        patient_client_id: 1
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/patients").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Sex supplied is not valid");
    });
  });

  describe("When patient species is outside of specified values", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Equine',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "127574657823745",
        patient_client_id: 1
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/patients").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Species supplied is not valid");
    });
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code and return error message", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "938279384667837",
        patient_client_id: 1
      }

      jest.spyOn(PatientController, "insertPatient").mockReturnValueOnce(500);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/patients").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error adding patient. Please try again");
    });
  });
});

describe("PUT /api/patients/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code and return patient object", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "938279384667837"
      }

      const userPayload = {
        patient_id: 1,
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "938279384667837",
        patient_client_id: 1
      }

      jest.spyOn(PatientController, "updatePatient").mockReturnValueOnce(userPayload)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Patient updated Successfully");
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).put("/api/patients/1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 422 status code and return error messages", async () => {
      const bodyData = {
        patient_name: null,
        patient_age: 'Six',
        patient_species: null,
        patient_breed: null,
        patient_sex: "Male",
        patient_color: false,
        patient_microchip: 12345
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toEqual(expect.any(Object));
    });
  });

  describe("When info is missing", () => {
    test("Should respond with a 422 status code and return error messages", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/1").set("token", token).send({});

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toEqual(expect.any(Object));
    });
  });

  describe("When microchip is already taken", () => {
    test("Should respond with a 409 status code and return error messages", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "647593647560908"
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(409)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Microchip already belongs to another patient");
    });
  });

  describe("When patient does not exist", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "123451544512345"
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/-1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Patient with ID supplied does not exist");
    });
  });

  describe("When patient sex is outside of specified values", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MF",
        patient_color: "Black and White",
        patient_microchip: "374857485773647"
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Sex supplied is not valid");
    });
  });

  describe("When patient species is outside of specified values", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Equine',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "127574657823745"
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Species supplied is not valid");
    });
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code and return error message", async () => {
      const bodyData = {
        patient_name: 'Sylvester',
        patient_age: 6,
        patient_species: 'Feline',
        patient_breed: 'Domestic Shorthair',
        patient_sex: "MN",
        patient_color: "Black and White",
        patient_microchip: "938279384667837"
      }

      jest.spyOn(PatientController, "updatePatient").mockReturnValueOnce(500);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error updating patient. Please try again");
    });
  });
});

describe("PUT /api/patients/deactivate/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code and return patient object", async () => {
      const bodyData = {
        patient_reason_inactive: 'Patient Deceased'
      }

      jest.spyOn(PatientController, "deactivatePatient").mockReturnValueOnce(201);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/deactivate/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Patient Deactivated");
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).put("/api/patients/deactivate/1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is missing", () => {
    test("Should respond with a 422 status code and return error messages", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/deactivate/1").set("token", token).send({});

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Please supply a valid reason for deactivating account");
    });
  });

  describe("When patient does not exist", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const bodyData = {
        patient_reason_inactive: 'Patient Deceased'
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/deactivate/-1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Patient with ID supplied does not exist");
    });
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code and return error message", async () => {
      const bodyData = {
        patient_reason_inactive: 'Patient Deceased'
      }

      jest.spyOn(PatientController, "deactivatePatient").mockReturnValueOnce(500);

      const staffBody = {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/deactivate/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error deactivating patient. Please try again");
    });
  });
});

describe("PUT api/patients/reactivate/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code", async () => {
      jest.spyOn(PatientController, "reactivatePatient").mockReturnValueOnce(201);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/reactivate/5").set("token", token);

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Patient Reactivated");
    });
  });

  describe("When patient does not exist", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/reactivate/-1").set("token", token);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Patient with ID supplied does not exist");
    });
  });

  describe("When patient is already active", () => {
    test("Should respond with a 400 status code and return error messages", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/patients/reactivate/1").set("token", token);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Patient is already active");
    });
  });
});