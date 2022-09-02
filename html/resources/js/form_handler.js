// Global variable
let test = 'test1';
let anki_url = 'http://192.168.0.184:8765'

const deck_array = [];

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

function getDeckStats() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'getDeckStats',
    'version': 6,
    'params': { 'decks': deck_array }
  }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      var jsonRsp = JSON.parse(xhr.responseText);
      if(jsonRsp.error == null) {
        let deckIds = Object.keys(jsonRsp.result);
        for (let id = 0; id < deckIds.length; id++) {
          console.log(deckIds[id]);
          let deckStats = jsonRsp.result[deckIds[id]];
          console.log(deckStats);
          document.getElementById('deck' + id + 'stats').innerHTML = '';
          document.getElementById('deck' + id + 'stats').innerHTML += '&emsp;&emsp;new_count: ' + deckStats['new_count'] + '<br>';
          document.getElementById('deck' + id + 'stats').innerHTML += '&emsp;&emsp;learn_count: ' + deckStats['learn_count'] + '<br>';
          document.getElementById('deck' + id + 'stats').innerHTML += '&emsp;&emsp;review_count: ' + deckStats['review_count'] + '<br>';
        }
      }
    }
  }
}

function showAnswer() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiShowAnswer',
    'version': 6,
  }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      var jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
        // Remove the show answer button and show the answer
        var answerButton = document.getElementById('answerButton');
        document.getElementById('anki_cards').removeChild(answerButton);
        document.getElementById('answer').hidden = false;

        // remove initial question. Answer card has the question too.
        var questionPar = document.getElementById('question');
        document.getElementById('anki_cards').removeChild(questionPar);
      }
    }
  }
}

function answerCardCb(ease) {
  var adjustedEase = parseInt(ease) + 1;

  var xhr = new XMLHttpRequest();
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiAnswerCard',
    'version': 6,
    'params': { 'ease': adjustedEase }
  }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      var jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
        deckCurrentCard();
        getDeckStats();
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
      let jsonRsp = JSON.parse(xhr.responseText);
      if(jsonRsp.error == null) {
        // Reset anki main section
        document.getElementById('anki_cards').innerHTML = '';
        let cardKeys = Object.keys(jsonRsp.result);
        for (let cardKey = 0; cardKey < cardKeys.length; cardKey++) {
          if (cardKeys[cardKey] == 'question') {
            var questionPar = document.createElement('question');
            questionPar.setAttribute('id', 'question');
            questionPar.innerHTML = jsonRsp.result[cardKeys[cardKey]] + '<br><br>';
            document.getElementById('anki_cards').appendChild(questionPar);
            //document.getElementById('anki_cards').innerHTML += jsonRsp.result[cardKeys[cardKey]] + '<br>';
          }
          else if(cardKeys[cardKey] == 'answer') {
            document.getElementById('anki_cards').innerHTML += '<div id=answer hidden>' + jsonRsp.result[cardKeys[cardKey]] + '</div>';
            var answerButton = document.createElement('button');
            answerButton.setAttribute('id', 'answerButton');
            answerButton.innerHTML = 'Show Answer';
            answerButton.setAttribute('onclick', 'showAnswer()');
            document.getElementById('anki_cards').appendChild(answerButton);
          }
          else if (cardKeys[cardKey] == 'nextReviews') {
            // Create buttons
            let nextRewiews = jsonRsp.result[cardKeys[cardKey]];
            let easeKeys = Object.keys(nextRewiews);
            // add space after Show Answer button
            document.getElementById('anki_cards').innerHTML += '<br><br>';
            for (let easeKey = 0; easeKey < easeKeys.length; easeKey++) {

              let easeButton = document.createElement('button');
              easeButton.setAttribute('id', 'easeButton' + easeKey);
              easeButton.innerHTML = nextRewiews[easeKeys[easeKey]];
              easeButton.setAttribute('onclick', 'answerCardCb(\'' + easeKey + '\')');
              document.getElementById('anki_cards').appendChild(easeButton);
              document.getElementById('anki_cards').innerHTML += '\t\t\t\t';
            }
          }
        }
      }
    }
  }
}

function deckButtonCb(deckName, deckId) {
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
      var jsonRsp = JSON.parse(xhr.responseText);
      if(jsonRsp.error == null) {
        // Update section header with deck name
        document.getElementById('anki_section_header').innerHTML = '<p>' + deckName + '</p>';

        // Update main card with card button
        document.getElementById('anki_cards').innerHTML = '';
        var cardButton = document.createElement('button');
        cardButton.setAttribute('id', 'cardButton');
        cardButton.innerHTML = 'Get Current Card';
        cardButton.setAttribute('onclick', 'deckCurrentCard()');
        document.getElementById('anki_cards').appendChild(cardButton);
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
        // Reset anki_stats html
        document.getElementById('anki_stats').innerHTML = '';

        var deckKeys = Object.keys(jsonRsp.result)
        var deck_ndx = 0;
        for (var i = 0; i < deckKeys.length; i++) {
          if (deckKeys[i] != 'Default') {
            var deckButton = document.createElement('button');
            deckButton.setAttribute('id', 'deck' + deck_ndx + 'button')
            var btnStr = deckKeys[i]
            console.log(btnStr);
            var deckId = jsonRsp.result[deckKeys[i]];
            console.log(deckId);
            deckButton.innerHTML = btnStr;
            deckButton.setAttribute('onclick', 'deckButtonCb(\'' + btnStr + '\', \'' + deckId + '\')');
            document.getElementById('anki_stats').appendChild(deckButton);
            document.getElementById('anki_stats').innerHTML += '<br>';

            var deckStats = document.createElement('p');
            deckStats.setAttribute('id', 'deck' + deck_ndx + 'stats');
            deckStats.innerHTML = '';
            document.getElementById('anki_stats').appendChild(deckStats);

            deck_array[deck_ndx] = deckKeys[i];
            deck_ndx += 1;
          }
        }

        // Get deck stats
        getDeckStats();
      }
      else {
        document.getElementById('anki_stats').innerHTML = jsonRsp.error;
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
