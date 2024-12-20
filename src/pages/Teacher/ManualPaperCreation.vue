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
                            <el-cascader
                                    :options="options"
                                    :props="props1"
                                    v-model="selectedKnowledge"
                                    clearable @change="handleChange"
                                    placeholder="输入知识点"/>
                        </div>
                        <div class="difficulty-selection">
                            <span>正确率：</span>
                            <button
                                    class="difficulty-button"
                                    :class="{ 'is-selected': selectedDifficulty === '' }"
                                    @click="selectedDifficulty = '';fetchQuestions()">
                                全部
                            </button>
                            <button
                                    class="difficulty-button"
                                    :class="{ 'is-selected': selectedDifficulty === '容易' }"
                                    @click="selectedDifficulty = '容易';fetchQuestions()">
                                容易
                            </button>
                            <button
                                    class="difficulty-button"
                                    :class="{ 'is-selected': selectedDifficulty === '普通' }"
                                    @click="selectedDifficulty = '普通';fetchQuestions()">
                                普通
                            </button>
                            <button
                                    class="difficulty-button"
                                    :class="{ 'is-selected': selectedDifficulty === '困难' }"
                                    @click="selectedDifficulty = '困难';fetchQuestions()">
                                困难
                            </button>
                        </div>

                        <!--类型选择-->
                        <div class="type-selection">
                            <span>题型：</span>
                            <button
                                    class="type-button"
                                    :class="{ 'is-selected': selectedType === '' }"
                                    @click="selectedType = '';fetchQuestions()">
                                全部
                            </button>
                            <button
                                    class="type-button"
                                    :class="{ 'is-selected': selectedType === '选择' }"
                                    @click="selectedType = '选择';fetchQuestions()">
                                选择
                            </button>
                            <button
                                    class="type-button"
                                    :class="{ 'is-selected': selectedType === '填空' }"
                                    @click="selectedType = '填空';fetchQuestions()">
                                填空
                            </button>
                            <button
                                    class="type-button"
                                    :class="{ 'is-selected': selectedType === '问答' }"
                                    @click="selectedType = '问答';fetchQuestions()">
                                问答
                            </button>
                            <button
                                    class="type-button"
                                    :class="{ 'is-selected': selectedType === '作文' }"
                                    @click="selectedType = '作文';fetchQuestions()">
                                作文
                            </button>
                        </div>
                    </div>

                </div>
                <!-- 中间栏目 -->
                <div class="footer-controls">
                    <div class="left-controls">
                        <button
                                v-for="(label, value) in buttonOptions"
                                :key="value"
                                class="control-button"
                                :class="{ 'is-selected': selectedButton === value }"
                                @click="toggleSelectionStatus(value);fetchQuestions()">
                            {{ label }}
                        </button>
                        <div class="sort-control">
                            <span class="sort-text">正确率排序</span>
                            <button @click="toggleSortOrder();fetchQuestions()" class="sort-button">
                                <el-icon :class="sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'">
                                    <SortUp v-if="sortOrder === 'asc'" />
                                    <SortDown v-else />
                                </el-icon>
                            </button>
                        </div>
                        <div class="search-box">
                            <input type="text" v-model="searchKeyword" placeholder="从结果中搜索" />
                            <el-icon class="search-icon" @click="fetchQuestions">
                                <Search />
                            </el-icon>

                        </div>
                    </div>
                    <div class="right-controls">
                        <span>总计数 {{ totalCount }} 道题目</span>
                    </div>
                </div>

                <!-- 题目卡片显示区域 -->
                <div class="question-cards">
                    <!-- Big Questions -->
                    <div v-if="bigQuestions.length > 0">
                        <div v-for="(bigQuestion, index) in bigQuestions" :key="index" class="question-card">
                            <div class="question-header">
                                <!-- 引用次数和难度 -->
                                <span class="referenced-count">引用次数: {{ bigQuestion.referencedCount }}</span>
                                <span class="difficulty">正确率: {{ formatDifficulty(bigQuestion.difficulty) }}</span>
                            </div>
                            <div class="question-body">
                                <strong v-html="bigQuestion.body"></strong>
                            </div>
                            <div class="sub-questions">
                                <div v-for="(sub, idx) in bigQuestion.subQuestion" :key="idx" class="sub-question">
                                    <p>{{ idx + 1 }}. {{ sub.question }}</p>
                                    <!-- 显示选项 -->
                                    <div v-if="sub.options && sub.options.length > 0">
                                        <ul class="options-list">
                                            <li v-for="(option, i) in sub.options" :key="i">{{ String.fromCharCode(65 + i) }}. {{ option }}</li>
                                        </ul>
                                    </div>

                                    <!-- 解析部分 -->
                                    <div v-if="bigQuestion.showExplanation" class="explanation">
                                        <p><strong>涉及知识点：</strong>{{ sub.knowledge }}</p>
                                        <p><strong>答案：</strong>{{ sub.answer }}</p>
                                        <p><strong>解析：</strong>{{ sub.explanation }}</p>

                                    </div>



                                </div>
                            </div>
                            <div class="card-buttons">
                                <button @click="toggleExplanation(bigQuestion)">
                                    {{ bigQuestion.showExplanation ? '收起解析' : '查看解析' }}
                                </button>
                                <button @click="addToBasket(bigQuestion, true)" class="add-button">添加</button>
                            </div>
                        </div>
                    </div>

                    <!-- Single Questions -->
                    <div v-if="questions.length > 0">
                        <div v-for="(question, index) in questions" :key="index" class="question-card">
                            <div class="question-header">
                                <!-- 引用次数和难度 -->
                                <span class="referenced-count">引用次数: {{ question.referencedCount }}</span>
                                <span class="difficulty">正确率: {{ formatDifficulty(question.difficulty) }}</span>
                            </div>
                            <div class="question-body">
                                <strong v-html="question.body"></strong>
                            </div>
                            <div class="question">
                              <p v-if="!question.body" v-html="question.question"></p>
                              <p v-else>{{ question.question }}</p>
                                <!-- 显示选项 -->
                                <div v-if="question.options && question.options.length > 0">
                                    <ul class="options-list">
                                        <li v-for="(option, i) in question.options" :key="i">{{ String.fromCharCode(65 + i) }}. {{ option }}</li>
                                    </ul>
                                </div>

                                <!-- 解析部分 -->
                                <div v-if="question.showExplanation" class="explanation">
                                    <p><strong>涉及知识点：</strong>{{ question.knowledge }}</p>
                                    <p><strong>答案：</strong>{{ question.answer }}</p>
                                    <p><strong>解析：</strong>{{ question.explanation }}</p>
                                </div>
                            </div>
                            <div class="card-buttons">
                                <button @click="toggleExplanation(question)">
                                    {{ question.showExplanation ? '收起解析' : '查看解析' }}
                                </button>
                                <button @click="addToBasket(question)" class="add-button">添加</button>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- 分页控件 -->
                <div v-if="totalPages > 1" class="pagination">
                    <el-pagination
                            :current-page="currentPage"
                            :page-size="pageSize"
                            :total="totalCount"
                            @current-change="handlePageChange"
                            layout="prev, pager, next, jumper"
                    />
                </div>

            </div>
            <!-- 固钉试题篮 -->
            <div class="fixed-question-basket" @click="toggleDrawer">
                <span>试题篮: {{  store.getters.getBasketCount }}</span>
            </div>

            <!-- 抽屉 -->
            <el-drawer
                    v-model="drawerVisible"
                    direction="rtl"
                    size="25%"
                    :before-close="handleCloseDrawer"
                    title="试题篮"
                    style="max-width: 300px;"
            >
                <div class="drawer-content">
                    <p>试题总量：{{ store.getters.getBasketCount }}</p>
                    <div class="button-container">
                    <button
                            class="clear-button"
                            @mouseover="hoverClearButton = true"
                            @mouseleave="hoverClearButton = false"
                            @click="clearQuestions"
                            :style="{ backgroundColor: hoverClearButton ? '#409EFF' : '' }"
                    >
                        清空试题
                    </button>
                    <button class="preview-button" @click="previewFullPaper">
                        预览全卷
                    </button>
                    </div>
                </div>
            </el-drawer>

            <!-- 返回顶部按钮 -->
            <el-backtop :right="50" :bottom="80" />


        </div>

        <!-- 加载提示 -->
        <div v-if="isLoading" class="loading-modal">
            <div class="modal-content">
                <p v-if="isLoading">正在加载题目，请稍候...</p>
                <div class="spinner"></div>
            </div>
        </div>

        <!-- 遮罩层 -->
        <div v-if="isLoading" class="overlay"></div>
    </div>

