<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <div class="title-and-button-container">
                    <h2>班级管理</h2>
                    <!-- 生成班级按钮 -->
                    <el-button
                            type="primary"
                            @click="createDialogVisible = true"
                            class="custom-button create-class-button">
                        <el-icon><CirclePlusFilled /></el-icon>
                        <span class="button-text">创建班级</span>
                    </el-button>
                </div>

                <el-table :data="classList" border style="width: 100%">
                    <el-table-column prop="classCode" label="班级码" width="80"></el-table-column>
                    <el-table-column prop="className" label="班级名称" width="200"></el-table-column>
                    <el-table-column prop="classDescription" label="班级描述"></el-table-column>
                    <el-table-column label="操作" width="420">
                        <template #default="scope">
                            <el-button type="primary" class="custom-button view-members-button" @click="viewMembers(scope.row)">查看成员</el-button>
                            <el-button type="warning" class="custom-button edit-button" @click="openEditDialog(scope.row)">修改信息</el-button>
                            <el-button type="success" class="custom-button view-stats-button" @click="viewStats(scope.row)">统计概况</el-button>
                            <el-button type="danger"  class="custom-button disband-button" @click="disbandClass(scope.row)">解散班级</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 创建班级的对话框 -->
                <el-dialog title="创建班级" v-model="createDialogVisible" width="500px" align-center>
                    <el-form :model="newClassForm" label-width="100px" class="form-container">
                        <el-form-item label="班级名称" class="form-item-spacing">
                            <el-input v-model="newClassForm.className" placeholder="请输入班级名称"></el-input>
                        </el-form-item>
                        <el-form-item label="班级描述" class="form-item-spacing">
                            <!-- 使用文本域 -->
                            <el-input
                                type="textarea"
                                v-model="newClassForm.classDescription"
                                placeholder="请输入班级描述"
                                :rows="4"
                            ></el-input>
                        </el-form-item>
                    </el-form>

                    <div slot="footer" class="dialog-footer">
                        <el-button @click="createDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="createClass">创建</el-button>
                    </div>
                </el-dialog>

                <!-- 查看成员的弹窗 -->
                <el-dialog
                        title="班级成员"
                        v-model="membersDialogVisible"
                        width="500px"
                        align-center
                >
                    <el-table
                            :data="classMembers"
                            border
                            style="width: 100%; max-height: 400px; overflow: auto"
                    >
                        <el-table-column prop="studentName" label="学生姓名" width="100"></el-table-column>
                        <el-table-column prop="studentId" label="学生ID" width="100"></el-table-column>
                        <el-table-column label="操作" width="300">
                            <template #default="scope">
                                <el-button
                                        type="danger"
                                        size="small"
                                        @click="removeMember(scope.row)"
                                >
                                    移除成员
                                </el-button>
                                <el-button
                                        type="primary"
                                        size="small"
                                        @click="viewStudentDetails(scope.row)"
                                >
                                    查看详情
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 弹窗底部 -->
                    <template #footer>
                        <el-button @click="membersDialogVisible = false">关闭</el-button>
                    </template>
                </el-dialog>
                <!-- 修改班级信息的弹窗 -->
                <el-dialog title="修改班级信息" v-model="editDialogVisible" width="500px" align-center>
                    <el-form :model="editClassForm" label-width="100px" class="form-container">
                        <el-form-item label="班级名称" class="form-item-spacing">
                            <el-input v-model="editClassForm.className" placeholder="请输入班级名称"></el-input>
                        </el-form-item>
                        <el-form-item label="班级描述" class="form-item-spacing">
                            <el-input
                                    type="textarea"
                                    v-model="editClassForm.classDescription"
                                    placeholder="请输入班级描述"
                                    :rows="4"
                            ></el-input>
                        </el-form-item>
                    </el-form>

                    <div slot="footer" class="dialog-footer">
                        <el-button @click="editDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="updateClass">确认修改</el-button>
                    </div>
                </el-dialog>


                <!-- 查看小组成员的弹窗 -->
                <el-dialog
                        title="小组成员"
                        v-model="groupMembersDialogVisible"
                        width="500px"
                        align-center
                >
                    <el-table
                            :data="groupMembers"
                            border
                            style="width: 100%; max-height: 400px; overflow: auto"
                    >
                        <!-- 仅显示学生姓名和操作 -->
                        <el-table-column prop="studentName" label="学生姓名" width="150"></el-table-column>
                        <el-table-column label="操作" width="200">
                            <template #default="scope">
                                <el-button
                                        type="danger"
                                        size="small"
                                        @click="removeGroupMember(scope.row)"
                                >
                                    移除成员
                                </el-button>
                                <el-button
                                        type="primary"
                                        size="small"
                                        @click="viewGroupMemberDetails(scope.row)"
                                >
                                    查看详情
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 弹窗底部 -->
                    <template #footer>
                        <el-button @click="groupMembersDialogVisible = false">关闭</el-button>
                    </template>
                </el-dialog>



                <!-- 小组管理部分 -->
                <div class="title-and-button-container">
                    <h2>小组管理</h2>
                    <!-- 生成小组按钮 -->
                    <el-button
                            type="primary"
                            @click="createGroupDialogVisible = true"
                            class="custom-button create-group-button">
                        <el-icon><CirclePlusFilled /></el-icon>
                        <span class="button-text">创建小组</span>
                    </el-button>
                </div>

                <el-table :data="groupList" border style="width: 100%">
                    <el-table-column prop="groupName" label="小组名称" width="200"></el-table-column>
                    <el-table-column prop="className" label="所属班级" width="200"></el-table-column>
                    <el-table-column prop="groupDescription" label="小组描述"></el-table-column>
                    <el-table-column label="操作" width="320">
                        <template #default="scope">
                            <el-button type="primary" class="custom-button view-members-button" @click="viewGroupMembers(scope.row)">查看成员</el-button>
                            <el-button type="success" class="custom-button view-stats-button" @click="viewGroupStats(scope.row)">统计概况</el-button>
                            <el-button type="danger" class="custom-button disband-button" @click="disbandGroup(scope.row)">解散小组</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 创建小组的对话框 -->
                <el-dialog title="创建小组" v-model="createGroupDialogVisible" width="500px" align-center>
                    <el-form :model="newGroupForm" label-width="100px" class="form-container">
                        <el-form-item label="小组名称" class="form-item-spacing">
                            <el-input v-model="newGroupForm.groupName" placeholder="请输入小组名称"></el-input>
                        </el-form-item>
                        <el-form-item label="所属班级" class="form-item-spacing">
                            <el-select v-model="newGroupForm.classId" placeholder="请选择所属班级">
                                <el-option v-for="classItem in classList" :key="classItem.classId" :label="classItem.className" :value="classItem.classId"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="小组描述" class="form-item-spacing">
                            <!-- 使用文本域 -->
                            <el-input
                                    type="textarea"
                                    v-model="newGroupForm.groupDescription"
                                    placeholder="请输入小组描述"
                                    :rows="4"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="选择成员" class="form-item-spacing">
                            <template v-if="classMembers.length > 0">
                                <el-checkbox-group v-model="newGroupForm.selectedStudents">
                                    <el-row>
                                        <el-col :span="12" v-for="member in classMembers" :key="member.studentId">
                                            <el-checkbox :label="member.studentId" class="blue-checkbox">
                                                {{ member.studentName }}
                                            </el-checkbox>
                                        </el-col>
                                    </el-row>
                                </el-checkbox-group>
                            </template>
                            <template v-else>
                                <p style="color: rgb(128,128,128);">该班级暂无成员</p>
                            </template>
                        </el-form-item>
                    </el-form>

                    <div slot="footer" class="dialog-footer">
                        <el-button @click="createGroupDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="createGroup">创建</el-button>
                    </div>
                </el-dialog>

                <!-- 统计概况的弹窗 -->
                <el-dialog
                        title="统计概况"
                        v-model="statsDialogVisible"
                        width="800px"
                        :before-close="handleStatsDialogClose"
                >
                    <div v-if="knowledgePoints.length > 0">
                        <h3>知识点掌握情况</h3>
                        <el-table :data="knowledgePoints" border style="width: 100%">
                            <el-table-column prop="name" label="知识点名称" width="200"></el-table-column>
                            <el-table-column prop="score" label="掌握分数"></el-table-column>
                        </el-table>
                    </div>
                    <div v-else>
                        <p>暂无知识点掌握情况数据。</p>
                    </div>

                    <div v-if="historicalScores.length > 0" style="margin-top: 30px;">
                        <h3>历史成绩</h3>
                        <div style="overflow-x: auto;">
                            <div id="historicalScoresChart" style="width: 100%; max-width: 700px; height: 300px;"></div>
                        </div>
                    </div>
                    <div v-else>
                        <p>暂无历史成绩数据。</p>
                    </div>

                    <template #footer>
                        <el-button @click="statsDialogVisible = false">关闭</el-button>
                    </template>
                </el-dialog>

                <!-- 小组统计概况的弹窗 -->
                <el-dialog
                        title="小组统计概况"
                        v-model="groupStatsDialogVisible"
                        width="800px"
                        :before-close="handleGroupStatsDialogClose"
                >
                    <div v-if="groupHistoricalScores.length > 0">
                        <h3>历史得分率</h3>
                        <div style="overflow-x: auto;">
                            <div id="groupHistoricalScoresChart" style="width: 100%; max-width: 700px; height: 300px;"></div>
                        </div>
                    </div>
                    <div v-else>
                        <p>暂无历史得分率数据。</p>
                    </div>

                    <template #footer>
                        <el-button @click="groupStatsDialogVisible = false">关闭</el-button>
                    </template>
                </el-dialog>


                <!-- 学生详情的弹窗 -->
                <el-dialog
                        title="学生详情"
                        v-model="studentDetailsDialogVisible"
                        width="800px"
                        :before-close="handleStudentDetailsDialogClose"
                >
                    <!-- 学生基本信息 -->
                    <div v-if="studentAverageScore !== null && studentClassRank !== null">
                        <h3>基本信息</h3>
                        <el-descriptions border>
                            <el-descriptions-item label="作业平均分">{{ studentAverageScore }}</el-descriptions-item>
                            <el-descriptions-item label="班级排名">{{ studentClassRank }}</el-descriptions-item>
                        </el-descriptions>
                    </div>
                    <div v-else>
                        <p>暂无基本信息数据。</p>
                    </div>

                    <!-- 多维度得分情况 -->
                    <div v-if="studentMultidimensionalScores.length > 0" style="margin-top: 30px;">
                        <h3>多维度得分情况</h3>
                        <el-table :data="studentMultidimensionalScores" border style="width: 100%">
                            <el-table-column prop="name" label="类别名称" width="200"></el-table-column>
                            <el-table-column prop="score" label="得分率"></el-table-column>
                        </el-table>
                    </div>
                    <div v-else>
                        <p>暂无多维度得分数据。</p>
                    </div>

                    <!-- 短板得分率 -->
                    <div v-if="studentWeaknessScores.length > 0" style="margin-top: 30px;">
                        <h3>短板得分率</h3>
                        <el-table :data="studentWeaknessScores" border style="width: 100%">
                            <el-table-column prop="type" label="题型" width="150"></el-table-column>
                            <el-table-column prop="weaknessName" label="短板名称" width="200"></el-table-column>
                            <el-table-column prop="weaknessScore" label="得分率"></el-table-column>
                        </el-table>
                    </div>
                    <div v-else>
                        <p>暂无短板得分率数据。</p>
                    </div>

                    <!-- 历史作业得分率 -->
                    <div v-if="studentHistoricalHomeworkScores.length > 0" style="margin-top: 30px;">
                        <h3>历史作业得分率</h3>
                        <div style="overflow-x: auto;">
                            <div id="studentHistoricalHomeworkScoresChart" style="width: 100%; max-width: 700px; height: 300px;"></div>
                        </div>
                    </div>
                    <div v-else>
                        <p>暂无历史作业得分率数据。</p>
                    </div>

                    <template #footer>
                        <el-button @click="studentDetailsDialogVisible = false">关闭</el-button>
                    </template>
                </el-dialog>




            </div>
        </div>
    </div>
