
<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />


            <!-- 内容区 -->
            <div class="content">
            <div class="up-content">
                <h2>手动组卷</h2>
                <div class ="setting-group">
                    <div class="cascade-group">
                        <span>知识点:</span>
                        <el-cascader :options="options" :props="props1"
                                     v-model="selectedKnowledge" clearable @change="handleChange" />
                    </div>
                    <div class="difficulty-selection">
                        <span>难度：</span>
                        <button
                                class="difficulty-button"
                                :class="{ 'is-selected': selectedDifficulty === '全部' }"
                                @click="selectedDifficulty = '全部'">
                            全部
                        </button>
                        <button
                                class="difficulty-button"
                                :class="{ 'is-selected': selectedDifficulty === '容易' }"
                                @click="selectedDifficulty = '容易'">
                            容易
                        </button>
                        <button
                                class="difficulty-button"
                                :class="{ 'is-selected': selectedDifficulty === '普通' }"
                                @click="selectedDifficulty = '普通'">
                            普通
                        </button>
                        <button
                                class="difficulty-button"
                                :class="{ 'is-selected': selectedDifficulty === '困难' }"
                                @click="selectedDifficulty = '困难'">
                            困难
                        </button>
                    </div>

                    <!--类型选择-->
                    <div class="type-selection">
                        <span>题型：</span>
                        <button
                                class="type-button"
                                :class="{ 'is-selected': selectedType === '全部' }"
                                @click="selectedType = '全部'">
                            全部
                        </button>
                        <button
                                class="type-button"
                                :class="{ 'is-selected': selectedType === '选择' }"
                                @click="selectedType = '选择'">
                            选择
                        </button>
                        <button
                                class="type-button"
                                :class="{ 'is-selected': selectedType === '填空' }"
                                @click="selectedType = '填空'">
                            填空
                        </button>
                        <button
                                class="type-button"
                                :class="{ 'is-selected': selectedType === '问答' }"
                                @click="selectedType = '问答'">
                            问答
                        </button>
                        <button
                                class="type-button"
                                :class="{ 'is-selected': selectedType === '作文' }"
                                @click="selectedType = '作文'">
                            作文
                        </button>
                    </div>
                </div>

            </div>
                <!-- 新增的块 -->
                <div class="footer-controls">
                    <div class="left-controls">
                        <button
                                v-for="(label, value) in buttonOptions"
                                :key="value"
                                class="control-button"
                                :class="{ 'is-selected': selectedButton === value }"
                                @click="toggleSelectionStatus(value)">
                            {{ label }}
                        </button>
                        <div class="sort-control">
                            <span class="sort-text">难度排序</span>
                            <button @click="toggleSortOrder" class="sort-button">
                                <el-icon :class="sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'">
                                    <SortUp v-if="sortOrder === 'asc'" />
                                    <SortDown v-else />
                                </el-icon>
                            </button>
                        </div>
                        <div class="search-box">
                            <input type="text" v-model="searchKeyword" placeholder="从结果中搜索" />
                            <el-icon class="search-icon">
                                <Search />
                            </el-icon>

                        </div>
                    </div>
                    <div class="right-controls">
                        <span>总计数 {{ totalQuestions }} 道题目</span>
                    </div>
                </div>






            </div>





        </div>
    </div>

</template>



<script setup>

import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import {computed, onMounted, ref} from "vue";
import axios from "axios";
import {useStore} from "vuex";
import {SortDown, SortUp} from "@element-plus/icons-vue";

const selectedDifficulty = ref('全部'); // 默认选中全部
const selectedType = ref('全部'); // 默认选中全部
//从全局中ID信息
const store = useStore();
const teacherId = computed(() => store.state.user.id);
const props1 = {
    checkStrictly: true,
    value: 'value',   // 设置级联选择器的值字段
    label: 'label',  // 设置级联选择器的标签字段
    children: 'children'  // 设置子级字段名
};


// ***************************************************************************
// 级联器：从此开始
const selectedKnowledge = ref([]);
const options = ref([]);  // 存储级联选择器的选项

