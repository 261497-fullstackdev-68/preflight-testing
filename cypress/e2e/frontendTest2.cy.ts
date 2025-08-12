describe("Todo app", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("FRONTEND_URL"));

    cy.get('input[type="text"]').type("botthice");
    cy.get('input[type="password"]').type("1234");
    cy.get('button[type="submit"]').click();

    cy.contains("Hour").should("be.visible");
  });

  context("Next week button", () => {
    it("should display next week calendar correctly", () => {
      cy.wait(1000);
      cy.contains("12th").should("be.visible");
      cy.contains(">").click();
      cy.wait(1000);
      cy.contains("19th").should("be.visible");
      cy.contains("test next week").should("be.visible");
      cy.wait(1000);
    });
  });

  context("Previous week button", () => {
    it("should display previous week calendar correctly", () => {
      cy.wait(1000);
      cy.contains("12th").should("be.visible");
      cy.contains("<").click();
      cy.wait(1000);
      cy.contains("8th").should("be.visible");
      cy.contains("test previous week").should("be.visible");
      cy.wait(1000);
    });
  });

  context("Create new todo", () => {
    it("should display and can select date correctly then create and display correctly", () => {
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
      cy.wait(500);
      cy.contains("test 5").should("be.visible");
    });
  });

  context("Edit exist todo", () => {
    it("should edit todo and display correctly", () => {
      cy.contains("test 5").first().click();

      cy.contains("label", "Title")
        .next("div")
        .find("input")
        .clear()
        .type("test 6");

      cy.contains("save").click();
      cy.contains("Success!").should("be.visible");
      cy.contains("Success!").should("not.exist");
      cy.contains("test 6").should("be.visible");
      cy.contains("test 5").should("not.exist");
    });
  });

  context("Delete todo", () => {
    it("should delete todo and display correctly", () => {
      cy.contains("test 6").first().click();
      cy.contains("delete").click();
      cy.wait(500);
      cy.contains("test 5").should("not.exist");
    });
  });
});
