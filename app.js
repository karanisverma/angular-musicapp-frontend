(function() {
    var app = angular.module('music-app', ['ngMaterial', 'ngResource', 'ngRoute']);
    
    app.directive('starRating', starRating);

      function starRating() {
    return {
      restrict: 'EA',
      template:
        '<ul class="star-rating" ng-class="{readonly: readonly}">' +
        '  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +
        '    <i class="fa fa-star"></i>' + // or &#9733
        '  </li>' +
        '</ul>',
      scope: {
        ratingValue: '=ngModel',
        max: '=?', // optional (default is 5)
        onRatingSelect: '&?',
        readonly: '=?'
      },
      link: function(scope, element, attributes) {
        if (scope.max == undefined) {
          scope.max = 5;
        }
        function updateStars() {
          scope.stars = [];
          for (var i = 0; i < scope.max; i++) {
            scope.stars.push({
              filled: i < scope.ratingValue
            });
          }
        };
        scope.toggle = function(index) {
          if (scope.readonly == undefined || scope.readonly === false){
            scope.ratingValue = index + 1;
            scope.onRatingSelect({
              rating: index + 1
            });
          }
        };
        scope.$watch('ratingValue', function(oldValue, newValue) {
          if (newValue) {
            updateStars();
          }
        });
      }
    };
  }

    app.service('musicAppService', ['$resource', function($resource) {
        this.getResource = function(url) {
            return $resource(url);
        }
        this.init = function() {
            var init_url = "http://104.197.128.152:8000/v1/tracks";
            trackResource = $resource(init_url);
            var val = trackResource.get(function() {
                console.log("init successful!", val);
            });
            return val;
        }
        this.init_val = this.init();

        this.initGenre = function() {
            var initGenre_url = "http://104.197.128.152:8000/v1/genres";
            genreResource = $resource(initGenre_url);
            var genVal = genreResource.get(function() {
                console.log("initGenre successful! ", genVal);
            });
            return genVal;
        }
        this.initGen_val = this.initGenre();

        this.getTrackProperty = function() {
            console.log("Getting Track property", this.trackProperty);
            return this.trackProperty;
        }
        this.setTrackProperty = function(property) {
            console.log("Setting Track property", property);
            this.trackProperty = property;
        }

        this.getGenreProperty = function() {
            console.log("Getting Genre property", this.GenreProperty);
            return this.GenreProperty;
        }
        this.setGenreProperty = function(property) {
            console.log("Setting Genre property", property);
            this.GenreProperty = property;
        }

    }]);

    app.controller('genreController', ['$scope', '$resource', '$mdDialog',
        '$mdMedia', 'musicAppService',
        function($scope, $resource, $mdDialog, $mdMedia, musicAppService) {
            var genre = this;
            genre.showEditGenre = false;
            genre.showNewTrack = false;
            var initGen_val = musicAppService.initGen_val;
            initGen_val.$promise.then(function(data) {
                genre.genreList = initGen_val.results;
                genre.next = initGen_val.next;
                genre.prev = initGen_val.previous;
            });
            this.nextGen = function() {
                console.log('next gen is clicked');
                var url = genre.next;
                trackFactory = $resource(url);
                var val = trackFactory.get(
                    function() {
                        console.log("Val value is => ", val.results);
                        genre.genreList = val.results;
                        genre.next = val.next;
                        genre.prev = val.previous;
                    });
            }
            this.prevGen = function() {
                var url = genre.prev;
                trackFactory = $resource(url);
                var val = trackFactory.get(
                    function() {
                        console.log("Val value is => ", val.results);
                        genre.genreList = val.results;
                        genre.next = val.next;
                        genre.prev = val.previous;
                    });
            }


            this.showNewGenreForm = function(ev) {
                console.log("Showing New genre form");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                $mdDialog.show({
                    controller: newGenreController,
                    templateUrl: 'template/newGenre.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(answer) {
                    console.log("ok is pressed");
                }, function() {
                    var refreshGen = musicAppService.initGenre();
                    refreshGen.$promise.then(function(data) {
                        genre.genreList = refreshGen.results;
                        genre.next = refreshGen.next;
                        genre.prev = refreshGen.previous;
                    });

                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            };


            this.showEditGenreForm = function(genProp, ev) {
                // console.log("Input showEditTrack form", trackProp);
                musicAppService.setGenreProperty(genProp);
                console.log("under show  Edit form function");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                // var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                $mdDialog.show({
                    controller: editGenreController,
                    templateUrl: 'template/editGenre.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(answer) {
                    console.log("ok is pressed");
                }, function() {
                    var refreshGen = musicAppService.initGenre();
                    refreshGen.$promise.then(function(data) {
                        genre.genreList = refreshGen.results;
                        genre.next = refreshGen.next;
                        genre.prev = refreshGen.previous;
                    });

                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            };
        }]);

    app.controller('trackController', ['$scope', '$resource', '$mdDialog',
        '$mdMedia', 'musicAppService',
        function($scope, $resource, $mdDialog, $mdMedia, musicAppService) {
            var track = this;
            track.rating1 = 2;
            var init_val = musicAppService.init_val;
            init_val.$promise.then(function(data) {
                track.trackList = init_val.results;
                track.next = init_val.next;
                track.prev = init_val.previous;
            });


            this.showEditTrackForm = function(trackProp, ev) {
                musicAppService.setTrackProperty(trackProp);
                console.log("under show  Edit form function");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                $mdDialog.show({
                    controller: editTrackController,
                    templateUrl: 'template/editTrack.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(answer) {
                    console.log("ok is pressed");
                }, function() {
                    console.log("cancel is pressed");
                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            };


            this.showNewTrackForm = function(ev) {
                console.log("under show form function");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                $mdDialog.show({
                    controller: newTrackController,
                    templateUrl: 'template/newtrack.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(answer) {
                    console.log("ok is pressed");
                }, function() {
                    console.log("cancel is pressed");
                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            };

            
            this.search = function() {
                var url = 'http://104.197.128.152:8000/v1/tracks';
                trackFactory = $resource(url);
                var entry = trackFactory.get({ title: track.searchKeyword }, function() {
                    console.log(entry);
                    track.trackList = entry.results;
                });
            }
            this.nextTrack = function() {
                var url = track.next;
                trackFactory = $resource(url);
                var val = trackFactory.get(
                    function() {
                        console.log("Val value is => ", val.results);
                        track.trackList = val.results;
                        track.next = val.next;
                        track.prev = val.previous;
                    });
            }
            this.prevTrack = function() {
                var url = track.prev;
                trackFactory = $resource(url);
                var val = trackFactory.get(
                    function() {
                        console.log("Val value is => ", val.results);
                        track.trackList = val.results;
                        track.next = val.next;
                        track.prev = val.previous;
                    });
            }
        }
    ]); //closing controller
    function newGenreController($resource, $scope, $mdDialog) {
        $scope.newGenre = function() {
            newGen_url = "http://104.197.128.152:8000/v1/genres";
            newGenResource = $resource(newGen_url);
            newGenData = {name:$scope.name};
            newGenResource.save(newGenData,function(){
                console.log("you nailed it man!");
            });
            $mdDialog.hide();
        }
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            console.log("calling cancel function");
            $mdDialog.hide(answer);
        };

    }

    function editGenreController($resource, $scope, $mdDialog, musicAppService) {
        genreVal = musicAppService.getGenreProperty();
        console.log("getting in genreVal", genreVal);
        $scope.name = genreVal.name;
        $scope.id = genreVal.id;
        $scope.update = function() {
            editGenUrl = "http://104.197.128.152:8000/v1/genres/" + $scope.id;
            resourceGen = $resource(editGenUrl);
            editGenData = { id: $scope.id, name: $scope.name };
            console.log("sending data is ", editGenData);
            resourceGen.save(editGenData, function() {
                console.log("changes have been made for genre you are awesome");
            });
            $mdDialog.hide();

        }
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            console.log("calling cancel function");
            $mdDialog.hide(answer);
        };
    }

    function editTrackController($resource, $scope, $mdDialog, musicAppService) {
        val = musicAppService.getTrackProperty();
        // console.log(JSON.stringify(val));
        $scope.id = val.id;
        $scope.trackname = val.title;
        $scope.rating = val.rating;
        // hardcoded for now.
        $scope.genres = [11];
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            console.log("calling cancel function");
            $mdDialog.hide(answer);
        };
        $scope.loadGenres = function() {
            console.log("button is clicked!");
            var url = 'http://104.197.128.152:8000/v1/genres';
            loadGenRes = $resource(url);
            var val = loadGenRes.get(function() {
                console.log(val.results);
                $scope.allGenres = val.results;
                $scope.genresNext = val.next;
            });
        }
        $scope.loadMoreGenre = function(old_gen) {
            console.log("load more button is clicked!");
            var url = $scope.genresNext;
            console.log("next genres url => " + $scope.genresNext);
            loadMoreGenRes = $resource(url);
            var val = loadMoreGenRes.get(function() {
                console.log("load more is successful!");
                $scope.allGenres = old_gen;
                console.log(val);
                // console.log(old_gen);
                $scope.allGenres.push.apply($scope.allGenres, val.results);
                $scope.genresNext = val.next;
            });

        }
        $scope.appandGenre = function(id) {
            if (jQuery.inArray(id, $scope.genres) == -1) {
                $scope.genres.push(id);
            } else {
                $scope.genres = jQuery.grep($scope.genres, function(value) {
                    return value != id;
                });
            }
            console.log($scope.genres);
        }
        $scope.saveTrack = function() {
            var url = 'http://104.197.128.152:8000/v1/tracks/' + $scope.id;
            editTraRes = $resource(url);
            editTrack = JSON.stringify({ id: $scope.id, title: $scope.trackname, rating: $scope.rating, genres: $scope.genres });
            console.log("Ready Edit data => ", editTrack);
            editTraRes.save(editTrack, function() {
                console.log("done like a boss !!");
            });
            $mdDialog.hide();
        }

    };

    function newTrackController($resource, $scope, $mdDialog) {
        $scope.genresArray = [];
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            console.log("calling cancel function");
            $mdDialog.hide(answer);
        };
        $scope.loadGenres = function() {
            console.log("button is clicked!");
            var url = 'http://104.197.128.152:8000/v1/genres';
            loadGenRes = $resource(url);
            var val = loadGenRes.get(function() {
                console.log(val.results);
                $scope.allGenres = val.results;
                $scope.genresNext = val.next;
            });
        }
        $scope.loadMoreGenre = function(old_gen) {
            console.log("load more button is clicked!");
            var url = $scope.genresNext;
            console.log("next genres url => " + $scope.genresNext);
            loadMoreGenRes = $resource(url);
            var val = loadMoreGenRes.get(function() {
                console.log("load more is successful!");
                $scope.allGenres = old_gen;
                console.log(val);
                // console.log(old_gen);
                $scope.allGenres.push.apply($scope.allGenres, val.results);
                $scope.genresNext = val.next;
            });
        }
        $scope.appandGenre = function(id) {
            if (jQuery.inArray(id, $scope.genresArray) == -1) {
                $scope.genresArray.push(id);
            } else {
                $scope.genresArray = jQuery.grep($scope.genresArray, function(value) {
                    return value != id;
                });
            }
            console.log($scope.genresArray);
        }

        $scope.saveTrack = function() {
            var url = 'http://104.197.128.152:8000/v1/tracks';
            saveTraRes = $resource(url);
            newTrack = JSON.stringify({ title: $scope.trackname, rating: $scope.rating, genres: $scope.genresArray });
            console.log("Ready save data => ", newTrack);
            saveTraRes.save(newTrack, function() {
                console.log("done like a boss !!");
            });
            $mdDialog.hide();
        }
    }



    app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
        $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
        $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    });
})();
