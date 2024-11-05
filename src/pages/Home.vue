<template>
    <div class="common-layout">
        <el-container class="common-layout">
            <el-header class="fixed-header">
                <div class="header-title">初中语文综合素养提升平台</div>
                <div class="header-buttons">
                    <el-button color="#626aef" :dark="isDark">登录</el-button>
                    <el-button color="#626aef" :dark="isDark" plain>注册</el-button>
                </div>
            </el-header>

            <el-main>
                <el-scrollbar>


                    <el-carousel height="400px"><!--  走马灯部分-->
                        <el-carousel-item v-for="item in 4" :key="item">
                            <img class="carousel-image" src="../static/1.jpg" v-if="item === 1" >
                            <img class="carousel-image" src="../static/2.jpg" v-if="item === 2">
                            <img class="carousel-image" src="../static/1.jpg" v-if="item === 3">
                            <img class="carousel-image" src="../static/2.jpg" v-if="item === 4">
                        </el-carousel-item>
                    </el-carousel>
                    <!-- 内容 -->
                </el-scrollbar>
            </el-main>
        </el-container>
    </div>
</template>

<script>
export default {
    name: "Home"
}
</script>

<style scoped>
.common-layout .el-container {
    width: 100%;
}
.common-layout .el-header.fixed-header {
    position: fixed;
    top: 0;
    width: 100%; /* 确保header宽度与容器相同 */
    background-color: var(--el-color-primary-light-7);
    color: var(--el-text-color-primary);
    z-index: 1000;
    display: flex;
    justify-content: space-between;;
    align-items: center;
    padding: 0 80px; /* 根据需要调整padding */
}
.header-content {
    display: flex;
    justify-content: flex-end; /* 按钮靠右 */
    align-items: center;
}
.header-title {
    font-size: 16px; /* 根据需要调整字体大小 */
    font-weight: bold; /* 使文字加粗 */
}
.header-buttons {
    display: flex;
    gap: 10px; /* 根据需要调整按钮之间的间距 */
}
.common-layout .el-main {
    padding-top: 60px; /* 为header的高度留出空间 */
    width: 100%;
    background-color: #ffffff;
    height: 2600px;
}
.common-layout .el-scrollbar {
    width: 100%; /* 确保scrollbar宽度与main相同 */
}
.common-layout .el-container {
    width: 100%;
}
.carousel-image {
    width: 100%; /* 使图片宽度填满carousel-item */
    height: 100%; /* 使图片高度填满carousel-item */
    object-fit: fill; /* 确保图片按比例填充 */
}

</style>