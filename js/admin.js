// 后台管理脚本
document.addEventListener('DOMContentLoaded', function() {
    // 初始化后台导航
    initAdminNavigation();
    
    // 初始化电影管理
    initMovieManagement();
    
    // 初始化统计数据
    initStats();
    
    // 初始化模态框
    initModals();
});

// 初始化后台导航
function initAdminNavigation() {
    // 侧边栏折叠功能（移动端）
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
    
    // 当前页面导航高亮
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.admin-sidebar a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            (currentPage.includes('admin/') && link.getAttribute('href') === 'index.html' && currentPage === '/admin/')) {
            link.classList.add('active');
        }
    });
}

// 初始化统计数据
async function initStats() {
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        try {
            const movies = await API.getMovies();
            const users = await API.getUsers();
            const categories = await API.getCategories();
            
            statsContainer.innerHTML = `
                <div class="row">
                    <div class="col-lg-3 col-md-6">
                        <div class="stats-card">
                            <h3>电影总数</h3>
                            <div class="stats-number">${movies.length}</div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="stats-card">
                            <h3>用户总数</h3>
                            <div class="stats-number">${users.length}</div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="stats-card">
                            <h3>分类总数</h3>
                            <div class="stats-number">${categories.length}</div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="stats-card">
                            <h3>今日访问</h3>
                            <div class="stats-number">${Math.floor(Math.random() * 1000)}</div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }
}

// 初始化电影管理
async function initMovieManagement() {
    const movieTable = document.querySelector('#movieTable tbody');
    if (movieTable) {
        try {
            const movies = await API.getMovies();
            const categories = await API.getCategories();
            
            displayMovieTable(movies, categories, movieTable);
        } catch (error) {
            console.error('Failed to load movies for management:', error);
        }
    }
    
    // 搜索电影
    const searchInput = document.querySelector('#movieSearch');
    const movieTableBody = document.querySelector('#movieTable tbody');
    
    if (searchInput && movieTableBody) {
        searchInput.addEventListener('input', async function() {
            const keyword = this.value.trim();
            const movies = await API.searchMovies(keyword);
            const categories = await API.getCategories();
            displayMovieTable(movies, categories, movieTableBody);
        });
    }
    
    // 新增电影按钮
    const addMovieBtn = document.querySelector('#addMovieBtn');
    const movieModal = new bootstrap.Modal(document.getElementById('movieModal'));
    
    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', function() {
            // 重置表单
            document.querySelector('#movieForm').reset();
            document.querySelector('#movieId').value = '';
            document.querySelector('.modal-title').textContent = '新增电影';
            movieModal.show();
        });
    }
    
    // 表单提交
    const movieForm = document.querySelector('#movieForm');
    if (movieForm) {
        movieForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const movieData = {
                id: formData.get('id') ? parseInt(formData.get('id')) : null,
                title: formData.get('title'),
                director: formData.get('director'),
                actors: formData.get('actors').split(',').map(actor => actor.trim()),
                category: formData.get('category').split(',').map(cat => parseInt(cat.trim())),
                release_date: formData.get('release_date'),
                duration: parseInt(formData.get('duration')),
                rating: parseFloat(formData.get('rating')),
                description: formData.get('description'),
                poster: formData.get('poster'),
                banner: formData.get('banner')
            };
            
            try {
                // 这里只是模拟，实际应该调用API保存到服务器
                const movies = await API.getMovies();
                
                if (movieData.id) {
                    // 编辑电影
                    const index = movies.findIndex(m => m.id === movieData.id);
                    if (index !== -1) {
                        movies[index] = movieData;
                    }
                } else {
                    // 新增电影
                    movieData.id = movies.length + 1;
                    movieData.created_at = new Date().toISOString();
                    movies.push(movieData);
                }
                
                // 重新加载电影列表
                const categories = await API.getCategories();
                displayMovieTable(movies, categories, document.querySelector('#movieTable tbody'));
                
                // 关闭模态框
                movieModal.hide();
                
                // 显示成功提示
                showAlert('电影信息保存成功！', 'success');
            } catch (error) {
                console.error('Failed to save movie:', error);
                showAlert('保存失败，请稍后重试', 'error');
            }
        });
    }
}

// 显示电影表格
function displayMovieTable(movies, categories, tableBody) {
    tableBody.innerHTML = '';
    
    movies.forEach(movie => {
        const row = document.createElement('tr');
        
        const movieCategories = movie.category.map(catId => {
            const category = categories.find(c => c.id === catId);
            return category ? category.name : '';
        }).filter(Boolean).join(', ');
        
        // 修复图片路径
        const posterPath = movie.poster.startsWith('/') ? movie.poster : `/${movie.poster}`;
        
        row.innerHTML = `
            <td>${movie.id}</td>
            <td><img src="${posterPath}" alt="${movie.title}" style="width: 50px; height: 75px; object-fit: cover;"></td>
            <td>${movie.title}</td>
            <td>${movie.director}</td>
            <td>${movie.actors.join(', ')}</td>
            <td>${movieCategories}</td>
            <td>${movie.release_date}</td>
            <td>${movie.duration} 分钟</td>
            <td>★ ${movie.rating}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-movie" data-id="${movie.id}">编辑</button>
                <button class="btn btn-sm btn-danger delete-movie" data-id="${movie.id}">删除</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 添加编辑和删除事件监听
    addMovieActionListeners();
}

// 添加电影操作事件监听
function addMovieActionListeners() {
    const editButtons = document.querySelectorAll('.edit-movie');
    const deleteButtons = document.querySelectorAll('.delete-movie');
    const movieModal = new bootstrap.Modal(document.getElementById('movieModal'));
    
    // 编辑按钮事件
    editButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const movieId = parseInt(this.dataset.id);
            const movie = await API.getMovieById(movieId);
            
            if (movie) {
                // 填充表单
                document.querySelector('#movieId').value = movie.id;
                document.querySelector('#title').value = movie.title;
                document.querySelector('#director').value = movie.director;
                document.querySelector('#actors').value = movie.actors.join(', ');
                document.querySelector('#category').value = movie.category.join(', ');
                document.querySelector('#release_date').value = movie.release_date;
                document.querySelector('#duration').value = movie.duration;
                document.querySelector('#rating').value = movie.rating;
                document.querySelector('#description').value = movie.description;
                document.querySelector('#poster').value = movie.poster;
                document.querySelector('#banner').value = movie.banner;
                
                document.querySelector('.modal-title').textContent = '编辑电影';
                movieModal.show();
            }
        });
    });
    
    // 删除按钮事件
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const movieId = parseInt(this.dataset.id);
            
            if (confirm('确定要删除这部电影吗？')) {
                try {
                    // 这里只是模拟，实际应该调用API删除
                    const movies = await API.getMovies();
                    const updatedMovies = movies.filter(movie => movie.id !== movieId);
                    const categories = await API.getCategories();
                    displayMovieTable(updatedMovies, categories, document.querySelector('#movieTable tbody'));
                    
                    showAlert('电影删除成功！', 'success');
                } catch (error) {
                    console.error('Failed to delete movie:', error);
                    showAlert('删除失败，请稍后重试', 'error');
                }
            }
        });
    });
}

