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

// Hàm load danh sách sản phẩm (dùng dữ liệu mẫu nếu chưa có backend)
function loadProducts() {
  $('#spa-content').html('<h2>Danh sách sản phẩm</h2><div id="product-list">Đang tải...</div>');
  let html = '<div class="row">';
  sampleProducts.forEach(function(p) {
    html += `<div class='col-md-4 mb-3'><div class='card h-100'>
      <img src='${p.image}' class='card-img-top' alt='${p.name}'>
      <div class='card-body'>
        <h5 class='card-title'>${p.name}</h5>
        <p class='card-text'>${p.short_desc}</p>
        <button class='btn btn-primary' onclick='showProductDetail(${p.id})'>Xem chi tiết</button>
      </div></div></div>`;
  });
  html += '</div>';
  $('#product-list').html(html);
}

// Hàm hiển thị chi tiết sản phẩm
function showProductDetail(id) {
  const p = sampleProducts.find(x => x.id === id);
  let html = `<div class='card'>
    <div class='row g-0'>
      <div class='col-md-4'><img src='${p.image}' class='img-fluid rounded-start' alt='${p.name}'></div>
      <div class='col-md-8'>
        <div class='card-body'>
          <h5 class='card-title'>${p.name}</h5>
          <p class='card-text'>${p.description}</p>
          <a href='${p.detail_file}' class='btn btn-outline-info' target='_blank'>Xem chi tiết sản phẩm</a>
          <button class='btn btn-secondary ms-2' onclick='loadProducts()'>Quay lại</button>
        </div>
      </div>
    </div>
  </div>`;
  $('#spa-content').html(html);
} 