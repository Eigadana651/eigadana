import { useState } from 'react'
import '../App.css'

function TagManagerModal({
  tagMaster = [],
  onClose,
  onCreateTag,
  onRenameTag,
  onDeleteTag,
}) {
  const [newTagName, setNewTagName] = useState('')
  const [editingTagId, setEditingTagId] = useState(null)
  const [editingTagName, setEditingTagName] = useState('')

  async function handleCreateTag(event) {
    event.preventDefault()

    const trimmedName = newTagName.trim()

    if (!trimmedName) {
      return
    }

    await onCreateTag(trimmedName)
    setNewTagName('')
  }

  async function handleRenameTag(tagId) {
    const trimmedName = editingTagName.trim()

    if (!trimmedName) {
      return
    }

    await onRenameTag(tagId, trimmedName)

    setEditingTagId(null)
    setEditingTagName('')
  }

  async function handleDeleteTag(tag) {
    const shouldDelete = window.confirm(
      `「${tag.name}」を削除しますか？`
    )

    if (!shouldDelete) {
      return
    }

    await onDeleteTag(tag.id)
  }

  return (
    <div
      className="modalOverlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section className="modal tagManagerModal">
        <div className="modalHeader">
          <h2>タグを管理</h2>

          <button
            className="closeButton"
            type="button"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="tagManagerContent">
          <form
            className="tagManagerCreate"
            onSubmit={handleCreateTag}
          >
            <input
              type="text"
              value={newTagName}
              onChange={(event) =>
                setNewTagName(event.target.value)
              }
              placeholder="新しいタグ名"
            />

            <button
              type="submit"
              disabled={!newTagName.trim()}
            >
              追加
            </button>
          </form>

          <div className="tagManagerList">
            {tagMaster.length > 0 ? (
              tagMaster.map((tag) => (
                <div
                  className="tagManagerRow"
                  key={tag.id}
                >
                  {editingTagId === tag.id ? (
                    <>
                      <input
                        type="text"
                        value={editingTagName}
                        onChange={(event) =>
                          setEditingTagName(event.target.value)
                        }
                        autoFocus
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRenameTag(tag.id)
                        }
                      >
                        保存
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTagId(null)
                          setEditingTagName('')
                        }}
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{tag.name}</span>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTagId(tag.id)
                          setEditingTagName(tag.name)
                        }}
                      >
                        編集
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                      >
                        削除
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>タグがありません</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default TagManagerModal