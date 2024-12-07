<template>

    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />
        <div class="main-container">
            <div class="content">




            </div>
            <div class="content right">
                <div class="right-content top"></div>
                <div class="right-content bottom"></div>
            </div>

        </div>
    </div>
</template>

<script setup>

import Header from "@/components/Header.vue";
</script>

<style scoped>

.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.main-container {
    display: flex;
    flex: 1;


    margin-right: 100px;
    margin-left: 100px;

}
.content{
    display: flex;
    flex-direction: column; /* 让内容和页脚垂直排列 */

    background-color: #2228ad;
    width: 75%;


    padding: 0;
    margin-right: 20px;


}
.right {
    display: flex;
    flex-direction: column; /* 让右侧内容区域的子项垂直排列 */
    flex: 1; /* right 占据剩余空间 */
}
.right-content {
    display: flex;
    flex-direction: column;
    flex: 1; /* 让右侧内容区的每个子项占据空间 */

}

.top {
    background-color: #ffcc99; /* 上部分的背景色 */
    flex: 4; /* 占 30% 的高度 */
}

.bottom {

    background-color: #ccffcc; /* 下部分的背景色 */
    flex: 7; /* 占 70% 的高度 */
}
</style>