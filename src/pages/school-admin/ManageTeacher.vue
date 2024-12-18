 <template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>教师管理</h2>
        <div class="input-button-group">
          <el-input v-model="search" placeholder="输入教师姓名" style="width: 300px;"></el-input>
          <el-button type="primary" @click="searchTeacher">查询</el-button>
          <el-button type="warning" @click="resetSearch">重置</el-button>
            <el-button type="success" @click="showCreateManagerDialog">创建审核老师账号</el-button>
        </div>

        <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="name" label="姓名" width="150"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="250"></el-table-column>
          <el-table-column prop="username" label="用户名" width="150"></el-table-column>
          <el-table-column prop="phoneNumber" label="联系电话"></el-table-column>
            <el-table-column prop="permission" label="是否为审核老师"></el-table-column>

          <el-table-column label="操作">
            <template #default="{ row }">
                <el-button size="small" type="danger" @click="confirmDeleteTeacher(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
            style="margin-top: 20px;"
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next"
            :total="filteredData.length"
        />

          <!-- 创建审核老师弹窗 -->
          <el-dialog v-model="createManagerDialogVisible" width="50%" title="创建审核老师账号">
              <el-form :model="managerForm" status-icon :rules="rules" ref="managerFormRef">
                  <el-form-item label="邮箱" prop="email">
                      <el-input v-model="managerForm.email" autocomplete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="密码" prop="password">
                      <el-input type="password" v-model="managerForm.password" autocomplete="off"></el-input>
                  </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
            <div class="button-container">
                <el-button @click="createManagerDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitCreateManager">确 定</el-button>
            </div>
          </span>
          </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import {
    ElButton,
    ElInput,
    ElTable,
    ElTableColumn,
    ElMessage,
    ElPagination,
    ElDialog,
    ElForm,
    ElFormItem,
    ElMessageBox
} from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex'; // 引入 Vuex

// 获取 Vuex 状态
const store = useStore();

// 计算属性获取用户 ID (动态获取)
const adminId = computed(() => store.state.user.id);

// 定义变量
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(10);  // 每页显示 7 行
const totalItems = ref(0);
const teachers = ref([]);
const filteredData = ref([]);  // 用来存储筛选后的数据

// 获取教师数据
const getTeachers = async () => {
  try {
    const response = await axios.get(`/api/school-admin/${adminId.value}/query-all-teachers`);
    if (response.status === 200) {
      teachers.value = response.data.data;
      totalItems.value = response.data.data.length;
      filteredData.value = teachers.value;  // 默认加载所有数据
        console.log(filteredData.value)
    } else {
      ElMessage({ message: '教师账号信息查询失败：' + response.data.message, type: 'error' });
    }
  } catch (error) {
    console.error(error);
    ElMessage({ message: '获取教师信息失败，请稍后再试', type: 'error' });
  }
};

// 页面加载时获取教师数据
onMounted(() => {
  getTeachers(); // 使用动态的 adminId 获取信息
});

// 计算分页数据
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredData.value.slice(start, end);
});

// 更新当前页
const handlePageChange = (page) => {
    currentPage.value = page;
};

// 查询教师
const searchTeacher = () => {
    filteredData.value = teachers.value.filter(teacher =>
        teacher.name.includes(search.value)
    );
    currentPage.value = 1; // 重置到第一页
    ElMessage({ message: '查询成功', type: 'success' });
};

// 重置搜索
const resetSearch = () => {
    search.value = '';
    filteredData.value = teachers.value;
    currentPage.value = 1; // 重置到第一页
    ElMessage({ message: '重置成功', type: 'success' });
};

// 删除教师
const confirmDeleteTeacher = (teacher) => {
    ElMessageBox.confirm(
        `确定要删除教师 "${teacher.name}" 吗？`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        deleteTeacher(teacher);
    }).catch(() => {
        ElMessage({ message: '已取消删除', type: 'info' });
    });
};
const deleteTeacher = async (teacher) => {
  try {
    const response = await axios.delete(`/api/school-admin/${adminId.value}/delete-teacher/${teacher.id}`);
    if (response.status === 200) {
      // 删除成功后，从 teachers 数组中移除该教师
      teachers.value = teachers.value.filter(t => t.id !== teacher.id);
      filteredData.value = filteredData.value.filter(t => t.id !== teacher.id); // 更新筛选后的数据
      totalItems.value -= 1;  // 更新总条目数
      ElMessage({ message: '教师删除成功', type: 'success' });
    } else {
      ElMessage({ message: '删除失败：' + response.data.message, type: 'error' });
    }
  } catch (error) {
    console.error(error);
    ElMessage({ message: '删除教师失败，请稍后再试', type: 'error' });
  }
};

// 创建审核老师相关
const createManagerDialogVisible = ref(false);
const managerForm = ref({
    email: '',
    password: ''
});
const rules = {
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
    ]
};
const managerFormRef = ref();

// 显示创建审核老师对话框
const showCreateManagerDialog = () => {
    console.log('创建审核老师对话框显示'); // 调试信息
    createManagerDialogVisible.value = true;
};
// 提交创建审核老师请求
const submitCreateManager = async () => {
    try {
        await managerFormRef.value.validate(async (valid) => {
            if (valid) {
                const response = await axios.post('/api/school-admin/create-manager', {
                    email: managerForm.value.email,
                    password: managerForm.value.password
                });

                if (response.status === 200) {
                    ElMessage({ message: '创建成功', type: 'success' });
                    createManagerDialogVisible.value = false;
                    managerForm.value.email = '';
                    managerForm.value.password = '';
                } else {
                    ElMessage({ message: '创建失败', type: 'error' });
                }
            }
        });
    } catch (error) {
        ElMessage({ message: error.response?.data.message || '创建失败', type: 'error' });
    }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
}

.main-container {
  display: flex;
  flex: 1;
}

.content {
  max-width: 1000px;
  width: 100%;
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
  margin-right: 50px;
}

.input-button-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.el-button {
  appearance: auto;
  -webkit-appearance: auto;
  -moz-appearance: auto;
}

.button-container {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center;     /* 垂直居中 */
    gap: 10px;               /* 按钮之间的间距 */
}
</style>
