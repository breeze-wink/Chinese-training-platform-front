<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />
        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />
            <!-- 主要内容区域 -->
            <div class="content">
                <div class="question-list">
                    <h2>查看题目</h2>
                    <!-- 显示加载中和错误信息 -->
                    <div v-if="loading" class="loading">加载中...</div>
                    <div v-if="error" class="error">{{ error }}</div>

                    <!-- 显示题目列表 -->
                  <el-table
                      :data="paginatedQuestions"
                      style="width: 100%"
                      @sort-change="handleSortChange"
                  >
                  <!--                        <el-table-column prop="questionId" label="ID" width="90"></el-table-column>-->
                        <el-table-column prop="type" label="类型" width="130">
                            <template #default="scope">
                                <span>{{ scope.row.type }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="uploadTime" label="上传时间" width="200" sortable="custom"></el-table-column>
                        <el-table-column prop="executeTeacher" label="审核教师"></el-table-column>
                        <el-table-column label="状态" width="180">
                            <template #default="scope">
                                <span :class="statusClass(scope.row.status)">{{ scope.row.status }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="备注" width="200">
                            <template #default="scope">
                                <span>{{ scope.row.comment || '无' }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                            <template #default="scope">
                                <el-button
                                    size="small"
                                    type="primary"
                                    @click="viewQuestionDetail(scope.row.questionId, scope.row.type)"
                                >
                                    查看
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 分页组件 -->
                  <div style="display: flex; justify-content: center; margin-top: 20px;">
                    <el-pagination
                            :current-page="currentPage"
                            :page-size="pageSize"
                            :total="totalQuestions"
                            @current-change="handlePageChange"
                            layout="prev, pager, next, jumper">
                    </el-pagination>
                  </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import axios from 'axios';

export default {
    name: "ViewQuestion",
    components: { Header, Sidebar },
    data() {
        return {
            questions: [], // 存储所有题目
            loading: true,
            error: null,
            currentPage: 1,
            pageSize: 10,
            totalQuestions: 0,
            sortProp: 'uploadTime',     // 默认排序字段
            sortOrder: 'descending',    // 默认排序顺序
        };
    },
    computed: {
        // 分页后的题目列表，先排序再分页
        paginatedQuestions() {
          // 创建 questions 的副本以避免直接修改原数组
          let sorted = this.questions.slice();

          if (this.sortProp) {
            sorted.sort((a, b) => {
              let result = 0;
              if (this.sortProp === 'uploadTime') {
                // 将上传时间转换为 Date 对象进行比较
                const dateA = new Date(a.uploadTime);
                const dateB = new Date(b.uploadTime);
                result = dateA - dateB;
              } else {
                // 通用字符串或数值排序
                if (a[this.sortProp] > b[this.sortProp]) result = 1;
                if (a[this.sortProp] < b[this.sortProp]) result = -1;
              }
              return this.sortOrder === 'ascending' ? result : -result;
            });
          }

          // 计算当前页的数据
          const start = (this.currentPage - 1) * this.pageSize;
          const end = start + this.pageSize;
          return sorted.slice(start, end);
        },
    },
    created() {
        this.fetchQuestions(); // 在组件创建时加载题目数据
    },
    methods: {
        // 获取题目数据
        async fetchQuestions() {
            try {
                const response = await axios.get('/api/teacher/uploaded-questions');
                if (response.data.message === 'success') {
                    this.questions = response.data.uploadedQuestions;
                    this.totalQuestions = this.questions.length; // 更新总题目数
                } else {
                    this.error = '获取题目失败';
                }
            } catch (err) {
                console.error(err);
                this.error = '请求失败';
            } finally {
                this.loading = false;
            }
        },

        // 处理分页变化
        handlePageChange(page) {
            this.currentPage = page;  // 分页切换时更新当前页
        },
        handleSortChange({ prop, order }) {
          if (order === 'ascending' || order === 'descending') {
            this.sortProp = prop;
            this.sortOrder = order;
          } else {
            // 如果没有排序，则恢复默认排序
            this.sortProp = 'uploadTime';
            this.sortOrder = 'descending';
          }
          this.currentPage = 1; // 重置到第一页
        },
        viewQuestionDetail(questionId, type) {
            const formattedType = type === '单题' ? 'small' : 'big';
            this.$router.push({
                name: 'ViewQuestionDetail',
                query: {
                    questionId: questionId,
                    type: formattedType
                }
            });
        },
        // 根据题目状态给不同的状态添加样式
        statusClass(status) {
            switch (status) {
                case '未审核':
                    return 'status-waiting';
                case '通过':
                    return 'status-approved';
                case '拒绝':
                    return 'status-rejected';
                default:
                    return '';
            }
        },
    }
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 浅灰色背景 */
}

.main-container {
    display: flex;
    flex: 1;
}

/* 状态样式 */
.status-waiting {
  color: orange;
}
.status-approved {
  color: green;
}
.status-rejected {
  color: red;
}

.content {
    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
    margin-left: 300px;
}

.question-list {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading {
    font-size: 16px;
    color: #aaa;
    text-align: center;
    margin-top: 50px;
}

.error {
    font-size: 16px;
    color: red;
    text-align: center;
    margin-top: 50px;
}

</style>
