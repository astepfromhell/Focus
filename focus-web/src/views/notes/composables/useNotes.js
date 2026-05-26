import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/note'

/**
 * 便签模块组合式函数
 * 封装便签列表、详情页的通用逻辑
 */
export function useNotes() {
    const router = useRouter()
    const noteStore = useNoteStore()

    // 从 store 获取状态
    const currentTab = computed(() => noteStore.currentTab)
    const displayedNotes = computed(() => noteStore.displayedNotes)
    const isLoading = computed(() =>
        currentTab.value === 'ACTIVE' ? noteStore.isLoadingActive : noteStore.isLoadingArchived
    )
    const isMultiSelectMode = computed(() => noteStore.isMultiSelectMode)
    const selectedNoteIds = computed(() => noteStore.selectedNoteIds)
    const selectionCount = computed(() => noteStore.selectionCount)

    // 切换标签页
    const switchTab = (tab) => {
        noteStore.switchTab(tab)
    }

    // 退出多选模式
    const exitMultiSelectMode = () => {
        noteStore.exitMultiSelectMode()
    }

    // 切换便签选中状态
    const toggleNoteSelection = (id) => {
        noteStore.toggleNoteSelection(id)
    }

    // 点击便签
    const handleNoteClick = (note) => {
        if (isMultiSelectMode.value) {
            toggleNoteSelection(note.id)
        } else {
            router.push(`/note/${note.id}`)
        }
    }

    // 长按便签
    const handleNoteLongPress = (note) => {
        if (!isMultiSelectMode.value) {
            noteStore.enterMultiSelectMode()
            toggleNoteSelection(note.id)
        }
    }

    // 切换置顶
    const handleTogglePin = async (note) => {
        await noteStore.togglePin(note.id, !note.isPinned)
    }

    // 切换归档
    const handleToggleArchive = async (note) => {
        await noteStore.toggleArchive(note.id, !note.isArchived)
    }

    // 删除便签（显示确认弹窗）
    const handleDeleteNote = (id, showConfirmCallback) => {
        showConfirmCallback(id)
    }

    // 批量归档
    const batchArchive = async () => {
        const ids = Array.from(selectedNoteIds.value)
        const isArchived = currentTab.value === 'ACTIVE'
        await noteStore.batchArchive(ids, isArchived)
    }

    // 批量删除
    const batchDelete = async () => {
        const ids = Array.from(selectedNoteIds.value)
        await noteStore.batchDeleteNotes(ids)
    }

    // 创建便签
    const createNote = async (isArchived = false) => {
        const result = await noteStore.createNote({
            content: '',
            color: '#fffab3',
            isArchived
        })
        if (result.success) {
            router.push(`/note/${result.note.id}`)
        }
        return result
    }

    // 加载数据
    const loadNotes = () => {
        noteStore.loadActiveNotes()
        noteStore.loadArchivedNotes()
    }

    // 清理（登出时调用）
    const clearNotes = () => {
        noteStore.clearAllNotes()
    }

    onMounted(() => {
        loadNotes()
    })

    onUnmounted(() => {
        // 组件卸载时不做清理，因为 store 是全局的
    })

    return {
        // 状态
        currentTab,
        displayedNotes,
        isLoading,
        isMultiSelectMode,
        selectedNoteIds,
        selectionCount,

        // 方法
        switchTab,
        exitMultiSelectMode,
        toggleNoteSelection,
        handleNoteClick,
        handleNoteLongPress,
        handleTogglePin,
        handleToggleArchive,
        handleDeleteNote,
        batchArchive,
        batchDelete,
        createNote,
        loadNotes,
        clearNotes
    }
}

/**
 * 便签详情页组合式函数
 */
export function useNoteDetail() {
    const router = useRouter()
    const noteStore = useNoteStore()

    const note = computed(() => noteStore.currentNote)
    const isLoading = computed(() => noteStore.isLoadingCurrent)

    // 加载便签
    const loadNote = async (id) => {
        await noteStore.loadNoteById(id)
        return note.value
    }

    // 更新便签
    const updateNote = async (id, data) => {
        return await noteStore.updateNote(id, data)
    }

    // 切换置顶
    const togglePin = async (id, currentState) => {
        return await noteStore.togglePin(id, !currentState)
    }

    // 切换归档
    const toggleArchive = async (id, currentState) => {
        return await noteStore.toggleArchive(id, !currentState)
    }

    // 删除便签
    const deleteNote = async (id) => {
        const result = await noteStore.deleteNote(id)
        if (result.success) {
            router.back()
        }
        return result
    }

    // 返回上一页
    const goBack = () => {
        router.back()
    }

    return {
        note,
        isLoading,
        loadNote,
        updateNote,
        togglePin,
        toggleArchive,
        deleteNote,
        goBack
    }
}