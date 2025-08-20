# Changelog

## [2.33.0](https://github.com/statisticsnorway/mimir/compare/mimir-v2.32.0...mimir-v2.33.0) (2025-08-20)


### Features

* Add macro for keyfigure in text format [MIM-2347] ([#3327](https://github.com/statisticsnorway/mimir/issues/3327)) ([82c72bb](https://github.com/statisticsnorway/mimir/commit/82c72bb30dd178eb14fd8bce4d3e885b31d29f22))
* Add support for macro in article ingress [MIM-2353] ([#3386](https://github.com/statisticsnorway/mimir/issues/3386)) ([a72986e](https://github.com/statisticsnorway/mimir/commit/a72986e69fdba39fc746df5853360c839c431c83))
* Fetch XP Content data for Editorial Cards part [MIM-2058] ([#3341](https://github.com/statisticsnorway/mimir/issues/3341)) ([c1ec251](https://github.com/statisticsnorway/mimir/commit/c1ec251d9e2901803c89170c9afb4c2e0f62053b))
* Fix styling cookie reset ([#3302](https://github.com/statisticsnorway/mimir/issues/3302)) ([2d55710](https://github.com/statisticsnorway/mimir/commit/2d557101d419d6de5372d9de108d9905a5db526e))
* SolrArchive (url service) [MIM-2333] ([#3348](https://github.com/statisticsnorway/mimir/issues/3348)) ([be1d294](https://github.com/statisticsnorway/mimir/commit/be1d294e4efef525aac79c7a7ad59c837fdcfe50))
* Support ingress with macro ingress for profiledBox part [MIM-2352] ([#3392](https://github.com/statisticsnorway/mimir/issues/3392)) ([69e02aa](https://github.com/statisticsnorway/mimir/commit/69e02aa5139557468f62f0aa7dcb07ab29556d15))


### Bug Fixes

* Bug fixes for Solr updater service [MIM-2341] ([#3321](https://github.com/statisticsnorway/mimir/issues/3321)) ([e01115a](https://github.com/statisticsnorway/mimir/commit/e01115a8daa025e06f8497bb6921940fa607aab1))
* Design adjustments to Cookie Banner part component [MIM-2337] ([#3317](https://github.com/statisticsnorway/mimir/issues/3317)) ([0c04d1c](https://github.com/statisticsnorway/mimir/commit/0c04d1ce1b05332ecee4ee7c01a5675f1726aa99))
* More timeline category link styling adjustments ([#3301](https://github.com/statisticsnorway/mimir/issues/3301)) ([154bdfd](https://github.com/statisticsnorway/mimir/commit/154bdfd1f24afbc6652a537711e0fc42f8ff1552))
* pictureCardLink.href removed [MIM-2199] ([#3340](https://github.com/statisticsnorway/mimir/issues/3340)) ([8f85a61](https://github.com/statisticsnorway/mimir/commit/8f85a613fc3d662cb0467d1f24cf4bb063e48556))
* Setting correct release please output variable ([a794c49](https://github.com/statisticsnorway/mimir/commit/a794c49935b3151fb199c326284f635706eda859))
* Setting correct release please output variable [MIM-2227] ([#3368](https://github.com/statisticsnorway/mimir/issues/3368)) ([a794c49](https://github.com/statisticsnorway/mimir/commit/a794c49935b3151fb199c326284f635706eda859))
* Simple Statbank error handling ([#3279](https://github.com/statisticsnorway/mimir/issues/3279)) ([3b3612c](https://github.com/statisticsnorway/mimir/commit/3b3612c9df5a69e052d319f782303ee0ff2b015d))
* Stop setCookieConsent polling after 3 failures [MIM-2350] ([#3356](https://github.com/statisticsnorway/mimir/issues/3356)) ([9e488a0](https://github.com/statisticsnorway/mimir/commit/9e488a095e4e3cea6145b8cfb4f4a6288ef7916a))
* update tsconfig for react to handle global types ([118dc22](https://github.com/statisticsnorway/mimir/commit/118dc22106d820b414c7c25ad9326491a539ca2a))


### Build System and dependencies

* [MIM-2227] Add release-please workflow ([#3304](https://github.com/statisticsnorway/mimir/issues/3304)) ([d55c11a](https://github.com/statisticsnorway/mimir/commit/d55c11af3eaff12d01bc2189b1102be40ec56ffb))
* [MIM-2227] Modify prod deploy action to use generated changelog.md ([#3307](https://github.com/statisticsnorway/mimir/issues/3307)) ([9b8bd8b](https://github.com/statisticsnorway/mimir/commit/9b8bd8bf6785c775c800a932a21bf31f6c5e9611))
* Adjustments to release-please after first deploy [MIM-2227] ([#3396](https://github.com/statisticsnorway/mimir/issues/3396)) ([2c2de01](https://github.com/statisticsnorway/mimir/commit/2c2de016299b597db4152c514252a9118e40b451))
* bump @eslint/compat from 1.3.1 to 1.3.2 in the dependencies-patch-updates group ([#3374](https://github.com/statisticsnorway/mimir/issues/3374)) ([891be11](https://github.com/statisticsnorway/mimir/commit/891be113029d22a6da66a7f2480d8310197ab5ca))
* bump @eslint/compat in the dependencies-patch-updates group ([891be11](https://github.com/statisticsnorway/mimir/commit/891be113029d22a6da66a7f2480d8310197ab5ca))
* bump actions/download-artifact from 4 to 5 ([#3364](https://github.com/statisticsnorway/mimir/issues/3364)) ([d3c2558](https://github.com/statisticsnorway/mimir/commit/d3c2558db5abc097f25f5a4d690545a2f1fec5c7))
* bump commons-codec:commons-codec from 1.18.0 to 1.19.0 ([#3344](https://github.com/statisticsnorway/mimir/issues/3344)) ([63577f4](https://github.com/statisticsnorway/mimir/commit/63577f49587210269b9838205d3ca23909586489))
* bump cross-env from 7.0.3 to 10.0.0 ([#3347](https://github.com/statisticsnorway/mimir/issues/3347)) ([0dc97aa](https://github.com/statisticsnorway/mimir/commit/0dc97aa7b4b770ed045c69c64bf870295654401b))
* bump google-github-actions/auth from 2.1.10 to 2.1.11 ([#3329](https://github.com/statisticsnorway/mimir/issues/3329)) ([001a35f](https://github.com/statisticsnorway/mimir/commit/001a35fad2ab90e8706b2c2bc7a93112c4ba4de8))
* bump google-github-actions/auth from 2.1.11 to 2.1.12 ([#3349](https://github.com/statisticsnorway/mimir/issues/3349)) ([cf5ddc8](https://github.com/statisticsnorway/mimir/commit/cf5ddc8fbef9457b05d624b9ead90791669017e2))
* bump the dependencies-minor-updates group across 1 directory with 6 updates ([#3367](https://github.com/statisticsnorway/mimir/issues/3367)) ([fe0f66e](https://github.com/statisticsnorway/mimir/commit/fe0f66e6a88bee12a7b768ef0775daa675558c86))
* bump the dependencies-minor-updates group with 2 updates ([#3375](https://github.com/statisticsnorway/mimir/issues/3375)) ([c9278bd](https://github.com/statisticsnorway/mimir/commit/c9278bde0a49b3c15ba64901eb0900a9671c556a))
* bump the dependencies-patch-updates group across 1 directory with 3 updates ([#3366](https://github.com/statisticsnorway/mimir/issues/3366)) ([1a5f542](https://github.com/statisticsnorway/mimir/commit/1a5f5427e59b8dacf9ce96656e48310527be851c))
* bump the dependencies-patch-updates group with 7 updates ([#3387](https://github.com/statisticsnorway/mimir/issues/3387)) ([cd31394](https://github.com/statisticsnorway/mimir/commit/cd3139478995deeeb4b9238818a73600d2ae45ef))
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
* tweak release workflow [MIM-2227] ([#3372](https://github.com/statisticsnorway/mimir/issues/3372)) ([cbe9ddb](https://github.com/statisticsnorway/mimir/commit/cbe9ddbe7f937ff1d1831c920dbfe05749f89cc6))
* Update deploy_nais.yaml ref from master -&gt; main ([#3319](https://github.com/statisticsnorway/mimir/issues/3319)) ([0b8e1dd](https://github.com/statisticsnorway/mimir/commit/0b8e1dddf697d5f658e59c50189a6a9a12d07ae2))
* update enonic xp types to 7.15.3 ([#3352](https://github.com/statisticsnorway/mimir/issues/3352)) ([954e41e](https://github.com/statisticsnorway/mimir/commit/954e41e5344d6b171fb86f771dba13a548c907f0))
* Use pre-push instead of pre-commit hook ([#3290](https://github.com/statisticsnorway/mimir/issues/3290)) ([12c8a51](https://github.com/statisticsnorway/mimir/commit/12c8a517ad66df836f6aa119c11151cfd852e43b))

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
