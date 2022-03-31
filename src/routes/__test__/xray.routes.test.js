const request = require("supertest");
const app = require('../../app');
const XrayController = require("../../controllers/xray.controller");

describe("GET /api/xrays/clinic/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/xrays/clinic/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object))
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).get("/api/staff")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });
});

describe("GET /api/xrays/patient/:id", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/xrays/patient/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object))
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).get("/api/staff")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });
});

describe("POST /api/xrays", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code", async () => {
      const bodyData = {
        xray_date: '2022-08-02', 
        xray_image_quality: 'Overexposed', 
        xray_kV: 1.5,
        xray_mAs: 1.6,
        xray_position: 'Lateral',
        xray_patient_id: 1,
        patient_name: 'Scout', 
        patient_microchip: '123451234512345',
        staff_username: 'test.user'
      }

      const userPayload = {
        xray_id: 1,
        xray_date: '2022-08-02', 
        xray_image_quality: 'Overexposed', 
        xray_kV: 1.5,
        xray_mAs: 1.6,
        xray_position: 'Lateral',
        xray_patient_id: 1,
        patient_name: 'Scout', 
        patient_microchip: '123451234512345',
        staff_username: 'test.user'
      }

      jest.spyOn(XrayController, "insertXray").mockReturnValueOnce(userPayload)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/xrays").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.body).toEqual(userPayload);
      expect(response.body.message).toEqual("X-ray Added Successfully");
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).post("/api/xrays")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 422 status code", async () => {
      const bodyData = {
        xray_date: '22nd March 2022', 
        xray_image_quality: false, 
        xray_kV: '1',
        xray_mAs: '1.4',
        xray_position: true,
        xray_patient_id: 'One',
        patient_name: 'Scout', 
        patient_microchip: 123,
        staff_username: 'test.user'
      }

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/xrays").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When patient is not active", () => {
    test("Should respond with a 403 status code", async () => {
      const bodyData = {
        xray_date: '2022-08-02', 
        xray_image_quality: 'Overexposed', 
        xray_kV: 1.5,
        xray_mAs: 1.6,
        xray_position: 'Lateral',
        xray_patient_id: 3,
        patient_name: 'Bean', 
        patient_microchip: '192834756675849',
        staff_username: 'test.user'
      }

      jest.spyOn(XrayController, "insertXray").mockReturnValueOnce(500)

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/xrays").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(String));
    });
  });
});