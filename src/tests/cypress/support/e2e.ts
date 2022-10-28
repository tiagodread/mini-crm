// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// TODO: Fix TS import file from commands
import {faker} from '@faker-js/faker';
import authConfig from '../../../config/auth.json'


Cypress.Commands.add('createAccount', (name: string, email: string, password: string) => {
    const body = {
        name: name !== undefined ? name : faker.name.fullName(),
        email: email !== undefined ? email.toLowerCase() : faker.internet.email().toLowerCase(),
        password: password !== undefined ? password : faker.internet.password(20, true),
    };
    cy.request({
        method: 'POST',
        url: '/auth/register',
        body,
        failOnStatusCode: false,
    }).then((xhr) => {
        expect(xhr.status).to.eq(201);
        expect(xhr.body).to.have.property('token');
        expect(xhr.body).to.have.property('user');
        expect(xhr.body.user).to.have.property('email');
        expect(xhr.body.user).to.have.property('name');
        expect(xhr.body.token).to.not.be.empty;
        expect(xhr.body.user.name).to.not.be.empty;
        expect(xhr.body.user.email).to.not.be.empty;
        expect(xhr.body.user.created_at).to.not.be.empty;
        expect(xhr.body.user.updated_at).to.not.be.empty;
    });
});

Cypress.Commands.add('getForgotAccountMessage', (email: string) => {
    type EmailMessage = {
        token: string
        html_source_path: string
    }
    const BASE_URL = 'https://mailtrap.io/';
    let emailMessage: EmailMessage;
    cy.request({
        method: 'GET',
        url: `${BASE_URL}/api/accounts`,
        headers: {
            'Api-Token': authConfig.mailtrapApiToken,
        },
    }).then(({status, body}) => {
        expect(status).to.eq(200);
        cy.wrap(body[0]).as('accountMail');
    });

    cy.get('@accountMail').then((accountMail: any) => {
        cy.request({
            method: 'GET',
            url: `${BASE_URL}/api/accounts/${accountMail.id}/inboxes`,
            headers: {
                'Api-Token': authConfig.mailtrapApiToken,
            },
        }).then(({status, body}) => {
            expect(status).to.eq(200);
            cy.wrap(body[0]).as('inbox');
        });
    });

    cy.get('@inbox').then((inbox: any) => {
        cy.get('@accountMail').then((accountMail: any) => {
            cy.request({
                method: 'GET',
                url: `${BASE_URL}/api/accounts/${accountMail.id}/inboxes/${inbox.id}/messages/`,
                headers: {
                    'Api-Token': authConfig.mailtrapApiToken,
                },
            }).then((response: any) => {
                response.body.forEach((item: any) => {
                    if (item.to_email === email) {
                        emailMessage = item;
                    }
                });
                cy.request({
                    method: 'GET',
                    url: `${BASE_URL}${emailMessage.html_source_path}`,
                    headers: {
                        'Api-Token': authConfig.mailtrapApiToken,
                    },
                }).then(({status, body}) => {
                    expect(status).to.eq(200);
                    emailMessage.token = body.slice(0, -1);
                    return cy.wrap(emailMessage);
                });
            });
        });
    });
});