</template>



<script setup>

import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import {computed, onMounted, ref} from "vue";
import axios from "axios";
import {useStore} from "vuex";

import { ElNotification } from 'element-plus';

import {SortDown, SortUp} from "@element-plus/icons-vue";
const isLoading = ref(false);
const selectedDifficulty = ref(''); // 默认选中全部
const selectedType = ref(''); // 默认选中全部
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
    fetchQuestions();
};

// 级联器：从此结束
// ***************************************************************************



// ***************************************************************************
// 中间栏目：从此开始

const sortOrder = ref('asc'); // 默认为升序
const searchKeyword = ref('');

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




// ***************************************************************************
// 卡片：从此开始

const pageSize = ref(3);
// 当前页和总页码
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0); // 示例数据
// 试题数据
const bigQuestions = ref([]); // 用于存储大题（bigQuestion）数据
const questions = ref([]);   // 用于存储单题（questions）数据

// 切换解析显示
const toggleExplanation = (question) => {
        question.showExplanation = !question.showExplanation;

};
// 卡片：从此结束
// ***************************************************************************


// ***************************************************************************
// 添加：从此开始


// 添加题目到试卷篮的函数
// 添加题目到试卷篮的函数
const addToBasket = (question, isBigQuestion = false, parentId = null) => {
    // 构建一个唯一的 ID，区分大题和单题
    const questionId = isBigQuestion ? question.bodyId : question.questionId;

    // 检查是否已经存在
    const existing = store.state.basket.find(q => q.id === questionId);
    if (existing) {
        ElNotification.error({
            title: '添加失败',
            message: '该题目已在试卷篮中。',
            duration: 2000
        });
        return;
    }
    // 构建题目对象
    const basketQuestion = isBigQuestion ? {
        id: questionId,
        type: 'big',
        body: question.body,
        subQuestions: question.subQuestion.map(sub => ({
            id: sub.questionId, // 确保唯一
            question: sub.question,
            type: sub.type,
            answer: sub.answer,             // 添加答案
            explanation: sub.explanation,   // 添加解析
            options: sub.options || []      // 确保选项也被保存
        })),
        referencedCount: question.referencedCount,
        difficulty: question.difficulty
    } : {
        id: questionId,
        type: question.type,
        body: question.body,
        question: question.question,
        answer: question.answer,           // 添加答案
        explanation: question.explanation, // 添加解析
        options: question.options || [],
        referencedCount: question.referencedCount,
        difficulty: question.difficulty
    };

    // 添加到试卷篮
    store.dispatch('addQuestionToBasket', basketQuestion);
    ElNotification.success({
        title: '添加成功',
        message: '题目已成功添加到试卷篮。',
        duration: 2000
    });
};

