<template>
  <div class="note-editor">
    <textarea
        ref="textareaRef"
        :value="modelValue"
        class="editor-textarea"
        :placeholder="placeholder"
        @input="handleInput"
        @blur="handleBlur"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '输入便签内容...'
  },
  autoFocus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'blur'])

const textareaRef = ref(null)

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleBlur = () => {
  emit('blur')
}

// 自动聚焦
watch(
    () => props.autoFocus,
    (val) => {
      if (val) {
        nextTick(() => {
          textareaRef.value?.focus()
        })
      }
    },
    { immediate: true }
)
</script>

<style scoped>
.note-editor {
  width: 100%;
  flex: 1;
}

.editor-textarea {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  border: none;
  background: transparent;
  font-size: 16px;
  line-height: 1.6;
  color: #2C3E2E;
  resize: vertical;
  font-family: inherit;
}

.editor-textarea:focus {
  outline: none;
}

.editor-textarea::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
</style>