// Dữ liệu mẫu sản phẩm (nếu chưa có backend)
const sampleProducts = [
  {
    id: 1,
    name: 'Ray-Ban Aviator Classic',
    image: 'https://assets.ray-ban.com/is/image/RayBan/8052896020578__001.png',
    short_desc: 'Gọng kim loại, kính phi công cổ điển',
    description: 'Ray-Ban Aviator Classic là biểu tượng của phong cách kính phi công với gọng kim loại nhẹ, tròng kính chống UV.',
    detail_file: 'https://www.ray-ban.com/usa/sunglasses/RB3025-001-58'
  },
  {
    id: 2,
    name: 'Oakley Holbrook',
    image: 'https://www.oakley.com/en-us/product/W0OO9102?variant=888392105926',
    short_desc: 'Phong cách thể thao, gọng nhựa bền',
    description: 'Oakley Holbrook mang lại cảm giác thể thao, phù hợp cho hoạt động ngoài trời, tròng kính Prizm tăng cường màu sắc.',
    detail_file: 'https://www.oakley.com/en-us/product/W0OO9102?variant=888392105926'
  },
  {
    id: 3,
    name: 'Acuvue Oasys Contact Lenses',
    image: 'https://www.acuvue.com/sites/acuvue_us/files/styles/product_image/public/2021-01/ACUVUE-OASYS-2WEEK-6PK-Front.png',
    short_desc: 'Kính áp tròng mềm, dùng 2 tuần',
    description: 'Acuvue Oasys là kính áp tròng mềm, giữ ẩm tốt, phù hợp cho người dùng máy tính nhiều.',
    detail_file: 'https://www.acuvue.com/contact-lenses/acuvue-oasys-2-week'
  }
];