</template>

<script setup>
// 公共组件引入
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {ref, onMounted, watch, nextTick} from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import { computed } from 'vue';
import {CirclePlus, CirclePlusFilled, Plus} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import * as echarts from 'echarts';
import {onBeforeUnmount} from "vue-demi";



// classList 是一个班级信息的数组，每个对象包含classId, classCode, className, classDescription 等字段
const classList = ref([]);
const groupList = ref([]);
const store = useStore();
const teacherId = computed(() => store.state.user.id);

// 控制生成班级对话框的显示状态
const createDialogVisible = ref(false);
// 控制生成小组对话框的显示状态
const createGroupDialogVisible = ref(false);
// 控制成员对话框的显示状态
const membersDialogVisible = ref(false);
const groupMembersDialogVisible = ref(false);
const editDialogVisible = ref(false); // 控制修改班级信息弹窗显示

//修改信息按钮响应
const openEditDialog = (classItem) => {
    editClassForm.value = {
        classId: classItem.classId,
        className: classItem.className,
        classDescription: classItem.classDescription,
    };
    editDialogVisible.value = true;
};

// 新建班级表单的数据
const newClassForm = ref({
    className: '',
    classDescription: ''
});
//修改班级表单
const editClassForm = ref({
    classId: null,
    className: '',
    classDescription: '',
});

