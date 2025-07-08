// Điều hướng SPA
$(document).ready(function() {
  // Sự kiện click vào tiêu đề để về trang chủ
  $('#site-title').on('click', function(e) {
    e.preventDefault();
    window.location.hash = '#home';
  });
  function showSection(hash) {
    $("#spa-content").removeClass("fade-in").addClass("fade-out");
    setTimeout(function() {
      $("#spa-content").removeClass("fade-out").addClass("fade-in");
      switch(hash) {
        case '#products': loadProducts(); break;
        case '#cart': loadCart(); break;
        case '#orders': loadOrders(); break;
        case '#login': loadLogin(); break;
        case '#register': loadRegister(); break;
        case '#contact': loadContact(); break;
        case '#logout': logout(); break;
        default: loadHome(); break;
      }
    }, 200);
  }
  function setActiveMenu(hash) {
    $("#main-menu .nav-link").removeClass("active");
    if(hash === '#products') $('#menu-products').addClass('active');
    else if(hash === '#cart') $('#menu-cart').addClass('active');
    else if(hash === '#orders') $('#menu-orders').addClass('active');
    else if(hash === '#contact') $('#menu-contact').addClass('active');
    else $('#menu-home').addClass('active');
  }
  $(window).on('hashchange', function() {
    setActiveMenu(location.hash);
    showSection(location.hash);
  });
  setActiveMenu(location.hash);
  showSection(location.hash);

  // Ticker ngày giờ
  setInterval(function() {
    const now = new Date();
    $('#ticker').text(now.toLocaleString('vi-VN'));
  }, 1000);

  // Lấy vị trí
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      $('#location').text('Vị trí: ' + pos.coords.latitude.toFixed(3) + ',' + pos.coords.longitude.toFixed(3));
    }, function() {
      $('#location').text('Không lấy được vị trí');
    });
  } else {
    $('#location').text('Trình duyệt không hỗ trợ định vị');
  }

  // Lấy counter
  $.get('http://localhost/backend/api/counter.php', function(data) {
    $('#counter').text(data.count || data);
  });
});

// Dummy loader cho các section
function loadHome() {
  $('#spa-content').html('<h2>Chào mừng đến với Persol Webstore!</h2><p>Website kính mắt chính hãng: Ray-Ban, Oakley, Contact Lens, Sunglasses...</p>');
}
function loadProducts() {
  $('#spa-content').html('<h2>Danh sách sản phẩm</h2><div id="product-list"></div>');
}
function loadCompare() {
  $('#spa-content').html('<h2>So sánh sản phẩm</h2><div id="compare-list"></div>');
}
function loadContact() {
  $('#spa-content').html('<h2>Liên hệ</h2><div id="contact-form"></div>');
} 