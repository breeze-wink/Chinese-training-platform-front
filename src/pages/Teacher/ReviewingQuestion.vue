<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>题目管理</h2>

        <!-- 搜索框和按钮 -->
        <div class="input-button-group">
          <el-input v-model="search" placeholder="输入题目ID或内容" style="width: 300px;"></el-input>
          <el-button type="primary" @click="fetchQuestions">查询</el-button>
          <el-button type="warning" @click="resetSearch">重置</el-button>
        </div>

        <!-- 表格显示数据 -->
        <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="题目ID" width="100"></el-table-column>
          <el-table-column prop="type" label="题目类型" width="150"></el-table-column>
          <el-table-column prop="knowledgePointId" label="知识点ID" width="150"></el-table-column>

          <!-- 查看详情按钮 -->
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button @click="viewQuestion(scope.row.id)" type="text" size="small">查看详情</el-button>
              <el-button @click="deleteQuestion(scope.row.id)" type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            v-if="paginatedData.length"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalQuestions"
            layout="total, prev, pager, next"
            @current-change="handlePageChange">
        </el-pagination>
      </div>
    </div>

    <!-- 查看题目详情弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="题目详情">
      <el-form :model="currentQuestion">
        <el-form-item label="题目ID">
          <el-input v-model="currentQuestion.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="题目类型">
          <el-input v-model="currentQuestion.type" disabled></el-input>
        </el-form-item>
        <el-form-item label="题目内容">
          <el-input v-model="currentQuestion.content" disabled></el-input>
        </el-form-item>
        <el-form-item label="选项">
          <el-input v-model="currentQuestion.options" disabled></el-input>
        </el-form-item>
        <el-form-item label="答案">
          <el-input v-model="currentQuestion.answer" disabled></el-input>
        </el-form-item>
        <el-form-item label="知识点ID">
          <el-input v-model="currentQuestion.knowledgePointId" disabled></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import Sidebar from "@/components/Sidebar.vue";

export default {
    components: {Sidebar},
  data() {
    return {
      search: '',
      currentPage: 1,
      pageSize: 10,
      totalQuestions: 0,
      paginatedData: [],
      currentQuestion: {},
      dialogVisible: false
    };
  },
  methods: {
    // 获取所有题目
    fetchQuestions() {
      axios.get(`/api/teacher/${this.$route.params.id}/get-all-questions`)
          .then(response => {
            if (response.data.message === '获取题目成功') {
              this.paginatedData = response.data.data.questions;
              this.totalQuestions = this.paginatedData.length;
            } else {
              this.$message.error('题目获取失败');
            }
          })
          .catch(error => {
            this.$message.error('网络错误');
          });
    },

    // 查看题目详情
    viewQuestion(id) {
      axios.get(`/api/teacher/${this.$route.params.id}/get-questions`, { params: { problem: id } })
          .then(response => {
            if (response.data.message === '获取题目成功') {
              this.currentQuestion = response.data.data.questions[0];
              this.dialogVisible = true;
            } else {
              this.$message.error('题目获取失败');
            }
          })
          .catch(error => {
            this.$message.error('网络错误');
          });
    },

    // 删除题目
    deleteQuestion(id) {
      axios.delete(`/api/teacher/delete-question/${id}`)
          .then(response => {
            if (response.data.message === '删除成功') {
              this.$message.success('删除成功');
              this.fetchQuestions(); // 删除后重新获取题目列表
            } else {
              this.$message.error('删除失败');
            }
          })
          .catch(error => {
            this.$message.error('网络错误');
          });
    },

    // 处理分页变化
    handlePageChange(page) {
      this.currentPage = page;
      // 可以根据当前页码请求数据
      this.fetchQuestions();
    },

    // 重置搜索
    resetSearch() {
      this.search = '';
      this.fetchQuestions();
    }
  },
  mounted() {
    this.fetchQuestions();
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.input-button-group {
  display: flex;
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

.el-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
