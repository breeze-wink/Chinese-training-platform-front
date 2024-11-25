<template>
    <el-row :gutter="10">
        <!-- 分类下拉框 -->
        <el-col :span="12">
            <el-form-item label="所属分类" class="form-item-custom">
                <el-select
                        v-model="selectedCategory"
                        placeholder="选择分类"
                        @change="handleCategoryChange"
                        class="custom-select"
                >
                    <el-option
                            v-for="(category, index) in categories"
                            :key="index"
                            :label="category"
                            :value="category"
                    ></el-option>
                </el-select>
            </el-form-item>
        </el-col>

        <!-- 知识点下拉框 -->
        <el-col :span="12">
            <el-form-item label="知识点" class="form-item-custom">
                <el-select v-model="selectedPointName" placeholder="选择知识点" :disabled="!selectedCategory"  class="custom-select">
                    <el-option
                            v-for="(point, index) in filteredPoints"
                            :key="index"
                            :label="point"
                            :value="point"
                    ></el-option>
                </el-select>
            </el-form-item>
        </el-col>
    </el-row>
</template>

<script setup>
import {computed, ref} from 'vue';
import axios from 'axios';
import {useStore} from "vuex";

const selectedCategory = ref(null); // 当前选择的分类
const selectedPointName = ref(null); // 当前选择的知识点名称
const categories = ref([]); // 所有分类
const filteredPoints = ref([]); // 当前分类下的知识点列表
const knowledgePoints = ref([]); // 知识点数据
//从全局中ID信息
const store = useStore();
const teacherId = computed(() => store.state.user.id);

// 初始化知识点数据
const fetchKnowledgePoints = async () => {
    try {

        const response = await axios.get(`/api/teacher/${teacherId.value}/list-knowledge`);
        if (response.status === 200 && response.data) {
            knowledgePoints.value = response.data.data || [];
            categories.value = [...new Set(knowledgePoints.value.map((point) => point.category))];
        } else {
            console.error('获取知识点失败：', response.data.message);
        }
    } catch (error) {
        console.error('获取知识点失败：', error.message);
    }
};

// 分类变化时更新知识点列表
const handleCategoryChange = () => {
    filteredPoints.value = knowledgePoints.value
            .filter((point) => point.category === selectedCategory.value)
            .map((point) => point.pointName);
    selectedPointName.value = null; // 清空知识点选择
};

// 暴露数据供父组件使用
defineExpose({
    selectedCategory,
    selectedPointName,
});

// 初始加载知识点
fetchKnowledgePoints();
</script>

<style scoped>
.form-item-custom {
    margin-bottom: 20px; /* 控制表单项之间的间距 */
}

/* 自定义下拉框样式 */
.custom-select {
    width: 250px; /* 控制下拉框的宽度 */
}
</style>
