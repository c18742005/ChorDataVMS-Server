const request = require("supertest");
const app = require('../../app');
const DrugController = require("../../controllers/drug.controller");

describe("GET /api/drugs", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code and return drugs", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/drugs").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object))
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).get("/api/drugs")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });
});

describe("GET /api/drugs/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code and return drugs", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/drugs/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object))
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).get("/api/drugs/1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 401 status code and return appropriate message", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/drugs/-1").set("token", token)

      expect(response.statusCode).toBe(401)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Clinic does not exist")
    });
  });
});

describe("GET /api/drugs/:drugid/:clinicid", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code and return drugs", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/drugs/1/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object))
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const response = await request(app).get("/api/drugs/1/1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 401 status code and return appropriate message when drugID is wrong", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/drugs/-1/1").set("token", token)

      expect(response.statusCode).toBe(401)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Drug does not exist")
    });
  });

  test("Should respond with a 401 status code and return appropriate message when clinicID is wrong", async () => {

    const staffBody =  {
      username: "test.user",
      password: "P@ssword1"
    }
    
    const res = await request(app).post("/api/login").send(staffBody)
    const token = res.body.token
    const response = await request(app).get("/api/drugs/1/-1").set("token", token)

    expect(response.statusCode).toBe(401)
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
    expect(response.body).toEqual("Clinic does not exist")
  });
});

describe("POST /api/drugs", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code and appropriate message", async () => {
      const bodyData = {
        drug_batch_id: 109,
        drug_expiry_date: '2022-12-23',
        drug_quantity: '10',
        drug_quantity_measure: 'ml',
        drug_quantity_remaining: '10',
        drug_concentration: '2 mg/ml',
        drug_stock_drug_id: 1,
        drug_stock_clinic_id: 1
      }

      const userPayload = {
        drug_batch_id: 109,
        drug_expiry_date: '2022-12-23',
        drug_quantity: 10,
        drug_quantity_measure: 'ml',
        drug_concentration: '2 mg/ml',
        drug_stock_drug_id: 1,
        drug_stock_clinic_id: 1
      }

      jest.spyOn(DrugController, "addDrugStock").mockReturnValueOnce(userPayload)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.body).toEqual(userPayload);
      expect(response.body.message).toEqual("Drug Stock added successfully");
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).post("/api/drugs")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Validation errors should respond with a 422 status code", async () => {
      const bodyData = {
        drug_batch_id: '109',
        drug_expiry_date: 'twelve dec 2022',
        drug_quantity: '10',
        drug_quantity_measure: null,
        drug_concentration: 2,
        drug_stock_drug_id: 'One',
        drug_stock_clinic_id: 'One'
      }

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When info is missing", () => {
    test("Should respond with a 422 status code", async () => {
      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs").set("token", token)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When batch already exists", () => {
    test("Should respond with a 409 status code and appropriate message", async () => {
      const bodyData = {
        drug_batch_id: 101,
        drug_expiry_date: '2022-12-23',
        drug_quantity: '10',
        drug_quantity_measure: 'ml',
        drug_quantity_remaining: '10',
        drug_concentration: '2 mg/ml',
        drug_stock_drug_id: 1,
        drug_stock_clinic_id: 1
      }

      jest.spyOn(DrugController, "addDrugStock").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(409)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(String));
    });
  });

  describe("When clinic does not exist", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const bodyData = {
        drug_batch_id: 109,
        drug_expiry_date: '2022-12-23',
        drug_quantity: '10',
        drug_quantity_measure: 'ml',
        drug_quantity_remaining: '10',
        drug_concentration: '2 mg/ml',
        drug_stock_drug_id: 1,
        drug_stock_clinic_id: -1
      }

      jest.spyOn(DrugController, "addDrugStock").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Cannot add stock to drug. Clinic does not exist");
    });
  });

  describe("When drug does not exist", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const bodyData = {
        drug_batch_id: 109,
        drug_expiry_date: '2022-12-23',
        drug_quantity: '10',
        drug_quantity_measure: 'ml',
        drug_quantity_remaining: '10',
        drug_concentration: '2 mg/ml',
        drug_stock_drug_id: -1,
        drug_stock_clinic_id: 1
      }

      jest.spyOn(DrugController, "addDrugStock").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Cannot add stock to drug. Drug does not exist");
    });
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code and appropriate message", async () => {
      const bodyData = {
        drug_batch_id: 109,
        drug_expiry_date: '2022-12-23',
        drug_quantity: '10',
        drug_quantity_measure: 'ml',
        drug_quantity_remaining: '10',
        drug_concentration: '2 mg/ml',
        drug_stock_drug_id: 1,
        drug_stock_clinic_id: 1
      }

      jest.spyOn(DrugController, "addDrugStock").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error adding drug to stock. Please try again");
    });
  });
});

