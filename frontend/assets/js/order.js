function loadOrders() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#spa-content').html('<div class="alert alert-warning">Vui lòng đăng nhập để xem đơn hàng.</div>');
    return;
  }
  $.get('http://localhost/backend/api/order.php?user_id=' + user.user_id, function(res) {
    let html = '<h2>Đơn hàng của bạn</h2>';
    if (!res.orders || res.orders.length === 0) {
      html += '<div>Bạn chưa có đơn hàng nào.</div>';
      $('#spa-content').html(html);
      return;
    }
    html += '<table class="table"><thead><tr><th>Mã đơn</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>';
    res.orders.forEach(function(order) {
      html += `<tr>
        <td>${order.order_id}</td>
        <td>${order.order_date}</td>
        <td>${order.total_amount.toLocaleString()} đ</td>
        <td>${order.status}</td>
        <td><button class='btn btn-info btn-sm order-detail' data-id='${order.order_id}'>Chi tiết</button></td>
      </tr>`;
    });
    html += '</tbody></table>';
    $('#spa-content').html(html);
  }, 'json');
}

$(document).on('click', '.order-detail', function() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const order_id = $(this).data('id');
  $.get('http://localhost/backend/api/order.php?user_id=' + user.user_id + '&id=' + order_id, function(res) {
    let html = `<h2>Chi tiết đơn hàng #${order_id}</h2>`;
    html += `<div>Ngày: ${res.order.order_date} | Tổng tiền: ${res.order.total_amount.toLocaleString()} đ | Trạng thái: ${res.order.status}</div>`;
    html += '<table class="table"><thead><tr><th>Sản phẩm</th><th>Giá</th><th>Số lượng</th></tr></thead><tbody>';
    res.items.forEach(function(item) {
      html += `<tr>
        <td><img src='${item.image_url}' width='60'> ${item.name}</td>
        <td>${item.price.toLocaleString()} đ</td>
        <td>${item.quantity}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    html += '<button class="btn btn-secondary" onclick="loadOrders()">Quay lại</button>';
    $('#spa-content').html(html);
  }, 'json');
});

function loadCheckout() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#spa-content').html('<div class="alert alert-warning">Vui lòng đăng nhập để đặt hàng.</div>');
    return;
  }
  // Đơn giản: chỉ nhập thông tin giao hàng và thanh toán
  $('#spa-content').html(`
    <h2>Đặt hàng</h2>
    <form id="checkout-form">
      <div class="mb-3"><label>Người nhận</label><input type="text" class="form-control" name="recipient" required></div>
      <div class="mb-3"><label>Địa chỉ</label><input type="text" class="form-control" name="address" required></div>
      <div class="mb-3"><label>Thành phố</label><input type="text" class="form-control" name="city" required></div>
      <div class="mb-3"><label>Điện thoại</label><input type="text" class="form-control" name="phone" required></div>
      <div class="mb-3"><label>Mã bưu điện</label><input type="text" class="form-control" name="zipcode" required></div>
      <div class="mb-3"><label>Phương thức thanh toán</label>
        <select class="form-control" name="payment_method">
          <option value="COD">Thanh toán khi nhận hàng</option>
          <option value="BANK">Chuyển khoản</option>
        </select>
      </div>
      <button class="btn btn-success" type="submit">Xác nhận đặt hàng</button>
    </form>
    <div id="checkout-msg" class="mt-2 text-danger"></div>
  `);
}

$(document).on('submit', '#checkout-form', function(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const data = {
    recipient: this.recipient.value,
    address: this.address.value,
    city: this.city.value,
    phone: this.phone.value,
    zipcode: this.zipcode.value,
    payment_method: this.payment_method.value
  };
  // 1. Tạo delivery_info
  $.ajax({
    url: 'http://localhost/backend/api/order.php?user_id=' + user.user_id + '&action=delivery',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(res) {
      // 2. Tạo transaction_info
      $.ajax({
        url: 'http://localhost/backend/api/order.php?user_id=' + user.user_id + '&action=transaction',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({payment_method: data.payment_method}),
        success: function(res2) {
          // 3. Đặt hàng
          $.ajax({
            url: 'http://localhost/backend/api/order.php?user_id=' + user.user_id,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({delivery_id: res.delivery_id, trans_id: res2.trans_id}),
            success: function(res3) {
              $('#checkout-msg').removeClass('text-danger').addClass('text-success').text('Đặt hàng thành công!');
              setTimeout(loadOrders, 1500);
            },
            error: function(xhr) {
              $('#checkout-msg').text(xhr.responseJSON?.error || 'Đặt hàng thất bại');
            }
          });
        }
      });
    },
    error: function(xhr) {
      $('#checkout-msg').text(xhr.responseJSON?.error || 'Lỗi thông tin giao hàng');
    }
  });
}); 