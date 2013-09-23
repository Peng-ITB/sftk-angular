'use strict';

angular.module('isamAngularApp.controllers', ['AngularForce', 'AngularForceObjectFactory', 'Contact', 'Account'])
.controller('HomeCtrl', function ($scope, AngularForce, $location, $route) {
    var isOnline;
    if(AngularForce.isOnline) {
        isOnline = AngularForce.isOnline()
    } else {
        isOnline = false;
    }
    
    var isAuthenticated;
    if(AngularForce.authenticated) {
        isAuthenticated = AngularForce.authenticated();
    } else {
        isAuthenticated = false;
    }

    //Offline support (only for Cordova)
    //First check if we are online, then check if we are already authenticated (usually happens in Cordova),
    //If Both online and authenticated(Cordova), go directly to /contacts view. Else show login page.
    if(!isOnline) {
        if(!isAuthenticated) {//MobileWeb
            return $location.path('/login');
        } else {//Cordova
            return $location.path('/contacts/');
        }
    }

    //If in visualforce, directly login
    if (AngularForce.inVisualforce) {
        $location.path('/login');
    } else if (AngularForce.refreshToken) { //If web, try to relogin using refresh-token
        AngularForce.login(function () {
            $location.path('/contacts/');
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    } else {
        $location.path('/login');
    }
})

.controller('LoginCtrl', function ($scope, AngularForce, $location) {
    //Usually happens in Cordova
    if (AngularForce.authenticated()) {
        return $location.path('/contacts/');
    }

    $scope.login = function () {
        //If in visualforce, 'login' = initialize entity framework
        if (AngularForce.inVisualforce) {
           AngularForce.login(function() {
            $location.path('/contacts/');
           });
        } else {
            AngularForce.login();
        }
    };



    $scope.isLoggedIn = function () {
        return AngularForce.authenticated();
    };

    $scope.logout = function () {
        AngularForce.logout(function () {
            //Now go to logout page
            $location.path('/logout');
            $scope.$apply();
        });
    };
})

.controller('CallbackCtrl', function ($scope, AngularForce, $location) {
    AngularForce.oauthCallback(document.location.href);

    //Note: Set hash to empty before setting path to /contacts to keep the url clean w/o oauth info.
    //..coz oauth CB returns access_token in its own hash making it two hashes (1 from angular,
    // and another from oauth)
    $location.hash('');
    $location.path('/contacts');
})

.controller('ContactListCtrl', function ($scope, AngularForce, $location, Contact) {
    if (!AngularForce.authenticated()) {
        return $location.path('/home');
    }

    $scope.searchTerm = '';
    $scope.working = false;

    Contact.query(function (data) {
        $scope.contacts = data.records;
        $scope.$apply();//Required coz sfdc uses jquery.ajax
    }, function (data) {
        alert('Query Error');
    });

    $scope.isWorking = function () {
        return $scope.working;
    };

    $scope.doSearch = function () {
        Contact.search($scope.searchTerm, function (data) {
            $scope.contacts = data;
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        }, function (data) {
        });
    };

    $scope.doView = function (contactId) {
        console.log('doView');
        $location.path('/view/' + contactId);
    };

    $scope.doCreate = function () {
        $location.path('/new');
    };
}).
controller('ContactCreateCtrl', function ($scope, $location, Contact) {
    $scope.save = function () {
        Contact.save($scope.contact, function (contact) {
            var c = contact;
            $scope.$apply(function () {
                $location.path('/view/' + c.Id);
            });
        });
    };
}).
controller('ContactViewCtrl', function ($scope, AngularForce, $location, $routeParams, Contact) {

    AngularForce.login(function () {
        Contact.get({id: $routeParams.contactId}, function (contact) {
            self.original = contact;
            $scope.contact = new Contact(self.original);
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    });

}).
controller('ContactDetailCtrl', function ($scope, AngularForce, $location, $routeParams, Contact) {
    var self = this;

    if ($routeParams.contactId) {
        AngularForce.login(function () {
            Contact.get({id: $routeParams.contactId},
                function (contact) {
                    self.original = contact;
                    $scope.contact = new Contact(self.original);
                    $scope.$apply();//Required coz sfdc uses jquery.ajax
                });
        });
    } else {
        $scope.contact = new Contact();
        //$scope.$apply();
    }

    $scope.isClean = function () {
        return angular.equals(self.original, $scope.contact);
    };

    $scope.destroy = function () {
        self.original.destroy(
            function () {
                $scope.$apply(function () {
                    $location.path('/contacts');
                });
            },
            function (errors) {
                alert('Could not delete contact!\n' + JSON.parse(errors.responseText)[0].message);
            }
        );
    };

    $scope.save = function () {
        if ($scope.contact.Id) {
            $scope.contact.update(function () {
                $scope.$apply(function () {
                    $location.path('/view/' + $scope.contact.Id);
                });

            });
        } else {
            Contact.save($scope.contact, function (contact) {
                var c = contact;
                $scope.$apply(function () {
                    $location.path('/view/' + c.Id || c.id);
                });
            });
        }
    };

    $scope.doCancel = function () {
        if ($scope.contact.Id) {
            $location.path('/view/' + $scope.contact.Id);
        } else {
            $location.path('/contacts');
        }
    };
})
.controller('AccountListCtrl', function ($scope, AngularForce, $location, Account) {
    if (!AngularForce.authenticated()) {
        return $location.path('/home');
    }

    $scope.searchTerm = '';
    $scope.working = false;

    Account.query(function (data) {
        $scope.accounts = data.records;
        $scope.$apply();//Required coz sfdc uses jquery.ajax
    }, function (data) {
        alert('Query Error');
    });

    $scope.isWorking = function () {
        return $scope.working;
    };

    $scope.doSearch = function () {
        Account.search($scope.searchTerm, function (data) {
            $scope.accounts = data;
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        }, function (data) {
        });
    };

    $scope.doView = function (accountId) {
        console.log('doView');
        $location.path('/view/' + accountId);
    };

    $scope.doCreate = function () {
        $location.path('/new');
    };
}).
controller('AccountCreateCtrl', function ($scope, $location, Account) {
    $scope.save = function () {
        Account.save($scope.account, function (account) {
            var c = account;
            $scope.$apply(function () {
                $location.path('/view/' + c.Id);
            });
        });
    };
}).
controller('AccountViewCtrl', function ($scope, AngularForce, $location, $routeParams, Account) {

    AngularForce.login(function () {
        Account.get({id: $routeParams.accountId}, function (account) {
            self.original = account;
            $scope.account = new Account(self.original);
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    });

}).
controller('AccountDetailCtrl', function ($scope, AngularForce, $location, $routeParams, Account) {
    var self = this;

    if ($routeParams.accountId) {
        AngularForce.login(function () {
            Account.get({id: $routeParams.accountId},
                function (contact) {
                    self.original = account;
                    $scope.account = new Account(self.original);
                    $scope.$apply();//Required coz sfdc uses jquery.ajax
                });
        });
    } else {
        $scope.account = new Account();
        //$scope.$apply();
    }

    $scope.isClean = function () {
        return angular.equals(self.original, $scope.account);
    };

    $scope.destroy = function () {
        self.original.destroy(
            function () {
                $scope.$apply(function () {
                    $location.path('/accounts');
                });
            },
            function (errors) {
                alert('Could not delete account!\n' + JSON.parse(errors.responseText)[0].message);
            }
        );
    };

    $scope.save = function () {
        if ($scope.account.Id) {
            $scope.account.update(function () {
                $scope.$apply(function () {
                    $location.path('/view/' + $scope.account.Id);
                });

            });
        } else {
            Account.save($scope.account, function (account) {
                var c = account;
                $scope.$apply(function () {
                    $location.path('/view/' + c.Id || c.id);
                });
            });
        }
    };

    $scope.doCancel = function () {
        if ($scope.account.Id) {
            $location.path('/view/' + $scope.account.Id);
        } else {
            $location.path('/accounts');
        }
    };
});
;