const newGroupForm = ref({
    groupName: '',
    classId: '',
    groupDescription: '',
    selectedStudents: [] // 选中的学生ID
});

// 班级成员列表
const classMembers = ref([]);
const groupMembers = ref([]);
const removeClassId =ref();
// 获取班级信息列表的函数
const fetchClassList = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-classes`);

        if (response.status === 200 && response.data.message === '班级信息获取成功') {
            classList.value = response.data.data;
            console.log('获取班级列表成功:', response.data);
        } else {
            console.error('获取班级列表失败:', response.data.message);
        }
    } catch (error) {
        console.error('获取班级列表失败:', error.message);
    }
};

// 监听班级选择的变化
watch(
        () => newGroupForm.value.classId,
        async (newClassId) => {
            if (newClassId) {
                try {
                    // 调用 API 获取班级成员
                    const response = await axios.get(`/api/teacher/${teacherId.value}/get-class-members`, {
                        params: { classId: newClassId },
                    });

                    if (response.status === 200 && response.data.message === "班级成员信息获取成功") {
                        classMembers.value = response.data.data;
                    } else {
                        classMembers.value = [];
                        ElMessage.warning("该班级暂无成员");
                    }
                } catch (error) {
                    console.error("获取班级成员失败:", error.message);
                    classMembers.value = [];
                    ElMessage.error("获取班级成员信息时发生错误");
                }
            } else {
                classMembers.value = []; // 清空成员列表
            }
        }
);

// 获取小组信息列表的函数
const fetchGroupList = async () => {
    try {
        console.log(teacherId);
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-groups`);

        if (response.status === 200 && response.data.message === '小组信息获取成功') {
            groupList.value = response.data.data;
            console.log('获取小组列表成功:', response.data);
        } else {
            console.error('获取小组列表失败:', response.data.message);
        }
    } catch (error) {
        console.error('获取小组列表失败:', error.message);
    }
};


