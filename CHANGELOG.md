# Changelog

## [2.37.0](https://github.com/statisticsnorway/mimir/compare/v2.36.0...v2.37.0) (2025-10-24)


### Features

* Add "Show less" functionality to Pagination Hooks [MIM-2312] ([#3309](https://github.com/statisticsnorway/mimir/issues/3309)) ([f99b67d](https://github.com/statisticsnorway/mimir/commit/f99b67d34b216f66fdded3d91f411fe3e4cee689))
* Add macro for keyfigure in text format [MIM-2347] ([#3327](https://github.com/statisticsnorway/mimir/issues/3327)) ([82c72bb](https://github.com/statisticsnorway/mimir/commit/82c72bb30dd178eb14fd8bce4d3e885b31d29f22))
* Add Show As Table feature to Highmaps [MIM-1831] ([#3453](https://github.com/statisticsnorway/mimir/issues/3453)) ([2502078](https://github.com/statisticsnorway/mimir/commit/25020788f1fb915a317b31ad5b1b93b1c73b7ef3))
* Add support for macro in article ingress [MIM-2353] ([#3386](https://github.com/statisticsnorway/mimir/issues/3386)) ([a72986e](https://github.com/statisticsnorway/mimir/commit/a72986e69fdba39fc746df5853360c839c431c83))
* Enable MathJax accessibility plugin [MIM-2187] ([#3461](https://github.com/statisticsnorway/mimir/issues/3461)) ([c56ab61](https://github.com/statisticsnorway/mimir/commit/c56ab61690cabb31c8dbb5a4c694626ddf664143))
* Fetch XP Content data for Editorial Cards part [MIM-2058] ([#3341](https://github.com/statisticsnorway/mimir/issues/3341)) ([c1ec251](https://github.com/statisticsnorway/mimir/commit/c1ec251d9e2901803c89170c9afb4c2e0f62053b))
* Fix styling cookie reset ([#3302](https://github.com/statisticsnorway/mimir/issues/3302)) ([2d55710](https://github.com/statisticsnorway/mimir/commit/2d557101d419d6de5372d9de108d9905a5db526e))
* Improve change text phrasing for Key Figure Text macro [MIM-2368] ([#3407](https://github.com/statisticsnorway/mimir/issues/3407)) ([586bb69](https://github.com/statisticsnorway/mimir/commit/586bb69a1493887032239ec7e2d1ca5e344a9ae0))
* SolrArchive (url service) [MIM-2333] ([#3348](https://github.com/statisticsnorway/mimir/issues/3348)) ([be1d294](https://github.com/statisticsnorway/mimir/commit/be1d294e4efef525aac79c7a7ad59c837fdcfe50))
* Support ingress with macro ingress for profiledBox part [MIM-2352] ([#3392](https://github.com/statisticsnorway/mimir/issues/3392)) ([69e02aa](https://github.com/statisticsnorway/mimir/commit/69e02aa5139557468f62f0aa7dcb07ab29556d15))
* Support Key Figure Text macro for articles in RSS news [MIM-2355] ([#3412](https://github.com/statisticsnorway/mimir/issues/3412)) ([6bf4ff4](https://github.com/statisticsnorway/mimir/commit/6bf4ff4395883170420a640b30a226218fbb388e))


### Bug Fixes

* add column header fields for highmap table ([#3473](https://github.com/statisticsnorway/mimir/issues/3473)) ([aece443](https://github.com/statisticsnorway/mimir/commit/aece443abeede0640a632147836ee9e9ca27a9c8))
* Add fallback for empty keyFigureData ([20684ee](https://github.com/statisticsnorway/mimir/commit/20684ee7b6fd3aa235cb3d7f5d979f793c0bfaa2))
* Add fallback for empty keyFigureData [MIM-2355] ([#3423](https://github.com/statisticsnorway/mimir/issues/3423)) ([20684ee](https://github.com/statisticsnorway/mimir/commit/20684ee7b6fd3aa235cb3d7f5d979f793c0bfaa2))
* add municipality to html title for kommunefakta [MIM-2325] ([#3462](https://github.com/statisticsnorway/mimir/issues/3462)) ([5692e6e](https://github.com/statisticsnorway/mimir/commit/5692e6e5a587cfd822a7daeb8fd2c65dd3bf36a4))
* Adding phrases to catch.error in PifCalculator.tsx [MIM-1683] ([#3427](https://github.com/statisticsnorway/mimir/issues/3427)) ([7ae55ca](https://github.com/statisticsnorway/mimir/commit/7ae55ca5b0f0471a3423585829609c176341fa93))
* Adjust tabindex to scrollable region (table) for Highmap [MIM-1831] ([#3463](https://github.com/statisticsnorway/mimir/issues/3463)) ([b9793c9](https://github.com/statisticsnorway/mimir/commit/b9793c9feaf1ceb6b532a0d59f74d73ac2b48bf9))
* Bug fixes for Solr updater service [MIM-2341] ([#3321](https://github.com/statisticsnorway/mimir/issues/3321)) ([e01115a](https://github.com/statisticsnorway/mimir/commit/e01115a8daa025e06f8497bb6921940fa607aab1))
* capitalize first letter in municipality title ([ffd6ae4](https://github.com/statisticsnorway/mimir/commit/ffd6ae4147b2290b3c4ee588d0efa0f270a43f52))
* capitalize first letter in municipality title [MIM-2325] ([#3477](https://github.com/statisticsnorway/mimir/issues/3477)) ([ffd6ae4](https://github.com/statisticsnorway/mimir/commit/ffd6ae4147b2290b3c4ee588d0efa0f270a43f52))
* Design adjustments to Cookie Banner part component [MIM-2337] ([#3317](https://github.com/statisticsnorway/mimir/issues/3317)) ([0c04d1c](https://github.com/statisticsnorway/mimir/commit/0c04d1ce1b05332ecee4ee7c01a5675f1726aa99))
* Disable context menu for MathJax [MIM-2187] ([#3472](https://github.com/statisticsnorway/mimir/issues/3472)) ([d3e1772](https://github.com/statisticsnorway/mimir/commit/d3e1772a282095bc1abe68b6b8a7cb122319701c))
* fix bootstrap overrides ([#3454](https://github.com/statisticsnorway/mimir/issues/3454)) ([35f25f6](https://github.com/statisticsnorway/mimir/commit/35f25f6f1077de3fd4983bd5b9172d2cdbf38027))
* Fix fetch tbml data try catch for internal and new public tables [MIM-2431] ([#3469](https://github.com/statisticsnorway/mimir/issues/3469)) ([eb391cc](https://github.com/statisticsnorway/mimir/commit/eb391cc80b365294944f257a542e55e7eb98e51d))
* Fix simpleStatbank part bug introduced by part cache ([9a797e3](https://github.com/statisticsnorway/mimir/commit/9a797e34e728a488d7714b17b94a037eb9c31cb7))
* Fix simpleStatbank part bug introduced by part cache [MIM-2396] ([#3442](https://github.com/statisticsnorway/mimir/issues/3442)) ([9a797e3](https://github.com/statisticsnorway/mimir/commit/9a797e34e728a488d7714b17b94a037eb9c31cb7))
* Fix sub title conditions for Profiled Box part [MIM-2379] ([#3424](https://github.com/statisticsnorway/mimir/issues/3424)) ([b44e1a4](https://github.com/statisticsnorway/mimir/commit/b44e1a4a4603bb6cb9456fbb10070d659eaf6b66))
* format article modified date without "oslo/europe" [MIM-2336] ([#3437](https://github.com/statisticsnorway/mimir/issues/3437)) ([1155ac1](https://github.com/statisticsnorway/mimir/commit/1155ac12dde5bbb8249d0c224971f45dfe3c8e1a))
* format modified date without "oslo/europe" ([1155ac1](https://github.com/statisticsnorway/mimir/commit/1155ac12dde5bbb8249d0c224971f45dfe3c8e1a))
* Highmap shows correct decimal point and some code cleanup [MIM-1831] ([#3476](https://github.com/statisticsnorway/mimir/issues/3476)) ([956e2be](https://github.com/statisticsnorway/mimir/commit/956e2beb5c5261b99e903fe7e3c8178c78d86aff))
* higmap small adjustment after testing [MIM-1831] ([#3479](https://github.com/statisticsnorway/mimir/issues/3479)) ([eb81dc2](https://github.com/statisticsnorway/mimir/commit/eb81dc29ee2e3a7e70c69355901198c40e57a3e3))
* improve logging of errors in mimir app [MIM-2297] ([#3420](https://github.com/statisticsnorway/mimir/issues/3420)) ([756d028](https://github.com/statisticsnorway/mimir/commit/756d0283638c4b41b94f1d52e4e1125ebd00ae7b))
* More timeline category link styling adjustments ([#3301](https://github.com/statisticsnorway/mimir/issues/3301)) ([154bdfd](https://github.com/statisticsnorway/mimir/commit/154bdfd1f24afbc6652a537711e0fc42f8ff1552))
* npm run dev [MIM-2371] ([#3409](https://github.com/statisticsnorway/mimir/issues/3409)) ([fda51f7](https://github.com/statisticsnorway/mimir/commit/fda51f74ae2e5e2c95f9c1a5e63f692f99eaf88c))
* pictureCardLink.href removed [MIM-2199] ([#3340](https://github.com/statisticsnorway/mimir/issues/3340)) ([8f85a61](https://github.com/statisticsnorway/mimir/commit/8f85a613fc3d662cb0467d1f24cf4bb063e48556))
* remove commit message from slack on mabl fail ([#3466](https://github.com/statisticsnorway/mimir/issues/3466)) ([9626174](https://github.com/statisticsnorway/mimir/commit/9626174198104d617863f53e61699488951efda3))
* Replace all & with &amp; for statbankSavedRequest ([818cd11](https://github.com/statisticsnorway/mimir/commit/818cd118402dc31f12df63f8cf669ba8047b21a7))
* Replace all & with &amp; for statbankSavedRequest [MIM-2136] ([#3449](https://github.com/statisticsnorway/mimir/issues/3449)) ([818cd11](https://github.com/statisticsnorway/mimir/commit/818cd118402dc31f12df63f8cf669ba8047b21a7))
* set correct timezone in article metadata [MIM-2336] ([#3426](https://github.com/statisticsnorway/mimir/issues/3426)) ([2cb9608](https://github.com/statisticsnorway/mimir/commit/2cb9608085450df87398605ad10c9bc2c48c1cad))
* set date as iso in article modified date ([50a30af](https://github.com/statisticsnorway/mimir/commit/50a30af356711bdeb4c5b0eabd62d77ca36da4dd))
* set date as iso in article modified date [MIM-2336] ([#3436](https://github.com/statisticsnorway/mimir/issues/3436)) ([50a30af](https://github.com/statisticsnorway/mimir/commit/50a30af356711bdeb4c5b0eabd62d77ca36da4dd))
* Set lowercase to time not change period for keyFigureText macro ([e92906e](https://github.com/statisticsnorway/mimir/commit/e92906e0c91bcfdc66508eaabde8ceaf351f0588))
* Set lowercase to time not change period for keyFigureText macro [MIM-2368] ([#3411](https://github.com/statisticsnorway/mimir/issues/3411)) ([e92906e](https://github.com/statisticsnorway/mimir/commit/e92906e0c91bcfdc66508eaabde8ceaf351f0588))
* Setting correct release please output variable ([a794c49](https://github.com/statisticsnorway/mimir/commit/a794c49935b3151fb199c326284f635706eda859))
* Setting correct release please output variable [MIM-2227] ([#3368](https://github.com/statisticsnorway/mimir/issues/3368)) ([a794c49](https://github.com/statisticsnorway/mimir/commit/a794c49935b3151fb199c326284f635706eda859))
* Show 0 value correct in highmap tooltip ([#3486](https://github.com/statisticsnorway/mimir/issues/3486)) ([b1db3c5](https://github.com/statisticsnorway/mimir/commit/b1db3c5b540399ffed645ba0abdd466a62b056d8))
* Simple Statbank error handling ([#3279](https://github.com/statisticsnorway/mimir/issues/3279)) ([3b3612c](https://github.com/statisticsnorway/mimir/commit/3b3612c9df5a69e052d319f782303ee0ff2b015d))
* Stop setCookieConsent polling after 3 failures [MIM-2350] ([#3356](https://github.com/statisticsnorway/mimir/issues/3356)) ([9e488a0](https://github.com/statisticsnorway/mimir/commit/9e488a095e4e3cea6145b8cfb4f4a6288ef7916a))
* update tsconfig for react to handle global types ([118dc22](https://github.com/statisticsnorway/mimir/commit/118dc22106d820b414c7c25ad9326491a539ca2a))
* Use date-fns lib instead of manually subtracting the dates ourselves for delete expired event log logic [MIM-2376] ([#3440](https://github.com/statisticsnorway/mimir/issues/3440)) ([d8c4b42](https://github.com/statisticsnorway/mimir/commit/d8c4b42a889c3715201c0406d9795c07bc1f9bc9))


### Build System and dependencies

* [MIM-2227] Add release-please workflow ([#3304](https://github.com/statisticsnorway/mimir/issues/3304)) ([d55c11a](https://github.com/statisticsnorway/mimir/commit/d55c11af3eaff12d01bc2189b1102be40ec56ffb))
* [MIM-2227] Modify prod deploy action to use generated changelog.md ([#3307](https://github.com/statisticsnorway/mimir/issues/3307)) ([9b8bd8b](https://github.com/statisticsnorway/mimir/commit/9b8bd8bf6785c775c800a932a21bf31f6c5e9611))
* add relase-please body to deploy-PR ([25b8fd3](https://github.com/statisticsnorway/mimir/commit/25b8fd3f6e3ba29348c7f14220c798297b6f01d2))
* adjustments and debugging ([494d3d8](https://github.com/statisticsnorway/mimir/commit/494d3d812e38c54d8a3002e64894780ad9e35388))
* Adjustments to release-please after first deploy [MIM-2227] ([#3396](https://github.com/statisticsnorway/mimir/issues/3396)) ([2c2de01](https://github.com/statisticsnorway/mimir/commit/2c2de016299b597db4152c514252a9118e40b451))
* bump @eslint/compat from 1.3.1 to 1.3.2 in the dependencies-patch-updates group ([#3374](https://github.com/statisticsnorway/mimir/issues/3374)) ([891be11](https://github.com/statisticsnorway/mimir/commit/891be113029d22a6da66a7f2480d8310197ab5ca))
* bump @eslint/compat in the dependencies-patch-updates group ([891be11](https://github.com/statisticsnorway/mimir/commit/891be113029d22a6da66a7f2480d8310197ab5ca))
* Bump @eslint/js from 9.35.0 to 9.36.0 ([#3457](https://github.com/statisticsnorway/mimir/issues/3457)) ([c9fe3f1](https://github.com/statisticsnorway/mimir/commit/c9fe3f1df4c9594d76868c1696acae0442e6f491))
* Bump @types/ramda from 0.31.0 to 0.31.1 in the dependencies-patch-updates group ([#3443](https://github.com/statisticsnorway/mimir/issues/3443)) ([4a46390](https://github.com/statisticsnorway/mimir/commit/4a463901ddf496cf13d3e0fc961433618a693c7a))
* Bump @types/ramda in the dependencies-patch-updates group ([4a46390](https://github.com/statisticsnorway/mimir/commit/4a463901ddf496cf13d3e0fc961433618a693c7a))
* bump actions/checkout from 4 to 5 ([#3390](https://github.com/statisticsnorway/mimir/issues/3390)) ([1be9751](https://github.com/statisticsnorway/mimir/commit/1be975135b802c6527cde40a4761401b7c71ab7b))
* bump actions/download-artifact from 4 to 5 ([#3364](https://github.com/statisticsnorway/mimir/issues/3364)) ([d3c2558](https://github.com/statisticsnorway/mimir/commit/d3c2558db5abc097f25f5a4d690545a2f1fec5c7))
* Bump actions/setup-node from 4 to 5 ([#3428](https://github.com/statisticsnorway/mimir/issues/3428)) ([f2ecd10](https://github.com/statisticsnorway/mimir/commit/f2ecd10026ae6b084eff9085e18ce778e8a3198c))
* Bump com.enonic.xp.app from 3.6.1 to 3.6.2 ([#3481](https://github.com/statisticsnorway/mimir/issues/3481)) ([0aff7ce](https://github.com/statisticsnorway/mimir/commit/0aff7ce68f44ca255c8270931bd80fceb9498ad5))
* bump commons-codec:commons-codec from 1.18.0 to 1.19.0 ([#3344](https://github.com/statisticsnorway/mimir/issues/3344)) ([63577f4](https://github.com/statisticsnorway/mimir/commit/63577f49587210269b9838205d3ca23909586489))
* bump cross-env from 7.0.3 to 10.0.0 ([#3347](https://github.com/statisticsnorway/mimir/issues/3347)) ([0dc97aa](https://github.com/statisticsnorway/mimir/commit/0dc97aa7b4b770ed045c69c64bf870295654401b))
* Bump eslint from 9.35.0 to 9.36.0 ([#3458](https://github.com/statisticsnorway/mimir/issues/3458)) ([64a7555](https://github.com/statisticsnorway/mimir/commit/64a755545316cee832e14fea0d8a72198838e427))
* bump eslint-plugin-jsdoc from 52.0.4 to 54.1.0 ([#3389](https://github.com/statisticsnorway/mimir/issues/3389)) ([671779a](https://github.com/statisticsnorway/mimir/commit/671779ae12c1108a4f7afcf32c888cbfc40624fb))
* Bump eslint-plugin-jsdoc from 54.6.0 to 60.1.0 ([#3460](https://github.com/statisticsnorway/mimir/issues/3460)) ([9c7d13c](https://github.com/statisticsnorway/mimir/commit/9c7d13c03956d1435e7fa678331475752703fc8f))
* bump google-github-actions/auth from 2.1.10 to 2.1.11 ([#3329](https://github.com/statisticsnorway/mimir/issues/3329)) ([001a35f](https://github.com/statisticsnorway/mimir/commit/001a35fad2ab90e8706b2c2bc7a93112c4ba4de8))
* bump google-github-actions/auth from 2.1.11 to 2.1.12 ([#3349](https://github.com/statisticsnorway/mimir/issues/3349)) ([cf5ddc8](https://github.com/statisticsnorway/mimir/commit/cf5ddc8fbef9457b05d624b9ead90791669017e2))
* Bump google-github-actions/auth from 2.1.12 to 3.0.0 ([#3416](https://github.com/statisticsnorway/mimir/issues/3416)) ([b1cfc63](https://github.com/statisticsnorway/mimir/commit/b1cfc63743cb876b941558160a60fd1715f56767))
* Bump jsonstat-toolkit from 1.6.0 to 2.0.0 ([#3331](https://github.com/statisticsnorway/mimir/issues/3331)) ([8221fa8](https://github.com/statisticsnorway/mimir/commit/8221fa802bb7f334ea7a90329fe494005bff32e5))
* Bump node to v22 in build.gradle and testOnPr workflow [MIM-2419] ([#3464](https://github.com/statisticsnorway/mimir/issues/3464)) ([6a3968e](https://github.com/statisticsnorway/mimir/commit/6a3968e8ac42d6063168d2e9b9805b0ea5edda05))
* Bump sass from 1.92.1 to 1.93.0 ([#3459](https://github.com/statisticsnorway/mimir/issues/3459)) ([6d0b2b9](https://github.com/statisticsnorway/mimir/commit/6d0b2b9ace18742b034aa6bb8cadc7b3109e38d9))
* bump the dependencies-minor-updates group across 1 directory with 3 updates ([#3410](https://github.com/statisticsnorway/mimir/issues/3410)) ([57244f5](https://github.com/statisticsnorway/mimir/commit/57244f53df3f636ca899096e6b2f0ac61f6ba5f8))
* bump the dependencies-minor-updates group across 1 directory with 6 updates ([#3367](https://github.com/statisticsnorway/mimir/issues/3367)) ([fe0f66e](https://github.com/statisticsnorway/mimir/commit/fe0f66e6a88bee12a7b768ef0775daa675558c86))
* bump the dependencies-minor-updates group with 2 updates ([#3375](https://github.com/statisticsnorway/mimir/issues/3375)) ([c9278bd](https://github.com/statisticsnorway/mimir/commit/c9278bde0a49b3c15ba64901eb0900a9671c556a))
* Bump the dependencies-minor-updates group with 2 updates ([#3417](https://github.com/statisticsnorway/mimir/issues/3417)) ([fb23e04](https://github.com/statisticsnorway/mimir/commit/fb23e0490d66e2157c1f389282308b899b8db3bf))
* Bump the dependencies-minor-updates group with 6 updates ([#3430](https://github.com/statisticsnorway/mimir/issues/3430)) ([ce6c3ba](https://github.com/statisticsnorway/mimir/commit/ce6c3ba06180f92d0af5bccdd9a63baf8941af29))
* bump the dependencies-patch-updates group across 1 directory with 3 updates ([#3366](https://github.com/statisticsnorway/mimir/issues/3366)) ([1a5f542](https://github.com/statisticsnorway/mimir/commit/1a5f5427e59b8dacf9ce96656e48310527be851c))
* Bump the dependencies-patch-updates group with 5 updates ([#3429](https://github.com/statisticsnorway/mimir/issues/3429)) ([f5cf24d](https://github.com/statisticsnorway/mimir/commit/f5cf24d09faf17cf27d1d1335c0bb6baab734a3c))
* bump the dependencies-patch-updates group with 7 updates ([#3387](https://github.com/statisticsnorway/mimir/issues/3387)) ([cd31394](https://github.com/statisticsnorway/mimir/commit/cd3139478995deeeb4b9238818a73600d2ae45ef))
* Bump uuid from 11.1.0 to 12.0.0 ([#3431](https://github.com/statisticsnorway/mimir/issues/3431)) ([60fe0fd](https://github.com/statisticsnorway/mimir/commit/60fe0fde09584847de12bc8cbfd68d0407d307c8))
* fix PR creation syntax ([60ab29e](https://github.com/statisticsnorway/mimir/commit/60ab29ed587c316bc563359c95656456a893f45c))
* fix PR creation syntax [MIM-2227] ([#3380](https://github.com/statisticsnorway/mimir/issues/3380)) ([60ab29e](https://github.com/statisticsnorway/mimir/commit/60ab29ed587c316bc563359c95656456a893f45c))
* fix release please config path syntax ([#3354](https://github.com/statisticsnorway/mimir/issues/3354)) ([7b6a52d](https://github.com/statisticsnorway/mimir/commit/7b6a52d982ccfa4607f4ea19f2a6464b1231c4a4))
* fix setup for release please ([61d3f50](https://github.com/statisticsnorway/mimir/commit/61d3f5018553c903938e6cc36f4f1a2489cd833e))
* fix setup for release please [MIM-2227] ([#3353](https://github.com/statisticsnorway/mimir/issues/3353)) ([61d3f50](https://github.com/statisticsnorway/mimir/commit/61d3f5018553c903938e6cc36f4f1a2489cd833e))
* fix syntax for output in GitHub workflow [MIM-2227] ([#3376](https://github.com/statisticsnorway/mimir/issues/3376)) ([5c17dd0](https://github.com/statisticsnorway/mimir/commit/5c17dd04b29a635125a12c86ee1310a3ce1c1171))
* fix typo in step reference in release workflow [MIM-2227] ([#3378](https://github.com/statisticsnorway/mimir/issues/3378)) ([7e0efc9](https://github.com/statisticsnorway/mimir/commit/7e0efc93a26249c71fed14565f6e74f9307a5ccd))
* fixed release workflow ([cbe9ddb](https://github.com/statisticsnorway/mimir/commit/cbe9ddbe7f937ff1d1831c920dbfe05749f89cc6))
* Fixed release workflow [MIM-2227] ([#3363](https://github.com/statisticsnorway/mimir/issues/3363)) ([90f0c8d](https://github.com/statisticsnorway/mimir/commit/90f0c8d345e95676446799ed634309a02defae92))
* Modify jira issue title workflow [MIM-2227] ([#3306](https://github.com/statisticsnorway/mimir/issues/3306)) ([80dd65b](https://github.com/statisticsnorway/mimir/commit/80dd65b539ce25cba7203a47b72fe6438d8ee522))
* Potential fix for code scanning alert no. 12: Workflow does not contain permissions ([#3322](https://github.com/statisticsnorway/mimir/issues/3322)) ([fa53358](https://github.com/statisticsnorway/mimir/commit/fa53358f97c91fd6c609370df09e1363883d93ad))
* Release please looking for wrong tag [MIM-2227] ([#3402](https://github.com/statisticsnorway/mimir/issues/3402)) ([ed9c413](https://github.com/statisticsnorway/mimir/commit/ed9c4130e1e247a8f23dd6c207519b38d12fa9e1))
* remove unused dependencies ([229c1d7](https://github.com/statisticsnorway/mimir/commit/229c1d7f170e703460a9ce2250780b7fd9ad2902))
* remove unused dependencies [MIM-2378] ([#3435](https://github.com/statisticsnorway/mimir/issues/3435)) ([229c1d7](https://github.com/statisticsnorway/mimir/commit/229c1d7f170e703460a9ce2250780b7fd9ad2902))
* remove unused npm packages ([#3447](https://github.com/statisticsnorway/mimir/issues/3447)) ([065821d](https://github.com/statisticsnorway/mimir/commit/065821deb13455085e9fff05bd46e050d6d888e8))
* tweak release workflow [MIM-2227] ([#3372](https://github.com/statisticsnorway/mimir/issues/3372)) ([cbe9ddb](https://github.com/statisticsnorway/mimir/commit/cbe9ddbe7f937ff1d1831c920dbfe05749f89cc6))
* Update deploy_nais.yaml ref from master -&gt; main ([#3319](https://github.com/statisticsnorway/mimir/issues/3319)) ([0b8e1dd](https://github.com/statisticsnorway/mimir/commit/0b8e1dddf697d5f658e59c50189a6a9a12d07ae2))
* update enonic xp types to 7.15.3 ([#3352](https://github.com/statisticsnorway/mimir/issues/3352)) ([954e41e](https://github.com/statisticsnorway/mimir/commit/954e41e5344d6b171fb86f771dba13a548c907f0))
* Use pre-push instead of pre-commit hook ([#3290](https://github.com/statisticsnorway/mimir/issues/3290)) ([12c8a51](https://github.com/statisticsnorway/mimir/commit/12c8a517ad66df836f6aa119c11151cfd852e43b))

## [2.36.0](https://github.com/statisticsnorway/mimir/compare/v2.35.1...v2.36.0) (2025-10-15)


### Features

* Add Show As Table feature to Highmaps [MIM-1831] ([#3453](https://github.com/statisticsnorway/mimir/issues/3453)) ([2502078](https://github.com/statisticsnorway/mimir/commit/25020788f1fb915a317b31ad5b1b93b1c73b7ef3))
* Enable MathJax accessibility plugin [MIM-2187] ([#3461](https://github.com/statisticsnorway/mimir/issues/3461)) ([c56ab61](https://github.com/statisticsnorway/mimir/commit/c56ab61690cabb31c8dbb5a4c694626ddf664143))


### Bug Fixes

* add column header fields for highmap table ([#3473](https://github.com/statisticsnorway/mimir/issues/3473)) ([aece443](https://github.com/statisticsnorway/mimir/commit/aece443abeede0640a632147836ee9e9ca27a9c8))
* add municipality to html title for kommunefakta [MIM-2325] ([#3462](https://github.com/statisticsnorway/mimir/issues/3462)) ([5692e6e](https://github.com/statisticsnorway/mimir/commit/5692e6e5a587cfd822a7daeb8fd2c65dd3bf36a4))
* Adjust tabindex to scrollable region (table) for Highmap [MIM-1831] ([#3463](https://github.com/statisticsnorway/mimir/issues/3463)) ([b9793c9](https://github.com/statisticsnorway/mimir/commit/b9793c9feaf1ceb6b532a0d59f74d73ac2b48bf9))
* capitalize first letter in municipality title ([ffd6ae4](https://github.com/statisticsnorway/mimir/commit/ffd6ae4147b2290b3c4ee588d0efa0f270a43f52))
* capitalize first letter in municipality title [MIM-2325] ([#3477](https://github.com/statisticsnorway/mimir/issues/3477)) ([ffd6ae4](https://github.com/statisticsnorway/mimir/commit/ffd6ae4147b2290b3c4ee588d0efa0f270a43f52))
* Disable context menu for MathJax [MIM-2187] ([#3472](https://github.com/statisticsnorway/mimir/issues/3472)) ([d3e1772](https://github.com/statisticsnorway/mimir/commit/d3e1772a282095bc1abe68b6b8a7cb122319701c))
* Fix fetch tbml data try catch for internal and new public tables [MIM-2431] ([#3469](https://github.com/statisticsnorway/mimir/issues/3469)) ([eb391cc](https://github.com/statisticsnorway/mimir/commit/eb391cc80b365294944f257a542e55e7eb98e51d))
* Highmap shows correct decimal point and some code cleanup [MIM-1831] ([#3476](https://github.com/statisticsnorway/mimir/issues/3476)) ([956e2be](https://github.com/statisticsnorway/mimir/commit/956e2beb5c5261b99e903fe7e3c8178c78d86aff))
* higmap small adjustment after testing [MIM-1831] ([#3479](https://github.com/statisticsnorway/mimir/issues/3479)) ([eb81dc2](https://github.com/statisticsnorway/mimir/commit/eb81dc29ee2e3a7e70c69355901198c40e57a3e3))
* remove commit message from slack on mabl fail ([#3466](https://github.com/statisticsnorway/mimir/issues/3466)) ([9626174](https://github.com/statisticsnorway/mimir/commit/9626174198104d617863f53e61699488951efda3))


### Build System and dependencies

* Bump @eslint/js from 9.35.0 to 9.36.0 ([#3457](https://github.com/statisticsnorway/mimir/issues/3457)) ([c9fe3f1](https://github.com/statisticsnorway/mimir/commit/c9fe3f1df4c9594d76868c1696acae0442e6f491))
* Bump com.enonic.xp.app from 3.6.1 to 3.6.2 ([#3481](https://github.com/statisticsnorway/mimir/issues/3481)) ([0aff7ce](https://github.com/statisticsnorway/mimir/commit/0aff7ce68f44ca255c8270931bd80fceb9498ad5))
* Bump eslint from 9.35.0 to 9.36.0 ([#3458](https://github.com/statisticsnorway/mimir/issues/3458)) ([64a7555](https://github.com/statisticsnorway/mimir/commit/64a755545316cee832e14fea0d8a72198838e427))
* Bump eslint-plugin-jsdoc from 54.6.0 to 60.1.0 ([#3460](https://github.com/statisticsnorway/mimir/issues/3460)) ([9c7d13c](https://github.com/statisticsnorway/mimir/commit/9c7d13c03956d1435e7fa678331475752703fc8f))
* Bump node to v22 in build.gradle and testOnPr workflow [MIM-2419] ([#3464](https://github.com/statisticsnorway/mimir/issues/3464)) ([6a3968e](https://github.com/statisticsnorway/mimir/commit/6a3968e8ac42d6063168d2e9b9805b0ea5edda05))
* Bump sass from 1.92.1 to 1.93.0 ([#3459](https://github.com/statisticsnorway/mimir/issues/3459)) ([6d0b2b9](https://github.com/statisticsnorway/mimir/commit/6d0b2b9ace18742b034aa6bb8cadc7b3109e38d9))

## [2.35.1](https://github.com/statisticsnorway/mimir/compare/v2.35.0...v2.35.1) (2025-09-19)


### Bug Fixes

* fix bootstrap overrides ([#3454](https://github.com/statisticsnorway/mimir/issues/3454)) ([35f25f6](https://github.com/statisticsnorway/mimir/commit/35f25f6f1077de3fd4983bd5b9172d2cdbf38027))
* Replace all & with &amp; for statbankSavedRequest ([818cd11](https://github.com/statisticsnorway/mimir/commit/818cd118402dc31f12df63f8cf669ba8047b21a7))
* Replace all & with &amp; for statbankSavedRequest [MIM-2136] ([#3449](https://github.com/statisticsnorway/mimir/issues/3449)) ([818cd11](https://github.com/statisticsnorway/mimir/commit/818cd118402dc31f12df63f8cf669ba8047b21a7))

## [2.35.0](https://github.com/statisticsnorway/mimir/compare/v2.34.0...v2.35.0) (2025-09-17)


### Features

* Add "Show less" functionality to Pagination Hooks [MIM-2312] ([#3309](https://github.com/statisticsnorway/mimir/issues/3309)) ([f99b67d](https://github.com/statisticsnorway/mimir/commit/f99b67d34b216f66fdded3d91f411fe3e4cee689))


### Bug Fixes

* Fix simpleStatbank part bug introduced by part cache ([9a797e3](https://github.com/statisticsnorway/mimir/commit/9a797e34e728a488d7714b17b94a037eb9c31cb7))
* Fix simpleStatbank part bug introduced by part cache [MIM-2396] ([#3442](https://github.com/statisticsnorway/mimir/issues/3442)) ([9a797e3](https://github.com/statisticsnorway/mimir/commit/9a797e34e728a488d7714b17b94a037eb9c31cb7))
* format article modified date without "oslo/europe" [MIM-2336] ([#3437](https://github.com/statisticsnorway/mimir/issues/3437)) ([1155ac1](https://github.com/statisticsnorway/mimir/commit/1155ac12dde5bbb8249d0c224971f45dfe3c8e1a))
* format modified date without "oslo/europe" ([1155ac1](https://github.com/statisticsnorway/mimir/commit/1155ac12dde5bbb8249d0c224971f45dfe3c8e1a))
* set date as iso in article modified date ([50a30af](https://github.com/statisticsnorway/mimir/commit/50a30af356711bdeb4c5b0eabd62d77ca36da4dd))
* set date as iso in article modified date [MIM-2336] ([#3436](https://github.com/statisticsnorway/mimir/issues/3436)) ([50a30af](https://github.com/statisticsnorway/mimir/commit/50a30af356711bdeb4c5b0eabd62d77ca36da4dd))
* Use date-fns lib instead of manually subtracting the dates ourselves for delete expired event log logic [MIM-2376] ([#3440](https://github.com/statisticsnorway/mimir/issues/3440)) ([d8c4b42](https://github.com/statisticsnorway/mimir/commit/d8c4b42a889c3715201c0406d9795c07bc1f9bc9))


### Build System and dependencies

* Bump @types/ramda from 0.31.0 to 0.31.1 in the dependencies-patch-updates group ([#3443](https://github.com/statisticsnorway/mimir/issues/3443)) ([4a46390](https://github.com/statisticsnorway/mimir/commit/4a463901ddf496cf13d3e0fc961433618a693c7a))
* Bump @types/ramda in the dependencies-patch-updates group ([4a46390](https://github.com/statisticsnorway/mimir/commit/4a463901ddf496cf13d3e0fc961433618a693c7a))
* Bump actions/setup-node from 4 to 5 ([#3428](https://github.com/statisticsnorway/mimir/issues/3428)) ([f2ecd10](https://github.com/statisticsnorway/mimir/commit/f2ecd10026ae6b084eff9085e18ce778e8a3198c))
* Bump google-github-actions/auth from 2.1.12 to 3.0.0 ([#3416](https://github.com/statisticsnorway/mimir/issues/3416)) ([b1cfc63](https://github.com/statisticsnorway/mimir/commit/b1cfc63743cb876b941558160a60fd1715f56767))
* Bump the dependencies-minor-updates group with 6 updates ([#3430](https://github.com/statisticsnorway/mimir/issues/3430)) ([ce6c3ba](https://github.com/statisticsnorway/mimir/commit/ce6c3ba06180f92d0af5bccdd9a63baf8941af29))
* Bump uuid from 11.1.0 to 12.0.0 ([#3431](https://github.com/statisticsnorway/mimir/issues/3431)) ([60fe0fd](https://github.com/statisticsnorway/mimir/commit/60fe0fde09584847de12bc8cbfd68d0407d307c8))
* remove unused dependencies ([229c1d7](https://github.com/statisticsnorway/mimir/commit/229c1d7f170e703460a9ce2250780b7fd9ad2902))
* remove unused dependencies [MIM-2378] ([#3435](https://github.com/statisticsnorway/mimir/issues/3435)) ([229c1d7](https://github.com/statisticsnorway/mimir/commit/229c1d7f170e703460a9ce2250780b7fd9ad2902))
* remove unused npm packages ([#3447](https://github.com/statisticsnorway/mimir/issues/3447)) ([065821d](https://github.com/statisticsnorway/mimir/commit/065821deb13455085e9fff05bd46e050d6d888e8))

## [2.34.0](https://github.com/statisticsnorway/mimir/compare/v2.33.0...v2.34.0) (2025-09-08)


### Features

* Support Key Figure Text macro for articles in RSS news [MIM-2355] ([#3412](https://github.com/statisticsnorway/mimir/issues/3412)) ([6bf4ff4](https://github.com/statisticsnorway/mimir/commit/6bf4ff4395883170420a640b30a226218fbb388e))


### Bug Fixes

* Add fallback for empty keyFigureData ([20684ee](https://github.com/statisticsnorway/mimir/commit/20684ee7b6fd3aa235cb3d7f5d979f793c0bfaa2))
* Add fallback for empty keyFigureData [MIM-2355] ([#3423](https://github.com/statisticsnorway/mimir/issues/3423)) ([20684ee](https://github.com/statisticsnorway/mimir/commit/20684ee7b6fd3aa235cb3d7f5d979f793c0bfaa2))
* Fix sub title conditions for Profiled Box part [MIM-2379] ([#3424](https://github.com/statisticsnorway/mimir/issues/3424)) ([b44e1a4](https://github.com/statisticsnorway/mimir/commit/b44e1a4a4603bb6cb9456fbb10070d659eaf6b66))
* improve logging of errors in mimir app [MIM-2297] ([#3420](https://github.com/statisticsnorway/mimir/issues/3420)) ([756d028](https://github.com/statisticsnorway/mimir/commit/756d0283638c4b41b94f1d52e4e1125ebd00ae7b))
* set correct timezone in article metadata [MIM-2336] ([#3426](https://github.com/statisticsnorway/mimir/issues/3426)) ([2cb9608](https://github.com/statisticsnorway/mimir/commit/2cb9608085450df87398605ad10c9bc2c48c1cad))


### Build System and dependencies

* bump actions/checkout from 4 to 5 ([#3390](https://github.com/statisticsnorway/mimir/issues/3390)) ([1be9751](https://github.com/statisticsnorway/mimir/commit/1be975135b802c6527cde40a4761401b7c71ab7b))
* bump eslint-plugin-jsdoc from 52.0.4 to 54.1.0 ([#3389](https://github.com/statisticsnorway/mimir/issues/3389)) ([671779a](https://github.com/statisticsnorway/mimir/commit/671779ae12c1108a4f7afcf32c888cbfc40624fb))
* Bump jsonstat-toolkit from 1.6.0 to 2.0.0 ([#3331](https://github.com/statisticsnorway/mimir/issues/3331)) ([8221fa8](https://github.com/statisticsnorway/mimir/commit/8221fa802bb7f334ea7a90329fe494005bff32e5))
* bump the dependencies-minor-updates group across 1 directory with 3 updates ([#3410](https://github.com/statisticsnorway/mimir/issues/3410)) ([57244f5](https://github.com/statisticsnorway/mimir/commit/57244f53df3f636ca899096e6b2f0ac61f6ba5f8))
* Bump the dependencies-minor-updates group with 2 updates ([#3417](https://github.com/statisticsnorway/mimir/issues/3417)) ([fb23e04](https://github.com/statisticsnorway/mimir/commit/fb23e0490d66e2157c1f389282308b899b8db3bf))
* Bump the dependencies-patch-updates group with 5 updates ([#3429](https://github.com/statisticsnorway/mimir/issues/3429)) ([f5cf24d](https://github.com/statisticsnorway/mimir/commit/f5cf24d09faf17cf27d1d1335c0bb6baab734a3c))

## [2.33.0](https://github.com/statisticsnorway/mimir/compare/v2.32.0...v2.33.0) (2025-08-27)


### Features

* Improve change text phrasing for Key Figure Text macro [MIM-2368] ([#3407](https://github.com/statisticsnorway/mimir/issues/3407)) ([586bb69](https://github.com/statisticsnorway/mimir/commit/586bb69a1493887032239ec7e2d1ca5e344a9ae0))
* SolrArchive (url service) [MIM-2333] ([#3348](https://github.com/statisticsnorway/mimir/issues/3348)) ([be1d294](https://github.com/statisticsnorway/mimir/commit/be1d294e4efef525aac79c7a7ad59c837fdcfe50))


### Bug Fixes

* npm run dev [MIM-2371] ([#3409](https://github.com/statisticsnorway/mimir/issues/3409)) ([fda51f7](https://github.com/statisticsnorway/mimir/commit/fda51f74ae2e5e2c95f9c1a5e63f692f99eaf88c))
* Set lowercase to time not change period for keyFigureText macro ([e92906e](https://github.com/statisticsnorway/mimir/commit/e92906e0c91bcfdc66508eaabde8ceaf351f0588))
* Set lowercase to time not change period for keyFigureText macro [MIM-2368] ([#3411](https://github.com/statisticsnorway/mimir/issues/3411)) ([e92906e](https://github.com/statisticsnorway/mimir/commit/e92906e0c91bcfdc66508eaabde8ceaf351f0588))


### Build System and dependencies

* Adjustments to release-please after first deploy [MIM-2227] ([#3396](https://github.com/statisticsnorway/mimir/issues/3396)) ([2c2de01](https://github.com/statisticsnorway/mimir/commit/2c2de016299b597db4152c514252a9118e40b451))
* Release please looking for wrong tag [MIM-2227] ([#3402](https://github.com/statisticsnorway/mimir/issues/3402)) ([ed9c413](https://github.com/statisticsnorway/mimir/commit/ed9c4130e1e247a8f23dd6c207519b38d12fa9e1))

## [2.32.0](https://github.com/statisticsnorway/mimir/compare/mimir-v2.31.0...mimir-v2.32.0) (2025-08-19)


### Features

* Add support for macro in article ingress [MIM-2353] ([#3386](https://github.com/statisticsnorway/mimir/issues/3386)) ([a72986e](https://github.com/statisticsnorway/mimir/commit/a72986e69fdba39fc746df5853360c839c431c83))
* Fetch XP Content data for Editorial Cards part [MIM-2058] ([#3341](https://github.com/statisticsnorway/mimir/issues/3341)) ([c1ec251](https://github.com/statisticsnorway/mimir/commit/c1ec251d9e2901803c89170c9afb4c2e0f62053b))
* Support ingress with macro ingress for profiledBox part [MIM-2352] ([#3392](https://github.com/statisticsnorway/mimir/issues/3392)) ([69e02aa](https://github.com/statisticsnorway/mimir/commit/69e02aa5139557468f62f0aa7dcb07ab29556d15))


### Bug Fixes

* Setting correct release please output variable ([a794c49](https://github.com/statisticsnorway/mimir/commit/a794c49935b3151fb199c326284f635706eda859))
* Setting correct release please output variable [MIM-2227] ([#3368](https://github.com/statisticsnorway/mimir/issues/3368)) ([a794c49](https://github.com/statisticsnorway/mimir/commit/a794c49935b3151fb199c326284f635706eda859))


### Build System and dependencies

* [MIM-2227] Modify prod deploy action to use generated changelog.md ([#3307](https://github.com/statisticsnorway/mimir/issues/3307)) ([9b8bd8b](https://github.com/statisticsnorway/mimir/commit/9b8bd8bf6785c775c800a932a21bf31f6c5e9611))
* bump @eslint/compat from 1.3.1 to 1.3.2 in the dependencies-patch-updates group ([#3374](https://github.com/statisticsnorway/mimir/issues/3374)) ([891be11](https://github.com/statisticsnorway/mimir/commit/891be113029d22a6da66a7f2480d8310197ab5ca))
* bump @eslint/compat in the dependencies-patch-updates group ([891be11](https://github.com/statisticsnorway/mimir/commit/891be113029d22a6da66a7f2480d8310197ab5ca))
* bump actions/download-artifact from 4 to 5 ([#3364](https://github.com/statisticsnorway/mimir/issues/3364)) ([d3c2558](https://github.com/statisticsnorway/mimir/commit/d3c2558db5abc097f25f5a4d690545a2f1fec5c7))
* bump commons-codec:commons-codec from 1.18.0 to 1.19.0 ([#3344](https://github.com/statisticsnorway/mimir/issues/3344)) ([63577f4](https://github.com/statisticsnorway/mimir/commit/63577f49587210269b9838205d3ca23909586489))
* bump cross-env from 7.0.3 to 10.0.0 ([#3347](https://github.com/statisticsnorway/mimir/issues/3347)) ([0dc97aa](https://github.com/statisticsnorway/mimir/commit/0dc97aa7b4b770ed045c69c64bf870295654401b))
* bump the dependencies-minor-updates group across 1 directory with 6 updates ([#3367](https://github.com/statisticsnorway/mimir/issues/3367)) ([fe0f66e](https://github.com/statisticsnorway/mimir/commit/fe0f66e6a88bee12a7b768ef0775daa675558c86))
* bump the dependencies-minor-updates group with 2 updates ([#3375](https://github.com/statisticsnorway/mimir/issues/3375)) ([c9278bd](https://github.com/statisticsnorway/mimir/commit/c9278bde0a49b3c15ba64901eb0900a9671c556a))
* bump the dependencies-patch-updates group across 1 directory with 3 updates ([#3366](https://github.com/statisticsnorway/mimir/issues/3366)) ([1a5f542](https://github.com/statisticsnorway/mimir/commit/1a5f5427e59b8dacf9ce96656e48310527be851c))
* bump the dependencies-patch-updates group with 7 updates ([#3387](https://github.com/statisticsnorway/mimir/issues/3387)) ([cd31394](https://github.com/statisticsnorway/mimir/commit/cd3139478995deeeb4b9238818a73600d2ae45ef))
* fix PR creation syntax ([60ab29e](https://github.com/statisticsnorway/mimir/commit/60ab29ed587c316bc563359c95656456a893f45c))
* fix PR creation syntax [MIM-2227] ([#3380](https://github.com/statisticsnorway/mimir/issues/3380)) ([60ab29e](https://github.com/statisticsnorway/mimir/commit/60ab29ed587c316bc563359c95656456a893f45c))
* fix syntax for output in GitHub workflow [MIM-2227] ([#3376](https://github.com/statisticsnorway/mimir/issues/3376)) ([5c17dd0](https://github.com/statisticsnorway/mimir/commit/5c17dd04b29a635125a12c86ee1310a3ce1c1171))
* fix typo in step reference in release workflow [MIM-2227] ([#3378](https://github.com/statisticsnorway/mimir/issues/3378)) ([7e0efc9](https://github.com/statisticsnorway/mimir/commit/7e0efc93a26249c71fed14565f6e74f9307a5ccd))
* fixed release workflow ([cbe9ddb](https://github.com/statisticsnorway/mimir/commit/cbe9ddbe7f937ff1d1831c920dbfe05749f89cc6))
* Fixed release workflow [MIM-2227] ([#3363](https://github.com/statisticsnorway/mimir/issues/3363)) ([90f0c8d](https://github.com/statisticsnorway/mimir/commit/90f0c8d345e95676446799ed634309a02defae92))
* tweak release workflow [MIM-2227] ([#3372](https://github.com/statisticsnorway/mimir/issues/3372)) ([cbe9ddb](https://github.com/statisticsnorway/mimir/commit/cbe9ddbe7f937ff1d1831c920dbfe05749f89cc6))
