/// <reference types="Cypress" />

context("Task List", () => {
  it("can create Task and remove", () => {
    // Setup
    cy.visit(Cypress.env("ROOT_URL"));

    // Action
    cy.getCy("create-task-button").should("exist");
    cy.getCy("create-task-button").click();
    cy.getCy("create-task-modal-title").type("Task 1");
    cy.getCy("create-task-modal-description").type("Task 1 description");
    cy.getCy("create-task-modal-status").click();
    cy.getCy("create-task-modal-status-ToDo").click();
    cy.getCy("create-task-modal-ok").click();

    // Assertions
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/");
    cy.getCy("task-list-row").should(($div) => {
      if ($div.length < 1) {
        throw new Error("Did not find 1 element");
      }
    });

    // Actions to reset task list
    cy.getCy("task-list-remove").click({ multiple: true });
  });
});