describe("POST /api/drugs/log", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code and appropriate message", async () => {
      const bodyData = {
        drug_date_given: '2022-02-02', 
        drug_quantity_given: '1',
        drug_quantity_measure: 'ml',
        drug_log_drug_stock_id: '101',
        drug_patient_id: 1,
        drug_staff_id: 1
      }

      const userPayload = {
        drug_log_id: 1,
        drug_date_given: '2022-02-02', 
        drug_quantity_given: '1',
        drug_quantity_measure: 'ml',
        drug_log_drug_stock_id: '101',
        drug_patient_id: 1,
        drug_staff_id: 1
      }

      jest.spyOn(DrugController, "addDrugLog").mockReturnValueOnce(userPayload)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.body).toEqual(userPayload);
      expect(response.body.message).toEqual("Drug successfully administered");
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).post("/api/drugs/log")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Validation errors should respond with a 422 status code", async () => {
      const bodyData = {
        drug_date_given: 'March 12th 2021', 
        drug_quantity_given: 1,
        drug_quantity_measure: 'ml',
        drug_log_drug_stock_id: 101,
        drug_patient_id: '1',
        drug_staff_id: '1'
      }

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When info is missing", () => {
    test("Should respond with a 422 status code", async () => {
      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When batch does not exist", () => {
    test("Should respond with a 404 status code and appropriate message", async () => {
      const bodyData = {
        drug_date_given: '2022-02-02', 
        drug_quantity_given: '1',
        drug_quantity_measure: 'ml',
        drug_log_drug_stock_id: '1011',
        drug_patient_id: 1,
        drug_staff_id: 1
      }

      jest.spyOn(DrugController, "addDrugLog").mockReturnValueOnce(500);

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(404)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Drug batch does not exist. Please recheck the batch code");
    });
  });

  describe("When measures do not match", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const bodyData = {
        drug_date_given: '2022-02-02', 
        drug_quantity_given: '1',
        drug_quantity_measure: 'tablet',
        drug_log_drug_stock_id: '101',
        drug_patient_id: 1,
        drug_staff_id: 1
      }

      jest.spyOn(DrugController, "addDrugLog").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Please use the correct measurement when administering"));
    });
  });

  describe("When enough drug does not exist", () => {
    test("Should respond with a 400 status code and appropriate message", async () => {
      const bodyData = {
        drug_date_given: '2022-02-02', 
        drug_quantity_given: '400',
        drug_quantity_measure: 'ml',
        drug_log_drug_stock_id: '101',
        drug_patient_id: 1,
        drug_staff_id: 1
      }

      jest.spyOn(DrugController, "addDrugLog").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Please use the remaining amount from this batch before starting a new batch"));
    });
  });

  describe("When patient is inactive", () => {
    test("Should respond with a 403 status code and appropriate message", async () => {
      const bodyData = {
        drug_date_given: '2022-02-02', 
        drug_quantity_given: '1',
        drug_quantity_measure: 'ml',
        drug_log_drug_stock_id: '101',
        drug_patient_id: 3,
        drug_staff_id: 1
      }

      jest.spyOn(DrugController, "addDrugLog").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Please reactivate "));
    });
  });

  describe("When staff member is not a vet", () => {
    test("Should respond with a 401 status code and appropriate message", async () => {
      const bodyData = {
        drug_date_given: '2022-02-02', 
        drug_quantity_given: '1',
        drug_quantity_measure: 'ml',
        drug_log_drug_stock_id: '101',
        drug_patient_id: 1,
        drug_staff_id: 100
      }

      jest.spyOn(DrugController, "addDrugLog").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(401)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Please ensure the drug is administered by a certified vet"));
    });
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code and appropriate message", async () => {
      const bodyData = {
        drug_date_given: '2022-10-10', 
        drug_quantity_given: 1,
        drug_quantity_measure: 'ml',
        drug_log_drug_stock_id: 101,
        drug_patient_id: '1',
        drug_staff_id: '1'
      }

      jest.spyOn(DrugController, "addDrugLog").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/drugs/log").set("token", token).send(bodyData)

      expect(response.status).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error adding drug to log. Please try again");
    });
  });
});