import { Router } from "express";
import xss from "xss";
import {
    checkEmail,
    checkId,
    checkName,
    checkPassword
} from "../utils/helpers.js";
import {
    registerUser, updateUser
} from "../data/users.js";
const routes = Router();

/**
 * potential routes:
 * / (landing page)
 * /register (self-explanatory)
 * /logout (self-explanatory)
 * /dashboard (for dashboard)
 * /account (for profile page)
 * /leaderboard (self-explanatory)
 * /help (self-explanatory)
 * /goals (for sustainability goals)
 */

routes.get('/', (req, res) => {
    res.json({message: "Hello World!"});
});

routes
    .route('/register')
    .get(async (req, res) => {
        console.log(req.session.user);
        if (req.session.user) res.redirect('/account');
        else res.render('register');
    })
    .post(async (req, res) => {
        // console.log(req.body);
        let errors = [];
        let email = req.body.email;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let password = req.body.password;

        if (typeof email === 'undefined')
            errors.push('No email provided.');
        else if (typeof firstName === 'undefined')
            errors.push('No first name provided.');
        else if (typeof lastName === 'undefined')
            errors.push('No last name provided.');
        else if (typeof password === 'undefined')
            errors.push('No password provided.');

        if (errors.length > 0) {
            console.log(errors);
            res.status(400).render('login', {
                error: true,
                errors: errors
            });
            return;
        }

        let validEmail;
        try {
            validEmail = checkEmail(email);
        } catch (e) {
            errors.push(e);
        }

        let validFirstName;
        try {
            validFirstName = checkName(firstName, "First Name");
        } catch (e) {
            errors.push(e);
        }

        let validLastName;
        try {
            validLastName = checkName(lastName, "Last Name");
        } catch (e) {
            errors.push(e);
        }

        let validPassword;
        try {
            validPassword = checkPassword(password);
        } catch (e) {
            errors.push(e);
        }

        if (errors.length > 0) {
            console.log(errors);
            res.status(400).render('login', {
                error: true,
                errors: errors
            });
            return;
        }

        let user;
        try {
            user = await registerUser(
                xss(validFirstName),
                xss(validLastName),
                xss(validEmail),
                xss(validPassword)
            );
        } catch (e) {
            errors.push(e);
        }

        if (errors.length > 0) {
            console.log(errors);
            res.status(400).render('login', {
                error: true,
                errors: errors
            });
            return;
        }

        if (user) {
            req.session.user = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailAddress
            };
            res.redirect('/account');
        } else {
            errors.push('Internal Server Error');
            console.log(errors);
            res.status(500).render('register', {
                error: true,
                errors: errors
            });
            return;
        }
    });

routes.get('/logout', async (req, res) => {
    req.session.destroy();
    res.render('logout');
});

routes
    .route('/account')
    .get(async (req, res) => {
        if (!req.session.user) res.redirect('/login');
        else res.render('profile', {
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            email: req.session.user.email,
            devices: req.session.user.devices
        });
    })
    .patch(async (req, res) => {
        let errors = [];
        let id = req.body.id;
        let email = req.body.email;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let password = req.body.password;

        if (typeof id === 'undefined')
            errors.push('No user ID provided.');
        else if (typeof email === 'undefined')
            errors.push('No email provided.');
        else if (typeof firstName === 'undefined')
            errors.push('No first name provided.');
        else if (typeof lastName === 'undefined')
            errors.push('No last name provided.');
        else if (typeof password === 'undefined')
            errors.push('No password provided.');

        if (errors.length > 0) {
            res.status(400).render('profile', {
                error: true,
                errors: errors
            });
            return;
        }

        let validId;
        try {
            validId = checkId(req.body.id);
        } catch (e) {
            errors.push(e);
        }

        let validEmail;
        try {
            validEmail = checkEmail(email);
        } catch (e) {
            errors.push(e);
        }

        let validFirstName;
        try {
            validFirstName = checkName(firstName, "First Name");
        } catch (e) {
            errors.push(e);
        }

        let validLastName;
        try {
            validLastName = checkName(lastName, "Last Name");
        } catch (e) {
            errors.push(e);
        }

        let validPassword;
        try {
            validPassword = checkPassword(password);
        } catch (e) {
            errors.push(e);
        }

        if (errors.length > 0) {
            res.status(400).render('profile', {
                error: true,
                errors: errors
            });
            return;
        }

        let updatedUser;
        try {
            updatedUser = await updateUser(
                xss(validId),
                xss(validFirstName),
                xss(validLastName),
                xss(validEmail),
                xss(validPassword)
            );
        } catch (e) {
            errors.push(e);
            res.status(400).render('profile', {
                error: true,
                errors: errors
            });
            return;
        }

        req.session.user = {
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.emailAddress
        };
        res.render('profile', {
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            email: req.session.user.email,
            devices: req.session.user.devices
        });
    });

export default routes;