 console.log('Hello, welcome to my portfolio site! Hope you enjoy having a look around!')
// Menu //
function menuToggle () {
  var x = document.getElementById('myNavtoggle')
  if (x.className === 'navtoggle') {
    x.className += ' responsive';
  } else {
    x.className = 'navtoggle';
  }
}


//document.getElementById('myNavtoggle').addEventListener("focusout", menuToggle);

// Smooth Scrolling //
$(document).ready(function () {
  // Add smooth scrolling to contact ID//
  $('#contact-active').on('click', function (event) {
    // Make sure this.hash has a value before overriding default behavior
    // if (this.hash !== "") {
    // Prevent default anchor click behavior
    event.preventDefault();

    // Store hash
    var hash = this.hash;

    // Using jQuery's animate() method to add smooth page scroll
    // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
    $('html, body').animate({
      scrollTop: $(hash).offset().top
    }, 800, function () {
      // Add hash (#) to URL when done scrolling (default click behavior)
      window.location.hash = hash;
    });
    //} // End if
  });
});
