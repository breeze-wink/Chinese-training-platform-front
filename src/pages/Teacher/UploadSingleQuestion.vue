<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />
    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />
      <!-- 内容区 -->
      <div class="content">
        <h2>单题上传</h2>
        <el-tabs v-model="activeTab">
          <!-- 选择题标签页 -->
          <el-tab-pane label="选择题" name="CHOICE">
            <div class="tab-content">
              <el-form :model="questionForms.CHOICE" label-width="80px">

                  <el-form-item label="问题" class="form-item-margin">
                      <div style="max-width: 750px; overflow: hidden;">
                          <quill-editor
                                  ref="editor"
                                  v-model:content="currentForm.problem"
                          placeholder="请输入问题内容"
                          class="quill-editor"
                          :options="quillOptions"
                          @change="handleEditorChange"
                          ></quill-editor>
                      </div>
                  </el-form-item>

                <el-form-item>
                  <el-row>
                    <el-col
                        v-for="(option, index) in questionForms.CHOICE.options"
                        :key="index"
                        :span="24"
                        class="option-row"
                    >
                      <div class="option-container">
                        <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                        <el-input
                            v-model="questionForms.CHOICE.options[index]"
                            placeholder="请输入选项内容"
                            class="option-input"
                        ></el-input>
                      </div>
                    </el-col>
                  </el-row>
                </el-form-item>

                <el-form-item label="答案">
                  <el-select v-model="questionForms.CHOICE.answer" placeholder="请选择答案"  class="answer-select">
                    <el-option
                        v-for="(option, index) in questionForms.CHOICE.options"
                        :key="index"
                        :label="String.fromCharCode(65 + index)"
                        :value="index"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- 所属知识点下拉框 -->
                <KnowledgePointSelector @point-selected="onPointSelected" />

                <el-form-item label="解析">
                  <el-input
                      v-model="questionForms.CHOICE.explanation"
                      type="textarea"
                      placeholder="请输入解析"
                      :rows="5"
                  ></el-input>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 填空题标签页 -->
          <el-tab-pane label="填空题"  name="FILL_IN_BLANK">
            <template #default>
              <div class="tab-content">
                <el-form :model="questionForms.FILL_IN_BLANK" label-width="80px">
                  <el-form-item label="问题" class="form-item-margin">
                    <div style="max-width: 750px; overflow: hidden;">
                      <quill-editor
                          ref="editor"
                          placeholder="请输入问题内容"
                          class="quill-editor"
                          :options="quillOptions"
                      ></quill-editor>
                    </div>

                  </el-form-item>
                  <el-form-item label="填空个数" class="form-item-spacing">
                    <el-input-number
                        v-model="questionForms.FILL_IN_BLANK.fillCount"
                        @change="updateFillAnswers"
                        min="1"
                        placeholder="请输入填空个数"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item label="答案">
                    <div v-for="(answer, index) in questionForms.FILL_IN_BLANK.answers" :key="index" class="answer-row">
                      <el-input
                        v-model="questionForms.FILL_IN_BLANK.answers[index]"
                        :placeholder="'请输入第 ' + (index + 1) + ' 个填空的答案'"
                      ></el-input>
                    </div>
                  </el-form-item>

                  <!-- 所属知识点下拉框 -->
                  <KnowledgePointSelector @point-selected="onPointSelected" />

                  <el-form-item label="解析">
                    <el-input
                        v-model="questionForms.FILL_IN_BLANK.explanation"
                        type="textarea"
                        placeholder="请输入解析"
                    ></el-input>
                  </el-form-item>

                </el-form>
              </div>
            </template>
          </el-tab-pane>

          <!-- 问答题标签页 -->
          <el-tab-pane label="问答题"  name="SHORT_ANSWER">
            <template #default>
              <div class="tab-content">
                <el-form :model="questionForms.SHORT_ANSWER" label-width="80px">
                  <el-form-item label="问题" class="form-item-spacing">
                    <div style="max-width: 750px; overflow: hidden;">
                      <quill-editor
                              ref="editor"
                          placeholder="请输入问题内容"
                          class="quill-editor"
                          :options="quillOptions"
                      ></quill-editor>
                    </div>
                  </el-form-item>
                  <el-form-item label="答案" class="form-item-spacing">
                    <el-input
                        v-model="questionForms.SHORT_ANSWER.answer"
                        type="textarea"
                        placeholder="请输入答案"
                        :autosize="{ minRows: 3, maxRows: 10 }"
                    ></el-input>
                  </el-form-item>

                  <!-- 所属知识点下拉框 -->
                  <KnowledgePointSelector @point-selected="onPointSelected" />

                  <el-form-item label="解析" class="form-item-spacing">
                    <el-input
                        v-model="questionForms.SHORT_ANSWER.explanation"
                        type="textarea"
                        placeholder="请输入解析"
                        :autosize="{ minRows: 4, maxRows: 10 }"
                    ></el-input>
                  </el-form-item>
                </el-form>
              </div>
            </template>
          </el-tab-pane>

          <!-- 作文标签页 -->
          <el-tab-pane label="作文" name="ESSAY">
            <template #default>
              <div class="tab-content">
                <el-form :model="questionForms.ESSAY" label-width="80px">
                  <el-form-item label="题目">
                    <div style="max-width: 750px; overflow: hidden;">
                      <quill-editor
                              ref="editor"
                          placeholder="请输入问题内容"
                          class="quill-editor"
                          :options="quillOptions"
                      ></quill-editor>
                    </div>

                  </el-form-item>
                  <el-form-item label="解析">
                    <el-input
                        v-model="questionForms.ESSAY.explanation"
                        type="textarea"
                        placeholder="请输入解析"
                        :autosize="{ minRows: 4, maxRows: 10 }"
                    ></el-input>
                  </el-form-item>

                </el-form>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>

        <!-- 确定上传按钮 -->
        <div class="submit-section">
          <el-button type="primary" @click="submitQuestion">确定上传</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {computed, nextTick, onMounted, ref} from 'vue';
