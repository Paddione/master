// middlewares/validationMiddleware.js
const { body, validationResult } = require('express-validator');

const registrationRules = () => {
    return [
        body('username').trim().notEmpty().withMessage('Username is required.')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
        body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
    ];
};

const loginRules = () => {
    return [
        body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required.'),
    ];
};

const forgotPasswordRules = () => {
    return [
        body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
    ];
};

const resetPasswordRules = () => {
    return [
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
    ];
};

const changePasswordRules = () => {
    return [
        body('currentPassword').notEmpty().withMessage('Current password is required.'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long.'),
        body('confirmNewPassword').custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('New passwords do not match.');
            }
            return true;
        }),
    ];
};


const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ msg: err.msg }));

    // Preserve old input data to repopulate the form
    const oldInput = req.body;

    // Flash errors and redirect back
    // This is a generic way, specific controllers might handle rendering differently
    req.flash('validation_errors', extractedErrors);
    req.flash('old_input', oldInput);

    // Redirect back to the previous page or a specific form page
    // The actual rendering with errors will be handled by the route that originally rendered the form.
    // For now, just flash and let the controller decide. A more robust way is to pass errors to the view directly.
    // For simplicity in this example, controllers will check for 'validation_errors' and 'old_input'
    // and re-render the form with these.

    // Example: Redirect back (might not be ideal for all cases)
    // return res.status(422).redirect(req.originalUrl);

    // Better: let the controller that calls validate handle the response
    // The controller will have access to req.flash('validation_errors') and req.flash('old_input')
    return next('route'); // This tells Express to skip to the next route handler,
    // or if this is the last one for this path, the main error handler.
    // It's better to handle rendering directly in the POST route.
    // I will adjust controllers to re-render the view.
};


module.exports = {
    registrationRules,
    loginRules,
    forgotPasswordRules,
    resetPasswordRules,
    changePasswordRules,
    validate // Note: The validate function here just prepares errors.
             // Controllers will need to check these flashed messages and re-render forms.
};