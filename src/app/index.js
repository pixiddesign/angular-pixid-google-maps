// App
import AppConfig from './app.config';
import AppRun from './app.run';

// Components
import GoogleMapsAPIProvider from './google-maps-api';
import GoogleMapsPlacesAutocompleteDirective from './google-maps-places-autocomplete';

export const AppModule = angular.module('pixid.googleMaps', [
    'ng'
  ])
  .provider('pxGoogleMapsAPI', GoogleMapsAPIProvider)
  .directive('pxGoogleMapsPlacesAutocomplete', GoogleMapsPlacesAutocompleteDirective)
  .config(AppConfig)
  .run(AppRun)
;

export default AppModule;
