/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to set authentication tokens
       * @example cy.setAuthToken('accessToken', 'refreshToken')
       */
      setAuthToken(accessToken: string, refreshToken: string): Chainable<void>;
      /**
       * Custom command to clear authentication tokens
       * @example cy.clearAuthToken()
       */
      clearAuthToken(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('setAuthToken', (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  cy.setCookie('accessToken', accessToken);
});

Cypress.Commands.add('clearAuthToken', () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  cy.clearCookies();
});

export {};