// 创建新班级的函数
const createClass = async () => {
    try {
        const response = await axios.post(`/api/teacher/${teacherId.value}/create-class`, {
            className: newClassForm.value.className,
            classDescription: newClassForm.value.classDescription
        });

        if (response.status === 200 && response.data.message === '班级创建成功') {
            console.log(response.data);
            // 创建成功后，获取新的班级码并添加到班级列表中
            const newClassId = response.data.classId; // 假设返回数据中包含新创建的班级详细信息
            const newClassCode = response.data.classCode; // 假设返回数据中包含新创建的班级详细信息

            const newClass = {
                classId: newClassId,
                classCode: newClassCode,
                className: newClassForm.value.className,
                classDescription: newClassForm.value.classDescription
            };

            classList.value.push(newClass);

            console.log('班级创建成功:', newClass);

            createDialogVisible.value = false; // 关闭对话框
        } else {
            console.error('创建班级失败:', response.data.message);
        }
    } catch (error) {
        console.error('创建班级失败:', error.message);
    }
};

// 创建新小组的函数
const createGroup = async () => {
    try {
        const response = await axios.post(`/api/teacher/${teacherId.value}/create-group`, {
            groupName: newGroupForm.value.groupName,
            classId: newGroupForm.value.classId,
            groupDescription: newGroupForm.value.groupDescription,
            studentIds: newGroupForm.value.selectedStudents // 选中的学生ID
        });

        if (response.status === 200 && response.data.message === '小组创建成功') {
            const newGroup = {
                groupId: response.data.groupId,
                groupName: newGroupForm.value.groupName,
                className: classList.value.find(item => item.classId === newGroupForm.value.classId).className,
                groupDescription: newGroupForm.value.groupDescription
            };
            groupList.value.push(newGroup);
            console.log('小组创建成功:', newGroup);
            createGroupDialogVisible.value = false; // 关闭对话框
        } else {
            console.error('创建小组失败:', response.data.message);
        }
    } catch (error) {
        console.error('创建小组失败:', error.message);
    }
};

