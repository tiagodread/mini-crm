declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to create account via API.
         * @example cy.createAccount('Tiago', 'tiago@tiago.com', '1234567a')
         */
        createAccount(name: string, email: string, password: string): Chainable<void>

        /**
         * Custom command to get reset account token via API.
         * @example cy.getForgotAccountMessage('tiago@tiago.com')
         */
        getForgotAccountMessage(email: string): Chainable<ForgotAccountMessage>

    }

    interface ForgotAccountMessage {
        subject: string,
        to_email: string,
        token: string
    }
}