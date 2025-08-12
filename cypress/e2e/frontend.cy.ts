/// <reference types="cypress" />
let username = 1000000;

describe('Auth pages', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('FRONTEND_URL'))
  })

  context('Login Page', () => {
    it('แสดง validation message ถ้า username ว่าง', () => {
      cy.get('button[type="submit"]').click();
      cy.get('input[type="text"]')
        .then(($input) => {
          expect($input[0].validationMessage)
            .to.eq('Please fill out this field.');
        });
      //cy.wait(1000)
    });


    it('แสดง validation message ถ้า password ว่าง', () => {
      cy.get('input[type="text"]').type('testuser');
      cy.get('button[type="submit"]').click();
      cy.get('input[type="password"]')
        .then(($input) => {
          expect($input[0].validationMessage)
            .to.eq('Please fill out this field.');
        });
      //cy.wait(1000)
    });



    it('แสดง error เมื่อล็อกอินไม่สำเร็จ', () => {
      cy.intercept('POST', '/api/login', {
        statusCode: 401,
        body: { error: 'Incorrect username or password' },
      }).as('loginRequestFail')

      cy.get('input[type="text"]').type('wronguser')
      cy.get('input[type="password"]').type('wrongpass')
      cy.get('button[type="submit"]').click()

      cy.wait('@loginRequestFail')
      cy.contains('Incorrect username or password').should('be.visible')
      //cy.wait(1000)
    })

    it('สามารถเปิดหน้า Sign Up ได้', () => {
      cy.contains('Sign up').click()
      // ถ้าไม่มี routing URL change ให้ตรวจสอบ element แทน
      cy.contains('Sign Up').should('be.visible')
      //cy.wait(1000)
    })
  })

  context('Sign Up Page', () => {
    beforeEach(() => {
      cy.contains('Sign up').click()
      //cy.wait(1000)
    })


    it('แสดง error ถ้า password กับ confirm password ไม่ตรงกัน', () => {
      cy.get('input[type="text"]').type('newuser')
      cy.get('input[type="password"]').first().type('123456')
      cy.get('input[type="password"]').last().type('654321')
      cy.get('button[type="submit"]').click()
      cy.contains('Passwords do not match.').should('be.visible')
      //cy.wait(1000)
    })

    it('แสดง error เมื่อ username ซ้ำ', () => {
      cy.intercept('POST', '/api/signup', {
        statusCode: 409,
        body: { error: 'Username already exists.' },
      }).as('signupRequestFail')

      cy.get('input[type="text"]').type('existinguser')
      cy.get('input[type="password"]').first().type('123456')
      cy.get('input[type="password"]').last().type('123456')
      cy.get('button[type="submit"]').click()

      cy.wait('@signupRequestFail')
      cy.contains('Username already exists.').should('be.visible')
      //cy.wait(1000)
    })

    it('sign up สำเร็จ', () => {
      username++;

      cy.intercept('POST', '/api/signup', {
        statusCode: 201,
        body: { token: 'fake-jwt-token' },
      }).as('signupRequestSuccess')

      cy.get('input[type="text"]').type('newuser' + username)
      cy.get('input[type="password"]').first().type('123456')
      cy.get('input[type="password"]').last().type('123456')
      cy.get('button[type="submit"]').click().wait('@signupRequestSuccess')
      //cy.wait(1000)
      cy.get('.swal2-confirm').click();
    })
  })

  context('สร้าง Todo', () => {
    beforeEach(() => {
      cy.visit(Cypress.env('FRONTEND_URL'))
      cy.get('input[type="text"]').type('Test1')
      cy.get('input[type="password"]').type('1234')
      cy.get('button[type="submit"]').click()
    })

    it('notification', () => {
      cy.get('[aria-label="Notification"]').should('be.visible')
      // cy.get('[aria-label="Notification"]').click()
    })

    it("should display and can select date correctly", () => {

      cy.get('button[aria-label="Add"]').click();
      cy.contains("Create New Todo").should("be.visible");
      cy.get('input[placeholder="Task Title"]').type("test 5");
      cy.get('textarea[placeholder="Description"]').type("test 5");

      //   start date pick
      cy.get('input[placeholder="Select start date & time"]').click();
      cy.contains("Time").should("be.visible");
      cy.get(".react-datepicker__day--014").click();
      cy.get(".react-datepicker__time-list-item").contains("00:30").click();
      cy.get('input[placeholder="Select start date & time"]').should(
        "have.value",
        "2025-08-14 00:30"

      );

      //   end date pick
      cy.get('input[placeholder="Select end date & time"]').click();
      cy.contains("Time").should("be.visible");
      cy.get(".react-datepicker__day--014").click();
      cy.get(".react-datepicker__time-list-item").contains("19:30").click();
      cy.get('input[placeholder="Select end date & time"]').should(
        "have.value",
        "2025-08-14 19:30"
      );

      cy.get('button[type="submit"]').click();
      cy.contains("test 5").should("be.visible");
    });



  })

  context('Share test 5 to user Test2', () => {
    beforeEach(() => {
      cy.visit(Cypress.env('FRONTEND_URL'))
      cy.get('input[type="text"]').type('Test1')
      cy.get('input[type="password"]').type('1234')
      cy.get('button[type="submit"]').click()
    })

    it('share todo', () => {
      cy.contains('test 5').first().should('be.visible')
      cy.contains('test 5').first().click()
      cy.get('[aria-label="share"]').should('be.visible')
      cy.get('[aria-label="share"]').click()
      cy.contains('Test2').click()
    })



  })

  context('รับ shareTodo', () => {
    beforeEach(() => {
      cy.visit(Cypress.env('FRONTEND_URL'))
      cy.get('input[type="text"]').type('Test2')
      cy.get('input[type="password"]').type('1234')
      cy.get('button[type="submit"]').click()
    })

    it('accept shareTodo จาก Test1 ได้', () => {
      cy.get('[aria-label="Notification"]').should('be.visible')
      cy.get('[aria-label="Notification"]').click()
      cy.contains('Notification').should('be.visible')
      cy.get('[aria-label="close"]').should('be.visible')
      cy.get('[aria-label="accept"]').should('be.visible')
      cy.get('[aria-label="decline"]').should('be.visible')
      cy.contains('test 5').get('[aria-label="accept"]').click()
      cy.wait(1000)
      cy.get('[aria-label="close"]').click()
      cy.contains('test 5').should('be.visible')
    })
  })

  context('delete test 5 for user Test1', () => {
    beforeEach(() => {
      cy.visit(Cypress.env('FRONTEND_URL'))
      cy.get('input[type="text"]').type('Test1')
      cy.get('input[type="password"]').type('1234')
      cy.get('button[type="submit"]').click()
    })

    it('delete todo', () => {
      cy.contains('test 5').first().should('be.visible')
      cy.contains('test 5').first().click()
      cy.contains('delete').should('be.visible')
      cy.contains('delete').click()
      cy.contains('test 5').should('not.exist')
    })
  })

  context('เช็คว่า test 5 ถูกลบไปแล้ว', () => {
    beforeEach(() => {
      cy.visit(Cypress.env('FRONTEND_URL'))
      cy.get('input[type="text"]').type('Test2')
      cy.get('input[type="password"]').type('1234')
      cy.get('button[type="submit"]').click()
    })

    it('เช็คว่า test 5 ถูกลบไปแล้ว', () => {
      cy.contains('test 5').should('not.exist')
    })
  })
})