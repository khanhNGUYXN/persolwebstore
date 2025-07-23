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
      if (/^#products(?:-page-\d+)?$/.test(hash)) {
        let match = hash.match(/^#products(?:-page-(\d+))?$/);
        let page = match && match[1] ? parseInt(match[1]) : 1;
        loadProducts(null, page);
      } else if (/^#category-\d+(?:-page-\d+)?$/.test(hash)) {
        let match = hash.match(/^#category-(\d+)(?:-page-(\d+))?$/);
        let catId = match[1];
        let page = match[2] ? parseInt(match[2]) : 1;
        loadProducts(catId, page);
      } else if (hash === '#cart') {
        loadCart();
      } else if (hash === '#orders') {
        loadOrders();
      } else if (hash === '#login') {
        loadLogin();
      } else if (hash === '#register') {
        loadRegister();
      } else if (hash === '#contact') {
        loadContact();
      } else if (hash === '#logout') {
        logout();
      } else {
        loadHome();
      }
    }, 200);
  }
  function setActiveMenu(hash) {
    $("#main-menu .nav-link").removeClass("active");
    if (/^#products(?:-page-\d+)?$/.test(hash)) $('#menu-products').addClass('active');
    else if (/^#category-\d+(?:-page-\d+)?$/.test(hash)) $('#menu-products').addClass('active');
    else if (hash === '#cart') $('#menu-cart').addClass('active');
    else if (hash === '#contact') $('#menu-contact').addClass('active');
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

// Hàm cập nhật badge giỏ hàng
function updateCartBadge() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#cart-badge').hide();
    return;
  }
  $.get('http://localhost/persolwebstore/backend/api/cart.php?user_id=' + user.user_id, function(res) {
    const count = res.cart ? res.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    if (count > 0) {
      $('#cart-badge').text(count).show();
    } else {
      $('#cart-badge').hide();
    }
  }, 'json');
}

// Dummy loader cho các section
function loadHome() {
  // Gọi API lấy banner
  $.get('http://localhost/persolwebstore/backend/api/banner.php', function(res) {
    let banners = res.banners || [];
    let bannerHtml = '';
    if (banners.length > 0) {
      bannerHtml += '<div id="homeBannerCarousel" class="carousel slide home-banner-carousel" data-bs-ride="carousel">';
      bannerHtml += '<div class="carousel-indicators">';
      for (let i = 0; i < banners.length; i++) {
        bannerHtml += `<button type="button" data-bs-target="#homeBannerCarousel" data-bs-slide-to="${i}"${i===0?' class="active" aria-current="true"':''} aria-label="Banner ${i+1}"></button>`;
      }
      bannerHtml += '</div>';
      bannerHtml += '<div class="carousel-inner">';
      for (let i = 0; i < banners.length; i++) {
        let b = banners[i];
        let imgUrl = b.image_url;
        if (!/^https?:\/\//.test(imgUrl)) {
          imgUrl = '/persolwebstore/' + imgUrl.replace(/^\/+/, '');
        }
        bannerHtml += `<div class="carousel-item${i===0?' active':''}">`;
        if (b.link_url) {
          bannerHtml += `<a href="${b.link_url}" target="_blank"><img src="${imgUrl}" class="d-block w-100" alt="Banner ${i+1}"></a>`;
        } else {
          bannerHtml += `<img src="${imgUrl}" class="d-block w-100" alt="Banner ${i+1}">`;
        }
        bannerHtml += '</div>';
      }
      bannerHtml += '</div>';
      if (banners.length > 1) {
        bannerHtml += '<button class="carousel-control-prev" type="button" data-bs-target="#homeBannerCarousel" data-bs-slide="prev">';
        bannerHtml += '<span class="carousel-control-prev-icon" aria-hidden="true"></span>';
        bannerHtml += '<span class="visually-hidden">Previous</span></button>';
        bannerHtml += '<button class="carousel-control-next" type="button" data-bs-target="#homeBannerCarousel" data-bs-slide="next">';
        bannerHtml += '<span class="carousel-control-next-icon" aria-hidden="true"></span>';
        bannerHtml += '<span class="visually-hidden">Next</span></button>';
      }
      bannerHtml += '</div>';
    }
    // Mô tả hệ thống
    let descHtml = `<section class="mt-4 mb-3 px-2 px-md-4">
      <h2 class="fw-bold text-primary mb-2">Chào mừng đến với Persol Webstore!</h2>
      <p class="lead mb-2">Hệ thống thương mại điện tử chuyên về kính mắt, tròng kính, gọng kính chính hãng.</p>
      <ul class="mb-2">
        <li>Đặt hàng trực tuyến, thanh toán nhanh chóng, giao hàng tận nơi</li>
        <li>Quản lý sản phẩm, danh mục, giỏ hàng, đơn hàng, người dùng</li>
        <li>Admin panel với phân quyền, quản lý banner, sản phẩm, danh mục, đơn hàng</li>
        <li>Giao diện hiện đại, responsive, trải nghiệm mượt mà trên mọi thiết bị</li>
        <li>SPA sử dụng HTML5, CSS3, Bootstrap 5, JavaScript, PHP, MySQL</li>
      </ul>
      <p class="text-muted small">Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ của Persol.</p>
    </section>`;
    $('#spa-content').html(bannerHtml + descHtml);
  }, 'json');
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