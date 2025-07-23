function loadCart() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#spa-content').html('<div class="alert alert-warning">Vui lòng đăng nhập để xem giỏ hàng.</div>');
    return;
  }
  $.get('http://localhost/persolwebstore/backend/api/cart.php?user_id=' + user.user_id, function(res) {
    let html = '<h2 class="cart-title mb-4">Giỏ hàng của bạn</h2>';
    if (!res.cart || res.cart.length === 0) {
      html += '<div class="alert alert-info">Giỏ hàng trống.</div>';
      $('#spa-content').html(html);
      updateCartBadge();
      return;
    }
    // Tính tổng tiền
    let total = 0;
    res.cart.forEach(item => { total += item.price * item.quantity; });
    html += `<div class='row cart-row'>
      <div class='col-lg-8 mb-3'>
        <div class='card cart-list-card p-2'>
          <table class="table align-middle cart-table mb-0"><thead><tr><th></th><th>Sản phẩm</th><th>Giá</th><th>Số lượng</th><th></th></tr></thead><tbody>`;
    res.cart.forEach(function(item) {
      let img = '';
      if (item.image_url) {
        let matches = item.image_url.match(/https?:\/\/[^,\]\"]+/g);
        img = matches && matches.length ? matches[0] : item.image_url;
      }
      html += `<tr>
        <td><img src='${img}' width='60' class='rounded cart-img' onerror="this.onerror=null;this.src='https://via.placeholder.com/60x40?text=No+Image'"/></td>
        <td>${item.name}</td>
        <td class='cart-price'>${item.price.toLocaleString()} ₫</td>
        <td style='max-width:90px;'><input type='number' min='1' value='${item.quantity}' class='form-control form-control-sm cart-qty' data-id='${item.product_id}'></td>
        <td><button class='btn btn-danger btn-sm cart-remove' data-id='${item.product_id}'><i class='bi bi-trash'></i></button></td>
      </tr>`;
    });
    html += '</tbody></table></div></div>';
    // Cột phải: tổng tiền, nút đặt hàng
    html += `<div class='col-lg-4 mb-3'>
      <div class='card cart-summary-card p-4'>
        <h5 class='mb-3'>Thông tin đơn hàng</h5>
        <div class='cart-total-label mb-2'>Tổng tiền:</div>
        <div class='cart-total mb-3'>${total.toLocaleString()} ₫</div>
        <button class="btn btn-success w-100" id="checkout-btn"><i class='bi bi-credit-card me-1'></i>Đặt hàng</button>
      </div>
    </div></div>`;
    $('#spa-content').html(html);
    updateCartBadge();
  }, 'json');
}

$(document).on('change', '.cart-qty', function() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const product_id = $(this).data('id');
  const quantity = $(this).val();
  $.ajax({
    url: 'http://localhost/persolwebstore/backend/api/cart.php?user_id=' + user.user_id,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({product_id, quantity}),
    success: function() { loadCart(); updateCartBadge(); }
  });
});

$(document).on('click', '.cart-remove', function() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const product_id = $(this).data('id');
  $.ajax({
    url: 'http://localhost/persolwebstore/backend/api/cart.php?user_id=' + user.user_id,
    method: 'DELETE',
    contentType: 'application/json',
    data: JSON.stringify({product_id}),
    success: function() { loadCart(); updateCartBadge(); }
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
    url: 'http://localhost/persolwebstore/backend/api/cart.php?user_id=' + user.user_id,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({product_id, quantity}),
    success: function() {
      alert('Đã thêm vào giỏ!');
      updateCartBadge();
    }
  });
} 