/*
 * Copyright (c) <year>, <copyright holder>
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* Global variables */
let test = 'test1';
let anki_url = 'http://192.168.0.184:8765'

/* Array of current decks in the Anki install */
const deck_array = [];

/* Random test function to make sure the webpage is still responsive */
function testFunction() {
  if (test == 'test1') {
    test = 'test2';
  }
  else {
    test = 'test1';
  }
  document.getElementById('test').innerHTML = test;
}

/* Utility function to udpate the deck statistics. */
function getDeckStats() {
  /* Create a new HTTP request object */
  var xhr = new XMLHttpRequest();
  /* Issue POST request to AnkiConnect
   * with getDeckStats action. Add a parameter
   * of the list of decks. */
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'getDeckStats',
    'version': 6,
    'params': { 'decks': deck_array }
  }));

  /* Check that status is successful */
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var jsonRsp = JSON.parse(xhr.responseText);
      if(jsonRsp.error == null) {
        /* Get an object for the key-value pairs
         * returned. */
        let deckIds = Object.keys(jsonRsp.result);
        for (let id = 0; id < deckIds.length; id++) {
          let deckStats = jsonRsp.result[deckIds[id]];
          /* Reset the paragraph HTML for each deck. */
          document.getElementById('deck' + id + 'stats').innerHTML = '';
          /* Add new line for each metric. */
          document.getElementById('deck' + id + 'stats').innerHTML += '&emsp;&emsp;new_count: ' + deckStats['new_count'] + '<br>';
          document.getElementById('deck' + id + 'stats').innerHTML += '&emsp;&emsp;learn_count: ' + deckStats['learn_count'] + '<br>';
          document.getElementById('deck' + id + 'stats').innerHTML += '&emsp;&emsp;review_count: ' + deckStats['review_count'] + '<br>';
        }
      }
    }
  }
}

/* Callback function for the showAnswer button. This puts
 * anki in a state that allows the question to be answered.
 * This will also replace the question HTML with the answer
 * HTML. The answer HTML is just the question HTML plus an
 * additional section for the answer, so the question HTML
 * can be removed so that it's not duplicated. */
function showAnswer() {
  /* Create a new HTTP request object */
  var xhr = new XMLHttpRequest();
  /* Issue POST request to AnkiConnect
   * with guiShowAnswer action. */
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiShowAnswer',
    'version': 6,
  }));

  /* Check that status is successful */
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var jsonRsp = JSON.parse(xhr.responseText)
      if(jsonRsp.error == null) {
        /* Remove the show answer button and show the answer. */
        var answerButton = document.getElementById('answerButton');
        document.getElementById('anki_cards').removeChild(answerButton);
        document.getElementById('answer').hidden = false;

        /* remove initial question. Answer card has the question too. */
        var questionPar = document.getElementById('question');
        document.getElementById('anki_cards').removeChild(questionPar);
      }
    }
  }
}

/* Answer the current card. If successful,
 * get the next card with deckCurrentCard
 * and update the deck statistics. */
function answerCardCb(ease) {
  /* Ease values start at 1 instead of 0. */
  var adjustedEase = parseInt(ease) + 1;

  /* Create a new HTTP request object */
  var xhr = new XMLHttpRequest();
  /* Issue POST request to AnkiConnect
   * with guiAnswerCard action. Specify
   * ease value as the parameter. */
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiAnswerCard',
    'version': 6,
    'params': { 'ease': adjustedEase }
  }));

  /* Check that status is successful */
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var jsonRsp = JSON.parse(xhr.responseText)
      /* If no error, get the next card and
       * update the deck statistics. */
      if(jsonRsp.error == null) {
        deckCurrentCard();
        getDeckStats();
      }
    }
  }
}

/* Get the current card to be reviewed from the current deck. */
function deckCurrentCard() {
  /* Create a new HTTP request object */
  var xhr = new XMLHttpRequest();
  /* Issue POST request to AnkiConnect
   * with guiCurrentCard action. Specify
   * deck name as the parameter. */
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiCurrentCard',
    'version': 6,
  }));

  /* Check that status is successful */
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      /* Parse the response, which is JSON format */
      var jsonRsp = JSON.parse(xhr.responseText)
      /* If no error, proceed to process */
      if(jsonRsp.error == null) {
        /* Reset anki main section */
        document.getElementById('anki_cards').innerHTML = '';
        /* Convert JSON result key value to new object */
        let cardKeys = Object.keys(jsonRsp.result);

        /* Loop through value keys and process accordingly */
        for (let cardKey = 0; cardKey < cardKeys.length; cardKey++) {

          /* For the question key, set the HTML to the HTML of the question key value.
           * AnkiConnect text value for this key is in HTML format */
          if (cardKeys[cardKey] == 'question') {
            var questionPar = document.createElement('question');
            questionPar.setAttribute('id', 'question');
            questionPar.innerHTML = jsonRsp.result[cardKeys[cardKey]] + '<br><br>';
            document.getElementById('anki_cards').appendChild(questionPar);
          }
          /* For the answer key, set the HTML to the HTML of the answer key value.
           * AnkiConnect text value for this key is in HTML format.
           * Set the element as hidden so that it's not viewable initially. */
          else if(cardKeys[cardKey] == 'answer') {
            document.getElementById('anki_cards').innerHTML += '<div id=answer hidden>' + jsonRsp.result[cardKeys[cardKey]] + '</div>';
            var answerButton = document.createElement('button');
            answerButton.setAttribute('id', 'answerButton');
            answerButton.innerHTML = 'Show Answer';
            answerButton.setAttribute('onclick', 'showAnswer()');
            document.getElementById('anki_cards').appendChild(answerButton);
          }
          /* Parse the new review options and create buttons for each.
           * The callback for each button should reflect the ease value associated
           * for each key. */
          else if (cardKeys[cardKey] == 'nextReviews') {
            /* Create button */
            let nextRewiews = jsonRsp.result[cardKeys[cardKey]];
            /* Create a new object of the button key-value pairs */
            let easeKeys = Object.keys(nextRewiews);
            /* Add space after Show Answer button */
            document.getElementById('anki_cards').innerHTML += '<br><br>';

            /* Loop through each key-value pair and create a button for it. */
            for (let easeKey = 0; easeKey < easeKeys.length; easeKey++) {
              let easeButton = document.createElement('button');
              easeButton.setAttribute('id', 'easeButton' + easeKey);
              easeButton.innerHTML = nextRewiews[easeKeys[easeKey]];
              /* Set the parameter to the corresponding ease index */
              easeButton.setAttribute('onclick', 'answerCardCb(\'' + easeKey + '\')');
              document.getElementById('anki_cards').appendChild(easeButton);
              /* Add spacing in between the buttons */
              document.getElementById('anki_cards').innerHTML += '&emsp;';
            }
          }
        }
      }
    }
  }
}

