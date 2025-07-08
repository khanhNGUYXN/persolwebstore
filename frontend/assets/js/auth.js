// Đăng nhập/Đăng ký SPA
function loadLogin() {
  $('#spa-content').html(`
    <div class="auth-box">
      <h2 class="text-center mb-4">Đăng nhập</h2>
      <form id="login-form">
        <div class="mb-3"><label>Email</label><input type="email" class="form-control" name="email" required></div>
        <div class="mb-3"><label>Mật khẩu</label><input type="password" class="form-control" name="password" required></div>
        <button class="btn btn-primary w-100 py-2 fw-bold" type="submit">Đăng nhập</button>
      </form>
      <div id="login-msg" class="mt-2 text-danger text-center"></div>
      <div class="text-center mt-3 small">Chưa có tài khoản? <a href="#register">Đăng ký ngay</a></div>
    </div>
  `);
  $('#login-form').on('submit', function(e) {
    e.preventDefault();
    const email = this.email.value;
    const password = this.password.value;
    $.ajax({
      url: 'http://localhost/backend/api/auth.php?action=login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({email, password}),
      success: function(res) {
        localStorage.setItem('user', JSON.stringify(res));
        updateAuthMenu();
        window.location.hash = '#home';
      },
      error: function(xhr) {
        $('#login-msg').text(xhr.responseJSON?.error || (xhr.responseText ? xhr.responseText : 'Đăng nhập thất bại'));
      }
    });
  });
}

function loadRegister() {
  $('#spa-content').html(`
    <div class="auth-box">
      <h2 class="text-center mb-4">Đăng ký</h2>
      <form id="register-form">
        <div class="mb-3"><label>Email</label><input type="email" class="form-control" name="email" required></div>
        <div class="mb-3"><label>Mật khẩu</label><input type="password" class="form-control" name="password" required></div>
        <div class="mb-3"><label>Nhập lại mật khẩu</label><input type="password" class="form-control" name="repassword" required></div>
        <button class="btn btn-success w-100 py-2 fw-bold" type="submit">Đăng ký</button>
      </form>
      <div id="register-msg" class="mt-2 text-danger text-center"></div>
      <div class="text-center mt-3 small">Đã có tài khoản? <a href="#login">Đăng nhập</a></div>
    </div>
  `);
  $('#register-form').on('submit', function(e) {
    e.preventDefault();
    const email = this.email.value;
    const password = this.password.value;
    const repassword = this.repassword.value;
    if (password !== repassword) {
      $('#register-msg').text('Mật khẩu nhập lại không khớp!');
      return;
    }
    $.ajax({
      url: 'http://localhost/backend/api/auth.php?action=register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({email, password}),
      success: function(res) {
        $('#register-msg').removeClass('text-danger').addClass('text-success').text('Đăng ký thành công! Vui lòng đăng nhập.');
      },
      error: function(xhr) {
        $('#register-msg').text(xhr.responseJSON?.error || (xhr.responseText ? xhr.responseText : 'Đăng ký thất bại'));
      }
    });
  });
}

function updateAuthMenu() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.user_id) {
    $('#auth-menu').addClass('d-none');
    $('#user-menu').removeClass('d-none');
    $('#user-info').text(user.email || user.user_id);
  } else {
    $('#auth-menu').removeClass('d-none');
    $('#user-menu').addClass('d-none');
    $('#user-info').text('');
  }
}

function logout() {
  localStorage.removeItem('user');
  updateAuthMenu();
  window.location.hash = '#home';
}

// Hook vào app.js
$(document).ready(function() {
  updateAuthMenu();
  $(document).on('click', '#menu-logout', function(e) { e.preventDefault(); logout(); });
}); 