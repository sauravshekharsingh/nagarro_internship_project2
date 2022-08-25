var images = document.querySelectorAll('img');

for (var i = 0; i < images.length; i++) {
  images[i].onerror = function () {
    this.src =
      'https://via.placeholder.com/400x250?text=Product+Image+is+Unavailable';
  };
}
