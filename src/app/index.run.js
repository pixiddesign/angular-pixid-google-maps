export function runBlock ($rootScope) {
  'ngInject';

  // @if NODE_ENV='development'
  $rootScope.test = {};
  // @endif
}
