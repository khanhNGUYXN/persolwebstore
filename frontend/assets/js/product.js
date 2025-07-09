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

// Hàm load danh sách sản phẩm (dùng backend nếu có)
function loadProducts(category_id = null) {
  $('#spa-content').html('<h2>Danh sách sản phẩm</h2><div id="product-list">Đang tải...</div>');
  let url = 'http://localhost/persolwebstore/backend/api/products.php';
  if (category_id) url += '?category_id=' + category_id;
  $.get(url, function(res) {
    let html = '<div class="row">';
    if (!res.products || res.products.length === 0) {
      html += '<div class="col-12 text-center text-muted">Không có sản phẩm nào trong danh mục này.</div>';
    } else {
      (res.products || []).forEach(function(p, idx) {
        let images = (p.images && p.images.length) ? p.images : (p.image_url ? [p.image_url] : []);
        let carouselId = 'carousel-list-' + idx;
        let carousel = '';
        if (images.length > 1) {
          carousel += `<div id='${carouselId}' class='carousel slide' data-bs-ride='carousel'><div class='carousel-inner'>`;
          images.forEach((img, i) => {
            carousel += `<div class='carousel-item${i===0?' active':''}'><img src='${img}' class='d-block w-100' style='height:180px;object-fit:contain'></div>`;
          });
          carousel += `</div><button class='carousel-control-prev' type='button' data-bs-target='#${carouselId}' data-bs-slide='prev'><span class='carousel-control-prev-icon'></span></button><button class='carousel-control-next' type='button' data-bs-target='#${carouselId}' data-bs-slide='next'><span class='carousel-control-next-icon'></span></button></div>`;
        } else if (images.length === 1) {
          carousel = `<img src='${images[0]}' class='card-img-top' alt='${p.name}' style='height:180px;object-fit:contain'>`;
        }
        html += `<div class='col-md-4 mb-3'><div class='card h-100'>
          ${carousel}
          <div class='card-body'>
            <h5 class='card-title'>${p.name}</h5>
            <p class='card-text'>${p.description || ''}</p>
            <button class='btn btn-primary' onclick='showProductDetail(${p.product_id})'>Xem chi tiết</button>
            <button class='btn btn-success ms-2 add-to-cart-btn' data-id='${p.product_id}'>Thêm vào giỏ</button>
          </div></div></div>`;
      });
    }
    html += '</div>';
    $('#product-list').html(html);
  }, 'json');
}

// Hàm hiển thị chi tiết sản phẩm (dùng backend)
function showProductDetail(id) {
  $.get('http://localhost/persolwebstore/backend/api/products.php?id=' + id, function(res) {
    const p = res.product;
    let images = (p.images && p.images.length) ? p.images : (p.image_url ? [p.image_url] : []);
    let carousel = '';
    let carouselId = 'carousel-detail-' + id;
    if (images.length > 1) {
      carousel += `<div id='${carouselId}' class='carousel slide mb-3' data-bs-ride='carousel'><div class='carousel-inner'>`;
      images.forEach((img, i) => {
        carousel += `<div class='carousel-item${i===0?' active':''}'><img src='${img}' class='d-block w-100' style='max-height:320px;object-fit:contain'></div>`;
      });
      carousel += `</div><button class='carousel-control-prev' type='button' data-bs-target='#${carouselId}' data-bs-slide='prev'><span class='carousel-control-prev-icon'></span></button><button class='carousel-control-next' type='button' data-bs-target='#${carouselId}' data-bs-slide='next'><span class='carousel-control-next-icon'></span></button></div>`;
    } else if (images.length === 1) {
      carousel = `<img src='${images[0]}' class='img-fluid rounded-start mb-3' alt='${p.name}' style='max-height:320px;object-fit:contain'>`;
    }
    let html = `<div class='card'>
      <div class='row g-0'>
        <div class='col-md-5'>${carousel}</div>
        <div class='col-md-7'>
          <div class='card-body'>
            <h5 class='card-title'>${p.name}</h5>
            <p class='card-text'>${p.description || ''}</p>`;
    if (p.detail_file && (p.detail_file.endsWith('.pdf') || p.detail_file.endsWith('.doc') || p.detail_file.endsWith('.docx'))) {
      html += `<a href='${p.detail_file}' class='btn btn-outline-info' target='_blank'>Tải file mô tả</a>`;
    }
    html += `<button class='btn btn-secondary ms-2' onclick='loadProducts()'>Quay lại</button>
          </div>
        </div>
      </div>
    </div>`;
    $('#spa-content').html(html);
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
});

// Hook vào hashchange để load đúng sản phẩm
$(window).on('hashchange', function() {
  if (location.hash.startsWith('#category-')) {
    const catId = location.hash.replace('#category-', '');
    loadProducts(catId);
  } else if (location.hash === '#products' || location.hash === '' || location.hash === '#home') {
    loadProducts();
  }
});
// Khi vào trang lần đầu
if (location.hash.startsWith('#category-')) {
  const catId = location.hash.replace('#category-', '');
  loadProducts(catId);
} else if (location.hash === '#products' || location.hash === '' || location.hash === '#home') {
  loadProducts();
} 