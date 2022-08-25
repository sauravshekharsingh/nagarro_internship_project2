var images = document.querySelectorAll('img');

for (var i = 0; i < images.length; i++) {
  images[i].onerror = function () {
    this.src =
      'https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=';
  };
}
