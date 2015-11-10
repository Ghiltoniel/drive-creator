# drive-creator
Small nodejs package that create an arborescence on google drive.
## Usage

```
var drive = require('drive-creator');
drive.createArborescence({
	rootParentName: "RootParentName",
	rootName: 'test',
	drive: {
		"client_id":"xxx.apps.googleusercontent.com",
		"client_secret": "xxxxxx",
		"redirect_uris": "urn:ietf:wg:oauth:2.0:oob"
	},
	subFolders: ['Test1', 'Test2', 'Test3'],
	shareWith: ['test-share@gmail.com']
});
```
