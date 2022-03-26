const request = require("supertest");
const AuthController = require("../../controllers/authentication.controller");
const app = require('../../app');

describe("POST /api/register", () => {
  describe("When the username, password, role, and clinic_id are correct", () => {
    test("Should respond with a 201 status code", async () => {
      const bodyData = {
          username: "example.user",
          password: "P@ssword1",
          clinic_id: 1,
          role: "Vet"
      }

      const userPayload = {
        staff_member_id: 100,
        staff_username: "example.user",
        staff_password: "sjkfkJHGKJDJKHA",
        staff_clinic_id: 1,
        staff_role: "Vet"
      }

      jest.spyOn(AuthController, "insertStaff").mockReturnValueOnce(userPayload)

      const response = await request(app).post("/api/register").send(bodyData)

      expect(response.statusCode).toBe(201)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body.staff_info).toEqual(userPayload)
      expect(response.body.token).toEqual(expect.any(String))
    });
  });

  describe("When the username, password, role, clinic_id, or combo are missing", () => {
    test("Should respond with a 422 status code", async () => {
      const bodyData = [
        {},
        {
          password: "P@ssword1",
          clinic_id: 1,
          role: "Vet"
        },
        {
          username: "exampleuser",
          clinic_id: 1,
          role: "Vet"
        },
        {
          username: "exampleuser",
          password: "P@ssword1",
          role: "Vet"
        },
        {
          username: "exampleuser",
          password: "P@ssword1",
          clinic_id: 1
        }
      ];

      for(const body of bodyData) {
        const response = await request(app).post("/api/register").send(body)
        expect(response.statusCode).toBe(422)
      }
    });

    test("422 status code should specify JSON in content type header", async () => {
      const response = await request(app).post("/api/register").send({})
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
    });
  });

  describe("Validation errors", () => {
    test("Username incorrectly formatted returns 422 status code", async () => {
      const response = await request(app).post("/api/register").send({
        username: "£xampleU$er",
        password: "P@ssword1",
        clinic_id: 1,
        role: "Vet"
      })

      expect(response.statusCode).toBe(422)
    });

    test("Password incorrectly formatted returns 422 status code", async () => {
      const response = await request(app).post("/api/register").send({
        username: "exampleuser",
        password: "password",
        clinic_id: 1,
        role: "Vet"
      })

      expect(response.statusCode).toBe(422)
    });

    test("clinic_id not numeric returns 422 status code", async () => {
      const response = await request(app).post("/api/register").send({
        username: "exampleuser",
        password: "P@ssword",
        clinic_id: "One",
        role: "Vet"
      })

      expect(response.statusCode).toBe(422)
    });

    test("role outside allowed params returns 422 status code", async () => {
      const response = await request(app).post("/api/register").send({
        username: "exampleuser",
        password: "P@ssword",
        clinic_id: 1,
        role: "Doctor"
      })

      expect(response.statusCode).toBe(422)
    });
  });
})

describe("POST /api/login", () => {
  describe("Given correct username and password ", () => {
    test("Should respond with a 200 status code", async () => {
      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }

      const response = await request(app).post("/api/login").send(staffBody)
      expect(response.statusCode).toBe(201)
    });

    test("Should specify JSON in content type header", async () => {
      const response = await request(app).post("/api/login").send({
        username: "test.user",
        password: "P@ssword1"
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
    });

    test("Should send token on success", async () => {
      const response = await request(app).post("/api/login").send({
        username: "test.user",
        password: "P@ssword1"
      })
      expect(response.body.token).toBeDefined()
    });

    test("Should send staff_info on success", async () => {
      const response = await request(app).post("/api/login").send({
        username: "test.user",
        password: "P@ssword1"
      })
      expect(response.body.staff_info).toBeDefined()
    });

  });

  describe("When the username and password are missing", () => {
    test("Should respond with a 422 status code", async () => {
      const bodyData = [
        {},
        {password: "P@ssword1"},
        {username: "exampleuser"}
      ];

      for(const body of bodyData) {
        const response = await request(app).post("/api/login").send(body)
        expect(response.statusCode).toBe(422)
      }
    });

    test("422 status code should specify JSON in content type header", async () => {
      const response = await request(app).post("/api/login").send({})
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
    });
  });

  describe("Validation errors", () => {
    test("Should respond with a 422 status code", async () => {
      const bodyData = [
        {
          username: "t£stU$er",
          password: "P@ssword1"
        },
        {
          username: "t£stU$er",
          password: "password"
        },
        {
          username: "test.user",
          password: "password"
        }
      ];

      for(const body of bodyData) {
        const response = await request(app).post("/api/login").send(body)
        expect(response.statusCode).toBe(422)
      }
    });
  });
})