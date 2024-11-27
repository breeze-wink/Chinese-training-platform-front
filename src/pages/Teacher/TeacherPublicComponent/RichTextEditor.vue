<template>
    <div>
        <!-- Quill 编辑器容器 -->
        <div ref="editor"></div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // 引入 Quill 样式

// 定义 props 和 emits
defineProps({
    modelValue: {
        type: String,
        default: "",
    },
});
defineEmits(["update:modelValue"]);

const editor = ref(null); // 引用编辑器 DOM 元素

onMounted(() => {
    // 初始化 Quill
    const quill = new Quill(editor.value, {
        theme: "snow",
        placeholder: "请输入内容...",
        modules: {
            toolbar: [
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
            ],
        },
    });

    // 设置初始内容
    quill.root.innerHTML = modelValue;

    // 监听内容变化并向父组件发送事件
    quill.on("text-change", () => {
        emit("update:modelValue", quill.root.innerHTML);
    });
});
</script>

<style scoped>
/* 适配工具栏和编辑器宽度 */
.ql-toolbar {
    width: 100%;
    box-sizing: border-box;
}

.ql-container {
    width: 100%;
    min-height: 150px;
    box-sizing: border-box;
}
</style>
