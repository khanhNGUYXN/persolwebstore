// Quản lý thông tin cá nhân
function loadProfile() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#spa-content').html('<div class="alert alert-warning">Vui lòng đăng nhập để xem thông tin cá nhân.</div>');
    return;
  }

  $('#spa-content').html(`
    <div class="card">
      <div class="card-header">
        <h2 class="mb-0"><i class="bi bi-person me-2"></i>Thông tin cá nhân</h2>
      </div>
      <div class="card-body">
        <form id="profile-form">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Tên đăng nhập</label>
              <input type="text" class="form-control" name="username" value="${user.username || ''}" readonly>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" name="email" value="${user.email || ''}" readonly>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Họ tên <span class="text-danger">*</span></label>
              <input type="text" class="form-control" name="fullname" value="${user.fullname || ''}" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Số điện thoại</label>
              <input type="tel" class="form-control" name="phone" value="${user.phone || ''}">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Địa chỉ</label>
            <textarea class="form-control" name="address" rows="3">${user.address || ''}</textarea>
          </div>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Thành phố</label>
              <input type="text" class="form-control" name="city" value="${user.city || ''}">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Mã bưu điện</label>
              <input type="text" class="form-control" name="zipcode" value="${user.zipcode || ''}">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Ngày sinh</label>
              <input type="date" class="form-control" name="birthdate" value="${user.birthdate || ''}">
            </div>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-check-circle me-1"></i>Cập nhật thông tin
            </button>
            <a href="#orders" class="btn btn-outline-secondary">
              <i class="bi bi-clock-history me-1"></i>Xem lịch sử mua hàng
            </a>
          </div>
        </form>
        <div id="profile-msg" class="mt-3"></div>
      </div>
    </div>
  `);
}

// Xử lý cập nhật thông tin cá nhân
$(document).on('submit', '#profile-form', function(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#profile-msg').removeClass('text-success').addClass('text-danger').text('Vui lòng đăng nhập!');
    return;
  }

  const data = {
    fullname: this.fullname.value,
    phone: this.phone.value,
    address: this.address.value,
    city: this.city.value,
    zipcode: this.zipcode.value,
    birthdate: this.birthdate.value
  };

  $.ajax({
    url: 'http://localhost/persolwebstore/backend/api/user.php?user_id=' + user.user_id + '&action=update_profile',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(res) {
      if (res.success) {
        // Cập nhật thông tin user trong localStorage
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateAuthMenu();
        
        $('#profile-msg').removeClass('text-danger').addClass('text-success').text('Cập nhật thông tin thành công!');
        setTimeout(() => {
          $('#profile-msg').text('');
        }, 3000);
      } else {
        $('#profile-msg').removeClass('text-success').addClass('text-danger').text(res.error || 'Cập nhật thất bại');
      }
    },
    error: function(xhr) {
      $('#profile-msg').removeClass('text-success').addClass('text-danger').text(xhr.responseJSON?.error || 'Cập nhật thất bại');
    }
  });
});

// Đổi mật khẩu
function loadChangePassword() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#spa-content').html('<div class="alert alert-warning">Vui lòng đăng nhập để đổi mật khẩu.</div>');
    return;
  }

  $('#spa-content').html(`
    <div class="card">
      <div class="card-header">
        <h2 class="mb-0"><i class="bi bi-key me-2"></i>Đổi mật khẩu</h2>
      </div>
      <div class="card-body">
        <form id="change-password-form">
          <div class="mb-3">
            <label class="form-label">Mật khẩu hiện tại <span class="text-danger">*</span></label>
            <input type="password" class="form-control" name="current_password" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Mật khẩu mới <span class="text-danger">*</span></label>
            <input type="password" class="form-control" name="new_password" required minlength="6">
            <div class="form-text">Mật khẩu phải có ít nhất 6 ký tự</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
            <input type="password" class="form-control" name="confirm_password" required minlength="6">
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-check-circle me-1"></i>Đổi mật khẩu
            </button>
            <a href="#profile" class="btn btn-outline-secondary">
              <i class="bi bi-person me-1"></i>Về thông tin cá nhân
            </a>
          </div>
        </form>
        <div id="change-password-msg" class="mt-3"></div>
      </div>
    </div>
  `);
}

// Xử lý đổi mật khẩu
$(document).on('submit', '#change-password-form', function(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.user_id) {
    $('#change-password-msg').removeClass('text-success').addClass('text-danger').text('Vui lòng đăng nhập!');
    return;
  }

  const currentPassword = this.current_password.value;
  const newPassword = this.new_password.value;
  const confirmPassword = this.confirm_password.value;

  if (newPassword !== confirmPassword) {
    $('#change-password-msg').removeClass('text-success').addClass('text-danger').text('Mật khẩu xác nhận không khớp!');
    return;
  }

  if (newPassword.length < 6) {
    $('#change-password-msg').removeClass('text-success').addClass('text-danger').text('Mật khẩu mới phải có ít nhất 6 ký tự!');
    return;
  }

  const data = {
    current_password: currentPassword,
    new_password: newPassword
  };

  $.ajax({
    url: 'http://localhost/persolwebstore/backend/api/user.php?user_id=' + user.user_id + '&action=change_password',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(res) {
      if (res.success) {
        $('#change-password-msg').removeClass('text-danger').addClass('text-success').text('Đổi mật khẩu thành công!');
        $('#change-password-form')[0].reset();
        setTimeout(() => {
          $('#change-password-msg').text('');
        }, 3000);
      } else {
        $('#change-password-msg').removeClass('text-success').addClass('text-danger').text(res.error || 'Đổi mật khẩu thất bại');
      }
    },
    error: function(xhr) {
      $('#change-password-msg').removeClass('text-success').addClass('text-danger').text(xhr.responseJSON?.error || 'Đổi mật khẩu thất bại');
    }
  });
}); 