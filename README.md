# laravel-mix-file-hash-versioning
Webpack plugin to add support for filename version hashed assets in LaravelMix ^4

### Installation

```
npm install --save-dev laravel-mix-file-hash-versioning
```

### Usage

In your webpack.mix.js file:

```
// top of the file
const LaravelMixFileHashVersioning = require('laravel-mix-file-hash-versioning');

// ... at the end of the file or on your existing webpackConfig
if (mix.inProduction()) {
  mix.webpackConfig({
    plugins: [
        new LaravelMixFileHashVersioning(['dist/css']) // add folders you wish the files to be versioned and put in the manifest 
    ]
  });
}
```