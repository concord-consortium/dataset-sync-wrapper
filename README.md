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

## License 

[MIT](https://github.com/concord-consortium/dataset-sync-wrapper/blob/master/LICENSE)
