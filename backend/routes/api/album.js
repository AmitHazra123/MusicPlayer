const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/test', (req, res) => res.json({ msg: 'test successfull' }));

// @access        /api/album/showlist
// @method        GET
// @desc          to show the album list
// @Security      Public

router.get('/showlist', (req, res) => {
  fetch('http://storage.googleapis.com/automotive-media/music.json')
    .then(response => response.json())
    .then(response => {
      let lookup = {};
      let items = response.music;
      let result = [];

      for (let item, i = 0; (item = items[i++]); ) {
        let album = item.album;

        if (!(album in lookup)) {
          lookup[album] = 1;
          items.filter(music => {
            return music['album'] === album;
          })[0];
          result.push(item);
        }
      }

      res.json(result);
    })
    .catch(err => console.log(err));
});

// @access        /api/album/albumdetails/:albumname
// @method        GET
// @desc          to show a perticular album details by its name
// @Security      Public

router.get('/albumdetails/:albumname', (req, res) => {
  fetch('http://storage.googleapis.com/automotive-media/music.json')
    .then(response => response.json())
    .then(response => {
      let items = response.music;
      let albumname = req.params.albumname;

      res.json(
        items.filter(music => {
          return music['album'] === albumname;
        })
      );
    })
    .catch(err => console.log(err));
});

module.exports = router;