// 初始化模态框
function initModals() {
    // 电影模态框
    const movieModal = document.getElementById('movieModal');
    if (movieModal) {
        movieModal.addEventListener('hidden.bs.modal', function() {
            // 重置表单
            document.querySelector('#movieForm').reset();
        });
    }
}

// 显示提示信息
function showAlert(message, type = 'success') {
    // 创建提示元素
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-20 end-0 z-50`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到页面
    document.body.appendChild(alertDiv);
    
    // 3秒后自动关闭
    setTimeout(() => {
        const bootstrapAlert = new bootstrap.Alert(alertDiv);
        bootstrapAlert.close();
    }, 3000);
}

// 初始化分类选择器
async function initCategorySelect() {
    const categorySelect = document.querySelector('#categorySelect');
    if (categorySelect) {
        try {
            const categories = await API.getCategories();
            
            // 清空现有选项
            categorySelect.innerHTML = '';
            
            // 添加默认选项
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '全部分类';
            categorySelect.appendChild(defaultOption);
            
            // 添加分类选项
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load categories for select:', error);
        }
    }
}

// 初始化分页
function initPagination(totalItems, itemsPerPage = 10) {
    const paginationContainer = document.querySelector('.pagination-container');
    if (paginationContainer) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // 简单分页实现
        let paginationHTML = '<ul class="pagination justify-content-center">';
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === 1 ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        paginationHTML += '</ul>';
        paginationContainer.innerHTML = paginationHTML;
        
        // 分页点击事件
        paginationContainer.addEventListener('click', function(e) {
            e.preventDefault();
            if (e.target.classList.contains('page-link')) {
                const page = parseInt(e.target.dataset.page);
                // 切换活跃状态
                document.querySelectorAll('.page-item').forEach(item => item.classList.remove('active'));
                e.target.closest('.page-item').classList.add('active');
                
                // 这里可以添加分页逻辑
                console.log('切换到第', page, '页');
            }
        });
    }
}

// 导出数据
function exportData(data, filename, type = 'json') {
    let dataStr;
    let dataUri;
    
    if (type === 'json') {
        dataStr = JSON.stringify(data, null, 2);
        dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    } else if (type === 'csv') {
        // CSV导出逻辑
        dataStr = convertToCSV(data);
        dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(dataStr);
    }
    
    const exportFileDefaultName = `${filename}.${type}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// 转换为CSV格式
function convertToCSV(objArray) {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    
    // 添加表头
    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';
    
    // 添加数据行
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ',';
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    
    return str;
}

// 导入数据
function importData(inputId, callback) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        callback(data);
                    } catch (error) {
                        console.error('Failed to parse imported data:', error);
                        showAlert('导入失败，文件格式不正确', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    }
}