// 查看成员的函数
const viewMembers = async (classInfo) => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-class-members`, {
            params: { classId: classInfo.classId }
        });

        if (response.status === 200 && response.data.message === '班级成员信息获取成功') {
            classMembers.value = response.data.data;
            console.log(classMembers.value);

            membersDialogVisible.value = true;
        } else {
            console.error('获取班级成员信息失败:', response.data.message);
        }
    } catch (error) {
        console.error('获取班级成员信息失败:', error.message);
    }
};
const viewGroupMembers = async (groupInfo) => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/groups-members`, {
            params: { groupId: groupInfo.groupId}

        });
        console.log(groupInfo.groupId);
        if (response.status === 200 ) {
            groupMembers.value = response.data.students;
            console.log(groupMembers.value);

            groupMembersDialogVisible.value = true;
        } else {
            console.error('获取小组成员信息失败:', response.data.message);
        }
    } catch (error) {
        console.error('获取小组成员信息失败:', error.message);
    }
};
//更改班级信息
const updateClass = async () => {
    try {
        const response = await axios.put(`/api/teacher/${teacherId.value}/update-class`, {
            classId: editClassForm.value.classId,
            className: editClassForm.value.className,
            classDescription: editClassForm.value.classDescription,
        });

        if (response.status === 200 && response.data.message === "更新成功") {
            ElMessage.success(response.data.message);

            // 更新 classList
            const index = classList.value.findIndex(item => item.classId === editClassForm.value.classId);
            if (index !== -1) {
                classList.value[index].className = editClassForm.value.className;
                classList.value[index].classDescription = editClassForm.value.classDescription;
            }
            // 关闭弹窗
            editDialogVisible.value = false;
        } else {
            ElMessage.error(response.data.message || "更新失败");
        }
    } catch (error) {
        console.error("更新班级信息失败:", error.message);
        ElMessage.error("更新班级信息时发生错误");
    }
};

// 移除成员的函数
const removeMember = async (member) => {
    try {
        const response = await axios.delete(`/api/teacher/${teacherId.value}/remove-student`, {
            params: {
                studentId: member.studentId,
            },
        });

        if (response.status === 200 ) {
            // 从班级成员列表中移除
            classMembers.value = classMembers.value.filter(
                    (m) => m.studentId !== member.studentId
            );
            ElMessage.success("成员已成功移除");
        } else {
            ElMessage.error(response.data.message || "移除成员失败");
        }
    } catch (error) {
        console.error("移除成员失败:", error.message);
        ElMessage.error("移除成员时发生错误");
    }
};

// 查看成员详情的函数
const viewMemberDetails = (member) => {
    console.log("查看成员详情:", member);
    ElMessage.info(`学生姓名：${member.studentName}, 学生ID：${member.studentId}`);
};



// 解散班级的函数
const disbandClass = async (classItem) => {
    try{
        const response = await axios.delete(`/api/teacher/${teacherId.value}/classes/disband`,{
            params:{
                classId:classItem.classId
            }
        });
        if(response.status===200){
            ElMessage.success(response.data.message); // 使用 ElMessage 显示成功提示

            classList.value = classList.value.filter(clazz => clazz.classId !== classItem.classId);


        }else if(response.status===400)
        {

            ElMessage.error(response.data.message);
        }
    }catch (error){
        //解散失败
            ElMessage.error('解散班级时发生错误'); // 显示默认错误信息

    }
};
//解散小组
// 解散小组的函数
const disbandGroup = async (group) => {
    console.log(group);
    try {
        // 调用后端 API 删除小组
        const response = await axios.delete(`/api/teacher/${teacherId.value}/disband-group`, {
            params: { groupId: group.groupId }
        });

        // 检查响应状态码和返回的消息
        if (response.status === 200 ) {
            ElMessage.success(response.data.message); // 使用 ElMessage 显示成功提示

            // 从 groupList 中移除解散的小组
            groupList.value = groupList.value.filter((g) => g.groupId !== group.groupId);
        } else {
            ElMessage.error(response.data.message || "解散小组失败");
        }
    } catch (error) {
        console.error("解散小组时发生错误:", error.message);
        ElMessage.error("解散小组时发生错误，请稍后再试");
    }
};

// 在组件挂载时获取班级列表
onMounted(() => {
    fetchClassList();
    fetchGroupList();
});


//班级概况
// 新增响应式变量
const statsDialogVisible = ref(false);
const knowledgePoints = ref([]);
const historicalScores = ref([]);
const historicalAvgScore = ref(0);

// 获取知识点掌握情况
const fetchKnowledgePoints = async (classId) => {
    try {
        const response = await axios.get(`/api/teacher/class/knowledge-point-status`, {params: { classId: classId} });

        if (response.status === 200 ) {
            knowledgePoints.value = response.data.data;
            console.log('获取知识点掌握情况成功:', response.data.data);
        } else {
            ElMessage.error(response.data.message || '获取知识点掌握情况失败');
        }
    } catch (error) {
        console.error('获取知识点掌握情况失败:', error.message);
        ElMessage.error('获取知识点掌握情况时发生错误');
    }
};

