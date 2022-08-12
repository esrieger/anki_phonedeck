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

function DeckButton(deckName) {
  document.getElementById('update').innerHTML = deckName;
}

function ShowDecks() {
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

        for (var i = 0; i < jsonRsp.result.length; i++) {
          if (jsonRsp.result[i] != 'Default') {
            var inputElement = document.createElement('button');
            inputElement.type = 'button'
            inputElement.setAttribute('id', 'deck' + i)
            let btnStr = jsonRsp.result[i]
            inputElement.innerHTML = btnStr
            inputElement.addEventListener('click', function() {
              DeckButton(btnStr)
            });
            console.log(jsonRsp.result[i])
            document.body.appendChild(inputElement);
          }
        }
        //document.getElementById('update').innerHTML = rspStr;
      } else {
        document.getElementById('update').innerHTML = jsonRsp.error;
      }
    }
  }
}

function AnkiGet() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', anki_url, true);
  xhr.send(null);

  xhr.onreadystatechange = function() {
    console.log(xhr.responseText);
    document.getElementById('update').innerHTML = xhr.responseText;
  }
}
