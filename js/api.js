// 模拟API请求
const API = {
    // 获取电影列表
    async getMovies() {
        // 根据当前页面路径调整API请求路径
        const isAdminPage = window.location.pathname.includes('/admin/');
        const isDetailPage = window.location.pathname.includes('/pages/');
        let basePath = '';
        
        if (isAdminPage) {
            basePath = '../../';
        } else if (isDetailPage) {
            basePath = '../';
        }
        
        const response = await fetch(`${basePath}data/movies.json`);
        return await response.json();
    },

    // 根据ID获取电影详情
    async getMovieById(id) {
        const movies = await this.getMovies();
        return movies.find(movie => movie.id === parseInt(id));
    },

    // 获取电影分类
    async getCategories() {
        // 根据当前页面路径调整API请求路径
        const isAdminPage = window.location.pathname.includes('/admin/');
        const isDetailPage = window.location.pathname.includes('/pages/');
        let basePath = '';
        
        if (isAdminPage) {
            basePath = '../../';
        } else if (isDetailPage) {
            basePath = '../';
        }
        
        const response = await fetch(`${basePath}data/categories.json`);
        return await response.json();
    },

    // 获取用户列表
    async getUsers() {
        // 根据当前页面路径调整API请求路径
        const isAdminPage = window.location.pathname.includes('/admin/');
        const isDetailPage = window.location.pathname.includes('/pages/');
        let basePath = '';
        
        if (isAdminPage) {
            basePath = '../../';
        } else if (isDetailPage) {
            basePath = '../';
        }
        
        const response = await fetch(`${basePath}data/users.json`);
        return await response.json();
    },

    // 用户登录
    async login(email, password) {
        const users = await this.getUsers();
        return users.find(user => user.email === email && user.password === password);
    },

    // 用户注册
    async register(userData) {
        const users = await this.getUsers();
        const newUser = {
            id: users.length + 1,
            ...userData,
            created_at: new Date().toISOString()
        };
        users.push(newUser);
        // 这里只是模拟，实际应该保存到服务器
        return newUser;
    },

    // 搜索电影
    async searchMovies(keyword) {
        const movies = await this.getMovies();
        return movies.filter(movie => 
            movie.title.toLowerCase().includes(keyword.toLowerCase()) ||
            movie.director.toLowerCase().includes(keyword.toLowerCase()) ||
            movie.actors.some(actor => actor.toLowerCase().includes(keyword.toLowerCase()))
        );
    },

    // 根据分类获取电影
    async getMoviesByCategory(categoryId) {
        const movies = await this.getMovies();
        return movies.filter(movie => movie.category.includes(parseInt(categoryId)));
    }
};

// 存储和获取本地数据
const Storage = {
    // 设置本地存储
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    // 获取本地存储
    get(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    },

    // 删除本地存储
    remove(key) {
        localStorage.removeItem(key);
    },

    // 清除所有本地存储
    clear() {
        localStorage.clear();
    }
};

// 用户认证
const Auth = {
    // 检查用户是否已登录
    isLoggedIn() {
        return Storage.get('currentUser') !== null;
    },

    // 获取当前登录用户
    getCurrentUser() {
        return Storage.get('currentUser');
    },

    // 登录
    login(user) {
        Storage.set('currentUser', user);
    },

    // 登出
    logout() {
        Storage.remove('currentUser');
    },

    // 检查用户是否为管理员
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
};