// Hàm lấy mảng link ảnh từ image_url (dù là JSON, [url1,url2], hay 1 link)
function extractImageUrls(image_url) {
  if (!image_url) return [];
  // Nếu là mảng JSON chuẩn
  try {
    let arr = JSON.parse(image_url);
    if (Array.isArray(arr)) return arr;
  } catch (e) {}
  // Nếu là chuỗi dạng [url1, url2] hoặc [ "url1", "url2" ]
  let matches = image_url.match(/https?:\/\/[^\s,\]\"]+/g);
  if (matches) return matches;
  // Nếu chỉ là 1 link
  if (image_url.trim().startsWith('http')) return [image_url.trim()];
  return [];
}

// Thêm hàm chuẩn hóa đường dẫn ảnh
function normalizeImageUrl(img) {
  if (!/^https?:\/\//.test(img)) {
    return '/persolwebstore/' + img.replace(/^\/+/, '');
  }
  return img;
}

// Hàm load danh sách sản phẩm (dùng backend nếu có)
function loadProducts(category_id = null, page = 1, searchTerm = '', priceMin = '', priceMax = '') {
  let priceFilterHtml = `
    <div class="col-md-4 mb-2 mb-md-0">
      <select id="price-segment" class="form-select">
        <option value="">All price ranges</option>
        <option value="0-200">Under $200</option>
        <option value="200-400">$200 - $400</option>
        <option value="400-700">$400 - $700</option>
        <option value="700-99999">Above $700</option>
      </select>
    </div>
  `;
  let searchHtml = `
    <div class="row mb-4 align-items-center">
      <div class="col-md-6 mb-2 mb-md-0">
        <div class="input-group">
          <input type="text" class="form-control" id="search-input" placeholder="Tìm kiếm sản phẩm theo tên..." value="${searchTerm}">
          <button class="btn btn-primary" type="button" id="search-btn">
            <i class="bi bi-search"></i> Tìm kiếm
          </button>
          <button class="btn btn-outline-secondary" type="button" id="clear-search-btn" ${searchTerm ? '' : 'style=\"display:none\"'}>
            <i class="bi bi-x-circle"></i> Xóa
          </button>
        </div>
      </div>
      ${priceFilterHtml}
    </div>
  `;
  
  $('#spa-content').html(`
    <h2 class="mb-3">Danh sách sản phẩm</h2>
    ${searchHtml}
    <div id="product-list">Đang tải...</div>
  `);
  
  // Xử lý sự kiện tìm kiếm
  $('#search-btn').on('click', function() {
    const term = $('#search-input').val().trim();
    const priceVal = $('#price-segment').val();
    let priceMin = '', priceMax = '';
    if (priceVal) {
      let parts = priceVal.split('-');
      priceMin = parts[0];
      priceMax = parts[1];
    }
    if (term) {
      window.location.hash = `#search-${encodeURIComponent(term)}`;
    } else {
      loadProducts(category_id, 1, '', priceMin, priceMax);
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

  // Sự kiện chọn filter giá
  $('#price-segment').on('change', function() {
    const priceVal = $(this).val();
    let priceMin = '', priceMax = '';
    if (priceVal) {
      let parts = priceVal.split('-');
      priceMin = parts[0];
      priceMax = parts[1];
    }
    // Giữ searchTerm nếu có
    loadProducts(category_id, 1, $('#search-input').val().trim(), priceMin, priceMax);
  });

  let url = 'http://localhost/persolwebstore/backend/api/products.php?page=' + page + '&limit=10';
  if (category_id) url += '&category_id=' + category_id;
  if (searchTerm) url += '&search=' + encodeURIComponent(searchTerm);
  if (priceMin) url += '&price_min=' + priceMin;
  if (priceMax) url += '&price_max=' + priceMax;
  $.get(url, function(res) {
    console.log('API Response:', res); // Debug log
  let html = '<div class="row">';
    if (!res.products || res.products.length === 0) {
      let noResultsMsg = searchTerm ? 
        `Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}"` :
        'Không có sản phẩm nào trong danh mục này';
      html += `<div class="col-12 text-center text-muted"><i class="bi bi-search display-1"></i><p class="mt-3">${noResultsMsg}</p></div>`;
    } else {
      (res.products || []).forEach(function(p, idx) {
        let images = (Array.isArray(p.images) && p.images.length) ? p.images : extractImageUrls(p.image_url);
        let carouselId = 'carousel-list-' + idx;
        let carousel = '';
        if (images.length > 1) {
          // Carousel indicators
          let indicators = '<div class="carousel-indicators">';
          images.forEach((img, i) => {
            indicators += `<button type='button' data-bs-target='#${carouselId}' data-bs-slide-to='${i}' class='${i===0?'active':''}' aria-current='${i===0?'true':'false'}' aria-label='Slide ${i+1}'></button>`;
          });
          indicators += '</div>';
          carousel += `<div id='${carouselId}' class='carousel slide' data-bs-ride='carousel'>${indicators}<div class='carousel-inner'>`;
          images.forEach((img, i) => {
            carousel += `<div class='carousel-item${i===0?' active':''}'><img src='${normalizeImageUrl(img)}' onerror=\"this.onerror=null;this.src='https://via.placeholder.com/180x120?text=No+Image'\" class='d-block w-100 card-img-top' style='height:200px;object-fit:contain'></div>`;
          });
          carousel += `</div><button class='carousel-control-prev' type='button' data-bs-target='#${carouselId}' data-bs-slide='prev'><span class='carousel-control-prev-icon'></span></button><button class='carousel-control-next' type='button' data-bs-target='#${carouselId}' data-bs-slide='next'><span class='carousel-control-next-icon'></span></button></div>`;
        } else if (images.length === 1) {
          carousel = `<img src='${normalizeImageUrl(images[0])}' onerror=\"this.onerror=null;this.src='https://via.placeholder.com/180x120?text=No+Image'\" class='card-img-top' alt='${p.name}' style='height:200px;object-fit:contain'>`;
        } else {
          carousel = `<img src='https://via.placeholder.com/180x120?text=No+Image' class='card-img-top' alt='No image' style='height:200px;object-fit:contain'>`;
        }
        // Sửa đoạn render nút chi tiết:
        let prodId = p.product_id || p.id || '';
        html += `<div class='col-12 col-sm-6 col-md-4 mb-4 d-flex'>
          <div class='card product-card w-100 h-100 d-flex flex-column'>
            ${carousel}
            <div class='card-body d-flex flex-column'>
        <h5 class='card-title'>${p.name}</h5>
              <div class='product-price mb-2'>${p.price ? (p.price.toLocaleString('vi-VN') + '₫') : ''}</div>
              <p class='card-text flex-grow-1'>${p.description || ''}</p>
              <div class='mt-auto d-flex'>
                <button class='btn btn-detail me-2' onclick='showProductDetail(${prodId})'>Xem chi tiết</button>
                <button class='btn btn-add-cart add-to-cart-btn ms-auto' data-id='${prodId}'><i class='bi bi-cart-plus me-1'></i>Thêm vào giỏ</button>
              </div>
            </div>
          </div>
        </div>`;
      });
    }
  html += '</div>';
    // Render pagination
    if (res.total > res.limit) {
      html += '<nav><ul class="pagination justify-content-center">';
      let totalPages = Math.ceil(res.total / res.limit);
      let cur = res.page;
      let show = 2;
      let cat = category_id ? category_id : '';
      let search = searchTerm ? encodeURIComponent(searchTerm) : '';
      let priceMinParam = priceMin ? encodeURIComponent(priceMin) : '';
      let priceMaxParam = priceMax ? encodeURIComponent(priceMax) : '';
      
      if (cur > 1) {
        let firstUrl = search ? `#search-${search}-page-1` : 
                      cat ? `#category-${cat}-page-1` : `#products-page-1`;
        let prevUrl = search ? `#search-${search}-page-${cur-1}` : 
                      cat ? `#category-${cat}-page-${cur-1}` : `#products-page-${cur-1}`;
        html += `<li class='page-item'><a class='page-link' href='${firstUrl}'>&laquo;</a></li>`;
        html += `<li class='page-item'><a class='page-link' href='${prevUrl}'>&lt;</a></li>`;
      }
      
      for (let i = Math.max(1, cur - show); i <= Math.min(totalPages, cur + show); i++) {
        let pageUrl = search ? `#search-${search}-page-${i}` : 
                     cat ? `#category-${cat}-page-${i}` : `#products-page-${i}`;
        html += `<li class='page-item${i==cur?' active':''}'><a class='page-link' href='${pageUrl}'>${i}</a></li>`;
      }
      
      if (cur < totalPages) {
        let nextUrl = search ? `#search-${search}-page-${cur+1}` : 
                     cat ? `#category-${cat}-page-${cur+1}` : `#products-page-${cur+1}`;
        let lastUrl = search ? `#search-${search}-page-${totalPages}` : 
                     cat ? `#category-${cat}-page-${totalPages}` : `#products-page-${totalPages}`;
        html += `<li class='page-item'><a class='page-link' href='${nextUrl}'>&gt;</a></li>`;
        html += `<li class='page-item'><a class='page-link' href='${lastUrl}'>&raquo;</a></li>`;
      }
      html += '</ul></nav>';
    }
  $('#product-list').html(html);
  }, 'json').fail(function(xhr, status, error) {
    console.error('API Error:', xhr.responseText);
    $('#product-list').html('<div class="alert alert-danger">Có lỗi xảy ra khi tải danh sách sản phẩm: ' + error + '</div>');
  });
}

// Hàm hiển thị chi tiết sản phẩm (dùng backend)
function showProductDetail(id) {
  $.get('http://localhost/persolwebstore/backend/api/products.php?id=' + id, function(res) {
    const p = res.product;
    let images = (Array.isArray(p.images) && p.images.length) ? p.images : extractImageUrls(p.image_url);
    let carouselId = 'carousel-detail-' + id;
    let carousel = '';
    if (images.length > 1) {
      // Carousel indicators
      let indicators = '<div class="carousel-indicators">';
      images.forEach((img, i) => {
        indicators += `<button type='button' data-bs-target='#${carouselId}' data-bs-slide-to='${i}' class='${i===0?'active':''}' aria-current='${i===0?'true':'false'}' aria-label='Slide ${i+1}'></button>`;
      });
      indicators += '</div>';
      carousel += `<div id='${carouselId}' class='carousel slide mb-3' data-bs-ride='carousel'>${indicators}<div class='carousel-inner'>`;
      images.forEach((img, i) => {
        carousel += `<div class='carousel-item${i===0?' active':''}'><img src='${normalizeImageUrl(img)}' class='d-block w-100 rounded detail-main-img' style='max-height:340px;object-fit:contain'></div>`;
      });
      carousel += `</div><button class='carousel-control-prev' type='button' data-bs-target='#${carouselId}' data-bs-slide='prev'><span class='carousel-control-prev-icon'></span></button><button class='carousel-control-next' type='button' data-bs-target='#${carouselId}' data-bs-slide='next'><span class='carousel-control-next-icon'></span></button></div>`;
    } else if (images.length === 1) {
      carousel = `<img src='${normalizeImageUrl(images[0])}' class='img-fluid rounded detail-main-img mb-3' alt='${p.name}' style='max-height:340px;object-fit:contain'>`;
    } else {
      carousel = `<img src='https://via.placeholder.com/320x180?text=No+Image' class='img-fluid rounded detail-main-img mb-3' alt='No image' style='max-height:340px;object-fit:contain'>`;
    }
    // Breadcrumb (có href)
    let breadcrumb = `<nav aria-label='breadcrumb'><ol class='breadcrumb bg-white px-0 mb-2'>
      <li class='breadcrumb-item'><a href='#home' onclick='loadHome()'>Trang chủ</a></li>
      <li class='breadcrumb-item'><a href='#products' onclick='loadProducts()'>Sản phẩm</a></li>
      <li class='breadcrumb-item active' aria-current='page'>${p.name}</li>
    </ol></nav>`;
    // Giá
    let price = p.price ? `<div class='detail-price mb-2'>${p.price.toLocaleString('vi-VN')}₫</div>` : '';
    // Mô tả luôn hiển thị đúng dạng
    let descHtml = '';
    if (p.description) {
      let lines = p.description.split(/\r?\n|<br\s*\/?>/);
      let hasBullet = lines.some(line => line.trim().startsWith('-'));
      if (hasBullet) {
        descHtml = `<ul class='detail-desc-list'>` +
          lines.map(line => line.trim().startsWith('-')
            ? `<li>${line.replace(/^\-\s*/, '')}</li>`
            : ''
          ).join('') +
          `</ul>`;
      } else {
        descHtml = `<p class='detail-desc'>${p.description}</p>`;
      }
    } else {
      descHtml = `<p class='detail-desc text-muted'>Chưa có mô tả cho sản phẩm này.</p>`;
    }
    // Nút chọn số lượng và thêm vào giỏ
    let qtyBlock = `<div class='input-group mb-3' style='max-width:140px;'>
      <button class='btn btn-outline-secondary' type='button' id='btn-qty-minus'><i class='bi bi-dash'></i></button>
      <input type='number' class='form-control text-center' id='detail-qty' value='1' min='1' style='max-width:50px;'>
      <button class='btn btn-outline-secondary' type='button' id='btn-qty-plus'><i class='bi bi-plus'></i></button>
    </div>`;
    let addCartBtn = `<button class='btn btn-add-cart w-100 mb-2' id='btn-detail-add-cart' data-id='${p.product_id}'><i class='bi bi-cart-plus me-1'></i>Thêm vào giỏ</button>`;
    let downloadBtn = '';
    if (p.detail_file && (p.detail_file.endsWith('.pdf') || p.detail_file.endsWith('.doc') || p.detail_file.endsWith('.docx'))) {
      downloadBtn = `<a href='${p.detail_file}' class='btn btn-outline-info w-100 mb-2' target='_blank'><i class='bi bi-download me-1'></i>Tải file mô tả</a>`;
    }
    // Voting stars (hiển thị điểm thực tế)
    let user = JSON.parse(localStorage.getItem('user') || 'null');
    let starsHtml = `<div id='rating-block' class='mb-2'><span id='avg-rating'></span> <span id='total-rating'></span><div class='detail-stars mt-1 mb-2'>`;
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<i class='bi bi-star star-vote' data-star='${i}' style='font-size:1.5em;cursor:pointer;'></i>`;
    }
    starsHtml += `</div></div>`;
    // Bình luận
    let commentHtml = `<div class='mt-4'><h5>Bình luận sản phẩm</h5><div id='comment-list'>Đang tải...</div>`;
    if (user && user.user_id) {
      commentHtml += `<form id='comment-form' class='mb-3'><div class='input-group'>
        <input type='text' class='form-control' id='comment-input' placeholder='Nhập bình luận...'>
        <button class='btn btn-primary' type='submit'>Gửi</button>
      </div></form>`;
    } else {
      commentHtml += `<div class='text-muted small'>Đăng nhập để bình luận.</div>`;
    }
    commentHtml += `</div>`;
    let html = `<div class='card detail-card p-3'>
      ${breadcrumb}
      <div class='row g-4'>
        <div class='col-md-5 d-flex align-items-center justify-content-center'>${carousel}</div>
        <div class='col-md-7'>
          <div class='card-body p-0'>
            <h2 class='detail-title mb-2'>${p.name}</h2>
            ${starsHtml}
            ${price}
            ${descHtml}
            ${qtyBlock}
            ${addCartBtn}
            ${downloadBtn}
            ${commentHtml}
        </div>
      </div>
    </div>
  </div>`;
  $('#spa-content').html(html);
    // Lấy rating thực tế
    $.get('http://localhost/persolwebstore/backend/api/rating.php?product_id=' + p.product_id, function(r) {
      $('#avg-rating').html(`<b>${r.avg_rating || 0}</b> <i class='bi bi-star-fill text-warning'></i>`);
      $('#total-rating').html(`(${r.total} lượt đánh giá)`);
      // Nếu user đã vote, tô màu sao
      let user = JSON.parse(localStorage.getItem('user') || 'null');
      let myVote = 0;
      if (user && user.user_id) {
        let found = r.ratings.find(rt => rt.user_id === user.user_id);
        if (found) myVote = found.rating;
      }
      $('.star-vote').each(function(){
        let star = parseInt($(this).data('star'));
        $(this).removeClass('bi-star-fill text-warning').addClass('bi-star');
        if (star <= myVote) $(this).removeClass('bi-star').addClass('bi-star-fill text-warning');
      });
    }, 'json');
    // Sự kiện vote
    $(document).on('click', '.star-vote', function(){
      let user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user || !user.user_id) { alert('Vui lòng đăng nhập để đánh giá!'); return; }
      let star = parseInt($(this).data('star'));
      $.ajax({
        url: 'http://localhost/persolwebstore/backend/api/rating.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({product_id: p.product_id, user_id: user.user_id, rating: star}),
        success: function(){ showProductDetail(p.product_id); },
        error: function(){ alert('Lỗi khi gửi đánh giá!'); }
      });
    });
    // Lấy bình luận
    function loadComments() {
      $.get('http://localhost/persolwebstore/backend/api/comment.php?product_id=' + p.product_id, function(res) {
        let html = '';
        if (!res.comments || !res.comments.length) {
          html = `<div class='text-muted'>Chưa có bình luận nào.</div>`;
        } else {
          res.comments.forEach(c => {
            html += `<div class='border rounded p-2 mb-2 bg-light'><b>${c.username||'Ẩn danh'}</b> <span class='text-muted small'>${c.created_at}</span><br>${escapeHtml(c.comment)}`;
            let user = JSON.parse(localStorage.getItem('user') || 'null');
            if (user && user.user_id && c.user_id === user.user_id) {
              html += ` <a href='#' class='text-danger ms-2 btn-delete-comment' data-id='${c.comment_id}' style='font-size:0.9em'>Xóa</a>`;
            }
            html += `</div>`;
          });
        }
        $('#comment-list').html(html);
      }, 'json');
    }
    loadComments();
    // Gửi bình luận
    $(document).off('submit', '#comment-form').on('submit', '#comment-form', function(e){
      e.preventDefault();
      let user = JSON.parse(localStorage.getItem('user') || 'null');
      let val = $('#comment-input').val().trim();
      if (!val) return;
      $.ajax({
        url: 'http://localhost/persolwebstore/backend/api/comment.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({product_id: p.product_id, user_id: user.user_id, username: user.fullname || user.username || user.email, comment: val}),
        success: function(){ $('#comment-input').val(''); loadComments(); },
        error: function(){ alert('Lỗi khi gửi bình luận!'); }
      });
    });
    // Xóa bình luận
    $(document).off('click', '.btn-delete-comment').on('click', '.btn-delete-comment', function(e){
      e.preventDefault();
      if (!confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;
      let id = $(this).data('id');
      $.ajax({
        url: 'http://localhost/persolwebstore/backend/api/comment.php',
        method: 'DELETE',
        data: 'id=' + id,
        success: function(){ loadComments(); },
        error: function(){ alert('Lỗi khi xóa bình luận!'); }
      });
    });
    // Thêm vào giỏ với số lượng chọn
    $('#btn-detail-add-cart').click(function(){
      const product_id = $(this).data('id');
      const qty = parseInt($('#detail-qty').val())||1;
      addToCart(product_id, qty);
    });
  }, 'json');
}

// Hàm render dropdown categories dạng cây
function renderCategoryDropdown(categories, parent = null, level = 0) {
  let html = '';
  categories.filter(c => c.parent_id == parent).forEach(c => {
    let hasChild = categories.some(x => x.parent_id == c.category_id);
    if (hasChild) {
      html += `<li class="dropdown-submenu position-relative">
        <a class="dropdown-item dropdown-toggle" href="#category-${c.category_id}" data-bs-toggle="dropdown">${c.name}</a>
        <ul class="dropdown-menu">
          ${renderCategoryDropdown(categories, c.category_id, level+1)}
        </ul>
      </li>`;
    } else {
      html += `<li><a class="dropdown-item" href="#category-${c.category_id}">${c.name}</a></li>`;
    }
  });
  return html;
}

$(document).ready(function() {
  // Lấy categories và render dropdown
  $.get('http://localhost/persolwebstore/backend/api/categories.php', function(res) {
    if (res.categories) {
      $('#dropdown-categories').html(renderCategoryDropdown(res.categories));
    }
  }, 'json');

  // Dropdown hover mở (không cần click)
  $('#menu-products-dropdown').on('mouseenter', function() {
    $(this).addClass('show');
    $(this).find('.dropdown-menu').addClass('show');
  }).on('mouseleave', function() {
    $(this).removeClass('show');
    $(this).find('.dropdown-menu').removeClass('show');
  });

  // Bắt sự kiện click vào category để lọc sản phẩm
  $(document).on('click', '#dropdown-categories a.dropdown-item', function(e) {
    const hash = $(this).attr('href');
    if (hash.startsWith('#category-')) {
      window.location.hash = hash;
      e.preventDefault();
    }
  });

  // Khi click vào menu Sản phẩm, luôn load toàn bộ sản phẩm và đóng dropdown
  $(document).on('click', '#menu-products', function(e) {
    window.location.hash = '#products';
    // Đóng dropdown nếu đang mở
    $('#menu-products-dropdown').removeClass('show');
    $('#dropdown-categories').removeClass('show');
    e.preventDefault();
  });

  // Sự kiện thêm vào giỏ
  $(document).on('click', '.add-to-cart-btn', function() {
    const product_id = $(this).data('id');
    addToCart(product_id, 1);
  });

  // Chặn reload khi click vào phân trang, chỉ đổi hash
  $(document).on('click', '.pagination a', function(e) {
    const href = $(this).attr('href');
    if (href && href.startsWith('#')) {
      window.location.hash = href;
      e.preventDefault();
    }
  });
});

// Hook vào hashchange để load đúng sản phẩm và trang
$(window).on('hashchange', function() {
  let hash = location.hash;
  let catMatch = hash.match(/^#category-(\d+)(?:-page-(\d+))?$/);
  let prodMatch = hash.match(/^#products(?:-page-(\d+))?$/);
  let searchMatch = hash.match(/^#search-([^-]+)(?:-page-(\d+))?$/);
  let priceMinMatch = hash.match(/^#search-([^-]+)-price-min-([^-]+)(?:-page-(\d+))?$/);
  let priceMaxMatch = hash.match(/^#search-([^-]+)-price-max-([^-]+)(?:-page-(\d+))?$/);
  
  if (catMatch) {
    const catId = catMatch[1];
    const page = catMatch[2] ? parseInt(catMatch[2]) : 1;
    loadProducts(catId, page);
  } else if (prodMatch) {
    const page = prodMatch[1] ? parseInt(prodMatch[1]) : 1;
    loadProducts(null, page);
  } else if (searchMatch) {
    const searchTerm = decodeURIComponent(searchMatch[1]);
    const page = searchMatch[2] ? parseInt(searchMatch[2]) : 1;
    loadProducts(null, page, searchTerm);
  } else if (priceMinMatch) {
    const searchTerm = decodeURIComponent(priceMinMatch[1]);
    const priceMin = decodeURIComponent(priceMinMatch[2]);
    const page = priceMinMatch[3] ? parseInt(priceMinMatch[3]) : 1;
    loadProducts(null, page, searchTerm, priceMin);
  } else if (priceMaxMatch) {
    const searchTerm = decodeURIComponent(priceMaxMatch[1]);
    const priceMax = decodeURIComponent(priceMaxMatch[2]);
    const page = priceMaxMatch[3] ? parseInt(priceMaxMatch[3]) : 1;
    loadProducts(null, page, searchTerm, '', priceMax);
  }
});
// Khi vào trang lần đầu
(function() {
  let hash = location.hash;
  let catMatch = hash.match(/^#category-(\d+)(?:-page-(\d+))?$/);
  let prodMatch = hash.match(/^#products(?:-page-(\d+))?$/);
  let searchMatch = hash.match(/^#search-([^-]+)(?:-page-(\d+))?$/);
  let priceMinMatch = hash.match(/^#search-([^-]+)-price-min-([^-]+)(?:-page-(\d+))?$/);
  let priceMaxMatch = hash.match(/^#search-([^-]+)-price-max-([^-]+)(?:-page-(\d+))?$/);
  
  if (catMatch) {
    const catId = catMatch[1];
    const page = catMatch[2] ? parseInt(catMatch[2]) : 1;
    loadProducts(catId, page);
  } else if (prodMatch) {
    const page = prodMatch[1] ? parseInt(prodMatch[1]) : 1;
    loadProducts(null, page);
  } else if (searchMatch) {
    const searchTerm = decodeURIComponent(searchMatch[1]);
    const page = searchMatch[2] ? parseInt(searchMatch[2]) : 1;
    loadProducts(null, page, searchTerm);
  } else if (priceMinMatch) {
    const searchTerm = decodeURIComponent(priceMinMatch[1]);
    const priceMin = decodeURIComponent(priceMinMatch[2]);
    const page = priceMinMatch[3] ? parseInt(priceMinMatch[3]) : 1;
    loadProducts(null, page, searchTerm, priceMin);
  } else if (priceMaxMatch) {
    const searchTerm = decodeURIComponent(priceMaxMatch[1]);
    const priceMax = decodeURIComponent(priceMaxMatch[2]);
    const page = priceMaxMatch[3] ? parseInt(priceMaxMatch[3]) : 1;
    loadProducts(null, page, searchTerm, '', priceMax);
  } else {
    loadProducts();
  }
})(); 