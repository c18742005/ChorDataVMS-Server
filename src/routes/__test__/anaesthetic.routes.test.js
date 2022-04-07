const request = require("supertest");
const AnaestheticController = require("../../controllers/anaesthetic.controller");
const app = require('../../app');

describe("GET /api/anaesthetic/:id", () => {
  describe("When ID is correct", () => {
    test("Should respond with a 200 status code", async () => {

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/anaesthetic/1").set("token", token)

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
      const response = await request(app).get("/api/anaesthetic/-1").set("token", token)

      expect(response.statusCode).toBe(401)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No such patient with ID supplied")
    });
  });
})

describe("GET /api/patient/anaesthetic/:id", () => {
  describe("When ID is correct", () => {
    test("Should respond with a 200 status code", async () => {

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/patient/anaesthetic/1").set("token", token)

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
      const response = await request(app).get("/api/anaesthetic/-1").set("token", token)

      expect(response.statusCode).toBe(401)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No such patient with ID supplied")
    });
  });
})

describe("POST /api/anaesthetic", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code", async () => {
      const bodyData = {
        patient_id: 1,
        staff_id: 1
      }

      const userPayload = {
        anaesthetic_id: 100,
        anaesthetic_patient_id: 1,
        anaesthetic_date: new Date().toISOString(),
        anaesthetic_staff_id: 1
      }

      jest.spyOn(AnaestheticController, "insertAnaesthetic").mockReturnValueOnce(userPayload);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.body).toEqual(userPayload);
      expect(response.body.message).toEqual("Anaesthetic started successfully");
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).post("/api/anaesthetic")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 422 status code", async () => {
      const bodyData = {
        patient_id: "One",
        staff_id: "One"
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When info is missing", () => {
    test("Should respond with a 422 status code", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic").set("token", token)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When patient does not exist", () => {
    test("Should respond with a 400 status code", async () => {
      const bodyData = {
        patient_id: -1,
        staff_id: 1
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No such patient with ID supplied");
    });
  });

  describe("When patient is inactive", () => {
    test("Should respond with a 403 status code", async () => {
      const bodyData = {
        patient_id: 3,
        staff_id: 1
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Please reactivate the patient before performing the anaesthetic procedure"));
    });
  });

  describe("When staff member is not authorised to perform the procedure", () => {
    test("Should respond with a 403 status code", async () => {
      const bodyData = {
        patient_id: 1,
        staff_id: 3
      }

      const staffBody =  {
        username: "reception.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual(expect.stringContaining("Please use an authorised vet or vet nurse to perform the monitoring procedure"));
    });
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code", async () => {
      const bodyData = {
        patient_id: 1,
        staff_id: 1
      }

      jest.spyOn(AnaestheticController, "insertAnaesthetic").mockReturnValueOnce(500);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error adding anaesthetic. Please try again");
    });
  });
});

