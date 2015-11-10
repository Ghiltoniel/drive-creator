var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var open = require('open');
var colors = require('colors');

var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
				'https://www.googleapis.com/auth/drive',
				'https://www.googleapis.com/auth/drive.file',
				'https://www.googleapis.com/auth/drive.appdata',
				'https://www.googleapis.com/auth/drive.apps.readonly'];
				
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
var service = google.drive('v2');
var options;

function createArbo(params){
	options = params;
	authorize(options.drive, createFolders);	
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.client_secret;
  var clientId = credentials.client_id;
  var redirectUrl = credentials.redirect_uri;
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
	if (err) {
	  getNewToken(oauth2Client, callback);
	} else {
	  oauth2Client.credentials = JSON.parse(token);
	  callback(oauth2Client);
	}
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
	access_type: 'offline',
	scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  open(authUrl);
  var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
	rl.close();
	oauth2Client.getToken(code, function(err, token) {
	  if (err) {
		console.log('Error while trying to retrieve access token', err);
		return;
	  }
	  oauth2Client.credentials = token;
	  storeToken(token);
	  callback(oauth2Client);
	});
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
	fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
	if (err.code != 'EEXIST') {
	  throw err;
	}
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function createFolders(auth) {  
  listFiles(options.rootParentName, auth, function(files){
	  if(options.rootParentName){
		  for(var i in files){
			  if(files[i].title == options.rootParentName){
				  var parentId = files[i].id;
			  }
		  }
	  }
	  console.log(('Parent name found with id : ' + parentId).green);
	  
	  var resource = {		  
		  title: options.rootName,
		  mimeType: "application/vnd.google-apps.folder"
	  };
	  if(parentId){
		  resource.parents = [{id:parentId}];
	  }
	  
	  service.files.insert({
		auth: auth,
		resource: resource
	  }, function(err, response){
		   if (err) {
			  console.log('The API returned an error: ' + err);
			  return;
			}
			else{
				console.log('Created root folder named : ' + options.rootName);
				var id = response.id;
				for(var i in options.subFolders){
					var name = options.subFolders[i];
					service.files.insert({
					auth: auth,
					resource: {
					  title: name,
					  mimeType: "application/vnd.google-apps.folder",
					  parents: [{id:id}]
					}
				  }, function(err, response){
					   if (err) {
						  console.log('The API returned an error: ' + err);
						  return;
						}
						else{
							console.log('Created subfolder named : ' + name);
						}
				  });
				}
			}
	  })
  });
}

function listFiles(query, auth, callback) {
	console.log(query);
  service.files.list({
    auth: auth,
	q: 'title = \'' + query + '\'',
    maxResults: 10,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var files = response.items;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      callback(files);
    }
  });
}

module.exports = {
  createArborescence: createArbo
}