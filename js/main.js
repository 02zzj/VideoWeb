// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initNavbar();

    // 初始化轮播图
    initCarousel();

    // 初始化电影列表
    initMovieList();

    // 初始化搜索功能
    initSearch();

    // 初始化分类筛选
    initCategoryFilter();

    // 初始化表单验证
    initFormValidation();

    // 初始化登录和注册功能
    initAuthForms();
});

// 初始化导航栏
function initNavbar() {
    // 滚动时改变导航栏样式
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('shadow');
            navbar.style.backgroundColor = 'rgba(26, 35, 126, 0.95)';
        } else {
            navbar.classList.remove('shadow');
            navbar.style.backgroundColor = '#1a237e';
        }
    });

    // 移动端菜单切换
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
    }
}

// 初始化轮播图
function initCarousel() {
    const carousel = document.querySelector('#mainCarousel');
    if (carousel) {
        // Bootstrap 5 轮播图会自动初始化
        // 这里可以添加自定义配置
    }
}

// 显示电影列表
async function displayMovies(movies, container) {
    container.innerHTML = '';
    
    try {
        // 先获取所有分类数据
        const categories = await API.getCategories();
        
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
            
            // 修复图片路径
            const posterPath = movie.poster.startsWith('./') ? movie.poster : `./${movie.poster}`;
            
            // 获取电影分类名称
            const movieCategories = movie.category.map(catId => {
                const category = categories.find(c => c.id === catId);
                return category ? category.name : '未知';
            });
            
            card.innerHTML = `
                <div class="card movie-card h-100 d-flex flex-column">
                    <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
                    <div class="card-body flex-grow-1 d-flex flex-column">
                        <h5 class="card-title" style="min-height: 50px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${movie.title}</h5>
                        <div class="movie-rating">★ ${movie.rating}</div>
                        <div class="movie-meta mb-3">
                            <span>${movie.release_date}</span>
                            <span>${movie.duration} 分钟</span>
                        </div>
                        <div class="movie-categories mb-3 flex-grow-1">
                            ${movieCategories.map(catName => `<span class="movie-category">${catName}</span>`).join('')}
                        </div>
                        <a href="pages/movie-detail.html?id=${movie.id}" class="btn btn-primary w-100 mt-auto">查看详情</a>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to display movies:', error);
    }
}

// 初始化电影列表
async function initMovieList() {
    // 只在首页执行，避免影响电影详情页的相关推荐
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        const movieGrid = document.querySelector('.movie-grid');
        if (movieGrid) {
            try {
                const movies = await API.getMovies();
                await displayMovies(movies, movieGrid);
            } catch (error) {
                console.error('Failed to load movies:', error);
            }
        }
    }
}

// 初始化搜索功能
function initSearch() {
    // 只在首页执行，避免影响电影详情页的相关推荐
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        const searchForm = document.querySelector('#searchForm');
        const searchInput = document.querySelector('#searchInput');
        const movieGrid = document.querySelector('.movie-grid');
        
        if (searchForm && searchInput && movieGrid) {
            searchForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const keyword = searchInput.value.trim();
                
                if (keyword) {
                    try {
                        const results = await API.searchMovies(keyword);
                        await displayMovies(results, movieGrid);
                    } catch (error) {
                        console.error('Search failed:', error);
                    }
                }
            });
        }
    }
}

// 初始化分类筛选
function initCategoryFilter() {
    // 只在首页执行，避免影响电影详情页的相关推荐
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        const categoryLinks = document.querySelectorAll('.category-link');
        const movieGrid = document.querySelector('.movie-grid');
        
        if (categoryLinks.length > 0 && movieGrid) {
            categoryLinks.forEach(link => {
                link.addEventListener('click', async function(e) {
                    e.preventDefault();
                    
                    // 移除所有活跃状态
                    categoryLinks.forEach(l => l.classList.remove('active'));
                    // 添加当前链接的活跃状态
                    this.classList.add('active');
                    
                    const categoryId = this.dataset.categoryId;
                    
                    try {
                        let movies;
                        if (categoryId === 'all') {
                            movies = await API.getMovies();
                        } else {
                            movies = await API.getMoviesByCategory(categoryId);
                        }
                        await displayMovies(movies, movieGrid);
                    } catch (error) {
                        console.error('Failed to load movies by category:', error);
                    }
                });
            });
        }
    }
}

// 初始化表单验证
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

// 初始化登录和注册功能
function initAuthForms() {
    // 登录表单
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.querySelector('#loginEmail').value;
            const password = document.querySelector('#loginPassword').value;
            
            try {
                const user = await API.login(email, password);
                if (user) {
                    Auth.login(user);
                    // 登录成功，根据用户角色跳转到不同页面
                    if (user.role === 'admin') {
                        // 管理员跳转到后台管理页面
                        window.location.href = 'admin/index.html';
                    } else {
                        // 普通用户跳转到首页
                        window.location.href = '../index.html';
                    }
                } else {
                    alert('登录失败，邮箱或密码错误');
                }
            } catch (error) {
                console.error('Login failed:', error);
                alert('登录失败，请稍后重试');
            }
        });
    }
    
    // 注册表单
    const registerForm = document.querySelector('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.querySelector('#registerUsername').value;
            const email = document.querySelector('#registerEmail').value;
            const password = document.querySelector('#registerPassword').value;
            const confirmPassword = document.querySelector('#registerConfirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            
            try {
                const newUser = await API.register({
                    username,
                    email,
                    password,
                    role: 'user'
                });
                
                if (newUser) {
                    Auth.login(newUser);
                    // 注册成功，跳转到首页
                    window.location.href = '../index.html';
                } else {
                    alert('注册失败，请稍后重试');
                }
            } catch (error) {
                console.error('Registration failed:', error);
                alert('注册失败，请稍后重试');
            }
        });
    }
}

// 显示电影详情
async function displayMovieDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    if (!movieId) {
        // 根据当前页面路径调整重定向路径
        const isDetailPage = window.location.pathname.includes('/pages/');
        const redirectPath = isDetailPage ? '../index.html' : 'index.html';
        window.location.href = redirectPath;
        return;
    }
    
    try {
        const movie = await API.getMovieById(movieId);
        if (movie) {
            const detailContainer = document.querySelector('.movie-detail');
            if (detailContainer) {
                // 更新电影详情
                document.title = `${movie.title} - 神影视频`;
                
                const categories = await API.getCategories();
                const movieCategories = movie.category.map(catId => {
                    const category = categories.find(c => c.id === catId);
                    return category ? category.name : '';
                }).filter(Boolean).join(', ');
                
                // 修复图片路径
                const posterPath = movie.poster.startsWith('/') ? movie.poster : `/${movie.poster}`;
                
                detailContainer.innerHTML = `
                    <div class="row align-items-center">
                        <div class="col-lg-4 col-md-5 d-flex justify-content-center">
                            <img src="${posterPath}" class="img-fluid" alt="${movie.title}" style="max-width: 100%; height: auto;">
                        </div>
                        <div class="col-lg-8 col-md-7">
                            <div class="movie-info">
                                <h2>${movie.title}</h2>
                                <div class="movie-meta">
                                    <span><strong>导演：</strong>${movie.director}</span>
                                    <span><strong>主演：</strong>${movie.actors.join(', ')}</span>
                                    <span><strong>类型：</strong>${movieCategories}</span>
                                </div>
                                <div class="movie-meta">
                                    <span><strong>上映日期：</strong>${movie.release_date}</span>
                                    <span><strong>时长：</strong>${movie.duration} 分钟</span>
                                    <span><strong>评分：</strong><span class="movie-rating">★ ${movie.rating}</span></span>
                                </div>
                                <div class="movie-description">
                                    <h4>剧情简介</h4>
                                    <p>${movie.description}</p>
                                </div>
                                <div class="mt-4">
                                    <button class="btn btn-primary btn-lg mr-3">播放电影</button>
                                    <button class="btn btn-secondary btn-lg">添加到收藏</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Failed to load movie detail:', error);
    }
}

// 初始化电影详情页
async function initMovieDetail() {
    await displayMovieDetail();
    // 可以添加更多电影详情页的初始化逻辑
}

// 检查登录状态
function checkLoginStatus() {
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    const userMenu = document.querySelector('.user-menu');
    
    if (Auth.isLoggedIn()) {
        // 用户已登录
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'block';
        
        // 更新用户信息
        const user = Auth.getCurrentUser();
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = user.username;
        }
    } else {
        // 用户未登录
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'none';
    }
    
    // 登出功能
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Auth.logout();
            window.location.reload();
        });
    }
}