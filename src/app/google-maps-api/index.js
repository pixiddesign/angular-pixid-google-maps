export class GoogleMapsAPIProvider {
  constructor () {
    'ngInject';

    const googleMapsAPIProvider = this;

    const options = googleMapsAPIProvider.options = {
      url: 'https://maps.googleapis.com/maps/api/js',
      params: {
        language: 'en',
        libraries: 'places',
        v: '3.exp'
      }
    };

    this.$get = function ($httpParamSerializer, $q, $window) {

      let callbackCounter = $window.Math.round($window.Math.random() * 1000);

      function withDefaults (config = {}) {
        const opts = angular.copy(config);
        opts.params = angular.extend({}, options.params, opts.params || {});
        opts.url = config.url || options.url;
        return opts;
      }

      class GoogleMapsAPI {
        constructor () {}

        getURL (config = {}) {
          const { params, url } = withDefaults(config);
          const separator       = (url.indexOf('?') === -1) ? '?' : '&';
          return `${url}${separator}${$httpParamSerializer(params)}`;
        }

        include (src) {
          if (angular.isObject(src)) {
            return this.include(this.getURL(src));
          }
          if (this.includePromise) {
            return this.includePromise.catch(angular.noop).then(() => this.include(src));
          }
          if (this.includeScript) {
            this.includeScript.remove();
            delete this.includeScript;
          }
          const promise = this.includePromise = $q((resolve, reject) => {
            let script = this.includeScript = $window.document.createElement('script');
            script.onerror = reject;
            script.onload = resolve;
            script.type = 'text/javascript';
            script.src = src;
            script.async = true;
            $window.document.body.appendChild(script);
          });
          promise.finally(() => {
            if (promise === this.includePromise) {
              delete this.includePromise;
              if (this.includeScript) {
                this.includeScript.remove();
                delete this.includeScript;
              }
            }
          });
          return promise;
        }

        isLoaded (library) {
          if (angular.isArray(library)) {
            return library.every((library) => this.isLoaded(library));
          } else if (angular.isString(library)) {
            if (library.indexOf(',') !== -1) {
              let libraries = library.split(',');
              return this.isLoaded(libraries);
            }
            return this.isLoaded() && angular.isDefined($window.google.maps[library]);
          }
          return angular.isDefined($window.google) && angular.isDefined($window.google.maps);
        }

        load (config = {}) {
          const opts = withDefaults(config);
          if (this.isLoaded(opts.params.libraries)) {
            return $q.when($window.google.maps);
          } else if ($window.navigator.connection && $window.Connection && $window.navigator.connection.type === $window.Connection.NONE) {
            return $q((resolve, reject) => {
              let online = () => {
                $window.document.removeEventListener('online', online);
                this.load(opts).then(resolve).catch(reject);
              };
              $window.document.addEventListener('online', online);
            });
          }
          return $q((resolve, reject) => {
            let callback = opts.params.callback = `pxGoogleMaps${callbackCounter++}`;
            $window[callback] = () => {
              delete $window[callback];
              resolve($window.google.maps);
            };
            this.include(opts).catch((rejection) => {
              delete $window[callback];
              reject(rejection);
            });
          });
        }
      }

      return new GoogleMapsAPI();
    };

    this.$get.$inject = ['$httpParamSerializer', '$q', '$window'];
  }

  config (options = {}) {
    if (angular.isObject(options.params)) {
      this.options.params = angular.extend(angular.copy(this.options.params), options.params);
      delete options.params;
    }
    this.options = angular.extend(angular.copy(this.options), options);
  }
}

export default GoogleMapsAPIProvider;
