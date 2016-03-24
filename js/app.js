window.onload = function() {
  console.log('service worker in now updated');
  document.body.innerHTML = document.querySelector('script').src;
}