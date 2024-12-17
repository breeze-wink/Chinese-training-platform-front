<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header/>
    <div class="main-container">
      <!-- 内容区 -->
      <div class="content">
        <h2>试卷预览</h2>

        <div class="question-list">
          <div v-for="(question, index) in basket" :key="question.id" class="question-item">
            <div v-if="question.type === 'big'">
              <strong>题目 {{ index + 1 }} ({{question.score}}分): <span v-html="question.body"></span></strong>
              <div class="sub-questions">
                <div v-for="(sub, subIndex) in question.subQuestions" :key="sub.id"
                     class="sub-question">
                  <p>{{ subIndex + 1 }}. <span v-html="sub.content"></span> ({{sub.score}}分)</p>

                  <div v-if="sub.options && sub.options.length > 0" class="options">
                    <p><strong>选项：</strong></p>
                    <ul>
                      <li v-for="(option, optionIndex) in sub.options" :key="optionIndex">
                        {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                      </li>
                    </ul>
                  </div>

                  <div v-if="showExplanations" class="explanation">
                    <p><strong>答案：</strong>{{ sub.answer }}</p>
                    <p><strong>解析：</strong>{{ sub.explanation }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <strong>
                题目 {{ index + 1 }} ({{question.score}}分):
                <!-- 如果有题干，紧跟在序号后面显示题干 -->
                <span v-if="question.content" v-html="question.content"></span>
              </strong>

              <div>
                <div v-if="question.options && question.options.length > 0" class="options">
                  <p><strong>选项：</strong></p>
                  <ul>
                    <li v-for="(option, optionIndex) in question.options" :key="optionIndex">
                      {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                    </li>
                  </ul>
                </div>

                <div v-if="showExplanations" class="explanation">
                  <p><strong>答案：</strong>{{ question.answer }}</p>
                  <p><strong>解析：</strong>{{ question.explanation }}</p>
                </div>
              </div>
              <!-- 分数选择器和删除按钮紧跟在单题下面 -->
              <div class="action-buttons">
                <input
                    type="number"
                    v-model.number="question.score"
                    min="0"
                    placeholder="设置分数"
                />
              </div>
            </div>
            <!-- 删除按钮放在卡片的右下角 -->
            <div class="card-actions">
              <button @click="removeQuestion(question.id)"  class="delete-button">删除该题</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 固定右上和右下内容部分 -->
      <div class="right-content top">
        <button @click="regeneratePaper" class="regenerate-button">重新生成</button>
        <button @click="toggleExplanations" class="toggle-explanation-button">{{ showExplanations ? '隐藏解析' : '查看解析' }}</button>
      </div>
      <div class="right-content bottom">
        <div class="paper-name">
          <label for="paperName">试卷命名：</label>
          <input type="text" id="paperName" v-model="paperName" placeholder="请输入试卷名称"
                 style="width: 280px"/>
        </div>
        <p>题目数量：{{ questionCount }}</p>
        <p>试卷总分：{{ totalScore }}</p>
        <p>难度系数：{{ difficultyCoefficient }}</p>
        <button @click="clearBasket" class="clear-button">清空题目</button>
        <button @click="generatePaper" class="generate-button">生成试卷</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { ElNotification, ElMessage } from "element-plus";
import axios from "axios";
import {onBeforeUnmount} from "vue-demi";
import imageCache from "quill";

// 获取 Vuex Store 和 Router 实例
const store = useStore();
const router = useRouter();
const route = useRoute();

// 获取认证 Token
const token = store.getters.getToken;

// 状态变量
const showExplanations = ref(false); // 控制是否显示解析
const paperName = ref(''); // 试卷名称

// 计算试卷总分
const totalScore = computed(() => {
  let total = 0;
  basket.value.forEach(question => {
    if (question.type === 'big') {
      question.subQuestions.forEach(sub => {
        total += Number(sub.score) || 0;
      });
    } else {
      total += Number(question.score) || 0;
    }
  });
  return total;
});

// 计算难度系数
const difficultyCoefficient = computed(() => {
  if (totalScore.value === 0) return 0;
  let total = 0;
  basket.value.forEach(question => {
    if (question.type === 'big') {
      question.subQuestions.forEach(sub => {
        total += (Number(sub.score) || 0) * (question.difficulty || 0);
      });
    } else {
      total += (Number(question.score) || 0) * (question.difficulty || 0);
    }
  });
  return (total / totalScore.value).toFixed(2);
});

// 获取试卷篮中的题目
const basket = computed(() => store.getters.getBasket);

// 监视试卷篮中的变化，初始化分数
const initializeScores = () => {
  basket.value.forEach(question => {
    if (question.type === 'big') {
      question.subQuestions.forEach(sub => {
        if (sub.score === undefined) sub.score = 0;
      });
    } else {
      if (question.score === undefined) question.score = 0;
    }
  });
};
initializeScores();

// 监视试卷篮变化，重新初始化分数
watch(basket, () => {
  initializeScores();
});

// 计算题目数量（大题算1题）
const questionCount = computed(() => {
  return basket.value.length;
});

// 删除单题
const removeQuestion = (id) => {
  store.dispatch('removeQuestionFromBasket', id);
};

// 清空试卷篮
const clearBasket = () => {
  store.dispatch('clearBasket');
};

// 切换显示解析
const toggleExplanations = () => {
  showExplanations.value = !showExplanations.value;
};

// 生成试卷的逻辑
const generatePaper = async () => {
  // 验证试卷名称
  if (!paperName.value.trim()) {
    ElNotification.error({
      title: '生成失败',
      message: '请为试卷命名。',
      duration: 2000,
    });
    return;
  }

  // 验证分数是否设置
  for (let question of basket.value) {
    if (question.type === 'big') {
      for (let sub of question.subQuestions) {
        if (!sub.score || sub.score <= 0) {
          ElNotification.error({
            title: '生成失败',
            message: '请为所有小题设置有效分数。',
            duration: 2000,
          });
          return;
        }
      }
    } else {
      if (!question.score || question.score <= 0) {
        ElNotification.error({
          title: '生成失败',
          message: '请为所有题目设置有效分数。',
          duration: 2000,
        });
        return;
      }
    }
  }

  // 构建请求数据
  const paperData = {
    name: paperName.value,
    creatorId: store.state.user.id,  // 假设用户ID在 Vuex 中
    totalScore: totalScore.value,
    difficulty: difficultyCoefficient.value,
    questions: basket.value.map((question, index) => ({
      id: question.id,
      type: question.type,
      sequence: index + 1,
      score: question.type === 'big'
          ? question.subQuestions.reduce((sum, sub) => sum + (sub.score || 0), 0)  // 小题的分数加起来作为大题分数
          : question.score,
      ...(question.type === 'big' && {
        subScores: question.subQuestions.map(sub => sub.score), // 直接用 sub-score 数组传回
      }),
    })),
  };

  console.log(paperData);

  try {
    // 发送 POST 请求
    const response = await axios.post('/api/teacher/generate-paper', paperData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    // 处理响应
    if (response.status === 200) {
      ElNotification.success({
        title: '生成成功',
        message: '试卷已成功生成。',
        duration: 2000,
      });
      // 跳转或清空试卷篮等操作
      await store.dispatch('clearBasket');
      await router.push('/teacher/paper-management');  // 根据实际路由调整
    } else {
      ElNotification.error({
        title: '生成失败',
        message: response.data.message || '未知错误',
        duration: 2000,
      });
    }
  } catch (error) {
    ElNotification.error({
      title: '请求失败',
      message: '无法连接服务器，请稍后再试。',
      duration: 2000,
    });
    console.error(error);
  }
};

// 重新生成试卷的逻辑
const regeneratePaper = async () => {
  try {
    const response = await axios.get('/api/teacher/paper/auto', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200 && response.data) {
      const data = response.data;

      // 处理 bigQuestions
      const processedBigQuestions = await Promise.all(
          (data.bigQuestions || []).map(async (bigQuestion) => ({
            ...bigQuestion,
            showExplanation: false, // 默认不显示解析
            body: await replaceImageSrc(bigQuestion.body),
            subQuestions: await Promise.all(
                (bigQuestion.subQuestions || []).map(async (sub) => ({
                  ...sub,
                  showExplanation: false, // 默认不显示解析
                  content: await replaceImageSrc(sub.content),
                  options: sub.options || [],
                  score: 0
                }))
            )
          }))
      );

      // 处理 questions
      const processedQuestions = await Promise.all(
          (data.questions || []).map(async (question) => ({
            ...question,
            showExplanation: false, // 默认不显示解析
            content: await replaceImageSrc(question.content),
            options: question.options || [],
            score: 0
          }))
      );

      // 清空现有试题篮
      await store.dispatch('clearBasket');

      // 构建试题篮数据
      const basketQuestions = [
        ...processedQuestions.map(q => ({
          id: `small-${q.content}`, // 确保唯一性，可以根据实际数据调整
          type: q.type || 'small',
          content: q.content,
          answer: q.answer,
          explanation: q.explanation,
          options: q.options,
          score: 0, // 初始化分数
          difficulty: q.difficulty || 0,
          knowledgePoint: q.knowledgePoint || ''
        })),
        ...processedBigQuestions.map(bq => ({
          id: `big-${bq.body}`, // 确保唯一性，可以根据实际数据调整
          type: 'big',
          body: bq.body,
          subQuestions: bq.subQuestions.map(sub => ({
            id: `sub-${sub.content}`, // 确保唯一性
            content: sub.content,
            answer: sub.answer,
            explanation: sub.explanation,
            options: sub.options,
            score: 0, // 初始化分数
            difficulty: bq.difficulty || 0,
            knowledgePoint: sub.knowledgePoint || ''
          })),
          score: 0, // 可以根据子题分数计算
          difficulty: bq.difficulty || 0,
          knowledgePoint: bq.knowledgePoint || ''
        }))
      ];

      // 将试题添加到试题篮
      basketQuestions.forEach(question => {
        store.dispatch('addQuestionToBasket', question);
      });

      ElNotification.success({
        title: '重新生成成功',
        message: '试卷已成功重新生成并添加到试题篮。',
        duration: 2000,
      });

      // 跳转到预览页面
      router.push('/teacher/preview-paper/auto');
    } else {
      ElNotification.error({
        title: '重新生成失败',
        message: response.data.message || '试卷重新生成失败。',
        duration: 2000,
      });
    }
  } catch (error) {
    ElNotification.error({
      title: '请求失败',
      message: '无法连接服务器，请稍后再试。',
      duration: 2000,
    });
    console.error(error);
  }
};

// 辅助函数：替换图片路径
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
          img.setAttribute('src', '/path/to/placeholder.png'); // 设置占位图路径
        }
      } catch (error) {
        console.error(`获取图片失败: ${imageUrl}`, error);
        // 设置占位图
        img.setAttribute('src', '/path/to/placeholder.png'); // 设置占位图路径
      }
    }
  });

  // 等待所有图片替换完成
  await Promise.all(replacePromises);

  return tempDiv.innerHTML;
};


