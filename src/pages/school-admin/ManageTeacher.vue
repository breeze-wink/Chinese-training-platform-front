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
        </div>

        <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="name" label="姓名" width="150"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="250"></el-table-column>
          <el-table-column prop="username" label="用户名" width="150"></el-table-column>
          <el-table-column prop="phoneNumber" label="联系电话"></el-table-column>
            <el-table-column label="是否为审核老师">

                <template #default="{ row }">
                    <el-switch
                            :checked="row.permission === 1"
                            active-text="是"
                            inactive-text="否"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            @change="handleSwitchChange(row, $event)"
                    ></el-switch>
                </template>

            </el-table-column>


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
    console.log(response.data.data );
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
// 添加在 <script setup> 中
// 处理滑块变化，弹出确认框
const handleSwitchChange = (row, newVal) => {
    // 计算用户想要的新的权限状态
    const newPermission = newVal ? 1 : 0;

    const actionText = newPermission === 1 ? '升级' : '降级';

    ElMessageBox.confirm(
            `确定要${actionText} "${row.name}" 为审核老师吗？`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
    ).then(() => {
        // 用户确认，执行权限切换
        toggleManager(row, newPermission);
    }).catch(() => {
        // 用户取消，恢复滑块状态
        row.permission = newPermission === 1 ? 0 : 1;
        ElMessage({ message: '已取消操作', type: 'info' });
    });
};


// 切换审核老师权限的方法
const toggleManager = async (row, newPermission) => {
    const action = newPermission === 1 ? 'level-up' : 'level-down';
    const endpoint = `/api/school-admin/${action}?id=${row.id}`;

    try {
        const response = await axios.put(endpoint);
        if (response.status === 200) {
            // 更新本地数据
            row.permission = newPermission;
            ElMessage({
                message: `已成功 ${newPermission === 1 ? '升级' : '降级'} 为审核老师`,
                type: 'success',
            });
        } else {
            // 请求失败，恢复滑块状态
            row.permission = newPermission === 1 ? 0 : 1;
            ElMessage({
                message: `操作失败：${response.data.message}`,
                type: 'error',
            });
        }
    } catch (error) {
        // 请求异常，恢复滑块状态
        row.permission = newPermission === 1 ? 0 : 1;
        ElMessage({
            message: error.response?.data.message || '操作失败，请稍后再试',
            type: 'error',
        });
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
    background-color: #f0f0f0;
  flex: 1;
}

.content {
  max-width: 1000px;
  width: 100%;
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
  margin-right: 50px;
    margin-left: 300px;
    margin-bottom: 30px;
}

.input-button-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.el-button {
  appearance: auto;
}

.button-container {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center;     /* 垂直居中 */
    gap: 10px;               /* 按钮之间的间距 */
}
</style>
