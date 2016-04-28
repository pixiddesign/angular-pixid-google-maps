export class GoogleMapsPlacesAutocompleteController {
  constructor ($attrs, $element, $parse, $q, $scope, $timeout) {
    'ngInject';

    this.placeInput = null;

    this.placeModelGetter = angular.noop;
    this.placeModelSetter = angular.noop;

    if ($attrs.placeModel) {
      this.placeModelGetter = $parse($attrs.placeModel);
      this.placeModelSetter = this.placeModelGetter.assign;
    }

    this.placeIdModelGetter = angular.noop;
    this.placeIdModelSetter = angular.noop;

    if ($attrs.placeIdModel) {
      this.placeIdModelGetter = $parse($attrs.placeIdModel);
      this.placeIdModelSetter = this.placeIdModelGetter.assign;
    }

    this.$element = $element;
    this.$q       = $q;
    this.$scope   = $scope;
    this.$timeout = $timeout;

    this.dirty = false;
    this.queue = [];
  }

  init (googleMaps, ngModel, options = {}) {
    this.googleMaps = googleMaps;
    this.ngModel    = ngModel;
    this.options    = options;

    this.autocomplete        = new this.googleMaps.places.Autocomplete(this.$element[0], options);
    this.autocompleteService = new this.googleMaps.places.AutocompleteService();
    this.placesService       = new this.googleMaps.places.PlacesService(this.$element[0]);

    this.googleMaps.event.addListener(this.autocomplete, 'place_changed', this.placeChanged.bind(this));

    return this;
  }

  change () {
    this.dirty = true;
  }

  focus () {
    this.dirty = false;
  }

  blur () {
    if (this.queue.length === 0) {
      this.placeInput = this.$element.val();
      if (this.dirty === true) {
        if (!this.placeInput || (angular.isString(this.placeInput) && this.placeInput.length === 0)) {
          this.placeModelSetter(this.$scope, null);
          this.placeIdModelSetter(this.$scope, null);
          this.placeInput = null;
        } else {
          this.placeChanged();
        }
      } else {
        this.$timeout(() => {
          let place = this.placeModelGetter(this.$scope);
          if (place && angular.isDefined(place.formatted_address)) {
            this.$element.val(place.formatted_address);
            this.dirty = false;
          }
        });
      }
    }
    this.dirty = false;
  }

  placeChanged () {
    this.dirty = false;
    this.placeModelSetter(this.$scope, null);
    this.placeIdModelSetter(this.$scope, null);
    let promise = null;
    if (this.queue.length === 0) {
      promise = this.getPlace();
    } else {
      promise = this.queue[0].catch(angular.noop).then(this.getPlace.bind(this));
    }
    promise.finally(() => this.queue.pop());
  }

  getPlace () {
    return this.$q((resolve, reject) => {
      if (this.placeInput === null || this.placeInput.length === 0) {
        let autocompletePlace = this.autocomplete.getPlace();
        if (autocompletePlace && autocompletePlace.address_components) {
          resolve(autocompletePlace);
        } else if (autocompletePlace && autocompletePlace.name) {
          resolve(this.getPlacePrediction(autocompletePlace));
        } else {
          reject(autocompletePlace);
        }
      } else {
        let autocompletePlace = { name: this.placeInput };
        this.placeInput = null;
        resolve(this.getPlacePrediction(autocompletePlace));
      }
    }).then((place) => {
      this.$element.val(place.formatted_address);
      this.ngModel.$setViewValue(place.formatted_address);
      this.placeModelSetter(this.$scope, place);
      this.placeIdModelSetter(this.$scope, place.place_id);
      this.dirty = false;
      this.placeInput = null;
      return place;
    });
  }

  getPlacePrediction (place) {
    return this.$q((resolve, reject) => {
      let request = angular.extend({
        input:  place.name,
        offset: place.name.length
      }, this.options);
      this.autocompleteService.getPlacePredictions(request, (predictions) => {
        if (predictions && predictions.length > 0) {
          this.placesService.getDetails({ placeId: predictions[0].place_id }, (placeDetails, status) => {
            if (status === this.googleMaps.places.PlacesServiceStatus.OK) {
              resolve(placeDetails);
            } else if (status === this.googleMaps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
              this.$timeout(() => {
                resolve(this.getPlacePrediction(place));
              }, 250);
            } else {
              reject(status);
            }
          });
        } else {
          reject(predictions);
        }
      });
    });
  }
}

export default GoogleMapsPlacesAutocompleteController;
