# FAQ

## Where were the images sourced from?

The majority of images come from iNaturalist where users have the option to publish their images under one of several creative commons licenses. Wikipedia and Flickr were also used as sources.

## What are the different licences that Avicommons uses?

Most images are licenced under CC BY-NC (attribution non-commercial), but there's a few others which are covered in the [License Breakdown](https://github.com/rawcomposition/avicommons/tree/main?tab=readme-ov-file#1-full-version) section. The exact license for each image is included in the [Full JSON output](https://github.com/rawcomposition/avicommons/tree/main?tab=readme-ov-file#1-full-version).

## Can the images be used in paid apps?

Most images are licensed under some form of "NC" (non-commercial) license, so using them in paid apps would not be allowed. However, about 15% of the images use the CC0 (public domain) and CC-BY (attribution) licenses. See [License Breakdown](https://github.com/rawcomposition/avicommons/tree/main?tab=readme-ov-file#1-full-version).

## Where are the images hosted?

The images are stored on Cloudflare R2 Object Stoage.

## Is there a cost associated with hosting the photos, and is it sustainable long-term?

There is no cost because we fall within the free tier of [Cloudflare R2](https://developers.cloudflare.com/r2/pricing/#free-tier), which allows 10 gb of storage and 10 million reads per month. We are unlikely to reach those numbers any time soon! And because the images are resized to no more than 900 px, the total storage size is only 1.6 gb, well within the 10 gb that's allowed for free.

## What taxonomy do you use?

We use the [eBird/Clementts](https://www.birds.cornell.edu/clementschecklist/introduction/updateindex/october-2024/2024-citation-checklist-downloads) taxonomy.

## Will it continue to be maintained?

Yes, we plan to update it each year when the new taxonomy comes out, usually around October. Though our updates will usually be made a while after that to allow iNaturalist observations (our primary source of images) to be updated for any new species splits.

## Who compiled and maintains Avicommons?

This is primarily maintained by Adam Jackson ([see eBird profile](https://ebird.org/profile/NzMwMzI1/world)) as one of his many side projects.
