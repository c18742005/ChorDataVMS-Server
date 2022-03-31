const request = require("supertest");
const CremationController = require("../../controllers/cremation.controller");
const app = require('../../app');

describe("GET /api/cremations/clinic/:id", () => {
  describe("When ID is correct and user is authenticated", () => {
    test("Should respond with a 200 status code", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/cremations/clinic/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object))
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).get("/api/cremations/clinic/-1")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found")
    });
  });
});

describe("POST /api/cremations", () => {
  describe("When all details are correct", () => {
    test("Should respond with a 201 status code", async () => {
      const bodyData = {
        cremation_date_collected: '2022-02-01',
        cremation_date_ashes_returned_practice: '2022-02-01',
        cremation_date_ashes_returned_owner: '2022-02-01',
        cremation_form: 'Urn',
        cremation_owner_contacted: "Yes",
        cremation_patient_id: 13
      }

      const userPayload = {
        cremation_id: 100,
        cremation_date_collected: '2022-02-01',
        cremation_date_ashes_returned_practice: '2022-02-01',
        cremation_date_ashes_returned_owner: '2022-02-01',
        cremation_form: 'Urn',
        cremation_owner_contacted: true,
        cremation_patient_id: 13,
        patient_name: 'Babe',
        patient_microchip: '34857485901234'
      }

      jest.spyOn(CremationController, "insertCremation").mockReturnValueOnce(userPayload)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/cremations").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.body).toEqual(userPayload)
      expect(response.body.message).toEqual("Cremation Added Successfully")
    });
  });

  describe("When details are incorrect", () => {
    test("No JWT should respond with 403", async () => {
      const bodyData = {
        cremation_date_collected: '2022-02-01',
        cremation_date_ashes_returned_practice: '2022-02-01',
        cremation_date_ashes_returned_owner: '2022-02-01',
        cremation_form: 'Urn',
        cremation_owner_contacted: "Yes",
        cremation_patient_id: 13
      }

      const userPayload = {
        cremation_id: 100,
        cremation_date_collected: '2022-02-01',
        cremation_date_ashes_returned_practice: '2022-02-01',
        cremation_date_ashes_returned_owner: '2022-02-01',
        cremation_form: 'Urn',
        cremation_owner_contacted: true,
        cremation_patient_id: 13,
        patient_name: 'Babe',
        patient_microchip: '34857485901234'
      }

      jest.spyOn(CremationController, "insertCremation").mockReturnValueOnce(userPayload)

      const response = await request(app).post("/api/cremations").send(bodyData)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
    });

    test("Should respond with a 422 status code", async () => {
      const bodyData = {
        cremation_date_collected: '1 of Jan',
        cremation_date_ashes_returned_practice: '2 of Jan',
        cremation_date_ashes_returned_owner: 2,
        cremation_form: 12,
        cremation_owner_contacted: true,
        cremation_patient_id: 'thirteen'
      }
  
      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/cremations").set("token", token).send(bodyData)
  
      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });
})

describe("PUT /api/cremations/:id", () => {
  describe("When details are incorrect", () => {
    test("No JWT should respond with 403", async () => {
      const bodyData = {
        cremation_date_collected: '2022-02-01',
        cremation_date_ashes_returned_practice: '2022-02-01',
        cremation_date_ashes_returned_owner: '2022-02-01',
        cremation_form: 'Urn',
        cremation_owner_contacted: "Yes",
        cremation_patient_id: 13
      }

      const userPayload = {
        cremation_id: 100,
        cremation_date_collected: '2022-02-01',
        cremation_date_ashes_returned_practice: '2022-02-01',
        cremation_date_ashes_returned_owner: '2022-02-01',
        cremation_form: 'Urn',
        cremation_owner_contacted: true,
        cremation_patient_id: 13,
        patient_name: 'Babe',
        patient_microchip: '34857485901234'
      }

      jest.spyOn(CremationController, "updateCremation").mockReturnValueOnce(userPayload)

      const response = await request(app).put("/api/cremations/1").send(bodyData)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
    });

    test("Should respond with a 422 status code", async () => {
      const bodyData = {
        cremation_date_collected: '1 of Jan',
        cremation_date_ashes_returned_practice: '2 of Jan',
        cremation_date_ashes_returned_owner: 2,
        cremation_form: 12,
        cremation_owner_contacted: true,
        cremation_patient_id: 'thirteen'
      }
  
      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/cremations/1").set("token", token).send(bodyData)
  
      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });
})