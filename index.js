let glob = require('glob');
const fs = require('fs');
const path = require('path');

class laravelMixFileHashVersioning {
	constructor (extra) {
		this.extraFiles = !!extra ? extra : []
	}
	getExtraFilesList () {
		return flatten(
			[].concat(this.extraFiles).map(filePath => {
				if (File.find(filePath).isDirectory()) {
					filePath += path.sep + '**/*';
				}

				if (!filePath.includes('*')) return filePath;

				return glob.sync(
					new File(filePath).forceFromPublic().relativePath(),
					{ nodir: true }
				);
			})
		)
	}

	updateFileOnManifest (assetName) {
		let normalizedPath = Mix.manifest.normalizePath(assetName);
		let normalizedPathParts = path.parse(normalizedPath);
		let newAssetFile = new File(path.join(Config.publicPath, normalizedPath));
		let newAssetFileName = newAssetFile.segments.name + '.' + newAssetFile.version().substr(0, 8) + newAssetFile.segments.ext;
		newAssetFile.rename(newAssetFileName);
		Mix.manifest.manifest[normalizedPath] = path.join(normalizedPathParts.dir, newAssetFileName);

		return normalizedPath;
	}

	beforeCompile (stats) {
		let extraFiles = this.getExtraFilesList();
		extraFiles.forEach(assetName => {
			// delete all files on directories forced to be included so that we don't generate endless duplicates in the next step
			fs.unlinkSync (assetName);
		});
	}

	afterEmit (stats) {
		// get manifest before any procedure
		let manifestJson = Mix.manifest.read();

		// extra files to version procedure
		let extraFiles = this.getExtraFilesList();
		let extraFilesParsedOriginalNormalizedPaths = [];
		extraFiles.forEach(assetName => {
			extraFilesParsedOriginalNormalizedPaths.push(this.updateFileOnManifest (assetName));
		})
		Mix.manifest.refresh();

		// webpacked files to version procedure
		Object.keys(manifestJson).forEach(assetName => {
			// if file had already been added to manifest through extraFiles do not try to process/version it again
			if(extraFilesParsedOriginalNormalizedPaths.indexOf(assetName) === - 1) {
				this.updateFileOnManifest(assetName);
			}
		});
		Mix.manifest.refresh();
	}

	apply (compiler) {
		let ref = this;
		compiler.plugin('beforeCompile', this.beforeCompile.bind(this));
		compiler.plugin('afterEmit', this.afterEmit.bind(this));
	}
}

module.exports = laravelMixFileHashVersioning;
