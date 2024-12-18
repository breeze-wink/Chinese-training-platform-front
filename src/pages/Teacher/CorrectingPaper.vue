<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header/>
    <div class="main-container">


      <!-- 内容区 -->
      <div class="content">
        <h2>试卷预览</h2>

        <div class="question-list">
          <div
              v-for="(question, index) in processedQuestions"
              :key="question.submissionAnswerId"
              class="question-item"
          >
            <!-- 大题处理 -->
            <div v-if="question.type === null">
              <strong>题目 {{ index + 1 }} ({{question.score}}分): <span v-html="question.body"></span></strong>
              <div class="sub-questions">
                <div
                    v-for="(sub, subIndex) in question.subQuestions"
                    :key="sub.submissionAnswerId"
                    class="sub-question"
                >
                  <p>{{ subIndex + 1 }}. {{ sub.question }} ({{sub.score}}分)</p>

                  <div v-if="sub.options && sub.options.length > 0" class="options">
                    <p><strong>选项：</strong></p>
                    <ul>
                      <li v-for="(option, optionIndex) in sub.options" :key="optionIndex">
                        {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                      </li>
                    </ul>
                  </div>

                  <p><strong>学生回答：</strong>{{ sub.studentAnswer }}</p>

                  <div v-if="showExplanations" class="explanation">
                    <p><strong>答案：</strong>{{ sub.answer }}</p>
                    <p><strong>解析：</strong>{{ sub.explanation }}</p>
                  </div>

                  <div class="score-input">
                    <el-input-number
                        v-model="sub.markScore"
                        :min="0"
                        :max="sub.score"
                        label="得分"
                        @change="handleMarkScoreChange(sub)"

                        :readonly="isAutoMarked(sub)"
                    ></el-input-number>
                  </div>

                </div>
              </div>
            </div>

            <!-- 小题处理 -->
            <div v-else>
              <strong>
                题目 {{ index + 1 }} ({{question.score}}分):
                <span v-html="question.body ? question.body : question.question"></span>
              </strong>

              <p v-if="question.body" style="margin-left: 20px;">{{ question.question }}</p>


              <div style="margin-left: 20px;">
                <div v-if="question.options && question.options.length > 0" class="options">
                  <p><strong>选项：</strong></p>
                  <ul>
                    <li v-for="(option, optionIndex) in question.options" :key="optionIndex">
                      {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                    </li>
                  </ul>
                </div>
                <p v-if="!question.body" >学生回答：{{ question.studentAnswer }}</p>

                <div v-if="showExplanations" class="explanation">
                  <p><strong>答案：</strong>{{ question.answer }}</p>
                  <p><strong>解析：</strong>{{ question.explanation }}</p>
                </div>

                <div class="score-input">
                  <span class="mark-score-label">得分：</span>
                  <el-input-number
                      v-model="question.markScore"
                      :min="0"
                      :max="question.score"
                      label="得分"
                      @change="handleMarkScoreChange(question)"

                      :readonly="isAutoMarked(question)"
                  ></el-input-number>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 固定右上和右下内容部分 -->
      <div class="right-content top">
        <button @click="toggleExplanations">
          {{ showExplanations ? '隐藏解析' : '查看解析' }}
        </button>
        <button @click="returnToHomeworkList">返回作业列表</button>
      </div>
      <div class="right-content bottom">
        <p>学生姓名：{{ studentName }}</p>
        <p>当前得分：{{ currentTotalScore }}</p>

        <!-- 评语部分 -->
        <div class="comment-section">
          <label for="comment" class="comment-label">评语：</label>
          <el-input
              type="textarea"
              v-model="feedback"
              :rows="4"
          :min-rows="2"
          :max-rows="6"
          placeholder="请输入评语"
          ></el-input>
        </div>

        <div class="bottom-buttons">
          <el-button type="primary" @click="markCompleted">批阅完成</el-button>
          <el-button type="success" @click="nextSubmission">下一份</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import Sidebar from "@/components/Sidebar.vue";
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from "element-plus";
import axios from 'axios';

// 获取 Vuex Store
const store = useStore();
const router = useRouter();
const route = useRoute();

// 状态变量
const showExplanations = ref(false); // 控制是否显示解析

// 获取查询参数
const assignmentId = computed(() => route.query.assignmentId);
const studentId = computed(() => route.query.studentId);

// 当前学生信息
const studentName = ref('');
const processedQuestions = ref([]);
const currentTotalScore = computed(() => calculateTotalScore(processedQuestions.value));
const feedback = ref('');

// 获取当前 submission details
const fetchSubmissionDetails = async () => {

  const currentIndex = computed(() => store.getters.getCurrentSubmissionIndex);
  console.log('存起来的',currentIndex.value);

  const assignmentIdValue = assignmentId.value;
  const studentIdValue = studentId.value;


  if (!assignmentIdValue || !studentIdValue) {
    ElMessage.error('缺少必要的参数');
    router.push('/teacher/homework-manage');
    return;
  }

  try {
    const response = await axios.get(`/api/teacher/${store.state.user.id}/get-submission`, {
      params: {
        assignmentId: assignmentIdValue,
        studentId: studentIdValue
      }
    });

    if (response.status === 200 && response.data.message === 'success') {
      const submissionData = response.data;
      console.log('获取作答详情成功', submissionData);
      const unmarkedSubmissions = computed(() => store.getters.getUnmarkedSubmissions);
      console.log('未批阅的成员数组:', unmarkedSubmissions.value);
      const student = unmarkedSubmissions.value.find(s => s.studentId === Number(studentIdValue));
      studentName.value = student ? student.studentName : '未知学生';
      console.log('学生姓名:', studentName.value); // 调试日志

      // 替换 <img> 标签
      const processed = await replaceImageSrcInQuestions(submissionData.questions);

      processedQuestions.value = processed;

      // 初始化 markScore
      processedQuestions.value.forEach(question => {
        // 对于主题（大题）
        if (question.type === null && question.subQuestions) {
          question.subQuestions.forEach(sub => {
            if (sub.type === 'CHOICE') {
              if (sub.answer === sub.studentAnswer) {
                sub.markScore = sub.score;
              } else {
                sub.markScore = 0;
              }
            }else{
              sub.markScore = 0;
            }
          });
        }

        // 对于独立题（小题）
        if (question.type === 'CHOICE') {
          if (question.answer === question.studentAnswer) {
            question.markScore = question.score;
          } else {
            question.markScore = 0;
          }
        }else{
          question.markScore = 0;
        }
      });




    } else {
      ElMessage.error('获取作答详情失败');
      router.push('/teacher/homework-manage');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取作答详情失败，请稍后再试');
    router.push('/teacher/homework-manage');
  }
};

// 替换 <img> 标签函数
const replaceImageSrcInQuestions = async (questions) => {
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

  // 遍历所有问题，替换 <img> 标签
  const processedQuestions = await Promise.all(questions.map(async (question) => {
    if (question.body) {
      question.body = await replaceImageSrc(question.body);
    } else if (question.question) {
      question.question = await replaceImageSrc(question.question);
    }

    return question;
  }));

  return processedQuestions;
};

// 计算总分
const calculateTotalScore = (questions) => {
  let total = 0;
  questions.forEach(q => {
    if (q.type === null) {
      q.subQuestions.forEach(sub => {
        total += sub.markScore || 0;
      });
    } else {
      total += q.markScore || 0;
    }
  });
  return total;
};

// 切换显示解析
const toggleExplanations = () => {
  showExplanations.value = !showExplanations.value;
};

// 返回作业列表
const returnToHomeworkList = () => {
  router.push('/teacher/homework-manage');
};

// 判断题目是否自动标记
const isAutoMarked = (question) => {
  return question.type === 'CHOICE';

};

// 监听 markScore 的变化，自动计算得分
const handleMarkScoreChange = (question) => {
  if (question.type === 'CHOICE') {
    if (question.answer === question.studentAnswer) {
      question.markScore = question.score;
      console.log(question.score);
    }else{
      question.markScore = 0;
    }
  }
};

// 批阅完成
const markCompleted = async () => {
  const markData = [];

  processedQuestions.value.forEach(question => {
    if (question.type === null ) {
      question.subQuestions.forEach(sub => {
        markData.push({
          submissionAnswerId: sub.submissionAnswerId,
          markScore: sub.markScore || 0
        });
      });
    } else {
      markData.push({
        submissionAnswerId: question.submissionAnswerId,
        markScore: question.markScore || 0
      });
    }
  });

    const payload = {
        feedback: feedback.value,
        data: markData,
    };
    console.log('payload',payload);

  try {
    const response = await axios.post('/api/teacher/mark-submission', payload);

    if (response.status === 200 ) {
      ElMessage.success('批阅完成');

      // 更新提交状态为已批阅
      await updateSubmissionStatus();

      // 导航到下一份批阅
      await nextSubmission();
    } else {
      ElMessage.error('批阅失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('批阅失败，请稍后再试');
  }
};

// 更新提交状态为已批阅
const updateSubmissionStatus = async () => {
  try {
    await axios.post(`/api/teacher/${store.state.user.id}/update-submission-status`, {
      assignmentId: Number(assignmentId.value),
      studentId: Number(studentId.value),
      status: '已批阅'
    });
  } catch (error) {
    console.error('更新提交状态失败', error);
    //ElMessage.error('更新提交状态失败');
  }
};

// 下一份
const nextSubmission = async () => {
  // 获取所有提交列表
  try {
    const response = await axios.get(`/api/teacher/${store.state.user.id}/get-submission-list`, {
      params: { assignmentId: assignmentId.value }
    });

    if (response.status === 200) {
      const allSubmissions = response.data.data;
      // 过滤未批阅的提交
      const unmarked = allSubmissions.filter(s => s.isMarked === 0);

      if (unmarked.length > 0) {
        const nextSubmission = unmarked[0];
        // 导航到批阅下一份
        router.push({
          path: '/teacher/correcting-paper',
          query: {
            assignmentId: assignmentId.value,
            studentId: nextSubmission.studentId
          }
        });
      } else {
        ElMessage.info('所有作业已批阅完毕');
        router.push('/teacher/homework-manage');
      }
    } else {
      ElMessage.error('获取提交列表失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取提交列表失败，请稍后再试');
  }
};

// 页面加载时获取批阅的题目
onMounted(async () => {
  await fetchSubmissionDetails();
  const basket = computed(() => store.getters.getBasket);

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
  background-color: #f0f0f0; /* 背景改为浅灰色 */
  margin-right: 100px;
  margin-left: 100px;
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
  margin-top: 0px;
}

.sub-question {
  display: flex;
  flex-direction: column;
  gap: 0px;
  margin-bottom: 0px;
}

.explanation {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-left: 3px solid #409EFF;
}

.score-input {
  margin-top: 10px;
}

.bottom-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

/* 固定右上和右下内容部分样式 */
.right-content.top {
  position: fixed;
  top: 100px;
  right: 100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #ffffff;
  padding: 10px;
  width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.right-content.bottom {
  position: fixed;
  bottom: 100px;
  right: 100px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background-color: #ffffff;
  padding: 10px;
  width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.right-content.top button,
.right-content.bottom button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.right-content.top button:first-child {
  background-color: #409EFF;
  color: white;
}

.right-content.top button:last-child {
  background-color: #67c23a;
  color: white;
}

.right-content.top button:first-child:hover {
  background-color: #66b1ff;
}

.right-content.top button:last-child:hover {
  background-color: #85d587;
}

.right-content.bottom p {
  font-size: 16px;
  margin: 5px 0;
}

.comment-section {
  margin-top: 10px;
}

.comment-label {
  display: inline-block;
  margin-bottom: 8px;
  font-weight: bold;
}

.el-input__inner {
  resize: none; /* 禁止用户手动调整文本框大小 */
}

</style>