describe("POST /api/anaesthetic/period", () => {
  describe("When info is correct", () => {
    test("Should respond with a 201 status code", async () => {
      const bodyData = {
        id: 1,
        interval: 0,
        hr: 100,
        rr: 30,
        oxygen: 1.25,
        anaesthetic: 1.5,
        eye_pos: "Central",
        reflexes: "Yes"
      }

      const userPayload = {
        anaesthetic_id: 100,
        anaesthetic_period: 0,
        anaesthetic_hr: 100,
        anaesthetic_rr: 30,
        anaesthetic_oxygen: 1.25,
        anaesthetic_agent: 1.5,
        anaesthetic_eye_pos: "Central",
        anaesthetic_reflexes: true
      }

      jest.spyOn(AnaestheticController, "insertAnaestheticPeriod").mockReturnValueOnce(userPayload);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.message).toEqual("Anaesthetic period added successfully");
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).post("/api/anaesthetic/period")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });

  describe("When info is incorrect", () => {
    test("Should respond with a 422 status code", async () => {
      const bodyData = {
        id: '100',
        interval: null,
        hr: 100.3,
        rr: 30.3,
        oxygen: "1.25",
        anaesthetic: -1,
        eye_pos: "Low",
        reflexes: "ya"
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When info is missing", () => {
    test("Should respond with a 422 status code", async () => {
      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }

      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic/period").set("token", token)

      expect(response.statusCode).toBe(422)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.errors).toBeDefined()
    });
  });

  describe("When anaesthetic sheet does not exist", () => {
    test("Should respond with a 400 status code", async () => {
      const bodyData = {
        id: -1,
        interval: 0,
        hr: 100,
        rr: 30,
        oxygen: 1.25,
        anaesthetic: 1.5,
        eye_pos: "Central",
        reflexes: "Yes"
      }

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("No such anaesthetic sheet with ID supplied");
    });
  });

  describe("When HR is wrong", () => {
    describe("When HR is too high", () => {
      test("Should respond with a 400 status code", async () => {
        const bodyData = {
          id: 1,
          interval: 0,
          hr: 500,
          rr: 30,
          oxygen: 1.25,
          anaesthetic: 1.5,
          eye_pos: "Central",
          reflexes: "Yes"
        }
  
        const staffBody =  {
          username: "vet.user",
          password: "P@ssword1"
        }
        
        const res = await request(app).post("/api/login").send(staffBody)
        const token = res.body.token
        const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)
  
        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        expect(response.body).toEqual("Heart rate must be between 0 and 400 BPM");
      });
    })

    describe("When HR is too low", () => {
      test("Should respond with a 400 status code", async () => {
        const bodyData = {
          id: 1,
          interval: 0,
          hr: -10,
          rr: 30,
          oxygen: 1.25,
          anaesthetic: 1.5,
          eye_pos: "Central",
          reflexes: "Yes"
        }
  
        const staffBody =  {
          username: "vet.user",
          password: "P@ssword1"
        }
        
        const res = await request(app).post("/api/login").send(staffBody)
        const token = res.body.token
        const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)
  
        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        expect(response.body).toEqual("Heart rate must be between 0 and 400 BPM");
      });
    })
  });

  describe("When RR is wrong", () => {
    describe("When RR is too high", () => {
      test("Should respond with a 400 status code", async () => {
        const bodyData = {
          id: 1,
          interval: 0,
          hr: 100,
          rr: 400,
          oxygen: 1.25,
          anaesthetic: 1.5,
          eye_pos: "Central",
          reflexes: "Yes"
        }
  
        const staffBody =  {
          username: "vet.user",
          password: "P@ssword1"
        }
        
        const res = await request(app).post("/api/login").send(staffBody)
        const token = res.body.token
        const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)
  
        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        expect(response.body).toEqual("Resp. rate must be between 0 and 100 BPM");
      });
    })

    describe("When RR is too low", () => {
      test("Should respond with a 400 status code", async () => {
        const bodyData = {
          id: 1,
          interval: 0,
          hr: 100,
          rr: -30,
          oxygen: 1.25,
          anaesthetic: 1.5,
          eye_pos: "Central",
          reflexes: "Yes"
        }
  
        const staffBody =  {
          username: "vet.user",
          password: "P@ssword1"
        }
        
        const res = await request(app).post("/api/login").send(staffBody)
        const token = res.body.token
        const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)
  
        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        expect(response.body).toEqual("Resp. rate must be between 0 and 100 BPM");
      });
    })
  });

  describe("When Oxygen Level is wrong", () => {
    describe("When oxygen is too high", () => {
      test("Should respond with a 400 status code", async () => {
        const bodyData = {
          id: 1,
          interval: 0,
          hr: 100,
          rr: 30,
          oxygen: 25,
          anaesthetic: 1.5,
          eye_pos: "Central",
          reflexes: "Yes"
        }
  
        const staffBody =  {
          username: "vet.user",
          password: "P@ssword1"
        }
        
        const res = await request(app).post("/api/login").send(staffBody)
        const token = res.body.token
        const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)
  
        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        expect(response.body).toEqual("Oxygen must be between 0 and 10 Liters");
      });
    })

    describe("When oxygen is too low", () => {
      test("Should respond with a 400 status code", async () => {
        const bodyData = {
          id: 1,
          interval: 0,
          hr: 100,
          rr: 30,
          oxygen: -3.25,
          anaesthetic: 1.5,
          eye_pos: "Central",
          reflexes: "Yes"
        }
  
        const staffBody =  {
          username: "vet.user",
          password: "P@ssword1"
        }
        
        const res = await request(app).post("/api/login").send(staffBody)
        const token = res.body.token
        const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)
  
        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        expect(response.body).toEqual("Oxygen must be between 0 and 10 Liters");
      });
    })
  });

  describe("When Anaesthetic Agent Level is wrong", () => {
    describe("When anaesthetic is too high", () => {
      test("Should respond with a 400 status code", async () => {
        const bodyData = {
          id: 1,
          interval: 0,
          hr: 100,
          rr: 30,
          oxygen: 2.5,
          anaesthetic: 10.25,
          eye_pos: "Central",
          reflexes: "Yes"
        }
  
        const staffBody =  {
          username: "vet.user",
          password: "P@ssword1"
        }
        
        const res = await request(app).post("/api/login").send(staffBody)
        const token = res.body.token
        const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)
  
        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        expect(response.body).toEqual("Anaesthetic agent must be between 0 and 5 Percent");
      });
    })

    describe("When anaesthetic is too low", () => {
      test("Should respond with a 400 status code", async () => {
        const bodyData = {
          id: 1,
          interval: 0,
          hr: 100,
          rr: 30,
          oxygen: 3.25,
          anaesthetic: -1.5,
          eye_pos: "Central",
          reflexes: "Yes"
        }
  
        const staffBody =  {
          username: "vet.user",
          password: "P@ssword1"
        }
        
        const res = await request(app).post("/api/login").send(staffBody)
        const token = res.body.token
        const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)
  
        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        expect(response.body).toEqual("Anaesthetic agent must be between 0 and 5 Percent");
      });
    })
  });

  describe("When server error occurs", () => {
    test("Should respond with a 500 status code", async () => {
      const bodyData = {
        id: 1,
        interval: 0,
        hr: 100,
        rr: 30,
        oxygen: 1.25,
        anaesthetic: 1.5,
        eye_pos: "Central",
        reflexes: "Yes"
      }

      jest.spyOn(AnaestheticController, "insertAnaestheticPeriod").mockReturnValueOnce(500);

      const staffBody =  {
        username: "vet.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).post("/api/anaesthetic/period").set("token", token).send(bodyData)

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Server error adding anaesthetic period. Please try again");
    });
  });
});