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
                <el-select
                        v-model="selectedPointId"
                        placeholder="选择知识点"
                        :disabled="!selectedCategory"
                        class="custom-select"
                >
                    <el-option
                            v-for="(point, index) in filteredPoints"
                            :key="point.id"
                            :label="point.name"
                            :value="point.id"
                    ></el-option>
                </el-select>
            </el-form-item>
        </el-col>
    </el-row>
</template>
<script setup>
import {computed, ref, watch} from 'vue';
import axios from 'axios';
import { useStore } from "vuex";

const selectedCategory = ref(null); // 当前选择的分类名称
const selectedPointId = ref(null); // 当前选择的知识点 ID
const selectedPointName = ref(null); // 当前选择的知识点名称

const categories = ref([]); // 所有分类
const filteredPoints = ref([]); // 当前分类下的知识点列表
const knowledgePoints = ref({}); // 知识点数据（分类为键，知识点数组为值）

// 从全局中获取教师 ID
const store = useStore();
const teacherId = computed(() => store.state.user.id);

// 初始化知识点数据
const fetchKnowledgePoints = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/list-knowledge-point`);
        if (response.status === 200 && response.data) {
            const responseData = response.data.knowledgePoints || {};
            knowledgePoints.value = responseData;
            categories.value = Object.keys(responseData); // 提取所有分类
        } else {
            console.error('获取知识点失败：', response.data.message);
        }
    } catch (error) {
        console.error('获取知识点失败：', error.message);
    }
};

// 分类变化时更新知识点列表
const handleCategoryChange = () => {
    filteredPoints.value = knowledgePoints.value[selectedCategory.value] || [];
    selectedPointId.value = null; // 清空知识点选择
    selectedPointName.value = null; // 清空知识点名称
};

// 监听知识点选择，更新名称
const updateSelectedPointName = () => {
    const selectedPoint = filteredPoints.value.find((point) => point.id === selectedPointId.value);
    selectedPointName.value = selectedPoint ? selectedPoint.name : null;
};

// 暴露数据供父组件使用
defineExpose({
    selectedCategory, // 分类名称
    selectedPointId, // 知识点 ID
    selectedPointName, // 知识点名称
});

// 监听知识点 ID 的变化
watch(selectedPointId, updateSelectedPointName);

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


