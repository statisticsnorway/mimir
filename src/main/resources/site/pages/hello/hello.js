var portal = require('/lib/xp/portal'); // Import the portal library
var thymeleaf = require('/lib/thymeleaf'); // Import the Thymeleaf library

// Handle the GET request
exports.get = function(req) {

    // Prepare the model that will be passed to the view
    var model = {
        displayName: portal.getContent().displayName
    };

    // Specify the template file to use
    var view = resolve('hello.html');

    // Return the merged view and model in the response object
    return {
        body: thymeleaf.render(view, model)
    };
};
