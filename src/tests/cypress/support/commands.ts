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
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

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