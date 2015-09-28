// App
import { config } from './index.config';
import { runBlock } from './index.run';

// Components
import { GoogleMapsAPIProvider } from './google-maps/google-maps-api.provider';
import { GoogleMapsPlacesAutocompleteDirective } from './google-maps/google-maps-places-autocomplete.directive';

angular.module('pixid.googleMaps', [
    'ng'
  ])

  .provider('pxGoogleMapsAPI', GoogleMapsAPIProvider)
  .directive('pxGoogleMapsPlacesAutocomplete', GoogleMapsPlacesAutocompleteDirective)

  .config(config)
  .run(runBlock)
;