// 在脚本部分添加
onBeforeUnmount(() => {
  imageCache.forEach((blobUrl) => {
    URL.revokeObjectURL(blobUrl);
  });
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 确保至少填充满视口 */
  background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.main-container {
  display: flex;
  flex: 1;
  margin-right: 100px;
  margin-left: 100px;
  background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.content {
  display: flex;
  flex-direction: column; /* 让内容和页脚垂直排列 */
  background-color: #ffffff;
  width: 75%;
  padding: 10px;
  margin-right: 20px;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: white;
}

.question-item {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.sub-questions {
  margin-left: 20px;
  margin-top: 10px;
}

.sub-question {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.explanation {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-left: 3px solid #409EFF;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 0;
}

.action-buttons input[type="number"] {
  width: 100px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.card-actions {
  display: flex;
  justify-content: flex-end; /* 将内容对齐到右侧 */
}

.delete-button {
  background-color: #f56c6c;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-button:hover {
  background-color: #d9363e;
}

/* 固定右上和右下内容部分样式 */
.right-content.top button,
.right-content.bottom button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.regenerate-button {
  background-color: #67c23a; /* 重新生成按钮的颜色 */
  color: white;
  margin-right: 10px;
}

.toggle-explanation-button {
  background-color: #409EFF; /* 查看解析按钮的颜色 */
  color: white;
}

.regenerate-button:hover {
  background-color: #85d587;
}

.toggle-explanation-button:hover {
  background-color: #66b1ff;
}

.paper-name {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.paper-name label {
  margin-bottom: 5px;
  font-weight: bold;
}

.paper-name input {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.clear-button {
  background-color: #f56c6c;
  color: white;
  margin-top: 10px;
}

.clear-button:hover {
  background-color: #d9363e;
}

.generate-button {
  background-color: #67c23a;
  color: white;
  margin-top: 10px;
  margin-left: 10px;
}

.generate-button:hover {
  background-color: #85d587;
}

.right-content.bottom p {
  font-size: 16px;
  margin: 5px 0;
}
</style>
