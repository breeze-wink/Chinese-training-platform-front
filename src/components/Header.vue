<template>
    <header class="header">
        <!-- 网站标题，靠左 -->
        <div class="title">
            <span>初中语文学科核心素养训练与提升平台</span>
        </div>

        <!-- 图标部分，靠右 -->
        <div class="icons">
            <!-- 消息图标 -->
            <el-icon>
                <Message />
            </el-icon>

            <!-- 用户图标 -->
            <el-icon>
                <User />
            </el-icon>
        </div>
    </header>
</template>

<script setup>
// 导入需要的图标组件
import { ElIcon } from 'element-plus';
import { Message, User } from '@element-plus/icons-vue';
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between; /* 使文字和图标分开，并分别靠左和靠右 */
    align-items: center;
    padding: 10px 20px;

    background-color: #24292e; /* 深灰色背景，借鉴 GitHub 顶部导航栏的颜色 */
    margin-bottom: 30px;
}

.title {
    font-size: 24px;
    font-weight: bold;
    text-align: left; /* 确保文字靠左 */
    color: #fff; /* 文本改为浅色 */

}

.icons {
    display: flex;
    gap: 15px;
    justify-content: flex-end; /* 图标靠右 */
}

.el-icon {
    font-size: 24px;
    cursor: pointer;
    color: #fff; /* 图标改为浅色 */
}
</style>


