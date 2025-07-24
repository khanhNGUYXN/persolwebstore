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
      } else if (/^#search-[^-]+(?:-page-\d+)?$/.test(hash)) {
        let match = hash.match(/^#search-([^-]+)(?:-page-(\d+))?$/);
        let searchTerm = decodeURIComponent(match[1]);
        let page = match[2] ? parseInt(match[2]) : 1;
        loadProducts(null, page, searchTerm);
      } else if (hash === '#cart') {
        loadCart();
      } else if (hash === '#orders') {
        loadOrders();
      } else if (hash === '#profile') {
        loadProfile();
      } else if (hash === '#change-password') {
        loadChangePassword();
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
    else if (/^#search-[^-]+(?:-page-\d+)?$/.test(hash)) $('#menu-products').addClass('active');
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
function loadProducts(categoryId = null, page = 1, searchTerm = '') {
  let searchHtml = `
    <div class="row mb-4">
      <div class="col-md-6 mx-auto">
        <div class="input-group">
          <input type="text" class="form-control" id="search-input" placeholder="Tìm kiếm sản phẩm theo tên..." value="${searchTerm}">
          <button class="btn btn-primary" type="button" id="search-btn">
            <i class="bi bi-search"></i> Tìm kiếm
          </button>
          <button class="btn btn-outline-secondary" type="button" id="clear-search-btn" ${searchTerm ? '' : 'style="display:none"'}>
            <i class="bi bi-x-circle"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  `;
  
  $('#spa-content').html(`
    <h2 class="mb-3">Danh sách sản phẩm</h2>
    ${searchHtml}
    <div id="product-list"></div>
    <div id="pagination" class="mt-4"></div>
  `);
  
  // Xử lý sự kiện tìm kiếm
  $('#search-btn').on('click', function() {
    const term = $('#search-input').val().trim();
    if (term) {
      window.location.hash = `#search-${encodeURIComponent(term)}`;
    }
  });
  
  // Xử lý sự kiện nhấn Enter
  $('#search-input').on('keypress', function(e) {
    if (e.which === 13) {
      $('#search-btn').click();
    }
  });
  
  // Xử lý sự kiện xóa tìm kiếm
  $('#clear-search-btn').on('click', function() {
    $('#search-input').val('');
    window.location.hash = '#products';
  });
  
  // Load sản phẩm
  loadProductList(categoryId, page, searchTerm);
}

// Hàm load danh sách sản phẩm
function loadProductList(categoryId = null, page = 1, searchTerm = '') {
  let url = 'http://localhost/persolwebstore/backend/api/products.php';
  let params = [];
  
  if (categoryId) {
    params.push(`category_id=${categoryId}`);
  }
  if (page > 1) {
    params.push(`page=${page}`);
  }
  if (searchTerm) {
    params.push(`search=${encodeURIComponent(searchTerm)}`);
  }
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  $('#product-list').html('<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
  
  $.get(url, function(res) {
    if (res.success) {
      let products = res.products || [];
      let totalPages = res.total_pages || 1;
      
      if (products.length === 0) {
        let noResultsMsg = searchTerm ? 
          `Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}"` :
          'Không có sản phẩm nào trong danh mục này';
        $('#product-list').html(`<div class="text-center text-muted"><i class="bi bi-search display-1"></i><p class="mt-3">${noResultsMsg}</p></div>`);
        $('#pagination').empty();
        return;
      }
      
      let productHtml = '<div class="row">';
      products.forEach(function(product) {
        let imgUrl = product.image_url;
        if (!/^https?:\/\//.test(imgUrl)) {
          imgUrl = '/persolwebstore/' + imgUrl.replace(/^\/+/, '');
        }
        
        productHtml += `
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card product-card h-100">
              <div id="productCarousel${product.id}" class="carousel slide" data-bs-ride="false">
                <div class="carousel-inner">
                  <div class="carousel-item active">
                    <img src="${imgUrl}" class="card-img-top" alt="${product.name}">
                  </div>
                </div>
              </div>
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="product-price">${product.price.toLocaleString('vi-VN')} VNĐ</p>
                <p class="card-text">${product.description}</p>
                <div class="mt-auto">
                  <button class="btn btn-primary btn-sm btn-add-cart me-2" data-product-id="${product.id}">
                    <i class="bi bi-cart-plus"></i> Thêm vào giỏ
                  </button>
                  <a href="#product-${product.id}" class="btn btn-outline-primary btn-sm btn-detail">
                    <i class="bi bi-eye"></i> Chi tiết
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      productHtml += '</div>';
      
      $('#product-list').html(productHtml);
      
      // Render pagination
      if (totalPages > 1) {
        let paginationHtml = '<nav><ul class="pagination justify-content-center">';
        
        // Previous button
        if (page > 1) {
          let prevUrl = searchTerm ? `#search-${encodeURIComponent(searchTerm)}-page-${page-1}` : 
                       categoryId ? `#category-${categoryId}-page-${page-1}` : `#products-page-${page-1}`;
          paginationHtml += `<li class="page-item"><a class="page-link" href="${prevUrl}">Trước</a></li>`;
        }
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
          if (i === page) {
            paginationHtml += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
          } else {
            let pageUrl = searchTerm ? `#search-${encodeURIComponent(searchTerm)}-page-${i}` : 
                         categoryId ? `#category-${categoryId}-page-${i}` : `#products-page-${i}`;
            paginationHtml += `<li class="page-item"><a class="page-link" href="${pageUrl}">${i}</a></li>`;
          }
        }
        
        // Next button
        if (page < totalPages) {
          let nextUrl = searchTerm ? `#search-${encodeURIComponent(searchTerm)}-page-${page+1}` : 
                       categoryId ? `#category-${categoryId}-page-${page+1}` : `#products-page-${page+1}`;
          paginationHtml += `<li class="page-item"><a class="page-link" href="${nextUrl}">Sau</a></li>`;
        }
        
        paginationHtml += '</ul></nav>';
        $('#pagination').html(paginationHtml);
      } else {
        $('#pagination').empty();
      }
      
      // Bind events
      $('.btn-add-cart').on('click', function() {
        const productId = $(this).data('product-id');
        addToCart(productId);
      });
      
    } else {
      $('#product-list').html('<div class="alert alert-danger">Có lỗi xảy ra khi tải danh sách sản phẩm</div>');
    }
  }, 'json').fail(function() {
    $('#product-list').html('<div class="alert alert-danger">Không thể kết nối đến server</div>');
  });
}

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
    window.location.hash = '#login';
    return;
  }
  
  $.post('http://localhost/persolwebstore/backend/api/cart.php', {
    action: 'add',
    user_id: user.user_id,
    product_id: productId,
    quantity: 1
  }, function(res) {
    if (res.success) {
      alert('Đã thêm sản phẩm vào giỏ hàng!');
      updateCartBadge();
    } else {
      alert(res.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  }, 'json').fail(function() {
    alert('Không thể kết nối đến server');
  });
}

function loadCompare() {
  $('#spa-content').html('<h2>So sánh sản phẩm</h2><div id="compare-list"></div>');
}
function loadContact() {
  $('#spa-content').html('<h2>Liên hệ</h2><div id="contact-form"></div>');
} 