// 获取历史成绩
const fetchHistoricalScores = async (classId) => {
    try {
        const response = await axios.get(`/api/teacher/class/historical-scores`, {
            params: { classId: classId },
        });
        console.log(response.data);

        if (response.status === 200 ) {
            historicalScores.value = response.data.data;
            historicalAvgScore.value = response.data.avgScore;
            console.log('获取历史成绩成功:', response.data.data);
        } else {
            ElMessage.error(response.data.message || '获取历史成绩失败');
        }
    } catch (error) {
        console.error('获取历史成绩失败:', error.message);
        ElMessage.error('获取历史成绩时发生错误');
    }
};

// 绘制历史成绩折线图
// 绘制历史成绩折线图
// 新增响应式变量

let myChart = null;
const drawHistoricalScoresChart = () => {
    const chartDom = document.getElementById('historicalScoresChart');
    myChart = echarts.init(chartDom);
    const option = {
        title: {
            text: '历史平均成绩',
            left: 'center',
            textStyle: {
                fontSize: 16
            }
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
            data: historicalScores.value.map(item => item.endTime.split('T')[0]),
            axisLabel: {
                rotate: 45,
                interval: 0,
                fontSize: 12
            },
        },
        yAxis: {
            type: 'value',
            name: '平均分',
            nameTextStyle: {
                fontSize: 12
            },
            axisLabel: {
                fontSize: 12
            }
        },
        series: [
            {
                name: '平均分',
                type: 'line',
                data: historicalScores.value.map(item => item.score),
                smooth: true,
                lineStyle: {
                    width: 2
                },
                itemStyle: {
                    borderWidth: 2
                }
            },
        ],
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            containLabel: true
        }
    };
    option && myChart.setOption(option);

    // 确保图表在窗口大小变化时自适应
    window.addEventListener('resize', resizeChart);
}
// 自适应图表大小
const resizeChart = () => {
    if (myChart) {
        myChart.resize();
    }
};

// 可选：在关闭对话框时销毁图表实例
const handleStatsDialogClose = () => {
    if (myChart) {
        myChart.dispose();
        myChart = null;
    }
    statsDialogVisible.value = false;
};

// 移除 resize 监听器和销毁图表
onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    if (myChart) {
        myChart.dispose();
    }
});

// 查看统计概况的函数
const viewStats = async (classInfo) => {
    try {
        await fetchKnowledgePoints(classInfo.classId);
        await fetchHistoricalScores(classInfo.classId);
        statsDialogVisible.value = true;

        // 等待 DOM 更新后绘制图表
        await nextTick(() => {
            if (historicalScores.value.length > 0) {
                drawHistoricalScoresChart();
            }
        });
    } catch (error) {
        console.error('查看统计概况失败:', error.message);
    }
};

// 小组概况

// 新增响应式变量
const groupStatsDialogVisible = ref(false);
const groupHistoricalScores = ref([]);
const groupAvgScore = ref(0);
let groupChart = null;
// 获取小组历史得分率
const fetchGroupHistoricalScores = async (groupId) => {
    try {
        const response = await axios.get(`/api/teacher/group/historical-scores`, {
            params: { groupId: groupId },
        });

        if (response.status === 200 ) {
            groupHistoricalScores.value = response.data.data;
            groupAvgScore.value = response.data.avgScore;
            console.log('获取小组历史得分率成功:', response.data.data);
        } else {
            ElMessage.error(response.data.message || '获取小组历史得分率失败');
        }
    } catch (error) {
        console.error('获取小组历史得分率失败:', error.message);
        ElMessage.error('获取小组历史得分率时发生错误');
    }
};
// 绘制小组历史得分率折线图
const drawGroupHistoricalScoresChart = () => {
    const chartDom = document.getElementById('groupHistoricalScoresChart');
    groupChart = echarts.init(chartDom);
    const option = {
        title: {
            text: '小组历史得分率',
            left: 'center',
            textStyle: {
                fontSize: 16
            }
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
            data: groupHistoricalScores.value.map(item => item.endTime.split('T')[0]),
            axisLabel: {
                rotate: 45,
                interval: 0,
                fontSize: 12
            },
        },
        yAxis: {
            type: 'value',
            name: '得分率',
            nameTextStyle: {
                fontSize: 12
            },
            axisLabel: {
                fontSize: 12
            }
        },
        series: [
            {
                name: '得分率',
                type: 'line',
                data: groupHistoricalScores.value.map(item => item.score),
                smooth: true,
                lineStyle: {
                    width: 2
                },
                itemStyle: {
                    borderWidth: 2
                }
            },
        ],
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            containLabel: true
        }
    };
    option && groupChart.setOption(option);

    // 确保图表在窗口大小变化时自适应
    window.addEventListener('resize', resizeGroupChart);
};