// 添加：从此结束
// ***************************************************************************
// 控制弹窗显示
const showModal = ref(false);
// 存储弹窗中的数据
const modalData = ref({});
const viewExplanation = (bigQuestion, subQuestion) => {
    // 如果是大题，传递的是大题和子题
    if (bigQuestion) {
        modalData.value = {
            body: bigQuestion.body,
            question: subQuestion.question,
            answer: subQuestion.answer,
            knowledge: subQuestion.knowledge,
            explanation: subQuestion.explanation,
            options: subQuestion.options
        };
    } else {
        // 单题
        modalData.value = {
            body: questions.value.body,
            question: questions.value.question,
            answer: questions.value.answer,
            knowledge: questions.value.knowledge,
            explanation: questions.value.explanation,
            options: questions.value.options
        };
    }
    showModal.value = true;
};

// 关闭弹窗
const closeModal = () => {
    showModal.value = false;
};


// ***************************************************************************
// 右侧栏目：从此开始
import { useRouter } from 'vue-router';

const router = useRouter();

// 控制抽屉显示的变量
const drawerVisible = ref(false);
// 试题数量
const questionCount = ref(0);
// 控制清空按钮悬浮时的样式
const hoverClearButton = ref(false);


// 用于格式化难度为百分比（保留一位小数）
const formatDifficulty = (difficulty) => {
    if (difficulty === null || difficulty === undefined || difficulty < 0) return '?';
    return (difficulty * 100).toFixed(1) + '%';
};


