import { get, post, put, del } from './client'

/**
 * 便签 API
 */

/**
 * 获取便签列表
 * @param {boolean} isArchived - 是否归档
 * @returns {Promise<{success: boolean, data: {items: Array}, message: string}>}
 */
export const getNotes = (isArchived) => {
    return get('notes', { isArchived })
}

/**
 * 获取单个便签详情
 * @param {number} id - 便签ID
 * @returns {Promise<{success: boolean, data: {note: Object}, message: string}>}
 */
export const getNoteById = (id) => {
    return get(`notes/${id}`)
}

/**
 * 创建便签
 * @param {Object} data - 便签数据
 * @param {string} data.content - 内容
 * @param {string} data.color - 颜色
 * @param {boolean} data.isPinned - 是否置顶
 * @param {boolean} data.isArchived - 是否归档
 * @param {string} data.tags - 标签（逗号分隔）
 * @param {number} data.positionX - X坐标（可选）
 * @param {number} data.positionY - Y坐标（可选）
 * @param {number} data.width - 宽度（可选）
 * @param {number} data.height - 高度（可选）
 * @param {number} data.zIndex - 层级（可选）
 * @returns {Promise<{success: boolean, data: {note: Object}, message: string}>}
 */
export const createNote = (data) => {
    return post('notes', data)
}

/**
 * 更新便签
 * @param {number} id - 便签ID
 * @param {Object} data - 更新的数据
 * @param {string} [data.content] - 内容
 * @param {string} [data.color] - 颜色
 * @param {string} [data.tags] - 标签
 * @param {boolean} [data.isPinned] - 是否置顶
 * @param {boolean} [data.isArchived] - 是否归档
 * @returns {Promise<{success: boolean, data: {note: Object}, message: string}>}
 */
export const updateNote = (id, data) => {
    return put(`notes/${id}`, data)
}

/**
 * 更新便签置顶状态
 * @param {number} id - 便签ID
 * @param {boolean} isPinned - 是否置顶
 * @returns {Promise<{success: boolean, data: {note: Object}, message: string}>}
 */
export const pinNote = (id, isPinned) => {
    return put(`notes/${id}/pin`, { isPinned })
}

/**
 * 更新便签归档状态
 * @param {number} id - 便签ID
 * @param {boolean} isArchived - 是否归档
 * @returns {Promise<{success: boolean, data: {note: Object}, message: string}>}
 */
export const archiveNote = (id, isArchived) => {
    return put(`notes/${id}/archive`, { isArchived })
}

/**
 * 删除便签
 * @param {number} id - 便签ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteNote = (id) => {
    return del(`notes/${id}`)
}