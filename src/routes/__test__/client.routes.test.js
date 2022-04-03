const request = require("supertest");
const ClientController = require("../../controllers/client.controller");
const app = require('../../app');

describe("POST /api/clients", () => {
  describe("When all details are correct", () => {
    test("Should respond with a 201 status code", async () => {
      const bodyData = {
        client_forename: "Example", 
        client_surname: "User", 
        client_address: "11 Example Lane", 
        client_city: "Dublin", 
        client_county: "Dublin", 
        client_phone: "0112345", 
        client_email: "example@gmail.com", 
        client_clinic_id: 1
      }

      const userPayload = {
        client_id: 1,
        client_forename: "Example", 
        client_surname: "User", 
        client_address: "11 Example Lane", 
        client_city: "Dublin", 
        client_county: "Dublin", 
        client_phone: "0112345", 
        client_email: "example@gmail.com", 
        client_clinic_id: 1
      }

      jest.spyOn(ClientController, "insertClient").mockReturnValueOnce(userPayload)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/clients").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.body).toEqual(userPayload)
      expect(response.body.message).toEqual("Client added successfully")
    });
  });

  describe("When details are incorrect", () => {
    test("No JWT should respond with 403", async () => {
      const bodyData = {
        client_forename: "Example", 
        client_surname: "User", 
        client_address: "11 Example Lane", 
        client_city: "Dublin", 
        client_county: "Dublin", 
        client_phone: "0112345", 
        client_email: "example@gmail.com", 
        client_clinic_id: 1
      }

      const userPayload = {
        client_id: 1,
        client_forename: "Example", 
        client_surname: "User", 
        client_address: "11 Example Lane", 
        client_city: "Dublin", 
        client_county: "Dublin", 
        client_phone: "0112345", 
        client_email: "example@gmail.com", 
        client_clinic_id: 1
      }

      jest.spyOn(ClientController, "insertClient").mockReturnValueOnce(userPayload)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }

      const response = await request(app).post("/api/clients").send(bodyData)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
    });

    test("Should respond with a 422 status code", async () => {
      const bodyData = {
        client_forename: 23132, 
        client_surname: 23131, 
        client_address: 432234, 
        client_city: 213321, 
        client_county: 23123, 
        client_phone: "String", 
        client_email: "example", 
        client_clinic_id: "One"
      }
  
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/clients").set("token", token).send(bodyData)
  
      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });
})

describe("GET /api/clients/:id", () => {
  describe("When ID is correct", () => {
    test("Should respond with a 200 status code", async () => {

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/clients/1").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.any(Object))
    });
  });

  describe("When ID is incorrect", () => {
    test("Should respond with a 401 status code", async () => {

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/clients/-1").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No client with this ID")
    });
  });
})

describe("PUT /api/clients/:id", () => {
  describe("When ID and info is correct", () => {
    test("Should respond with a 201 status code", async () => {
      const bodyData = {
        client_forename: "Example", 
        client_surname: "User", 
        client_address: "11 Example Lane", 
        client_city: "Dublin", 
        client_county: "Dublin", 
        client_phone: "0112345", 
        client_email: "example@gmail.com"
      }

      jest.spyOn(ClientController, "updateClient").mockReturnValueOnce(200)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/clients/1").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Client updated successfully")
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 422 status code", async () => {
      const bodyData = {
        client_forename: 2133, 
        client_surname: 231213, 
        client_address: 1231, 
        client_city: 21312, 
        client_county: 2131, 
        client_phone: "String", 
        client_email: "example"
      }

      jest.spyOn(ClientController, "updateClient").mockReturnValueOnce(200)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/clients/1").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When ID is incorrect", () => {
    test("Should respond with a 400 status code", async () => {
      const bodyData = {
        client_forename: "Example", 
        client_surname: "User", 
        client_address: "11 Example Lane", 
        client_city: "Dublin", 
        client_county: "Dublin", 
        client_phone: "0112345", 
        client_email: "example@gmail.com"
      }

      jest.spyOn(ClientController, "updateClient").mockReturnValueOnce(200)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/clients/-1").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toBe("Unable to update client")
    });
  });
})

describe("PUT /api/clients/deactivate/:id", () => {
  describe("When ID and reason is correct", () => {
    test("Should respond with a 201 status code", async () => {
      jest.spyOn(ClientController, "setClientInactive").mockReturnValueOnce(200)
      jest.spyOn(ClientController, "setPatientsInactive").mockReturnValueOnce(200)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/clients/deactivate/1").set("token", token).send({client_reason_inactive: "For test"})

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Client and associated pets deactivated")
    });
  });

  describe("When reason is not given", () => {
    test("Should respond with a 400 status code", async () => {
      jest.spyOn(ClientController, "setClientInactive").mockReturnValueOnce(200)
      jest.spyOn(ClientController, "setPatientsInactive").mockReturnValueOnce(200)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/clients/deactivate/1").set("token", token).send({})

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Reason to deactivate must be given")
    });
  });

  describe("When ID is not correct", () => {
    test("Should respond with a 400 status code", async () => {
      jest.spyOn(ClientController, "setClientInactive").mockReturnValueOnce(200)
      jest.spyOn(ClientController, "setPatientsInactive").mockReturnValueOnce(200)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/clients/deactivate/0").set("token", token).send({client_reason_inactive: "For test"})

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Client ID is not valid")
    });
  });
})

describe("PUT /api/clients/reactivate/:id", () => {
  describe("When ID is correct", () => {
    test("Should respond with a 201 status code", async () => {
      jest.spyOn(ClientController, "setClientActive").mockReturnValueOnce(200)
      jest.spyOn(ClientController, "setPatientsActive").mockReturnValueOnce(200)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/clients/reactivate/1").set("token", token)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Client and associated pets reactivated")
    });
  });

  describe("When ID is incorrect", () => {
    test("Should respond with a 400 status code", async () => {
      jest.spyOn(ClientController, "setClientActive").mockReturnValueOnce(200)
      jest.spyOn(ClientController, "setPatientsActive").mockReturnValueOnce(200)

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).put("/api/clients/reactivate/0").set("token", token)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Client not found")
    });
  });
})