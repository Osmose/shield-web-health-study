"use strict";

/* to use:

- Recall this file has chrome privileges
- Cu.import in this file will work for any 'general firefox things' (Services,etc)
  but NOT for addon-specific libs
*/

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(config|EXPORTED_SYMBOLS)" }]*/
var EXPORTED_SYMBOLS = ["config"];

// var slug = "shield-example-addon"; // should match chrome.manifest;

var config = {
  "study": {
    "studyName": "WebHealthStudy1", // no spaces, for all the reasons
    // generated using the generate-variations.js script
    "weightedVariations": [ { name: 'r1-c', weight: 1, message: 'c', repitition: 'r1' },
      { name: 'r2-c', weight: 1, message: 'c', repitition: 'r2' },
      { name: 'r4-c', weight: 1, message: 'c', repitition: 'r4' },
      { name: 'r14-c', weight: 1, message: 'c', repitition: 'r14' },
      { name: 'r1-vi', weight: 1, message: 'vi', repitition: 'r1' },
      { name: 'r2-vi', weight: 1, message: 'vi', repitition: 'r2' },
      { name: 'r4-vi', weight: 1, message: 'vi', repitition: 'r4' },
      { name: 'r14-vi', weight: 1, message: 'vi', repitition: 'r14' },
      { name: 'r1-sice', weight: 1, message: 'sice', repitition: 'r1' },
      { name: 'r2-sice', weight: 1, message: 'sice', repitition: 'r2' },
      { name: 'r4-sice', weight: 1, message: 'sice', repitition: 'r4' },
      { name: 'r14-sice', weight: 1, message: 'sice',repitition: 'r14' },
      { name: 'r1-simo', weight: 1, message: 'simo', repitition: 'r1' },
      { name: 'r2-simo', weight: 1, message: 'simo', repitition: 'r2' },
      { name: 'r4-simo', weight: 1, message: 'simo', repitition: 'r4' },
      { name: 'r14-simo', weight: 1, message: 'simo',repitition: 'r14' } 
    ],
    /** **endings**
      * - keys indicate the 'endStudy' even that opens these.
      * - urls should be static (data) or external, because they have to
      *   survive uninstall
      * - If there is no key for an endStudy reason, no url will open.
      * - usually surveys, orientations, explanations
      */
    "endings": {
      /** standard endings */
      "user-disable": {
        "baseUrl": "https://qsurvey.mozilla.com/s3/Understanding-the-Web-Shield-Study-User-Disable?reason=user-disable"
      },
      "ineligible": {
        "baseUrl": null
      },
      "expired": {
        "baseUrl": null
      },
      /** User defined endings */
      "too-popular": {
        // data uri made using `datauri-cli`
        "baseUrl": "data:text/html;base64,PGh0bWw+CiAgPGJvZHk+CiAgICA8cD5Zb3UgYXJlIHVzaW5nIHRoaXMgZmVhdHVyZSA8c3Ryb25nPlNPIE1VQ0g8L3N0cm9uZz4gdGhhdCB3ZSBrbm93IHlvdSBsb3ZlIGl0IQogICAgPC9wPgogICAgPHA+VGhlIEV4cGVyaW1lbnQgaXMgb3ZlciBhbmQgd2UgYXJlIFVOSU5TVEFMTElORwogICAgPC9wPgogIDwvYm9keT4KPC9odG1sPgo=",
        "study_state": "ended-positive",  // neutral is default
      },
      "a-non-url-opening-ending": {
        "study_state": "ended-neutral",
        "baseUrl":  null,
      },
    },
    "telemetry": {
      "send": true, // assumed false. Actually send pings?
      "removeTestingFlag": false,  // Marks pings as testing, set true for actual release
      // TODO "onInvalid": "throw"  // invalid packet for schema?  throw||log
    },
    "studyUtilsPath": `./StudyUtils.jsm`,
  },
  "isEligible": async function() {
    // get whatever prefs, addons, telemetry, anything!
    // Cu.import can see 'firefox things', but not package things.
    return true;
  },
  // addon-specific modules to load/unload during `startup`, `shutdown`
  "modules": [
    // can use ${slug} here for example
  ],
  // sets the logging for BOTH the bootstrap file AND shield-study-utils
  "log": {
    // Fatal: 70, Error: 60, Warn: 50, Info: 40, Config: 30, Debug: 20, Trace: 10, All: -1,
    "bootstrap":  {
      "level": "Debug",
    },
    "studyUtils":  {
      "level": "Trace",
    },
  },
};
