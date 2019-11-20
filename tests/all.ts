// tslint:disable-next-line:no-var-requires
void require('app-module-path').addPath(__dirname + '/../src/');

// Import test suites:

import './lib/audiocommons/api/client';
import './lib/audiocommons/ccLicensing';
import './lib/utils/intersect';
import './lib/cache/LruRamCache';
import './lib/i18n/grammar';
