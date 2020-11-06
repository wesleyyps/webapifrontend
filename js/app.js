jQuery.noConflict();

var apiUrl = 'http://localhost:5000/api',
    app = angular.module('WebFront', ['ngRoute']);

app.directive('userRepeatPostAction', function() {
    return function(scope, element, attrs) {
        if (scope.$last){
            jQuery('[data-toggle="tooltip"]').tooltip();
        }
    };
});

app.controller('ListController', function($scope, $http) {
    showLoading();

    $scope.formLabel = '';
    resetFormErrors($scope);
    $scope.userList = [];

    $scope.formUserId = 0;
    $scope.formUserName = '';
    $scope.formUserAge = 0;
    $scope.formUserAddress = '';

    $scope.addAction = function() {
        resetFormErrors($scope);
        
        $scope.formLabel = "Create New User";
        $scope.formUserId  = 0;
        $scope.formUserName = '';
        $scope.formUserAge = '';
        $scope.formUserAddress = '';
        jQuery('#form-modal').modal('show');
    };
    $scope.editAction = function($event, item) {
        if (jQuery($event.target).hasClass('fa-user-times')) {
            return false;
        }

        resetFormErrors($scope);
        
        $scope.formLabel = "Edit User #" + item.id;
        $scope.formUserId  = item.id;
        $scope.formUserName = item.name;
        $scope.formUserAge = item.age;
        $scope.formUserAddress = item.address;
        jQuery('#form-modal').modal('show');
    };
    $scope.searchAction = function() {
        showLoading();
        doSearch($scope, $http);    
    };
    $scope.saveAction = function() {
        doSave($scope, $http)
    };
    $scope.deleteAction = function(id) {
        doDelete($scope, $http, id);
    };
    $scope.clearInputAction = function(target)
    {
        jQuery(target).val('');
    };

    doSearch($scope, $http);
});

app.config(function($routeProvider) {
    $routeProvider 
        .when('/', {
            templateUrl : 'pages/list.html',
            controller : 'ListController'
        })
        .otherwise({redirectTo: '/'});
});
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = false;
}]);

function showLoading() 
{
    jQuery('#loading-modal').modal('show');
}

function hideLoading() 
{
    jQuery('#loading-modal').modal('hide');
}

function doSearch($scope, $http)
{
    var search = [],
        name = jQuery.trim(jQuery('#searchName').val());
    if (!(name === '')) {
        search.push("name="+name);
    }
    $http.get(apiUrl + '/Users' + (search.length > 0 ? '?' + search.join('&') : '')).
        then(function(response) {
            $scope.userList = response.data;
            hideLoading();
        }, function(response) {
            $scope.listSuccess = "";
            $scope.listError = "Error while loading the user list!";
            $scope.userList = [];
            hideLoading();
        });
}

function doSave($scope, $http)
{
    showLoading();

    resetFormErrors($scope);

    var item = {
        name: $scope.formUserName,
        age: $scope.formUserAge,
        address: $scope.formUserAddress
    }

    if ($scope.formUserId > 0) {
        $http.put(apiUrl + '/Users/'+$scope.formUserId, item).
            then(function(response) {
                $scope.listSuccess = 'User updated!';
                jQuery('#form-modal').modal('hide');
                doSearch($scope, $http);
            }, function(response) {
                parseErrorResponse($scope, response);
                hideLoading();
            });
    } else {
        $http.post(apiUrl + '/Users', item).
            then(function(response) {
                $scope.listSuccess = 'User created!';
                jQuery('#form-modal').modal('hide');
                doSearch($scope, $http);
            }, function(response) {
                parseErrorResponse($scope, response);
                hideLoading();
            });
    }
}

function parseErrorResponse($scope, response)
{
    if (typeof(response) === 'object') {
        if (response.hasOwnProperty('data') && typeof(response.data) === 'object' && response.data.hasOwnProperty('title')) {
            $scope.formError = 'The server responded with an error message: ' + response.data.title;
        } else if (response.hasOwnProperty('status') && !isNaN(response.status)) {
            $scope.formError = 'The server responded with an error code: ' + response.status;
        }

        if (response.hasOwnProperty('data') && typeof(response.data) === 'object' && response.data.hasOwnProperty('errors') && typeof(response.data.errors) === 'object') {
            var errorKeys = Object.keys(response.data.errors);
            if (errorKeys.length > 0) {
                var key2;
                jQuery.each(errorKeys, function(unused, key) {
                    if (key.indexOf('$') === 0) {
                        key2 = key.replace('$.', '').toLowerCase();
                        key2 = key2.charAt(0).toUpperCase() + key2.slice(1);
                    } else {
                        key2 = key;
                    }
                    var errorList = [];
                    jQuery.each(response.data.errors[key], function(unused, errorInfo) {
                        errorList.push(errorInfo);
                    });
                    if (errorList.length > 0) {
                        $scope['formError_' + key2] = errorList.join('<br/>');
                    }
                });
            } else {
                $scope.formError = 'VALIDATION ERROR: Could not determine which error ocurred!';
            }
        }
    } else {
        $scope.formError = 'ERROR: Could not determine which error ocurred!';
    }
}

function resetFormErrors($scope)
{
    $scope.listSuccess = '';
    $scope.listError = '';
    $scope.formError = '';
    $scope.formError_Name = '';
    $scope.formError_Age = '';
    $scope.formError_Address = '';
}

function doDelete($scope, $http, id)
{
    showLoading();

    $scope.listSuccess = '';
    $scope.listError = '';

    $http
        .delete(apiUrl + '/Users/' + id)
        .then(function(response) {
            $scope.listSuccess = 'User deleted!';
            doSearch($scope, $http);
        }, function(response) {
            $scope.listError = 'Error deleting user!';
            hideLoading();
        });
}