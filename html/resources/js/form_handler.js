// Global variable
let test = 'test1';
let anki_url = 'http://192.168.0.184:8765'

function testFunction() {
  if (test == 'test1') {
    test = 'test2';
  }
  else {
    test = 'test1';
  }
  console.log('Test button press: ' + test)
  document.getElementById('test').innerHTML = test;
}

function postTemplate() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiCurrentCard',
    'version': 6,
  }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      var jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
      }
    }
  }
}

function deckCurrentCard() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiCurrentCard',
    'version': 6,
  }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      var jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
      }
    }
  }
}

function deckButtonCb(deckName) {
  console.log('deck button press: ' + deckName)

  var xhr = new XMLHttpRequest();
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiDeckReview',
    'version': 6,
    'params': { 'name': deckName }
  }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      var jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
        deckCurrentCard();
      }
    }
  }
}

function showDecks() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'deckNamesAndIds', 'version': 6
  }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      var jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
        var rspStr = '';

        document.getElementById('anki_decks').innerHTML = '';

        //console.log('length ' + Object.keys(jsonRsp.result)[1])
        var deckKeys = Object.keys(jsonRsp.result)
        for (var i = 0; i < deckKeys.length; i++) {
          if (deckKeys[i] != 'Default') {
            var deck_button = document.createElement('button');
            deck_button.setAttribute('id', 'deck' + i)
            var btnStr = deckKeys[i]
            console.log(btnStr)
            deck_button.innerHTML = btnStr
            deck_button.setAttribute('onclick', 'deckButtonCb(\'' + btnStr + '\')')
            document.getElementById('anki_decks').appendChild(deck_button);
            document.getElementById('anki_decks').innerHTML += '<br>';
          }
        }
      } else {
        document.getElementById('anki_decks').innerHTML = jsonRsp.error;
      }
    }
  }
}

function ankiGet() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', anki_url, true);
  xhr.send(null);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      document.getElementById('anki_title').innerHTML = 'Powered by: ' + xhr.responseText;
    }
  }
}

function pageSetup() {
  ankiGet();
  showDecks();
}

document.addEventListener('DOMContentLoaded', pageSetup)
