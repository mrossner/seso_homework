# seso_homework

NOTE I switched it to es6 modules (exports and imports). I REALLY hate the "require" syntax.

(If there is something weird about this in your node version, here is mine):

$ node -v
v20.11.1

$ npm -v
10.2.4


This all works even with 1 million data sources (and doesn't take THAT long)

The main "deal" is a binary tree that holds the "unprintable queue" (ie waiting entries, where entries in files might be older). This does NOT need to hold every entry, just one per logsource.

The comment in "sync-sorted-merge" is the big explanation.

The implementations are pretty similar (and use the same custom btree functions) for sync and async
