//Add required modules here
var express = require('express');
var request = require('request');
var app = express();
var path = require('path');
var fs = require('fs');

var db;

var cloudant;

var fileToUpload;

var dbCredentials = {
    dbName: 'views'
};
//http://localhost:3000/analyze/hello!
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);
app.use('/style', express.static(path.join(__dirname, 'views/style')));

// nome, artista , album , uri
app.get('/whatsound/api/v1/deezer/track/values', function (req, res) {
    var query = (req.query.query != null && req.query.query != '' && req.query.query != "undefined") ? req.query.query : null;
    // tipo = tracks, artists, albums
    if (query == null) {
        var result = {
            status: false,
            message: "Bad request, {Empty query}"
        }
        res.status(400).json(result);
    } else {
        var options = {
            url: "https://api.deezer.com/search?q=" + query,
            headers: {
                Accept: 'text/json'
            }
        };

        function callback(error, response, body) {
            var musics = [];
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                if (info != ' ') {
                    if (info['data'].length == 0) {
                        var result = {
                            "code": 20,
                            "message": "Music not found",
                            "status": false
                        }
                        res.send(result);
                    }
                    for (var i in Object.keys(info['data'])) {
                        if (i < 1) {
                            musics.push({
                                "name": JSON.stringify(info['data'][i]['title_short']).replace(new RegExp('\\"', "g"), ""),
                                "track_id": (info['data'][i]['id']),
                                "duration": info['data'][i]['duration'],
                                "artist": JSON.stringify(info['data'][i]['artist']['name']).replace(new RegExp('\\"', "g"), ""),
                                "artist_id": (info['data'])[i]['artist']['id'],
                                "artist_image": JSON.stringify(info['data'][i]['artist']['picture_xl']).replace(new RegExp('\\"', "g"), ""),
                                "artist_tracklist": JSON.stringify(info['data'][i]['artist']['tracklist']).replace(new RegExp('\\"', "g"), ""),
                                "album": JSON.stringify(info['data'][i]['album']['title']).replace(new RegExp('\\"', "g"), ""),
                                "album_id": (info['data'])[i]['album']['id'],          
                                "album_image": JSON.stringify(info['data'][i]['album']['cover_xl']).replace(new RegExp('\\"', "g"), ""),
                                "album_tracklist": JSON.stringify(info['data'][i]['album']['tracklist']).replace(new RegExp('\\"', "g"), ""),
                                
                                "track_url": JSON.stringify(info['data'][i]['link']).replace(new RegExp('\\"', "g"), "")

                            });
                        }

                    }
                    res.send(musics);
                }
            } else {
            res.send(error);
        }
    }
    request(options, callback);
}
});

app.get('/', function (req, res) {
    res.send('teste');
});


app.listen(8082, function() {
       console.log('Deezer api is now running on port 8082 and in NodePort 30082')
});
