function loadOrders() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#spa-content').html('<div class="alert alert-warning">Vui lòng đăng nhập để xem đơn hàng.</div>');
    return;
  }
  $.get('http://localhost/persolwebstore/backend/api/order.php?user_id=' + user.user_id, function(res) {
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
  $.get('http://localhost/persolwebstore/backend/api/order.php?user_id=' + user.user_id + '&id=' + order_id, function(res) {
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
  
  // Lấy thông tin profile từ localStorage hoặc từ server
  let profileData = {
    recipient: user.fullname || '',
    address: user.address || '',
    city: user.city || '',
    phone: user.phone || '',
    zipcode: user.zipcode || ''
  };
  
  // Nếu không có đủ thông tin trong localStorage, lấy từ server
  if (!profileData.address || !profileData.city) {
    $.get('http://localhost/persolwebstore/backend/api/user.php?user_id=' + user.user_id + '&action=profile', function(res) {
      if (res.user) {
        profileData = {
          recipient: res.user.fullname || user.fullname || '',
          address: res.user.address || '',
          city: res.user.city || '',
          phone: res.user.phone || '',
          zipcode: res.user.zipcode || ''
        };
        renderCheckoutForm(profileData);
      } else {
        renderCheckoutForm(profileData);
      }
    }, 'json').fail(function() {
      renderCheckoutForm(profileData);
    });
  } else {
    renderCheckoutForm(profileData);
  }
}

function renderCheckoutForm(profileData) {
  $('#spa-content').html(`
    <div class="card">
      <div class="card-header">
        <h2 class="mb-0"><i class="bi bi-cart-check me-2"></i>Đặt hàng</h2>
      </div>
      <div class="card-body">
        <form id="checkout-form">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Người nhận <span class="text-danger">*</span></label>
              <input type="text" class="form-control" name="recipient" value="${profileData.recipient}" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Điện thoại <span class="text-danger">*</span></label>
              <input type="tel" class="form-control" name="phone" value="${profileData.phone}" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
            <textarea class="form-control" name="address" rows="2" required>${profileData.address}</textarea>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Thành phố <span class="text-danger">*</span></label>
              <input type="text" class="form-control" name="city" value="${profileData.city}" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Mã bưu điện <span class="text-danger">*</span></label>
              <input type="text" class="form-control" name="zipcode" value="${profileData.zipcode}" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Phương thức thanh toán <span class="text-danger">*</span></label>
            <select class="form-control" name="payment_method" required>
              <option value="COD">Thanh toán khi nhận hàng (COD)</option>
              <option value="BANK">Chuyển khoản ngân hàng</option>
            </select>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-success" type="submit">
              <i class="bi bi-check-circle me-1"></i>Xác nhận đặt hàng
            </button>
            <button type="button" class="btn btn-outline-primary" id="btn-use-profile">
              <i class="bi bi-person-check me-1"></i>Sử dụng thông tin từ profile
            </button>
            <a href="#cart" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-1"></i>Quay lại giỏ hàng
            </a>
          </div>
        </form>
        <div id="checkout-msg" class="mt-3"></div>
      </div>
    </div>
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
    url: 'http://localhost/persolwebstore/backend/api/order.php?user_id=' + user.user_id + '&action=delivery',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(res) {
      console.log('Delivery response:', res);
      if (!res.delivery_id) {
        $('#checkout-msg').text('Lỗi tạo thông tin giao hàng (delivery_id null)');
        return;
      }
      // 2. Tạo transaction_info
      $.ajax({
        url: 'http://localhost/persolwebstore/backend/api/order.php?user_id=' + user.user_id + '&action=transaction',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({payment_method: data.payment_method}),
        success: function(res2) {
          console.log('Transaction response:', res2);
          if (!res2.trans_id) {
            $('#checkout-msg').text('Lỗi tạo thông tin thanh toán (trans_id null)');
            return;
          }
          // 3. Đặt hàng
          $.ajax({
            url: 'http://localhost/persolwebstore/backend/api/order.php?user_id=' + user.user_id,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({delivery_id: res.delivery_id, trans_id: res2.trans_id}),
            success: function(res3) {
              console.log('Order response:', res3);
              if (!res3.order_id) {
                $('#checkout-msg').text('Lỗi tạo đơn hàng (order_id null)');
                return;
              }
              $('#checkout-msg').removeClass('text-danger').addClass('text-success').text('Đặt hàng thành công!');
              setTimeout(loadOrders, 1500);
            },
            error: function(xhr) {
              $('#checkout-msg').text(xhr.responseJSON?.error || 'Đặt hàng thất bại');
            }
          });
        },
        error: function(xhr) {
          $('#checkout-msg').text(xhr.responseJSON?.error || 'Lỗi thông tin thanh toán');
        }
      });
    },
    error: function(xhr) {
      $('#checkout-msg').text(xhr.responseJSON?.error || 'Lỗi thông tin giao hàng');
    }
  });
});

// Xử lý nút "Sử dụng thông tin từ profile"
$(document).on('click', '#btn-use-profile', function() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    alert('Vui lòng đăng nhập!');
    return;
  }
  
  // Lấy thông tin profile từ server
  $.get('http://localhost/persolwebstore/backend/api/user.php?user_id=' + user.user_id + '&action=profile', function(res) {
    if (res.user) {
      // Điền thông tin vào form
      $('#checkout-form input[name="recipient"]').val(res.user.fullname || user.fullname || '');
      $('#checkout-form input[name="phone"]').val(res.user.phone || '');
      $('#checkout-form textarea[name="address"]').val(res.user.address || '');
      $('#checkout-form input[name="city"]').val(res.user.city || '');
      $('#checkout-form input[name="zipcode"]').val(res.user.zipcode || '');
      
      // Hiển thị thông báo
      $('#checkout-msg').removeClass('text-danger').addClass('text-success').text('Đã điền thông tin từ profile!');
      setTimeout(() => {
        $('#checkout-msg').text('');
      }, 2000);
    } else {
      $('#checkout-msg').removeClass('text-success').addClass('text-danger').text('Không thể lấy thông tin profile!');
    }
  }, 'json').fail(function() {
    $('#checkout-msg').removeClass('text-success').addClass('text-danger').text('Lỗi khi lấy thông tin profile!');
  });
}); 

// Nếu có input số lượng trong cart/checkout, chặn nhập <= 0
$(document).on('input change', 'input[type="number"][name="quantity"], #detail-qty', function() {
  let v = parseInt($(this).val()) || 1;
  if (v < 1) v = 1;
  $(this).val(v);
}); 