import axios from "axios";
import {useStore} from "vuex";
import KnowledgePointSelector from '@/pages/Teacher/TeacherPublicComponent/KnowledgePointSelector.vue'; // 引入知识点选择组件
import {QuillEditor} from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import {ElMessage} from "element-plus";
import Quill from "quill";
import {ImageDrop} from 'quill-image-drop-module'
import BlotFormatter from 'quill-blot-formatter/dist/BlotFormatter';

const activeTab = ref('CHOICE'); // 当前激活的标签页
const store = useStore();
const teacherId = computed(() => store.state.user.id);
const knowledgePointSelector = ref(null);
const KnowledgePointId = ref();
const onPointSelected = (pointId) => {
  console.log('父组件接收到的知识点 ID:', pointId);
  KnowledgePointId.value = pointId;
};

Quill.register('modules/imageDrop', ImageDrop)

Quill.register('modules/blotFormatter', BlotFormatter)


const questionForms = ref({
  CHOICE: {
    problem: null, // 问题描述
    options: ['', '', '', ''], // 选项
    answer: null, // 正确答案
    explanation: '', // 解析
  },
  FILL_IN_BLANK: {
    problem: null, // 问题描述
    fillCount: 1,
    answers: [''], // 填空答案
    explanation: '', // 解析
  },
  SHORT_ANSWER: {
    problem: null, // 问题描述
    answer: '', // 简答答案
    explanation: '', // 解析
  },
  ESSAY: {
    problem: null, // 问题描述
    explanation: '', // 解析
  },
});


const editor = ref(null)

const questionContent = ref();

// 更新填空答案数组
const updateFillAnswers = (count) => {
  questionForms.value.FILL_IN_BLANK.answers = Array.from({ length: count }, () => '');
};

// 作文表单
const essayForm = ref({
  title: '',
  explanation: '',
});

const currentForm = computed(() => questionForms.value[activeTab.value]);

const handleEditorChange = (html, delta, source) => {
    // 更新当前活动标签页的问题描述
    if (source === 'user') {  // 确保只在用户操作时更新
        currentForm.value.problem = html;
    }
};
// 上传成功回调
const handleUploadSuccess = (response, file) => {
  console.log('范文上传成功:', response, file);
};
// 手动更新问题描述
const updateProblem = (value) => {
  questionForms.CHOICE.problem = value;
};
// 提交函数
const submitQuestion = async () => {
    // 检查知识点是否选择
    const pointId =ref();
    if(activeTab.value==='ESSAY'){
      pointId.value=17;
    }else{
      pointId.value=KnowledgePointId.value
    }
    if (!pointId.value) {
        return ElMessage.warning('请先选择分类和知识点！');
    }

    const content = editor.value ? editor.value.getHTML() || editor.value.container.firstChild.innerHTML : '';
    let processedContent = content;

    // 处理图片上传
    const base64Images = extractBase64ImagesFromContent(content);
    for (const base64Image of base64Images) {
        const mimeType = base64Image.split(';')[0].split(':')[1];
        const blob = base64ToBlob(base64Image, mimeType);
        const file = new File([blob], 'image.png', { type: mimeType });
        const newImageUrl = await uploadImage(file);
        if (newImageUrl) {
            processedContent = replaceImagePlaceholder(processedContent, base64Image, newImageUrl);
        }
    }

    // 更新问题描述
    currentForm.value.problem = processedContent;

    // 构造请求数据
    const requestData = {
        questionType: '单题',
        body: null,
        questions: [
            {
                type: activeTab.value,
                problem: processedContent,
                choices: activeTab.value === 'CHOICE' ? currentForm.value.options : [],
                answer: activeTab.value === 'CHOICE'
                    ? [String.fromCharCode(65 + parseInt(currentForm.value.answer))]
                    : activeTab.value === 'FILL_IN_BLANK'
                        ? currentForm.value.answers
                        : Array.isArray(currentForm.value.answer)
                            ? currentForm.value.answer
                            : [currentForm.value.answer],
                analysis: currentForm.value.explanation,
                knowledgePointId: pointId.value,
            },
        ],
    };

    try {
        const response = await axios.post(
            `/api/teacher/${teacherId.value}/upload-question`,
            requestData
        );
        if (response.status === 200 && response.data.message === '上传成功') {
            ElMessage.success('题目上传成功！');
        } else {
            ElMessage.error(response.data.message || '题目上传失败');
        }
    } catch (error) {
        console.error('上传失败:', error);
        ElMessage.error('上传失败，请稍后重试');
    }
};
// 从富文本内容中提取图片
const extractBase64ImagesFromContent = (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const images = [];

  // 查找所有 img 标签
  const imgTags = doc.querySelectorAll('img');
  imgTags.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('data:image/')) {  // 判断是否为Base64图像
      images.push(src);
    }
  });

  return images;
};