const toggleDrawer = () => {
    drawerVisible.value = !drawerVisible.value;
    console.log(drawerVisible.value);
};

const handleCloseDrawer = () => {
    drawerVisible.value = false;
};

const clearQuestions = () => {
    store.dispatch('clearBasket');
};

const previewFullPaper = () => {
    // 预览全卷的逻辑
    router.push('/teacher/paper-preview');
    console.log("预览全卷");
};


// 右侧栏目：从此结束
// ***************************************************************************
// 组合请求参数
const prepareRequestData = () => {
    let requestData = {
        difficulty: selectedDifficulty.value, // 难度
        type: selectedType.value,             // 题型
        knowledgeType:'',                     //知识点大类
        knowledgeId: null,                     // 知识点ID
        search: searchKeyword.value,       // 查找内容
        sortOrder: sortOrder.value,           // 排序顺序
        mode: selectedButton.value,           // 模式
        page: currentPage.value,                              // 页码
        pageSize: pageSize.value,                         // 每页数量
    };

    // 处理知识点的选择
    if (selectedKnowledge.value.length === 1) {
        requestData.knowledgeType = selectedKnowledge.value[0];
    } else if (selectedKnowledge.value.length === 2) {
        requestData.knowledgeType = selectedKnowledge.value[0];
        requestData.knowledgeId = selectedKnowledge.value[1];
    }

    return requestData;
};
const replaceImageSrc = async (htmlContent) => {
  if (!htmlContent) return htmlContent;

  // 创建一个临时的 DOM 元素来解析 HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // 查找所有 img 标签
  const images = tempDiv.querySelectorAll('img');

  // 遍历所有 img 标签并替换 src
  const replacePromises = Array.from(images).map(async (img) => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('/uploads/content/')) {
      const imageName = src.replace('/uploads/content/', '');
      const imageUrl = `/api/uploads/images/content/${imageName}`;
      const token = store.getters.getToken; // 直接使用 store 实例访问 getters

      try {
        // 使用 Axios 获取图片数据，设置响应类型为 blob
        const response = await axios.get(imageUrl, {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          // 创建 Blob URL
          const blobUrl = URL.createObjectURL(response.data);
          img.setAttribute('src', blobUrl);
        } else {
          console.error(`获取图片失败: ${imageUrl}`);
          // 可以设置一个占位图或保留原始 src
        }
      } catch (error) {
        console.error(`获取图片失败: ${imageUrl}`, error);
        // 可以设置一个占位图或保留原始 src
      }
    }
  });

  // 等待所有图片替换完成
  await Promise.all(replacePromises);

  return tempDiv.innerHTML;
};

const fetchQuestions = async () => {
  const requestData = prepareRequestData();

  try {
    const response = await axios.post('/api/teacher/search-questions', requestData);
    console.log('发送请求的数据:', requestData);
    if (response.status === 200) {
      console.log('传回的题目数据');
      const data = response.data;
      console.log(data);

      // 处理 bigQuestions
      const processedBigQuestions = await Promise.all(
          (data.bigQuestions || []).map(async (bigQuestion) => ({
            ...bigQuestion,
            showExplanation: false, // 默认不显示解析
            body: await replaceImageSrc(bigQuestion.body),
            subQuestion: bigQuestion.subQuestion.map(sub => ({
              ...sub,
              showExplanation: false, // 默认不显示解析
              // 如果 subQuestion 中也包含 body 或其他 HTML 内容需要处理，可在此添加
            }))
          }))
      );

      // 处理 questions
      const processedQuestions = await Promise.all(
          (data.questions || []).map(async (question) => ({
            ...question,
            showExplanation: false, // 默认不显示解析
            body: question.body ? await replaceImageSrc(question.body) : '',
            question: !question.body ? await replaceImageSrc(question.question) : question.question
          }))
      );

      bigQuestions.value = processedBigQuestions;
      questions.value = processedQuestions;

      console.log('questions:', questions.value);
      console.log('big:', bigQuestions.value);

      currentPage.value = data.currentPage || 1;
      totalPages.value = data.totalPages || 1;
      totalCount.value = data.totalCount || 0;

      console.log('totalPages', totalPages.value);
    } else {
      console.error('获取题目失败：', response.data.message);
    }
  } catch (error) {
    console.error('获取题目失败：', error.message);
  }
};