// 自适应图表大小
const resizeGroupChart = () => {
    if (groupChart) {
        groupChart.resize();
    }
};

// 查看小组统计概况的函数
const viewGroupStats = async (groupInfo) => {
    try {
        await fetchGroupHistoricalScores(groupInfo.groupId);
        groupStatsDialogVisible.value = true;

        // 等待 DOM 更新后绘制图表
        await nextTick();
        if (groupHistoricalScores.value.length > 0) {
            drawGroupHistoricalScoresChart();
        }
    } catch (error) {
        console.error('查看小组统计概况失败:', error.message);
    }
};

// 在关闭对话框时销毁图表实例
const handleGroupStatsDialogClose = () => {
    if (groupChart) {
        groupChart.dispose();
        groupChart = null;
    }
    groupStatsDialogVisible.value = false;
};

// 移除 resize 监听器和销毁图表
onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    window.removeEventListener('resize', resizeGroupChart);
    if (myChart) {
        myChart.dispose();
    }
    if (groupChart) {
        groupChart.dispose();
    }
});

// 控制学生详情弹窗的显示状态
const studentDetailsDialogVisible = ref(false);
const studentAverageScore = ref(null);
const studentClassRank = ref(null);
const studentMultidimensionalScores = ref([]);
const studentWeaknessScores = ref([]);
const studentHistoricalHomeworkScores = ref([]);
let studentChart = null;

// 查看学生详情的函数
const viewStudentDetails = async (student) => {
    try {
        // 获取学生的作业平均分和班级排名
        await fetchStudentAverageAndRank(student.studentId);
        // 获取学生的多维度得分
        await fetchStudentMultidimensionalScores(student.studentId);
        // 获取学生的短板得分率
        await fetchStudentWeaknessScores(student.studentId);
        // 获取学生的历史作业得分率
        await fetchStudentHistoricalHomeworkScores(student.studentId);

        // 显示弹窗
        studentDetailsDialogVisible.value = true;

        // 等待 DOM 更新后绘制图表
        await nextTick();
        if (studentHistoricalHomeworkScores.value.length > 0) {
            drawStudentHistoricalHomeworkScoresChart();
        }
    } catch (error) {
        console.error('查看学生详情失败:', error.message);
    }
};

// 获取学生的作业平均分和班级排名
const fetchStudentAverageAndRank = async (studentId) => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-student-situation`, {
            params: { studentId: studentId },
        });

        if (response.status === 200 ) {

            studentAverageScore.value = response.data.data.averageHomeworkScore;
            studentClassRank.value = response.data.data.classRank;
            console.log('获取学生作业平均分和班级排名成功:', response.data.data);
        } else {
            ElMessage.error(response.data.message || '获取学生作业平均分和班级排名失败');
        }
    } catch (error) {
        console.error('获取学生作业平均分和班级排名失败:', error.message);
        ElMessage.error('获取学生作业平均分和班级排名时发生错误');
    }
};


// 获取学生的多维度得分
const fetchStudentMultidimensionalScores = async (studentId) => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-student-multidimensional-scores`, {
            params: { studentId: studentId },
        });

        if (response.status === 200) {
            studentMultidimensionalScores.value = response.data.data;
            console.log('获取学生多维度得分成功:', response.data.data);
        } else {
            ElMessage.error(response.data.message || '获取学生多维度得分失败');
        }
    } catch (error) {
        console.error('获取学生多维度得分失败:', error.message);
        ElMessage.error('获取学生多维度得分时发生错误');
    }
};
// 获取学生的短板得分率
const fetchStudentWeaknessScores = async (studentId) => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-student-weakness-scores`, {
            params: { studentId:studentId },
        });

        if (response.status === 200 ) {
            studentWeaknessScores.value = response.data.data;
            console.log('获取学生短板得分率成功:', response.data.data);
        } else {
            ElMessage.error(response.data.message || '获取学生短板得分率失败');
        }
    } catch (error) {
        console.error('获取学生短板得分率失败:', error.message);
        ElMessage.error('获取学生短板得分率时发生错误');
    }
};

// 获取学生的历史作业得分率
const fetchStudentHistoricalHomeworkScores = async (studentId) => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-student-historical-homework-scores`, {
            params: { studentId },
        });

        if (response.status === 200 ) {
            studentHistoricalHomeworkScores.value = response.data.data;
            console.log('获取学生历史作业得分率成功:', response.data.data);
        } else {
            ElMessage.error(response.data.message || '获取学生历史作业得分率失败');
        }
    } catch (error) {
        console.error('获取学生历史作业得分率失败:', error.message);
        ElMessage.error('获取学生历史作业得分率时发生错误');
    }
};


