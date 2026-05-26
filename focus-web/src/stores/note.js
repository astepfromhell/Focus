import { defineStore } from 'pinia'
import { getNotes, getNoteById, createNote, updateNote, deleteNote, pinNote, archiveNote } from '@/api/note'

export const useNoteStore = defineStore('note', {
    state: () => ({
        // 便签数据
        activeNotes: [],
        archivedNotes: [],
        currentNote: null,

        // 加载状态
        isLoadingActive: false,
        isLoadingArchived: false,
        isLoadingCurrent: false,

        // 错误信息
        error: null,

        // 多选模式
        isMultiSelectMode: false,
        selectedNoteIds: new Set(),

        // 当前标签页
        currentTab: 'ACTIVE' // ACTIVE | ARCHIVED
    }),

    getters: {
        /**
         * 当前显示的便签列表
         */
        displayedNotes: (state) => {
            return state.currentTab === 'ACTIVE' ? state.activeNotes : state.archivedNotes
        },

        /**
         * 是否有选中的便签
         */
        hasSelection: (state) => state.selectedNoteIds.size > 0,

        /**
         * 选中的便签数量
         */
        selectionCount: (state) => state.selectedNoteIds.size
    },

    actions: {
        /**
         * 加载活跃便签
         */
        async loadActiveNotes() {
            this.isLoadingActive = true
            this.error = null

            try {
                const response = await getNotes(false)
                if (response.success && response.data?.items) {
                    this.activeNotes = this.transformNotes(response.data.items)
                    return { success: true, notes: this.activeNotes }
                }
                this.error = response.message || '加载便签失败'
                return { success: false, message: this.error }
            } catch (error) {
                this.error = error.message || '加载便签失败'
                return { success: false, message: this.error }
            } finally {
                this.isLoadingActive = false
            }
        },

        /**
         * 加载归档便签
         */
        async loadArchivedNotes() {
            this.isLoadingArchived = true
            this.error = null

            try {
                const response = await getNotes(true)
                if (response.success && response.data?.items) {
                    this.archivedNotes = this.transformNotes(response.data.items)
                    return { success: true, notes: this.archivedNotes }
                }
                this.error = response.message || '加载归档便签失败'
                return { success: false, message: this.error }
            } catch (error) {
                this.error = error.message || '加载归档便签失败'
                return { success: false, message: this.error }
            } finally {
                this.isLoadingArchived = false
            }
        },

        /**
         * 加载单个便签详情
         * @param {number} id - 便签ID
         */
        async loadNoteById(id) {
            this.isLoadingCurrent = true
            this.error = null

            try {
                const response = await getNoteById(id)
                if (response.success && response.data?.note) {
                    this.currentNote = this.transformNote(response.data.note)
                    return { success: true, note: this.currentNote }
                }
                this.error = response.message || '加载便签失败'
                return { success: false, message: this.error }
            } catch (error) {
                this.error = error.message || '加载便签失败'
                return { success: false, message: this.error }
            } finally {
                this.isLoadingCurrent = false
            }
        },

        /**
         * 创建便签
         * @param {Object} noteData - 便签数据
         */
        async createNote(noteData) {
            this.error = null

            try {
                const response = await createNote({
                    content: noteData.content || '',
                    color: noteData.color || '#fffab3',
                    isPinned: noteData.isPinned || false,
                    isArchived: noteData.isArchived || false,
                    tags: noteData.tags || '',
                    positionX: noteData.positionX || 0,
                    positionY: noteData.positionY || 0,
                    width: noteData.width || 200,
                    height: noteData.height || 200,
                    zIndex: noteData.zIndex || 0
                })

                if (response.success && response.data?.note) {
                    const newNote = this.transformNote(response.data.note)
                    // 根据归档状态添加到对应列表
                    if (newNote.isArchived) {
                        this.archivedNotes.unshift(newNote)
                    } else {
                        this.activeNotes.unshift(newNote)
                    }
                    return { success: true, note: newNote }
                }
                this.error = response.message || '创建便签失败'
                return { success: false, message: this.error }
            } catch (error) {
                this.error = error.message || '创建便签失败'
                return { success: false, message: this.error }
            }
        },

        /**
         * 更新便签
         * @param {number} id - 便签ID
         * @param {Object} updateData - 更新数据
         */
        async updateNote(id, updateData) {
            this.error = null

            try {
                const response = await updateNote(id, updateData)
                if (response.success && response.data?.note) {
                    const updatedNote = this.transformNote(response.data.note)
                    this.updateNoteInLists(updatedNote)
                    if (this.currentNote?.id === id) {
                        this.currentNote = updatedNote
                    }
                    return { success: true, note: updatedNote }
                }
                this.error = response.message || '更新便签失败'
                return { success: false, message: this.error }
            } catch (error) {
                this.error = error.message || '更新便签失败'
                return { success: false, message: this.error }
            }
        },

        /**
         * 切换置顶状态
         * @param {number} id - 便签ID
         * @param {boolean} isPinned - 是否置顶
         */
        async togglePin(id, isPinned) {
            this.error = null

            try {
                const response = await pinNote(id, isPinned)
                if (response.success && response.data?.note) {
                    const updatedNote = this.transformNote(response.data.note)
                    this.updateNoteInLists(updatedNote)
                    return { success: true, note: updatedNote }
                }
                this.error = response.message || '操作失败'
                return { success: false, message: this.error }
            } catch (error) {
                this.error = error.message || '操作失败'
                return { success: false, message: this.error }
            }
        },

        /**
         * 切换归档状态
         * @param {number} id - 便签ID
         * @param {boolean} isArchived - 是否归档
         */
        async toggleArchive(id, isArchived) {
            this.error = null

            try {
                const response = await archiveNote(id, isArchived)
                if (response.success && response.data?.note) {
                    const updatedNote = this.transformNote(response.data.note)
                    // 从原列表移除
                    this.removeNoteFromLists(id)
                    // 添加到目标列表
                    if (updatedNote.isArchived) {
                        this.archivedNotes.unshift(updatedNote)
                    } else {
                        this.activeNotes.unshift(updatedNote)
                    }
                    return { success: true, note: updatedNote }
                }
                this.error = response.message || '操作失败'
                return { success: false, message: this.error }
            } catch (error) {
                this.error = error.message || '操作失败'
                return { success: false, message: this.error }
            }
        },

        /**
         * 删除便签
         * @param {number} id - 便签ID
         */
        async deleteNote(id) {
            this.error = null

            try {
                const response = await deleteNote(id)
                if (response.success) {
                    this.removeNoteFromLists(id)
                    if (this.currentNote?.id === id) {
                        this.currentNote = null
                    }
                    return { success: true }
                }
                this.error = response.message || '删除便签失败'
                return { success: false, message: this.error }
            } catch (error) {
                this.error = error.message || '删除便签失败'
                return { success: false, message: this.error }
            }
        },

        /**
         * 批量删除便签
         * @param {number[]} ids - 便签ID列表
         */
        async batchDeleteNotes(ids) {
            this.error = null
            let successCount = 0

            for (const id of ids) {
                const result = await this.deleteNote(id)
                if (result.success) successCount++
            }

            this.exitMultiSelectMode()
            return { success: successCount > 0, count: successCount }
        },

        /**
         * 批量归档/取消归档
         * @param {number[]} ids - 便签ID列表
         * @param {boolean} isArchived - 是否归档
         */
        async batchArchive(ids, isArchived) {
            this.error = null
            let successCount = 0

            for (const id of ids) {
                const result = await this.toggleArchive(id, isArchived)
                if (result.success) successCount++
            }

            this.exitMultiSelectMode()
            return { success: successCount > 0, count: successCount }
        },

        /**
         * 切换标签页
         * @param {string} tab - 标签页 (ACTIVE/ARCHIVED)
         */
        switchTab(tab) {
            this.currentTab = tab
            this.exitMultiSelectMode()
        },

        /**
         * 进入多选模式
         */
        enterMultiSelectMode() {
            this.isMultiSelectMode = true
            this.selectedNoteIds.clear()
        },

        /**
         * 退出多选模式
         */
        exitMultiSelectMode() {
            this.isMultiSelectMode = false
            this.selectedNoteIds.clear()
        },

        /**
         * 切换便签选中状态
         * @param {number} id - 便签ID
         */
        toggleNoteSelection(id) {
            if (this.selectedNoteIds.has(id)) {
                this.selectedNoteIds.delete(id)
            } else {
                this.selectedNoteIds.add(id)
            }
        },

        /**
         * 清空所有便签数据（登出时调用）
         */
        clearAllNotes() {
            this.activeNotes = []
            this.archivedNotes = []
            this.currentNote = null
            this.error = null
            this.exitMultiSelectMode()
            this.currentTab = 'ACTIVE'
        },

        /**
         * 转换便签数据（处理字段映射）
         * @param {Object} note - 原始便签数据
         */
        transformNote(note) {
            return {
                ...note,
                isPinned: note.isPinned === 1 || note.isPinned === true,
                isArchived: note.isArchived === 1 || note.isArchived === true
            }
        },

        /**
         * 批量转换便签数据
         * @param {Array} notes - 原始便签列表
         */
        transformNotes(notes) {
            return notes.map(n => this.transformNote(n))
        },

        /**
         * 更新列表中的便签
         * @param {Object} updatedNote - 更新后的便签
         */
        updateNoteInLists(updatedNote) {
            const updateList = (list) => {
                const index = list.findIndex(n => n.id === updatedNote.id)
                if (index !== -1) {
                    list[index] = updatedNote
                    // 重新排序：置顶优先，更新时间倒序
                    list.sort((a, b) => {
                        if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned
                        return new Date(b.updatedAt) - new Date(a.updatedAt)
                    })
                }
            }
            updateList(this.activeNotes)
            updateList(this.archivedNotes)
        },

        /**
         * 从列表中移除便签
         * @param {number} id - 便签ID
         */
        removeNoteFromLists(id) {
            this.activeNotes = this.activeNotes.filter(n => n.id !== id)
            this.archivedNotes = this.archivedNotes.filter(n => n.id !== id)
        }
    }
})