// 翻页逻辑
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchQuestions();
};

// ***************************************************************************
// 查询函数，从此开始



// 查询函数：从此结束
// ***************************************************************************
// 组件挂载时获取数据
onMounted(() => {
    isLoading.value=true;

    Promise.all([fetchKnowledgePoints(), fetchQuestions()])
            .then(() => {
                // 当两个请求都完成后，设置 isLoading 为 false
                isLoading.value = false;
            })
            .catch((error) => {
                console.error("Error during fetching:", error);
                // 发生错误时，仍然关闭 loading
                isLoading.value = false;
            });
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
    margin-bottom: 30px;

    margin-left: 300px;
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
    margin-bottom: 20px;

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

.fixed-question-basket {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background-color: #409eff;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.fixed-question-basket:hover {
    background-color: #66b1ff;
}

.drawer-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center; /* 让内容水平居中 */
}
.button-container {
    display: flex;
    flex-direction: column; /* 垂直排列按钮 */
    gap: 10px;
    width: 100%; /* 容器宽度占满父容器 */
    max-width: 200px; /* 设置最大宽度 */
    margin: 0 auto; /* 居中 */
}


.clear-button {

    padding: 8px 20px;
    border: none;
    color: white;
    background-color: #409eff;
    cursor: pointer;
    border-radius: 4px;
}

.clear-button:hover {
    background-color: #66b1ff;
}

.preview-button {
    padding: 8px 20px;
    border: none;
    background-color: #67c23a;
    color: white;
    cursor: pointer;
    border-radius: 4px;
}

.preview-button:hover {
    background-color: #85d587;
}




/* 题目卡片显示区域 */
.question-cards {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
/* 大题卡片 */
.question-card {
    margin-bottom: 10px;
    border: 1px solid #ddd;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}
/* 卡片顶部（包含引用次数和难度） */
.question-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;
    color: #666;
}
/* 引用次数 */
.referenced-count {
    font-weight: bold;
}

/* 难度 */
.difficulty {
    font-weight: bold;
    color: #409EFF;
}
/* 题目正文部分 */
.question-body {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    margin-left: 20px;
    margin-right: 20px;
}

/* 子问题列表 */
.sub-questions {
    margin-top: 10px;
    margin-left: 20px;
    margin-right: 20px;
}
/* 子问题项 */
.sub-question {
    margin-bottom: 10px;
    font-size: 16px;
}

/* 单题卡片的题目部分 */
.question {
    font-size: 16px;
    margin-top: 10px;
}
/* 卡片按钮区域 */
.card-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    margin-left: 40px;
    margin-right: 40px;
}

/* 按钮样式 */
.card-buttons button {
    background-color: #4CAF50;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.card-buttons button:hover {
    background-color: #45a049;
}

.card-buttons button:focus {
    outline: none;
}


/* 分页控件容器 */
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

/* 分页控件 */
.el-pagination {
    width: 100%;
    max-width: 600px;
}

/* 分页按钮 */
.el-pagination .el-button--default,
.el-pagination .el-button--primary {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    color: #409EFF;
    font-size: 14px;
    padding: 5px 10px;
    border-radius: 4px;
}

.el-pagination .el-button--primary {
    background-color: #409EFF;
    border-color: #409EFF;
    color: #fff;
}

/* 禁用按钮 */
.el-pagination .el-button--disabled {
    background-color: #f2f6fc;
    border-color: #dcdfe6;
    color: #b0c4de;
}

/* 页码文本 */
.el-pagination .el-pagination__pager {
    display: flex;
    gap: 5px;
    align-items: center;
}
.explanation {
    font-style: italic; /* 设置斜体 */
    color: #96a8e7; /* 设置灰色 */
    margin-top: 10px;
    padding: 10px;
    background-color: #f9f9f9;
    border-left: 3px solid #babcec;

}
.explanation p {
    font-style: italic; /* 设置斜体 */
    margin: 5px 0; /* 每个段落的上下间距 */
}



.modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 300px;
    width: 100%;
}

.modal-content p {
    margin: 0 0 10px;
    font-size: 16px;
    color: #333;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* 确保模态窗在遮罩层之上 */
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
    z-index: 999; /* 确保遮罩层在最上层 */
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 1.2em;
}
</style>