// Log application started
log.info('Application ' + app.name + ' started')

// Log when application is stopped
__.disposer(function() {
    log.info('Application ' + app.name + ' stopped');
})