const fetchKnowledgePoints = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/list-knowledge-point`);
        if (response.status === 200 && response.data) {
            console.log(response.data);
            formatOptions(response.data.knowledgePoints);

        } else {
            console.error('获取知识点失败：', response.data.message);
        }
    } catch (error) {
        console.error('获取知识点失败：', error.message);
    }
};

// 格式化 API 数据为 el-cascade 所需的格式
const formatOptions = (knowledgePoints) => {
    options.value = Object.keys(knowledgePoints).map(category => ({
        value: category,
        label: category,
        children: knowledgePoints[category].map(point => ({
            value: point.id,
            label: point.name
        }))
    }));
};

// 处理选择变化
const handleChange = (value) => {
    console.log('选中的值:', value);  // 打印选择的知识点
};

// 级联器：从此结束
// ***************************************************************************



// ***************************************************************************
// 中间栏目：从此开始

const sortOrder = ref('asc'); // 默认为升序
const searchKeyword = ref('');
const totalQuestions = ref(100); // 示例数据
const searchQuery = ref(''); // 绑定搜索框的输入
const selectedButton = ref(''); // 默认没有按钮被选中

// 按钮选项，键为值，值为显示的文本
const buttonOptions = {
    latest: '最新上传',
    mostUsed: '最多使用',
};

const handleSearch = () => {
    console.log('搜索:', searchQuery.value);
    // 在这里添加搜索逻辑
};

// 切换选中状态的函数
const toggleSelectionStatus = (value) => {
    selectedButton.value = selectedButton.value === value ? '' : value;
};
// 切换排序顺序
const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

// 执行搜索
const search = () => {
    console.log(`搜索关键词: ${searchKeyword.value}`);
    // 执行搜索逻辑
};


// 中间栏目：从此结束
// ***************************************************************************



// 组件挂载时获取数据
onMounted(() => {
    fetchKnowledgePoints();
});


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
    background-color: #f0f0f0;
}
.content{
    display: flex;
    flex-direction: column; /* 让内容和页脚垂直排列 */
    flex: 1; /* 确保这个区域占据剩余的空间 */

    max-width: 1040px; /* 最大宽度为 1000px */
    padding: 0px;
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */

}
.up-content {

    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #ffffff;
    height: 190px;

}
.footer-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 5px;

    background-color: #ffffff;

}

.left-controls {
    display: flex;
    align-items: center;
    gap: 20px;
}

.control-button {
    padding: 6px 10px;
    border: transparent;
    border-radius: 8px;
    background-color: #fff;
    color: #000;
    cursor: pointer;
    transition: all 0.3s ease;
}
.control-button.is-selected {
    background-color: #6363fb; /* 选中时的背景色 */
    color: white;              /* 选中时的文字颜色 */
}


.sort-control {
    display: flex;
    align-items: center;
    gap: 0; /* 控制“难度排序”和图标之间的间距 */
}

.sort-button {
    background: none;
    border: none;
    font-size: 15px;
    cursor: pointer;
}
.sort-text {
    font-size: 14px;
}



.search-box {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-box input {
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    width: 200px; /* 设置搜索框宽度 */
}

.search-box .search-icon {
    cursor: pointer;
    right: 30px;
    font-size: 16px;

}

.right-controls {
    text-align: right;
}

.right-controls span {

    font-size: 14px;
    margin-right: 30px;
    color: #000000;
}


.setting-group{
    margin-top: 30px;
    margin-left: 30px;
}
.cascade-group {
    display: flex;
    align-items: center; /* 垂直居中对齐 */
    margin-bottom: 10px;
}
.cascade-group span {
    margin-right: 20px; /* 与级联选择器之间的间距 */
    font-weight: bold;
}


.difficulty-selection {
    display: flex;
    align-items: center; /* 垂直居中对齐 */
    margin-bottom: 10px;
    gap: 10px; /* 设置按钮之间的间距 */
}

.difficulty-selection span {
    margin-right: 10px; /* 与单选按钮之间的间距 */
    font-weight: bold;
}

.difficulty-button {
    padding: 6px 10px;
    border: transparent;
    border-radius: 8px; /* 圆角 */
    background-color: white;
    color: #000000; /* 按钮文字颜色 */
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}


.difficulty-button.is-selected {
    background-color: #6363fb; /* 选中时的背景色 */
    border-color: transparent;     /* 选中时的边框颜色 */
    color: white;              /* 选中时的文字颜色 */
}

.type-selection {
    display: flex;
    align-items: center; /* 垂直居中对齐 */
    margin-bottom: 20px;
    gap: 10px; /* 设置按钮之间的间距 */
}
.type-selection span {
    margin-right: 10px; /* 与单选按钮之间的间距 */
    font-weight: bold;
}
.type-button {
    padding: 6px 10px;
    border: transparent;
    border-radius: 8px; /* 圆角 */
    background-color: white;
    color: #000000; /* 按钮文字颜色 */
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}
.type-button.is-selected {
    background-color: #6363fb; /* 选中时的背景色 */
    border-color: transparent;     /* 选中时的边框颜色 */
    color: white;              /* 选中时的文字颜色 */
}



.search-and-buttons {
    display: flex;
    align-items: center;
    margin-top: 20px;
}



</style>