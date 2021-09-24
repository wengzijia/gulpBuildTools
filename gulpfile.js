let { src, pipe, dest, watch,parallel,series} = require('gulp')
let sass = require('gulp-sass')(require('sass')); // 编译成css
let cssmin = require('gulp-cssmin'); // css压缩
let rename = require('gulp-rename'); // 重命名
const autoprefixer = require('gulp-autoprefixer'); // 添加浏览器厂商前缀
const concat = require('gulp-concat'); // 合并js或css
const uglify = require('gulp-uglify'); // 压缩js
const babel = require('gulp-babel'); // es6转es5
const gulp = require('gulp');
const htmlmin = require("gulp-htmlmin") // html压缩
const browserSync = require('browser-sync'); // 服务器实现热更新
const del = require('del'); // 删除文件夹和文件


// 清除构建目录dist
function clean(){
  return del(['./dist/']);
}

// 实现将scss->css->合并css->压缩->重命名->dist/css
function scss() {
  return src('./src/sass/*.scss')
    .pipe(sass()) // 编译成css
    .pipe(concat('all.css'))  // 合并css
    .pipe(autoprefixer()) // 添加浏览器厂商前缀,这样写会自动去.browserslistrc这个文件寻找，不会出现警告
    .pipe(cssmin()) // 压缩css
    .pipe(rename({
      suffix: ".min"
    }))  // 重命名
    .pipe(dest('./dist/css/'))  // 输出目录
    .pipe(browserSync.stream())   //  实时把修改后的结果同步给浏览器
}
exports.scss = scss


// 合并js
function js() {
  return src('./src/js/*js')
    .pipe(concat('all.min.js'))
    .pipe(babel({
        presets: ['@babel/preset-env']
      }))
    .pipe(uglify())  // 压缩js
    .pipe(dest('./dist/js/'))
    .pipe(browserSync.stream())  //  实时把修改后的结果同步给浏览器
}

// ./src/*.html压缩后复制到dist/*.html
function html() {
  return src('./src/index.html')
    // 压缩html
    .pipe(htmlmin({ collapseWhitespace: true }))    // 压缩空白字符
    .pipe(dest('./dist/'))
}

exports.html = html


// 监听scss、js、html文件的改变，自动触发js、css、html任务
function Monitor() {
  // 启动一个服务器，
  browserSync.init({
    // 指定一个网站根目录(/代表dist目录)
    server: "./dist/"
  })
  // 并监听文件的改变自动执行相应的任务
  watch('./src/sass/*.scss', scss); // 热加载,更新
  watch('./src/js/*.js', js); // 热加载，更新
  watch('./src/index.html', html).on('change', browserSync.reload) // 页面刷新
}

exports.Monitor = Monitor

// 开发阶段(并行执行服务器 html scss js)
exports.exploit = parallel(html, scss,js,Monitor)


// 部署阶段(串行执行把dist目录删除了, 然后并行执行(html,js,scss))
exports.deploy = series(clean, parallel(html,js,scss))

