/// <reference types="cypress" />

describe("Auth API", () => {
    let baseUrl: string;
    let username: string;
    const password = "123456";

    let userId: number | null = 7;
    let createdTodoId: number | null = null;

    before(() => {
        baseUrl = Cypress.env('BACKEND_URL').replace(/\/$/, '');
        username = "testuser_" + Date.now();
    });

    it("Successful signup", () => {
        cy.request("POST", `${baseUrl}/signup`, {
            username,
            password,
            confirmPassword: password,
        }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.message).to.eq("สมัครสมาชิกสำเร็จ");
        });
    });

    it("Signup with duplicate username should error", () => {
        cy.request({
            method: "POST",
            url: `${baseUrl}/signup`,
            failOnStatusCode: false,
            body: {
                username,
                password,
                confirmPassword: password,
            },
        }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body.message).to.eq("Username นี้ถูกใช้แล้ว");
        });
    });

    it("Password mismatch should error", () => {
        cy.request({
            method: "POST",
            url: `${baseUrl}/signup`,
            failOnStatusCode: false,
            body: {
                username: "newuser_" + Date.now(),
                password,
                confirmPassword: "654321",
            },
        }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body.message).to.eq("รหัสผ่านไม่ตรงกัน");
        });
    });

    it("Successful login", () => {
        cy.request("POST", `${baseUrl}/login`, {
            username,
            password,
        }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.message).to.eq("เข้าสู่ระบบสำเร็จ");
            expect(res.body).to.have.property("userId");
            userId = res.body.userId;
        });
    });

    it("Login with wrong password should error", () => {
        cy.request({
            method: "POST",
            url: `${baseUrl}/login`,
            failOnStatusCode: false,
            body: {
                username,
                password: "wrongpass",
            },
        }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body.message).to.eq("รหัสผ่านไม่ถูกต้อง");
        });
    });

    it("Login with non-existent user should error", () => {
        cy.request({
            method: "POST",
            url: `${baseUrl}/login`,
            failOnStatusCode: false,
            body: {
                username: "nouser_" + Date.now(),
                password,
            },
        }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body.message).to.eq("ไม่มีผู้ใช้นี้");
        });
    });

    it("GET /users - should get list of users", () => {
        cy.request("GET", `${baseUrl}/users`).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an("array");
            expect(res.body.some((u: { username: string }) => u.username === username)).to.be.true;
        });
    });

    it("POST /create - create new todo successfully", () => {
        cy.request({
            method: "POST",
            url: `${Cypress.env("BACKEND_URL")}/create`,
            body: {
                userId,
                title: "My first todo",
                description: "Testing from Cypress",
                startDate: "2025-08-12",
                endDate: "2025-08-13",
            }
        }).then((res) => {
            expect(res.status).to.eq(200)
            expect(res.body).to.have.property("msg", "Insert successfully")
            expect(res.body.data).to.have.property("id")
            expect(res.body.data.title).to.eq("My first todo")
            createdTodoId = res.body.data.id;
        })
    })

    it("GET /todo/:userId - fetch todos of user", () => {
        cy.request("GET", `${Cypress.env("BACKEND_URL")}/todo/${userId}`).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an("array");
            expect(
                res.body.some(
                    (todo: { id: number; title: string }) =>
                        todo.id === createdTodoId && todo.title === "My first todo"
                )
            ).to.be.true;
        });
    });

    it("DELETE /todo - delete todo successfully", () => {
        cy.request("DELETE", `${baseUrl}/todo`, { id: createdTodoId }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.msg).to.eq("Delete successfully");
            expect(res.body.data.id).to.eq(createdTodoId);
        });
    });

    it("GET /todo/:userId - after deleting todo should not find it", () => {
        cy.request("GET", `${baseUrl}/todo/${userId}`).then((res) => {
            expect(res.status).to.eq(200);
            expect(
                res.body.some(
                    (todo: { id: number; title: string }) =>
                        todo.id === createdTodoId && todo.title === "Test Todo Title"
                )
            ).to.be.false;
        });
    });

    it("POST /todos/shareTodo - missing user_id", () => {
        cy.request({
        method: "POST",
        url: `${baseUrl}/todos/shareTodo`,
        failOnStatusCode: false,
        body: {},
        }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error).to.eq("user_id is a required parameter in the request body.");
        });
    });

    it("POST /todos/shareTodo - success", () => {
    const user_id = 1; 

    cy.request("POST", `${baseUrl}/todos/shareTodo`, { user_id }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  it("POST /todos/fullTodo - missing task_id_list", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/todos/fullTodo`,
      failOnStatusCode: false,
      body: {},
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq("task_id_list is required in the request body");
    });
  });

  it("POST /shareTodo/accept - missing id", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/shareTodo/accept`,
      failOnStatusCode: false,
      body: {},
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq("id is required in the request body.");
    });
  });

  it("POST /shareTodo/decline - missing id", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/shareTodo/decline`,
      failOnStatusCode: false,
      body: {},
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq("id is required in the request body.");
    });
  });

  it("POST /shareTodo/withOthers - missing fields", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/shareTodo/withOthers`,
      failOnStatusCode: false,
      body: { task_id: 1 },
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq("task_id and sharewith are required in the request body.");
    });
  });

  it("POST /todos/editTodo - missing id", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/todos/editTodo`,
      failOnStatusCode: false,
      body: { title: "new title" },
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq("Todo ID is required to edit a todo.");
    });
  });
});