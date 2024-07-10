// config-overrides.js
module.exports = function override(config, env) {
    if (config.devServer) {
        config.devServer.setupMiddlewares = (middlewares, devServer) => {
            // Define your middleware setup here
            return middlewares;
        };
    }
    return config;
};