// 绘制学生历史作业得分率折线图
const drawStudentHistoricalHomeworkScoresChart = () => {
    const chartDom = document.getElementById('studentHistoricalHomeworkScoresChart');
    studentChart = echarts.init(chartDom);
    const option = {
        title: {
            text: '历史作业得分率',
            left: 'center',
            textStyle: {
                fontSize: 16
            }
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
            data: studentHistoricalHomeworkScores.value.map(item => item.date),
            axisLabel: {
                rotate: 45,
                interval: 0,
                fontSize: 12
            },
        },
        yAxis: {
            type: 'value',
            name: '得分率',
            nameTextStyle: {
                fontSize: 12
            },
            axisLabel: {
                fontSize: 12
            }
        },
        series: [
            {
                name: '得分率',
                type: 'line',
                data: studentHistoricalHomeworkScores.value.map(item => item.score),
                smooth: true,
                lineStyle: {
                    width: 2
                },
                itemStyle: {
                    borderWidth: 2
                }
            },
        ],
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            containLabel: true
        }
    };
    option && studentChart.setOption(option);

    // 确保图表在窗口大小变化时自适应
    window.addEventListener('resize', resizeStudentChart);
};


// 自适应图表大小
const resizeStudentChart = () => {
    if (studentChart) {
        studentChart.resize();
    }
};

// 在关闭对话框时销毁图表实例
const handleStudentDetailsDialogClose = () => {
    if (studentChart) {
        studentChart.dispose();
        studentChart = null;
    }
    studentDetailsDialogVisible.value = false;
};


// 移除 resize 监听器和销毁图表
onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    window.removeEventListener('resize', resizeGroupChart);
    window.removeEventListener('resize', resizeStudentChart);
    if (myChart) {
        myChart.dispose();
    }
    if (groupChart) {
        groupChart.dispose();
    }
    if (studentChart) {
        studentChart.dispose();
    }
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
    background-color: #f0f0f0; /* 背景改为浅灰色 */
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

.custom-button {
    border-radius: 12px;
    padding: 8px 16px;
    font-weight: bold;
}
.button-text {
    margin-left: 8px; /* 设置图标与文字之间的额外间距 */
}

.create-class-button {
    margin-bottom: 0px; /* 为生成班级按钮添加一些下方间距 */
}

.el-table {

    margin-bottom: 50px; /* 表格下方的间距 */
}

.form-container {
    margin-top: 20px; /* 给表单添加上方的间距，使标题与表单之间有间距 */
}

.form-item-spacing {
    margin-bottom: 30px; /* 设定表单项的底部间距 */
}

.dialog-footer {
    display: flex;
    justify-content: center;
    margin-top: 20px; /* 底部按钮与表单的间距 */
}

.title-and-button-container {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 在容器中将标题和按钮分别放在两边 */
    margin-bottom: 20px; /* 设置标题和表格之间的间距 */
}

.create-class-button {
    margin-bottom: 0; /* 移除下方间距 */
    margin-right: 40px;
}
.create-group-button {
    margin-bottom: 0; /* 移除下方间距 */
    margin-right: 40px;
}

/* 小组成员复选框样式 */
.blue-checkbox .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: blue;
    border-color: blue;
}

.blue-checkbox .el-checkbox__input.is-focus .el-checkbox__inner {
    border-color: blue;
}

.blue-checkbox .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: blue;
    border-color: blue;
}

.el-message--success {
    background-color: #f0f9eb !important; /* 恢复为绿色 */
}


/* 统计概况弹窗中的折线图容器 */
#historicalScoresChart {
    width: 100%;           /* 使用父容器的宽度 */
    max-width: 800px;      /* 设置最大宽度 */
    height: 300px;         /* 设置高度 */
    min-width: 600px;      /* 可选：设置最小宽度，确保图表不至于过小 */
}

#groupHistoricalScoresChart {
    width: 100%;           /* 使用父容器的宽度 */
    max-width: 700px;      /* 设置最大宽度 */
    height: 300px;         /* 设置高度 */
    min-width: 600px;      /* 可选：设置最小宽度，确保图表不至于过小 */
}

/* 学生历史作业得分率折线图容器 */
#studentHistoricalHomeworkScoresChart {
    width: 100%;           /* 使用父容器的宽度 */
    max-width: 700px;      /* 设置最大宽度 */
    height: 300px;         /* 设置高度 */
    min-width: 600px;      /* 可选：设置最小宽度，确保图表不至于过小 */
}

</style>
