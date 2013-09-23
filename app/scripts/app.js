'use strict';
//, 'AngularForce', 'AngularForceObjectFactory'
var app = angular.module('isamAngularApp', ['isamAngularApp.controllers']).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {controller: 'HomeCtrl', templateUrl: '../views/home.html'}).
      when('/login', {controller: 'LoginCtrl', templateUrl: '../views/login.html'}).
      when('/logout', {controller: 'LoginCtrl', templateUrl: '../views/logout.html'}).
      when('/callback', {controller: 'CallbackCtrl', templateUrl: '../views/callback.html'}).
      when('/contacts', {controller: 'ContactListCtrl', templateUrl: '../views/contact/list.html'}).
      when('/view/:contactId', {controller: 'ContactViewCtrl', templateUrl: '../views/contact/view.html'}).
      when('/edit/:contactId', {controller: 'ContactDetailCtrl', templateUrl: '../views/contact/edit.html'}).
      when('/new', {controller: 'ContactDetailCtrl', templateUrl: '../views/contact/edit.html'}).
      when('/accounts', {controller: 'AccountListCtrl', templateUrl: '../views/account/list.html'}).
      when('/view/:accountId', {controller: 'AccountViewCtrl', templateUrl: '../views/account/view.html'}).
      when('/edit/:accountId', {controller: 'AccountDetailCtrl', templateUrl: '../views/account/edit.html'}).
      when('/new', {controller: 'AccountDetailCtrl', templateUrl: '../views/account/edit.html'}).
      otherwise({redirectTo: '/'});

  }]);

/**
 * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and
 * create an 'Contact' object. And then set its type, fields, where-clause etc.
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */
angular.module('Contact', []).factory('Contact', function (AngularForceObjectFactory) {
    var Contact = new AngularForceObjectFactory({type: 'Contact', fields: ['FirstName', 'LastName', 'Title', 'Phone', 'Email', 'Id'], where: '', limit: 20});
    return Contact;
});

angular.module('Account', []).factory('Account', function (AngularForceObjectFactory) {
    var Account = new AngularForceObjectFactory({type: 'Account', fields: ['Id', 'Name'], where: '', limit: 50});
    return Account;
});

function initApp(options, forcetkClient) {
    options = options || {};
    options.loginUrl = SFConfig.sfLoginURL;
    options.clientId = SFConfig.consumerKey;
    options.apiVersion = 'v27.0';
    options.userAgent = 'SalesforceMobileUI/alpha';
    options.proxyUrl = options.proxyUrl || SFConfig.proxyUrl;

    //In VF, you should get sessionId and use that as accessToken while initializing forcetk(Force.init)
    if (SFConfig.sessionId) {
        options.accessToken = SFConfig.sessionId;
    }

    //Init force
    Force.init(options, options.apiVersion, forcetkClient);
}

/**
 * Please configure Salesforce consumerkey, proxyUrl etc in getSFConfig().
 *
 * SFConfig is a central configuration JS Object. It is used by angular-force.js and also your app to set and retrieve
 * various configuration or authentication related information.
 *
 * Note: Please configure SFConfig Salesforce consumerkey, proxyUrl etc in getSFConfig() below.
 *
 * @property SFConfig Salesforce Config object with the following properties.
 * @attribute {String} sfLoginURL       Salesforce login url
 * @attribute {String} consumerKey      Salesforce app's consumer key
 * @attribute {String} oAuthCallbackURL OAuth Callback URL. Note: If you are running on Heroku or elsewhere you need to set this.
 * @attribute {String} proxyUrl         URL to proxy cross-domain calls. Note: This nodejs app acts as a proxy server as well at <location>/proxy/
 * @attribute {String} client           ForcetkClient. Set by forcetk lib
 * @attribute {String} sessionId        Session Id. Set by forcetk lib
 * @attribute {String} apiVersion       REST Api version. Set by forcetk (Set this manually for visualforce)
 * @attribute {String} instanceUrl      Your Org. specific url. Set by forcetk.
 *
 * @returns SFConfig object depending on where (localhost v/s heroku v/s visualforce) the app is running.
 */
function getSFConfig() {
    var location = document.location;
    var href = location.href;
    if (href.indexOf('file:') >= 0) { //Phonegap
        return {};
    } else if (configFromEnv && configFromEnv.sessionId) { //VisualForce just sets sessionId (as that's all what is required)
        return {
            sessionId: configFromEnv.sessionId
        };
    } else {
        if (!configFromEnv || configFromEnv.client_id === '' || configFromEnv.client_id === 'undefined' || configFromEnv.app_url === '' || configFromEnv.app_url === 'undefined') {
            throw 'Environment variable client_id and/or app_url is missing. Please set them before you start the app';
        }
        return {
            sfLoginURL: 'https://login.salesforce.com/',
            consumerKey: configFromEnv.client_id,
            oAuthCallbackURL: removeTrailingSlash(configFromEnv.app_url) + '/#/callback',
            proxyUrl: removeTrailingSlash(configFromEnv.app_url) + '/proxy/'
        };
    }
}


//Helper
function removeTrailingSlash(url) {
    return url.replace(/\/$/, '');
}

var SFConfig = getSFConfig();

SFConfig.maxListSize = 25;
app.constant('SFConfig', SFConfig);