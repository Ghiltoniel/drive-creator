# drive-creator
Small nodejs package that create an arborescence on google drive.
## Usage

```
var drive = require('drive-creator');
drive.createArborescence({
	rootParentName: "Guigui&Chloé",
	rootName: 'test',
	drive: {
		"client_id":"530847256099-tjfhh9fl0cragm3i7k7rnnbq52kaa8sm.apps.googleusercontent.com",
		"client_secret": "SYj3TH_FvOEx3SnTneRlME4u",
		"redirect_uris": "urn:ietf:wg:oauth:2.0:oob"
	},
	subFolders: ['Test1', 'Test2', 'Test3'],
	shareWith: ['jacquart.guillaume@gmail.com']
});
```
