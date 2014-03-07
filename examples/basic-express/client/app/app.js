/* global angular, window */

angular.module('sampleKoastClientApp', ['koast'])

.controller('myCtrl', ['$scope', 'koast', '$timeout', '$q', '$log',
  function ($scope, koast, $timeout, $q, $log) {
    'use strict';

    // Attach the user service to the scope.
    $scope.user = koast.user;

    // Set the registration handler for the user. That will get fired when
    // we've got a new user that needs to be registered.
    koast.user.setRegistrationHanler(function () {
      var username;
      var displayName;
      var deferred = $q.defer();
      username = koast.user.data.email.split('@')[0];
      username += '-' + Math.floor(Math.random() * 10000);
      displayName = 'N' + Math.floor(Math.random() * 10000);
      $timeout(function () {
        var message = 'You need a username and a display name. We picked "' +
           username + '" and "' + displayName +'"!';
        window.alert(message);
        koast.user.data.username = username;
        koast.user.data.displayName = displayName;
        deferred.resolve();
      }, 1);
      return deferred.promise;
    });

    // Add sign in and sign out functions.
    $scope.signIn = function () {
      // Maybe do something before starting sign in.
      koast.user.signIn();
    };
    $scope.signOut = function () {
      // Maybe do something before signing the user out.
      koast.user.signOut();
    };


    // Now onto robots, which is our data.
    function reload() {
      // Request all robots from the server.
      koast.queryForResources('robots')
        .then(function (robots) {
          $scope.robots = robots;
        }, $log.error);
      $scope.robotStatus = {};
    }


    function makeRobotStatusUpdater(status, robotNumber) {
      if (status==='success') {
        return function() {
          $scope.robotStatus[robotNumber] = 'Success!';
        };
      } else {
        return function(error) {
          $scope.robotStatus[robotNumber] = 'Oops: ' + error.toString();
        };
      }
    }

    koast.user.whenSignedIn()
      .then(function() {

        $log.debug('Looks like the user is signed in now.');

        // Saves a robot upon button click.
        $scope.saveRobot = function (robot) {
          robot.save()
            .then(makeRobotStatusUpdater('success', robot.robotNumber))
            .then(null, makeRobotStatusUpdater('error', robot.robotNumber));
        };

        $scope.deleteRobot = function (robot) {
          robot.delete()
            .then(makeRobotStatusUpdater('success', robot.robotNumber))
            .then(null, makeRobotStatusUpdater('error', robot.robotNumber));
        };

        // Create a new robot and saves it.
        $scope.createRobot = function() {
          var newRobotData = {
            robotNumber: 90,
            robotName: 'Marvin90',
            owner: 'yuri'
          };
          koast.createResource('robots', newRobotData)
            .then(function() {
              return koast.getResource('robots', {robotNumber: 90});
            })
            .then(function(newRobot) {
              $scope.robots.push(newRobot);
            }, $log.error);
        };

        // Request one robot from the server.
        koast.getResource('robots', {
          robotNumber: 1
        })
          .then(function (robot) {
            $scope.myRobot = robot;
          }, $log.error);

        reload();

      })
      .then(null, $log.error);
  }
])

.run(['koast', '$log',
  function (koast, $log) {
    'use strict';
    $log.info('Koast:', koast);
    koast.init({
      siteTitle: 'App Awesome'
    });
    koast.setApiUriPrefix('http://localhost:3000/api/');
    koast.addEndpoint('robots', ':robotNumber');
  }
]);