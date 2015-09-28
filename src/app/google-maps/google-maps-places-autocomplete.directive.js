import { GoogleMapsPlacesAutocompleteController } from './google-maps-places-autocomplete.controller';

export function GoogleMapsPlacesAutocompleteDirective (pxGoogleMapsAPI) {
  'ngInject';

  return {
    restrict: 'A',
    require: ['ngModel', 'pxGoogleMapsPlacesAutocomplete'],
    controller: GoogleMapsPlacesAutocompleteController,
    controllerAs: 'pxGoogleMapsPlacesAutocomplete',
    link: function (scope, iElement, iAttrs, [ngModel, pxGoogleMapsPlacesAutocomplete]) {
      if (iAttrs.noPlaceholder && scope.$eval(iAttrs.noPlaceholder) === true) {
        iElement.attr('placeholder', '');
      }

      pxGoogleMapsAPI.load().then((maps) => {
        let options = (iAttrs.pxGoogleMapsPlacesAutocomplete ? scope.$eval(iAttrs.pxGoogleMapsPlacesAutocomplete) : {});
        pxGoogleMapsPlacesAutocomplete.init(maps, ngModel, options);

        let change = (event) => pxGoogleMapsPlacesAutocomplete.change(event);
        let focus  = (event) => pxGoogleMapsPlacesAutocomplete.focus(event);
        let blur   = (event) => pxGoogleMapsPlacesAutocomplete.blur(event);

        iElement.on('change', change);
        iElement.on('focus',  focus);
        iElement.on('blur',   blur);

        let off = scope.$on('$destroy', () => {
          off();
          iElement.off('change', change);
          iElement.off('focus',  focus);
          iElement.off('blur',   blur);
        });
      });
    }
  };
}
