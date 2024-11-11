<template>
    <div class="profile-page">
        <nav class="sidebar">
            <ul>
                <li><a href="#/">首页</a></li>
                <li><a href="#/personal">个人信息</a></li>
                <li><a href="#/practice">自主练习</a></li>
                <li><a href="#/management">试卷管理</a></li>
                <li><a href="#/analysis">个人分析</a></li>
            </ul>
        </nav>

        <main class="content">
            <section class="profile-info">
<!--                图片-->
                <img src="path-to-your-image.jpg" alt="User Profile Picture" />
                <div class="info-section">
                    <h2>个人信息管理</h2>
                    <button @click="editUserInfo">编辑</button>
                    <table>
                        <tr>
                            <td>姓名:</td>
                            <td>{{ userInfo.name }}</td>
                        </tr>
                        <tr>
                            <td>学号:</td>
                            <td>{{ userInfo.studentId }}</td>
                        </tr>
                        <tr>
                            <td>班级:</td>
                            <td>{{ userInfo.class }}</td>
                        </tr>
                        <tr>
                            <td>学校:</td>
                            <td>{{ userInfo.school }}</td>
                        </tr>
                        <tr>
                            <td>等级:</td>
                            <td>{{ userInfo.level }}</td>
                        </tr>
                    </table>
                </div>
            </section>

            <section class="account-info">
                <h2>账号信息管理</h2>
                <table>
                    <tr>
                        <td>账号ID:</td>
                        <td>{{ accountInfo.accountId }}</td>
                        <td>绑定邮箱:</td>
                        <td>{{ accountInfo.email }}</td>
                        <td><button>更换</button></td>
                    </tr>
                    <tr>
                        <td>密码:</td>
                        <td>{{ accountInfo.password }}</td>
                        <td><button>修改</button></td>
                        <td>实名认证:</td>
                        <td>{{ accountInfo.realNameStatus }}</td>
                        <td><button>去认证</button></td>
                    </tr>
                    <tr>
                        <td>绑定手机:</td>
                        <td>{{ accountInfo.phoneNumber }}</td>
                        <td><button>修改</button></td>
                        <td>账号注销:</td>
                        <td><button>申请注销</button></td>
                    </tr>
                    <tr>
                        <td>班级:</td>
                        <td>{{ accountInfo.class }}</td>
                        <td><button>加入班级</button></td>
                    </tr>
                </table>
            </section>
        </main>
    </div>
</template>

<script>
export default {
    data() {
        return {
            userInfo: {
                name: '调查',
                studentId: '调查',
                class: '调查',
                school: '调查',
                level: '调查'
            },
            accountInfo: {
                accountId: '调查',
                email: '调查',
                password: '调查',
                realNameStatus: '未认证',
                phoneNumber: '调查',
                class: '调查'
            }
        };
    },
    methods: {
        editUserInfo() {
            console.log('Edit user info');
            // Add your logic to handle the editing process here.
        }
    }
};
</script>

<style scoped>
.profile-page {
    display: flex;
}

.sidebar {
    background-color: #333;
    color: white;
    width: 200px;
    padding: 20px;
}

.content {
    flex-grow: 1;
    padding: 20px;
}

.info-section {
    margin-bottom: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

tr:hover {
    background-color: #f5f5f5;
}
</style>