/* Deck button callback. This will get executed when a user
 * selects the deck button. This will select the deck as the current deck
 * in Anki so that subsequent cards can be reviewed. */
function deckButtonCb(deckName) {
  /* Create a new HTTP request object */
  var xhr = new XMLHttpRequest();
  /* Issue POST request to AnkiConnect
   * with guiDeckReview action. Specify
   * deck name as the parameter. */
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'guiDeckReview',
    'version': 6,
    'params': { 'name': deckName }
  }));

  /* Check that status is successful */
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      /* Parse the response, which is JSON format */
      var jsonRsp = JSON.parse(xhr.responseText)
      /* If no error, proceed to process */
      if(jsonRsp.error == null) {
        /* Update section header with the deck name */
        document.getElementById('anki_section_header').innerHTML = '<p>' + deckName + '</p>';

        /* Update the main section with card button
         * to get the first card to review. */
        document.getElementById('anki_cards').innerHTML = '';
        var cardButton = document.createElement('button');
        cardButton.setAttribute('id', 'cardButton');
        cardButton.innerHTML = 'Get Current Card';

        /* Set the callback for the get current card button */
        cardButton.setAttribute('onclick', 'deckCurrentCard()');
        document.getElementById('anki_cards').appendChild(cardButton);
      }
    }
  }
}

/* Get a list of the current decks from the anki install.
 * If successful, get their statistics as well. */
function showDecks() {
  /* Create a new HTTP request object */
  var xhr = new XMLHttpRequest();
  /* Issue POST request to AnkiConnect
   * with deckNamesAndIds action. */
  xhr.open('POST', anki_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    'action': 'deckNamesAndIds', 'version': 6
  }));

  /* Check that status is successful */
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {

      /* Parse the response, which is JSON format */
      var jsonRsp = JSON.parse(xhr.responseText)
      /* If no error, proceed to process */
      if(jsonRsp.error == null) {
        /* Reset anki_stats html section */
        document.getElementById('anki_stats').innerHTML = '';

        /* Convert result key to its own object */
        var deckKeys = Object.keys(jsonRsp.result)

        /* Loop through each deck and create a button for
         * each deck to start reviewing for that deck */
        var deck_ndx = 0;
        for (var i = 0; i < deckKeys.length; i++) {
          if (deckKeys[i] != 'Default') {
            /* Create button element for the deck */
            var deckButton = document.createElement('button');

            /* Set the ID for the element */
            deckButton.setAttribute('id', 'deck' + deck_ndx + 'button')

            /* Set the button HTML to the name of the deck */
            var btnStr = deckKeys[i]
            deckButton.innerHTML = btnStr;

            /* Specify the deck name as the input to this deck's button callback */
            deckButton.setAttribute('onclick', 'deckButtonCb(\'' + btnStr + '\')');

            /* Append the button to the stats section. */
            document.getElementById('anki_stats').appendChild(deckButton);

            /* Add a line break for better appearance */
            document.getElementById('anki_stats').innerHTML += '<br>';

            /* Create a new paragraph element to show the deck statistics */
            var deckStats = document.createElement('p');
            deckStats.setAttribute('id', 'deck' + deck_ndx + 'stats');

            /* Initialize paragraph HTML to nothing */
            deckStats.innerHTML = '';

            /* Append the element. This will get updated in getDeckStats */
            document.getElementById('anki_stats').appendChild(deckStats);

            /* Add the deck name to a list of decks to be used in getDeckStats */
            deck_array[deck_ndx] = deckKeys[i];
            deck_ndx += 1;
          }
        }

        /* Get deck stats */
        getDeckStats();
      }
      else {
        /* If there is an error, set the section to the error */
        document.getElementById('anki_stats').innerHTML = jsonRsp.error;
      }
    }
  }
}

/* Get the AnkiConnect version for display */
function ankiGet() {
  /* Create a new HTTP request object */
  var xhr = new XMLHttpRequest();
  /* Issue GET request to AnkiConnect */
  xhr.open('GET', anki_url, true);
  xhr.send(null);

  /* Check that status is successful */
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      /* If successful, update the page header */
      document.getElementById('anki_title').innerHTML = 'Powered by: ' + xhr.responseText;
    }
  }
}

/* This function gets called when a page is loaded.
 * This will verify that AnkiConnect is running
 * and then proceed to get a list of current
 * decks and their statistics. */
function pageSetup() {
  ankiGet();
  showDecks();
}

document.addEventListener('DOMContentLoaded', pageSetup)
