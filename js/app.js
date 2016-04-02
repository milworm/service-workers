window.onload = function() {
  console.log('service worker in now updated');
  var src = document.querySelector('script').src;

  document.body.innerHTML += src;
}

function notifyMe() {
    var xhr = new XMLHttpRequest(),
        data = JSON.stringify({
            user_id: 1,
            title: 'Title',
            message: 'Message'
        });

    xhr.open('POST', '/api/notify', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {}
    xhr.send(data);
}