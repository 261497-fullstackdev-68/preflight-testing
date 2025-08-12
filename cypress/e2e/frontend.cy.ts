/// <reference types="cypress" />


describe('Auth pages', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('FRONTEND_URL'))
  })

  context('Login Page', () => {
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
    })

    it('สามารถเปิดหน้า Sign Up ได้', () => {
      cy.contains('Sign up').click()
      // ถ้าไม่มี routing URL change ให้ตรวจสอบ element แทน
      cy.contains('Sign Up').should('be.visible')
    })
  })

  context('Sign Up Page', () => {
    beforeEach(() => {
      cy.contains('Sign up').click()
    })

    // it('แสดง error ถ้า password กับ confirm password ไม่ตรงกัน', () => {
    //   cy.get('input[type="text"]').type('newuser')
    //   cy.get('input[type="password"]').first().type('123456')
    //   cy.get('input[type="password"]').last().type('654321')
    //   cy.get('button[type="submit"]').click()
    //   cy.contains('Passwords do not match.').should('be.visible')
    // })

    // it('แสดง error เมื่อ username ซ้ำ', () => {
    //   cy.intercept('POST', '/api/signup', {
    //     statusCode: 409,
    //     body: { error: 'Username already exists.' },
    //   }).as('signupRequestFail')

    //   cy.get('input[type="text"]').type('existinguser')
    //   cy.get('input[type="password"]').first().type('123456')
    //   cy.get('input[type="password"]').last().type('123456')
    //   cy.get('button[type="submit"]').click()

    //   cy.wait('@signupRequestFail')
    //   cy.contains('Username already exists.').should('be.visible')
    // })
  })
})