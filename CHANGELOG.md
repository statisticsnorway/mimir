# Changelog

## [2.41.0](https://github.com/statisticsnorway/mimir/compare/v2.40.0...v2.41.0) (2026-02-17)


### Features

* **charts:** show time period for Highchart and Highmap [MIM-2196] ([#3623](https://github.com/statisticsnorway/mimir/issues/3623)) ([c5c7736](https://github.com/statisticsnorway/mimir/commit/c5c7736080d5e94f80abc8e031959d6453a6ffae))


### Bug Fixes

* Use new config for old statbank url [MIM-2530] ([#3622](https://github.com/statisticsnorway/mimir/issues/3622)) ([1e42e5a](https://github.com/statisticsnorway/mimir/commit/1e42e5aa121f21cde28e98f801f6ba68e53ab761))


### Code Refactoring

* Mim 2506 remove highcharts jquery [MIM-2506] ([#3626](https://github.com/statisticsnorway/mimir/issues/3626)) ([9836bc5](https://github.com/statisticsnorway/mimir/commit/9836bc53f286b14bfa75e7d01c150833c20f348e))

## [2.40.0](https://github.com/statisticsnorway/mimir/compare/v2.39.0...v2.40.0) (2026-01-29)


### Features

* Add option to show table as default for Highcharts React [MIM-2399] ([#3606](https://github.com/statisticsnorway/mimir/issues/3606)) ([ea31fd6](https://github.com/statisticsnorway/mimir/commit/ea31fd6367f0c499d99277ee0cd74ca8e80e918a))
* Change url to be used for making the Statbank url list ([13c3796](https://github.com/statisticsnorway/mimir/commit/13c3796d7a27d75957fafcb557708c4c9405e469))


### Bug Fixes

* **banner:** prevent image distortion in Safari [MIM-2503] ([#3604](https://github.com/statisticsnorway/mimir/issues/3604)) ([d312863](https://github.com/statisticsnorway/mimir/commit/d3128636fa6ebf38db40b2d1cb7b71447a0ba3a1))
* Fix broken axis bugs for Highcharts React [MIM-2444] ([#3596](https://github.com/statisticsnorway/mimir/issues/3596)) ([c91b459](https://github.com/statisticsnorway/mimir/commit/c91b459c645e6d6251f52c93bd412144449c5efd))
* Fix broken yAxis tick label for Highcharts React during resize [MIM-2444] ([#3598](https://github.com/statisticsnorway/mimir/issues/3598)) ([4b989b5](https://github.com/statisticsnorway/mimir/commit/4b989b5c8109ee60aa1d1feed3adf33d616b9179))
* Fix bugs for Highcharts React [MIM-2444] ([#3593](https://github.com/statisticsnorway/mimir/issues/3593)) ([95bc199](https://github.com/statisticsnorway/mimir/commit/95bc1992fa926d2fe2db6062431fe7cb608f7532))
* Fix show draft for Highcharts (React component) with tbprocessor as source ([#3589](https://github.com/statisticsnorway/mimir/issues/3589)) ([1ec4c1e](https://github.com/statisticsnorway/mimir/commit/1ec4c1e7afd77403c1c81bff74f0e40ffe09aadc))
* remove faulty toggle to hide title in highcharts ([f34014f](https://github.com/statisticsnorway/mimir/commit/f34014f1ae46dd8140c0dfd89118e5fb61850310))
* remove faulty toggle to hide title in highcharts [MIM-2161] ([#3597](https://github.com/statisticsnorway/mimir/issues/3597)) ([f34014f](https://github.com/statisticsnorway/mimir/commit/f34014f1ae46dd8140c0dfd89118e5fb61850310))
* Return when highchartWrapperElement is undefined to prevent undefined is not iterable errors ([95bc199](https://github.com/statisticsnorway/mimir/commit/95bc1992fa926d2fe2db6062431fe7cb608f7532))
* Revert broken y-axis symbol destroy changes and refactor [MIM-2444] ([#3607](https://github.com/statisticsnorway/mimir/issues/3607)) ([367457e](https://github.com/statisticsnorway/mimir/commit/367457e7e287e7fe04ff0d9ef5b3b932b6cb14b5))


### Code Refactoring

* remove unused functions and types ([#3613](https://github.com/statisticsnorway/mimir/issues/3613)) ([9beb913](https://github.com/statisticsnorway/mimir/commit/9beb91366382b956572303644ea89d411c02f1f3))
* **time:** compute server offset dynamically instead of config [MIM-2383] ([#3595](https://github.com/statisticsnorway/mimir/issues/3595)) ([07644d4](https://github.com/statisticsnorway/mimir/commit/07644d411fad7735aa10b7725adcc189524def15))


### Tests

* setup xp mock for repos and nodes ([#3579](https://github.com/statisticsnorway/mimir/issues/3579)) ([bda5000](https://github.com/statisticsnorway/mimir/commit/bda5000a3f61016e1ab4ce9c6804b567f9e8cc63))


### Build System and dependencies

* Bump actions/download-artifact from 6 to 7 ([#3575](https://github.com/statisticsnorway/mimir/issues/3575)) ([2ad65c4](https://github.com/statisticsnorway/mimir/commit/2ad65c4a91fc86229a354686641bcc06729277a2))
* Bump actions/upload-artifact from 5 to 6 ([#3574](https://github.com/statisticsnorway/mimir/issues/3574)) ([110ce16](https://github.com/statisticsnorway/mimir/commit/110ce1690b744ce7cac9e620ba204f4cdc9246a7))
* Bump com.enonic.lib:lib-react4xp from 5.1.1 to 5.1.2 ([#3599](https://github.com/statisticsnorway/mimir/issues/3599)) ([0c9fa7b](https://github.com/statisticsnorway/mimir/commit/0c9fa7bda4df723759f4134b5d4d9849a2f50b9b))
* Bump dawidd6/action-download-artifact from 11 to 12 ([#3584](https://github.com/statisticsnorway/mimir/issues/3584)) ([96e72e8](https://github.com/statisticsnorway/mimir/commit/96e72e8693bf89a71513a886ee2aece65c278080))
* Bump eslint-plugin-jsdoc from 61.5.0 to 62.0.0 ([#3602](https://github.com/statisticsnorway/mimir/issues/3602)) ([ebd9fcc](https://github.com/statisticsnorway/mimir/commit/ebd9fcccee9fb7528d978e0ebcc03e0b5b3d9031))
* Bump lodash from 4.17.21 to 4.17.23 ([#3605](https://github.com/statisticsnorway/mimir/issues/3605)) ([5b9a2e6](https://github.com/statisticsnorway/mimir/commit/5b9a2e6875c576280a7191df157d6f71f3bb6782))
* Bump node-forge from 1.3.1 to 1.3.3 ([#3577](https://github.com/statisticsnorway/mimir/issues/3577)) ([f43dac3](https://github.com/statisticsnorway/mimir/commit/f43dac30685f7c125757b94f4b49c34822f0924a))
* Bump org.json:json from 20250517 to 20251224 ([#3585](https://github.com/statisticsnorway/mimir/issues/3585)) ([cfda42d](https://github.com/statisticsnorway/mimir/commit/cfda42d64d188f91768d55e5ae6dc5ea5d46c6bc))
* Bump the dependencies-minor-updates group across 1 directory with 3 updates ([#3608](https://github.com/statisticsnorway/mimir/issues/3608)) ([d04a04f](https://github.com/statisticsnorway/mimir/commit/d04a04f2f9eeafaac2666ae71b5649c48ec015e2))
* Bump the dependencies-minor-updates group across 1 directory with 5 updates ([#3586](https://github.com/statisticsnorway/mimir/issues/3586)) ([8499984](https://github.com/statisticsnorway/mimir/commit/8499984a7efd7c0ebf8a75770ca798cbba0cc04c))
* Bump the dependencies-patch-updates group across 1 directory with 13 updates ([#3609](https://github.com/statisticsnorway/mimir/issues/3609)) ([e8762b4](https://github.com/statisticsnorway/mimir/commit/e8762b47670393514ecd81a2f636c7c6f55829c2))

## [2.39.0](https://github.com/statisticsnorway/mimir/compare/v2.38.0...v2.39.0) (2026-01-08)


### Features

* support Highmap and CombinedGraph in attachment tables and figures [MIM-2484] ([#3588](https://github.com/statisticsnorway/mimir/issues/3588)) ([eda3341](https://github.com/statisticsnorway/mimir/commit/eda3341eb5ebd4bb208b3e79c800c141a7eefbca))


### Bug Fixes

* Fixes incorrect year displayed in weekly period labels [MIM-2500] ([#3587](https://github.com/statisticsnorway/mimir/issues/3587)) ([419170c](https://github.com/statisticsnorway/mimir/commit/419170c4a287e74a1555f570611a63d34c67d6ae))
* use ISO week year for week calculation ([419170c](https://github.com/statisticsnorway/mimir/commit/419170c4a287e74a1555f570611a63d34c67d6ae))


### Code Refactoring

* Fix remaining enonic-types changes in default.ts ([965a06c](https://github.com/statisticsnorway/mimir/commit/965a06cfebf8dcd95b57d5c891dcb73ddc31bb48))
* Fix remaining enonic-types changes in default.ts [MIM-2423] ([#3578](https://github.com/statisticsnorway/mimir/issues/3578)) ([965a06c](https://github.com/statisticsnorway/mimir/commit/965a06cfebf8dcd95b57d5c891dcb73ddc31bb48))
* Refactor Highcharts React to Typescript [MIM-2444] ([#3583](https://github.com/statisticsnorway/mimir/issues/3583)) ([8784e91](https://github.com/statisticsnorway/mimir/commit/8784e917a848bd4c2190652d460ac5bd39f2eb85))
* Update deprecated XP Enonic types [MIM-2423] ([#3572](https://github.com/statisticsnorway/mimir/issues/3572)) ([bae91bb](https://github.com/statisticsnorway/mimir/commit/bae91bb35e793a11075daa7471c67d8e07808ee2))
* Update Highcharts React component to prep for use  [MIM-2444] ([#3568](https://github.com/statisticsnorway/mimir/issues/3568)) ([07b3382](https://github.com/statisticsnorway/mimir/commit/07b338261f9e1609df4c256dbae72c4651cccb7a))


### Tests

* Test setup xp mock server for xp and added tests for imageUtils ([#3544](https://github.com/statisticsnorway/mimir/issues/3544)) ([ec102f9](https://github.com/statisticsnorway/mimir/commit/ec102f9e348cb6a45ba9f4a4dc318bc0f2ccad60))


### Build System and dependencies

* Add recommended extensions for VSCode ([#3571](https://github.com/statisticsnorway/mimir/issues/3571)) ([d88ecfd](https://github.com/statisticsnorway/mimir/commit/d88ecfd276d1312d2cc6a8f8bcc049be0a3158f6))
* Fix syntax slack messages ([#3573](https://github.com/statisticsnorway/mimir/issues/3573)) ([5c8a750](https://github.com/statisticsnorway/mimir/commit/5c8a750c7c5b31118f50cb00276d45464337144d))
* set correct environment in workflows ([#3570](https://github.com/statisticsnorway/mimir/issues/3570)) ([6751306](https://github.com/statisticsnorway/mimir/commit/67513060779cedd3f365470b0c8b3e7fb80ef9fd))
* updates to env in workflows ([#3569](https://github.com/statisticsnorway/mimir/issues/3569)) ([042d3c8](https://github.com/statisticsnorway/mimir/commit/042d3c800d3db80ad8f7eb9a7524428310769ffa))

## [2.38.0](https://github.com/statisticsnorway/mimir/compare/v2.37.0...v2.38.0) (2025-12-10)


### Features

* Jubileumslogo feature toggle  ([#3562](https://github.com/statisticsnorway/mimir/issues/3562)) ([305e680](https://github.com/statisticsnorway/mimir/commit/305e680e3133081760c0456f30905eca13ddee1b))
* upgrade highcharts to v12 [MIM-796] ([#3527](https://github.com/statisticsnorway/mimir/issues/3527)) ([4d90554](https://github.com/statisticsnorway/mimir/commit/4d905546be0bb9eb7e308fbc8b675243f2768f93))


### Bug Fixes

* adjust translations to husleie calculator ([#3540](https://github.com/statisticsnorway/mimir/issues/3540)) ([4ed15b3](https://github.com/statisticsnorway/mimir/commit/4ed15b31677ecc06e4c9b301f391f92b02a1e1a0))
* change release notes settings ([#3548](https://github.com/statisticsnorway/mimir/issues/3548)) ([bef291d](https://github.com/statisticsnorway/mimir/commit/bef291d539453b7065851e8153892637493532b7))
* corrected language codes for highcharts ([f49128d](https://github.com/statisticsnorway/mimir/commit/f49128db8e933d45d068ec2f67e02c78e63aa747))
* corrected language codes for highcharts [MIM-796] ([#3542](https://github.com/statisticsnorway/mimir/issues/3542)) ([f49128d](https://github.com/statisticsnorway/mimir/commit/f49128db8e933d45d068ec2f67e02c78e63aa747))
* Fixed &lt;sup&gt; styling and containd to table-part ([c1966ff](https://github.com/statisticsnorway/mimir/commit/c1966ff8b1e0f45b399dcd4a1a13bd9d95efaef5))
* Fixed &lt;sup&gt; styling and contained to table-part [MIM-2441] ([#3560](https://github.com/statisticsnorway/mimir/issues/3560)) ([c1966ff](https://github.com/statisticsnorway/mimir/commit/c1966ff8b1e0f45b399dcd4a1a13bd9d95efaef5))
* Getting display name in page title [MIM-2465] ([#3551](https://github.com/statisticsnorway/mimir/issues/3551)) ([ba841c4](https://github.com/statisticsnorway/mimir/commit/ba841c48a4a308075cc9bec20e74abcf78af45c5))
* Getting disply name in page title ([ba841c4](https://github.com/statisticsnorway/mimir/commit/ba841c48a4a308075cc9bec20e74abcf78af45c5))
* Remove overflow styling override for Expansion Box in Timeline component [MIM-2400] ([#3565](https://github.com/statisticsnorway/mimir/issues/3565)) ([654fe95](https://github.com/statisticsnorway/mimir/commit/654fe95180ec7c0019bdd169fd800fae7bef16b8))
* render macros in timeline component [MIM-2400] ([#3547](https://github.com/statisticsnorway/mimir/issues/3547)) ([b4f9e05](https://github.com/statisticsnorway/mimir/commit/b4f9e0560af1db664b0b7f08e5fffc916099eefa))
* show correct modifiedDate on relatedArticles cards ([ce384e4](https://github.com/statisticsnorway/mimir/commit/ce384e4ba1761db11a1686654d3d5aa90bb3563d))
* show correct modifiedDate on relatedArticles cards [MIM-2461] ([#3538](https://github.com/statisticsnorway/mimir/issues/3538)) ([ce384e4](https://github.com/statisticsnorway/mimir/commit/ce384e4ba1761db11a1686654d3d5aa90bb3563d))
* showing decimal point and thousand separator correct in table [MIM-796] ([#3535](https://github.com/statisticsnorway/mimir/issues/3535)) ([1d272aa](https://github.com/statisticsnorway/mimir/commit/1d272aac3d1fe6e50937feb6117aa425af59e87c))
* use component-library v3.0.1 and fix breaking changes ([#3561](https://github.com/statisticsnorway/mimir/issues/3561)) ([04203c9](https://github.com/statisticsnorway/mimir/commit/04203c90d5f67a2d2eb4517426a2725031729d66))


### Code Refactoring

* refactored getImageCaption and getImageAlt in imageUtils ([#3543](https://github.com/statisticsnorway/mimir/issues/3543)) ([e94ec52](https://github.com/statisticsnorway/mimir/commit/e94ec52df6ae5d5d31f2a2ab750f6040ed9b824f))
* Remove lib-cron and feature toggle [MIM-2464] ([#3559](https://github.com/statisticsnorway/mimir/issues/3559)) ([984361f](https://github.com/statisticsnorway/mimir/commit/984361f76a47dc90f23caf246dba2ab2cdaf7d47))


### Build System and dependencies

* Add cooldown of 7 days by default to dependabot setup ([#3550](https://github.com/statisticsnorway/mimir/issues/3550)) ([90b72ad](https://github.com/statisticsnorway/mimir/commit/90b72ad9346dd82a71669e7254b7926f6b39a5a6))
* Bump @eslint/compat from 1.4.1 to 2.0.0 ([#3555](https://github.com/statisticsnorway/mimir/issues/3555)) ([8a323e0](https://github.com/statisticsnorway/mimir/commit/8a323e0c63f6f0acc6f526ced19a7e721cf70afb))
* Bump actions/checkout from 5 to 6 ([#3545](https://github.com/statisticsnorway/mimir/issues/3545)) ([4f7f307](https://github.com/statisticsnorway/mimir/commit/4f7f307e483d006aeb614f070d9ad03728b5e8ce))
* Bump commons-codec:commons-codec from 1.19.0 to 1.20.0 ([#3528](https://github.com/statisticsnorway/mimir/issues/3528)) ([52dd37b](https://github.com/statisticsnorway/mimir/commit/52dd37b10fb06fe59cbc0674650d036f921b679e))
* Bump glob from 11.0.3 to 11.1.0 ([#3541](https://github.com/statisticsnorway/mimir/issues/3541)) ([e702314](https://github.com/statisticsnorway/mimir/commit/e702314c5657af00e1a5ed20f3f1af0cde180f97))
* Bump glob from 11.1.0 to 13.0.0 ([#3556](https://github.com/statisticsnorway/mimir/issues/3556)) ([45734f7](https://github.com/statisticsnorway/mimir/commit/45734f77eb036e25fb616cdd7251077c5bf31126))
* Bump js-yaml from 3.14.1 to 3.14.2 ([#3539](https://github.com/statisticsnorway/mimir/issues/3539)) ([42b0c4a](https://github.com/statisticsnorway/mimir/commit/42b0c4ab469d61b6483c4a8b2a1d6492dc5ffaf3))
* Bump the dependencies-minor-updates group across 1 directory with 7 updates ([#3552](https://github.com/statisticsnorway/mimir/issues/3552)) ([fb39e77](https://github.com/statisticsnorway/mimir/commit/fb39e77aa22b49ec7b80612dffe54cc6ef854587))
* Bump the dependencies-patch-updates group with 6 updates ([#3554](https://github.com/statisticsnorway/mimir/issues/3554)) ([776a092](https://github.com/statisticsnorway/mimir/commit/776a092f597dca75ea04d8a87ffb56681d6e3028))
* Bump webpack-bundle-analyzer from 4.10.2 to 5.0.1 ([#3557](https://github.com/statisticsnorway/mimir/issues/3557)) ([215d637](https://github.com/statisticsnorway/mimir/commit/215d6376f324c6d55146c3250749cd7770bc7478))
* Remove dependabot workflow, preventing auto merging ([#3549](https://github.com/statisticsnorway/mimir/issues/3549)) ([e16aa40](https://github.com/statisticsnorway/mimir/commit/e16aa403d1d73116637fcf8d30186cbbf727191f))

## [2.37.0](https://github.com/statisticsnorway/mimir/compare/v2.36.0...v2.37.0) (2025-11-11)


### Features

* add axis markings for broken y axis on highcharts [MIM-1957] ([#3502](https://github.com/statisticsnorway/mimir/issues/3502)) ([61431a3](https://github.com/statisticsnorway/mimir/commit/61431a3cfad12f24776a146ba25178eb182bfaed))
* Update Popup.tsx with new url [MIM-2457] ([#3530](https://github.com/statisticsnorway/mimir/issues/3530)) ([3286569](https://github.com/statisticsnorway/mimir/commit/32865699b82007183b054a36b6a35d7ad0d60846))


### Bug Fixes

* get latest release from correct variant [MIM-2445] ([#3517](https://github.com/statisticsnorway/mimir/issues/3517)) ([056be77](https://github.com/statisticsnorway/mimir/commit/056be77223744a12488410cc48fbcfdc9081ee78))
* Revert removal of fetchStatisticsWithReleaseToday (function in use) ([#3521](https://github.com/statisticsnorway/mimir/issues/3521)) ([21bcfea](https://github.com/statisticsnorway/mimir/commit/21bcfea30213b864f29cd4f19b967307fe0262cb))
* Revert removal of fetchStatisticsWithReleaseToday. Function in use ([21bcfea](https://github.com/statisticsnorway/mimir/commit/21bcfea30213b864f29cd4f19b967307fe0262cb))


### Build System and dependencies

* Bump actions/download-artifact from 5 to 6 ([#3515](https://github.com/statisticsnorway/mimir/issues/3515)) ([a894415](https://github.com/statisticsnorway/mimir/commit/a8944150814709049689b466e496f4551c224639))
* Bump actions/setup-node from 5 to 6 ([#3493](https://github.com/statisticsnorway/mimir/issues/3493)) ([a290a7f](https://github.com/statisticsnorway/mimir/commit/a290a7fa793d56361b6e71fdd19bd813b7234fbf))
* Bump actions/upload-artifact from 4 to 5 ([#3516](https://github.com/statisticsnorway/mimir/issues/3516)) ([947d426](https://github.com/statisticsnorway/mimir/commit/947d4268ee8fb99b5ef1e206cc3f51689bee794f))
* Bump eslint-plugin-jsdoc from 60.4.0 to 61.1.4 ([#3496](https://github.com/statisticsnorway/mimir/issues/3496)) ([8631291](https://github.com/statisticsnorway/mimir/commit/86312919cc2f7d553247d291cd7c78a765aca8c1))
* Bump the dependencies-minor-updates group across 1 directory with 6 updates ([#3520](https://github.com/statisticsnorway/mimir/issues/3520)) ([5bed0ea](https://github.com/statisticsnorway/mimir/commit/5bed0eae8ac69fbf121f086e0c5849f854e1f555))
* Bump the dependencies-patch-updates group with 9 updates ([#3523](https://github.com/statisticsnorway/mimir/issues/3523)) ([0bffd42](https://github.com/statisticsnorway/mimir/commit/0bffd4200ee845ef3dcb200fed180ab30bf31e76))
* Bump validator from 13.15.15 to 13.15.20 ([#3519](https://github.com/statisticsnorway/mimir/issues/3519)) ([c84cd3d](https://github.com/statisticsnorway/mimir/commit/c84cd3db41efb2546ccd06759bc748dd7fb22fa6))
* fix label and release notes for release please ([#3513](https://github.com/statisticsnorway/mimir/issues/3513)) ([bf05d4a](https://github.com/statisticsnorway/mimir/commit/bf05d4ad6f984bb61cfa52b419b2f2539143276a))

## [2.36.0](https://github.com/statisticsnorway/mimir/compare/v2.35.1...v2.36.0) (2025-10-21)


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
* remove old pageContributions for tableExport ([#3499](https://github.com/statisticsnorway/mimir/issues/3499)) ([e12b36f](https://github.com/statisticsnorway/mimir/commit/e12b36fceb34367247ef60dcf8a50725f7419f7d))
* Show 0 value correct in highmap tooltip ([#3486](https://github.com/statisticsnorway/mimir/issues/3486)) ([b1db3c5](https://github.com/statisticsnorway/mimir/commit/b1db3c5b540399ffed645ba0abdd466a62b056d8))
* show highmap table when on same page as highchart ([e770468](https://github.com/statisticsnorway/mimir/commit/e770468f319c5a04b13b404441584b768126d833))
* show highmap table when on same page as highchart [MIM-1831] ([#3497](https://github.com/statisticsnorway/mimir/issues/3497)) ([e770468](https://github.com/statisticsnorway/mimir/commit/e770468f319c5a04b13b404441584b768126d833))
* Show Statbank Box component for StatisticsFigure part even if there are no tables [MIM-2334] ([#3483](https://github.com/statisticsnorway/mimir/issues/3483)) ([15c9a47](https://github.com/statisticsnorway/mimir/commit/15c9a472e8dcf502e718f34c836bcec79e1232e1))


### Build System and dependencies

* Bump @eslint/js from 9.35.0 to 9.36.0 ([#3457](https://github.com/statisticsnorway/mimir/issues/3457)) ([c9fe3f1](https://github.com/statisticsnorway/mimir/commit/c9fe3f1df4c9594d76868c1696acae0442e6f491))
* Bump com.enonic.xp.app from 3.6.1 to 3.6.2 ([#3481](https://github.com/statisticsnorway/mimir/issues/3481)) ([0aff7ce](https://github.com/statisticsnorway/mimir/commit/0aff7ce68f44ca255c8270931bd80fceb9498ad5))
* Bump eslint from 9.35.0 to 9.36.0 ([#3458](https://github.com/statisticsnorway/mimir/issues/3458)) ([64a7555](https://github.com/statisticsnorway/mimir/commit/64a755545316cee832e14fea0d8a72198838e427))
* Bump eslint-plugin-jsdoc from 54.6.0 to 60.1.0 ([#3460](https://github.com/statisticsnorway/mimir/issues/3460)) ([9c7d13c](https://github.com/statisticsnorway/mimir/commit/9c7d13c03956d1435e7fa678331475752703fc8f))
* Bump node to v22 in build.gradle and testOnPr workflow [MIM-2419] ([#3464](https://github.com/statisticsnorway/mimir/issues/3464)) ([6a3968e](https://github.com/statisticsnorway/mimir/commit/6a3968e8ac42d6063168d2e9b9805b0ea5edda05))
* Bump ramda ([9478863](https://github.com/statisticsnorway/mimir/commit/9478863dca931b3b616ac483794a507d2dbe6c8a))
* Bump ramda from 0.31.3 to 0.32.0 in the dependencies-minor-updates group across 1 directory ([#3492](https://github.com/statisticsnorway/mimir/issues/3492)) ([9478863](https://github.com/statisticsnorway/mimir/commit/9478863dca931b3b616ac483794a507d2dbe6c8a))
* Bump sass from 1.92.1 to 1.93.0 ([#3459](https://github.com/statisticsnorway/mimir/issues/3459)) ([6d0b2b9](https://github.com/statisticsnorway/mimir/commit/6d0b2b9ace18742b034aa6bb8cadc7b3109e38d9))
* Bump the dependencies-patch-updates group with 2 updates ([#3494](https://github.com/statisticsnorway/mimir/issues/3494)) ([e916a4b](https://github.com/statisticsnorway/mimir/commit/e916a4b33aec39b2d3fe18f4a48fcdd971cf9380))
* remove label on release-please ([#3490](https://github.com/statisticsnorway/mimir/issues/3490)) ([a139bbe](https://github.com/statisticsnorway/mimir/commit/a139bbedf36b6748f51894b67bd020ca7569ff21))

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
