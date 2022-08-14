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

function showAnswer() {
  var answerButton = document.getElementById('answerButton');
  document.getElementById('anki_main').removeChild(answerButton);
  document.getElementById('answer').hidden = false;
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
      let jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
        // Reset anki main section
        document.getElementById('anki_main').innerHTML = '';
        let cardKeys = Object.keys(jsonRsp.result)
        for (let i = 0; i < cardKeys.length; i++) {
          if (cardKeys[i] == 'question') {
            document.getElementById('anki_main').innerHTML += jsonRsp.result[cardKeys[i]] + '<br>';
          } else if(cardKeys[i] == 'answer') {
            document.getElementById('anki_main').innerHTML += '<div id=answer hidden>' + jsonRsp.result[cardKeys[i]] + '</div>';
            var answerButton = document.createElement('button');
            answerButton.setAttribute('id', 'answerButton')
            answerButton.innerHTML = 'Show Answer'
            answerButton.setAttribute('onclick', 'showAnswer()')
            document.getElementById('anki_main').appendChild(answerButton);
          }
        }
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
        document.getElementById('anki_section_header').innerHTML = '<p>' + deckName + '</p>';
        document.getElementById('anki_main').innerHTML = '';

        var cardButton = document.createElement('button');
        cardButton.setAttribute('id', 'cardButton')
        cardButton.innerHTML = 'Get Current Card'
        cardButton.setAttribute('onclick', 'deckCurrentCard()')
        document.getElementById('anki_main').appendChild(cardButton);
        console.log('card button')
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

        document.getElementById('anki_main').innerHTML = '';

        //console.log('length ' + Object.keys(jsonRsp.result)[1])
        var deckKeys = Object.keys(jsonRsp.result)
        for (var i = 0; i < deckKeys.length; i++) {
          if (deckKeys[i] != 'Default') {
            var deckButton = document.createElement('button');
            deckButton.setAttribute('id', 'deck' + i)
            var btnStr = deckKeys[i]
            console.log(btnStr)
            deckButton.innerHTML = btnStr
            deckButton.setAttribute('onclick', 'deckButtonCb(\'' + btnStr + '\')')
            document.getElementById('anki_main').appendChild(deckButton);
            document.getElementById('anki_main').innerHTML += '<br>';
          }
        }
      } else {
        document.getElementById('anki_main').innerHTML = jsonRsp.error;
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
