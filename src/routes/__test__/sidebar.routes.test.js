const request = require("supertest");
const app = require('../../app');

describe("GET /api/sidebar", () => {
  describe("When info is correct", () => {
    test("Should respond with a 200 status code", async () => {

      const staffBody =  {
        username: "test.user",
        password: "P@ssword1"
      }
      
      const res = await request(app).post("/api/login").send(staffBody)
      const token = res.body.token
      const response = await request(app).get("/api/sidebar").set("token", token)

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual({clinic_name: "Valley Vets"})
    });
  });

  describe("When user is not authenticated", () => {
    test("Should respond with a 403 status code", async () => {
      const response = await request(app).get("/api/sidebar")

      expect(response.statusCode).toBe(403)
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
      expect(response.body).toEqual("Unauthorised: JWT token not found");
    });
  });
});