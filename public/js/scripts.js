// Réduction de la barre de navigation au défilement
window.addEventListener('scroll', function () {
  var nav = document.getElementById('mainNav');
  if (!nav) {
    return;
  }
  if (window.scrollY > 100) {
    nav.classList.add('navbar-shrink');
  } else {
    nav.classList.remove('navbar-shrink');
  }
});
