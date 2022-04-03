const request = require("supertest");
const app = require('../../app');
const DentalController = require("../../controllers/dental.controller");

describe("GET /api/dentals/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code and return dental object", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/dentals/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object))
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).get("/api/dentals/1")

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
      const response = await request(app).get("/api/dentals/-11").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No patient found with ID supplied")
    });
  });
});

describe("POST /api/dentals/:id", () => {
  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).post("/api/dentals/1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When patient already has a dental", () => {
    test("Should respond with a 409 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/dentals/1").set("token", token)

      expect(response.statusCode).toBe(409)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Dental for this patient is already available");
    });
  });

  describe("When patient is deactivated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/dentals/3").set("token", token)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Please reactivate"));
    });
  });

  describe("When patient does not exist", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/dentals/-1").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Patient with supplied ID does not exist");
    });
  });

  describe("When patient is not a cat or dog", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/dentals/4").set("token", token)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Dental not available for"));
    });
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code and appropriate message", async () => {
      jest.spyOn(DentalController, "insertTooth").mockReturnValueOnce(500);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/dentals/7").set("token", token)

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error creating dental. Please try again");
    });
  });
});

describe("PUT /dentals/tooth/:tooth_id/patient/:patient_id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code", async () => {
      const bodyData = {
        tooth_problem: 'Missing',
        tooth_note: 'Missing on Inspection'
      }

      const userPayload = {
        tooth_id: 101,
        tooth_patient_id: 1,
        tooth_problem: 'Missing',
        tooth_note: 'Missing on Inspection'
      }

      jest.spyOn(DentalController, "updateTooth").mockReturnValueOnce(userPayload);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/dentals/tooth/101/patient/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Tooth updated successfully");
      expect(response.body.body).toEqual(userPayload);
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).put("/api/dentals/tooth/101/patient/1");

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 422 status code", async () => {
      const bodyData = {
        tooth_problem: 123,
        tooth_note: null
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/dentals/tooth/101/patient/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("When patient is inactive", () => {
    test("Should respond with a 403 status code", async () => {
      const bodyData = {
        tooth_problem: 'Missing',
        tooth_note: 'Missing on Inspection'
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/dentals/tooth/101/patient/5").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Please reactivate"));
    });
  });

  describe("When patient does not exist", () => {
    test("Should respond with a 400 status code", async () => {
      const bodyData = {
        tooth_problem: 'Missing',
        tooth_note: 'Missing on Inspection'
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/dentals/tooth/101/patient/-1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Patient does not exist");
    });
  });

  describe("When tooth does not exist", () => {
    test("Should respond with a 400 status code", async () => {
      const bodyData = {
        tooth_problem: 'Missing',
        tooth_note: 'Missing on Inspection'
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/dentals/tooth/1011/patient/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Tooth does not exist");
    });
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code and appropriate message", async () => {
      const bodyData = {
        tooth_problem: 'Missing',
        tooth_note: 'Missing on Inspection'
      }

      jest.spyOn(DentalController, "updateTooth").mockReturnValueOnce(500);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/dentals/tooth/101/patient/1").set("token", token).send(bodyData);

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error updating tooth. Please try again");
    });
  });
});