// 将Base64数据转换为Blob对象
const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64.split(',')[1]); // 解码Base64数据
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset++) {
    const byte = byteCharacters.charCodeAt(offset);
    byteArrays.push(byte);
  }

  const byteArray = new Uint8Array(byteArrays);
  return new Blob([byteArray], { type: mimeType });
};
const uploadImage = async (imageSrc) => {
  try {
    const formData = new FormData();
    formData.append("image", imageSrc);  // 假设 imageSrc 是一个 File 对象
    formData.append("type", "content");  // 固定图片类型为 "content"

    const response = await axios.post('/api/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status === 200) {
      console.log(response.data.imageUrl);
      return response.data.imageUrl;


    } else {
      console.error('图片上传失败');
    }
  } catch (error) {
    console.error('上传图片失败:', error);
    return null;
  }
};

const escapeRegExp = (str) => {
  return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&'); // 转义正则表达式中的特殊字符
};

//替换富文本中
const replaceImagePlaceholder = (content, oldSrc, newSrc) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  // 查找所有 img 标签
  const imgs = doc.querySelectorAll('img');

  imgs.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src === oldSrc) {
      img.setAttribute('src', newSrc); // 替换 src
    }
  });
  // 返回修改后的 HTML 字符串
  return doc.body.innerHTML;
};

// 初始化获取知识点数据
onMounted(async () => {

  await nextTick(() => {
    // 通过 ref 获取 Quill 编辑器实例
    // 这里假设你的 quill-editor 组件的 ref 已经设置为 "editor"
    editor.value = document.querySelector('.quill-editor').getQuill();
    // 现在你可以使用 quillInstance 来做你需要的操作，例如获取内容等
  });

});

const quillOptions = {
  placeholder: '请输入问题内容',
  theme: 'snow',
  modules: {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline'],
      [{ 'align': [] }],
      ['link', 'image', 'video'], // 超链接 图片 视频
    ],
    blotFormatter: {

      toolbar: {
        mainClassName: 'blot-formatter__toolbar'
      }
    }
  }
};

</script>

<style scoped>

/* 调整工具栏宽度 */
.ql-toolbar {
  width: 100%; /* 工具栏宽度与编辑器宽度一致 */
  box-sizing: border-box;
}

/* 设置编辑器最小高度，避免空内容时塌缩 */
.ql-container {
  width: 100%;
  min-height: 400px;
  box-sizing: border-box;
}
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

.content {
  max-width: 1000px; /* 最大宽度为 1000px */
  width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
  margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
}

.tab-content {
  padding: 40px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-top: 10px;
}

.submit-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-item-margin {
  margin-bottom: 40px; /* 在问题输入框下方增加空白 */
}


.custom-form-item .el-form-item__label {
  align-self: flex-start; /* 让“选项”标题和选项内容上下排列 */
  white-space: nowrap;   /* 确保标题不换行 */
  padding-top: 5px;      /* 可选：增加标题与内容的间距 */
}

.option-row {
  display: block; /* 强制让每个选项独占一行 */
  margin-bottom: 15px; /* 每个选项之间增加垂直间距 */
  max-width: 600px;
}
.option-container {
  display: flex; /* 使用弹性布局 */
  align-items: center; /* 垂直居中 */
  gap: 10px; /* 选项之间的间距 */
}

.option-label {
  font-weight: bold; /* 加粗字母 */
  margin-right: 10px; /* 字母和输入框之间的间距 */
  white-space: nowrap; /* 防止换行 */
}

.option-input {
  flex: 1; /* 输入框占据剩余宽度 */
}

.answer-select {
  width: 120px; /* 自定义宽度 */
}
/* ================== 填空 ================== */
.answer-row {
  width: 60%; /* 确保行宽 */
  display: block; /* 强制让每个选项独占一行 */
  margin-bottom: 15px; /* 设置每个输入框之间的垂直间距 */
}
.answer-row el-input {
  width: 60%; /* 输入框宽度适应父容器 */
}

.form-item-spacing {
  margin-bottom: 20px; /* 设置下方间距，可根据需求调整 */
}


</style>
