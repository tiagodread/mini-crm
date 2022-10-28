import {faker} from '@faker-js/faker';

let name: string;
let email: string;
let password: string;

describe('/register', () => {
    it('Should return 400 when name is not specified', () => {
        const name = undefined;
        const email = faker.internet.email().toLowerCase();
        const password = faker.internet.password(20, true);
        cy.request({
            method: 'POST',
            url: '/auth/register',
            body: {name, email, password},
            failOnStatusCode: false,
        }).then((xhr) => {
            expect(xhr.status).to.eq(400);
            expect((xhr.statusText)).to.eq('Bad Request');
            expect(xhr.body.error).to.eq('missing required field name');
        });
    });

    it('Should return 400 when email is not specified', () => {
        const name = faker.name.fullName();
        const email = undefined
        const password = faker.internet.password(20, true);
        cy.request({
            method: 'POST',
            url: '/auth/register',
            body: {name, email, password},
            failOnStatusCode: false,
        }).then((xhr) => {
            expect(xhr.status).to.eq(400);
            expect((xhr.statusText)).to.eq('Bad Request');
            expect(xhr.body.error).to.eq('missing required field email');
        });
    });

    it('Should return 400 when password is not specified', () => {
        const name = faker.name.fullName();
        const email = faker.internet.email().toLowerCase();
        const password = undefined
        cy.request({
            method: 'POST',
            url: '/auth/register',
            body: {name, email, password},
            failOnStatusCode: false,
        }).then((xhr) => {
            expect(xhr.status).to.eq(400);
            expect((xhr.statusText)).to.eq('Bad Request');
            expect(xhr.body.error).to.eq('missing required field password');
        });
    });

    it('Should be able to register successfully just once', () => {
        const name = faker.name.fullName();
        const email = faker.internet.email().toLowerCase();
        const password = faker.internet.password(20, true);
        cy.createAccount(name, email, password)

        // Make sure duplicate users cannot register
        cy.request({
            method: 'POST',
            url: '/auth/register',
            body: {name, email, password},
            failOnStatusCode: false,
        }).then((xhr) => {
            expect(xhr.status).to.eq(400);
            expect(xhr.statusText).to.eq('Bad Request');
            expect(xhr.body).to.eql({error: 'User already exists'});
        });
    });
});

describe('/authenticate', () => {
    let name: string;
    let email: string;
    let password: string;
    beforeEach(() => {
        name = faker.name.fullName();
        email = faker.internet.email().toLowerCase();
        password = faker.internet.password(20, true);
    });

    it('Can authenticate successfully', () => {
        cy.createAccount(name, email, password);
        cy.request({
            method: 'POST',
            url: '/auth/authenticate',
            body: {email, password},
            failOnStatusCode: false,
        }).then((xhr: any) => {
            expect(xhr.status).to.eq(200);
            expect(xhr.body).to.have.property('token');
            expect(xhr.body.user.name).to.eq(name);
            expect(xhr.body.user.email).to.eq(email);
            expect(xhr.body.user.created_at).to.not.be.empty;
            // eslint-disable-next-line no-underscore-dangle
            expect(xhr.body.user.id).to.not.be.empty;
        });
    });

    it('Can not authenticate with bad credentials', () => {
        cy.createAccount(name, email, password);

        const invalidCredentialsList = [
            {email, password: '1234567a'},
            {email: 'test@test.com', password},
            {email: 'test@test.com', password: '1234567a'},
        ];

        invalidCredentialsList.forEach((invalidCredentialBody) => {
            cy.request({
                method: 'POST',
                url: '/auth/authenticate',
                body: invalidCredentialBody,
                failOnStatusCode: false,
            }).then(({status, body}) => {
                expect(status).to.eq(401);
                expect(body.error).to.eq('Invalid email or password');
            });
        });
    });
});

describe('/forgot_password', () => {
    let name: string;
    let email: string;
    let password: string;
    beforeEach(() => {
        name = faker.name.fullName();
        email = faker.internet.email().toLowerCase();
        password = faker.internet.password(20, true);
    });

    it('Should not send a password reset token for non users', () => {
        cy.request({
            method: 'POST',
            url: '/auth/forgot_password',
            body: {
                email: 'test@test.com',
                password: '1234567a',
            },
            failOnStatusCode: false,
        }).then(({status, body}) => {
            expect(status).to.eq(401);
            expect(body).to.eql({error: 'Invalid email or password'});
        });
    });

    it('Should send a password reset token for registered users', () => {
        cy.createAccount(name, email, password);

        cy.request({
            method: 'POST',
            url: '/auth/forgot_password',
            body: {
                email,
                password,
            },
            failOnStatusCode: false,
        }).then(({status}) => {
            expect(status).to.eq(200);
        });
        cy.wait(3 * 1000);
        cy.getForgotAccountMessage(email).then((message) => {
            expect(message.subject).to.eq('Redefina sua senha');
            expect(message.to_email).to.eq(email);
            expect(message.token).to.not.empty;
        });
    });
});

describe('/reset_password', () => {

    beforeEach(() => {
        name = faker.name.fullName();
        email = faker.internet.email().toLowerCase();
        password = faker.internet.password(20, true);
    });

    it('Can not reset password using invalid authorization', () => {
        cy.createAccount(name, email, password);

        const invalidAuthorizationList = [
            {
                email: 'test@test.com',
                password,
                token: '1234',
                status: 400,
                error: {error: 'User not found'},
            },
            {
                email,
                password,
                token: '1234',
                status: 400,
                error: {error: 'Token invalid'},
            },
        ];

        invalidAuthorizationList.forEach((invalidAuth) => {
            cy.request({
                method: 'POST',
                url: '/auth/reset_password',
                body: invalidAuth,
                failOnStatusCode: false,
            }).then(({status, body}) => {
                expect(status).to.eq(invalidAuth.status);
                expect(body).to.eql(invalidAuth.error);
            });
        });
    });

    it('Can reset password successfully', () => {
        cy.createAccount(name, email, password);

        cy.request({
            method: 'POST',
            url: '/auth/forgot_password',
            body: {
                email,
            },
            failOnStatusCode: false,
        }).then(({status}) => {
            expect(status).to.eq(200);
        });

        cy.wait(3 * 1000);

        cy.getForgotAccountMessage(email).then((message: any) => {
            cy.request({
                method: 'POST',
                url: '/auth/reset_password',
                body: {
                    email,
                    password: 'new_pass',
                    token: message.token,
                },
                failOnStatusCode: false,
            }).then(({status}) => {
                expect(status).to.eq(200);
            });

            cy.request({
                method: 'POST',
                url: '/auth/authenticate',
                body: {
                    email,
                    password: 'new_pass',
                },
                failOnStatusCode: false,
            }).then((xhr) => {
                expect(xhr.status).to.eq(200);
                expect(xhr.body).to.have.property('token');
                expect(xhr.body.user.name).to.eq(name);
                expect(xhr.body.user.email).to.eq(email);
                expect(xhr.body.user.created_at).to.not.be.empty;
                // eslint-disable-next-line no-underscore-dangle
                expect(xhr.body.user.id).to.not.be.empty;
            });

            cy.request({
                method: 'POST',
                url: '/auth/authenticate',
                body: {
                    email,
                    password,
                },
                failOnStatusCode: false,
            }).then((xhr) => {
                expect(xhr.status).to.eq(401);
            });
        });
    });
});
