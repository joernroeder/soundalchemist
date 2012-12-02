(function() {
  
  // handler to login anonymously
  Accounts.registerLoginHandler(function(options) {
    if (!options.anonymous)
      return undefined; // don't handle
    
    // ok; if they are logging in, this means they don't have
    // a user yet. Create one. We don't need to ever find it again.
    return Accounts.insertUserDoc({generateLoginToken: true}, {});
  });
})();
