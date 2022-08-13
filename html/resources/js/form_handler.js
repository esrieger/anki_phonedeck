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

function deckButtonCb(deckName) {
  console.log('deck button press: ' + deckName)
}

function showDecks() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'deckNames', 'version': 6
  }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      var jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
        var rspStr = '';

        document.getElementById('anki_decks').innerHTML = '';

        for (var i = 0; i < jsonRsp.result.length; i++) {
          if (jsonRsp.result[i] != 'Default') {
            var deck_button = document.createElement('button');
            deck_button.setAttribute('id', 'deck' + i)
            var btnStr = jsonRsp.result[i]
            deck_button.innerHTML = btnStr
            deck_button.setAttribute('onclick', 'deckButtonCb(\'' + btnStr + '\')')
            console.log(jsonRsp.result[i])
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
