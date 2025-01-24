# Avicommons
A library of hand-picked, cropped, and oriented bird photos licensed under creative commons licenses. View more details and examples at [avicommons.org](avicommons.org).

## Getting Started

To incorporate the photos into your website or app, you must download a JSON file containing all the required info to retrieve images and provide attribution.

**Note:** do **not** retrieve the JSON file on each page load, you must either manually download the file and include it in your app, or have it retrieved automatically at build time. This will ensure optimal load times and reduce bandwidth for Avicommons.

**Available sizes:** 240, 320, 480, 900

### 1. Lite Version

Includes only the essential data in a compact format, useful if you plan to load the entire JSON file client side.

**Size**: ~416 kb

**URL**: `https://avicommons.org/latest-lite.json`

**Example**
```json
{
  "ostric2": [
    "338082926",
    "Hannah Comstock"
  ],
  "ostric3": [
    "90225592",
    "Uday Agashe"
  ]
}
```
The object key is the eBird species code.
The object value is array that contains the photo ID followed by the attribution name (photographer).

**Example photo URL:** https://static.avicommons.org/ostric2-338082926-320.jpg

### 1. Full Version

Includes a more complete set of data for each photo. Useful if you want to use something other than the eBird species ID to find images.

**Size**: ~1.6 mb

**URL**: `https://avicommons.org/latest.json`

**Example**
```json
[
  {
    "code": "ostric2",
    "name": "Common Ostrich",
    "sciName": "Struthio camelus",
    "license": "cc-by-nc",
    "key": "338082926",
    "by": "Hannah Comstock",
    "family": "struth1"
  },
  {
    "code": "ostric3",
    "name": "Somali Ostrich",
    "sciName": "Struthio molybdophanes",
    "license": "cc-by-nc",
    "key": "90225592",
    "by": "Uday Agashe",
    "family": "struth1"
  }
]
```

**Example photo URL:** https://static.avicommons.org/ostric2-338082926-320.jpg
