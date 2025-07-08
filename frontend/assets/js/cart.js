function loadCart() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#spa-content').html('<div class="alert alert-warning">Vui lòng đăng nhập để xem giỏ hàng.</div>');
    return;
  }
  $.get('http://localhost/backend/api/cart.php?user_id=' + user.user_id, function(res) {
    let html = '<h2>Giỏ hàng</h2>';
    if (!res.cart || res.cart.length === 0) {
      html += '<div>Giỏ hàng trống.</div>';
      $('#spa-content').html(html);
      return;
    }
    html += '<table class="table"><thead><tr><th>Sản phẩm</th><th>Giá</th><th>Số lượng</th><th></th></tr></thead><tbody>';
    res.cart.forEach(function(item) {
      html += `<tr>
        <td><img src='${item.image_url}' width='60'> ${item.name}</td>
        <td>${item.price.toLocaleString()} đ</td>
        <td><input type='number' min='1' value='${item.quantity}' class='form-control form-control-sm cart-qty' data-id='${item.product_id}'></td>
        <td><button class='btn btn-danger btn-sm cart-remove' data-id='${item.product_id}'>Xóa</button></td>
      </tr>`;
    });
    html += '</tbody></table>';
    html += '<button class="btn btn-success" id="checkout-btn">Đặt hàng</button>';
    $('#spa-content').html(html);
  }, 'json');
}

$(document).on('change', '.cart-qty', function() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const product_id = $(this).data('id');
  const quantity = $(this).val();
  $.ajax({
    url: 'http://localhost/backend/api/cart.php?user_id=' + user.user_id,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({product_id, quantity}),
    success: function() { loadCart(); }
  });
});

$(document).on('click', '.cart-remove', function() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const product_id = $(this).data('id');
  $.ajax({
    url: 'http://localhost/backend/api/cart.php?user_id=' + user.user_id,
    method: 'DELETE',
    contentType: 'application/json',
    data: JSON.stringify({product_id}),
    success: function() { loadCart(); }
  });
});

$(document).on('click', '#checkout-btn', function() {
  loadCheckout();
});

// Hàm thêm sản phẩm vào giỏ (dùng ở product.js)
function addToCart(product_id, quantity = 1) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    alert('Vui lòng đăng nhập!');
    window.location.hash = '#login';
    return;
  }
  $.ajax({
    url: 'http://localhost/backend/api/cart.php?user_id=' + user.user_id,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({product_id, quantity}),
    success: function() { alert('Đã thêm vào giỏ!'); }
  });
} 