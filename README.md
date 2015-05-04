# dataset-sync-wrapper
Wrapper around Lab interactives that provides dataset synchronization.

## Development

There are two main files:
- index.html
- wrapper.js

If you add more files, make sure that the build script in `.travis.yml` still works (at the moment it's just copying .js, .html files and bower_components).

Dependencies are specified using `bower.json`. Note that `bower_components` is checked into the repository. The rest of the files is related to TravisCI integration and AWS S3 deployment. The structure is minimal so it's easy to use GitHub Pages.

## Deployment

Use GitHub Pages for development and testing. If you push `gh-pages` branch, it will be automatically deployed to:

http://concord-consortium.github.io/dataset-sync-wrapper/

AWS S3 bucket is used for production. If you push `production` branch, it will be automatically deployed to:

http://models-resources.concord.org/dataset-sync-wrapper/index.html

## Testing

[LARA Interactive API](https://github.com/concord-consortium/lara-interactive-api) test page supports dataset sync wrapper:

http://concord-consortium.github.io/lara-interactive-api/

If you modify it, make sure that the page linked above still works as expected (especially `interactiveStateGlobal` and `loadGlobalState` messages).

More specific test:

http://concord-consortium.github.io/lara-interactive-api/prediction

Make sure that when you draw points on the left graph, they become visible on the right one.

Both pages use GitHub pages deployment of this repository.

## Using & Parameters

When a production release is created, the wrapper will be made available
at: http://models-resources.concord.org/dataset-sync-wrapper/index.html

You need to pass in several options using URL query parameters. Here are
the available parameters:

* `loadOnly` True here means that future `GlobalState` messages will be
  ignored. The dataSet is only updated when first loaded.
* `globalStateKey` The global state key that is used to map into the interactive data.
* `dataSetName` The interactive dataset which will trigger / respond to
  event on the global key.
* `interactive` The encoded URL for the interactive to be wrapped, eg `https%3A%2F%2Flab.concord.org%2Fembeddable-dev.html%23interactives%2Fitsi%2Fsensor%2Fsensor-connector.json`

#### Example: 

`https://concord-consortium.github.io/dataset-sync-wrapper?loadOnly=true&globalStateKey=data-collector-1&datasetName=sensor-dataset&interactive=https%3A%2F%2Flab.concord.org%2Fembeddable-dev.html%23interactives%2Fitsi%2Fsensor%2Fsensor-connector.json` 

The above example:

* Wraps this interactive `https://lab.concord.org/embeddable-dev.html#interactives/itsi/sensor/sensor-connector.json`
* Uses the `loadOnly` option to ignore updates.
* Uses the `sensor-dataset` interactive data-set.
* Uses the `data-collector-1` global state key.

## License

[MIT](https://github.com/concord-consortium/dataset-sync-wrapper/blob/master/LICENSE)
